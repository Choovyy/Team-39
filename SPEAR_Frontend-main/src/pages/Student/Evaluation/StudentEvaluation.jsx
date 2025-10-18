import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../../../services/AuthContext";
import { useLocation } from "react-router-dom";
import ConfirmSubmitModal from "../../../components/Modals/ConfirmSubmitModal";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const StudentEvaluation = () => {
  const { getDecryptedId } = useContext(AuthContext);
  const navigate = useNavigate();
  const address = window.location.hostname;

  const [questions, setQuestions] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [responses, setResponses] = useState({});

  const studentId = getDecryptedId("uid");
  const evaluationId = getDecryptedId("eid");
  const classId = getDecryptedId("cid");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => setIsModalOpen(false);

  const STORAGE_KEY = `eval-${evaluationId}-class-${classId}`;

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

    useEffect(() => {

      if (Object.keys(responses).length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(responses));
      }
    }, [responses]); // <-- only runs when responses changes

  useEffect(() => {
    fetchQuestions();
    fetchTeamMembers();
  }, []);

  const openModal = (title, details) => {
    setModalContent({ title, details });
    setModalOpen(true);
  };

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`http://${address}:8080/get-questions-by-evaluation/${evaluationId}`);
      setQuestions(response.data || []);
    } catch (error) {
      console.error("Error fetching questions:", error);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await axios.get(`http://${address}:8080/evaluation/${studentId}/class/${classId}/team`);
      if (!Array.isArray(response.data.memberIds) || !Array.isArray(response.data.memberNames)) {
        console.error("Unexpected response format for team members:", response.data);
        return;
      }
      const members = response.data.memberIds.map((id, index) => ({
        memberId: id,
        memberName: response.data.memberNames[index]
      }));
      setTeamMembers(members);
    } catch (error) {
      console.error("Error fetching team members:", error);
    }
  };

  const handleResponseChange = (memberId, questionId, rawValue) => {
    // Text questions come through with memberId === "text"
    if (memberId === "text") {
      setResponses({
        ...responses,
        [`text-${questionId}`]: rawValue,
      });
      return;
    }

    // Otherwise, it’s a numeric response
    let value = rawValue === "" ? "" : parseFloat(rawValue); // Empty is allowed
    if (!isNaN(value)) {
      value = Math.min(Math.max(value, 0), 10); // Ensure it's between 0 and 10
    }
    setResponses({
      ...responses,
      [`${memberId}-${questionId}`]: value,
    });
};


const handleSubmit = async (e) => {
  e.preventDefault();

  // 2) Validate every question is answered & in-range
  for (const question of questions) {
    if (question.questionType === "INPUT") {
      for (const member of teamMembers) {
        const key = `${member.memberId}-${question.qid}`;
        const value = responses[key];

        // Check for blank values or zero values
        if (value === "" || value === undefined || isNaN(value) || value <= 0 || value > 10) {
          toast.error(`Please enter a valid score greater than 0 and less than or equal to 10 for "${question.questionTitle}"`);
          return;
        }
      }
    } else if (question.questionType === "TEXT") {
      const textValue = responses[`text-${question.qid}`];
      if (!textValue || textValue.trim() === "") {
        toast.error(`Please answer the text question: "${question.questionTitle}"`);
        return;
      }
    }
  }

  // 3) Prevent same score for all members, except for "Attendance"
  for (const question of questions) {
    if (question.questionType === "INPUT" && question.questionTitle.trim().toLowerCase() !== "attendance") {
      // Create an array of scores for the current question across all team members
      const scores = teamMembers.map((m) => responses[`${m.memberId}-${question.qid}`]);

      // Filter out any undefined (blank) values from the scores
      const filteredScores = scores.filter((score) => score !== "" && score !== undefined);

      // Check if any score is repeated (no duplicates allowed)
      const uniqueScores = new Set(filteredScores);
      if (uniqueScores.size < filteredScores.length) {
        toast.error(`You cannot assign the same score to more than one member for "${question.questionTitle}"`);
        return;
      }
    }
  }

  // 4) Build payload and submit
  const responseList = [];
  teamMembers.forEach((member) => {
    questions.forEach((question) => {
      if (question.questionType === "INPUT") {
        responseList.push({
          evaluator: { uid: studentId },
          evaluatee: { uid: member.memberId },
          question: { qid: question.qid },
          evaluation: { eid: evaluationId },
          score: responses[`${member.memberId}-${question.qid}`],
          textResponse: null,
        });
      }
    });
  });

  // Handle text questions
  questions
    .filter((q) => q.questionType === "TEXT")
    .forEach((question) => {
      const textValue = responses[`text-${question.qid}`];
      responseList.push({
        evaluator: { uid: studentId },
        evaluatee: { uid: studentId },
        question: { qid: question.qid },
        evaluation: { eid: evaluationId },
        score: 0,
        textResponse: textValue,
      });
    });

    try {
      await axios.post(
        `http://${address}:8080/responses/submit?evaluationId=${evaluationId}&evaluatorId=${studentId}&classId=${classId}`,
        responseList  
      );
    
      toast.success("Evaluation successfully submitted!");
      localStorage.removeItem(STORAGE_KEY);
      navigate(-1);
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      toast.error("Failed to submit evaluation.");
    }
};  

