FROM gcr.io/google-appengine/nodejs

WORKDIR /app

ENV NEXT_PUBLIC_APP_CAPTCHA_KEY="${NEXT_PUBLIC_APP_CAPTCHA_KEY}"

COPY package.json /app/
RUN npm install
COPY . /app/

EXPOSE 8080

CMD ["npm", "start"]
