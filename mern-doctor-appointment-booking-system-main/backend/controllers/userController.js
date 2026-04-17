import validator from "validator";
import bcrypt from "bcrypt";
import userModel from "../models/userModel.js";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import { v2 as cloudinary } from "cloudinary";
import appointmentModel from "../models/appointmentModel.js";
import reviewModel from "../models/reviewModel.js";

const MAX_USERS = 100;

// API to register user
const registerUser = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please fill in all required fields.",
      });
    }

    // Normalize email: trim whitespace and convert to lowercase
    const normalizedEmail = email.trim().toLowerCase();

    if (!validator.isEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    // check total user count
    const userCount = await userModel.countDocuments();
    if (userCount >= MAX_USERS) {
      return res.status(403).json({
        success: false,
        message: `User limit of ${MAX_USERS} reached. No more registrations allowed.`,
      });
    }

    // check if email already exists (case-insensitive search)
    const existingUser = await userModel.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          "This email address is already in use. Please use a different one.",
      });
    }

    // hashing user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userData = {
      name,
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone || "",
    };

    const newUser = new userModel(userData);
    const user = await newUser.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.status(201).json({
      success: true,
      token,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// API for user login
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Normalize email: trim whitespace and convert to lowercase
    const normalizedEmail = email.trim().toLowerCase();
    
    const user = await userModel.findOne({ email: normalizedEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found with this email.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Wrong password.",
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// API to get user details
const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const userData = await userModel.findById(userId).select("-password");

    res.status(200).json({
      success: true,
      userData,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

//API for update user profile
const updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.user;
    const { name, phone, address, dob, gender } = req.body;
    const imgFile = req.file;

    if (!name || !phone || !address || !dob || !gender) {
      return res.status(404).json({
        success: false,
        message: "User data is missing.",
      });
    }

    const userData = {
      name,
      phone,
      address: JSON.parse(address),
      dob,
      gender,
    };

    await userModel.findByIdAndUpdate(userId, userData);

    if (imgFile) {
      //upload img to cloudinary
      const imgUpload = await cloudinary.uploader.upload(imgFile.path, {
        resource_type: "image",
      });

      const imgURL = imgUpload.secure_url;

      await userModel.findByIdAndUpdate(userId, { image: imgURL });
    }

    res.status(200).json({
      success: true,
      message: "User profile updated.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// API to book an appointment
const bookAppointment = async (req, res) => {
  try {
    const { userId } = req.user;
    const { docId, slotDate, slotTime } = req.body;

    const docData = await doctorModel.findById(docId).select("-password");

    if (!docData.available) {
      return res.status(404).json({
        success: false,
        message: "Doctor not available. Please choose another doctor.",
      });
    }

    let slots_booked = docData.slots_booked;

    // check slot availability
    if (slots_booked[slotDate]) {
      if (slots_booked[slotDate].includes(slotTime)) {
        return res.status(400).json({
          success: false,
          message: "This slot is already booked.",
        });
      } else {
        slots_booked[slotDate].push(slotTime);
      }
    } else {
      slots_booked[slotDate] = [];
      slots_booked[slotDate].push(slotTime);
    }

    const userData = await userModel.findById(userId).select("-password");

    delete docData.slots_booked;

    const appointmentData = {
      userId,
      docId,
      userData,
      docData,
      amount: docData.fees,
      slotTime,
      slotDate,
      date: Date.now(),
    };

    const newAppointment = new appointmentModel(appointmentData);
    await newAppointment.save();

    // save new slots data in docData
    await doctorModel.findByIdAndUpdate(docId, { slots_booked });

    res.status(200).json({
      success: true,
      message: "Appointment booked successfully.",
      appointment: newAppointment,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// API to get all appointments of a user
const listAppointment = async (req, res) => {
  try {
    const { userId } = req.user;
    const appointments = await appointmentModel.find({ userId });

    res.status(200).json({
      success: true,
      appointments,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// API to cancel an appointment
const cancelAppointment = async (req, res) => {
  try {
    const { userId } = req.user;
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    // verify appointment user
    if (appointmentData.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to cancel this appointment.",
      });
    }

    // cancel appointment
    await appointmentModel.findByIdAndUpdate(appointmentId, {
      cancelled: true,
    });

    //releasing doctor slot
    const { docId, slotDate, slotTime } = appointmentData;
    const doctorData = await doctorModel.findById(docId).select("-password");
    if (doctorData) {
      let slots_booked = doctorData.slots_booked;
      if (slots_booked[slotDate]) {
        slots_booked[slotDate] = slots_booked[slotDate].filter(
          (time) => time !== slotTime
        );

        await doctorModel.findByIdAndUpdate(docId, { slots_booked });
      }
    }

    res.status(200).json({
      success: true,
      message: "Appointment cancelled.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// API to make payment of an appointment
const makePayment = async (req, res) => {
  try {
    const { userId } = req.user;
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (!appointmentData) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
      });
    }

    if (appointmentData.cancelled) {
      return res.status(400).json({
        success: false,
        message: "Appointment cancelled.",
      });
    }

    if (appointmentData.payment) {
      return res.status(400).json({
        success: false,
        message: "Payment already completed.",
      });
    }

    // verify appointment user
    if (appointmentData.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to make payment for this appointment.",
      });
    }

    // Mark appointment as paid
    appointmentData.payment = true;
    await appointmentData.save();

    res.status(200).json({
      success: true,
      message: "Payment successful.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// API to add review and rating
const addReview = async (req, res) => {
  try {
    const { userId } = req.user;
    const { docId, rating, review } = req.body;

    if (!docId || !rating || !review) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    // Check if user has completed appointment with this doctor
    const appointment = await appointmentModel.findOne({
      userId,
      docId,
      isCompleted: true,
    });

    if (!appointment) {
      return res.status(400).json({
        success: false,
        message: "You can only review doctors after completing an appointment",
      });
    }

    const userData = await userModel.findById(userId);

    const reviewData = {
      userId,
      docId,
      rating: parseInt(rating),
      review,
      userName: userData.name,
    };

    const newReview = new reviewModel(reviewData);
    await newReview.save();

    res.status(200).json({
      success: true,
      message: "Review added successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// API to get reviews for a doctor
const getDoctorReviews = async (req, res) => {
  try {
    const { docId } = req.body;

    const reviews = await reviewModel.find({ docId }).sort({ date: -1 });

    let totalRating = 0;
    if (reviews.length > 0) {
      reviews.forEach((review) => {
        totalRating += review.rating;
      });
    }

    const avgRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      reviews,
      averageRating: avgRating,
      totalReviews: reviews.length,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// API to update appointment status (confirm, reject, complete)
const updateAppointmentStatus = async (req, res) => {
  try {
    const { userId } = req.user;
    const { appointmentId, status, notes } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found",
      });
    }

    if (appointment.userId.toString() !== userId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update this appointment",
      });
    }

    if (!["confirmed", "rejected", "completed"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    appointment.status = status;
    if (notes) appointment.notes = notes;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: `Appointment ${status} successfully`,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// API to get doctor's available slots
const getDoctorSlots = async (req, res) => {
  try {
    const { docId, date } = req.body;

    const doctor = await doctorModel.findById(docId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    // Define time slots (9 AM to 5 PM, 30 min each)
    const timeSlots = [
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "12:00",
      "12:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
      "17:00",
    ];

    // Get booked slots for the date
    const bookedSlots = doctor.slots_booked[date] || [];

    // Filter available slots
    const availableSlots = timeSlots.filter((slot) => !bookedSlots.includes(slot));

    res.status(200).json({
      success: true,
      availableSlots,
      bookedSlots,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// API to get user's dashboard stats
const getUserDashboard = async (req, res) => {
  try {
    const { userId } = req.user;

    const totalAppointments = await appointmentModel.countDocuments({ userId });
    const completedAppointments = await appointmentModel.countDocuments({
      userId,
      isCompleted: true,
    });
    const cancelledAppointments = await appointmentModel.countDocuments({
      userId,
      cancelled: true,
    });
    const pendingAppointments = await appointmentModel.countDocuments({
      userId,
      status: "pending",
    });

    const upcomingAppointments = await appointmentModel.find({
      userId,
      cancelled: false,
      status: "pending",
    }).limit(5);

    res.status(200).json({
      success: true,
      stats: {
        total: totalAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        pending: pendingAppointments,
      },
      upcomingAppointments,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  bookAppointment,
  listAppointment,
  cancelAppointment,
  makePayment,
  addReview,
  getDoctorReviews,
  updateAppointmentStatus,
  getDoctorSlots,
  getUserDashboard,
};
