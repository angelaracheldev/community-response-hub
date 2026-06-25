# FROM node:20-alpine

# WORKDIR /app

# COPY package.json package-lock.json* ./
# RUN npm install --production

# COPY . ./

# EXPOSE 5000

# CMD ["npm", "start"]


FROM node:20-alpine

WORKDIR /app

# Install build dependencies for bcrypt
RUN apk add --no-cache \
    python3 \
    make \
    g++ 

COPY package.json package-lock.json* ./

# Install ALL deps first (important for native modules)
RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]