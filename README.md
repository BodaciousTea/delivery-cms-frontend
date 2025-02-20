# Delivery CMS Setup Guide

## Frontend Setup

### Clone the Repository
```sh
git clone https://github.com/BodaciousTea/delivery-cms-frontend/tree/master
```

### Install Dependencies
```sh
npm install
```

### Local Development
```sh
npm run dev
```

**or**

```sh
npm run build
npm run preview
```

### Production Build & Deployment
```sh
npm run build
npm run deploy
```

---

## Backend Setup

### Navigate to the Backend Directory
```sh
cd delivery-cms/backend
```

### Install Dependencies
```sh
npm install
```

### Create a `.env` File
Create a `.env` file in the backend directory and add your AWS secret values:

```env
ADMIN_USERNAME=yourAdminUsername
ADMIN_PASSWORD=yourAdminPassword
AWS_REGION=us-east-2
AWS_ACCESS_KEY_ID=yourAccessKey
AWS_SECRET_ACCESS_KEY=yourSecretKey
COGNITO_USER_POOL_ID=yourUserPoolId
S3_BUCKET_NAME=yourS3BucketName
```

### Local Testing
Ensure the backend is running on `process.env.PORT || 3000`.

```sh
node app.js
```

### Deploy to AWS Elastic Beanstalk
```sh
eb deploy
```

