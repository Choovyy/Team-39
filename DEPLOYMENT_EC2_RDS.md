# Team-39 Deployment Guide (EC2 + RDS + Netlify)

This guide deploys:
- QueueIt backend (Spring Boot, port 8081) on EC2
- SPEAR backend (Spring Boot, port 8080) on EC2
- Match_connect AI microservice (FastAPI + FAISS, port 8000) on EC2
- Frontends to Netlify
- MySQL on AWS RDS

## 1) Prepare AWS

- Create an RDS MySQL instance (db.t3.micro OK to start)
  - Engine: MySQL 8.x
  - Public access: No (preferred). If you set No, place EC2 in the same VPC/subnets and allow security group access from EC2 to RDS
  - Create database: `dbspear` (or adjust DB_NAME)
  - Create user: `app_user` and password
  - Note the RDS endpoint hostname
- Create a key pair for SSH and download the .pem
- Create a security group for EC2 allowing:
  - 22 (SSH) from your IP
  - 80/443 if you’ll place a reverse proxy
  - 8080, 8081, 8000 temporarily during testing (lock down later or front with Nginx/ALB)
- Create an EC2 instance (Ubuntu 22.04 or Amazon Linux 2023). Attach the SG above. Put it in the same VPC/Subnets as RDS for best security.

## 2) On the EC2 VM

- Install Docker + Compose (v2). On Ubuntu, roughly:
  - sudo apt-get update && sudo apt-get install -y ca-certificates curl gnupg
  - install Docker Engine per docs, enable and start service
  - install docker compose plugin
- Clone this repo to the instance
- Option A (single env): Create `.env.ec2` by copying `.env.ec2.example` and fill in values.
- Option B (per-service envs, recommended): Create two files in repo root with your RDS values:

  .env.spear.ec2
  DB_HOST=your-rds-endpoint.rds.amazonaws.com
  DB_PORT=3306
  DB_NAME=dbspear
  DB_USER=app_user (or admin for initial test)
  DB_PASSWORD=StrongPassword

  .env.queueit.ec2
  DB_HOST=your-rds-endpoint.rds.amazonaws.com
  DB_PORT=3306
  DB_NAME=queueit2
  DB_USER=app_user (or admin for initial test)
  DB_PASSWORD=StrongPassword

  DB_HOST=your-rds-endpoint.rds.amazonaws.com
  DB_PORT=3306
  DB_NAME=dbspear
  DB_USER=app_user
  DB_PASSWORD=StrongPassword
  MATCHING_SERVICE_URL=http://match-connect:8000

- Build and run the stack:
  - docker compose -f docker-compose.ec2.yml build
  - docker compose -f docker-compose.ec2.yml up -d

Notes on databases:
- The compose file sets per-service schemas explicitly:
  - SPEAR backend uses DB_NAME=dbspear
  - QueueIt backend uses DB_NAME=queueit2
- Ensure both schemas exist in RDS and your DB user has privileges on both.

The services will be reachable on:
- SPEAR: http://EC2_PUBLIC_IP:8080
- QueueIt: http://EC2_PUBLIC_IP:8081
- Match_connect: http://EC2_PUBLIC_IP:8000/status

Logs:
- docker compose -f docker-compose.ec2.yml logs -f spear-backend
- docker compose -f docker-compose.ec2.yml logs -f queueit-backend
- docker compose -f docker-compose.ec2.yml logs -f match-connect

## 3) Configure Spring properties
We updated Spring Boot apps to read env for DB and mail:
- SPEAR `application.properties` uses DB_HOST/DB_PORT/DB_NAME/DB_USER/DB_PASSWORD
- QueueIt `application.properties` uses the same
- SPEAR `matching.service.url` is set via MATCHING_SERVICE_URL and already points to the container name `match-connect`

## 4) Frontends on Netlify
Build and deploy the two frontends to Netlify. In their environment variables, point API base URLs at your EC2 public DNS or a domain:
- VITE_API_URL_SPEAR=https://api.yourdomain.com (or http://EC2:8080)
- VITE_API_URL_QUEUEIT=https://queueit.yourdomain.com (or http://EC2:8081)
- VITE_MATCH_URL=http://api.yourdomain.com:8000 (if frontend calls AI directly)

Prefer fronting EC2 services with an Nginx reverse proxy on port 80/443 or an Application Load Balancer + ACM TLS.

## 5) Persistence and models
- Match_connect mounts `/app/data` for FAISS index and `/models` for the transformer cache. These are Docker named volumes so data persists across container restarts.

## 6) Hardening and next steps
- Restrict security group to only 80/443, and put Nginx/ALB in front of 8080/8081/8000
- Consider using AWS Systems Manager Parameter Store or Secrets Manager for DB and mail secrets
- Add health endpoints and CloudWatch agent if desired
- Build multi-arch images if needed (default is linux/amd64)

## 7) Troubleshooting
- Database connection errors: ensure EC2 can reach RDS (same VPC, SG rule allowing EC2 SG to connect to port 3306).
- AI model download slow/fails: pre-warm the `/models` volume by running the container once; ensure egress allowed.
- Out-of-memory on AI: switch to a smaller model or increase EC2 memory.
