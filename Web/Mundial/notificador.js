// Sistema de notificaciones para partidos del mundial
class NotificadorPartidos {
  constructor() {
    this.partidos = [];
    this.canales = {}; // Almacenar los canales (DAZN1, DAZN2, etc.)
    this.notificacionesActivas = new Map(); // id del partido -> datos de notificación
    this.intervaloVerificacion = 30000; // Verificar cada 30 segundos
    this.tiempoNotificacion = 150 * 60 * 1000; // 2.5 horas en milisegundos
    this.tiempoAntesPartido = 30 * 60 * 1000; // 30 minutos antes del partido
  }

  // Cargar los partidos desde el JSON
  async cargarPartidos() {
    try {
      console.log('📂 Intentando cargar partidos.json...');
      const response = await fetch('./Mundial/partidos.json');
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const datos = await response.json();
      this.canales = datos.canales;
      this.partidos = datos.partidos;
      
      console.log(`✓ Se cargaron ${this.partidos.length} partidos`);
      console.log(`✓ Canales disponibles:`, Object.keys(this.canales));
      console.table(this.partidos);
      return this.partidos;
    } catch (error) {
      console.error('❌ Error al cargar partidos.json:', error);
    }
  }

  // Iniciar el sistema de verificación (solo una vez)
  iniciar() {
    console.log('🚀 Sistema de notificaciones iniciado');
    this.verificarPartidos(); // Verificación única al cargar la página
  }

  // Detener el sistema
  detener() {
    console.log('⛔ Sistema de notificaciones detenido');
  }

  // Verificar si hay partidos próximos (una sola vez)
  verificarPartidos() {
    const ahora = new Date();

    this.partidos.forEach(partido => {
      const fechaPartido = this.crearFechaPartido(partido.fecha, partido.hora);
      const tiempoHastaPartido = fechaPartido - ahora;

      // Mostrar notificación una sola vez: 30 min antes Y hasta 2.5 horas después
      if (tiempoHastaPartido <= this.tiempoAntesPartido && tiempoHastaPartido >= -this.tiempoNotificacion) {
        // Mostrar notificación solo si no está activa
        if (!this.notificacionesActivas.has(partido.id)) {
          this.mostrarNotificacion(partido);
        }
      }
    });
  }

  // Crear objeto Date a partir de fecha y hora (en zona horaria local)
  crearFechaPartido(fecha, hora) {
    // Parsear la hora (formato: "HH:MM")
    const [horas, minutos] = hora.split(':').map(Number);
    
    // Crear una fecha a partir de la cadena de fecha
    const fechaObj = new Date(`${fecha}T00:00:00`);
    
    // Establecer las horas y minutos en hora local
    fechaObj.setHours(horas, minutos, 0, 0);
    
    return fechaObj;
  }

  // Mostrar la notificación emergente
  mostrarNotificacion(partido) {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion-partido';
    notificacion.id = `notif-${partido.id}`;
    
    const fechaPartido = this.crearFechaPartido(partido.fecha, partido.hora);
    const ahora = new Date();
    const tiempoHastaPartido = fechaPartido - ahora;
    
    // Determinar si es "PRÓXIMO PARTIDO" o "EN VIVO"
    const titulo = tiempoHastaPartido > 0 ? '⚽ ¡PRÓXIMO PARTIDO!' : '🔴 ¡EN VIVO!';
    const claseEstado = tiempoHastaPartido > 0 ? 'estado-proximo' : 'estado-vivo';
    
    // Obtener los streams del canal especificado
    const streamsDelCanal = this.canales[partido.streams] || [];
    const streamPrincipal = streamsDelCanal[0] || '';
    const streamsSecundarios = streamsDelCanal.slice(1) || [];

    notificacion.innerHTML = `
      <div class="notificacion-contenido">
        <button class="btn-cerrar-notif" onclick="notificadorPartidos.cerrarNotificacion(${partido.id})">✕</button>
        <div class="notificacion-titulo ${claseEstado}">
          ${titulo}
        </div>
        <img src="${partido.imagen}" alt="${partido.equipo1} vs ${partido.equipo2}" class="notificacion-imagen">
        <div class="notificacion-equipos">
          <span class="equipo1">${partido.equipo1}</span>
          <div class="vs">VS</div>
          <span class="equipo2">${partido.equipo2}</span>
        </div>
        <div class="notificacion-hora">
          ${partido.hora}
        </div>
        <div class="notificacion-botones">
          <button class="btn-principal" onclick="window.open('${streamPrincipal}', '_blank')">
            Opción 1 (Principal)
          </button>
          <div class="botones-secundarios">
            ${streamsSecundarios.map((stream, index) => `
              <button class="btn-secundario" onclick="window.open('${stream}', '_blank')">
                Opción ${index + 2}
              </button>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(notificacion);
    
    // Registrar la notificación activa
    this.notificacionesActivas.set(partido.id, {
      horaInicio: new Date(),
      elemento: notificacion
    });

    console.log(`📢 Notificación mostrada: ${partido.equipo1} vs ${partido.equipo2}`);
    
    // Reproducir sonido si lo deseas (opcional)
    this.reproducirSonido();
  }

  // Cerrar la notificación
  cerrarNotificacion(partidoId) {
    const datosNotificacion = this.notificacionesActivas.get(partidoId);
    if (datosNotificacion && datosNotificacion.elemento) {
      datosNotificacion.elemento.classList.add('cerrando');
      setTimeout(() => {
        datosNotificacion.elemento.remove();
        this.notificacionesActivas.delete(partidoId);
        console.log(`❌ Notificación cerrada: Partido ${partidoId}`);
      }, 300);
    }
  }

  // Formatear fecha a formato legible
  formatearFecha(fecha) {
    const opciones = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Europe/Madrid' // Ajusta según tu zona horaria
    };
    return fecha.toLocaleDateString('es-ES', opciones);
  }

  // Reproducir sonido de notificación (opcional)
  reproducirSonido() {
    // Si tienes un archivo de sonido, descomenta la siguiente línea
    // const audio = new Audio('./notificacion.mp3');
    // audio.play().catch(e => console.log('No se pudo reproducir sonido:', e));
  }
}

// Crear instancia global
const notificadorPartidos = new NotificadorPartidos();

// Iniciar cuando el documento esté listo
document.addEventListener('DOMContentLoaded', async () => {
  await notificadorPartidos.cargarPartidos();
  notificadorPartidos.iniciar();
});

// Limpiar al cerrar la página
window.addEventListener('beforeunload', () => {
  notificadorPartidos.detener();
});
