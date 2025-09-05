import Draft from '../models/draft.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

// Create or update draft for a user/lesson/type
export const upsertDraft = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { courseId, unitId, lessonId, type } = req.params;
    const { data } = req.body;
    if (!data) return next(new ApiError('Missing draft data', 400));

    const filter = { user: userId, course: courseId, unit: unitId || null, lesson: lessonId, type };
    const update = { $set: { data, status: 'draft' } };
    const options = { upsert: true, new: true, setDefaultsOnInsert: true };

    const draft = await Draft.findOneAndUpdate(filter, update, options);
    return res.json(new ApiResponse(200, draft, 'Draft saved'));
  } catch (err) {
    return next(new ApiError(err.message || 'Failed to save draft', 500));
  }
};

// Get drafts for a user/lesson/type
export const getDrafts = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { courseId, unitId, lessonId, type } = req.params;
    const drafts = await Draft.find({
      user: userId,
      course: courseId,
      unit: unitId || null,
      lesson: lessonId,
      ...(type ? { type } : {})
    }).sort({ updatedAt: -1 });
    return res.json(new ApiResponse(200, drafts, 'Drafts loaded'));
  } catch (err) {
    return next(new ApiError(err.message || 'Failed to load drafts', 500));
  }
};

// Delete a draft by id
export const deleteDraft = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const { draftId } = req.params;
    const draft = await Draft.findOne({ _id: draftId, user: userId });
    if (!draft) return next(new ApiError('Draft not found', 404));
    await draft.deleteOne();
    return res.json(new ApiResponse(200, { _id: draftId }, 'Draft deleted'));
  } catch (err) {
    return next(new ApiError(err.message || 'Failed to delete draft', 500));
  }
};


