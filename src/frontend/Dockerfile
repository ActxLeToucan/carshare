FROM node:lts-alpine
WORKDIR /app
COPY . .
RUN npm i -g http-server
RUN npm i
RUN npm run build
EXPOSE 8080
CMD [ "http-server", "./dist", "-p", "8080" ]