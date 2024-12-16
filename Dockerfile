FROM node:16-slim
RUN mkdir /app
COPY package.json /app/
WORKDIR /app
COPY . ./

ENV NEXT_PUBLIC_APP_CAPTCHA_KEY="6Le83UopAAAAABxxMZUciOsBoYXrsa3cods4b3I6"
RUN npm install
RUN npm run build
EXPOSE 8080
CMD ["npm", "start"]
