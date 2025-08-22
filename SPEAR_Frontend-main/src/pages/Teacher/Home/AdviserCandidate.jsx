import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import AuthContext from "../../../services/AuthContext";
import axios from "axios";

const departmentsList = [
  "College of Engineering and Architecture",
  "College of Management, Business & Accountancy",
  "College of Arts, Sciences & Education",
  "College of Nursing & Allied Health Sciences",
  "College of Computer Studies",
  "College of Criminal Justice",
];

const getIpAddress = () => {
  const hostname = window.location.hostname;
  const indexOfColon = hostname.indexOf(":");
  return indexOfColon !== -1 ? hostname.substring(0, indexOfColon) : hostname;
};

const address = getIpAddress();

const AdviserCandidate = () => {
  const { authState, getDecryptedId } = useContext(AuthContext);
  const navigate = useNavigate();
  const [classId, setClassId] = useState(
    getDecryptedId("cid") || authState.classId || null
  );
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [teachers, setTeachers] = useState([]);
  const [selectedAdvisers, setSelectedAdvisers] = useState([]);
  const [loadingAdvisers, setLoadingAdvisers] = useState(false);

  useEffect(() => {
    if (!authState.isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!classId) {
      const storedClassId =
        getDecryptedId("cid") || localStorage.getItem("cid");
      if (storedClassId) {
        setClassId(storedClassId);
      }
    }

    if (selectedDepartment) {
      fetchTeachersByDepartment(selectedDepartment);
    }

    if (classId) {
      fetchQualifiedAdvisers();
    }
  }, [selectedDepartment, authState, navigate, classId]);

  const fetchTeachersByDepartment = async (department) => {
    try {
      const encodedDepartment = encodeURIComponent(department);
      const response = await axios.get(
        `http://${address}:8080/teacher/see-teachers/${encodedDepartment}`,
        {
          headers: { Authorization: `Bearer ${authState.token}` },
        }
      );

      setTeachers(response.data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
    }
  };

  const fetchQualifiedAdvisers = async () => {
    if (!classId) return;

    setLoadingAdvisers(true);
    try {
      const response = await axios.get(
        `http://${address}:8080/class/${classId}/qualified-advisers`,
        {
          headers: { Authorization: `Bearer ${authState.token}` },
        }
      );

      setSelectedAdvisers(response.data);
    } catch (error) {
      console.error("Error fetching qualified advisers:", error);
    } finally {
      setLoadingAdvisers(false);
    }
  };

  const selectAdviser = async (teacher) => {
    if (!classId || !teacher?.email) return;
    const isAlreadySelected = selectedAdvisers.some(
      (adviser) => adviser.email === teacher.email
    );
    if (isAlreadySelected) {
      console.warn(`Adviser ${teacher.email} is already selected.`);
      alert(
        `Adviser ${teacher.firstname} ${teacher.lastname} is already selected.`
      );
      return;
    }

    try {
      await axios.post(
        `http://${address}:8080/teacher/${classId}/qualified-adviser`,
        { email: teacher.email },
        {
          headers: { Authorization: `Bearer ${authState.token}` },
        }
      );

      setSelectedAdvisers([...selectedAdvisers, teacher]);
      setTeachers(teachers.filter((t) => t.email !== teacher.email));
    } catch (error) {
      console.error("Error adding adviser:", error);
    }
  };

  const removeAdviser = async (teacher) => {
    if (!classId || !teacher?.email) return;

    try {
      await axios.delete(
        `http://${address}:8080/teacher/${classId}/qualified-adviser?email=${encodeURIComponent(
          teacher.email
        )}`,
        {
          headers: { Authorization: `Bearer ${authState.token}` },
        }
      );

      setSelectedAdvisers(
        selectedAdvisers.filter((t) => t.email !== teacher.email)
      );
      setTeachers([...teachers, teacher]);
    } catch (error) {
      console.error("Error removing adviser:", error);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] min-h-screen">
      <Navbar userRole={authState?.role} />

      <div className="main-content bg-white text-teal p-4 sm:p-6 md:px-20 lg:px-28 pt-8 md:pt-12">
        <button
          className="bg-[#008080] text-white px-4 py-2 rounded-lg hover:bg-[#ffdab9] transition"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
        <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-700">
          Select Advisers for Your Class
        </h2>

        {/* Department Selector */}
        <label className="block text-lg sm:text-xl font-medium mb-2">
          Choose a Department:
        </label>
        <select
          className="w-full p-3 border rounded-md mb-6 bg-gray-50 text-gray-800"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
        >
          <option value="">-- Select Department --</option>
          {departmentsList.map((dept, index) => (
            <option key={index} value={dept}>
              {dept}
            </option>
          ))}
        </select>

        {/* Available Teachers Table */}
        <h3 className="text-lg sm:text-xl font-semibold mb-3 text-gray-600">
          Available Teachers
        </h3>
        <div className="overflow-x-auto rounded-lg shadow-md bg-white p-4 border border-gray-300">
          <table className="w-full border-collapse border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-3 text-left text-sm sm:text-base text-gray-700">
                  Name
                </th>
                <th className="border p-3 text-left text-sm sm:text-base text-gray-700">
                  Email
                </th>
                <th className="border p-3 text-left text-sm sm:text-base text-gray-700">
                  Interests
                </th>
                <th className="border p-3 text-center text-sm sm:text-base text-gray-700">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {teachers.length > 0 ? (
                teachers.map((teacher, index) => (
                  <tr key={index} className="hover:bg-gray-100 transition">
                    <td className="border p-3">
                      {teacher.firstname} {teacher.lastname}
                    </td>
                    <td className="border p-3">{teacher.email}</td>
                    <td className="border p-3">{teacher.interests}</td>
                    <td className="border p-3 text-center">
                      <button
                        className="bg-[#008080] text-white px-4 py-2 rounded-lg hover:bg-[#ffdab9] transition"
                        onClick={() => selectAdviser(teacher)}
                      >
                        Select Adviser
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="border p-3 text-center text-gray-500"
                  >
                    No teachers available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Selected Advisers Table */}
        <h3 className="text-lg sm:text-xl font-semibold mt-8 mb-3 text-gray-600">
          Selected Advisers
        </h3>
        <div className="overflow-x-auto rounded-lg shadow-md bg-white p-4 border border-gray-300">
          {loadingAdvisers ? (
            <p className="text-center text-gray-500">Loading advisers...</p>
          ) : (
            <table className="w-full border-collapse border border-gray-200">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-3 text-left text-sm sm:text-base text-gray-700">
                    Name
                  </th>
                  <th className="border p-3 text-left text-sm sm:text-base text-gray-700">
                    Email
                  </th>
                  <th className="border p-3 text-left text-sm sm:text-base text-gray-700">
                    Interests
                  </th>
                  <th className="border p-3 text-center text-sm sm:text-base text-gray-700">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {selectedAdvisers.length > 0 ? (
                  selectedAdvisers.map((adviser, index) => (
                    <tr key={index} className="hover:bg-gray-100 transition">
                      <td className="border p-3">
                        {adviser.firstname} {adviser.lastname}
                      </td>
                      <td className="border p-3">{adviser.email}</td>
                      <td className="border p-3">{adviser.interests}</td>
                      <td className="border p-3 text-center">
                        <button
                          className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition"
                          onClick={() => removeAdviser(adviser)}
                        >
                          ✖ Remove
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan="4"
                      className="border p-3 text-center text-gray-500"
                    >
                      No advisers selected yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdviserCandidate;
