import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../services/AuthContext';
import '../../styles/Survey/PersonalityTest.css';

/* PersonalityTest Page
   1. Fetch questions from /api/personality/questions
   2. Render Likert 1-5 radio scale
   3. On submit POST /api/personality/apply/{userId}
   4. Show result (archetype + trait scores) then allow Continue to AI Dashboard
*/

const scale = [1,2,3,4,5];

const PersonalityTest = () => {
  const { authState } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (authState?.isAuthenticated && authState?.role === "STUDENT" && authState?.uid) {
      const address = window.location.hostname;
      axios.get(`http://${address}:8080/user/profile/${authState.uid}`)
        .then(resp => {
          if (resp.data && resp.data.firstTimeUser === false) {
            navigate("/student-ai-dashboard");
          }
        })
        .catch(err => {
          if (err.response?.status && err.response.status !== 404) {
            console.error("User profile check error:", err);
          }
        });
    }
  }, [authState, navigate]);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const address = window.location.hostname;

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const resp = await axios.get(`http://${address}:8080/api/personality/questions`);
        setQuestions(resp.data || []);
      } catch (e) {
        setError(e.message || 'Failed to load questions');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [address]);

  const handleAnswer = (qid, val) => {
    setAnswers(prev => ({ ...prev, [qid]: val }));
  };

  const allAnswered = questions.length > 0 && questions.every(q => answers[q.id] !== undefined);

  const handleSubmit = async () => {
    if(!allAnswered || !authState.uid) return;
    setSubmitting(true); setError(null);
    try {
      // Gather all survey data from localStorage
      const allData = JSON.parse(localStorage.getItem('surveyData') || '{}');
      const survey3Data = JSON.parse(localStorage.getItem('survey3Data') || '{}');
      const step1 = allData.step1 || {};
      const step2 = allData.step2 || {};
      const step3 = survey3Data.interests ? { projectInterests: survey3Data.interests.map(i => i.name) } : { projectInterests: [] };
      const technicalSkills = (step2.selections || []).map(s => ({
        skill: s.skill,
        masteryLevel: s.masteryLevel || 1
      }));
      // Get personality summary from answers
      const personalityPayload = { answers: answers };
      // Evaluate personality first (no persistence yet)
      const personalityResp = await axios.post(`http://${address}:8080/api/personality/evaluate`, personalityPayload, {
        headers: { Authorization: authState.token ? `Bearer ${authState.token}` : undefined }
      });
      const personalitySummary = personalityResp.data?.summary || '';
      // Build final SurveyDTO
      const surveyDTO = {
        preferredRoles: [step1.preferredRole].filter(Boolean),
        technicalSkills: technicalSkills,
        projectInterests: step3.projectInterests,
        personality: personalitySummary
      };
      // Save survey
      await axios.post(`http://${address}:8080/api/survey/save/${authState.uid}`, surveyDTO, {
        headers: { Authorization: authState.token ? `Bearer ${authState.token}` : undefined }
      });
      // Clear localStorage
      localStorage.removeItem('surveyData');
      localStorage.removeItem('survey3Data');
      setResult(personalityResp.data);
    } catch (e) {
      console.error(e);
      setError(e.response?.data || e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const gotoDashboard = () => navigate('/student-ai-dashboard');

  return (
    <div className="personality-container">
      <div className="personality-card">
        <h1 className="title">Personality Assessment</h1>
        {!result && <p className="subtitle">Answer all questions (1 = Strongly Disagree, 5 = Strongly Agree)</p>}
        {loading && <p>Loading questions...</p>}
        {error && <div className="error">{String(error)}</div>}
        {!loading && !result && (
          <form onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
            <div className="questions">
              {questions.map((q, idx) => (
                <div key={q.id} className="question-block">
                  <div className="q-text"><span className="q-number">{idx+1}.</span> {q.text}</div>
                  <div className="scale">
                    {scale.map(s => (
                      <label key={s} className={`scale-item ${answers[q.id] === s ? 'selected' : ''}`}>
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={s}
                          checked={answers[q.id] === s}
                          onChange={() => handleAnswer(q.id, s)}
                        />
                        <span>{s}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="actions">
              <button type="button" className="back-button" onClick={() => navigate('/survey3')}>Back</button>
              <button type="submit" className="submit-button" disabled={!allAnswered || submitting}>
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        )}
        {result && (
          <div className="result-section">
            <h2 className="result-title">Your Archetype: {result.archetype}</h2>
            <p className="result-summary">{result.summary}</p>
            <div className="traits-grid">
              {Object.entries(result.traitScores || {}).map(([axis, val]) => (
                <div key={axis} className="trait-item">
                  <div className="trait-axis">{axis}</div>
                  <div className="trait-bar">
                    <div className="trait-fill" style={{ width: `${val}%` }}></div>
                  </div>
                  <div className="trait-value">{val}%</div>
                </div>
              ))}
            </div>
            <button className="continue-button" onClick={gotoDashboard}>Continue to AI Matches</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalityTest;
