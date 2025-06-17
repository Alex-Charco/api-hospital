const { Turno, Horario, Medico, Especialidad, sequelize  } = require("../models");
const { Op } = require("sequelize");
const errorMessages = require("../utils/error_messages");
const { DateTime } = require('luxon');

// Obtener turnos según filtros opcionales
async function obtenerTurnos({ fecha = null, estado = "DISPONIBLE", fechaInicio = null, fechaFin = null } = {}) {
    try {
        const whereHorario = {};

        if (fecha) {
            whereHorario.fecha_horario = { [Op.eq]: new Date(fecha) };
        } else if (fechaInicio && fechaFin) {
            whereHorario.fecha_horario = { [Op.between]: [new Date(fechaInicio), new Date(fechaFin)] };
        } else {
            const today = new Date();
			today.setHours(0, 0, 0, 0);
			whereHorario.fecha_horario = { [Op.gte]: today };
        }

        const whereTurno = estado ? { estado } : {};

        const turnos = await Turno.findAll({
            where: whereTurno,
            include: [
                {
                    model: Horario,
                    as: "horario",
                    where: whereHorario,
                    include: [
                        {
                            model: Medico,
                            as: "medico",
                            attributes: ['id_medico', 'identificacion', 'primer_nombre', 'segundo_nombre', 'primer_apellido', 'segundo_apellido', 'correo'],
                            include: [
                                {
                                    model: Especialidad,
                                    as: "especialidad",
                                    attributes: ['id_especialidad', 'nombre', 'atencion', 'consultorio']
                                }
                            ],
                        },
                    ],
                },
            ],
        });

        if (!turnos || turnos.length === 0) {
            return { message: errorMessages.errorTurnoNoDisponible, turnos: [] };
        }

        return turnos.map(formatTurnoData);
    } catch (error) {
        console.error("❌ Error en obtenerTurnos:", error);
        throw new Error(errorMessages.errorServidor);
    }
}

// Formatear datos del turno para la respuesta
function formatTurnoData(turno) {
    return {
        id_turno: turno.id_turno,
        fecha: turno.horario.fecha_horario,
        hora: turno.hora_turno,
        numero_turno: turno.numero_turno,
        estado: turno.estado,
        medico: {
            id_medico: turno.horario.medico.id_medico,
            identificacion: turno.horario.medico.identificacion,
            medico: turno.horario.medico
                ? `${turno.horario.medico.primer_nombre || ''} ${turno.horario.medico.segundo_nombre || ''} ${turno.horario.medico.primer_apellido || ''} ${turno.horario.medico.segundo_apellido || ''}`.trim()
                : null,
            correo: turno.horario.medico.correo,
            Especialidad: {
                especialidad: turno.horario.medico.especialidad.nombre,
                atencion: turno.horario.medico.especialidad.atencion,
                consultorio: turno.horario.medico.especialidad.consultorio,
            }
        },
    };
}

// Obtener todos los turnos DISPONIBLES sin filtros
async function obtenerTurnosDisponibles() {
  try {
    // 🔍 Hora del servidor Node.js
    const ahoraNode = new Date();
    console.log("🕒 Fecha en Node.js:", ahoraNode.toISOString());

    // 1️⃣ Obtener hora actual de la base de datos
    const [[{ ahora_bd }]] = await sequelize.query("SELECT NOW() AS ahora_bd");
    console.log("🕒 Fecha en MySQL:", ahora_bd);

    // 2️⃣ Obtener todos los turnos disponibles sin filtro horario
    const resultados = await sequelize.query(`
      SELECT 
        t.id_turno,
        t.numero_turno,
        t.hora_turno,
        t.estado,
        h.fecha_horario AS fecha,
        CONCAT(h.fecha_horario, ' ', t.hora_turno) AS fecha_hora_turno,
        m.id_medico,
        m.identificacion,
        CONCAT(m.primer_nombre, ' ', m.segundo_nombre, ' ',
               m.primer_apellido, ' ', m.segundo_apellido) AS medico,
        m.correo,
        e.nombre AS especialidad,
        e.atencion,
        e.consultorio
      FROM turno t
      JOIN horario h ON t.id_horario = h.id_horario
      JOIN medico m ON h.id_medico = m.id_medico
      JOIN especialidad e ON m.id_especialidad = e.id_especialidad
      WHERE t.estado = 'DISPONIBLE'
      ORDER BY h.fecha_horario, t.hora_turno;
    `, { type: sequelize.QueryTypes.SELECT });

    console.log("📦 Resultados crudos (sin filtro horario):", resultados.length);
    resultados.forEach(r => {
      console.log(`• ${r.fecha_hora_turno} (${r.fecha})`);
    });

    // 3️⃣ Filtrar en JavaScript
    const filtroMinDate = new Date(ahora_bd);
    filtroMinDate.setMinutes(filtroMinDate.getMinutes() + 30);
    console.log("⏰ Fecha + 30min:", filtroMinDate.toISOString());

    const turnosFilt = resultados.filter(r => {
      const dt = new Date(r.fecha_hora_turno);
      return dt >= filtroMinDate;
    });

    console.log("✅ Turnos tras filtro JS:", turnosFilt.length);
    turnosFilt.forEach(r => console.log(`* ${r.fecha_hora_turno}`));

    if (!turnosFilt.length) {
      return { message: 'No hay turnos disponibles', turnos: [] };
    }

    // 4️⃣ Mapear resultados en el formato requerido
    const turnosFormateados = turnosFilt.map(r => ({
      id_turno: r.id_turno,
      fecha: r.fecha,
      hora: r.hora_turno,
      numero_turno: r.numero_turno,
      estado: r.estado,
      medico: {
        id_medico: r.id_medico,
        identificacion: r.identificacion,
        medico: r.medico,
        correo: r.correo,
        Especialidad: {
          especialidad: r.especialidad,
          atencion: r.atencion,
          consultorio: r.consultorio
        }
      }
    }));

    return {
      message: 'Turnos disponibles desde hoy en adelante',
      turnos: turnosFormateados
    };

  } catch (error) {
    console.error("❌ Error en obtenerTurnosDisponibles:", error);
    throw new Error("Error en el servidor");
  }
}

module.exports = { obtenerTurnos, obtenerTurnosDisponibles };
