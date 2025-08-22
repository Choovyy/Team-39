import React, { useContext, useEffect, useState } from "react";
import Navbar from "../../../components/Navbar/Navbar";
import Header from "../../../components/Header/Header";
import { useNavigate } from "react-router-dom";
import AuthContext from "../../../services/AuthContext";
import ClassCard from "./ClassCard";
import axios from "axios";

const TeacherDashboard = () => {
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();

  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacherName, setTeacherName] = useState(""); // Store teacher's name
  const [currentPage, setCurrentPage] = useState(1);
  const classesPerPage = 6;

  const address = getIpAddress();

  function getIpAddress() {
    const hostname = window.location.hostname;
    const indexOfColon = hostname.indexOf(":");
    return indexOfColon !== -1 ? hostname.substring(0, indexOfColon) : hostname;
  }

  useEffect(() => {
    if (!authState.isAuthenticated) {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        const token = authState.token;
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch teacher profile
        const { data: userProfile } = await axios.get(
          `http://${address}:8080/user/profile/${authState.uid}`,
          { headers }
        );

        if (userProfile) {
          setTeacherName(`${userProfile.firstname} ${userProfile.lastname}`);
        }

        // Fetch classes created by the teacher
        const { data: classesData } = await axios.get(
          `http://${address}:8080/teacher/classes-created/${authState.uid}`,
          { headers }
        );

        setClasses(classesData || []);
      } catch (error) {
        console.error(
          "Error fetching dashboard data:",
          error.response?.data || error.message
        );

        // Ensure the error does not cause a bad user experience
        if (error.response?.status === 500) {
          setClasses([]); // Set empty classes to prevent further errors
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [authState, navigate]);

  const handleCreateClassClick = () => {
    navigate(`/teacher/create-class`);
  };

  const handleCardClick = (courseCode, section) => {
    navigate(`/teacher/class/${courseCode}/${section}`);
  };

  const indexOfLastClass = currentPage * classesPerPage;
  const indexOfFirstClass = indexOfLastClass - classesPerPage;
  const currentClasses = classes.slice(indexOfFirstClass, indexOfLastClass);

  const nextPage = () => {
    if (currentPage < Math.ceil(classes.length / classesPerPage)) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] min-h-screen">
      <Navbar userRole={authState.role} />

      <div className="main-content bg-white text-teal px-6 sm:px-12 md:px-20 lg:px-28 pt-8 md:pt-12">
        {/* Header Section */}
        <div className="header flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-lg font-semibold">
            Welcome, {teacherName || "Teacher"}
          </h1>
          <Header />
        </div>

        {/* Content Wrapper */}
        <div className="content flex flex-col bg-gray-200 rounded-2xl p-6 sm:p-8 min-h-[calc(100vh-8rem)]">
          <button
            onClick={handleCreateClassClick}
            className="joinclass-btn self-center sm:self-end w-full sm:w-1/2 md:w-1/6 bg-teal text-white rounded-lg py-2 px-4 text-sm hover:bg-peach transition-all"
          >
            Create Class
          </button>

          <div className="classes grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 mt-8">
            {loading ? (
              <p className="text-center text-teal">Loading...</p>
            ) : currentClasses.length > 0 ? (
              currentClasses.map((classData) => (
                <ClassCard
                  key={`${classData.courseCode}-${classData.section}`}
                  courseCode={classData.courseCode}
                  section={classData.section}
                  courseDescription={classData.courseDescription}
                  onClick={() =>
                    handleCardClick(classData.courseCode, classData.section)
                  }
                />
              ))
            ) : (
              <p className="text-center text-gray-500">No classes found</p>
            )}
          </div>

          {/* Pagination */}
          <div className="pagination flex justify-between gap-4 mt-14">
            <button
              onClick={prevPage}
              className="w-full sm:w-1/3 md:w-1/6 bg-slate-100 text-gray-400 rounded-lg py-2 px-4 text-sm"
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <button
              onClick={nextPage}
              className="w-full sm:w-1/3 md:w-1/6 bg-slate-100 text-gray-400 rounded-lg py-2 px-4 text-sm"
              disabled={
                currentPage === Math.ceil(classes.length / classesPerPage)
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
