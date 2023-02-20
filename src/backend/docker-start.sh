#!/bin/sh

npm i --production=false
npx prisma migrate deploy
npm run build
npm prune
npm i -g redoc-cli
npm run docs
npm run start