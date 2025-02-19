<h1 align="center"><strong>Título Centrado en Negrita</strong></h1>

## 1. Configurar el entorno de desarrollo 

### 1.1 Instalar Node.js y npm

Descargar node [aquí](https://nodejs.org/es).

### 1.2. Crear un nuevo proyecto

Ejecuta en la terminal:

    mkdir api-hospital

    cd api-rest-node

    npm init -y

### 1.3. Instalar dependencias necesarias

Ejecuta en la terminal:

    npm install express mysql2 dotenv jsonwebtoken bcryptjs cors body-parser

Instalar nodemon, recarga automáticamente los cambios:

    npm install --save-dev nodemon

### 1.4 Agregar en el archivo package.json nodemon para ejecutarlo 

    "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
    }

Ejecutar el servidor con nodemon:

    npm run dev

