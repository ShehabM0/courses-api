# Courses API

A scalable RESTful API for managing online learning platforms, built with **NestJS** and **TypeScript**. It handles courses, lessons, categories, enrollments, progress tracking, reviews, payments, and full authentication with role-based access control.

## Features

- **Authentication & Authorization**
  - Register, login, logout, and token refresh with JWT (access + refresh tokens)
  - Token revocation with Redis for fast lookups and PostgreSQL for persistence
  - Email verification and password reset via 6-digit codes sent by email
  - Role-based access control (`student`, `instructor`, `admin`)
- **Courses & Content**
  - Course CRUD with thumbnail uploads, drafts, and publishing
  - Lesson management with bulk create and reordering
  - Categories with course browsing by slug
- **Learning**
  - Enrollments, course progress tracking, and lesson completion
  - Reviews with aggregated ratings
- **Payments** with Stripe Checkout sessions and webhook handling
- **Caching** via Redis (global cache-manager)
- **Scheduled cleanup** of expired/revoked tokens

## Tech Stack

| Layer      | Technology                                  |
| ---------- | ------------------------------------------- |
| Framework  | NestJS 11 + TypeScript                      |
| Database   | PostgreSQL with TypeORM                     |
| Cache      | Redis                                       |
| Auth       | JWT, bcrypt                                 |
| Email      | Nodemailer + Handlebars templates           |
| Payments   | Stripe (Checkout + webhooks)                |
| Validation | `class-validator` + `class-transformer`     |
| Uploads    | Multer (disk storage)                       |

## Project Structure

```
src/
├── auth/          # Registration, login, logout, refresh, email/password flows
├── users/         # User profile management
├── categories/    # Category CRUD + browse courses by category
├── courses/       # Course CRUD, publishing, thumbnail uploads
├── lessons/       # Lesson CRUD, bulk create, reordering
├── enrollments/   # Student enrollment + instructor student lists
├── progress/      # Lesson completion and course progress
├── reviews/       # Reviews with rating aggregation
├── payments/      # Stripe checkout + webhook handling
├── token/         # JWT token generation, revocation, cleanup
├── verification/  # Email verification codes
├── mail/          # Email sending with Handlebars templates
├── redis/         # Global Redis cache configuration
├── roles/         # Role-based guards and decorators
└── common/        # Shared config (multer) and pagination DTOs
```

## Getting Started

### Prerequisites

- Node.js 24+
- PostgreSQL
- Redis
- A Stripe account (for payments) and SMTP provider (for email)

### Installation

```bash
npm install
```

### Configuration

Create a `.env` file at the project root. The following variables are used:

| Variable                      | Description                                     |
| ----------------------------- | ----------------------------------------------- |
| `PORT`                        | Server port (default `3000`)                    |
| `NODE_ENV`                    | Set to `DEV` to enable TypeORM `synchronize`    |
| `DATABASE_URL`                | PostgreSQL connection string                    |
| `REDIS_URL`                   | Redis connection URL                            |
| `JWT_ACCESS_TOKEN`            | Secret for signing access tokens                |
| `JWT_ACCESS_TOKEN_EXP_TIME`   | Access token expiry (e.g. `15m`)                |
| `JWT_REFRESH_TOKEN`           | Secret for signing refresh tokens               |
| `JWT_REFRESH_TOKEN_EXP_TIME`  | Refresh token expiry (e.g. `7d`)                |
| `SMTP_HOST`                   | SMTP server host                                |
| `SMTP_PORT`                   | SMTP server port                                |
| `SMTP_USER`                   | SMTP username                                   |
| `SMTP_PASS`                   | SMTP password                                   |
| `STRIPE_SECRET_KEY`           | Stripe secret key                               |
| `STRIPE_WEBHOOK_SECRET`       | Stripe webhook signing secret                   |
| `FRONTEND_URL`                | Frontend URL used in Stripe success/cancel URLs |

### Running

```bash
# development (watch mode)
npm run start

# production
npm run build && npm run start:prod
```

Static files served from `uploads/` (course thumbnails).

### Docker

```bash
docker build -t courses-api .
docker run -p 3000:3000 --env-file .env courses-api
```

## API Overview

### Authentication — `/auth`

| Method | Endpoint          | Access   | Description                      |
| ------ | ----------------- | -------- | -------------------------------- |
| POST   | `/auth/register`  | Public   | Register a new user              |
| POST   | `/auth/login`     | Public   | Sign in, returns token pair      |
| POST   | `/auth/logout`    | Auth     | Revoke the current access token  |
| POST   | `/auth/refresh`   | Public   | Refresh token pair               |
| POST   | `/auth/verify-email` | Public | Verify email with code           |
| POST   | `/auth/forgot-password` | Public | Request a password reset code |
| POST   | `/auth/reset-password` | Public | Reset password with code      |

