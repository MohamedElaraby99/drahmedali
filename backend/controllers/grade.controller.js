import Grade from '../models/grade.model.js';
import Subject from '../models/subject.model.js';
import AppError from '../utils/error.utils.js';

// Create a new grade
const createGrade = async (req, res) => {
  try {
    const { name, description, subjects } = req.body;

    // Check if grade already exists
    const existingGrade = await Grade.findOne({ name: name.trim() });
    if (existingGrade) {
      return res.status(400).json({
        success: false,
        message: 'Grade with this name already exists'
      });
    }

    // Validate subjects if provided
    if (subjects && subjects.length > 0) {
      const validSubjects = await Subject.find({ _id: { $in: subjects } });
      if (validSubjects.length !== subjects.length) {
        return res.status(400).json({
          success: false,
          message: 'Some subjects are invalid'
        });
      }
    }

    const grade = new Grade({
      name: name.trim(),
      description: description?.trim() || '',
      subjects: subjects || []
    });

    await grade.save();

    // Populate subjects for response
    await grade.populate('subjects', 'name description');

    return res.status(201).json({
      success: true,
      message: 'Grade created successfully',
      data: { grade }
    });
  } catch (error) {
    console.error('Error creating grade:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create grade'
    });
  }
};

// Get all grades with optional filtering
const getAllGrades = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, isActive } = req.query;
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const grades = await Grade.find(query)
      .populate('subjects', 'name description')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Grade.countDocuments(query);

    return res.status(200).json({
      success: true,
      message: 'Grades retrieved successfully',
      data: {
        grades,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('Error getting grades:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get grades'
    });
  }
};

// Get grade by ID
const getGradeById = async (req, res) => {
  try {
    const { id } = req.params;

    const grade = await Grade.findById(id).populate('subjects', 'name description');
    
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Grade retrieved successfully',
      data: { grade }
    });
  } catch (error) {
    console.error('Error getting grade:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get grade'
    });
  }
};

// Update grade
const updateGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, subjects, isActive } = req.body;

    const grade = await Grade.findById(id);
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    // Check if name is being changed and if it already exists
    if (name && name.trim() !== grade.name) {
      const existingGrade = await Grade.findOne({ name: name.trim(), _id: { $ne: id } });
      if (existingGrade) {
        return res.status(400).json({
          success: false,
          message: 'Grade with this name already exists'
        });
      }
    }

    // Validate subjects if provided
    if (subjects && subjects.length > 0) {
      const validSubjects = await Subject.find({ _id: { $in: subjects } });
      if (validSubjects.length !== subjects.length) {
        return res.status(400).json({
          success: false,
          message: 'Some subjects are invalid'
        });
      }
    }

    // Update grade
    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description?.trim() || '';
    if (subjects !== undefined) updateData.subjects = subjects;
    if (isActive !== undefined) updateData.isActive = isActive;

    const updatedGrade = await Grade.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('subjects', 'name description');

    return res.status(200).json({
      success: true,
      message: 'Grade updated successfully',
      data: { grade: updatedGrade }
    });
  } catch (error) {
    console.error('Error updating grade:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update grade'
    });
  }
};

// Delete grade
const deleteGrade = async (req, res) => {
  try {
    const { id } = req.params;

    const grade = await Grade.findById(id);
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    // Check if grade has associated subjects
    if (grade.subjects.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete grade with associated subjects. Please remove subjects first.'
      });
    }

    await Grade.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Grade deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting grade:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete grade'
    });
  }
};

// Add subjects to grade
const addSubjectsToGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { subjects } = req.body;

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Subjects array is required'
      });
    }

    const grade = await Grade.findById(id);
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    // Validate subjects
    const validSubjects = await Subject.find({ _id: { $in: subjects } });
    if (validSubjects.length !== subjects.length) {
      return res.status(400).json({
        success: false,
        message: 'Some subjects are invalid'
      });
    }

    // Add subjects (avoid duplicates)
    const uniqueSubjects = [...new Set([...grade.subjects, ...subjects])];
    
    const updatedGrade = await Grade.findByIdAndUpdate(
      id,
      { subjects: uniqueSubjects },
      { new: true, runValidators: true }
    ).populate('subjects', 'name description');

    return res.status(200).json({
      success: true,
      message: 'Subjects added to grade successfully',
      data: { grade: updatedGrade }
    });
  } catch (error) {
    console.error('Error adding subjects to grade:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add subjects to grade'
    });
  }
};

// Remove subjects from grade
const removeSubjectsFromGrade = async (req, res) => {
  try {
    const { id } = req.params;
    const { subjects } = req.body;

    if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Subjects array is required'
      });
    }

    const grade = await Grade.findById(id);
    if (!grade) {
      return res.status(404).json({
        success: false,
        message: 'Grade not found'
      });
    }

    // Remove subjects
    const updatedSubjects = grade.subjects.filter(subjectId => !subjects.includes(subjectId.toString()));
    
    const updatedGrade = await Grade.findByIdAndUpdate(
      id,
      { subjects: updatedSubjects },
      { new: true, runValidators: true }
    ).populate('subjects', 'name description');

    return res.status(200).json({
      success: true,
      message: 'Subjects removed from grade successfully',
      data: { grade: updatedGrade }
    });
  } catch (error) {
    console.error('Error removing subjects from grade:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to remove subjects from grade'
    });
  }
};

// Get grades with subjects count
const getGradesWithSubjectsCount = async (req, res) => {
  try {
    const grades = await Grade.aggregate([
      {
        $lookup: {
          from: 'subjects',
          localField: 'subjects',
          foreignField: '_id',
          as: 'subjects'
        }
      },
      {
        $addFields: {
          subjectsCount: { $size: '$subjects' }
        }
      },
      {
        $project: {
          name: 1,
          description: 1,
          isActive: 1,
          subjectsCount: 1,
          createdAt: 1,
          updatedAt: 1
        }
      },
      {
        $sort: { createdAt: -1 }
      }
    ]);

    return res.status(200).json({
      success: true,
      message: 'Grades with subjects count retrieved successfully',
      data: { grades }
    });
  } catch (error) {
    console.error('Error getting grades with subjects count:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get grades with subjects count'
    });
  }
};

export {
  createGrade,
  getAllGrades,
  getGradeById,
  updateGrade,
  deleteGrade,
  addSubjectsToGrade,
  removeSubjectsFromGrade,
  getGradesWithSubjectsCount
}; 