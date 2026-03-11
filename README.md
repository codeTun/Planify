# Planify - Project Management Platform

A modern, full-stack project management application built with Next.js, Prisma, PostgreSQL, and TypeScript. Planify helps teams collaborate, track progress, and deliver projects on time.

## Features

- 🔐 **Secure Authentication** - JWT-based authentication with password hashing
- 📊 **Project Management** - Create, manage, and organize projects
- ✅ **Task Tracking** - Assign tasks, set priorities, track status, and manage deadlines
- 👥 **Team Collaboration** - Add team members and collaborate on projects
- 🎨 **Modern UI/UX** - Beautiful, responsive design with Tailwind CSS
- ⚡ **Performance Optimized** - Uses useCallback, useMemo, and SSR for optimal performance
- 🏗️ **Clean Architecture** - Organized API consumption layer with `/lib/models` structure

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Package Manager**: pnpm

## Prerequisites

- Node.js 18+ installed
- PostgreSQL database running
- pnpm installed (`npm install -g pnpm`)

## Setup Instructions

1. **Clone the repository** (if applicable) or navigate to the project directory

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/planify?schema=public"
   JWT_SECRET="your-super-secret-jwt-key-change-in-production"
   NEXT_PUBLIC_API_URL="/api"
   ```

4. **Set up the database**
   
   Generate Prisma Client:
   ```bash
   pnpm prisma:generate
   ```
   
   Push the schema to your database:
   ```bash
   pnpm prisma:push
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
planify/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── projects/      # Project endpoints
│   │   └── tasks/         # Task endpoints
│   ├── dashboard/         # Dashboard pages
│   ├── login/             # Login page
│   └── signup/            # Signup page
├── components/            # React components
│   ├── DashboardContent.tsx
│   ├── ProjectCard.tsx
│   ├── TaskCard.tsx
│   └── ...
├── lib/
│   ├── models/            # API consumption layer
│   │   ├── geters/        # GET operations
│   │   ├── posters/       # POST operations
│   │   ├── puters/        # PUT operations
│   │   └── deleters/      # DELETE operations
│   ├── auth.ts            # Authentication utilities
│   ├── prisma.ts          # Prisma client
│   └── utils.ts           # Utility functions
├── prisma/
│   └── schema.prisma      # Database schema
└── middleware.ts          # Next.js middleware for route protection
```

## Database Schema

The application uses the following main models:

- **User** - User accounts with email and password
- **Project** - Projects owned by users
- **Task** - Tasks belonging to projects
- **ProjectMember** - Many-to-many relationship between users and projects

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create a new account
- `POST /api/auth/login` - Login to account
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Projects
- `GET /api/projects` - Get all projects (user has access to)
- `GET /api/projects/my-projects` - Get user's owned projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create a new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project
- `POST /api/projects/members` - Add member to project
- `DELETE /api/projects/:id/members/:userId` - Remove member from project

### Tasks
- `GET /api/tasks` - Get all tasks (optionally filtered by projectId)
- `GET /api/tasks/my-tasks` - Get user's assigned tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create a new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

## Usage

1. **Sign Up**: Create a new account on the signup page
2. **Login**: Sign in with your credentials
3. **Create Projects**: Click "New Project" to create your first project
4. **Add Tasks**: Create tasks within your projects
5. **Manage Team**: Add team members to collaborate on projects
6. **Track Progress**: Update task statuses and monitor progress

## Performance Optimizations

- Server-side rendering (SSR) for initial page loads
- `useCallback` hooks for memoized event handlers
- `useMemo` hooks for computed values
- Data fetching at the page level and passing via props
- Optimized API consumption layer

## Development

- Run linting: `pnpm lint`
- Generate Prisma Client: `pnpm prisma:generate`
- Push schema changes: `pnpm prisma:push`
- View Prisma Studio: `pnpm prisma studio`

## License

This project is created for academic purposes (PFA - Projet de Fin d'Année).

## Author

Iheb Elazheri - 2ème CCV
