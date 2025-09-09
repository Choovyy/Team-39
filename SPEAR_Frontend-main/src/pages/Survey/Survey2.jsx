import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import people from '../../assets/imgs/people.png';
import '../../styles/Survey/Survey2.css';

const SKILLS = [
  'C Language',
  'HTML and CSS',
  'PHP',
  'JavaScript',
  'Java ',
  'Python  '
];

const Survey2 = () => {
  const navigate = useNavigate();

  const [selectedSkills, setSelectedSkills] = useState(() => {
    return SKILLS.reduce((acc, skill) => {
      acc[skill] = { selected: false, level: 0 };
      return acc;
    }, {});
  });
  const [otherSkill, setOtherSkill] = useState('');
  const [otherSkillLevel, setOtherSkillLevel] = useState(0);
  const [otherSelected, setOtherSelected] = useState(false);

  // Load saved data on component mount
  useEffect(() => {
  const savedData = JSON.parse(localStorage.getItem('surveyData') || '{}');

  if (savedData.step2 && savedData.step2.selections) {
    const newSelectedSkills = SKILLS.reduce((acc, skill) => {
      acc[skill] = { selected: false, level: 0 };
      return acc;
    }, {});

    savedData.step2.selections.forEach(selection => {
      if (SKILLS.includes(selection.skill)) {
        newSelectedSkills[selection.skill] = {
          selected: true,
          level: selection.masteryLevel || 0
        };
      } else {
        setOtherSkill(selection.skill);
        setOtherSkillLevel(selection.masteryLevel || 0);
        setOtherSelected(true);
      }
    });

    setSelectedSkills(newSelectedSkills);
  }
}, []);


  const hasAnySelection = useMemo(() => {
    const anyPreset = Object.values(selectedSkills).some((s) => s.selected && s.level > 0);
    const anyOther = otherSelected && otherSkill.trim().length > 0 && otherSkillLevel > 0;
    return anyPreset || anyOther;
  }, [selectedSkills, otherSelected, otherSkill, otherSkillLevel]);

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) => ({
      ...prev,
      [skill]: { ...prev[skill], selected: !prev[skill].selected }
    }));
  };

  const updateSkillLevel = (skill, level) => {
    setSelectedSkills((prev) => ({
      ...prev,
      [skill]: { ...prev[skill], level: parseInt(level) }
    }));
  };

  const handleNext = () => {
  if (!hasAnySelection) return;

  const selections = [];
  SKILLS.forEach((skill) => {
    const s = selectedSkills[skill];
    if (s.selected && s.level > 0) {
      selections.push({ skill, masteryLevel: s.level });
    }
  });
  if (otherSelected && otherSkill.trim() && otherSkillLevel > 0) {
    selections.push({ skill: otherSkill.trim(), masteryLevel: otherSkillLevel });
  }

  // Load previous survey data
  const allSurveyData = JSON.parse(localStorage.getItem('surveyData') || '{}');

  // Save current step (step2) data
  allSurveyData.step2 = { selections };

  // Save everything together
  localStorage.setItem('surveyData', JSON.stringify(allSurveyData));

  navigate('/survey3');
};

  return (
    <div className="survey2-container">
      <div className="survey2-background">
        <img src={people} alt="Professional team" className="background-image" />
        <div className="background-overlay"></div>
      </div>

      <div className="survey2-content">
        <h1 className="survey2-title">Technical Skills</h1>
        <p className="survey2-subtitle">Choose the skills where you are the strongest with!</p>

        <div className="skills-card">
          <h2 className="card-title">Technical Skills</h2>
          <p className="card-instruction">You can select multiple skills</p>

          <div className="skills-grid">
            {SKILLS.map((skill) => {
              const sk = selectedSkills[skill];
              return (
                <div key={skill} className={`skill-item ${sk.selected ? 'selected' : ''}`}>
                  <label className="skill-header">
                    <input
                      type="checkbox"
                      checked={sk.selected}
                      onChange={() => toggleSkill(skill)}
                    />
                    <span>{skill}</span>
                  </label>

                  {sk.selected && (
                    <div className="skill-mastery">
                      <div className="battery">
                        <div className="battery-level" style={{ width: `${sk.level}%` }}></div>
                      </div>
                      <span className="mastery-percentage">{sk.level}%</span>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={sk.level}
                        onChange={(e) => updateSkillLevel(skill, e.target.value)}
                      />
                      <div className="mastery-labels">
                        <span>Beginner</span>
                        <span>Expert</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className={`skill-item other-skill-block ${otherSelected ? 'selected' : ''}`}>
            <label className="skill-header">
              <input
                type="checkbox"
                checked={otherSelected}
                onChange={() => setOtherSelected(!otherSelected)}
              />
              <span>Others</span>
            </label>
            {otherSelected && (
              <>
                <div className="other-input-row">
                  <input
                    type="text"
                    value={otherSkill}
                    onChange={(e) => setOtherSkill(e.target.value)}
                    placeholder="Enter another skill"
                  />
                </div>
                <div className="skill-mastery">
                  <div className="battery">
                    <div className="battery-level" style={{ width: `${otherSkillLevel}%` }}></div>
                  </div>
                  <span className="mastery-percentage">{otherSkillLevel}%</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={otherSkillLevel}
                    onChange={(e) => setOtherSkillLevel(parseInt(e.target.value))}
                  />
                  <div className="mastery-labels">
                    <span>Beginner</span>
                    <span>Expert</span>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="actions">
            <button className="back-button" onClick={() => navigate('/survey1')}>Back</button>
            <button className={`next-button ${!hasAnySelection ? 'disabled' : ''}`} disabled={!hasAnySelection} onClick={handleNext}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Survey2;


