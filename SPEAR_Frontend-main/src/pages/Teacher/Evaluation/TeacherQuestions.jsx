import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import AuthContext from "../../../services/AuthContext";
import axios from "axios";
import TeacherImportSetModal from "../../../components/Modals/TeacherImportSetModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TeacherQuestions = () => {
  const { getDecryptedId, storeEncryptedId } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newQuestion, setNewQuestion] = useState({ questionTitle: "", questionDetails: "" });
  const [newQuestionType, setNewQuestionType] = useState("TEXT");
  const [editQuestion, setEditQuestion] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importedSets, setImportedSets] = useState([]);
  const [expandedSets, setExpandedSets] = useState([]);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateSetName, setTemplateSetName] = useState("");
  const editableQuestions = questions.filter(q => q.editable);
  const currentUid = parseInt(getDecryptedId("uid"), 10);

  const navigate = useNavigate();

  const address = getIpAddress();

  function getIpAddress() {
    const hostname = window.location.hostname;
    const indexOfColon = hostname.indexOf(":");
    return indexOfColon !== -1 ? hostname.substring(0, indexOfColon) : hostname;
  }

  const toggleSetExpansion = (setId) => {
    setExpandedSets((prev) =>
      prev.includes(setId) ? prev.filter((id) => id !== setId) : [...prev, setId]
    );
  };

  const fetchQuestions = async () => {
    try {
      const evaluationId = getDecryptedId("eid");
      const response = await axios.get(
        `http://${address}:8080/get-questions-by-evaluation/${evaluationId}`
      );
      setQuestions(response.data);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };



  const handleCreateQuestion = async () => {
    try {
      const classId = getDecryptedId("cid");
      const evaluationId = getDecryptedId("eid");
      const uid = getDecryptedId("uid");
      const token = localStorage.getItem("token");
  
      if (!token || !uid) {
        toast.error("Authentication failed. Please log in again.");
        return;
      }
  
      const questionPayload = {
        ...newQuestion,
        questionType: newQuestionType
      };
  
      if (
        !questionPayload.questionTitle?.trim() ||
        !questionPayload.questionDetails?.trim() ||
        !questionPayload.questionType?.trim()
      ) {
        toast.error("Please fill in title, details, and type.");
        return;
      }
  
      const response = await axios.post(
        `http://${address}:8080/teacher/create-question/${classId}/${evaluationId}`,
        questionPayload,
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      toast.success("Question created successfully!");
      setQuestions([...questions, response.data]);
  
      // Reset state
      setNewQuestion({ questionTitle: "", questionDetails: "" });
      setNewQuestionType("TEXT");
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error creating question:", error.response?.data || error);
      toast.error("Failed to create question. ");
    }
  };

  const handleEditQuestion = async () => {
    const qid = getDecryptedId("qid");
    if (!qid || !editQuestion?.questionTitle || !editQuestion?.questionDetails) {
      toast.error("Invalid question data");
      return;
    }

    if (!window.confirm("Are you sure you want to edit this question?")) {
      return;
    }

    try {
      const response = await axios.put(
        `http://${address}:8080/teacher/update-question/${qid}`,
        {
          questionTitle: editQuestion.questionTitle,
          questionDetails: editQuestion.questionDetails,
          questionType: editQuestion.questionType
        }
      );

      setQuestions((prev) =>
        prev.map((q) =>
          q.questionId === response.data.questionId ? response.data : q
        )
      );
      setShowEditModal(false);
      toast.success("Edit success!");
      window.location.reload();
    } catch (error) {
      console.error("Error updating question:", error);
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      await axios.delete(
        `http://${address}:8080/teacher/delete-question/${questionId}`
      );
      setQuestions((prev) => prev.filter((q) => q.questionId !== questionId));
      toast.success('Delete success!');
      window.location.reload();
    } catch (error) {
      console.error("Error deleting question:", error);
    }
  };

  // Fetch questions when the component is mounted
  useEffect(() => {
    fetchQuestions();
  }, []);


  const fetchImportedSets = async () => {
    try {
      const evaluationId = getDecryptedId("eid");
      const response = await axios.get(`http://${address}:8080/teacher/get-imported-sets/${evaluationId}`);
      setImportedSets(response.data || []);
    } catch (error) {
      console.error("Error fetching imported sets:", error);
    }
  };

  const handleDeleteSet = async (setId) => {
    if (!window.confirm("Are you sure you want to delete this set?")) return;
  
    try {
      const evaluationId = getDecryptedId("eid");
      await axios.delete(
        `http://${address}:8080/teacher/delete-questions-by-set/${setId}/for-evaluation/${evaluationId}`
      );
      setImportedSets((prev) => prev.filter((set) => set.id !== setId));
      fetchQuestions();
    } catch (error) {
      console.error("Error deleting set:", error);
      toast.error("Failed to delete questions for this evaluation.");
    }
  };
  
  useEffect(() => {
    fetchQuestions();
    fetchImportedSets();
  }, []);

  const renderImportedSet = (set) => {
    const setQuestions = set.questions || [];
    if (!setQuestions.length) return null;
    const isExpanded = expandedSets.includes(set.id);
  
    return (
      <div key={set.id} className="border border-gray-300 rounded-lg mb-2 overflow-hidden">
        <div
          onClick={() => toggleSetExpansion(set.id)}
          className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 cursor-pointer"
        >
          <span className="font-medium">{set.name}</span>
          <div className="flex items-center space-x-3">
            <button
              onClick={e => { e.stopPropagation(); handleDeleteSet(set.id); }}
              className="text-red-500 hover:text-red-700 text-sm"
            >
              Delete Template
            </button>
            <span className="text-xl">{isExpanded ? "−" : "+"}</span>
          </div>
        </div>
  
        {isExpanded && (
          <div className="bg-white p-4 space-y-3">
            {setQuestions.map(q => (
              <div key={q.id} className="border-b border-gray-200 pb-2 last:pb-0">
                <div className="font-semibold">{q.questionTitle}</div>
                <div className="text-sm text-gray-600">{q.questionDetails}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  //add the delete my template
  //add edit name of my template



  const handleSaveAsTemplate = async () => {
    const evaluationId = getDecryptedId("eid");
    const token = localStorage.getItem("token");
  
    if (!templateSetName.trim()) {
      toast.error("Please enter a template set name.");
      return;
    }
  
    try {
      await axios.post(
        `http://${address}:8080/teacher/save-as-template/${evaluationId}`,
        { name: templateSetName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Template saved successfully!");
      setShowTemplateModal(false);
      setTemplateSetName("");
    } catch (error) {
      const msg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "An error occurred while saving the template.";
  
      console.error("Save error:", msg);
  
      if (msg.toLowerCase().includes("already exists")) {
        toast.error("A template with that name already exists. Try a different one.");
      } else {
        alert(msg);
      }
    }
  };



  return (
  <>
   <ToastContainer position="top-right" autoClose={3000} />
    <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] min-h-screen">
      <Navbar userRole="TEACHER" />

      <div className="main-content bg-white text-teal p-4 sm:p-8 md:px-20 lg:px-28 pt-8 md:pt-12">
        <h1 className="text-lg sm:text-xl font-semibold mb-6 text-center">
          Questions
        </h1>

        <div className="flex flex-col sm:flex-row justify-start sm:justify-between mb-4 space-y-4 sm:space-y-0">
          <button
            className="bg-teal text-white px-4 py-2 rounded-lg hover:bg-peach transition-all w-full sm:w-auto"
            onClick={() => navigate(-1)}
          >
            Back
          </button>
        </div>

        <div className="flex justify-between sm:justify-end mb-4 space-x-2">
          <button
            className="bg-teal text-white px-4 py-2 rounded-lg hover:bg-peach transition-all duration-300"
            onClick={() => setShowImportModal(true)}
          >
            Import Questions
          </button>

          <button
            className="bg-teal text-white px-4 py-2 rounded-lg hover:bg-peach transition-all duration-300"
            onClick={() => setShowCreateModal(true)}
          >
            Create Question
          </button>
        </div>

        {/* Imported Sets */}
          {importedSets.length > 0 && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Imported Sets</h2>
              {importedSets.map(set => {
                const setQuestions = set.questions || [];
                if (!setQuestions.length) return null;
                const isExpanded = expandedSets.includes(set.id);

                return (
                  <div key={set.id} className="border border-gray-300 rounded-lg mb-2 overflow-hidden">
                    {/* header */}
                    <div
                      onClick={() => toggleSetExpansion(set.id)}
                      className="w-full flex justify-between items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 cursor-pointer"
                    >
                      <span className="font-medium">{set.name}</span>
                      <div className="flex items-center space-x-3">
                        {/* always render delete */}
                        <button
                          onClick={e => { e.stopPropagation(); handleDeleteSet(set.id); }}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Delete Template
                        </button>
                        <span className="text-xl">{isExpanded ? "−" : "+"}</span>
                      </div>
                    </div>

                    {/* questions list */}
                    {isExpanded && (
                      <div className="bg-white p-4 space-y-3">
                        {setQuestions.map(q => (
                          <div key={q.id} className="border-b border-gray-200 pb-2 last:pb-0">
                            <div className="font-semibold">{q.questionTitle}</div>
                            <div className="text-sm text-gray-600">{q.questionDetails}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

            {editableQuestions.length > 0 ? (
              <div className="overflow-x-auto rounded-lg">
                <table className="min-w-full border border-gray-300">
                  <thead className="bg-teal text-white">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm sm:text-base font-semibold">
                        Questions
                      </th>
                      <th className="px-4 py-2 text-left text-sm sm:text-base font-semibold">
                        Type
                      </th>
                      <th className="px-4 py-2 text-left text-sm sm:text-base font-semibold">
                        Source
                      </th>
                      <th className="px-4 py-2 text-left text-sm sm:text-base font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {editableQuestions.map((question) => (
                      <tr key={question.qid} className="border-b">
                        <td className="px-4 py-2">
                          <div className="font-semibold">{question.questionTitle}</div>
                          <div className="text-gray-600 text-sm">{question.questionDetails}</div>
                        </td>
                        <td className="px-4 py-2">{question.questionType}</td>
                        <td className="px-4 py-2">
                          {question.templateSetName || "None"}
                        </td>
                        <td className="px-4 py-2 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                          <button
                            className="text-red-500 hover:text-red-700 text-sm sm:text-base"
                            onClick={() => handleDeleteQuestion(question.qid)}
                          >
                            <i className="fa fa-trash"></i> Delete
                          </button>
                          <button
                            className="text-blue-500 hover:text-blue-700 text-sm sm:text-base"
                            onClick={() => {
                              storeEncryptedId("qid", question.qid);
                              setEditQuestion(question);
                              setShowEditModal(true);
                            }}
                          >
                            <i className="fa fa-edit"></i> Edit
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            
            <div className="flex justify-end mt-4 bg-transparent">
            <button
              className="text-emerald-700 border border-emerald-700 px-5 py-2 rounded-lg transition hover:bg-emerald-50"
              onClick={() => setShowTemplateModal(true)}
            >
              Save as Template
            </button>
          </div>

          </div>
        ) : (
          <p className="text-center text-gray-500">No questions found.</p>
        )}

        {/* Import Questions Modal */}
        {showImportModal && (
          <TeacherImportSetModal
          onClose={() => setShowImportModal(false)}
          fetchQuestions={fetchQuestions}
          fetchImportedSets={fetchImportedSets}
        />
        )}

       {/* Create Question Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full sm:w-1/3">
              <h2 className="text-lg sm:text-xl font-bold mb-4">Create Question</h2>

              {/* Title */}
              <div className="mb-4">
                <label htmlFor="questionTitle" className="block mb-2 text-sm sm:text-base font-semibold">
                  Question Title
                </label>
                <input
                  id="questionTitle"
                  type="text"
                  value={newQuestion.questionTitle}
                  onChange={(e) => setNewQuestion({ ...newQuestion, questionTitle: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                  placeholder="Enter question title"
                />
              </div>

              {/* Details */}
              <div className="mb-4">
                <label htmlFor="questionDetails" className="block mb-2 text-sm sm:text-base font-semibold">
                  Question Details
                </label>
                <textarea
                  id="questionDetails"
                  value={newQuestion.questionDetails}
                  onChange={(e) => setNewQuestion({ ...newQuestion, questionDetails: e.target.value })}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                  placeholder="Enter question details"
                />
              </div>

              {/* Type */}
              <div className="mb-4">
                <label htmlFor="questionType" className="block mb-2 text-sm sm:text-base font-semibold">
                  Question Type
                </label>
                <select
                  id="questionType"
                  value={newQuestionType}
                  onChange={(e) => setNewQuestionType(e.target.value)}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                >
                  <option value="TEXT">TEXT</option>
                  <option value="INPUT">INPUT</option>
                </select>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 mt-4">
                <button
                  className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-teal text-white px-4 py-2 rounded-lg hover:bg-teal-dark"
                  onClick={handleCreateQuestion}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

      {showEditModal && editQuestion && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full sm:w-1/3">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Edit Question</h2>

            {/* Edit Title */}
            <label className="block mb-1 text-sm font-medium">Question:</label>
            <input
              type="text"
              value={editQuestion.questionTitle}
              onChange={(e) =>
                setEditQuestion((prev) => ({
                  ...prev,
                  questionTitle: e.target.value,
                }))
              }
              className="w-full border border-gray-300 px-3 py-2 rounded-lg mb-4"
              placeholder="Edit question title"
            />

            {/* Edit Details */}
            <label className="block mb-1 text-sm font-medium">Question Details:</label>
            <textarea
              value={editQuestion.questionDetails}
              onChange={(e) =>
                setEditQuestion((prev) => ({
                  ...prev,
                  questionDetails: e.target.value,
                }))
              }
              className="w-full border border-gray-300 px-3 py-2 rounded-lg mb-4"
              placeholder="Edit question details"
            />

            {/* Edit Type */}
            <label className="block mb-2 text-sm sm:text-base font-semibold">Question Type:</label>
            <select
              value={editQuestion.questionType}
              onChange={(e) =>
                setEditQuestion((prev) => ({
                  ...prev,
                  questionType: e.target.value,
                }))
              }
              className="w-full border border-gray-300 px-3 py-2 rounded-lg mb-4"
            >
              <option value="TEXT">Text</option>
              <option value="INPUT">Input</option>
            </select>

            <div className="flex justify-end space-x-4 mt-4">
              <button
                className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-teal text-white px-4 py-2 rounded-lg hover:bg-teal-dark"
                onClick={handleEditQuestion}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Template Set Modal */}
          {showTemplateModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg w-full sm:w-1/3">
                <h2 className="text-lg font-bold mb-4">Save as Template Set</h2>
                <input
                  type="text"
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                  placeholder="Enter template set name"
                  value={templateSetName}
                  onChange={(e) => setTemplateSetName(e.target.value)}
                />

                <div className="flex justify-end space-x-4 mt-4">
                  <button
                    className="bg-gray-300 px-4 py-2 rounded-lg hover:bg-gray-400"
                    onClick={() => setShowTemplateModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg"
                    onClick={handleSaveAsTemplate}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          )}
                </div>
              </div>
              </>
            );
          };

export default TeacherQuestions;