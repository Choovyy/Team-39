import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import AuthContext from "../../services/AuthContext";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TeacherImportSetModal = ({ onClose, fetchQuestions }) => {
  const { getDecryptedId, authState } = useContext(AuthContext);
  const [sets, setSets] = useState([]);
  const [myTemplateSets, setMyTemplateSets] = useState([]);
  const [expandedSetId, setExpandedSetId] = useState(null);
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [renameSetId,    setRenameSetId]    = useState(null);
  const [renameSetName,  setRenameSetName]  = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal]     = useState(false);
  const [editingSetId, setEditingSetId]       = useState(null);
  const [newQuestion,   setNewQuestion]       = useState({
    questionTitle: "",
    questionDetails: "",
    questionType: "TEXT"
  });
  const [editQuestion,  setEditQuestion]      = useState(null);

  const address = window.location.hostname;

  useEffect(() => {
    fetchSets();
    fetchMyTemplateSets();
  }, []);

  const fetchSets = async () => {
    try {
      const { data } = await axios.get(`http://${address}:8080/templates/teacher/get-template-sets`);
      setSets(data);
    } catch (error) {
      console.error("Error fetching sets:", error);
    }
  };

  // handlers to open each modal:
const handleAddQuestionModal = (setId) => {
  setEditingSetId(setId);
  setNewQuestion({ questionTitle: "", questionDetails: "", questionType: "TEXT" });
  setShowCreateModal(true);
};

