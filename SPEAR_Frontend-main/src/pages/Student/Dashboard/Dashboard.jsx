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
  const address = window.location.hostname;

  // Normalize contact values into safe hrefs for anchors
  const normalizeLink = (value, type) => {
    if (!value) return null;
    const v = String(value).trim();
    if (!v) return null;

    if (type === 'email') return `mailto:${v}`;

    if (/^https?:\/\//i.test(v)) return v;

    if (type === 'github') {
      const username = v.replace(/^@/, '');
      return `https://github.com/${username}`;
    }

    if (type === 'facebook') {
      return `https://facebook.com/${v.replace(/^@/, '')}`;
    }

    return `https://${v}`;
  };

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-[256px_1fr] min-h-screen">
      <Navbar userRole={authState.role} />
      <div className="main-content bg-white text-teal p-4 md:px-20 lg:px-28 pt-20 md:pt-12">
        <div className="flex items-start justify-between mb-4 gap-4 flex-wrap">
          <h1 className="text-2xl font-bold text-teal">AI Match Recommendations</h1>
        </div>
        {loading && <p className="text-gray-600">Loading matches...</p>}
        {error && <div className="text-red-600 mb-4">{String(error)}</div>}
        {!loading && matches?.length === 0 && !error && (
          <p className="text-gray-500">No matches yet.</p>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {matches?.map((m, idx) => {
            const emailHref = normalizeLink(m.email || m.personalEmail || m.contactEmail, 'email');
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
                    <p className="text-sm text-gray-500">Overall Score: {m.overallScore?.toFixed?.(2) ?? 'N/A'}</p>
                  </div>
                </div>

                <div className="text-sm space-y-1 mb-2">
                  <p><span className="font-medium">Personality:</span> {m.personality || 'No Personality'}</p>
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
                    <div className="text-sm text-gray-700">
                      <div className="mb-1">
                        <span className="font-medium mr-2">Email:</span>
                        {emailHref ? (
                          <a href={emailHref} className="text-[#323c47] underline" target="_blank" rel="noopener noreferrer">{m.email || m.personalEmail}</a>
                        ) : <span className="text-gray-400">N/A</span>}
                      </div>
                      <div className="mb-1">
                        <span className="font-medium mr-2">GitHub:</span>
                        {githubHref ? (
                          <a href={githubHref} className="text-[#323c47] underline" target="_blank" rel="noopener noreferrer">{m.github || m.githubHandle || 'View'}</a>
                        ) : <span className="text-gray-400">N/A</span>}
                      </div>
                      <div>
                        <span className="font-medium mr-2">Facebook:</span>
                        {facebookHref ? (
                          <a href={facebookHref} className="text-[#323c47] underline" target="_blank" rel="noopener noreferrer">{m.facebook || 'View'}</a>
                        ) : <span className="text-gray-400">N/A</span>}
                      </div>
                    </div>

                    {/* Compact action icons for quick interactions */}
                    <div className="flex items-center gap-2">
                      {emailHref && (
                        <a href={emailHref} target="_blank" rel="noopener noreferrer" title="Email" className="p-2 rounded hover:bg-gray-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#323c47" strokeWidth="1.5"><path d="M3 8.5v7A2.5 2.5 0 0 0 5.5 18h13A2.5 2.5 0 0 0 21 15.5v-7" strokeLinecap="round" strokeLinejoin="round"/><path d="M21 8.5L12 13 3 8.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </a>
                      )}
                      {githubHref && (
                        <a href={githubHref} target="_blank" rel="noopener noreferrer" title="GitHub" className="p-2 rounded hover:bg-gray-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#323c47" strokeWidth="1.5"><path d="M12 .5C5.65.5.5 5.65.5 12c0 5.09 3.29 9.41 7.86 10.94.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.35-1.3-1.71-1.3-1.71-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.11-.75.41-1.27.75-1.56-2.56-.29-5.26-1.28-5.26-5.7 0-1.26.45-2.29 1.2-3.1-.12-.3-.52-1.5.11-3.12 0 0 .97-.31 3.18 1.18A11.03 11.03 0 0 1 12 6.8c.98.01 1.97.13 2.9.38 2.2-1.49 3.18-1.18 3.18-1.18.63 1.62.23 2.82.12 3.12.75.81 1.2 1.84 1.2 3.1 0 4.43-2.71 5.4-5.29 5.68.42.37.8 1.11.8 2.24 0 1.62-.01 2.92-.01 3.32 0 .31.21.68.8.56C20.71 21.41 24 17.09 24 12c0-6.35-5.15-11.5-12-11.5z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </a>
                      )}
                      {facebookHref && (
                        <a href={facebookHref} target="_blank" rel="noopener noreferrer" title="Facebook" className="p-2 rounded hover:bg-gray-100">
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="#323c47" strokeWidth="1.5"><path d="M18 2h-3a4 4 0 0 0-4 4v3H8v3h3v7h3v-7h2.3l.7-3H14V6a1 1 0 0 1 1-1h3z" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
                {/* end sliding panel */}

                <div className="mt-2 text-xs text-gray-600">
                  <div>Skill: {m.skillScore?.toFixed?.(2) ?? '—'}</div>
                  <div>Personality: {m.personalityScore?.toFixed?.(2) ?? '—'}</div>
                  <div>Interest: {m.projectInterestScore?.toFixed?.(2) ?? '—'}</div>
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