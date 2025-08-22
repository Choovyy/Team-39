import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar/Navbar";
import AuthContext from "../../services/AuthContext";
import axios from "axios";
import * as XLSX from "xlsx";

const AdminEvaluations = () => {
  const { authState } = useContext(AuthContext);
  const [evaluations, setEvaluations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [exportInProgress, setExportInProgress] = useState(false);

  const navigate = useNavigate();
  const address = window.location.hostname;

  useEffect(() => {
    fetchEvaluations();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const response = await axios.get(
        `http://${address}:8080/admin/students-to-adviser-evaluations`,
        { headers: { Authorization: `Bearer ${authState.token}` } }
      );
      setEvaluations(response.data || []);
    } catch (error) {
      console.error("Error fetching evaluations:", error);
      setError("Failed to fetch evaluations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (eid, evaluationInfo) => {
  try {
    setExportInProgress(true);
    // Fetch submissions and responses
    const [submissionsRes, responsesRes] = await Promise.all([
      axios.get(`http://${address}:8080/submissions/by-evaluation/${eid}`, { headers: { Authorization: `Bearer ${authState.token}` } }),
      axios.get(`http://${address}:8080/responses/get-evaluation/${eid}`,  { headers: { Authorization: `Bearer ${authState.token}` } }),
    ]);

    // Normalize responses
    const processedResponses = responsesRes.data.map(resp => ({
      ...resp,
      score: resp.score || 0,
      questionName: resp.questionName || "",
      questionDetails: resp.questionDetails || "", // Include question details
      questionType: resp.questionType || "INPUT",
      textResponse: resp.textResponse || resp.text_response || "",
      adviserName: resp.evaluateeName || "", 
      studentName: resp.evaluatorName || ""
    }));

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Metadata sheet - removed evaluatee information
    const metaAoA = [
      ['Evaluation Details'],
      ['Course Code', evaluationInfo.courseCode || ''],
      ['Section',     evaluationInfo.section    || ''],
      ['Period',      evaluationInfo.period     || ''],
      ['Adviser Name(s)', evaluationInfo.adviserName || ''],
      ['Date Open',   evaluationInfo.dateOpen   || ''],
      ['Date Close',  evaluationInfo.dateClose  || ''],
      ['Availability',evaluationInfo.availability|| ''],
      ['Course Description', evaluationInfo.courseDescription || ''],
      ['Export Date', new Date().toLocaleString()],
      [],
      ['Submissions Information'],
      []
    ];
    
    if (submissionsRes.data?.length) {
      const headers = ['Evaluator (Student)','Status','Submission Date'];
      const rows = submissionsRes.data.map(s => [
        s.evaluatorName,
        s.status,
        new Date(s.submittedAt).toLocaleString()
      ]);
      metaAoA.push(headers, ...rows);
    }
    
    const metaSheet = XLSX.utils.aoa_to_sheet(metaAoA);
    metaSheet['!cols'] = [{wch:20},{wch:40}];
    XLSX.utils.book_append_sheet(workbook, metaSheet, 'Evaluation Info');

    // Create a separate sheet for each adviser (evaluatee)
    const adviserResponses = {};
    
    // Group by adviser first
    processedResponses.forEach(r => {
      const adviserName = r.evaluateeName || "Unknown Adviser";
      adviserResponses[adviserName] = adviserResponses[adviserName] || [];
      adviserResponses[adviserName].push(r);
    });
    
    // For each adviser, create a separate sheet
    Object.entries(adviserResponses).forEach(([adviserName, responses]) => {
      // Get all unique students
      const students = [...new Set(responses.map(r => r.evaluatorName))];
      
      // Create question map to get details
      const questionMap = {};
      responses.forEach(r => {
        if (!questionMap[r.questionName]) {
          questionMap[r.questionName] = {
            type: r.questionType,
            details: r.questionDetails
          };
        }
      });
      
      // Get all unique questions
      const questions = Object.keys(questionMap);

      
      // Create a table format: Questions as rows, Students as columns
      //this formula includes the question average
      const tableData = [];
      
      // Header row with student names
      const headerRow = ['Question Type', 'Question', 'Question Details'];
      students.forEach(student => {
        headerRow.push(student);
      });
      headerRow.push('Question Average'); // Add question average column
      tableData.push(headerRow);
      
      // Group questions by type
      const questionsByType = {
        'INPUT': [],
        'TEXT': []
      };
      
      questions.forEach(q => {
        const questionType = questionMap[q].type || 'INPUT';
        questionsByType[questionType].push(q);
      });
      
      // First add INPUT questions (numeric scores)
      if (questionsByType['INPUT'].length > 0) {
        tableData.push(['', '-- NUMERIC SCORES --', '']);
        
        // For calculating overall average
        let overallScoreSum = 0;
        let overallScoreCount = 0;
        
        questionsByType['INPUT'].forEach(question => {
          const row = ['INPUT', question, questionMap[question].details || ''];
          
          let questionSum = 0;
          let questionCount = 0;
          
          students.forEach(student => {
            // Find the response for this student and question
            const response = responses.find(r => 
              r.evaluatorName === student && 
              r.questionName === question &&
              r.questionType === 'INPUT'
            );
            
            if (response) {
              row.push(response.score);
              questionSum += response.score;
              questionCount++;
              overallScoreSum += response.score;
              overallScoreCount++;
            } else {
              row.push('');
            }
          });
          
          // Add question average
          const questionAvg = questionCount > 0 ? (questionSum / questionCount).toFixed(2) : '';
          row.push(questionAvg);
          
          tableData.push(row);
        });
        
        // Add student average row
        const avgRow = ['', 'STUDENT AVERAGE', ''];
        students.forEach(student => {
          const studentResponses = responses.filter(r => 
            r.evaluatorName === student && 
            r.questionType === 'INPUT'
          );
          
          if (studentResponses.length > 0) {
            const avg = studentResponses.reduce((sum, r) => sum + r.score, 0) / studentResponses.length;
            avgRow.push(avg.toFixed(2));
          } else {
            avgRow.push('');
          }
        });
        
        // Add overall average to student average row
        const overallAvg = overallScoreCount > 0 ? (overallScoreSum / overallScoreCount).toFixed(2) : '';
        avgRow.push(overallAvg);
        tableData.push(avgRow);
        
        // Add overall average row
        tableData.push(['', 'OVERALL AVERAGE', '', overallAvg, '']);
      }

      // this function removes the question average
      // Create a table format: Questions as rows, Students as columns
      // const tableData = [];

      // // Header row with student names (without Question Average)
      // const headerRow = ['Question Type', 'Question', 'Question Details'];
      // students.forEach(student => {
      //   headerRow.push(student);
      // });
      // // Removed Question Average column
      // tableData.push(headerRow);

      // // Group questions by type
      // const questionsByType = {
      //   'INPUT': [],
      //   'TEXT': []
      // };

      // questions.forEach(q => {
      //   const questionType = questionMap[q].type || 'INPUT';
      //   questionsByType[questionType].push(q);
      // });

      // // First add INPUT questions (numeric scores)
      // if (questionsByType['INPUT'].length > 0) {
      //   tableData.push(['', '-- NUMERIC SCORES --', '']);
        
      //   // For calculating overall average
      //   let overallScoreSum = 0;
      //   let overallScoreCount = 0;
        
      //   questionsByType['INPUT'].forEach(question => {
      //     const row = ['INPUT', question, questionMap[question].details || ''];
          
      //     students.forEach(student => {
      //       // Find the response for this student and question
      //       const response = responses.find(r => 
      //         r.evaluatorName === student && 
      //         r.questionName === question &&
      //         r.questionType === 'INPUT'
      //       );
            
      //       if (response) {
      //         row.push(response.score);
      //         overallScoreSum += response.score;
      //         overallScoreCount++;
      //       } else {
      //         row.push('');
      //       }
      //     });
          
      //     // Removed question average calculation and column
      //     tableData.push(row);
      //   });
        
      //   // Add student average row
      //   const avgRow = ['', 'STUDENT AVERAGE', ''];
      //   students.forEach(student => {
      //     const studentResponses = responses.filter(r => 
      //       r.evaluatorName === student && 
      //       r.questionType === 'INPUT'
      //     );
          
      //     if (studentResponses.length > 0) {
      //       const avg = studentResponses.reduce((sum, r) => sum + r.score, 0) / studentResponses.length;
      //       avgRow.push(avg.toFixed(2));
      //     } else {
      //       avgRow.push('');
      //     }
      //   });
        
      //   tableData.push(avgRow);
        
      //   // Add overall average row
      //   const overallAvg = overallScoreCount > 0 ? (overallScoreSum / overallScoreCount).toFixed(2) : '';
      //   tableData.push(['', 'OVERALL AVERAGE', '', overallAvg]);
      // }
      
      // Then add TEXT questions (comments)
      if (questionsByType['TEXT'].length > 0) {
        tableData.push(['', '', '']);
        tableData.push(['', '-- COMMENTS --', '']);
        
        questionsByType['TEXT'].forEach(question => {
          const row = ['TEXT', question, questionMap[question].details || ''];
          
          students.forEach(student => {
            // Find the response for this student and question
            const response = responses.find(r => 
              r.evaluatorName === student && 
              r.questionName === question &&
              r.questionType === 'TEXT'
            );
            row.push(response ? response.textResponse : '');
          });
          
          // Empty cell for question average column
          row.push('');
          
          tableData.push(row);
        });
      }
      
      // Convert table to sheet
      const sheet = XLSX.utils.aoa_to_sheet(tableData);
      
      // Set column widths
      const colWidth = [{wch:10}, {wch:30}, {wch:40}];
      students.forEach(() => colWidth.push({wch:20}));
      colWidth.push({wch:15}); // Question average column
      sheet['!cols'] = colWidth;
      
      // Add the sheet to workbook
      const safeSheetName = adviserName.replace(/[*?:\/\[\]]/g, '_').substring(0, 30); // Safe sheet name
      XLSX.utils.book_append_sheet(workbook, sheet, safeSheetName);
    });

    // Generate and download
    const filename = `${evaluationInfo.courseCode}_${evaluationInfo.period}_STA_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, filename);
    alert('Excel file downloaded successfully!');
  } catch (err) {
    console.error('Error downloading Excel:', err);
    alert('Failed to download evaluation data.');
  } finally {
    setExportInProgress(false);
  }
};

  return (
    <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] min-h-screen">
      <Navbar userRole="ADMIN" />
      <div className="p-8 bg-white shadow-md rounded-md w-full">
        <div className="flex justify-between items-center mb-6 pt-8">
          <h1 className="text-2xl font-bold text-gray-800">Student to Adviser Evaluations</h1>
        </div>

        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        {loading ? (
          <div className="text-center text-gray-500">Loading evaluations...</div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow-md">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-[#323c47] text-white">
              <tr>
                <th className="px-4 py-3 text-center font-semibold border">Course</th>
                <th className="px-4 py-3 text-center font-semibold border">Section</th>
                <th className="px-4 py-3 text-center font-semibold border">Period</th>
                <th className="px-4 py-3 text-center font-semibold border">Date Open</th>
                <th className="px-4 py-3 text-center font-semibold border">Date Close</th>
                <th className="px-4 py-3 text-center font-semibold border">Availability</th>
                <th className="px-4 py-3 text-center font-semibold border">Action</th>
              </tr>
            </thead>
            <tbody>
              {evaluations.length > 0 ? (
                evaluations.map((evaluation, index) => (
                  <tr key={`${evaluation.eid}-${index}`} className="border-b">
                    <td className="px-4 py-3 border">
                      <div className="font-semibold">{evaluation.courseCode}</div>
                      {evaluation.courseDescription && (
                        <div className="text-sm text-gray-600 mt-1">{evaluation.courseDescription}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 border">{evaluation.section}</td>
                    <td className="px-4 py-3 border">{evaluation.period}</td>
                    <td className="px-4 py-3 border">{evaluation.dateOpen}</td>
                    <td className="px-4 py-3 border">{evaluation.dateClose}</td>
                    <td className="px-4 py-3 border">{evaluation.availability}</td>
                    <td className="px-4 py-3 border">
                      <button
                        className={`text-white px-3 py-2 rounded-md transition w-full flex items-center justify-center ${
                          exportInProgress || evaluation.availability === "Open"
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-500 hover:bg-green-700"
                        }`}
                        onClick={() => handleDownload(evaluation.eid, evaluation)}
                        disabled={exportInProgress || evaluation.availability === "Open"}
                      >
                        {exportInProgress ? (
                          <>
                            <span className="animate-spin mr-2">⟳</span> Exporting...
                          </>
                        ) : (
                          <>
                            <i className="fa fa-download mr-2"></i> Download
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
                ) : (
                  <tr>
                    <td colSpan="8" className="border p-3 text-center text-gray-500">
                      No evaluations available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminEvaluations;