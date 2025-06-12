FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
EXPOSE 3002
COPY . .
CMD ["node","index.js"]
 
