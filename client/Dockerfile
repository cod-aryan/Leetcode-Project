# Stage 1: Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# 🚀 THE FIX: Tell Docker to grab the .env file you just created on the VM host
# The asterisk (*) prevents the build from crashing if the file is missing
COPY .env* ./

# Now Vite will successfully find the file and bake the URL into the dist folder!
RUN npm run build

# Stage 2: Production Nginx stage
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]