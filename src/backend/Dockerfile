FROM node:lts-alpine
WORKDIR /app
COPY . .
EXPOSE 8080
RUN chmod +x ./docker-start.sh
ENTRYPOINT [ "/app/docker-start.sh" ]
