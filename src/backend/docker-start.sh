#!/bin/sh

npm i
npx prisma migrate dev
npm run build
npm i -g redoc-cli
npm run docs
npm run start