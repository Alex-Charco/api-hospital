<h1 align="center"><strong>API REST HOSPITAL</strong></h1>

## Descripción

API REST desarrollada con Node.js, JavaScript y Express.js, utilizando Sequelize como ORM para MySQL, JWT para autenticación, bcrypt.js para el manejo de contraseñas y CORS para control de acceso. Además, incluye dotenv para la gestión de variables de entorno y body-parser para el procesamiento de solicitudes. Nodemon está configurado para la recarga automática en desarrollo.

## ✅ Acciones Realizadas  

- ✔️ **Configuración del entorno de desarrollo**  
- ✔️ **Cifrado de contraseña**  
- ✔️ **Autenticación con JSON Web Token (JWT) y bcryptjs**  
- ✔️ **Configuración de pruebas automáticas**  
  - 🔹 Se emplea **GitHub Actions** con un pipeline que incluye:  
    - 🟢 **Node.js**  
    - 🔍 **ESLint**  
    - 📊 **SonarCloud**  
    - 📢 **Notificación en Slack**  

## 🚧 En desarrollo  
- 🚀 **Endpoints** _(En proceso...)_


## 🚀 Endpoints  

### 📌 Lista de Endpoints  

| 📂 **Módulo**            | 🛠️ **Acciones Disponibles**                        | ✅ **Estado**  |
|--------------------------|----------------------------------------------------|---------------|
| **🧑 Usuario**          | Login (inicio de sesión) y registrar usuario       | ✔️ Completado |
| **🩺 Paciente**         | Registrar, consultar, actualizar paciente          | ✔️ Completado |
| **🎖️ Información Militar** | Registrar, consultar, actualizar información militar | ✔️ Completado |
| **👨‍👩‍👧 Familiar**       | Registrar, consultar, actualizar familiar          | ✔️ Completado |
| **🏡 Residencia**        | Registrar, consultar, actualizar residencia       | ✔️ Completado |
| **🛡️ Seguro**           | Registrar, consultar, actualizar seguro           | ✔️ Completado |
| **📅 Seguro**           | Consultar         | ⏳ En proceso |
| **⚕️ Médico**           | Registrar, consultar, actualizar médico           | ❌ Pendiente  |

### 📌 API Endpoints

| Método  | Endpoint        | Descripción                 | Estado  |
|---------|----------------|-----------------------------|---------|
|                           **Usuario**                                 |
| GET     | `/api/auth/get/:nombre-usuario` | Consultar usuario       | ✅ |
| POST     | `/api/auth/login`     | Iniciar sesión usuario | ✅ |
| POST    | `/api/auth/register`     | Registrar usuario      | ✅ |
| PUT     | `/put/:nombre_usuario/password` | Actualizar usuario para administrador      | ✅ |
| PUT     | `/put/password/:nombre_usuario` | Actualizar usuario      | ✅ |
| DELETE  | `/api/auth/delete/:nombre_usuario` | Eliminar usuario         | ✅ |
|                           **Paciente**                                |
| GET     | `/api/paciente/get/:identificacion` | Consultar paciente       | ✅ |
| POST    | `/api/paciente/registrar`     | Registrar paciente      | ✅ |
| PUT     | `/api/paciente/put/:identificacion` | Actualizar paciente       | ✅ |
|                           **Info militar**                                                         |
| GET     | `/api/info-militar/get/:identificacion` | Consultar info militar       | ✅ |
| POST    | `/api/info-militar/registrar`     | Registrar info militar      | ✅ |
| PUT     | `/api/info-militar/put/:identificacion` | Actualiza info militar       | ✅ |
|                         **Familiar**                                                       |
| GET     | `/api/familiar/get/:identificacion` | Consultar familiar       | ✅ |
| POST    | `/api/familiar/registrar/:identificacionPaciente`     | Registrar familiar      | ✅ |
| PUT     | `/api/familiar/put/:identificacionPaciente/:identificacionFamiliar` | Actualiza familiar       | ✅ |
**Residencia**                                                       |
| GET     | `/api/residencia/get/:identificacion` | Consultar residencia       | ✅ |
| POST    | `/api/residencia/registrar/:identificacion`     | Registrar residencia      | ✅ |
| PUT     | `/api/residencia/put/:identificacion` | Actualiza residencia       | ✅ |
**Seguro**                                                        |
| GET     | `/api/seguro/get/:identificacion` | Consultar seguro       | ✅ |
| POST    | `/api/seguro/registrar:identificacion`     | Registrar seguro      | ✅ |
| PUT     | `/api/seguro/put/:identificacion` | Actualiza seguro       | ✅ |
**Horario**                                                         |
| GET     | `/api/horario/get/:identificacion` | Consultar horario       | ✅ |
| POST    | `/api/horario/registrar`     | Registrar horario      | ✅ |
**Cita**                                                         |
| GET     | `/api/cita/get/:identificacionPaciente` | Consultar cita       | ✅ |
| GET     | `/api/cita/get/medico/:identificacionMedico` | Consultar cita       | ✅ |
**Médico**                                                        |
| GET     | `/api/medico/get/:identificacion` | Consultar medico       | ❌ |
| POST    | `/api/medico/registrar`     | Registrar medico      | ❌ |
| PUT     | `/api/medico/put/:identificacion` | Actualiza medico       | ❌ |

