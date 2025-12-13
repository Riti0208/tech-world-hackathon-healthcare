FROM node:22.20.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN chmod +x entrypoint.sh

EXPOSE 5173

ENTRYPOINT ["./entrypoint.sh"]
