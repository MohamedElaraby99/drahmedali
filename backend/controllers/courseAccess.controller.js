import CourseAccessCode from "../models/courseAccessCode.model.js";
import CourseAccess from "../models/courseAccess.model.js";
import Course from "../models/course.model.js";
import userModel from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// Admin: generate one-time codes to unlock a course for a limited duration
export const generateCourseAccessCodes = asyncHandler(async (req, res) => {
    const { courseId, accessStartAt, accessEndAt, quantity = 1, codeExpiresAt } = req.body;
    const adminId = req.user.id;

    if (!courseId) {
        throw new ApiError(400, 'courseId is required');
    }
    // Validate required window
    if (!accessStartAt || !accessEndAt) {
        throw new ApiError(400, 'accessStartAt and accessEndAt are required');
    }
    if (new Date(accessEndAt) <= new Date(accessStartAt)) {
        throw new ApiError(400, 'accessEndAt must be after accessStartAt');
    }
    if (quantity < 1 || quantity > 200) {
        throw new ApiError(400, 'quantity must be between 1 and 200');
    }

    const course = await Course.findById(courseId);
    if (!course) {
        throw new ApiError(404, 'Course not found');
    }

    const codes = [];
    for (let i = 0; i < quantity; i++) {
        let codeValue;
        let isUnique = false;
        while (!isUnique) {
            codeValue = CourseAccessCode.generateCode();
            const exists = await CourseAccessCode.findOne({ code: codeValue });
            if (!exists) isUnique = true;
        }
        const doc = await CourseAccessCode.create({
            code: codeValue,
            courseId,
            accessStartAt: new Date(accessStartAt),
            accessEndAt: new Date(accessEndAt),
            codeExpiresAt: codeExpiresAt ? new Date(codeExpiresAt) : undefined,
            createdBy: adminId
        });
        codes.push(doc);
    }

    return res.status(201).json(new ApiResponse(201, {
        codes: codes.map(c => ({
            id: c._id,
            code: c.code,
            courseId: c.courseId,
            accessStartAt: c.accessStartAt,
            accessEndAt: c.accessEndAt,
            codeExpiresAt: c.codeExpiresAt,
            isUsed: c.isUsed
        }))
    }, 'Course access code(s) generated'));
});

// User: redeem code to unlock course
export const redeemCourseAccessCode = asyncHandler(async (req, res) => {
    const { code, courseId } = req.body;
    const userId = req.user.id;
    if (!code) throw new ApiError(400, 'code is required');
    if (!courseId) throw new ApiError(400, 'courseId is required');

    const redeemable = await CourseAccessCode.findRedeemable(code);
    if (!redeemable) throw new ApiError(400, 'Invalid or expired code');

    // Check if the code is for the correct course
    if (redeemable.courseId.toString() !== courseId) {
        throw new ApiError(400, 'This code is not valid for this course');
    }

    // Ensure course exists
    const course = await Course.findById(redeemable.courseId);
    if (!course) throw new ApiError(404, 'Course not found for this code');

    const now = new Date();
    // Compute access window based on fixed date range
    let start = new Date(redeemable.accessStartAt);
    let end = new Date(redeemable.accessEndAt);
    if (now > end) throw new ApiError(400, 'This code is expired for its access window');

    // Create access record
    const access = await CourseAccess.create({
        userId,
        courseId: redeemable.courseId,
        accessStartAt: start,
        accessEndAt: end,
        source: 'code',
        codeId: redeemable._id
    });

    // Track usage in history (allow reuse during access window)
    redeemable.usageHistory.push({
        userId,
        usedAt: now
    });
    
    // Update first usage info (for backward compatibility)
    if (!redeemable.isUsed) {
        redeemable.isUsed = true;
        redeemable.usedBy = userId;
        redeemable.usedAt = now;
    }
    
    await redeemable.save();

    // Log wallet transaction entry (access code usage)
    try {
        const user = await userModel.findById(userId).select('wallet');
        if (user) {
            if (!user.wallet) {
                user.wallet = { balance: 0, transactions: [] };
            }
            user.wallet.transactions.push({
                type: 'access_code',
                amount: 0,
                code: redeemable.code,
                description: `تم تفعيل كود وصول للكورس: ${course.title}`,
                date: now,
                status: 'completed'
            });
            await user.save();
        }
    } catch (e) {
        console.error('Failed to record access code transaction:', e.message);
    }

    return res.status(200).json(new ApiResponse(200, {
        access: {
            id: access._id,
            courseId: access.courseId,
            accessStartAt: access.accessStartAt,
            accessEndAt: access.accessEndAt
        }
    }, 'Course unlocked successfully'));
});

