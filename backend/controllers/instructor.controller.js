import Instructor from '../models/instructor.model.js';
import AppError from '../utils/error.utils.js';
import path from 'path';
import fs from 'fs';

// Create a new instructor
const createInstructor = async (req, res, next) => {
  try {
    const {
      name,
      email,
      bio,
      specialization,
      experience,
      education,
      socialLinks,
      featured
    } = req.body;

    // Check if instructor already exists
    const existingInstructor = await Instructor.findOne({ email: email.toLowerCase() });
    if (existingInstructor) {
      return res.status(400).json({
        success: false,
        message: 'Instructor with this email already exists'
      });
    }

    // Handle profile image upload
    let profileImage = {
      public_id: 'placeholder',
      secure_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzRGNDZFNSIvPgogIDx0ZXh0IHg9IjE1MCIgeT0iMTUwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj4KICAgIEluc3RydWN0b3IgQXZhdGFyCiAgPC90ZXh0Pgo8L3N2Zz4K'
    };
    if (req.file) {
      try {
        console.log('📸 Processing instructor image upload:', req.file.filename);
        
        // Move file to uploads/avatars directory
        const uploadsDir = path.join('uploads', 'avatars');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const destPath = path.join(uploadsDir, req.file.filename);
        fs.renameSync(req.file.path, destPath);
        
        // Store local file path in database
        profileImage = {
          public_id: req.file.filename,
          secure_url: `/uploads/avatars/${req.file.filename}`
        };
        
        console.log('✅ Instructor image saved locally:', destPath);
      } catch (uploadError) {
        console.error('❌ Image upload error:', uploadError);
        
        // Clean up file even if upload fails
        if (req.file && fs.existsSync(`uploads/${req.file.filename}`)) {
          fs.rmSync(`uploads/${req.file.filename}`);
        }
        
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to upload image' 
        });
      }
    }

    // Parse socialLinks if it's a JSON string
    let parsedSocialLinks = {};
    if (socialLinks) {
      try {
        parsedSocialLinks = typeof socialLinks === 'string' ? JSON.parse(socialLinks) : socialLinks;
      } catch (error) {
        console.error('Error parsing socialLinks:', error);
        parsedSocialLinks = {};
      }
    }

    const instructor = new Instructor({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      bio: bio?.trim() || '',
      specialization: specialization?.trim() || '',
      experience: experience || 0,
      education: education?.trim() || '',
      socialLinks: parsedSocialLinks,
      profileImage,
      featured: featured || false
    });

    await instructor.save();

    return res.status(201).json({
      success: true,
      message: 'Instructor created successfully',
      data: { instructor }
    });
  } catch (error) {
    console.error('Error creating instructor:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create instructor'
    });
  }
};

// Get all instructors with optional filtering
const getAllInstructors = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search, specialization, featured, isActive } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = { isActive: true };
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { bio: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } }
      ];
    }

    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }

    if (featured !== undefined) {
      query.featured = featured === 'true';
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const instructors = await Instructor.find(query)
      .populate({
        path: 'courses',
        select: 'title description thumbnail',
        match: { isActive: true }
      })
      .sort({ featured: -1, rating: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Instructor.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: 'Instructors retrieved successfully',
      data: {
        instructors,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting instructors:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get instructors'
    });
  }
};

