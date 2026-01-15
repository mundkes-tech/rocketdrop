# 🚀 RocketDrop - Deployment Guide

## Pre-Deployment Checklist

### ✅ Code Review
- [ ] All features tested locally
- [ ] No console errors
- [ ] No hardcoded credentials
- [ ] Environment variables configured
- [ ] Git repository clean

### ✅ Environment Setup
- [ ] `.env.local` configured with all required variables
- [ ] Database connections verified
- [ ] Email service tested
- [ ] Stripe keys validated
- [ ] JWT secret generated

### ✅ Database
- [ ] All migrations completed
- [ ] Database backed up
- [ ] Tables indexed appropriately
- [ ] Connection pooling configured

---

## Production Environment Variables

### **CRITICAL - Must be set:**

```bash
# Database
DB_HOST=your_db_host
DB_PORT=3306
DB_USER=your_db_user
DB_PASSWORD=your_secure_password
DB_NAME=rocketdrop

# Security
JWT_SECRET=your_secure_jwt_secret_here

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_business_email@gmail.com
EMAIL_PASSWORD=your_app_specific_password
EMAIL_FROM=RocketDrop <noreply@yourdomain.com>
ADMIN_EMAIL=admin@yourdomain.com

# App URLs
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com
NODE_ENV=production
```

---

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)

**Step 1: Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/rocketdrop.git
git push -u origin main
```

**Step 2: Connect to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your repository
5. Add environment variables
6. Click "Deploy"

**Step 3: Configure Custom Domain**
1. In Vercel dashboard, go to Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Option 2: AWS (EC2 + RDS)

**Step 1: Launch EC2 Instance**
```bash
# SSH into instance
ssh -i your-key.pem ec2-user@your-instance

# Update system
sudo yum update -y
sudo yum install nodejs npm -y
sudo yum install mysql -y

# Clone repository
git clone your-repo
cd rocketdrop
npm install --legacy-peer-deps
npm run build
```

**Step 2: Setup Environment**
```bash
# Create .env.local
nano .env.local
# Paste production variables

# Create PM2 startup
npm install -g pm2
pm2 start npm --name "rocketdrop" -- start
pm2 startup
pm2 save
```

**Step 3: Setup RDS Database**
1. In AWS RDS console, create MySQL instance
2. Configure security groups to allow EC2 access
3. Run migrations on the RDS database
4. Update DB_HOST in environment

**Step 4: Setup Nginx Reverse Proxy**
```bash
# Install Nginx
sudo yum install nginx -y

# Create config
sudo nano /etc/nginx/conf.d/rocketdrop.conf
```

Add:
```nginx
upstream app {
  server 127.0.0.1:3000;
}

server {
  listen 80;
  server_name yourdomain.com;

  location / {
    proxy_pass http://app;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
  }
}
```

**Step 5: Setup SSL with Let's Encrypt**
```bash
sudo yum install certbot python-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

### Option 3: Docker + Heroku

**Step 1: Create Dockerfile**
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

**Step 2: Create docker-compose.yml**
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=mysql://user:pass@db:3306/rocketdrop
      - NODE_ENV=production
    depends_on:
      - db

  db:
    image: mysql:8
    environment:
      - MYSQL_ROOT_PASSWORD=root_password
      - MYSQL_DATABASE=rocketdrop
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
```

**Step 3: Deploy to Heroku**
```bash
# Login to Heroku
heroku login

# Create app
heroku create your-app-name

# Add buildpack
heroku buildpacks:add heroku/nodejs

# Set environment variables
heroku config:set JWT_SECRET=your_secret
heroku config:set STRIPE_SECRET_KEY=sk_live_...
# ... add other variables

# Deploy
git push heroku main
```

---

## Post-Deployment Verification

### ✅ Health Checks
- [ ] Website loads without errors
- [ ] All pages accessible
- [ ] Admin panel works
- [ ] User registration works
- [ ] Payment flow complete
- [ ] Emails send successfully
- [ ] Invoice generation works
- [ ] Database queries performant

### ✅ Security Checks
- [ ] HTTPS enabled
- [ ] No console errors
- [ ] No sensitive data in logs
- [ ] CORS properly configured
- [ ] Rate limiting active
- [ ] SQL injection protection verified
- [ ] XSS protection enabled

### ✅ Performance Checks
- [ ] Page load time < 3s
- [ ] API response time < 500ms
- [ ] Database queries optimized
- [ ] Images optimized
- [ ] CDN configured (if using)

---

## Database Migration to Production

### Step 1: Backup Local Database
```bash
mysqldump -u root -p rocketdrop > rocketdrop_backup.sql
```

### Step 2: Create Production Database
```bash
mysql -h your-production-host -u admin -p
CREATE DATABASE rocketdrop;
```

### Step 3: Restore Data
```bash
mysql -h your-production-host -u admin -p rocketdrop < rocketdrop_backup.sql
```

### Step 4: Verify Tables
```bash
# Check all tables exist
SHOW TABLES;

