# File Manager API

FastAPI-based REST API for file management using SQLModel ORM with PostgreSQL (Supabase).

## Setup

1. Install dependencies:
```bash
cd apps/api
uv sync
```

2. Configure environment variables:
```bash
cp .env.example .env
```

Edit `.env` and set your `DATABASE_URL` from Supabase:
- Go to your Supabase project settings
- Navigate to Database > Connection string
- Copy the connection string and set it as `DATABASE_URL`

Example format:
```
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
```

3. Run the API:
```bash
npm run dev
# or
python main.py
```

## API Endpoints

### Health Check
- `GET /` - API status
- `GET /healthz` - Health check endpoint

### Files CRUD
- `POST /api/files/` - Create a new file record
- `GET /api/files/` - Get all files (supports `?owner_id=`, `?page=`, `?page_size=`, `?sort_by=`, `?sort_order=`)
- `GET /api/files/{file_id}` - Get a single file by ID (UUID)
- `PUT /api/files/{file_id}` - Update a file record (UUID)
- `DELETE /api/files/{file_id}` - Delete a file record (UUID)
- `GET /api/files/{file_id}/download` - Generate a signed download URL (UUID)

## Example Usage

### Create File
```bash
curl -X POST http://localhost:8000/api/files/ \
  -H "Content-Type: application/json" \
  -d '{
    "storage_path": "files/123-abc.jpg",
    "name": "photo.jpg",
    "size": 1024.0,
    "mime_type": "image/jpeg",
    "owner_id": "123e4567-e89b-12d3-a456-426614174000"
  }'
```

### Get All Files

Get first page (default: page=1, page_size=10):
```bash
curl http://localhost:8000/api/files/
```

Get second page with 20 items per page:
```bash
curl "http://localhost:8000/api/files/?page=2&page_size=20"
```

### Get Files by Owner
```bash
curl "http://localhost:8000/api/files/?owner_id=123e4567-e89b-12d3-a456-426614174000"
```

### Pagination Response Format

The API returns a paginated response with the following structure:
```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "page_size": 10
}
```

Where:
- `data`: Array of file records
- `total`: Total number of files matching the query (before pagination)
- `page`: Current page number (1-indexed)
- `page_size`: Number of items per page

### Get Files with Sorting

#### Single Field Sorting

Sort by creation date (descending - newest first) - default:
```bash
curl "http://localhost:8000/api/files/"
```

Sort by file name (ascending - alphabetical):
```bash
curl "http://localhost:8000/api/files/?sort_by=name&sort_order=asc"
```

Sort by creation date (ascending - oldest first):
```bash
curl "http://localhost:8000/api/files/?sort_by=created_at&sort_order=asc"
```

#### Multi-Field Sorting

You can sort by multiple fields by repeating the query parameters:

Sort by name first (ascending), then by created_at (descending):
```bash
curl "http://localhost:8000/api/files/?sort_by=name&sort_by=created_at&sort_order=asc&sort_order=desc"
```

Or just specify sort_by fields, order will default to DESC for unspecified orders:
```bash
curl "http://localhost:8000/api/files/?sort_by=name&sort_by=created_at"
```

#### Combined with Filtering and Pagination

```bash
curl "http://localhost:8000/api/files/?owner_id=123e4567-e89b-12d3-a456-426614174000&sort_by=name&sort_by=created_at&sort_order=asc&sort_order=desc&page=1&page_size=20"
```

**Available query parameters:**
- `page`: Page number (1-indexed, default: 1, min: 1)
- `page_size`: Items per page (default: 10, min: 1, max: 100)
- `owner_id`: Filter by owner UUID
- `sort_by`: Can specify multiple values: `created_at` or `name`
- `sort_order`: Can specify multiple values: `asc` or `desc`
  - If fewer `sort_order` values than `sort_by` values, remaining fields default to `desc`
  - If more `sort_order` values, extra ones are ignored
- Default: If no sorting specified, sorts by `created_at` DESC

### Get Single File
```bash
curl http://localhost:8000/api/files/123e4567-e89b-12d3-a456-426614174000
```

### Update File
```bash
curl -X PUT http://localhost:8000/api/files/123e4567-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -d '{
    "name": "renamed.jpg",
    "size": 2048.0
  }'
```

### Delete File
```bash
curl -X DELETE http://localhost:8000/api/files/123e4567-e89b-12d3-a456-426614174000
```

### Download File (Get Signed URL)
```bash
curl http://localhost:8000/api/files/123e4567-e89b-12d3-a456-426614174000/download
```

This returns a signed URL that expires in 1 hour:
```json
{
  "signed_url": "https://[project].supabase.co/storage/v1/object/sign/...",
  "filename": "photo.jpg"
}
```

## Configuration

The API uses Pydantic Settings for configuration management. All settings are defined in `settings.py` and can be configured via environment variables in a `.env` file.

### Available Settings

| Setting | Required | Default | Description |
|---------|----------|---------|-------------|
| `DATABASE_URL` | Yes | - | PostgreSQL connection string |
| `API_HOST` | No | `0.0.0.0` | Host to bind the API server |
| `API_PORT` | No | `8000` | Port to bind the API server |
| `API_RELOAD` | No | `True` | Enable auto-reload during development |
| `CORS_ORIGINS` | No | `["http://localhost:3000", "http://localhost:3001"]` | List of allowed origins |
| `SUPABASE_URL` | No | - | Supabase project URL (required for download feature) |
| `SUPABASE_SERVICE_ROLE_KEY` | No | - | Supabase service role key (required for download feature) |
| `SUPABASE_BUCKET_NAME` | No | `files` | Storage bucket name |

### Example .env File

```env
# Required
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Optional - API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# Optional - Supabase Configuration (required for file download feature)
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_BUCKET_NAME=files
```

## Database

The API uses SQLModel ORM with PostgreSQL. Tables are automatically created on startup via `init_db()`.

### File Model
- `id`: Primary key (UUID, auto-generated)
- `storage_path`: Path to file in Supabase Storage (optional)
- `name`: Original file name (required)
- `size`: File size in bytes (optional, float)
- `mime_type`: MIME type of the file (optional)
- `owner_id`: UUID of the user who uploaded the file (optional)
- `created_at`: Timestamp when created (auto-generated)

## Documentation

Interactive API documentation available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

