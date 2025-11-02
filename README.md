# File Manager

A full-stack file management application built with Turborepo, featuring a Next.js frontend and FastAPI backend.

## Setup & Local Run Instructions

### Prerequisites

- Node.js (v22 or higher)
- Python 3.13+
- [Supabase](https://supabase.com) account with a PostgreSQL database
- [uv](https://github.com/astral-sh/uv) Python package manager (`brew install astral-sh/tap/uv` or `pip install uv`)

### Step 1: Clone and Install Dependencies

```bash
git clone git@github.com:yingtung/file-manager.git
cd file-manager

# Install Node.js dependencies
npm install
# or
yarn install
```

### Step 2: Set Up Supabase

1. Create a new project on [Supabase](https://supabase.com) and wait for provisioning
2. Get your database connection string from Settings > Database (URI format)
3. Create a storage bucket named `files` (or your preferred name) in Storage settings
4. Get your API credentials from Settings > API:
   - Project URL
   - `anon` public key (for frontend)
   - `service_role` key (for backend)

### Step 3: Configure Backend API

```bash
cd apps/api
cp .env.example .env
```

Edit `.env` and add:
```env
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres
SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
SUPABASE_SERVICE_ROLE_KEY=[YOUR_SERVICE_ROLE_KEY]
SUPABASE_BUCKET_NAME=files
```

Install Python dependencies:
```bash
uv sync
```

### Step 4: Configure Frontend

```bash
cd ../web
```

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[YOUR_ANON_KEY]
NEXT_PUBLIC_SUPABASE_BUCKET_NAME=files
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Step 5: Run Development Servers

From the project root:
```bash
npm run dev
# or
yarn dev
```

This starts:
- Frontend: `http://localhost:3000`
- API: `http://localhost:8000` (API docs at `http://localhost:8000/docs`)

### Step 6: Test the Application

1. Visit `http://localhost:3000`
2. Sign up for a new account
3. Confirm your email (check Supabase dashboard or email inbox)
4. Log in and upload files

## Architecture and Design Decisions

### Monorepo Structure (Turborepo)

The project uses **Turborepo** for managing a monorepo containing:
- **Frontend (`apps/web`)**: Next.js application with React Server Components
- **Backend (`apps/api`)**: FastAPI Python application
- **Shared packages**: TypeScript configs, ESLint configs, and UI components



### Frontend Architecture

**Next.js with App Router**:
- Uses React Server Components for initial rendering
- Client components for interactive features (file upload, table sorting)
- Server-side Supabase client for secure authentication checks
- Client-side Supabase client for user-initiated actions

**State Management**:
- Local React state for UI components
- TanStack Table for table state (sorting, pagination)
- No global state management (kept simple for MVP)

**Rationale**: Next.js App Router provides modern React patterns with built-in optimizations. Local state management is sufficient for current feature set.

### Backend Architecture

**FastAPI with SQLModel**:
- **SQLModel**: Combines SQLAlchemy ORM with Pydantic validation
- **Dependency Injection**: Authentication, database sessions, and pagination via FastAPI dependencies
- **RESTful API**: Clear separation of concerns with route handlers

**Authentication Flow**:
1. Frontend authenticates users via Supabase Auth (handles JWT generation)
2. Frontend includes JWT access token in `Authorization: Bearer <token>` header
3. Backend validates token via Supabase client's `auth.get_user()` method
4. Backend extracts user ID from validated token for authorization

**Rationale**: Leverages Supabase's battle-tested authentication while keeping business logic in the backend.

### Data Layer

**PostgreSQL (Supabase)**:
- File metadata stored in PostgreSQL
- Actual files stored in Supabase Storage (object storage)
- Database stores references to storage paths

**Rationale**: Separates metadata queries (SQL) from file storage (object storage), enabling efficient queries while handling large files appropriately.

### Design Patterns

1. **Service Layer Pattern**: `SupabaseService` singleton manages Supabase client lifecycle
2. **Dependency Injection**: FastAPI dependencies for cross-cutting concerns (auth, DB sessions)
3. **Schema Separation**: SQLModel/Pydantic schemas for validation (`FileCreate`, `FileRead`, `FileUpdate`)
4. **Repository-like Pattern**: Database operations encapsulated in route handlers (could be extracted to repositories for larger scale)

## Trade-offs and Known Limitations

### Current Limitations

1. **No Authorization Checks**: The API validates authentication but doesn't verify users can only access/modify their own files. The `owner_id` field exists but isn't enforced in update/delete operations.

2. **Storage Path Synchronization**: If a file is deleted from Supabase Storage directly (outside the API), the database record remains, creating orphaned records.

3. **Basic Error Handling**: Error messages may expose internal details that should be sanitized in production.

4. **Signed URL Expiration**: Download links expire after 1 hour (hardcoded); no configurable expiration or refresh mechanism.


### Trade-offs Made

1. **Supabase for Both Auth and Storage**: 
   - ✅ Pros: Unified platform, managed infrastructure, built-in auth
   - ❌ Cons: Vendor lock-in, potential cost scaling

2. **Monorepo vs. Separate Repos**:
   - ✅ Pros: Shared code, unified tooling, atomic commits
   - ❌ Cons: More complex initial setup, larger repository

3. **Python Backend vs. TypeScript/Node.js**:
   - ✅ Pros: FastAPI performance, strong typing with Pydantic, mature ecosystem
   - ❌ Cons: Two language ecosystems, requires Python knowledge

4. **Client-Side File Upload Directly to Supabase**:
   - ✅ Pros: Reduces backend load, faster uploads, better scalability
   - ❌ Cons: Less control over validation, requires careful security policies

## Future Improvements

- Add authorization checks in API endpoints (users can only modify their own files)
- File preview capabilities (images, PDFs, videos)
- File search functionality (full-text search on filenames/metadata)
- Version history for file updates
- Add database connection pooling optimization
- Add CI/CD pipeline with automated deployments
- Improve error logging and monitoring (Sentry, structured logging)
- Add database migrations management (Alembic setup)
- Add event-driven architecture for file processing workflows
