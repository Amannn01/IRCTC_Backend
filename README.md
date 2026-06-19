# IRCTC Backend (Microservices)

Production-grade microservices scaffold for an IRCTC-style Railway Reservation Backend using Node.js, Express.js, PostgreSQL, Prisma, Redis, Kafka, and Docker Compose.

## Implemented Architecture

- API Gateway + 7 domain services
- Database-per-service using dedicated PostgreSQL instances
- Kafka event-driven communication model with outbox and DLQ strategy
- Saga-oriented booking and payment workflow design
- Redis-backed distributed seat locking, cache, and session use cases
- JWT access/refresh auth, OTP verification, Google OAuth, and RBAC design
- Service-level Dockerfiles and a complete local Docker Compose topology

## Repository Layout

- `/services/api-gateway`
- `/services/user-service`
- `/services/search-service`
- `/services/admin-service`
- `/services/booking-service`
- `/services/payment-service`
- `/services/inventory-service`
- `/services/notification-service`
- `/docs/architecture.md`
- `/docs/api/openapi.yaml`
- `/docker-compose.yml`

Each service contains:

- `src/index.js` (service bootstrap + health endpoint)
- `prisma/schema.prisma` (except gateway)
- `.env.example`
- `Dockerfile`

## Core Capability Coverage

- User registration/login/JWT/refresh token models
- OTP and OAuth identity persistence models
- Train/station/search schemas
- Admin audit and settings schemas
- Booking, payment, inventory, and notification schemas for event-driven workflows
- Cancellation-ready status modeling and outbox tables for eventual consistency

## Run Locally

```bash
docker compose up --build
```

Gateway health:

```bash
curl http://localhost:3000/health
```

## API Documentation

OpenAPI spec: `/docs/api/openapi.yaml`
