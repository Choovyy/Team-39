import { AttendanceStatus, MeetingBoardHistoryEntry } from '@/Utils/Global_variables'
import { capitalizeFirstLetter } from '@/Utils/Utility_functions'
import { Modal, Typography } from '@mui/material'
import React from 'react'

interface MeetingBoardHistoryDetailsProps{
    historyEntry:MeetingBoardHistoryEntry | undefined | null
    open: boolean
    setOpen: Function
    index: number | null | undefined
}

const MeetingBoardHistoryDetails:React.FC<MeetingBoardHistoryDetailsProps> = ({historyEntry,open,setOpen, index}) => {
  return (
    <Modal open={open} onClose={()=>{setOpen(false)}}>
        <div className='bg-white rounded-md absolute w-2/3 flex flex-col p-10 h-2/3 overflow-auto gap-3' style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <Typography variant='h4' fontWeight={"bold"}>{`Meeting #${index}`}</Typography>
            <Typography variant='subtitle2' color='gray'>{new Date(historyEntry?.start).toDateString()}</Typography>
            <div className='flex gap-3'>
                {historyEntry?.attendanceList.map((attendanceEntry,index)=>(
                    <div key={index} className={`${attendanceEntry.attendanceStatus == AttendanceStatus.ABSENT?'bg-lushred':attendanceEntry.attendanceStatus == AttendanceStatus.LATE?'bg-lushorange':'bg-lushgreen'} rounded-md px-3 py-2`}>
                        <Typography>{`${capitalizeFirstLetter(attendanceEntry.lastname)}, ${capitalizeFirstLetter(attendanceEntry.firstname)} `}</Typography>
                    </div>
                ))}
            </div>
            <div className='flex flex-col gap-3'>
                <Typography variant='h6' fontWeight={"bold"}>What will you do?</Typography>
                <div className='w-full p-3 border-2 ' style={{backgroundColor:'#F9F9F9'}}>
                    <Typography variant='subtitle2' sx={{lineHeight:'2.5em'}}>{historyEntry?.notedAssignedTasks || 'None recorded for this meeting session'}</Typography>
                </div>
            </div>
            <div className='flex flex-col gap-3'>
                <Typography variant='h6' fontWeight={"bold"}>Are there any impediments?</Typography>
                <div className='w-full p-3 border-2 ' style={{backgroundColor:'#F9F9F9'}}>
                    <Typography variant='subtitle2' sx={{lineHeight:'2.5em'}}>{historyEntry?.impedimentsEncountered || 'No impediments recorded'}</Typography>
                </div>
            </div>
        </div>
    </Modal>
  )
}

export default MeetingBoardHistoryDetails