# Roteiro de Vídeo: GDash Weather Challenge (5 Minutos)

**Objetivo:** Apresentar a solução completa para o desafio técnico, destacando a arquitetura de microserviços, o fluxo de dados em tempo real e o deploy bem-sucedido na nuvem.

---

## 1. Introdução (0:00 - 0:45)
**Visual:** Slide com o título do projeto "GDash Weather Challenge" e seu nome. Em seguida, muda para a tela de Login da aplicação.

**Narração:**
"Olá! Meu nome é [Seu Nome] e este vídeo apresenta a minha solução para o GDash Weather Challenge.
O objetivo deste projeto foi desenvolver uma plataforma completa para coleta, processamento e visualização de dados climáticos em tempo real.
Não se trata apenas de exibir o clima, mas de construir uma arquitetura robusta, escalável e resiliente, capaz de integrar diferentes linguagens de programação e garantir a integridade dos dados desde a coleta até a interface do usuário."

---

## 2. Arquitetura e Fluxo de Dados (0:45 - 1:45)
**Visual:** Diagrama de arquitetura (pode usar o Mermaid que está no README ou mostrar os códigos rapidamente).

**Narração:**
"A solução foi construída utilizando uma arquitetura de microserviços baseada em eventos. Vamos entender o fluxo:

1.  **Coleta (Python):** Temos um serviço em Python (`weather-data-collector`) que consulta a API OpenMeteo periodicamente. Ele formata os dados e os publica em uma fila.
2.  **Mensageria (RabbitMQ):** Utilizamos o RabbitMQ como broker de mensagens. Isso desacopla os serviços e garante que nenhum dado seja perdido, mesmo se o processador estiver ocupado.
3.  **Processamento (Go):** Um worker de alta performance escrito em Go (`rabbitmq-worker`) consome essas mensagens. Ele implementa padrões de resiliência como *Circuit Breaker* e *Retry* com *Dead Letter Queues* para garantir robustez.
4.  **API e Persistência (NestJS + MongoDB):** O worker envia os dados processados para nossa API central em NestJS, que valida e salva tudo no MongoDB.
5.  **Frontend (React):** Finalmente, a interface consome essa API para mostrar os dados ao usuário."

---

## 3. Tecnologias e Stack (1:45 - 2:30)
**Visual:** Mostrar rapidamente a estrutura de pastas do Monorepo no VS Code.

**Narração:**
"O projeto está organizado em um Monorepo gerenciado pelo PNPM, facilitando o compartilhamento de configurações e o deploy.
*   **No Frontend:** Usei React com Vite, TypeScript e TailwindCSS. Para a UI, integrei o Shadcn/UI para um design moderno e responsivo. O gerenciamento de estado e cache de requisições é feito com TanStack Query.
*   **No Backend:** A API NestJS segue os princípios SOLID e Clean Architecture, com autenticação via JWT e documentação automática com Swagger.
*   **Infraestrutura:** Tudo foi containerizado com Docker para garantir consistência entre desenvolvimento e produção."

---

## 4. Demonstração da Aplicação (2:30 - 3:45)
**Visual:** Navegação na aplicação rodando (Deploy no Render).

**Narração:**
"Vamos ver a aplicação em funcionamento, agora deployada na nuvem (Render).
1.  **Login:** Acessamos com autenticação segura. O sistema mantém a sessão persistente mesmo se recarregarmos a página.
2.  **Dashboard:** Aqui temos a visão geral. Cards com métricas principais e gráficos interativos que mostram a variação de temperatura e umidade.
3.  **Logs em Tempo Real:** Esta tabela mostra os registros brutos que estão chegando do nosso pipeline. Podemos filtrar por data e paginar os resultados.
4.  **Integração com IA:** Uma feature extra é a análise climática gerada pelo Google Gemini, que lê os dados atuais e fornece insights inteligentes sobre as condições do tempo."

---

## 5. Desafios de Deploy e Soluções (3:45 - 4:45)
**Visual:** Mostrar o arquivo `render.yaml` ou o Dashboard do Render.

**Narração:**
"Um dos maiores desafios foi realizar o deploy gratuito de uma arquitetura complexa como essa no Render.
Tivemos que configurar cuidadosamente o arquivo `render.yaml` para orquestrar 4 serviços simultâneos:
*   O Frontend como Site Estático.
*   A API e os dois Workers como Web Services.
*   **O Pulo do Gato:** Para que os workers (Go e Python) rodassem no plano gratuito, implementamos servidores HTTP 'dummy' para satisfazer as checagens de saúde do Render.
*   Também resolvemos problemas complexos de CORS e persistência de sessão JWT que surgiram apenas no ambiente de produção, ajustando a configuração de cookies e interceptors do Axios."

---

## 6. Conclusão (4:45 - 5:00)
**Visual:** Tela final com link do repositório GitHub e seu contato.

**Narração:**
"Em resumo, o GDash Weather Challenge demonstra a integração eficiente de Python, Go, Node.js e React em um ecossistema moderno e funcional.
O código completo está disponível no GitHub, com documentação detalhada de como rodar localmente ou na nuvem.
Obrigado pela atenção!"
