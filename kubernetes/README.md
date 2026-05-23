# 🚢 Kubernetes Deployment Guide

Deploy Planify to Azure Kubernetes Service (AKS).

## Quick Deploy

```bash
# Connect to AKS
az aks get-credentials --resource-group YOUR_RG --name YOUR_CLUSTER

# Deploy everything
./deploy.sh

# Check status
kubectl get all -n planify
```

---

## Files Overview

| File | Purpose |
|------|---------|
| `namespace.yaml` | Resource isolation |
| `secrets.yaml` | Passwords & config (⚠️ Update for production!) |
| `postgres.yaml` | Database (1 pod + 5GB storage) |
| `redis.yaml` | Cache (1 pod + 1GB storage) |
| `app.yaml` | Next.js app (3 replicas, auto-scales to 10) |
| `ingress.yaml` | Load balancer (public access) |
| `migration-job.yaml` | Database migrations |
| `hpa.yaml` | Auto-scaling rules |

---

## Setup Requirements

### 1. Azure AKS Cluster

**Create new cluster:**
```bash
az group create --name planify-rg --location eastus

az aks create \
  --resource-group planify-rg \
  --name planify-aks \
  --node-count 2 \
  --node-vm-size Standard_B2s \
  --enable-managed-identity \
  --generate-ssh-keys
```

**Connect to existing:**
```bash
az aks get-credentials --resource-group planify-rg --name planify-aks
```

### 2. Docker Image

Push your image to Docker Hub:
```bash
docker build -t YOUR_USERNAME/planify:latest .
docker push YOUR_USERNAME/planify:latest
```

Update `app.yaml` line 51:
```yaml
image: YOUR_USERNAME/planify:latest
```

### 3. Update Secrets

Edit `secrets.yaml` - generate new base64 values:
```bash
echo -n "YOUR_STRONG_PASSWORD" | base64
echo -n "YOUR_JWT_SECRET" | base64
```

---

## Deploy

### Automatic (Recommended)
```bash
./deploy.sh
```

### Manual
```bash
kubectl apply -f namespace.yaml
kubectl apply -f secrets.yaml
kubectl apply -f postgres.yaml
kubectl apply -f redis.yaml

# Wait for database
kubectl wait --for=condition=ready pod -l app=postgres -n planify --timeout=300s

# Run migrations
kubectl apply -f migration-job.yaml
kubectl wait --for=condition=complete job/planify-migrations -n planify --timeout=180s

# Deploy app
kubectl apply -f app.yaml
kubectl apply -f hpa.yaml
kubectl apply -f ingress.yaml
```

### Get Public IP
```bash
kubectl get service planify-loadbalancer -n planify

# Wait for EXTERNAL-IP (2-5 minutes)
# Then visit: http://EXTERNAL-IP
```

---

## Management

### View Status
```bash
kubectl get all -n planify
kubectl get pods -n planify
kubectl get hpa -n planify
```

### View Logs
```bash
kubectl logs -f deployment/planify-app -n planify
kubectl logs -f deployment/postgres -n planify
```

### Update App
```bash
# After pushing new image
kubectl set image deployment/planify-app planify-app=YOUR_USERNAME/planify:v2 -n planify
kubectl rollout status deployment/planify-app -n planify
```

### Rollback
```bash
kubectl rollout undo deployment/planify-app -n planify
```

### Scale Manually
```bash
kubectl scale deployment/planify-app --replicas=5 -n planify
```

---

## Architecture

```
Internet → Azure Load Balancer
              ↓
        App Pods (3-10)
         ↓           ↓
    PostgreSQL    Redis
     (5GB)       (1GB)
```

**Auto-scaling:**
- Minimum: 3 pods
- Maximum: 10 pods
- Triggers: CPU > 70% or Memory > 80%

---

## Troubleshooting

### Pods not starting
```bash
kubectl describe pod POD_NAME -n planify
kubectl logs POD_NAME -n planify
```

### Database connection errors
```bash
kubectl get pods -l app=postgres -n planify
kubectl logs -f deployment/postgres -n planify
```

### External IP stuck on <pending>
```bash
kubectl describe svc planify-loadbalancer -n planify
# Wait 5 minutes, Azure is provisioning the load balancer
```

---

## Cleanup

```bash
kubectl delete namespace planify
# Also delete persistent volumes:
kubectl delete pvc --all -n planify
```

---

## Cost Estimate (Azure East US)

| Resource | Monthly Cost |
|----------|--------------|
| AKS Control Plane | $0 (free) |
| 2x Standard_B2s VMs | ~$35 |
| Load Balancer | ~$5 |
| Storage (6GB) | ~$2 |
| **Total** | **~$42/month** |

---

See **[CHEAT-SHEET.md](CHEAT-SHEET.md)** for quick command reference.
