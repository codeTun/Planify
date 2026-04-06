# 🚀 CI/CD Setup - Docker Hub

## Quick Setup (5 Minutes)

### Step 1: Add GitHub Secrets

Go to: **GitHub Repo → Settings → Secrets → Actions**

Add these 5 secrets:

| Secret | Value |
|--------|-------|
| `DOCKER_USERNAME` | Your Docker Hub username |
| `DOCKER_PASSWORD` | Docker Hub token ([create here](https://hub.docker.com/settings/security)) |
| `AZURE_CREDENTIALS` | Azure service principal JSON (see below) |
| `AZURE_RESOURCE_GROUP` | Your AKS resource group (e.g., `planify-rg`) |
| `AZURE_AKS_CLUSTER` | Your AKS cluster name (e.g., `planify-aks`) |

### Step 2: Create Azure Service Principal

```bash
az ad sp create-for-rbac \
  --name "planify-github-actions" \
  --role contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/YOUR_RESOURCE_GROUP \
  --sdk-auth
```

Copy the JSON output → Save as `AZURE_CREDENTIALS` secret.

### Step 3: Update Image Name

Edit `kubernetes/app.yaml` (line 51):

```yaml
image: YOUR_DOCKERHUB_USERNAME/planify:latest
imagePullPolicy: Always
```

### Step 4: First Deploy

```bash
docker build -t YOUR_USERNAME/planify:latest .
docker login
docker push YOUR_USERNAME/planify:latest
./kubernetes/deploy.sh
```

### ✅ Done!

Now every `git push origin main` = automatic deployment!

---

## How It Works

```
git push origin main
        ↓
GitHub Actions triggered
        ↓
[1] Build Docker image
[2] Push to Docker Hub
[3] Deploy to Azure AKS
[4] Rolling update (zero downtime)
[5] Health check verification
        ↓
✅ Live in 3-5 minutes!
```

Watch progress: **GitHub → Actions tab**

---

## Troubleshooting

### Build fails?
- Check GitHub Actions logs
- Verify Docker Hub credentials

### Deploy fails?
- Ensure image exists: `docker pull YOUR_USERNAME/planify:latest`
- Check AKS connection: `kubectl get nodes`

### Rollback
```bash
kubectl rollout undo deployment/planify-app -n planify
```

---

**That's it! Simple and automatic.** 🎉
