import React from 'react';

const cleanupPersonality = (raw) => {
  if (!raw) return '';
  // remove score fragments like: Scores: C=12, I=34, P=56, D=78
  let cleaned = String(raw).replace(/Scores:\s*C=\d+,\s*I=\d+,\s*P=\d+,\s*D=\d+\.?/gi, '').trim();
  // collapse multiple spaces
  cleaned = cleaned.replace(/\s{2,}/g, ' ');
  return cleaned;
};

const getTitle = (raw) => {
  if (!raw) return '';
  return String(raw).split('(')[0].split('.')[0].trim();
};

// Curated, human-friendly descriptions for archetypes used across the app
const ARCHETYPE_COPY = {
  'Versatile Contributor': {
    summary:
      'Balanced, reliable teammate who adapts to what the project needs and keeps work moving.',
    suggestions: [
      'Pick up tasks across the stack and connect gaps between roles',
      'Coordinate handoffs and keep the team unblocked',
      'Write clear notes and tidy up details others miss'
    ]
  },
  'Structured Innovator': {
    summary:
      'Systematic problem-solver who brings new ideas but grounds them in process and structure.',
    suggestions: [
      'Design the approach, standards, and checklists for the team',
      'Prototype features and turn them into maintainable patterns',
      'Own code quality, testing, and documentation'
    ]
  },
  'Agile Collaborator': {
    summary:
      'Fast, communicative teammate who keeps momentum high and aligns people quickly.',
    suggestions: [
      'Facilitate standups and clarify next steps',
      'Pair program to unblock teammates',
      'Handle integration work across components'
    ]
  },
  'Visionary Explorer': {
    summary:
      'Big-picture thinker who spots opportunities and explores new approaches.',
    suggestions: [
      'Define the product direction and success criteria',
      'Research tools/tech and validate assumptions with quick spikes',
      'Translate user needs into focused milestones'
    ]
  }
};

const ViewPersonality = ({ open, onClose, name, personality }) => {
  if (!open) return null;

  const title = getTitle(personality);
  const curated = ARCHETYPE_COPY[title];
  const description = curated ? curated.summary : cleanupPersonality(personality);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div role="dialog" aria-modal="true" className="relative bg-white rounded-lg shadow-xl w-full max-w-lg mx-4">
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-teal">{name || 'User'}</h3>
            {title && <p className="text-sm text-gray-500">{title}</p>}
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2" aria-label="Close">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="20" height="20"><path fill="currentColor" d="M18.3 5.7a1 1 0 0 0-1.4 0L12 10.59 7.1 5.7a1 1 0 0 0-1.4 1.4L10.59 12l-4.9 4.9a1 1 0 1 0 1.4 1.4L12 13.41l4.9 4.9a1 1 0 0 0 1.4-1.4L13.41 12l4.9-4.9a1 1 0 0 0-.01-1.4z"/></svg>
          </button>
        </div>
        <div className="px-5 py-4 text-gray-700 leading-relaxed whitespace-pre-wrap">
          {description || 'No personality description available.'}
          {curated && curated.suggestions?.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-teal">Best ways to contribute</p>
              <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
                {curated.suggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ViewPersonality;


