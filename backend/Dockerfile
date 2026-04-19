FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
COPY backend/package.json ./backend/package.json
COPY frontend/package.json ./frontend/package.json
COPY shared/package.json ./shared/package.json

RUN npm ci

COPY backend ./backend
COPY shared ./shared

RUN npm run build --workspace shared
RUN npx prisma generate --schema backend/prisma/schema.prisma
RUN npm run build --workspace backend

EXPOSE 5000

CMD ["sh", "-c", "cd backend && npx prisma migrate deploy && node dist/server.js"]
