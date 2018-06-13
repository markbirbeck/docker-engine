FROM node:8.11.3-alpine

# Create app directory and set as working directory:
#
WORKDIR /usr/src/app

# Use the package.json to install dependencies:
#
COPY package.json /usr/src/app
RUN npm install --no-package-lock

# Dependencies will be global so add to path:
#
ENV NODE_PATH /usr/local/lib/node_modules

# ...TAP
RUN npm install -g \
  tap