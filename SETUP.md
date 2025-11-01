# Setup Guide

This guide will help you set up the File Manager application with Supabase and PostgreSQL.

## Prerequisites

- Node.js 18+
- Python 3.13+
- uv package manager (`brew install astral-sh/tap/uv` or `pip install uv`)
- A Supabase account (free tier works)

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to be provisioned
3. Go to Settings > Database and copy the connection string (URI)
4. In the same settings, you'll see connection pooler info if needed

## Step 2: Create Storage Bucket

1. In your Supabase dashboard, go to Storage
2. Click "Create a new bucket"
3. Name it `files` (or your preferred name)
4. Make it PUBLIC (or configure policies as needed)

## Step 3: Configure API Backend

1. Navigate to the API directory:
   ```bash
   cd apps/api
   ```

2. Copy the environment template:
   ```bash
   cp .env.example .env
   ```

3. Edit `.env` and add your Supabase database connection string:
   ```
   DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_REF].supabase.co:5432/postgres
   ```

   Replace:
   - `[YOUR_PASSWORD]` with your database password
   - `[YOUR_PROJECT_REF]` with your Supabase project reference

4. Install dependencies:
   ```bash
   uv sync
   ```

5. Test the API:
   ```bash
   uv run python main.py
   # or
   npm run dev
   ```

   The API should start on `http://localhost:8000`

6. Visit http://localhost:8000/docs to see the interactive API documentation

## Step 4: Configure Web App

1. Navigate to the web app directory:
   ```bash
   cd ../web
   ```

2. Create `.env.local` file:
   ```bash
   cat > .env.local << 'EOF'
   NEXT_PUBLIC_SUPABASE_URL=https://[YOUR_PROJECT_REF].supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=[YOUR_PUBLISHABLE_KEY]
   NEXT_PUBLIC_SUPABASE_BUCKET_NAME=files
   NEXT_PUBLIC_API_URL=http://localhost:8000
   EOF
   ```

   Get these values from:
   - Supabase Dashboard > Settings > API
   - Use the "Project URL" for NEXT_PUBLIC_SUPABASE_URL
   - Use the "anon public" key for NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

3. Install dependencies (if not done already):
   ```bash
   # From project root
   npm install
   # or
   yarn install
   ```

4. Start the web app:
   ```bash
   npm run dev
   ```

   The app should start on `http://localhost:3000`

## Step 5: Test the Application

1. Visit http://localhost:3000
2. Sign up for a new account
3. You should receive a confirmation email
4. After confirming, log in
5. Try uploading a file

## Troubleshooting

### Database Connection Issues

If you get database connection errors:

1. Check your `DATABASE_URL` in `apps/api/.env`
2. Make sure your Supabase project is active
3. Check if you need to whitelist your IP in Supabase settings

### CORS Errors

If you see CORS errors when uploading files:

1. Check that the API is running on port 8000
2. Update `apps/api/main.py` CORS origins if your frontend runs on a different port

### File Upload Errors

If file upload fails:

1. Verify your storage bucket exists in Supabase
2. Check bucket permissions (should be PUBLIC for testing)
3. Verify `NEXT_PUBLIC_SUPABASE_BUCKET_NAME` matches your bucket name

## Next Steps

- Read the API documentation at http://localhost:8000/docs
- Explore the codebase structure
- Customize the file model in `apps/api/models.py`
- Add authentication/authorization to the API endpoints

## Need Help?

- Check the API README: `apps/api/README.md`
- Check the Web README: `apps/web/README.md`
- Review Supabase docs: https://supabase.com/docs

