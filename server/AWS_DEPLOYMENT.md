# AWS Deployment Guide

This guide covers deploying the Question Bank API to AWS using various methods.

## Prerequisites

- AWS Account
- AWS CLI installed and configured
- MongoDB Atlas account (or MongoDB instance)
- Docker (for containerized deployment)

## Option 1: AWS Elastic Beanstalk (Easiest)

### 1. Install EB CLI

```bash
pip install awsebcli
```

### 2. Initialize Elastic Beanstalk

```bash
cd server
eb init -p "Node.js" -r us-east-1 question-bank-api
```

### 3. Create Environment

```bash
eb create question-bank-api-env
```

### 4. Set Environment Variables

```bash
eb setenv MONGODB_URI="your-mongodb-connection-string" NODE_ENV=production
```

### 5. Deploy

```bash
eb deploy
```

### 6. Get URL

```bash
eb status
```

## Option 2: AWS ECS with Fargate (Containerized)

### 1. Build and Push Docker Image to ECR

```bash
# Create ECR repository
aws ecr create-repository --repository-name question-bank-api

# Get login token
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build image
cd server
docker build -t question-bank-api .

# Tag image
docker tag question-bank-api:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/question-bank-api:latest

# Push image
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/question-bank-api:latest
```

### 2. Create ECS Cluster

```bash
aws ecs create-cluster --cluster-name question-bank-cluster
```

### 3. Create Task Definition

Update `ecs-task-definition.json` with your account details, then:

```bash
aws ecs register-task-definition --cli-input-json file://ecs-task-definition.json
```

### 4. Create Service

```bash
aws ecs create-service \
  --cluster question-bank-cluster \
  --service-name question-bank-api \
  --task-definition question-bank-api \
  --desired-count 1 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}"
```

### 5. Create Application Load Balancer (Optional)

For production, set up an ALB to route traffic to your ECS service.

## Option 3: AWS EC2 (Traditional)

### 1. Launch EC2 Instance

- Choose Amazon Linux 2 or Ubuntu
- Security Group: Allow port 5000 (or your chosen port)
- Configure security group to allow HTTP/HTTPS

### 2. Connect and Setup

```bash
# SSH into instance
ssh -i your-key.pem ec2-user@your-instance-ip

# Install Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Install PM2
npm install -g pm2

# Clone repository
git clone your-repo-url
cd Domain-Question-Bank/server

# Install dependencies
npm install --production

# Create .env file
nano .env
# Add: MONGODB_URI=your-connection-string
# Add: PORT=5000
# Add: NODE_ENV=production

# Start with PM2
pm2 start src/index.js --name question-bank-api
pm2 save
pm2 startup
```

### 3. Configure Nginx (Reverse Proxy)

```bash
sudo yum install nginx -y

# Edit nginx config
sudo nano /etc/nginx/conf.d/question-bank.conf
```

Add:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

## Environment Variables

Set these in your AWS environment:

- `MONGODB_URI` - Your MongoDB connection string
- `NODE_ENV` - Set to `production`
- `PORT` - Port number (default: 5000)

## Security Considerations

1. **MongoDB Atlas**: 
   - Whitelist your AWS IP ranges
   - Use strong authentication
   - Enable SSL/TLS

2. **Security Groups**:
   - Only allow necessary ports
   - Restrict access to specific IPs if possible

3. **Secrets Management**:
   - Use AWS Secrets Manager for sensitive data
   - Never commit `.env` files

4. **HTTPS**:
   - Use AWS Certificate Manager (ACM) for SSL
   - Configure Application Load Balancer with HTTPS

## Updating Frontend

After deploying to AWS, update your frontend environment variable:

```bash
# In Vercel, set:
VITE_API_BASE=https://your-aws-api-url.com
```

Or if using a custom domain:

```bash
VITE_API_BASE=https://api.yourdomain.com
```

## Monitoring

- **CloudWatch**: View logs and metrics
- **ECS**: Use CloudWatch Container Insights
- **EC2**: Use CloudWatch agent for detailed metrics

## Troubleshooting

1. **Connection Issues**: Check security groups and network ACLs
2. **MongoDB Connection**: Verify IP whitelist and connection string
3. **Port Issues**: Ensure the port is open in security groups
4. **Health Checks**: Verify `/api/health` endpoint is accessible

