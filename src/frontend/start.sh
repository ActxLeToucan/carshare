RUN npm i -g http-server
RUN npm i
RUN npm run build
http-server -P http://localhost:8080? dist