# Verify data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM products;
SELECT COUNT(*) FROM orders;
```

---

## Monitoring & Maintenance

### Application Monitoring
- Set up error tracking (Sentry, LogRocket)
- Monitor performance (New Relic, DataDog)
- Set up uptime monitoring (UptimeRobot)
- Monitor API response times

### Database Maintenance
```bash
# Regular backups (daily)
0 2 * * * mysqldump -u root -p$MYSQL_PASSWORD rocketdrop | gzip > /backups/rocketdrop_$(date +\%Y\%m\%d).sql.gz

# Optimize tables (weekly)
OPTIMIZE TABLE users, products, orders, order_items, coupons;

# Check table integrity (weekly)
CHECK TABLE users, products, orders, order_items, coupons;
```

### Log Management
- Centralize logs (CloudWatch, ELK Stack)
- Set up alerts for errors
- Monitor email delivery
- Track payment processing

---

## Scaling Strategy

### Phase 1: Single Server (Current)
- Everything on one server
- Single database instance
- Sufficient for < 10k monthly users

### Phase 2: Database Separation
- Move MySQL to managed service (RDS)
- App server focuses on Node
- Better performance and reliability

### Phase 3: Load Balancing
- Multiple app servers behind load balancer
- Shared session management
- Horizontal scaling

### Phase 4: Caching & CDN
- Redis for session/cache
- CloudFront or Cloudflare for CDN
- Image optimization
- Static file caching

### Phase 5: Microservices (Future)
- Separate payment service
- Separate email service
- Separate reporting service
- Message queue (RabbitMQ/Redis)

---

## Troubleshooting Common Issues

### Issue: Database Connection Failed
```bash
# Check connection
mysql -h your-host -u user -p -e "SELECT 1;"

# Verify credentials in .env
# Check security groups/firewall rules
# Verify database running
```

### Issue: Email Not Sending
```bash
# Verify credentials in .env
# Check Gmail App Password (not regular password)
# Verify 2FA enabled on Gmail
# Check ADMIN_EMAIL configured
# Review email logs
```

### Issue: Stripe Payment Failing
```bash
# Verify API keys are for same environment (test vs live)
# Check webhook configuration
# Verify customer session created successfully
# Check payment processing logs
```

### Issue: High Memory Usage
```bash
# Check for memory leaks
# Verify database connection pooling
# Check Node.js process memory
pm2 monit
```

---

## Rollback Plan

If deployment fails:

```bash
# 1. Identify issue
pm2 logs rocketdrop

# 2. Rollback code
git revert <commit-hash>
git push origin main

# 3. Rebuild and restart
npm run build
pm2 restart rocketdrop

# 4. Verify deployment
curl https://yourdomain.com/health

# 5. If necessary, restore database backup
mysql -h host -u user -p db < backup.sql
```

---

## Security Hardening

### Server Level
- [ ] Firewall enabled (only ports 80, 443, 22)
- [ ] SSH key-based authentication
- [ ] Fail2ban installed
- [ ] Regular security updates

### Application Level
- [ ] HTTPS/TLS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation enforced
- [ ] SQL injection protection

### Database Level
- [ ] Root password strong
- [ ] Regular user with limited permissions
- [ ] Database backups encrypted
- [ ] Access limited to app server only

### Environment Variables
- [ ] Never commit .env files
- [ ] Use environment variable management
- [ ] Rotate secrets periodically
- [ ] Monitor access logs

---

## Support & Maintenance

- **Monitoring:** Set up 24/7 monitoring
- **Backups:** Daily automated backups
- **Updates:** Monthly security patches
- **Testing:** Continuous integration/deployment
- **Documentation:** Keep deployment docs updated

---

**Last Updated:** January 15, 2026  
**Next Review:** February 15, 2026
