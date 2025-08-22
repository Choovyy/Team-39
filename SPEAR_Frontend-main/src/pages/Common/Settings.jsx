import React, { useEffect, useState } from "react";
import Navbar from "../../components/Navbar/Navbar";
import Header from "../../components/Header/Header";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const [userRole, setUserRole] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const role = localStorage.getItem("role");
    if (!role) {
      navigate("/login"); // Redirect to login if no role found
    } else {
      setUserRole(role);
    }
  }, [navigate]);

  if (!userRole) {
    return <div>Loading...</div>; // Or a loading spinner
  }

  return (
    <div className="grid grid-cols-[256px_1fr] min-h-screen">
      <Navbar userRole={userRole} />
      <div className="main-content bg-white text-teal md:px-20 lg:px-28 pt-8 md:pt-12">
        <div className="header flex justify-between items-center mb-6">
          <h1 className="text-lg font-semibold">Profile Overview</h1>
          <Header />
        </div>

        <form className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col">
            <label htmlFor="firstname" className="block mb-2 font-medium">
              First Name
            </label>
            <input
              type="text"
              id="firstname"
              name="firstname"
              className="border rounded-md p-2 border-gray-300"
              placeholder="Enter your first name"
              disabled
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="lastname" className="block mb-2 font-medium">
              Last Name
            </label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              className="border rounded-md p-2 border-gray-300"
              placeholder="Enter your last name"
              disabled
            />
          </div>

          <div className="flex flex-col md:col-span-2">
            <label htmlFor="password" className="block mb-2 font-medium">
              Change Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="border rounded-md p-2 border-gray-300"
              placeholder="Enter a new password"
              disabled
            />
          </div>

          <div className="md:col-span-2">
            <button
              type="button"
              className="bg-teal text-white font-semibold rounded-md px-4 py-2 transition duration-300 hover:bg-gray-300 cursor-not-allowed"
              disabled
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;
