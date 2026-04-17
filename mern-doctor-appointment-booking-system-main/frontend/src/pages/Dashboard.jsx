import { useContext, useEffect, useState } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { backendUrl, token, setToken } = useContext(AppContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    cancelled: 0,
    pending: 0,
  });
  const [userData, setUserData] = useState(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      navigate("/login");
    }
  }, [token, navigate]);

  const getUserProfile = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/user/get-profile", {
        headers: { token },
      });

      if (data.success) {
        setUserData(data.userData);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const getDashboardData = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(backendUrl + "/api/user/dashboard", {
        headers: { token },
      });

      if (data.success) {
        setStats(data.stats);
        setUpcomingAppointments(data.upcomingAppointments);
      }
    } catch (error) {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(false);
    toast.success("Logged out successfully!");
    navigate("/login");
  };

  useEffect(() => {
    if (token) {
      getUserProfile();
      getDashboardData();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-xl text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Welcome, {userData?.name || "User"}! 👋</h1>
            <p className="text-gray-600 mt-2">{userData?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium"
          >
            Logout
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center hover:shadow-lg transition">
            <p className="text-gray-600 text-sm mb-2">📋 Total Appointments</p>
            <p className="text-4xl font-bold text-blue-600">{stats.total}</p>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center hover:shadow-lg transition">
            <p className="text-gray-600 text-sm mb-2">✅ Completed</p>
            <p className="text-4xl font-bold text-green-600">{stats.completed}</p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center hover:shadow-lg transition">
            <p className="text-gray-600 text-sm mb-2">⏰ Pending</p>
            <p className="text-4xl font-bold text-yellow-600">{stats.pending}</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center hover:shadow-lg transition">
            <p className="text-gray-600 text-sm mb-2">❌ Cancelled</p>
            <p className="text-4xl font-bold text-red-600">{stats.cancelled}</p>
          </div>
        </div>

        {/* User Info Card */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="opacity-90">Name</p>
              <p className="text-lg font-medium">{userData?.name || "Not Set"}</p>
            </div>
            <div>
              <p className="opacity-90">Email</p>
              <p className="text-lg font-medium">{userData?.email}</p>
            </div>
            <div>
              <p className="opacity-90">Phone</p>
              <p className="text-lg font-medium">{userData?.phone || "Not Set"}</p>
            </div>
            <div>
              <p className="opacity-90">Gender</p>
              <p className="text-lg font-medium">{userData?.gender || "Not Selected"}</p>
            </div>
          </div>
          <button
            onClick={() => navigate("/profile")}
            className="mt-4 bg-white text-blue-600 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 transition"
          >
            Edit Profile
          </button>
        </div>

        {/* Upcoming Appointments */}
        <div className="bg-white border rounded-lg p-6 shadow-lg">
          <h2 className="text-2xl font-bold mb-6">📅 Upcoming Appointments</h2>

          {upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div
                  key={appointment._id}
                  className="border rounded-lg p-4 hover:shadow-lg transition bg-gradient-to-r from-gray-50 to-white"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-lg text-blue-600">
                        Dr. {appointment.docData.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        🏥 {appointment.docData.speciality}
                      </p>
                    </div>
                    <span
                      className={`px-4 py-2 rounded-full text-xs font-bold ${
                        appointment.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : appointment.status === "confirmed"
                          ? "bg-green-100 text-green-700"
                          : appointment.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {appointment.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4 text-sm">
                    <div>
                      <p className="text-gray-600 text-xs">📅 Date</p>
                      <p className="font-bold text-gray-900">{appointment.slotDate}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">⏱️ Time</p>
                      <p className="font-bold text-gray-900">{appointment.slotTime}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">💰 Fees</p>
                      <p className="font-bold text-gray-900">${appointment.amount}</p>
                    </div>
                    <div>
                      <p className="text-gray-600 text-xs">💳 Payment</p>
                      <p
                        className={`font-bold ${
                          appointment.payment
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {appointment.payment ? "✅ Paid" : "❌ Pending"}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() =>
                        navigate(`/my-appointments`)
                      }
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition font-medium text-sm"
                    >
                      View Details
                    </button>
                    {!appointment.payment && (
                      <button className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition font-medium text-sm">
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 text-lg mb-4">
                No upcoming appointments 😔
              </p>
              <button
                onClick={() => navigate("/doctors")}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
              >
                Book Appointment
              </button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <button
            onClick={() => navigate("/doctors")}
            className="bg-blue-500 text-white p-4 rounded-lg hover:shadow-lg transition text-center font-medium"
          >
            🩺 Book Appointment
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="bg-purple-500 text-white p-4 rounded-lg hover:shadow-lg transition text-center font-medium"
          >
            👤 My Profile
          </button>
          <button
            onClick={() => navigate("/my-appointments")}
            className="bg-green-500 text-white p-4 rounded-lg hover:shadow-lg transition text-center font-medium"
          >
            📋 All Appointments
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

