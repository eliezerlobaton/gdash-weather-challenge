# Dockerfile para Demo/Desenvolvimento
FROM node:22-alpine

WORKDIR /app

# Instala pnpm via npm (mais confiável)
RUN npm install -g pnpm@10.24.0

# Copia arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instala todas as dependências (incluindo dev)
RUN pnpm install 

# Copia código fonte
COPY . .

# Builda a aplicação
RUN pnpm run build

# Expõe a porta
EXPOSE 3000

# Health check - verifica se a API está respondendo
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/api/docs', (r) => process.exit((r.statusCode >= 200 && r.statusCode < 400) ? 0 : 1)).on('error', () => process.exit(1))"

# Inicia a aplicação
CMD ["pnpm", "run", "start:prod"]
