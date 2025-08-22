import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import AuthContext from "../../services/AuthContext";
import axios from "axios";
import { PlusCircle, FileQuestion, Trash2 } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminQuestionTemplates = () => {
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();
  const [sets, setSets] = useState([]);
  const [selectedSet, setSelectedSet] = useState("");
  const [loading, setLoading] = useState(true);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showSetModal, setShowSetModal] = useState(false);
  const [confirmationModal, setConfirmationModal] = useState(false);
  const [isEditingQuestion, setIsEditingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [newQuestion, setNewQuestion] = useState({ questionTitle: "", questionDetails: "", questionType: "INPUT" });
  const [newSetName, setNewSetName] = useState("");
  const [error, setError] = useState("");
  const [showRenameModal, setShowRenameModal]   = useState(false);
  const [renameSetId,    setRenameSetId]        = useState(null);
  const [renameSetName,  setRenameSetName]      = useState("");
    

  const address = window.location.hostname;

  useEffect(() => {
    fetchSets();
  }, []);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const fetchSets = async () => {
    try {
      const { data } = await axios.get(`http://${address}:8080/templates/admin/my-template-sets`, {
        headers: {
          Authorization: `Bearer ${authState.token}`,
        },
      });
      setSets(data);
    } catch (error) {
      console.error("Error fetching sets:", error);
      toast.error("Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSet = async () => {
    if (!newSetName.trim()) {
      setError("Set name is required.");
      return;
    }
  
    if (!authState.uid || !authState.token) {
      console.error("User ID or token is missing");
      setError("User not authenticated");
      return;
    }
  
    try {
      const response = await axios.post(
        `http://${address}:8080/templates/admin/create-set?name=${newSetName}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${authState.token}`,
          },
        }
      );
  
      const newSet = response.data;
      setSets([...sets, newSet]);
      toast.success("Set created successfully");
      setNewSetName("");
      setShowSetModal(false);
      setError("");
    } catch (error) {
      const msg = error?.response?.data?.message || "Failed to create set";
      toast.error(msg);
      setError(msg);
    }
  };

  const handleDeleteSet = async () => {
    if (!selectedSet) return;
    if (!window.confirm(
      "Are you sure you want to delete this template set?\n\n"
    + "• This will permanently remove the set and all its associated templates.\n"
    + "• This action cannot be undone."
    )) return;
    try {
      await axios.delete(`http://${address}:8080/templates/admin/delete-set/${selectedSet}`);
      toast.success("Set deleted successfully");
      setSelectedSet("");
      fetchSets();
    } catch (error) {
      console.error("Error deleting set:", error);
      toast.error("Failed to delete set");
    }
  };

  const handleCreateOrUpdateQuestion = async () => {
    if (!selectedSet) {
      setError("Please select a set first.");
      return;
    }
    if (!newQuestion.questionTitle.trim()) {
      setError("Question text is required.");
      return;
    }

    const payload = {
      ...newQuestion,
      createdByUserId: authState.uid,
    };

    try {
      if (isEditingQuestion) {
        await axios.put(
          `http://${address}:8080/templates/admin/update-question/${editingQuestionId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${authState.token}`,
            },
          }
        );
        toast.success("Question updated successfully!");
      } else {
        await axios.post(
          `http://${address}:8080/templates/admin/add-question/${selectedSet}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${authState.token}`,
            },
          }
        );
        toast.success("Question created successfully!");
      }

      fetchSets();
      setShowQuestionModal(false);
      setNewQuestion({ questionTitle: "", questionDetails: "", questionType: "INPUT" });
      setIsEditingQuestion(false);
      setError("");
    } catch (error) {
      console.error("Error saving question:", error);
      setError(error.response?.data?.message || "Failed to save question.");
      toast.error("Failed to save question");
    }
  };

  const handleEditQuestion = (question) => {
    setNewQuestion({
      questionTitle: question.questionTitle,
      questionDetails: question.questionDetails,
      questionType: question.questionType,
    });
    setEditingQuestionId(question.id);
    setIsEditingQuestion(true);
    setShowQuestionModal(true);
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await axios.delete(`http://${address}:8080/templates/admin/delete-question/${id}`);
      toast.success("Question deleted successfully");
      fetchSets();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error("Failed to delete question");
    }
  };
  

  return (
    <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] min-h-screen">
      <Navbar userRole={authState.role} />
      <div className="p-8 bg-white shadow-md rounded-md w-full">
        <div className="flex justify-between items-center mb-6">
        </div>

        <h1 className="text-2xl font-semibold text-teal text-center mb-6">Question Templates</h1>

        <div className="flex justify-between mb-4">

       <select
     className="border border-gray-300 rounded-md px-4 py-2 bg-white"
      value={selectedSet}
     onChange={(e) => setSelectedSet(e.target.value)}
     >
      <option value="">Select Template</option>
      {sets.map((set) => (
        <option key={set.id} value={set.id}>
        {set.name}
      </option>
      ))}
     </select>

          <div className="flex space-x-2">
          <button
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center justify-center space-x-2"
           onClick={() => setShowSetModal(true)}
          >
            <PlusCircle className="h-4 w-4 mr-2" /> 
       Create Template
          </button>
          <button
            className="bg-[#323c47] text-white px-4 py-2 rounded-md hover:bg-gray-900 transition flex items-center justify-center space-x-2"
            onClick={() => setShowQuestionModal(true)}
         >
          <FileQuestion className="h-4 w-4 mr-2" />
      Create Question
    </button>
    <button
      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-700 flex items-center justify-center space-x-2"
      onClick={handleDeleteSet}
      // onClick={() => setConfirmationModal(true)}
    >
      <Trash2 className="h-4 w-4 mr-2" />
      Delete Template
    </button>
    <button
      className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 flex items-center space-x-2"
      disabled={!selectedSet}
      onClick={() => {
        setRenameSetId(selectedSet);
        // preload the current name:
        const current = sets.find(s => s.id === +selectedSet);
        setRenameSetName(current?.name || "");
        setShowRenameModal(true);
      }}
    >
      Rename Template
  </button>
  </div>
