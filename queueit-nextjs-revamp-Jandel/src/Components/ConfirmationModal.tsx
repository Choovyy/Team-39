import { dpurple } from '@/Utils/Global_variables'
import { Button, ButtonGroup, Modal, Typography } from '@mui/material'
import React from 'react'

interface ConfirmationModalProps{
    open:boolean
    setOpen:Function
    action:Function
    headerMessage: string
    bodyMessage: string
}

const ConfirmationModal:React.FC<ConfirmationModalProps> = ({open,setOpen,action, headerMessage, bodyMessage}) => {
  return (
    <Modal open={open} onClose={()=>{setOpen(false)}}>
        <div className='absolute w-fit h-fit rounded-md shadow-md bg-white flex flex-col gap-6 items-center justify-center p-6' style={{top:'50%',left:'50%',transform:'translate(-50%,-50%)'}}>
            <Typography textAlign={"center"} variant='h6' fontWeight={"bold"}>
                {headerMessage}
            </Typography>
            <Typography textAlign={"center"} variant='subtitle2'>
                {bodyMessage}
            </Typography>
            <div className='w-full flex gap-3 justify-center items-center'>
                <Button onClick={()=>{setOpen(false)}} variant='outlined'>Cancel</Button>
                <Button onClick={()=>{action(); setOpen(false)}} variant='contained' sx={{backgroundColor:dpurple}}>Yes</Button>
            </div>
        </div>
    </Modal>
  )
}

export default ConfirmationModal