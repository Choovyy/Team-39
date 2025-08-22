-- MySQL dump 10.13  Distrib 8.0.34, for macos13 (arm64)
--
-- Host: localhost    Database: dbspear
-- ------------------------------------------------------
-- Server version	8.0.33

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `uid` int NOT NULL AUTO_INCREMENT,
  `department` varchar(255) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `firstname` varchar(255) DEFAULT NULL,
  `interests` varchar(255) DEFAULT NULL,
  `is_deleted` bit(1) DEFAULT NULL,
  `lastname` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(255) NOT NULL,
  PRIMARY KEY (`uid`),
  UNIQUE KEY `UK_6dotkott2kjsp8vw4d0m25fb7` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (1,'N/A','admin123@cit.edu','Application','N/A',_binary '\0','Admin','$2a$10$RaA.rnwrFnCslDeMb4lLbui8FpUHKhZqglm4S01pr1cNKD4ftCzqO','ADMIN'),(2,'College of Computer Studies','ralph.laviste@cit.edu','Ralph','Capstone',_binary '\0','Laviste','$2a$10$b.RhG4eAtYwDJT7WjBMIl.yaurViHW/de0ZHsreO7Ns5U60C7ruTa','TEACHER'),(3,'College of Computer Studies','leah.barbaso@cit.edu','Leah','Backend Development',_binary '\0','Barbaso','$2a$10$CRmqIBz7Z3aCqKeMf2GGg.4ImZnu3QPDceKMsTmA4u6MAXp5n5ABa','TEACHER'),(4,'College of Computer Studies','eugene.busico@cit.edu','Eugene','Backend',_binary '\0','Busico','$2a$10$IrNMN1EAqTbT8QnMxIVQpua3MThQ0ToCa1exdirVXwN3f0WhGPuti','TEACHER'),(5,'College of Computer Studies','ericajean.abadinas@cit.edu','Erica Jean','Networking',_binary '\0','Abadinas','$2a$10$kYUHGQNWx36dm4lB/Fmqje/JxUVoEPFyFWOj5hr4M/4GggKko09WC','TEACHER'),(6,'College of Computer Studies','jasmine.tulin@cit.edu','Jasmine','Web Development',_binary '\0','Tulin','$2a$10$YivXNfc0tTUFztouriDisOjEYiW3.F.D5usAW87FxRqMXsQNqRvTy','TEACHER'),(7,'College of Computer Studies','junalbert.pardillo@cit.edu','Jun Albert','Machine Learning',_binary '\0','Pardillo','$2a$10$3t2UsBqizcn5Gp3Bu/qWceOtsrTD.NaMRqI4MDh/MWtDWqu5pyd3C','TEACHER'),(8,'College of Computer Studies','jayvince.serato@cit.edu','Jay Vince','Artificial Intelligence',_binary '\0','Serato','$2a$10$du2Tzd.O/KEk26PqKMdigu7kq/ku/0L8Vfypk1HJ08yw0F./cmx4y','TEACHER'),(9,'College of Computer Studies','judy.bernus@cit.edu','Judy','Software Development',_binary '\0','Bernus','$2a$10$WS2rvdgVH8HPJzn.CGW6MuX71L52o6ckLFkHKNYIoZWMSj5xSfrGC','TEACHER'),(10,'College of Computer Studies','cheryl.pantaleon@cit.edu','Cheryl','Frontend Development',_binary '\0','Pantaleon','$2a$10$wAlkd3m4.8U6moyi57Qg6egH49Wb2.uqHTcxKOHdS/C2jiE29zmvW','TEACHER'),(11,'College of Computer Studies','thelma.millan@cit.edu','Thelma','Quality Assurance',_binary '\0','Millan','$2a$10$ACVxH2/Spn3hVLo1Pt8rG.DoUPKRhZvItgt3V9JPZuzhVH2FSRKbe','TEACHER'),(12,'N/A','jobethalbert.cala@cit.edu','Jobeth Albert','N/A',_binary '\0','Cala','$2a$10$j2qi4W3ZxxqIJXKWxCeLt.B1UDzjWxdLA8Nu3ybE5dGA4vhJfbiLm','STUDENT'),(13,'N/A','ellanjude.estandarte@cit.edu','Ellan Jude','N/A',_binary '\0','Estandarte','$2a$10$QRY89Sfgsfkpv1Ju1ijSRuFOzuz94TrazSb0ndW91WDLZrnALo1eK','STUDENT'),(14,'N/A','adriancarlo.torquedo@cit.edu','Adrian Carlo','N/A',_binary '\0','Torquedo','$2a$10$hYBt0jaJL3v2YX4h/yZCgesFNJncTMqc5sg2zFnEHZafdjUyMTubi','STUDENT'),(15,'N/A','lukeedcel.patatag@cit.edu','Luke Edcel','N/A',_binary '\0','Patatag','$2a$10$k32K2/Sx93ZnBs/xuRNp4..CmhLOqJdnvsdrzk3VsKdNXJg89o8mm','STUDENT'),(16,'N/A','jakehoker.aves@cit.edu','Jake Hoker','N/A',_binary '\0','Aves','$2a$10$YPSnNxbF/2LU64GTViLA1OErz1GO/vrq4X6nUej47bRYrWtOUUKyC','STUDENT'),(17,'N/A','mezon.sotto@cit.edu','Mezon','N/A',_binary '\0','Sotto','$2a$10$8uwHm/yLw1itU1TGpBTiheWrUKwCoyzWYVJandcFqzKzpFnIoGOAi','STUDENT'),(18,'N/A','rhyssgianne.almeda@cit.edu','Rhyss Gianne','N/A',_binary '\0','Almeda','$2a$10$v/lRrAqZOQQR781sX627getTSv9ZXEQKgaT/zhLpRWj8MpDWsBiUq','STUDENT'),(19,'N/A','alexandramae.gabisay@cit.edu','Alexandra Mae','N/A',_binary '\0','Gabisay','$2a$10$1RMk50ZfsKvhp9p18Koo6uV.dS3YTRjRXkg7G5l7j1QyH/TU3Ubf.','STUDENT'),(20,'N/A','heatherwen.calunod@cit.edu','Heather Wen','N/A',_binary '\0','Calunod','$2a$10$TwYIh2LBG2lCDzfrPKtzY.ii5TdtKA9.sCramYLpMxMBAe4UWmPS.','STUDENT'),(21,'N/A','aldrichalex.arisgar@cit.edu','Aldrich Alex','N/A',_binary '\0','Arisgar','$2a$10$p6PJnxJfdMHvMFJ2sXMXWeWd5mklsInB0nzoi2PCc0V.R/wPbAv.G','STUDENT'),(22,'N/A','hezekiahdane.menoso@cit.edu','Hezekiah Dane','N/A',_binary '\0','Menoso','$2a$10$tNmK9mNDQ01MaUxsaBIGV.Sf/T1BJ04R4DzqAh/fQDW8wCDghJ0kC','STUDENT'),(23,'N/A','clint.villaflores@cit.edu','Clint','N/A',_binary '\0','Villaflores','$2a$10$36hme3t/Jh4SRfl4Crgx1OKP18x2AftdwpymolS02Ju0aZv1ZhZ7S','STUDENT'),(24,'N/A','reyanthony.novero@cit.edu','Rey Anthony','N/A',_binary '\0','Novero','$2a$10$Vx/GywNgUVa54mHN3vUDJOe7InwuDkeoh40yQtpDKNUkRWPY7ZQqu','STUDENT');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-26 14:31:16
