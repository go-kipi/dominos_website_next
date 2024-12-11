#FROM node:16-slim
#RUN mkdir /app
#COPY package.json /app/
#WORKDIR /app
#COPY . ./
#
#ENV NEXT_PUBLIC_APP_CAPTCHA_KEY="6Le83UopAAAAABxxMZUciOsBoYXrsa3cods4b3I6"
#RUN npm install
#RUN npm run build
#EXPOSE 8080
#CMD ["npm", "start"]
#
FROM node:alpine as dependencies
WORKDIR /inmanage-test
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
FROM node:alpine as builder
WORKDIR /inmanage-test
COPY . .
COPY --from=dependencies /inmanage-test/node_modules ./node_modules
RUN yarn build
FROM node:alpine as runner
WORKDIR /inmanage-test
ENV NODE_ENV production
ENV NEXT_PUBLIC_APP_CAPTCHA_KEY="6Le83UopAAAAABxxMZUciOsBoYXrsa3cods4b3I6"
# If you are using a custom next.config.js file, uncomment this line.
COPY --from=builder /my-project/next.config.js .
COPY --from=builder /inmanage-test/public ./public
COPY --from=builder /inmanage-test/.next ./.next
COPY --from=builder /inmanage-test/node_modules ./node_modules
COPY --from=builder /inmanage-test/package.json ./package.json
EXPOSE 8080
CMD ["yarn", "start"]