// Check if current user has active access to a course
export const checkCourseAccess = asyncHandler(async (req, res) => {
    const { courseId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    if (!courseId) throw new ApiError(400, 'courseId is required');

    // Admin and Super Admin always have access
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
        return res.status(200).json(new ApiResponse(200, {
            hasAccess: true,
            accessEndAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            source: 'admin'
        }, 'Admin access - unlimited'));
    }

    const now = new Date();
    // Find the most recent access window (even if expired)
    const latestAccess = await CourseAccess.findOne({ userId, courseId }).sort({ accessEndAt: -1 });
    const hasActiveAccess = !!(latestAccess && latestAccess.accessEndAt > now);

    return res.status(200).json(new ApiResponse(200, {
        hasAccess: hasActiveAccess,
        accessEndAt: latestAccess?.accessEndAt || null,
        source: latestAccess?.source || null
    }, 'Access status'));
});

// Admin: list generated codes with filters
export const listCourseAccessCodes = asyncHandler(async (req, res) => {
    const { courseId, isUsed } = req.query;
    const q = (req.query.q || '').toString().trim();
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limitRaw = parseInt(req.query.limit, 10) || 20;
    const limit = Math.min(Math.max(limitRaw, 1), 200);
    const skip = (page - 1) * limit;
    const query = {};
    if (courseId) query.courseId = courseId;
    if (typeof isUsed !== 'undefined') query.isUsed = isUsed === 'true';

    // If searching, build aggregation to filter by code, course title, or user email
    if (q) {
        const matchStage = { $match: query };
        const lookupUser = { $lookup: { from: 'users', localField: 'usedBy', foreignField: '_id', as: 'usedBy' } };
        const unwindUser = { $unwind: { path: '$usedBy', preserveNullAndEmptyArrays: true } };
        const lookupCourse = { $lookup: { from: 'courses', localField: 'courseId', foreignField: '_id', as: 'courseId' } };
        const unwindCourse = { $unwind: { path: '$courseId', preserveNullAndEmptyArrays: true } };
        const lookupUsageHistory = { 
            $lookup: { 
                from: 'users', 
                localField: 'usageHistory.userId', 
                foreignField: '_id', 
                as: 'usageHistoryUsers' 
            } 
        };
        const searchRegex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        const searchStage = {
            $match: {
                $or: [
                    { code: { $regex: searchRegex } },
                    { 'courseId.title': { $regex: searchRegex } },
                    { 'usedBy.email': { $regex: searchRegex } }
                ]
            }
        };
        const sortStage = { $sort: { createdAt: -1 } };
        const facetStage = {
            $facet: {
                data: [ { $skip: skip }, { $limit: limit } ],
                meta: [ { $count: 'total' } ]
            }
        };

        const pipeline = [ matchStage, lookupUser, unwindUser, lookupCourse, unwindCourse, lookupUsageHistory, searchStage, sortStage, facetStage ];
        const aggResult = await CourseAccessCode.aggregate(pipeline);
        const data = aggResult[0]?.data || [];
        const total = aggResult[0]?.meta?.[0]?.total || 0;

        // Re-shape populated fields to match populate output
        const codes = data.map(doc => ({
            ...doc,
            usedBy: doc.usedBy ? { _id: doc.usedBy._id, email: doc.usedBy.email, name: doc.usedBy.fullName } : null,
            courseId: doc.courseId ? { _id: doc.courseId._id, title: doc.courseId.title } : null,
            usageHistory: doc.usageHistory ? doc.usageHistory.map(usage => ({
                ...usage,
                userId: doc.usageHistoryUsers?.find(u => u._id.toString() === usage.userId.toString()) || usage.userId
            })) : []
        }));

        return res.status(200).json(new ApiResponse(200, { 
            codes,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.max(Math.ceil(total / limit), 1)
            }
        }, 'Codes list'));
    }

    const [total, codes] = await Promise.all([
        CourseAccessCode.countDocuments(query),
        CourseAccessCode.find(query)
            .populate('usedBy', 'name email')
            .populate('courseId', 'title')
            .populate('usageHistory.userId', 'name email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
    ]);

    return res.status(200).json(new ApiResponse(200, { 
        codes,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.max(Math.ceil(total / limit), 1)
        }
    }, 'Codes list'));
});

