"use client"

import React, { useEffect, useRef, useState } from 'react'
import logo from '../../public/images/logo.png'
import { Avatar, Badge, Drawer, IconButton, Menu, MenuItem, Typography } from '@mui/material'
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';
import { useRouter } from 'next/navigation';
import { useUserContext } from '@/Contexts/AuthContext';
import { stringAvatar } from '@/Utils/Utility_functions';
import { NotificationRecipient, QueueingManager, QUEUEIT_URL, SPEAR_URL, User, UserType } from '@/Utils/Global_variables';
import { useWebSocket } from '@/WebSocket/WebSocketContext';
import Notification from './Notification';
import { useQueueingManagerContext } from '@/Contexts/QueueingManagerContext';
import { toast } from 'react-toastify';
import { useFacultyContext } from '@/Contexts/FacultyContext';
import catLoader from '../../public/loaders/catloader.gif'

const Navbar = () => {
    const user = useUserContext().user
    const client = useWebSocket();
    const location = useRef<Location>(null)
    const userContext = useUserContext()
    const router = useRouter()
    const [avatarAnchorEl, setAvatarAnchorEl] = React.useState<null | HTMLElement>(null);
    const [notificationAnchorEl, setNotificationAnchorEl] = React.useState<null | HTMLElement>(null);
    const avatarOpen = Boolean(avatarAnchorEl);
    const notificationOpen = Boolean(notificationAnchorEl)
    const [toggleDrawer, setToggleDrawer] = useState(false)
    const [notifications, setNotifications] = useState<Array<NotificationRecipient>>([]);
    const setFaculty = useFacultyContext().setFaculty

    useEffect(()=>{
        if(typeof window !== "undefined"){
            location.current = window.location
        }
    },[])
    const handleAvatarClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        setAvatarAnchorEl(event.currentTarget);
    };
    const handleAvatarClose = () => {
        setAvatarAnchorEl(null);
    };
    const handleNotificationClick = async (event: React.MouseEvent<HTMLButtonElement>) => {
        setNotificationAnchorEl(event.currentTarget); // Open the dropdown immediately
    
        const notificationIDs = notifications.map(notification => notification.notificationRecipientID);
    
        try {
            const res = await fetch(`${QUEUEIT_URL}/notifications/setRead`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationIDs }),
            });
    
            if (res.ok) {
                setTimeout(() => { // Introduce a 5-second delay before updating state
                    setNotifications((prev) =>
                        prev.map((notification) => ({
                            ...notification,
                            read: true,
                        }))
                    );
                }, 5000); // Delay of 5000ms (5 seconds)
            }
        } catch (error) {
            console.error('Error marking notifications as read:', error);
        }
    };
    
    
    
    const handleNotificationClose = () => {
        setNotificationAnchorEl(null)
    }
    const handleNotificationRedirectionClick = (notification:NotificationRecipient)=>{
        if(user?.role === UserType.STUDENT){
            fetch(`${SPEAR_URL}/get-teacher/${notification.notification.trigerringPersonID}`,{
                method:"GET",
                headers:{
                    'Authorization': `Bearer ${user?.token}`
                }
            })
            .then(async(res)=>{
                switch(res.status){
                    case 200:
                        const response:User = await res.json()
                        setFaculty({
                            "firstname":response.firstname,
                            "lastname":response.lastname,
                            "uid":notification.notification.trigerringPersonID
                        })
                        break;
                    case 404:
                        toast.error(`Faculty with ID: ${notification.notification.trigerringPersonID} not found.`)
                        break;
                    default:
                        console.log(res)
                        toast.error("Server error.");
                }
            })
            .catch((err)=>{
                console.log(err);
                toast.error("Caught an exception while fetching faculty details.")
            })
        }
        if(notification.notification.redirectedUrl){
            router.replace(notification.notification.redirectedUrl)
        }
    }

    const notificationSound = '/sounds/alert.wav';

    useEffect(()=>{
        if(client && user){
            const notificationSubscription = client.subscribe(`/topic/notification/${user?.uid}`, (message) => {
                const receivedMessage:NotificationRecipient = JSON.parse(message.body);
                setNotifications((prev) => {
                    if (!prev.some(notif => notif.notificationRecipientID === receivedMessage.notificationRecipientID)) {
                        return [receivedMessage, ...prev];
                    }
                    return prev;
                });
                const audio = new Audio(notificationSound)
                audio.play().catch(err => console.error("Audio play failed:",err));
            });
            return ()=>{
                notificationSubscription.unsubscribe();
            }
        }
    },[client])

    useEffect(()=>{
        if(user && notifications.length == 0){
            fetch(`${QUEUEIT_URL}/notifications/${user.uid}`)
            .then(async(res)=>{
                if(res.ok){
                    const response:Array<NotificationRecipient> = await res.json();
                    setNotifications((prev) => {
                        const existingIDs = new Set(prev.map(n => n.notificationRecipientID));
                        const newNotifications = response.filter(n => !existingIDs.has(n.notificationRecipientID));
                        return [...newNotifications, ...prev]; // Only add new notifications
                    });
                }else{
                    console.log("could not retrieve notifications.")
                }
            })
            .catch((err)=>{
                console.log(err)
            })
        }
    },[user])
    
    return (
        <div className='w-full flex p items-center justify-end md:justify-between lg:justify-between xl:justify-between py-5 relative' style={{height:'100px', zIndex:3}}>
            <img onClick={()=>{router.replace('/dashboard')}} className='hidden md:block lg:block xl:block cursor-pointer' src={logo.src} alt="logo" style={{height:'100%'}} />
            {userContext.user?.role == UserType.FACULTY?
                <>
                    <nav className='hidden md:flex lg:flex xl:flex ' style={{backgroundColor:'rgb(243, 243, 243)', borderRadius:'15px'}}>
                        <a href='/dashboard' className={`nav-a-tag${location.current?.pathname?.includes('/dashboard')  ? '-active' : ''}`}>Home</a>
                        <a href='/queue' className={`nav-a-tag${location.current?.pathname?.includes('/queue')  ? '-active' : ''}`}>Queue</a>
                        <a href='/availability' className={`nav-a-tag${location.current?.pathname?.includes('/availability') ? '-active' : ''}`}>Availability</a>
                        <a href='/rubrics' className={`nav-a-tag${location.current?.pathname?.includes('/rubrics') ? '-active' : ''}`}>Rubrics</a>
                    </nav>
                    <div className='block md:hidden lg:hidden xl:hidden'>
                        <IconButton onClick={()=>{setToggleDrawer(true)}}>
                            <MenuIcon/>
                        </IconButton>
                        <Drawer open={toggleDrawer} onClose={()=>{setToggleDrawer(false)}}>
                        <nav className='flex flex-col gap-3 p-5' style={{backgroundColor:'rgb(243, 243, 243)', borderRadius:'15px'}}>
                            <a href='/dashboard' className={`nav-a-tag${location.current?.pathname?.includes('/dashboard')  ? '-active' : ''}`}>Home</a>
                            <a href='/queue' className={`nav-a-tag${location.current?.pathname?.includes('/queue')  ? '-active' : ''}`}>Queue</a>
                            <a href='/availability' className={`nav-a-tag${location.current?.pathname?.includes('/rubrics') ? '-active' : ''}`}>Rubrics</a>
                        </nav>
                        </Drawer>
                    </div>
                </>
                :
                <></>
            }
            
            <div style={{display:'flex', gap:10, position:'relative'}}>
                <IconButton style={{color:'silver'}} onClick={handleNotificationClick}>
                    <Badge badgeContent={notifications.filter(notficiation=>!notficiation.read).length} color='error'>
                        <NotificationsIcon style={{fontSize:'2.3rem'}}/>
                    </Badge>
                </IconButton>
                <IconButton style={{color:'silver'}} onClick={handleAvatarClick}>
                    <Avatar {...stringAvatar(`${userContext.user?.firstname} ${userContext.user?.lastname}`)}/>
                </IconButton>
                <Menu
                    anchorEl={avatarAnchorEl}
                    open={avatarOpen}
                    onClose={handleAvatarClose}
                    MenuListProps={{
                    'aria-labelledby': 'basic-button',
                    }}
                    anchorOrigin={{
                        vertical:'bottom',
                        horizontal:'center'
                    }}
                    transformOrigin={{
                        vertical:'top',
                        horizontal:'right'
                    }}
                >
                    <MenuItem onClick={()=>{userContext.logout()}}>Logout</MenuItem>
                </Menu>
                <Menu
                    anchorEl={notificationAnchorEl}
                    open={notificationOpen}
                    onClose={handleNotificationClose}
                    MenuListProps={{
                        'aria-labelledby': 'basic-button',
                        sx:{
                            // width:'50%',
                            // backgroundColor:'black'
                            padding:'1em'
                        }
                    }}
                    PaperProps={{
                        sx:{
                            width:'20%'
                        }
                    }}
                    anchorOrigin={{
                        vertical:'bottom',
                        horizontal:'center'
                    }}
                    transformOrigin={{
                        vertical:'top',
                        horizontal:'right'
                    }}
                >
                    {
                        notifications.length > 0?

                        <div className='flex flex-col gap-3'>
                            {notifications?.map((notification,index)=>(
                                <Notification action={handleNotificationRedirectionClick} key={index} notification={notification}/>
                            ))}
                        </div>
                        :
                        <div className='flex flex-col gap-3 items-center justify-center'>
                            <img src={catLoader.src} alt="cat" />
                            <Typography variant='caption' color='gray'>No notifications to show.</Typography>
                        </div>
                    }
                </Menu>
            </div>
        </div>
    )
}

export default Navbar
