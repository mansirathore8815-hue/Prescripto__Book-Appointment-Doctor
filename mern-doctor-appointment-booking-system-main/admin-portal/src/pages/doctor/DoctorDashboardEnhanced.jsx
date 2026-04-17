import { useContext, useEffect, useState } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import axios from "axios";
import { toast } from "react-toastify";

const DoctorDashboardEnhanced = () => {
  const { backendUrl, dToken } = useContext(DoctorContext);
  const [earnings, setEarnings] = useState({
    total: 0,
    last30Days: 0,
    totalAppointments: 0,
  });
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const getEarnings = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/earnings", {
        headers: { dToken },
      });

      if (data.success) {
        setEarnings({
          total: data.earning,
          last30Days: data.earning30Days,
          totalAppointments: data.totalAppointments,
        });
      }
    } catch (error) {
      toast.error("Failed to load earnings");
    }
  };

  const getAppointments = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/doctor/appointments", {
        headers: { dToken },
      });

      if (data.success) {
        setAppointments(data.appointments);
      }
    } catch (error) {
      toast.error("Failed to load appointments");
    } finally {
      setLoading(false);
    }
  };

  const approveAppointment = async (appointmentId) => {
    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/approve-appointment",
        { appointmentId },
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success("Appointment approved");
        getAppointments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve");
    }
  };

  const rejectAppointment = async (appointmentId) => {
    const reason = prompt("Enter rejection reason:");
    if (!reason) return;

    try {
      const { data } = await axios.post(
        backendUrl + "/api/doctor/reject-appointment",
        { appointmentId, reason },
        { headers: { dToken } }
      );

      if (data.success) {
        toast.success("Appointment rejected");
        getAppointments();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject");
    }
  };

  useEffect(() => {
    if (dToken) {
      getEarnings();
      getAppointments();
    }
  }, [dToken]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-xl text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Doctor Dashboard</h1>

      {/* Earnings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6">
          <p className="text-sm opacity-90">Total Earnings</p>
          <p className="text-4xl font-bold">${earnings.total.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
          <p className="text-sm opacity-90">Last 30 Days</p>
          <p className="text-4xl font-bold">${earnings.last30Days.toFixed(2)}</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg p-6">
          <p className="text-sm opacity-90">Total Appointments</p>
          <p className="text-4xl font-bold">{earnings.totalAppointments}</p>
        </div>
      </div>

      {/* Appointments Management */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Appointment Management</h2>

        {appointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left">Patient</th>
                  <th className="px-4 py-3 text-left">Date & Time</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Amount</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((appointment) => (
                  <tr key={appointment._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3">{appointment.userData.name}</td>
                    <td className="px-4 py-3">
                      {appointment.slotDate} {appointment.slotTime}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        appointment.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : appointment.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {appointment.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">${appointment.amount}</td>
                    <td className="px-4 py-3">
                      {appointment.status === "pending" && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => approveAppointment(appointment._id)}
                            className="px-3 py-1 bg-green-500 text-white rounded text-xs hover:bg-green-600"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => rejectAppointment(appointment._id)}
                            className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500">No appointments</p>
        )}
      </div>
    </div>
  );
};

export default DoctorDashboardEnhanced;
