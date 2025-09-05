import { Router } from "express";
import {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  addStudentToGroup,
  removeStudentFromGroup,
  getGroupsStats
} from "../controllers/group.controller.js";
import { isLoggedIn } from "../middleware/auth.middleware.js";
import { checkDeviceAuthorization } from "../middleware/deviceAuth.middleware.js";
import { logDeviceAccess } from "../middleware/deviceAuth.middleware.js";

const router = Router();

// Apply authentication and device authorization to all routes
router.use(isLoggedIn);
router.use(checkDeviceAuthorization);
router.use(logDeviceAccess);

// Group management routes
router.route("/")
  .post(createGroup)      // Create new group
  .get(getAllGroups);     // Get all groups with pagination

router.route("/stats")
  .get(getGroupsStats);   // Get groups statistics

router.route("/:id")
  .get(getGroupById)      // Get group by ID
  .put(updateGroup)       // Update group
  .delete(deleteGroup);   // Delete group

router.route("/:id/students")
  .post(addStudentToGroup)        // Add student to group
  .delete(removeStudentFromGroup); // Remove student from group

export default router;
