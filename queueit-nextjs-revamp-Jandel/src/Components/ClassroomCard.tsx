import { useClassroomContext } from '@/Contexts/ClassroomContext';
import { useMentoredClassroomContext } from '@/Contexts/MentoredClassroomContext';
import { Classes } from '@/Utils/Global_variables';
import { randomPerson } from '@/Utils/Utility_functions';
import { Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import React from 'react';

interface ClassroomCardProps {
    classroom: Classes;
    type: 'classroom' | 'mentored';  // Add a type prop to differentiate
}

const ClassroomCard: React.FC<ClassroomCardProps> = ({ classroom, type }) => {
    const { setClassroom } = useClassroomContext();
    const { setMentoredClassroom } = useMentoredClassroomContext();
    const router = useRouter();

    const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
        event.preventDefault();

        if (type === 'mentored') {
            setMentoredClassroom(classroom);  // Set mentored classroom in context
            router.push('/dashboard/mentorClassroom');  // Navigate to mentored class page
        } else {
            setClassroom(classroom);  // Set normal classroom in context
            router.push('/dashboard/classroom');  // Navigate to classroom page
        }
    };

    return (
        <div 
            onClick={handleClick} 
            className="rounded-lg border-2 border-black hover:border-2 hover:bg-lgreen cursor-pointer relative px-5 py-10" 
            style={{ width: '250px', boxShadow: '5px 5px 0px 1px rgba(0, 0, 0,1)', height: '200px' }}
        >
            <Typography variant='h5' fontWeight='bold' style={{ zIndex: 1, position: 'relative' }}>
                {classroom.courseDescription}
            </Typography>
            <Typography style={{ color: 'rgba(125,87,252,0.9)', fontWeight: 'bold', zIndex: 1, position: 'relative' }}>
                {`${classroom.courseCode.toUpperCase()} - ${classroom.section.toUpperCase()}`}
            </Typography>
            <img className='hidden md:block lg:block xl:block rounded-full' 
                src={randomPerson()} 
                alt="person" 
                style={{ position: 'absolute', bottom: 0, right: 0, height: '60%', zIndex: 0 }} 
            />
        </div>
    );
};

export default ClassroomCard;
