# University Event Management System

A full-stack web application for managing university campus events, built with **Java Spring Boot** (backend) and **React + Vite + Material-UI** (frontend).

## Tech Stack

| Layer      | Technology                                      |
|------------|------------------------------------------------|
| Backend    | Java 17, Spring Boot 3.2, Spring Security, JWT |
| ORM        | Hibernate JPA                                   |
| Database   | PostgreSQL 15+                                  |
| Frontend   | React 18, TypeScript, Vite, Material-UI v5      |
| Charts     | Recharts                                        |
| HTTP       | Axios                                           |
| Build      | Maven (backend), npm (frontend)                |
| Containers | Docker, docker-compose                          |
| Deploy     | Render.com                                      |

## Features

- **Role-Based Access**: Student, Organization, Faculty, Admin
- **JWT Authentication** with BCrypt password hashing and token refresh
- **Event CRUD** with filters, pagination, and sorting
- **Registration System** with auto seat allocation, waitlisting, and QR check-in
- **Faculty Approval Workflow**: Pending → Approved → Active or Rejected
- **Venue Management**: CRUD operations for campus venues
- **Admin Dashboard**: Charts and metrics using Recharts
- **Global Error Handling** with Spring's `@RestControllerAdvice`

## Project Structure

```
EMS/
├── backend-springboot/        # Spring Boot REST API
│   ├── src/main/java/com/eventmgmt/
│   │   ├── config/            # Security config
│   │   ├── controller/        # REST controllers
│   │   ├── dto/               # Request/Response DTOs
│   │   ├── exception/         # Global exception handler
│   │   ├── model/             # JPA entities
│   │   ├── repository/        # Spring Data repositories
│   │   ├── security/          # JWT filter & service
│   │   └── service/           # Business logic
│   ├── Dockerfile
│   └── pom.xml
├── frontend-react/            # React + Vite frontend
│   ├── src/
│   │   ├── components/        # Shared components (Navbar)
│   │   ├── context/           # Auth context
│   │   ├── pages/             # Pages and dashboards
│   │   └── services/          # Axios API services
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml         # Local dev orchestration
└── render.yaml                # Render.com deployment
```

## Quick Start

### Using Docker (Recommended)

```bash
docker-compose up
# Backend: http://localhost:8080
# Frontend: http://localhost:3000
```

### Manual Setup

#### Prerequisites
- Java 17+, Maven 3.8+
- Node.js 18+, npm
- PostgreSQL 15+

#### Backend
```bash
cd backend-springboot
# Set environment variables (or use defaults)
export DB_HOST=localhost DB_PORT=5432 DB_NAME=university_ems DB_USER=postgres DB_PASSWORD=postgres
./mvnw spring-boot:run
```

#### Frontend
```bash
cd frontend-react
npm install
npm run dev
```

## API Endpoints

### Auth
| Method | Endpoint             | Description     |
|--------|---------------------|-----------------|
| POST   | /api/auth/register  | Register user   |
| POST   | /api/auth/login     | Login user      |

### Events
| Method | Endpoint              | Description           |
|--------|----------------------|----------------------|
| GET    | /api/events          | List events (paginated) |
| GET    | /api/events/{id}     | Get event details     |
| POST   | /api/events          | Create event          |
| PUT    | /api/events/{id}     | Update event          |
| DELETE | /api/events/{id}     | Delete event          |
| GET    | /api/events/my-events| Get organizer's events|

### Registrations
| Method | Endpoint                          | Description         |
|--------|----------------------------------|---------------------|
| POST   | /api/registrations/register      | Register for event  |
| GET    | /api/registrations/user          | My registrations    |
| DELETE | /api/registrations/cancel/{id}   | Cancel registration |
| GET    | /api/registrations/event/{id}    | Event registrations |
| POST   | /api/registrations/checkin       | Check-in user       |

### Approvals
| Method | Endpoint                        | Description        |
|--------|---------------------------------|-------------------|
| POST   | /api/approvals/request          | Request approval   |
| GET    | /api/approvals/pending          | Pending approvals  |
| PUT    | /api/approvals/{id}/approve     | Approve event      |
| PUT    | /api/approvals/{id}/reject      | Reject event       |

### Dashboard
| Method | Endpoint    | Description         |
|--------|------------|---------------------|
| GET    | /api/stats | Dashboard statistics |

## Environment Variables

| Variable      | Default                    | Description          |
|--------------|---------------------------|---------------------|
| DB_HOST      | localhost                  | PostgreSQL host      |
| DB_PORT      | 5432                       | PostgreSQL port      |
| DB_NAME      | university_ems             | Database name        |
| DB_USER      | postgres                   | Database user        |
| DB_PASSWORD  | postgres                   | Database password    |
| JWT_SECRET   | (auto-generated)           | JWT signing key      |
| SERVER_PORT  | 8080                       | Backend server port  |

## Deployment (Render.com)

1. Push your code to GitHub
2. Connect to Render and use the `render.yaml` manifest
3. Render will automatically provision PostgreSQL, build and deploy both services
