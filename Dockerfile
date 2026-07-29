FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN npm run build
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY package.json ./
ENV PORT=3000 MOCK_MODE=true
EXPOSE 3000
CMD ["node", "dist/apps/web/server.js"]
