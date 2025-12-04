# Dockerfile para Demo/Desenvolvimento
FROM node:24-alpine

WORKDIR /app

# Instala pnpm
RUN corepack enable && corepack prepare pnpm@10.22.0 --activate

# Copia arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instala todas as dependências (incluindo dev)
RUN pnpm install --frozen-lockfile

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
