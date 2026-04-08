# Market Place

Monorepo cho du an marketplace/e-commerce voi frontend va backend tach rieng, dung `npm workspaces` de quan ly chung.

## Tech Stack

- Frontend: React, Vite, Ant Design, React Query, Zustand
- Backend: Node.js, Express, Prisma, PostgreSQL
- Shared package: thu vien dung chung giua frontend va backend

## Cau Truc Thu Muc

```text
market_place/
|-- backend/
|-- frontend/
|-- shared/
|-- package.json
`-- README.md
```

## Yeu Cau

- Node.js 18+
- npm 9+
- PostgreSQL

## Cai Dat

```bash
npm install
```

Hoac dung script co san:

```bash
npm run install:all
```

## Cau Hinh Moi Truong

Tao file `backend/.env` tu `backend/.env.example`:

```env
PORT=5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
DATABASE_URL=postgres://postgres:your_password@localhost:5432/database_name?schema=public
```

## Chay Du An

Chay ca frontend va backend:

```bash
npm run dev
```

Chay rieng tung phan:

```bash
npm run dev:backend
npm run dev:frontend
```

## Scripts Chinh

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

## Ports Mac Dinh

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Frontend proxy API `/api` sang backend khi chay dev

## Database

Backend dang dung Prisma voi PostgreSQL. Neu can seed du lieu:

```bash
npm run seed --workspace backend
```

## Build Production

```bash
npm run build
npm run start
```

## Push Len GitHub

Sau khi tao repository tren GitHub, ban co the dung cac lenh sau:

```bash
git remote add origin <YOUR_GITHUB_REPO_URL>
git add .
git commit -m "Initial commit"
git branch -M main
git push -u origin main
```
