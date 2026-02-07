# Marketplace-ts Deployment Guide

This guide covers deploying Marketplace-ts to production using Docker.

## Prerequisites

- Docker & Docker Compose installed
- PostgreSQL 16+ (or use Docker Compose)
- Node.js 20+ (for local development)
- Domain name with DNS configured
- SSL certificates (Let's Encrypt recommended)
- (Optional) Matrix/Synapse server for real-time chat
- (Optional) AWS S3 bucket for image uploads

## Quick Start - Development

```bash
# 1. Clone and install
git clone <repository-url>
cd marketplace-ts
pnpm install

# 2. Configure environment
cp .env.example .env
# Edit .env with your settings

# 3. Start database
docker compose up -d postgres

# 4. Run migrations
cd packages/database
pnpm prisma migrate deploy
pnpm prisma generate

# 5. Start development servers
cd ../..
pnpm dev
```

Access the application:

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- GraphQL Playground: http://localhost:3001/graphql

## Production Deployment

### Option 1: Docker Compose (Recommended)

**1. Prepare the server:**

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo apt install docker-compose-plugin
```

**2. Clone repository:**

```bash
cd /opt
git clone <repository-url> marketplace-ts
cd marketplace-ts
```

**3. Configure environment:**

```bash
cp .env.example .env
nano .env
```

**Important environment variables for production:**

```bash
# Database
DATABASE_URL=postgresql://marketplace-ts:STRONG_PASSWORD@postgres:5432/marketplace-ts
POSTGRES_PASSWORD=STRONG_PASSWORD

# Security
JWT_SECRET=GENERATE_STRONG_SECRET_HERE
NODE_ENV=production

# URLs (replace with your domain)
FRONTEND_URL=https://yourdomain.com
BACKEND_URL=https://api.yourdomain.com
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/graphql

# OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-secret
FACEBOOK_CLIENT_ID=your-facebook-client-id
FACEBOOK_CLIENT_SECRET=your-facebook-secret

# Matrix (optional - for real-time chat)
MATRIX_HOST=matrix.yourdomain.com
MATRIX_USER=@admin:matrix.yourdomain.com
MATRIX_PASSWORD=matrix-admin-password
NEXT_PUBLIC_MATRIX_HOST=matrix.yourdomain.com

# AWS S3 (optional - for image uploads)
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=marketplace-ts-uploads
```

**4. SSL Certificates:**

For Let's Encrypt:

```bash
# Install certbot
sudo apt install certbot

# Get certificates
sudo certbot certonly --standalone -d yourdomain.com -d api.yourdomain.com

# Copy certificates
sudo mkdir -p /opt/marketplace-ts/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /opt/marketplace-ts/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /opt/marketplace-ts/ssl/key.pem
```

**5. Configure Nginx:**

Edit `nginx.conf` to enable HTTPS:

```nginx
# Uncomment and configure the HTTPS server block
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/nginx/ssl/cert.pem;
    ssl_certificate_key /etc/nginx/ssl/key.pem;
    # ... rest of configuration
}
```

**6. Deploy:**

```bash
# Build and start services
docker compose -f docker-compose.prod.yml up -d

# Check logs
docker compose -f docker-compose.prod.yml logs -f

# Run database migrations
docker compose -f docker-compose.prod.yml exec api sh -c "cd /app/packages/database && npx prisma migrate deploy"
```

**7. Verify deployment:**

```bash
# Check service health
docker compose -f docker-compose.prod.yml ps

# Test endpoints
curl https://yourdomain.com
curl https://api.yourdomain.com/graphql
```

### Option 2: Separate Services

If you prefer to run services separately (not using Docker):

**Backend:**

```bash
cd apps/back
pnpm install --prod
pnpm prisma migrate deploy
pnpm build
NODE_ENV=production node dist/main.js
```

**Frontend:**

```bash
cd apps/web
pnpm install --prod
pnpm build
NODE_ENV=production pnpm start
```

## Matrix/Synapse Setup (Optional)

For real-time chat functionality:

**1. Deploy Matrix Synapse:**

```bash
# Using Docker Compose
docker compose -f docker-compose.prod.yml up -d matrix

# Or install manually: https://matrix-org.github.io/synapse/latest/setup/installation.html
```

**2. Create admin user:**

```bash
docker exec -it marketplace-ts-matrix register_new_matrix_user \
  http://localhost:8008 \
  -c /data/homeserver.yaml \
  -u admin \
  -p ADMIN_PASSWORD \
  --admin
