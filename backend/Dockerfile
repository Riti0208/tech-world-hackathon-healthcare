FROM node:22.20.0-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

# Generate Prisma Client at runtime instead of build time
EXPOSE 3000

CMD ["sh", "-c", "npx prisma generate && npm run dev"]
