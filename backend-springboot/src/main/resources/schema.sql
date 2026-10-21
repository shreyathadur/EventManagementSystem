-- =============================================================================
-- University Event Management System (EMS) - Database Schema
-- Compatible with PostgreSQL and standard SQL
-- All statements use IF NOT EXISTS to guarantee idempotent execution.
-- =============================================================================

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    organization_name VARCHAR(255),
    department VARCHAR(255),
    profile_picture VARCHAR(255),
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
    user_id VARCHAR(36) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    profile_image_url VARCHAR(500),
    bio VARCHAR(1000),
    department VARCHAR(255),
    phone VARCHAR(20),
    total_events_attended INTEGER DEFAULT 0,
    total_events_organized INTEGER DEFAULT 0,
    reviews_given INTEGER DEFAULT 0,
    average_rating DOUBLE PRECISION DEFAULT 0.0
);

-- 3. User Badges Table
CREATE TABLE IF NOT EXISTS user_badges (
    user_id VARCHAR(36) NOT NULL REFERENCES user_profiles(user_id) ON DELETE CASCADE,
    badge_name VARCHAR(255) NOT NULL
);

-- 4. Venues Table
CREATE TABLE IF NOT EXISTS venues (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    capacity INTEGER,
    type VARCHAR(255),
    location VARCHAR(255),
    amenities VARCHAR(1000),
    is_available BOOLEAN DEFAULT TRUE,
    map_image_url VARCHAR(500),
    accessibility_info VARCHAR(500),
    parking_capacity INTEGER,
    has_wifi BOOLEAN DEFAULT FALSE,
    has_audio_visual BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP
);

-- 5. Events Table
CREATE TABLE IF NOT EXISTS events (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50),
    date DATE NOT NULL,
    time TIME NOT NULL,
    venue TEXT NOT NULL,
    organizer_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    max_attendees INTEGER,
    current_attendees INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'PENDING',
    registration_deadline DATE,
    image_url VARCHAR(1000),
    ticket_price DOUBLE PRECISION DEFAULT 0.0,
    is_paid BOOLEAN DEFAULT FALSE,
    average_rating DOUBLE PRECISION DEFAULT 0.0,
    review_count INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON events(organizer_id);

-- 6. Registrations Table
CREATE TABLE IF NOT EXISTS registrations (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_id VARCHAR(36) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'CONFIRMED',
    ticket_type VARCHAR(50) DEFAULT 'standard',
    amount_paid DOUBLE PRECISION DEFAULT 0.0,
    checked_in BOOLEAN DEFAULT FALSE,
    checked_in_at TIMESTAMP,
    created_at TIMESTAMP,
    CONSTRAINT uk_user_event_registration UNIQUE (user_id, event_id)
);

CREATE INDEX IF NOT EXISTS idx_registration_event ON registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registration_user ON registrations(user_id);

-- 7. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(36) PRIMARY KEY,
    registration_id VARCHAR(36) NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    stripe_payment_id VARCHAR(255),
    amount DOUBLE PRECISION NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'PENDING',
    payment_date TIMESTAMP,
    receipt_url VARCHAR(500),
    ticket_tier VARCHAR(50)
);

-- 8. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id VARCHAR(36) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL,
    comment VARCHAR(2000),
    created_at TIMESTAMP NOT NULL,
    is_verified BOOLEAN DEFAULT TRUE,
    CONSTRAINT uk_event_user_review UNIQUE (event_id, user_id)
);

-- 9. Approvals Table
CREATE TABLE IF NOT EXISTS approvals (
    id VARCHAR(36) PRIMARY KEY,
    event_id VARCHAR(36) NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    faculty_id VARCHAR(36) REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'PENDING' NOT NULL,
    comments VARCHAR(1000),
    requested_at TIMESTAMP,
    approved_at TIMESTAMP
);

-- 10. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50),
    entity_id VARCHAR(255),
    details TEXT,
    timestamp TIMESTAMP NOT NULL,
    ip_address VARCHAR(50)
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
