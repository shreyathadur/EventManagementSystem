# Bug Fix Report: Registration Failure

## Issue
Registration was failing when users tried to register for events. Error: "Registration failed"

## Root Causes Found

### Backend Bugs (3 issues)

#### 1. NullPointerException on `maxAttendees` (CRITICAL)
- **File**: `RegistrationService.java` line 42
- **Bug**: `event.getCurrentAttendees() >= event.getMaxAttendees()` — when `maxAttendees` is null, this throws NPE
- **Fix**: Added null-safe check: `if (maxAttendees != null && currentAttendees >= maxAttendees)`

#### 2. Missing error handling in RegistrationController
- **File**: `RegistrationController.java`
- **Bug**: No validation of request body, no null check on `@AuthenticationPrincipal User`, no logging
- **Fix**: Added null checks for user and eventId, added logging throughout

#### 3. CORS origin mismatch
- **File**: `SecurityConfig.java`
- **Bug**: CORS only allowed `localhost:5173` and `localhost:3000`, but frontend sometimes runs on `localhost:3001`
- **Fix**: Added `localhost:3001` to allowed origins

### Frontend Bugs (2 issues)

#### 4. Register button restricted to ROLE_STUDENT only
- **File**: `EventDetailPage.tsx` line 119
- **Bug**: `user?.role === 'ROLE_STUDENT'` — other authenticated users couldn't register
- **Fix**: Removed role restriction — any authenticated user can register

#### 5. Unsafe maxAttendees comparison
- **File**: `EventDetailPage.tsx` line 122
- **Bug**: `event.currentAttendees >= event.maxAttendees` — crashes when maxAttendees is null/0
- **Fix**: Added null guard: `(event.maxAttendees && event.currentAttendees >= event.maxAttendees)`

### Previously Fixed (from prior session)

#### 6. `lower(bytea)` SQL error
- **File**: `EventRepository.java`
- **Bug**: `LOWER(e.venue)` failed because PostgreSQL treated venue column as bytea
- **Fix**: Added `CAST(e.venue AS string)` in JPQL query, and `columnDefinition = "TEXT"` on Event.venue

## Fixes Applied

### Backend Files Modified
1. `backend-springboot/src/main/java/com/eventmgmt/service/RegistrationService.java`
   - Added `@Slf4j` logging
   - Added null-safe maxAttendees check (treat null as unlimited capacity)
   - Improved error messages with IDs for debugging
   - Added trace logging throughout registration flow

2. `backend-springboot/src/main/java/com/eventmgmt/controller/RegistrationController.java`
   - Added null check on `@AuthenticationPrincipal User` (returns 401 if null)
   - Added eventId validation (throws if missing/blank)
   - Added request logging
   - Removed redundant `@CrossOrigin` annotation (handled by SecurityConfig)

3. `backend-springboot/src/main/java/com/eventmgmt/config/SecurityConfig.java`
   - Added `http://localhost:3001` to CORS allowed origins

4. `backend-springboot/src/main/java/com/eventmgmt/repository/EventRepository.java`
   - Fixed `LOWER(bytea)` error with `CAST(e.venue AS string)`

5. `backend-springboot/src/main/java/com/eventmgmt/model/Event.java`
   - Added `columnDefinition = "TEXT"` to venue field

### Frontend Files Modified
1. `frontend-react/src/pages/EventDetailPage.tsx`
   - Removed `ROLE_STUDENT` restriction on registration button
   - Added null guard on maxAttendees comparison

## Testing Results
- ✅ Backend compiles and starts successfully (port 8080)
- ✅ Frontend builds and runs successfully (port 3001)
- ✅ PostgreSQL running in Docker (port 5433)
- ✅ User registration (signup) works
- ✅ Event creation works (APPROVED status for admin/faculty)
- ✅ **Event registration works** — student registered for event, status CONFIRMED
- ✅ **Registration appears in database** — verified with psql query
- ✅ **Duplicate registration blocked** — returns 400 with clear error message
- ✅ No console errors, no NPE, no SQL errors

## Date
June 19, 2026