// Get featured instructors
const getFeaturedInstructors = async (req, res, next) => {
  try {
    console.log('=== GET FEATURED INSTRUCTORS ===');
    
    // Check if Instructor model is available
    if (!Instructor) {
      console.error('Instructor model not available');
      return res.status(500).json({
        success: false,
        message: 'Database model not available'
      });
    }
    
    const { limit = 6 } = req.query;
    console.log('Querying featured instructors with limit:', limit);

    const instructors = await Instructor.find({ 
      featured: true, 
      isActive: true 
    })
      .populate({
        path: 'courses',
        select: 'title description thumbnail',
        match: { isActive: true }
      })
      .sort({ rating: -1, totalStudents: -1 })
      .limit(parseInt(limit));

    console.log(`Found ${instructors.length} featured instructors`);

    return res.status(200).json({
      success: true,
      message: 'Featured instructors retrieved successfully',
      data: { instructors }
    });
  } catch (error) {
    console.error('❌ Error in getFeaturedInstructors:', error);
    console.error('Error stack:', error.stack);
    
    // Return error response instead of crashing
    return res.status(500).json({
      success: false,
      message: 'Failed to get featured instructors',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};

// Get instructor by ID
const getInstructorById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const instructor = await Instructor.findById(id)
      .populate({
        path: 'courses',
        select: 'title description thumbnail price',
        match: { isActive: true },
        populate: {
          path: 'units',
          select: 'title lessons'
        }
      });
    
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Instructor retrieved successfully',
      data: { instructor }
    });
  } catch (error) {
    console.error('Error getting instructor:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get instructor'
    });
  }
};

// Update instructor
const updateInstructor = async (req, res, next) => {
  try {
    console.log('=== Update Instructor Debug ===');
    console.log('Request params:', req.params);
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);
    
    const { id } = req.params;
    const {
      name,
      email,
      bio,
      specialization,
      experience,
      education,
      socialLinks,
      featured,
      isActive
    } = req.body;

    console.log('Extracted data:', {
      name, email, bio, specialization, experience, education, socialLinks, featured, isActive
    });

    const instructor = await Instructor.findById(id);
    if (!instructor) {
      console.log('Instructor not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    console.log('Found instructor:', instructor.name);

    // Check if email is being changed and if it already exists
    if (email && email.toLowerCase() !== instructor.email) {
      const existingInstructor = await Instructor.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: id } 
      });
      if (existingInstructor) {
        console.log('Email already exists:', email);
        return res.status(400).json({
          success: false,
          message: 'Instructor with this email already exists'
        });
      }
    }

    // Handle profile image upload
    let profileImage = instructor.profileImage;
    if (req.file) {
      try {
        console.log('📸 Processing instructor image update:', req.file.filename);
        console.log('📁 File details:', {
          originalname: req.file.originalname,
          filename: req.file.filename,
          path: req.file.path,
          size: req.file.size
        });
        
        // Delete old image if exists (local file)
        if (instructor.profileImage && instructor.profileImage.public_id && instructor.profileImage.public_id !== 'placeholder') {
          const oldImagePath = path.join('uploads', 'avatars', instructor.profileImage.public_id);
          if (fs.existsSync(oldImagePath)) {
            fs.rmSync(oldImagePath);
            console.log('🗑️ Deleted old instructor image:', oldImagePath);
          }
        }
        
        // Move new file to uploads/avatars directory
        const uploadsDir = path.join('uploads', 'avatars');
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        const destPath = path.join(uploadsDir, req.file.filename);
        fs.renameSync(req.file.path, destPath);
        
        // Store local file path in database
        profileImage = {
          public_id: req.file.filename,
          secure_url: `/uploads/avatars/${req.file.filename}`
        };
        
        console.log('✅ Instructor image updated locally:', destPath);
        console.log('📊 Update data image:', profileImage);
      } catch (uploadError) {
        console.error('❌ Image upload error:', uploadError);
        
        // Clean up file even if upload fails
        if (req.file && fs.existsSync(`uploads/${req.file.filename}`)) {
          fs.rmSync(`uploads/${req.file.filename}`);
        }
        
        return res.status(500).json({ 
          success: false, 
          message: 'Failed to upload image' 
        });
      }
    }

    // Parse socialLinks if it's a JSON string
    let parsedSocialLinks = socialLinks;
    if (typeof socialLinks === 'string') {
      try {
        parsedSocialLinks = JSON.parse(socialLinks);
        console.log('Parsed socialLinks:', parsedSocialLinks);
      } catch (error) {
        console.error('Error parsing socialLinks:', error);
        parsedSocialLinks = {
          linkedin: '',
          twitter: '',
          website: ''
        };
      }
    }

    // Update instructor
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (email !== undefined) updateData.email = email.toLowerCase().trim();
    if (bio !== undefined) updateData.bio = bio?.trim() || '';
    if (specialization !== undefined) updateData.specialization = specialization?.trim() || '';
    if (experience !== undefined) updateData.experience = experience;
    if (education !== undefined) updateData.education = education?.trim() || '';
    if (parsedSocialLinks !== undefined) updateData.socialLinks = parsedSocialLinks;
    if (featured !== undefined) updateData.featured = featured;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (req.file) updateData.profileImage = profileImage;

    console.log('Update data:', updateData);

    const updatedInstructor = await Instructor.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate({
      path: 'courses',
      select: 'title description thumbnail',
      match: { isActive: true }
    });

    console.log('Update successful:', updatedInstructor.name);

    return res.status(200).json({
      success: true,
      message: 'Instructor updated successfully',
      data: { instructor: updatedInstructor }
    });
  } catch (error) {
    console.error('Error updating instructor:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update instructor',
      error: error.message
    });
  }
};

