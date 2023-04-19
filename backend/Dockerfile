# Use the official Node.js 14 image as the base image
FROM node:14

# Install pandoc and other necessary packages
RUN apt-get update && \
    apt-get install -y pandoc

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install --no-optional --production

# Copy the application code to the working directory
COPY config config
COPY src src
COPY public public

# Expose port 8082 for the Node.js application
EXPOSE 8082

# Start the Node.js application
CMD [ "npm", "start" ]