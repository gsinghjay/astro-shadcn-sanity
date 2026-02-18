# ---- Build stage: compile and create fat JAR ----
FROM maven:3.9-eclipse-temurin-25-alpine AS build
WORKDIR /app
COPY pom.xml ./
RUN mvn dependency:resolve --no-transfer-progress
COPY src/ src/
RUN mvn package -DskipTests --no-transfer-progress

# ---- Production runtime: minimal JRE ----
FROM eclipse-temurin:25-jre-alpine AS prod
WORKDIR /app
COPY --from=build /app/target/Capstone_Bot-1.0-SNAPSHOT-jar-with-dependencies.jar ./discord-bot.jar
ENTRYPOINT ["java", "-jar", "discord-bot.jar"]

# ---- Dev: Maven + JDK with source mounted ----
FROM maven:3.9-eclipse-temurin-25-alpine AS dev
WORKDIR /app
ENTRYPOINT ["mvn", "compile", "exec:java", "-Dexec.mainClass=Bot.Main"]
