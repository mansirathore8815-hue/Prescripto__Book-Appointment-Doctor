import doctorModel from "../models/doctorModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import appointmentModel from "../models/appointmentModel.js";

const changeAvailability = async (req, res) => {
  try {
    const { docId } = req.body;
    const docData = await doctorModel.findById(docId);
    await doctorModel.findByIdAndUpdate(docId, {
      available: !docData.available,
    });
    res.status(200).json({
      success: true,
      message: "Doctor availability status changed successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const doctorList = async (req, res) => {
  try {
    const doctors = await doctorModel.find({}).select(["-password", "-email"]);
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

// API for doctor login
const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Required fields are empty.",
      });
    }

    // Normalize email: trim whitespace and convert to lowercase
    const normalizedEmail = email.trim().toLowerCase();

    const doctor = await doctorModel.findOne({ email: normalizedEmail });

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: "Invalid email",
      });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }

    const token = jwt.sign(
      { id: doctor._id },
      process.env.JWT_SECRET
      // {expiresIn: "1h",}
    );

    res.status(200).json({
      success: true,
      token,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

// API to get doctor's own appointments only
const appointmentsDoctor = async (req, res) => {
  try {
    const { docId } = req.user;
    const appointments = await appointmentModel.find({ docId });

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

// API to make appointment completed for doctor portal
const appointmentComplete = async (req, res) => {
  try {
    const { docId } = req.user;
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        isCompleted: true,
      });

      return res.status(200).json({
        success: true,
        message: "Appointment Completed.",
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// API to make appointment cancel for doctor portal
const appointmentCancel = async (req, res) => {
  try {
    const { docId } = req.user;
    const { appointmentId } = req.body;

    const appointmentData = await appointmentModel.findById(appointmentId);

    if (appointmentData && appointmentData.docId === docId) {
      await appointmentModel.findByIdAndUpdate(appointmentId, {
        cancelled: true,
      });

      return res.status(200).json({
        success: true,
        message: "Appointment Cancelled.",
      });
    }
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// API to get dashboard data for doctor portal
const doctorDashboard = async (req, res) => {
  try {
    const { docId } = req.user;

    const appointments = await appointmentModel.find({});

    let earning = 0;
    appointments.map((item) => {
      if (item.isCompleted || item.payment) {
        earning += item.amount;
      }
    });

    let patients = [];
    appointments.map((item) => {
      if (!patients.includes(item.userId)) {
        patients.push(item.userId);
      }
    });

    const dashData = {
      earning,
      appointments: appointments.length,
      patients: patients.length,
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

// API to get doctor profile for doctor portal
const doctorProfile = async (req, res) => {
  try {
    const { docId } = req.user;

    const profileData = await doctorModel.findById(docId).select("-password");

    res.status(200).json({
      success: true,
      profileData,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// API to update doctor profile for doctor portal
const updateDoctorProfile = async (req, res) => {
  try {
    const { docId } = req.user;
    const { fees, address, available } = req.body;

    await doctorModel.findByIdAndUpdate(docId, { fees, address, available });

    res.status(200).json({
      success: true,
      message: "Doctor Profile Updated.",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// API for doctor to approve appointment
const approveAppointment = async (req, res) => {
  try {
    const { docId } = req.user;
    const { appointmentId, notes } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment || appointment.docId !== docId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to approve this appointment",
      });
    }

    appointment.status = "confirmed";
    if (notes) appointment.notes = notes;
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment approved successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// API for doctor to reject appointment
const rejectAppointment = async (req, res) => {
  try {
    const { docId } = req.user;
    const { appointmentId, reason } = req.body;

    const appointment = await appointmentModel.findById(appointmentId);

    if (!appointment || appointment.docId !== docId) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to reject this appointment",
      });
    }

    appointment.status = "rejected";
    appointment.cancelReason = reason || "Rejected by doctor";
    appointment.cancelled = true;
    if (appointment.payment) {
      appointment.refundAmount = appointment.amount;
    }
    await appointment.save();

    res.status(200).json({
      success: true,
      message: "Appointment rejected successfully",
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// API for doctor to get earnings
const getDoctorEarnings = async (req, res) => {
  try {
    const { docId } = req.user;

    const appointments = await appointmentModel.find({ docId });

    let earning = 0;
    appointments.map((item) => {
      if (item.isCompleted || item.payment) {
        earning += item.amount;
      }
    });

    const earning30Days = appointments
      .filter((item) => {
        const appointmentDate = new Date(item.date);
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        return appointmentDate >= thirtyDaysAgo && (item.isCompleted || item.payment);
      })
      .reduce((sum, item) => sum + item.amount, 0);

    res.status(200).json({
      success: true,
      earning,
      earning30Days,
      totalAppointments: appointments.length,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export {
  changeAvailability,
  doctorList,
  loginDoctor,
  appointmentsDoctor,
  appointmentComplete,
  appointmentCancel,
  doctorDashboard,
  doctorProfile,
  updateDoctorProfile,
  approveAppointment,
  rejectAppointment,
  getDoctorEarnings,
};
