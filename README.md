# 🎓 University Event Management System

> **A production-ready, enterprise-grade event management platform for universities — built with Java Full-Stack (Spring Boot + React)**

![Java](https://img.shields.io/badge/Java-17+-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.2+-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/React-18+-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| **Total Commits** | `8` |
| **Latest Commit** | `7e15ef3` — Fixed registration bug |
| **Current Branch** | `main` |
| **Repository** | [View on GitHub](https://github.com/shreyathadur/EventManagementSystem.git) |
| **Files in Repo** | `207` |
| **Backend Files** | `67 Java source files` |
| **Frontend Files** | `29 source files` |
| **Author** | shreyathadur |

### 📜 Recent Git History

```
7e15ef3  Fixed registration bug - Debugged and fixed all issues in backend and frontend
6c2d158  Fix compilation errors: add missing getters/setters, helper fields, repository method
033c28f  fix: Support both ESM and CJS path variables in server.ts
2446c0a  fix: Move devDependencies to dependencies to ensure they install on Render
f5f4f6c  fix: Update buildCommand in Render config to include devDependencies
436d8d1  deploy: Make port dynamic and add Render blueprint config
c13ee74  docs: Update README with project details and local setup guidelines
937fbad  Initial commit: Event Management System with local backend
```

---

## 🚀 Features

### Core Features

| Feature | Description | Status |
|---------|-------------|--------|
| 🔐 **JWT Authentication** | Secure login/signup with role-based access (Student, Faculty, Organization, Admin) | ✅ Live |
| 📅 **Event Management** | Full CRUD with categories, venues, capacity limits, and image support | ✅ Live |
| 📝 **Registration System** | One-click registration with waitlist, confirmation, and check-in | ✅ Live |
| ✅ **Faculty Approvals** | Multi-level approval workflow for student organization events | ✅ Live |
| 📊 **Role-Based Dashboards** | Custom dashboards for Student, Faculty, Organizer, and Admin | ✅ Live |
| 🏢 **Venue Management** | Create and manage venues with capacity, amenities, and accessibility info | ✅ Live |

### Professional Features (v2)

| Feature | Description | Status |
|---------|-------------|--------|
| 💳 **Stripe Payments** | Ticketed events with FREE/STUDENT/FACULTY/VIP tiers | ✅ Live |
| ⭐ **Reviews & Ratings** | 5-star rating system with verified attendee reviews | ✅ Live |
| 👤 **User Profiles & Badges** | Profiles with badges (Early Bird, Active Attendee, Top Organizer, etc.) | ✅ Live |
| 🎯 **Event Recommendations** | Category-based recommendations and similar events | ✅ Live |
| 📧 **Email Notifications** | Registration confirmations, reminders, and status updates (SendGrid) | ✅ Live |
| 📄 **PDF Reports** | Event attendance and monthly analytics reports (OpenPDF) | ✅ Live |
| 📅 **Calendar Integration** | Google Calendar links and .ics file downloads | ✅ Live |
| 📱 **Social Sharing** | Share events on Facebook, Twitter, WhatsApp, LinkedIn | ✅ Live |
| 🔍 **Advanced Search** | Full-text search with category, date, venue, and price filters | ✅ Live |
| 🔒 **Audit Logs** | Track all admin and user actions for security compliance | ✅ Live |
| 🌐 **Multi-Language (i18n)** | English + Hindi with browser auto-detect | ✅ Live |
| 🌙 **Dark Mode** | System-wide dark/light theme toggle with persistence | ✅ Live |
| ⚡ **WebSocket** | Real-time notifications via STOMP over SockJS | ✅ Live |
| 📈 **Analytics Dashboard** | Metrics cards with trend indicators and charts (Recharts) | ✅ Live |

---

## 🏗️ Technology Stack

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Java** | 17+ | Core language |
| **Spring Boot** | 3.2.5 | Web framework |
| **Hibernate JPA** | 6.4 | ORM / Data access |
| **PostgreSQL** | 15+ | Relational database |
| **Spring Security** | 6.x | Authentication & authorization |
| **JWT (JJWT)** | 0.12.x | Token-based auth |
| **Stripe Java SDK** | 24.0.0 | Payment processing |
| **OpenPDF** | 1.3.30 | PDF report generation |
| **SpringDoc OpenAPI** | 2.3.0 | Swagger API documentation |
| **Maven** | 3.9+ | Build tool |

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| **React** | 18+ | UI framework |
| **TypeScript** | 5+ | Type-safe JavaScript |
| **Vite** | 6.4 | Build tool (fast HMR) |
| **Material-UI (MUI)** | 5.x | Component library |
| **Axios** | 1.x | HTTP client |
| **React Router** | 6.x | Client-side routing |
| **Framer Motion** | — | Animations |
| **Recharts** | — | Charts & analytics |
| **react-i18next** | — | Internationalization |

### Infrastructure

| Technology | Purpose |
|-----------|---------|
| **Docker** | Containerization |
| **docker-compose** | Multi-container orchestration |
| **Render.com** | Cloud deployment |
| **SendGrid** | Email service (optional) |
| **AWS S3** | File storage (optional) |
| **Sentry** | Error tracking (optional) |

---

## 📁 Project Structure

```
EMS/
├── backend-springboot/                    # 🔧 Spring Boot Backend
│   ├── src/main/java/com/eventmgmt/
│   │   ├── config/                        # Configuration classes
│   │   │   ├── SecurityConfig.java        #   JWT + CORS + auth rules
│   │   │   ├── SwaggerConfig.java         #   OpenAPI 3 documentation
│   │   │   ├── WebSocketConfig.java       #   STOMP over SockJS
│   │   │   └── AsyncConfig.java           #   Async task executor
│   │   ├── controller/                    # REST API controllers (11)
│   │   │   ├── AuthController.java        #   POST /api/auth/login, /register
│   │   │   ├── EventController.java       #   CRUD /api/events
│   │   │   ├── RegistrationController.java#   POST /api/registrations/register
│   │   │   ├── ApprovalController.java    #   PUT /api/approvals/{id}/approve
│   │   │   ├── VenueController.java       #   CRUD /api/venues
│   │   │   ├── DashboardController.java   #   GET /api/stats
│   │   │   ├── PaymentController.java     #   POST /api/payments/process
│   │   │   ├── ReviewController.java      #   CRUD /api/reviews
│   │   │   ├── ProfileController.java     #   GET/PUT /api/profile
│   │   │   ├── ReportController.java      #   GET /api/reports (PDF)
│   │   │   ├── CalendarController.java    #   GET /api/calendar
│   │   │   ├── SearchController.java      #   GET /api/search/recommendations
│   │   │   └── AdminController.java       #   GET /api/admin/audit-logs
│   │   ├── model/                         # JPA Entities (14)
│   │   │   ├── User.java                  #   UserDetails + roles
│   │   │   ├── Event.java                 #   Events with categories
│   │   │   ├── Registration.java          #   User ↔ Event enrollment
│   │   │   ├── Approval.java              #   Faculty approval workflow
│   │   │   ├── Venue.java                 #   Venue with amenities
│   │   │   ├── Payment.java               #   Stripe payment records
│   │   │   ├── Review.java                #   Event reviews & ratings
│   │   │   ├── UserProfile.java           #   Extended profile + badges
│   │   │   └── AuditLog.java              #   Admin audit trail
│   │   ├── repository/                    # JPA Repositories (9)
│   │   ├── service/                       # Business Logic (12)
│   │   │   ├── AuthService.java           #   Login, register, JWT
│   │   │   ├── EventService.java          #   Event CRUD + filters
│   │   │   ├── RegistrationService.java   #   Register, cancel, check-in
│   │   │   ├── PaymentService.java        #   Stripe + mock payments
│   │   │   ├── ReviewService.java         #   Reviews + auto-ratings
│   │   │   ├── ProfileService.java        #   Profile + badge calc
│   │   │   ├── RecommendationService.java #   Event recommendations
│   │   │   ├── ReportService.java         #   PDF report generation
│   │   │   ├── CalendarService.java       #   Google Cal + iCal
│   │   │   ├── EmailService.java          #   SendGrid / console
│   │   │   └── AuditService.java          #   Async audit logging
│   │   ├── dto/                           # Request/Response DTOs (9)
│   │   ├── exception/                     # Global error handling
│   │   └── security/                      # JWT filter + service
│   └── pom.xml                            # Maven dependencies
│
├── frontend-react/                        # ⚛️ React + Vite Frontend
│   ├── src/
│   │   ├── components/                    # Reusable UI Components
│   │   │   ├── Navbar.tsx                 #   Dark mode, i18n, user menu
│   │   │   ├── ReviewCard.tsx             #   Star ratings display
│   │   │   ├── ReviewForm.tsx             #   Review submission dialog
│   │   │   ├── BadgesDisplay.tsx          #   Badge chips with icons
│   │   │   ├── MetricsCard.tsx            #   Animated stat cards
│   │   │   ├── ShareButtons.tsx           #   Social sharing buttons
│   │   │   ├── CalendarExport.tsx         #   Google Cal + iCal
│   │   │   └── LoadingSkeleton.tsx        #   Skeleton loaders
│   │   ├── pages/                         # Page Components
│   │   │   ├── LandingPage.tsx            #   Hero + featured events
│   │   │   ├── EventsPage.tsx             #   Events grid + filters
│   │   │   ├── EventDetailPage.tsx        #   Event details + register
│   │   │   ├── CreateEventPage.tsx        #   Event creation form
│   │   │   ├── ProfilePage.tsx            #   User profile + badges
│   │   │   ├── auth/LoginPage.tsx         #   Login form
│   │   │   ├── auth/RegisterPage.tsx      #   Registration form
│   │   │   └── dashboards/               #   Role-specific dashboards
│   │   ├── services/                      # API Client Layer
│   │   │   ├── api.ts                     #   Axios instance + interceptors
│   │   │   ├── eventService.ts            #   Event API calls
│   │   │   ├── registrationService.ts     #   Registration API calls
│   │   │   └── otherServices.ts           #   Auth, approval, venue, stats
│   │   ├── context/                       # React Context Providers
│   │   │   ├── AuthContext.tsx            #   Authentication state
│   │   │   └── ThemeContext.tsx            #   Dark/light mode
│   │   ├── locales/                       # i18n Translations
│   │   │   ├── en.json                    #   English (80+ keys)
│   │   │   └── hi.json                    #   Hindi (80+ keys)
│   │   ├── i18n.ts                        #   i18next configuration
│   │   ├── App.tsx                        #   Routes + providers
│   │   └── main.tsx                       #   Entry point
│   ├── vite.config.ts                     # Vite configuration
│   └── package.json                       # NPM dependencies
│
├── docker-compose.yml                     # 🐳 Docker orchestration
├── .env.example                           # Environment variables template
├── BUGFIX_REPORT.md                       # Bug fix documentation
└── README.md                              # This file
```

---

## 🔌 API Documentation

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/auth/register` | Register new user | ❌ |
| `POST` | `/api/auth/login` | Login and get JWT | ❌ |

### Events

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/events` | List events (paginated, filterable) | ❌ |
| `GET` | `/api/events/{id}` | Get event details | ❌ |
| `POST` | `/api/events` | Create event | 🔒 Organizer/Faculty/Admin |
| `PUT` | `/api/events/{id}` | Update event | 🔒 Owner/Admin |
| `DELETE` | `/api/events/{id}` | Delete event | 🔒 Owner/Admin |
| `GET` | `/api/events/my-events` | Get my events | 🔒 Authenticated |

### Registration

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/registrations/register` | Register for event | 🔒 Authenticated |
| `GET` | `/api/registrations/user` | My registrations | 🔒 Authenticated |
| `DELETE` | `/api/registrations/cancel/{eventId}` | Cancel registration | 🔒 Authenticated |
| `GET` | `/api/registrations/event/{eventId}` | Event registrations | 🔒 Authenticated |
| `POST` | `/api/registrations/checkin` | Check in attendee | 🔒 Authenticated |

### Reviews

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/reviews` | Create review | 🔒 Authenticated |
| `GET` | `/api/reviews/event/{eventId}` | Get event reviews | ❌ |
| `PUT` | `/api/reviews/{id}` | Update review | 🔒 Owner |
| `DELETE` | `/api/reviews/{id}` | Delete review | 🔒 Owner/Admin |

### Payments

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/payments/process` | Process payment | 🔒 Authenticated |
| `POST` | `/api/payments/refund/{paymentId}` | Refund payment | 🔒 Admin |
| `GET` | `/api/payments/registration/{regId}` | Get payment | 🔒 Authenticated |

### Profile & Badges

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/profile/{userId}` | Get user profile | 🔒 Authenticated |
| `PUT` | `/api/profile` | Update profile | 🔒 Authenticated |
| `GET` | `/api/profile/badges/{userId}` | Get user badges | 🔒 Authenticated |

### Calendar & Reports

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/calendar/google-link/{eventId}` | Google Calendar link | ❌ |
| `GET` | `/api/calendar/ical/{eventId}` | Download .ics file | ❌ |
| `GET` | `/api/reports/event/{eventId}/pdf` | Attendance report (PDF) | 🔒 Organizer/Admin |

### Admin

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/admin/audit-logs` | Get audit logs (paginated) | 🔒 Admin |

### Swagger UI

Once the backend is running, visit: **http://localhost:8080/swagger-ui.html**

---

## ⚡ Quick Start

### Prerequisites

- **Java 17+** — [Download](https://adoptium.net/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **Docker Desktop** — [Download](https://www.docker.com/products/docker-desktop/)
- **Git** — [Download](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/shreyathadur/EventManagementSystem.git
cd EventManagementSystem
```

### 2. Start PostgreSQL (Docker)

```bash
docker-compose up -d postgres
```

> ⚠️ PostgreSQL runs on **port 5433** (mapped from container's 5432 to avoid conflicts)

### 3. Start Backend (Spring Boot)

```bash
cd backend-springboot
./mvnw spring-boot:run
```

Backend will be available at: **http://localhost:8080**

### 4. Start Frontend (React + Vite)

```bash
cd frontend-react
npm install
npm run dev
```

Frontend will be available at: **http://localhost:3000** (or 3001 if 3000 is busy)

### 5. Access the Application

| Service | URL |
|---------|-----|
| **Frontend** | http://localhost:3000 |
| **Backend API** | http://localhost:8080/api |
| **Swagger Docs** | http://localhost:8080/swagger-ui.html |
| **PostgreSQL** | localhost:5433 |

---

## 🧪 Testing the Registration Flow

### 1. Create a Test User

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "student@test.com",
    "password": "password123",
    "role": "ROLE_STUDENT"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student@test.com",
    "password": "password123"
  }'
```

### 3. Register for Event

```bash
curl -X POST http://localhost:8080/api/registrations/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{"eventId": "EVENT_ID"}'
```

---

## 🔧 Environment Configuration

Copy `.env.example` and update values:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | `localhost` | PostgreSQL host |
| `DB_PORT` | `5433` | PostgreSQL port |
| `DB_NAME` | `university_ems` | Database name |
| `DB_USER` | `postgres` | Database user |
| `DB_PASSWORD` | `postgres` | Database password |
| `JWT_SECRET` | (base64 string) | JWT signing key |
| `JWT_EXPIRATION` | `86400000` | Token expiry (24h) |
| `STRIPE_API_KEY` | — | Stripe secret key (optional) |
| `SENDGRID_API_KEY` | — | SendGrid API key (optional) |

---

## 👥 User Roles & Permissions

| Role | Create Events | Register | Approve | Admin Panel |
|------|:---:|:---:|:---:|:---:|
| **ROLE_STUDENT** | ❌ | ✅ | ❌ | ❌ |
| **ROLE_ORGANIZATION** | ✅ (needs approval) | ✅ | ❌ | ❌ |
| **ROLE_FACULTY** | ✅ (auto-approved) | ✅ | ✅ | ❌ |
| **ROLE_ADMIN** | ✅ (auto-approved) | ✅ | ✅ | ✅ |

---

## 🐳 Docker Deployment

### Build & Run Everything

```bash
docker-compose up --build
```

### docker-compose services

| Service | Port | Description |
|---------|------|-------------|
| `postgres` | 5433:5432 | PostgreSQL 15 database |
| `backend` | 8080:8080 | Spring Boot API |
| `frontend` | 3000:80 | React (nginx) |

---

## 🐛 Known Issues & Fixes

See [BUGFIX_REPORT.md](BUGFIX_REPORT.md) for the complete bug fix documentation.

| Issue | Root Cause | Fix |
|-------|-----------|-----|
| Registration NPE | `maxAttendees` null check missing | Null-safe comparison |
| `lower(bytea)` SQL error | PostgreSQL venue column type | `CAST + columnDefinition TEXT` |
| CORS blocked on port 3001 | Missing origin in SecurityConfig | Added `localhost:3001` |

---

## 📋 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 👨‍💻 Author

**Shreya Thadur** — [@shreyathadur](https://github.com/shreyathadur)

---

<p align="center">
  <b>Built with ❤️ using Java Full-Stack</b><br>
  <sub>Spring Boot • React • PostgreSQL • Docker</sub>
</p>
