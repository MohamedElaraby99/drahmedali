import stageModel from '../models/stage.model.js';
import subjectModel from '../models/subject.model.js';
import userModel from '../models/user.model.js';
import AppError from '../utils/error.utils.js';

// Get all stages
export const getAllStages = async (req, res, next) => {
    try {
        const { page = 1, limit = 50, status, search, includeInactive } = req.query;
        
        let query = {};
        
        // Filter by status - by default only show active stages unless explicitly requested
        if (status) {
            query.status = status;
        } else if (!includeInactive) {
            // Default behavior: only show active stages
            query.status = 'active';
        }
        
        // Search functionality
        if (search) {
            query.$text = { $search: search };
        }
        
        const stages = await stageModel.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
            
        const total = await stageModel.countDocuments(query);
        
        res.status(200).json({
            success: true,
            message: 'Stages fetched successfully',
            data: {
                stages,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Get single stage by ID
export const getStageById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const stage = await stageModel.findById(id);
        
        if (!stage) {
            return next(new AppError('Stage not found', 404));
        }
        
        res.status(200).json({
            success: true,
            message: 'Stage fetched successfully',
            data: { stage }
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Create new stage
export const createStage = async (req, res, next) => {
    try {
        const { name, status, category } = req.body;
        
        if (!name) {
            return next(new AppError('Name is required', 400));
        }
        
        // Check if stage name already exists
        const existingStage = await stageModel.findOne({ name });
        if (existingStage) {
            return next(new AppError('Stage name already exists', 400));
        }
        
        const stageData = {
            name,
            status: status || 'active',
            category: category || null
        };
        
        const stage = await stageModel.create(stageData);
        
        res.status(201).json({
            success: true,
            message: 'Stage created successfully',
            data: { stage }
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Update stage
export const updateStage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, status, category } = req.body;
        
        const stage = await stageModel.findById(id);
        
        if (!stage) {
            return next(new AppError('Stage not found', 404));
        }
        
        const updateData = {};
        
        if (name) {
            // Check if new name already exists (excluding current stage)
            const existingStage = await stageModel.findOne({ name, _id: { $ne: id } });
            if (existingStage) {
                return next(new AppError('Stage name already exists', 400));
            }
            updateData.name = name;
        }
        
        if (status) updateData.status = status;
        

        
        const updatedStage = await stageModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        
        res.status(200).json({
            success: true,
            message: 'Stage updated successfully',
            data: { stage: updatedStage }
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Delete stage
export const deleteStage = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const stage = await stageModel.findById(id);
        
        if (!stage) {
            return next(new AppError('Stage not found', 404));
        }
        
        // Check if stage has associated subjects
        const subjectsCount = await subjectModel.countDocuments({ stage: stage._id });
        if (subjectsCount > 0) {
            return next(new AppError(`Cannot delete stage. It has ${subjectsCount} associated subjects`, 400));
        }
        
        await stageModel.findByIdAndDelete(id);
        
        res.status(200).json({
            success: true,
            message: 'Stage deleted successfully'
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Get stage statistics
export const getStageStats = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const stage = await stageModel.findById(id);
        
        if (!stage) {
            return next(new AppError('Stage not found', 404));
        }
        
        // Get subjects count for this stage
        const subjectsCount = await subjectModel.countDocuments({ stage: stage._id });
        
        // Get total students enrolled in subjects of this stage
        const subjects = await subjectModel.find({ stage: stage._id });
        const totalStudents = subjects.reduce((sum, subject) => sum + (subject.studentsEnrolled || 0), 0);
        
        // Update stage with current counts
        await stageModel.findByIdAndUpdate(id, {
            subjectsCount,
            studentsCount: totalStudents
        });
        
        res.status(200).json({
            success: true,
            message: 'Stage statistics fetched successfully',
            data: {
                stage: {
                    ...stage.toObject(),
                    subjectsCount,
                    studentsCount: totalStudents
                }
            }
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Get all stages with statistics
export const getAllStagesWithStats = async (req, res, next) => {
    try {
        console.log('📊 Fetching stages with statistics...');
        const stages = await stageModel.find().sort({ createdAt: -1 });
        console.log(`📊 Found ${stages.length} stages`);
        
        // Get statistics for each stage
        const stagesWithStats = await Promise.all(
            stages.map(async (stage) => {
                // Count subjects for this stage
                const subjectsCount = await subjectModel.countDocuments({ stage: stage._id });
                
                // Count actual users in this stage
                const studentsCount = await userModel.countDocuments({ 
                    stage: stage._id,
                    role: 'USER' // Only count students, not admins
                });
                
                console.log(`📊 Stage "${stage.name}": ${studentsCount} students, ${subjectsCount} subjects`);
                
                return {
                    ...stage.toObject(),
                    subjectsCount,
                    studentsCount
                };
            })
        );
        
        console.log('📊 Stages with stats processed:', stagesWithStats.map(s => ({ name: s.name, students: s.studentsCount, subjects: s.subjectsCount })));
        
        res.status(200).json({
            success: true,
            message: 'Stages with statistics fetched successfully',
            data: { stages: stagesWithStats }
        });
    } catch (e) {
        console.error('❌ Error in getAllStagesWithStats:', e);
        return next(new AppError(e.message, 500));
    }
};

// Get all stages including inactive ones (for admin purposes)
export const getAllStagesAdmin = async (req, res, next) => {
    try {
        const { page = 1, limit = 50, status, search } = req.query;
        
        let query = {};
        
        // Filter by status if specified
        if (status) {
            query.status = status;
        }
        
        // Search functionality
        if (search) {
            query.$text = { $search: search };
        }
        
        const stages = await stageModel.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
            
        const total = await stageModel.countDocuments(query);
        
        res.status(200).json({
            success: true,
            message: 'All stages fetched successfully (including inactive)',
            data: {
                stages,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit)
                }
            }
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Toggle stage status
export const toggleStageStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const stage = await stageModel.findById(id);
        
        if (!stage) {
            return next(new AppError('Stage not found', 404));
        }
        
        const newStatus = stage.status === 'active' ? 'inactive' : 'active';
        
        const updatedStage = await stageModel.findByIdAndUpdate(
            id,
            { status: newStatus },
            { new: true }
        );
        
        res.status(200).json({
            success: true,
            message: `Stage ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`,
            data: { stage: updatedStage }
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}; 