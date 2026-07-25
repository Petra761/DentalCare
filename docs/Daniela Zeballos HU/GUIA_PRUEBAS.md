# GUÍA DE PRUEBAS - Cómo ejecutar el proyecto

## 1. Backend (API .NET)

### Requisitos
- .NET SDK 8.0 o superior
- PostgreSQL 15+ con base de datos creada (`DentalCare`)
- Cadena de conexión configurada en `appsettings.json`

### Pasos
```bash
# Ir a la carpeta del backend
cd backend/DentalCare

# Restaurar paquetes
dotnet restore

# Aplicar migraciones (crear/actualizar tablas)
dotnet ef database update

# Ejecutar seed SQL (opcional, ver DATOS_INICIALES.md)
# Pegar el contenido en pgAdmin / DBeaver / psql

# Iniciar el servidor (http://localhost:5000 por defecto)
dotnet run
```

El backend queda escuchando en:
- `http://localhost:5000` (por defecto)
- `http://localhost:5000/swagger` (documentación interactiva)

---

## 2. Frontend (React + Vite)

### Requisitos
- Node.js 18+ y npm

### Pasos
```bash
# Ir a la carpeta del frontend
cd frontend/frontend

# Instalar dependencias (solo la primera vez)
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El frontend abre en `http://localhost:5173` (o 5174 si el puerto está ocupado).

---

## 3. Exponer Backend con ngrok (para pruebas con n8n)

ngrok crea un túnel HTTPS público hacia tu localhost para que n8n (y WhatsApp) puedan alcanzar tu backend aunque estés en desarrollo local.

### Instalación
```bash
# Descargar desde https://ngrok.com/download
# Descomprimir y agregar a PATH, o usar el .exe directamente

# Autenticar (requiere registrarse gratis en ngrok.com)
ngrok config add-authtoken TU_TOKEN_AQUI
```

### Uso
```bash
# Exponer el backend (puerto 5000)
ngrok http http://localhost:5000
```

Esto genera una URL como `https://abcd1234.ngrok-free.app`.
Esa URL se usa en n8n en lugar de `http://localhost:5000`.

### Ejemplo de URL para n8n
```
https://abcd1234.ngrok-free.app/api/Citas/disponibilidad
https://abcd1234.ngrok-free.app/api/Citas/agendar-desde-n8n
https://abcd1234.ngrok-free.app/api/Servicios/catalogo
```

### Notas
- La URL de ngrok cambia cada vez que reinicias ngrok (a menos que pagues el plan fijo).
- Si cambia la URL, también debes actualizar los nodos HTTP de n8n.
- ngrok free muestra una pantalla de advertencia la primera vez que se visita; en n8n no hay problema porque es una llamada API.

---

## 4. n8n (Workflow del Bot)

### Opción A: n8n local
```bash
# Instalar
npm install -g n8n

# Iniciar
n8n start
```
- Abrir `http://localhost:5678`
- Importar el workflow desde el archivo JSON (si existe)
- Configurar cada nodo HTTP con la URL de ngrok

### Opción B: n8n cloud
Si usas n8n.cloud, la configuración es la misma solo que no necesitas instalar nada.

### Webhook de WhatsApp
El workflow usa un Webhook de WhatsApp como trigger. Necesitas:
1. Una cuenta de WhatsApp Business API (Meta)
2. El webhook configurado para apuntar a tu instancia n8n
3. El AI Agent configurado con OpenRouter (modelo: `gpt-4o-mini`)

---

## 5. Flujo de prueba completo

```
WhatsApp (mensaje paciente)
       |
       v
n8n Webhook recibe el mensaje
       |
       v
AI Agent (OpenRouter) interpreta la intención
       |
       v
n8n HTTP Request -> ngrok -> localhost:5000 -> API Backend
       |
       v
Backend consulta/escribe en BD + Google Calendar
       |
       v
n8n responde al paciente por WhatsApp
```

### Para probar manualmente el backend sin n8n:
```bash
curl -X POST http://localhost:5000/api/Citas/disponibilidad \
  -H "Content-Type: application/json" \
  -d '{"fecha":"2026-07-25","idServicio":1}'
```

### Para probar el frontend:
Abrir `http://localhost:5173` y usar las pestañas:
- **Activas** — citas pendientes, confirmadas, canceladas
- **Historial** — citas completadas
- **Nueva Cita** — formulario de creación

## 6. Google Calendar (prueba de conexión)

```bash
GET http://localhost:5000/api/Citas/test-calendar
```

Debe devolver `200 OK` si la credencial de servicio está bien configurada.
