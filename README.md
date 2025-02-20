<h1 align="center"><strong>Título Centrado en Negrita</strong></h1>

## Tareas completadas

✔️ Configurar el entorno de desarrollo

✔️ Cifrado de password

✔️ Autenticación con jsonwebtoken (JWT) y bcryptjs

✔️ Login (inicio de sesión) y register (registrar)

---

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
    
    npm install sequelize 

Instalar nodemon, recarga automáticamente los cambios:

    npm install --save-dev nodemon

### Explicación del uso de jsonwebtoken bcryptjs
 Se utiliza **jsonwebtoken (JWT)**  para crear y verificar tokens de autenticación, permitiendo a los usuarios acceder a las API de manera segura.
 
 Por otro lado, **bcryptjs** se utiliza para encriptar contraseñas, asegurando que incluso si la base de datos se ve comprometida
### 1.4 Agregar en el archivo package.json nodemon para ejecutarlo 

    "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
    }

Ejecutar el servidor con nodemon:

    npm run dev

## 2. Cifrar password en la base de datos
Se crea el archivo **"actualizarContraseñas.js"** el script para actualizar los password (contraseñas) en la base de datos, luego se ejecuta el comando:

    node actualizarContraseñas.js
    
Resultado: todo las contraseñas estan cifradas.

## 3. Login 
Endpoint: POST /api/auth/login

URL: http://localhost:5000/api/auth/login

Body/raw:

    {
        "nombre_usuario": "pacient",
        "password": "pass"
    }

            {"message":"Inicio de sesión exitoso","token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZF91c3VhcmlvIjoyLCJub21icmVfdXN1YXJpbyI6InBhY2llbnRlMiIsInJvbCI6",

            "user": {
                "id_usuario": 2,
                "nombre_usuario": "pacient",
                "fecha_creacion": "2025-02-11 05:27:07",
                "rol": {
                    "id_rol": 1,
                    "nombre_rol": "PACIENTE",
                    "permiso": {
                        "ver_turno": true,
                        "ver_historial": true,
                        "reservar_turno": true
                    },
                    "estatus": 1
                }
            }
        }

## 4. Register
Endpoint: POST /api/auth/login

URL: http://localhost:5000/api/auth/login

Body/raw:

    {
    "nombre_usuario": "paciente6",
    "password": "password16",
    "id_rol": 1
}

Respuesta:

    {
        "message": "Usuario registrado exitosamente",
        "usuario": {
            "id_usuario": 17,
            "nombre_usuario": "paciente7",
            "fecha_creacion": "2025-02-20 20:35:07",
            "id_rol": 1
        }
    }
