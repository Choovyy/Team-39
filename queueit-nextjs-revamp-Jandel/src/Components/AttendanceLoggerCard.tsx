import { Attendance, AttendanceStatus } from '@/Utils/Global_variables'
import { capitalizeFirstLetter, stringAvatar } from '@/Utils/Utility_functions'
import { Avatar, CircularProgress, Skeleton } from '@mui/material'
import React, { useState } from 'react'

interface AttendanceLoggerCardProps{
    attendance:Attendance
    updateAttendanceStatus:Function
}

const AttendanceLoggerCard:React.FC<AttendanceLoggerCardProps> = ({attendance, updateAttendanceStatus}) => {

    const handleAttendanceStatusChange = ()=>{
        updateAttendanceStatus(attendance.studentEmail)
    }
    return (
        <div onClick={handleAttendanceStatusChange} className={`flex items-center justify-between p-3 rounded-md ${attendance.attendanceStatus == AttendanceStatus.PRESENT?"bg-lushgreen":attendance.attendanceStatus == AttendanceStatus.ABSENT?"bg-lushred":"bg-lushorange"} mt-1 cursor-pointer`}>
            {attendance?
                <>
                    <div className='flex gap-3 items-center'>
                        <Avatar {...stringAvatar(`${attendance?.firstname.trim()} ${attendance?.lastname.trim()}`)}/>
                        <span style={{fontWeight:'bold'}}>{`${capitalizeFirstLetter(attendance?.firstname)} ${capitalizeFirstLetter(attendance?.lastname)}`}</span>
                    </div>
                </>
                :
                <Skeleton sx={{width:'100%'}}/>
            }
        </div>
    )
}

export default AttendanceLoggerCard
