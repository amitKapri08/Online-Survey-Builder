# Online Survey Builder --- Full System Architecture

## 1. Overview

The Online Survey Builder is a full-stack web application that allows
survey owners to create and manage surveys, respondents to access and
submit surveys, and administrators to manage and monitor the platform.

### Primary goals

-   User registration and authentication
-   Survey creation and management
-   Dynamic question and option management
-   Public survey sharing
-   Response collection
-   Analytics and reporting
-   Exporting results
-   Email notifications
-   Role-based access control
-   Administrative management
-   Audit logging and system monitoring
-   Scalable deployment architecture

------------------------------------------------------------------------

# 2. High-Level Architecture

``` text
                         ┌───────────────────────────────┐
                         │         USERS / ROLES         │
                         │                               │
                         │  Survey Owners │ Respondents │
                         │       │        │      │       │
                         │       └────────┼──────┘       │
                         │              Admin            │
                         └───────────────┬───────────────┘
                                         │
                                         ▼
┌──────────────────────┐       ┌───────────────────────────────┐
│       CLIENTS        │       │     APPLICATION / FRONTEND    │
│                      │       │            React.js           │
│  Web Browser         │◄─────►│                               │
│  Desktop / Tablet    │ HTTPS │ Authentication                │
│  Mobile              │       │ Dashboard                     │
│                      │       │ Survey Builder                │
│  Public Survey Link  │       │ Survey Sharing                │
└──────────────────────┘       │ Responses                     │
                               │ Results & Analytics            │
                               │ Templates                      │
                               │ Profile & Settings             │
                               │ Notifications                  │
                               │ Public Survey Page             │
                               └──────────────┬────────────────┘
                                              │ REST API / HTTPS
                                              ▼
                               ┌───────────────────────────────┐
                               │       APPLICATION / BACKEND   │
                               │       Node.js + Express.js    │
                               │                               │
                               │ Auth Module                   │
                               │ User Module                   │
                               │ Survey Module                 │
                               │ Question Module               │
                               │ Option Module                 │
                               │ Response Module               │
                               │ Analytics Module              │
                               │ Export Module                 │
                               │ Notification Module           │
                               │ Admin Module                  │
                               │                               │
                               │ Validation / Auth / RBAC      │
                               │ Error Handling / Logging      │
                               └───────┬───────────────┬───────┘
                                       │               │
                              ┌────────▼──────┐   ┌────▼──────────────┐
                              │ PostgreSQL    │   │ External Services │
                              │ Database      │   │ Email             │
                              │               │   │ File Storage      │
                              │ Users         │   │ Charts/Analytics  │
                              │ Surveys       │   │ Background Jobs    │
                              │ Questions     │   └───────────────────┘
                              │ Options       │
                              │ Responses     │
                              │ Answers       │
                              │ Tokens        │
                              │ Audit Logs    │
                              └───────────────┘
```

------------------------------------------------------------------------

# 3. User Roles

## 3.1 Survey Owner

A registered user who creates and manages surveys.

Responsibilities:

-   Create surveys
-   Edit surveys
-   Delete surveys
-   Add and manage questions
-   Add and manage options
-   Publish surveys
-   Generate/share survey links
-   View responses
-   View analytics
-   Export results
-   Manage profile and settings

------------------------------------------------------------------------

## 3.2 Respondent

A person who fills out a survey.

Responsibilities:

-   Open a public survey link
-   View survey questions
-   Submit responses
-   Receive confirmation where applicable

Respondents may optionally be anonymous depending on the survey
configuration.

------------------------------------------------------------------------

## 3.3 Administrator

A privileged platform user.

Responsibilities:

-   Manage users
-   Manage surveys
-   Monitor responses
-   Manage platform settings
-   Review audit logs
-   Monitor system health
-   Handle administrative operations

------------------------------------------------------------------------

# 4. Client Layer

The client layer is responsible for presenting the application to users.

## Web Application

### Technology

