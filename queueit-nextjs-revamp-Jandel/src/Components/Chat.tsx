"use client"
import { Chat, ChatDTO, QUEUEIT_URL, User, UserType } from '@/Utils/Global_variables'
import { capitalizeFirstLetter } from '@/Utils/Utility_functions'
import { IconButton, Typography } from '@mui/material'
import React, { useEffect, useRef, useState } from 'react'
import SendIcon from '@mui/icons-material/Send'
import { useUserContext } from '@/Contexts/AuthContext'
import { useWebSocket } from '@/WebSocket/WebSocketContext'
import ChatEntry from './ChatEntry'

interface ChatProps {
  faculty: User | undefined
}

const Chat: React.FC<ChatProps> = ({ faculty }) => {
    const user:User = useUserContext().user
    const inputRef = useRef<HTMLInputElement>(null) // Use useRef for the input field
    const chatContainerRef = useRef<HTMLDivElement>(null) // Ref for the chat container
    const client = useWebSocket()
    const [chats, setChats] = useState([]);

    useEffect(() => {
        if (client) {
            const subscription = client.subscribe(`/topic/chat/adviser/${user?.role == UserType.FACULTY?user?.uid:faculty?.uid}`, (message) => {
                const receivedMessage: ChatDTO = JSON.parse(message.body);
                console.log(receivedMessage)
                setChats((prev) => [...prev, receivedMessage])
            });

            return () => {
                console.log('Unsubscribing');
                subscription.unsubscribe();
            };
        }
    }, [client, faculty]);

    const sendMessage = async () => {
        // Check if the input field is available and the user and faculty exist
        if(user.role !== UserType.FACULTY){
            if ( !user || !faculty ) {
                return
            }
        }
        
        if(!inputRef.current){
            return
        }

        const message = inputRef.current.value
        if (message.trim() === '') {
            return
        }

        try {
            const response = await fetch(`${QUEUEIT_URL}/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json', // Set proper header for JSON
                },
                body: JSON.stringify({
                    userID: user.uid,
                    adviserID: faculty?faculty.uid:user.uid,
                    message,
                    firstname: user.firstname,
                    lastname: user.lastname,
                }),
            })
            // Optionally clear the input after sending the message
            inputRef.current.value = ''
        } catch (err) {
            console.error('Error sending message:', err)
        }
    }

    // Scroll to the bottom of the chat container whenever chats change
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [chats]);

    return (
        <div className='border-2 p-3 border-black rounded-md bg-white flex flex-col flex-grow min-h-96 justify-end gap-3'>
            <div ref={chatContainerRef} className='overflow-auto flex flex-col h-80 md:h-full lg:h-full xl:h-full'>
                {faculty ? (
                    <Typography variant='subtitle2' fontWeight={'bold'} className='text-center'>
                        Welcome to {capitalizeFirstLetter(faculty.firstname)} {`${capitalizeFirstLetter(faculty.lastname)}'s chat.`}
                    </Typography>
                ) : (
                    <Typography variant='subtitle2' fontWeight={'bold'} className='text-center'>
                        Welcome to {capitalizeFirstLetter(user?.firstname)} {`${capitalizeFirstLetter(user?.lastname)}'s chat.`}
                    </Typography>
                )}
                <div className='flex flex-col gap-3'>
                    {chats.map((chat: ChatDTO, index) => (
                        <ChatEntry key={index} chat={chat} />
                    ))}
                </div>
            </div>
            <div className='flex justify-self-end'>
                <input
                    ref={inputRef} // Attach ref to the input element
                    id='message'
                    type='text'
                    className='border-2 border-black rounded-md p-3 flex-grow text-black'
                />
                <IconButton onClick={sendMessage}>
                    <SendIcon sx={{ color: 'black' }} />
                </IconButton>
            </div>
        </div>
    )
}

export default Chat