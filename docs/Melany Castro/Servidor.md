# Implementación y Despliegue de Infraestructura en Google Cloud y Cloudflare

## 1. Creación y configuración de la máquina virtual

Como primer paso, se creó una **máquina virtual (VM)** en Google Cloud utilizando un sistema operativo basado en Linux, en este caso Debian.

La máquina virtual funciona como el **servidor de infraestructura** donde se ejecutarán los diferentes servicios que componen la aplicación.

Durante la configuración inicial de la VM se habilitaron las reglas de firewall necesarias para permitir el tráfico de los protocolos:

* **HTTP:** Puerto `80`
* **HTTPS:** Puerto `443`

La apertura de estos puertos permite que los usuarios puedan acceder a los servicios publicados mediante HTTP y HTTPS.

La administración del servidor se realizó mediante una conexión remota **SSH (Secure Shell)**, permitiendo ejecutar comandos directamente sobre la máquina virtual.

---

## 2. Actualización del sistema operativo

Una vez establecida la conexión SSH con el servidor, se realizó la actualización de los paquetes del sistema operativo mediante los siguientes comandos:

```bash
sudo apt update
sudo apt upgrade
```

El comando `apt update` actualiza la información disponible sobre los paquetes y repositorios configurados en el sistema.

Posteriormente, `apt upgrade` instala las actualizaciones disponibles para los paquetes del sistema operativo.

Este procedimiento permite mantener el servidor actualizado y reducir posibles problemas de compatibilidad o seguridad.

---

## 3. Instalación de Docker

Posteriormente, se instaló **Docker**, una plataforma de virtualización basada en contenedores que permite empaquetar y ejecutar aplicaciones junto con sus dependencias de manera aislada.

La instalación se realizó mediante:

```bash
curl -fsSL https://get.docker.com/ -o get-docker.sh
sudo sh get-docker.sh
```

Docker permite ejecutar los servicios de la aplicación dentro de **contenedores**, evitando instalar directamente todas las dependencias de cada servicio en el sistema operativo principal.

De esta manera, el servidor funciona como la infraestructura física o virtual, mientras que los servicios de la aplicación se ejecutan de forma aislada dentro de contenedores Docker.

---

## 4. Configuración del usuario para utilizar Docker

Para evitar la necesidad de utilizar `sudo` en cada comando relacionado con Docker, se agregó el usuario actual al grupo `docker` mediante:

```bash
sudo usermod -aG docker $USER
```

Esto permite que el usuario pueda ejecutar comandos de Docker directamente.

Por ejemplo, después de aplicar el cambio, es posible utilizar:

```bash
docker ps
```

en lugar de:

```bash
sudo docker ps
```

Esta configuración facilita la administración de los contenedores durante el despliegue y mantenimiento del sistema.

---

## 5. Configuración de Docker Compose

Para organizar los diferentes servicios que forman parte de la infraestructura se utilizó un archivo:

```text
docker-compose.yml
```

Este archivo contiene la configuración necesaria para definir y ejecutar los diferentes contenedores que componen la aplicación.

En el archivo se especifican aspectos como:

* Imágenes Docker utilizadas.
* Contenedores.
* Puertos.
* Variables de entorno.
* Redes.
* Volúmenes.
* Dependencias entre servicios.
* Dominios y URLs utilizadas por los servicios.

Mediante Docker Compose es posible levantar los servicios de manera coordinada utilizando una única configuración.

Por ejemplo:

```bash
docker compose up -d
```

El parámetro `-d` permite ejecutar los contenedores en segundo plano.

---

# 6. Configuración del dominio y subdominio

Para publicar el servicio en Internet se configuró un **subdominio**, permitiendo acceder al servicio mediante un nombre de dominio en lugar de utilizar directamente la dirección IP del servidor.

Primero, se reservó una **IP pública estática** en Google Cloud:

```text
34.39.133.213
```

La utilización de una IP estática es importante porque evita que la dirección IP pública del servidor cambie, lo cual permite mantener la asociación entre el dominio y el servidor.

Posteriormente, en **Cloudflare DNS** se creó un registro de tipo `A`.

Un registro `A` permite asociar un nombre de dominio o subdominio con una dirección IPv4.

La estructura utilizada conceptualmente es:

```text
subdominio.dominio.com  →  34.39.133.213
```

De esta manera, cuando un usuario accede al subdominio, el sistema DNS resuelve el nombre de dominio hacia la IP pública de la máquina virtual ubicada en Google Cloud.

La arquitectura de resolución queda de la siguiente manera:

```text
Usuario
   │
   │ Solicitud HTTPS
   ▼
Subdominio
   │
   ▼
Cloudflare DNS
   │
   │ Resolución DNS
   ▼
IP Pública
34.39.133.213
   │
   ▼
Google Cloud VM
   │
   ▼
Servidor Linux Debian
```

---

# 7. Configuración del servicio mediante HTTPS

Una vez configurado el dominio, se modificó el archivo `docker-compose.yml` para establecer correctamente el dominio y la URL pública utilizada por el servicio.

En este punto se configuró el servicio para trabajar con el dominio mediante:

```text
https://
```

en lugar de:

```text
http://
```

Esto permite que el servicio sea accesible mediante una conexión cifrada utilizando HTTPS.

---

# 8. Instalación de Nginx y Certbot

Para publicar el servicio y gestionar las conexiones externas se instalaron **Nginx** y **Certbot**:

