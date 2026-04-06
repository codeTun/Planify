# 📊 Planify Production Deployment - Complete Scenario

## Overview
This document describes the complete end-to-end process for deploying Planify from development to production on Azure Kubernetes Service with automated CI/CD.

---

## 🎯 PHASE 1: Initial Setup (One-Time)

### Step 1: Local Development Environment Setup
**Actor:** Iheb  
**Location:** Local Windows Machine  
**Duration:** 10 minutes

**Actions:**
1. Install Node.js and pnpm
2. Install Docker Desktop
3. Install Azure CLI
4. Install kubectl
5. Clone Planify repository from GitHub

**Input:** 
- GitHub repository URL
- Development machine with Windows OS

**Output:** 
- Fully configured development environment
- All tools installed and ready

**Status Check:**
```powershell
node --version
pnpm --version
docker --version
az --version
kubectl version --client
```

---

### Step 2: Create Docker Hub Account
**Actor:** Developer  
**Location:** https://hub.docker.com/  
**Duration:** 5 minutes

**Actions:**
1. Sign up for Docker Hub account
2. Verify email address
3. Create access token:
   - Navigate to Account Settings → Security
   - Click "New Access Token"
   - Name: "github-actions"
   - Copy token (save securely)

**Input:** 
- Email address
- Password

**Output:** 
- Docker Hub username
- Access token for CI/CD

---

### Step 3: Create Azure Account & AKS Cluster
**Actor:** Developer  
**Location:** Azure Portal / Azure CLI  
**Duration:** 15 minutes

**Actions:**
1. Create Azure account (if not exists)
2. Login to Azure CLI:
   ```powershell
   az login
   ```
3. Create resource group:
   ```powershell
   az group create --name planify-rg --location eastus
   ```
4. Create AKS cluster:
   ```powershell
   az aks create \
     --resource-group planify-rg \
     --name planify-aks \
     --node-count 2 \
     --node-vm-size Standard_B2s \
     --enable-managed-identity \
     --generate-ssh-keys
   ```
5. Get cluster credentials:
   ```powershell
   az aks get-credentials --resource-group planify-rg --name planify-aks
   ```
6. Verify connection:
   ```powershell
   kubectl get nodes
   ```

**Input:** 
- Azure subscription
- Cluster name: planify-aks
- Resource group: planify-rg

**Output:** 
- Running AKS cluster with 2 nodes
- kubectl configured to connect to cluster
- Cluster credentials stored locally

**Azure Resources Created:**
- Resource Group: planify-rg
- AKS Cluster: planify-aks
- 2 Virtual Machines (worker nodes)
- Virtual Network
- Load Balancer (created later)

---

### Step 4: Configure GitHub Repository Secrets
**Actor:** Developer  
**Location:** GitHub Repository Settings  
**Duration:** 10 minutes

**Actions:**
1. Create Azure Service Principal:
   ```powershell
   az ad sp create-for-rbac \
     --name "planify-github-actions" \
     --role contributor \
     --scopes /subscriptions/SUBSCRIPTION_ID/resourceGroups/planify-rg \
     --sdk-auth
   ```
   Copy the entire JSON output

2. Navigate to GitHub repository:
   - Settings → Secrets and variables → Actions
   - Click "New repository secret"

3. Add 5 secrets:
   - `DOCKER_USERNAME`: Docker Hub username
   - `DOCKER_PASSWORD`: Docker Hub access token
   - `AZURE_CREDENTIALS`: Service principal JSON
   - `AZURE_RESOURCE_GROUP`: planify-rg
   - `AZURE_AKS_CLUSTER`: planify-aks

**Input:** 
- Docker Hub credentials
- Azure subscription ID
- Service principal JSON

**Output:** 
- 5 GitHub secrets configured
- GitHub Actions authorized to access Docker Hub and Azure

---

### Step 5: Update Kubernetes Configuration
**Actor:** Developer  
**Location:** Local Repository  
**Duration:** 5 minutes

**Actions:**
1. Open `kubernetes/app.yaml`
2. Update line 51:
   ```yaml
   image: YOUR_DOCKERHUB_USERNAME/planify:latest
   imagePullPolicy: Always
   ```
3. Open `kubernetes/secrets.yaml`
4. Generate new base64 secrets:
   ```powershell
   echo -n "strong_password_here" | base64
   echo -n "jwt_secret_key_here" | base64
   ```
5. Update secrets with generated values

**Input:** 
- Docker Hub username
- Production passwords

**Output:** 
- Kubernetes manifests configured with correct image
- Production secrets updated

---

### Step 6: First Docker Build and Push
**Actor:** Developer  
**Location:** Local Machine  
**Duration:** 10 minutes

**Actions:**
1. Build Docker image:
   ```powershell
   cd C:\Users\...\planify
   docker build -t YOUR_USERNAME/planify:latest .
   ```
2. Login to Docker Hub:
   ```powershell
   docker login
   ```
3. Push image:
   ```powershell
   docker push YOUR_USERNAME/planify:latest
   ```

**Input:** 
- Application source code
- Dockerfile
- Docker Hub credentials

**Output:** 
- Docker image built successfully
- Image pushed to Docker Hub repository
- Image publicly accessible

**Image Details:**
- Base: node:20-alpine
- Size: ~120MB (optimized multi-stage build)
- Layers: Base + Dependencies + Build + Runtime

---

### Step 7: First Manual Deployment to Kubernetes
**Actor:** Developer  
**Location:** Local Machine (kubectl → Azure AKS)  
**Duration:** 5 minutes

**Actions:**
1. Run deployment script:
   ```powershell
   cd kubernetes
   .\deploy.ps1
   ```

**Script Executes:**
1. Creates namespace: `planify`
2. Applies secrets and config
3. Deploys PostgreSQL (1 pod + 5GB PVC)
4. Deploys Redis (1 pod + 1GB PVC)
5. Waits for PostgreSQL ready
6. Runs database migrations (Job)
7. Deploys app (3 replicas)
8. Configures auto-scaling (HPA)
9. Creates Load Balancer
10. Waits for external IP

**Input:** 
- Kubernetes manifests (8 YAML files)
- Docker image on Docker Hub
- kubectl credentials to AKS

**Output:** 
- Namespace created
- PostgreSQL running with persistent storage
- Redis running with persistent storage
- 3 app pods running
- Auto-scaler configured (3-10 pods)
- Public IP assigned
- Application accessible via http://EXTERNAL_IP

**Kubernetes Resources Created:**
- 1 Namespace
- 2 Secrets
- 1 ConfigMap
- 3 Deployments (app, postgres, redis)
- 3 Services
- 2 PersistentVolumeClaims
- 1 HorizontalPodAutoscaler
- 1 Job (migrations)

---

## 🚀 PHASE 2: Continuous Deployment (Automated)

### Step 8: Developer Makes Code Changes
**Actor:** Developer  
**Location:** Local Machine  
**Duration:** Variable (minutes to hours)

**Actions:**
1. Create feature branch or work on main
2. Make code changes (e.g., add new feature, fix bug, update UI)
3. Test locally:
   ```powershell
   pnpm dev
   # or
   pnpm docker:up
   ```
4. Commit changes:
   ```powershell
   git add .
   git commit -m "Add new feature: export projects"
   ```

**Input:** 
- Existing codebase
- Feature requirements

**Output:** 
- Modified source code
- Local testing completed
- Changes committed to Git

---

### Step 9: Push to GitHub Main Branch
**Actor:** Developer  
**Location:** Local Machine → GitHub  
**Duration:** 10 seconds

**Actions:**
1. Push to main branch:
   ```powershell
   git push origin main
   ```

**Input:** 
- Committed changes
- GitHub credentials

**Output:** 
- Code pushed to GitHub repository
- GitHub Actions workflow triggered automatically

**Trigger:** 
- Webhook fires on push to `main` branch
- `.github/workflows/deploy.yml` activated

---

### Step 10: GitHub Actions - Build Phase
**Actor:** GitHub Actions (Automated)  
**Location:** GitHub Runners (Cloud)  
**Duration:** 2-3 minutes

**Actions:**
1. **Checkout code:**
   - Clone repository
   - Checkout main branch
   - Fetch latest commit

2. **Set up Docker Buildx:**
   - Initialize Docker build environment
   - Enable advanced build features

3. **Login to Docker Hub:**
   - Authenticate using `DOCKER_USERNAME` secret
   - Authenticate using `DOCKER_PASSWORD` secret

4. **Build Docker image:**
   - Execute multi-stage Dockerfile
   - Build base layer (Node.js + pnpm)
   - Install dependencies
   - Generate Prisma client
   - Build Next.js app (standalone)
   - Create final optimized image

5. **Push to Docker Hub:**
   - Tag image with `latest`
   - Tag image with commit SHA (e.g., `abc123def`)
   - Push both tags to Docker Hub
   - Cache layers for faster future builds

**Input:** 
- Source code from GitHub
- Dockerfile
- Docker Hub credentials (secrets)
- Build cache from previous builds

**Output:** 
- New Docker image on Docker Hub
- Two tags: `latest` and commit SHA
- Build logs in GitHub Actions

**Docker Build Process:**
```
Stage 1: Base (Alpine + Node.js + pnpm)
Stage 2: Dependencies (pnpm install)
Stage 3: Build (Prisma generate + Next.js build)
Stage 4: Runner (minimal production image)
Result: 120MB optimized image
```

---

### Step 11: GitHub Actions - Deploy Phase
**Actor:** GitHub Actions (Automated)  
**Location:** GitHub Runners → Azure AKS  
**Duration:** 1-2 minutes

**Actions:**
1. **Install kubectl:**
   - Download kubectl binary
   - Configure kubectl version

2. **Azure Login:**
   - Authenticate using `AZURE_CREDENTIALS` secret
   - Verify Azure subscription access

3. **Get AKS Credentials:**
   - Download AKS cluster config
   - Configure kubectl to connect to cluster
   - Verify connection with cluster

4. **Update Kubernetes Deployment:**
   ```bash
   kubectl set image deployment/planify-app \
     planify-app=USERNAME/planify:COMMIT_SHA \
     -n planify
   ```

5. **Wait for Rollout:**
   - Monitor rolling update progress
   - Wait for new pods to be ready
   - Timeout after 5 minutes

6. **Verify Deployment:**
   - Check all pods are running
   - Get service external IP
   - Test health endpoint

**Input:** 
- New Docker image from Step 10
- Azure credentials (secrets)
- AKS cluster information (secrets)
- kubectl commands

**Output:** 
- Updated Kubernetes deployment
- New pods running with new code
- Old pods gracefully terminated
- Deployment status logs

---

### Step 12: Kubernetes Rolling Update
**Actor:** Kubernetes Control Plane (Automated)  
**Location:** Azure AKS Cluster  
**Duration:** 1-2 minutes

**Actions (Automated by Kubernetes):**

**Initial State:**
- 3 pods running (old version)
- All serving traffic
- Load balancer distributing requests

**Rolling Update Process:**

1. **Pod 1 Update:**
   - Start new pod with new image
   - Wait for container startup
   - Run health checks (readiness probe)
   - Wait for HTTP 200 from /api/health
   - Add to load balancer pool
   - Remove old Pod 1 from load balancer
   - Terminate old Pod 1
   - **Current: 1 new + 2 old pods serving traffic**

2. **Pod 2 Update:**
   - Start second new pod
   - Wait for health checks
   - Add to load balancer
   - Remove old Pod 2
   - Terminate old Pod 2
   - **Current: 2 new + 1 old pods serving traffic**

3. **Pod 3 Update:**
   - Start third new pod
   - Wait for health checks
   - Add to load balancer
   - Remove old Pod 3
   - Terminate old Pod 3
   - **Final: 3 new pods serving traffic**

**Health Checks During Update:**
- **Readiness Probe:** GET /api/health every 5 seconds
- **Liveness Probe:** GET /api/health every 10 seconds
- **Required Response:** HTTP 200 + healthy status JSON

**Input:** 
- New Docker image reference
- Deployment configuration (rolling update strategy)
- Health check endpoints

**Output:** 
- All 3 pods updated to new version
- Zero downtime (traffic served throughout)
- Old pods terminated
- New pods healthy and serving traffic

**Rollout Strategy:**
- MaxSurge: 1 (max 1 extra pod during update)
- MaxUnavailable: 1 (max 1 pod down during update)
- Always maintains 2+ healthy pods

---

### Step 13: Post-Deployment Verification
**Actor:** GitHub Actions (Automated)  
**Location:** GitHub Runner  
**Duration:** 30 seconds

**Actions:**
1. **Check Pod Status:**
   ```bash
   kubectl get pods -n planify
   ```
   - Verify all pods are Running
   - Check pod age (new pods created recently)

2. **Get Service Information:**
   ```bash
   kubectl get svc planify-loadbalancer -n planify
   ```
   - Display external IP
   - Show port mappings

