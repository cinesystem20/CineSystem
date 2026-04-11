# ── Stage 1: Build ──────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .

# VITE_API_URL se inyecta en build-time como ARG desde Railway
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Stage 2: Nginx (producción) ─────────────────────────────────
FROM nginx:alpine

# envsubst para reemplazar ${PORT} en nginx.conf en runtime
RUN apk add --no-cache gettext

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Railway expone $PORT dinámicamente; el entrypoint de nginx:alpine
# procesa los templates automáticamente si están en /etc/nginx/templates/
ENV PORT=80

EXPOSE $PORT

CMD ["/bin/sh", "-c", "envsubst '${PORT}' < /etc/nginx/templates/default.conf.template > /etc/nginx/conf.d/default.conf && nginx -g 'daemon off;'"]
