# Multi-stage build for Spring Boot application
# Stage 1: Build
FROM maven:3.8.8-eclipse-temurin-17 AS builder

WORKDIR /app

# Copy pom.xml and source code
COPY pom.xml .
COPY src/ src/

# Build the application
RUN mvn clean package -DskipTests

# Stage 2: Runtime
FROM amazoncorretto:17

WORKDIR /app

# Install curl and download OpenTelemetry Java Agent
RUN yum install -y curl && \
    curl -L https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar \
    -o /app/opentelemetry-javaagent.jar

# Copy the built JAR from builder stage
COPY --from=builder /app/target/*.jar app.jar

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health/live || exit 1

# Environment variables for OpenTelemetry
ENV OTEL_JAVAAGENT_ENABLED=true \
    OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318 \
    OTEL_RESOURCE_ATTRIBUTES="service.name=folio-api,service.version=0.1.0"

# Set JVM options
ENV JAVA_OPTS="-javaagent:/app/opentelemetry-javaagent.jar"

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
