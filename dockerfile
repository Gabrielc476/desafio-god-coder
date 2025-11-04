# Estágio 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
# Assumindo que seu script de build se chama 'build'
RUN npm run build

# Estágio 2: Produção
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/dist ./dist

# --- CORREÇÃO AQUI ---
# Copia o tsconfig.json para que o tsconfig-paths possa lê-lo
COPY --from=builder /app/tsconfig.json ./tsconfig.json

EXPOSE 3333

# O script "start" do seu package.json (node -r tsconfig-paths/register dist/main/server.js) será usado
CMD ["npm", "start"]