3. **Test Health Endpoint:**
   ```bash
   curl http://EXTERNAL_IP/api/health
   ```
   - Verify HTTP 200 response
   - Check database connection
   - Check Redis connection

4. **Log Results:**
   - Display deployment success message
   - Show app URL
   - Include commit SHA deployed

**Input:** 
- Kubernetes cluster state
- Service external IP
- Health endpoint

**Output:** 
- Verification logs in GitHub Actions
- Deployment success/failure status
- Accessible app URL

**Success Criteria:**
- All pods in Running state
- Health endpoint returns 200
- Database and Redis connected
- GitHub Actions workflow marked as success ✅

---

## 🔄 PHASE 3: Auto-Scaling in Production

### Step 14: Traffic Increases (Auto-Scale Up)
**Actor:** Horizontal Pod Autoscaler (HPA) - Automated  
**Location:** Azure AKS Cluster  
**Duration:** 1-2 minutes

**Trigger Conditions:**
- CPU usage > 70% across pods
- OR Memory usage > 80% across pods
- Metrics collected every 15 seconds

**Actions (Automated):**
1. **HPA Detects High Load:**
   - Monitors CPU/memory metrics
   - Calculates average across all pods
   - Determines scaling decision

2. **Calculate Desired Replicas:**
   - Current: 3 pods
   - CPU at 85% (target: 70%)
   - Formula: ceil(3 * 85 / 70) = 4 pods
   - Add 50% more: 3 * 1.5 = 4.5 → 5 pods

3. **Scale Up:**
   - Update deployment to 5 replicas
   - Kubernetes creates 2 new pods
   - New pods pull latest image
   - Health checks executed
   - Pods added to load balancer
   - Traffic distributed across 5 pods

4. **Stabilization:**
   - Wait 60 seconds
   - Re-evaluate metrics
   - Continue scaling if needed (max 10 pods)

**Input:** 
- Current CPU/memory metrics
- HPA configuration (min: 3, max: 10)
- Target utilization (CPU: 70%, Memory: 80%)

**Output:** 
- Increased number of pods (3 → 5)
- Load distributed across more instances
- Better performance and responsiveness
- Lower CPU/memory per pod

**Scaling Behavior:**
- Scale up: Fast (add 50% pods at once)
- Stabilization window: 60 seconds
- Can scale from 3 to 10 pods maximum

---

### Step 15: Traffic Decreases (Auto-Scale Down)
**Actor:** Horizontal Pod Autoscaler (HPA) - Automated  
**Location:** Azure AKS Cluster  
**Duration:** 5-6 minutes

**Trigger Conditions:**
- CPU usage < 70% for sustained period
- AND Memory usage < 80% for sustained period
- Stable for 5 minutes (stabilization window)

**Actions (Automated):**
1. **HPA Detects Low Load:**
   - Monitors metrics for 5 minutes
   - Confirms sustained low usage
   - Calculates scale-down decision

2. **Scale Down Gradually:**
   - Current: 5 pods
   - CPU at 40% (target: 70%)
   - Remove 1 pod at a time
   - Wait 60 seconds between removals

3. **Remove Pods:**
   - Select pod for termination
   - Remove from load balancer
   - Send SIGTERM to pod
   - Allow 30-second graceful shutdown
   - Terminate pod
   - Repeat if needed

4. **Stop at Minimum:**
   - Never go below 3 pods (configured minimum)
   - Maintain high availability
   - Keep redundancy for failures

**Input:** 
- Current CPU/memory metrics
- HPA configuration (min: 3)
- Stabilization window: 5 minutes

**Output:** 
- Reduced number of pods (5 → 3)
- Cost savings (fewer running pods)
- Still maintains availability
- Automatic response to traffic patterns

**Scaling Behavior:**
- Scale down: Slow and gradual (1 pod at a time)
- Stabilization window: 300 seconds (5 minutes)
- Prevents flapping (rapid scale up/down)

---

## 🏥 PHASE 4: Monitoring & Health Checks

### Step 16: Continuous Health Monitoring
**Actor:** Kubernetes Kubelet (Automated)  
**Location:** Each Worker Node in AKS  
**Duration:** Continuous (24/7)

**Health Check Types:**

