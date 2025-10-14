# Lanastina 🧶

Red social para amantes del tejido. Comparte tus proyectos, inspírate con otros tejedores y conecta con la comunidad.

## Descripción del Proyecto

Lanastina es una red social temática dedicada al tejido, donde los usuarios pueden:

- Crear una cuenta y autenticarse
- Publicar proyectos de tejido con imágenes y descripciones
- Ver todas las publicaciones de la comunidad en tiempo real
- Visitar perfiles de otros usuarios
- Administrar su perfil personal (nombre, biografía)
- Eliminar sus propias publicaciones


## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   └── AppH1.vue       # Componente de encabezado
├── pages/              # Vistas/Páginas de la aplicación
│   ├── Home.vue        # Página principal con feed de publicaciones
│   ├── Login.vue       # Página de inicio de sesión
│   ├── Register.vue    # Página de registro
│   ├── CreatePost.vue  # Página para crear publicaciones
│   ├── MyProfile.vue   # Página de perfil del usuario autenticado
│   └── UserProfile.vue # Página de perfil de otros usuarios
├── router/             # Configuración de rutas
│   └── router.js       # Definición de rutas y guards
├── services/           # Servicios para lógica de negocio
│   ├── supabase.js     # Inicialización del cliente de Supabase
│   ├── auth.js         # Servicio de autenticación (patrón Observer)
│   ├── users.js        # Servicio de gestión de usuarios
│   └── posts.js        # Servicio de gestión de publicaciones
├── App.vue             # Componente raíz
├── main.js             # Punto de entrada de la aplicación
└── style.css           # Estilos globales
```

## Instalación y Configuración

### Requisitos Previos
- Node.js (versión 18 o superior)
- npm o yarn
- Cuenta de Supabase

### Pasos de Instalación

1. Instalar dependencias:
```bash
npm install
```

2. Configurar Supabase:
   - Las credenciales ya están configuradas en `src/services/supabase.js`
   - Ejecutar el script SQL del archivo `supabase-setup.sql` en el SQL Editor de Supabase

3. Habilitar Realtime en Supabase:
   - Ir al panel de Supabase → Database → Replication
   - Habilitar Realtime para la tabla `posts`

4. Ejecutar el proyecto en modo desarrollo:
```bash
npm run dev
```

5. Abrir el navegador en `http://localhost:5173`

## Funcionalidades Principales

### Autenticación
- Registro de usuarios con email, contraseña y username personalizado
- Inicio de sesión
- Cierre de sesión
- Protección de rutas privadas mediante Navigation Guards

### Publicaciones
- Crear publicaciones con título, descripción e imagen (subida directa)
- Ver feed de todas las publicaciones ordenadas por fecha
- Sistema de likes con contador en tiempo real
- Menciones de usuarios con @usuario (tags clickeables)
- Eliminar publicaciones propias
- Ver publicaciones por usuario

### Perfiles
- Perfil personalizado con nombre, apellido, biografía y foto
- Edición del perfil propio (nombre, apellido, biografía, intereses)
- Sistema de intereses/tags para categorizar usuarios
- Visualización de perfiles de otros usuarios
- Listado de publicaciones por usuario

### Funcionalidades Extra
- Sistema de reportes para publicaciones y usuarios
- Funciones de administrador (eliminar publicaciones de otros)
- Popups personalizados (reemplazo de alert/confirm nativos)
- Diseño responsive con tema "crochet master"
- Subida de imágenes con validación

## Base de Datos

### Estructura de Entidades

#### `perfiles` (Usuarios)
- `perfil_id` (UUID, PK) - Identificador único del usuario
- `email` (text) - Email del usuario
- `username` (text, único) - Nombre de usuario generado automáticamente
- `nombre` (text) - Nombre real del usuario
- `apellido` (text) - Apellido del usuario
- `biografia` (text) - Descripción personal del usuario
- `foto_perfil_url` (text) - URL de la foto de perfil
- `es_admin` (boolean) - Indica si es administrador
- `created_at` (timestamp) - Fecha de creación

#### `publicaciones` (Posts)
- `publicacion_id` (UUID, PK) - Identificador único del post
- `perfil_id` (UUID, FK) - Referencia al usuario que creó el post
- `titulo` (text) - Título del post
- `descripcion` (text) - Descripción/contenido del post
- `imagen_url` (text) - URL de la imagen del proyecto
- `created_at` (timestamp) - Fecha de creación

#### `likes`
- `like_id` (UUID, PK) - Identificador único del like
- `publicacion_id` (UUID, FK) - Referencia al post
- `perfil_id` (UUID, FK) - Referencia al usuario que dio like
- `created_at` (timestamp) - Fecha del like

#### `intereses`
- `interes_id` (UUID, PK) - Identificador único del interés
- `nombre` (text) - Nombre del interés (ej: "Amigurumi", "Crochet")
- `descripcion` (text) - Descripción del interés

#### `usuario_intereses`
- `usuario_interes_id` (UUID, PK) - Identificador único
- `perfil_id` (UUID, FK) - Referencia al usuario
- `interes_id` (UUID, FK) - Referencia al interés

#### `reportes_publicaciones`
- `reporte_id` (UUID, PK) - Identificador único del reporte
- `publicacion_id` (UUID, FK) - Referencia al post reportado
- `reporter_id` (UUID, FK) - Referencia al usuario que reporta
- `razon` (text) - Motivo del reporte
- `created_at` (timestamp) - Fecha del reporte

#### `reportes_usuarios`
- `reporte_id` (UUID, PK) - Identificador único del reporte
- `usuario_reportado_id` (UUID, FK) - Referencia al usuario reportado
- `reporter_id` (UUID, FK) - Referencia al usuario que reporta
- `razon` (text) - Motivo del reporte
- `created_at` (timestamp) - Fecha del reporte

### Relaciones
- Un usuario puede tener muchas publicaciones (1:N)
- Un usuario puede dar like a muchas publicaciones (N:M)
- Un usuario puede tener muchos intereses (N:M)
- Un usuario puede reportar muchas publicaciones (1:N)
- Un usuario puede ser reportado muchas veces (1:N)

## Datos de Usuarios Creados
- **admin**: lanastina@gmail.com | admin123
- ana.tejedora@gmail.com         | ana123
- carlos.crochet@email.com       | carlos123
- maria.amigurumi@email.com      | maria123
- luis.circular@email.com        | luis123
- sofia.macrame@email.com        | sofia123
- agostina.lalana@gmail.com      | agos123
