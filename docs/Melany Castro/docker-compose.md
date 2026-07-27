# Configuración de Docker Compose para n8n y PostgreSQL

Este archivo `docker-compose.yml` permite desplegar **n8n** junto con una base de datos **PostgreSQL** utilizando Docker Compose.

La arquitectura está compuesta por dos servicios principales:

* **PostgreSQL:** almacena los datos utilizados por n8n.
* **n8n:** plataforma de automatización de flujos de trabajo que utiliza PostgreSQL como sistema de almacenamiento.

Además, se utilizan **volúmenes persistentes** para evitar que los datos se pierdan cuando los contenedores se reinicien o se vuelvan a crear.

---

## Archivo `docker-compose.yml`

```yaml
volumes:
  n8n_data:
  postgres_data:

services:

  # ==========================================
  # SERVICIO DE BASE DE DATOS POSTGRESQL
  # ==========================================
  postgres:
    image: postgres:16
    restart: always

    environment:
      - POSTGRES_USER=admin_clinica
      - POSTGRES_PASSWORD=6/C5ppoQ_Li0
      - POSTGRES_DB=DentalCareDB

    volumes:
      - postgres_data:/var/lib/postgresql/data

    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -h localhost -U admin_clinica -d DentalCareDB']
      interval: 5s
      timeout: 5s
      retries: 10


  # ==========================================
  # SERVICIO N8N
  # ==========================================
  n8n:
    image: n8nio/n8n:latest
    restart: always

    ports:
      - "5678:5678"

    environment:

      # ==========================================
      # CONEXIÓN DE N8N CON POSTGRESQL
      # ==========================================
      - DB_TYPE=postgres
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=DentalCareDB
      - DB_POSTGRESDB_USER=admin_clinica
      - DB_POSTGRESDB_PASSWORD=6/C5ppoQ_Li0

      # ==========================================
      # CONFIGURACIÓN DEL ENTORNO DE N8N
      # ==========================================
      - N8N_PORT=5678
      - N8N_PROTOCOL=https
      - N8N_HOST=dentalcare.logixu.com
      - WEBHOOK_URL=https://dentalcare.logixu.com/
      - NODE_ENV=production

      # Zona horaria utilizada por n8n
      - GENERIC_TIMEZONE=America/Santiago

      # Configuración de cookies seguras
      - N8N_SECURE_COOKIE=false

    # ==========================================
    # PERSISTENCIA DE DATOS DE N8N
    # ==========================================
    volumes:
      - n8n_data:/home/node/.n8n

    # ==========================================
    # DEPENDENCIA DE POSTGRESQL
    # ==========================================
    depends_on:
      postgres:
        condition: service_healthy
```

---

# Explicación de la configuración

## 1. Volúmenes

```yaml
volumes:
  n8n_data:
  postgres_data:
```

Se crean dos volúmenes persistentes:

### `n8n_data`

Almacena información relacionada con n8n, como configuraciones y otros datos internos.

### `postgres_data`

Almacena físicamente los datos de PostgreSQL.

Los volúmenes permiten que los datos sobrevivan aunque los contenedores sean detenidos, reiniciados o recreados.

---

# 2. Servicio PostgreSQL

```yaml
postgres:
  image: postgres:16
```

Se crea un contenedor utilizando la imagen oficial de **PostgreSQL versión 16**.

PostgreSQL será utilizado como base de datos para almacenar la información de n8n.

---

## 3. Reinicio automático

```yaml
restart: always
```

Esta configuración indica que Docker intentará reiniciar automáticamente el contenedor si se detiene.

Esto es útil para un servidor en producción, ya que permite que los servicios vuelvan a ejecutarse después de un reinicio o una interrupción.

---

# 4. Configuración de PostgreSQL

```yaml
environment:
  - POSTGRES_USER=admin_clinica
  - POSTGRES_PASSWORD=6/C5ppoQ_Li0
  - POSTGRES_DB=DentalCareDB
```

Aquí se configuran los datos iniciales de PostgreSQL:

| Variable            | Descripción                         |
| ------------------- | ----------------------------------- |
| `POSTGRES_USER`     | Usuario administrador de PostgreSQL |
| `POSTGRES_PASSWORD` | Contraseña del usuario              |
| `POSTGRES_DB`       | Nombre de la base de datos          |

En este caso:

* Usuario: `admin_clinica`
* Base de datos: `DentalCareDB`

La contraseña configurada es:

```text
6/C5ppoQ_Li0
```

> **Recomendación:** En un entorno de producción es mejor no colocar contraseñas directamente en el archivo `docker-compose.yml`. Se recomienda utilizar un archivo `.env` o un sistema de gestión de secretos.

