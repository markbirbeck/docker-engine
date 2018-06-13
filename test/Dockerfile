FROM node:8.11.3-alpine

# Create app directory and set as working directory:
#
WORKDIR /usr/src/app

# Use the package.json to install dependencies:
#
COPY package.json /usr/src/app
RUN npm install --no-package-lock

# Install test environment:
#
RUN npm install --no-package-lock \
  tap

# Ensure we can run installed modules:
#
ENV PATH=./node_modules/.bin:$PATH