-   React.js
-   React Router
-   TypeScript (recommended)
-   Tailwind CSS
-   Axios or Fetch API
-   React Query / TanStack Query (recommended)
-   Chart.js or Recharts

### Main frontend areas

``` text
Frontend
│
├── Authentication
│   ├── Register
│   ├── Login
│   ├── Forgot Password
│   └── Reset Password
│
├── Dashboard
│   ├── Overview
│   ├── Statistics
│   └── Recent Activity
│
├── Survey Builder
│   ├── Create Survey
│   ├── Edit Survey
│   ├── Survey Settings
│   ├── Add Questions
│   ├── Edit Questions
│   ├── Delete Questions
│   ├── Reorder Questions
│   └── Manage Options
│
├── Survey Management
│   ├── Survey List
│   ├── Search
│   ├── Filtering
│   ├── Publish
│   ├── Close
│   └── Delete
│
├── Sharing
│   ├── Generate Public Link
│   ├── Copy Link
│   └── Share Link
│
├── Responses
│   ├── Response List
│   ├── Response Details
│   └── Response Statistics
│
├── Analytics
│   ├── Charts
│   ├── Question Analytics
│   ├── Filters
│   └── Export
│
├── Templates
│   └── Pre-built Surveys
│
├── Profile & Settings
│   ├── Profile
│   ├── Password
│   └── Preferences
│
├── Notifications
│   └── Email Notifications
│
└── Public Survey Page
    ├── Survey Information
    ├── Questions
    └── Submit Response
```

------------------------------------------------------------------------

# 5. Backend Application Layer

## Technology

-   Node.js
-   Express.js
-   TypeScript
-   Prisma ORM
-   PostgreSQL
-   Zod for validation
-   JWT or secure cookie-based authentication
-   Winston/Pino for logging

The backend exposes RESTful APIs consumed by the React frontend.

------------------------------------------------------------------------

# 6. Backend Modules

## 6.1 Auth Module

Responsible for authentication and account security.

Responsibilities:

-   User registration
-   Login
-   Logout
-   Password hashing
-   Password reset
-   Email verification
-   Authentication token/session management
-   Authentication middleware

Possible technologies:

-   bcrypt / argon2
-   JWT
-   HTTP-only cookies
-   Nodemailer

------------------------------------------------------------------------

## 6.2 User Module

Responsible for user management.

Responsibilities:

-   Get user profile
-   Update profile
-   Change password
-   Manage user role
-   Account status

------------------------------------------------------------------------

## 6.3 Survey Module

Responsible for survey lifecycle management.

Responsibilities:

-   Create survey
-   Get survey
-   List surveys
-   Update survey
-   Delete survey
-   Publish survey
-   Close survey
-   Manage survey status
-   Generate public survey identifier/token

Example statuses:

``` text
DRAFT
ACTIVE
CLOSED
```

------------------------------------------------------------------------

## 6.4 Question Module

Responsible for survey questions.

Responsibilities:

-   Add question
-   Edit question
-   Delete question
-   Reorder questions
-   Configure required/optional questions
-   Configure question type

Possible question types:

``` text
TEXT
LONG_TEXT
SINGLE_CHOICE
MULTIPLE_CHOICE
DROPDOWN
RATING
NUMBER
DATE
BOOLEAN
```

------------------------------------------------------------------------

## 6.5 Option Module

Responsible for selectable question options.

Responsibilities:

-   Add option
-   Edit option
-   Delete option
-   Reorder options

Example:

``` text
Question:
"What is your favorite language?"

Options:
- JavaScript
- Python
- Java
- TypeScript
```

------------------------------------------------------------------------

## 6.6 Response Module

Responsible for collecting and managing survey responses.

Responsibilities:

-   Open public survey
-   Validate submitted answers
-   Create response
-   Store answers
-   Prevent duplicate responses when configured
-   Support anonymous responses when configured
-   Retrieve responses
-   Retrieve response details

A response is connected to a survey and contains multiple answers.

