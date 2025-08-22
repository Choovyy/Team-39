# 🎓 Student Peer Evaluation and Review System (S.P.E.A.R.)

**S.P.E.A.R.** is a web-based platform developed for **Cebu Institute of Technology - University (CIT-U)** to support collaborative, team-based academic projects. It provides seamless tools for **team formation**, **project proposal submission**, **peer evaluation**, **class monitoring**, and **adviser consultation**, enhancing the experience for both students and instructors.

---

## 📌 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Project Modules](#project-modules)
- [Installation & Setup](#installation--setup)
  - [Frontend Setup (Vite + React)](#frontend-setup-vite--react)
  - [Backend Setup (Spring Boot)](#backend-setup-spring-boot)
  - [Database Setup (MySQL)](#database-setup-mysql)
- [Team Members](#team-members)
- [Documentation](#documentation)
- [Future Enhancements](#future-enhancements)

---

## 🚀 Features

- 🔐 **Role-based User Management** (Students, Teachers, Admins)
- 👥 **Flexible Team Formation** with approval workflows
- 📄 **Project Proposal Submission & Status Tracking**
- ✅ **Peer Evaluations** using customizable rubrics
- 🏫 **Class Management** with join codes
- 📊 **Evaluation Creation & Response Visualization**
- 🧑‍🏫 **Adviser Scheduling and Consultations**

---

## 🛠️ Tech Stack

| Layer        | Technology                   |
|--------------|------------------------------|
| Frontend     | React + Vite, Tailwind CSS   |
| Backend      | Java, Spring Boot            |
| Database     | MySQL                        |
| Architecture | MVC, RESTful API             |

---

## 🏗️ System Architecture

Frontend (Vite + React + Tailwind)
↓ REST API
Backend (Spring Boot - Java)
↓ JPA / Hibernate
Database (MySQL)

---

🛢️ Database Setup (MySQL)
1. Create the Database:
CREATE DATABASE spear_db;

2. Update DB Credentials:
Edit the src/main/resources/application.properties file in your backend project:

spring.datasource.url=jdbc:mysql://localhost:3306/spear_db
spring.datasource.username=root
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true


3. Table Auto-Generation:
The tables will be automatically created by JPA/Hibernate on the first run of the application.

---

👨‍💻 Team Members – 2425-sem2-it441-g01-02

| Name                  | Role(s)                                                 |
| --------------------- | ------------------------------------------------------- |
| Meñoso, Hezekiah Dane | Team Leader & Lead Frontend Developer                   |
| Novero, Rey Anthony   | Lead Backend Developer                                  |
| Calunod, Heather Wen  | Frontend Dev, Assistant Backend Dev & Technical Writer  |
| Gabisay, Alexa Mae    | Frontend Developer & Technical Writer                   |
| Arisgar, Aldrich Alex | Frontend Developer, Document Manager & Technical Writer |

---

📄 Documentation

📘 Software Requirements Specification (SRS)

🧩 Software Design Description (SDD)

🧩 Software Test Document (STD)

📅 Software Project Management Plan (SPMP)

---

✅ Future Enhancements

Dashboard analytics for instructors/admins

Notification system for deadlines and approvals

Advanced role-based access control

Mobile optimization

---

# Feel free to contribute or report any issues using GitHub's pull request or issue management features.
