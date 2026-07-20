
# 🦷 Guía de Contribución - DentalCare

¡Bienvenido al equipo de desarrollo de **DentalCare**! Para mantener un historial limpio y un flujo de trabajo eficiente, seguimos estos lineamientos de Git y colaboración.

---

## 📌 Índice
1. [Flujo de Ramas](#-flujo-de-ramas)
2. [Flujo de Trabajo Paso a Paso](#-flujo-de-trabajo-paso-a-paso)
3. [Estándar de Commits](#-estándar-de-commits)
4. [Comandos Útiles](#-comandos-útiles)
5. [Reglas de Oro](#-reglas-de-oro)

---

## 🌿 Flujo de Ramas

Seguimos una versión simplificada de **GitFlow**.

| Rama | Descripción | Reglas |
| :--- | :--- | :--- |
| `master` | Producción / Versiones estables. | 🚫 Prohibido subir cambios directos. |
| `develop` | Rama principal de desarrollo. | 🔄 Punto de unión de todas las funciones. |
| `feature/*` | Nuevas funcionalidades. | ✨ Se crea una por cada tarea/ticket. |

### Ejemplos de ramas `feature`:
- `feature/authentication`
- `feature/patients`
- `feature/appointments`

---

## 🚀 Flujo de Trabajo Paso a Paso

### 1️⃣ Configuración Inicial
Si es tu primera vez trabajando en el proyecto:
```bash
# Clonar el proyecto
git clone <url-del-repositorio>

# Entrar a la carpeta y sincronizar develop
cd DentalCare
git checkout develop
git pull origin develop
```

### 2️⃣ Crear una Funcionalidad
Antes de escribir código, crea tu rama de trabajo desde `develop`:
```bash
git checkout develop
git pull origin develop
git checkout -b feature/nombre-funcionalidad
```

### 3️⃣ Desarrollo Diario
Mantén tu rama actualizada para evitar conflictos grandes al final:
```bash
git checkout develop
git pull origin develop
git checkout feature/nombre-funcionalidad
git merge develop
```

### 4️⃣ Integrar Cambios
Una vez termines y verifiques que todo funciona, integra tu código a `develop`:
```bash
# 1. Asegúrate de estar en develop y actualizado
git checkout develop
git pull origin develop

# 2. Fusiona tu rama
git merge feature/nombre-funcionalidad

# 3. Sube los cambios al servidor
git push origin develop
```

### 5️⃣ Limpieza de Ramas
Borra la rama que ya no necesites:
```bash
git branch -d feature/nombre-funcionalidad             # Local
git push origin --delete feature/nombre-funcionalidad  # Remota
```

---

## 💬 Estándar de Commits

Usamos prefijos para identificar rápidamente el propósito de cada cambio.

| Prefijo | Descripción |
| :--- | :--- |
| `feat:` | Nueva funcionalidad. |
| `fix:` | Corrección de errores. |
| `docs:` | Cambios en la documentación. |
| `refactor:` | Mejora de código (sin cambiar lógica). |
| `style:` | Formato, espacios, puntos y comas. |
| `test:` | Pruebas unitarias o de integración. |
| `chore:` | Tareas de mantenimiento o dependencias. |

**Ejemplo de buen commit:**
> `git commit -m "feat: agregar validación de fechas en la agenda"`

---

## 🛠️ Comandos Útiles

### 🔍 Inspección
* **Ver ramas:** `git branch` (añade `-a` para ver remotas).
* **Ver estado:** `git status`
* **Historial gráfico:** `git log --oneline --graph --all`

### 📤 Sincronización
* **Subir rama nueva:** `git push -u origin feature/nombre`
* **Actualizar todo:** `git pull`

### 🔄 Cambios rápidos
* **Switch de rama:** `git switch nombre-rama`
* **Agregar todo:** `git add .`

---

## 🚨 Reglas de Oro

1.  **Nunca** trabajes directamente sobre `master`.
2.  **No** desarrolles nuevas funcionalidades directamente en `develop`.
3.  **Sincroniza siempre** antes de empezar a trabajar (`git pull`).
4.  **Commits Atómicos:** Haz commits pequeños que resuelvan una sola cosa.
5.  **Resuelve conflictos** en tu rama `feature`, nunca en la rama principal.
6.  **Verificación:** El proyecto debe compilar y ejecutar sin errores antes de hacer un `merge`.

