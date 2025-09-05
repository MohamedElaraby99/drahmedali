import OfflineGrade from '../models/offlineGrade.model.js';
import Group from '../models/group.model.js';
import User from '../models/user.model.js';
import ExcelJS from 'exceljs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Configure multer for file uploads
const storage = multer.memoryStorage();
export const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext === '.xlsx' || ext === '.xls') {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// CRUD: Create Grade
export const createGrade = asyncHandler(async (req, res) => {
  const { studentName, groupId, quizName, score, notes, maxScore = 100 } = req.body;
  const uploadedBy = req.user.id;
  const uploadedByName = req.user.fullName || req.user.email || 'Unknown user';

  // Validate required fields
  if (!studentName || !groupId || !quizName || score === undefined) {
    throw new ApiError(400, 'جميع الحقول مطلوبة');
  }

  // Validate score
  if (score < 0 || score > maxScore) {
    throw new ApiError(400, `الدرجة يجب أن تكون بين 0 و ${maxScore}`);
  }

  // Get group information
  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  // Check if grade already exists for this student and quiz
  const existingGrade = await OfflineGrade.findOne({
    studentName: studentName.trim(),
    groupId,
    quizName: quizName.trim()
  });

  if (existingGrade) {
    throw new ApiError(400, 'درجة لهذا الطالب في هذا الاختبار موجودة مسبقاً');
  }

  // Create new grade
  const newGrade = new OfflineGrade({
    studentName: studentName.trim(),
    groupId,
    groupName: group.name,
    quizName: quizName.trim(),
    score: parseFloat(score),
    maxScore: parseFloat(maxScore),
    notes: notes?.trim() || '',
    uploadedBy,
    uploadedByName,
    uploadMethod: 'manual'
  });

  await newGrade.save();

  res.status(201).json(new ApiResponse(201, newGrade, 'تم إنشاء الدرجة بنجاح'));
});

// CRUD: Get All Grades
export const getAllGrades = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, groupId, quizName, search } = req.query;

  // Build filter
  const filter = { status: 'active' };
  
  if (groupId) {
    filter.groupId = groupId;
  }
  
  if (quizName) {
    filter.quizName = new RegExp(quizName, 'i');
  }
  
  if (search) {
    filter.$or = [
      { studentName: new RegExp(search, 'i') },
      { quizName: new RegExp(search, 'i') },
      { notes: new RegExp(search, 'i') }
    ];
  }

  // Execute query with pagination
  const grades = await OfflineGrade.find(filter)
    .populate('groupId', 'name')
    .populate('uploadedBy', 'fullName')
    .sort({ gradeDate: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const total = await OfflineGrade.countDocuments(filter);

  res.status(200).json(new ApiResponse(200, {
    data: grades,
    pagination: {
      current: page,
      pages: Math.ceil(total / limit),
      total
    }
  }, 'تم جلب الدرجات بنجاح'));
});

// CRUD: Get Grade by ID
export const getGradeById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const grade = await OfflineGrade.findById(id)
    .populate('groupId', 'name description')
    .populate('uploadedBy', 'fullName')
    .populate('modifiedBy', 'fullName');

  if (!grade) {
    throw new ApiError(404, 'الدرجة غير موجودة');
  }

  res.status(200).json(new ApiResponse(200, grade, 'تم جلب الدرجة بنجاح'));
});

// CRUD: Update Grade
export const updateGrade = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { studentName, groupId, quizName, score, notes, maxScore } = req.body;
  const modifiedBy = req.user.id;

  const grade = await OfflineGrade.findById(id);
  if (!grade) {
    throw new ApiError(404, 'الدرجة غير موجودة');
  }

  // Validate score if provided
  if (score !== undefined) {
    const maxScoreValue = maxScore || grade.maxScore || 100;
    if (score < 0 || score > maxScoreValue) {
      throw new ApiError(400, `الدرجة يجب أن تكون بين 0 و ${maxScoreValue}`);
    }
  }

  // Check if changing group
  if (groupId && groupId !== grade.groupId.toString()) {
    const group = await Group.findById(groupId);
    if (!group) {
      throw new ApiError(404, 'Group not found');
    }
    grade.groupName = group.name;
  }

  // Update fields
  if (studentName) grade.studentName = studentName.trim();
  if (groupId) grade.groupId = groupId;
  if (quizName) grade.quizName = quizName.trim();
  if (score !== undefined) grade.score = parseFloat(score);
  if (maxScore !== undefined) grade.maxScore = parseFloat(maxScore);
  if (notes !== undefined) grade.notes = notes.trim();
  grade.modifiedBy = modifiedBy;

  await grade.save();

  const updatedGrade = await OfflineGrade.findById(id)
    .populate('groupId', 'name')
    .populate('uploadedBy', 'fullName')
    .populate('modifiedBy', 'fullName');

  res.status(200).json(new ApiResponse(200, updatedGrade, 'تم تحديث الدرجة بنجاح'));
});