**A. Readiness Probe:**
- **Frequency:** Every 5 seconds
- **Endpoint:** GET http://localhost:3000/api/health
- **Timeout:** 3 seconds
- **Failure Threshold:** 2 consecutive failures
- **Purpose:** Determine if pod can receive traffic
- **Action on Failure:** Remove pod from load balancer (but don't restart)

**B. Liveness Probe:**
- **Frequency:** Every 10 seconds
- **Endpoint:** GET http://localhost:3000/api/health
- **Timeout:** 5 seconds
- **Failure Threshold:** 3 consecutive failures
- **Purpose:** Determine if pod is alive
- **Action on Failure:** Kill and restart pod

**Health Endpoint Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-03-20T00:00:00.000Z",
  "services": {
    "database": "connected",
    "redis": "connected"
  }
}
```

**Monitoring Flow:**

1. **Normal Operation:**
   - Health check returns 200 OK
   - Pod stays in load balancer
   - Pod continues running
   - Next check in 5 seconds

2. **Temporary Issue (Readiness Fails):**
   - Health check returns 503 or times out
   - After 2 failures: Pod removed from load balancer
   - Pod keeps running
   - No new traffic sent to pod
   - If health recovers: Pod re-added to load balancer

3. **Critical Issue (Liveness Fails):**
   - Health check fails 3 times
   - Kubernetes kills the pod
   - New pod automatically started
   - Health checks on new pod
   - New pod added to load balancer when ready

**Input:** 
- Running pod with health endpoint
- Health check configuration

**Output:** 
- Continuous availability monitoring
- Automatic removal of unhealthy pods
- Automatic restart of dead pods
- 99.9%+ uptime

---

## 💾 PHASE 5: Data Persistence & Backup

### Step 17: Database Operations
**Actor:** PostgreSQL Pod + Azure Persistent Disk  
**Location:** Azure AKS Cluster  
**Duration:** Continuous

**Data Storage:**

**Persistent Volume Claims (PVC):**
- PostgreSQL: 5GB Azure Managed Disk
- Redis: 1GB Azure Managed Disk
- Storage Class: Azure Standard SSD
- Access Mode: ReadWriteOnce
- Reclaim Policy: Retain (data survives pod deletion)

**Database Operations:**
1. **Application Writes Data:**
   - User creates project/task
   - API endpoint processes request
   - Prisma writes to PostgreSQL
   - Data stored on Azure disk
   - Transaction committed

2. **Pod Restart:**
   - Pod is deleted (upgrade/failure)
   - PVC remains intact
   - New pod starts
   - PVC attached to new pod
   - Same data available
   - No data loss

3. **Redis Cache:**
   - Session data cached
   - User profiles cached
   - Project/task lists cached
   - TTL-based expiration
   - Persistence to disk every 60s

**Backup Strategy (Manual - Not Automated):**
```powershell
# Backup database
kubectl exec deployment/postgres -n planify -- \
  pg_dump -U planify planify > backup-$(date +%Y%m%d).sql

# Restore database
kubectl exec -i deployment/postgres -n planify -- \
  psql -U planify -d planify < backup.sql
```

**Input:** 
- Application data (projects, tasks, users)
- Cache data (sessions, profiles)

**Output:** 
- Persistent data storage
- Data survives pod restarts
- Data survives cluster restarts
- Backup files (if manual backup performed)

---

## 🔄 PHASE 6: Rollback Scenario

### Step 18: Problematic Deployment Detected
**Actor:** Developer or Monitoring System  
**Location:** Production (Azure AKS)  
**Duration:** 1-5 minutes to detect

**Problem Scenarios:**
- New version has critical bug
- Health checks failing
- Users reporting errors
- Performance degradation

**Detection Methods:**
1. GitHub Actions workflow fails
2. Health checks fail repeatedly
3. User reports/bug tickets
4. Monitoring alerts
5. Manual testing reveals issue

---

### Step 19: Execute Rollback
**Actor:** Developer  
**Location:** Local Machine → Azure AKS  
**Duration:** 30 seconds

**Actions:**
1. **Immediate Rollback:**
   ```powershell
   kubectl rollout undo deployment/planify-app -n planify
   ```

2. **Kubernetes Executes:**
   - Retrieves previous deployment version
   - Performs reverse rolling update
   - Replaces new pods with old pods
   - One pod at a time (zero downtime)
   - Old version restored

3. **Verify Rollback:**
   ```powershell
   kubectl rollout status deployment/planify-app -n planify
   kubectl get pods -n planify
   ```

**Alternative: Rollback to Specific Version:**
```powershell
# View history
kubectl rollout history deployment/planify-app -n planify

