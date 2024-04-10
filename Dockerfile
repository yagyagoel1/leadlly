FROM node:20

WORKDIR /app

COPY package* .


RUN npm install 


COPY . .

RUN npm run build

EXPOSE 8000

CMD ["node","-r", "dotenv/config" ,"--experimental-json-modules","dist/index.js"]