return (
    <>
    <ToastContainer position="top-right" autoClose={3000} />
<div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 sm:px-40">
  <div className="w-full mb-6">
    <button
      onClick={() => navigate(-1)}
      className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition w-full sm:w-auto"
    >
      ← Back
    </button>
  </div>

  <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Evaluation</h1>
  <p className="text-md text-gray-500 mb-6">Evaluate your team members carefully.</p>

  <form className="w-full bg-white md:p-8 rounded-lg shadow space-y-8 xl:p-10">
    {teamMembers.length > 0 && (
      <>
        <div className="mb-4 text-sm text-gray-500">
          <p className="mb-2">
            Rate each team member on a scale of <code>0.0</code> – <code>10</code> for each question.{" "}
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>No member can have exactly the same score for every item as any other member. (Except for Attendance, if available)</li>
            <li>Every input and text must be filled out.</li>
            <li>All team members should be able to complete the evaluation table.</li>
            <li>Hover the question title to see the details.</li>
          </ul>
        </div>

        <div className="overflow-x-auto space-y-4">
          <table className="min-w-full border-collapse table-auto">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-sm">
                <th className="sticky left-0 bg-gray-100 p-3 text-left z-10 w-52 border-r border-gray-300">
                  Team Member
                </th>
                {questions
                  .filter((q) => q.questionType === "INPUT")
                  .map((question, index) => (
                    <th
                      key={question.qid}
                      className={`text-center p-3 min-w-[80px] border-r border-gray-200 ${
                        index > 3 ? "hidden lg:table-cell" : ""
                      }`}
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
              {teamMembers.map((member) => {
                const memberInputs = questions.filter((q) => q.questionType === "INPUT");
                const total = memberInputs.reduce((acc, q) => {
                  const val = parseFloat(responses[`${member.memberId}-${q.qid}`]) || 0;
                  return acc + val;
                }, 0);

                return (
                  <tr key={member.memberId} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="sticky left-0 bg-white z-0 p-3 font-medium text-gray-700 w-52 border-r border-gray-200">
                      {member.memberName}
                    </td>

                    {memberInputs.map((question, index) => (
                      <td
                        key={question.qid}
                        className={`p-3 text-center border-r border-gray-100 ${
                          index > 3 ? "hidden lg:table-cell" : ""
                        }`}
                      >
                        <input
                          type="number"
                          min="0"
                          max="10"
                          step="0.1"
                          placeholder="0.0"
                          className="w-20 text-center border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-gray-400"
                          value={responses[`${member.memberId}-${question.qid}`] || ""} // controlled input
                          onChange={(e) => {
                            const raw = e.target.value;
                            if (raw === "") {
                              handleResponseChange(member.memberId, question.qid, "");
                              return;
                            }
                            let num = parseFloat(raw);
                            if (isNaN(num)) return;
                            num = Math.min(Math.max(num, 0), 10);
                            handleResponseChange(member.memberId, question.qid, num);
                          }}
                        />
                      </td>
                    ))}

                    <td className="sticky right-0 bg-white z-0 text-center font-semibold border-l border-gray-200">
                      {total.toFixed(1)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </>
    )}

    {questions.filter((q) => q.questionType === "TEXT").length > 0 && (
      <div className="space-y-6">
        {questions
          .filter((q) => q.questionType === "TEXT")
          .map((question) => (
            <div key={question.qid} className="space-y-2">
              <div>
                <div className="font-semibold text-gray-800">{question.questionTitle}</div>
                <div className="text-sm text-gray-500">{question.questionDetails}</div>
              </div>
              <textarea
                rows="4"
                className="w-full border border-gray-300 rounded px-4 py-2 focus:ring-2 focus:ring-gray-400"
                placeholder="Write your response here..."
                value={responses[`text-${question.qid}`] || ""}
                onChange={(e) => handleResponseChange("text", question.qid, e.target.value)}
              />
            </div>
          ))}
      </div>
    )}

    <div className="flex justify-end mt-10">
      <button
      type="button"
        onClick={handleOpenModal}
        className="bg-gray-800 text-white px-6 py-2 rounded hover:bg-gray-900 transition w-full sm:w-auto"
      >
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

export default StudentEvaluation;
