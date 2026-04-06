# ════════════════════════════════════════════════════════════════════════
#  Quick Deployment Script for Kubernetes (PowerShell/Windows)
#  Usage: .\deploy.ps1
# ════════════════════════════════════════════════════════════════════════

Write-Host ""
Write-Host "════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  🚀 Planify Kubernetes Deployment Script" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Check if kubectl is installed
try {
    kubectl version --client --short 2>$null | Out-Null
} catch {
    Write-Host "❌ kubectl is not installed. Please install it first." -ForegroundColor Red
    exit 1
}

# Check if connected to cluster
try {
    kubectl cluster-info 2>$null | Out-Null
} catch {
    Write-Host "❌ Not connected to a Kubernetes cluster." -ForegroundColor Red
    Write-Host "Please run: az aks get-credentials --resource-group YOUR_RG --name YOUR_AKS" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Connected to Kubernetes cluster" -ForegroundColor Green
Write-Host ""

# Step 1: Create namespace
Write-Host "[1/8] Creating namespace..." -ForegroundColor Blue
kubectl apply -f kubernetes/namespace.yaml
Write-Host ""

# Step 2: Create secrets
Write-Host "[2/8] Creating secrets and config..." -ForegroundColor Blue
kubectl apply -f kubernetes/secrets.yaml
Write-Host ""

# Step 3: Deploy PostgreSQL
Write-Host "[3/8] Deploying PostgreSQL..." -ForegroundColor Blue
kubectl apply -f kubernetes/postgres.yaml
Write-Host ""

# Step 4: Deploy Redis
Write-Host "[4/8] Deploying Redis..." -ForegroundColor Blue
kubectl apply -f kubernetes/redis.yaml
Write-Host ""

# Step 5: Wait for database
Write-Host "[5/8] Waiting for PostgreSQL to be ready..." -ForegroundColor Blue
$result = kubectl wait --for=condition=ready pod -l app=postgres -n planify --timeout=300s 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ PostgreSQL taking longer than expected. Check logs:" -ForegroundColor Yellow
    Write-Host "kubectl logs -f deployment/postgres -n planify" -ForegroundColor Yellow
    exit 1
}
Write-Host "✓ PostgreSQL is ready" -ForegroundColor Green
Write-Host ""

# Step 6: Run migrations
Write-Host "[6/8] Running database migrations..." -ForegroundColor Blue
kubectl delete job planify-migrations -n planify 2>$null
kubectl apply -f kubernetes/migration-job.yaml
Write-Host "Waiting for migrations to complete..."
$result = kubectl wait --for=condition=complete job/planify-migrations -n planify --timeout=180s 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠ Migrations taking longer. Check logs:" -ForegroundColor Yellow
    kubectl logs -f job/planify-migrations -n planify
    exit 1
}
Write-Host "✓ Migrations completed" -ForegroundColor Green
Write-Host ""

# Step 7: Deploy app
Write-Host "[7/8] Deploying Planify app..." -ForegroundColor Blue
kubectl apply -f kubernetes/app.yaml
kubectl apply -f kubernetes/hpa.yaml
Write-Host ""

# Step 8: Expose app
Write-Host "[8/8] Creating Load Balancer..." -ForegroundColor Blue
kubectl apply -f kubernetes/ingress.yaml
Write-Host ""

Write-Host "════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✓ Deployment Completed!" -ForegroundColor Green
Write-Host "════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Wait for external IP
Write-Host "⏳ Waiting for external IP address (this may take 2-5 minutes)..." -ForegroundColor Yellow
Write-Host ""

for ($i = 1; $i -le 60; $i++) {
    $externalIP = kubectl get service planify-loadbalancer -n planify -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>$null
    if ($externalIP) {
        Write-Host ""
        Write-Host "════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
        Write-Host "✓ Your app is now accessible at:" -ForegroundColor Green
        Write-Host "   http://$externalIP" -ForegroundColor Blue
        Write-Host "════════════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "Next steps:"
        Write-Host "  • Visit http://$externalIP to access your app"
        Write-Host "  • Test health: curl http://$externalIP/api/health"
        Write-Host "  • View logs: kubectl logs -f deployment/planify-app -n planify"
        Write-Host "  • Check pods: kubectl get pods -n planify"
        Write-Host ""
        exit 0
    }
    Write-Host "Still waiting... ($i/60)" -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

Write-Host ""
Write-Host "⚠ External IP not assigned yet. Check status manually:" -ForegroundColor Yellow
Write-Host "kubectl get service planify-loadbalancer -n planify --watch"
Write-Host ""
