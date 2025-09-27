import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../../../services/AuthContext';
import LogoutButton from '../../../components/Auth/LogoutButton';
import Navbar from '../../../components/Navbar/Navbar';

/* Dashboard page: fetches AI match recommendations and displays them.
   NOTE (backend): match objects should include contact fields:
     - email (string)
     - github | githubUrl | githubHandle (string)
     - facebook | facebookUrl | facebookHandle (string)
   Backend devs: ensure these fields are present in the match payload if available.
*/

const Dashboard = () => {
  const { authState } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null); // UI: track hovered/focused card
  // Filters
  const [search, setSearch] = useState("");
  const [personalityFilter, setPersonalityFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [interestFilter, setInterestFilter] = useState("");
  const address = window.location.hostname;

  // Normalize contact values into safe hrefs for anchors
  

  const fetchMatches = async () => {
    setLoading(true); setError(null);
    try {
      const uid = authState.uid;
      if(!uid){
        throw new Error('User ID not available; ensure you are logged in.');
      }
      const resp = await axios.get(`http://${address}:8080/api/survey/match/user/${uid}`, {
        headers: { Authorization: authState.token ? `Bearer ${authState.token}` : undefined }
      });
      setMatches(resp.data);
    } catch (e) {
      console.error(e);
      setError(e.response?.data || e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatches(); // initial load
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  

  
  const buildOutlookComposeLink = (rawEmail, matchObj) => {
    if (!rawEmail) return null;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(rawEmail)) return null;

    const subject = encodeURIComponent('Collaboration Opportunity - CapstoneConnect');
    const bodyLines = [
      `Hi ${matchObj?.name || 'there'},`,
      ``,
      `I saw your profile on the CapstoneConnect Match Dashboard and would like to collaborate on a project / form a team.`,
      `Preferred Roles: ${
        Array.isArray(matchObj?.preferredRoles)
          ? matchObj.preferredRoles.map(r => (r.role || r)).join(', ')
          : 'N/A'
      }`,
      `Skills: ${
        Array.isArray(matchObj?.technicalSkills)
          ? matchObj.technicalSkills.map(s => (s.skill || s)).join(', ')
          : 'N/A'
      }`,
      `Project Interests: ${
        Array.isArray(matchObj?.projectInterests)
          ? matchObj.projectInterests.join(', ')
          : 'N/A'
      }`,
      ``,
      `Let me know if you're interested.`,
      ``,
      `Thanks,`,
      `${authState?.name || 'A Capstone User'}`
    ];
    const body = encodeURIComponent(bodyLines.join('\n'));
    // Outlook Web compose deeplink
    return `https://outlook.office.com/mail/deeplink/compose?to=${encodeURIComponent(rawEmail)}&subject=${subject}&body=${body}`;
  };

  
  const normalizeLink = (value, type) => {
    if (!value) return null;
    const v = String(value).trim();
    if (!v) return null;
    if (type === 'github') {
      const username = v.replace(/^@/, '');
      if (/^https?:\/\//i.test(username)) return username;
      return `https://github.com/${username}`;
    }
    if (type === 'facebook') {
      if (/^https?:\/\//i.test(v)) return v;
      return `https://facebook.com/${v.replace(/^@/, '')}`;
    }
    if (/^https?:\/\//i.test(v)) return v;
    return `https://${v}`;
  };

  // Helper: personality title (first phrase before '(' or '.')
  const getPersonalityTitle = (p) => {
    if(!p) return '';
    return p.split('(')[0].split('.')[0].trim();
  };

  // All possible archetypes defined in backend PersonalityService (deriveArchetype)
  const ALL_ARCHETYPES = [
    'Structured Innovator',
    'Agile Collaborator',
    'Visionary Explorer',
    'Versatile Contributor'
  ];
  // Build choices: union of backend list + any unexpected/new ones present in data
  const personalities = Array.from(new Set([
    ...ALL_ARCHETYPES,
    ...matches.map(m => getPersonalityTitle(m.personality)).filter(Boolean)
  ])).sort();
  const skills = Array.from(new Set(matches.flatMap(m => Array.isArray(m.technicalSkills) ? m.technicalSkills.map(ts => typeof ts === 'object' && ts.skill ? ts.skill : ts) : []).filter(Boolean)));
  const roles = Array.from(new Set(matches.flatMap(m => Array.isArray(m.preferredRoles) ? m.preferredRoles.map(r => typeof r === 'object' && r.role ? r.role : r) : []).filter(Boolean)));
  const interests = Array.from(new Set(matches.flatMap(m => Array.isArray(m.projectInterests) ? m.projectInterests : []).filter(Boolean)));

  // Filtering logic + self exclusion by email only
  const filteredMatches = matches.filter(m => {
    const userEmail = authState.email?.toLowerCase();
    if (userEmail) {
      const matchEmails = [m.email, m.personalEmail, m.contactEmail].filter(Boolean).map(e => String(e).toLowerCase());
      if (matchEmails.includes(userEmail)) return false;
    }
    const nameMatch = !search || m.name?.toLowerCase().includes(search.toLowerCase());
    const personalityTitle = getPersonalityTitle(m.personality);
    const personalityMatch = !personalityFilter || personalityTitle === personalityFilter;
    const skillMatch = !skillFilter || (Array.isArray(m.technicalSkills) && m.technicalSkills.some(ts => {
      const val = typeof ts === 'object' && ts.skill ? ts.skill : ts; return val === skillFilter; }));
    const roleMatch = !roleFilter || (Array.isArray(m.preferredRoles) && m.preferredRoles.some(r => { const val = typeof r === 'object' && r.role ? r.role : r; return val === roleFilter;}));
    const interestMatch = !interestFilter || (Array.isArray(m.projectInterests) && m.projectInterests.includes(interestFilter));
    return nameMatch && personalityMatch && skillMatch && roleMatch && interestMatch;
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] min-h-screen">
      <Navbar userRole={authState.role} />
      <div className="main-content bg-white text-teal p-4 md:px-20 lg:px-28 pt-20 md:pt-12">
        <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-teal">AI Match Recommendations</h1>
        </div>
        {/* Filter Bar */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <input
            type="text"
            placeholder="Search by name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border rounded px-3 py-2 min-w-[180px]"
          />
          <select value={personalityFilter} onChange={e => setPersonalityFilter(e.target.value)} className="border rounded px-3 py-2 min-w-[160px]">
            <option value="">All Personalities</option>
            {personalities.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
            <select value={skillFilter} onChange={e => setSkillFilter(e.target.value)} className="border rounded px-3 py-2 min-w-[160px]">
            <option value="">All Skills</option>
            {skills.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="border rounded px-3 py-2 min-w-[160px]">
            <option value="">All Roles</option>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={interestFilter} onChange={e => setInterestFilter(e.target.value)} className="border rounded px-3 py-2 min-w-[160px]">
            <option value="">All Project Interests</option>
            {interests.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
          <button type="button" onClick={() => { setSearch(""); setPersonalityFilter(""); setSkillFilter(""); setRoleFilter(""); setInterestFilter(""); }} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-sm rounded border">Clear</button>
        </div>
        {loading && <p className="text-gray-600">Loading matches...</p>}
        {error && <div className="text-red-600 mb-4">{String(error)}</div>}
        {!loading && filteredMatches?.length === 0 && !error && (
          <p className="text-gray-500">No matches found.</p>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMatches?.map((m, idx) => {
            const email = m.email;
            const outlookHref = buildOutlookComposeLink(email, m);
            const githubHref = normalizeLink(m.github || m.githubUrl || m.githubHandle, 'github');
            const facebookHref = normalizeLink(m.facebook || m.facebookUrl || m.facebookHandle, 'facebook');

            return (
              <div
                key={idx}
                // Accessible hover/focus region; keyboard users can tab to reveal panel
                tabIndex={0}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
                onFocus={() => setHoveredIndex(idx)}
                onBlur={() => setHoveredIndex(null)}
                // UI change: add overflow-hidden so the sliding panel is clipped inside the card (stays within card bounds)
                className="relative overflow-hidden border rounded-lg shadow-sm p-4 bg-white hover:shadow-md transition transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2"
                aria-labelledby={`match-${idx}-name`}
              >
                <div className="flex items-center gap-3 mb-2">
                  {m.profilePicture ? (
                    <img src={m.profilePicture} alt={m.name} className="w-12 h-12 rounded-full object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-teal flex items-center justify-center text-white font-semibold">
                      {m.name ? m.name.charAt(0).toUpperCase() : '?'}
                    </div>
                  )}
                  <div>
                    <h2 id={`match-${idx}-name`} className="font-semibold text-teal">{m.name || 'Unknown User'}</h2>
                    <p className="text-sm text-gray-500">Overall Score: <span style={{
                      color: m.overallScore >= 75 ? '#22c55e' : m.overallScore > 50 ? '#fbbf24' : '#ef4444',
                      fontWeight: 700
                    }}>{m.overallScore?.toFixed?.(2) ?? 'N/A'}%</span></p>
                  </div>
                </div>

                <div className="text-sm space-y-1 mb-2">
                  <p><span className="font-medium">Personality:</span> {m.personality ? m.personality.replace(/Scores: C=\d+, I=\d+, P=\d+, D=\d+\.?/g, '').trim() : 'No Personality'}</p>
                  <p><span className="font-medium">Skills:</span> {
                    Array.isArray(m.technicalSkills)
                      ? m.technicalSkills.map(ts => typeof ts === 'object' && ts.skill ? ts.skill : ts).join(', ')
                      : 'No Skills'
                  }</p>
                  <p><span className="font-medium">Roles:</span> {
                    Array.isArray(m.preferredRoles)
                      ? m.preferredRoles.map(r => typeof r === 'object' && r.role ? r.role : r).join(', ')
                      : 'No Role'
                  }</p>
                </div>

                {/* Sliding info panel: appears within the card (clipped by overflow-hidden) */}
                <div
                  // small fixed height so it doesn't push layout; absolute but clipped by parent overflow-hidden
                  className={`absolute left-0 right-0 bottom-0 border-t bg-gray-50/95 p-3 transition-all duration-300 ease-out
                    ${hoveredIndex === idx ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-full opacity-0 pointer-events-none'}`}
                  style={{ backdropFilter: 'saturate(120%) blur(4px)' }}
                >
                  <div className="flex items-center justify-between">
                     <div className="text-sm text-gray-700 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Email:</span>
                        {outlookHref ? (
                          <a
                            href={outlookHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Email ${m.name} via Outlook`}
                            aria-label={`Email ${m.name} via Outlook`}
                            className="p-1 rounded hover:bg-gray-100 inline-flex"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 64 64" aria-hidden="true">
                              <rect x="20" y="10" width="38" height="44" rx="4" fill="#0A64AD"/>
                              <path d="M6 20h34c1.657 0 3 1.343 3 3v18c0 1.657-1.343 3-3 3H6c-1.657 0-3-1.343-3-3V23c0-1.657 1.343-3 3-3z" fill="#ffffff" stroke="#0A64AD" strokeWidth="2"/>
                              <path d="M6 23l17 11 17-11" fill="none" stroke="#0A64AD" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="46" cy="32" r="11" fill="#ffffff" opacity="0.18"/>
                              <text x="46" y="36" textAnchor="middle" fontSize="14" fontFamily="Segoe UI, Arial" fontWeight="700" fill="#ffffff">O</text>
                            </svg>
                          </a>
                        ) : <span className="text-gray-400">N/A</span>}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-medium">GitHub:</span>
                        {githubHref ? (
                          <a
                            href={githubHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open GitHub profile"
                            aria-label="Open GitHub profile"
                            className="p-1 rounded hover:bg-gray-100 inline-flex"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                              <circle cx="12" cy="12" r="11" fill="#181717" />
                              <path d="M9.25 17.75c-.1-.3-.17-.77-.17-1.38 0-1.02.35-1.68.75-2.02-2.48-.28-3.83-1.14-3.83-3.02 0-.84.33-1.54.88-2.08-.09-.29-.38-1.07.08-2.02 0 0 .7-.23 2.3.88a8.1 8.1 0 0 1 4.18 0c1.6-1.11 2.3-.88 2.3-.88.46.95.17 1.73.08 2.02.55.54.88 1.24.88 2.08 0 1.88-1.36 2.74-3.84 3.02.53.45.82 1.15.82 2.16 0 .86-.06 1.55-.06 1.76 0 .23-.17.5-.64.42A6.43 6.43 0 0 1 12 18.5a6.43 6.43 0 0 1-1.69-.22c-.47.08-.64-.19-.64-.42Z" fill="#fff"/>
                            </svg>
                          </a>
                        ) : (
    <span className="p-1 inline-flex items-center justify-center opacity-30 leading-none" title="No GitHub provided">
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="11" fill="#181717" />
        <path d="M9.25 17.75c-.1-.3-.17-.77-.17-1.38 0-1.02.35-1.68.75-2.02-2.48-.28-3.83-1.14-3.83-3.02 0-.84.33-1.54.88-2.08-.09-.29-.38-1.07.08-2.02 0 0 .7-.23 2.3.88a8.1 8.1 0 0 1 4.18 0c1.6-1.11 2.3-.88 2.3-.88.46.95.17 1.73.08 2.02.55.54.88 1.24.88 2.08 0 1.88-1.36 2.74-3.84 3.02.53.45.82 1.15.82 2.16 0 .86-.06 1.55-.06 1.76 0 .23-.17.5-.64.42A6.43 6.43 0 0 1 12 18.5a6.43 6.43 0 0 1-1.69-.22c-.47.08-.64-.19-.64-.42Z" fill="#fff"/>
      </svg>
    </span>
  )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-medium">Facebook:</span>
                        {facebookHref ? (
                          <a
                            href={facebookHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="Open Facebook profile"
                            aria-label="Open Facebook profile"
                            className="p-1 rounded hover:bg-gray-100 inline-flex"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                              <circle cx="12" cy="12" r="11" fill="#1877F2" />
                              <path d="M13.3 8.5H15V6.1c-.3-.04-.98-.1-1.86-.1-1.84 0-3.1 1.15-3.1 3.25v1.8H8v2.3h2.04V19h2.46v-5.65h2.04l.33-2.3h-2.37v-1.6c0-.66.18-1.1 1.8-1.1Z" fill="#fff"/>
                            </svg>
                          </a>
                        ) : (
                          <span className="p-1 inline-flex items-center justify-center opacity-30 leading-none" title="No Facebook provided">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                              <circle cx="12" cy="12" r="11" fill="#1877F2" />
                              <path d="M13.3 8.5H15V6.1c-.3-.04-.98-.1-1.86-.1-1.84 0-3.1 1.15-3.1 3.25v1.8H8v2.3h2.04V19h2.46v-5.65h2.04l.33-2.3h-2.37v-1.6c0-.66.18-1.1 1.8-1.1Z" fill="#fff" />
                            </svg>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {/* end sliding panel */}

                <div className="mt-2 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Skill:</span>
                    <span style={{
                      color: m.skillScore >= 75 ? '#22c55e' : m.skillScore > 50 ? '#fbbf24' : '#ef4444',
                      fontWeight: 700
                    }}>
                      {m.skillScore?.toFixed?.(2) ?? '—'}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Personality:</span>
                    <span style={{
                      color: m.personalityScore >= 75 ? '#22c55e' : m.personalityScore > 50 ? '#fbbf24' : '#ef4444',
                      fontWeight: 700
                    }}>
                      {m.personalityScore?.toFixed?.(2) ?? '—'}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Interest:</span>
                    <span style={{
                      color: m.projectInterestScore >= 75 ? '#22c55e' : m.projectInterestScore > 50 ? '#fbbf24' : '#ef4444',
                      fontWeight: 700
                    }}>
                      {m.projectInterestScore?.toFixed?.(2) ?? '—'}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-6">
          <button onClick={fetchMatches} className="px-4 py-2 bg-teal text-white rounded hover:bg-teal/90 transition">
            Refresh Matches
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;