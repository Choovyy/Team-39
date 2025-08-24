"use client"
import React, { useEffect, useState } from 'react'
import BackButton from './BackButton'
import { Avatar, Button, IconButton, Modal, Typography } from '@mui/material'
import { sampleGroupMembers, sampleTeams } from '@/Sample_Data/SampleData1';
import { capitalizeFirstLetter, randomQuotes, stringAvatar } from '@/Utils/Utility_functions';
import { dpurple, lgreen, SPEAR_URL } from '@/Utils/Global_variables';
import { useRouter } from 'next/navigation';
import { useMentoredClassroomContext } from '@/Contexts/MentoredClassroomContext';
import person from '../../public/images/pointingUpwardPerson.png'
import whiteStar from '../../public/images/star-white.png'
import whiteSquiggly from '../../public/images/squiggly-white.png'
import GroupBar from './GroupBar';
import { useTeamsContext } from '@/Contexts/TeamsContext';
import { toast } from 'react-toastify';
import { useUserContext } from '@/Contexts/AuthContext';
import CatLoader from './CatLoader';




const GroupDetailAdviserView = () => {
    const userContext = useUserContext();
    const user = userContext.user;
    const {Teams, setTeams} = useTeamsContext();
    const classroomContext = useMentoredClassroomContext().mentoredClassroom
    const [classroom, setClassroom] = useState(classroomContext) 
    const router = useRouter()
    const loading = useUserContext().loading
    useEffect(()=>{
    if(classroomContext){
        setClassroom(classroomContext)
    }
    },[classroomContext,router])


    useEffect(()=>{
        if(classroom){
            fetch(`${SPEAR_URL}/mentor/classroom/${classroom?.cid}/teams/${user?.uid}`)
            .then( async (res)=>{
                switch(res.status){
                    case 200:
                        const response = await res.json(); 
                        setTeams(response)
                        break;
                    case 404:
                        setTeams(undefined)
                        break;
                    default:
                        toast.error("Server error")
                }
            })
            .catch((err)=>{
                toast.error("Caught an exception while fetching teams.")
                console.log(err)
            })
        }
    },[classroom])

    if(loading || !classroomContext || user == null){
        return(
            <CatLoader loading={loading || !classroomContext || user == null}/>
        )
    }else{
        return (
            <div className='bg-dpurple flex flex-col flex-grow w-full h-full relative mt-5 rounded-md'>
                <img src={person.src} alt="person" className='absolute hidden lg:block xl:block left-0 bottom-0' style={{height:'70%', zIndex:2}} />
                <img className='hidden lg:block xl:block' src={whiteSquiggly.src} alt="conductor" style={{position:'absolute', height:'25%', bottom:190, left:350, zIndex:1}}/>
                <img className='hidden lg:block xl:block' src={whiteStar.src} alt="conductor" style={{position:'absolute', height:'10%', bottom:350, left:50}}/>
                <div className='p-3'>
                <BackButton/>
                </div>
                <Typography variant='h4' className='text-white text-center text-lg'>{`${classroom?.courseCode} - ${classroom?.section}`}</Typography>
                <Typography variant='h2' className='text-white text-center text-lg font-bold'>{classroom?.courseDescription}</Typography> 
                <div className='w-full h-full lg:w-1/2 xl:w-1/2 border-red-500 flex-grow p-3 flex flex-col gap-5 overflow-auto' style={{alignSelf:'end'}}> 
                {Teams?.map((team,index)=>(
                    <GroupBar key={index} team={team} index={index}/>
                ))}
                </div>
            </div>
        
      )
    }
}

export default GroupDetailAdviserView