# File Manager

A full-stack file management application built with Turborepo, featuring a Next.js frontend and FastAPI backend.

## What's inside?

This Turborepo includes the following packages/apps:

### Apps and Packages

- `web`: Next.js application with Supabase auth and file upload UI
- `api`: FastAPI backend with SQLModel ORM and PostgreSQL database
- `docs`: Documentation site (Next.js)
- `@repo/ui`: React component library shared across applications
- `@repo/eslint-config`: `eslint` configurations (includes `eslint-config-next` and `eslint-config-prettier`)
- `@repo/typescript-config`: `tsconfig.json`s used throughout the monorepo

Each package/app is 100% [TypeScript](https://www.typescriptlang.org/) (except the Python backend).

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- Python 3.13+
- [Supabase](https://supabase.com) account with a PostgreSQL database
- [uv](https://github.com/astral-sh/uv) Python package manager

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd file-manager
   ```

2. **Install dependencies**
   ```bash
   # Install Node.js dependencies
   npm install
   # or
   yarn install
   ```

3. **Configure Supabase**
   - Create a new project on [Supabase](https://supabase.com)
   - Get your database connection string from Settings > Database
   - Create a storage bucket (e.g., "files")

4. **Setup API**
   ```bash
   cd apps/api
   cp .env.example .env
   # Edit .env and add your DATABASE_URL from Supabase
   uv sync
   ```

5. **Setup Web App**
   ```bash
   cd apps/web
   # Create a .env.local file with:
   # NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   # NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_key
   # NEXT_PUBLIC_SUPABASE_BUCKET_NAME=files
   # NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

6. **Run the development servers**
   ```bash
   # From the root directory
   npm run dev
   # or
   yarn dev
   ```
   
   This will start:
   - Frontend on `http://localhost:3000`
   - API on `http://localhost:8000`

## Features

- ✅ User authentication with Supabase Auth
- ✅ File upload to Supabase Storage
- ✅ File metadata CRUD operations via FastAPI
- ✅ SQLModel ORM with PostgreSQL
- ✅ Type-safe API with FastAPI
- ✅ Modern UI with Next.js and Tailwind CSS

### Utilities

This Turborepo has some additional tools already setup for you:

- [TypeScript](https://www.typescriptlang.org/) for static type checking
- [ESLint](https://eslint.org/) for code linting
- [Prettier](https://prettier.io) for code formatting

### Build

To build all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build
yarn dlx turbo build
pnpm exec turbo build
```

You can build a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo build --filter=docs

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo build --filter=docs
yarn exec turbo build --filter=docs
pnpm exec turbo build --filter=docs
```

### Develop

To develop all apps and packages, run the following command:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev
yarn exec turbo dev
pnpm exec turbo dev
```

You can develop a specific package by using a [filter](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters):

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo dev --filter=web

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo dev --filter=web
yarn exec turbo dev --filter=web
pnpm exec turbo dev --filter=web
```

### Remote Caching

> [!TIP]
> Vercel Remote Cache is free for all plans. Get started today at [vercel.com](https://vercel.com/signup?/signup?utm_source=remote-cache-sdk&utm_campaign=free_remote_cache).

Turborepo can use a technique known as [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching) to share cache artifacts across machines, enabling you to share build caches with your team and CI/CD pipelines.

By default, Turborepo will cache locally. To enable Remote Caching you will need an account with Vercel. If you don't have an account you can [create one](https://vercel.com/signup?utm_source=turborepo-examples), then enter the following commands:

```
cd my-turborepo

# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo login

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo login
yarn exec turbo login
pnpm exec turbo login
```

This will authenticate the Turborepo CLI with your [Vercel account](https://vercel.com/docs/concepts/personal-accounts/overview).

Next, you can link your Turborepo to your Remote Cache by running the following command from the root of your Turborepo:

```
# With [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation) installed (recommended)
turbo link

# Without [global `turbo`](https://turborepo.com/docs/getting-started/installation#global-installation), use your package manager
npx turbo link
yarn exec turbo link
pnpm exec turbo link
```

## Useful Links

Learn more about the power of Turborepo:

- [Tasks](https://turborepo.com/docs/crafting-your-repository/running-tasks)
- [Caching](https://turborepo.com/docs/crafting-your-repository/caching)
- [Remote Caching](https://turborepo.com/docs/core-concepts/remote-caching)
- [Filtering](https://turborepo.com/docs/crafting-your-repository/running-tasks#using-filters)
- [Configuration Options](https://turborepo.com/docs/reference/configuration)
- [CLI Usage](https://turborepo.com/docs/reference/command-line-reference)
