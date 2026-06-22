# Enterprise Application Learning Platform - Technical Specification

**Document Version:** 1.0  
**Date:** 2026-06-22  
**Status:** Draft - Awaiting Review

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Backend Specification](#backend-specification)
3. [Frontend Specification](#frontend-specification)
4. [Database Specification](#database-specification)
5. [Infrastructure Specification](#infrastructure-specification)
6. [Observability Specification](#observability-specification)
7. [Security Specification](#security-specification)
8. [API Contracts](#api-contracts)
9. [Deployment Specification](#deployment-specification)
10. [Non-Functional Requirements](#non-functional-requirements)

---

## 1. System Overview

### 1.1 Purpose

Create a real-world enterprise application that demonstrates:
- Modern backend REST API patterns using Spring Boot
- Frontend SPA development with React
- Infrastructure as Code with Terraform
- Container-based deployments
- Comprehensive observability and monitoring
- CI/CD automation with Jenkins

### 1.2 Business Context

This is a **Notes & Knowledge Management Platform** (similar to Evernote/OneNote) that handles:
- User note creation and management
- Organized notebooks and folders
- Rich text editing with markdown support
- Full-text search across notes
- Sharing and collaboration with other users
- Tagging and categorization
- Note versioning and history

The domain provides rich opportunities for teaching enterprise patterns while being intuitive and relatable.

### 1.3 System Context Diagram

```
┌──────────────┐
│   End Users  │
│   (Authors)  │
└──────┬───────┘
       │
       │ HTTPS
       │
┌──────▼──────────────┐      ┌─────────────────┐
│    React Frontend   │──┬──▶│  Auth Provider  │
│   (SPA on Nginx)    │  │   │  (Local/OAuth2) │
└──────────────────────  │   └─────────────────┘
                         │
                    REST API
                         │
       ┌─────────────────┘
       │
┌──────▼────────────────────┐
│  Spring Boot Backend       │
│  - Note Management         │
│  - Search Engine           │
│  - Collaboration Logic     │
│  - Authorization           │
└──────┬───────────┬─────────┘
       │           │
  JDBC │           │ Metrics/Logs/Traces
       │           │
┌──────▼──┐    ┌───▼────────────────┐
│   DB    │    │ Observability Stack│
│(Postgres)   │ (Prometheus/ELK etc)│
└─────────┘    └────────────────────┘
```

---

## 2. Backend Specification

### 2.1 Technology Stack

- **Runtime**: Java 17 (LTS)
- **Framework**: Spring Boot 3.1+
- **Build Tool**: Maven 3.8+
- **Database Driver**: PostgreSQL JDBC Driver
- **ORM**: Spring Data JPA with Hibernate
- **Migration**: Liquibase 4.20+

### 2.2 Project Structure

```
backend/
├── src/main/java/com/folio/
│   ├── application/           # Business logic (Use cases)
│   │   ├── employees/
│   │   ├── departments/
│   │   ├── projects/
│   │   └── auth/
│   ├── domain/                # Domain models
│   │   ├── model/
│   │   ├── repository/        # Repository interfaces
│   │   └── exception/
│   ├── infrastructure/        # Technical implementation
│   │   ├── persistence/       # JPA repositories
│   │   ├── security/          # Spring Security config
│   │   ├── logging/
│   │   ├── metrics/
│   │   └── tracing/
│   ├── presentation/          # REST Controllers
│   │   ├── controller/
│   │   ├── dto/               # Request/Response DTOs
│   │   └── exception/         # Global exception handling
│   └── FolioApplication.java  # Main class
├── src/main/resources/
│   ├── application.yml        # Main config
│   ├── application-dev.yml    # Dev profile
│   ├── application-prod.yml   # Prod profile
│   ├── db/changelog/          # Liquibase migrations
│   └── logback-spring.xml     # Logging config
├── src/test/java/            # Test packages mirror main
├── pom.xml
└── Dockerfile
```

### 2.3 Core Modules

#### 2.3.1 Authentication & Authorization

**Requirements:**
- OAuth2 with JWT tokens for production
- Basic authentication for local development
- Role-Based Access Control (RBAC)
- Token expiration: 1 hour
- Refresh token: 7 days

**Implementation Details:**
```java
- AuthController: POST /api/auth/login, POST /api/auth/refresh, POST /api/auth/logout
- JwtTokenProvider: Token generation and validation
- SecurityConfig: OAuth2/JWT configuration
- AuthenticationService: User authentication logic
```

**Roles:**
- `ROLE_ADMIN`: Full system access, user management
- `ROLE_USER`: Standard user with personal notebooks
- `ROLE_VIEWER`: Read-only access to shared notes

#### 2.3.2 User Profile Management

**Domain Model:**
```
User
├── id: UUID
├── email: String (unique)
├── displayName: String
├── profileImageUrl: String
├── theme: String (light/dark)
├── defaultNotebook: Notebook (FK)
├── isActive: boolean
└── timestamps: createdAt, updatedAt
```

**API Endpoints:**
```
GET    /api/v1/users/me              # Get current user profile
PUT    /api/v1/users/me              # Update profile
GET    /api/v1/users/{id}            # Get user public profile
POST   /api/v1/users/me/avatar       # Upload avatar
GET    /api/v1/users/search          # Search users (for sharing)
```

**Validation Rules:**
- Email format validation and uniqueness
- Display name: max 100 chars
- Avatar: max 5MB, image formats only

#### 2.3.3 Notebook Management

**Domain Model:**
```
Notebook
├── id: UUID
├── owner: User (FK)
├── name: String
├── description: String
├── color: String (hex code)
├── isArchived: boolean
├── createdAt: Timestamp
├── updatedAt: Timestamp
└── collaborators: List<User>
```

**API Endpoints:**
```
GET    /api/v1/notebooks            # List user's notebooks
GET    /api/v1/notebooks/{id}       # Get notebook with metadata
POST   /api/v1/notebooks            # Create new notebook
PUT    /api/v1/notebooks/{id}       # Update notebook
DELETE /api/v1/notebooks/{id}       # Archive/delete notebook
GET    /api/v1/notebooks/{id}/notes # Get notes in notebook
POST   /api/v1/notebooks/{id}/share # Share notebook with users
GET    /api/v1/notebooks/shared     # List notebooks shared with user
```

**Validation Rules:**
- Notebook name: required, max 255 chars
- Only owner can modify notebook settings
- Color: valid hex format

#### 2.3.4 Note Management (Core Feature)

**Domain Model:**
```
Note
├── id: UUID
├── notebook: Notebook (FK)
├── owner: User (FK)
├── title: String
├── content: String (rich text/markdown)
├── excerpt: String (auto-generated preview)
├── isArchived: boolean
├── isPinned: boolean
├── createdAt: Timestamp
├── updatedAt: Timestamp
├── lastEditedBy: User (for collaboration)
├── tags: List<Tag>
└── attachments: List<Attachment>
```

**API Endpoints:**
```
GET    /api/v1/notes                           # List notes (with pagination)
GET    /api/v1/notes/{id}                      # Get note details
POST   /api/v1/notes                           # Create new note
PUT    /api/v1/notes/{id}                      # Update note
DELETE /api/v1/notes/{id}                      # Delete/archive note
PATCH  /api/v1/notes/{id}/pin                  # Pin/unpin note
GET    /api/v1/notes/search                    # Full-text search
GET    /api/v1/notes/recent                    # Get recently modified notes
GET    /api/v1/notes/tag/{tagId}               # Get notes by tag
POST   /api/v1/notes/{id}/comments             # Add comment (collab)
GET    /api/v1/notes/{id}/history              # Get version history
POST   /api/v1/notes/{id}/restore              # Restore older version
```

**Features:**
- Rich text editor with markdown support
- Auto-save with debouncing (every 10 seconds)
- Collaborative editing support (real-time updates)
- Version history with timestamps
- Comments and mentions
- Attachment support (images, PDFs, documents)

**Validation Rules:**
- Title: required, max 500 chars
- Content: max 10MB
- Only note owner or collaborators can edit
- Soft delete by default (move to trash)

#### 2.3.5 Tagging & Organization

**Domain Model:**
```
Tag
├── id: UUID
├── owner: User (FK)
├── name: String
├── color: String
├── notes: List<Note>
└── createdAt: Timestamp

Note has many Tags (Many-to-Many)
```

**API Endpoints:**
```
GET    /api/v1/tags                 # List user's tags
POST   /api/v1/tags                 # Create new tag
PUT    /api/v1/tags/{id}            # Update tag
DELETE /api/v1/tags/{id}            # Delete tag
POST   /api/v1/notes/{id}/tags      # Add tag to note
DELETE /api/v1/notes/{id}/tags/{tagId}  # Remove tag from note
GET    /api/v1/tags/usage           # Get tag statistics
```

**Validation Rules:**
- Tag name: required, max 50 chars, unique per user
- Color: valid hex format

#### 2.3.6 Search & Discovery

**Features:**
- Full-text search across note titles and content
- Filter by: notebook, tag, date range, author
- Search in: title, content, comments, tags
- Advanced query syntax (future phase)
- Search history

**API Endpoints:**
```
GET    /api/v1/search               # Full-text search
GET    /api/v1/search/suggestions   # Search suggestions
GET    /api/v1/search/history       # Search history
POST   /api/v1/search/saved         # Save search query
```

**Implementation:**
- Use PostgreSQL full-text search for MVP
- Future: Elasticsearch for advanced search

#### 2.3.7 Sharing & Collaboration

**Domain Model:**
```
SharedNote
├── id: UUID
├── note: Note (FK)
├── sharedWith: User (FK)
├── permission: Enum (VIEW, COMMENT, EDIT)
├── sharedAt: Timestamp
└── expiresAt: Timestamp (nullable)

Collaborator
├── id: UUID
├── note: Note (FK)
├── user: User (FK)
├── role: Enum (OWNER, EDITOR, VIEWER)
└── joinedAt: Timestamp
```

**API Endpoints:**
```
POST   /api/v1/notes/{id}/share              # Share note
GET    /api/v1/notes/{id}/shared-with        # Get sharing info
PUT    /api/v1/notes/{id}/share/{userId}     # Update permission
DELETE /api/v1/notes/{id}/share/{userId}     # Revoke access
GET    /api/v1/notes/shared-with-me          # Notes shared with me
POST   /api/v1/notes/{id}/invite-link        # Create shareable link
```

**Features:**
- Share individual notes or entire notebooks
- Permission levels: Viewer (read-only), Commenter, Editor
- Time-limited share links
- Real-time collaboration indicators
- Activity feed for shared notes


### 2.4 Cross-Cutting Concerns

#### 2.4.1 Logging & Tracing (OpenTelemetry)

**Strategy:**
- Use OpenTelemetry SDK for unified logging, metrics, and tracing
- Export logs to OpenTelemetry Collector
- Correlation IDs automatically propagated across services
- Structured JSON logs with context
- Log to stdout (container-friendly)

**Implementation:**
```java
// pom.xml
- opentelemetry-api
- opentelemetry-sdk
- opentelemetry-exporter-jaeger
- opentelemetry-instrumentation-logback-appender

// Automatic instrumentation:
- io.opentelemetry.javaagent:opentelemetry-javaagent
```

**Configuration:**
```yaml
# application.yml
otel:
  exporter:
    otlp:
      endpoint: http://otel-collector:4317
  traces:
    exporter: otlp
  logs:
    exporter: otlp
  metrics:
    exporter: otlp
  service:
    name: folio-backend
    version: 1.0.0
```

**Log Format:**
```json
{
  "timestamp": "2026-06-22T10:30:45.123Z",
  "level": "INFO",
  "logger": "com.folio.application.notes.NoteService",
  "thread": "http-nio-8080-exec-1",
  "traceId": "abc123def456",
  "spanId": "def789",
  "message": "Note created successfully",
  "noteId": "uuid-123",
  "userId": "uuid-456",
  "duration_ms": 45
}
```

#### 2.4.2 Error Handling

**Global Exception Handler:**
- Custom exception hierarchy
- Standard error response format
- Proper HTTP status codes
- Error logging and tracking

**Standard Error Response:**
```json
{
  "timestamp": "2026-06-22T10:30:45.123Z",
  "status": 404,
  "error": "NOT_FOUND",
  "message": "Employee not found",
  "path": "/api/v1/employees/invalid-id",
  "correlationId": "abc-123-def"
}
```

**Exception Types:**
- `ResourceNotFoundException` → 404
- `ValidationException` → 400
- `UnauthorizedException` → 401
- `ForbiddenException` → 403
- `ConflictException` → 409
- `InternalServerException` → 500

#### 2.4.3 Metrics & Monitoring

**Metrics Collection:**
- Use Micrometer for metrics collection
- Export to Prometheus format
- Endpoint: `GET /actuator/prometheus`

**Key Metrics:**
- Request count by endpoint (labeled with method, status)
- Request latency (p50, p95, p99)
- Database query time
- Active connections
- JVM heap usage
- GC time

**Custom Metrics:**
```
folio_employees_created_total
folio_employees_active_count
folio_projects_active_count
folio_time_entries_logged_total
```

#### 2.4.4 Health Checks

**Endpoint:** `GET /actuator/health`

**Checks:**
- Database connectivity (via query)
- Disk space
- Application startup status

**Response Format:**
```json
{
  "status": "UP",
  "components": {
    "db": {"status": "UP"},
    "diskSpace": {"status": "UP"},
    "livenessState": {"status": "UP"},
    "readinessState": {"status": "UP"}
  }
}
```

### 2.5 Deployment Configuration

**Environment Variables:**
```bash
SPRING_PROFILES_ACTIVE=dev|prod
SPRING_DATASOURCE_URL=jdbc:postgresql://postgres:5432/folio
SPRING_DATASOURCE_USERNAME=folio_user
SPRING_DATASOURCE_PASSWORD=<secret>
SPRING_REDIS_HOST=redis
SPRING_REDIS_PORT=6379
JWT_SECRET=<secret>
JWT_EXPIRATION_HOURS=1
JWT_REFRESH_EXPIRATION_DAYS=7
```

**Graceful Shutdown:**
```yaml
server:
  shutdown: graceful
spring:
  lifecycle:
    timeout-per-shutdown-phase: 30s
```

---

## 3. Frontend Specification

### 3.1 Technology Stack

- **Language**: TypeScript 5.0+
- **Framework**: React 18+
- **Build Tool**: Vite 5+
- **State Management**: Redux Toolkit
- **HTTP Client**: Axios
- **UI Library**: Material-UI (MUI) 5+
- **Forms**: React Hook Form
- **Validation**: Zod
- **Testing**: Jest + React Testing Library
- **Router**: React Router v6
- **Instrumentation**: @opentelemetry/sdk-web (tracing + logs)

### 3.2 Project Structure

```
frontend/
├── src/
│   ├── components/             # Reusable components (TypeScript)
│   │   ├── common/             # Shared UI (Header, Footer, etc.)
│   │   ├── notes/              # Note-specific components
│   │   ├── notebooks/          # Notebook-specific components
│   │   ├── search/             # Search components
│   │   ├── sharing/            # Sharing components
│   │   └── layout/             # Layout components
│   ├── pages/                  # Page components (route views)
│   │   ├── LoginPage.tsx
│   │   ├── SignupPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── NotebookListPage.tsx
│   │   ├── NoteEditorPage.tsx
│   │   ├── SearchPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── store/                  # Redux store (TypeScript)
│   │   ├── slices/             # Redux slices (reducers)
│   │   │   ├── authSlice.ts
│   │   │   ├── notesSlice.ts
│   │   │   ├── notebooksSlice.ts
│   │   │   ├── tagsSlice.ts
│   │   │   └── searchSlice.ts
│   │   ├── hooks/              # Custom Redux hooks
│   │   └── store.ts            # Store configuration
│   ├── services/               # API services (TypeScript)
│   │   ├── api.ts              # Axios instance with interceptors
│   │   ├── authService.ts
│   │   ├── noteService.ts
│   │   ├── notebookService.ts
│   │   ├── tagService.ts
│   │   ├── searchService.ts
│   │   └── sharingService.ts
│   ├── hooks/                  # Custom React hooks (TypeScript)
│   │   ├── useAuth.ts
│   │   ├── useFetch.ts
│   │   └── useFormState.ts
│   ├── utils/                  # Utility functions (TypeScript)
│   │   ├── dateUtils.ts
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── logger.ts
│   ├── types/                  # TypeScript types & interfaces
│   │   ├── api.ts              # API response types
│   │   ├── domain.ts           # Domain models
│   │   └── ui.ts               # UI component types
│   ├── constants/              # Application constants
│   │   └── config.ts
│   ├── styles/                 # Global styles
│   │   ├── theme.ts            # MUI theme configuration
│   │   └── globals.css
│   ├── instrumentation/        # OpenTelemetry setup
│   │   └── tracing.ts          # Tracing initialization
│   ├── App.tsx                 # Root component
│   ├── main.tsx                # Entry point
│   ├── index.css
│   └── vite-env.d.ts           # Vite types
├── public/                     # Static assets
│   └── favicon.ico
├── tests/                      # Test files
│   └── **/*.test.tsx
├── vite.config.ts
├── tsconfig.json
├── package.json
├── .env.example
└── Dockerfile
```

### 3.3 Core Features

#### 3.3.1 Authentication Module

**Components:**
- `LoginPage`: Email/password login form
- `SignupPage`: User registration form
- `LogoutButton`: Session termination
- `PrivateRoute`: Protected route wrapper

**Store (Redux):**
```javascript
authSlice {
  user: { id, email, displayName, theme },
  token: string,
  refreshToken: string,
  isAuthenticated: boolean,
  loading: boolean,
  error: string | null
}
```

**Actions:**
- `loginUser(email, password)`: Authenticate user
- `signupUser(email, password, displayName)`: Register new user
- `refreshToken()`: Refresh JWT token
- `logoutUser()`: Clear session
- `checkAuthStatus()`: Validate current session

#### 3.3.2 Notebook Management Module

**Pages:**
- `NotebookListPage`: All notebooks with list/grid view
- `NotebookDetailPage`: Notebook overview with note list
- `NotebookFormPage`: Create/Edit notebook

**Components:**
- `NotebookCard`: Notebook summary with color badge
- `NotebookList`: Sortable, filterable notebook list
- `NotebookForm`: Create/edit form
- `NotebookShareModal`: Share notebook with users

**Features:**
- Create/rename/color-code notebooks
- Archive notebooks
- Share notebooks with permission levels
- Nested organization (future: folders)
- Starred/pinned notebooks

**Store (Redux):**
```javascript
notebooksSlice {
  items: Notebook[],
  selectedNotebook: Notebook | null,
  loading: boolean,
  error: string | null,
  filter: { archived, shared }
}
```

#### 3.3.3 Note Editor Module (Core)

**Pages:**
- `NoteEditorPage`: Full-screen rich text editor
- `NoteListPage`: List of notes with preview

**Components:**
- `RichTextEditor`: WYSIWYG editor with formatting toolbar
- `NotePreview`: Markdown preview
- `NoteList`: Sortable list with search and filters
- `NoteCard`: Note summary with excerpt
- `AttachmentPanel`: File attachment UI
- `TagInput`: Tag adding/removing
- `SharingPanel`: Share note with other users

**Features:**
- Rich text editing (bold, italic, links, lists, etc.)
- Markdown support
- Auto-save every 10 seconds
- Real-time collaboration (future phase)
- Inline image insertion
- File attachments
- Comments and mentions
- Version history/undo-redo
- Full-screen mode
- Read mode vs Edit mode toggle

**Store (Redux):**
```javascript
notesSlice {
  items: Note[],
  selectedNote: Note | null,
  editorContent: string,
  isDirty: boolean,
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error',
  loading: boolean,
  error: string | null
}
```

#### 3.3.4 Search & Discovery Module

**Pages:**
- `SearchPage`: Full-text search results
- `TagBrowsePage`: Browse notes by tag

**Components:**
- `SearchBar`: Global search input with suggestions
- `SearchResults`: Paginated search results
- `FilterPanel`: Filter by notebook, tag, date range
- `TagCloud`: Visual tag representation
- `RecentNotesWidget`: Recently viewed/edited notes

**Features:**
- Full-text search across titles and content
- Filter by: notebook, tag, date range, sharing status
- Search suggestions (popular tags, recent searches)
- Advanced search syntax (future)
- Search history

**Store (Redux):**
```javascript
searchSlice {
  query: string,
  results: Note[],
  filters: { notebook, tags, dateRange },
  loading: boolean,
  error: string | null
}
```

#### 3.3.5 Sharing & Collaboration Module

**Components:**
- `ShareModal`: Share note/notebook dialog
- `PermissionSelector`: Choose permission level
- `SharedWithList`: List of people with access
- `SharedWithMeList`: Notes/notebooks shared with me
- `CollaboratorsList`: Real-time editing indicators

**Features:**
- Share individual notes or notebooks
- Permission levels: Viewer, Commenter, Editor
- Expiring share links
- Revoke access anytime
- Activity indicators for collaborators
- Notifications for shares (future)

**Store (Redux):**
```javascript
sharingSlice {
  sharedWith: User[],
  permissions: Map<string, string>,
  loading: boolean,
  error: string | null
}
```

#### 3.3.6 User Profile & Settings

**Pages:**
- `SettingsPage`: User preferences
- `ProfilePage`: User profile editing

**Components:**
- `ProfileForm`: Edit name, email, avatar
- `PreferencesForm`: Theme, notifications, default notebook
- `SecuritySettings`: Change password, sessions
- `AccountSettings`: Export data, delete account

**Features:**
- Edit profile information
- Change password
- Theme selection (light/dark)
- Notification preferences
- Data export/import
- Account deletion

### 3.4 UI/UX Requirements

**Design System:**
- Material Design via MUI
- Consistent spacing using MUI spacing system
- Custom theme with brand colors
- Responsive grid (12-column)

**Layout:**
- Sidebar with notebook list
- Top bar with search and user menu
- Main editor area
- Right panel for sharing/comments (collapsible)
- Footer with sync status

**Responsive Breakpoints:**
- Mobile: < 600px
- Tablet: 600px - 960px
- Desktop: > 960px

**Accessibility (WCAG 2.1 AA):**
- Semantic HTML
- ARIA labels for rich editor
- Keyboard shortcuts for common actions
- Color contrast compliance
- Focus indicators
- Screen reader support for editor

**Keyboard Shortcuts (MVP):**
- `Ctrl+S` / `Cmd+S`: Save note
- `Ctrl+F` / `Cmd+F`: Search
- `Ctrl+N` / `Cmd+N`: New note
- `Ctrl+B` / `Cmd+B`: Bold
- `Ctrl+I` / `Cmd+I`: Italic
- `Ctrl+Shift+X` / `Cmd+Shift+X`: Strikethrough
- `Tab`: Indent list
- `Shift+Tab`: Outdent list

### 3.4 UI/UX Requirements

**Design System:**
- Material Design via MUI
- Consistent spacing using MUI spacing system
- Custom theme with brand colors
- Responsive grid (12-column)

**Layout:**
- Header with navigation, user menu
- Sidebar navigation (collapsible on mobile)
- Main content area
- Footer with version info

**Responsive Breakpoints:**
- Mobile: < 600px
- Tablet: 600px - 960px
- Desktop: > 960px

**Accessibility (WCAG 2.1 AA):**
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance
- Form validation with clear error messages

### 3.5 API Integration

**Base URL:**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api/v1'
```

**Axios Configuration:**
```javascript
// Auto-attach JWT token to requests
// Auto-refresh token on 401
// Centralized error handling
// Request/response interceptors
```

**Error Handling:**
- User-friendly error messages
- Network error detection
- Retry logic for failed requests
- Log errors for debugging

### 3.6 Testing Requirements

**Unit Tests:**
- Component logic (Redux actions, selectors)
- Utility functions
- Service layer mocking
- >80% code coverage

**Integration Tests:**
- Full page workflows
- Form submission and validation
- API integration scenarios

**Test Files Location:**
```
src/__tests__/
├── components/
├── pages/
├── store/
├── services/
└── utils/
```

---

## 4. Database Specification

### 4.1 PostgreSQL Configuration

**Version:** 14+  
**Encoding:** UTF-8  
**Locale:** C (for consistency)

### 4.2 Database Schema

#### 4.2.1 Core Tables

**users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  display_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  profile_image_url VARCHAR(255),
  theme VARCHAR(20) DEFAULT 'light',
  default_notebook_id UUID REFERENCES notebooks(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_is_active ON users(is_active);
```

**notebooks**
```sql
CREATE TABLE notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(7),
  is_archived BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notebooks_owner_id ON notebooks(owner_id);
CREATE INDEX idx_notebooks_is_archived ON notebooks(is_archived);
```

**notes**
```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id UUID NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES users(id),
  title VARCHAR(500) NOT NULL,
  content TEXT,
  excerpt VARCHAR(255),
  is_archived BOOLEAN DEFAULT false,
  is_pinned BOOLEAN DEFAULT false,
  last_edited_by_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notes_notebook_id ON notes(notebook_id);
CREATE INDEX idx_notes_owner_id ON notes(owner_id);
CREATE INDEX idx_notes_is_archived ON notes(is_archived);
CREATE INDEX idx_notes_is_pinned ON notes(is_pinned);
CREATE INDEX idx_notes_updated_at ON notes(updated_at DESC);
```

**tags**
```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  color VARCHAR(7),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(owner_id, name)
);

CREATE INDEX idx_tags_owner_id ON tags(owner_id);
```

**note_tags (Many-to-Many)**
```sql
CREATE TABLE note_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(note_id, tag_id)
);

CREATE INDEX idx_note_tags_note ON note_tags(note_id);
CREATE INDEX idx_note_tags_tag ON note_tags(tag_id);
```

**attachments**
```sql
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_size BIGINT NOT NULL,
  file_type VARCHAR(100),
  storage_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attachments_note_id ON attachments(note_id);
```

**shared_notes**
```sql
CREATE TABLE shared_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  shared_by_id UUID NOT NULL REFERENCES users(id),
  shared_with_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission VARCHAR(50) NOT NULL,
  shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  UNIQUE(note_id, shared_with_id)
);

CREATE INDEX idx_shared_notes_shared_with ON shared_notes(shared_with_id);
CREATE INDEX idx_shared_notes_note ON shared_notes(note_id);
```

**shared_notebooks**
```sql
CREATE TABLE shared_notebooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  notebook_id UUID NOT NULL REFERENCES notebooks(id) ON DELETE CASCADE,
  shared_by_id UUID NOT NULL REFERENCES users(id),
  shared_with_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  permission VARCHAR(50) NOT NULL,
  shared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  UNIQUE(notebook_id, shared_with_id)
);

CREATE INDEX idx_shared_notebooks_shared_with ON shared_notebooks(shared_with_id);
```

**note_history (Versioning)**
```sql
CREATE TABLE note_history (
  id BIGSERIAL PRIMARY KEY,
  note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
  previous_title VARCHAR(500),
  previous_content TEXT,
  changed_by_id UUID NOT NULL REFERENCES users(id),
  change_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_note_history_note_id ON note_history(note_id);
CREATE INDEX idx_note_history_created_at ON note_history(created_at);
```

**audit_logs**
```sql
CREATE TABLE audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  entity_type VARCHAR(100) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
```

### 4.3 Data Constraints & Validation

- **NOT NULL Constraints**: Applied to required fields
- **UNIQUE Constraints**: Email (employees), name (departments)
- **Foreign Keys**: Cascade deletes where appropriate
- **Check Constraints**: 
  - `hours >= 0 AND hours <= 24` in time_entries
  - `budget >= 0` in projects and departments
  - `start_date <= end_date` where applicable

### 4.4 Liquibase Migrations

**Migration Strategy:**
- One file per logical change
- Naming: `YYYY-MM-DD_HH-mm_description.yaml`
- Rollback capabilities for each migration
- Checksums to detect modifications

**Liquibase Configuration:**
```yaml
# application.yml
spring:
  liquibase:
    enabled: true
    change-log: classpath:db/changelog/db.changelog-master.yaml
    contexts: ${LIQUIBASE_CONTEXT:dev}
```

---

## 5. Infrastructure Specification

### 5.1 Docker Containerization

#### 5.1.1 Backend Dockerfile

```dockerfile
# Multi-stage build
FROM maven:3.8-openjdk-17 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

FROM openjdk:17-slim
WORKDIR /app
COPY --from=builder /app/target/folio-backend-*.jar app.jar
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
  CMD curl -f http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
```

#### 5.1.2 Frontend Dockerfile

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/health || exit 1
CMD ["nginx", "-g", "daemon off;"]
```

#### 5.1.3 Docker Compose (Local Development)

```yaml
version: '3.9'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: folio
      POSTGRES_USER: folio_user
      POSTGRES_PASSWORD: folio_password_dev
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U folio_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build: ./backend
    environment:
      SPRING_PROFILES_ACTIVE: dev
      SPRING_DATASOURCE_URL: jdbc:postgresql://postgres:5432/folio
      SPRING_DATASOURCE_USERNAME: folio_user
      SPRING_DATASOURCE_PASSWORD: folio_password_dev
      SPRING_REDIS_HOST: redis
    ports:
      - "8080:8080"
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend/src:/app/src  # Hot reload
    networks:
      - folio-network

  frontend:
    build: ./frontend
    ports:
      - "3000:80"
    environment:
      REACT_APP_API_URL: http://localhost:8080/api/v1
    depends_on:
      - backend
    networks:
      - folio-network

  prometheus:
    image: prom/prometheus:latest
    volumes:
      - ./infrastructure/prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    networks:
      - folio-network

  grafana:
    image: grafana/grafana:latest
    environment:
      GF_SECURITY_ADMIN_PASSWORD: admin
    ports:
      - "3001:3000"
    volumes:
      - ./infrastructure/grafana/provisioning:/etc/grafana/provisioning
      - grafana_data:/var/lib/grafana
    networks:
      - folio-network

  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.0.0
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - folio-network

  kibana:
    image: docker.elastic.co/kibana/kibana:8.0.0
    ports:
      - "5601:5601"
    environment:
      ELASTICSEARCH_HOSTS: http://elasticsearch:9200
    depends_on:
      - elasticsearch
    networks:
      - folio-network

  jaeger:
    image: jaegertracing/all-in-one:latest
    ports:
      - "6831:6831/udp"
      - "16686:16686"
    environment:
      COLLECTOR_ZIPKIN_HOST_PORT: :9411
    networks:
      - folio-network

volumes:
  postgres_data:
  redis_data:
  prometheus_data:
  grafana_data:
  elasticsearch_data:

networks:
  folio-network:
    driver: bridge
```

### 5.2 Terraform Specification

#### 5.2.1 AWS Infrastructure (ECS + RDS)

**Directory Structure:**
```
infrastructure/terraform/aws/
├── main.tf              # Main infrastructure
├── variables.tf         # Variable definitions
├── outputs.tf           # Output values
├── networking.tf        # VPC, subnets, security groups
├── database.tf          # RDS configuration
├── ecs.tf              # ECS cluster, services
├── alb.tf              # Application Load Balancer
├── iam.tf              # IAM roles and policies
├── terraform.tfvars    # Variable values
└── environments/
    ├── dev.tfvars
    ├── staging.tfvars
    └── prod.tfvars
```

**Key Resources:**
- **VPC**: Custom VPC with public/private subnets
- **RDS**: PostgreSQL instance with automated backups
- **ElastiCache**: Redis cluster for caching
- **ECR**: Container registry for images
- **ECS**: Fargate for containerized services
- **ALB**: Load balancer with SSL/TLS
- **CloudWatch**: Logs and monitoring
- **Secrets Manager**: For sensitive data

#### 5.2.2 Azure Infrastructure (Container Instances/App Service)

**Directory Structure:**
```
infrastructure/terraform/azure/
├── main.tf
├── variables.tf
├── outputs.tf
├── networking.tf
├── database.tf
├── container.tf
├── monitoring.tf
├── security.tf
├── terraform.tfvars
└── environments/
    ├── dev.tfvars
    ├── staging.tfvars
    └── prod.tfvars
```

**Key Resources:**
- **Resource Group**: Logical grouping
- **Virtual Network**: VNet with subnets
- **Azure Database for PostgreSQL**: Managed DB
- **Azure Cache for Redis**: Managed Redis
- **Container Registry**: ACR for images
- **App Service**: For backend and frontend
- **Application Gateway**: Load balancing and SSL
- **Key Vault**: Secrets management
- **Log Analytics**: Centralized logging

### 5.3 Container Registry

**AWS ECR:**
```bash
aws ecr create-repository --repository-name folio-backend
aws ecr create-repository --repository-name folio-frontend
```

**Azure ACR:**
```bash
az acr create --resource-group folio-rg --name folioregistry --sku Basic
```

### 5.4 Networking

**Ports:**
- Backend API: 8080 (internal), 443 (external via ALB)
- Frontend: 80 (internal), 443 (external via ALB)
- PostgreSQL: 5432 (internal only)
- Redis: 6379 (internal only)
- Prometheus: 9090 (internal)
- Grafana: 3000 (internal/VPN)
- Kibana: 5601 (internal/VPN)
- Jaeger UI: 16686 (internal/VPN)

**Security Groups:**
- ALB: Allow 80, 443 from 0.0.0.0/0
- Backend: Allow 8080 from ALB only
- Database: Allow 5432 from backend only
- Redis: Allow 6379 from backend only

---

## 6. Observability Specification

### 6.1 OpenTelemetry Overview

**Architecture:**
```
Backend (Java)        Frontend (JS)
    ↓                      ↓
OpenTelemetry SDK    OpenTelemetry SDK
    ↓                      ↓
    └─→ OTLP Exporter ←─┘
         ↓
    OpenTelemetry Collector
         ↓
    ┌────┴────┬────────┐
    ↓         ↓        ↓
 Jaeger   Prometheus  Grafana
(Traces)  (Metrics) (Visualization)
```

**Key Benefits:**
- Unified instrumentation (logs, metrics, traces)
- Vendor-agnostic (can switch backends easily)
- Automatic instrumentation available
- Better correlation between traces and logs
- Reduced operational complexity

### 6.2 OpenTelemetry Collector Configuration

**Docker Compose Service:**
```yaml
otel-collector:
  image: otel/opentelemetry-collector:latest
  command: ["--config=/etc/otel-collector-config.yml"]
  volumes:
    - ./observability/otel/collector-config.yml:/etc/otel-collector-config.yml
  ports:
    - "4317:4317"  # OTLP gRPC receiver
    - "4318:4318"  # OTLP HTTP receiver
    - "9411:9411"  # Zipkin receiver
  networks:
    - folio-network
```

**Collector Configuration:**
```yaml
# collector-config.yml
receivers:
  otlp:
    protocols:
      grpc:
        endpoint: 0.0.0.0:4317
      http:
        endpoint: 0.0.0.0:4318

processors:
  batch:
    timeout: 10s
    send_batch_size: 1024
  memory_limiter:
    check_interval: 1s
    limit_mib: 512

exporters:
  jaeger:
    endpoint: jaeger:14250
  prometheus:
    endpoint: 0.0.0.0:8888
  logging:
    loglevel: debug

service:
  pipelines:
    traces:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [jaeger, logging]
    metrics:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [prometheus, logging]
    logs:
      receivers: [otlp]
      processors: [memory_limiter, batch]
      exporters: [logging]
```

### 6.3 Backend Instrumentation (Spring Boot)

**Dependencies:**
```xml
<dependency>
  <groupId>io.opentelemetry</groupId>
  <artifactId>opentelemetry-api</artifactId>
</dependency>
<dependency>
  <groupId>io.opentelemetry</groupId>
  <artifactId>opentelemetry-sdk</artifactId>
</dependency>
<dependency>
  <groupId>io.opentelemetry</groupId>
  <artifactId>opentelemetry-exporter-otlp</artifactId>
</dependency>
<dependency>
  <groupId>io.opentelemetry.instrumentation</groupId>
  <artifactId>opentelemetry-instrumentation-bom</artifactId>
  <version>1.25.0</version>
  <type>pom</type>
  <scope>import</scope>
</dependency>
```

**Maven Plugin for Automatic Instrumentation:**
```xml
<plugin>
  <groupId>io.opentelemetry.instrumentation</groupId>
  <artifactId>opentelemetry-instrumentation-maven-plugin</artifactId>
  <version>1.25.0</version>
  <executions>
    <execution>
      <goals>
        <goal>instrument</goal>
      </goals>
    </execution>
  </executions>
</plugin>
```

**Or Java Agent (Dockerfile):**
```dockerfile
FROM openjdk:17-slim
WORKDIR /app

# Download OpenTelemetry Java Agent
RUN wget https://github.com/open-telemetry/opentelemetry-java-instrumentation/releases/latest/download/opentelemetry-javaagent.jar

COPY --from=builder /app/target/folio-backend-*.jar app.jar

ENTRYPOINT ["java", \
  "-javaagent:./opentelemetry-javaagent.jar", \
  "-Dotel.exporter.otlp.endpoint=http://otel-collector:4317", \
  "-Dotel.service.name=folio-backend", \
  "-jar", "app.jar"]
```

**Custom Instrumentation:**
```java
@Component
public class NoteService {
  private static final Tracer tracer = GlobalOpenTelemetry.getTracer("folio-backend");

  public Note createNote(CreateNoteRequest request) {
    Span span = tracer.spanBuilder("createNote")
      .setAttribute("note.title", request.getTitle())
      .setAttribute("notebook.id", request.getNotebookId())
      .startSpan();
    
    try (Scope scope = span.makeCurrent()) {
      // Business logic
      return noteRepository.save(note);
    } finally {
      span.end();
    }
  }
}
```

### 6.4 Frontend Instrumentation (React + TypeScript)

**Installation:**
```bash
npm install @opentelemetry/sdk-web @opentelemetry/api @opentelemetry/exporter-trace-otlp-http @opentelemetry/instrumentation-document-load @opentelemetry/instrumentation-user-interaction @opentelemetry/instrumentation-fetch
```

**Tracing Setup (instrumentation/tracing.ts):**
```typescript
import { getWebAutoInstrumentations } from "@opentelemetry/auto-instrumentations-web";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { Resource } from "@opentelemetry/resources";
import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-web";
import { WebTracerProvider } from "@opentelemetry/sdk-trace-web";
import { registerInstrumentations } from "@opentelemetry/instrumentation";

const resource = Resource.default().merge(
  new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: "folio-frontend",
  })
);

const provider = new WebTracerProvider({ resource });
const exporter = new OTLPTraceExporter({
  url: "http://localhost:4318/v1/traces",
});

provider.addSpanProcessor(new BatchSpanProcessor(exporter));
provider.register();

registerInstrumentations({
  instrumentations: getWebAutoInstrumentations(),
});

export const tracer = provider.getTracer("folio-frontend");
```

**Using Tracer in Components:**
```typescript
import { tracer } from '../instrumentation/tracing';

export const NoteEditor: React.FC = () => {
  const handleSave = () => {
    const span = tracer.startSpan("saveNote");
    try {
      // Save logic
    } finally {
      span.end();
    }
  };
};
```

### 6.5 Metrics (Prometheus)

**Custom Metrics (Backend):**
```java
@Component
public class MetricsService {
  private final MeterRegistry meterRegistry;
  
  public MetricsService(MeterRegistry meterRegistry) {
    this.meterRegistry = meterRegistry;
    
    // Register custom metrics
    Gauge.builder("folio.notes.active", this::getActiveNotesCount)
      .register(meterRegistry);
      
    Counter.builder("folio.notes.created.total")
      .register(meterRegistry);
  }
}
```

**Prometheus Configuration:**
```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'folio-backend'
    static_configs:
      - targets: ['backend:8080']
    metrics_path: '/actuator/prometheus'
```

**Key Metrics:**
- `otel_traces_received_total`: Trace spans received
- `otel_metrics_received_total`: Metrics received
- `http_server_request_duration_seconds`: API latency
- `process_runtime_go_goroutines`: JVM thread count
- `folio_notes_active`: Active notes in system
- `folio_notebooks_active`: Active notebooks
- `folio_searches_total`: Total searches performed

### 6.6 Tracing (Jaeger)

**Docker Service:**
```yaml
jaeger:
  image: jaegertracing/all-in-one:latest
  ports:
    - "16686:16686"  # Web UI
    - "14250:14250"  # Collector gRPC
  environment:
    COLLECTOR_OTLP_ENABLED: "true"
    COLLECTOR_OTLP_HOST_PORT: "0.0.0.0:4317"
```

**Sampling Strategy:**
- Probabilistic sampler: 10% sampling (configurable per environment)
- Development: 100% sampling for complete visibility
- Production: 5-10% sampling to balance observability vs. cost

**Trace Analysis:**
- Identify slow API endpoints
- Detect database query bottlenecks
- Trace distributed requests across services
- Analyze error patterns and stack traces
      .registerInjector(Format.Builtin.TEXT_MAP, new TextMapInjector())
      .build();
  }
}
```

**Frontend (React):**
- Use `@opentelemetry/web` package
- Instrument HTTP requests
- Send traces to Jaeger collector

#### 6.3.3 Traces to Collect

- HTTP request from frontend
- Backend API processing
- Database query execution
- External service calls
- Cache lookups

---

## 7. Security Specification

### 7.1 Authentication & Authorization

#### 7.1.1 Local Development
- Username/password authentication
- In-memory user store
- 8-hour session timeout

#### 7.1.2 Production
- OAuth2 / OIDC (e.g., with Azure AD or Auth0)
- JWT tokens with RS256 signing
- Token expiration: 1 hour
- Refresh token expiration: 7 days
- Refresh token rotation

#### 7.1.3 RBAC Model

**Roles:**
- ROLE_ADMIN: Full system access
- ROLE_MANAGER: Manage department/projects
- ROLE_USER: Self-service + team access
- ROLE_VIEWER: Read-only access

**Permissions Matrix:**
```
Resource          | ADMIN | MANAGER | USER | VIEWER
Employees         | CRUD  | R       | R    | R
Departments       | CRUD  | R/U     | R    | R
Projects          | CRUD  | CRUD    | R    | R
Time Entries      | CRUD  | R       | CRU  | R
Reports           | R     | R       | R    | R
System Settings   | RU    | -       | -    | -
```

### 7.2 Data Protection

**Encryption in Transit:**
- HTTPS/TLS 1.3
- Certificate management via Terraform
- HSTS headers enabled

**Encryption at Rest:**
- RDS encryption enabled
- S3 bucket encryption
- Secrets in AWS Secrets Manager / Azure Key Vault

**Sensitive Data:**
- Passwords: bcrypt hashing
- API Keys: Encrypted in vault
- Database credentials: External secrets
- JWT secrets: Secure random generation

### 7.3 Secrets Management

**Local Development:**
- `.env` file (git-ignored)
- Environment variables

**AWS Production:**
- AWS Secrets Manager
- Terraform rotates secrets
- IAM policies restrict access

**Azure Production:**
- Azure Key Vault
- Managed identity authentication
- Azure Policy enforcement

**Secrets Rotation:**
- Backend: 90 days
- Database: 90 days
- API Keys: 180 days

### 7.4 Compliance & Auditing

**Audit Logging:**
```sql
-- All changes logged to audit_logs table
-- Captures user, entity, action, old/new values, timestamp
```

**Data Retention:**
- Audit logs: 2 years
- Application logs: 90 days
- Metrics: 30 days

---

## 8. API Contracts

### 8.1 RESTful API Principles

- **Versioning**: `/api/v1/` in URL path
- **Content-Type**: `application/json`
- **Authentication**: Bearer token in `Authorization` header
- **Rate Limiting**: 100 requests/minute per user
- **Pagination**: Limit (default 20, max 100), offset

### 8.2 Standard Response Format

**Success (200, 201):**
```json
{
  "status": "success",
  "data": {...},
  "timestamp": "2026-06-22T10:30:45Z"
}
```

**Error (4xx, 5xx):**
```json
{
  "status": "error",
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [
      {"field": "email", "message": "Invalid email format"}
    ]
  },
  "timestamp": "2026-06-22T10:30:45Z",
  "traceId": "abc-123-def"
}
```

### 8.3 Pagination

**Request:**
```
GET /api/v1/employees?page=1&pageSize=20&sort=name,asc
```

**Response:**
```json
{
  "status": "success",
  "data": [...],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 8.4 Filtering

**Supported Operations:**
- Equality: `?department=sales`
- Comparison: `?salary__gte=50000`
- Text search: `?search=john`
- Multiple: `?department=sales&status=active`

---

## 9. Deployment Specification

### 9.1 Deployment Checklist

- [ ] Code reviewed and merged to main
- [ ] All tests passing (unit, integration)
- [ ] Docker images built and pushed
- [ ] Terraform plan reviewed
- [ ] Secrets rotated
- [ ] Database migrations tested
- [ ] Backup created
- [ ] Monitoring alerts configured
- [ ] Runbook prepared
- [ ] Stakeholders notified

### 9.2 Deployment Steps (AWS)

1. Build and push Docker images to ECR
2. Run Terraform plan
3. Review infrastructure changes
4. Apply Terraform
5. Trigger ECS service update
6. Monitor CloudWatch for errors
7. Run smoke tests
8. Verify monitoring dashboards

### 9.3 Rollback Procedure

1. Identify issue in current deployment
2. Revert to previous Docker image tag
3. Trigger ECS service update
4. Monitor error rates return to normal
5. Post-incident review

---

## 10. Non-Functional Requirements

| Requirement | Target | Justification |
|---|---|---|
| **Performance** | | |
| API p99 latency | < 500ms | User experience |
| Page load time | < 2s | UX standard |
| Database query time | < 100ms | API performance |
| **Availability** | | |
| Uptime (prod) | 99.5% | Business requirement |
| RTO (Recovery Time) | 30 min | Disaster recovery |
| RPO (Recovery Point) | 1 hour | Data loss tolerance |
| **Scalability** | | |
| Concurrent users (local) | 100 | Dev environment |
| Concurrent users (prod) | 10,000 | Production scale |
| Data retention | 2 years (audit) | Compliance |
| **Security** | | |
| OWASP Top 10 | All addressed | Security standard |
| Vulnerability scan | Weekly | Compliance |
| Penetration test | Quarterly | Security assurance |
| **Cost** | | |
| AWS monthly | < $500 | Budget limit |
| Azure monthly | < $500 | Budget limit |

---

## 11. Glossary

- **IaC**: Infrastructure as Code
- **RBAC**: Role-Based Access Control
- **JWT**: JSON Web Tokens
- **OAuth2**: Open Authorization 2.0
- **RTO**: Recovery Time Objective
- **RPO**: Recovery Point Objective
- **ECS**: Amazon Elastic Container Service
- **RDS**: Amazon Relational Database Service
- **ECR**: Amazon Elastic Container Registry
- **ACR**: Azure Container Registry

---

## Next Steps

1. Review and approve this specification
2. Set up repository structure
3. Create CI/CD pipelines in Jenkins
4. Begin Phase 1 implementation
5. Schedule weekly progress reviews

