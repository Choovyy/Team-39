import React, { useEffect, useState, useContext, useMemo } from 'react';
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
  const [activeTab, setActiveTab] = useState(0);
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

  // Build tabs by categorizing questions with simple keyword matching.
  const tabs = useMemo(() => {
    if (!questions || questions.length === 0) return [];

    const categories = [
      { key: 'work', title: 'Work Style', keywords: ['work', 'organized', 'detail', 'deadline', 'focus', 'independent', 'reliable'] },
      { key: 'collaboration', title: 'Collaboration & Communication', keywords: ['team', 'collabor', 'communicat', 'listen', 'lead', 'leader', 'support'] },
      { key: 'problem', title: 'Problem Solving & Learning', keywords: ['learn', 'problem', 'solve', 'creative', 'adapt', 'challenge', 'curious', 'improv'] },
    ];

    const buckets = { work: [], collaboration: [], problem: [], other: [] };

    questions.forEach((q) => {
      const text = (q.text || '').toLowerCase();
      let placed = false;
      for (const cat of categories) {
        if (cat.key && cat.key in buckets) {
          for (const kw of cat.keywords) {
            if (text.includes(kw)) { buckets[cat.key].push(q); placed = true; break; }
          }
        }
        if (placed) break;
      }
      if (!placed) buckets.other.push(q);
    });

    const result = [];
    if (buckets.work.length) result.push({ title: 'Work Style', questions: buckets.work });
    if (buckets.collaboration.length) result.push({ title: 'Collaboration & Communication', questions: buckets.collaboration });
    if (buckets.problem.length) result.push({ title: 'Problem Solving & Learning', questions: buckets.problem });
    if (buckets.other.length) result.push({ title: 'General & Self-Reflection', questions: buckets.other });

    // Ensure the original order is preserved across tabs by sorting within each tab by original index
    const idToIndex = Object.fromEntries(questions.map((q, i) => [q.id, i]));
    result.forEach(tab => tab.questions.sort((a, b) => (idToIndex[a.id] ?? 0) - (idToIndex[b.id] ?? 0)));

    return result;
  }, [questions]);

  const handleAnswer = (qid, val) => {
    setAnswers(prev => ({ ...prev, [qid]: val }));
  };

  const allAnswered = questions.length > 0 && questions.every(q => answers[q.id] !== undefined);

  const totalTabs = tabs.length || 1;

  const goToNextTab = () => setActiveTab((i) => Math.min(totalTabs - 1, i + 1));
  const goToPrevTab = () => setActiveTab((i) => Math.max(0, i - 1));

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
    <div className="personality-container" style={{ background: '#f8fafc', minHeight: '100vh', paddingTop: '48px', paddingBottom: '48px' }}>
      <div className="personality-card" style={{ background: '#ffffff' }}>
        <h1 className="title">Personality Assessment</h1>
        {!result && <p className="subtitle">Please respond to the statements below using the 1–5 scale where 1 = Strongly Disagree and 5 = Strongly Agree. Provide your most accurate response to help us assess your working preferences.</p>}
        {loading && <p>Loading questions...</p>}
        {error && <div className="error">{String(error)}</div>}
        {!loading && !result && (
          <form onSubmit={e => { e.preventDefault(); }} aria-label="Personality assessment form">
            <div className="tabs">
              <div className="tab-list" role="tablist" aria-label="Personality sections">
                {tabs.map((t, i) => (
                  <button
                    key={t.title}
                    role="tab"
                    aria-selected={activeTab === i}
                    className={`tab-button ${activeTab === i ? 'active' : ''}`}
                    onClick={() => setActiveTab(i)}
                  >
                    <span className="tab-title">{t.title}</span>
                  </button>
                ))}
              </div>

              <div className="tab-meta">
                <div className="section-progress">Section {Math.min(activeTab+1, totalTabs)} of {totalTabs}</div>
                <div className="h-2 bg-gray-200 rounded mt-1" style={{ width: '100%' }} aria-hidden>
                  <div className="h-2 bg-teal rounded" style={{ width: `${((activeTab+1) / totalTabs) * 100}%` }} aria-hidden></div>
                </div>
              </div>

              <div className="questions">
                {(tabs[activeTab] ? tabs[activeTab].questions : []).map((q, localIdx) => {
                  const globalIdx = questions.findIndex(qq => qq.id === q.id);
                  return (
                    <fieldset key={q.id} className="question-block">
                      <legend className="q-text">{q.text}</legend>
                      <div className="scale" role="radiogroup" aria-labelledby={`q-${q.id}`}>
                              {scale.map(s => (
                                <label key={s} className={`scale-item ${answers[q.id] === s ? 'selected' : ''}`}>
                                  <input
                                    type="radio"
                                    name={`q-${q.id}`}
                                    value={s}
                                    checked={answers[q.id] === s}
                                    onChange={() => handleAnswer(q.id, s)}
                                  />
                                  <span aria-hidden>{s}</span>
                                  <span className="sr-only">{s}</span>
                                </label>
                              ))}
                      </div>
                    </fieldset>
                  );
                })}
              </div>

              <div className="actions" style={{ alignItems: 'center' }}>
                <div>
                  <button type="button" className="back-button" onClick={() => {
                    if (activeTab === 0) navigate('/survey3'); else goToPrevTab();
                  }}>Back</button>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  {activeTab < totalTabs - 1 ? (
                    <button type="button" className="submit-button" onClick={goToNextTab}>Next Section</button>
                  ) : (
                    <button type="button" className="submit-button" disabled={!allAnswered || submitting} onClick={handleSubmit}>
                      {submitting ? 'Submitting...' : 'Finalize Assessment'}
                    </button>
                  )}
                </div>
              </div>

            </div>
            {/* NOTE FOR BACKEND: Personality evaluation is posted to /api/personality/evaluate then full survey saved to /api/survey/save. Backend should validate and store responses per user. */}
          </form>
        )}
        {result && (
          <div className="result-section">
            <div className="result-top">
              <div className="archetype-card">
                <div className="archetype-badge">{result.archetype ? result.archetype.charAt(0) : '?'}</div>
                <div className="archetype-body">
                  <div className="archetype-title">{result.archetype}</div>
                  <div className="archetype-sub">Your personality archetype</div>
                </div>
              </div>
              <div className="summary-card">
                <h3 className="summary-title">Summary</h3>
                <p className="result-summary">{result.summary}</p>
              </div>
            </div>

            <div className="traits-section">
              <h4 className="traits-title">Trait Scores</h4>
              <div className="traits-list">
                {Object.entries(result.traitScores || {}).map(([axis, val]) => (
                  <div key={axis} className="trait-row">
                    <div className="trait-row-left">
                      <div className="trait-axis">{axis}</div>
                    </div>
                    <div className="trait-row-right">
                      <div className="trait-bar" aria-hidden>
                        <div className="trait-fill" style={{ width: `${val}%` }}></div>
                      </div>
                      <div className="trait-value">{val}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="result-actions">
              <button className="continue-button" onClick={gotoDashboard}>Continue to AI Matches</button>
              <button className="share-button" onClick={() => { navigator.clipboard?.writeText(JSON.stringify(result)); }}>Copy Result</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PersonalityTest;
