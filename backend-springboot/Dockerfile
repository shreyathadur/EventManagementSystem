# Stage 1: Build
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn

# Make wrapper executable and fix line endings
RUN chmod +x mvnw && sed -i 's/\r$//' mvnw

# Download dependencies (cached layer)
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests -B

# Stage 2: Run (smaller image)
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Copy the built JAR
COPY --from=builder /app/target/event-management-system-1.0.0.jar app.jar

# Expose port
EXPOSE 8080

# Run with prod profile and tune JVM for Render Free Tier (512MB container)
# -XX:+UseContainerSupport  → JVM reads cgroup limits instead of host RAM
# -XX:MaxRAMPercentage=75.0 → cap heap at 75% of container limit (~384MB)
# -XX:+UseSerialGC          → lighter GC, better for single-vCPU small containers
ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-Dspring.profiles.active=prod", \
  "-XX:+UseContainerSupport", \
  "-XX:MaxRAMPercentage=75.0", \
  "-XX:InitialRAMPercentage=50.0", \
  "-XX:+UseSerialGC", \
  "-jar", "app.jar"]
