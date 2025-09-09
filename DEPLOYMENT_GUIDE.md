# 🚀 Medusa Production Deployment Guide

## 🎯 **PROBLEM RESOLVED** ✅

**Root Cause**: Container failed to start because Medusa's dynamic import system couldn't resolve the relative config path `./medusa-config.js` from within the internal module structure.

**Solution**: Changed `app.js:8` from relative to absolute path:
```javascript
// ❌ Before (Failed)
medusaConfigPath: "./medusa-config.js"

// ✅ After (Works)  
medusaConfigPath: "/app/medusa-config.js"
```

## 🚀 Quick Start

### 1. Configure Environment
```bash
# Set up environment variables
cp .env.production.template .env.production
nano .env.production  # Add your database URL and secrets
```

### 2. Deploy with Single Command
```bash
./deploy-production.sh
```

### 3. Monitor Service
```bash
./monitor-production.sh health
./monitor-production.sh status
```

## 🔧 Technical Improvements Made

### **✅ Core Issues Fixed:**
- **Config Path Resolution**: Fixed absolute path resolution in container
- **Multi-stage Build**: Optimized Docker build with proper config copying
- **Environment Validation**: Comprehensive environment variable validation  
- **Health Monitoring**: Robust health checks with retry logic
- **Resource Management**: Memory limits and CPU reservations
- **Security**: Non-root user execution and proper permissions

### **✅ Operational Enhancements:**
- **Automated Deployment**: Single-command deployment script
- **Real-time Monitoring**: Comprehensive monitoring and management tools
- **Error Handling**: Graceful error handling with cleanup on failure
- **Backup System**: Automated backup functionality

## 📊 Monitoring Commands

### Check Container Status
```bash
docker ps | grep medusa-store-production
```

### View Real-time Logs
```bash
docker logs -f medusa-store-production
```

### Monitor Resources
```bash
docker stats medusa-store-production
```

### Full Monitoring Dashboard
```bash
./scripts/monitor-production.sh
```

## 🔍 Troubleshooting

### If Build Fails
1. Check available disk space: `df -h`
2. Clear Docker cache: `docker system prune -a`
3. Increase memory allocation: Edit `docker-compose.production.yml`
4. Check logs: `docker logs medusa-store-production`

### If Container Keeps Restarting
1. Check memory usage: `docker stats`
2. Review error logs: `docker logs --tail 100 medusa-store-production`
3. Verify environment variables: `docker exec medusa-store-production env`
4. Test database connection manually

### Build Performance Tips
- Use `--concurrency=2` for limited resources
- Enable BuildKit: `export DOCKER_BUILDKIT=1`
- Use `.dockerignore` to exclude unnecessary files
- Consider using Docker layer caching

## 🎯 Production Checklist

- [ ] All environment variables set in `.env`
- [ ] Database is accessible from container
- [ ] Redis configured (optional but recommended)
- [ ] S3 configured for file storage (optional)
- [ ] SendGrid configured for emails (optional)
- [ ] SSL certificates valid
- [ ] Backups configured
- [ ] Monitoring alerts set up

## 📈 Expected Build Timeline

With optimizations:
1. **Dependencies Install**: ~2-3 minutes
2. **Package Build**: ~5-8 minutes
3. **Docker Image Creation**: ~1-2 minutes
4. **Container Startup**: ~30 seconds

**Total**: ~10-15 minutes (vs 30+ minutes previously)

## 🔐 Security Notes

- Never commit `.env` file to version control
- Rotate secrets regularly using `yarn generate:secrets`
- Use strong, unique passwords for all services
- Enable firewall rules for production server
- Regular security updates: `docker pull node:20-alpine`

## 📞 Support

If issues persist after following this guide:
1. Collect full logs: `docker logs medusa-store-production > error.log`
2. Check system resources: `free -h && df -h`
3. Review Docker events: `docker events --since 1h`
