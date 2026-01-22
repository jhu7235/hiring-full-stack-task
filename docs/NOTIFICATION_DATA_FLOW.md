# Notification Endpoints Data Flow Diagram

## Overview

This document describes the data flow for all notification-related endpoints in the system.

## Data Flow Diagram

```mermaid
graph TB
    subgraph Frontend["Frontend"]
        FE["React Frontend"]
        API_CLIENT["API Client<br/>/api/notifications"]
        HOOK["useNotifications Hook<br/>React Query"]
    end

    subgraph BackendAPI["Backend API Layer"]
        ROUTER["Notifications Router<br/>/api/notifications"]
        CRON_ROUTER["Cron Router<br/>/api/cron"]
        AUTH["Auth Middleware<br/>X-Auth-User-Id"]
    end

    subgraph Controller["Controller Layer"]
        CTRL["NotificationsController"]
        CRON_CTRL["CronController"]
    end

    subgraph ServiceLayer["Service/Query Layer"]
        QUERIES["NotificationQueries<br/>DEPRECATED"]
        SERVICE["NotificationService"]
        MODEL["NotificationModel"]
    end

    subgraph DataLayer["Data Layer"]
        PRISMA[("Prisma ORM")]
        DB[("PostgreSQL<br/>notifications table")]
    end

    %% Frontend to API
    FE -->|"HTTP Request"| API_CLIENT
    HOOK -->|"getUnreadCount"| API_CLIENT
    API_CLIENT -->|"GET /unread-count"| ROUTER
    API_CLIENT -->|"GET /"| ROUTER
    API_CLIENT -->|"POST /"| ROUTER

    %% Authentication Flow
    ROUTER -->|"All requests"| AUTH
    CRON_ROUTER -->|"No auth"| CRON_CTRL
    AUTH -->|"Validates user"| CTRL
    AUTH -->|"req.user.id"| CTRL

    %% Endpoint 1: GET /api/notifications
    CTRL -->|"getForUser"| QUERIES
    QUERIES -->|"getNotificationsForUser"| PRISMA
    PRISMA -->|"findMany"| DB
    DB -->|"notifications[]"| PRISMA
    PRISMA -->|"raw data"| QUERIES
    QUERIES -->|"notifications[]"| CTRL
    CTRL -->|"JSON response"| ROUTER
    ROUTER -->|"200 OK"| API_CLIENT

    %% Endpoint 2: GET /api/notifications/unread-count
    CTRL -->|"getUnreadCount"| PRISMA
    PRISMA -->|"count where readAt=null"| DB
    DB -->|"count"| PRISMA
    PRISMA -->|"number"| CTRL
    CTRL -->|"{count: number}"| ROUTER
    ROUTER -->|"200 OK"| API_CLIENT

    %% Endpoint 3: POST /api/notifications
    CTRL -->|"create"| PRISMA
    PRISMA -->|"create notification"| DB
    DB -->|"created notification"| PRISMA
    PRISMA -->|"notification"| CTRL
    CTRL -->|"JSON response"| ROUTER
    ROUTER -->|"201 Created"| API_CLIENT

    %% Endpoint 4: POST /api/cron/daily-digest
    CRON_CTRL -->|"generateDailyDigests<br/>TODO: Not implemented"| SERVICE
    SERVICE -.->|"Future: AI digest generation"| PRISMA

    %% Service Layer (Alternative paths)
    SERVICE -->|"send"| PRISMA
    SERVICE -->|"markAsRead"| PRISMA
    MODEL -->|"markAsRead"| PRISMA
    MODEL -->|"markAllAsRead"| PRISMA

    style AUTH fill:#ffd700
    style QUERIES fill:#ffcccc
    style CRON_CTRL fill:#ccccff
    style DB fill:#90EE90
```

## Endpoint Details

### 1. GET /api/notifications

**Purpose:** Retrieve all notifications for the authenticated user

**Flow:**

