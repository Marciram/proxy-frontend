FROM node:18-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY proxy-server.js ./

CMD ["node", "proxy-server.js"]