</div>


        <div className="overflow-y-auto max-h-96 rounded-lg shadow-md">
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : selectedSet && sets.find((s) => s.id === parseInt(selectedSet))?.questions.length > 0 ? (
            <table className="min-w-full border border-gray-300">
              <thead className="sticky top-0 bg-[#323c47] text-white shadow-md">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Question</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Details</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Type</th>
                  <th className="px-4 py-2 text-left text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sets.find((s) => s.id === parseInt(selectedSet))?.questions.map((question, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-2">{question.questionTitle}</td>
                    <td className="px-4 py-2">{question.questionDetails}</td>
                    <td className="px-4 py-2 capitalize">{question.questionType}</td>
                    <td className="px-4 py-2 space-x-2">
                      <button className="text-blue-500 hover:text-blue-700" onClick={() => handleEditQuestion(question)}>Edit</button>
                      <button className="text-red-500 hover:text-red-700" onClick={() => handleDeleteQuestion(question.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-center text-gray-500">No questions in this set.</p>
          )}
        </div>
      </div>

      {showQuestionModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold mb-4 text-gray-700">{isEditingQuestion ? "Edit Question" : "Create Question"}</h2>
            <button
              className="text-gray-500 hover:text-gray-700 mb-4"
              onClick={() => { setShowQuestionModal(false); setIsEditingQuestion(false); }}
            >
              ✖
            </button>
            </div>
            {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Question</label>
              <input
                type="text"
                value={newQuestion.questionTitle}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, questionTitle: e.target.value })
                }
                className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                placeholder="Enter question here..."
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Details</label>
              <textarea
                value={newQuestion.questionDetails}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, questionDetails: e.target.value })
                }
                className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                placeholder="Enter question details here..."
              />
            </div>


            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Question Type</label>
              <select
              value={newQuestion.questionType}
              onChange={(e) =>
                setNewQuestion({
                  ...newQuestion,
                  questionType: e.target.value.toUpperCase(), // 🔥 Ensures it matches ENUM
                })
              } className="w-full border border-gray-300 px-3 py-2 rounded-lg"
            >
              <option value="INPUT">Input (Ratings)</option>
              <option value="TEXT">Text (Open-Ended)</option>
            </select>
            </div>
            <div className="flex justify-end space-x-4">
              <button className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-200 transition" onClick={() => { setShowQuestionModal(false); setIsEditingQuestion(false); }}>Cancel</button>
              <button className="bg-teal text-white px-4 py-2 rounded-md hover:bg-peach transition" onClick={handleCreateOrUpdateQuestion}>{isEditingQuestion ? "Update" : "Create"}</button>
            </div>
          </div>
        </div>
      )}

{showRenameModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-[360px]">
      <h2 className="text-lg font-bold mb-4">Rename Template</h2>
      <input
        type="text"
        value={renameSetName}
        onChange={e => setRenameSetName(e.target.value)}
        className="w-full border border-gray-300 px-3 py-2 rounded mb-4"
      />
      <div className="flex justify-end space-x-2">
        <button
          className="px-4 py-2 border rounded hover:bg-gray-100"
          onClick={() => setShowRenameModal(false)}
        >
          Cancel
        </button>
        <button
          className="px-4 py-2 bg-teal text-white rounded hover:bg-teal-dark"
          onClick={async () => {
            try {
              await axios.put(
                `http://${address}:8080/templates/rename-template-set/${renameSetId}`,
                { name: renameSetName },
                { headers: { Authorization: `Bearer ${authState.token}` } }
              );
              toast.success("Renamed successfully");
              setShowRenameModal(false);
              fetchSets();
            } catch (err) {
              console.error("Rename failed:", err);
              toast.error(err.response?.data?.error || "Rename failed");
            }
          }}
        >
          Save
        </button>
      </div>
    </div>
  </div>
  )}


      {showSetModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[400px]">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold mb-4 text-gray-700">Create Template</h2>
            <button
              className="text-gray-500 hover:text-gray-700 mb-4"
              onClick={() => setShowSetModal(false)}
            >
              ✖
            </button>
            </div>
            {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Template Name</label>
              <input type="text" value={newSetName} onChange={(e) => setNewSetName(e.target.value)} className="w-full border border-gray-300 px-3 py-2 rounded-lg" placeholder="Enter template name..." />
            </div>
            <div className="flex justify-end space-x-4">
              <button className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-200 transition" onClick={() => setShowSetModal(false)}>Cancel</button>
              <button className="bg-teal text-white px-4 py-2 rounded-md hover:bg-peach transition" onClick={handleCreateSet}>Create</button>
            </div>
          </div>
        </div>
      )}
    </div>


      
  );
};

export default AdminQuestionTemplates;
