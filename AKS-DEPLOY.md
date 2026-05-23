# Planify — Azure Kubernetes Service Deployment Guide

## Stack
- **App**: Next.js + Prisma → port 3000 | image: `iheb770/planify-app:latest`
- **DB**: PostgreSQL 16 with 5 GB PVC
- **Cache**: Redis 7 with 1 GB PVC
- **Replicas**: 3 (auto-scales to 5 via HPA)

---

## Prerequisites
```bash
az --version        # Azure CLI
kubectl version     # Kubernetes CLI
docker --version    # Docker
```

---

## Step 1 — Azure login
```bash
az login
```

---

## Step 2 — Set variables & create Resource Group
```bash
RG=planify-rg
CLUSTER=planify-cluster
LOCATION=westeurope

az group create --name $RG --location $LOCATION
```

---

## Step 3 — Create AKS cluster
```bash
az aks create \
  --resource-group $RG \
  --name $CLUSTER \
  --node-count 2 \
  --node-vm-size Standard_B2s \
  --generate-ssh-keys

# Takes ~5 minutes
```

---

## Step 4 — Connect kubectl to your cluster
```bash
az aks get-credentials --resource-group $RG --name $CLUSTER

# Verify
kubectl get nodes
```

---

## Step 5 — Encode your secrets
```bash
echo -n "YourStrongPassword123!" | base64    # → paste as POSTGRES_PASSWORD
echo -n "6CWtr4uaMGJFhVWr56ACkDPA8jOq1J6UEJlXTVhtwDr" | base64  # → paste as JWT_SECRET
```

Then open `kubernetes/secrets.yaml` and replace the values:
```yaml
data:
  POSTGRES_PASSWORD: <base64-output-here>
  JWT_SECRET: <base64-output-here>
```

---

## Step 6 — Deploy everything in order
```bash
# 1. Namespace
kubectl apply -f kubernetes/namespace.yaml

# 2. Secrets & ConfigMap
kubectl apply -f kubernetes/secrets.yaml

# 3. PostgreSQL + Redis
kubectl apply -f kubernetes/postgres.yaml
kubectl apply -f kubernetes/redis.yaml

# Wait until both pods are Running before continuing
kubectl get pods -n planify -w
# Press Ctrl+C once postgres and redis show Running

# 4. Run DB migrations
kubectl apply -f kubernetes/migration-job.yaml
kubectl wait --for=condition=complete job/planify-migrations -n planify --timeout=120s

# 5. Deploy the app (3 replicas)
kubectl apply -f kubernetes/app.yaml

# 6. Expose via public LoadBalancer
kubectl apply -f kubernetes/ingress.yaml

# 7. Enable auto-scaling
kubectl apply -f kubernetes/hpa.yaml
```

---

## Step 7 — Get your public IP
```bash
kubectl get service planify-loadbalancer -n planify
# Wait ~2 min until EXTERNAL-IP is no longer <pending>
```

Open `http://<EXTERNAL-IP>` in your browser.

---

## Useful commands
```bash
# All pods status
kubectl get pods -n planify

# App logs
kubectl logs -l app=planify-app -n planify --tail=50

# HPA status
kubectl get hpa -n planify

# Redeploy after new image push
docker push iheb770/planify-app:latest
kubectl rollout restart deployment/planify-app -n planify
```

---

## Tear down
```bash
az group delete --name $RG --yes --no-wait
```


kubectl apply -f kubernetes/namespace.yaml
  kubectl apply -f kubernetes/secrets.yaml
  kubectl apply -f kubernetes/postgres.yaml                     
  kubectl apply -f kubernetes/redis.yaml
  kubectl get pods -n planify -w

  kubectl apply -f kubernetes/migration-job.yaml
  kubectl wait --for=condition=complete job/planify-migrations -n planify --timeout=120s

  kubectl apply -f kubernetes/app.yaml
  kubectl apply -f kubernetes/ingress.yaml                      
  kubectl apply -f kubernetes/hpa.yaml
  kubectl get pods -n planify -w
