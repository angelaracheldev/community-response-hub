FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . ./

ARG EXPO_PUBLIC_API_URL
ENV EXPO_PUBLIC_API_URL=$EXPO_PUBLIC_API_URL

RUN npm run build:web

EXPOSE 3000

CMD ["sh", "-c", "npx serve dist -s -l ${PORT:-3000}"]
