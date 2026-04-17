import validator from "validator";
import bcrypt from "bcrypt";
import { v2 as cloudinary } from "cloudinary";
import doctorModel from "../models/doctorModel.js";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";
import userModel from "../models/userModel.js";

// API for adding doctor
const addDoctor = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      speciality,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    const imageFile = req.file;

    // checking for all data to add-doctor
    if (
      !name ||
      !email ||
      !password ||
      !speciality ||
      !degree ||
      !experience ||
      !about ||
      !fees ||
      !address
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Please fill all fields" });
    }

    // validating email format
    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter a valid email!" });
    }

    // validating password length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long!",
      });
    }

    // hashing the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // upload image to cloudinary (make optional for testing)
    let imageUrl = "https://via.placeholder.com/150"; // Default placeholder
    if (imageFile) {
      try {
        const imageUpload = await cloudinary.uploader.upload(imageFile.path, {
          resource_type: "image",
        });
        imageUrl = imageUpload.secure_url;
      } catch (uploadError) {
        console.log("Cloudinary upload failed, using placeholder:", uploadError.message);
      }
    }

    // Normalize email: trim whitespace and convert to lowercase
    const normalizedEmail = email.trim().toLowerCase();

    // create doctor object
    const doctorData = {
      name,
      email: normalizedEmail,
      password: hashedPassword,
      speciality,
      degree,
      experience,
      about,
      fees,
      address: JSON.parse(address), // parse address to JSON
      image: imageUrl, // store the image URL
      date: Date.now(), // store the current date
    };

    const newDoctor = new doctorModel(doctorData);
    await newDoctor.save();

    res.status(201).json({
      success: true,
      message: "Doctor added successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// API for Admin Login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // checking for all data to login
    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter email and password!" });
    }

    if (
      email === process.env.ADMIN_EMAIL &&
      password === process.env.ADMIN_PASSWORD
    ) {
      const token = jwt.sign(email + password, process.env.JWT_SECRET);
      return res.status(200).json({
        success: true,
        token,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// API for getting all doctors
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await doctorModel
      .find({})
      .select("-password")
      .sort({ date: -1 });
    res.status(200).json({
      success: true,
      doctors,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

// API to get all appointments list
const appointmentsAdmin = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({});

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

// API for appointment cancellation
const appointmentCancelAdmin = async (req, res) => {
  try {
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);
    if (!appointmentData) {
      return res.status(404).json({
        success: false,
        message: "Appointment not found.",
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

// API to get dashboard data for admin dashboard
const adminDashboard = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});

    let revenue = 0;
    appointments.forEach((appointment) => {
      if (appointment.isCompleted || appointment.payment) {
        revenue += appointment.amount;
      }
    });

    const cancelledAppointments = appointments.filter((a) => a.cancelled).length;

    const dashData = {
      doctors: doctors.length,
      patients: users.length,
      appointments: appointments.length,
      revenue,
      cancelledAppointments,
      latestAppointments: appointments.reverse().slice(0, 5),
    };

    res.status(200).json({
      success: true,
      dashData,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// API to delete doctor
const deleteDoctor = async (req, res) => {
  try {
    const { docId } = req.body;

    const doctor = await doctorModel.findByIdAndDelete(docId);

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Doctor not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Doctor deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// API to search doctors
const searchDoctors = async (req, res) => {
  try {
    const { query, speciality } = req.body;

    let searchFilter = {};

    if (query) {
      searchFilter = {
        $or: [
          { name: { $regex: query, $options: "i" } },
          { speciality: { $regex: query, $options: "i" } },
        ],
      };
    }

    if (speciality) {
      searchFilter.speciality = speciality;
    }

    const doctors = await doctorModel.find(searchFilter).select("-password");

    res.status(200).json({
      success: true,
      doctors,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// API to get platform statistics
const getPlatformStats = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    const users = await userModel.find({});
    const appointments = await appointmentModel.find({});

    let revenue = 0;
    let completed = 0;
    let pending = 0;

    appointments.forEach((appointment) => {
      if (appointment.isCompleted || appointment.payment) {
        revenue += appointment.amount;
        completed++;
      } else if (!appointment.cancelled) {
        pending++;
      }
    });

    const stats = {
      totalDoctors: doctors.length,
      totalUsers: users.length,
      totalAppointments: appointments.length,
      totalRevenue: revenue,
      completedAppointments: completed,
      pendingAppointments: pending,
      cancelledAppointments: appointments.filter((a) => a.cancelled).length,
    };

    res.status(200).json({
      success: true,
      stats,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  addDoctor,
  loginAdmin,
  getAllDoctors,
  appointmentsAdmin,
  appointmentCancelAdmin,
  adminDashboard,
  deleteDoctor,
  searchDoctors,
  getPlatformStats,
};
