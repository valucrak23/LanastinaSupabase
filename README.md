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

## Tecnologías Utilizadas

- **Vue 3** - Framework progresivo de JavaScript con SFC (Single-File Components)
- **Vue Router** - Enrutamiento oficial para Vue.js (SPA)
- **Vite** - Build tool y bundler moderno
- **Tailwind CSS 4** - Framework de CSS para estilización
- **Supabase** - Backend-as-a-Service para:
  - Autenticación (Auth API)
  - Base de datos PostgreSQL
  - Actualizaciones en tiempo real (Realtime API)

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

## Estructura de la Base de Datos

### Tabla: `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Los usuarios pueden ver todos los perfiles" 
  ON users FOR SELECT 
  USING (true);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" 
  ON users FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden insertar su propio perfil" 
  ON users FOR INSERT 
  WITH CHECK (auth.uid() = id);
```

### Tabla: `posts`
```sql
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Todos pueden ver las publicaciones" 
  ON posts FOR SELECT 
  USING (true);

CREATE POLICY "Los usuarios autenticados pueden crear publicaciones" 
  ON posts FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Los usuarios pueden eliminar sus propias publicaciones" 
  ON posts FOR DELETE 
  USING (auth.uid() = user_id);
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
- Registro de usuarios con email y contraseña
- Inicio de sesión
- Cierre de sesión
- Protección de rutas privadas mediante Navigation Guards

### Publicaciones
- Crear publicaciones con título, descripción e imagen (URL)
- Ver feed de todas las publicaciones ordenadas por fecha
- Actualización en tiempo real al crear nuevas publicaciones
- Eliminar publicaciones propias
- Ver publicaciones por usuario

### Perfiles
- Perfil personalizado con nombre para mostrar y biografía
- Edición del perfil propio
- Visualización de perfiles de otros usuarios
- Listado de publicaciones por usuario

## Características Técnicas

### Semántica HTML
- Uso correcto de etiquetas semánticas: `<nav>`, `<main>`, `<footer>`, `<article>`, `<header>`, `<section>`
- Títulos jerárquicos (`<h1>`, `<h2>`, `<h3>`)
- Elementos `<time>` con atributo `datetime`

### Accesibilidad
- Labels asociados a inputs
- Atributos `alt` en imágenes
- Estados de carga y disabled en formularios
- Contraste de colores adecuado

### Patrones de Diseño
- **Observer Pattern**: Implementado en el servicio de autenticación para notificar cambios de estado a múltiples componentes
- **Service Layer**: Separación de la lógica de negocio en servicios reutilizables

### Documentación
- JSDoc en todas las funciones exportadas
- Comentarios explicativos en código complejo
- Nombres de variables y funciones descriptivos

## Scripts Disponibles

```bash
npm run dev      # Ejecuta el servidor de desarrollo
npm run build    # Construye la aplicación para producción
npm run preview  # Previsualiza la build de producción
```

## Consideraciones de Seguridad

- Las políticas RLS de Supabase protegen los datos a nivel de base de datos
- Los Navigation Guards protegen las rutas que requieren autenticación
- Las claves de Supabase son públicas (anon key) y están diseñadas para uso en frontend
- La seguridad real se implementa mediante las políticas RLS en Supabase

## Autor

Proyecto desarrollado como primer parcial de Clientes Web Mobile - Da Vinci 2025


## Datos de Usuarios Creados
-- **admin** -- lanastina@gmail.com | admin123
ana.tejedora@email.com	      | ana123
carlos.crochet@email.com	    | carlos123
maria.amigurumi@email.com	    | maria123
luis.circular@email.com	      | luis123
sofia.macrame@email.com	      | sofia123
diego.bebes@email.com	        | diego123
elena.accesorios@email.com	  | elena123
roberto.decoracion@email.com	| roberto123
laura.creativa@email.com	    | laura123
miguel.artesano@email.com	    | miguel123