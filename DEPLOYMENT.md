# Production VPS Deployment Guide (Ubuntu / Debian / AWS EC2 / DigitalOcean)

This guide walks you through deploying the **Royal Rajasthani Multi-Wedding Platform** to your own VPS server using **Node.js**, **PM2**, and **Nginx with free SSL (Certbot)**.

---

## 1. Prerequisites on Your VPS

Connect to your VPS via SSH:
```bash
ssh root@YOUR_SERVER_IP
```

Update packages and install essential utilities:
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl git ufw nginx
```

---

## 2. Install Node.js (v20 LTS) & PM2

Install Node.js 20 LTS via NodeSource:
```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

Verify installation:
```bash
node -v   # Should show v20.x.x
npm -v
```

Install PM2 globally to keep the application running 24/7:
```bash
sudo npm install -g pm2
```

---

## 3. Clone and Build the Application

Clone the repository to `/var/www/wedding-invitation`:
```bash
sudo mkdir -p /var/www
cd /var/www
sudo git clone https://github.com/Mohityadav1541/wedding-invitation.git
sudo chown -R $USER:$USER /var/www/wedding-invitation
cd /var/www/wedding-invitation
```

Install dependencies and build the frontend:
```bash
npm install
npm run build
```

---

## 4. Set Environment Variables

Create your production `.env` file:
```bash
cp .env.example .env
nano .env
```

Ensure the configuration is set:
```env
PORT=5001
NODE_ENV=production
PHOTOGRAPHER_PIN=YOUR_SECURE_8_DIGIT_PIN
SESSION_EXPIRY_DAYS=7
```
*(Save with `Ctrl + O`, then `Enter`, and exit with `Ctrl + X`)*

---

## 5. Start and Daemonize with PM2

Start the application with PM2 using the included configuration:
```bash
pm2 start ecosystem.config.cjs
```

Configure PM2 to automatically restart on server boot:
```bash
pm2 save
pm2 startup
```
*(Copy and run the command printed by `pm2 startup` if instructed)*

Useful PM2 commands:
- `pm2 status`: Check app status
- `pm2 logs wedding-invitation`: Stream live logs
- `pm2 restart wedding-invitation`: Restart the app

---

## 6. Configure Nginx Reverse Proxy

Create an Nginx server block for your domain (replace `yourdomain.com` with your actual domain or server IP):
```bash
sudo nano /etc/nginx/sites-available/wedding-invitation
```

Paste the following configuration:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com; # Or your server IP

    client_max_body_size 30M;

    location / {
        proxy_pass http://127.0.0.1:5001;
        proxy_http_version 1.1;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;

        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_connect_timeout 60s;
        proxy_read_timeout 60s;
    }
}
```

Enable the site and verify syntax:
```bash
sudo ln -s /etc/nginx/sites-available/wedding-invitation /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 7. Enable SSL with Let's Encrypt (Certbot)

If using a custom domain pointing to your VPS IP:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```
Follow the prompts. Certbot will automatically configure HTTPS and auto-renew certificates.

---

## 8. Configure Firewall (UFW)

Secure your server allowing only SSH, HTTP, and HTTPS:
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 9. Future Updates

Whenever you push new updates to GitHub, update your VPS with:
```bash
cd /var/www/wedding-invitation
git pull origin main
npm install
npm run build
pm2 reload wedding-invitation
```
