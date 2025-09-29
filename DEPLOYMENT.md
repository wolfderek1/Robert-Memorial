# Deployment Guide

## Option 1: Deploy to Netlify (Recommended for Public Access)

### Step 1: Prepare for Netlify
The site is already configured with Netlify Functions for the message board.

### Step 2: Deploy to Netlify
1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add Netlify Functions support"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Connect your GitHub account
   - Select the `Robert-Memorial` repository
   - Deploy settings are automatically configured via `netlify.toml`

3. **Your site will be live** at: `https://your-site-name.netlify.app`

### Limitations of Netlify Functions:
- Messages are stored in memory only (reset on each function cold start)
- For persistent storage, you'd need to integrate with a database service

## Option 2: Deploy to a VPS/Cloud Server

### For persistent message storage, deploy to:
- **DigitalOcean Droplet**
- **AWS EC2**
- **Google Cloud Compute**
- **Heroku** (with file persistence add-on)

### Steps for VPS deployment:
1. **Setup server** with Node.js
2. **Clone repository**:
   ```bash
   git clone https://github.com/wolfderek1/Robert-Memorial.git
   cd Robert-Memorial
   npm install
   ```
3. **Run with PM2** (process manager):
   ```bash
   npm install -g pm2
   pm2 start server.js --name "robert-memorial"
   pm2 startup
   pm2 save
   ```
4. **Setup reverse proxy** (Nginx) and SSL certificate

## Option 3: Hybrid Approach (Recommended)

### Use Netlify + External Database:
1. **Deploy static site to Netlify**
2. **Use external database service**:
   - **Supabase** (PostgreSQL with REST API)
   - **Firebase Firestore**
   - **MongoDB Atlas**
   - **PlanetScale** (MySQL)

This gives you:
- ✅ Global CDN and fast loading
- ✅ Persistent message storage
- ✅ Scalable and reliable
- ✅ Free tiers available

## Current Status

The site is currently configured to work with:
- ✅ **Local development** (Node.js server)
- ✅ **Netlify deployment** (Serverless functions)
- ⚠️ **Messages persist locally but reset on Netlify**

## Making Messages Persistent on Netlify

To make messages persistent on Netlify, you would need to:

1. **Add a database service** (Supabase recommended)
2. **Update Netlify Functions** to use the database
3. **Add environment variables** for database connection

Would you like me to implement persistent storage with Supabase?