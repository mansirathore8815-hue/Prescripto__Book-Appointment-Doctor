import express from "express";
import {
  bookAppointment,
  cancelAppointment,
  getUserProfile,
  listAppointment,
  loginUser,
  makePayment,
  registerUser,
  updateUserProfile,
  addReview,
  getDoctorReviews,
  updateAppointmentStatus,
  getDoctorSlots,
  getUserDashboard,
} from "../controllers/userController.js";
import authUser from "../middlewares/authUser.js";
import upload from "../middlewares/multer.js";

const userRouter = express.Router();

userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);

userRouter.get("/get-profile", authUser, getUserProfile);
userRouter.post(
  "/update-profile",
  upload.single("image"),
  authUser,
  updateUserProfile
);
userRouter.post("/book-appointment", authUser, bookAppointment);
userRouter.get("/appointments", authUser, listAppointment);
userRouter.post("/cancel-appointment", authUser, cancelAppointment);
userRouter.post("/make-payment", authUser, makePayment);

// Reviews and ratings
userRouter.post("/add-review", authUser, addReview);
userRouter.post("/get-doctor-reviews", getDoctorReviews);

// Appointment status management
userRouter.post("/update-appointment-status", authUser, updateAppointmentStatus);

// Slots and dashboard
userRouter.post("/get-doctor-slots", getDoctorSlots);
userRouter.get("/dashboard", authUser, getUserDashboard);

export default userRouter;

