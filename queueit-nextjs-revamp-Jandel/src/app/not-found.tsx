import React from 'react'
import brokenChain from '../../public/loaders/brokenchain.gif'
import NF404 from '../../public/images/NF404.gif'
import { Typography } from '@mui/material';

const NotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen text-center">
            <img src={NF404.src} alt="404 chain" />
            {/* <h1 className="text-5xl font-bold text-dpurple">404</h1> */}
            <div className='flex flex-col gap-3'>
                <p className="text-lg text-gray-600 mt-2">Oops! Page not found.</p>
                <Typography variant='caption' className=" text-gray-600 mt-2">Seems like a wanderer has gone off track. Let me help you go back somewhere familiar.</Typography>
            </div>
            <a href="/dashboard" className="mt-4 px-4 py-2 bg-lgreen text-black font-bold rounded-lg">
                Go Home
            </a>
        </div>
    );
}

export default NotFound