// Delete instructor
const deleteInstructor = async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log('Attempting to delete instructor:', id);

    const instructor = await Instructor.findById(id);
    if (!instructor) {
      console.log('Instructor not found:', id);
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    console.log('Found instructor:', instructor.name);

    // Check if instructor has associated courses
    if (instructor.courses && instructor.courses.length > 0) {
      console.log('Instructor has courses:', instructor.courses.length);
      return res.status(400).json({
        success: false,
        message: 'Cannot delete instructor with associated courses. Please remove courses first.'
      });
    }

    // Check if instructor has associated subjects
    try {
      const Subject = await import('../models/subject.model.js');
      const associatedSubjects = await Subject.default.countDocuments({ instructor: id });
      
      console.log('Associated subjects:', associatedSubjects);
      
      if (associatedSubjects > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete instructor with associated subjects. Please remove subjects first.'
        });
      }
    } catch (subjectError) {
      console.error('Error checking subjects:', subjectError);
      // Continue with deletion even if subject check fails
    }

    // Delete profile image if exists
    if (instructor.profileImage && instructor.profileImage.public_id && instructor.profileImage.public_id !== 'placeholder') {
      try {
        console.log('🗑️ Deleting local instructor image:', instructor.profileImage.public_id);
        const imagePath = path.join('uploads', 'avatars', instructor.profileImage.public_id);
        if (fs.existsSync(imagePath)) {
          fs.rmSync(imagePath);
          console.log('✅ Local instructor image deleted:', imagePath);
        }
      } catch (fileError) {
        console.error('❌ Error deleting local instructor image:', fileError);
        // Continue with deletion even if file deletion fails
      }
    }

    console.log('Deleting instructor from database');
    await Instructor.findByIdAndDelete(id);

    console.log('Instructor deleted successfully');
    return res.status(200).json({
      success: true,
      message: 'Instructor deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting instructor:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete instructor',
      error: error.message
    });
  }
};

// Get instructor statistics
const getInstructorStats = async (req, res, next) => {
  try {
    const { id } = req.params;

    const instructor = await Instructor.findById(id);
    if (!instructor) {
      return res.status(404).json({
        success: false,
        message: 'Instructor not found'
      });
    }

    const instructorStats = {
      totalStudents: instructor.totalStudents || 0,
      rating: instructor.rating || 0,
      experience: instructor.experience || 0
    };

    return res.status(200).json({
      success: true,
      message: 'Instructor statistics retrieved successfully',
      data: { stats: instructorStats }
    });
  } catch (error) {
    console.error('Error getting instructor statistics:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get instructor statistics'
    });
  }
};

export {
  createInstructor,
  getAllInstructors,
  getFeaturedInstructors,
  getInstructorById,
  updateInstructor,
  deleteInstructor,
  getInstructorStats
}; 