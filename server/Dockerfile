# Step 1: Tell Docker what base environment we need (Node version)
FROM node:20-alpine

# Step 2: Create a directory inside the container for our app code
WORKDIR /app

# Step 3: Copy package files first to leverage Docker's caching mechanism
COPY package*.json ./

# Step 4: Install your project modules inside the container
RUN npm ci --only=production

# Step 5: Copy the rest of your application code
COPY . .

# Step 6: Inform Docker which port your Express app listens to (e.g., 3000)
EXPOSE 3000

# Step 7: Define the command that starts your server inside the box
CMD ["npm", "run", "dev"]