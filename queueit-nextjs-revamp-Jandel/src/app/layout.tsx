import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import favico from '../../public/favicon.ico'
import { UserProvider } from "@/Contexts/AuthContext";
import { ToastContainer } from "react-toastify";
import { ClassroomProvider } from "@/Contexts/ClassroomContext";
import { MentoredClassroomProvider } from "@/Contexts/MentoredClassroomContext";
import { TeamProvider } from "@/Contexts/TeamContext";
import { WebSocketProvider } from "@/WebSocket/WebSocketContext";
import { FacultyProvider } from "@/Contexts/FacultyContext";
import { QueueingManagerProvider } from "@/Contexts/QueueingManagerContext";
import { RubricProvider } from "@/Contexts/RubricContext";
import { RubricsProvider } from "@/Contexts/RubricsContext";
import { GradesProvider } from "@/Contexts/GradesContext";
import { TeamsProvider } from "@/Contexts/TeamsContext";
import { MeetingsProvider } from "@/Contexts/MeetingsContext";
import { ReportSummaryProvider } from "@/Contexts/ReportSummaryContext";
import { MilestoneSetProvider } from "@/Contexts/MilestoneSetContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Queueit",
  description: "Capstone for group 1 CIT-U 4th year students.",
  icons:{
    icon: favico.src
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        
        <UserProvider>
          <WebSocketProvider>
            <ClassroomProvider>
              <MentoredClassroomProvider>
                <TeamsProvider>
                  <TeamProvider>
                    <FacultyProvider>
                      <QueueingManagerProvider>
                        <RubricsProvider>
                          <RubricProvider>
                            <GradesProvider>
                              <MeetingsProvider>
                                <ReportSummaryProvider>
                                  <MilestoneSetProvider>
                                    {children}
                                  </MilestoneSetProvider>
                                </ReportSummaryProvider>
                              </MeetingsProvider>
                            </GradesProvider>
                          </RubricProvider>
                        </RubricsProvider>
                      </QueueingManagerProvider>
                      <ToastContainer/>
                    </FacultyProvider>
                  </TeamProvider>
                </TeamsProvider>
              </MentoredClassroomProvider> 
            </ClassroomProvider>
          </WebSocketProvider>
        </UserProvider>
      </body>
    </html>
  );
}