// Admin: delete a single code (only if unused)
export const deleteCourseAccessCode = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const code = await CourseAccessCode.findById(id);
    if (!code) {
        throw new ApiError(404, 'Code not found');
    }
    if (code.isUsed) {
        throw new ApiError(400, 'Cannot delete a used code');
    }
    await CourseAccessCode.deleteOne({ _id: id });
    return res.status(200).json(new ApiResponse(200, { id }, 'Code deleted'));
});

// Admin: bulk delete codes by ids (defaults to only unused)
export const bulkDeleteCourseAccessCodes = asyncHandler(async (req, res) => {
    const { ids, courseId, onlyUnused = true } = req.body || {};
    if (!Array.isArray(ids) || ids.length === 0) {
        throw new ApiError(400, 'ids array is required');
    }
    const query = { _id: { $in: ids } };
    if (courseId) query.courseId = courseId;
    if (onlyUnused) query.isUsed = false;

    const result = await CourseAccessCode.deleteMany(query);
    return res.status(200).json(new ApiResponse(200, { deletedCount: result.deletedCount || 0 }, 'Bulk delete completed'));
});

// User: redeem code specifically for video access
export const redeemVideoAccessCode = asyncHandler(async (req, res) => {
    const { code, courseId, lessonId, unitId, videoId } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    // Admin and Super Admin bypass - they get unrestricted access
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
        // Ensure course exists
        const course = await Course.findById(courseId);
        if (!course) throw new ApiError(404, 'Course not found');

        // Create or update access record for admin
        const existingAccess = await CourseAccess.findOne({
            userId,
            courseId,
            source: 'admin'
        });

        let access;
        if (existingAccess) {
            // Update existing access to extend it
            existingAccess.accessEndAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year from now
            access = await existingAccess.save();
        } else {
            // Create new access record for admin
            access = await CourseAccess.create({
                userId,
                courseId,
                accessStartAt: new Date(),
                accessEndAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
                source: 'admin'
            });
        }

        return res.status(200).json(new ApiResponse(200, {
            access: {
                id: access._id,
                courseId: access.courseId,
                accessStartAt: access.accessStartAt,
                accessEndAt: access.accessEndAt,
                videoId,
                lessonId,
                adminAccess: true
            }
        }, 'Admin access granted - video unlocked successfully'));
    }
    
    if (!code) throw new ApiError(400, 'code is required');
    if (!courseId) throw new ApiError(400, 'courseId is required');
    if (!lessonId) throw new ApiError(400, 'lessonId is required');
    if (!videoId) throw new ApiError(400, 'videoId is required');

    const redeemable = await CourseAccessCode.findRedeemable(code);
    if (!redeemable) throw new ApiError(400, 'Invalid or expired code');

    // Check if the code is for the correct course
    if (redeemable.courseId.toString() !== courseId) {
        throw new ApiError(400, 'This code is not valid for this course');
    }

    // Ensure course exists
    const course = await Course.findById(redeemable.courseId);
    if (!course) throw new ApiError(404, 'Course not found for this code');

    // Additional validation: Check if the lesson and video exist in the course
    let lessonFound = false;
    let videoFound = false;

    // Check direct lessons
    if (course.directLessons) {
        const lesson = course.directLessons.find(l => l._id.toString() === lessonId);
        if (lesson) {
            lessonFound = true;
            const video = lesson.videos?.find(v => v._id.toString() === videoId);
            if (video) videoFound = true;
        }
    }

    // Check lessons within units if not found in direct lessons
    if (!lessonFound && course.units) {
        for (const unit of course.units) {
            if (unitId && unit._id.toString() !== unitId) continue;
            
            const lesson = unit.lessons?.find(l => l._id.toString() === lessonId);
            if (lesson) {
                lessonFound = true;
                const video = lesson.videos?.find(v => v._id.toString() === videoId);
                if (video) videoFound = true;
                break;
            }
        }
    }

    if (!lessonFound) {
        throw new ApiError(404, 'Lesson not found in this course');
    }

    if (!videoFound) {
        throw new ApiError(404, 'Video not found in this lesson');
    }

    const now = new Date();
    // Compute access window based on fixed date range
    let start = new Date(redeemable.accessStartAt);
    let end = new Date(redeemable.accessEndAt);
    if (now > end) throw new ApiError(400, 'This code is expired for its access window');

    // Create or update access record for video-specific access
    const existingAccess = await CourseAccess.findOne({
        userId,
        courseId: redeemable.courseId,
        source: 'code'
    });

    let access;
    if (existingAccess) {
        // Update existing access if the new code provides longer access
        if (end > new Date(existingAccess.accessEndAt)) {
            existingAccess.accessEndAt = end;
            existingAccess.accessStartAt = start;
            existingAccess.codeId = redeemable._id;
            access = await existingAccess.save();
        } else {
            access = existingAccess;
        }
    } else {
        // Create new access record
        access = await CourseAccess.create({
            userId,
            courseId: redeemable.courseId,
            accessStartAt: start,
            accessEndAt: end,
            source: 'code',
            codeId: redeemable._id
        });
    }

    // Track usage in history (allow reuse during access window)
    redeemable.usageHistory.push({
        userId,
        usedAt: now,
        videoId,
        lessonId
    });
    
    // Update first usage info (for backward compatibility)
    if (!redeemable.isUsed) {
        redeemable.isUsed = true;
        redeemable.usedBy = userId;
        redeemable.usedAt = now;
    }
    
    await redeemable.save();

    // Log wallet transaction entry (video access code usage)
    try {
        const user = await userModel.findById(userId).select('wallet');
        if (user) {
            if (!user.wallet) {
                user.wallet = { balance: 0, transactions: [] };
            }
            user.wallet.transactions.push({
                type: 'video_access_code',
                amount: 0,
                code: redeemable.code,
                description: `تم تفعيل كود وصول للفيديو في الكورس: ${course.title}`,
                date: now,
                status: 'completed'
            });
            await user.save();
        }
    } catch (e) {
        console.error('Failed to record video access code transaction:', e.message);
    }

    return res.status(200).json(new ApiResponse(200, {
        access: {
            id: access._id,
            courseId: access.courseId,
            accessStartAt: access.accessStartAt,
            accessEndAt: access.accessEndAt,
            videoId,
            lessonId
        }
    }, 'Video access unlocked successfully'));
});

