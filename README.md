# Planify - Project Management Platform

A simple, modern project management app built with Next.js, PostgreSQL, Redis, and Kubernetes.

## ✨ Features

- 🎯 Project & task management with Kanban boards
- 👥 Team collaboration
- 🎨 Modern UI with animations
- ⚡ Redis caching for performance
- 🚀 Auto-scaling Kubernetes deployment
- 🔄 Automatic CI/CD with GitHub Actions

## 🚀 Quick Start

### Local Development
```bash
pnpm install
pnpm dev
```
Visit: http://localhost:3000

### Docker (Testing)
```bash
pnpm docker:up      # Start all services
pnpm docker:logs    # View logs
pnpm docker:down    # Stop
```

### Kubernetes (Production)
```bash
./kubernetes/deploy.sh    # Deploy to AKS
pnpm k8s:status          # Check status
pnpm k8s:logs            # View logs
```

## 🔄 CI/CD (Automatic Deployment)

Push code → Auto-deploy to Kubernetes in 3-5 minutes!

```bash
git push origin main
# ✨ Automatic: Build → Push to Docker Hub → Deploy to K8s
```

**Setup**: See [.github/workflows/SETUP.md](.github/workflows/SETUP.md) (5 minutes)

## 📦 Tech Stack

- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (Prisma ORM)
- **Cache**: Redis
- **Auth**: JWT
- **Deploy**: Docker + Kubernetes (Azure AKS)
- **CI/CD**: GitHub Actions + Docker Hub

## 📁 Project Structure

```
planify/
├── app/                    # Next.js pages & API routes
├── components/             # React components
├── lib/                    # Utilities (auth, redis, prisma)
├── kubernetes/             # K8s manifests (8 files)
├── .github/workflows/      # CI/CD pipeline
├── prisma/                 # Database schema
└── docker-compose.yml      # Local Docker setup
```

## 🔧 Available Commands

```bash
# Development
pnpm dev                   # Start dev server
pnpm build                 # Production build

# Database
pnpm prisma:generate       # Generate client
pnpm prisma:push          # Push schema

# Docker
pnpm docker:up            # Start containers
pnpm docker:down          # Stop containers

# Kubernetes
pnpm k8s:deploy           # Deploy to K8s
pnpm k8s:status           # View status
pnpm k8s:logs             # View logs
```

## 📚 Documentation

- **[.github/workflows/SETUP.md](.github/workflows/SETUP.md)** - CI/CD setup (5 min)
- **[kubernetes/README.md](kubernetes/README.md)** - Kubernetes deployment guide
- **[kubernetes/CHEAT-SHEET.md](kubernetes/CHEAT-SHEET.md)** - Quick command reference

## 🎯 Deployment Options

| Option | Use Case | Time | Cost |
|--------|----------|------|------|
| Local | Development | 2 min | Free |
| Docker | Testing | 5 min | Free |
| Kubernetes | Production | 15 min | ~$40/mo |

## 🔐 Environment Variables

```bash
DATABASE_URL=postgresql://user:password@localhost:5432/planify
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key
NODE_ENV=production
```

## ⚙️ Kubernetes Features

- ✅ Auto-scaling (3-10 pods)
- ✅ Zero-downtime deployments
- ✅ Health monitoring
- ✅ Load balancing
- ✅ Persistent storage

---

**Made with ❤️ for productive teams**
