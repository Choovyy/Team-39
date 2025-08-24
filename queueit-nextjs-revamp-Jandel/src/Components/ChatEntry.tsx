"use client"
import { useUserContext } from '@/Contexts/AuthContext'
import { ChatDTO } from '@/Utils/Global_variables'
import { capitalizeFirstLetter, randomAvatar } from '@/Utils/Utility_functions'
import { Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'

interface ChatEntryProps{
    chat:ChatDTO
}

const ChatEntry:React.FC<ChatEntryProps> = ({chat}) => {
    const [avatar,setAvatar] = useState<string>()
    const user = useUserContext().user
    useEffect(()=>{
        setAvatar(randomAvatar())
    },[chat])
    return (
        <div className={`md:w-1/2 lg:w-1/2 xl:w-1/2 min-h-16 gap-3 w-full flex relative items-end ${chat.userID == user?.uid? 'justify-end self-end':'flex-row-reverse justify-end'} `}>
            <div className={`flex flex-col justify-start break-words ${chat.userID == user?.uid? 'items-end':'items-start'}`}>
                <Typography variant='subtitle2' fontWeight='bold'>{`${capitalizeFirstLetter(chat.firstname)} ${capitalizeFirstLetter(chat.lastname)}`}</Typography>
                <Typography className={`${chat.userID == user?.uid? 'text-start':''} bg-gray-200 rounded-xl`} style={{padding:'1px 10px'}} variant='caption'>{chat.message}</Typography>
            </div>
            <img src={avatar} alt="avatar" style={{height:'50px'}} />
        </div>
    )
}

export default ChatEntry
