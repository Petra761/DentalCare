# Tecnologías Utilizadas

En el desarrollo e implementación del sistema de gestión para la clínica dental se utilizaron diferentes tecnologías y herramientas para construir la aplicación, gestionar la infraestructura, automatizar la atención al paciente y garantizar la disponibilidad y seguridad del sistema.

---

## 1. React

**React** es una biblioteca de JavaScript utilizada para desarrollar interfaces de usuario mediante componentes reutilizables.

En el proyecto se utilizó para desarrollar la **interfaz web del sistema**, permitiendo que los usuarios administrativos puedan interactuar con funcionalidades como:

* Gestión y visualización de citas.
* Administración de pacientes.
* Gestión de tratamientos y alergias.
* Visualización de la agenda.
* Consulta de estadísticas y reportes.
* Exportación de información.

Su arquitectura basada en componentes permite organizar la interfaz de manera modular y facilitar el mantenimiento del código.

---

## 2. TypeScript

**TypeScript** es un lenguaje basado en JavaScript que incorpora tipado estático y características adicionales para mejorar la seguridad y mantenibilidad del código.

En el proyecto se utilizó junto con React para desarrollar el frontend, permitiendo definir de manera explícita los tipos de datos utilizados por los componentes, formularios y comunicaciones con el backend.

Esto ayuda a detectar errores durante el desarrollo y facilita el mantenimiento de la aplicación.

---

## 3. Vite

**Vite** es una herramienta de desarrollo utilizada para crear, ejecutar y construir aplicaciones frontend modernas.

En el proyecto se utilizó como herramienta de construcción para la aplicación desarrollada con React y TypeScript.

Entre sus funciones se encuentran:

* Ejecutar el servidor de desarrollo.
* Gestionar el proceso de compilación.
* Optimizar los archivos para producción.
* Proporcionar una recarga rápida durante el desarrollo.

---

## 4. Tailwind CSS

**Tailwind CSS** es un framework de estilos basado en clases utilitarias que permite construir interfaces web de manera rápida y flexible.

En el proyecto se utilizó para diseñar la interfaz del sistema web, permitiendo implementar:

* Diseño responsive.
* Componentes visuales.
* Formularios.
* Tablas.
* Botones.
* Paneles administrativos.
* Dashboard y estadísticas.

Su enfoque permite adaptar la interfaz a diferentes tamaños de pantalla y dispositivos.

---

## 5. C# y .NET

**C#** es el lenguaje de programación utilizado para desarrollar la lógica del backend, mientras que **.NET** proporciona el entorno y las herramientas necesarias para construir la aplicación.

En el proyecto se utilizaron para desarrollar los servicios responsables de:

* Procesar las solicitudes del frontend.
* Implementar la lógica de negocio.
* Gestionar pacientes y citas.
* Administrar tratamientos y alergias.
* Gestionar usuarios y roles.
* Generar reportes.
* Comunicarse con la base de datos.
* Exponer los servicios mediante una API.

---

## 6. ASP.NET Core Web API

**ASP.NET Core Web API** es el framework utilizado para construir la API que permite la comunicación entre el frontend y el backend.

La API actúa como intermediario entre la interfaz web, la base de datos y otros servicios externos.

A través de sus endpoints se pueden realizar operaciones como:

* Crear citas.
* Consultar citas.
* Modificar citas.
* Cancelar citas.
* Gestionar pacientes.
* Administrar tratamientos.
* Registrar información clínica.
* Obtener estadísticas y reportes.

La comunicación se realiza mediante solicitudes HTTP utilizando una arquitectura basada en servicios REST.

---

## 7. PostgreSQL

**PostgreSQL** es un sistema de gestión de bases de datos relacional de código abierto.

En el proyecto se utiliza para almacenar y gestionar la información persistente del sistema.

Entre los datos almacenados se encuentran:

* Usuarios.
* Roles.
* Pacientes.
* Citas.
* Tratamientos.
* Categorías.
* Alergias.
* Información relacionada con las fichas clínicas.
* Registros necesarios para generar estadísticas y reportes.

PostgreSQL permite garantizar la integridad y consistencia de la información almacenada.

---

## 8. Entity Framework Core

**Entity Framework Core** es un ORM (Object-Relational Mapper) utilizado para facilitar la comunicación entre la aplicación desarrollada en C# y la base de datos PostgreSQL.

Permite trabajar con las tablas de la base de datos mediante objetos y clases de C#.

En el proyecto se utilizó para:

* Crear y consultar registros.
* Actualizar información.
* Eliminar registros.
* Gestionar relaciones entre entidades.
* Ejecutar operaciones sobre la base de datos.
* Administrar migraciones de la estructura de datos.

---

