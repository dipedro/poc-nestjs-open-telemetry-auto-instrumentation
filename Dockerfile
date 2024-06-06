FROM public.ecr.aws/docker/library/node:18.16.0-slim AS build

WORKDIR /usr/src/app

RUN apt-get update -y && apt-get install -y openssl procps

COPY package*.json .

COPY .env ./

RUN npm ci --omit=dev

COPY . .

ENV TZ=America/Sao_Paulo

RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

CMD npm run build && npm run start:prod