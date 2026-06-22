FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 5173 
# (Change to 3000 if using Create React App instead of Vite)
CMD ["npm", "run", "dev"] 
# (--host allows Vite to be accessible outside the container)