## 9. Google Cloud

**Google Cloud Platform (GCP)** es una plataforma de servicios de computación en la nube.

En el proyecto se utilizó principalmente para proporcionar la infraestructura necesaria para ejecutar el sistema en Internet.

Se utilizó una máquina virtual donde se desplegaron los servicios necesarios para el funcionamiento de la aplicación.

La infraestructura permite mantener el sistema disponible de forma remota y accesible desde Internet.

---

## 10. Google Compute Engine

**Google Compute Engine** es el servicio de Google Cloud utilizado para crear y administrar máquinas virtuales.

En el proyecto se utilizó una máquina virtual con sistema operativo Debian para funcionar como servidor.

En esta máquina virtual se instalaron y configuraron herramientas como:

* Docker.
* Docker Compose.
* Nginx.
* Certbot.

La máquina virtual actúa como servidor donde se ejecutan los servicios desplegados.

---

## 11. Debian Linux

**Debian** es una distribución de Linux utilizada como sistema operativo de la máquina virtual del servidor.

Se eligió como entorno para ejecutar los servicios debido a su estabilidad y compatibilidad con herramientas de infraestructura y despliegue.

En este sistema operativo se realizaron tareas como:

* Administración del servidor mediante SSH.
* Instalación de Docker.
* Configuración de Nginx.
* Instalación de Certbot.
* Gestión de servicios.
* Configuración de red y seguridad.

---

## 12. Docker

**Docker** es una plataforma de contenedores que permite empaquetar y ejecutar aplicaciones junto con sus dependencias dentro de entornos aislados.

En el proyecto se utilizó para ejecutar los servicios de la plataforma de manera independiente y controlada.

El uso de contenedores facilita:

* El despliegue de aplicaciones.
* La configuración del entorno.
* La administración de servicios.
* La portabilidad de la aplicación.
* El aislamiento entre servicios.

---

## 13. Docker Compose

**Docker Compose** es una herramienta utilizada para definir y administrar aplicaciones compuestas por múltiples contenedores.

En el proyecto se utilizó un archivo `docker-compose.yml` para centralizar la configuración de los servicios desplegados.

Dentro de este archivo se pueden definir aspectos como:

* Imágenes utilizadas.
* Contenedores.
* Puertos.
* Variables de entorno.
* Redes.
* Volúmenes.
* Dependencias entre servicios.

Esto permite iniciar y administrar los servicios de forma coordinada.

---

## 14. Nginx

**Nginx** es un servidor web y proxy inverso utilizado para gestionar las solicitudes provenientes de Internet.

En el proyecto se configuró como **Reverse Proxy**, recibiendo las solicitudes realizadas al dominio y redirigiéndolas internamente hacia el servicio correspondiente.

Su utilización permite:

* Gestionar las conexiones HTTPS.
* Ocultar los puertos internos de los servicios.
* Redirigir solicitudes hacia los contenedores Docker.
* Centralizar el acceso externo a los servicios.

La arquitectura utilizada permite que el usuario acceda mediante:

```text
https://subdominio.dominio.com
```

mientras que Nginx se encarga internamente de comunicarse con el servicio correspondiente.

---

## 15. Cloudflare

**Cloudflare** es una plataforma que proporciona servicios de DNS, seguridad y gestión del tráfico web.

En el proyecto se utilizó principalmente para gestionar el **DNS del dominio y subdominio**.

Se configuró un registro de tipo `A` para asociar el subdominio con la dirección IP pública de la máquina virtual de Google Cloud.

El flujo básico es:

```text
Subdominio
    ↓
Cloudflare DNS
    ↓
IP pública de Google Cloud
    ↓
Máquina Virtual Debian
    ↓
Nginx
    ↓
Servicio Docker
```

Esto permite que los usuarios accedan al sistema utilizando un nombre de dominio en lugar de una dirección IP.

---

## 16. Certbot

**Certbot** es una herramienta utilizada para obtener y administrar certificados digitales SSL/TLS.

En el proyecto se utilizó para habilitar conexiones seguras mediante HTTPS.

El certificado permite cifrar la comunicación entre el cliente y el servidor, protegiendo la información transmitida.

Además, Certbot permite automatizar el proceso de renovación del certificado antes de su fecha de expiración.

---

## 17. HTTPS / SSL-TLS

**HTTPS** es el protocolo utilizado para establecer comunicaciones seguras entre los usuarios y el servidor.

El sistema utiliza certificados SSL/TLS para cifrar la información transmitida.

Esto es especialmente importante debido a que la plataforma gestiona información relacionada con pacientes y operaciones de la clínica.

La implementación de HTTPS permite:

