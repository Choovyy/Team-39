import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../../../services/AuthContext";
import ConfirmSubmitModal from "../../../components/Modals/ConfirmSubmitModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StudentTeacherEvaluation = () => {
  const { getDecryptedId } = useContext(AuthContext);
  const navigate = useNavigate();
  const address = window.location.hostname;

  const [questions, setQuestions] = useState([]);
  const [adviserName, setAdviserName] = useState("");
  const [responses, setResponses] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const studentId = getDecryptedId("uid");
  const evaluationId = getDecryptedId("eid");
  const classId = getDecryptedId("cid");
  const [adviserId, setAdviserId] = useState(null);

  const STORAGE_KEY = `eval-${evaluationId}-class-${classId}`;

  // Fetching questions and team data
  useEffect(() => {
    fetchQuestions();
    fetchTeamData();
  }, []);

  // Load saved responses from localStorage when the component mounts
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setResponses(JSON.parse(saved));
      } catch (err) {
        console.warn("Failed to parse saved responses", err);
      }
    }
  }, []); 

  // Save responses to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(responses).length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
    }
  }, [responses]);

  const fetchQuestions = async () => {
    try {
      const res = await axios.get(`http://${address}:8080/get-questions-by-evaluation/${evaluationId}`);
      setQuestions(res.data || []);
    } catch (err) {
      console.error("Error fetching questions:", err);
    }
  };

  const fetchTeamData = async () => {
    try {
      const teamRes = await axios.get(`http://${address}:8080/evaluation/${studentId}/class/${classId}/team`);
      const teamId = teamRes.data.tid;
  
      const res = await axios.get(`http://${address}:8080/team/${teamId}/members-and-adviser`);
      setAdviserName(res.data.adviserName || "Unknown Adviser");
      setAdviserId(res.data.adviserId || null); 
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch team or adviser details.");
    } finally {
      setLoading(false);
    }
  };

  const handleResponseChange = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [`${adviserName}-${questionId}`]: value,
    }));
  };

  const handleTextChange = (questionId, value) => {
    setResponses((prev) => ({
      ...prev,
      [`text-${questionId}`]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!adviserName) {
      alert("Adviser not loaded. Please wait.");
      return;
    }
  
    // 1) Validate that all required INPUT fields are properly filled
    const inputQuestions = questions.filter(q => q.questionType === "INPUT");
    for (const question of inputQuestions) {
      const score = responses[`${adviserName}-${question.qid}`];
      
      // Must NOT be blank, undefined, and must be a valid number between 0 and 10 (exclusive of 0, inclusive of 10)
      if (
        score === undefined || 
        score === "" || 
        isNaN(score) || 
        parseFloat(score) <= 0 || 
        parseFloat(score) > 10
      ) {
        toast.error(`Please provide a valid score (greater than 0 and up to 10) for: "${question.questionTitle}"`);
        return;
      }
    }
    
    // 2) Validate that all TEXT fields are properly filled
    const textQuestions = questions.filter(q => q.questionType === "TEXT");
    for (const question of textQuestions) {
      const textValue = responses[`text-${question.qid}`];
      
      // Must not be blank, empty or contain only whitespace
      if (!textValue || textValue.trim() === "") {
        toast.error(`Please write a response for: "${question.questionTitle}"`);
        return;
      }
    }
    
    // 3) Check for identical scores between team members for INPUT questions (not applicable for adviser evaluation)
    // This constraint doesn't apply here since we're evaluating only the adviser, not multiple team members
    
    // 4) Build the responseList
    const responseList = questions.map((q) => ({
      evaluator: { uid: studentId },
      evaluatee: { uid: adviserId },
      question: { qid: q.qid },
      evaluation: { eid: evaluationId },
      score: q.questionType === "INPUT" ? responses[`${adviserName}-${q.qid}`] : 0,
      textResponse: q.questionType === "TEXT" ? responses[`text-${q.qid}`] : null,
    }));
  
    // 5) User confirmation via modal dialog is already implemented in the UI
    try {
      await axios.post(
        `http://${address}:8080/responses/submit-adviser?evaluationId=${evaluationId}&evaluatorId=${studentId}&classId=${classId}`,
        responseList
      );
      toast.success("Evaluation successfully submitted!");
      localStorage.removeItem(STORAGE_KEY);
      navigate(-1);
    } catch (err) {
      console.error("Submission error:", err);
      toast.error("Failed to submit evaluation.");
    }
  };

  const inputQuestions = questions.filter((q) => q.questionType === "INPUT");
  const textQuestions = questions.filter((q) => q.questionType === "TEXT");

  const calculateTotalScore = () => {
    let total = 0;
    inputQuestions.forEach((question) => {
      const value = responses[`${adviserName}-${question.qid}`];
      if (!isNaN(value) && value !== "") {
        total += parseFloat(value);
      }
    });
  
    // Check if the total is NaN, and if so, return 0.00
    return isNaN(total) ? "0.0" : total.toFixed(1); // Return total score with one decimal place
  };
  
  return (
    <>
    <ToastContainer position="top-right" autoClose={3000} />
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-40">
      <div className="w-full mb-6">
        <button 
          onClick={() => navigate(-1)} 
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition w-full sm:w-auto">
          ← Back
        </button>
      </div>
  
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Adviser Evaluation</h1>
  
      {adviserName && (
        <p className="text-md text-gray-500 mb-6">
          You are evaluating your adviser:{" "}
          <span className="text-gray-800 font-semibold">{adviserName}</span>
        </p>
      )}
  
      <form
        onSubmit={(e) => {
          e.preventDefault();
        }}
        className="w-full bg-white md:p-8 rounded-lg shadow space-y-8 xl:p-10"
      >
        {inputQuestions.length > 0 && (
          <>
            <div className="mb-4 text-sm text-gray-500">
              <p className="mb-2">
                Rate your adviser on a scale of <code>0.1</code> – <code>10</code> for each question.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>No question can be left unanswered.</li>
                <li>Ensure you provide valid input for each question (greater than 0, up to 10).</li>
                <li>Hover the question title to see the details.</li>
              </ul>
            </div>
  
            <div className="overflow-x-auto space-y-4">
              <table className="min-w-full border-collapse table-auto">
                <thead>
                  <tr className="bg-gray-100 text-gray-600 text-sm">
                    <th className="sticky left-0 bg-gray-100 p-3 text-left z-10 w-52 border-r border-gray-300">
                      {adviserName}
                    </th>
                    {inputQuestions.map((question) => (
                      <th
                        key={question.qid}
                        className="text-center p-3 min-w-[80px] border-r border-gray-200"
                      >
                        <div className="relative group">
                        <div className="font-bold text-xs text-blue-600 hover:underline cursor-default">
                          {question.questionTitle}
                        </div>
                        <div className="absolute z-50 top-full left-1/2 -translate-x-1/2 mt-2 w-64 bg-white border border-gray-300 shadow-lg text-gray-700 text-xs p-2 rounded opacity-0 group-hover:opacity-100 transition duration-200 pointer-events-none">
                          {question.questionDetails}
                        </div>  
                        </div>
                      </th>
                    ))}
                    <th className="sticky right-0 bg-gray-100 p-3 text-center z-10 min-w-[100px] border-l border-gray-300">
                      Total
                    </th>
                  </tr>
                </thead>
  
                <tbody>
                  <tr className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="sticky left-0 bg-white z-0 p-3 font-medium text-gray-700 w-52 border-r border-gray-200">
                      {adviserName}
                    </td>
                    {inputQuestions.map((question) => (
                      <td key={question.qid} className="p-3 text-center border-r border-gray-100">
                        <input
                          type="number"
                          min="0.1"
                          max="10"
                          step="0.1"
                          placeholder="0.0"
                          className="w-20 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
                          value={responses[`${adviserName}-${question.qid}`] || ""}
                          onChange={(e) => {
                            let newValue = e.target.value;
  
                            if (newValue !== "" && (parseFloat(newValue) <= 0 || parseFloat(newValue) > 10)) {
                              newValue = Math.max(0.1, Math.min(10, parseFloat(newValue)));
                            }
  
                            if (/^\d+(\.\d{1})?$/.test(newValue) || newValue === "") {
                              handleResponseChange(question.qid, parseFloat(newValue));
                            }
                          }}
                        />
                      </td>
                    ))}
                    <td className="sticky right-0 bg-white z-0 text-center font-semibold border-l border-gray-200">
                      {calculateTotalScore()}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </>
        )}
  
        {textQuestions.map((question) => (
          <div key={question.qid} className="space-y-3">
            <div>
              <div className="font-semibold text-gray-700">{question.questionTitle}</div>
              <div className="text-xs text-gray-500">{question.questionDetails}</div>
            </div>
  
            <textarea
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-gray-400"
              rows="4"
              placeholder="Write your response here..."
              value={responses[`text-${question.qid}`] || ""}
              onChange={(e) => handleTextChange(question.qid, e.target.value)}
            />
          </div>
        ))}
  
        <div className="flex justify-end mt-10">
          <button 
          onClick={handleOpenModal}
          className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition w-full sm:w-auto">
            Submit Evaluation
          </button>
        </div>
      </form>

      <ConfirmSubmitModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={handleSubmit}
      />
    </div>
    </>
  );
  };
  
  export default StudentTeacherEvaluation;
  