---

# 5. Persistencia de PostgreSQL

```yaml
volumes:
  - postgres_data:/var/lib/postgresql/data
```

Esta configuración conecta el volumen Docker `postgres_data` con la carpeta donde PostgreSQL almacena sus datos:

```text
/var/lib/postgresql/data
```

De esta forma, los datos de la base de datos permanecen almacenados aunque el contenedor de PostgreSQL sea eliminado y creado nuevamente.

---

# 6. Healthcheck de PostgreSQL

```yaml
healthcheck:
  test: ['CMD-SHELL', 'pg_isready -h localhost -U admin_clinica -d DentalCareDB']
  interval: 5s
  timeout: 5s
  retries: 10
```

El `healthcheck` permite comprobar si PostgreSQL está funcionando correctamente.

El comando:

```bash
pg_isready
```

comprueba si PostgreSQL está disponible para recibir conexiones.

La configuración indica que:

* Se realiza una comprobación cada **5 segundos**.
* Cada comprobación puede tardar hasta **5 segundos**.
* Se realizan hasta **10 intentos**.

Esto es importante porque n8n depende de PostgreSQL para funcionar correctamente.

---

# 7. Servicio n8n

```yaml
n8n:
  image: n8nio/n8n:latest
```

Se crea un contenedor utilizando la imagen de n8n.

La etiqueta:

```text
latest
```

indica que se utilizará la versión más reciente disponible de la imagen.

Para entornos de producción, se recomienda fijar una versión específica de n8n en lugar de utilizar `latest`, para evitar actualizaciones inesperadas.

---

# 8. Puerto de n8n

```yaml
ports:
  - "5678:5678"
```

Esta configuración conecta el puerto `5678` del servidor con el puerto `5678` del contenedor.

El puerto `5678` es el puerto utilizado por n8n.

Esto permite acceder directamente al servicio mediante:

```text
http://IP_DEL_SERVIDOR:5678
```

Sin embargo, en esta configuración se está utilizando un dominio con HTTPS:

```text
https://dentalcare.logixu.com
```

Por lo tanto, normalmente se utilizaría un proxy inverso como **Nginx**, **Traefik** o un servicio equivalente para gestionar HTTPS y redirigir las solicitudes hacia n8n.

---

# 9. Configuración de la conexión entre n8n y PostgreSQL

```yaml
- DB_TYPE=postgres
- DB_POSTGRESDB_HOST=postgres
- DB_POSTGRESDB_PORT=5432
- DB_POSTGRESDB_DATABASE=DentalCareDB
- DB_POSTGRESDB_USER=admin_clinica
- DB_POSTGRESDB_PASSWORD=6/C5ppoQ_Li0
```

Estas variables indican a n8n que debe utilizar PostgreSQL como sistema de almacenamiento.

La configuración es:

```text
Tipo de base de datos: PostgreSQL
Host: postgres
Puerto: 5432
Base de datos: DentalCareDB
Usuario: admin_clinica
Contraseña: 6/C5ppoQ_Li0
```

El valor:

```text
DB_POSTGRESDB_HOST=postgres
```

es importante.

No se utiliza `localhost` porque PostgreSQL y n8n se encuentran en contenedores diferentes.

Docker Compose crea una red interna entre los servicios y permite que n8n encuentre PostgreSQL utilizando el nombre del servicio:

```text
postgres
```

Por eso n8n se conecta internamente mediante:

```text
postgres:5432
```

---

# 10. Configuración del dominio

```yaml
- N8N_HOST=dentalcare.logixu.com
```

Esta variable indica el dominio que utilizará n8n.

En este caso:

```text
dentalcare.logixu.com
```

---

# 11. Configuración HTTPS

```yaml
- N8N_PROTOCOL=https
```

Indica que n8n está configurado para trabajar utilizando el protocolo HTTPS.

La dirección pública esperada sería:

```text
https://dentalcare.logixu.com
```

Para que esto funcione correctamente, el dominio debe estar configurado para apuntar al servidor donde está ejecutándose Docker y debe existir una configuración que gestione el certificado SSL/TLS.

---

# 12. Configuración de Webhooks

```yaml
- WEBHOOK_URL=https://dentalcare.logixu.com/
```

Esta variable indica a n8n cuál es la URL pública que debe utilizar para generar las URLs de los webhooks.

Esto es especialmente importante cuando se utilizan automatizaciones que reciben información desde servicios externos, por ejemplo:

* WhatsApp
* APIs externas
* Formularios
* Servicios de pago
* Sistemas de terceros

