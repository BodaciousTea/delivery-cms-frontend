
# Setup Guide for Delivery Content Management System

This document provides detailed instructions on setting up the Delivery Content Management System for Ted Koller's software engineering capstone project. The system integrates a secure content delivery functionality into the tedkoller.com website, allowing clients to access and download media files securely.

## Prerequisites

- AWS Account
- Node.js installed on your local machine
- Git installed on your local machine
- An editor like Visual Studio Code

## Frontend Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/BodaciousTea/delivery-cms-frontend.git
   cd delivery-cms-frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Local Development**
   ```bash
   npm run dev
   ```

   Alternatively, for a production build:
   ```bash
   npm run build
   npm run preview
   ```

4. **Deployment to GitHub Pages**
   ```bash
   npm run deploy
   ```

## Backend Setup

1. **Clone the Backend Repository**
   ```bash
   git clone https://gitlab.com/wgu-gitlab-environment/student-repos/tkolle7/d424-software-engineering-capstone.git
   cd d424-software-engineering-capstone
   ```

2. **Navigate to Backend Directory**
   ```bash
   cd delivery-cms/backend
   ```

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Setup AWS Credentials**
   Create a `.env` file in the backend directory with your AWS credentials:
   ```plaintext
   ADMIN_USERNAME=yourAdminUsername
   ADMIN_PASSWORD=yourAdminPassword
   AWS_REGION=us-east-2
   AWS_ACCESS_KEY_ID=yourAccessKey
   AWS_SECRET_ACCESS_KEY=yourSecretKey
   COGNITO_USER_POOL_ID=yourUserPoolId
   S3_BUCKET_NAME=yourS3BucketName
   ```

5. **Local Testing**
   Ensure the backend is running on `process.env.PORT` or 3000.
   ```bash
   node app.js
   ```

6. **Deploy to AWS Elastic Beanstalk**
   Initialize your Elastic Beanstalk application (if not already done):
   ```bash
   eb init -p node.js -r us-east-2 delivery-cms-backend
   ```
   Deploy your application:
   ```bash
   eb deploy
   ```

## Post-Deployment

- **Verify the Application**: Visit your frontend URL hosted on GitHub Pages to ensure it connects properly with your backend hosted on AWS Elastic Beanstalk.
- **Admin Panel**: Log into the admin panel at `https://tedkoller.com/delivery-cms-frontend/#/admin/login` using the credentials specified in your `.env` file to manage users and files.

## Troubleshooting

- **401 Unauthorized Errors**: Check that JWT or basic auth credentials are being passed correctly in API calls.
- **Deployment Failures**: Use the Elastic Beanstalk console to view logs for errors.
- **File Upload/Download Issues**: Ensure that the S3 bucket policies and pre-signed URLs are configured properly.
- **DNS/SSL Warnings**: Confirm that your custom domain is correctly pointed at your EB load balancer and that the SSL certificate covers that domain.
