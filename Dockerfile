FROM node

WORKDIR /myapp

COPY . .

RUN npm init -y
RUN npm install

EXPOSE 3000

CMD [ "node","server.js" ]