``` text
Survey
   │
   └── Response
          │
          ├── Answer
          ├── Answer
          └── Answer
```

------------------------------------------------------------------------

## 6.7 Analytics Module

Responsible for calculating survey results.

Responsibilities:

-   Total responses
-   Response rate
-   Question-level statistics
-   Choice distribution
-   Rating averages
-   Text response summaries
-   Charts
-   Filtering
-   Aggregations

Example:

``` text
Question: How satisfied are you?

1 ★  = 10 responses
2 ★  = 15 responses
3 ★  = 30 responses
4 ★  = 60 responses
5 ★  = 85 responses
```

------------------------------------------------------------------------

## 6.8 Export Module

Responsible for exporting survey data.

Supported formats:

-   CSV
-   Excel
-   PDF

Example exports:

``` text
Survey Results
├── Response ID
├── Submitted At
├── Question 1
├── Question 2
├── Question 3
└── ...
```

------------------------------------------------------------------------

## 6.9 Notification Module

Responsible for system notifications.

Responsibilities:

-   Registration emails
-   Email verification
-   Password reset emails
-   Survey invitations
-   Response notifications
-   Survey status notifications

Uses an external email service through SMTP/Nodemailer or an email
provider.

------------------------------------------------------------------------

## 6.10 Admin Module

Responsible for administrative functionality.

Responsibilities:

-   Manage users
-   Manage surveys
-   Monitor platform activity
-   Review audit logs
-   View system statistics
-   Manage platform settings

------------------------------------------------------------------------

# 7. REST API Layer

The backend exposes RESTful endpoints.

Example API structure:

``` text
/api
│
├── /auth
│   ├── POST   /register
│   ├── POST   /login
│   ├── POST   /logout
│   ├── POST   /forgot-password
│   └── POST   /reset-password
│
├── /users
│   ├── GET    /me
│   ├── PATCH  /me
│   └── PATCH  /me/password
│
├── /surveys
│   ├── GET    /
│   ├── POST   /
│   ├── GET    /:id
│   ├── PATCH  /:id
│   ├── DELETE /:id
│   ├── POST   /:id/publish
│   └── POST   /:id/close
│
├── /surveys/:surveyId/questions
│   ├── POST   /
│   ├── PATCH  /:questionId
│   ├── DELETE /:questionId
│   └── PATCH  /reorder
│
├── /questions/:questionId/options
│   ├── POST   /
│   ├── PATCH  /:optionId
│   └── DELETE /:optionId
│
├── /public/surveys
│   ├── GET    /:token
│   └── POST   /:token/responses
│
├── /surveys/:surveyId/responses
│   ├── GET    /
│   └── GET    /:responseId
│
├── /surveys/:surveyId/analytics
│   └── GET    /
│
├── /surveys/:surveyId/export
│   ├── GET    /csv
│   ├── GET    /excel
│   └── GET    /pdf
│
└── /admin
    ├── /users
    ├── /surveys
    ├── /responses
    └── /audit-logs
```

------------------------------------------------------------------------

# 8. Database Layer

## Database

PostgreSQL is the primary relational database.

Prisma is used as the ORM.

Core entities:

``` text
User
Survey
Question
Option
Response
Answer
Token
AuditLog
```

------------------------------------------------------------------------

# 9. Database Entity Relationships

``` text
User
 │
 ├───────────────< Survey
 │                    │
 │                    └───────────────< Question
 │                                         │
 │                                         └───────────────< Option
 │
 └───────────────< Response
                       │
                       └───────────────< Answer
                                             │
                                             ├── Question
                                             └── Option (optional)

Survey
 │
 ├───────────────< Response
 ├───────────────< Question
 └───────────────< Token

User
 │
 └───────────────< AuditLog
```

------------------------------------------------------------------------

# 10. Main Database Tables

## Users

``` text
users
├── id
├── name
├── email
├── password
├── role
├── createdAt
└── updatedAt
```

Roles:

``` text
USER
ADMIN
```

