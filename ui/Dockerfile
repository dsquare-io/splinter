FROM node:18-alpine AS node

WORKDIR /app

COPY ./package.json /app/package.json
COPY ./package-lock.json /app/package-lock.json
RUN npm install

COPY ./ /app/
RUN npm run build

FROM nginx:latest
COPY --from=node dist/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/nginx.conf
