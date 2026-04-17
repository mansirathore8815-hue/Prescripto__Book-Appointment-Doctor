import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

const DatePickerCalendar = ({ onDateSelect, minDate }) => {
  const [selectedDate, setSelectedDate] = useState(minDate || new Date());
  const [showCalendar, setShowCalendar] = useState(false);

  const handleDateChange = (date) => {
    setSelectedDate(date);
    onDateSelect(date);
    setShowCalendar(false);
  };

  const formatDate = (date) => {
    if (!date) return 'Select Date';
    return date.toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Set max date to 7 days from now
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 7);

  return (
    <div className="w-full">
      <div className="relative">
        {/* Date Display Button */}
        <button
          onClick={() => setShowCalendar(!showCalendar)}
          className="w-full p-3 border-2 border-gray-300 rounded-lg bg-white hover:bg-gray-50 flex items-center justify-between cursor-pointer transition"
        >
          <span className="text-lg font-semibold text-gray-700">
            📅 {formatDate(selectedDate)}
          </span>
          <span className="text-xl">
            {showCalendar ? '▲' : '▼'}
          </span>
        </button>

        {/* Calendar Popup */}
        {showCalendar && (
          <div className="absolute top-14 left-0 right-0 bg-white border-2 border-blue-400 rounded-lg shadow-xl z-50 p-4 w-80">
            <style>{`
              .react-calendar {
                width: 100%;
                border: none;
                border-radius: 8px;
              }
              .react-calendar__month-view__weekdays {
                color: #0066cc;
                font-weight: bold;
              }
              .react-calendar__tile {
                padding: 12px;
                border-radius: 6px;
                transition: all 0.2s;
              }
              .react-calendar__tile:hover {
                background-color: #e3f2fd;
                border: 1px solid #0066cc;
              }
              .react-calendar__tile--active {
                background-color: #0066cc;
                color: white;
                font-weight: bold;
              }
              .react-calendar__tile--disabled {
                color: #ccc;
                opacity: 0.5;
              }
            `}</style>
            <Calendar
              onChange={handleDateChange}
              value={selectedDate}
              minDate={new Date()}
              maxDate={maxDate}
              className="w-full"
              tileClassName={({ date }) => {
                if (date < new Date() && date.toDateString() !== new Date().toDateString()) {
                  return 'disabled-date';
                }
                return '';
              }}
            />
            <button
              onClick={() => setShowCalendar(false)}
              className="w-full mt-3 p-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold text-gray-700"
            >
              Close Calendar
            </button>
          </div>
        )}
      </div>

      {/* Info Text */}
      <p className="text-sm text-gray-600 mt-2">
        📌 Appointments available for the next 7 days
      </p>
    </div>
  );
};

export default DatePickerCalendar;
