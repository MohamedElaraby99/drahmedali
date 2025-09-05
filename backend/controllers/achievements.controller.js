import { asyncHandler } from '../utils/asyncHandler.js';
import AppError from '../utils/error.utils.js';

// Get user achievements for student report
const getUserAchievements = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    try {
        // For now, return mock achievements data
        // In a real implementation, you would fetch from an Achievement model
        const mockAchievements = [
            {
                title: 'إنجاز ممتاز',
                description: 'حصل على درجة أعلى من 90% في الامتحان النهائي',
                date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
                type: 'academic'
            },
            {
                title: 'الحضور المثالي',
                description: 'حضر جميع الحصص في الشهر الماضي',
                date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
                type: 'attendance'
            },
            {
                title: 'المشاركة الفعالة',
                description: 'شارك بنشاط في المناقشات والأنشطة',
                date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000), // 21 days ago
                type: 'participation'
            }
        ];

        res.status(200).json({
            success: true,
            data: mockAchievements
        });
    } catch (error) {
        console.error('Error getting user achievements:', error);
        res.status(200).json({
            success: true,
            data: []
        });
    }
});

export {
    getUserAchievements
};
