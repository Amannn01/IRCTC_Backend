# IRCTC Backend Microservices Architecture

## Services

1. **API Gateway**: single entry point, rate limiting, request auth, and service routing.
2. **User Service**: registration, login, JWT access/refresh tokens, OTP verification, Google OAuth, user profile.
3. **Search Service**: train and station search, seat availability query support.
4. **Admin Service**: train and station management with RBAC-based admin controls.
5. **Booking Service**: booking lifecycle, cancellation, saga orchestration, history.
6. **Payment Service**: payment intent, payment capture/refund, payment events.
7. **Inventory Service**: seat availability, distributed seat lock state.
8. **Notification Service**: email/SMS/in-app notifications.

## Communication Pattern

- **Synchronous REST** for query and command APIs through API Gateway.
- **Asynchronous Kafka events** for cross-service updates.
- **Saga pattern** for booking workflow:
  - `booking.requested` (Booking Service)
  - `seat.locked` / `seat.lock_failed` (Inventory Service)
  - `payment.authorized` / `payment.failed` (Payment Service)
  - `booking.confirmed` / `booking.cancelled` (Booking Service)
  - `notification.send` (Notification Service)
- **Outbox + DLQ** strategy:
  - each service persists outgoing events into its local outbox table.
  - Kafka consumer failures route messages to `<topic>.dlq`.

## Data and Infrastructure

- Database-per-service pattern with dedicated PostgreSQL instance and Prisma schema.
- Redis for:
  - seat-lock keys (`lock:train:{trainId}:seat:{seatId}`)
  - session management
  - cache for train/station search
- Rate limiting and circuit breaker are enforced at API Gateway.
- Centralized structured logs using correlation IDs propagated from Gateway.
- Environment-based config with strict defaults and service-level `.env.example` files.