1. Frontend makes GET request to `/api/notifications`
2. Request passes through Auth Middleware (validates `X-Auth-User-Id` header)
3. `NotificationsController.getForUser()` is called
4. Controller uses `NotificationQueries.getNotificationsForUser(userId)`
5. Query executes Prisma `findMany` on notifications table
6. Returns array of notification objects

**Request:**

- Headers: `X-Auth-User-Id: <userId>`
- No body required

**Response:**

```json
[
  {
    "id": "string",
    "userId": "string",
    "message": "string",
    "type": "string",
    "readAt": "Date | null",
    "createdAt": "Date",
    "updatedAt": "Date"
  }
]
```

---

### 2. GET /api/notifications/unread-count

**Purpose:** Get count of unread notifications for authenticated user

**Flow:**

1. Frontend makes GET request to `/api/notifications/unread-count`
2. Request passes through Auth Middleware
3. `NotificationsController.getUnreadCount()` is called
4. Controller directly queries Prisma `count()` with filter `readAt: null`
5. Returns count object

**Request:**

- Headers: `X-Auth-User-Id: <userId>`
- No body required

**Response:**

```json
{
  "count": 5
}
```

---

### 3. POST /api/notifications

**Purpose:** Create a new notification for the authenticated user

**Flow:**

1. Frontend makes POST request to `/api/notifications` with notification data
2. Request passes through Auth Middleware
3. `NotificationsController.create()` is called
4. Controller directly creates notification via Prisma `create()`
5. Returns created notification object

**Request:**

- Headers: `X-Auth-User-Id: <userId>`
- Body:

```json
{
  "message": "string",
  "type": "string"
}
```

**Response:**

```json
{
  "id": "string",
  "userId": "string",
  "message": "string",
  "type": "string",
  "readAt": null,
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

---

### 4. POST /api/cron/daily-digest

**Purpose:** Generate daily notification digests for all users (scheduled job)

**Flow:**

1. External scheduler (e.g., cron job) makes POST request to `/api/cron/daily-digest`
2. Request bypasses Auth Middleware (background router)
3. `CronController.generateDailyDigests()` is called
4. **Status:** Not yet implemented (returns TODO message)

**Request:**

- No authentication required
- No body required

**Response (Current):**

```json
{
  "message": "Not implemented yet",
  "todo": "Generate AI-powered notification digests for all users"
}
```

---

## Service Layer Methods

### NotificationService.send()

**Purpose:** Service layer method for creating notifications

**Flow:**

- Validates required fields (userId, message, type)
- Creates notification via Prisma
- Returns notification object
- **Note:** Currently not used by controllers (controllers use direct Prisma calls)

### NotificationService.markAsRead()

**Purpose:** Mark a single notification as read

**Flow:**

- Finds notification by ID
- Updates `readAt` field to current timestamp
- Returns updated notification

### NotificationModel.markAsRead() / markAllAsRead()

**Purpose:** Model layer methods for marking notifications as read

**Flow:**

- `markAsRead()`: Updates single notification
- `markAllAsRead()`: Updates all unread notifications for a user
- **Note:** Currently not exposed via API endpoints

---

## Data Model

### Notification Schema

```prisma
model Notification {
  id        String    @id @default(cuid())
  userId    String
  message   String
  type      String
  readAt    DateTime?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  user User @relation(fields: [userId], references: [id])
}
```

---

## Architecture Notes

### Current Patterns

- **Controllers** use direct Prisma calls (deprecated pattern)
- **NotificationQueries** exists but marked as DEPRECATED
- **NotificationService** exists but not consistently used
- **Auth Middleware** validates `X-Auth-User-Id` header for all `/api` routes

### Future Improvements

- Migrate controllers to use `NotificationService` instead of direct Prisma calls
- Implement daily digest generation endpoint
- Add endpoint to mark notifications as read
- Add endpoint to mark all notifications as read
- Consider pagination for GET /api/notifications

---

## Error Handling

All endpoints use Express error handling middleware:

- Errors are caught in controller try/catch blocks
- Passed to `next(error)` which routes to error handler
- Error handler formats and returns appropriate HTTP status codes
