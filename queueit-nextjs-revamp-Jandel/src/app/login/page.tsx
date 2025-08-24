"use client"
import React, { useEffect, useState } from 'react'
import purpleSquiggle from '../../../public/images/img2.png'
import star from '../../../public/images/star.png'
import { Button, IconButton, Typography } from '@mui/material'
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { SPEAR_FRONTEND_URL, SPEAR_URL, User } from '@/Utils/Global_variables'
import { toast } from 'react-toastify'
import { useUserContext } from '@/Contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'
import { extractFirstnameLastnameFromEmail } from '@/Utils/Utility_functions'
import CatLoader from '@/Components/CatLoader'

export default function page() {
    const authContext = useUserContext()
    const [loggingIn, setLoggingIn] = useState(false)
    const router = useRouter()
    const loading = useUserContext().loading
    useEffect(()=>{
        console.log(`loading: ${loading}`)
        if(loading){return;}
        if(authContext.user){
            router.push('/dashboard')
        }
    },[authContext])
    const [passwordHidden, setPasswordHidden] = useState(false)
    const handleLoginClick = async (e:React.FormEvent<HTMLFormElement>)=>{
        e.preventDefault()
        setLoggingIn(true)
        const emailTextField = document.getElementById('emailTextField') as HTMLInputElement | null
        const passwordTextField = document.getElementById('passwordTextField') as HTMLInputElement | null
        try{
            
            const response = await fetch(`${SPEAR_URL}/login`,
                {
                    method:'POST',
                    body:JSON.stringify(
                        {
                            "email":emailTextField?.value,
                            "password":passwordTextField?.value,
                        }
                    ),
                    headers:{
                        'Content-Type':'application/json',
                    }
                }
            )

            const user_data:User = await response.json()
            switch(user_data.statusCode){
                case 200:
                    const [firstname,lastname] = extractFirstnameLastnameFromEmail(jwtDecode(user_data.token).sub)
                    user_data.firstname = firstname
                    user_data.lastname = lastname
                    authContext.login(user_data)
                    toast.success(user_data.message)
                    router.push('dashboard')
                    setLoggingIn(false)
                    break;
                case 404:
                    toast.error("Invalid username or password")
                    setLoggingIn(false)
                    break;
                default:
                    toast.error("Internal Server Error.")
                    setLoggingIn(false)
            }
            
        }catch(err){
            console.log(err)
            toast.error("Possible cors error. Nevertheless, caught an exception while logging in.")
            setLoggingIn(false)
        }
    }
    

    if(loading || (authContext.user !== null)){
        return(
            <CatLoader loading={loading || (authContext.user !== null)}/>
        )
    }else{
        return (
            <div className='h-screen relative overflow-hidden flex'>
                <img src={purpleSquiggle.src} alt="squiggle" style={{position:'absolute', transform:'translate(-30%,-18%)', top:'0%', left:'0%'}} />
                <img src={purpleSquiggle.src} alt="squiggle" style={{position:'absolute', transform:'translate(60%,18%)', bottom:'-35%', right:'30%'}} />
                <img style={{position:'absolute', height:'8dvw', transform:'translate(-50%,-50%)', top:'20%', left:'70%'}} src={star.src} alt="star" />
                <img style={{position:'absolute', height:'16dvw', transform:'translate(-50%,0%)', bottom:'-10%', left:'8%'}} src={star.src} alt="star" />
                <div className='flex-grow relative flex items-center justify-center' style={{backgroundColor:'rgba(0,0,0,0.6)'}}>
                    <form onSubmit={(e)=>{handleLoginClick(e)}} className='bg-white h-fit w-1/3 rounded-xl p-10 flex flex-col items-center' style={{minWidth:'350px'}}>
                        <Typography variant='h5'>Login</Typography>
                        <div className='flex w-100 gap-3 pt-2'>
                            <Typography color='gray'>New to QueueIT?</Typography>
                            <a style={{textDecoration:'underline', fontWeight:'bold'}} href={SPEAR_FRONTEND_URL}>Sign up for now</a>
                        </div>
                        <div className='w-full pt-2'>
                            <Typography style={{color:'gray'}}>Email address</Typography>
                            <input id='emailTextField' className='w-full p-3 rounded-lg' style={{border:'solid 1px silver'}} type="email" required/>
                        </div>
                        <div className='w-full pt-2'>
                            <div className='flex justify-between items-center'>
                                <Typography style={{color:'gray'}}>Password</Typography>
                                {passwordHidden?<><IconButton onClick={()=>setPasswordHidden(false)}><VisibilityOffIcon/></IconButton></>:<><IconButton onClick={()=>{setPasswordHidden(true)}}><VisibilityIcon/></IconButton></>}
                            </div>
                            <input id='passwordTextField' className='w-full p-3 rounded-lg' style={{border:'solid 1px silver'}} type={passwordHidden?"text":"password"} required />
                        </div>
                        <Button type='submit' sx={{marginTop:'15px',backgroundColor:'#CCFC57', color:'black', borderRadius:'15px', padding:'0.5em 3em', width:'100%', fontWeight:'bold'}}>Login</Button>
                    </form>
                </div>
                <CatLoader loading={loggingIn}/>
            </div>
        )
    }
}
