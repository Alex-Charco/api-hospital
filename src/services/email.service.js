require("dotenv").config();
const nodemailer = require('nodemailer');

// Crear el transporte para enviar el correo
function crearTransporter() {
    return nodemailer.createTransport({
        //service: "gmail",
        host: "smtp.gmail.com",
        port: 465, // Puerto seguro para SSL
        secure: true, // Usa SSL para encriptar la conexión
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
}

// Crear el contenido del correo
// Crear el contenido del correo para paciente y médico
function crearMensaje(cita) {
    // Mensaje común que se usará para ambos
    const mensajePaciente = `
        <h2>Detalles de su cita</h2>
        <p><strong>Fecha de creación:</strong> ${cita.fecha_creacion}</p>
        <h3>Paciente</h3>
        <p>${cita.paciente.primer_nombre} ${cita.paciente.segundo_nombre || ""} ${cita.paciente.primer_apellido} ${cita.paciente.segundo_apellido || ""}</p>
        <h3>Médico</h3>
        <p>${cita.turno.horario.medico.primer_nombre} ${cita.turno.horario.medico.segundo_nombre || ""} ${cita.turno.horario.medico.primer_apellido} ${cita.turno.horario.medico.segundo_apellido || ""}</p>
        <h3>Detalles de la cita</h3>
        <p><strong>Fecha de la cita:</strong> ${cita.turno.horario.fecha_horario}</p>
        <p><strong>Turno:</strong> ${cita.turno.numero_turno} - ${cita.turno.hora_turno}</p>
        <p><strong>Especialidad:</strong> ${cita.turno.horario.medico.especialidad.nombre}</p>
        <p><strong>Atención:</strong> ${cita.turno.horario.medico.especialidad.atencion}</p>
        <p><strong>Consultorio:</strong> ${cita.turno.horario.medico.especialidad.consultorio}</p>
        <p><strong>Mensaje para el paciente:</strong> Recuerde asistir a la cita médica el día y hora mencionados. Si tiene alguna duda, no dude en contactarnos.</p>
    `;

    const mensajeMedico = `
        <h2>Detalles de la cita con su paciente</h2>
        <p><strong>Fecha de creación:</strong> ${cita.fecha_creacion}</p>
        <h3>Paciente</h3>
        <p>${cita.paciente.primer_nombre} ${cita.paciente.segundo_nombre || ""} ${cita.paciente.primer_apellido} ${cita.paciente.segundo_apellido || ""}</p>
        <h3>Médico</h3>
        <p>${cita.turno.horario.medico.primer_nombre} ${cita.turno.horario.medico.segundo_nombre || ""} ${cita.turno.horario.medico.primer_apellido} ${cita.turno.horario.medico.segundo_apellido || ""}</p>
        <h3>Detalles de la cita</h3>
        <p><strong>Fecha de la cita:</strong> ${cita.turno.horario.fecha_horario}</p>
        <p><strong>Turno:</strong> ${cita.turno.numero_turno} - ${cita.turno.hora_turno}</p>
        <p><strong>Especialidad:</strong> ${cita.turno.horario.medico.especialidad.nombre}</p>
        <p><strong>Atención:</strong> ${cita.turno.horario.medico.especialidad.atencion}</p>
        <p><strong>Consultorio:</strong> ${cita.turno.horario.medico.especialidad.consultorio}</p>
        <p><strong>Mensaje para el médico:</strong> Usted tiene una cita programada con el paciente mencionado anteriormente. Por favor, asegúrese de que el paciente reciba la atención necesaria.</p>
    `;

    // Devolver el mensaje adecuado dependiendo del destinatario
    return {
        paciente: mensajePaciente,
        medico: mensajeMedico
    };
}


// Función principal para enviar el correo
async function enviarCorreoConfirmacion(cita) {
    // Verificación de los datos necesarios
    if (!cita || !cita.paciente || !cita.turno || !cita.turno.horario || !cita.turno.horario.medico) {
        throw new Error("Faltan datos para enviar el correo.");
    }

    try {
        // Crear el transporte
        let transporter = crearTransporter();
        
        // Crear los mensajes para paciente y médico
        let mensajes = crearMensaje(cita);

        // Enviar correo al paciente
        let mailOptionsPaciente = {
            from: process.env.EMAIL_USER,
            to: cita.paciente.correo,
            subject: "Confirmación de Cita Médica",
            html: mensajes.paciente
        };
        await transporter.sendMail(mailOptionsPaciente);
        console.log("Correo enviado al paciente");

        // Enviar correo al médico
        let mailOptionsMedico = {
            from: process.env.EMAIL_USER,
            to: cita.turno.horario.medico.correo,
            subject: "Confirmación de Cita Médica",
            html: mensajes.medico
        };
        await transporter.sendMail(mailOptionsMedico);
        console.log("Correo enviado al médico");

    } catch (error) {
        console.error("Error enviando correo:", error);
        throw new Error("No se pudo enviar el correo de confirmación.");
    }
}



module.exports = { enviarCorreoConfirmacion };
