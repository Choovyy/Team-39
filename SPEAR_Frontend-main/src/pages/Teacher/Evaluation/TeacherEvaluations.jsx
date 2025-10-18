import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../components/Navbar/Navbar";
import AuthContext from "../../../services/AuthContext";
import * as XLSX from "xlsx";
import axios from "axios";
import { Eye } from "lucide-react"
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const TeacherEvaluations = () => {
  
  const { getDecryptedId, storeEncryptedId } = useContext(AuthContext);
  const [evaluations, setEvaluations] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [newEvaluation, setNewEvaluation] = useState({
    evaluationType: "",
    availability: "",
    dateOpen: "",
    dateClose: "",
    period: "Prelims",
  });
  const [customPeriodInput, setCustomPeriodInput] = useState("");
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [teamsByEval, setTeamsByEval] = useState({});       
  const [selectedTeam, setSelectedTeam] = useState(null);   
  const [submitted, setSubmitted] = useState([]);           
  const [pending,   setPending]   = useState([]);
  const role = localStorage.getItem("role"); 
  const [needsAdvisory, setNeedsAdvisory] = useState(false);

  const [advisersByEval, setAdvisersByEval]     = useState({});
  const [selectedAdviser, setSelectedAdviser]   = useState(null);
  const classId = getDecryptedId("cid"); 
  

  const address = getIpAddress();
  function getIpAddress() {
    const hostname = window.location.hostname;
    const indexOfColon = hostname.indexOf(":");
    return indexOfColon !== -1
      ? hostname.substring(0, indexOfColon)
      : hostname;
  }

  const [adviserSubmissionStatus, setAdviserSubmissionStatus] = useState({
    submitted: [],
    notSubmitted: []
  });
  

  useEffect(() => {
    axios
      .get(`http://${address}:8080/class/${classId}`)
      .then(res => setNeedsAdvisory(res.data.needsAdvisory))
      .catch(console.error);
  }, [address, classId]);


  useEffect(() => {
    if (showModal) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [showModal]);



  function getIpAddress() {
    const hostname = window.location.hostname;
    const indexOfColon = hostname.indexOf(":");
    return indexOfColon !== -1 ? hostname.substring(0, indexOfColon) : hostname;
  }

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const calculateAvailability = (dateOpen, dateClose) => {
    const currentDate = new Date();
    const openDate = new Date(dateOpen);
    const closeDate = new Date(dateClose);

    if (currentDate < openDate) {
      return "Closed"; // Before open date
    } else if (currentDate >= openDate && currentDate < closeDate) {
      return "Open"; // Between open and close dates
    } else {
      return "Closed"; // After close date
    }
  };

  const fetchEvaluations = async () => {
    try {
      const classId = getDecryptedId("cid");
      const response = await axios.get(
        `http://${address}:8080/teacher/class/${classId}/evaluations`
      );
      const sanitizedData = response.data.map((evaluation) => ({
        ...evaluation,
        dateOpen: evaluation.dateOpen || "",
        dateClose: evaluation.dateClose || "",
        period: evaluation.period || "",
      }));
      setEvaluations(sanitizedData);
    } catch (error) {
      console.error("Error fetching evaluations:", error);
    }
  };

  const fetchAdviserSubmissionStatus = async (evaluationId) => {
    try {
      const response = await axios.get(
        `http://${address}:8080/teacher/evaluation/${evaluationId}/advisers/submission-status`
      );
      
      setAdviserSubmissionStatus(response.data);
    } catch (error) {
      console.error("Error fetching adviser submission status:", error);
      toast.error("Failed to load adviser submission status");
    }
  };


  const fetchAdvisers = async (evaluationId) => {
    try {
      const classId = getDecryptedId("cid");                             
      const res = await axios.get(
        `http://${address}:8080/class/${classId}/qualified-teachers`
      );
      setAdvisersByEval(prev => ({
        ...prev,
        [evaluationId]: res.data
      }));
    } catch (err) {
      console.error("Error loading advisers", err);
    }
  };


  const fetchTeams = async (evaluationId) => {
    try {
      const res = await axios.get(
        `http://${address}:8080/teacher/evaluation/${evaluationId}/teams`
      );
      setTeamsByEval(prev => ({ ...prev, [evaluationId]: res.data }));
    } catch (err) {
      console.error("Error loading teams", err);
    }
  };
  
  const toggleRow = (rowIndex, evaluationId, type) => {
    const next = expandedIndex === rowIndex ? null : rowIndex;
    setExpandedIndex(next);
  
    if (next === rowIndex) {
      if (type === "ADVISER_TO_STUDENT") {
        fetchAdvisers(evaluationId);
        fetchAdviserSubmissionStatus(evaluationId);
      } else {
        fetchTeams(evaluationId);
      }
      setSelectedTeam(null);
      setSelectedAdviser(null);
      setSubmitted([]);
      setPending([]);
    }
  };

  const fetchSubmissionStatus = async (evaluationId, teamId) => {
    try {
      const [subRes, penRes] = await Promise.all([
        axios.get(`http://${address}:8080/teacher/evaluation/${evaluationId}/team/${teamId}/submitted-members`),
        axios.get(`http://${address}:8080/teacher/evaluation/${evaluationId}/team/${teamId}/pending-members`)
      ]);
      setSubmitted(subRes.data.submitted);
      setPending(penRes.data.pending);
      setSelectedTeam({ evaluationId, teamId });
    } catch(e) {
      console.error("Error loading submission status", e);
    }
  };


  //create dont affect the fetch please :(

  const handleCreateEvaluation = async () => {
    if (!validateEvaluation()) return;

    try {
      const classId = getDecryptedId("cid");
      const url = `http://${address}:8080/teacher/create-evaluation/${classId}`;

      const body = cleanEvaluationData({
        ...newEvaluation,
        evaluationType: newEvaluation.evaluationType || "STUDENT_TO_STUDENT",
        period:
          newEvaluation.period === "Others"
            ? `${customPeriodInput.trim()}`
            : newEvaluation.period || "Prelims",
      });

      const response = await axios.post(url, body, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.data || !response.data.eid) {
        throw new Error(
          "Invalid server response. No evaluation data returned."
        );
      }

      toast.success(response.data.message || "Evaluation created successfully!");

      // Ensure response data is correctly structured
      const newEval = {
        ...response.data,
        dateOpen: response.data.dateOpen || "N/A",
        dateClose: response.data.dateClose || "N/A",
        availability: calculateAvailability(
          response.data.dateOpen,
          response.data.dateClose
        ),
      };

      setEvaluations((prev) => [...prev, newEval]);

      setShowModal(false);
      setNewEvaluation({
        evaluationType: "STUDENT_TO_STUDENT", // Default value
        availability: "",
        dateOpen: "",
        dateClose: "",
        period: "Prelims",
      });
    } catch (error) {
      console.error("Error creating evaluation:", error);

      if (error.response) {
        console.error("Server responded with:", error.response.status);
        console.error("Response data:", error.response.data);
        setError(
          error.response?.data?.error ||
            `Server Error: ${error.response.status}`
        );
      } else if (error.request) {
        console.error("No response received from server.");
        setError("No response from server. Please check your connection.");
      } else {
        console.error("Error setting up the request:", error.message);
        setError("Unexpected error. Please try again.");
      }
    }
  };

  const cleanEvaluationData = (evaluation) => {
    const cleaned = {};
    Object.keys(evaluation).forEach((key) => {
      if (evaluation[key]) {
        cleaned[key] = evaluation[key];
      }
    });
    return cleaned;
  };

  const handleDeleteEvaluation = async (eid) => {
    if (!eid) {
      toast.error("Invalid evaluation ID");
      return;
    }

    if (window.confirm("Are you sure you want to delete this evaluation?")) {
      try {
        await axios.delete(
          `http://${address}:8080/teacher/delete-evaluation/${eid}`
        );
        toast.success("Evaluation deleted successfully!");
        fetchEvaluations();
      } catch (error) {
        console.error("Error deleting evaluation:", error);
      }
    }
  };

  const handleEditEvaluation = async () => {
    if (!validateEvaluation()) return;

    const eid = getDecryptedId("eid");
    if (!eid) {
      toast.error("Invalid evaluation ID");
      return;
    }

    const period =
      newEvaluation.period === "Others"
        ? `${customPeriodInput.trim()}`
        : newEvaluation.period || "Prelims";

    try {
      const response = await axios.put(
        `http://${address}:8080/teacher/update-evaluation/${eid}`,
        { ...newEvaluation, period }
      );
      toast.success("Evaluation updated successfully!");
      window.location.reload();
    } catch (error) {
      setError(error.response?.data?.message || "Error updating evaluation.");
    }
  };

  const validateEvaluation = () => {
    const { dateOpen, dateClose } = newEvaluation || {};
    if (!dateOpen || !dateClose) {
      setError("Both open and close dates are required.");
      return false;
    }
    const openDate = new Date(dateOpen);
    const closeDate = new Date(dateClose);

    if (isNaN(openDate.getTime()) || isNaN(closeDate.getTime())) {
      setError("Invalid date format.");
      return false;
    }

    if (openDate >= closeDate) {
      setError("Date open must be earlier than date close.");
      return false;
    }

    setError("");
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvaluation((prev) => ({
      ...prev,
      [name]: value || "",
    }));
  };

      // inside your component...

      const fetchTeamsWithMembers = async () => {
        try {
          const classId = getDecryptedId("cid");
          const res = await axios.get(`http://${address}:8080/class/${classId}/members`);
          return res.data;
        } catch (err) {
          console.error("Error fetching teams & members:", err);
          toast.error("Failed to load teams & members");
          return [];
        }
      };
      
      const fetchAdvisersList = async () => {
        try {
          const classId = getDecryptedId("cid");
          const res = await axios.get(`http://${address}:8080/class/${classId}/qualified-teachers`);
          return res.data;
        } catch (err) {
          console.error("Error fetching advisers:", err);
          toast.error("Failed to load advisers");
          return [];
        }
      };

      async function exportStudentToStudent(evaluationInfo, submissions, responses) {
        // Fetch team data
        const teams = await fetchTeamsWithMembers();
        
        const metadataRows = [
          ["Team Submissions"],
          ["Course Code",        evaluationInfo.courseCode       || ""],
          ["Section",            evaluationInfo.section          || ""],
          ["Period",             evaluationInfo.period           || ""],
          ["Evaluation Type",    evaluationInfo.evaluationType   || ""],
          ["Date Open",          evaluationInfo.dateOpen         || ""],
          ["Date Close",         evaluationInfo.dateClose        || ""],
          ["Availability",       evaluationInfo.availability     || ""],
          ["Course Description", evaluationInfo.courseDescription|| ""],
          ["Export Date",        new Date().toLocaleString()],
          [],
          ["teamName","memberName","submittedAt","status"]
        ];
        
        const dataRows = teams.flatMap(team =>
          team.members.map(m => {
            const sub = submissions.find(s => s.evaluatorId === m.memberId);
            return [team.teamName, m.memberName, sub?.submittedAt || "", sub?.status || "Not Submitted"];
          })
        );
        
        const dataSheet = XLSX.utils.aoa_to_sheet([...metadataRows, ...dataRows]);
        
        // Apply styling to metadata sheet
        applyMetadataStyles(dataSheet, metadataRows.length);
        
        // ----------------------------------------
        // 2) BUILD RESPONSES SHEET
        // ----------------------------------------
        const inputResponses = responses.filter(r => r.questionType === "INPUT");
        const textResponses = responses.filter(r => r.questionType === "TEXT");
        const respAoA = [];
        
        // To track positions for styling
        const styleInfo = {
          headerRows: [],
          calculationCols: {}, // Will store column indices for MAX, MIN, SUM, AVG
          overallRows: []      // Will store rows with overall averages
        };
        
        // Process each team
        for (const team of teams) {
          const names = team.members.map(m => m.memberName);
          
          // Group INPUT responses by evaluator for this team
          const evaluatorResponses = {};
          inputResponses
            .filter(r => names.includes(r.evaluateeName))
            .forEach(r => {
              if (!evaluatorResponses[r.evaluatorName]) {
                evaluatorResponses[r.evaluatorName] = [];
              }
              evaluatorResponses[r.evaluatorName].push(r);
            });
          
          // Get TEXT responses for this team
          const teamTxts = textResponses.filter(r => 
            names.includes(r.evaluateeName) || names.includes(r.evaluatorName)
          );
          
          // Skip if no data for this team
          if (Object.keys(evaluatorResponses).length === 0 && !teamTxts.length) continue;
          
          // Add team header
          respAoA.push([`Team: ${team.teamName}`]);
          const teamRowIndex = respAoA.length - 1;
          
          // ----------------------------------------
          // Process INPUT questions by evaluator
          // ----------------------------------------
          for (const [evaluator, eResponses] of Object.entries(evaluatorResponses)) {
            respAoA.push([`Evaluator: ${evaluator}`]);
            respAoA.push(["Question Type: INPUT"]);
            respAoA.push([]);
            
            // Get unique questions from this evaluator
            const questions = Array.from(new Set(eResponses.map(r => r.questionName)));
            
            // Create header row
            const headerRow = ["Question", "Question Details", ...names, "MAX", "MIN", "SUM", "AVERAGE"];
            respAoA.push(headerRow);
            styleInfo.headerRows.push(respAoA.length - 1);
            
            // Store calculation column indices for styling
            const maxCol = 2 + names.length;
            const minCol = maxCol + 1;
            const sumCol = minCol + 1;
            const avgCol = sumCol + 1;
            
            styleInfo.calculationCols[respAoA.length - 1] = { 
              maxCol, minCol, sumCol, avgCol 
            };
            
            // Process each question
            for (const question of questions) {
              const qResponses = eResponses.filter(r => r.questionName === question);
              const details = qResponses[0]?.questionDetails || "";
              
              const row = [question, details];
              
              // Collect scores for calculation
              const scores = [];
              
              // Add scores for each team member
              names.forEach(name => {
                const response = qResponses.find(r => r.evaluateeName === name);
                const score = response ? response.score : "";
                row.push(score);
                if (response && typeof response.score === 'number') {
                  scores.push(response.score);
                }
              });
              
              // Calculate statistics
              if (scores.length > 0) {
                // MAX, MIN, SUM
                const max = Math.max(...scores);
                const min = Math.min(...scores);
                const sum = scores.reduce((a, b) => a + b, 0);
                
                row.push(max);  // MAX
                row.push(min);  // MIN
                row.push(sum);  // SUM
                
                // Calculate AVERAGE with special handling
                let average;
                if (scores.length < 3) {
                  // Simple average for small teams
                  average = sum / scores.length;
                } else {
                  // Remove outliers for larger teams
                  average = (sum - max - min) / (scores.length - 2);
                }
                
                row.push(average.toFixed(2));  // AVERAGE
              } else {
                // No scores available
                row.push("", "", "", "");  // Empty statistics
              }
              
              respAoA.push(row);
            }
            
            // Calculate OVERALL AVERAGE
            if (questions.length > 0) {
              // Extract averages from question rows
              const averages = [];
              const questionsRows = respAoA.slice(-questions.length);
              
              questionsRows.forEach(row => {
                const avgValue = row[row.length - 1];
                if (avgValue !== "") {
                  averages.push(parseFloat(avgValue));
                }
              });
              
              // Add overall average row
              if (averages.length > 0) {
                const overallAvg = averages.reduce((a, b) => a + b, 0) / averages.length;
                
                const overallRow = Array(headerRow.length).fill("");
                overallRow[0] = "OVERALL AVERAGE";
                overallRow[overallRow.length - 1] = overallAvg.toFixed(2);
                
                respAoA.push(overallRow);
                styleInfo.overallRows.push(respAoA.length - 1);
              }
            }
            
            respAoA.push([]); // Add blank line after each evaluator
          }
          
          // ----------------------------------------
          // Process TEXT questions
          // ----------------------------------------
          if (teamTxts.length) {
            respAoA.push(["Question Type: TEXT"]);
            respAoA.push([]);
            const textHeaderRow = ["Question", "Question Details", "textResponse"];
            respAoA.push(textHeaderRow);
            styleInfo.headerRows.push(respAoA.length - 1);
            
            teamTxts.forEach(r => {
              respAoA.push([
                r.questionName, 
                r.questionDetails || "", 
                r.textResponse || "", 
              ]);
            });
          }
          
          respAoA.push([]);
        }
        
        const respSheet = XLSX.utils.aoa_to_sheet(respAoA);
        
        // Apply styles to response sheet
        applyResponseStyles(respSheet, styleInfo);
        
        // ----------------------------------------
        // 3) EXPORT WORKBOOK
        // ----------------------------------------
        const wb = XLSX.utils.book_new();
        
        // Set column widths
        const wscols = [
          {wch: 20}, // Question
          {wch: 30}, // Question Details
          {wch: 15}, // Student 1
          {wch: 15}, // Student 2
          {wch: 15}, // Student 3
          {wch: 15}, // Student 4
          {wch: 10}, // MAX
          {wch: 10}, // MIN
          {wch: 10}, // SUM
          {wch: 10}  // AVERAGE
        ];
        
        // Apply column widths
        respSheet['!cols'] = wscols;
        
        XLSX.utils.book_append_sheet(wb, dataSheet, "Team Submissions");
        XLSX.utils.book_append_sheet(wb, respSheet, "Responses");

        // 3) PEER & SELF ASSESSMENT RESULTS sheet
          // ----------------------------------------
          // a) Gather all student names
          const allNames = teams.flatMap(team => team.members.map(m => m.memberName));

          // b) Dedupe & sort alphabetically
          const uniqueNames = Array.from(new Set(allNames)).sort((a, b) =>
            a.localeCompare(b)
          );

          // c) Compute each student’s overall average (INPUT responses only)
          const peerRows = uniqueNames.map(name => {
            const scores = inputResponses
              .filter(r => r.evaluateeName === name)
              .map(r => r.score)
              .filter(s => typeof s === "number");
            const avg = scores.length
              ? (scores.reduce((sum, x) => sum + x, 0) / scores.length).toFixed(2)
              : "";
            return [name, avg];
          });

          // d) Build and append the sheet
          const peerAoA   = [["Name", "Peer & Self Assesment"], ...peerRows];
          const peerSheet = XLSX.utils.aoa_to_sheet(peerAoA);
          XLSX.utils.book_append_sheet(wb, peerSheet, "Peer & Self Assessment Results");
        
        // Generate filename with date
        const date = new Date().toISOString().slice(0,10);
        const filename = `${evaluationInfo.courseCode}_${evaluationInfo.period}_STS_${date}.xlsx`;
        
        // Write file
        XLSX.writeFile(wb, filename);
      }
      
      // Helper function for styling the metadata sheet
      function applyMetadataStyles(sheet, headerRowCount) {
        if (!sheet['!rows']) sheet['!rows'] = [];
        
        // Style for headers
        for (let i = 0; i < headerRowCount; i++) {
          // Make header rows bold
          sheet['!rows'][i] = { hpt: 20 }; // taller rows for headers
          
          // Set cell styles for each column in the header
          const range = XLSX.utils.decode_range(sheet['!ref']);
          for (let C = range.s.c; C <= range.e.c; C++) {
            const cell_address = XLSX.utils.encode_cell({r: i, c: C});
            if (!sheet[cell_address]) continue;
            
            // Apply bold formatting to header cells
            sheet[cell_address].s = {
              font: { bold: true },
              fill: { fgColor: { rgb: "E6E6E6" } }, // Light gray background
              alignment: { horizontal: "center", vertical: "center" }
            };
          }
        }
      }
      
      // Helper function for styling the response sheet
      function applyResponseStyles(sheet, styleInfo) {
        if (!sheet['!rows']) sheet['!rows'] = [];
        
        // Parse sheet range
        const range = XLSX.utils.decode_range(sheet['!ref']);
        
        // Style team and evaluator headers (make them bold and add background)
        for (let R = range.s.r; R <= range.e.r; R++) {
          const firstCellAddress = XLSX.utils.encode_cell({r: R, c: 0});
          if (!sheet[firstCellAddress]) continue;
          
          const value = sheet[firstCellAddress].v;
          if (typeof value === 'string') {
            if (value.startsWith('Team:')) {
              // Team header - blue
              sheet[firstCellAddress].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "4472C4" } }, // Blue
                alignment: { horizontal: "left" }
              };
            } else if (value.startsWith('Evaluator:')) {
              // Evaluator header - lighter blue
              sheet[firstCellAddress].s = {
                font: { bold: true },
                fill: { fgColor: { rgb: "D9E1F2" } }, // Light blue
                alignment: { horizontal: "left" }
              };
            } else if (value === 'Question Type: INPUT' || value === 'Question Type: TEXT') {
              // Section header - gray
              sheet[firstCellAddress].s = {
                font: { bold: true },
                fill: { fgColor: { rgb: "D9D9D9" } }, // Light gray
                alignment: { horizontal: "left" }
              };
            } else if (value === 'OVERALL AVERAGE') {
              // Overall Average - green background, white text
              sheet[firstCellAddress].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "548235" } }, // Green
                alignment: { horizontal: "center" }
              };
            }
          }
        }
        
        // Style table headers
        styleInfo.headerRows.forEach(rowIndex => {
          // Make header rows bold with table formatting
          sheet['!rows'][rowIndex] = { hpt: 20 }; // taller rows for headers
          
          for (let C = range.s.c; C <= range.e.c; C++) {
            const cell_address = XLSX.utils.encode_cell({r: rowIndex, c: C});
            if (!sheet[cell_address]) continue;
            
            // Apply header styling
            sheet[cell_address].s = {
              font: { bold: true, color: { rgb: "FFFFFF" } },
              fill: { fgColor: { rgb: "2F75B5" } }, // Dark blue
              alignment: { horizontal: "center", vertical: "center" },
              border: {
                top: { style: "thin" },
                bottom: { style: "thin" },
                left: { style: "thin" },
                right: { style: "thin" }
              }
            };
          }
        });
        
        // Style calculation columns (MAX, MIN, SUM, AVERAGE)
        Object.entries(styleInfo.calculationCols).forEach(([headerRowIndex, cols]) => {
          // Convert to number
          const headerRow = parseInt(headerRowIndex);
          
          // Get the range of data rows for this section
          let endRow = headerRow;
          for (let i = headerRow + 1; i <= range.e.r; i++) {
            const firstCellAddress = XLSX.utils.encode_cell({r: i, c: 0});
            if (!sheet[firstCellAddress] || sheet[firstCellAddress].v === "") break;
            if (typeof sheet[firstCellAddress].v === 'string' && 
                (sheet[firstCellAddress].v.startsWith('Team:') || 
                 sheet[firstCellAddress].v.startsWith('Evaluator:') ||
                 sheet[firstCellAddress].v === 'Question Type: INPUT' ||
                 sheet[firstCellAddress].v === 'Question Type: TEXT')) {
              break;
            }
            endRow = i;
          }
          
          // Style MAX column - light red
          for (let R = headerRow + 1; R <= endRow; R++) {
            const cell_address = XLSX.utils.encode_cell({r: R, c: cols.maxCol});
            if (!sheet[cell_address]) continue;
            
            sheet[cell_address].s = {
              fill: { fgColor: { rgb: "F4CCCC" } }, // Light red
              alignment: { horizontal: "center" }
            };
          }
          
          // Style MIN column - light yellow
          for (let R = headerRow + 1; R <= endRow; R++) {
            const cell_address = XLSX.utils.encode_cell({r: R, c: cols.minCol});
            if (!sheet[cell_address]) continue;
            
            sheet[cell_address].s = {
              fill: { fgColor: { rgb: "FFF2CC" } }, // Light yellow
              alignment: { horizontal: "center" }
            };
          }
          
          // Style SUM column - light blue
          for (let R = headerRow + 1; R <= endRow; R++) {
            const cell_address = XLSX.utils.encode_cell({r: R, c: cols.sumCol});
            if (!sheet[cell_address]) continue;
            
            sheet[cell_address].s = {
              fill: { fgColor: { rgb: "CFE2F3" } }, // Light blue
              alignment: { horizontal: "center" }
            };
          }
          
          // Style AVERAGE column - light green
          for (let R = headerRow + 1; R <= endRow; R++) {
            const cell_address = XLSX.utils.encode_cell({r: R, c: cols.avgCol});
            if (!sheet[cell_address]) continue;
            
            sheet[cell_address].s = {
              fill: { fgColor: { rgb: "D9EAD3" } }, // Light green
              alignment: { horizontal: "center" },
              font: { bold: true }
            };
          }
        });
        
        // Style overall average rows
        styleInfo.overallRows.forEach(rowIndex => {
          for (let C = range.s.c; C <= range.e.c; C++) {
            const cell_address = XLSX.utils.encode_cell({r: rowIndex, c: C});
            if (!sheet[cell_address]) continue;
            
            // Apply overall average styling - dark green background
            if (C === 0) {
              sheet[cell_address].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "548235" } }, // Dark green
                alignment: { horizontal: "left" }
              };
            } else if (C === range.e.c) { // Last column (AVERAGE)
              sheet[cell_address].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "548235" } }, // Dark green
                alignment: { horizontal: "center" }
              };
            } else {
              sheet[cell_address].s = {
                font: { bold: true },
                fill: { fgColor: { rgb: "E2EFDA" } }, // Light green
                alignment: { horizontal: "center" }
              };
            }
          }
        });
      }





      async function exportAdviserToStudent(evaluationInfo, submissions, responses) {
        // Fetch advisers and teams
        const [advisers, teams] = await Promise.all([
          fetchAdvisersList(),
          fetchTeamsWithMembers()
        ]);
      
        // Helper: apply styles to entire sheet
        const styleSheet = (ws, fillColor) => {
          const range = XLSX.utils.decode_range(ws['!ref']);
          for (let R = range.s.r; R <= range.e.r; ++R) {
            for (let C = range.s.c; C <= range.e.c; ++C) {
              const addr = XLSX.utils.encode_cell({ r: R, c: C });
              if (!ws[addr]) continue;
              ws[addr].s = ws[addr].s || {};
              // Center alignment
              ws[addr].s.alignment = { horizontal: 'center', vertical: 'center' };
              // Fill color on header rows
              if (fillColor && R === range.s.r) {
                ws[addr].s.fill = { patternType: 'solid', fgColor: { rgb: fillColor } };
              }
            }
          }
          // Freeze header row
          ws['!freeze'] = { xSplit: 0, ySplit: 1 };
        };
      
        // 1) Metadata sheet
        const metadataRows = [
          ['Adviser Submissions'],
          ['Course Code', evaluationInfo.courseCode || ''],
          ['Section', evaluationInfo.section || ''],
          ['Period', evaluationInfo.period || ''],
          ['Evaluation Type', evaluationInfo.evaluationType || ''],
          ['Date Open', evaluationInfo.dateOpen || ''],
          ['Date Close', evaluationInfo.dateClose || ''],
          ['Availability', evaluationInfo.availability || ''],
          ['Course Description', evaluationInfo.courseDescription || ''],
          ['Export Date', new Date().toLocaleString()],
          [],
          ['adviserName', 'submittedAt', 'status']
        ];
        const dataRows = advisers.map(a => {
          const sub = submissions.find(s => s.evaluatorId === a.uid);
          return [`${a.firstname} ${a.lastname}`, sub?.submittedAt || '', sub?.status || 'Not Submitted'];
        });
        const dataSheet = XLSX.utils.aoa_to_sheet([...metadataRows, ...dataRows]);
        styleSheet(dataSheet, 'FFDDEEFF');
      
        // 2) Responses sheet (detailed)
        const respAoA = [];
        const studentToTeam = {};
        teams.forEach(team => team.members.forEach(m => {
          studentToTeam[m.memberName] = team.teamName;
        }));
        const inputResponses = responses.filter(r => r.questionType === 'INPUT');
        const textResponses = responses.filter(r => r.questionType === 'TEXT');
        const summary = {};
        const teamsWith = new Set(inputResponses.map(r => studentToTeam[r.evaluateeName]).filter(Boolean));
      
        for (const teamName of teamsWith) {
          const teamStudents = teams.find(t => t.teamName === teamName)?.members.map(m => m.memberName) || [];
          if (!teamStudents.length) continue;
          // individual & team averages
          const individualAvgs = {};
          teamStudents.forEach(student => {
            const scores = inputResponses.filter(r => r.evaluateeName === student).map(r => r.score).filter(v => typeof v === 'number');
            individualAvgs[student] = scores.length ? scores.reduce((a,b) => a+b,0)/scores.length : '';
          });
          const vals = Object.values(individualAvgs).filter(v => typeof v === 'number');
          const teamAvg = vals.length ? vals.reduce((a,b) => a+b,0)/vals.length : '';
          summary[teamName] = { individualAvgs, teamAvg };
          // build section
          respAoA.push([`Team: ${teamName}`]);
          respAoA.push(['Question Type: INPUT']);
          const evIds = Array.from(new Set(inputResponses.filter(r => teamStudents.includes(r.evaluateeName)).map(r => r.evaluatorId)));
          const evNames = evIds.map(id => { const adv = advisers.find(a => a.uid === id); return adv ? `${adv.firstname} ${adv.lastname}` : ''; });
          respAoA.push(['Evaluator', ...evNames]); respAoA.push([]);
          respAoA.push(['Question','Question Details', ...teamStudents]);
          const qMap = {};
          inputResponses.forEach(r => {
            if (teamStudents.includes(r.evaluateeName)) {
              qMap[r.questionName] = qMap[r.questionName] || { details: r.questionDetails || '', scores: {} };
              qMap[r.questionName].scores[r.evaluateeName] = r.score;
            }
          });
          Object.entries(qMap).forEach(([qn,data]) => {
            const row = [qn, data.details]; teamStudents.forEach(s=>row.push(data.scores[s]||'')); respAoA.push(row);
          });
          respAoA.push([]);
        }
        // TEXT section unchanged...
          if (textResponses.length) {
            respAoA.push(["All Text Questions"]);
            respAoA.push(["Question Type: TEXT"], []);
            respAoA.push(["Question", "Question Details", "textResponse", "Evaluator"]);

            const adviserGroups = {};
            textResponses.forEach(r => {
              adviserGroups[r.evaluatorId] = adviserGroups[r.evaluatorId] ?? [];
              adviserGroups[r.evaluatorId].push(r);
            });
            for (const [aid, texts] of Object.entries(adviserGroups)) {
              const adv = advisers.find(a => a.uid === Number(aid));
              const advName = `${adv.firstname} ${adv.lastname}`;
              texts.forEach(r => respAoA.push([r.questionName, r.questionDetails||"", r.textResponse||"", advName]));
              respAoA.push([]);
            }
          }
        const respSheet = XLSX.utils.aoa_to_sheet(respAoA);
        styleSheet(respSheet, 'FFEFEACC');
      
        // 3) Summary sheet
        const sumAoA = [['Team','Evaluatee','Individual Average','Team Average']];
        Object.keys(summary).sort().forEach(teamName => {
          const { individualAvgs, teamAvg } = summary[teamName];
          Object.keys(individualAvgs).sort().forEach(student => {
            sumAoA.push([teamName, student, individualAvgs[student], teamAvg]);
          });
        });
        const sumSheet = XLSX.utils.aoa_to_sheet(sumAoA);
        styleSheet(sumSheet, 'FFE2F0FF');
      
        // Export workbook
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, dataSheet, 'Adviser Submissions');
        XLSX.utils.book_append_sheet(wb, respSheet, 'Responses');
        XLSX.utils.book_append_sheet(wb, sumSheet, 'Summary');
        const date = new Date().toISOString().slice(0,10);
        XLSX.writeFile(wb, `${evaluationInfo.courseCode}_${evaluationInfo.period}_ATS_${date}.xlsx`);
      }
      
      
        
      


      const handleDownload = async (eid) => {
        try {
          // Instead of fetching evaluation details from a separate endpoint,
          // use the evaluation data we already have in the component
          const evaluationInfo = evaluations.find(evalItem => evalItem.eid === eid);
          
          // Get additional class info for the export (course code, etc.)
          const classId = getDecryptedId("cid");
          const classInfoResponse = await axios.get(`http://${address}:8080/class/${classId}`);
          
          // Combine evaluation info with class info
          const exportInfo = {
            ...evaluationInfo,
            courseCode: classInfoResponse.data.courseCode || '',
            section: classInfoResponse.data.section || '',
            courseDescription: classInfoResponse.data.courseDescription || ''
          };
      
          // Fetch submissions and responses in parallel
          const [subRes, respRes] = await Promise.all([
            axios.get(`http://${address}:8080/submissions/by-evaluation/${eid}`),
            axios.get(`http://${address}:8080/responses/get-evaluation/${eid}`)
          ]);
          const submissions = subRes.data;  // Array<ResponseDTO>
          const responses = respRes.data;   // Array<ResponseDTO>
      
          // Choose export function based on evaluation type
          if (exportInfo.evaluationType === "STUDENT_TO_STUDENT") {
            await exportStudentToStudent(exportInfo, submissions, responses);
          } else {
            await exportAdviserToStudent(exportInfo, submissions, responses);
          }
      
          toast.success("Export completed successfully!");
        } catch (error) {
          console.error("Error exporting data:", error);
          toast.error("Failed to export data. Please try again.");
        }
      };







  
  return (
        <>
          <ToastContainer position="top-right" autoClose={3000} />
    <div className="flex flex-col lg:grid lg:grid-cols-[256px_1fr] min-h-screen">
      <Navbar userRole="TEACHER" />

      <div className="p-4 sm:p-6 md:p-8 bg-white shadow-md rounded-md w-full">
        {/* Header with Back and Create Evaluation buttons */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <button
            className="bg-teal text-white px-4 py-2 rounded-lg hover:bg-peach hover:text-white mb-4 w-full sm:w-auto"
            onClick={() => navigate(-1)}
          >
            Back
          </button>

          <button
            className="bg-teal text-white px-4 py-2 rounded-lg hover:bg-peach transition-all duration-300 w-full sm:w-auto"
            onClick={() => {
              setShowModal(true);
              setNewEvaluation({
                evaluationType: "",
                availability: "",
                dateOpen: "",
                dateClose: "",
                period: "",
              });
            }}
          >
            Create Evaluation
          </button>
        </div>

        {/* Evaluation title */}
        <h1 className="text-lg sm:text-xl font-semibold text-teal text-center mb-6">
          Evaluations
        </h1>

        {/* Responsive Table */}
        <div className="overflow-x-auto rounded-lg shadow-md max-h-[70vh]">
          <table className="min-w-full text-sm sm:text-base border border-gray-300">
            <thead className="sticky top-0 bg-[#323c47] text-white text-xs sm:text-sm shadow-md">
              <tr>
                <th className="px-4 py-2 text-left font-semibold">
                  Evaluation Type
                </th>
                <th className="px-4 py-2 text-left font-semibold">Period</th>
                <th className="px-4 py-2 text-left font-semibold">Date Open</th>
                <th className="px-4 py-2 text-left font-semibold">
                  Date Close
                </th>
                <th className="px-4 py-2 text-left font-semibold">
                  Availability
                </th>
                <th className="px-4 py-2 text-left font-semibold">Questions</th>
                <th className="px-4 py-2 text-left font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
            {evaluations.map((evalItem, idx) => (
          <React.Fragment key={evalItem.eid}>
              <tr
                  className="border-b cursor-pointer hover:bg-gray-50"
                  onClick={() => toggleRow(idx, evalItem.eid, evalItem.evaluationType)}
                >
                <td className="px-4 py-2">
                  {evalItem.evaluationType === "STUDENT_TO_STUDENT"
                    ? "Student to Student"
                    : evalItem.evaluationType === "STUDENT_TO_ADVISER"
                    ? "Student to Adviser"
                    : evalItem.evaluationType === "ADVISER_TO_STUDENT"
                    ? "Adviser to Student"
                    : "N/A"}
                </td>
                <td className="px-4 py-2">{evalItem.period || "N/A"}</td>
                <td className="px-4 py-2">{evalItem.dateOpen || "N/A"}</td>
                <td className="px-4 py-2">{evalItem.dateClose || "N/A"}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${
                      evalItem.availability === "Open"
                        ? "bg-green-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {evalItem.availability || "N/A"}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <button
                    className="border border-gray-300 text-black px-3 py-1 rounded-lg hover:bg-gray-200 transition"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent row toggle
                      storeEncryptedId("eid", evalItem.eid);
                      window.location.href = `/teacher/questions/${evalItem.eid}`;
                    }}
                  >
                    <Eye className="h-4 w-4 inline mr-1" />
                    View
                  </button>
                </td>
                <td className="px-4 py-2 flex flex-wrap gap-2">
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent row toggle
                      handleDeleteEvaluation(evalItem.eid);
                    }}
                  >
                    <i className="fa fa-trash"></i>
                  </button>
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    onClick={(e) => {
                      e.stopPropagation(); // prevent row toggle
                      setShowModal(true);
                      setNewEvaluation(evalItem);
                      storeEncryptedId("eid", evalItem.eid);
                    }}
                  >
                    <i className="fa fa-edit"></i>
                  </button>
                </td>
              </tr>

              {/* Dropdown row */}
              {expandedIndex === idx && (
                <tr className="bg-gray-50">
                  <td colSpan={7} className="p-4 text-sm text-gray-700">
                    {evalItem.availability === "Open" ? (
                      <div className="text-center text-red-500 py-8">
                        🔒 You can view submission details after this evaluation closes.
                      </div>
                    ) : (
                      <div className="space-y-4">

                        {/* 1) Content based on evaluation type */}
                        {evalItem.evaluationType === "ADVISER_TO_STUDENT" ? (
                          <>
                            {/* Adviser Submission Status Section */}
                            <div className="space-y-4">
                              <h4 className="text-lg font-semibold">Adviser Submission Status</h4>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white border rounded shadow p-4">
                                  <h5 className="font-medium mb-2">
                                    Submitted ({adviserSubmissionStatus.submitted?.length || 0})
                                  </h5>
                                  <ul className="list-disc list-inside max-h-40 overflow-y-auto text-gray-800">
                                    {adviserSubmissionStatus.submitted?.map(adviser => (
                                      <li key={adviser.adviserId}>
                                        {adviser.adviserName}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                
                                <div className="bg-white border rounded shadow p-4">
                                  <h5 className="font-medium mb-2">
                                    Not Submitted ({adviserSubmissionStatus.notSubmitted?.length || 0})
                                  </h5>
                                  <ul className="list-disc list-inside max-h-40 overflow-y-auto text-gray-800">
                                    {adviserSubmissionStatus.notSubmitted?.map(adviser => (
                                      <li key={adviser.adviserId}>
                                        {adviser.adviserName}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Team Selector (Keep this unchanged) */}
                            <div className="flex items-center justify-between">
                              <h4 className="text-lg font-semibold">Select a Team</h4>
                              <select
                                className="border border-gray-300 rounded px-3 py-1"
                                value={selectedTeam?.teamId ?? ""}
                                onChange={e => {
                                  const teamId = Number(e.target.value);
                                  if (teamId) fetchSubmissionStatus(evalItem.eid, teamId);
                                }}
                              >
                                <option value="">— Choose Team —</option>
                                {(teamsByEval[evalItem.eid] || []).map(t => (
                                  <option key={t.teamId} value={t.teamId}>
                                    {t.teamName}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {/* Team Submission Status Cards (Keep this unchanged) */}
                            {selectedTeam?.evaluationId === evalItem.eid && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="bg-white border rounded shadow p-4">
                                  <h5 className="font-medium mb-2">
                                    Submitted ({submitted.length})
                                  </h5>
                                  <ul className="list-disc list-inside max-h-40 overflow-y-auto text-gray-800">
                                    {submitted.map(m => (
                                      <li key={m.memberId}>
                                        {m.memberName}
                                        <span className="text-xs text-gray-500">
                                          {" "}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                <div className="bg-white border rounded shadow p-4">
                                  <h5 className="font-medium mb-2">
                                    Incomplete ({pending.length})
                                  </h5>
                                  <ul className="list-disc list-inside max-h-40 overflow-y-auto text-gray-800">
                                    {pending.map(m => (
                                      <li key={m.memberId}>{m.memberName}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            )}
                          </>
                        )}

                        {/* 3) Download button (make sure to include this part) */}
                        {(
                          evalItem.evaluationType === "STUDENT_TO_STUDENT"
                          || (evalItem.evaluationType === "STUDENT_TO_ADVISER" && role === "ADMIN")
                          || (evalItem.evaluationType === "ADVISER_TO_STUDENT")
                        ) && (
                          <div className="mt-4 text-right">
                            <button
                              className="bg-teal text-white px-4 py-2 rounded hover:bg-teal-dark"
                              onClick={() => handleDownload(evalItem.eid)}
                            >
                              Download All Data
                            </button>
                          </div>
                        )}
                        
                      </div>
                    )}
                  </td>
                </tr>
              )}

          </React.Fragment>
        ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 px-4">
            <div className="bg-white w-full sm:w-3/4 md:w-2/3 lg:w-1/3 p-6 rounded-lg shadow-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold mb-4">
                {newEvaluation.eid ? "Edit Evaluation" : "Create Evaluation"}
              </h2>
              <button
              type="button"
              onClick={() => setShowModal(false)}
              className="text-gray-500 hover:text-gray-700 mb-4"
            >
              ✖
            </button>
              </div>
              {error && (
                <div className="mb-4 text-red-500 text-sm">{error}</div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Evaluation Type
                </label>
                <select
                  name="evaluationType"
                  value={newEvaluation.evaluationType}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                >
                  {/* Always available */}
                  <option value="STUDENT_TO_STUDENT">Student to Student</option>

                  {/* Only show if needsAdvisory is true */}
                  {needsAdvisory && (
                    <>
                      <option value="STUDENT_TO_ADVISER">
                        Student to Adviser (Applicable to Teams that have Advisories)
                      </option>
                      <option value="ADVISER_TO_STUDENT">
                        Adviser to Student (Applicable to Teams that have Advisories)
                      </option>
                    </>
                  )}
                </select>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Open
                </label>
                <input
                  type="date"
                  name="dateOpen"
                  value={newEvaluation.dateOpen}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date Close
                </label>
                <input
                  type="date"
                  name="dateClose"
                  value={newEvaluation.dateClose}
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Period
                </label>
                <select
                  name="period"
                  value={newEvaluation.period}
                  onChange={(e) => {
                    handleInputChange(e);
                    if (e.target.value !== "Others") {
                      setCustomPeriodInput("");
                    }
                  }}
                  className="w-full border border-gray-300 px-3 py-2 rounded-lg"
                >
                  <option value="">Select Period</option>
                  <option value="Prelims">Prelims</option>
                  <option value="Midterms">Midterms</option>
                  <option value="Pre-Finals">Pre-Finals</option>
                  <option value="Finals">Finals</option>
                  <option value="Others">Others</option>
                </select>

                {newEvaluation.period === "Others" && (
                  <input
                    type="text"
                    placeholder="Enter custom period..."
                    value={customPeriodInput}
                    onChange={(e) => setCustomPeriodInput(e.target.value)}
                    className="mt-2 w-full border border-gray-300 px-3 py-2 rounded-lg"
                  />
                )}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  className="border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-200 transition"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="bg-teal text-white px-4 py-2 rounded-md hover:bg-peach transition"
                  onClick={() => {
                    if (newEvaluation?.eid) {
                      handleEditEvaluation();
                    } else {
                      handleCreateEvaluation();
                    }
                  }}
                >
                  {newEvaluation?.eid ? "Update" : "Create"}
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

export default TeacherEvaluations;