Los servicios externos podrán comunicarse con los webhooks mediante el dominio público configurado.

---

# 13. Entorno de producción

```yaml
- NODE_ENV=production
```

Indica que n8n se está ejecutando en un entorno de producción.

Esto permite utilizar una configuración orientada a un servidor real en lugar de un entorno de desarrollo.

---

# 14. Zona horaria

```yaml
- GENERIC_TIMEZONE=America/Santiago
```

Define la zona horaria utilizada por n8n.

Esto es importante para los nodos que trabajan con fechas y horas, especialmente los nodos de tipo:

* Schedule Trigger
* Cron
* Programaciones automáticas
* Fechas de ejecución

En este caso se configuró la zona horaria:

```text
America/Santiago
```

---

# 15. Cookies seguras

```yaml
- N8N_SECURE_COOKIE=false
```

Esta configuración desactiva la exigencia de cookies seguras.

Sin embargo, si n8n se encuentra correctamente configurado detrás de HTTPS, sería recomendable revisar esta configuración y utilizar cookies seguras.

Para un entorno HTTPS, normalmente se recomienda:

```yaml
- N8N_SECURE_COOKIE=true
```

Esto mejora la seguridad de las cookies utilizadas por n8n.

---

# 16. Persistencia de n8n

```yaml
volumes:
  - n8n_data:/home/node/.n8n
```

Este volumen permite conservar los datos internos de n8n.

El volumen:

```text
n8n_data
```

se conecta con:

```text
/home/node/.n8n
```

Esto permite mantener la información de n8n incluso si el contenedor se reinicia o se vuelve a crear.

---

# 17. Dependencia entre servicios

```yaml
depends_on:
  postgres:
    condition: service_healthy
```

Esta configuración establece que n8n depende de PostgreSQL.

Además, gracias al `healthcheck`, Docker Compose espera a que PostgreSQL esté disponible y saludable antes de iniciar n8n.

El flujo es:

```text
1. Se inicia PostgreSQL
        ↓
2. PostgreSQL inicia correctamente
        ↓
3. Se ejecuta el Healthcheck
        ↓
4. PostgreSQL responde correctamente
        ↓
5. Docker considera saludable el servicio
        ↓
6. Se inicia n8n
        ↓
7. n8n se conecta a PostgreSQL
```

---

# Arquitectura general

La arquitectura del sistema puede representarse de la siguiente manera:

```text
                     INTERNET
                         │
                         │ HTTPS
                         ▼
              dentalcare.logixu.com
                         │
                         ▼
                ┌─────────────────┐
                │       n8n       │
                │   Puerto 5678   │
                └────────┬────────┘
                         │
                         │ Red interna Docker
                         │
                         ▼
                ┌─────────────────┐
                │   PostgreSQL    │
                │   Puerto 5432   │
                │  DentalCareDB   │
                └────────┬────────┘
                         │
                         ▼
                ┌─────────────────┐
                │ postgres_data   │
                │     Volume      │
                └─────────────────┘

                n8n_data
                    │
                    ▼
              Datos de n8n
```

---

# Comandos para ejecutar el proyecto

Una vez creado el archivo:

```text
docker-compose.yml
```

se puede iniciar la aplicación con:

```bash
docker compose up -d
```

Para comprobar que los contenedores están ejecutándose:

```bash
docker compose ps
```

Para visualizar los logs:

```bash
docker compose logs -f
```

Para visualizar únicamente los logs de n8n:

```bash
docker compose logs -f n8n
```

Para detener los servicios:

```bash
docker compose down
```

Para detener los servicios sin eliminar los volúmenes:

```bash
docker compose down
```

Los volúmenes `n8n_data` y `postgres_data` permanecerán almacenados y los datos no deberían perderse.

---

# Resumen

La configuración implementa una arquitectura Docker Compose con:

* **PostgreSQL 16** como base de datos.
* **n8n** como plataforma de automatización.
* **Docker Volumes** para persistencia de datos.
* **Healthcheck** para comprobar la disponibilidad de PostgreSQL.
* **depends_on** para iniciar n8n después de que PostgreSQL esté saludable.
* **Dominio personalizado:** `dentalcare.logixu.com`.
* **HTTPS** configurado para el dominio.
* **Webhooks públicos** mediante `WEBHOOK_URL`.
* **Zona horaria** configurada para `America/Santiago`.

La estructura corregida del archivo también soluciona un problema de indentación que tenía la configuración original: el bloque `volumes` de n8n debe estar dentro del servicio `n8n`, no al mismo nivel que `services`.
