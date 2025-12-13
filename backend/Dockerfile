FROM node:22.20.0-alpine

WORKDIR /app

COPY backend/package*.json ./

RUN npm install

COPY backend/ .
COPY shared/ /shared/

RUN chmod +x entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
