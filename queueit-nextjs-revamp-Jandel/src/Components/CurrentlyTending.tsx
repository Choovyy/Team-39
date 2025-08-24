import { useUserContext } from '@/Contexts/AuthContext'
import { dpurple, lgreen, Meeting, UserType } from '@/Utils/Global_variables'
import { randomGroupImage } from '@/Utils/Utility_functions'
import { Button, Skeleton, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import ConfirmationModal from './ConfirmationModal'

interface CurrentlyTendingProps{
    meeting: Meeting | null | undefined
    concludeMeeting:Function
}
const CurrentlyTending:React.FC<CurrentlyTendingProps> = ({meeting, concludeMeeting}) => {
    // console.log(meeting)
    const user = useUserContext().user
    const [elapsedTime, setElapsedTime] = useState<string>('')
    const [groupImage, setGroupImage] = useState<string | null>(null)
    const [open,setOpen] = useState<boolean>(false)
    const [isGlowing, setIsGlowing] = useState(false);

    useEffect(()=>{
        setGroupImage(randomGroupImage());
    },[])

    useEffect(() => {
        if (meeting) {
            const meetingStart = new Date(meeting.start);
            const interval = setInterval(() => {
                const now = new Date();
                const elapsedSeconds = Math.floor((now.getTime() - meetingStart.getTime()) / 1000);
                const hours = Math.floor(elapsedSeconds / 3600);
                const minutes = Math.floor((elapsedSeconds % 3600) / 60); // Calculate remaining minutes
                const seconds = elapsedSeconds % 60; // Calculate remaining seconds
    
                setElapsedTime(`${hours > 0 ? `${hours} ${hours > 1 ? 'hours' : 'hour'} ` : ''}${minutes} ${minutes !== 1 ? 'minutes' : 'minute'} and ${seconds} ${seconds !== 1 ? 'seconds' : 'second'}`);
            }, 1000);
    
            // Cleanup interval on component unmount
            return () => clearInterval(interval);
        }
    }, [meeting]);

    useEffect(() => {
        setIsGlowing(!!meeting);
      }, [meeting]);

    return (
        <div className={`border-2 border-black w-full h-fit md:h-40 lg:h-40 xl:h-40 p-3 pb-6 flex items-center flex-col md:flex-row lg:flex-row xl:flex-row rounded-md bg-white ${isGlowing ? 'glow-effect' : ''}`}>
        <style>
          {`
            @keyframes glow {
              0% { box-shadow: 0 0 1px ${dpurple}; } 
              100% { box-shadow: 0 0 15px ${dpurple}; }
            } 
            .glow-effect {
              animation: glow 0.7s infinite alternate;
            }
          `}
        </style>
            <div className='h-full flex-1 flex flex-col'>
                <Typography variant='h6'>Currently Tending</Typography>
                <div className='relative h-full flex box-content flex-col md:flex-row lg:flex-row xl:flex-row items-center gap-3 overflow-hidden'>
                    {meeting?<img src={groupImage} alt="group vector" className='block h-full' />:<Skeleton sx={{height:'100%',aspectRatio:1}} variant='rectangular'/>}
                    <div className='flex flex-col'>
                        {meeting?<span style={{fontWeight:'bold'}}>{meeting?.queueingEntry.teamName}</span>:<Skeleton variant='text' width={300}/>}
                        {/* {meeting?<Typography variant='caption' color='gray'>{classroom?.section}</Typography>: <Skeleton variant='text' width={300}/>} */}
                        {meeting?<Typography variant='caption' color={dpurple}>Time elapsed: {elapsedTime}</Typography>:<Skeleton variant='text' width={300}/>}
                    </div>
                </div>
            </div>
            {user?.role == UserType.FACULTY && meeting? 
                <div>
                    <Button onClick={()=>{setOpen(true)}} sx={{backgroundColor:dpurple, color:'white', padding:'1em 1.5em'}}>
                        Conclude Meeting
                    </Button>
                </div>
                :
                <></>
            }
            <ConfirmationModal open={open} setOpen={setOpen} action={concludeMeeting} headerMessage='Meeting Conclusion Confirmation' bodyMessage='Please ensure you have reviewed the grading'/>
        </div>
    )
}

export default CurrentlyTending