### Users — `/user`

| Method | Endpoint             | Access     | Description                        |
| ------ | -------------------- | ---------- | ---------------------------------- |
| GET    | `/user/profile`      | Auth       | Current user profile               |
| GET    | `/user`              | Admin      | List all users (paginated)         |
| GET    | `/user/:id`          | Admin      | Get a user by ID                   |
| PATCH  | `/user`              | Auth       | Update current user                |
| PATCH  | `/user/update-password` | Auth    | Update password                    |
| DELETE | `/user`              | Auth       | Delete current user                |

### Categories — `/categories`

| Method | Endpoint                 | Access | Description                    |
| ------ | ------------------------ | ------ | ------------------------------ |
| GET    | `/categories`            | Admin  | List categories (paginated)    |
| POST   | `/categories`            | Admin  | Create a category              |
| PATCH  | `/categories/:id`        | Admin  | Update a category              |
| DELETE | `/categories/:id`        | Admin  | Delete a category              |
| GET    | `/categories/:slug/courses` | Auth | Courses in a category        |

### Courses — `/courses`

| Method | Endpoint               | Access     | Description                          |
| ------ | ---------------------- | ---------- | ------------------------------------ |
| POST   | `/courses`             | Instructor | Create a course (thumbnail upload)   |
| GET    | `/courses`             | Auth       | List courses (paginated, searchable) |
| GET    | `/courses/my-courses`  | Instructor | List the instructor's courses        |
| GET    | `/courses/:id`         | Auth       | Get a course by ID                   |
| PATCH  | `/courses/:id`         | Instructor | Update a course                      |
| DELETE | `/courses/:id`         | Instructor | Delete a course                      |
| PATCH  | `/courses/:id/publish` | Instructor | Publish a course                     |

### Lessons — `/courses/:courseId/lessons`

| Method | Endpoint                    | Access     | Description                    |
| ------ | --------------------------- | ---------- | ------------------------------ |
| GET    | `/courses/:courseId/lessons` | Auth      | List lessons of a course       |
| GET    | `.../lessons/:lessonId`     | Enrolled   | Get a single lesson            |
| POST   | `.../lessons`               | Instructor | Create a lesson                |
| POST   | `.../lessons/bulk`          | Instructor | Create lessons in bulk         |
| PATCH  | `.../lessons/reorder`       | Instructor | Reorder lessons                |
| PATCH  | `.../lessons/:lessonId`     | Instructor | Update a lesson                |
| DELETE | `.../lessons/:lessonId`     | Instructor | Delete a lesson                |

### Enrollments — `/enrollments`

| Method | Endpoint                        | Access     | Description                    |
| ------ | ------------------------------- | ---------- | ------------------------------ |
| POST   | `/enrollments/:courseId`        | Student    | Enroll in a course             |
| GET    | `/enrollments/my-courses`       | Student    | List enrolled courses          |
| GET    | `/enrollments/:courseId/students` | Instructor | List course students       |

### Progress — `/courses/:courseId/progress`

| Method | Endpoint                                       | Access  | Description                 |
| ------ | ---------------------------------------------- | ------- | --------------------------- |
| POST   | `/courses/:courseId/progress/lessons/:lessonId/complete` | Student | Mark a lesson complete |
| GET    | `/courses/:courseId/progress`                  | Student | Get course progress         |

### Reviews — `/courses/:courseId/reviews`

| Method | Endpoint                       | Access   | Description              |
| ------ | ------------------------------ | -------- | ------------------------ |
| POST   | `/courses/:courseId/reviews`   | Enrolled | Create a review          |
| PATCH  | `/courses/:courseId/reviews/:reviewId` | Enrolled | Update a review |
| DELETE | `/courses/:courseId/reviews/:reviewId` | Enrolled | Delete a review |
| GET    | `/courses/:courseId/reviews`   | Public   | List course reviews      |

### Payments — `/payments`

| Method | Endpoint                    | Access          | Description                              |
| ------ | --------------------------- | --------------- | ---------------------------------------- |
| POST   | `/payments/checkout/:courseId` | Student      | Create a Stripe Checkout session         |
| POST   | `/payments/webhook`         | Public (webhook) | Handle Stripe webhook events             |
| GET    | `/payments`                 | Student/Admin  | List payments                            |

> **Stripe webhook testing:** use `stripe listen --forward-to localhost:3000/payments/webhook`, then trigger events with `stripe trigger checkout.session.completed`.

## Authentication

Protected endpoints require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <access-token>
```

After login you receive `{ accessToken, refreshToken }`. Use the refresh token at `POST /auth/refresh` to obtain a new pair when the access token expires.

## License

MIT License — see the [LICENSE](LICENSE) file for details.
