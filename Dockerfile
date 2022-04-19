FROM node:16 as build

WORKDIR /usr/src/app

# Disable husky
ENV HUSKY_SKIP_HOOKS=1
ENV HUSKY_SKIP_INSTALL=1

COPY package.json .
COPY package-lock.json .

RUN npm ci

COPY . .

RUN npm run build
RUN npm prune --production

FROM node:16 as run

WORKDIR /usr/src/app

COPY --from=build /usr/src/app/.next/ .next/
COPY --from=build /usr/src/app/dist/ ./dist

# The speedtest-net module requires write permissions to it's own folder. This
# is because it stores the required speedtest binary there.
COPY --chown=node:node --from=build /usr/src/app/node_modules/ ./node_modules

EXPOSE 8080

ENV NODE_ENV='production'

CMD ["node", "dist/index.js"]
