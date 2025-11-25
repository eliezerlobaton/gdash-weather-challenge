# Usar a imagem Go como base única
FROM golang:1.21-alpine

WORKDIR /app

# Instalar versão específica de certificados e criar usuário não-root
RUN apk --no-cache add ca-certificates=20250911-r0 && adduser -D -s /bin/sh appuser

# Copiar arquivos de dependência e baixá-las (aproveita o cache do Docker)
COPY go.mod go.sum ./
RUN go mod download

# Copiar todo o código-fonte
COPY . .

# Compilar a aplicação Go E mudar o proprietário em um único passo
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o rabbitmq-worker . && \
    chown -R appuser:appuser /app

# Mudar para o usuário não-root
USER appuser

# Healthcheck para verificar se o binário é executável
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD ./rabbitmq-worker --help > /dev/null 2>&1 || exit 1

# Comando para executar a aplicação
CMD ["./rabbitmq-worker"]
