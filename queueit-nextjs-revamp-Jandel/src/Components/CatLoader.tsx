import { Modal, Typography } from '@mui/material'
import React from 'react'
import catLoader from '../../public/loaders/catloader.gif'
import { dpurple } from '@/Utils/Global_variables'

interface CatLoaderProps{
    loading:boolean
}

const CatLoader:React.FC<CatLoaderProps> = ({loading}) => {
    


    return (
        <Modal
            open={loading}
            sx={{
                backdropFilter: 'blur(5px)', // Optional: adds a blur effect to the background
                bgcolor: 'transparent', // Set background to transparent
                border: 'none', // Remove any borders
            }}
        >
            <div className='absolute flex flex-col gap-3 justify-center items-center' style={{top:'50%',left:'50%', transform:'translate(-50%,-50%)'}}>
                <img src={catLoader.src} alt="catLoader" style={{height:'150px'}} />
                <Typography variant='h5' fontWeight='bold' color={dpurple}>Loading ...</Typography>
                <Typography variant='caption' color='white'>Here's a cat to keep you company while you wait.</Typography>
            </div>
        </Modal>
    )
}

export default CatLoader