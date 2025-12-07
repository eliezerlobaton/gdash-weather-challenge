# 🌦️ GDASH Weather API

API RESTful desenvolvida com NestJS para gerenciar dados climáticos, insights gerados por IA e autenticação de usuários.

[![NestJS](https://img.shields.io/badge/NestJS-11.0-E0234E?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-9.0-47A248?logo=mongodb)](https://www.mongodb.com/)
[![pnpm](https://img.shields.io/badge/pnpm-10.22-F69220?logo=pnpm)](https://pnpm.io/)

---

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Arquitetura](#-arquitetura)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Execução](#-execução)
- [Documentação da API](#-documentação-da-api)
- [Testes](#-testes)
- [Docker](#-docker)
- [Segurança](#-segurança)

---

## 🎯 Visão Geral

A **GDASH Weather API** é o backend do sistema de monitoramento climático, responsável por:

- 📊 Armazenar e gerenciar logs de dados climáticos
- 🤖 Gerar insights inteligentes sobre padrões climáticos
- 👥 Gerenciar usuários e autenticação JWT
- 📤 Exportar dados em formatos CSV/XLSX
- 🔌 Integrar com APIs externas (opcional)
- 📨 Comunicação via RabbitMQ com workers

---

## 🏗️ Arquitetura

### Arquitetura Geral do Sistema

```mermaid
flowchart TB
    subgraph Coleta["📊 Coleta de Dados"]
        A[Python Collector]
    end
    
    subgraph Mensageria["📨 Sistema de Mensageria"]
        B[RabbitMQ]
    end
    
    subgraph Processamento["⚡ Processamento"]
        C[Go Worker]
    end
    
    subgraph Backend["🚀 Backend API"]
        D[NestJS API]
    end
    
    subgraph Dados["💾 Armazenamento"]
        E[(MongoDB)]
    end
    
    subgraph Frontend["🎨 Interface"]
        F[React Dashboard]
    end
    
    A -->|publica dados| B
    B -->|consome mensagens| C
    C -->|HTTP POST| D
    D -->|persiste| E
    D -->|REST API| F
    F -->|autenticação JWT| D
    
    style A fill:#306998,stroke:#FFD43B,stroke-width:3px,color:#fff
    style B fill:#FF6600,stroke:#fff,stroke-width:2px,color:#fff
    style C fill:#00ADD8,stroke:#00758F,stroke-width:2px,color:#fff
    style D fill:#E0234E,stroke:#fff,stroke-width:3px,color:#fff
    style E fill:#4DB33D,stroke:#3FA037,stroke-width:2px,color:#fff
    style F fill:#61DAFB,stroke:#20232A,stroke-width:2px,color:#20232A
```

### Arquitetura da API (NestJS)

```mermaid
graph TB
    subgraph Client["🎨 Cliente"]
        CLI[React Frontend]
    end
    
    subgraph API["🚀 NestJS API"]
        subgraph Controllers["📡 Controllers Layer"]
            AC[Auth Controller]
            WC[Weather Controller]
            UC[Users Controller]
        end
        
        subgraph Services["⚙️ Services Layer"]
            AS[Auth Service]
            WS[Weather Service]
            WIS[Insights Service]
            US[Users Service]
        end
        
        subgraph Guards["🛡️ Guards & Interceptors"]
            JG[JWT Guard]
            LI[Logging Interceptor]
            TI[Transform Interceptor]
        end
        
        subgraph Database["💾 Database Layer"]
            MON[(MongoDB)]
        end
    end
    
    CLI -->|HTTP Request| Controllers
    Controllers -->|JWT Validation| JG
    JG -->|Authorized| Services
    Controllers -->|Logging| LI
    Services -->|Query/Update| MON
    Services -->|Response| TI
    TI -->|Formatted| CLI
    
    AC --> AS
    WC --> WS
    WC --> WIS
    UC --> US
    
    style CLI fill:#61DAFB,stroke:#20232A,stroke-width:2px,color:#20232A
    style Controllers fill:#E0234E,stroke:#fff,stroke-width:2px,color:#fff
    style Services fill:#3178C6,stroke:#235A97,stroke-width:2px,color:#fff
    style Guards fill:#FFA500,stroke:#CC8400,stroke-width:2px,color:#fff
    style MON fill:#4DB33D,stroke:#3FA037,stroke-width:2px,color:#fff
```

### Fluxo de Autenticação

```mermaid
sequenceDiagram
    participant F as Frontend
    participant A as Auth Controller
    participant S as Auth Service
    participant DB as MongoDB
    participant J as JWT Service
    
    F->>A: POST /api/auth/login
    A->>S: login(email, password)
    S->>DB: findOne(email)
    DB-->>S: user
    S->>S: bcrypt.compare(password)
    alt Credenciais válidas
        S->>J: sign(payload)
        J-->>S: access_token
        S-->>A: { access_token, user }
        A-->>F: 200 OK
    else Credenciais inválidas
        S-->>A: UnauthorizedException
        A-->>F: 401 Unauthorized
    end
```

### Fluxo de Dados Climáticos

```mermaid
sequenceDiagram
    participant W as Go Worker
    participant C as Weather Controller
    participant S as Weather Service
    participant I as Insights Service
    participant DB as MongoDB
    participant F as Frontend
    
    W->>C: POST /api/weather/logs
    C->>C: Validate DTO
    C->>S: create(weatherData)
    S->>DB: save(weatherLog)
    DB-->>S: saved
    S-->>C: log created
    C-->>W: 201 Created
    
    Note over F,DB: Consulta com Insights
    
    F->>C: GET /api/weather/insights/:location
    C->>S: getLogs(location)
    S->>DB: find(filters)
    DB-->>S: logs[]
    S->>I: generateInsights(logs)
    I->>I: calcular estatísticas
    I->>I: análise de padrões
    I-->>S: insights
    S-->>C: dados + insights
    C-->>F: 200 OK
```

---

## 📁 Estrutura do Projeto

```
src/
├── main.ts                          # Entry point da aplicação
├── app.module.ts                    # Módulo principal
│
├── auth/                            # 🔐 Módulo de Autenticação
│   ├── auth.module.ts              # Configuração do módulo
│   ├── auth.controller.ts          # Endpoints de autenticação
│   ├── auth.service.ts             # Lógica de autenticação
│   └── jwt/                        # JWT Strategy & Guards
│       ├── jwt.strategy.ts         # Estratégia Passport JWT
│       └── jwt-auth.guard.ts       # Guard de proteção de rotas
│
├── users/                           # 👥 Módulo de Usuários
│   ├── users.module.ts             # Configuração do módulo
│   ├── users.controller.ts         # CRUD de usuários
│   ├── users.service.ts            # Lógica de negócio
│   └── schemas/
│       └── user.schema.ts          # Schema MongoDB
│
├── weather/                         # 🌦️ Módulo de Dados Climáticos
│   ├── weather.module.ts           # Configuração do módulo
│   ├── weather.controller.ts       # Endpoints climáticos
│   ├── weather.service.ts          # Lógica de negócio
│   ├── weather-insights/           # 🤖 Serviço de Insights IA
│   │   └── weather-insights.service.ts
│   ├── dto/                        # Data Transfer Objects
│   │   ├── create-weather-log.dto.ts
│   │   ├── current-weather.dto.ts
│   │   └── location.dto.ts
│   ├── schemas/
│   │   └── weather-log.schema.ts   # Schema MongoDB
│   └── interfaces/
│       └── weather-service.interface.ts
│
├── config/                          # ⚙️ Configurações
│   ├── database.config.ts          # Config MongoDB
│   └── mongodb/
│       └── mongodb.module.ts       # Módulo de conexão DB
│
└── common/                          # 🛠️ Utilitários compartilhados
    ├── filters/
    │   └── http-exception.filter.ts  # Tratamento global de erros
    ├── interceptors/
    │   ├── logging.interceptor.ts    # Log de requisições
    │   └── transform.interceptor.ts  # Transformação de respostas
    └── exceptions/
        └── business.exception.ts     # Exceções customizadas
```

---

## 🛠️ Tecnologias

### Core Framework
- **NestJS 11.0** - Framework Node.js progressivo
- **TypeScript 5.7** - Superset JavaScript tipado
- **Node.js 24** - Runtime JavaScript

### Banco de Dados
- **MongoDB 9.0** - Banco NoSQL para armazenamento
- **Mongoose 11.0** - ODM para MongoDB

### Autenticação & Segurança
- **Passport JWT** - Autenticação baseada em tokens
- **bcrypt** - Hash de senhas
- **class-validator** - Validação de DTOs
- **class-transformer** - Transformação de objetos

### Documentação
- **Swagger/OpenAPI** - Documentação interativa da API

### Inteligência Artificial
- **Google Gemini AI** - Geração de insights climáticos inteligentes via @google/generative-ai
- **Modelo:** gemini-2.5-flash-lite (rápido e eficiente)

### Utilidades
- **Axios** - Cliente HTTP para APIs externas
- **XLSX** - Exportação de dados em Excel
- **RxJS** - Programação reativa

### Desenvolvimento
- **Jest** - Framework de testes
- **ESLint** - Linter de código
- **Prettier** - Formatador de código

---

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

```bash
# Node.js 20+ (recomendado v24)
node --version  # v24.x.x

# pnpm (gerenciador de pacotes)
pnpm --version  # 10.x.x

# MongoDB (se não usar Docker)
mongod --version  # 7.x+

# RabbitMQ (se não usar Docker)
rabbitmq-server --version  # 3.13+

# Docker & Docker Compose (opcional)
docker --version
docker-compose --version
```

---

## 📦 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/eliezerlobaton/gdash-weather-challenge.git
cd gdash-weather-challenge/packages/gdash-api
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

```bash
# Copie o arquivo de exemplo
cp ../../.env.example ../../.env

# Edite o arquivo .env com suas configurações
nano ../../.env
```

---

## ⚙️ Configuração

### Variáveis de Ambiente Obrigatórias

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```bash
# MongoDB Configuration (Atlas ou Local)
# Para MongoDB Atlas (recomendado)
MONGODB_URI=mongodb+srv://usuario:senha@cluster.mongodb.net/gdash_weather?retryWrites=true&w=majority

# Para MongoDB Local (alternativa)
# MONGO_ROOT_USER=admin
# MONGO_ROOT_PASSWORD=your_secure_password
# MONGO_DATABASE=gdash_weather
# MONGODB_URI=mongodb://admin:your_secure_password@localhost:27017/gdash_weather?authSource=admin

# RabbitMQ Configuration
RABBITMQ_USER=guest
RABBITMQ_PASS=guest
RABBITMQ_QUEUE=weather_data

# API Configuration
JWT_SECRET=your_jwt_secret_key_here_minimum_32_characters
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure_admin_password
FRONTEND_URL=http://localhost:5173

# Gemini AI Configuration (Obrigatório para insights)
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash-lite

# Application
PORT=3000
NODE_ENV=development
LOG_LEVEL=debug
```

> **⚠️ Importante:** 
> 
> **Para MongoDB Atlas:**
> 1. Crie uma conta gratuita em [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
> 2. Crie um cluster e obtenha o connection string
> 3. Adicione `/gdash_weather` após o hostname no connection string
> 4. Configure no `.env` como `MONGODB_URI`
>
> **Para Google Gemini AI:**
> 1. Acesse [Google AI Studio](https://aistudio.google.com/app/apikey)
> 2. Crie uma nova chave de API (gratuita - 1500 requests/dia)
> 3. Adicione ao arquivo `.env` como `GEMINI_API_KEY`
> 4. Use o modelo `gemini-2.5-flash-lite` para melhor performance

---

## 🚀 Execução

### Desenvolvimento Local (Sem Docker)

#### 1. Inicie a infraestrutura

```bash
# Na raiz do projeto - inicie apenas RabbitMQ (MongoDB Atlas é usado via cloud)
docker-compose up rabbitmq -d

# OU se preferir MongoDB local
docker-compose up mongodb rabbitmq -d
```

#### 2. Inicie a API

```bash
cd packages/gdash-api

# Modo desenvolvimento com hot-reload
pnpm run start:dev

# Modo debug
pnpm run start:debug
```

#### 3. Acesse a aplicação

```
🌐 API: http://localhost:3000/api
📚 Swagger: http://localhost:3000/api/docs
```

### Desenvolvimento com Docker Compose

```bash
# Na raiz do projeto
docker-compose up -d

# Ver logs
docker-compose logs -f gdash-api

# Parar serviços
docker-compose down
```

### Produção

```bash
# Build da aplicação
pnpm run build

# Executar em produção
pnpm run start:prod
```

### Scripts Disponíveis

```bash
# Desenvolvimento
pnpm run start:dev          # Modo watch com hot-reload
pnpm run start:debug        # Debug mode (porta 9229)

# Build
pnpm run build              # Compila TypeScript

# Produção
pnpm run start:prod         # Executa versão compilada

# Testes
pnpm run test               # Executa testes unitários
pnpm run test:watch         # Testes em modo watch
pnpm run test:cov           # Cobertura de testes
pnpm run test:e2e           # Testes end-to-end

# Qualidade de Código
pnpm run lint               # Executa ESLint
pnpm run format             # Formata código com Prettier
```

---

## 📖 Documentação da API

### Swagger UI

A documentação interativa está disponível em:

```
http://localhost:3000/api/docs
```

### Endpoints Principais

#### 🔐 Autenticação

**Login**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "senha123"
}

Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "name": "Usuário",
    "email": "user@example.com"
  }
}
```

#### 🌦️ Dados Climáticos

**Listar logs climáticos**

```http
GET /api/weather/logs?location=Recife&startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer {token}

Response:
{
  "data": [
    {
      "location": "Recife, Brazil",
      "timestamp": "2025-12-04T07:00:00.000Z",
      "temperature": 28.5,
      "humidity": 75,
      "windSpeed": 12.3,
      "condition": "Parcialmente nublado"
    }
  ],
  "total": 150,
  "page": 1,
  "limit": 50
}
```

**Criar log climático**

```http
POST /api/weather/logs
Authorization: Bearer {token}
Content-Type: application/json

{
  "location": "Recife, Brazil",
  "latitude": -8.0542,
  "longitude": -34.8813,
  "timestamp": "2025-12-04T07:00:00.000Z",
  "temperature": 28.5,
  "humidity": 75,
  "windSpeed": 12.3,
  "condition": "Parcialmente nublado",
  "description": "Céu parcialmente nublado com possibilidade de chuva"
}
```

**Obter insights com IA (Google Gemini)**

```http
GET /api/weather/insights
Authorization: Bearer {token}

Response:
{
  "averageTemperature": 27.8,
  "maxTemperature": {
    "value": 32.1,
    "city": "Recife, Brazil",
    "date": "2025-12-05T10:00:00.000Z"
  },
  "minTemperature": {
    "value": 23.5,
    "city": "Recife, Brazil",
    "date": "2025-12-05T08:00:00.000Z"
  },
  "averageHumidity": 72,
  "maxWindSpeed": {
    "value": 15.7,
    "city": "Recife, Brazil",
    "date": "2025-12-05T12:00:00.000Z"
  },
  "mostFrequentCondition": "agradável",
  "ai": {
    "textualSummary": "Clima agradável com temperatura média de 27.8°C e umidade de 72%...",
    "keyFindings": [
      "Temperatura estável entre 23.5°C e 32.1°C",
      "Umidade confortável para atividades ao ar livre"
    ],
    "recommendations": [
      "Ideal para passeios ao ar livre",
      "Mantenha-se hidratado"
    ],
    "forecast": "Tendência de manutenção das condições atuais",
    "healthImpact": "Condições favoráveis para a saúde",
    "activities": {
      "recommended": ["Caminhadas", "Esportes ao ar livre"],
      "avoid": ["Atividades em horários de pico solar"]
    },
    "condition": "agradável",
    "alerts": [],
    "patterns": ["Estabilidade climática"],
    "source": "gemini",
    "model": "gemini-2.5-flash-lite"
  },
  "generatedAt": "2025-12-05T14:30:00.000Z"
}
```

**Exportar dados**

```http
GET /api/weather/export?format=csv&location=Recife&startDate=2025-01-01
Authorization: Bearer {token}

Response: (arquivo CSV ou XLSX)
```

#### 👥 Usuários

**Listar usuários**

```http
GET /api/users
Authorization: Bearer {token}
```

**Criar usuário**

```http
POST /api/users
Authorization: Bearer {token}

{
  "name": "Novo Usuário",
  "email": "novo@example.com",
  "password": "senha123"
}
```

**Atualizar usuário**

```http
PATCH /api/users/:id
Authorization: Bearer {token}

{
  "name": "Nome Atualizado"
}
```

**Deletar usuário**

```http
DELETE /api/users/:id
Authorization: Bearer {token}
```

### Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | Sucesso |
| 201 | Recurso criado |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Recurso não encontrado |
| 409 | Conflito (ex: email duplicado) |
| 500 | Erro interno do servidor |

---

## 🧪 Testes

### Executar Testes

```bash
# Testes unitários
pnpm run test

# Testes com coverage
pnpm run test:cov

# Testes e2e
pnpm run test:e2e

# Modo watch
pnpm run test:watch
```

### Cobertura de Testes

```bash
pnpm run test:cov

# Resultado esperado: > 80% de cobertura
```

---

## 🐳 Docker

### Dockerfile para Demo

```mermaid
flowchart TD
    A[🐳 node:24-alpine] --> B[📦 Instala pnpm]
    B --> C[📋 Copia package.json]
    C --> D[⬇️ pnpm install]
    D --> E[📁 Copia código fonte]
    E --> F[🔨 pnpm build]
    F --> G[🚀 Inicia aplicação]
    
    style A fill:#68A063,stroke:#3C873A,stroke-width:2px,color:#fff
    style B fill:#F9A03F,stroke:#C97E2F,stroke-width:2px,color:#fff
    style C fill:#3178C6,stroke:#235A97,stroke-width:2px,color:#fff
    style D fill:#F9A03F,stroke:#C97E2F,stroke-width:2px,color:#fff
    style E fill:#3178C6,stroke:#235A97,stroke-width:2px,color:#fff
    style F fill:#E0234E,stroke:#B01A3B,stroke-width:2px,color:#fff
    style G fill:#4DB33D,stroke:#3FA037,stroke-width:2px,color:#fff
```

### Características do Dockerfile

✅ **Single stage** - Simples e rápido para demo  
✅ **Corepack** - Gerenciador de versões do pnpm  
✅ **Build otimizado** - Cache de layers eficiente  
✅ **Pronto para desenvolvimento** - Inclui todas as dependências  
✅ **Fácil debugging** - Estrutura simples e clara  

### Build e Execução

```bash
# Build local
docker build -t gdash-api:latest .

# Build com compose
docker-compose build gdash-api

# Executar
docker run -p 3000:3000 --env-file .env gdash-api:latest

# Ou com docker-compose (recomendado)
docker-compose up gdash-api -d
```

### Logs e Monitoramento

```bash
# Ver logs
docker-compose logs -f gdash-api

# Verificar status
docker-compose ps gdash-api

# Acessar container
docker-compose exec gdash-api sh
```

---

## 🔒 Segurança

### Práticas Implementadas

#### 1. Autenticação JWT

```typescript
// Token expira em 24 horas
JWT_SECRET=minimum_32_characters_strong_secret
```

#### 2. Hash de Senhas

```typescript
// bcrypt com salt rounds = 10
const hashedPassword = await bcrypt.hash(password, 10);
```

#### 3. Validação de Dados

```typescript
// DTOs com class-validator
export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
```

#### 4. CORS Configurado

```typescript
// main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
});
```

#### 5. Logger Profissional

```typescript
// Uso de Logger ao invés de console.log
private readonly logger = new Logger(ServiceName.name);
this.logger.log('Mensagem');
this.logger.error('Erro');
```

### Checklist de Segurança

- [x] JWT com secret forte
- [x] Senhas com hash bcrypt
- [x] Validação de inputs
- [x] CORS configurado
- [x] Non-root user no Docker
- [x] Variáveis de ambiente protegidas
- [x] Logger profissional
- [ ] Rate limiting (recomendado)
- [ ] Helmet (recomendado)
- [ ] SSL/TLS em produção

---

## 📊 Monitoramento

### Logs

```bash
# Desenvolvimento
pnpm run start:dev  # Logs no console

# Produção
docker-compose logs -f gdash-api

# Filtrar logs
docker-compose logs -f gdash-api | grep ERROR
```

---

## 🆘 Suporte

### Problemas Comuns

**Erro: Cannot connect to MongoDB**

```bash
# Para MongoDB Atlas - verifique suas credenciais
echo $MONGODB_URI

# Certifique-se que o formato está correto:
# mongodb+srv://usuario:senha@cluster.mongodb.net/gdash_weather?retryWrites=true&w=majority

# Verifique se o IP está whitelisted no MongoDB Atlas (Network Access)

# Para MongoDB local - verifique se está rodando
docker-compose ps mongodb
```

**Erro: Gemini API Key not configured**

```bash
# Configure no .env
GEMINI_API_KEY=sua_chave_aqui
GEMINI_MODEL=gemini-2.5-flash-lite

# Obtenha uma chave gratuita em: https://aistudio.google.com/app/apikey
```

**Erro: JWT Secret not configured**

```bash
# Configure no .env
JWT_SECRET=seu_secret_aqui_minimo_32_caracteres
```

**Erro: Port 3000 already in use**

```bash
# Encontre o processo
lsof -i :3000

# Mate o processo ou altere a porta
PORT=3001 pnpm run start:dev
```
