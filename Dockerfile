FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
EXPOSE 3002
COPY . .
COPY ./config/.env ./config/.env
CMD ["node","index.js"]
 
