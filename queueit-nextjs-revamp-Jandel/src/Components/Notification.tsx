import { NotificationRecipient, NotificationType } from '@/Utils/Global_variables'
import { randomAvatar, randomGroupImage } from '@/Utils/Utility_functions'
import { Typography } from '@mui/material'
import React, { useRef } from 'react'

interface NotificationProps{
    notification:NotificationRecipient
    action: Function
}

const Notification:React.FC<NotificationProps> = ({notification, action}) => {
    const date = new Date(notification.notification.dateTimeGenerated)
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true, // Use 12-hour format
    };
    const formattedDate = date.toLocaleString('en-US',options)
    const  avatar = useRef(notification.notification.notificationType === NotificationType.TEAM_ENQUEUE?randomGroupImage()
                            :notification.notification.notificationType === NotificationType.MANUALLY_APPOINTMENT_STARTED 
                            || notification.notification.notificationType === NotificationType.APPOINTMENT_CANCELLED
                            || notification.notification.notificationType === NotificationType.APPOINTMENT_SET? randomAvatar():randomAvatar())
    return (
        <div onClick={()=>{if(notification.notification.redirectedUrl){action(notification)}}} className={`flex relative ${notification.notification.redirectedUrl?'cursor-pointer':''} border-2 p-3 shadow-md 
            ${notification.read?''
            :notification.notification.notificationType === NotificationType.APPOINTMENT_CANCELLED 
            || notification.notification.notificationType === NotificationType.QUEUEING_CLOSE 
            || notification.notification.notificationType === NotificationType.APPOINTMENT_DEFAULTED?'shadow-red-300':
            notification.notification.notificationType === NotificationType.AUTOMATED_APPOINTMENT_STARTED?'shadow-blue-300':'shadow-green-300'
         }`}>


            <img src={avatar.current} alt="avatar" style={{height:'15%', width:'15%'}}/>
            <div className='flex-1 flex flex-col justify-center'>
                <Typography variant='subtitle2' fontWeight={"bold"}>{notification.notification.notificationMessage}</Typography>
                <Typography variant='caption' color='gray'>{formattedDate}</Typography>
            </div>

            
        </div>
    )
}

export default Notification
