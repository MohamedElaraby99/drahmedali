import AppError from "../utils/error.utils.js";
import WhatsAppService from "../models/whatsappService.model.js";

// Get all active WhatsApp services
const getAllServices = async (req, res, next) => {
    try {
        const services = await WhatsAppService.find({ isActive: true })
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "WhatsApp services retrieved successfully",
            data: {
                services,
                count: services.length
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get all services (admin only)
const getAllServicesAdmin = async (req, res, next) => {
    try {
        const services = await WhatsAppService.find()
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "All WhatsApp services retrieved successfully",
            data: {
                services,
                count: services.length
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get service by ID
const getServiceById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const service = await WhatsAppService.findById(id);

        if (!service) {
            return next(new AppError("Service not found", 404));
        }

        res.status(200).json({
            success: true,
            message: "Service retrieved successfully",
            data: {
                service
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Create new WhatsApp service
const createService = async (req, res, next) => {
    try {
        const {
            name,
            description,
            category,
            whatsappNumbers,
            currency,
            icon,
            instructions,
            estimatedResponseTime
        } = req.body;

        // Validate required fields
        if (!name || !description || !category || !whatsappNumbers) {
            return next(new AppError("Name, description, category, and WhatsApp numbers are required", 400));
        }

        // Validate WhatsApp numbers array
        if (!Array.isArray(whatsappNumbers) || whatsappNumbers.length === 0) {
            return next(new AppError("At least one WhatsApp number is required", 400));
        }

        // Validate each WhatsApp number
        for (const numberData of whatsappNumbers) {
            if (!numberData.number || !numberData.name) {
                return next(new AppError("Each WhatsApp number must have a number and name", 400));
            }
        }

        const service = await WhatsAppService.create({
            name,
            description,
            category,
            whatsappNumbers,
            currency: currency || 'EGP',
            icon: icon || '📞',
            instructions: instructions || 'Contact us on WhatsApp for this service',
            estimatedResponseTime: estimatedResponseTime || 'Within 24 hours'
        });

        res.status(201).json({
            success: true,
            message: "WhatsApp service created successfully",
            data: {
                service
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return next(new AppError("Service with this name already exists", 400));
        }
        return next(new AppError(error.message, 500));
    }
};

// Update WhatsApp service
const updateService = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const service = await WhatsAppService.findById(id);
        if (!service) {
            return next(new AppError("Service not found", 404));
        }

        // If updating WhatsApp numbers, validate them
        if (updateData.whatsappNumbers) {
            if (!Array.isArray(updateData.whatsappNumbers) || updateData.whatsappNumbers.length === 0) {
                return next(new AppError("At least one WhatsApp number is required", 400));
            }

            for (const numberData of updateData.whatsappNumbers) {
                if (!numberData.number || !numberData.name) {
                    return next(new AppError("Each WhatsApp number must have a number and name", 400));
                }
            }
        }



        const updatedService = await WhatsAppService.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Service updated successfully",
            data: {
                service: updatedService
            }
        });
    } catch (error) {
        if (error.code === 11000) {
            return next(new AppError("Service with this name already exists", 400));
        }
        return next(new AppError(error.message, 500));
    }
};

// Delete WhatsApp service
const deleteService = async (req, res, next) => {
    try {
        const { id } = req.params;
        const service = await WhatsAppService.findById(id);

        if (!service) {
            return next(new AppError("Service not found", 404));
        }

        await WhatsAppService.findByIdAndDelete(id);

        res.status(200).json({
            success: true,
            message: "Service deleted successfully"
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Toggle service active status
const toggleServiceStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const service = await WhatsAppService.findById(id);

        if (!service) {
            return next(new AppError("Service not found", 404));
        }

        service.isActive = !service.isActive;
        await service.save();

        res.status(200).json({
            success: true,
            message: `Service ${service.isActive ? 'activated' : 'deactivated'} successfully`,
            data: {
                service
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Add WhatsApp number to existing service
const addWhatsAppNumber = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { number, name, workingHours } = req.body;

        if (!number || !name) {
            return next(new AppError("Number and name are required", 400));
        }

        const service = await WhatsAppService.findById(id);
        if (!service) {
            return next(new AppError("Service not found", 404));
        }

        service.whatsappNumbers.push({
            number,
            name,
            workingHours: workingHours || '24/7'
        });

        await service.save();

        res.status(200).json({
            success: true,
            message: "WhatsApp number added successfully",
            data: {
                service
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Remove WhatsApp number from service
const removeWhatsAppNumber = async (req, res, next) => {
    try {
        const { id, numberId } = req.params;

        const service = await WhatsAppService.findById(id);
        if (!service) {
            return next(new AppError("Service not found", 404));
        }

        // Remove the number by filtering it out
        service.whatsappNumbers = service.whatsappNumbers.filter(
            num => num._id.toString() !== numberId
        );

        if (service.whatsappNumbers.length === 0) {
            return next(new AppError("Cannot remove the last WhatsApp number", 400));
        }

        await service.save();

        res.status(200).json({
            success: true,
            message: "WhatsApp number removed successfully",
            data: {
                service
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get services by category
const getServicesByCategory = async (req, res, next) => {
    try {
        const { category } = req.params;
        const services = await WhatsAppService.find({ 
            category, 
            isActive: true 
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: `Services in ${category} category retrieved successfully`,
            data: {
                services,
                count: services.length
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get payment services only (for wallet page)
const getPaymentServices = async (req, res, next) => {
    try {
        const services = await WhatsAppService.find({ 
            category: 'payment', 
            isActive: true 
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Payment services retrieved successfully",
            data: {
                services,
                count: services.length
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Get non-payment services (for general services page)
const getNonPaymentServices = async (req, res, next) => {
    try {
        const services = await WhatsAppService.find({ 
            category: { $ne: 'payment' }, 
            isActive: true 
        }).sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            message: "Non-payment services retrieved successfully",
            data: {
                services,
                count: services.length
            }
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

export {
    getAllServices,
    getAllServicesAdmin,
    getServiceById,
    createService,
    updateService,
    deleteService,
    toggleServiceStatus,
    addWhatsAppNumber,
    removeWhatsAppNumber,
    getServicesByCategory,
    getPaymentServices,
    getNonPaymentServices
}; 