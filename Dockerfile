FROM node:slim

# Create app directory
WORKDIR /usr/src/app

# Define Default Port
ENV PORT=8080

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

# Build Source
RUN npm run build

RUN rm -rf ./src

EXPOSE 8080
CMD [ "npm", "start" ]
