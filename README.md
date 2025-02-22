<h1 align="center"><strong>API REST HOSPITAL</strong></h1>

**Descripción**

API REST desarrollada con Node.js, JavaScript y Express.js, utilizando Sequelize como ORM para MySQL, JWT para autenticación, bcrypt.js para el manejo de contraseñas y CORS para control de acceso. Además, incluye dotenv para la gestión de variables de entorno y body-parser para el procesamiento de solicitudes. Nodemon está configurado para la recarga automática en desarrollo.

## Tareas completadas

✔️ Configurar el entorno de desarrollo

✔️ Cifrado de password

✔️ Autenticación con jsonwebtoken (JWT) y bcryptjs

✔️ Login (inicio de sesión) y registrar usuario

✔️ Configuración de pruebas automáticas (se emplea GitHub Actions, pipeline con: node.js, eslint, sonarcloud, slack )

✔️ Registrar paciente
---

## 1. Configurar el entorno de desarrollo 

### 1.1 Instalar Node.js y npm

Descargar node [aquí](https://nodejs.org/es).

---
### 1.2. Crear un nuevo proyecto

Ejecuta en la terminal:

    mkdir api-hospital

    cd api-rest-node

    npm init -y
---
### 1.3. Instalar dependencias iniciales

Ejecuta en la terminal:

    npm install express mysql2 dotenv jsonwebtoken bcryptjs cors body-parser
    
    npm install sequelize 
---
### 1.4. Instalar dependencia nodemon
Instalar nodemon, recarga automáticamente los cambios:

    npm install --save-dev nodemon

#### Explicación del uso de jsonwebtoken bcryptjs:
 Se utiliza **jsonwebtoken (JWT)**  para crear y verificar tokens de autenticación, permitiendo a los usuarios acceder a las API de manera segura.
 
 Por otro lado, **bcryptjs** se utiliza para encriptar contraseñas, asegurando que incluso si la base de datos se ve comprometida

![Actualizar](https://img.shields.io/badge/Configurar-package.json-blue?style=flat-square)

Agregar en el archivo package.json nodemon para ejecutarlo 

    "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
    }

![Actualizar](https://img.shields.io/badge/Actualizar-package.json-blue?style=flat-square)

Actualización de código en el package.json:

    "start": "node src/index.js",
    "dev": "nodemon src/index.js"

Se agregaron los archivos dentro de la carpeta src y se modificó el package.json.

Ejecutar el servidor con nodemon:

    npm run dev
---
### 1.5 Instalar dependencia eslint
Ejecutar en la terminal:

    npm install eslint --save-dev

Después, configura ESLint con:

    npx eslint --init

Luego actualizar eslint.config.js

Renombra eslint.config.mjs a eslint.config.cjs

Ejecutar en la terminal:

    npm run lint

Realiza prueba manualmente, pero se configuró build.yml para que haga pruebas automaticamente.

---
## 2. Cifrar password en la base de datos
Se crea el archivo **"actualizarContraseñas.js"** el script para actualizar los password (contraseñas) en la base de datos, luego se ejecuta el comando:

    node actualizarContraseñas.js
    
Resultado: todo las contraseñas estan cifradas.

## 3. Login (Iniciar sesión)
Endpoint: POST /api/auth/login

URL: http://localhost:5000/api/auth/login

Body/raw:

    {
        "nombre_usuario": "pacient",
        "password": "pas555"
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

⚠️ **IMPORTANTE:** El token expira en 1 hora. Se debe renovarlo a tiempo.

## 4. Registrar usuario
Permite registrar el usuario y contraseña.

Endpoint: POST /api/auth/register

Token: Authorization/Bearer Token/Token

⚠️ **IMPORTANTE:** Solo usuario con rol de administrador puede registrar usuario.

URL: http://localhost:5000/api/auth/register

Body/raw:

    {
        "nombre_usuario": "pac788",
        "password": "45678",
        "id_rol": 1
    }

Respuesta:

    {
        "message": "Usuario registrado exitosamente",
        "usuario": {
            "id_usuario": 17,
            "nombre_usuario": "pac788",
            "fecha_creacion": "2025-02-20 20:35:07",
            "id_rol": 1
        }
    }

## 5. Registrar paciente
Registra la información del paciente.

Endpoint: POST /api/paciente/registrar

Token: Authorization/Bearer Token/Token

⚠️ **IMPORTANTE:** 
1. Solo el administrador puede registrar paciente.
2. Se ingresa el nombre de usuario que es unico para realizar las verificaciones y finalmente si todo esta bien guarda los datos con el id_usuario.

URL: http://localhost:5000/api/paciente/registrar

    {
        "nombre_usuario": "pac788",
        "identificacion": "1234566555",
        "fecha_nacimiento": "1995-07-25",
        "primer_nombre": "Andrea",
        "segundo_nombre": "Mariana",
        "primer_apellido": "Castro",
        "segundo_apellido": "Gonzales",
        "genero": "FEMENINO",
        "celular": "0987654888",
        "telefono": "022344446",
        "correo": "andreacastro@example.com",
        "estado_civil": "SOLTERO/A",
        "grupo_sanguineo": "O RH+",
        "instruccion": "SUPERIOR",
        "ocupacion": "MILITAR",
        "empresa": "",
        "discapacidad": 0,
        "orientacion": "HETEROSEXUAL",
        "identidad": "CISGÉNERO",
        "tipo_paciente": "MILITAR",
        "estatus": 1
    }

Respuesta:

    {
        "message": "Paciente registrado exitosamente",
        "paciente": {
            "id_paciente": 7,
            "id_usuario": 17,
            "identificacion": "1234566555",
            "fecha_nacimiento": "1995-07-25",
            "primer_nombre": "Andrea",
            "segundo_nombre": "Mariana",
            "primer_apellido": "Castro",
            "segundo_apellido": "Gonzales",
            "genero": "FEMENINO",
            "celular": "0987654888",
            "telefono": "022344446",
            "correo": "andreacastro@example.com",
            "estado_civil": "SOLTERO/A",
            "grupo_sanguineo": "O RH+",
            "instruccion": "SUPERIOR",
            "ocupacion": "MILITAR",
            "empresa": "",
            "discapacidad": 0,
            "orientacion": "HETEROSEXUAL",
            "identidad": "CISGÉNERO",
            "tipo_paciente": "MILITAR",
            "estatus": 1
        }
    }

## 6. Registrar infoMilitar
Registra la información mililar del paciente.

Endpoint: POST /api/info-militar/registrar

Token: Authorization/Bearer Token/Token

⚠️ IMPORTANTE:

Solo el administrador puede registrar la información militar del paciente.
Se ingresa el no. identificación para realizar las verificaciones y finalmente si todo esta bien guarda los datos con el id_paciente.

URL: http://localhost:5000/api/paciente/registrar

Body/raw:

    {
        "identificacion": "1234566555",
        "cargo": "NINGUNO",
        "grado": "CORONEL",
        "fuerza": "TERRESTRE",
        "unidad": "15-BAE"
    }

Respuesta:

    {
        "message": "Información militar registrada exitosamente.",
        "infoMilitar": {
            "id_info_militar": 5,
            "id_paciente": 7,
            "cargo": "NINGUNO",
            "grado": "CORONEL",
            "fuerza": "TERRESTRE",
            "unidad": "15-BAE"
        }
    }

---
## Principales Tecnologías utilizadas
* JAVASCRIPT
* Express.js
* Sequelize
* Node.js y npm

## Tecnologías secundaria
* JWT
* nodemon
* VsCode
* Git
* GitHub

## Herramientas de Gestión y Diseño
* **Jira:** herramienta de colaboración y gestión de proyectos, para la planificación.