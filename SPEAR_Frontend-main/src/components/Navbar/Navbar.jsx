import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/imgs/logo-light.png";
import dashboardIcon from "../../assets/icons/dashboard-icon.svg";
import teamIcon from "../../assets/icons/teams-icon.svg";
import settingsIcon from "../../assets/icons/settings-icon.svg";
import logOutIcon from "../../assets/icons/log-out-icon.svg";
import userIcon from "../../assets/icons/user-icon.svg";
import trashcanIcon from "../../assets/icons/trash-bin.png";
import schedule from "../../assets/icons/schedule.png";
import teamapplication from "../../assets/icons/team-appliication.png";
import teacheradviser from "../../assets/icons/my-adviser.png";
import evaluationadmin from "../../assets/icons/evaluationadmin.png";
import questionadmin from "../../assets/icons/questionadmin.png";
 
const Navbar = ({ userRole }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLogOutOpen, setLogOutOpen] = useState(false);
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navItemsByRole = {
    STUDENT: [
      { label: "My Classes", path: "/student-dashboard", icon: dashboardIcon },
      { label: "My Team Applications", path: "/student/team-applications", icon: teamapplication},
      { label: "Team Evaluations", path: "/student/evaluations", icon: teamIcon },
      { label: "Settings", path: "/student-settings", icon: settingsIcon },
      
    ],
    TEACHER: [
      { label: "Dashboard", path: "/teacher-dashboard", icon: dashboardIcon },
      { label: "My Schedules", path: "/teacher-schedules", icon: schedule },
      { label: "My Advisories", path: "/teacher/teacher-advisories", icon: teacheradviser },
      { label: "Evaluations", path: "/teacher/evaluation-teacher", icon: teamIcon },
      { label: "Settings", path: "/teacher-settings", icon: settingsIcon },
    ],
    ADMIN: [
      { label: "Dashboard", path: "/admin-dashboard", icon: dashboardIcon },
      { label: "Manage Users", path: "/manage-users", icon: userIcon },
      { label: "Evaluations", path: "/admin-evaluations", icon: evaluationadmin },
      { label: "Questionnaires ", path: "/admin-question-templates", icon: questionadmin },
      { label: "Archives", path: "/admin-recycle-bin", icon: trashcanIcon },
      { label: "Settings", path: "/admin-settings", icon: settingsIcon },
    ],
  };

  const navItems = navItemsByRole[userRole] || [];

  const handleLogOut = () => {
    // Remove all session-related data
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("uid");
    localStorage.removeItem("cid");
    localStorage.removeItem("tid");
    localStorage.removeItem("pid");
    localStorage.removeItem("eid");
    localStorage.removeItem("qid");
    navigate("/login");
  
    setTimeout(() => {
      window.location.reload();
    }, 100);
    
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMobileNavOpen(false); // Close mobile nav on larger screens
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const NavItem = ({ label, path, icon }) => (
    <li
      className={`flex items-center p-3 rounded-md text-base transition-all duration-300 ${
        isActive(path)
          ? "bg-peach text-white"
          : "hover:bg-peach hover:text-white"
      }`}
    >
      <img src={icon} alt={`${label} Icon`} className="w-5 h-5 mr-3" />
      <Link
        to={path}
        className="flex-1"
        onClick={() => setMobileNavOpen(false)}
      >
        {label}
      </Link>
    </li>
  );

  return (
    <div>
      {/* Mobile Navigation */}
      <div className="bg-teal text-white p-4 flex items-center justify-between md:hidden fixed top-0 left-0 w-full z-40">
        <img src={logo} alt="Logo" className="w-12 h-12 rounded-md" />
        <button
          className="h-6 w-6 text-white"
          onClick={() => setMobileNavOpen(!isMobileNavOpen)}
        >
          {isMobileNavOpen ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="h-6 w-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 6h16M4 12h16m-7 6h7"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Navigation Drawer */}
      {isMobileNavOpen && (
        <div className="bg-teal text-white w-full absolute top-16 left-0 z-50 md:hidden mt-4">
          <ul className="space-y-2 px-4 py-6">
            {navItems.map((item) => (
              <NavItem key={item.path} {...item} />
            ))}
            <li
              className="flex items-center p-3 rounded-md text-base transition-all duration-300 hover:bg-peach hover:text-white"
              onClick={() => setLogOutOpen(true)}
            >
              <img
                src={logOutIcon}
                alt="Log Out Icon"
                className="w-5 h-5 mr-3"
              />
              <span className="flex-1">Log Out</span>
            </li>
          </ul>
        </div>
      )}

      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full w-64 bg-teal bg-opacity- text-white p-6 flex-col items-center fixed top-0 left-0">
        <div className="flex flex-col items-center mb-8">
          <img
            src={logo}
            alt="Company Logo"
            className="w-24 h-auto rounded-md"
          />
        </div>
        <ul className="flex flex-col mt-10 space-y-10">
          {navItems.map((item) => (
            <NavItem key={item.path} {...item} />
          ))}
          <li
            className="flex items-center p-3 rounded-md text-base transition-all duration-300 hover:bg-peach hover:text-white"
            onClick={() => setLogOutOpen(true)}
          >
            <img src={logOutIcon} alt="Log Out Icon" className="w-5 h-5 mr-3" />
            <span className="flex-1 cursor-pointer">Log Out</span>
          </li>
        </ul>
      </div>

      {/* Log Out Modal */}
      {isLogOutOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white text-teal p-6 rounded-md shadow-md text-center">
            <p>Are you sure you want to log out?</p>
            <div className="mt-4 flex justify-center space-x-4">
              <button
                onClick={() => setLogOutOpen(false)}
                className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleLogOut}
                className="bg-teal text-white px-4 py-2 rounded hover:bg-peach"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Navbar;