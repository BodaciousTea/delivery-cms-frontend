FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first (improves caching)
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the rest of the application files
COPY . .

# Expose the application's port (Elastic Beanstalk uses 8080)
EXPOSE 8080

# Start the application
CMD ["node", "app.js"]
