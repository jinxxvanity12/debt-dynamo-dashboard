
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Create a volume to persist data
VOLUME /usr/share/nginx/html/data

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Create a directory for user data persistence
RUN mkdir -p /usr/share/nginx/html/data/users
RUN chmod 777 /usr/share/nginx/html/data/users

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
