# Use the official Node.js image as the base image
FROM node:alpine

# Set the working directory inside the container
WORKDIR /app

# Copy files to the working directory
COPY . .

# Install dependencies
RUN npm install

# Expose a port (if your application listens on a specific port)
EXPOSE 3000

# Define the command to run your application
CMD [ "npm", "start" ]