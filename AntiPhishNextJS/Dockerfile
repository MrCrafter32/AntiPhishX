FROM node:18

WORKDIR /app
COPY . .
COPY .env .env
RUN npm install
RUN npm run build

EXPOSE 3000
CMD ["npm", "run", "start"]
