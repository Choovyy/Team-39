# Multi-stage build for SPEAR Backend (Java 17)
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /workspace

# Cache dependencies first
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 mvn -q -e -DskipTests dependency:go-offline

# Build application
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 mvn -q -e -DskipTests clean package

# Runtime image
FROM eclipse-temurin:17-jre
ENV TZ=UTC
WORKDIR /app

# Copy built jar
COPY --from=build /workspace/target/*.jar /app/app.jar

EXPOSE 8080

# Accept Java options for tuning
ENV JAVA_OPTS=""

ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar /app/app.jar"]
