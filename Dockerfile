FROM node:12

RUN apt-get update -y && apt-get upgrade -y

RUN mkdir -p /app/.data
WORKDIR /app

COPY ./app/package*.json ./
RUN npm ci --only=production

# Bundle app source
COPY app .

EXPOSE 8000
ENTRYPOINT ["node", "/app/server.js"]
