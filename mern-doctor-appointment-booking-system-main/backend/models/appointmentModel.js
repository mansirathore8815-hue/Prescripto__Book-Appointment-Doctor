import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  docId: { type: String, required: true },
  slotDate: { type: String, required: true },
  slotTime: { type: String, required: true },
  userData: { type: Object, required: true },
  docData: { type: Object, required: true },
  amount: { type: Number, required: true },
  date: { type: String, required: true },
  cancelled: { type: Boolean, default: false },
  payment: { type: Boolean, default: false },
  isCompleted: { type: Boolean, default: false },
  status: { type: String, default: "pending", enum: ["pending", "confirmed", "rejected", "completed"] },
  cancelReason: { type: String, default: "" },
  cancelledBy: { type: String, default: "" }, // 'user' or 'doctor'
  refundAmount: { type: Number, default: 0 },
  notes: { type: String, default: "" },
});

const appointmentModel =
  mongoose.models.appointment ||
  mongoose.model("appointment", appointmentSchema);

export default appointmentModel;

