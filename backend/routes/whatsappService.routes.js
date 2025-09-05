import { Router } from "express";
import { isLoggedIn, authorisedRoles } from "../middleware/auth.middleware.js";
import {
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
} from "../controllers/whatsappService.controller.js";

const router = Router();

// Public routes (for users to see available services)
router.get("/", getAllServices);
router.get("/payment", getPaymentServices);
router.get("/non-payment", getNonPaymentServices);
router.get("/category/:category", getServicesByCategory);
router.get("/:id", getServiceById);

// Admin only routes
router.get("/admin/all", isLoggedIn, authorisedRoles("ADMIN", "SUPER_ADMIN"), getAllServicesAdmin);
router.post("/", isLoggedIn, authorisedRoles("ADMIN", "SUPER_ADMIN"), createService);
router.put("/:id", isLoggedIn, authorisedRoles("ADMIN", "SUPER_ADMIN"), updateService);
router.delete("/:id", isLoggedIn, authorisedRoles("ADMIN", "SUPER_ADMIN"), deleteService);
router.patch("/:id/toggle", isLoggedIn, authorisedRoles("ADMIN", "SUPER_ADMIN"), toggleServiceStatus);

// WhatsApp number management routes
router.post("/:id/numbers", isLoggedIn, authorisedRoles("ADMIN", "SUPER_ADMIN"), addWhatsAppNumber);
router.delete("/:id/numbers/:numberId", isLoggedIn, authorisedRoles("ADMIN", "SUPER_ADMIN"), removeWhatsAppNumber);

export default router; 