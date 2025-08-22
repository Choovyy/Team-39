import React, { useState, useEffect } from "react";
import Navbar from "../../components/Navbar/Navbar";
import { toast } from "react-toastify";
import Header from "../../components/Header/Header";
import axios from "axios";

const AdminRecycleBin = () => {
  const [deletedData, setDeletedData] = useState([]);
  const [category, setCategory] = useState("users");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const address = getIpAddress();

  function getIpAddress() {
      const hostname = window.location.hostname;
      const indexOfColon = hostname.indexOf(':');
      return indexOfColon !== -1 ? hostname.substring(0, indexOfColon) : hostname;
  }

 
  const fetchDeletedData = async (selectedCategory) => {
    setIsLoading(true);
    setError(null);
  
    try {
      let apiUrl = `http://${address}:8080/recycle-bin/${selectedCategory}`;
  
      if (selectedCategory === "users") {
        apiUrl = `http://${address}:8080/admin/users/deleted`;  
      } else if (selectedCategory === "classes") {
        apiUrl = `http://${address}:8080/admin/classes/deleted`;  
      } else if (selectedCategory === "proposals") {
        apiUrl = `http://${address}:8080/admin/proposals/deleted`;  
      }
  
      const response = await axios.get(apiUrl, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
  
      setDeletedData(response.data || []);
    } catch (err) {
      console.error("Error fetching deleted data:", err);
      toast.error("Failed to load deleted records. Please try again.");
      setError(err.message || "Failed to load deleted records.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedData(category);
  }, [category]);

  return (
    <div className="grid grid-cols-[256px_1fr] min-h-screen">
      <Navbar userRole={"ADMIN"} />
      <div className="main-content bg-white text-teal p-11">
        {/* Header Section */}
        <div className="header flex justify-between items-center mb-6">
          <h1 className="text-lg font-semibold">Archived Data</h1>
          <Header />
        </div>

        {/* Filter by Category Section */}
        <div className="flex justify-between items-center mb-4">
          <label htmlFor="categoryFilter" className="font-medium text-gray-700">
            View Deleted:
          </label>
          <select
            id="categoryFilter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-gray-300 rounded-md px-4 py-2 bg-white"
          >
            <option value="users">Users</option>
            <option value="classes">Classes</option>
            <option value="proposals">Proposals</option>
          </select>
        </div>

        {/* Conditional Content (Loading, Error, Deleted Data) */}
        {isLoading ? (
          <p className="text-center text-gray-500">Loading deleted records...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <DeletedTable deletedData={deletedData} category={category} />
        )}
      </div>
    </div>
  );
};

const DeletedTable = ({ deletedData, category }) => {
  return (
    <div className="flex flex-col">
      <div className="overflow-x-auto">
        <div className="p-2 min-w-full inline-block align-middle">
          <div className="overflow-hidden rounded-lg border border-gray-300">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr className="bg-teal font-medium text-white">
                  {category === "users" ? (
                    <>
                      <th className="px-6 py-2 text-start text-md font-medium">Full Name</th>
                      <th className="px-6 py-2 text-start text-md font-medium">Email</th>
                      <th className="px-6 py-2 text-start text-md font-medium">Interests</th>
                      <th className="px-6 py-2 text-start text-md font-medium">Department</th>
                      <th className="px-6 py-2 text-start text-md font-medium">Role</th>
                    </>
                  ) : category === "classes" ? (
                    <>
                      <th className="px-6 py-2 text-start text-md font-medium">Course Code</th>
                      <th className="px-6 py-2 text-start text-md font-medium">Course Name</th>
                      <th className="px-6 py-2 text-start text-md font-medium">Section</th>
                      <th className="px-6 py-2 text-start text-md font-medium">School Year</th>
                      <th className="px-6 py-2 text-start text-md font-medium">Semester</th>
                      <th className="px-6 py-2 text-start text-md font-medium">Created By</th>
                    </>
                  ) : category === "proposals" ? (
                    <>
                      <th className="px-6 py-2 text-start text-md font-medium">Project Name</th>
                      <th className="px-6 py-2 text-start text-md font-medium">Description</th>
                      <th className="px-6 py-2 text-start text-md font-medium">Status</th>
                      <th className="px-6 py-2 text-start text-md font-medium">Reason</th>
                      <th className="px-6 py-2 text-start text-md font-medium">Features</th>
                      <th className="px-6 py-2 text-start text-md font-medium">Proposed By</th>
                    </>
                  ) : (
                    <>
                      <th className="px-6 py-2 text-start text-md font-medium">Name</th>
                      <th className="px-6 py-2 text-start text-md font-medium">Deleted At</th>
                    </>
                  )}
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {deletedData.length > 0 ? (
                  deletedData.map((item) => (
                    <tr key={item.cid || item.pid || item.id} className="hover:bg-gray-100">
                      {category === "users" ? (
                        <>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-teal-800">
                            {`${item.firstname || "N/A"} ${item.lastname || "N/A"}`}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-teal-800">
                            {item.email || "N/A"}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-teal-800">
                            {item.interests || "N/A"}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-teal-800">
                            {item.department || "N/A"}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-teal-800">
                            {item.role || "N/A"}
                          </td>
                        </>
                      ) : category === "classes" ? (
                        <>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-teal-800">
                            {item.courseCode || "N/A"}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-teal-800">
                            {item.courseDescription || "N/A"}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-teal-800">
                            {item.section || "N/A"}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-teal-800">
                            {item.schoolYear || "N/A"}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-teal-800">
                            {item.semester || "N/A"}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-teal-800">
                            {`${item.firstname || "N/A"} ${item.lastname || "N/A"}`}
                          </td>
                        </>
                      ) : category === "proposals" ? (
                        <>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-teal-800">
                            {item.projectName || "N/A"}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-teal-800">
                            {item.description || "N/A"}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-teal-800">
                            {item.status || "N/A"}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-teal-800">
                            {item.reason || "N/A"}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-teal-800">
                            <ul>
                              {item.features && item.features.length > 0 ? (
                                item.features.map((feature, index) => (
                                  <li key={index}>{`${feature.featureTitle}: ${feature.featureDescription}`}</li>
                                ))
                              ) : (
                                <li>No features available</li>
                              )}
                            </ul>
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-teal-800">
                            {item.proposedByName || "N/A"}
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-teal-800">
                            {item.name || "N/A"}
                          </td>
                          <td className="px-6 py-2 whitespace-nowrap text-sm text-teal-800">
                            {item.deletedAt || "N/A"}
                          </td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={category === "users" ? 7 : category === "proposals" ? 5 : 3} className="text-center text-gray-500 py-4">
                      No deleted records available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRecycleBin;