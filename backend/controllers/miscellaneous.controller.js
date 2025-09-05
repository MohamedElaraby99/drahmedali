import AppError from '../utils/error.utils.js';
import sendEmail from '../utils/sendEmail.js';
import userModel from '../models/user.model.js';
import courseModel from '../models/course.model.js';

const contactUs = async (req, res, next) => {
    const { name, email, message} = req.body;

    if (!name || !email || !message) {
        return next(new AppError("All fields are required", 400));
    }

    try {
        const emailMessage = `Name: ${name}\nEmail: ${email}\nMessage: ${message}`;

        // Send email to the organization
        await sendEmail(
            process.env.CONTACT_US_EMAIL,
            "Contact Us",
            emailMessage,
        );

        // Send confirmation email to the user
        const userMessage = `Hello ${name},\n\nThank you for contacting us! We have received your message and will get in touch with you soon.\n\nBest regards,\nThe api Team 😊`;

        await sendEmail(
            email,
            'Thank You for Contacting Us',
            userMessage,
        );

        res.status(200).json({
            success: true,
            message: "Thanks for contacting. We have sent you a confirmation email and will get in touch with you soon.",
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};


const stats = async (req, res, next) => {
    try {
        // Get all users
        const allUsers = await userModel.find({});
        const allUsersCount = allUsers.length;
        const subscribedUsersCount = allUsers.filter((user) => user.subscription?.status === 'active').length;
        
        // Get all courses and calculate total lessons
        const allCourses = await courseModel.find({});
        const totalCourses = allCourses.length;
        
        // Calculate total lessons from both units and direct lessons
        let totalLectures = 0;
        allCourses.forEach(course => {
            // Count direct lessons
            totalLectures += course.directLessons ? course.directLessons.length : 0;
            
            // Count lessons in units
            if (course.units && course.units.length > 0) {
                course.units.forEach(unit => {
                    totalLectures += unit.lessons ? unit.lessons.length : 0;
                });
            }
        });
        
        // Since purchases are removed, we'll track wallet transactions instead
        const totalPayments = 0; // No payments since purchases are removed
        const totalRevenue = 0; // No revenue since purchases are removed
        
        // Monthly data is empty since no payments
        const monthlySalesData = new Array(12).fill(0);
        
        // No recent payments since purchases are removed
        const recentPayments = [];

        // Recent courses (actual courses)
        const recentCourses = await courseModel.find({})
            .populate('instructor', 'name')
            .populate('stage', 'name')
            .populate('subject', 'name')
            .sort({ createdAt: -1 })
            .limit(5)
            .then(courses => courses.map(course => ({
                id: course._id,
                title: course.title,
                description: course.description,
                instructor: course.instructor?.name || 'Unknown Instructor',
                stage: course.stage?.name || 'Unknown Stage',
                subject: course.subject?.name || 'Unknown Subject',
                date: course.createdAt,
                lessonsCount: (course.directLessons ? course.directLessons.length : 0) + 
                             (course.units ? course.units.reduce((sum, unit) => sum + (unit.lessons ? unit.lessons.length : 0), 0) : 0)
            })));
 
        res.status(200).json({
            success: true,
            message: 'Stats retrieved successfully with actual real data',
            allUsersCount,
            subscribedUsersCount,
            totalCourses,
            totalLectures,
            totalPayments,
            totalRevenue,
            monthlySalesData,
            recentPayments,
            recentCourses
        })
    } catch (e) {
        return next(new AppError(e.message, 500));
    }
}

export { contactUs, stats };
