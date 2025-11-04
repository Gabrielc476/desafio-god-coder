# Estágio 1: Build
FROM node:20-alpine AS builder
WORKDIR /app

# Instala dependências
COPY package*.json ./
RUN npm install

# Copia o restante do código e faz o build
COPY . .
RUN npm run build

# Estágio 2: Produção (Otimizado para Next.js)
FROM node:20-alpine
WORKDIR /app

ENV NODE_ENV=production

# Copia os artefatos de build do estágio anterior
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expõe a porta padrão do Next.js
EXPOSE 3000

# Comando para iniciar o servidor Next.js em produção
CMD ["npm", "start"]
