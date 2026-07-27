# Configuración de Nginx como Proxy Inverso para n8n

Este archivo configura **Nginx** como un **proxy inverso (Reverse Proxy)** para el servicio de n8n.

La función principal de esta configuración es recibir las solicitudes que llegan al dominio:

```text
https://dentalcare.logixu.com
```

y redirigirlas internamente hacia n8n, que está ejecutándose en el puerto:

```text
http://localhost:5678
```

La arquitectura funciona de la siguiente manera:

```text
                         INTERNET
                             │
                             │ HTTPS
                             ▼
                  dentalcare.logixu.com
                             │
                             ▼
                    ┌─────────────────┐
                    │      NGINX      │
                    │    Puerto 443   │
                    │      HTTPS      │
                    └────────┬────────┘
                             │
                             │ Proxy inverso
                             ▼
                    ┌─────────────────┐
                    │       n8n       │
                    │    Puerto 5678  │
                    └─────────────────┘
```

---

# Archivo de configuración de Nginx

El archivo puede estar ubicado, dependiendo de la configuración del servidor, en:

```text
/etc/nginx/sites-available/dentalcare.logixu.com
```

El contenido es:

```nginx
server {
    server_name dentalcare.logixu.com;

    location / {
        proxy_pass http://localhost:5678;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Soporte necesario para WebSockets de n8n
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    listen 443 ssl; # managed by Certbot

    ssl_certificate /etc/letsencrypt/live/dentalcare.logixu.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/dentalcare.logixu.com/privkey.pem; # managed by Certbot

    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}


server {
    if ($host = dentalcare.logixu.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    server_name dentalcare.logixu.com;

    listen 80;

    return 404; # managed by Certbot
}
```

---

# Explicación de la configuración

## 1. Bloque principal del servidor HTTPS

```nginx
server {
    server_name dentalcare.logixu.com;
```

Este bloque define un servidor virtual de Nginx asociado al dominio:

```text
dentalcare.logixu.com
```

Cuando un usuario accede a:

```text
https://dentalcare.logixu.com
```

Nginx identifica que la solicitud corresponde a este bloque.

---

# 2. Configuración del Proxy Inverso

```nginx
location / {
    proxy_pass http://localhost:5678;
```

Esta es una de las partes más importantes.

Indica que todas las solicitudes que lleguen a:

```text
https://dentalcare.logixu.com/
```

serán enviadas internamente a:

```text
http://localhost:5678
```

En este caso, n8n está ejecutándose en Docker y tiene publicado el puerto:

```yaml
ports:
  - "5678:5678"
```

Por eso Nginx puede acceder a n8n mediante:

```text
http://localhost:5678
```

El usuario final no necesita escribir el puerto `5678`.

En lugar de acceder a:

```text
http://IP_DEL_SERVIDOR:5678
```

puede acceder directamente a:

```text
https://dentalcare.logixu.com
```

---

# 3. Encabezado Host

```nginx
proxy_set_header Host $host;
```

Mantiene el nombre de dominio original de la solicitud.

Por ejemplo:

```text
dentalcare.logixu.com
```

Esto permite que n8n conozca el dominio utilizado por el usuario.

---

# 4. Dirección IP real del cliente

```nginx
proxy_set_header X-Real-IP $remote_addr;
```

Envía a n8n la dirección IP del cliente que realizó la solicitud.

Esto puede ser útil para identificar el origen de las conexiones.

---

# 5. Encabezado X-Forwarded-For

```nginx
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
```

Permite mantener información sobre la cadena de direcciones IP por las que pasó la solicitud.

Esto es útil cuando existen varios proxies o servidores intermedios.

---

# 6. Protocolo original

```nginx
proxy_set_header X-Forwarded-Proto $scheme;
```

Indica cuál fue el protocolo utilizado por el cliente.

En este caso:

```text
HTTPS
```

Por lo tanto, Nginx informa a n8n que la conexión original fue realizada mediante HTTPS.

Esto es importante porque Nginx recibe HTTPS, pero internamente se comunica con n8n mediante HTTP:

```text
Usuario
   │
   │ HTTPS
   ▼
Nginx
   │
   │ HTTP
   ▼
n8n
```

---

# 7. Configuración de WebSockets

```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection "upgrade";
```

Estas líneas permiten que Nginx soporte conexiones **WebSocket**.

n8n puede utilizar WebSockets para determinadas comunicaciones en tiempo real.

La configuración permite mantener correctamente este tipo de conexiones cuando el tráfico pasa por Nginx.

---

# 8. Puerto HTTPS

```nginx
listen 443 ssl;
```

El puerto `443` es el puerto estándar utilizado para conexiones HTTPS.

Por lo tanto, cuando un usuario accede a:

```text
https://dentalcare.logixu.com
```

la conexión llega al puerto `443` de Nginx.

---

# 9. Certificado SSL

```nginx
ssl_certificate /etc/letsencrypt/live/dentalcare.logixu.com/fullchain.pem;
```

Indica la ubicación del certificado SSL/TLS utilizado por Nginx.

El certificado fue generado mediante:

```text
Let's Encrypt
```

y gestionado automáticamente mediante:

```text
Certbot
```

---

# 10. Clave privada del certificado

```nginx
ssl_certificate_key /etc/letsencrypt/live/dentalcare.logixu.com/privkey.pem;
```

Esta línea indica dónde se encuentra la clave privada utilizada para establecer conexiones HTTPS seguras.

