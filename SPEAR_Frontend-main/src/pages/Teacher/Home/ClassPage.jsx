import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import AuthContext from "../../../services/AuthContext";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ClassPage = () => {
  const { authState, storeEncryptedId } = useContext(AuthContext);
  const { courseCode, section } = useParams();
  const navigate = useNavigate();

  const [classDetails, setClassDetails] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdviserModalOpen, setIsAdviserModalOpen] = useState(false);
  const [studentsWithoutTeam, setStudentsWithoutTeam] = useState([]);

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

    const fetchClassDetails = async () => {
      try {
        const token = authState.token;
        const { data } = await axios.get(
          `http://${address}:8080/teacher/class/${courseCode}/${section}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setClassDetails(data.classes);
        storeEncryptedId("cid", data.classes.cid);

        const [
          { data: totalUsersData },
          { data: studentsData },
          { data: studentsNoTeamData },
        ] = await Promise.all([
          axios.get(
            `http://${address}:8080/class/${data.classes.cid}/total-users`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            `http://${address}:8080/class/${data.classes.classKey}/students`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.get(
            `http://${address}:8080/class/${data.classes.cid}/students-without-team`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        setTotalUsers(totalUsersData || 0);
        setStudents(studentsData || []);
        setStudentsWithoutTeam(studentsNoTeamData || []);
      } catch (error) {
        console.error("Error fetching class data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchClassDetails();
  }, [courseCode, section, authState, storeEncryptedId, navigate]);

  const handleKickStudent = async (email) => {
    if (!window.confirm(`Remove student with email: ${email}?`)) return;
    try {
      await axios.post(
        `http://${address}:8080/teacher/remove-student`,
        { classKey: classDetails.classKey, email },
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );
      setStudents(students.filter((student) => student.email !== email));
      setTotalUsers((prev) => prev - 1);
    } catch (error) {
      console.error("Error kicking student:", error);
      toast.error("Error removing student. Try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-teal">Loading...</p>
      </div>
    );
  }

  if (!classDetails) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-lg font-semibold text-red-500">
          Class details not found.
        </p>
      </div>
    );
  }

  return (
  <>
   <ToastContainer position="top-right" autoClose={3000} />
    <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] min-h-screen">
      <Navbar userRole={authState?.role} />

      <div className="main-content bg-white text-teal px-4 sm:px-6 md:px-20 lg:px-28 pt-6 md:pt-12">
        {/* Back Button */}
        <button
          className="bg-teal text-white px-4 py-2 rounded-lg hover:bg-peach hover:text-white mb-4 w-full sm:w-auto"
          onClick={() => navigate(-1)}
        >
          Back
        </button>

        {/* Header Section */}
        <div className="header flex flex-col gap-4 md:flex-row justify-between items-start md:items-center mb-6">
          <h1 className="text-md sm:text-lg font-semibold">
            {classDetails.courseCode} - {classDetails.courseDescription} -{" "}
            {classDetails.section}
          </h1>
          <div className="flex flex-wrap gap-2">
            <button
              className="bg-teal text-white px-4 py-2 rounded-lg hover:bg-peach hover:text-white"
              onClick={() => navigate(`/teacher/teams`)}
            >
              View Teams
            </button>
            <button
              className="bg-teal text-white px-4 py-2 rounded-lg hover:bg-peach hover:text-white"
              onClick={() => navigate(`/teacher/project-proposals`)}
            >
              View Project Proposals
            </button>
            <button
              className="bg-teal text-white px-4 py-2 rounded-lg hover:bg-peach hover:text-white"
              onClick={() => navigate(`/teacher/evaluations`)}
            >
              View Evaluations
            </button>
            <button
              className="text-teal hover:text-teal-dark transition-all duration-300"
              onClick={() => navigate(`/class-settings`)}
            >
              <i className="fas fa-cog text-2xl"></i>
            </button>
          </div>
        </div>

        {/* Class Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Class Key:{" "}
              <span className="text-base font-semibold text-teal">
                {classDetails.classKey}
              </span>
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">
              Total Enrollees in Class:{" "}
              <span className="text-base font-semibold text-teal">
                {totalUsers}
              </span>
            </p>
          </div>
        </div>

        {isAdviserModalOpen && (
          <AdviserCandidateModal onClose={() => setIsAdviserModalOpen(false)} />
        )}

        {/* Enrolled Students */}
        <h2 className="text-lg font-semibold mb-4 text-teal">
          Enrolled Students
        </h2>
        {students.length > 0 ? (
          <div className="overflow-x-auto max-h-96 rounded-lg shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="sticky top-0 bg-teal text-white z-20 shadow-lg">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    First Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Last Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {students.map((student, index) => (
                  <tr key={index}>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {student.firstname}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {student.lastname}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {student.email}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {student.role || "Student"}
                    </td>
                    <td className="px-4 py-4 text-sm">
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded-lg"
                        onClick={() => handleKickStudent(student.email)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500">No students enrolled in this class.</p>
        )}

        {/* Students Without Team */}
        <h2 className="text-lg font-semibold mt-8 mb-4 text-teal">
          Students without Team
        </h2>
        {students.length === 0 ? (
          <p className="text-gray-500">No students enrolled in this class.</p>
        ) : studentsWithoutTeam.length === 0 ? (
          <p className="text-gray-500">All students have teams.</p>
        ) : (
          <div className="overflow-x-auto max-h-96 rounded-lg shadow-md mb-12">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="sticky top-0 bg-yellow-500 text-white z-20 shadow">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    First Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Last Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {studentsWithoutTeam.map((student, index) => (
                  <tr key={index}>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {student.firstname}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {student.lastname}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">
                      {student.email}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default ClassPage;