------------------------------------------------------------------------

## Surveys

``` text
surveys
├── id
├── userId
├── title
├── description
├── status
├── createdAt
└── updatedAt
```

Relationship:

``` text
User 1 ──────── N Surveys
```

------------------------------------------------------------------------

## Questions

``` text
questions
├── id
├── surveyId
├── title
├── type
├── isRequired
├── order
├── createdAt
└── updatedAt
```

Relationship:

``` text
Survey 1 ──────── N Questions
```

------------------------------------------------------------------------

## Options

``` text
options
├── id
├── questionId
├── text
├── order
├── createdAt
└── updatedAt
```

Relationship:

``` text
Question 1 ──────── N Options
```

------------------------------------------------------------------------

## Responses

``` text
responses
├── id
├── surveyId
├── userId          nullable
├── ipAddress       optional
├── submittedAt
└── createdAt
```

The `userId` can be nullable to support anonymous responses.

The system can support either:

-   Multiple responses per user
-   One response per user

This should be controlled by a survey-level configuration such as:

``` text
allowMultipleResponses
```

If multiple submissions are disabled, the backend should enforce the
rule with a database constraint and/or transactional application logic
rather than relying only on frontend validation.

------------------------------------------------------------------------

## Answers

``` text
answers
├── id
├── responseId
├── questionId
├── optionId       nullable
├── textAnswer
└── createdAt
```

An answer belongs to:

``` text
Response + Question
```

`optionId` is nullable because not every question uses predefined
options.

Examples:

``` text
Text Question
→ textAnswer

Single Choice
→ optionId

Multiple Choice
→ multiple Answer records or a suitable normalized representation

Rating
→ textAnswer or a dedicated numeric field
```

------------------------------------------------------------------------

## Tokens

Used for public survey access.

``` text
tokens
├── id
├── token
├── surveyId
├── userId
├── expiresAt
└── createdAt
```

A token can be used to generate a public URL such as:

``` text
/survey/<token>
```

------------------------------------------------------------------------

## Audit Logs

Used to track important platform actions.

``` text
audit_logs
├── id
├── userId
├── action
├── entity
├── entityId
└── createdAt
```

Examples:

``` text
SURVEY_CREATED
SURVEY_UPDATED
SURVEY_DELETED
SURVEY_PUBLISHED
RESPONSE_SUBMITTED
USER_UPDATED
```

------------------------------------------------------------------------

# 11. External Services

## Email Service

Possible implementation:

-   Nodemailer
-   SMTP
-   SendGrid
-   Resend
-   Amazon SES

Used for:

-   Verification
-   Password reset
-   Invitations
-   Notifications

------------------------------------------------------------------------

## File Storage

Used for:

-   Export files
-   Survey assets
-   Uploaded images
-   Generated reports

Possible providers:

-   AWS S3
-   Cloudinary
-   DigitalOcean Spaces

------------------------------------------------------------------------

## Analytics / Charts

Frontend chart libraries:

-   Chart.js
-   Recharts

Backend provides aggregated data through the analytics API.

------------------------------------------------------------------------

## Background Jobs

Background processing can be introduced for:

-   Sending bulk emails
-   Generating large exports
-   Processing reports
-   Scheduled tasks
-   Notifications

Possible technologies:

-   Redis
-   BullMQ

------------------------------------------------------------------------

# 12. Caching and Session Infrastructure

Redis can optionally be used for:

-   Session storage
-   Rate limiting
-   API caching
-   Temporary tokens
-   Background job queues
-   Distributed locks

Example:

``` text
Node.js / Express
       │
       ├── PostgreSQL → Persistent application data
       │
       └── Redis      → Cache / sessions / queues
```

------------------------------------------------------------------------

# 13. Security Architecture

Security should be enforced at multiple layers.

## Authentication

``` text
User
 ↓
Login
 ↓
Credentials validated
 ↓
Session/JWT created
 ↓
HTTP-only secure cookie
 ↓
Authenticated API requests
```