* Cifrar las comunicaciones.
* Proteger la información transmitida.
* Evitar la interceptación de datos.
* Aumentar la seguridad del acceso al sistema.

---

## 18. SSH

**SSH (Secure Shell)** es un protocolo utilizado para establecer conexiones remotas seguras con servidores.

En el proyecto se utilizó para administrar la máquina virtual de Google Cloud de manera remota.

A través de SSH se realizaron tareas como:

* Actualización del sistema operativo.
* Instalación de Docker.
* Configuración de Docker Compose.
* Instalación de Nginx y Certbot.
* Administración de contenedores.
* Configuración del servidor.

---

## 19. Google Calendar API

**Google Calendar API** es una interfaz de programación que permite que una aplicación interactúe de forma programática con Google Calendar.

En el proyecto se utilizó para integrar el **agente de Inteligencia Artificial con la agenda de Google Calendar**.

Esta integración permite que el agente pueda interactuar con la disponibilidad de horarios para apoyar procesos como:

* Consulta de disponibilidad.
* Gestión de eventos.
* Creación de citas.
* Modificación de citas.
* Cancelación o eliminación de eventos.

De esta manera, Google Calendar funciona como uno de los componentes utilizados para gestionar la disponibilidad de la agenda.

---

## 20. n8n

**n8n** es una plataforma de automatización de flujos de trabajo que permite conectar diferentes aplicaciones, APIs y servicios.

En el proyecto se utilizó como herramienta de automatización para coordinar diferentes componentes del sistema.

Puede utilizarse para integrar servicios como:

* WhatsApp.
* Agentes de Inteligencia Artificial.
* Google Calendar.
* APIs del sistema.
* Bases de datos.
* Servicios externos.

A través de flujos de trabajo, n8n permite automatizar procesos y establecer la comunicación entre los diferentes componentes de la plataforma.

---

## 21. Inteligencia Artificial (IA)

La **Inteligencia Artificial** se utiliza para implementar el asistente virtual encargado de interactuar con los pacientes.

El agente de IA permite automatizar la atención mediante WhatsApp y apoyar procesos como:

* Responder preguntas frecuentes.
* Proporcionar información sobre la clínica.
* Orientar sobre servicios y tratamientos.
* Interactuar con los pacientes.
* Apoyar el proceso de agendamiento.
* Consultar disponibilidad de horarios.
* Gestionar operaciones relacionadas con las citas.

El agente funciona como una capa de interacción entre el paciente y los servicios de la clínica.

---

## 22. WhatsApp

**WhatsApp** funciona como el canal de comunicación entre los pacientes y el asistente virtual.

A través de este canal, los pacientes pueden interactuar con el sistema para realizar diferentes operaciones relacionadas con la atención de la clínica.

Entre las funcionalidades contempladas se encuentran:

* Solicitar información.
* Consultar citas.
* Agendar citas.
* Reprogramar citas.
* Cancelar citas.
* Recibir confirmaciones.
* Recibir recordatorios.

La integración permite ofrecer atención automatizada durante las 24 horas.

---

# Resumen de Tecnologías

| Tecnología                  | Función dentro del proyecto                               |
| --------------------------- | --------------------------------------------------------- |
| **React**                   | Desarrollo de la interfaz web                             |
| **TypeScript**              | Tipado y desarrollo del frontend                          |
| **Vite**                    | Herramienta de desarrollo y construcción del frontend     |
| **Tailwind CSS**            | Diseño y estilos de la interfaz                           |
| **C#**                      | Desarrollo de la lógica del backend                       |
| **.NET / ASP.NET Core**     | Desarrollo de la API y servicios backend                  |
| **PostgreSQL**              | Almacenamiento de información                             |
| **Entity Framework Core**   | Comunicación entre el backend y la base de datos          |
| **Google Cloud**            | Infraestructura de computación en la nube                 |
| **Google Compute Engine**   | Máquina virtual utilizada como servidor                   |
| **Debian Linux**            | Sistema operativo del servidor                            |
| **Docker**                  | Contenerización de servicios                              |
| **Docker Compose**          | Administración y orquestación de contenedores             |
| **Nginx**                   | Servidor web y proxy inverso                              |
| **Cloudflare**              | Gestión de DNS y dominio                                  |
| **Certbot**                 | Gestión de certificados SSL/TLS                           |
| **HTTPS / SSL-TLS**         | Comunicación segura y cifrada                             |
| **SSH**                     | Administración remota del servidor                        |
| **Google Calendar API**     | Integración con la agenda de Google Calendar              |
| **n8n**                     | Automatización e integración de servicios                 |
| **Inteligencia Artificial** | Automatización de la atención y gestión de consultas      |
| **WhatsApp**                | Canal de comunicación entre pacientes y asistente virtual |
