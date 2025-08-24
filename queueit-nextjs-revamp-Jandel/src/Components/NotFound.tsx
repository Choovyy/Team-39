import { dpurple, lgreen } from '@/Utils/Global_variables'
import { Button } from '@mui/material'
import { useRouter } from 'next/navigation'
import React, { PropsWithChildren } from 'react'

interface NotFoundProps{

}


const NotFound:React.FC<PropsWithChildren<NotFoundProps>> = ({children}) => {
    const router = useRouter()
    return (
        <div className='flex-1 flex flex-col items-center justify-center bg-white relative gap-3'>
            {children}
            <Button onClick={()=>{router.push('/dashboard')}} sx={{backgroundColor:lgreen, color:'black', fontWeight:"bold"}}>Homepage</Button>
        </div>
    )
}

export default NotFound
