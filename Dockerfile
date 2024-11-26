FROM node:latest
WORKDIR /src
COPY . .
RUN yarn install \\
    --prefer-offline \\
    --frozen-lockfile \\
    --non-interractive \\
    --production=true
RUN yarn build
CMD ["yarn", "start"]
