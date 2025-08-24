import { useQueueingManagerContext } from '@/Contexts/QueueingManagerContext';
import { dpurple } from '@/Utils/Global_variables';
import { millisecondsToHMS } from '@/Utils/Utility_functions';
import { Button } from '@mui/material';
import React, { useEffect, useState } from 'react';

interface StopQueueingButtonProps {
    closeQueueing: Function;
}

const StopQueueingButton: React.FC<StopQueueingButtonProps> = ({ closeQueueing }) => {
    const queueingManager = useQueueingManagerContext().QueueingManager;
    const [endTime, setEndTime] = useState<Date | null>(null);
    const timeNow = new Date().getTime();
    const [difference, setDifference] = useState<string | null>(null);

    useEffect(() => {
        if (queueingManager?.timeEnds) {
            // Combine the current date with the timeEnds
            const currentDate = new Date();
            const timeParts = queueingManager.timeEnds.split(':');
            const hours = parseInt(timeParts[0], 10);
            const minutes = parseInt(timeParts[1], 10);
            const seconds = parseInt(timeParts[2], 10);

            // Set the end time to today at the specified time
            const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), hours, minutes, seconds);
            setEndTime(endDate);
        }
    }, [queueingManager]);

    useEffect(() => {
        if (endTime && endTime.getTime() > timeNow && queueingManager?.isActive) {
            const intervalID = setInterval(() => {
                const remainingTime = endTime.getTime() - Date.now();
                if (remainingTime > 0) {
                    // setDifference(millisecondsToHMS(remainingTime));
                    millisecondsToHMS(endTime,setDifference)
                } else {
                    clearInterval(intervalID);
                    closeQueueing(); // Close the queueing when time is up
                }
            }, 1000);
            return () => {
                clearInterval(intervalID);
            };
        }
    }, [endTime, queueingManager]);

    return (
        <Button onClick={() => { closeQueueing(); }} sx={{ position: 'relative', backgroundColor: dpurple, color: 'white', width: '100%' }} className='h-24'>
            {queueingManager?.isActive || queueingManager?.meeting ?
                (difference == null ? <>Close Queueing</> : <>{`Queueing ends in ${difference}`}</>) :
                <></>
            }
        </Button>
    );
};

export default StopQueueingButton;