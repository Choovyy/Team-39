import { Attendance } from '@/Utils/Global_variables'
import React from 'react'
import AttendanceLoggerCard from './AttendanceLoggerCard'
import { Stack, Typography } from '@mui/material'
import CircleIcon from '@mui/icons-material/Circle';

interface AttendanceLoggerProps {
    attendanceList: Array<Attendance>
    updateAttendanceStatus: Function
}

const AttendanceLogger: React.FC<AttendanceLoggerProps> = ({ attendanceList, updateAttendanceStatus }) => {
    return (
        <div className="p-3 bg-gray-100 rounded-md h-full flex flex-col">
            {/* Header - Fixed */}
            <p style={{ fontSize: '1.5em', fontWeight: 'bold' }}>Attendance</p>

            {/* Legend - Fixed */}
            <Stack gap={1} direction="row" alignItems="center">
                <CircleIcon fontSize="small" className="text-lushgreen" /> <Typography variant="caption">Present</Typography>
                <CircleIcon fontSize="small" className="text-lushred" /> <Typography variant="caption">Absent</Typography>
                <CircleIcon fontSize="small" className="text-lushorange" /> <Typography variant="caption">Late</Typography>
            </Stack>
 
            <div
                className="overflow-y-auto flex-1 min-h-0"
                style={{
                    scrollbarWidth: 'thin', 
                    scrollbarColor: '#7D57FC #fff',  
 
                    WebkitScrollbar: { width: '12px' },
                    WebkitScrollbarTrack: { background: '#f1f1f1' },
                    WebkitScrollbarThumb: {
                        backgroundColor: '#7D57FC',
                        borderRadius: '10px',
                    },
                    WebkitScrollbarThumbHover: { background: '#555' }
                }}
            >
                {attendanceList?.map((attendance, index) => (
                    <AttendanceLoggerCard key={index} attendance={attendance} updateAttendanceStatus={updateAttendanceStatus} />
                ))}
            </div>
        </div>
    );
};

export default AttendanceLogger;
