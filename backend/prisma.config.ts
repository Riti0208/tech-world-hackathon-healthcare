import { defineConfig } from 'prisma/config';

const dbUrl = process.env.DATABASE_URL ?? 'mysql://placeholder:placeholder@localhost:3306/placeholder';
// Prisma CLI requires mysql:// scheme
const prismaUrl = dbUrl.replace(/^mariadb:\/\//, 'mysql://');

export default defineConfig({
  datasource: {
    url: prismaUrl,
  },
});
