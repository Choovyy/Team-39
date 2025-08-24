"use client"
import React, { createContext, useContext, useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import { QUEUEIT_URL } from '@/Utils/Global_variables';
import { useUserContext } from '@/Contexts/AuthContext';

const WebSocketContext = createContext(null);

export const useWebSocket = () => {
    return useContext(WebSocketContext);
};

export const WebSocketProvider = ({ children }) => {
    const [client, setClient] = useState(null);
    const user = useUserContext().user

    useEffect(() => {
        if (typeof window !== 'undefined' && user) {
            const socket = new SockJS(`${QUEUEIT_URL}/ws`);
            // console.log(`Queueit URL ${QUEUEIT_URL}`)
            const stompClient = Stomp.over(socket);

            stompClient.debug = () => {};
    
            stompClient.connect({}, (frame) => {
                // console.log('Connected: ' + frame);  // Log connection frame
                setClient(stompClient);
            }, (error) => {
                console.error('WebSocket connection error: ', error); // Log any error
            });
    
            return () => {
                if (stompClient.connected) {
                    stompClient.disconnect();
                }
            };
        }
    }, [user]);
    
    

    return (
        <WebSocketContext.Provider value={client}>
            {children}
        </WebSocketContext.Provider>
    );
};