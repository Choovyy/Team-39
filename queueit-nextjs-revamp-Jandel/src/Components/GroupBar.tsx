import { QUEUEIT_URL, Team } from '@/Utils/Global_variables'
import { useTeamContext } from '@/Contexts/TeamContext'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { Typography } from '@mui/material'

interface GroupBarProps {
    index: number
    team: Team
}

const GroupBar: React.FC<GroupBarProps> = ({ index, team }) => {
    const setTeam = useTeamContext().setTeam
    const router = useRouter()
    const [percentage, setPercentage] = useState<number>(0)

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault()
        setTeam(team)
        router.push('/dashboard/classroom/group')
    }

    useEffect(() => {
        if (team) {
            fetch(`${QUEUEIT_URL}/milestone/getPercentage/${team.tid}`)
                .then(async (res) => {
                    if (res.ok) {
                        const response: number = await res.json()
                        setPercentage(response)
                    } else {
                        setPercentage(0)
                    }
                })
                .catch((err) => {
                    console.log(err)
                })
        }
    }, [team])

    return (
        <div
            onClick={handleClick}
            className={`w-full h-20 border-2 border-black rounded-md p-3 flex items-center font-bold z-10 cursor-pointer relative justify-between bg-white`}
        >
            <div style={{
                background:`linear-gradient(to right, #CCFC57, white )`,
                position:'absolute',
                height:'100%',
                width:`${percentage}%`,
                left:0,
                top:0
            }} className='rounded-md z-0'>
                
            </div>
            <Typography sx={{zIndex:1}} fontWeight={"bold"}>{team.groupName}</Typography>
            <Typography sx={{zIndex:1}}>{`${percentage}%`}</Typography>
        </div>
    )
}

export default GroupBar
