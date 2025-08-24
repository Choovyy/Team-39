"use client"
import React, { useEffect, useState } from 'react'
import star from '../../public/images/star.png'
import squiggly from '../../public/images/squiggly.png'
import floating from '../../public/images/3.png'
import { Button, Chip, Divider, MenuItem, Modal, Select, SelectChangeEvent, TextField, Typography } from '@mui/material'
import { capitalizeFirstLetter, isPastTime, setMinTime } from '@/Utils/Utility_functions'
import { Classes, dpurple } from '@/Utils/Global_variables'
import { toast } from 'react-toastify'

interface LetThemInModalProps{
    queueingFilter: Array<Classes>
    setIsQueueing: Function
    setTimeStop: Function
    setQueueingLimit: Function
    setQueueingFilter: Function
    openQueueing: Function
    open: boolean
    setOpen: Function
}

const LetThemInModal:React.FC<LetThemInModalProps> = ({setTimeStop, setQueueingLimit, setQueueingFilter, open, setOpen, openQueueing, queueingFilter}) => {
    
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);
    const date = new Date().toDateString()

    const [classroomChoices, setClassroomChoices] = useState<Classes[]>([]);

    useEffect(() => {
        // Retrieve and parse the classroom data from local storage
        const storedClassrooms = localStorage.getItem('classrooms');
        if (storedClassrooms) {
            const parsedClassrooms = JSON.parse(storedClassrooms);
            setClassroomChoices(parsedClassrooms);
        }
    }, []);

    const handleTimeLimitChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
    
        // Get the value from the input and create a Date object
        const inputTime = e.target.value; // This is a string in the format "HH:MM"
        
        // Create a Date object for today with the input time
        const [hours, minutes] = inputTime.split(':').map(Number);
        const inputDate = new Date();
        inputDate.setHours(hours, minutes, 0, 0); // Set hours and minutes, seconds and milliseconds to 0

        // Compare the timestamps
        if (isPastTime(inputDate.getTime())) {
            toast.warning("Warning! you chose a past time.", {autoClose:2000, style:{fontWeight:'bold'}});
        }
        setTimeStop(inputDate.getTime())
    }

    const handleClassroomLimitChange = (e:React.ChangeEvent<HTMLInputElement>)=>{
        if (Number(e.target.value) < 0){
            toast.warning("Warning! your limit is a negative number.", {autoClose:2000, style:{fontWeight:'bold'}});
        }
        setQueueingLimit(e.target.value)
    }

    

    return (
    <div className='bg-white rounded-lg border-2 border-black relative p-10 h-full'>
        
        <img style={{position:'absolute', height:'8dvw', transform:'translate(-50%,0%)', top:'10%', left:'8%'}} src={star.src} alt="star" className='absolute z-0'/>
        <img style={{position:'absolute', height:'8dvw', transform:'translate(-50%,0%)', top:'0%', right:'0%'}} src={squiggly.src} alt="squiggly" className='absolute z-0'/>
        <div className='z-1 500 flex justify-end h-full relative'>
            {/* <div className='hidden md:block lg:block xl:block'> */}
                <img src={floating.src} alt="floating" className='relative z-0 hidden md:block lg:block xl:block' style={{bottom:0, left:0}} />
            {/* </div>s */}
            <div className='flex flex-col text-center gap-3 items-center justify-center w-full lg:w-1/2 relative h-full'>
                <Typography style={{fontSize:'clamp(3em, 3em + 1dvw, 8em)'}}>Let Them In!</Typography>
                <Typography sx={{fontSize:'clamp(0.3em, 0.3em + 0.9dvw, 3em)'}}>Open the queue now and connect with your students who are ready and waiting!</Typography>
                <Button onClick={handleOpen} sx={{backgroundColor:'#7D57FC', color:'white', marginTop:'25px', fontSize:'clamp(1em, 1em + 1dvw, 2em)', borderRadius:'15px', padding:'1em 1.5em'}}>Open Queue</Button>
            </div>
        </div>
        <Modal
            open={open}
            onClose={handleClose}
            aria-labelledby="modal-modal-title"
            aria-describedby="modal-modal-description"
        >
            <div className='bg-white absolute w-2/3 md:w-1/3 lg:w-1/3 xl:w-1/3 p-10 flex flex-col gap-3 rounded-xl' style={{top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                <div className='w-full flex-col md:flex-row lg:flex-row xl:flex-row flex justify-between items-center'>
                    <Typography fontWeight='bold'>{date}</Typography>
                    <input onChange={handleTimeLimitChange} className='border-2 border-silver p-3 rounded-xl' type="time" name="endTime" min={setMinTime()} />
                </div>
                <div className='w-full md:flex-row lg:flex-row xl:flex-row justify-between items-center'>
                    <Select 
                        className='max-h-40 overflow-auto' 
                        multiple value={queueingFilter} sx={{width:'100%'}} 
                        onChange={(e)=>{setQueueingFilter(e.target.value); console.log(e.target.value)}}
                        renderValue={(classrooms:Array<Classes>)=>(
                            <>
                                {classrooms.map((classroom)=>(
                                    <Chip key={classroom.cid} label={`${classroom?.courseCode?.toUpperCase()} - ${classroom?.section?.toUpperCase()}`}/>
                                ))}
                            </>
                        )}
                        MenuProps={{
                            PaperProps:{
                                style:{
                                    maxHeight: 48 * 4.5 + 8,
                                }
                            }
                        }}
                        >
                            {classroomChoices.map((choice, index)=>(
                                <MenuItem key={choice.cid} value={choice}>
                                    <div className={`flex flex-col gap-3 w-full p-3 rounded-sm`}>
                                        <Typography variant='subtitle2'>{choice.courseDescription}</Typography>
                                        <Typography variant='caption'>{`${choice.courseCode.toUpperCase()} - ${choice.section.toUpperCase()}`}</Typography>
                                    </div>
                                </MenuItem>
                            ))}
                    </Select>
                </div>
                <div className='w-full flex flex-col lg:flex-row xl:flex-row'>
                    <Typography sx={{flex:1}}>Enter maximum number of groups for consultation:</Typography>
                    <input onChange={handleClassroomLimitChange} style={{flex:1}} type='number' defaultValue={0} min={0} className='border-2 border-silver p-3 rounded-xl'/>
                </div>
                <div className='w-full mt-5 flex justify-center gap-5'>
                    <Button onClick={handleClose} sx={{color:'black', padding:'1em 1.5em'}} >Cancel</Button>
                    <Button onClick={openQueueing} sx={{backgroundColor:dpurple, color:'white', padding:'1em 3em', borderRadius:'15px'}}>Open</Button>
                </div>
            </div>
        </Modal>
    </div>
    )
}

export default LetThemInModal