# Rollback to specific revision
kubectl rollout undo deployment/planify-app -n planify --to-revision=3
```

**Input:** 
- Current problematic deployment
- Previous stable version in history

**Output:** 
- Deployment rolled back to previous version
- Stable version running
- Issues resolved
- Users can continue working

**Rollback Time:** 
- Command execution: 5 seconds
- Pod replacement: 1-2 minutes
- Total downtime: ZERO (rolling update)

---

## 📊 Complete System Architecture

### Infrastructure Components:

**Local Development:**
- Developer Workstation (Windows)
- Docker Desktop
- kubectl CLI
- Azure CLI
- pnpm / Node.js
- Git

**Source Control:**
- GitHub Repository
  - Application code
  - Kubernetes manifests
  - GitHub Actions workflows
  - Docker configuration

**Container Registry:**
- Docker Hub
  - Public repository
  - Image storage
  - Version tags (latest + SHA)

**CI/CD Platform:**
- GitHub Actions
  - Automated workflows
  - Build runners
  - Secret management
  - Deployment automation

**Cloud Infrastructure (Azure):**
- Resource Group: planify-rg
- AKS Cluster: planify-aks
  - Control Plane (Managed by Azure)
  - 2 Worker Nodes (Standard_B2s VMs)
  - Virtual Network
  - Azure Load Balancer (public IP)
  - Azure Managed Disks (persistent storage)

**Kubernetes Workloads:**
- Namespace: planify
- Deployments:
  - planify-app (3-10 replicas)
  - postgres (1 replica)
  - redis (1 replica)
- Services:
  - planify-loadbalancer (LoadBalancer)
  - planify-app (ClusterIP)
  - postgres (ClusterIP)
  - redis (ClusterIP)
- Storage:
  - postgres-pvc (5GB)
  - redis-pvc (1GB)
- Scaling:
  - HorizontalPodAutoscaler (CPU/Memory based)
- Jobs:
  - planify-migrations (database setup)

---

## 📈 Key Metrics & Timing

**Setup Phase (One-Time):**
- Local environment: 10 minutes
- Docker Hub setup: 5 minutes
- Azure AKS creation: 15 minutes
- GitHub secrets: 10 minutes
- First deployment: 10 minutes
- **Total: ~50 minutes**

**Automated Deployment (Every Push):**
- Build phase: 2-3 minutes
- Deploy phase: 1-2 minutes
- Rolling update: 1-2 minutes
- **Total: 3-5 minutes**

**Scaling Operations:**
- Scale up: 1-2 minutes
- Scale down: 5-6 minutes (gradual)

**Recovery Operations:**
- Pod restart: 30 seconds
- Rollback: 1-2 minutes
- Full redeployment: 3-5 minutes

**Availability:**
- Target uptime: 99.9%
- Zero downtime during updates
- Automatic failure recovery
- Load balanced traffic

---

## 🎯 Success Criteria

**Development:**
✅ Code changes tested locally  
✅ Changes committed to Git  
✅ Pushed to GitHub main branch  

**Build:**
✅ Docker image built successfully  
✅ All layers cached efficiently  
✅ Image pushed to Docker Hub  
✅ Image size optimized (~120MB)  

**Deployment:**
✅ Kubernetes deployment updated  
✅ Rolling update completed  
✅ All pods running and healthy  
✅ Health checks passing  
✅ Load balancer distributing traffic  

**Production:**
✅ Application accessible via public IP  
✅ Database connected and persistent  
✅ Redis caching working  
✅ Auto-scaling configured  
✅ Zero downtime maintained  
✅ Monitoring active  

---

## 🔐 Security Considerations

**Secrets Management:**
- GitHub Secrets (encrypted at rest)
- Kubernetes Secrets (base64 encoded)
- Azure Key Vault integration (optional)

**Network Security:**
- Internal services (ClusterIP)
- Public access via LoadBalancer only
- HTTPS/TLS (optional enhancement)

**Access Control:**
- Azure RBAC for AKS
- Kubernetes RBAC for resources
- Service principal with limited scope

**Image Security:**
- Non-root user in containers
- Multi-stage builds (minimal attack surface)
- Regular base image updates

---

This document provides a complete step-by-step scenario for production deployment with automated CI/CD, suitable for creating comprehensive diagrams and visualizations.
