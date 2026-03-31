FROM eclipse-temurin:21-jre

WORKDIR /app

ARG JAR_FILE=build/libs/*.jar
COPY ${JAR_FILE} app.jar

EXPOSE 8402

ENTRYPOINT ["java", "-jar", "app.jar"]