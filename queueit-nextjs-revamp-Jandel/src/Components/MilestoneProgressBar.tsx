"use client"
import { useMilestoneSetContext } from '@/Contexts/MilestoneSetContext'
import { useTeamContext } from '@/Contexts/TeamContext'
import { MilestoneSet, QUEUEIT_URL, UserType } from '@/Utils/Global_variables'
import { ButtonGroup, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import MilestoneDropdown from './MilestoneDropdown'
import { useUserContext } from '@/Contexts/AuthContext'
import { toast } from 'react-toastify'
import ConfirmationModal from './ConfirmationModal'

const MilestoneProgressBar = () => {
    const {MilestoneSet, setMilestoneSet} = useMilestoneSetContext()
    const [open,setOpen] = useState<boolean>(false)
    const [action, setAction] = useState<() => void>(() => () => {})
    const [bodyMessage,setBodyMessage] = useState<string>(" ")


    const user = useUserContext().user

    useEffect(()=>{
        if(MilestoneSet){
            console.log(MilestoneSet)
        }
    },[MilestoneSet])

    const handleApprove = ()=>{
        if(user?.role === UserType.FACULTY && user.uid === MilestoneSet?.approverID){
            fetch(`${QUEUEIT_URL}/milestone/approveSet/${MilestoneSet.milestoneSetID}/${user.uid}`)
            .then(async(res)=>{
                if(res.ok){
                    const response:MilestoneSet = await res.json()
                    setMilestoneSet(response);
                }else{
                    const err_text = await res.text()
                    toast.error(err_text)
                }
            })
        }
    }

    const handleUnlock = ()=>{
        if(user?.role === UserType.FACULTY && user.uid === MilestoneSet?.approverID){
            fetch(`${QUEUEIT_URL}/milestone/unlockSet/${MilestoneSet.milestoneSetID}/${user.uid}`)
            .then(async(res)=>{
                if(res.ok){
                    const response:MilestoneSet = await res.json()
                    setMilestoneSet(response);
                }else{
                    const err_text = await res.text()
                    toast.error(err_text)
                }
            })
        }
    }

    const handleApproveClick = ()=>{
        setOpen(true)
        setBodyMessage('Are you sure you want to approve this milestone set?')
        setAction(()=>handleApprove)
    }

    const handleUnlockClick = ()=>{
        setOpen(true)
        setAction(()=>handleUnlock)
        setBodyMessage('Are you sure you want to unlock this milestone set?')
    }

    return (
        <div className='w-full flex gap-3 flex-col bg-white p-3 rounded-md border border-black'>
            <div className='flex justify-between items-center'>
                <Typography variant='subtitle1' color='black' fontWeight={"bold"}>Milestone</Typography>
                {
                    user?.role === UserType.FACULTY && user.uid === MilestoneSet?.approverID?
                        MilestoneSet.approved?
                        <div className='flex flex-col gap-3 items-end'>
                            <Typography variant='h3' fontWeight={"bold"} textAlign={"center"}>{`${MilestoneSet.completionPercentage}%`}</Typography>
                            <div className='flex gap-3 items-center'>
                                <Typography variant='caption' color='gray'>{`Approved on ${new Date(MilestoneSet.approvedDate).toDateString()}`}</Typography>
                                <button onClick={()=>{handleUnlockClick()}} className='bg-notlushorange text-white rounded-full font-bold hover:bg-redHover' style={{padding:'0.2em 1.5em'}}>Unlock</button>
                            </div>
                        </div>
                        :
                        <div className='flex items-center gap-3'>
                            <Typography variant='caption' color='gray'>Do you approve this milestone set?</Typography>
                            <button onClick={()=>{handleApproveClick()}} className='bg-lgreen text-black rounded-full font-bold hover:bg-lgreenHover' style={{padding:'0.5em 1.5em'}}>Approve</button>
                            {/* <button className='bg-notlushred text-white rounded-full font-bold hover:bg-redHover' style={{padding:'0.5em 1.5em'}}>Reject</button> */}
                        </div>
                    :
                    <>
                        {MilestoneSet?.approved?
                            <div className='flex flex-col gap-3 items-center'>
                                <Typography variant='h3' fontWeight={"bold"} textAlign={"center"}>{`${MilestoneSet.completionPercentage}%`}</Typography>
                                <Typography variant='caption' color='gray'>{`Approved on ${new Date(MilestoneSet.approvedDate).toDateString()}`}</Typography>
                            </div>
                            :
                            <Typography sx={{backgroundColor:MilestoneSet?.approved?'none':'red', borderRadius:'1em', color:'white', padding:'0.1em 0.5em'}} color='white' fontWeight={"bold"}>{MilestoneSet?.approved?`${MilestoneSet.completionPercentage}%`:<span className='text-base '>For Approval</span>}</Typography>
                        }
                    </>
                }
            </div>
            <div className='w-full overflow-auto flex border-2 rounded-md' style={{backgroundColor:'#D9D9D9'}}>
                {MilestoneSet?.milestones.map((milestone,index)=>(
                    <MilestoneDropdown key={index} milestone={milestone} index={index} milestoneLength={MilestoneSet.milestones.length}/>
                ))}
            </div>
            <ConfirmationModal open={open} setOpen={setOpen} action={action} headerMessage='Confirmation Action' bodyMessage={bodyMessage}/>
        
        </div>
    )
}

export default MilestoneProgressBar
