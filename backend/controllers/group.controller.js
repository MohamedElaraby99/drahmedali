import Group from "../models/group.model.js";
import User from "../models/user.model.js";
import Instructor from "../models/instructor.model.js";
import Subject from "../models/subject.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create a new group
export const createGroup = asyncHandler(async (req, res) => {
  const {
    name,
    instructor,
    price,
    maxStudents,
    monthlyPayment,
    weeklySchedule,
    subjects,
    description
  } = req.body;

  // Check if group name already exists
  const existingGroup = await Group.findOne({ name });
  if (existingGroup) {
    throw new ApiError(400, "اسم المجموعة موجود بالفعل");
  }

  // Verify instructor exists
  const instructorUser = await Instructor.findById(instructor);
  if (!instructorUser) {
    throw new ApiError(404, "المدرس غير موجود");
  }
  if (!instructorUser.isActive) {
    throw new ApiError(400, "المدرس غير نشط");
  }

  // Verify subjects exist if provided
  if (subjects && subjects.length > 0) {
    const existingSubjects = await Subject.find({ _id: { $in: subjects } });
    if (existingSubjects.length !== subjects.length) {
      throw new ApiError(400, "بعض المواد المحددة غير موجودة");
    }
  }

  const group = await Group.create({
    name,
    instructor,
    price,
    maxStudents: maxStudents || 15,
    monthlyPayment: monthlyPayment || { enabled: false, price: null, dueDay: 1 },
    weeklySchedule: weeklySchedule || {
      saturday: { enabled: false, timeSlots: [] },
      sunday: { enabled: false, timeSlots: [] },
      monday: { enabled: false, timeSlots: [] },
      tuesday: { enabled: false, timeSlots: [] },
      wednesday: { enabled: false, timeSlots: [] },
      thursday: { enabled: false, timeSlots: [] },
      friday: { enabled: false, timeSlots: [] }
    },
    subjects: subjects || [],
    description,
    createdBy: req.user.id
  });

  // Populate the instructor information
  await group.populate('instructor', 'name email bio specialization experience');

  res.status(201).json(
    new ApiResponse(201, group, "تم إنشاء المجموعة بنجاح")
  );
});

// Get all groups with pagination and filtering
export const getAllGroups = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search,
    instructor,
    status,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (instructor) {
    query.instructor = instructor;
  }
  
  if (status) {
    query.status = status;
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  const options = {
    page: parseInt(page),
    limit: parseInt(limit),
    sort,
    populate: [
      { path: 'instructor', select: 'name email bio specialization experience' },
      { path: 'subjects', select: 'name description' },
      { path: 'students', select: 'fullName email phoneNumber' },
      { path: 'createdBy', select: 'fullName' }
    ]
  };

  const groups = await Group.paginate(query, options);

  res.status(200).json(
    new ApiResponse(200, groups, "تم جلب المجموعات بنجاح")
  );
});

// Get group by ID
export const getGroupById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const group = await Group.findById(id)
    .populate('instructor', 'name email bio specialization experience')
    .populate('subjects', 'name description')
    .populate('students', 'fullName email phoneNumber')
    .populate('createdBy', 'fullName');

  if (!group) {
    throw new ApiError(404, "المجموعة غير موجودة");
  }

  res.status(200).json(
    new ApiResponse(200, group, "تم جلب المجموعة بنجاح")
  );
});

// Update group
export const updateGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  // Check if group exists
  const existingGroup = await Group.findById(id);
  if (!existingGroup) {
    throw new ApiError(404, "المجموعة غير موجودة");
  }

  // Check if new name conflicts with existing groups (excluding current group)
  if (updateData.name && updateData.name !== existingGroup.name) {
    const nameConflict = await Group.findOne({ 
      name: updateData.name, 
      _id: { $ne: id } 
    });
    if (nameConflict) {
      throw new ApiError(400, "اسم المجموعة موجود بالفعل");
    }
  }

  // Verify instructor if provided
  if (updateData.instructor) {
    const instructorUser = await Instructor.findById(updateData.instructor);
    if (!instructorUser) {
      throw new ApiError(404, "المدرس غير موجود");
    }
    if (!instructorUser.isActive) {
      throw new ApiError(400, "المدرس غير نشط");
    }
  }

  // Verify subjects if provided
  if (updateData.subjects && updateData.subjects.length > 0) {
    const existingSubjects = await Subject.find({ _id: { $in: updateData.subjects } });
    if (existingSubjects.length !== updateData.subjects.length) {
      throw new ApiError(400, "بعض المواد المحددة غير موجودة");
    }
  }

  const updatedGroup = await Group.findByIdAndUpdate(
    id,
    updateData,
    { new: true, runValidators: true }
  ).populate('instructor', 'name email bio specialization experience')
   .populate('subjects', 'name description')
   .populate('students', 'fullName email phoneNumber')
   .populate('createdBy', 'fullName');

  res.status(200).json(
    new ApiResponse(200, updatedGroup, "تم تحديث المجموعة بنجاح")
  );
});

