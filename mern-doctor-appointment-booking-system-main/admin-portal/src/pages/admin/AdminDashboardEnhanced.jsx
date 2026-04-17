import { useContext, useEffect, useState } from "react";
import { AdminContext } from "../../context/AdminContext";
import axios from "axios";
import { toast } from "react-toastify";

const AdminDashboardEnhanced = () => {
  const { backendUrl, aToken } = useContext(AdminContext);
  const [stats, setStats] = useState({
    totalDoctors: 0,
    totalUsers: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    completedAppointments: 0,
    pendingAppointments: 0,
    cancelledAppointments: 0,
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);

  const getPlatformStats = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/admin/stats", {
        headers: { aToken },
      });

      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const searchDoctors = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const { data } = await axios.post(backendUrl + "/api/admin/search-doctors", {
        query: searchQuery,
      });

      if (data.success) {
        setSearchResults(data.doctors);
      }
    } catch (error) {
      toast.error("Search failed");
    }
  };

  const deleteDoctor = async (docId) => {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;

    try {
      const { data } = await axios.post(
        backendUrl + "/api/admin/delete-doctor",
        { docId },
        { headers: { aToken } }
      );

      if (data.success) {
        toast.success("Doctor deleted successfully");
        searchDoctors();
        getPlatformStats();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete");
    }
  };

  useEffect(() => {
    if (aToken) {
      getPlatformStats();
    }
  }, [aToken]);

  useEffect(() => {
    const timer = setTimeout(() => {
      searchDoctors();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <p className="text-xl text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Platform Dashboard</h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm">Total Doctors</p>
          <p className="text-4xl font-bold text-blue-600">{stats.totalDoctors}</p>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm">Total Users</p>
          <p className="text-4xl font-bold text-green-600">{stats.totalUsers}</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm">Total Appointments</p>
          <p className="text-4xl font-bold text-purple-600">{stats.totalAppointments}</p>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <p className="text-gray-600 text-sm">Total Revenue</p>
          <p className="text-3xl font-bold text-yellow-600">${stats.totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* Appointment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-gray-600 text-sm">Completed</p>
          <p className="text-2xl font-bold text-green-600">{stats.completedAppointments}</p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <p className="text-gray-600 text-sm">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingAppointments}</p>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <p className="text-gray-600 text-sm">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">{stats.cancelledAppointments}</p>
        </div>
      </div>

      {/* Doctor Search & Management */}
      <div className="bg-white border rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Doctor Search & Management</h2>

        <div className="mb-6">
          <input
            type="text"
            placeholder="Search doctors by name or speciality..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
          />
        </div>

        {searchResults.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Speciality</th>
                  <th className="px-4 py-3 text-left">Experience</th>
                  <th className="px-4 py-3 text-left">Fees</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {searchResults.map((doctor) => (
                  <tr key={doctor._id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium">{doctor.name}</td>
                    <td className="px-4 py-3">{doctor.speciality}</td>
                    <td className="px-4 py-3">{doctor.experience} years</td>
                    <td className="px-4 py-3">${doctor.fees}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        doctor.available
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {doctor.available ? "Available" : "Unavailable"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => deleteDoctor(doctor._id)}
                        className="px-3 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-center text-gray-500">
            {searchQuery ? "No doctors found" : "Enter search term to find doctors"}
          </p>
        )}
      </div>
    </div>
  );
};

export default AdminDashboardEnhanced;
