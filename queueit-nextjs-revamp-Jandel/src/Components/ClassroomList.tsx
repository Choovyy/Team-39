import { Classes, dpurple, SPEAR_FRONTEND_URL, UserType } from '@/Utils/Global_variables';
import React from 'react';
import ClassroomCard from './ClassroomCard';
import witch from '../../public/loaders/witchloader.gif';
import { Button, Typography } from '@mui/material';
import { useUserContext } from '@/Contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface ClassroomListProps {
    classrooms: Array<Classes> | null;
    mentoredClassrooms: Array<Classes> | null;
}

const ClassroomList: React.FC<ClassroomListProps> = ({ classrooms, mentoredClassrooms }) => {
    const user = useUserContext().user;
    const router = useRouter();

    return (
        <div className='border-2 border-black mt-5 rounded-xl relative bg-white'>
 
                <div className='p-10'>
                    <Typography variant='h4' style={{ fontWeight: 'bold' }}>
                        {user?.role === UserType.FACULTY ? 'Advisories' : 'Classrooms'}
                    </Typography>

                    <div className='flex flex-wrap gap-12 pt-10'>
                        {classrooms?.length ? (
                            classrooms.map((classs, index) => (
                                <ClassroomCard key={index} classroom={classs} type="classroom" />
                            ))
                        ) : (
                            <div className='relative z-10 p-10 flex flex-col w-full justify-center items-center gap-10'>
                                <img src={witch.src} alt="witchLoader" style={{ height: '75px' }} />
                                <Typography variant='subtitle1' color='gray' fontWeight='bold'>
                                    Oh no! You see the witch too!?
                                </Typography>
                                <Typography variant='caption' color='gray'>
                                    Guess she's determined you don't belong to any classrooms. Time to get involved in one then!
                                </Typography>
                                {user?.role === UserType.FACULTY ? (
                                    <Button onClick={()=>{router.push(SPEAR_FRONTEND_URL)}} sx={{ backgroundColor: dpurple, color: 'white', padding: '0.5em 2em' }}>
                                        Create Classroom
                                    </Button>
                                ) : (
                                    <Button onClick={()=>{router.push(SPEAR_FRONTEND_URL)}} sx={{ backgroundColor: dpurple, color: 'white', padding: '0.5em 2em' }}>
                                        Enroll
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                </div> 

                {mentoredClassrooms?.length > 0 && (
                    <div className='p-10'>
                        <Typography variant='h4' style={{ fontWeight: 'bold' }}>
                            {user?.role === UserType.FACULTY ? 'Mentees' : ''}
                        </Typography>

                        <div className='flex flex-wrap gap-12 pt-10'>
                            {mentoredClassrooms.map((mentoredClass, index) => (
                                <ClassroomCard key={index} classroom={mentoredClass} type="mentored" />
                            ))}
                        </div>
                    </div>
                )} 
        </div>
    );
};

export default ClassroomList;