Recommended:

-   Password hashing with Argon2 or bcrypt
-   HTTP-only cookies
-   Secure cookies in production
-   SameSite protection
-   HTTPS
-   Token expiration
-   Refresh/session rotation where applicable

------------------------------------------------------------------------

## Authorization

Use role-based access control.

``` text
USER
 ├── Create own surveys
 ├── Manage own surveys
 └── View own results

ADMIN
 ├── Manage users
 ├── Manage surveys
 ├── Monitor system
 └── View audit logs
```

Every protected backend endpoint should verify both:

1.  Authentication
2.  Authorization

------------------------------------------------------------------------

## Validation

Use Zod or another validation library.

``` text
Request
   ↓
Schema Validation
   ↓
Controller
   ↓
Service
   ↓
Database
```

Never rely only on frontend validation.

------------------------------------------------------------------------

# 14. Backend Request Flow

Example: Creating a survey.

``` text
React Frontend
      │
      │ POST /api/surveys
      ▼
Express Router
      │
      ▼
Authentication Middleware
      │
      ▼
Authorization Middleware
      │
      ▼
Zod Validation
      │
      ▼
Survey Controller
      │
      ▼
Survey Service
      │
      ▼
Prisma ORM
      │
      ▼
PostgreSQL
      │
      ▼
Response
      │
      ▼
React Frontend
```

------------------------------------------------------------------------

# 15. Response Submission Flow

``` text
Respondent
    │
    ▼
Public Survey Page
    │
    ▼
GET /api/public/surveys/:token
    │
    ▼
Backend validates token
    │
    ▼
Load Survey + Questions + Options
    │
    ▼
Respondent fills survey
    │
    ▼
POST /api/public/surveys/:token/responses
    │
    ▼
Validate request
    │
    ▼
Check survey status
    │
    ▼
Check response rules
    │
    ▼
Database Transaction
    │
    ├── Create Response
    │
    └── Create Answers
    │
    ▼
Commit Transaction
    │
    ▼
Return Success
```

The response and its answers should be created transactionally so that a
partially saved response is avoided.

------------------------------------------------------------------------

# 16. Analytics Flow

``` text
Survey Owner
     │
     ▼
Results / Analytics Page
     │
     ▼
GET /api/surveys/:surveyId/analytics
     │
     ▼
Analytics Module
     │
     ▼
PostgreSQL Aggregation Queries
     │
     ▼
Aggregated Result
     │
     ▼
React
     │
     ▼
Charts / Tables / Statistics
```

------------------------------------------------------------------------

# 17. Export Flow

``` text
User
 │
 ▼
Export Results
 │
 ├── CSV
 ├── Excel
 └── PDF
 │
 ▼
Export Module
 │
 ▼
Query PostgreSQL
 │
 ▼
Generate File
 │
 ▼
Return File / Store in Object Storage
```

For large exports, the export operation can be moved to a background job
using Redis + BullMQ.

------------------------------------------------------------------------

# 18. Infrastructure and Deployment

Recommended production architecture:

``` text
                         Internet
                            │
                            ▼
                     ┌─────────────┐
                     │ Cloudflare  │
                     │ DNS / CDN   │
                     └──────┬──────┘
                            │ HTTPS
                            ▼
                     ┌─────────────┐
                     │   Nginx     │
                     │ Reverse     │
                     │ Proxy       │
                     └──────┬──────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
       React Static Build          Node.js + Express
                                      │
                         ┌────────────┼────────────┐
                         │            │            │
                         ▼            ▼            ▼
                    PostgreSQL      Redis      Object Storage
```

------------------------------------------------------------------------

# 19. Deployment Components

## Frontend

``` text
React
   ↓
Vite Build
   ↓
Static Files
   ↓
Nginx / CDN
```

------------------------------------------------------------------------

## Backend

``` text
Node.js
   ↓
Express.js
   ↓
REST API
```

------------------------------------------------------------------------

## Database

