FROM node:20-alpine

WORKDIR /app

COPY front-end/package.json front-end/package-lock.json ./

RUN npm ci

COPY front-end/ .

EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]