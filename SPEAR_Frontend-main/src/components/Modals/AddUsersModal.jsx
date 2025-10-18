import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const departmentsList = [
  "College of Engineering and Architecture",
  "College of Management, Business & Accountancy",
  "College of Arts, Sciences & Education",
  "College of Nursing & Allied Health Sciences",
  "College of Computer Studies",
  "College of Criminal Justice",
];

const address = getIpAddress();

  function getIpAddress() {
      const hostname = window.location.hostname;
      const indexOfColon = hostname.indexOf(':');
      return indexOfColon !== -1 ? hostname.substring(0, indexOfColon) : hostname;
  }



const AddUsersModal = ({ isOpen, onClose }) => {
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    password: "",
    role: "",
    interests: "N/A",
    department: "N/A",
  });

  const handleInputChange = (e) => {
    const { id, value } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [id]: value,
      ...(id === "role" && value !== "TEACHER"
        ? { interests: "N/A", department: "N/A" }
        : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const userData = {
      email: formData.email,
      firstname: formData.firstName,
      lastname: formData.lastName,
      password: formData.password,
      role: formData.role.toLowerCase(),
      interests: formData.role === "TEACHER" ? formData.interests : "N/A",
      department: formData.role === "TEACHER" ? formData.department : "N/A",
    };

    try {
      const response = await axios.post(`http://${address}:8080/register`, userData, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.statusCode === 200) {
        toast.success("User added successfully!");
        onClose();
        setTimeout(() => {
          window.location.reload();
        }, 3000)
      } else {
        setError(response.data.message || "Failed to add user.");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.response?.data?.message || "Error adding user. Try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-full max-w-md p-4 bg-white rounded-lg shadow-lg">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Add New User</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-900 hover:bg-gray-200 rounded-full w-8 h-8 flex justify-center items-center"
          >
            <svg
              className="w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form className="p-4" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm text-center mb-4">{error}</div>}

          <div className="grid gap-4 mb-4">
            {/* University Email */}
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700">
                University Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-2 border rounded-md"
                placeholder="Enter university email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block mb-2 text-sm font-medium text-gray-700">
                First Name
              </label>
              <input
                type="text"
                id="firstName"
                className="w-full p-2 border rounded-md"
                placeholder="Enter first name"
                value={formData.firstName}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block mb-2 text-sm font-medium text-gray-700">
                Last Name
              </label>
              <input
                type="text"
                id="lastName"
                className="w-full p-2 border rounded-md"
                placeholder="Enter last name"
                value={formData.lastName}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full p-2 border rounded-md"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleInputChange}
                required
              />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                id="role"
                className="w-full p-2 border rounded-md"
                value={formData.role}
                onChange={handleInputChange}
                required
              >
                <option value="" disabled>Select Role</option>
                <option value="TEACHER">TEACHER</option>
              </select>
            </div>

            {/* Interests (Only for Teacher) */}
            <div>
              <label htmlFor="interests" className="block mb-2 text-sm font-medium text-gray-700">
                Interests
              </label>
              <input
                type="text"
                id="interests"
                className="w-full p-2 border rounded-md"
                placeholder="Enter interests"
                value={formData.interests}
                onChange={handleInputChange}
                disabled={formData.role !== "TEACHER"}
              />
            </div>

            {/* Department (Only for Teacher) */}
            <div>
              <label htmlFor="department" className="block mb-2 text-sm font-medium text-gray-700">
                Department
              </label>
              <select
                id="department"
                className="w-full p-2 border rounded-md"
                value={formData.department}
                onChange={handleInputChange}
                disabled={formData.role !== "TEACHER"}
              >
                <option value="N/A" disabled>Select Department</option>
                {departmentsList.map((dept, index) => (
                  <option key={index} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className={`w-full p-2 text-white rounded-md ${
              isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-teal hover:bg-peach"
            }`}
            disabled={isLoading}
          >
            {isLoading ? "Adding..." : "Add User"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddUsersModal;