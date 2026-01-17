# Assistant 360

A Next.js SaaS platform built with TypeScript, Tailwind CSS, and shadcn/ui.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (LTS version recommended - v18.x or v20.x)
- **npm** or **yarn** or **pnpm**

## Supabase Setup

1. **Create a Supabase project**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Wait for the project to finish provisioning

2. **Get your project credentials**
   - In your Supabase project dashboard, go to Settings → API
   - Copy your **Project URL** (looks like `https://xxxxx.supabase.co`)
   - Copy your **anon/public** key (found in the "Project API keys" section)

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

> **Note:** Authentication and database tables will be set up in later stages. Right now, we're just connecting to Supabase.

## Local Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
assistant-360/
├── src/
│   ├── app/              # Next.js App Router pages
│   ├── components/       # React components
│   │   └── ui/          # shadcn/ui components
│   └── lib/             # Utility functions
└── public/              # Static assets
```

## Tech Stack

- **Next.js 14+** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Re-usable component library
- **Supabase** - Database and authentication
- **Zod** - Schema validation (installed, ready for use)

## Deployment

This project is configured for deployment on **Vercel**:

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Import your repository on [Vercel](https://vercel.com)
3. Add your environment variables in the Vercel dashboard
4. Deploy!

The project will automatically build and deploy on every push to your main branch.
# assistant-360
