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

  return (
    <div className="survey3-container">
      <div className="survey3-background">
        <img src={people} alt="Professional team" className="background-image" />
        <div className="background-overlay"></div>
      </div>

      <div className="survey3-content">
        <div className="survey3-left">
          <div className="projects-card">
            <h2 className="card-title">Project Interest</h2>
            <p className="card-instruction">Select one or more interests</p>

            <div className="projects-grid">
              {PROJECTS.map((project) => (
                <div key={project} className={`project-item ${selected[project] ? 'selected' : ''}`}>
                  <label className="project-header">
                    <input type="checkbox" checked={selected[project]} onChange={() => toggle(project)} />
                    <span>{project}</span>
                  </label>
                </div>
              ))}
            </div>

            <div className="actions">
              <button className="back-button" onClick={() => navigate('/survey2')}>Back</button>
              <button 
                className={`next-button ${!hasAny ? 'disabled' : ''}`} 
                disabled={!hasAny || loading} 
                onClick={handleNext}
              >
                {loading ? 'Saving...' : 'Next'}
              </button>
            </div>
          </div>
        </div>
        
        <div className="survey3-right">
          <h1 className="survey3-title">Project Interest</h1>
          <p className="survey3-subtitle">Choose the projects you're most comfortable with!</p>
        </div>
      </div>
    </div>
  );
};

export default Survey3;
