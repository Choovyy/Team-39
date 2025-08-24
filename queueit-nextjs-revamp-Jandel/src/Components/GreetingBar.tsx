import { Typography } from '@mui/material'
import React from 'react'
import { capitalizeFirstLetter } from '@/Utils/Utility_functions'
import conductor from '../../public/images/conductor.png'
import squiggly from '../../public/images/squiggly.png'
import star from '../../public/images/star.png'

interface GreetingBarProps{
    name:string|"loading"
}

const GreetingBar:React.FC<GreetingBarProps> = ({name}) => {
    return (
        <div className='w-full bg-dpurple p-10 rounded-xl mt-10 relative'>
            <Typography variant='h3' color='white'>Hello, {name}!</Typography>
            <Typography color='white'>It's nice to see you here...</Typography>
            <img className='hidden lg:block xl:block' src={conductor.src} alt="conductor" style={{position:'absolute', height:'180%', bottom:-30, right:40, zIndex:2}}/>
            <img className='hidden lg:block xl:block' src={squiggly.src} alt="conductor" style={{position:'absolute', height:'100%', bottom:-0, right:290, zIndex:1}}/>
            <img className='hidden lg:block xl:block' src={star.src} alt="conductor" style={{position:'absolute', height:'50%', bottom:-0, right:30}}/>
        </div>
    )
}

export default GreetingBar
