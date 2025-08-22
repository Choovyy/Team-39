import React from "react";

const ClassCard = ({
  courseCode,
  section,
  courseDescription,
  teacherName,
  onClick,
}) => {
  return (
    <div
      className="card rounded-lg overflow-hidden shadow-lg bg-white cursor-pointer hover:shadow-xl transition-shadow flex flex-col"
      onClick={onClick}
    >
      <div className="h-24 sm:h-32 flex items-center justify-center bg-teal">
        <h2 className="text-lg sm:text-2xl font-bold text-white text-center">
          {courseCode} - {section}
        </h2>
      </div>
      <div className="p-4 sm:p-6 text-teal flex flex-col gap-2">
        <p className="text-sm sm:text-base">{courseDescription}</p>
        <p className="text-xs sm:text-sm text-gray-600">
          <strong>Teacher:</strong> {teacherName}
        </p>
      </div>
    </div>
  );
};

export default ClassCard;
