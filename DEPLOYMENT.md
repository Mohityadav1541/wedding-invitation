# Production Deployment Guide: Railway + Neon Database & VPS

---

## 🚀 Option 1: Railway + Neon Database (Cloud Serverless — Recommended)

This setup pairs a cloud-hosted **Neon PostgreSQL** database with an automatically deploying **Railway** service. Every push to GitHub auto-builds and deploys, while all weddings, RSVPs, settings, and credentials persist safely in Neon.

### Step 1: Create a Free Neon Database
1. Go to [Neon.tech](https://neon.tech) and sign in / sign up (free tier includes 0.5 GB storage and auto-scaling).
2. Click **Create Project**, name it `wedding-invitation`, and click **Create**.
3. On the Neon dashboard, locate the **Connection Details** box.
4. Select **Node.js** or copy the **Postgres Connection String**:
   ```
   postgresql://[username]:[password]@[endpoint].us-east-2.aws.neon.tech/neondb?sslmode=require
   ```
   *(Keep this string handy for Railway).*

### Step 2: Deploy on Railway
1. Go to [Railway.app](https://railway.com) and log in with your GitHub account.
2. Click **+ New Project** > **Deploy from GitHub repo**.
3. Select your repository: `Mohityadav1541/wedding-invitation`.
4. Click **Add Variables** (or go to **Settings > Variables**) and set:
   - `DATABASE_URL`: Your full Neon PostgreSQL connection string from Step 1.
   - `NODE_ENV`: `production`
   - `PHOTOGRAPHER_PIN`: `YOUR_SECRET_MASTER_PIN` (e.g. `15407610`)
   - `SESSION_EXPIRY_DAYS`: `7`
5. Railway will automatically detect [railway.json](file:///Users/mohit/Desktop/coding/wedding%20invitation/railway.json), run `npm install && npm run build`, and launch the web server.
6. Under **Settings > Networking**, click **Generate Domain** (e.g. `wedding-invitation-production.up.railway.app`) or attach a custom domain.

### Step 3: Verify Deployment
- Open `https://your-app.up.railway.app/api/health` — it should return:
  ```json
  {
    "status": "ok",
    "system": "Royal Rajasthani Multi-Wedding Platform",
    "database": "neon-postgresql"
  }
  ```
- Public wedding: `https://your-app.up.railway.app/w/rahul-weds-priya`
- Photographer portal: `https://your-app.up.railway.app/photographer`
- Wedding admin portal: `https://your-app.up.railway.app/wedding-admin`

---

## 🖥️ Option 2: VPS Deployment (Ubuntu / Debian / AWS EC2 / DigitalOcean)

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
