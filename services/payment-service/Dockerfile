FROM node:20-alpine
WORKDIR /app
COPY package.json ./
COPY prisma ./prisma
RUN npm install --omit=dev
RUN npx prisma generate
COPY src ./src
EXPOSE 3005
CMD ["npm", "start"]