``` text
PostgreSQL
   ↓
Prisma ORM
```

------------------------------------------------------------------------

## Redis

Used for:

-   Caching
-   Sessions
-   Rate limiting
-   Background jobs

------------------------------------------------------------------------

## Object Storage

Used for:

-   Images
-   Generated reports
-   Exports
-   Other files

------------------------------------------------------------------------

# 20. Docker Architecture

The application can be containerized using Docker.

Example:

``` text
docker-compose.yml
│
├── frontend
│   └── React + Nginx
│
├── backend
│   └── Node.js + Express
│
├── postgres
│   └── PostgreSQL
│
├── redis
│   └── Redis
│
└── worker
    └── BullMQ Worker
```

------------------------------------------------------------------------

# 21. CI/CD Pipeline

GitHub Actions can automate deployment.

``` text
Developer
    │
    ▼
Git Push
    │
    ▼
GitHub Repository
    │
    ▼
GitHub Actions
    │
    ├── Install dependencies
    ├── Run lint
    ├── Run tests
    ├── Build frontend
    ├── Build backend
    └── Build Docker images
    │
    ▼
Deploy
    │
    ├── Frontend
    ├── Backend
    └── Worker
```

------------------------------------------------------------------------

# 22. Environment Configuration

Use environment variables for secrets and environment-specific
configuration.

Example:

``` text
NODE_ENV
PORT

DATABASE_URL

JWT_SECRET
JWT_EXPIRES_IN

REDIS_URL

SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASSWORD

S3_ENDPOINT
S3_BUCKET
S3_ACCESS_KEY
S3_SECRET_KEY

FRONTEND_URL
API_URL
```

Never commit `.env` files containing secrets to Git.

------------------------------------------------------------------------

# 23. Monitoring and Operations

## Logging

Possible tools:

-   Winston
-   Pino
-   Morgan

Log important events such as:

``` text
HTTP requests
Authentication failures
Database errors
Application errors
Background job failures
Security events
```

------------------------------------------------------------------------

## Error Tracking

Possible tool:

-   Sentry

Used for:

-   Frontend errors
-   Backend exceptions
-   API failures
-   Production debugging

------------------------------------------------------------------------

## Performance Monitoring

Possible tools:

-   Prometheus
-   Grafana

Metrics can include:

``` text
API response time
Request count
Error rate
Database performance
CPU usage
Memory usage
Queue size
```

------------------------------------------------------------------------

## Uptime Monitoring

Possible tools:

-   UptimeRobot
-   Pingdom

Monitor:

``` text
Frontend
Backend API
Database connectivity
Critical endpoints
```

------------------------------------------------------------------------

# 24. Backup and Recovery

PostgreSQL should be backed up regularly.

Recommended strategy:

``` text
PostgreSQL
    │
    ▼
Automated Backup
    │
    ▼
Secure Backup Storage
```

Important considerations:

-   Automated daily backups
-   Backup retention
-   Off-site backup
-   Periodic restore testing

------------------------------------------------------------------------

# 25. Key Application Features

The architecture supports:

-   Multi-question surveys
-   Multiple question types
-   Required/optional questions
-   Conditional logic (future enhancement)
-   Survey templates
-   Public surveys
-   Private surveys
-   Response collection
-   Multiple-response configuration
-   Real-time or near-real-time analytics
-   CSV / Excel / PDF exports
-   Email notifications
-   Role-based access control
-   Audit logs
-   Activity tracking
-   Background jobs
-   File storage
-   Monitoring
-   Backup and recovery

------------------------------------------------------------------------

# 26. Recommended Project Structure

