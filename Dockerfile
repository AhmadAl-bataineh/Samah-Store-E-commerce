# Multi-stage build for optimal image size
FROM eclipse-temurin:17-jdk-alpine AS builder

WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY .mvn/ .mvn
COPY mvnw pom.xml ./

# Download dependencies (cached layer)
RUN chmod +x ./mvnw && ./mvnw dependency:go-offline

# Copy source code
COPY src ./src

# Build application
RUN ./mvnw clean package -DskipTests

# Production stage
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Install wget for healthcheck (not included in alpine by default)
RUN apk add --no-cache wget

# Copy JAR from builder
COPY --from=builder /app/target/*.jar app.jar

# Create uploads directory with proper permissions
RUN mkdir -p /tmp/uploads && chmod 777 /tmp/uploads

# Add non-root user for security
RUN addgroup -g 1001 -S appuser && adduser -u 1001 -S appuser -G appuser
USER appuser

# Expose port
EXPOSE 8080

# Health check - give Spring Boot enough time to start (90s)
HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Set production profile
ENV SPRING_PROFILES_ACTIVE=prod

# Run application
ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]

