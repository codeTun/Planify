# 📋 Kubernetes Quick Reference

## 🚀 Essential Commands

### Deploy
```bash
./kubernetes/deploy.sh              # Deploy everything
kubectl apply -f kubernetes/        # Manual deploy
```

### View Status
```bash
kubectl get all -n planify          # All resources
kubectl get pods -n planify         # Pods only
kubectl get hpa -n planify          # Auto-scaler status
```

### Logs
```bash
kubectl logs -f deployment/planify-app -n planify    # App logs
kubectl logs -f deployment/postgres -n planify       # Database logs
kubectl logs job/planify-migrations -n planify       # Migration logs
```

### Update App
```bash
# After pushing new image
kubectl set image deployment/planify-app \
  planify-app=YOUR_USERNAME/planify:v2 -n planify

kubectl rollout status deployment/planify-app -n planify
```

### Rollback
```bash
kubectl rollout undo deployment/planify-app -n planify
kubectl rollout history deployment/planify-app -n planify
```

### Scale
```bash
kubectl scale deployment/planify-app --replicas=5 -n planify
```

### Debug
```bash
kubectl describe pod POD_NAME -n planify
kubectl exec -it POD_NAME -n planify -- sh
```

---

## 🗄️ Database

```bash
# Connect to PostgreSQL
kubectl exec -it deployment/postgres -n planify -- psql -U planify -d planify

# Backup
kubectl exec deployment/postgres -n planify -- pg_dump -U planify planify > backup.sql

# Restore
kubectl exec -i deployment/postgres -n planify -- psql -U planify -d planify < backup.sql
```

---

## 💾 Redis

```bash
# Connect
kubectl exec -it deployment/redis -n planify -- redis-cli

# Check keys
kubectl exec deployment/redis -n planify -- redis-cli KEYS '*'

# Clear cache
kubectl exec deployment/redis -n planify -- redis-cli FLUSHALL
```

---

## ☁️ Azure AKS

```bash
# Connect to cluster
az aks get-credentials --resource-group planify-rg --name planify-aks

# Start/Stop cluster
az aks start --resource-group planify-rg --name planify-aks
az aks stop --resource-group planify-rg --name planify-aks

# Scale nodes
az aks scale --resource-group planify-rg --name planify-aks --node-count 3
```

---

## 🧹 Cleanup

```bash
# Delete everything
kubectl delete namespace planify

# Also delete volumes
kubectl delete pvc --all -n planify
```

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| Pods not starting | `kubectl describe pod POD_NAME -n planify` |
| Image pull error | Check image name in `app.yaml` |
| DB connection failed | `kubectl logs -f deployment/postgres -n planify` |
| External IP pending | Wait 5 minutes for Azure provisioning |

---

## 📦 NPM Scripts

```bash
pnpm k8s:deploy     # kubectl apply -f kubernetes/
pnpm k8s:status     # kubectl get all -n planify
pnpm k8s:logs       # kubectl logs -f deployment/planify-app -n planify
pnpm k8s:pods       # kubectl get pods -n planify
pnpm k8s:delete     # kubectl delete namespace planify
```

---

**Tip**: Keep this file open while working with Kubernetes! 📌