```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

### Nginx

Nginx funciona como un **servidor web y proxy inverso (Reverse Proxy)**.

Su función es recibir las solicitudes provenientes de Internet y redirigirlas hacia el servicio correspondiente que se ejecuta internamente en el servidor.

La arquitectura utilizada puede representarse de la siguiente manera:

```text
                    INTERNET
                       │
                       ▼
               subdominio.com
                       │
                       ▼
                   Cloudflare
                       │
                       ▼
              IP Pública de Google Cloud
                       │
                       ▼
                 Nginx :443
               Proxy Inverso
                       │
                       ▼
              Servicio Docker
              Puerto interno
                       │
                       ▼
                    n8n
```

Esto permite que el usuario no tenga que acceder directamente al puerto interno del servicio.

Por ejemplo, en lugar de acceder directamente a:

```text
34.39.133.213:5678
```

el usuario puede acceder mediante:

```text
https://subdominio.dominio.com
```

Nginx recibe la solicitud y la redirige internamente al servicio correspondiente.

---

# 9. Configuración de los sitios disponibles en Nginx

Para configurar el dominio se creó un archivo dentro del directorio:

```text
/etc/nginx/sites-available/
```

El archivo contiene la configuración del subdominio y las reglas necesarias para que Nginx funcione como proxy inverso.

Posteriormente, la configuración se habilitó mediante un enlace o copia dentro de:

```text
/etc/nginx/sites-enabled/
```

La estructura utilizada por Nginx permite mantener separadas las configuraciones disponibles de aquellas que están actualmente activas.

Después de realizar la configuración, se recargó el servicio Nginx mediante:

```bash
sudo systemctl reload nginx
```

La recarga permite aplicar los cambios de configuración sin detener completamente el servicio.

---

# 10. Configuración del certificado SSL mediante Certbot

Para habilitar HTTPS se utilizó **Certbot**, una herramienta que permite obtener y administrar certificados SSL/TLS de forma automatizada.

El certificado permite establecer una conexión segura entre el navegador del usuario y el servidor.

El flujo de comunicación queda de la siguiente manera:

```text
Usuario
   │
   │ HTTPS cifrado
   ▼
Cloudflare
   │
   ▼
Nginx
   │
   │ Proxy inverso
   ▼
Servicio Docker
```

El uso de HTTPS permite proteger la comunicación y evitar que la información transmitida viaje de forma no cifrada.

Además, Certbot permite automatizar la renovación de los certificados antes de que expiren.

Para comprobar que el mecanismo de renovación automática funciona correctamente se utilizó:

```bash
sudo certbot renew --dry-run
```

El parámetro `--dry-run` realiza una simulación de la renovación sin modificar realmente el certificado existente.

Esto permite comprobar que el proceso de renovación automática está correctamente configurado.

---

# 11. Arquitectura final de la infraestructura

La arquitectura implementada para publicar el sistema puede representarse de la siguiente manera:

```text
                         USUARIO
                            │
                            │ HTTPS
                            ▼
                    SUBDOMINIO WEB
                            │
                            ▼
                       CLOUDFLARE
                     ┌─────────────┐
                     │     DNS     │
                     │ Registro A  │
                     └──────┬──────┘
                            │
                            │ 34.39.133.213
                            ▼
                  ┌─────────────────────┐
                  │    GOOGLE CLOUD     │
                  │                     │
                  │   Máquina Virtual   │
                  │      Debian         │
                  │                     │
                  │   Firewall 80/443   │
                  │         │           │
                  │         ▼           │
                  │       NGINX         │
                  │   Reverse Proxy     │
                  │         │           │
                  │         ▼           │
                  │   Docker / Compose  │
                  │         │           │
                  │         ▼           │
                  │    Contenedores     │
                  │         │           │
                  │         ▼           │
                  │       n8n           │
                  │      :5678          │
                  └─────────────────────┘
```

## Resumen del flujo

El funcionamiento general de la infraestructura es el siguiente:

1. El usuario ingresa al **subdominio** mediante HTTPS.
2. **Cloudflare DNS** resuelve el subdominio hacia la IP pública estática de Google Cloud.
3. La solicitud llega a la **máquina virtual Debian** alojada en Google Cloud.
4. Las reglas de firewall permiten el tráfico necesario a través de los puertos `80` y `443`.
5. **Nginx** recibe la solicitud HTTPS.
6. Nginx actúa como **proxy inverso** y redirige la solicitud hacia el servicio correspondiente.
7. El servicio se encuentra ejecutándose dentro de un **contenedor Docker**.
8. **Docker Compose** permite administrar y coordinar los diferentes servicios desplegados.
9. **Certbot** gestiona el certificado SSL/TLS y permite automatizar su renovación.
10. El usuario puede acceder al servicio mediante un dominio seguro utilizando `https://`, sin necesidad de ingresar directamente a la IP pública y al puerto interno del servicio.

## Tecnologías utilizadas

| Tecnología              | Función                                                                             |
| ----------------------- | ----------------------------------------------------------------------------------- |
| **Google Cloud**        | Proveedor de infraestructura en la nube donde se aloja la máquina virtual           |
| **Compute Engine / VM** | Máquina virtual utilizada como servidor                                             |
| **Debian Linux**        | Sistema operativo del servidor                                                      |
| **SSH**                 | Protocolo utilizado para administrar remotamente el servidor                        |
| **Docker**              | Plataforma utilizada para ejecutar los servicios en contenedores                    |
| **Docker Compose**      | Herramienta utilizada para definir y administrar múltiples servicios y contenedores |
| **Cloudflare DNS**      | Gestión de DNS y resolución del subdominio hacia la IP del servidor                 |
| **Registro A**          | Asociación del subdominio con la dirección IPv4 pública                             |
| **Nginx**               | Servidor web y proxy inverso                                                        |
| **Certbot**             | Gestión y renovación automática de certificados SSL/TLS                             |
| **HTTPS**               | Protocolo utilizado para establecer comunicaciones seguras y cifradas               |
