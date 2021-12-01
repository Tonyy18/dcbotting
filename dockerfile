FROM node:16
WORKDIR /dcbotting
COPY . .
RUN npm install
EXPOSE 8000
CMD ["node", "app.js"]