// Check if user has access to a specific video
export const checkVideoAccess = asyncHandler(async (req, res) => {
    const { courseId, lessonId, videoId } = req.params;
    const { unitId } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    if (!courseId) throw new ApiError(400, 'courseId is required');
    if (!lessonId) throw new ApiError(400, 'lessonId is required');
    if (!videoId) throw new ApiError(400, 'videoId is required');

    // Admin and Super Admin always have access
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
        return res.status(200).json(new ApiResponse(200, {
            hasAccess: true,
            accessEndAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
            source: 'admin',
            videoId,
            lessonId,
            courseId
        }, 'Admin access - unlimited video access'));
    }

    // Ensure course exists
    const course = await Course.findById(courseId);
    if (!course) throw new ApiError(404, 'Course not found');

    // Find the lesson and check if it's free
    let lesson = null;
    if (unitId) {
        const unit = course.units.id(unitId);
        if (unit) {
            lesson = unit.lessons.id(lessonId);
        }
    } else {
        lesson = course.directLessons.id(lessonId);
    }

    if (!lesson) throw new ApiError(404, 'Lesson not found');

    // If lesson is free (price = 0), user has access
    if (lesson.price === 0) {
        return res.status(200).json(new ApiResponse(200, {
            hasAccess: true,
            accessEndAt: null,
            source: 'free',
            videoId,
            lessonId,
            courseId
        }, 'Free lesson - video access granted'));
    }

    // Check if user has active course access
    const now = new Date();
    const courseAccess = await CourseAccess.findOne({ 
        userId, 
        courseId,
        accessEndAt: { $gt: now }
    }).sort({ accessEndAt: -1 });

    if (courseAccess) {
        return res.status(200).json(new ApiResponse(200, {
            hasAccess: true,
            accessEndAt: courseAccess.accessEndAt,
            source: courseAccess.source,
            videoId,
            lessonId,
            courseId
        }, 'Video access granted via course access'));
    }

    // Check if user has video-specific access (from redeemed video codes)
    const videoAccess = await CourseAccess.findOne({
        userId,
        courseId,
        source: 'code',
        accessEndAt: { $gt: now }
    }).sort({ accessEndAt: -1 });

    if (videoAccess) {
        return res.status(200).json(new ApiResponse(200, {
            hasAccess: true,
            accessEndAt: videoAccess.accessEndAt,
            source: 'video_code',
            videoId,
            lessonId,
            courseId
        }, 'Video access granted via video code'));
    }

    // User doesn't have access
    return res.status(200).json(new ApiResponse(200, {
        hasAccess: false,
        accessEndAt: null,
        source: null,
        videoId,
        lessonId,
        courseId,
        requiresCode: true
    }, 'Video access required - code needed'));
});


