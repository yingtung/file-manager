# File Manager Web App

Next.js frontend for the file management application, featuring authentication and file upload capabilities.

## Features

- 🔐 User authentication with Supabase Auth
- 📤 File upload to Supabase Storage
- 📋 File metadata management via FastAPI
- 🎨 Modern UI with Tailwind CSS and shadcn/ui components
- ⚡ Server-side rendering with Next.js App Router

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Supabase project configured
- FastAPI backend running

### Setup

1. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

2. Create `.env.local` file:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
   NEXT_PUBLIC_SUPABASE_BUCKET_NAME=files
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
app/
  ├── auth/           # Supabase auth callbacks
  ├── login/          # Login page
  ├── signup/         # Signup page
  ├── private/        # Protected routes
  └── error/          # Error pages

components/
  ├── FileUploader.tsx    # File upload component
  ├── alert.tsx           # Alert component
  └── ui/                 # shadcn/ui components

utils/
  ├── supabase/       # Supabase client setup
  ├── errors.ts       # Error handling utilities
  └── ...
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable key |
| `NEXT_PUBLIC_SUPABASE_BUCKET_NAME` | Storage bucket name for files |
| `NEXT_PUBLIC_API_URL` | FastAPI backend URL |

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
