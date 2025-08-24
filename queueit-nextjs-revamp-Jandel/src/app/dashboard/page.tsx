"use client";
import BaseComponent from '@/Components/BaseComponent';
import CatLoader from '@/Components/CatLoader';
import ClassroomList from '@/Components/ClassroomList';
import GreetingBar from '@/Components/GreetingBar';
import { useUserContext } from '@/Contexts/AuthContext';
import { Classes, MentoredClasses, SPEAR_URL, UserType } from '@/Utils/Global_variables';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export default function Page() {
    const userContext = useUserContext();
    const { user, loading } = userContext;
    const router = useRouter();
    
    const [facultyName, setFacultyName] = useState("Unknown User");
    const [studentName, setStudentName] = useState("Unknown User");
    const [classes, setClasses] = useState<Classes | undefined>(undefined);
    const [mentoredClass, setMentoredClass] = useState<MentoredClasses | undefined>(undefined);

    useEffect(() => {
        if (loading) return;
        if (!user) {
            router.push('/login');
            return;
        }

        const fetchUserData = async () => {
            try {
                if (user.role === UserType.FACULTY) {
                    const response = await fetch(`${SPEAR_URL}/get-teacher/${user.uid}`);
                    const data = await response.json();
                    setFacultyName(data.firstname || "Unknown User");
                } else if (user.role === UserType.STUDENT) {
                    const response = await fetch(`${SPEAR_URL}/get-student/${user.uid}`);
                    const data = await response.json();
                    setStudentName(data.firstname || "Unknown User");
                }
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        const fetchClasses = async () => {
            try {
                let classResponse, mentoredResponse;

                if (user.role === UserType.STUDENT) {
                    classResponse = await fetch(`${SPEAR_URL}/student/${user.uid}/enrolled-classes`);
                } else if (user.role === UserType.FACULTY) {
                    classResponse = await fetch(`${SPEAR_URL}/teacher/classes-created/${user.uid}`);
                    mentoredResponse = await fetch(`${SPEAR_URL}/mentor/classrooms/${user.uid}`);
                }

                if (classResponse?.ok) {
                    const classData = await classResponse.json();
                    setClasses(classData);
                    localStorage.setItem('classrooms', JSON.stringify(classData));
                }

                if (mentoredResponse?.ok) {
                    const mentoredData = await mentoredResponse.json();
                    setMentoredClass(mentoredData);
                    localStorage.setItem('mentoredClassrooms', JSON.stringify(mentoredData));
                }
            } catch (err) {
                console.error("Error fetching classes:", err);
            }
        };

        fetchUserData();
        fetchClasses();
    }, [user, loading]);

    useEffect(() => {
        if (classes) {
            localStorage.setItem('classrooms', JSON.stringify(classes));
        } else {
            localStorage.removeItem('classrooms');
        }
    }, [classes]);

    useEffect(() => {
        if (mentoredClass) {
            localStorage.setItem('mentoredClassrooms', JSON.stringify(mentoredClass));
        } else {
            localStorage.removeItem('mentoredClassrooms');
        }
    }, [mentoredClass]);

    return (
        <div className="h-screen overflow-auto relative">
            {user ? (
                <BaseComponent>
                    <GreetingBar name={user.role === UserType.FACULTY ? `Teacher ${facultyName}` : studentName} />
                    <ClassroomList classrooms={classes} mentoredClassrooms={mentoredClass} />
                </BaseComponent>
            ) : (
                <CatLoader loading={!user} />
            )}
        </div>
    );
}