const handleEditQuestionModal = (q) => {
  setEditQuestion(q);
  setEditingSetId(q.templateSetId); // assume your DTO has templateSetId
  setShowEditModal(true);
};

  const handleRenameMySet = (set) => {
    setRenameSetId(set.id);
    setRenameSetName(set.name);
    setShowRenameModal(true);
  };

  const handleAddQuestion = async (setId, questionDto) => {
    await axios.post(
      `http://${address}:8080/templates/teacher/add-question/${setId}`,
      questionDto,
      { headers: { Authorization: `Bearer ${authState.token}` } }
    );
    toast.success("Question added");
    await fetchSets();
    await fetchMyTemplateSets();
  };

  const handleUpdateQuestion = async (questionId, questionDto) => {
    await axios.put(
      `http://${address}:8080/templates/teacher/update-question/${questionId}`,
      questionDto,
      { headers: { Authorization: `Bearer ${authState.token}` } }
    );
    toast.success("Question updated");
    await fetchSets();
    await fetchMyTemplateSets();
  };

  const handleDeleteMyQuestion = async (questionId) => {
    if (!window.confirm("Delete this question?")) return;
    await axios.delete(
      `http://${address}:8080/templates/teacher/delete-question/${questionId}`,
      { headers: { Authorization: `Bearer ${authState.token}` } }
    );
    toast.success("Question deleted");
    await fetchSets();
    await fetchMyTemplateSets();
  };

  const fetchMyTemplateSets = async () => {
    try {
      const { data } = await axios.get(`http://${address}:8080/teacher/my-template-sets`, {
        headers: { Authorization: `Bearer ${authState.token}` },
      });
      setMyTemplateSets(data);
    } catch (error) {
      console.error("Error fetching template sets:", error);
    }
  };

  const handleImportSet = async (setId, isMine = false) => {
    try {
      const classId = getDecryptedId("cid");
      const evaluationId = getDecryptedId("eid");
      const path = isMine ? "import-my-template-set" : "import-set";
      await axios.post(
        `http://${address}:8080/teacher/${path}/${setId}/for-class/${classId}/evaluation/${evaluationId}`,
        {},
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );
      toast.success("Set imported successfully!");
      fetchQuestions();
      onClose();
      window.location.reload();
    } catch (error) {
      console.error("Error importing set:", error);
      toast.error("Failed to import set.");
    }
  };

  const handleDeleteMySet = async (setId) => {
    const confirmed = window.confirm("Are you sure you want to delete your template set?");
    if (!confirmed) return;
    try {
      await axios.delete(`http://${address}:8080/templates/teacher/delete-set/${setId}`, {
        headers: { Authorization: `Bearer ${authState.token}` },
      });
      toast.success("Your template set has been deleted.");
      fetchMyTemplateSets();
    } catch (error) {
      const msg = error?.response?.data?.error || "Failed to delete set.";
      if (msg.includes("currently in use")) {
        toast.error("This set cannot be deleted because it is currently in use.");
      } else {
        alert(msg);
      }
      console.error("Error deleting your template set:", error);
    }
  };

  const toggleExpand = (setId) => {
    setExpandedSetId(expandedSetId === setId ? null : setId);
  };


  const renderSetRow = (set, isMine = false) => (
    <React.Fragment key={set.id}>
      <tr className="border-b hover:bg-gray-100">
        <td
          className="px-4 py-2 cursor-pointer text-center text-blue-700 font-semibold"
          onClick={() => toggleExpand(set.id)}
        >
          {set.name}
        </td>
        <td className="px-4 py-2 text-center">{set.questions.length}</td>
        <td className="px-4 py-2 text-center">
          <div className="flex justify-center gap-2">
            <button
              className="bg-[#323c47] text-white px-3 py-1 rounded hover:bg-gray-900"
              onClick={() => handleImportSet(set.id, isMine)}
            >
              Import
            </button>
            {isMine && (
            <>
              <button
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                onClick={() => handleRenameMySet(set)}
              >
                Rename
              </button>
              <button
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-700"
                onClick={() => handleDeleteMySet(set.id)}
              >
                Delete
              </button>
            </>
          )}
          </div>
        </td>
      </tr>
      {expandedSetId === set.id && (
          <tr>
            <td
              colSpan={isMine ? 4 : 3}
              className="bg-gray-50 px-4 py-4"
            >
              {/* + Add Question (your own templates only) */}
              {isMine && (
                <div className="flex justify-end mb-2">
                  <button
                    onClick={() => handleAddQuestionModal(set.id)}
                    className="text-green-600 hover:underline text-sm"
                  >
                    + Add Question
                  </button>
                </div>
              )}

              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="px-2 py-1 text-left">Question</th>
                    <th className="px-2 py-1 text-left">Details</th>
                    <th className="px-2 py-1 text-left">Type</th>
                    {isMine && (
                      <th className="px-2 py-1 text-center">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {set.questions.map((q) => (
                    <tr key={q.id} className="border-t">
                      <td className="px-2 py-1">{q.questionTitle}</td>
                      <td className="px-2 py-1">{q.questionDetails}</td>
                      <td className="px-2 py-1">{q.questionType}</td>
                      {isMine && (
                          <td className="px-2 py-1 text-center space-x-2">
                            <button
                              onClick={() => handleEditQuestionModal(q)}
                              className="text-blue-500 hover:text-blue-700 text-xs"
                            >
                              Edit
                            </button>
                          <button
                            onClick={() => handleDeleteMyQuestion(q.id)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>
        )}
    </React.Fragment>
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-3xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-4 text-center">Import Question Set</h2>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">Available Template Sets</h3>
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-center">Set Name</th>
                <th className="px-4 py-2 text-center">Number of Questions</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>{sets.map((set) => renderSetRow(set, false))}</tbody>
          </table>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">My Template Sets</h3>
          <table className="w-full border border-gray-300 text-sm">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2 text-center">Set Name</th>
                <th className="px-4 py-2 text-center">Number of Questions</th>
                <th className="px-4 py-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>{myTemplateSets.map((set) => renderSetRow(set, true))}</tbody>
          </table>
        </div>

        <div className="flex justify-end mt-6">
        <button
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
            onClick={() => {
              onClose();
              window.location.reload();
            }}
          >
            Close
          </button>
        </div>
      </div>


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
              // re-fetch both lists
              await fetchSets();
              await fetchMyTemplateSets();
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

{/* Create Question Modal */}
{showCreateModal && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full sm:w-1/3">
      <h2 className="text-lg font-bold mb-4">Create Question</h2>
      <label className="block mb-1 text-sm font-medium">Title:</label>
      <input
        type="text"
        value={newQuestion.questionTitle}
        onChange={e => setNewQuestion(prev => ({ ...prev, questionTitle: e.target.value }))}
        className="w-full border px-3 py-2 rounded-lg mb-4"
      />
      <label className="block mb-1 text-sm font-medium">Details:</label>
      <textarea
        value={newQuestion.questionDetails}
        onChange={e => setNewQuestion(prev => ({ ...prev, questionDetails: e.target.value }))}
        className="w-full border px-3 py-2 rounded-lg mb-4"
      />
      <label className="block mb-1 text-sm font-medium">Type:</label>
      <select
        value={newQuestion.questionType}
        onChange={e => setNewQuestion(prev => ({ ...prev, questionType: e.target.value }))}
        className="w-full border px-3 py-2 rounded-lg mb-4"
      >
        <option value="TEXT">Text</option>
        <option value="INPUT">Input</option>
      </select>
      <div className="flex justify-end space-x-4">
        <button
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          onClick={() => setShowCreateModal(false)}
        >
          Cancel
        </button>
        <button
          className="bg-teal text-white px-4 py-2 rounded hover:bg-teal-dark"
          onClick={async () => {
            await handleAddQuestion(editingSetId, newQuestion);
            setShowCreateModal(false);
          }}
        >
          Create
        </button>
      </div>
    </div>
  </div>
)}

{/* Edit Question Modal */}
{showEditModal && editQuestion && (
  <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
    <div className="bg-white p-6 rounded-lg shadow-lg w-full sm:w-1/3">
      <h2 className="text-lg font-bold mb-4">Edit Question</h2>
      <label className="block mb-1 text-sm font-medium">Title:</label>
      <input
        type="text"
        value={editQuestion.questionTitle}
        onChange={e => setEditQuestion(prev => ({ ...prev, questionTitle: e.target.value }))}
        className="w-full border px-3 py-2 rounded-lg mb-4"
      />
      <label className="block mb-1 text-sm font-medium">Details:</label>
      <textarea
        value={editQuestion.questionDetails}
        onChange={e => setEditQuestion(prev => ({ ...prev, questionDetails: e.target.value }))}
        className="w-full border px-3 py-2 rounded-lg mb-4"
      />
      <label className="block mb-1 text-sm font-medium">Type:</label>
      <select
        value={editQuestion.questionType}
        onChange={e => setEditQuestion(prev => ({ ...prev, questionType: e.target.value }))}
        className="w-full border px-3 py-2 rounded-lg mb-4"
      >
        <option value="TEXT">Text</option>
        <option value="INPUT">Input</option>
      </select>
      <div className="flex justify-end space-x-4">
        <button
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          onClick={() => setShowEditModal(false)}
        >
          Cancel
        </button>
        <button
          className="bg-teal text-white px-4 py-2 rounded hover:bg-teal-dark"
          onClick={async () => {
            await handleUpdateQuestion(editQuestion.id, editQuestion);
            setShowEditModal(false);
          }}
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}

<ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default TeacherImportSetModal;
