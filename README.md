# Nodo Cine – Backend

## 1. Descripción del Proyecto
Este backend provee la API REST para **Nodo Cine**, una plataforma tipo mini Netflix que permite:

- Gestión de usuarios y autenticación con JWT.
- Administración de perfiles con restricciones por edad.
- CRUD completo de películas, incluyendo integración con APIs externas para trailers o ratings.
- Roles de usuario: `owner`, `admin` y `standard`.
- Paginación y filtros avanzados para el catálogo de películas.
- Comunicación segura con el frontend mediante tokens JWT.

---

## 2. Tecnologías Utilizadas
- Node.js
- Express
- MongoDB / Mongoose
- JWT para autenticación y autorización
- Axios para consumir APIs externas
- dotenv para variables de entorno
- Cors, bcrypt, y otras librerías de seguridad y utilidades

---

## 3. Requisitos Previos
- Node.js ≥ 18
- npm o yarn
- MongoDB corriendo (local o Atlas)
- Conexión a Internet para consumir APIs externas

---

## 4. Instalación
1. Clonar el repositorio:
```bash
git clone https://github.com/tu-usuario/nodo-cine-backend.git
cd nodo-cine-backend
npm install
PORT=5000
MONGO_URI=mongodb://localhost:27017/nodocine
JWT_SECRET=tu_clave_secreta
EXTERNAL_API_KEY=tu_api_key_si_aplica
Instalar dependencias:

cd nodo-cine-backend
npm install


Configurar variables de entorno creando .env:

PORT=5000
MONGO_URI=mongodb://localhost:27017/nodocine
JWT_SECRET=tu_clave_secreta
EXTERNAL_API_KEY=tu_api_key_si_aplica

5. Ejecución

Iniciar servidor en modo desarrollo con nodemon:

npm run dev


Iniciar servidor en modo producción:

npm start


La API estará disponible en http://localhost:5000/api.

6. Estructura de Archivos
src/
├─ controllers/       # Lógica de negocio para cada entidad (User, Profile, Movie)
├─ models/            # Esquemas de Mongoose
├─ routes/            # Rutas de la API, organizadas por entidad
├─ middleware/        # Middlewares (auth, roles, manejo de errores)
├─ utils/             # Funciones auxiliares (ej: consumo API externa, formateo)
├─ server.js          # Entrada principal del backend
└─ config/            # Configuraciones generales, conexión a MongoDB

7. Funcionalidades Clave

Autenticación y roles: JWT para login, rutas protegidas según rol.

CRUD completo: Usuarios, Perfiles y Películas.

Filtros avanzados: Búsqueda por nombre, género, año, clasificación por edad.

Paginación: Devuelve resultados paginados para el catálogo.

Consumo de API externa: Trailers, ratings o imágenes de películas.

Validaciones y manejo de errores: Express-validator, mensajes claros y consistentes.

8. Notas y Buenas Prácticas

Mantener JWT en encabezados de autorización Bearer <token> en el frontend.

Las rutas críticas (crear/editar/eliminar películas) solo permiten admin/owner.

Documentar endpoints con Swagger u otra herramienta opcional.

Usar variables de entorno para claves sensibles y URLs.