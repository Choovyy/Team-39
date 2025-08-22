import React from "react";

const ClassCard = ({ courseCode, section, courseDescription, onClick }) => {
  return (
    <div
      className="card rounded-lg overflow-hidden shadow-lg bg-white cursor-pointer w-full sm:w-auto"
      onClick={onClick}
    >
      {/* Course Code Section */}
      <div className="h-32 sm:h-40 flex items-center justify-center bg-teal px-4 sm:px-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white text-center">
          {courseCode} - {section}
        </h2>
      </div>

      {/* Course Description */}
      <div className="p-4 sm:p-8 text-teal">
        <p className="text-sm sm:text-base mt-2 sm:mt-4">{courseDescription}</p>
      </div>
    </div>
  );
};

export default ClassCard;
