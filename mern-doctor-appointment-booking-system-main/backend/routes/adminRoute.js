import express from "express";
import {
  addDoctor,
  adminDashboard,
  appointmentCancelAdmin,
  appointmentsAdmin,
  getAllDoctors,
  loginAdmin,
  deleteDoctor,
  searchDoctors,
  getPlatformStats,
} from "../controllers/adminController.js";
import upload from "../middlewares/multer.js";
import authAdmin from "../middlewares/authAdmin.js";
import { changeAvailability } from "../controllers/doctorController.js";

const adminRouter = express.Router();

// Route to add a doctor
adminRouter.post("/add-doctor", authAdmin, upload.single("image"), addDoctor);
adminRouter.post("/login", loginAdmin);
adminRouter.get("/all-doctors", authAdmin, getAllDoctors);
adminRouter.post("/change-availability", authAdmin, changeAvailability);
adminRouter.post("/delete-doctor", authAdmin, deleteDoctor);
adminRouter.post("/search-doctors", searchDoctors);
adminRouter.get("/appointments", authAdmin, appointmentsAdmin);
adminRouter.post("/cancel-appointment", authAdmin, appointmentCancelAdmin);
adminRouter.get("/dashboard", authAdmin, adminDashboard);
adminRouter.get("/stats", authAdmin, getPlatformStats);

export default adminRouter;

