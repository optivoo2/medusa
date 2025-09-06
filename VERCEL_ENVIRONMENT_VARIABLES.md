# 🗄️ **VERCEL ENVIRONMENT VARIABLES - NEON DATABASE**

## 📊 **Database Configuration**

### **Neon Database Details:**
- **Project ID**: `dry-feather-30036892`
- **Project Name**: `neon-blue-elephant`
- **Region**: `aws-sa-east-1` (São Paulo)
- **PostgreSQL Version**: `17`
- **Connection Type**: Pooled (PgBouncer)

### **Connection URI:**
```
postgresql://neondb_owner:npg_zpjwXBPl96Si@ep-winter-shape-acyx74fh-pooler.sa-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require
```

---

## 🔧 **Vercel Environment Variables**

### **Backend Project (`medusa-backend`):**

```bash
# Database Configuration
DATABASE_URL=postgresql://neondb_owner:npg_zpjwXBPl96Si@ep-winter-shape-acyx74fh-pooler.sa-east-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require

# Security Secrets (Generated in Phase 1)
JWT_SECRET=010d5f52bf21f8c70f0d998bba0d76cc8cbf31606439f947f94a0149d0dce853
COOKIE_SECRET=5d761d87b63e237eb97246e49db1303fce9482e3740985810bb34a3fe70c6dba

# Server Configuration
NODE_ENV=production
HOST=0.0.0.0
PORT=3000

# Store Configuration
STORE_NAME=Your Production Store

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com,https://your-storefront.vercel.app
```

### **Storefront Project (`medusa-storefront`):**

```bash
# Medusa API Configuration
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://your-backend.vercel.app
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_test_your_publishable_key_here

# Environment
NODE_ENV=production
```

---

## 🚀 **Setup Instructions**

### **Step 1: Configure Backend Environment Variables**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select `medusa-backend` project
3. Go to Settings → Environment Variables
4. Add all backend variables listed above

### **Step 2: Configure Storefront Environment Variables**
1. Select `medusa-storefront` project
2. Go to Settings → Environment Variables
3. Add all storefront variables listed above

### **Step 3: Redeploy Projects**
1. Trigger redeployment for both projects
2. Verify database connectivity

---

## 🔐 **Security Notes**

- ✅ **Database**: Using existing Neon project with pooled connections
- ✅ **Secrets**: Generated secure JWT and Cookie secrets
- ✅ **SSL**: Database connection requires SSL
- ✅ **CORS**: Configured for production domains

---

## 📋 **Next Steps**

1. ✅ Database connection established
2. ⏳ Configure Vercel environment variables
3. ⏳ Test database connectivity
4. ⏳ Deploy and verify

*Last Updated: $(date)*
*Status: Database Ready ✅*
