FROM node:22-alpine

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

RUN mkdir -p uploads/booksImages logs

EXPOSE 8000

CMD ["node", "index.js"]