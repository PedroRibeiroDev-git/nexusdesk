FROM maven:3.9.11-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN apk add --no-cache wget && addgroup -S nexusdesk && adduser -S nexusdesk -G nexusdesk
COPY --from=build /app/target/nexusdesk-api.jar app.jar
USER nexusdesk
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
