# Use the official Node.js image as the base image
FROM node:20

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to install dependencies
COPY package.json package-lock.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy the rest of the application code
COPY ../ .

# Build the TypeScript files
RUN npm run build

# Expose the port the app will run on
EXPOSE 3000

# Command to run the app
CMD ["node", "dist/server.js"]
