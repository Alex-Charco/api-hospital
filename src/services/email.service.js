require("dotenv").config();
const { Resend } = require('resend');

// Inicializar Resend con la API Key
const resend = new Resend(process.env.RESEND_API_KEY);

// Crear los contenidos del correo
function crearMensaje(cita) {
    const mensajePaciente = `
        <h2>Detalles de su cita</h2>
        <p><strong>Fecha de creación:</strong> ${cita.fecha_creacion}</p>
        <h3>Paciente</h3>
        <p>${cita.paciente.primer_nombre} ${cita.paciente.segundo_nombre || ""} ${cita.paciente.primer_apellido} ${cita.paciente.segundo_apellido || ""}</p>
        <h3>Médico</h3>
        <p>${cita.turno.horario.medico.primer_nombre} ${cita.turno.horario.medico.segundo_nombre || ""} ${cita.turno.horario.medico.primer_apellido} ${cita.turno.horario.medico.segundo_apellido || ""}</p>
        <h3>Detalles de la cita</h3>
        <p><strong>Fecha de la cita:</strong> ${cita.turno.horario.fecha_horario}</p>
        <p><strong>No. Turno:</strong> ${cita.turno.numero_turno}</p>
		<p><strong>Hora Turno:</strong> ${cita.turno.hora_turno}</p>
        <p><strong>Especialidad:</strong> ${cita.turno.horario.medico.especialidad.nombre}</p>
        <p><strong>Atención:</strong> ${cita.turno.horario.medico.especialidad.atencion}</p>
        <p><strong>Consultorio:</strong> ${cita.turno.horario.medico.especialidad.consultorio}</p>
        <p><strong>Mensaje:</strong> Recuerde asistir a la cita médica 20 minutos antes del día y hora mencionados.</p>
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
        <p><strong>No. Turno:</strong> ${cita.turno.numero_turno}</p>
		<p><strong>Hora Turno:</strong> ${cita.turno.hora_turno}</p>
        <p><strong>Especialidad:</strong> ${cita.turno.horario.medico.especialidad.nombre}</p>
        <p><strong>Atención:</strong> ${cita.turno.horario.medico.especialidad.atencion}</p>
        <p><strong>Consultorio:</strong> ${cita.turno.horario.medico.especialidad.consultorio}</p>
        <p><strong>Mensaje:</strong> Usted tiene una cita programada con este paciente.</p>
    `;

    return {
        paciente: mensajePaciente,
        medico: mensajeMedico
    };
}

// Enviar correo a paciente y médico usando Resend
async function enviarCorreoConfirmacion(cita) {
    if (!cita?.paciente || !cita?.turno?.horario?.medico) {
        throw new Error("Faltan datos para enviar el correo.");
    }

    try {
        const mensajes = crearMensaje(cita);

        // Enviar al paciente
        const correoPaciente = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: cita.paciente.correo,
            subject: 'Confirmación de Cita Médica',
            html: mensajes.paciente,
        });
        console.log("📩 Correo enviado al paciente:", correoPaciente);

        // Enviar al médico
        const correoMedico = await resend.emails.send({
            from: 'onboarding@resend.dev',
            to: cita.turno.horario.medico.correo,
            subject: 'Confirmación de Cita Médica',
            html: mensajes.medico,
        });
        console.log("📩 Correo enviado al médico:", correoMedico);

    } catch (error) {
        console.error("❌ Error al enviar correos con Resend:", error);
        throw new Error("No se pudo enviar el correo de confirmación.");
    }
}

module.exports = { enviarCorreoConfirmacion };
