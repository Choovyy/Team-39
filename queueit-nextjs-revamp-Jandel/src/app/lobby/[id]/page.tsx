"use client"
import { Modal, Typography } from "@mui/material";
import { notFound, useRouter } from "next/navigation";
import catSecretary from "../../../../public/images/CatSecretary.gif"
import { dpurple, lgreen, QUEUEIT_URL, UserType } from "@/Utils/Global_variables";
import { useUserContext } from "@/Contexts/AuthContext";
import { use, useEffect, useState } from "react";
import BaseComponent from "@/Components/BaseComponent";
import { toast } from "react-toastify";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    const {id} = use(params)
    if (!/^\d+$/.test(id)) {
        notFound();
    }
    
    const user = useUserContext().user
    const router = useRouter()
    const [loading,setLoading] = useState<boolean>(true)

    useEffect(()=>{
        if(user){
            fetch(`${QUEUEIT_URL}${user.role === UserType.FACULTY?`/faculty/startAutomated/${id}/${user.uid}`:`/meeting/teamMeetings/scheduled/${id}`}`) 
            .then(async (res)=>{
                if(res.ok){
                    if(user.role === UserType.FACULTY){
                        router.push('/queue')
                    }else{
                        setLoading(false)
                    }
                }else{
                    const err_text = await res.text()
                    toast.error(err_text)
                    setTimeout(()=>{
                        router.back()
                    },2000)
                }
            })
            .catch((err)=>{
                console.log(err)
            })
        }
    },[user,id])

    if(loading){
        return(
            <Modal
                open={true}
                sx={{
                    backdropFilter: 'blur(5px)', // Optional: adds a blur effect to the background
                    bgcolor: 'transparent', // Set background to transparent
                    border: 'none', // Remove any borders
                }}
            >
                <div className='absolute flex flex-col gap-3 justify-center items-center' style={{top:'50%',left:'50%', transform:'translate(-50%,-50%)'}}>
                    <img src={catSecretary.src} alt="catLoader" style={{height:'150px'}} />
                    <Typography variant='h5' fontWeight='bold' color={lgreen}>Please wait while our secretary checks everything...</Typography>
                    <Typography variant='caption' color='white'>Kindly refrain from staring at our secretary too much. She's quite sassy when she thinks you're rushing her.</Typography>
                </div>
            </Modal>
        )
    }else{
        return(
            <BaseComponent>
            </BaseComponent>
        )
    }
}
