import React, { useMemo, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../services/AuthContext';
import axios from 'axios';
import people from '../../assets/imgs/people.png';
import '../../styles/Survey/Survey3.css';

const PROJECTS = [
  'Web Applications',
  'Mobile Apps', 
  'Game Development',
  'E-commerce Systems',
  'Task Management Systems',
  'AI Development'
];

const Survey3 = () => {
  const navigate = useNavigate();
  const { authState } = useContext(AuthContext);

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
  const [selected, setSelected] = useState(() => PROJECTS.reduce((a, p) => ({ ...a, [p]: false }), {}));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem('survey3Data');
    if (savedData) {
      try {
        const data = JSON.parse(savedData);
        if (data.interests && Array.isArray(data.interests)) {
          const newSelected = PROJECTS.reduce((a, p) => ({ ...a, [p]: false }), {});
          data.interests.forEach(interest => {
            if (PROJECTS.includes(interest.name)) {
              newSelected[interest.name] = true;
            }
          });
          setSelected(newSelected);
        }
      } catch (error) {
        console.error('Error loading survey3 data:', error);
      }
    }
  }, []);

  const hasAny = useMemo(() => Object.values(selected).some(Boolean), [selected]);

  const toggle = (project) => setSelected((prev) => ({ ...prev, [project]: !prev[project] }));

  const handleNext = () => {
    if (!hasAny) return;
    // Save Survey3 step locally
    const picks = PROJECTS.filter((p) => selected[p]).map((p) => ({ name: p }));
    localStorage.setItem('survey3Data', JSON.stringify({ interests: picks }));
    // Proceed to personality test, survey will be saved after personality
    navigate('/personality-test');
  };

  // UI helpers
  const [fontSize, setFontSize] = useState('16px');
  const surveyStep = 3;
  const applyFontSize = () => ({ fontSize });

  // Accessibility: keyboard toggle
  const handleKeyToggle = (e, project) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggle(project);
    }
  };

  return (
    <div className="survey3-container min-h-screen flex items-center justify-center" style={{ background: 'rgb(248 250 252 / var(--tw-bg-opacity, 1))', ...applyFontSize() }}>
      <div className="w-full max-w-3xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="w-2/3">
            <div className="text-sm text-gray-600">Step {surveyStep} of 3</div>
            <div className="h-2 bg-gray-200 rounded mt-1">
              <div className="h-2 bg-teal rounded" style={{ width: `${(surveyStep / 3) * 100}%` }} aria-hidden></div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button aria-label="Decrease font size" onClick={() => setFontSize('14px')} className="px-2 py-1 border rounded">A-</button>
            <button aria-label="Normal font size" onClick={() => setFontSize('16px')} className="px-2 py-1 border rounded">A</button>
            <button aria-label="Increase font size" onClick={() => setFontSize('18px')} className="px-2 py-1 border rounded">A+</button>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6">
          <h1 className="text-xl font-semibold text-teal mb-2">Project Interest</h1>
          <p className="text-gray-600 mb-4">Select the projects you're most interested in. This helps us match you to relevant projects.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {PROJECTS.map((project) => (
              <div
                key={project}
                role="checkbox"
                aria-checked={selected[project]}
                tabIndex={0}
                onKeyDown={(e) => handleKeyToggle(e, project)}
                onClick={() => toggle(project)}
                className={`p-3 rounded border cursor-pointer ${selected[project] ? 'border-teal bg-teal/10' : 'border-gray-200'}`}
              >
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={selected[project]} onChange={() => toggle(project)} className="hidden" aria-hidden />
                  <span className="font-medium">{project}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between">
            <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => navigate('/survey2')}>Back</button>
            <button
              className={`px-4 py-2 rounded ${!hasAny ? 'bg-gray-300 text-gray-500' : 'bg-teal text-white hover:bg-teal-dark'}`}
              disabled={!hasAny || loading}
              onClick={handleNext}
            >
              {loading ? 'Saving...' : 'Next'}
            </button>
          </div>

          {/* NOTE FOR BACKEND: Survey step data (step3 interests) saved to localStorage here. Backend should implement persistence endpoint to receive combined surveyData when ready. */}
        </div>
      </div>
    </div>
   );
 };
 
 export default Survey3;
