# Deployment Guide - dapps.co on Ubuntu with Nginx

This guide will help you deploy the dapps.co application to your Ubuntu server at `/var/www/somi.dapps.co` with nginx and SSL.

## Prerequisites

- Ubuntu server with sudo access
- Nginx already installed and running
- Node.js 18+ installed
- Domain `somi.dapps.co` pointing to your server IP

## Step 1: Install Dependencies

```bash
# Install PM2 globally (for process management)
sudo npm install -g pm2

# Install certbot for SSL
sudo apt update
sudo apt install certbot python3-certbot-nginx -y
```

## Step 2: Clone and Setup Application

```bash
# Create directory
sudo mkdir -p /var/www/somi.dapps.co

# Set ownership to your user (replace 'username' with your actual username)
sudo chown -R $USER:$USER /var/www/somi.dapps.co

# Navigate and clone/copy your application
cd /var/www/somi.dapps.co

# Copy your application files here (or git clone if using git)
# If copying from current location:
# rsync -av /home/mohit/Metadata/dapps.co/somnia/somnia-social-app/ /var/www/somi.dapps.co/

# Install dependencies
npm install --legacy-peer-deps

# Build the application
npm run build
```

## Step 3: Configure Environment Variables

Create a `.env.local` file in `/var/www/somi.dapps.co`:

```bash
# Database configuration (update with your actual values)
DATABASE_URL=postgresql://postgres.ahismgszdbygxtcrynci:PASSWORD@aws-1-ap-south-1.pooler.supabase.com:5432/postgres

# Add any other environment variables needed
```

## Step 4: Setup PM2 Process Manager

```bash
cd /var/www/somi.dapps.co

# Start the application with PM2
pm2 start npm --name "dapps-somi" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the command that PM2 outputs (it will give you a sudo command to run)

# Check status
pm2 status
pm2 logs dapps-somi
```

## Step 5: Configure Nginx

Create nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/somi.dapps.co
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name somi.dapps.co;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/somi.dapps.co /etc/nginx/sites-enabled/

# Test nginx configuration
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

## Step 6: Setup SSL with Let's Encrypt

```bash
# Obtain SSL certificate
sudo certbot --nginx -d somi.dapps.co

# Follow prompts:
# - Enter your email
# - Agree to terms
# - Choose whether to redirect HTTP to HTTPS (recommend yes)

# Certbot will automatically update your nginx config
```

Your nginx config will be automatically updated to look like this:

```nginx
server {
    server_name somi.dapps.co;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl;
    ssl_certificate /etc/letsencrypt/live/somi.dapps.co/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/somi.dapps.co/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
}

server {
    if ($host = somi.dapps.co) {
        return 301 https://$host$request_uri;
    }

    listen 80;
    server_name somi.dapps.co;
    return 404;
}
```

## Step 7: Verify Deployment

```bash
# Check PM2 status
pm2 status

# Check nginx status
sudo systemctl status nginx

# View application logs
pm2 logs dapps-somi

# Test the website
curl https://somi.dapps.co
```

Visit https://somi.dapps.co in your browser to confirm it's working!

## Updating the Application

When you need to update the application:

```bash
cd /var/www/somi.dapps.co

# Pull latest changes (if using git)
# git pull

# Or copy new files
# rsync -av /path/to/new/files/ /var/www/somi.dapps.co/

# Install dependencies (if package.json changed)
npm install --legacy-peer-deps

# Rebuild
npm run build

# Restart PM2
pm2 restart dapps-somi

# Check logs
pm2 logs dapps-somi
```

## Useful PM2 Commands

```bash
# View logs
pm2 logs dapps-somi

# Restart application
pm2 restart dapps-somi

# Stop application
pm2 stop dapps-somi

# Start application
pm2 start dapps-somi

# View detailed info
pm2 show dapps-somi

# Monitor
pm2 monit
```

## SSL Certificate Renewal

Certbot sets up auto-renewal, but you can test it:

```bash
# Test renewal
sudo certbot renew --dry-run

# Force renewal (if needed)
sudo certbot renew
```

## Troubleshooting

### Application won't start
```bash
pm2 logs dapps-somi  # Check for errors
```

### Port 3000 already in use
```bash
# Find what's using port 3000
sudo lsof -i :3000

# Kill the process or change the port in your Next.js app
```

### Nginx errors
```bash
# Check nginx error log
sudo tail -f /var/log/nginx/error.log

# Test nginx config
sudo nginx -t
```

### Can't access website
```bash
# Check firewall
sudo ufw status

# Allow HTTP and HTTPS if needed
sudo ufw allow 'Nginx Full'
```

## Notes

- Next.js runs on port 3000 by default
- PM2 manages the Node.js process and auto-restarts on crashes
- Nginx acts as a reverse proxy
- SSL is automatically renewed by certbot
- Your existing nginx sites should not be affected as we created a separate config file
