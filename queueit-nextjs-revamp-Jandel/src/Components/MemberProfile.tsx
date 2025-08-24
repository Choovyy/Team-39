import { useUserContext } from '@/Contexts/AuthContext'
import { SPEAR_URL, User } from '@/Utils/Global_variables'
import { capitalizeFirstLetter, randomAvatar, stringAvatar } from '@/Utils/Utility_functions'
import { Avatar, CircularProgress, Typography } from '@mui/material'
import { error } from 'console'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'

interface MemberProfileProps{
    memberID:number
}

const MemberProfile:React.FC<MemberProfileProps> = ({memberID}) => {
    const [studentDetails, setStudentDetails] = useState<User>()
    const avatar = useRef(randomAvatar())
    const user=useUserContext().user
    useEffect(()=>{
        if(memberID){
            fetch(`${SPEAR_URL}/get-student/${memberID}`,{
                method:"GET",
                headers:{
                    'Authorization': `Bearer ${user?.token}`
                }
            })
            .then(async(res)=>{
                switch(res.status){
                    case 200:
                        const response = await res.json()
                        setStudentDetails(response)
                        break;
                    case 404:
                        toast.error(`Student with ID: ${memberID} not found.`)
                        break;
                    default:
                        console.log(res.status)
                        toast.error("Session expired. Please log in.");
                }
            })
            .catch((err)=>{
                console.log(err);
                toast.error("Caught an exception while fetching student details.")
            })
        }
    },[memberID])
    return (
        <div className='bg-white rounded-md flex justify-center items-center flex-col w-60 p-6 overflow-hidden'>
            <div>
                <img src={avatar.current} alt="avatar" />
            </div>
            {studentDetails?
                <Typography fontWeight='bold' variant='subtitle1'>{`${capitalizeFirstLetter(studentDetails?.firstname)} ${capitalizeFirstLetter(studentDetails?.lastname)}`}</Typography>
                :
                <CircularProgress size={'small'}/>
            }
        </div>
    )
}

export default MemberProfile
