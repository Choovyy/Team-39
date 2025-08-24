import { useUserContext } from '@/Contexts/AuthContext';
import { useQueueingManagerContext } from '@/Contexts/QueueingManagerContext'
import { MeetingBoardHistoryEntry, QUEUEIT_URL } from '@/Utils/Global_variables';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import IndexEnumerator from './IndexEnumerator';
import { Typography } from '@mui/material';
import MeetingBoardHistoryDetails from './MeetingBoardHistoryDetails';

interface HistoryBoardProps{
    
}

const HistoryBoard = () => {
    const queueingManager = useQueueingManagerContext().QueueingManager;
    const user = useUserContext();
    const [open,setOpen] = useState<boolean>(false)
    const [historyEntry, setHistoryEntry] = useState<MeetingBoardHistoryEntry>();
    const [index, setIndex] = useState<number>();
    const [histories, setHistories] = useState<Array<MeetingBoardHistoryEntry> | null | undefined>()
    useEffect(()=>{
        if(queueingManager?.meeting){
            fetch(`${QUEUEIT_URL}/meeting/teamMeetings/${queueingManager.meeting.queueingEntry.teamID}`)
            .then(async(res)=>{
                if(res.ok){
                    const response = await res.json();
                    // console.log(response)
                    setHistories(response)
                }else{
                    toast.error("Something went wrong while fetching meeting history.")
                }
            })
            .catch((err)=>{
                toast.error("Failed, caught an exception.")
                console.log(err)
            })
        }
    },[queueingManager?.meeting])

    const handleHistoryEntryClick = (entry:MeetingBoardHistoryEntry, index:number)=>{
        setHistoryEntry(entry);
        setOpen(true);
        setIndex(index)
    }
    return (
        <div className='rounded-md bg-gray-100 p-3 h-full overflow-auto flex flex-col gap-3'>
            <p style={{fontSize:'1.5em', fontWeight:'bold'}}>History</p>
            <div className='flex flex-col gap-3'>
            {histories?.slice().reverse().map((entry, index) => (
                <div onClick={(e)=>{handleHistoryEntryClick(entry, histories.length - index)}} key={index} className='flex gap-3 items-center bg-white p-3 cursor-pointer rounded-lg hover:bg-lgreen'>
                    <IndexEnumerator index={histories.length - index}/>
                    <Typography sx={{flex:1}} textAlign={"center"} variant='h6' fontWeight={"bold"}>
                        {new Date(entry.start).toDateString()}
                    </Typography>
                </div>
            ))}
  
            </div>
            <MeetingBoardHistoryDetails index={index} historyEntry={historyEntry} open={open} setOpen={setOpen} />
        </div>
    )
}

export default HistoryBoard