La clave privada debe mantenerse protegida y no debe compartirse públicamente.

---

# 11. Configuración SSL de Certbot

```nginx
include /etc/letsencrypt/options-ssl-nginx.conf;
```

Carga configuraciones de seguridad recomendadas por Certbot para Nginx.

Estas configuraciones ayudan a establecer parámetros adecuados para las conexiones SSL/TLS.

---

# 12. Parámetros Diffie-Hellman

```nginx
ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
```

Especifica los parámetros utilizados para el intercambio de claves Diffie-Hellman.

Este archivo normalmente es generado y administrado por Certbot.

---

# 13. Segundo bloque del servidor

```nginx
server {
    if ($host = dentalcare.logixu.com) {
        return 301 https://$host$request_uri;
    }
```

Este bloque se encarga de gestionar las solicitudes que llegan mediante HTTP.

Por ejemplo, si un usuario entra a:

```text
http://dentalcare.logixu.com
```

Nginx redirige automáticamente al usuario hacia:

```text
https://dentalcare.logixu.com
```

La redirección utiliza el código:

```text
301
```

que significa **Moved Permanently** o "movido permanentemente".

---

# 14. Puerto HTTP

```nginx
listen 80;
```

El puerto `80` es el puerto estándar utilizado para HTTP.

Nginx recibe las solicitudes HTTP en este puerto y las redirige a HTTPS.

El flujo es:

```text
http://dentalcare.logixu.com
            │
            │ Puerto 80
            ▼
          Nginx
            │
            │ Redirección 301
            ▼
https://dentalcare.logixu.com
            │
            │ Puerto 443
            ▼
          Nginx
            │
            │ Proxy inverso
            ▼
      http://localhost:5678
            │
            ▼
           n8n
```

---

# 15. Respuesta 404

```nginx
return 404;
```

Esta instrucción devuelve un error `404 Not Found` cuando la solicitud no coincide con la condición de redirección configurada.

Esta estructura fue generada automáticamente por Certbot y generalmente no es necesario modificarla manualmente.

---

# Relación entre Docker, Nginx y n8n

La configuración completa del sistema funciona de esta manera:

```text
                         INTERNET
                             │
                             │
                             ▼
               dentalcare.logixu.com
                             │
                             │ HTTPS :443
                             ▼
                  ┌─────────────────────┐
                  │        NGINX        │
                  │    Reverse Proxy    │
                  │     SSL / HTTPS     │
                  └──────────┬──────────┘
                             │
                             │ HTTP
                             │ localhost:5678
                             ▼
                  ┌─────────────────────┐
                  │       DOCKER        │
                  │                     │
                  │  ┌───────────────┐  │
                  │  │      n8n      │  │
                  │  │    :5678      │  │
                  │  └───────┬───────┘  │
                  │          │          │
                  │          │          │
                  │  ┌───────▼───────┐  │
                  │  │  PostgreSQL   │  │
                  │  │     :5432     │  │
                  │  └───────────────┘  │
                  │                     │
                  └─────────────────────┘
```

En resumen:

1. El usuario accede a `https://dentalcare.logixu.com`.
2. La solicitud llega a Nginx por el puerto `443`.
3. Nginx utiliza el certificado SSL de Let's Encrypt.
4. Nginx recibe la solicitud HTTPS.
5. Nginx la redirige internamente a `http://localhost:5678`.
6. Docker recibe la solicitud en el puerto publicado `5678`.
7. La solicitud llega al contenedor de n8n.
8. n8n procesa la solicitud.
9. n8n utiliza PostgreSQL para almacenar y consultar información.
10. La respuesta vuelve por el mismo camino hasta el usuario.

---

# Comandos para configurar Nginx

Después de crear o modificar el archivo de configuración, se puede comprobar que la configuración de Nginx sea correcta con:

```bash
sudo nginx -t
```

Si la configuración es correcta, debería aparecer un mensaje similar a:

```text
syntax is ok
test is successful
```

Después se puede reiniciar o recargar Nginx:

```bash
sudo systemctl reload nginx
```

También se puede comprobar el estado del servicio:

```bash
sudo systemctl status nginx
```

---

# Comandos para comprobar n8n

Para comprobar que el contenedor de n8n está ejecutándose:

```bash
docker compose ps
```

Para consultar los logs de n8n:

```bash
docker compose logs -f n8n
```

También se puede comprobar directamente desde el servidor:

```bash
curl http://localhost:5678
```

Si n8n está funcionando correctamente, debería devolver una respuesta HTTP.

---

# Resumen

Esta configuración de Nginx cumple tres funciones principales:

### 1. Proxy inverso

Permite acceder a n8n mediante:

```text
https://dentalcare.logixu.com
```

en lugar de utilizar directamente:

```text
http://IP_DEL_SERVIDOR:5678
```

### 2. HTTPS

Utiliza certificados de Let's Encrypt administrados por Certbot para proteger la comunicación entre el usuario y el servidor.

### 3. Redirección HTTP → HTTPS

Las solicitudes realizadas mediante:

```text
http://dentalcare.logixu.com
```

son redirigidas automáticamente a:

```text
https://dentalcare.logixu.com
```

De esta manera, el sistema queda estructurado como:

```text
Usuario
   │
   │ HTTPS
   ▼
Dominio dentalcare.logixu.com
   │
   ▼
Nginx
   │
   │ Reverse Proxy
   ▼
n8n en Docker :5678
   │
   ▼
PostgreSQL :5432
```
