import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import AuthContext from "../../services/AuthContext";

const TeacherAddSchedule = ({ closeModal, fetchSchedules }) => {
  const { authState } = useContext(AuthContext);
  const [newSchedule, setNewSchedule] = useState({
    day: "",
    startTime: "",
    endTime: "",
  });

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

  const address = getIpAddress();

  function getIpAddress() {
      const hostname = window.location.hostname;
      const indexOfColon = hostname.indexOf(':');
      return indexOfColon !== -1 ? hostname.substring(0, indexOfColon) : hostname;
  }

  const dayOptions = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

  // Fetch qualified adviser classes
  useEffect(() => {
    const fetchClassesNeedingAdvisory = async () => {
      if (!authState?.token) return;
  
      setLoading(true);
      setFetchError(null);
  
      try {
        const response = await axios.get(
          `http://${address}:8080/class/advisory-needed`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authState.token}`,
            },
          }
        );
  
        setClasses(response.data || []);
      } catch (err) {
        console.error("Error fetching advisory-needed classes:", err);
        setFetchError("Failed to load advisory-needed classes.");
      } finally {
        setLoading(false);
      }
    };
  
    fetchClassesNeedingAdvisory();
  }, [authState]);

  const handleInputChange = (e) => {
    setNewSchedule({ ...newSchedule, [e.target.name]: e.target.value });
  };

  const handleCreateSchedule = async () => {
    if (!newSchedule.day || !newSchedule.startTime || !newSchedule.endTime) {
      toast.error("Day, start time, and end time are required.");
      return;
    }
    
    try {
      const payload = {
        day: newSchedule.day.toUpperCase(),
        startTime: newSchedule.startTime + ":00",
        endTime: newSchedule.endTime + ":00",
        teacherId: authState.uid,
      };
    
      await axios.post(`http://${address}:8080/teacher/create-schedule`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authState.token}`,
        },
      });
    
      toast.success("Schedule created successfully!");
      closeModal();
      fetchSchedules();
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
    
      if (msg.includes("Duplicate schedule")) {
        toast.error("A schedule with the same time already exists.");
      } else if (msg.includes("Conflicting schedule")) {
        toast.error("Schedule overlaps with an existing one.");
      } else {
        toast.error("Failed to create schedule. Please try again.");
      }
    
      console.error("Error creating schedule:", msg);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold mb-4">Add New Schedule</h2>
        <button
              type="button"
              onClick={closeModal}
              className="text-gray-500 hover:text-gray-700 mb-4"
            >
              ✖
            </button>
            </div>

        {/* Day Dropdown */}
        <label className="block mb-2">Day:</label>
        <select
          name="day"
          value={newSchedule.day}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded mb-3"
        >
          <option value="">Select a Day</option>
          {dayOptions.map((day) => (
            <option key={day} value={day}>
              {day}
            </option>
          ))}
        </select>

        {/* Start Time Input */}
        <label className="block mb-2">Start Time:</label>
        <input
          type="time"
          name="startTime"
          value={newSchedule.startTime}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded mb-3"
        />

        {/* End Time Input */}
        <label className="block mb-2">End Time:</label>
        <input
          type="time"
          name="endTime"
          value={newSchedule.endTime}
          onChange={handleInputChange}
          className="w-full p-2 border border-gray-300 rounded mb-3"
        />

        {/* Class Selection Dropdown
        <label className="block mb-2">Class:</label>
        {loading ? (
          <p className="text-sm text-gray-500 mb-3">Loading classes...</p>
        ) : fetchError ? (
          <p className="text-sm text-red-500 mb-3">{fetchError}</p>
        ) : (
          <select
            name="classId"
            value={newSchedule.classId}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded mb-3"
          >
            <option value="">Select a Class</option>
            {classes.map((classItem) => (
              <option key={classItem.cid} value={classItem.cid}>
                {`${classItem.courseCode} - ${classItem.courseDescription} - ${classItem.section} (${classItem.firstname} ${classItem.lastname})`}
              </option>
            ))}
          </select>
        )} */}

        {/* Buttons */}
        <div className="flex justify-end space-x-3">
          <button className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-200 transition" onClick={closeModal}>
            Cancel
          </button>
          <button className="bg-teal text-white px-4 py-2 rounded-md hover:bg-peach transition" onClick={handleCreateSchedule}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherAddSchedule;