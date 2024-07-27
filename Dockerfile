# Use node image for base image for all stages.
FROM node:18-alpine

# Set working directory for all build stages.
WORKDIR /app


################################################################################
# Copy the rest of the source files into the image.
COPY . .

# Install packages and Run the build script.
RUN npm cache clean --force && npm install
RUN npm run build

################################################################################
# Expose the port that the application listens on.
EXPOSE 3001

# Run the application.
CMD npm start