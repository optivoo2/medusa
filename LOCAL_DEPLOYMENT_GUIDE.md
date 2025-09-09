# 🏠 Local Self-Hosted Medusa Deployment Guide

This guide will help you deploy Medusa locally without any external cloud dependencies.

## 📋 Prerequisites

### Required Services
- **PostgreSQL** - Database server
- **Redis** (Optional) - For caching and workflows
- **Docker & Docker Compose** - Containerization

### Installation Commands

#### Ubuntu/Debian:
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Install Redis (optional)
sudo apt install redis-server

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin
```

#### macOS:
```bash
# Install using Homebrew
brew install postgresql redis docker docker-compose
```

## 🗄️ Database Setup

### 1. Create Database and User
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE medusa_prod;
CREATE USER medusa_user WITH PASSWORD 'medusa_password';
GRANT ALL PRIVILEGES ON DATABASE medusa_prod TO medusa_user;
\q
```

### 2. Start Services
```bash
# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Start Redis (optional)
sudo systemctl start redis-server
sudo systemctl enable redis-server
```

## ⚙️ Configuration

### 1. Environment Variables
```bash
# Copy the example environment file
cp env.local.example .env

# Edit the .env file with your settings
nano .env
```

### 2. Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://medusa_user:medusa_password@localhost/medusa_prod

# Security (Generate new secrets!)
JWT_SECRET=your_jwt_secret_here
COOKIE_SECRET=your_cookie_secret_here
ADMIN_JWT_SECRET=your_admin_jwt_secret_here

# Server
NODE_ENV=production
PORT=3000
HOST=0.0.0.0

# CORS
STORE_CORS_ORIGIN=http://localhost:3000
ADMIN_CORS_ORIGIN=http://localhost:3000

# Redis (optional)
REDIS_URL=redis://localhost:6379
```

## 🚀 Deployment

### 1. Build and Deploy
```bash
# Build and start the container
docker-compose -f docker-compose.production.yml up -d --build

# Check container status
docker ps

# View logs
docker logs medusa-store-production -f
```

### 2. Database Migration
```bash
# Run database migrations
docker exec medusa-store-production npx medusa db:migrate

# Create admin user (optional)
docker exec medusa-store-production npx medusa user:create --email admin@example.com --password admin123
```

## 🔍 Monitoring

### Health Check
```bash
# Check if the service is running
curl http://localhost:3001/health

# Expected response:
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "1.0.0",
  "environment": "production"
}
```

### Logs
```bash
# View real-time logs
docker logs medusa-store-production -f

# View last 100 lines
docker logs medusa-store-production --tail 100
```

## 🌐 Access Points

- **Store API**: http://localhost:3001/store
- **Admin Dashboard**: http://localhost:3001/app
- **Health Check**: http://localhost:3001/health

## 📁 File Storage

Files are stored locally in the `./uploads` directory:
- Product images
- User avatars
- Documents
- Other media files

## 🔧 Maintenance

### Restart Service
```bash
docker-compose -f docker-compose.production.yml restart
```

### Update Application
```bash
# Pull latest changes
git pull

# Rebuild and restart
docker-compose -f docker-compose.production.yml up -d --build
```

### Backup Database
```bash
# Create backup
pg_dump -h localhost -U medusa_user medusa_prod > medusa_backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
psql -h localhost -U medusa_user medusa_prod < medusa_backup_20240115_103000.sql
```

## 🛠️ Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Check database exists
   sudo -u postgres psql -l
   ```

2. **Port Already in Use**
   ```bash
   # Check what's using port 3001
   sudo netstat -tlnp | grep :3001
   
   # Kill process or change port in docker-compose.production.yml
   ```

3. **Permission Issues**
   ```bash
   # Fix uploads directory permissions
   sudo chown -R $USER:$USER ./uploads
   chmod -R 755 ./uploads
   ```

### Logs Analysis
```bash
# Check for errors
docker logs medusa-store-production 2>&1 | grep -i error

# Check startup sequence
docker logs medusa-store-production 2>&1 | grep -i "starting\|ready\|listening"
```

## 🔒 Security Notes

1. **Change Default Secrets**: Generate new JWT and cookie secrets
2. **Database Security**: Use strong passwords and limit access
3. **Firewall**: Configure firewall rules for your server
4. **SSL/TLS**: Consider using a reverse proxy with SSL for production

## 📊 Performance

- **Memory**: 4GB allocated to container
- **CPU**: Uses available system resources
- **Storage**: Local file system for uploads
- **Caching**: Redis for improved performance (optional)

## 🆘 Support

If you encounter issues:
1. Check the logs: `docker logs medusa-store-production -f`
2. Verify environment variables are set correctly
3. Ensure all required services (PostgreSQL, Redis) are running
4. Check file permissions in the uploads directory

---

**🎉 Your Medusa store is now running locally!**
