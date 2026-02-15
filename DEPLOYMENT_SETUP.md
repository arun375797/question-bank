# Quick Deployment Setup Guide

## Overview

- **Frontend**: Deployed on Vercel
- **Backend**: Deployed on AWS (your choice of method)
- **Database**: MongoDB (MongoDB Atlas recommended)

## Step-by-Step Setup

### 1. Backend Deployment (AWS)

Choose one of the following methods (see `server/AWS_DEPLOYMENT.md` for details):

#### Option A: Elastic Beanstalk (Recommended for beginners)
```bash
cd server
eb init
eb create
eb setenv MONGODB_URI="your-mongodb-uri"
eb deploy
```

#### Option B: ECS with Fargate (Containerized)
```bash
# Build and push Docker image to ECR
docker build -t question-bank-api .
# Follow ECS setup in AWS_DEPLOYMENT.md
```

#### Option C: EC2 (Traditional)
```bash
# SSH into EC2 instance
# Install Node.js, clone repo, install dependencies
# Use PM2 to run: pm2 start src/index.js
```

### 2. Get Your Backend URL

After deployment, note your backend URL:
- Elastic Beanstalk: `https://your-app.elasticbeanstalk.com`
- ECS/ALB: `https://your-alb-url.amazonaws.com`
- EC2: `http://your-ec2-ip:5000` (or your domain)

### 3. Update Frontend Environment Variable

In Vercel Dashboard:
1. Go to your project → Settings → Environment Variables
2. Add: `VITE_API_BASE` = `https://your-aws-backend-url.com`
   - **Important**: Don't include `/api` in the URL - the client adds it automatically
   - Example: `https://question-bank-api.elasticbeanstalk.com`

### 4. Redeploy Frontend

After setting the environment variable, Vercel will automatically redeploy, or you can trigger a manual redeploy.

## Testing

1. **Backend Health Check**: Visit `https://your-backend-url.com/api/health`
   - Should return: `{"success":true,"message":"Domain Question Bank API is running"}`

2. **Frontend**: Visit your Vercel URL
   - Should load and connect to your AWS backend

## Troubleshooting

### CORS Errors
- Ensure your backend CORS includes your Vercel domain
- Check `server/src/index.js` CORS configuration

### Connection Refused
- Check AWS Security Groups allow inbound traffic on port 5000 (or your port)
- Verify MongoDB Atlas IP whitelist includes your AWS IP ranges

### Environment Variables
- Backend: Set `MONGODB_URI` in AWS (EB environment, ECS secrets, or EC2 .env)
- Frontend: Set `VITE_API_BASE` in Vercel (without `/api` suffix)

## Security Checklist

- [ ] MongoDB Atlas IP whitelist configured
- [ ] AWS Security Groups properly configured
- [ ] Environment variables set (not hardcoded)
- [ ] HTTPS enabled (use ALB/CloudFront for production)
- [ ] CORS configured correctly

