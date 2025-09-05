import subjectModel from '../models/subject.model.js';
import AppError from '../utils/error.utils.js';
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

// Get all subjects
export const getAllSubjects = async (req, res, next) => {
    try {
        const { page = 1, limit = 12, search, status, featured } = req.query;
        
        let query = {};
        
        // Filter by status
        if (status) {
            query.status = status;
        }
        
        // Filter by featured
        if (featured === 'true') {
            query.featured = true;
        }
        
        // Search functionality
        if (search) {
            query.$text = { $search: search };
        }
        
        const subjects = await subjectModel.find(query)
            .populate('instructor', 'name specialization')
            .sort({ featured: -1, createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
            
        const total = await subjectModel.countDocuments(query);
        
        res.status(200).json({
            success: true,
            message: 'Subjects fetched successfully',
            subjects,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Get single subject by ID
export const getSubjectById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const subject = await subjectModel.findById(id)
            .populate('instructor', 'name specialization bio');
        
        if (!subject) {
            return next(new AppError('Subject not found', 404));
        }
        
        res.status(200).json({
            success: true,
            message: 'Subject fetched successfully',
            subject
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Create new subject
export const createSubject = async (req, res, next) => {
    try {
        const { title, description, instructor, featured } = req.body;
        
        if (!title || !description || !instructor) {
            return next(new AppError('Title, description and instructor are required', 400));
        }
        
        const subjectData = { title, description, instructor };
        if (typeof featured !== 'undefined') {
            subjectData.featured = featured === 'true' || featured === true;
        }
        
        // Handle image upload (optional)
        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'subjects',
                    width: 300,
                    height: 200,
                    crop: 'fill'
                });
                
                subjectData.image = {
                    public_id: result.public_id,
                    secure_url: result.secure_url
                };
                
                // Remove file from uploads folder
                fs.rmSync(req.file.path);
            } catch (error) {
                console.error('Cloudinary upload error:', error);
                // If Cloudinary fails, fall back to local file path
                if (req.file?.filename) {
                    subjectData.image = {
                        public_id: req.file.filename,
                        secure_url: `/uploads/${req.file.filename}`
                    };
                }
            }
        }
        
        const subject = await subjectModel.create(subjectData);
        
        // Populate instructor only
        await subject.populate('instructor', 'name specialization');
        
        res.status(201).json({
            success: true,
            message: 'Subject created successfully',
            subject
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Update subject
export const updateSubject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, description, instructor, featured } = req.body;
        
        const subject = await subjectModel.findById(id);
        
        if (!subject) {
            return next(new AppError('Subject not found', 404));
        }
        
        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (instructor) updateData.instructor = instructor;
        if (typeof featured !== 'undefined') updateData.featured = featured === 'true' || featured === true;
        
        // Handle image upload
        if (req.file) {
            try {
                const result = await cloudinary.uploader.upload(req.file.path, {
                    folder: 'subjects',
                    width: 300,
                    height: 200,
                    crop: 'fill'
                });
                
                updateData.image = {
                    public_id: result.public_id,
                    secure_url: result.secure_url
                };
                
                // Remove file from uploads folder
                fs.rmSync(req.file.path);
            } catch (error) {
                console.error('Cloudinary upload error:', error);
                if (req.file?.filename) {
                    updateData.image = {
                        public_id: req.file.filename,
                        secure_url: `/uploads/${req.file.filename}`
                    };
                }
            }
        }
        
        const updatedSubject = await subjectModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );
        
        res.status(200).json({
            success: true,
            message: 'Subject updated successfully',
            subject: updatedSubject
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Delete subject
export const deleteSubject = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const subject = await subjectModel.findById(id);
        
        if (!subject) {
            return next(new AppError('Subject not found', 404));
        }
        
        await subjectModel.findByIdAndDelete(id);
        
        res.status(200).json({
            success: true,
            message: 'Subject deleted successfully'
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Get featured subjects
export const getFeaturedSubjects = async (req, res, next) => {
    try {
        console.log('=== GET FEATURED SUBJECTS ===');
        
        // Check if subjectModel is available
        if (!subjectModel) {
            console.error('Subject model not available');
            return res.status(500).json({
                success: false,
                message: 'Database model not available'
            });
        }
        
        console.log('Querying featured subjects...');
        const featuredSubjects = await subjectModel
          .find({ featured: true })
          .populate('instructor', 'name specialization')
          .sort({ createdAt: -1 })
          .limit(6);
        
        console.log(`Found ${featuredSubjects.length} featured subjects`);
        
        res.status(200).json({
            success: true,
            message: 'Featured subjects fetched successfully',
            subjects: featuredSubjects
        });
    } catch (e) {
        console.error('Error in getFeaturedSubjects:', e);
        console.error('Error stack:', e.stack);
        
        // Return error response instead of crashing
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch featured subjects',
            error: process.env.NODE_ENV === 'development' ? e.message : 'Internal server error'
        });
    }
};

// Toggle subject featured status
export const toggleFeatured = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const subject = await subjectModel.findById(id);
        
        if (!subject) {
            return next(new AppError('Subject not found', 404));
        }
        
        subject.featured = !subject.featured;
        await subject.save();
        
        res.status(200).json({
            success: true,
            message: `Subject ${subject.featured ? 'featured' : 'unfeatured'} successfully`,
            subject
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Update subject status
export const updateSubjectStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!status || !['active', 'inactive', 'featured'].includes(status)) {
            return next(new AppError('Valid status is required', 400));
        }
        
        const subject = await subjectModel.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        );
        
        if (!subject) {
            return next(new AppError('Subject not found', 404));
        }
        
        res.status(200).json({
            success: true,
            message: 'Subject status updated successfully',
            subject
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}; 