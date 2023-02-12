FROM node:lts-alpine
WORKDIR /app
COPY . .
RUN npm i -g pm2
RUN npm i
RUN npx prisma migrate dev
RUN npm run build
EXPOSE 8080
CMD [ "http-server", "./dist", "-p", "8080" ]