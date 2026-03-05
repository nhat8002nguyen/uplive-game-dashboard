# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder

WORKDIR /app

RUN npm install -g pnpm

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Stage 2: Serve with nginx
FROM nginx:1.25-alpine

COPY --from=frontend-builder /app/dist /usr/share/nginx/html

EXPOSE 80 443
