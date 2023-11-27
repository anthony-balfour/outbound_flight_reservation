# Sets the node.js runtime as the base image

FROM node:14

#Sets the working directory inside of the container
WORKDIR /app

#copy the package.json and package-lock.json to the working directory
COPY package*.json ./

#Install dependencies
RUN npm install

#Copy the rest of the app files to the working directory
COPY . .

# Expose the port on which your app listens

EXPOSE 8000

# The command to run the app

CMD ["npm", "start"]




