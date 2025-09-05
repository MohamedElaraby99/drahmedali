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

    // Mark code as used
    redeemable.isUsed = true;
    redeemable.usedBy = userId;
    redeemable.usedAt = now;
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
    if (!courseId) throw new ApiError(400, 'courseId is required');

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

        const pipeline = [ matchStage, lookupUser, unwindUser, lookupCourse, unwindCourse, searchStage, sortStage, facetStage ];
        const aggResult = await CourseAccessCode.aggregate(pipeline);
        const data = aggResult[0]?.data || [];
        const total = aggResult[0]?.meta?.[0]?.total || 0;

        // Re-shape populated fields to match populate output
        const codes = data.map(doc => ({
            ...doc,
            usedBy: doc.usedBy ? { _id: doc.usedBy._id, email: doc.usedBy.email, name: doc.usedBy.fullName } : null,
            courseId: doc.courseId ? { _id: doc.courseId._id, title: doc.courseId.title } : null
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


