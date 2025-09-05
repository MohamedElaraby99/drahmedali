import Center from '../models/center.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Get all centers (with optional filtering)
export const getAllCenters = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 10, 
    search = '', 
    isActive,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  // Build sort object
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query with pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const [centers, total] = await Promise.all([
    Center.find(query)
      .populate('createdBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit)),
    Center.countDocuments(query)
  ]);

  const totalPages = Math.ceil(total / parseInt(limit));

  return res.status(200).json(new ApiResponse(200, {
    centers,
    pagination: {
      currentPage: parseInt(page),
      totalPages,
      totalItems: total,
      itemsPerPage: parseInt(limit),
      hasNextPage: parseInt(page) < totalPages,
      hasPrevPage: parseInt(page) > 1
    }
  }, 'Centers retrieved successfully'));
});

// Get active centers only (for public use, like signup)
export const getActiveCenters = asyncHandler(async (req, res) => {
  const centers = await Center.find({ isActive: true })
    .select('name location description')
    .sort({ name: 1 });

  return res.status(200).json(new ApiResponse(200, { centers }, 'Active centers retrieved successfully'));
});

// Get center by ID
export const getCenterById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const center = await Center.findById(id).populate('createdBy', 'name email');

  if (!center) {
    throw new ApiError(404, 'Center not found');
  }

  return res.status(200).json(new ApiResponse(200, { center }, 'Center retrieved successfully'));
});

// Create new center
export const createCenter = asyncHandler(async (req, res) => {
  const { name, description, location, phone, email, capacity } = req.body;
  const userId = req.user.id;

  // Check if center with same name already exists
  const existingCenter = await Center.findOne({ 
    name: { $regex: new RegExp(`^${name}$`, 'i') } 
  });

  if (existingCenter) {
    throw new ApiError(400, 'Center with this name already exists');
  }

  const center = await Center.create({
    name,
    description,
    location,
    phone,
    email,
    capacity: capacity || 0,
    createdBy: userId
  });

  const createdCenter = await Center.findById(center._id).populate('createdBy', 'name email');

  return res.status(201).json(new ApiResponse(201, { center: createdCenter }, 'Center created successfully'));
});

// Update center
export const updateCenter = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, description, location, phone, email, capacity, isActive } = req.body;

  const center = await Center.findById(id);

  if (!center) {
    throw new ApiError(404, 'Center not found');
  }

  // Check if center with same name already exists (excluding current center)
  if (name && name !== center.name) {
    const existingCenter = await Center.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: id }
    });

    if (existingCenter) {
      throw new ApiError(400, 'Center with this name already exists');
    }
  }

  // Update fields
  if (name !== undefined) center.name = name;
  if (description !== undefined) center.description = description;
  if (location !== undefined) center.location = location;
  if (phone !== undefined) center.phone = phone;
  if (email !== undefined) center.email = email;
  if (capacity !== undefined) center.capacity = capacity;
  if (isActive !== undefined) center.isActive = isActive;

  await center.save();

  const updatedCenter = await Center.findById(center._id).populate('createdBy', 'name email');

  return res.status(200).json(new ApiResponse(200, { center: updatedCenter }, 'Center updated successfully'));
});

// Delete center
export const deleteCenter = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const center = await Center.findById(id);

  if (!center) {
    throw new ApiError(404, 'Center not found');
  }

  await Center.findByIdAndDelete(id);

  return res.status(200).json(new ApiResponse(200, { id }, 'Center deleted successfully'));
});

// Bulk delete centers
export const bulkDeleteCenters = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(400, 'Please provide an array of center IDs');
  }

  const result = await Center.deleteMany({ _id: { $in: ids } });

  return res.status(200).json(new ApiResponse(200, { 
    deletedCount: result.deletedCount 
  }, `${result.deletedCount} centers deleted successfully`));
});

// Toggle center active status
export const toggleCenterStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const center = await Center.findById(id);

  if (!center) {
    throw new ApiError(404, 'Center not found');
  }

  center.isActive = !center.isActive;
  await center.save();

  const updatedCenter = await Center.findById(center._id).populate('createdBy', 'name email');

  return res.status(200).json(new ApiResponse(200, { 
    center: updatedCenter 
  }, `Center ${center.isActive ? 'activated' : 'deactivated'} successfully`));
});

// Get centers statistics
export const getCentersStats = asyncHandler(async (req, res) => {
  const [
    totalCenters,
    activeCenters,
    inactiveCenters,
    totalCapacity
  ] = await Promise.all([
    Center.countDocuments(),
    Center.countDocuments({ isActive: true }),
    Center.countDocuments({ isActive: false }),
    Center.aggregate([
      { $group: { _id: null, totalCapacity: { $sum: '$capacity' } } }
    ])
  ]);

  return res.status(200).json(new ApiResponse(200, {
    stats: {
      totalCenters,
      activeCenters,
      inactiveCenters,
      totalCapacity: totalCapacity[0]?.totalCapacity || 0
    }
  }, 'Centers statistics retrieved successfully'));
});
