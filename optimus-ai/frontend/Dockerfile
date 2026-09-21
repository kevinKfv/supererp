FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Expose port for Vite dev server
EXPOSE 5173

# Run the dev server and bind to all interfaces
CMD ["npm", "run", "dev", "--", "--host"]
