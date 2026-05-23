#!/bin/bash
# ════════════════════════════════════════════════════════════════════════
#  Quick Deployment Script for Kubernetes
#  Usage: ./deploy.sh
# ════════════════════════════════════════════════════════════════════════

set -e

echo "════════════════════════════════════════════════════════════════════════"
echo "  🚀 Planify Kubernetes Deployment Script"
echo "════════════════════════════════════════════════════════════════════════"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if kubectl is installed
if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl is not installed. Please install it first.${NC}"
    exit 1
fi

# Check if connected to cluster
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}❌ Not connected to a Kubernetes cluster.${NC}"
    echo "Please run: az aks get-credentials --resource-group YOUR_RG --name YOUR_AKS"
    exit 1
fi

echo -e "${GREEN}✓ Connected to Kubernetes cluster${NC}"
echo ""

# Step 1: Create namespace
echo -e "${BLUE}[1/8] Creating namespace...${NC}"
kubectl apply -f kubernetes/namespace.yaml
echo ""

# Step 2: Create secrets
echo -e "${BLUE}[2/8] Creating secrets and config...${NC}"
kubectl apply -f kubernetes/secrets.yaml
echo ""

# Step 3: Deploy PostgreSQL
echo -e "${BLUE}[3/8] Deploying PostgreSQL...${NC}"
kubectl apply -f kubernetes/postgres.yaml
echo ""

# Step 4: Deploy Redis
echo -e "${BLUE}[4/8] Deploying Redis...${NC}"
kubectl apply -f kubernetes/redis.yaml
echo ""

# Step 5: Wait for database
echo -e "${BLUE}[5/8] Waiting for PostgreSQL to be ready...${NC}"
kubectl wait --for=condition=ready pod -l app=postgres -n planify --timeout=300s || {
    echo -e "${YELLOW}⚠ PostgreSQL taking longer than expected. Check logs:${NC}"
    echo "kubectl logs -f deployment/postgres -n planify"
    exit 1
}
echo -e "${GREEN}✓ PostgreSQL is ready${NC}"
echo ""

# Step 6: Run migrations
echo -e "${BLUE}[6/8] Running database migrations...${NC}"
kubectl delete job planify-migrations -n planify 2>/dev/null || true
kubectl apply -f kubernetes/migration-job.yaml
echo "Waiting for migrations to complete..."
kubectl wait --for=condition=complete job/planify-migrations -n planify --timeout=180s || {
    echo -e "${YELLOW}⚠ Migrations taking longer. Check logs:${NC}"
    kubectl logs -f job/planify-migrations -n planify
    exit 1
}
echo -e "${GREEN}✓ Migrations completed${NC}"
echo ""

# Step 7: Deploy app
echo -e "${BLUE}[7/8] Deploying Planify app...${NC}"
kubectl apply -f kubernetes/app.yaml
kubectl apply -f kubernetes/hpa.yaml
echo ""

# Step 8: Expose app
echo -e "${BLUE}[8/8] Creating Load Balancer...${NC}"
kubectl apply -f kubernetes/ingress.yaml
echo ""

echo "════════════════════════════════════════════════════════════════════════"
echo -e "${GREEN}✓ Deployment Completed!${NC}"
echo "════════════════════════════════════════════════════════════════════════"
echo ""

# Wait for external IP
echo -e "${YELLOW}⏳ Waiting for external IP address (this may take 2-5 minutes)...${NC}"
echo ""

for i in {1..60}; do
    EXTERNAL_IP=$(kubectl get service planify-loadbalancer -n planify -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
    if [ ! -z "$EXTERNAL_IP" ]; then
        echo ""
        echo "════════════════════════════════════════════════════════════════════════"
        echo -e "${GREEN}✓ Your app is now accessible at:${NC}"
        echo -e "${BLUE}   http://$EXTERNAL_IP${NC}"
        echo "════════════════════════════════════════════════════════════════════════"
        echo ""
        echo "Next steps:"
        echo "  • Visit http://$EXTERNAL_IP to access your app"
        echo "  • Test health: curl http://$EXTERNAL_IP/api/health"
        echo "  • View logs: kubectl logs -f deployment/planify-app -n planify"
        echo "  • Check pods: kubectl get pods -n planify"
        echo ""
        exit 0
    fi
    echo -ne "${YELLOW}Still waiting... ($i/60)${NC}\r"
    sleep 5
done

echo ""
echo -e "${YELLOW}⚠ External IP not assigned yet. Check status manually:${NC}"
echo "kubectl get service planify-loadbalancer -n planify --watch"
echo ""