``` text
online-survey-builder/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── store/
│   │   ├── types/
│   │   ├── utils/
│   │   └── routes/
│   └── package.json
│
├── server/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── routes/
│   │   ├── middleware/
│   │   ├── validators/
│   │   ├── utils/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── surveys/
│   │   │   ├── questions/
│   │   │   ├── options/
│   │   │   ├── responses/
│   │   │   ├── analytics/
│   │   │   ├── exports/
│   │   │   ├── notifications/
│   │   │   └── admin/
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   │
│   └── package.json
│
├── worker/
│   ├── src/
│   └── package.json
│
├── docker/
│   ├── frontend.Dockerfile
│   ├── backend.Dockerfile
│   └── worker.Dockerfile
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

------------------------------------------------------------------------

# 27. Architectural Principles

## Separation of Concerns

Frontend, API, business logic, database access, and infrastructure
should remain separated.

``` text
Controller
   ↓
Service
   ↓
Repository / Prisma
   ↓
Database
```

------------------------------------------------------------------------

## API-First Design

The frontend should communicate with the backend through documented REST
APIs rather than accessing the database directly.

``` text
React
  ↓
REST API
  ↓
Express
  ↓
Service Layer
  ↓
Prisma
  ↓
PostgreSQL
```

------------------------------------------------------------------------

## Transactional Response Submission

Response creation should use a database transaction:

``` text
BEGIN
  Create Response
  Create Answer 1
  Create Answer 2
  Create Answer 3
COMMIT
```

If any operation fails:

``` text
ROLLBACK
```

This keeps survey responses consistent.

------------------------------------------------------------------------

# 28. Complete Data Flow

``` text
                    ┌──────────────┐
                    │    USER      │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ React Client │
                    └──────┬───────┘
                           │ HTTPS
                           ▼
                    ┌──────────────┐
                    │    Nginx     │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │ Express API  │
                    └──────┬───────┘
                           │
                  ┌────────┴────────┐
                  │                 │
                  ▼                 ▼
             ┌──────────┐      ┌──────────┐
             │ Services │      │ External │
             │ /Modules │      │ Services │
             └────┬─────┘      └──────────┘
                  │
          ┌───────┴────────┐
          │                │
          ▼                ▼
    ┌───────────┐      ┌───────────┐
    │ PostgreSQL│      │   Redis   │
    └───────────┘      └───────────┘
```

------------------------------------------------------------------------

# 29. Future Enhancements

The architecture can later support:

-   Survey templates
-   Survey duplication
-   Conditional question logic
-   Scheduled survey closing
-   Email invitations
-   Advanced respondent segmentation
-   Real-time analytics
-   Collaborative survey editing
-   Custom themes
-   White-label surveys
-   Public API
-   Webhooks
-   Multi-language surveys
-   Advanced permissions
-   Subscription/billing system
-   Horizontal backend scaling

------------------------------------------------------------------------

# 30. Final Architecture Summary

The Online Survey Builder follows a layered full-stack architecture:

``` text
┌─────────────────────────────────────────────┐
│                 USERS                       │
│ Owners / Respondents / Admin                │
└──────────────────────┬──────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│             FRONTEND - React.js             │
│ UI / Dashboard / Builder / Public Survey    │
└──────────────────────┬──────────────────────┘
                       │ HTTPS / REST
                       ▼
┌─────────────────────────────────────────────┐
│          BACKEND - Node.js + Express        │
│ Auth / Users / Surveys / Questions / Options │
│ Responses / Analytics / Exports / Admin     │
└───────────────┬─────────────────┬───────────┘
                │                 │
                ▼                 ▼
┌────────────────────────┐  ┌─────────────────┐
│ PostgreSQL + Prisma    │  │ Redis           │
│ Persistent Data        │  │ Cache / Queues  │
└────────────────────────┘  └─────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│             External Services               │
│ Email / Object Storage / Charts / Jobs      │
└─────────────────────────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────────┐
│          Infrastructure / Deployment        │
│ Docker / Nginx / CI-CD / HTTPS / CDN       │
│ Monitoring / Logging / Backups              │
└─────────────────────────────────────────────┘
```

This architecture is intentionally modular so the project can start as a
manageable monolithic Node.js + Express application while leaving clear
paths for Redis, background workers, external storage, monitoring, and
horizontal scaling as the application grows.
