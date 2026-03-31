FROM openjdk:21-jdk-slim

WORKDIR /app

COPY build/libs/ikea.jar ikea.jar

EXPOSE 8402

ENTRYPOINT ["java", "-jar", "ikea.jar"]