# Dockerfile para Demo/Desenvolvimento
FROM golang:1.23-alpine

WORKDIR /app

# Instalar certificados e criar usuário não-root
RUN apk --no-cache add ca-certificates && adduser -D -s /bin/sh appuser

# Copiar arquivos de dependência
COPY go.mod go.sum ./
RUN go mod download

# Copiar código-fonte
COPY . .

# Compilar a aplicação
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o rabbitmq-worker . && \
    chown -R appuser:appuser /app

# Mudar para usuário não-root
USER appuser

# Healthcheck simples - verifica se o processo está rodando
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD pgrep -f rabbitmq-worker || exit 1

# Executar a aplicação
CMD ["./rabbitmq-worker"]
