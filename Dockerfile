FROM node:20-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY apps ./apps
COPY packages ./packages
RUN npm run build
FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
ENV PORT=3000 MOCK_MODE=true
EXPOSE 3000
USER node
CMD ["node", "dist/apps/web/server.js"]
