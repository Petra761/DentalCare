# 🔑 Google Credentials - Configuración

## Archivo necesario
El sistema necesita un archivo `google-credentials.json` en `backend/DentalCare/` para conectar con Google Calendar.

## Pasos

1. **Renombrar el archivo de ejemplo**
   ```bash
   ren backend\DentalCare\google-credentials_example.json google-credentials.json
   ```
   O simplemente copia el archivo y cambia el nombre a `google-credentials.json`.

2. **Pegar la credencial**
   Abre `google-credentials.json` y reemplaza su contenido con el JSON de la credencial de Google Cloud que te proporcionará el equipo. Debe verse así:

   ```json
   {
     "type": "service_account",
     "project_id": "tu-project-id",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...",
     "client_email": "...",
     "client_id": "...",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     ...
   }
   ```

3. **Verificar**
   Asegúrate de que `google-credentials.json` esté en:
   ```
   backend/DentalCare/google-credentials.json
   ```
   (junto al archivo de ejemplo)

## ⚠️ Importante
- **No** subas `google-credentials.json` al repositorio (está en `.gitignore`)
- **No** compartas la credencial por canales no seguros
- Cada miembro del equipo debe generar su propia credencial o recibirla de forma segura
