# Directorio Person

Sistema web para consultar y administrar el directorio de personas de la
base de datos AdventureWorks: datos básicos, correos electrónicos,
teléfonos y direcciones, con autenticación de usuarios.

## Contexto académico

Proyecto desarrollado para la asignatura **Gerencia de Proyectos de
Software**. Trabaja exclusivamente sobre el schema `Person` de la base de
datos de ejemplo **AdventureWorks2025** de SQL Server; no crea, modifica ni
elimina ninguna tabla original de AdventureWorks (ver la nota al final de
este documento).

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Base de datos | SQL Server 2025 Express, base `AdventureWorks2025`, schema `Person` |
| Backend | Node.js + Express |
| Driver de base de datos | mssql |
| Autenticación | JWT (`jsonwebtoken`) + contraseñas cifradas con `bcrypt` |
| Frontend | React + Vite |
| Enrutamiento | React Router |
| Peticiones HTTP | Axios |
| Estilos | Tailwind CSS |

## Requisitos previos

| Software | Versión |
|---|---|
| SQL Server | 2025 Express, instancia con autenticación en modo mixto |
| SQL Server Management Studio (SSMS) | Cualquier versión reciente compatible con SQL Server 2025 |
| Node.js | 20.19 o superior |
| Git | Cualquier versión reciente |

También se necesita el archivo de respaldo `AdventureWorks2025.bak` (no se
incluye en este repositorio).

## Instalación

### 1. Restaurar la base de datos AdventureWorks2025

En SSMS, conectado a la instancia de SQL Server:

1. Clic derecho sobre **Databases** → **Restore Database...**
2. Selecciona **Device**, elige el archivo `AdventureWorks2025.bak`.
3. Verifica que el nombre de la base de datos de destino sea
   `AdventureWorks2025` y confirma la restauración.

Alternativa por T-SQL (ajusta las rutas a tu instalación):

```sql
RESTORE DATABASE AdventureWorks2025
FROM DISK = 'C:\Ruta\A\AdventureWorks2025.bak'
WITH MOVE 'AdventureWorks2025' TO 'C:\Ruta\Datos\AdventureWorks2025.mdf',
     MOVE 'AdventureWorks2025_log' TO 'C:\Ruta\Datos\AdventureWorks2025_log.ldf',
     REPLACE;
```

### 2. Habilitar TCP/IP en el puerto 1433

1. Abre **SQL Server Configuration Manager**.
2. **SQL Server Network Configuration** → **Protocols for \<tu instancia\>**.
3. Habilita **TCP/IP** (clic derecho → Enable).
4. Doble clic en **TCP/IP** → pestaña **IP Addresses** → en la sección
   **IPAll**, define `TCP Port` = `1433`.
5. Reinicia el servicio de SQL Server para que el cambio surta efecto.

### 3. Crear el usuario de aplicación

En SSMS, con una cuenta administradora, ejecuta (reemplaza la contraseña
por una propia, no la dejes como aparece aquí):

```sql
USE master;
GO
CREATE LOGIN app_directorio WITH PASSWORD = 'Reemplaza_Esta_Contrasena123!';
GO

USE AdventureWorks2025;
GO
CREATE USER app_directorio FOR LOGIN app_directorio;
GO

-- Permisos sobre el schema Person: es el único que la aplicación consulta
-- y modifica.
GRANT SELECT, INSERT, UPDATE, DELETE ON SCHEMA::Person TO app_directorio;
GO
```

### 4. Crear la tabla dbo.UsuarioAplicacion

Esta es la única tabla que el proyecto agrega a la base de datos, fuera
del schema `Person` a propósito (ver la nota final):

```sql
USE AdventureWorks2025;
GO

CREATE TABLE dbo.UsuarioAplicacion (
    UsuarioAplicacionID INT IDENTITY(1,1) PRIMARY KEY,
    NombreUsuario       NVARCHAR(50)  NOT NULL UNIQUE,
    HashContrasena      NVARCHAR(255) NOT NULL,
    NombreCompleto      NVARCHAR(100) NOT NULL,
    Activo              BIT           NOT NULL DEFAULT 1,
    FechaCreacion       DATETIME      NOT NULL DEFAULT GETDATE()
);
GO

GRANT SELECT, INSERT, UPDATE, DELETE ON dbo.UsuarioAplicacion TO app_directorio;
GO
```

### 5. Configurar y arrancar el backend

```bash
cd backend
copy .env.example .env      # en PowerShell/cmd; en Git Bash usa: cp .env.example .env
```

Edita `backend/.env` con tus propios valores:

