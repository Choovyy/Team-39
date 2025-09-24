import React, { useEffect, useState, useContext } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Header from "../../components/Header/Header";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../services/AuthContext";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const PasswordModal = ({ userId, token, onClose }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });

  const address = getIpAddress();

  function getIpAddress() {
    const hostname = window.location.hostname;
    const indexOfColon = hostname.indexOf(":");
    return indexOfColon !== -1 ? hostname.substring(0, indexOfColon) : hostname;
  }

  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const handlePasswordUpdate = async () => {
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmNewPassword
    ) {
      toast.error("All fields must be filled!");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error("New password and confirm password do not match!");
      return;
    }

    try {
      const response = await axios.put(
        `http://${address}:8080/user/update-password/${userId}`,
        {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Password updated successfully!");
        onClose();
      } else {
        toast.error(response.data.message || "Failed to update password.");
      }
    } catch (error) {
      console.error("Error updating password:", error);
      if (error.response?.data?.message === "Current password is incorrect.") {
        toast.error("The current password you entered is incorrect.");
      } else {
        toast.error("Error updating password. Please try again.");
      }
    }
  };

  return (
    <div className="modal bg-gray-800 bg-opacity-75 fixed inset-0 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-96">
        <h2 className="text-lg font-semibold mb-4">Change Password</h2>
        {["currentPassword", "newPassword", "confirmNewPassword"].map(
          (field) => (
            <div key={field} className="mb-4">
              <label
                htmlFor={field}
                className="block mb-2 font-medium capitalize"
              >
                {field
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())}
              </label>
              <div className="relative">
                <input
                  type={showPassword[field] ? "text" : "password"}
                  id={field}
                  name={field}
                  placeholder={
                    field === "currentPassword"
                      ? "Enter current password"
                      : "Enter new password"
                  }
                  value={passwordData[field]}
                  onChange={handleInputChange}
                  className="w-full border rounded-md p-3"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility(field)}
                  className="absolute right-3 top-3 text-gray-500"
                >
                  {showPassword[field] ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          )
        )}
        <div className="flex justify-end space-x-4">
          <button
            onClick={handlePasswordUpdate}
            className="bg-teal text-white px-4 py-2 rounded-lg hover:bg-teal-dark transition duration-300"
          >
            Update Password
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition duration-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const StudentSettings = () => {
  const { authState } = useContext(AuthContext);
  const [userData, setUserData] = useState({
    email: "",
    firstname: "",
    lastname: "",
  });

  const address = getIpAddress();

  function getIpAddress() {
    const hostname = window.location.hostname;
    const indexOfColon = hostname.indexOf(":");
    return indexOfColon !== -1 ? hostname.substring(0, indexOfColon) : hostname;
  }

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authState || !authState.uid) {
      navigate("/login");
    } else {
      fetchStudentData();
    }
  }, [authState, navigate]);

  const fetchStudentData = async () => {
    try {
      const response = await axios.get(
        `http://${address}:8080/get-student/${authState.uid}`,
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        }
      );

      const { email, firstname, lastname } = response.data;
      setUserData({ email, firstname, lastname });
    } catch (error) {
      console.error("Error fetching student data:", error);
      alert("Error fetching student data. Please try again.");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSaveChanges = async () => {
    try {
      const response = await axios.put(
        `http://${address}:8080/student/update/${authState.uid}`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Profile updated successfully!");
      } else {
        toast.error(response.data.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Error updating profile. Please try again.");
    }
  };

  return (
    <>
    <ToastContainer position="top-right" autoClose={3000} />
    <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] min-h-screen">
      <Navbar userRole="STUDENT" />

      <div className="main-content bg-white text-teal md:px-20 lg:px-28 pt-8 md:pt-12">
        <div className="header flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Student Settings</h1>
          <Header />
        </div>

        {/* Read-only Survey Results Section */}
        <div className="bg-gray-50 shadow-md rounded-lg p-8 mb-8">
          <h2 className="text-xl font-semibold mb-4 text-teal">Your Survey Results</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <span className="block text-gray-500 font-medium mb-1">Preferred Role</span>
                <div className="text-lg font-bold text-teal bg-white rounded px-3 py-2 shadow-sm">Backend Developer</div>
              </div>
              <div className="mb-4">
                <span className="block text-gray-500 font-medium mb-1">Project Interest</span>
                <div className="text-lg font-bold text-teal bg-white rounded px-3 py-2 shadow-sm">Mobile Apps</div>
              </div>
            </div>
            <div>
              <div className="mb-4">
                <span className="block text-gray-500 font-medium mb-1">Technical Skills</span>
                <div className="space-y-2">
                  <div className="flex justify-between items-center bg-white rounded px-3 py-2 shadow-sm">
                    <span className="font-semibold text-teal">JavaScript</span>
                    <span className="font-bold text-green-500">33%</span>
                  </div>
                  <div className="flex justify-between items-center bg-white rounded px-3 py-2 shadow-sm">
                    <span className="font-semibold text-teal">Python</span>
                    <span className="font-bold text-gray-400">0%</span>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <span className="block text-gray-500 font-medium mb-1">Personality Results</span>
                <div className="bg-white rounded px-3 py-2 shadow-sm text-teal">
                  Visionary Explorer (Independent, Innovative, Adaptive, Big Picture)<br/>
                  Traits: Independent, Innovative, Adaptive, Big Picture
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Editable Profile Section (existing) */}
        <form
          className="bg-gray-100 shadow-md rounded-lg p-8 space-y-6"
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveChanges();
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="email" className="block mb-2 font-medium">
                Email
              </label>
              <input
                type="text"
                id="email"
                name="email"
                value={userData.email}
                className="w-full border rounded-md p-3 bg-gray-100 cursor-not-allowed"
                disabled
              />
            </div>
            <div>
              <label htmlFor="firstname" className="block mb-2 font-medium">
                First Name
              </label>
              <input
                type="text"
                id="firstname"
                name="firstname"
                value={userData.firstname}
                onChange={handleInputChange}
                className="w-full border rounded-md p-3"
              />
            </div>
            <div>
              <label htmlFor="lastname" className="block mb-2 font-medium">
                Last Name
              </label>
              <input
                type="text"
                id="lastname"
                name="lastname"
                value={userData.lastname}
                onChange={handleInputChange}
                className="w-full border rounded-md p-3"
              />
            </div>
            <div>
              <label htmlFor="personalEmail" className="block mb-2 font-medium">
                Personal Email
              </label>
              <input
                type="email"
                id="personalEmail"
                name="personalEmail"
                value={userData.personalEmail || ''}
                onChange={handleInputChange}
                className="w-full border rounded-md p-3"
                placeholder="Enter your personal email"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between mt-6 space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={() => setIsPasswordModalOpen(true)}
              className="bg-teal text-white px-6 py-2 rounded-lg hover:bg-teal-dark transition duration-300"
            >
              Change Password
            </button>
            <button
              type="submit"
              className="bg-teal text-white px-6 py-2 rounded-lg hover:bg-teal-dark transition duration-300"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>

      {isPasswordModalOpen && (
        <PasswordModal
          userId={authState.uid}
          token={authState.token}
          onClose={() => setIsPasswordModalOpen(false)}
        />
      )}
    </div>
    </>
  );
};

export default StudentSettings;
