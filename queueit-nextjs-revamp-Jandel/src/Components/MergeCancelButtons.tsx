"use client";
import React from 'react';
import { dpurple, lgreen } from '@/Utils/Global_variables';

interface MergeCancelButtonsProps {
  onMerge: () => void;
  onCancel: () => void;
}

const MergeCancelButtons: React.FC<MergeCancelButtonsProps> = ({ onMerge, onCancel }) => {
  return (
    <div>
      <button
        onClick={onMerge} 
        className="relative inline-block px-4 py-2 mr-2 bg-[#7D57FC] text-white rounded-lg shadow-md hover:bg-[#6A45E0] transition"
        style={{ textTransform: 'none' }}
      >
        Merge
      </button>
      <button
        onClick={onCancel}
        className="relative inline-block px-4 py-2 bg-white text-[#7D57FC] border border-[#7D57FC] rounded-lg transition hover:bg-[#CCFC57] hover:text-[#7D57FC]"
        style={{ textTransform: 'none' }}
      >
        Cancel
      </button>
    </div>
  );
};

export default MergeCancelButtons;