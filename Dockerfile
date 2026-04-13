FROM mcr.microsoft.com/playwright:v1.59.1-noble

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

ENV CI=true
ENV HEADLESS=true
ENV FORCE_COLOR=1

CMD ["npm", "run", "test:e2e:report"]
