import React, { useEffect, useState, useContext } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Header from "../../components/Header/Header";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../services/AuthContext";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Shared util
function getIpAddress() {
  try {
    const hostname = window.location.hostname;
    const idx = hostname.indexOf(":");
    return idx !== -1 ? hostname.substring(0, idx) : hostname;
  } catch {
    return "localhost";
  }
}

const PasswordModal = ({ userId, token, onClose }) => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const address = getIpAddress();

  const [showPassword, setShowPassword] = useState({
    currentPassword: false,
    newPassword: false,
    confirmNewPassword: false,
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(p => ({ ...p, [name]: value }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(p => ({ ...p, [field]: !p[field] }));
  };

  const handlePasswordUpdate = async () => {
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmNewPassword) {
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
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        toast.success("Password updated successfully!");
        onClose();
      } else {
        toast.error(response.data.message || "Failed to update password.");
      }
    } catch (error) {
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
        {["currentPassword","newPassword","confirmNewPassword"].map(field => (
          <div key={field} className="mb-4">
            <label htmlFor={field} className="block mb-2 font-medium capitalize">
              {field.replace(/([A-Z])/g," $1").replace(/^./,s=>s.toUpperCase())}
            </label>
            <div className="relative">
              <input
                type={showPassword[field] ? "text":"password"}
                id={field}
                name={field}
                placeholder={field === "currentPassword" ? "Enter current password":"Enter new password"}
                value={passwordData[field]}
                onChange={handleInputChange}
                className="w-full border rounded-md p-3"
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility(field)}
                className="absolute right-3 top-3 text-gray-500"
              >
                {showPassword[field] ? "Hide":"Show"}
              </button>
            </div>
          </div>
        ))}
        <div className="flex justify-end space-x-4">
          <button onClick={handlePasswordUpdate} className="bg-teal text-white px-4 py-2 rounded-lg hover:bg-teal-dark transition">
            Update Password
          </button>
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const StudentSettings = () => {
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  const [userData, setUserData] = useState({
    email: "",
    firstname: "",
    lastname: ""
  });

  const [profileData, setProfileData] = useState({
    profilePicture: "",
    github: "",
    facebook: ""
  });

  const address = getIpAddress();

  useEffect(() => {
    if (!authState?.uid) return;
    fetchStudentData();
  }, [authState?.uid]);

  const fetchStudentData = async () => {
    try {
      const userResp = await axios.get(
        `http://${address}:8080/get-student/${authState.uid}`,
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );
      const { email, firstname, lastname } = userResp.data;
      setUserData({ email, firstname: firstname || "", lastname: lastname || "" });

      const profileResp = await axios.get(
        `http://${address}:8080/api/profile/${authState.uid}`,
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );
      setProfileData({
        profilePicture: profileResp.data.profilePicture || "",
        github: profileResp.data.github || "",
        facebook: profileResp.data.facebook || ""
      });
    } catch (e) {
      toast.error("Error fetching data.");
    }
  };

  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "firstname" || name === "lastname") {
      setUserData(p => ({ ...p, [name]: value }));
    } else if (name === "github" || name === "facebook") {
      setProfileData(p => ({ ...p, [name]: value }));
    }
  };

  const sanitizeSocial = v => {
    const t = (v || "").trim();
    return t === "" ? null : t;
  };

  const handleSaveChanges = async () => {
    try {
      const userPayload = {
        firstname: userData.firstname.trim(),
        lastname: userData.lastname.trim()
      };
      const profilePayload = {
        profilePicture: profileData.profilePicture || null,
        github: sanitizeSocial(profileData.github),
        facebook: sanitizeSocial(profileData.facebook)
      };

      await axios.put(
        `http://${address}:8080/student/update/${authState.uid}`,
        userPayload,
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );

      await axios.put(
        `http://${address}:8080/api/profile/${authState.uid}`,
        profilePayload,
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );

      toast.success("Settings saved.");
      await fetchStudentData();
    } catch (e) {
      toast.error(e.response?.data?.message || "Save failed.");
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
          <form
            className="bg-gray-100 shadow-md rounded-lg p-8 space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveChanges();
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="email" className="block mb-2 font-medium">Email</label>
                <input
                  id="email"
                  value={userData.email}
                  className="w-full border rounded-md p-3 bg-gray-100 cursor-not-allowed"
                  disabled
                />
              </div>
              <div>
                <label htmlFor="firstname" className="block mb-2 font-medium">First Name</label>
                <input
                  id="firstname"
                  name="firstname"
                  value={userData.firstname}
                  onChange={handleUserInputChange}
                  className="w-full border rounded-md p-3"
                />
              </div>
              <div>
                <label htmlFor="lastname" className="block mb-2 font-medium">Last Name</label>
                <input
                  id="lastname"
                  name="lastname"
                  value={userData.lastname}
                  onChange={handleUserInputChange}
                  className="w-full border rounded-md p-3"
                />
              </div>
              <div>
                <label htmlFor="github" className="block mb-2 font-medium">GitHub Profile Link (optional)</label>
                <input
                  type="url"
                  id="github"
                  name="github"
                  value={profileData.github}
                  onChange={handleUserInputChange}
                  className="w-full border rounded-md p-3"
                  placeholder="https://github.com/yourusername"
                />
              </div>
              <div>
                <label htmlFor="facebook" className="block mb-2 font-medium">Facebook Profile Link (optional)</label>
                <input
                  type="url"
                  id="facebook"
                  name="facebook"
                  value={profileData.facebook}
                  onChange={handleUserInputChange}
                  className="w-full border rounded-md p-3"
                  placeholder="https://facebook.com/yourprofile"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-between mt-6 space-y-3 sm:space-y-0 sm:space-x-4">
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(true)}
                className="bg-teal text-white px-6 py-2 rounded-lg hover:bg-teal-dark transition"
              >
                Change Password
              </button>
              <button
                type="submit"
                className="bg-teal text-white px-6 py-2 rounded-lg hover:bg-teal-dark transition"
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