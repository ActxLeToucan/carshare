#!/bin/sh

npm i --production=false
npx prisma migrate deploy
npm run build
npm prune
npm run start