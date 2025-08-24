import { useUserContext } from '@/Contexts/AuthContext'
import { useTeamContext } from '@/Contexts/TeamContext'
import { QueueingEntry, Team, UserType } from '@/Utils/Global_variables'
import { groupImage } from '@/Utils/Utility_functions'
import { Button, ButtonGroup, IconButton, Tooltip, Typography } from '@mui/material'
import React from 'react'
import CloseIcon from '@mui/icons-material/Close';
import BackHandIcon from '@mui/icons-material/BackHand';
import CheckIcon from '@mui/icons-material/Check';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useClassroomContext } from '@/Contexts/ClassroomContext'
import { useQueueingManagerContext } from '@/Contexts/QueueingManagerContext'

interface QueueingTeamProps{
    team:QueueingEntry
    index: number
    dequeue:Function
    goOnHold:Function
    requeue:Function
    admitQueueingEntry:Function
}

const QueueingTeam:React.FC<QueueingTeamProps> = ({team, index,dequeue,goOnHold,requeue, admitQueueingEntry}) => {
  const user = useUserContext().user
  const myTeam = useTeamContext().Team
  const queueingManager = useQueueingManagerContext().QueueingManager
  // console.log(team)
  return (
    <div className={`rounded-md flex justify-between items-center overflow-hidden h-28 px-3 ${team.onHold?'bg-lushorange':''}`}>
      <span className='bg-dpurple w-10 h-10 rounded-full flex items-center justify-center text-white p-5'>{index+1}</span>
      <img src={groupImage(index)} alt="group image" style={{boxSizing:'border-box', margin:0, padding:0, height:'120%', display:'block'}} />
      <div className='flex flex-col flex-1'>
        <Tooltip title={team.teamName}><Typography className='overflow-hidden max-w-full flex-nowrap whitespace-nowrap' sx={{fontWeight:'bold'}}>{team.teamName}</Typography></Tooltip>
        <Typography variant='caption' color='gray'>{team.classReference}</Typography>
        {
          user?.role===UserType.STUDENT && myTeam?.tid === team.teamID?
          <ButtonGroup>
            <Tooltip title='Cancel' color='error'><IconButton onClick={()=>{dequeue()}}><CloseIcon/></IconButton></Tooltip>
            {team.onHold?
              <Tooltip title='Requeue' color='success'><IconButton onClick={()=>{requeue()}}><RefreshIcon/></IconButton></Tooltip>
              :
              <Tooltip title='Hold' color='warning'><IconButton onClick={()=>{goOnHold()}}><BackHandIcon/></IconButton></Tooltip>
            }
          </ButtonGroup>
          :
          user?.role === UserType.FACULTY && queueingManager?.facultyID === user?.uid?
          <ButtonGroup>
            <Tooltip title='Remove' color='error'><IconButton onClick={()=>{dequeue(team.queueingEntryID)}}><CloseIcon/></IconButton></Tooltip>
            {!team.onHold?
              <Tooltip title='Admit' color='success'><IconButton onClick={()=>{admitQueueingEntry(team.queueingEntryID)}}><CheckIcon/></IconButton></Tooltip>
              :
              <></>
            }
          </ButtonGroup>
          :
          <></>
        }
      </div>
    </div>
  )
}

export default QueueingTeam
