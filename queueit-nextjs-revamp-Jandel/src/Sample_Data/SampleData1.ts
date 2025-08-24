import { Classes, ProjectProposal, QueueingManager, Team, User, UserType } from "@/Utils/Global_variables";

export const faculty:User ={
    uid:1,
    firstname:"jasmine",
    lastname:"tulin",
    email:"jasmine.tulin@cit.edu",
    password:"test",
    role:UserType.FACULTY,
    isDeleted:false,
    interests:"Videogames",
    enrolledClasses:new Set()
}

export const classroom1:Classes ={
    cid:1,
    createdBy:faculty,
    courseType:"Project based",
    courseCode:"IT344",
    section:"G01",
    schoolYear:"2425",
    semester:"2",
    courseDescription:"Applications Development and Emerging Technologies",
    classKey:"ZXC",
    createdDate: new Date(),
    isDeleted:false
}
export const classroom2:Classes ={
  cid:2,
  createdBy:faculty,
  courseType:"Project based",
  courseCode:"IT345",
  section:"G01",
  schoolYear:"2425",
  semester:"2",
  courseDescription:"Capstone 2",
  classKey:"ZXC",
  createdDate: new Date(),
  isDeleted:false
}
const classroom3:Classes ={
  cid:3,
  createdBy:faculty,
  courseType:"Project based",
  courseCode:"ZXC",
  section:"G01",
  schoolYear:"2425",
  semester:"2",
  courseDescription:"Information Management 1",
  classKey:"ZXC",
  createdDate: new Date(),
  isDeleted:false
}
const classroom4:Classes ={
  cid:4,
  createdBy:faculty,
  courseType:"Project based",
  courseCode:"ZXC",
  section:"G01",
  schoolYear:"2425",
  semester:"2",
  courseDescription:"Information Management 2",
  classKey:"ZXC",
  createdDate: new Date(),
  isDeleted:false
}



export const classes = new Set()
classes.add(classroom1)
classes.add(classroom2)
classes.add(classroom3)
classes.add(classroom4)

export const student:User ={
    uid:1,
    firstname:"jandel",
    lastname:"macabecha",
    email:"jandel.macabecha@cit.edu",
    password:"test",
    role:UserType.STUDENT,
    isDeleted:false,
    interests:"Videogames",
    enrolledClasses: classes as Set<Classes>
}

const c1 = classroom1
const c2 = classroom2

const classSet = new Set()
classSet.add(c1)
classSet.add(c2)

const user1:User = {
  "uid":1,
  "firstname":"angeline",
  "lastname":"damao",
  "email":"angeline.damao@cit.edu",
  "password":"test",
  "role":UserType.STUDENT,
  "isDeleted":false,
  "interests":"",
  "enrolledClasses":classSet as Set<Classes>
}

const fac = faculty

const team1Proposal:ProjectProposal = {
  "pid":1,
  "proposedBy":user1,
  "projectName":"SPEAR",
  "classProposal":c1,
  "description":"none",
  "status":"PENDING",
  "reason":"None",
  "adviser":faculty,
  "isDeleted":false
}

export const user2:User = {
  "uid":2,
  "firstname":"mj",
  "lastname":"tejero",
  "email":"mj.tejero@cit.edu",
  "password":"test",
  "role":UserType.STUDENT,
  "isDeleted":false,
  "interests":"",
  "enrolledClasses":classSet as Set<Classes>
}

const team1:Team = {
  "tid":1,
  "groupName":'SPEAR SAKSI NI JAVA WAHA',
  "project":team1Proposal,
  "leader":user1,
  "classRef":c1,
  "members": new Set().add(student).add(user2).add(user1) as Set<User>,
  "isRecruitmentOpen":false,
  "isDeleted":false
}



const team2Proposal:ProjectProposal = {
  "pid":2,
  "proposedBy":user2,
  "projectName":"SPEAR",
  "classProposal":c1,
  "description":"none",
  "status":"PENDING",
  "reason":"None",
  "adviser":faculty,
  "isDeleted":false
}

const team2:Team = {
  "tid":2,
  "groupName":'Queueit',
  // "project":team2Proposal,
  "leader":student,
  "classRef":c1,
  "members": new Set().add(student) as Set<User>,
  "isRecruitmentOpen":false,
  "isDeleted":false
}

export const sampleGroupMembers:Array<User> = [user1, user2, student,user1, user2, student,student, user1, user2,student, user1, user2,user1, user2, student,user1, user2, student,student, user1, user2,student, user1, user2,]
export const sampleTeams:Array<Team> = [team1,team2, team1, team2, team1, team2,team1,team2, team1, team2, team1, team2]

//this is supposed to be QueueingList class from Queueit backend
const teams = [team1,team2, team1, team2, team1, team2, team1,team2, team1, team2, team1, team2,team1,team2, team1, team2, team1, team2, team1,team2, team1, team2, team1, team2]
export const queueingManager1:QueueingManager ={
  queueID:1,
  adviserID:1,
  queueingGroups:teams,
  onHoldgroups:new Set(),
  tendingGroup:team2,
  timeEnds:new Date(new Date().getHours()+100000),
  isActive:true,
  cateringLimit:2
}
