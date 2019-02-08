FROM node:10.15-alpine

RUN apk update && apk upgrade && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/community >> /etc/apk/repositories && \
    echo @edge http://nl.alpinelinux.org/alpine/edge/main >> /etc/apk/repositories && \
    apk add --no-cache chromium@edge harfbuzz@edge nss@edge

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package*.json ./
COPY index.js ./
RUN npm install --no-package-lock

RUN addgroup -S tracker && adduser -S -g tracker tracker \
    && chown -R tracker:tracker /home/tracker \
    && chown -R tracker:tracker /usr/src/app
USER tracker

EXPOSE 5000
CMD [ "npm", "start" ]
