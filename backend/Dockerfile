# Use the official Node.js image as the base image
FROM node:slim

# Add pandoc
COPY --from=pandoc/minimal:latest /pandoc /bin/pandoc

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the application code to the working directory
COPY config config
COPY public public
COPY tsconfig.json tsconfig.json
COPY src src

RUN npm run compile

# Expose port 8082 for the Node.js application
EXPOSE 8082

# Start the Node.js application
CMD [ "npm", "start" ]
