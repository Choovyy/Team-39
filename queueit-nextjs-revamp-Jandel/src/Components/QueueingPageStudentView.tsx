"use client"
import { useFacultyContext } from '@/Contexts/FacultyContext'
import { dpurple, QueueingManager, QUEUEIT_URL } from '@/Utils/Global_variables';
import { capitalizeFirstLetter, randomAvatar, randomGroupImage, convertTo12HourFormat  } from '@/Utils/Utility_functions';
import { Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react'
import CurrentlyTending from './CurrentlyTending';
import Chat from './Chat';
import QueueingList from './QueueingList';
import StudentEnqueueModal from './TeamEnqueueModal';
import ItsYourTurnModal from './ItsYourTurnModal';
import { useTeamContext } from '@/Contexts/TeamContext';
import { useQueueingManagerContext } from '@/Contexts/QueueingManagerContext';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const QueueingPageStudentView = () => {
    const faculty = useFacultyContext().Faculty;
    const queueingManager = useQueueingManagerContext().QueueingManager
    const [modalToggle, setModalToggle] = useState(false)
    const [avatar, setAvatar] = useState<string>()
    const [currentTime, setCurrentTime] = useState<string>()
    const [groupAvatar, setGroupAvatar] = useState<string>()
    const router = useRouter()
    const team = useTeamContext().Team
    const [openModal, setOpenModal] = useState(false);
    const prevQueueingManager = usePrevious(queueingManager);

    function usePrevious<T>(value: T): T | undefined {
        const ref = useRef<T>(undefined);
        useEffect(() => {
          ref.current = value;
        }, [value]);
        return ref.current;
    }

    useEffect(() => {
        if (!prevQueueingManager || !queueingManager || !team?.tid) return;
      
        const wasInQueue = prevQueueingManager.queueingEntries?.some(entry => entry.teamID === team.tid);
        const isInQueueNow = queueingManager.queueingEntries?.some(entry => entry.teamID === team.tid);
      
        if (wasInQueue && !isInQueueNow) {
          alert("Your team has been removed from the queue.");
        }
      }, [queueingManager]);

      
    useEffect(() => {
        // Set the avatar when the component mounts
        setAvatar(randomAvatar())
        setGroupAvatar(randomGroupImage())
        // Function to get the current time
        const updateTime = () => {
            const now = new Date();
            const hours = now.getHours();
            const minutes = now.getMinutes();
            const ampm = hours >= 12 ? 'PM' : 'AM';
            const formattedHours = hours % 12 || 12; // Convert to 12-hour format
            const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;

            // Set the time in the desired format
            setCurrentTime(`${formattedHours}:${formattedMinutes} ${ampm}`);
        }

        // Update time every second
        const intervalId = setInterval(updateTime, 1000);

        // Cleanup interval on component unmount
        return () => {
            clearInterval(intervalId);
            
        }
    }, []);

    //logic for when the queue button is clicked.
    const handleQueueClick=()=>{
        setModalToggle(true)
    }

    const dequeue = ()=>{
        const queueingEntryID = queueingManager?.queueingEntries?.find(entry => entry.teamID == team?.tid)?.queueingEntryID

        if(queueingEntryID){
            fetch(`${QUEUEIT_URL}/queue/dequeue`,{
                body:JSON.stringify({
                    "queueingEntryID":queueingEntryID
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                method:'POST'
            })
            .then( async (res)=>{
                switch(res.status){
                    case 200:
                        toast.success("Dequeued from the line.")
                        break;
                    case 404:
                        const text = await res.text()
                        toast.error(text)
                        break;
                    default:
                        toast.error("Server error")
                }
            })
            .catch((err)=>{
                toast.error("Something went wrong while dequeueing.")
                console.log(err)
            })
        }else{
            toast.error("Your team is not in the line.")
        }
    }

    const goOnHold = ()=>{
        const queueingEntryID = queueingManager?.queueingEntries?.find(entry => entry.teamID == team?.tid)?.queueingEntryID

        if(queueingEntryID){
            fetch(`${QUEUEIT_URL}/queue/goOnHold`,{
                body:JSON.stringify({
                    "queueingEntryID":queueingEntryID
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                method:'POST'
            })
            .then( async (res)=>{
                switch(res.status){
                    case 200:
                        const success_message = await res.text()
                        toast.success(success_message)
                        break;
                    case 404:
                        const text = await res.text()
                        toast.error(text)
                        break;
                    case 400:
                        const text400 = await res.text()
                        toast.error(text400)
                        break;
                    default:
                        toast.error("Server error")
                }
            })
            .catch((err)=>{
                toast.error("Something went wrong while dequeueing.")
                console.log(err)
            })
        }else{
            toast.error("Your team is not in the line.")
        }
    }

    const requeue = ()=>{
        const queueingEntryID = queueingManager?.queueingEntries?.find(entry => entry.teamID == team?.tid)?.queueingEntryID

        if(queueingEntryID){
            fetch(`${QUEUEIT_URL}/queue/requeue`,{
                body:JSON.stringify({
                    "queueingEntryID":queueingEntryID
                }),
                headers: {
                    'Content-Type': 'application/json'
                },
                method:'POST'
            })
            .then( async (res)=>{
                switch(res.status){
                    case 200:
                        const success_message = await res.text()
                        toast.success(success_message)
                        break;
                    case 404:
                        const text = await res.text()
                        toast.error(text)
                        break;
                    case 400:
                        const text400 = await res.text()
                        toast.error(text400)
                        break;
                    default:
                        toast.error("Server error")
                }
            })
            .catch((err)=>{
                toast.error("Something went wrong while requeueing.")
                console.log(err)
            })
        }else{
            toast.error("Your team is not in the line.")
        }
    }
    
    useEffect(()=>{
        if(!queueingManager?.isActive && queueingManager?.meeting?.queueingEntry.teamID != team?.tid){
            router.back();
        }
    },[queueingManager?.isActive])


    useEffect(()=>{
        if(queueingManager?.meeting?.queueingEntry.teamID == team?.tid){
            setOpenModal(true);
        }
    },[queueingManager?.meeting]) 
    


    return (
        <div className='relative w-full h-full flex gap-3'>
            {/* left side */}
            <div className='flex flex-col w-full md:w-1/2 lg:w-1/2 xl:w-1/2 gap-3'>
                <div className='w-full h-28 bg-dpurple p-3 rounded-md relative flex'>
                    <img src={avatar} alt="avatar" style={{height:'100%'}} />
                    <Typography className='flex items-center' variant='h6' color='white' fontWeight='bold' textAlign='center'>{`${capitalizeFirstLetter(faculty?faculty.firstname:'')} ${capitalizeFirstLetter(faculty?faculty.lastname:'')}`}</Typography>
                    <Typography sx={{flex:1, justifyContent:'end', color:'white'}} className='w-full  text-end flex items-center'>
                        {queueingManager?.timeEnds ? `Queueing ends at ${convertTo12HourFormat(queueingManager.timeEnds)}` : "Open Time"}
                    </Typography>
                </div>
                <div className='w-full h-28 rounded-md relative flex border-2 border-black bg-white justify-between p-3 items-center'>
                    <Typography variant='h6'>Current Time</Typography>
                    <Typography variant='h3' fontWeight='bold'>{currentTime}</Typography>
                </div>
                <QueueingList requeue={requeue} goOnHold={goOnHold} dequeue={dequeue} handleQueueClick={handleQueueClick} teams={queueingManager?.queueingEntries}/>
            </div>

            {/* right side */}
            <div className='flex flex-col w-full md:w-1/2 lg:w-1/2 xl:w-1/2 gap-3'>
                <CurrentlyTending meeting={queueingManager?.meeting}/>
                <Chat faculty={faculty}/>
            </div>
            <StudentEnqueueModal modalToggle={modalToggle} setModalToggle={setModalToggle}/>
            <ItsYourTurnModal open={openModal} setOpen={setOpenModal} />
        </div>
    )
}

export default QueueingPageStudentView
