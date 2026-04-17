import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import { assets } from "../assets/assets_frontend/assets";
import RelatedDoctors from "../components/RelatedDoctors";
import DatePickerCalendar from "../components/DatePickerCalendar";
import { toast } from "react-toastify";
import axios from "axios";

const Appointment = () => {
  const { docId } = useParams();
  const { doctors, currencySymbol, backendUrl, token, getDoctorsData } =
    useContext(AppContext);

  const navigate = useNavigate();

  const [docInfo, setDocInfo] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [slotTime, setSlotTime] = useState("");

  const fetchDoc = () => {
    const docInfo = doctors.find((doc) => doc._id === docId);
    setDocInfo(docInfo);
  };

  // Get available time slots for a specific date
  const getTimeSlotsForDate = (date) => {
    let slotDateObj = new Date(date);
    slotDateObj.setHours(9, 0, 0, 0); // Start from 9 AM
    let endTime = new Date(date);
    endTime.setHours(17, 0, 0, 0); // End at 5 PM

    // If it's today, start after current time
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      const now = new Date();
      slotDateObj = new Date(now);
      slotDateObj.setMinutes(Math.ceil(slotDateObj.getMinutes() / 30) * 30);
      if (slotDateObj.getSeconds() > 0 || slotDateObj.getMilliseconds() > 0) {
        slotDateObj.setSeconds(0, 0);
      }
      if (slotDateObj.getHours() < 9) slotDateObj.setHours(9, 0, 0, 0);
    }

    let timeSlots = [];
    let slotDay = date.getDate();
    let slotMonth = date.getMonth() + 1;
    let slotYear = date.getFullYear();
    const slotDateKey = slotDay + "_" + slotMonth + "_" + slotYear;

    while (slotDateObj < endTime) {
      let formattedTime = slotDateObj.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });

      const isSlotBooked =
        docInfo?.slots_booked?.[slotDateKey]?.includes(formattedTime);

      if (!isSlotBooked) {
        timeSlots.push({
          datetime: new Date(slotDateObj),
          time: formattedTime,
        });
      }

      slotDateObj.setMinutes(slotDateObj.getMinutes() + 30);
    }

    return timeSlots;
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSlotTime(""); // Reset time when date changes
  };

  const bookAppointment = async () => {
    if (!token) {
      toast.error("🔐 Please Login First", {
        position: "top-center",
        autoClose: 4000,
        draggable: true,
      });
      return navigate("/login");
    }

    if (!slotTime) {
      toast.error("Please select a time slot");
      return;
    }

    try {
      let day = selectedDate.getDate();
      let month = selectedDate.getMonth() + 1;
      let year = selectedDate.getFullYear();

      const slotDate = day + "_" + month + "_" + year;

      const { data } = await axios.post(
        backendUrl + "/api/user/book-appointment",
        { docId, slotDate, slotTime },
        { headers: { token } }
      );

      if (data.success) {
        toast.success(data.message || "Appointment booked successfully");
        getDoctorsData(); // Refresh doctors data
        navigate("/my-appointments");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to book appointment"
      );
    }
  };

  useEffect(() => {
    fetchDoc();
  }, [doctors, docId]);

  useEffect(() => {
    if (docInfo && !docInfo.available) {
      toast.info(
        `${docInfo.name} is currently unavailable. You may book an appointment with one of our other top-rated doctors.`,
        {
          autoClose: 10000,
          draggable: true,
        }
      );
    }
  }, [docInfo]);

  return (
    docInfo && (
      <div>
        {/* Login Required Alert */}
        {!token && (
          <div className="mb-6 bg-red-50 border-2 border-red-300 rounded-lg p-5 flex items-start gap-4">
            <span className="text-3xl">🔒</span>
            <div className="flex-1">
              <p className="text-lg font-bold text-red-700 mb-2">Login Required to Book Appointment</p>
              <p className="text-sm text-red-600 mb-4">
                You need to log in to book an appointment. Sign up or log in with your credentials.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => navigate("/login")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
                >
                  Go to Login
                </button>
                <button
                  onClick={() => navigate("/doctors")}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition"
                >
                  Browse Doctors
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Doctor Info Section */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className={docInfo.available ? "" : "opacity-50"}>
            <img
              className="bg-primary w-full sm:max-w-72 rounded-lg"
              src={docInfo.image}
              alt={docInfo.name}
            />
          </div>

          {/* Doctor Details */}
          <div className="flex-1 border border-gray-400 rounded-lg p-8 py-7 bg-white mx-2 sm:mx-0 mt-[-80px] sm:mt-0">
            <p className="flex items-center gap-2 text-2xl font-medium text-gray-900">
              {docInfo.name}
              <img className="w-5" src={assets.verified_icon} alt="" />
            </p>
            <div className="flex items-center gap-2 text-sm mt-1 text-gray-600">
              <p>
                {docInfo.degree} - {docInfo.speciality}
              </p>
              <button className="py-0.5 px-2 border text-xs rounded-full">
                {docInfo.experience} years
              </button>
            </div>
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-gray-900 mt-3">
                About <img src={assets.info_icon} alt="" />
              </p>
              <p className="text-sm text-gray-500 max-w-[700px] mt-1">
                {docInfo.about}
              </p>
            </div>
            <p className="text-gray-500 font-medium mt-4">
              Appointment fee:{" "}
              <span className="text-gray-600">
                {currencySymbol}
                {docInfo.fees}
              </span>
            </p>
          </div>
        </div>

        {/* Booking Section */}
        {docInfo.available ? (
          <div className="sm:ml-72 sm:pl-4 mt-8">
            {!token ? (
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 text-center">
                <p className="text-4xl mb-3">⚠️</p>
                <p className="text-lg font-semibold text-yellow-800 mb-4">You must be logged in to book an appointment</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => navigate("/login")}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition"
                  >
                    👤 Login / Sign Up Now
                  </button>
                  <button
                    onClick={() => navigate("/doctors")}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-bold rounded-lg transition"
                  >
                    Browse Other Doctors
                  </button>
                </div>
              </div>
            ) : (
              <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              📅 Book Your Appointment
            </h2>

            {/* Calendar Section */}
            <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200 mb-8">
              <p className="text-lg font-semibold text-gray-800 mb-4">
                Select Appointment Date
              </p>
              <DatePickerCalendar onDateSelect={handleDateSelect} minDate={new Date()} />
            </div>

            {/* Time Slots Section */}
            <div className="bg-white p-6 rounded-lg border-2 border-gray-300">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">⏰</span>
                <p className="text-lg font-semibold text-gray-800">
                  Available Times for{" "}
                  {selectedDate.toLocaleDateString("en-GB", {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {getTimeSlotsForDate(selectedDate).length > 0 ? (
                  getTimeSlotsForDate(selectedDate).map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setSlotTime(item.time)}
                      className={`px-4 py-3 rounded-lg font-semibold transition-all ${
                        item.time === slotTime
                          ? "bg-primary text-white shadow-lg scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-gray-300"
                      }`}
                    >
                      {item.time.toLowerCase()}
                    </button>
                  ))
                ) : (
                  <p className="col-span-full text-center text-gray-500 py-4">
                    ❌ No available slots for this date
                  </p>
                )}
              </div>
            </div>

            {/* Selected Summary */}
            {slotTime && (
              <div className="mt-6 p-4 bg-green-50 border-2 border-green-300 rounded-lg">
                <p className="text-green-700 font-semibold text-lg">
                  ✅ Selected: {selectedDate.toLocaleDateString("en-GB", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}{" "}
                  at {slotTime}
                </p>
              </div>
            )}

            {/* Book Button */}
            <button
              onClick={bookAppointment}
              disabled={!slotTime}
              className={`mt-6 px-8 py-3 rounded-full text-white font-semibold text-lg transition-all ${
                slotTime
                  ? "bg-primary hover:bg-blue-700 cursor-pointer shadow-lg"
                  : "bg-gray-400 cursor-not-allowed opacity-50"
              }`}
            >
              {slotTime ? "✅ Book Appointment" : "⏳ Select Time to Book"}
            </button>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-10 flex items-center gap-2 text-sm text-center">
            <p className="w-2 h-2 rounded-full bg-gray-500"></p>
            <p className="text-gray-500 font-semibold">
              {docInfo.name} is currently unavailable. You may book an
              appointment with one of our other top-rated doctors.
            </p>
          </div>
        )}

        {/* Related Doctors section */}
        <RelatedDoctors docId={docId} speciality={docInfo.speciality} />
      </div>
    )
  );
};

export default Appointment;
