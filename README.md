# Event Management System (GatherWise)

A premium, production-ready full-stack event registration, scheduling, tracking, and resource management dashboard. The application is built using React and TypeScript for a polished, responsive user experience, alongside a Node.js (Express) development backend with Vite integration. An enterprise-grade Spring Boot + PostgreSQL backend config is also available for containerized multi-tier deployments.

---

## 🚀 Key Features

* **Interactive Event Registry Workspace**: Explore upcoming panels, workshops, and networking speed events with advanced real-time query filters, categories, and date parameters.
* **Seat Allocation & Ticket Checkout**: Multi-tier seat reservation workflows (Standard, VIP, and Early Bird) with a customized checkout portal (including Stripe and Razorpay checkout sandbox simulations).
* **Admission Pass & QR Scanner**: Generate dynamic attendee entry passes with secure check-in QR codes and audit logs at simulated check-in terminals.
* **Scholastic Certification Engine**: Issue, print, and download elegantly branded Certificates of Attendance for completed events.
* **Simulated Transactional Outbox**: Visualized outbox logger verifying simulated HTML email alerts (e.g. ticket issuance, check-in validation, feedback notifications).
* **Optional AI-Assisted Copywriting**: Integrate with Gemini API to optimize event names, construct professional copy descriptions, and tailor organizer tags.
* **Containerized Spring Boot Option**: Transition to an enterprise relational DB structure using Spring Boot JPA + PostgreSQL, managed via Docker.

---

## 🛠️ Technology Stack

* **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React (Icons), Motion (Animations)
* **Development Server & APIs**: Node.js, Express, tsx (TypeScript Execute), Vite Middleware
* **Database (Local Simulation)**: Lightweight file-based JSON database (`db.json`)
* **Enterprise Backend**: Java 17, Spring Boot 3, Spring Data JPA, PostgreSQL, Docker Compose

---

## 💻 Running the App Locally

### Prerequisites

Ensure you have [Node.js](https://nodejs.org/) installed.

### Setup Instructions

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment Variables**:
   Create a `.env.local` file in the root directory (you can copy the structure from `.env.example`):
   ```bash
   # Add your optional Gemini API Key to enable AI copywriting features
   GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   *The application will boot up on both the Vite dev interface and Express backend API router at **[http://localhost:3000](http://localhost:3000)**.*

---

## 🐳 Running the Spring Boot & Postgres Stack (Enterprise Mode)

To deploy the containerized database and Java Spring Boot REST services:

1. Ensure [Docker Desktop](https://www.docker.com/products/docker-desktop/) is running.
2. Build and launch the containers:
   ```bash
   docker-compose up --build
   ```
   *This starts the PostgreSQL database on port `5432` and the Spring Boot backend service on port `8080`.*
