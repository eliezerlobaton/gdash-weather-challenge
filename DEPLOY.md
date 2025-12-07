# Guía de Despliegue en Render (Gratis)

Este proyecto está configurado para desplegarse automáticamente en Render.com usando su capa gratuita.

## Requisitos Previos (Servicios Externos)

Render no ofrece bases de datos ni colas de mensajes gratuitas. Debes crear cuentas en estos servicios:

### 1. MongoDB Atlas (Base de Datos)
1.  Crea una cuenta en [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2.  Crea un cluster gratuito (**M0 Sandbox**).
3.  En "Network Access", permite acceso desde cualquier lugar (`0.0.0.0/0`).
4.  En "Database Access", crea un usuario y contraseña.
5.  Obtén tu **Connection String** (ej: `mongodb+srv://user:pass@cluster.mongodb.net/?retryWrites=true&w=majority`).

### 2. CloudAMQP (RabbitMQ)
1.  Crea una cuenta en [CloudAMQP](https://www.cloudamqp.com/).
2.  Crea una nueva instancia con el plan **Lemur (Free)**.
3.  Obtén los detalles de conexión:
    *   **URL** (ej: `amqps://user:pass@hostname/vhost`)
    *   **Host**, **User**, **Password**.

### 3. Google Gemini API Key
1.  Obtén una API Key gratuita en [Google AI Studio](https://aistudio.google.com/).

## Despliegue en Render

1.  Haz Fork de este repositorio a tu GitHub.
2.  Regístrate en [Render.com](https://render.com/).
3.  Ve a "Blueprints" y haz clic en "New Blueprint Instance".
4.  Conecta tu repositorio.
5.  Render detectará el archivo `render.yaml`.
6.  **IMPORTANTE:** Te pedirá que ingreses los valores de las variables de entorno marcadas como `sync: false`. Introduce los datos que obtuviste en los pasos anteriores:
    *   `MONGODB_URI`: Tu connection string de Mongo.
    *   `GEMINI_API_KEY`: Tu API Key de Google.
    *   `RABBITMQ_URL`: Tu URL completa de CloudAMQP.
    *   `RABBITMQ_HOST`: El host de CloudAMQP (sin protocolo).
    *   `RABBITMQ_USER`: Tu usuario de CloudAMQP.
    *   `RABBITMQ_PASS`: Tu contraseña de CloudAMQP.

7.  Haz clic en "Apply". Render desplegará los 4 servicios automáticamente.

## Notas Importantes

*   **Servicios "Dormidos":** En el plan gratuito, los servicios web se "duermen" tras 15 minutos de inactividad. La primera petición tardará unos 30-50 segundos en responder.
*   **Workers:** Hemos configurado los workers como servicios web para que sean gratuitos. Si necesitas que corran 24/7 sin dormirse, puedes usar un servicio como [UptimeRobot](https://uptimerobot.com/) para hacerles "ping" cada 10 minutos a sus URLs de Render.