```

**3. Configure backend:**

Update `.env`:

```bash
MATRIX_HOST=matrix.yourdomain.com
MATRIX_USER=@admin:matrix.yourdomain.com
MATRIX_PASSWORD=ADMIN_PASSWORD
```

## Database Backup

**Automated backups:**

```bash
# Create backup script
cat > /opt/marketplace-ts/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/marketplace-ts/backups"
mkdir -p $BACKUP_DIR
docker exec marketplace-ts-postgres pg_dump -U marketplace-ts marketplace-ts | gzip > "$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).sql.gz"
find $BACKUP_DIR -name "backup-*.sql.gz" -mtime +30 -delete
EOF

chmod +x /opt/marketplace-ts/backup.sh

# Add to crontab (daily at 2 AM)
echo "0 2 * * * /opt/marketplace-ts/backup.sh" | sudo crontab -
```

**Manual backup:**

```bash
docker exec marketplace-ts-postgres pg_dump -U marketplace-ts marketplace-ts > backup.sql
```

**Restore:**

```bash
docker exec -i marketplace-ts-postgres psql -U marketplace-ts marketplace-ts < backup.sql
```

## Monitoring & Maintenance

**View logs:**

```bash
# All services
docker compose -f docker-compose.prod.yml logs -f

# Specific service
docker compose -f docker-compose.prod.yml logs -f api
docker compose -f docker-compose.prod.yml logs -f web
```

**Update deployment:**

```bash
# Pull latest changes
git pull

# Rebuild and restart
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# Run migrations
docker compose -f docker-compose.prod.yml exec api sh -c "cd /app/packages/database && npx prisma migrate deploy"
```

**Health checks:**

```bash
# Backend health
curl https://api.yourdomain.com/api/health

# Frontend health
curl https://yourdomain.com/api/health

# Database health
docker exec marketplace-ts-postgres pg_isready -U marketplace-ts
```

## CI/CD with GitHub Actions

The repository includes a GitHub Actions workflow (`.github/workflows/ci.yml`) that:

1. **On Pull Request:** Runs linting, type checking, and builds
2. **On Push to Main:** Builds Docker images and pushes to GitHub Container Registry
3. **Manual Deploy:** SSH into server and pulls latest images

**Setup secrets in GitHub:**

- `DEPLOY_HOST`: Your server IP/hostname
- `DEPLOY_USER`: SSH username
- `DEPLOY_SSH_KEY`: Private SSH key for deployment
- `NEXT_PUBLIC_API_URL`: Public API URL
- `NEXT_PUBLIC_MATRIX_HOST`: Public Matrix host (optional)

## Security Checklist

- [ ] Strong JWT secret configured
- [ ] Database password changed from default
- [ ] SSL certificates installed and configured
- [ ] Firewall configured (allow 80, 443, 22 only)
- [ ] OAuth credentials configured with correct redirect URLs
- [ ] Matrix admin password changed
- [ ] AWS S3 bucket with proper permissions
- [ ] Rate limiting enabled in Nginx
- [ ] Regular backups configured
- [ ] Security headers enabled in Nginx
- [ ] Docker containers running as non-root users

## Troubleshooting

**Service won't start:**

```bash
docker compose -f docker-compose.prod.yml logs <service-name>
```

**Database connection errors:**

```bash
# Check if PostgreSQL is running
docker compose -f docker-compose.prod.yml ps postgres

# Test connection
docker exec marketplace-ts-postgres psql -U marketplace-ts -d marketplace-ts -c "SELECT 1"
```

**Frontend can't reach backend:**

- Check `NEXT_PUBLIC_API_URL` in `.env`
- Verify Nginx configuration
- Check backend logs for errors

**Matrix integration not working:**

- Verify Matrix server is accessible
- Check Matrix credentials in `.env`
- Ensure users have Matrix accounts created (auto-created on registration)

## Performance Optimization

**Database:**

- Enable connection pooling in Prisma
- Add indexes for frequently queried fields
- Regular `VACUUM` and `ANALYZE`

**Frontend:**

- Enable Next.js image optimization
- Configure CDN for static assets
- Enable Redis caching (optional)

**Backend:**

- Enable response caching for GraphQL queries
- Use DataLoader for batch queries
- Monitor and optimize N+1 queries

## Scaling

For high-traffic deployments:

1. **Horizontal Scaling:**
   - Run multiple backend/frontend containers behind load balancer
   - Use managed PostgreSQL (AWS RDS, Digital Ocean)
   - Set up Redis for session storage

2. **Database Optimization:**
   - Set up read replicas
   - Enable query caching
   - Optimize indexes

3. **CDN & Caching:**
   - Use CloudFlare or AWS CloudFront
   - Cache static assets
   - Enable GraphQL query caching

## Support

For issues, please open a GitHub issue or contact the development team.