- `DB_SERVER`, `DB_PORT`, `DB_DATABASE`: datos de tu instancia (por
  defecto `127.0.0.1`, `1433`, `AdventureWorks2025`).
- `DB_USER` / `DB_PASSWORD`: `app_directorio` y la contraseña que
  definiste en el paso 3.
- `JWT_SECRET`: una cadena larga y aleatoria, distinta a cualquier
  ejemplo. Puedes generar una con:
  ```bash
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  ```
- `JWT_EXPIRES_IN`: puedes dejar `8h`.

Instala las dependencias y arranca el servidor:

```bash
npm install
npm run dev
```

El backend queda escuchando en `http://localhost:3000`. Verifica que
responde entrando a `http://localhost:3000/api/salud`.

### 6. Crear el usuario inicial de la aplicación

Con el backend configurado (no hace falta que esté corriendo, este script
se conecta directo a la base de datos), desde `backend/`:

```bash
node scripts/crear-usuario.js <nombreUsuario> <contrasena> "<nombre completo>"
```

Ejemplo:

```bash
node scripts/crear-usuario.js admin "TuContrasenaSegura123" "Administrador del Sistema"
```

Con este usuario podrás iniciar sesión desde el frontend.

### 7. Configurar y arrancar el frontend

En otra terminal:

```bash
cd frontend
copy .env.example .env      # en PowerShell/cmd; en Git Bash usa: cp .env.example .env
```

Por defecto, `frontend/.env` apunta a `http://localhost:3000/api`, que es
donde corre el backend si seguiste los pasos anteriores sin cambios. Si
cambiaste el puerto del backend, ajusta `VITE_API_URL` en consecuencia.

Instala las dependencias y arranca el servidor de desarrollo:

```bash
npm install
npm run dev
```

Vite indicará la URL local (normalmente `http://localhost:5173`). Ábrela
en el navegador e inicia sesión con el usuario creado en el paso 6.

## Endpoints disponibles

Todas las rutas están montadas bajo el prefijo `/api`. Las que requieren
token esperan el encabezado `Authorization: Bearer <token>`.

| Método | Endpoint | Requiere token | Descripción |
|---|---|---|---|
| GET | `/api/salud` | No | Verifica que la API está en funcionamiento |
| POST | `/api/auth/login` | No | Inicia sesión; recibe `{ nombreUsuario, contrasena }`, devuelve `{ token, usuario }` |
| GET | `/api/auth/perfil` | Sí | Devuelve los datos del usuario autenticado |
| GET | `/api/personas` | Sí | Listado paginado de personas. Parámetros de consulta: `pagina`, `limite`, `buscar`, `tipo` |
| GET | `/api/personas/:id` | Sí | Detalle de una persona: datos básicos, correos, teléfonos y direcciones |

## Estructura de carpetas

```
directorio-person/
├── backend/
│   ├── scripts/
│   │   └── crear-usuario.js   # script de línea de comandos para dar de alta usuarios
│   └── src/
│       ├── config/            # conexión a SQL Server (pool de conexiones)
│       ├── routes/            # solo declaran rutas y las enlazan a su controlador
│       ├── controllers/       # leen la petición, llaman al servicio, arman la respuesta
│       ├── services/          # reglas de negocio, transacciones y consultas SQL
│       ├── middlewares/       # verificación del token JWT
│       ├── utils/             # utilidades compartidas (p. ej. paginación)
│       ├── app.js             # configuración de Express (middlewares y rutas)
│       └── server.js          # punto de arranque del servidor
└── frontend/
    └── src/
        ├── api/                # instancia de axios y funciones que consumen cada endpoint
        ├── context/            # AuthContext: sesión (token y usuario) en toda la app
        ├── components/         # componentes reutilizables (encabezado, ruta protegida)
        ├── pages/              # pantallas: login, listado y detalle de personas
        ├── constants/          # datos compartidos entre páginas (p. ej. tipos de persona)
        └── App.jsx             # definición de rutas de la aplicación
```

## Nota sobre el esquema de base de datos

El proyecto **no modifica ninguna tabla original del schema `Person`** de
AdventureWorks: todas las consultas son de lectura o, en el caso de
correos/teléfonos/direcciones, seguirán trabajando sobre esas mismas
tablas sin alterar su estructura. La única tabla que este proyecto crea
es `dbo.UsuarioAplicacion`, en el schema `dbo` y fuera del schema
`Person` a propósito, para mantener separados los datos de negocio
(las personas de AdventureWorks) de los datos propios de la aplicación
(los usuarios que pueden iniciar sesión).
