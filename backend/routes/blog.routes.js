import { Router } from "express";
import { 
    getAllBlogs, 
    getAllBlogsForAdmin,
    getBlogById, 
    createBlog, 
    updateBlog, 
    deleteBlog, 
    likeBlog 
} from '../controllers/blog.controller.js';
import { isLoggedIn, authorisedRoles } from "../middleware/auth.middleware.js";
import upload from '../middleware/multer.middleware.js';

const router = Router();

// Public routes
router.get('/blogs', getAllBlogs);
router.get('/blogs/:id', getBlogById);
router.post('/blogs/:id/like', likeBlog);

// Protected routes (Admin only)
router.get('/admin/blogs', isLoggedIn, authorisedRoles("ADMIN", "SUPER_ADMIN"), getAllBlogsForAdmin);
router.post('/blogs', isLoggedIn, authorisedRoles("ADMIN", "SUPER_ADMIN"), upload.single("image"), createBlog);
router.put('/blogs/:id', isLoggedIn, authorisedRoles("ADMIN", "SUPER_ADMIN"), upload.single("image"), updateBlog);
router.delete('/blogs/:id', isLoggedIn, authorisedRoles("ADMIN", "SUPER_ADMIN"), deleteBlog);

export default router; 