// Delete group
export const deleteGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const group = await Group.findById(id);
  if (!group) {
    throw new ApiError(404, "المجموعة غير موجودة");
  }

  // Check if group has students
  if (group.currentStudents > 0) {
    throw new ApiError(400, "لا يمكن حذف المجموعة لوجود طلاب مسجلين فيها");
  }

  await Group.findByIdAndDelete(id);

  res.status(200).json(
    new ApiResponse(200, null, "تم حذف المجموعة بنجاح")
  );
});

// Add student to group
export const addStudentToGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { studentId } = req.body;

  const group = await Group.findById(id);
  if (!group) {
    throw new ApiError(404, "المجموعة غير موجودة");
  }

  // Check if group is full
  if (group.currentStudents >= group.maxStudents) {
    throw new ApiError(400, "المجموعة ممتلئة");
  }

  // Verify student exists
  const student = await User.findById(studentId);
  if (!student) {
    throw new ApiError(404, "الطالب غير موجود");
  }
  if (student.role !== 'USER') {
    throw new ApiError(400, "المستخدم المحدد ليس طالب");
  }

  // Check if student is already in the group
  if (group.students.includes(studentId)) {
    throw new ApiError(400, "الطالب مسجل بالفعل في هذه المجموعة");
  }

  // Add student to group
  group.students.push(studentId);
  group.currentStudents += 1;
  await group.save();

  // Populate the updated group
  await group.populate('instructor', 'name email bio specialization experience');
  await group.populate('students', 'fullName email phoneNumber');

  res.status(200).json(
    new ApiResponse(200, group, "تم إضافة الطالب للمجموعة بنجاح")
  );
});

// Remove student from group
export const removeStudentFromGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { studentId } = req.body;

  const group = await Group.findById(id);
  if (!group) {
    throw new ApiError(404, "المجموعة غير موجودة");
  }

  // Check if student is in the group
  if (!group.students.includes(studentId)) {
    throw new ApiError(400, "الطالب غير مسجل في هذه المجموعة");
  }

  // Remove student from group
  group.students = group.students.filter(id => id.toString() !== studentId);
  group.currentStudents = Math.max(0, group.currentStudents - 1);
  await group.save();

  // Populate the updated group
  await group.populate('instructor', 'name email bio specialization experience');
  await group.populate('students', 'fullName email phoneNumber');

  res.status(200).json(
    new ApiResponse(200, group, "تم إزالة الطالب من المجموعة بنجاح")
  );
});

// Get groups statistics
export const getGroupsStats = asyncHandler(async (req, res) => {
  const totalGroups = await Group.countDocuments();
  const activeGroups = await Group.countDocuments({ status: 'active' });
  const inactiveGroups = await Group.countDocuments({ status: 'inactive' });
  const completedGroups = await Group.countDocuments({ status: 'completed' });
  
  const totalStudents = await Group.aggregate([
    { $group: { _id: null, total: { $sum: '$currentStudents' } } }
  ]);

  const averageStudentsPerGroup = totalStudents.length > 0 
    ? Math.round(totalStudents[0].total / totalGroups * 100) / 100 
    : 0;

  const stats = {
    totalGroups,
    activeGroups,
    inactiveGroups,
    completedGroups,
    totalStudents: totalStudents.length > 0 ? totalStudents[0].total : 0,
    averageStudentsPerGroup
  };

  res.status(200).json(
    new ApiResponse(200, stats, "تم جلب إحصائيات المجموعات بنجاح")
  );
});

