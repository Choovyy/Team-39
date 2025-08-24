import { dpurple, QueueingEntry, Team, UserType } from '@/Utils/Global_variables'
import React from 'react'
import QueueingTeam from './QueueingTeam'
import { Button, Typography } from '@mui/material'
// import catLoader from '../../public/loaders/catloader.gif'
import flowerLoader from '../../public/loaders/flower-loader.gif'
import { useUserContext } from '@/Contexts/AuthContext'
import { useTeamContext } from '@/Contexts/TeamContext'

interface QueueingListProps{
    teams:Array<QueueingEntry>|null|undefined
    handleQueueClick:Function
    dequeue:Function
    goOnHold:Function
    requeue:Function
    admitQueueingEntry:Function
}

const QueueingList:React.FC<QueueingListProps> = ({teams, handleQueueClick, dequeue, goOnHold, requeue, admitQueueingEntry}) => {
    const user = useUserContext().user
    const team = useTeamContext().Team
    return (
        <div className='p-3 px-5 border-2 border-black bg-white rounded-md flex flex-col flex-grow overflow-auto ' style={{maxHeight:'950px'}}>
            
        {teams?.length > 0?
            <div>
                <div className='flex justify-between'>
                    <Typography variant='h6'>{teams?<>Up Next</>:<>Awaiting Teams</>}</Typography>
                    {user?.role === UserType.STUDENT && !teams?.some(e => e.teamID === team?.tid)?
                    <Button onClick={()=>{handleQueueClick()}} sx={{backgroundColor:dpurple, color:'white', padding:'0.5em 2.5em'}}>
                        Queue
                    </Button>
                    :
                    <></>
                    }
                </div>
                <div>
                    {teams.map((team,index)=>(
                        <QueueingTeam admitQueueingEntry={admitQueueingEntry} requeue={requeue} goOnHold={goOnHold} key={index} index={index} team={team} dequeue={dequeue}/>
                    ))}
                </div>
            </div>
            :
            <div className='flex-grow flex items-center justify-center flex-col gap-6'>
                {user?.role === UserType.STUDENT?
                    <img src={flowerLoader.src} alt="catLoader" style={{height:'75px', width:'75px', alignSelf:'center', justifySelf:'center'}} />
                    :
                    <img src={flowerLoader.src} alt="catLoader" style={{height:'50px', width:'50px', alignSelf:'center', justifySelf:'center'}} />
                }
                <Typography variant='caption' color='gray'>Queue is currently empty. Awaiting queueing teams.</Typography>
                {
                    user?.role == UserType.STUDENT?
                    <Button onClick={()=>{handleQueueClick()}} sx={{backgroundColor:dpurple, color:'white', padding:'0.5em 2.5em'}}>
                        Queue
                    </Button>
                    :
                    <></>
                }
            </div>
        }
        </div>
    )
}

export default QueueingList
