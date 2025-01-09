# Base image for Node.js
FROM node:16-alpine

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application code
COPY . .

# Build the application
RUN npm run build

# Expose the application port
EXPOSE 3000

# Command to start the application
CMD ["npm", "run", "start:prod"]
