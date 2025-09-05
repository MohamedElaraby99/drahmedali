import blogModel from '../models/blog.model.js';
import AppError from '../utils/error.utils.js';
import fs from 'fs';
import path from 'path';


// Get all blogs (public - only published)
export const getAllBlogs = async (req, res, next) => {
    try {
        console.log('=== GET ALL BLOGS ===');
        
        // Check if blogModel is available
        if (!blogModel) {
            console.error('Blog model not available');
            return res.status(500).json({
                success: false,
                message: 'Database model not available'
            });
        }
        
        const { page = 1, limit = 10, category, search } = req.query;
        console.log('Query params:', { page, limit, category, search });
        
        let query = { status: 'published' };
        
        // Filter by category
        if (category) {
            query.category = category;
        }
        
        // Search functionality
        if (search) {
            query.$text = { $search: search };
        }
        
        console.log('Database query:', JSON.stringify(query, null, 2));
        
        const blogs = await blogModel.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
            
        const total = await blogModel.countDocuments(query);
        
        console.log(`Found ${blogs.length} blogs out of ${total} total`);
        
        res.status(200).json({
            success: true,
            message: 'Blogs fetched successfully',
            blogs,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (e) {
        console.error('❌ Error in getAllBlogs:', e);
        console.error('Error stack:', e.stack);
        
        // Return error response instead of crashing
        return res.status(500).json({
            success: false,
            message: 'Failed to fetch blogs',
            error: process.env.NODE_ENV === 'development' ? e.message : 'Internal server error'
        });
    }
};

// Get all blogs for admin (including drafts)
export const getAllBlogsForAdmin = async (req, res, next) => {
    try {
        const { page = 1, limit = 10, category, search, status } = req.query;
        
        let query = {};
        
        // Filter by status if provided
        if (status) {
            query.status = status;
        }
        
        // Filter by category
        if (category) {
            query.category = category;
        }
        
        // Search functionality
        if (search) {
            query.$text = { $search: search };
        }
        
        const blogs = await blogModel.find(query)
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .exec();
            
        const total = await blogModel.countDocuments(query);
        
        res.status(200).json({
            success: true,
            message: 'Blogs fetched successfully',
            blogs,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Get single blog by ID
export const getBlogById = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const blog = await blogModel.findById(id);
        
        if (!blog) {
            return next(new AppError('Blog not found', 404));
        }
        
        // Increment views
        blog.views += 1;
        await blog.save();
        
        res.status(200).json({
            success: true,
            message: 'Blog fetched successfully',
            blog
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Create new blog
export const createBlog = async (req, res, next) => {
    try {
        const { title, content, excerpt, category, tags, author, status } = req.body;
        
        if (!title || !content || !excerpt || !category || !author) {
            return next(new AppError('All required fields must be provided', 400));
        }
        
        const blogData = {
            title,
            content,
            excerpt,
            category,
            author,
            status: status || 'draft', // Default to draft if not specified
            tags: tags ? tags.split(',').map(tag => tag.trim()) : []
        };
        
        // Handle image upload
        if (req.file) {
            console.log('📸 Processing blog image upload:', req.file.filename);
            try {
                // Move file to uploads/blogs directory
                const uploadsDir = path.join('uploads', 'blogs');
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                }
                
                const destPath = path.join(uploadsDir, req.file.filename);
                fs.renameSync(req.file.path, destPath);
                
                // Store local file path in database
                blogData.image = {
                    public_id: req.file.filename,
                    secure_url: `/uploads/blogs/${req.file.filename}`
                };
                
                console.log('✅ Blog image saved locally:', destPath);
            } catch (e) {
                console.log('❌ Image upload error:', e.message);
                blogData.image = {
                    public_id: 'placeholder',
                    secure_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8dGV4dCB4PSI0MDAiIHk9IjIwMCIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjI0IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+CiAgICBCbG9nIEltYWdlCiAgPC90ZXh0Pgo8L3N2Zz4K'
                };
            }
        } else {
            // Set default placeholder image if no file uploaded
            console.log('No file uploaded, using default placeholder');
            blogData.image = {
                public_id: 'placeholder',
                secure_url: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8cmVjdCB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzRGNDZFNSIvPgogIDx0ZXh0IHg9IjQwMCIgeT0iMjAwIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj4KICAgIEJsb2cgSW1hZ2UKICA8L3RleHQ+Cjwvc3ZnPgo='
            };
        }
        
        console.log('Blog data before creation:', blogData);
        const blog = await blogModel.create(blogData);
        console.log('Blog created with image:', blog.image);
        
        res.status(201).json({
            success: true,
            message: 'Blog created successfully',
            blog
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Update blog
export const updateBlog = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, content, excerpt, category, tags, status } = req.body;
        
        const blog = await blogModel.findById(id);
        
        if (!blog) {
            return next(new AppError('Blog not found', 404));
        }
        
        // Update fields
        if (title) blog.title = title;
        if (content) blog.content = content;
        if (excerpt) blog.excerpt = excerpt;
        if (category) blog.category = category;
        if (tags) blog.tags = tags.split(',').map(tag => tag.trim());
        if (status) blog.status = status;
        
        // Handle image upload
        if (req.file) {
            try {
                console.log('📸 Processing blog image update:', req.file.filename);
                
                // Delete old image if exists (local file)
                if (blog.image.public_id && blog.image.public_id !== 'placeholder') {
                    const oldImagePath = path.join('uploads', 'blogs', blog.image.public_id);
                    if (fs.existsSync(oldImagePath)) {
                        fs.rmSync(oldImagePath);
                        console.log('🗑️ Deleted old blog image:', oldImagePath);
                    }
                }
                
                // Move new file to uploads/blogs directory
                const uploadsDir = path.join('uploads', 'blogs');
                if (!fs.existsSync(uploadsDir)) {
                    fs.mkdirSync(uploadsDir, { recursive: true });
                }
                
                const destPath = path.join(uploadsDir, req.file.filename);
                fs.renameSync(req.file.path, destPath);
                
                // Store local file path in database
                blog.image.public_id = req.file.filename;
                blog.image.secure_url = `/uploads/blogs/${req.file.filename}`;
                
                console.log('✅ Blog image updated locally:', destPath);
            } catch (e) {
                console.log('❌ Image upload error:', e.message);
                // Set local file path if upload fails
                blog.image.public_id = req.file.filename;
                blog.image.secure_url = `/uploads/blogs/${req.file.filename}`;
            }
        }
        
        await blog.save();
        
        res.status(200).json({
            success: true,
            message: 'Blog updated successfully',
            blog
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Delete blog
export const deleteBlog = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const blog = await blogModel.findById(id);
        
        if (!blog) {
            return next(new AppError('Blog not found', 404));
        }
        
        // Delete image from local storage if exists
        if (blog.image.public_id && blog.image.public_id !== 'placeholder') {
            try {
                const imagePath = path.join('uploads', 'blogs', blog.image.public_id);
                if (fs.existsSync(imagePath)) {
                    fs.rmSync(imagePath);
                    console.log('🗑️ Deleted blog image from local storage:', imagePath);
                }
            } catch (e) {
                console.log('Error deleting image:', e.message);
            }
        }
        
        await blogModel.findByIdAndDelete(id);
        
        res.status(200).json({
            success: true,
            message: 'Blog deleted successfully'
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
};

// Like/Unlike blog
export const likeBlog = async (req, res, next) => {
    try {
        const { id } = req.params;
        
        const blog = await blogModel.findById(id);
        
        if (!blog) {
            return next(new AppError('Blog not found', 404));
        }
        
        blog.likes += 1;
        await blog.save();
        
        res.status(200).json({
            success: true,
            message: 'Blog liked successfully',
            likes: blog.likes
        });
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}; 