---

## 1. Configurar el entorno de desarrollo 

### 1.1 Instalar Node.js y npm

Descargar node [aquí](https://nodejs.org/es).

---
### 1.2 Crear un nuevo proyecto

Ejecuta en la terminal:

    mkdir api-hospital

    cd api-rest-node

    npm init -y
---
### 1.3 Instalar dependencias
#### 1.3.1 Instalar dependencias iniciales
Ejecuta en la terminal:

    npm install express mysql2 dotenv jsonwebtoken bcryptjs cors body-parser
    
    npm install sequelize 
---
#### 1.3.2 Instalar dependencia nodemon
Instalar nodemon, recarga automáticamente los cambios:

    npm install --save-dev nodemon



![Actualizar](https://img.shields.io/badge/Configurar-package.json-blue?style=flat-square)

Agregar en el archivo package.json nodemon para ejecutarlo 

    "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js"
    }

#### 1.3.3 Instalar dependencia eslint
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

### 1.4 Levantar el servidor
Se agregaron los archivos dentro de la carpeta src y se modificó el package.json.

![Actualizar](https://img.shields.io/badge/Actualizar-package.json-blue?style=flat-square)

Actualización de código en el package.json:

    "start": "node src/index.js",
    "dev": "nodemon src/index.js"

Levantar el servidor ejecutando en el terminal:

    npm run dev

---
## 2. Cifrar password en la base de datos
Se crea el archivo **"actualizarContraseñas.js"** el script para actualizar los password (contraseñas) en la base de datos, luego se ejecuta el comando:

    node actualizarContraseñas.js
    
Resultado: todo las contraseñas estan cifradas.

## 🚀 3. Endpoints  

### 🔹 GET - Consultar Usuario  

#### 📍 Endpoint  

    GET /api/auth/get/:nombre_usuario

📝 **Descripción:**

Este endpoint permite obtener la información de un usuario específico.


🔐 **Requisitos:**

🔑 **Autenticación:** Se debe iniciar sesión y copiar el token.

🛠 **Autorización:** Solo un usuario administrador logeado puede consultar un usuario.

📥 **Parámetro de URL**

- :nombre_usuario → Se debe reemplazar con el nombre del usuario a consultar.

🌐 Ejemplo de Uso:

📌 URL Base (Local):

    http://localhost:5000/api/auth/get/:nombre_usuario

📥 Ejemplo de URLcon un usuario específico:

    http://localhost:5000/api/auth/get/pacient
    
📤 Headers Requeridos:

    Authorization: Bearer <TOKEN>

✅ Ejemplo de Respuesta Exitosa:

    {
        "message": "Usuario encontrado exitosamente",
        ...(datos del usuario)
    }

### 🔹 POST - Iniciar Sesión (Login)  

#### 📍 Endpoint  

    POST /api/auth/login

🌐 URL Base (Local)

    http://localhost:5000/api/auth/login
    
📝 Descripción
Este endpoint permite a un usuario autenticarse en el sistema proporcionando sus credenciales.

📥 Body (JSON)

    {
        "nombre_usuario": "pacient",
        "password": "pas555"
    }

📤 Headers Requeridos

    {
        "Content-Type": "application/json"
    }

✅ Ejemplo de Respuesta Exitosa

            {"message":"Inicio de sesión exitoso",
            "token":"xxxxxxx",

            "user": {
                ...(datos del usuario)
                "rol": {
                    ... (datos del rol)
                    "permiso": {
                        ...(datos del permiso)
                    },
                    "estatus": 1
                }
            }
        }

⚠️ **IMPORTANTE:** El token expira en 1 hora. Se debe renovarlo a tiempo para evitar pérdida de sesión.

### 🔹 POST - Registrar Usuario  

#### 📍 Endpoint  

    POST /api/auth/register

🌐 URL Base (Local)

    http://localhost:5000/api/auth/register
    
📝 **Descripción**

Este endpoint permite registrar un nuevo usuario en el sistema.

🔐 **Requisitos**

🔑 **Autenticación:** Se debe iniciar sesión y copiar el token.

**🛠 Autorización:** Solo un usuario con rol de administrador puede registrar nuevos usuarios.

🔒 **Seguridad:** La contraseña debe cumplir con las políticas de seguridad establecidas.

📤 Headers Requeridos

    {
        "Authorization": "Bearer <TOKEN>",
        "Content-Type": "application/json"
    }

📥 Body (JSON) - Ejemplo de Solicitud

    {
        "nombre_usuario": "xxx",
        "password": "xxx",
        "id_rol": 1
    }

✅ Ejemplo de Respuesta Exitosa

    {
        "message": "Usuario registrado exitosamente",
        "usuario": {
            ...(datos del usuario)
        }
    }

### 🔹 PUT - Actualizar Contraseña para Usuarios  

#### 📍 Endpoint  

    PUT /api/auth/put/password/:nombre_usuario

🌐 URL Base (Local)

    http://localhost:5000/api/auth/put/password/:nombre_usuario

📝 **Descripción**

Este endpoint permite que cualquier usuario registrado (sin importar su rol) pueda cambiar su contraseña.

🔐 **Requisitos**

🔑 **Autenticación:** Se debe iniciar sesión y copiar el token.

🛠 **Autorización:** Cualquier usuario puede cambiar su contraseña, sin importar su rol.

📥 **Parámetro de URL**

- :nombre_usuario → Se debe reemplazar con el nombre del usuario.

📥 Ejemplo de URL

    http://localhost:5000/api/auth/put/password/paciente8

📤 Headers Requeridos

    {
        "Authorization": "Bearer <TOKEN>",
        "Content-Type": "application/json"
    }

📥 Body (JSON) - Ejemplo de Solicitud

    {
    "password_actual": "TuContraseñaActual",
    "nueva_password": "NuevaContraseña@2024"
    }

✅ Respuesta: Contraseña actualizada exitosamente. 

⚠️ IMPORTANTE:

Después de actualizar la contraseña, se deberá iniciar sesión nuevamente con la nueva contraseña.

### 🔹 DELETE - Eliminar Usuario  

#### 📍 Endpoint  

    DELETE /api/auth/delete/:nombre_usuario

🌐 URL Base (Local)

    http://localhost:5000/api/auth/delete/:nombre_usuario
    
📝 **Descripción**
Este endpoint permite a un administrador eliminar un usuario del sistema bajo ciertas condiciones.

🔐 **Requisitos**

🔑 **Autenticación:** Se debe iniciar sesión y copiar el token.

🛠 **Autorización:** Solo los administradores pueden eliminar usuarios.

⚠️ **Condiciones para eliminar un usuario:**

1. El usuario debe existir en la base de datos.
2. No se puede eliminar a otro administrador.
3. El usuario no debe estar asignado a ninguna entidad que impida su eliminación.
4. Manejo de errores adecuado si no se cumplen las condiciones.

📥 **Parámetro de URL** 

- :nombre_usuario → Se debe reemplazar con el nombre del usuario a consultar.

📥 Ejemplo de URL

    http://localhost:5000/api/auth/delete/pacient

📤 Headers Requeridos

    {
        "Authorization": "Bearer <TOKEN>",
        "Content-Type": "application/json"
     }

📥 Body (JSON) - Ejemplo de Solicitud

No se requiere un cuerpo en la solicitud.

✅ Respuesta: Usuario eliminado exitosamente.

---

### 🔹 GET - Consultar Paciente  

#### 📍 Endpoint  

    GET /api/paciente/get/:identificacion

🌐 URL Base (Local)

    http://localhost:5000/api/paciente/get/:identificacion
    
📝 **Descripción**
Este endpoint permite buscar la información de un paciente mediante su número de identificación.

🔐 **Requisitos**

🔑 **Autenticación:** Se debe iniciar sesión y copiar el token.

🛠 **Autorización:** Solo administradores y médicos pueden consultar los datos de los pacientes.

📥 **Parámetros de URL**
- :identificacion - Reemplázalo con el número de identificación del paciente que deseas consultar.

📥 Ejemplo de URL

    http://localhost:5000/api/paciente/get/1234569222

📤 Headers Requeridos

    {
        "Authorization": "Bearer <TOKEN>",
        "Content-Type": "application/json"
    }


✅ Respuesta: Se obtiene los datos del paciente

### 🔹 POST - Registrar Paciente  

#### 📍 Endpoint  

    POST /api/paciente/registrar

🌐 URL Base (Local)

    http://localhost:5000/api/paciente/registrar
    
📝 **Descripción**

Este endpoint permite registrar la información de un nuevo paciente en el sistema.

🔐 **Requisitos**

🔑 **Autenticación:** Se debe iniciar sesión y copiar el token.

🛠 **Autorización:** Solo un administrador tiene permisos para registrar un paciente.

✔️ El nombre de usuario debe ser único para realizar las verificaciones previas al registro.

📤 Headers Requeridos

    {
        "Authorization": "Bearer <TOKEN>",
        "Content-Type": "application/json"
    }

📥 Body (JSON) - Ejemplo de Solicitud

    {
        "nombre_usuario": "xxxx",
        ...(datos del paciente)
    }

✅ Respuesta:

    {
        "message": "Paciente registrado exitosamente",
        "paciente": {
            ...(datos del paciente)
        }
    }

### 🔹 PUT - Actualizar Paciente  

#### 📍 Endpoint  

    PUT /api/paciente/put/:identificacion

🌐 URL Base (Local)

    http://localhost:5000/api/paciente/put/:identificacion
    
📝 **Descripción**

Este endpoint permite actualizar la información de un paciente existente en el sistema mediante su número de identificación.

🔐 **Requisitos**

🔑 **Autenticación:** Se debe iniciar sesión y copiar el token.

🛠 **Autorización:** Solo el administrador tiene permisos para actualizar la información de un paciente.

📋 El número de identificación se debe proporcionar para identificar al paciente a actualizar.

📤 Headers Requeridos

    {
        "Authorization": "Bearer <TOKEN>",
        "Content-Type": "application/json"
    }

📥 Parámetros de URL
- :identificacion - Reemplazar este parámetro con el número de identificación del paciente a actualizar.

📥 Ejemplo de URL

    http://localhost:5000/api/paciente/put/1234569222

📥 Body (JSON) - Ejemplo de Solicitud

    {
        "fecha_nacimiento": "xxxxxx",
        ...(datos del paciente)
    }
    
✅ Respuesta: Información del paciente actualizada.

---
### 🔹 GET - Consultar Información Militar  

#### 📍 Endpoint  

    GET /api/info-militar/get/:identificacion

🌐 URL Base (Local)

    http://localhost:5000/api/info-militar/get/:identificacion
    
📝 **Descripción**

Este endpoint permite consultar la información militar asociada a un paciente mediante su número de identificación.

🔐 **Requisitos**

🔑 **Autenticación:** Se debe iniciar sesión y copiar el token.

🛠 **Autorización:** Solo los administradores y médicos tienen permisos para consultar la información militar del paciente.

📋 El número de identificación es necesario para identificar al paciente.

📤 Headers Requeridos

    {
        "Authorization": "Bearer <TOKEN>",
        "Content-Type": "application/json"
    }

📥 Parámetros de URL

- :identificacion - Reemplazar este parámetro con el número de identificación del paciente.

📥 Ejemplo de URL

    http://localhost:5000/api/info-militar/get/1234569222
    
✅ Respuesta: Información militar del paciente.

⚠️ IMPORTANTE:

- Asegurarse de reemplazar :identificacion con el número correcto de identificación del paciente.

### 🔹 POST - Registrar Información Militar  

#### 📍 Endpoint  

    POST /api/info-militar/registrar

🌐 URL Base (Local)

    http://localhost:5000/api/info-militar/registrar
    
📝 **Descripción**

Este endpoint permite registrar la información militar de un paciente, asociándola con su número de identificación.

🔐 **Requisitos**

🔑 **Autenticación:** Se debe iniciar sesión y copiar el token.

🛠 **Autorización:** Solo los administradores pueden registrar la información militar de los pacientes.

📋 **Número de identificación:** Es necesario para realizar la verificación y almacenar los datos correctamente.

📤 Headers Requeridos

    {
        "Authorization": "Bearer <TOKEN>",
        "Content-Type": "application/json"
    }

📥 Body de la Solicitud

    {
        "identificacion": "xxxxxxxxxxxxxx",
        "cargo": "xxxxx",
        "grado": "xxxxx",
        "fuerza": "xxxxxx",
        "unidad": "xxxxx"
    }

✅ Respuesta: Información militar registrada exitosamente.

### 🔹 PUT - Actualizar Información Militar  

#### 📍 Endpoint  

    PUT /api/info-militar/put/:identificacion

🌐 URL Base (Local)

    http://localhost:5000/api/info-militar/put/:identificacion
    

📝 **Descripción**

Este endpoint permite actualizar la información militar de un paciente a través de su número de identificación. 

🔐 **Requisitos**

🔑 **Autenticación:** Se debe iniciar sesión y copiar el token.

🛠 **Autorización:** Solo el administrador puede actualizar la información militar de los pacientes.

📋 **Número de identificación:** Se necesita para identificar al paciente y actualizar sus datos militares.

📤 Headers Requeridos

    {
        "Authorization": "Bearer <TOKEN>",
        "Content-Type": "application/json"
    }

📥 Body de la Solicitud

    {
        "cargo": "xxxxx",
        "grado": "xxxxx",
        "fuerza": "xxxxxx",
        "unidad": "xxxxx"
    }

📥 Ejemplo de URL

    http://localhost:5000/api/info-militar/put/1234569222
    

✅ Respuesta: Información militar actualizada exitosamente.

---
### 🔹 GET - Consultar Familiar  

#### 📍 Endpoint  

    GET /api/familiar/get/:identificacion

🌐 URL Base (Local)

    http://localhost:5000/api/familiar/get/:identificacion
    

📝 **Descripción**

Este endpoint permite consultar la información del familiar de un paciente utilizando su número de identificación.

🔐 **Requisitos**

🔑 **Autenticación:** Se debe iniciar sesión y copiar el token.

🛠 **Autorización:** Solo los administradores y médicos tienen permisos para consultar la información del familiar de un paciente.

📋 **Número de identificación:** Se necesita para identificar al paciente y obtener los datos del familiar.

📤 Headers Requeridos

    {
        "Authorization": "Bearer <TOKEN>"
    }

📥 Ejemplo de URL

    http://localhost:5000/api/familiar/get/1234569222
    
✅ Respuesta: Información del familiar del paciente.

### 🔹 POST - Registrar Familiar  

#### 📍 Endpoint  

    POST /api/familiar/registrar/:identificacionPaciente

🌐 URL Base (Local)

    http://localhost:5000/api/familiar/registrar/:identificacionPaciente
    
📝 **Descripción**

Este endpoint permite registrar la información del familiar de un paciente.

🔐 **Requisitos**

🔑 **Autenticación:** Se debe iniciar sesión y copiar el token.

🛠 **Autorización:** Solo el administrador tiene permisos para registrar la información de un familiar.

📋 **Número de identificación del paciente:** El identificador único del paciente se utiliza para asociar la información del familiar.

📤 Headers Requeridos

    {
        "Authorization": "Bearer <TOKEN>"
    }

📥 Ejemplo de URL

    http://localhost:5000/api/familiar/registrar/1234569222
    
📝 Ejemplo de Body (Datos del familiar)

    {
        ...(datos de la familiar)
    }

✅ Respuesta: Información del familiar del paciente.

### 🔹 PUT - Actualizar Familiar  

#### 📍 Endpoint  

    PUT /api/familiar/put/:identificacionPaciente/:identificacionFamiliar

🌐 URL Base (Local)

    http://localhost:5000/api/familiar/put/:identificacionPaciente/:identificacionFamiliar
    
📝 **Descripción**
Este endpoint permite actualizar la información del familiar de un paciente. 

🔐 **Requisitos**

🔑 **Autenticación:** Se debe iniciar sesión y copiar el token.

🛠 **Autorización:** Solo el administrador tiene permisos para actualizar la información de un familiar.

📋 **Identificación del paciente y familiar:** Se debe proporcionar tanto el número de identificación del paciente como el del familiar para realizar la actualización.

📤 Headers Requeridos

    {
        "Authorization": "Bearer <TOKEN>"
    }

📥 Ejemplo de URL

    http://localhost:5000/api/familiar/put/1234569222/0703390000
    
📝 Ejemplo de Body (Datos del familiar)

    {
        ...(datos del familiar)
    }

✅ Respuesta: Información del familiar actualizada exitosamente.

---
### 🔹 GET - Consultar Residencia

#### 📍 Endpoint  

    GET /api/residencia/get/:identificacion

🌐 URL Base (Local)

http://localhost:5000/api/residencia/get/:identificacion

📝 **Descripción**

Este endpoint permite consultar la información de residencia del paciente mediante su número de identificación. 

🔐 **Requisitos**

🔑 **Autenticación:** Se debe iniciar sesión y copiar el token.

🛠 **Autorización:** Solo un administrador o médico tiene permisos para consultar la información de residencia del paciente.

📋 **Identificación del paciente:** Se debe proporcionar el número de identificación del paciente para realizar la consulta.

📤 Headers Requeridos

    {
        "Authorization": "Bearer <TOKEN>"
    }

📥 Ejemplo de URL

    http://localhost:5000/api/residencia/get/1234569222
    
✅ Respuesta: Información de la residencia del paciente.

### 🔹 POST - Registrar Residencia

#### 📍 Endpoint  

    POST /api/residencia/registrar/:identificacion

🌐 URL Base (Local)

    http://localhost:5000/api/residencia/registrar/:identificacion
    
📝 **Descripción**

Este endpoint permite registrar la información de residencia de un paciente. 

🔐 **Requisitos**

🔑 **Autenticación:** Se debe iniciar sesión y copiar el token.

🛠 **Autorización:** Solo un administrador tiene permisos para registrar la residencia del paciente.

📋 **Identificación del paciente:** Se debe proporcionar el número de identificación del paciente para asociar la residencia correctamente.

📤 Headers Requeridos

    {
        "Authorization": "Bearer <TOKEN>"
    }

📥 Ejemplo de URL

    http://localhost:5000/api/residencia/registrar/1234569222
    
📝 Ejemplo de Body (Datos de la residencia)

    {
        ...(datos de la residencia)
    }

✅ Respuesta: Información de la residencia del paciente.

### 🔹 PUT - Actualizar Residencia

#### 📍 Endpoint  

    PUT /api/residencia/put/:identificacion

🌐 URL Base (Local)

    http://localhost:5000/api/residencia/put/:identificacion
    
📝 **Descripción**

Este endpoint permite actualizar la información de residencia de un paciente.

🔐 **Requisitos**

🔑 **Autenticación:** Se debe iniciar sesión y copiar el token.

🛠 **Autorización:** Solo un administrador tiene permisos para actualizar la residencia de un paciente.

📋 **Identificación del paciente:** Se debe proporcionar el número de identificación del paciente cuya residencia se actualizará.

📤 Headers Requeridos

    {
        "Authorization": "Bearer <TOKEN>"
    }

📥 Ejemplo de URL

    http://localhost:5000/api/residencia/put/1234569222
    
📝 Ejemplo de Body (Datos de la residencia)

    {
        "cargo": "xxxxx",
        "grado": "xxxxx",
        "fuerza": "xxxxxx",
        "unidad": "xxxxx"
    }

✅ Respuesta: Información de la residencia actualizada exitosamente.

---
### 🔹 GET - Consultar Seguro

#### 📍 Endpoint  

    GET /api/seguro/get/:identificacion

🌐 URL Base (Local)

    http://localhost:5000/api/seguro/get/:identificacion
    
📝 **Descripción**

Este endpoint permite consultar la información del seguro de un paciente mediante su número de identificación.

🔐 **Requisitos**

🔑 **Autenticación:** Se debe iniciar sesión y copiar el token de autenticación.

🛠 **Autorización:** Solo los administradores y médicos pueden acceder a la información del seguro del paciente.

📋 **Identificación del paciente:** Se debe proporcionar el número de identificación del paciente cuya información del seguro se desea consultar.

📤 Headers Requeridos

    {
        "Authorization": "Bearer <TOKEN>"
    }

📥 Ejemplo de URL

    http://localhost:5000/api/seguro/get/1234569222
    
✅ Respuesta: Información del seguro del paciente.

### 🔹 POST - Registrar Seguro

#### 📍 Endpoint  

    POST /api/seguro/registrar/:identificacion

🌐 URL Base (Local)

    http://localhost:5000/api/seguro/registrar/:identificacion
    
📝 **Descripción**

Este endpoint permite registrar la información del seguro de un paciente mediante su número de identificación.

🔐 **Requisitos**

🔑 **Autenticación:** Se debe iniciar sesión y copiar el token de autenticación.

🛠 **Autorización:** Solo el administrador tiene permisos para registrar el seguro de un paciente.

📋 **Identificación del paciente:** Se debe proporcionar el número de identificación del paciente para registrar su información de seguro.

📤 Headers Requeridos

    {
        "Authorization": "Bearer <TOKEN>"
    }

📥 Ejemplo de URL

    http://localhost:5000/api/seguro/registrar/1234569222
    
💡 Ejemplo de Body (Datos del seguro)

    {
        ...(datos del seguro)
    }

✅ Respuesta: Información del seguro del paciente.

## 🚀 3. Endpoints

### 🔹 PUT - Actualizar Seguro

#### 📍 Endpoint  

    PUT /api/seguro/put/:identificacion

🌐 URL Base (Local)

    http://localhost:5000/api/seguro/put/:identificacion
    
📝 **Descripción**

Este endpoint permite actualizar la información del seguro de un paciente mediante su número de identificación.

🔐 **Requisitos**

🔑 **Autenticación:** Se debe proporcionar un token de autenticación válido.

🛠 **Autorización:** Solo el administrador puede actualizar la información del seguro.

📋 **Identificación del paciente:** Se debe incluir el número de identificación del paciente en la URL.

📤 Headers Requeridos

    {
        "Authorization": "Bearer <TOKEN>"
    }

📥 Ejemplo de URL

    http://localhost:5000/api/seguro/put/1234569222
    
💡 Ejemplo de Body (Datos del seguro a actualizar)

    {
        ...(datos del seguro)
    }

✅ Respuesta: Información del seguro actualizada exitosamente.

---
### 🔹 GET - Consultar Horario

#### 📍 Endpoint  

    GET /api/horario/get/:identificacion

🌐 URL Base (Local)

    http://localhost:5000/api/horario/get/:identificacion
    
📝 **Descripción**

Este endpoint permite consultar el horario de un médico mediante su número de identificación.
Se ofrecen tres métodos de búsqueda para mayor flexibilidad:

**1️⃣** Consultar por número de identificación (Horarios desde la fecha actual en adelante).

**2️⃣** Consultar por rango de fechas (Fecha de inicio y fin).

**3️⃣** Consultar por un horario específico (ID del horario).

🔐 **Requisitos**

🔑 **Autenticación:** Se debe proporcionar un token de autenticación válido.

🛠 **Autorización:** Solo el administrador y médico pueden consultar los horarios.

📋 **Identificación del médico:** Se debe incluir el número de identificación en la URL.

📤 Headers Requeridos

    {
        "Authorization": "Bearer <TOKEN>"
    }

### ✅ Métodos de Consulta
**1️⃣ Consultar por Número de Identificación**

Obtiene los horarios disponibles desde la fecha actual en adelante.

📌 URL Ejemplo:

    http://localhost:5000/api/horario/get/1234569222
    
✅ Respuesta: Muestra los horarios desde la fecha actual a posteriores fechas.

**2️⃣ Consultar por Rango de Fechas**

Filtra los horarios en un período específico. El formato de fecha YYYY-MM-DD.

🌐 URL Base

    http://localhost:5000/api/horario/get/:identificacion?fechaInicio={ingresar-fecha}&fechaFin={ingresar-fecha}

📌 URL Ejemplo:

    http://localhost:5000/api/horario/get/1234569222?fechaInicio=2025-03-01&fechaFin=2025-03-10
    

URL: http://localhost:5000/api/horario/get/1234569222?fechaInicio=2025-03-01&fechaFin=2025-03-10

✅ Respuesta: Muestra los horarios del rango de fechas ingresadas.

**3️⃣ Consultar por ID de Horario**

Busca un horario específico por su ID.

🌐 URL Base

    http://localhost:5000/api/horario/get/:identificacion?idHorario={ingresar-id}

📌 URL Ejemplo:

    http://localhost:5000/api/horario/get/1234569222?idHorario=789
    

✅ Respuesta: Muestra el horario específico que se esta buscando.

### 🔹 POST - Registrar Horario

#### 📍 Endpoint  

    POST /api/horario/registrar/:identificacion

🌐 URL Base (Local)

    http://localhost:5000/api/horario/registrar/:identificacion
    
📝 **Descripción**

Este endpoint permite registrar un nuevo horario para un médico en el sistema.

🔐 **Requisitos**

🔑 **Autenticación:** Se debe proporcionar un token de autenticación válido.

🛠 **Autorización:** Solo el administrador puede registrar horarios.

📋 **Identificación del médico:** Se debe incluir el número de identificación en la URL.

📤 Headers Requeridos

    {
        "Authorization": "Bearer <TOKEN>",
        "Content-Type": "application/json"
    }

📌 URL Ejemplo:

    http://localhost:5000/api/horario/registrar/1723450000


💡 Ejemplo de Body (Datos del horario)

    {
        ...(datos del horario)
    }

✅ Respuesta: Información del horario registrada.

---

### 🔹 GET - Consultar Cita

#### 📍 Endpoint 1 para paciente

    GET /api/cita/get/:identificacionPaciente

🌐 URL Base (Local)

    http://localhost:5000/api/cita/get/:identificacionPaciente
    

#### 📍 Endpoint 2 para paciente

    GET /api/cita/get/medico/:identificacionPaciente

🌐 URL Base (Local)

    http://localhost:5000/api/cita/get/medico/:identificacionMedico

📝 **Descripción**

El endpoint 1 permite consultar las citas médicas de un paciente mediante su número de identificación. El endpoint 2 permite consultar las citas médicas de un paciente, pero que tiene el médico mediante su número de identificación del médico.

Se ofrecen tres métodos de búsqueda para mayor flexibilidad:

**1️⃣** Consultar por número de identificación del paciente o del médico ().

**2️⃣** Consultar por rango de fechas (Fecha de inicio y fin).

**3️⃣** Consultar por el estado ().

🔐 **Requisitos**

🔑 **Autenticación:** Se debe proporcionar un token de autenticación válido.

🛠 **Autorización:** El administrador, puede consultar cualquier cita, en cambio, médico y paciente pueden consultar sus citas.

📋 **Identificación del paciente o médico:** Se debe incluir el número de identificación en la URL.

📤 Headers Requeridos

    {
        "Authorization": "Bearer <TOKEN>"
    }

### ✅ Métodos de Consulta
**1️⃣ Consultar por Número de Identificación**

Obtiene las citas ingresando la identificación del paciente o médico

📌 URL Ejemplo paciente:

    http://localhost:5000/api/cita/get/1234569222

📌 URL Ejemplo medico:

    http://localhost:5000/api/cita/get/medico/1234569222
    
✅ Respuesta: Muestra todas las citas.

**2️⃣ Consultar por Rango de Fechas**

Filtra las citas en un período específico. El formato de fecha YYYY-MM-DD.

🌐 URL Base

    http://localhost:5000/api/cita/get/:identificacionPaciente?fechaInicio={ingresar-fecha-inicio}&fechaFin={ingresar-fecha-fin}

📌 URL Ejemplo:

    http://localhost:5000/api/cita/get/1234569222?fechaInicio=2025-03-01&fechaFin=2025-03-10
    

✅ Respuesta: Muestra las citas del rango de fechas ingresadas.

**3️⃣ Consultar por el estado**

Busca la cita buscando por la identificacion y el estado.

🌐 URL Base

    http://localhost:5000/api/cita/get/:identificacion?estadoCia={ingresar-estado}

📌 URL Ejemplo:

    http://localhost:5000/api/cita/get/1234569222?estadoCita=CONFIRMADA
    

✅ Respuesta: Muestra la cita que se esta buscando por el estado.

---
## Principales Tecnologías utilizadas
* JAVASCRIPT
* Express.js
* Sequelize
* Node.js y npm

## Tecnologías secundaria
* JWT
* bcryptjs
* nodemon
* VsCode
* Git
* GitHub

#### Explicación del uso de jsonwebtoken JWT:
 Se utiliza **jsonwebtoken (JWT)**  para crear y verificar tokens de autenticación, permitiendo a los usuarios acceder a las API de manera segura.
 
 #### Explicación del uso de bcryptjs:
Se utiliza para encriptar contraseñas, asegurando que incluso si la base de datos se ve comprometida

## Herramientas de Gestión y Diseño
* **Jira:** herramienta de colaboración y gestión de proyectos, para la planificación.
