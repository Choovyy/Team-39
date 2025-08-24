import { IconButton } from '@mui/material'
import React from 'react'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace';
import { dpurple } from '@/Utils/Global_variables';
import { useRouter } from 'next/navigation';

const BackButton = () => {
    const router = useRouter()
    return (
        <IconButton onClick={()=>{router.back()}} sx={{backgroundColor:'white', '&:hover':{backgroundColor:'rgba(255,255,255,0.8)'}}}>
            <KeyboardBackspaceIcon sx={{color:dpurple}}/>
        </IconButton>
    )
}

export default BackButton
