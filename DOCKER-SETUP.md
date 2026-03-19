# 🐳 Docker Production Setup

## Overview

Your Planify application is now fully containerized and production-ready with:
- ✅ Multi-stage Docker build for optimal image size (~120MB vs ~1GB)
- ✅ PostgreSQL database with persistent storage
- ✅ Redis caching for improved performance
- ✅ Automatic database migrations on startup
- ✅ Health checks for all services
- ✅ Proper security (non-root user)

---

## 🚀 Quick Start

### Prerequisites
- Docker Desktop installed and running
- PowerShell (Windows) or Bash (Linux/Mac)

### Commands

```bash
# Build the images
pnpm docker:build

# Start all services (detached mode)
pnpm docker:up

# View logs
pnpm docker:logs

# Stop all services
pnpm docker:down
```

---

## 📦 Services

### 1. **PostgreSQL Database** (`planify-postgres`)
- **Port**: `5432`
- **User**: `planify`
- **Password**: `planify_secret`
- **Database**: `planify`
- **Volume**: `postgres_data` (persistent storage)

### 2. **Redis Cache** (`planify-redis`)
- **Port**: `6379`
- **Volume**: `redis_data` (persistent storage)
- **Health check**: Every 5s

### 3. **Next.js App** (`planify-app`)
- **Port**: `3000` → http://localhost:3000
- **Mode**: Production (standalone)
- **Auto-runs**: Prisma migrations on startup

---

## 🔧 Configuration

### Environment Variables

All environment variables are defined in `docker-compose.yml`:

```yaml
# PostgreSQL
POSTGRES_USER=planify
POSTGRES_PASSWORD=planify_secret
POSTGRES_DB=planify

# App
DATABASE_URL=postgresql://planify:planify_secret@postgres:5432/planify?schema=public
REDIS_URL=redis://redis:6379
NODE_ENV=production
```

### Volumes (Persistent Data)

Docker volumes ensure your data persists across container restarts:

- `postgres_data`: PostgreSQL database files
- `redis_data`: Redis cache snapshots

To delete all data and start fresh:

```bash
pnpm docker:down
docker volume rm planify_postgres_data planify_redis_data
pnpm docker:up
```

---

## 🏗️ Architecture

### Multi-Stage Dockerfile

1. **base**: Alpine Node.js 20 + pnpm + system deps
2. **deps**: Install all dependencies
3. **builder**: Generate Prisma Client + build Next.js app
4. **runner**: Minimal production image (~120MB)

### Entrypoint Script

The `entrypoint.sh` script runs before the app starts:

```bash
1. Run Prisma migrations (prisma migrate deploy)
2. Start Next.js server (node server.js)
```

---

## 📊 Redis Caching Strategy

Redis is integrated for performance optimization:

### Cached Data
- User sessions (JWT tokens)
- User profiles
- Project lists & details
- Task lists & details
- All users list

### Cache TTL (Time To Live)
- **Sessions**: 7 days
- **User profiles**: 1 hour
- **Project/Task lists**: 5 minutes
- **Project/Task details**: 10 minutes
- **User list**: 15 minutes

### Cache Invalidation
Caches are automatically invalidated when:
- Projects are created/updated/deleted
- Tasks are created/updated/deleted
- Members are added/removed
- Users sign up

---

## 🐛 Troubleshooting

### Docker Desktop Not Starting

Run the provided PowerShell script as Administrator:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\restart-docker.ps1
```

### App Won't Start

Check logs:
```bash
pnpm docker:logs
```

### Database Connection Errors

1. Ensure PostgreSQL is healthy:
   ```bash
   docker ps
   ```
   Look for "healthy" status on `planify-postgres`

2. Check database connection:
   ```bash
   docker exec -it planify-postgres psql -U planify -d planify -c "\dt"
   ```

### Redis Connection Errors

Test Redis:
```bash
docker exec -it planify-redis redis-cli PING
# Should return: PONG
```

### Port Already in Use

If port 3000, 5432, or 6379 is already in use:

1. Stop conflicting services
2. Or modify ports in `docker-compose.yml`:
   ```yaml
   ports:
     - "3001:3000"  # Use port 3001 instead
   ```

---

## 🔍 Useful Commands

### View Running Containers
```bash
docker ps
```

### Access App Container Shell
```bash
docker exec -it planify-app sh
```

### Access PostgreSQL
```bash
docker exec -it planify-postgres psql -U planify -d planify
```

### Access Redis CLI
```bash
docker exec -it planify-redis redis-cli
```

### View All Logs
```bash
docker compose logs -f
```

### Restart a Single Service
```bash
docker compose restart app
```

### Rebuild Without Cache
```bash
docker compose build --no-cache
```

---

## 📈 Performance Optimization

### Image Size Comparison
- **Before (development)**: ~1.2 GB
- **After (production)**: ~120 MB
- **Reduction**: ~90%

### Build Optimization
- Multi-stage builds eliminate build dependencies
- Only production `node_modules` copied
- Next.js standalone output (minimal footprint)
- Proper layer caching for faster rebuilds

### Runtime Optimization
- Redis caching reduces database queries
- Connection pooling for PostgreSQL
- Alpine Linux base (smaller, faster)

---

## 🔐 Security Notes

### For Production Deployment:

1. **Change default passwords** in `docker-compose.yml`:
   ```yaml
   POSTGRES_PASSWORD=YOUR_STRONG_PASSWORD_HERE
   ```

2. **Use environment files** instead of hardcoded values:
   ```yaml
   env_file:
     - .env.production
   ```

3. **Don't expose database ports** publicly:
   ```yaml
   # Remove or comment out:
   ports:
     - "5432:5432"  # Only expose internally
   ```

4. **Use secrets** for sensitive data (Docker Swarm/Kubernetes)

5. **Enable SSL/TLS** for database connections

---

## 🌐 Deployment to Cloud

### Docker Hub

```bash
# Tag the image
docker tag planify-app:latest yourusername/planify:latest

# Push to Docker Hub
docker push yourusername/planify:latest
```

### AWS ECS / Azure Container Instances / Google Cloud Run

Use the provided `docker-compose.yml` as a base for your deployment configuration.

### Kubernetes

Convert `docker-compose.yml` to Kubernetes manifests:
```bash
kompose convert
```

---

## 📝 Files Reference

- **Dockerfile**: Multi-stage build configuration
- **docker-compose.yml**: Service orchestration
- **entrypoint.sh**: Startup script (migrations + server)
- **.dockerignore**: Excluded files from build context
- **restart-docker.ps1**: Windows Docker/WSL restart script

---

## 🎉 Success!

Your application is now running at: **http://localhost:3000**

All three services are orchestrated:
- PostgreSQL: Database storage
- Redis: Performance caching
- Next.js: Application server

Enjoy your production-ready, high-performance Planify app! 🚀