// CRUD: Delete Grade
export const deleteGrade = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const grade = await OfflineGrade.findById(id);
  if (!grade) {
    throw new ApiError(404, 'الدرجة غير موجودة');
  }

  // Soft delete
  grade.status = 'deleted';
  grade.modifiedBy = req.user.id;
  await grade.save();

  res.status(200).json(new ApiResponse(200, null, 'تم حذف الدرجة بنجاح'));
});

// Download Template
export const downloadTemplate = asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const group = await Group.findById(groupId).populate('students', 'fullName email');
  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  // Create Excel workbook
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('قالب الدرجات');

  // Set RTL
  worksheet.views = [{ rightToLeft: true }];

  // Headers
  const headers = ['اسم الطالب', 'الدرجة', 'الدرجة القصوى', 'ملاحظات'];
  worksheet.addRow(headers);

  // Style headers
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: 'FFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '1976D2' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      left: { style: 'thin' },
      bottom: { style: 'thin' },
      right: { style: 'thin' }
    };
  });

  // Add students
  if (group.students && group.students.length > 0) {
    group.students.forEach((student, index) => {
      const row = worksheet.addRow([
        student.fullName,
        '', // Empty for grade input
        100, // Default max score
        '' // Empty for notes
      ]);

      // Style data rows
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        if (colNumber === 1 || colNumber === 4) { // Name and notes
          cell.alignment = { horizontal: 'right' };
        } else { // Scores
          cell.alignment = { horizontal: 'center' };
        }
      });
    });
  } else {
    // Add sample rows if no students
    for (let i = 1; i <= 10; i++) {
      const row = worksheet.addRow([`طالب ${i}`, '', 100, '']);
      row.eachCell((cell, colNumber) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
        
        if (colNumber === 1 || colNumber === 4) {
          cell.alignment = { horizontal: 'right' };
        } else {
          cell.alignment = { horizontal: 'center' };
        }
      });
    }
  }

  // Set column widths
  worksheet.columns = [
    { width: 25 }, // Student name
    { width: 15 }, // Grade
    { width: 15 }, // Max score
    { width: 30 }  // Notes
  ];

  // Set response headers
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="template_${group.name}_grades.xlsx"`);

  // Send file
  await workbook.xlsx.write(res);
  res.end();
});

// Upload Grades from Excel
export const uploadGradesFromExcel = asyncHandler(async (req, res) => {
  console.log('=== uploadGradesFromExcel called ===');
  console.log('Request body:', req.body);
  console.log('Request file:', req.file ? {
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    buffer: req.file.buffer ? 'Buffer exists' : 'No buffer'
  } : 'No file');
  console.log('User object:', JSON.stringify(req.user, null, 2));
  console.log('User fields:', {
    id: req.user?.id,
    fullName: req.user?.fullName,
    email: req.user?.email
  });
  
  const { groupId, quizName } = req.body;
  const uploadedBy = req.user.id;
  const uploadedByName = req.user.fullName || req.user.email || 'Unknown user';

  if (!req.file) {
    throw new ApiError(400, 'No file uploaded');
  }

  if (!groupId || !quizName) {
    throw new ApiError(400, 'Group ID and quiz name are required');
  }

  if (!uploadedByName || uploadedByName === 'Unknown user') {
    console.warn('User name not found, using fallback:', { user: req.user });
  }

  console.log('Processing file for group:', groupId, 'quiz:', quizName, 'uploadedBy:', uploadedByName);

  const group = await Group.findById(groupId);
  if (!group) {
    throw new ApiError(404, 'Group not found');
  }

  try {
    // Read Excel file
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const worksheet = workbook.getWorksheet(1);

    if (!worksheet) {
      throw new ApiError(400, 'الملف لا يحتوي على ورقة عمل صالحة');
    }

    const grades = [];
    const errors = [];

    // Process rows (skip header)
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const studentName = row.getCell(1).value?.toString()?.trim();
      const score = parseFloat(row.getCell(2).value);
      const maxScore = parseFloat(row.getCell(3).value) || 100;
      const notes = row.getCell(4).value?.toString()?.trim() || '';

      if (!studentName) {
        errors.push(`الصف ${rowNumber}: اسم الطالب مطلوب`);
        return;
      }

      if (isNaN(score) || score < 0 || score > maxScore) {
        errors.push(`الصف ${rowNumber}: درجة غير صالحة لـ ${studentName}`);
        return;
      }

      grades.push({
        studentName,
        groupId,
        groupName: group.name,
        quizName: quizName.trim(),
        score,
        maxScore,
        notes,
        uploadedBy,
        uploadedByName,
        uploadMethod: 'excel_upload',
        originalFileName: req.file.originalname
      });
    });

    if (errors.length > 0) {
      throw new ApiError(400, `أخطاء في الملف: ${errors.join(', ')}`);
    }

    if (grades.length === 0) {
      throw new ApiError(400, 'لا توجد درجات صالحة في الملف');
    }

    // Check for existing grades
    const existingGrades = await OfflineGrade.find({
      groupId,
      quizName: quizName.trim(),
      studentName: { $in: grades.map(g => g.studentName) }
    });

    if (existingGrades.length > 0) {
      const existingNames = existingGrades.map(g => g.studentName);
      throw new ApiError(400, `درجات موجودة مسبقاً للطلاب: ${existingNames.join(', ')}`);
    }

    // Insert grades
    const insertedGrades = await OfflineGrade.insertMany(grades);

    res.status(201).json(new ApiResponse(201, {
      insertedCount: insertedGrades.length,
      grades: insertedGrades
    }, `تم رفع ${insertedGrades.length} درجة بنجاح`));

  } catch (error) {
    console.error('Error in uploadGradesFromExcel:', error);
    console.error('Error stack:', error.stack);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Handle specific ExcelJS errors
    if (error.message && error.message.includes('Excel')) {
      throw new ApiError(400, `خطأ في قراءة ملف Excel: ${error.message}`);
    }
    
    // Handle database errors
    if (error.code === 11000) {
      throw new ApiError(400, 'يوجد تكرار في البيانات، تأكد من عدم وجود درجات مكررة');
    }
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      throw new ApiError(400, `أخطاء في التحقق من البيانات: ${validationErrors.join(', ')}`);
    }
    
    // Generic error with more details
    throw new ApiError(500, `خطأ في معالجة ملف Excel: ${error.message || 'خطأ غير معروف'}`);
  }
});

// Get Offline Files
export const getOfflineFiles = asyncHandler(async (req, res) => {
  try {
    console.log('Fetching offline files...');
    
    // First check if there are any documents with the required fields
    const count = await OfflineGrade.countDocuments({
      uploadMethod: 'excel_upload',
      originalFileName: { $exists: true, $ne: null }
    });
    
    console.log(`Found ${count} documents with excel_upload method`);
    
    if (count === 0) {
      console.log('No files found, returning empty array');
      return res.status(200).json(new ApiResponse(200, [], 'لا توجد ملفات مرفوعة بعد'));
    }

    const files = await OfflineGrade.aggregate([
      {
        $match: {
          uploadMethod: 'excel_upload',
          originalFileName: { $exists: true, $ne: null }
        }
      },
      {
        $group: {
          _id: {
            fileName: '$originalFileName',
            groupId: '$groupId',
            quizName: '$quizName',
            uploadedBy: '$uploadedBy'
          },
          originalName: { $first: '$originalFileName' },
          groupName: { $first: { $ifNull: ['$groupName', 'غير محدد'] } },
          quizName: { $first: { $ifNull: ['$quizName', 'غير محدد'] } },
          uploadedBy: { $first: '$uploadedBy' },
          uploadedByName: { $first: { $ifNull: ['$uploadedByName', 'غير محدد'] } },
          uploadedAt: { $first: '$createdAt' },
          gradesCount: { $sum: 1 },
          status: { $first: 'processed' }
        }
      },
      {
        $sort: { uploadedAt: -1 }
      }
    ]);

    console.log(`Successfully aggregated ${files.length} files`);
    res.status(200).json(new ApiResponse(200, files, 'تم جلب الملفات بنجاح'));
  } catch (error) {
    console.error('Error in getOfflineFiles:', error);
    console.error('Error stack:', error.stack);
    
    // Try a simpler approach if aggregation fails
    try {
      console.log('Trying simpler query approach...');
      const simpleFiles = await OfflineGrade.find({
        uploadMethod: 'excel_upload',
        originalFileName: { $exists: true, $ne: null }
      }).select('originalFileName groupName quizName uploadedByName createdAt')
        .sort({ createdAt: -1 })
        .limit(100);
      
      const formattedFiles = simpleFiles.map(file => ({
        _id: file._id,
        originalName: file.originalFileName,
        groupName: file.groupName || 'غير محدد',
        quizName: file.quizName || 'غير محدد',
        uploadedByName: file.uploadedByName || 'غير محدد',
        uploadedAt: file.createdAt,
        gradesCount: 1,
        status: 'processed'
      }));
      
      console.log(`Returning ${formattedFiles.length} files with simple query`);
      return res.status(200).json(new ApiResponse(200, formattedFiles, 'تم جلب الملفات بنجاح'));
    } catch (fallbackError) {
      console.error('Fallback query also failed:', fallbackError);
      // Return empty array as last resort
      res.status(200).json(new ApiResponse(200, [], 'تم جلب الملفات بنجاح'));
    }
  }
});

// Get Grades Statistics
export const getGradesStatistics = asyncHandler(async (req, res) => {
  const { groupId, quizName } = req.query;

  const filter = { status: 'active' };
  if (groupId) filter.groupId = groupId;
  if (quizName) filter.quizName = new RegExp(quizName, 'i');

  const stats = await OfflineGrade.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        totalGrades: { $sum: 1 },
        averageScore: { $avg: '$score' },
        highestScore: { $max: '$score' },
        lowestScore: { $min: '$score' },
        excellentCount: {
          $sum: {
            $cond: [{ $gte: ['$percentage', 90] }, 1, 0]
          }
        },
        goodCount: {
          $sum: {
            $cond: [
              { $and: [{ $gte: ['$percentage', 70] }, { $lt: ['$percentage', 90] }] },
              1, 0
            ]
          }
        },
        passCount: {
          $sum: {
            $cond: [
              { $and: [{ $gte: ['$percentage', 60] }, { $lt: ['$percentage', 70] }] },
              1, 0
            ]
          }
        },
        failCount: {
          $sum: {
            $cond: [{ $lt: ['$percentage', 60] }, 1, 0]
          }
        }
      }
    }
  ]);

  const result = stats[0] || {
    totalGrades: 0,
    averageScore: 0,
    highestScore: 0,
    lowestScore: 0,
    excellentCount: 0,
    goodCount: 0,
    passCount: 0,
    failCount: 0
  };

  res.status(200).json(new ApiResponse(200, result, 'تم جلب الإحصائيات بنجاح'));
});

// Bulk Delete Grades
export const bulkDeleteGrades = asyncHandler(async (req, res) => {
  const { gradeIds } = req.body;

  if (!Array.isArray(gradeIds) || gradeIds.length === 0) {
    throw new ApiError(400, 'معرفات الدرجات مطلوبة');
  }

  const result = await OfflineGrade.updateMany(
    { _id: { $in: gradeIds } },
    { 
      status: 'deleted',
      modifiedBy: req.user.id,
      lastModified: new Date()
    }
  );

  res.status(200).json(new ApiResponse(200, {
    deletedCount: result.modifiedCount
  }, `تم حذف ${result.modifiedCount} درجة بنجاح`));
});

// Get grades by student name
export const getGradesByStudentName = asyncHandler(async (req, res) => {
  const { studentName } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!studentName) {
    throw new ApiError(400, 'اسم الطالب مطلوب');
  }

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort: { gradeDate: -1 },
    populate: [
      { path: 'groupId', select: 'name' },
      { path: 'uploadedBy', select: 'fullName' }
    ]
  };

  const query = {
    studentName: studentName,
    status: 'active'
  };

  const grades = await OfflineGrade.paginate(query, options);

  res.status(200).json(new ApiResponse(200, grades, 'تم جلب الدرجات بنجاح'));
});
