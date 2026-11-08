// --- Copiar al portapapeles ---
function copiarAlPortapapeles(texto, btn) {
      navigator.clipboard.writeText(texto).then(() => {
        const msg = window.languageManager 
          ? window.languageManager.getTranslation('notifCopiadoPortapapeles')
          : '¡Enlace copiado al portapapeles!';
        mostrarNotificacion(msg);
      });
    }
function mostrarNotificacion(msg) {
  const notif = document.getElementById('notification');
  notif.innerHTML = `<i class="fa-solid fa-check-circle"></i> ${msg}`;
  notif.classList.add('show');
  setTimeout(() => {
    notif.classList.remove('show');
  }, 1800);
}

// --- Sistema de Favoritos ---
function obtenerFavoritosGuardados() {
  const favoritos = localStorage.getItem('favoritos');
  return favoritos ? JSON.parse(favoritos) : [];
}

function guardarFavoritos(favoritos) {
  localStorage.setItem('favoritos', JSON.stringify(favoritos));
}

function toggleFavorito(btn, card) {
  const titulo = card.getAttribute('data-titulo');
  let favoritos = obtenerFavoritosGuardados();
  
  const index = favoritos.indexOf(titulo);
  if (index > -1) {
    // Remover de favoritos
    favoritos.splice(index, 1);
    btn.innerHTML = '<i class="fa-regular fa-star"></i>';
    const msg = window.languageManager 
      ? window.languageManager.getTranslation('notifRemovidoFavoritos')
      : 'Removido de favoritos';
    mostrarNotificacion(msg);
  } else {
    // Agregar a favoritos
    favoritos.push(titulo);
    btn.innerHTML = '<i class="fa-solid fa-star"></i>';
    const msg = window.languageManager 
      ? window.languageManager.getTranslation('notifAgregadoFavoritos')
      : 'Agregado a favoritos';
    mostrarNotificacion(msg);
  }
  
  guardarFavoritos(favoritos);
  
  // Actualizar todos los botones de estrella del mismo canal
  document.querySelectorAll(`.canal-card[data-titulo="${titulo}"]`).forEach(c => {
    const btn_temp = c.querySelector('.canal-actions .canal-btn:has(i[class*="fa-star"])');
    if (btn_temp) {
      btn_temp.innerHTML = btn.innerHTML;
    }
  });
  
  // Actualizar la sección de favoritos con los filtros actuales
  actualizarFavoritos();
  
  // Aplicar filtros para ocultar el original y actualizar visibilidad de secciones
  aplicarFiltros();
}

function actualizarFavoritos() {
  const favoritos = obtenerFavoritosGuardados();
  const favoritosContainer = document.getElementById('canal-list-favoritos');
  
  if (!favoritosContainer) {
    console.error('No se encontró el contenedor de favoritos');
    return;
  }
  
  // Limpiar favoritos
  favoritosContainer.innerHTML = '';
  
  // Obtener TODOS los canales que NO están en el contenedor de favoritos
  const todosLosCanales = document.querySelectorAll('.canal-card:not(#canal-list-favoritos .canal-card)');
  
  // Obtener criterios de filtro actual
  const texto = normalizarTexto(buscador.value || '');
  const checkboxesSeleccionados = document.querySelectorAll('.language-checkbox-group input[type="checkbox"]:checked');
  const idiomasSeleccionados = Array.from(checkboxesSeleccionados).map(cb => cb.value);
  
  todosLosCanales.forEach(card => {
    const titulo = card.getAttribute('data-titulo');
    
    if (favoritos.includes(titulo)) {
      // Verificar si el card pasa los filtros de búsqueda e idioma
      const cardTitulo = normalizarTexto(card.querySelector('.canal-nombre').textContent || '');
      const cardLangs = (card.getAttribute('data-lang') || '').split(',').map(s => s.trim());
      
      const pasaTexto = texto === '' ? true : cardTitulo.includes(texto);
      const pasaIdioma = idiomasSeleccionados.length === 0 ? true : cardLangs.some(lang => idiomasSeleccionados.includes(lang));
      
      // Solo clonar si pasa los filtros
      if (pasaTexto && pasaIdioma) {
        // Clonar el nodo directamente en lugar de usar outerHTML
        const clone = card.cloneNode(true);
        
        // Remover atributos style de TODOS los elementos para resetear estilos inline
        clone.removeAttribute('style');
        clone.querySelectorAll('[style]').forEach(el => {
          el.removeAttribute('style');
        });
        
        // Actualizar el botón de estrella en el clon
        const starBtnClone = clone.querySelector('.canal-actions .canal-btn:has(i[class*="fa-star"])');
        if (starBtnClone) {
          starBtnClone.innerHTML = '<i class="fa-solid fa-star"></i>';
          // Hacer que el botón de estrella del clon también funcione
          starBtnClone.onclick = function() {
            toggleFavorito(this, card);
            return false;
          };
        }
        
        favoritosContainer.appendChild(clone);
      }
    }
  });
}

function agregarEventListenersBotones(container) {
  // Esta función puede no ser necesaria, pero la mantengo por si se usa después
}

// Buscador de canales ---
function normalizarTexto(txt) {
  return txt
    .toLowerCase()
    .replace(/\s+/g, '') // quita espacios
    .normalize("NFD").replace(/[\u0300-\u036f]/g, ""); // quita acentos
}

const buscador = document.getElementById('buscador');
const formBtn = document.querySelector('.form-btn');
const languageCheckboxesContainer = document.getElementById('language-checkboxes');
const categoryCheckboxesContainer = document.getElementById('category-checkboxes');

function obtenerCategoriasUnicas() {
  const categorias = [];
  document.querySelectorAll('.category-title').forEach(title => {
    // Usar data-original si existe (valor del HTML sin traducir), sino usar textContent
    const texto = (title.getAttribute('data-original') || title.textContent).trim();
    if (texto && !categorias.includes(texto)) {
      categorias.push(texto);
    }
  });
  return categorias;
}

function aplicarFiltros() {
  const texto = normalizarTexto(buscador.value || '');
  const favoritos = obtenerFavoritosGuardados();
  
  // Obtener idiomas seleccionados
  const checkboxesSeleccionados = document.querySelectorAll('.language-checkbox-group input[type="checkbox"]:checked');
  const idiomasSeleccionados = Array.from(checkboxesSeleccionados).map(cb => cb.value);

  // Obtener categoría seleccionada
  const categoriaSeleccionada = document.querySelector('.category-checkbox-group input[type="radio"]:checked');
  const categoriaSeleccionadaValor = categoriaSeleccionada ? categoriaSeleccionada.value : null;

  document.querySelectorAll('.canal-card:not(#canal-list-favoritos .canal-card)').forEach(card => {
    const titulo = normalizarTexto(card.querySelector('.canal-nombre').textContent || '');
    const cardLangs = (card.getAttribute('data-lang') || '').split(',').map(s => s.trim());
    const cardTitulo = card.getAttribute('data-titulo');
    const esFavorito = favoritos.includes(cardTitulo);
    const estaEnFavoritos = card.closest('#canal-list-favoritos');

    const pasaTexto = texto === '' ? true : titulo.includes(texto);
    
    // Si no hay idiomas seleccionados, mostrar todo; si hay, verificar si alguno coincide
    const pasaIdioma = idiomasSeleccionados.length === 0 ? true : cardLangs.some(lang => idiomasSeleccionados.includes(lang));

    // Si está en favoritos, siempre mantenerlo oculto en las otras categorías
    if (esFavorito && !estaEnFavoritos) {
      card.style.display = 'none';
    } else if (!esFavorito && !estaEnFavoritos) {
      // Si no está en favoritos y no está en la sección de favoritos, aplicar filtros normalmente
      card.style.display = (pasaTexto && pasaIdioma) ? '' : 'none';
    }
  });

  // Filtrar por categoría
  document.querySelectorAll('.category-section').forEach(section => {
    const titleElement = section.querySelector('.category-title');
    // Usar data-original para comparación (para que funcione con idiomas traducidos)
    const titulo = titleElement.getAttribute('data-original') || titleElement.textContent.trim();
    
    if (categoriaSeleccionadaValor === null || titulo === categoriaSeleccionadaValor) {
      // Mostrar u ocultar según el filtro de texto e idioma
      const tarjetasVisibles = Array.from(section.querySelectorAll('.canal-card')).filter(card => card.style.display !== 'none');
      section.style.display = tarjetasVisibles.length > 0 ? '' : 'none';
    } else {
      section.style.display = 'none';
    }
  });

  // Manejo seguro del formBtn (si existe)
  if (formBtn) {
    if (texto.length > 0) formBtn.style.display = 'none'; else formBtn.style.display = '';
  }
  
  // Mostrar mensaje si no hay resultados visibles (comprobando visibilidad real)
  function isElementVisible(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }
  const totalVisibles = Array.from(document.querySelectorAll('.canal-card')).filter(c => isElementVisible(c)).length;
  const noResultsEl = document.getElementById('no-results');
  if (noResultsEl) {
    if (totalVisibles === 0) {
      noResultsEl.style.display = 'block';
    } else {
      noResultsEl.style.display = 'none';
    }
  }
}

buscador && buscador.addEventListener('input', aplicarFiltros);

// --- POBLAR CHECKBOXES DE IDIOMAS Y PERSISTENCIA ---
function obtenerIdiomasUnicos() {
  const counts = {};
  document.querySelectorAll('.canal-card').forEach(card => {
    const langs = (card.getAttribute('data-lang') || '').split(',').map(s => s.trim()).filter(Boolean);
    langs.forEach(l => {
      if (!l) return;
      counts[l] = (counts[l] || 0) + 1;
    });
  });
  // Ordenar por frecuencia descendente, luego por código ascendente para consistencia
  return Object.keys(counts).sort((a, b) => {
    const diff = (counts[b] || 0) - (counts[a] || 0);
    return diff !== 0 ? diff : a.localeCompare(b);
  });
}

function llenarFiltroIdiomas() {
  if (!languageCheckboxesContainer) return;
  const idiomas = obtenerIdiomasUnicos();
  
  // Mapeo de códigos de idioma a rutas de archivos SVG
  const languageFlags = {
    'es': 'Flags/Spain.svg',
    'en': 'Flags/USA.svg',
    'uk': 'Flags/UK.svg',
    'fr': 'Flags/France.svg',
    'de': 'Flags/Germany.svg',
    'ru': 'Flags/Russia.svg',
    'pl': 'Flags/Poland.svg',
    'zh': 'Flags/China.svg',
    'pt': 'Flags/Portugal.svg',
    'tr': 'Flags/Turkey.svg',
    'ua': 'Flags/Ukraine.svg',
    'nl': 'Flags/Netherlands.svg',
    'it': 'Flags/Italy.svg',
    'ja': 'Flags/Japan.svg',
    'br': 'Flags/Brazil.svg',
    'in': 'Flags/India.svg',
    'ar': 'Flags/SaudiArabia.svg',
    'sr': 'Flags/Serbia.svg',
    'he': 'Flags/Israel.svg',
    
  };
  
  // Crear checkboxes
  idiomas.forEach(code => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'language-checkbox-group';
    groupDiv.title = code.toUpperCase();
    
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = `lang-${code}`;
    input.value = code;
    input.className = 'lang-checkbox';
    
    const label = document.createElement('label');
    label.htmlFor = `lang-${code}`;
    
    const img = document.createElement('img');
    const flagPath = languageFlags[code] || 'Flags/Default.svg';
    img.src = flagPath;
    img.alt = code.toUpperCase();
    img.className = 'flag-icon';
    label.appendChild(img);
    
    groupDiv.appendChild(input);
    groupDiv.appendChild(label);
    languageCheckboxesContainer.appendChild(groupDiv);
  });

  // Restaurar selección guardada
  const saved = localStorage.getItem('langFiltersSelected');
  if (saved) {
    const savedLangs = JSON.parse(saved);
    savedLangs.forEach(lang => {
      const checkbox = document.getElementById(`lang-${lang}`);
      if (checkbox) checkbox.checked = true;
    });
  }

  // Guardar cuando cambian los checkboxes
  document.querySelectorAll('.lang-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      const selected = Array.from(document.querySelectorAll('.lang-checkbox:checked')).map(cb => cb.value);
      localStorage.setItem('langFiltersSelected', JSON.stringify(selected));
      aplicarFiltros();
    });
  });
}

function llenarFiltroCategoriasUnicas() {
  if (!categoryCheckboxesContainer) return;
  const categorias = obtenerCategoriasUnicas();
  
  // Crear radios para cada categoría
  categorias.forEach(categoria => {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'category-checkbox-group';
    
    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'category-filter';
    input.id = `cat-${categoria}`;
    input.value = categoria;
    input.setAttribute('data-original', categoria);
    input.className = 'category-radio';
    
    const label = document.createElement('label');
    label.htmlFor = `cat-${categoria}`;
    label.textContent = categoria;
    
    groupDiv.appendChild(input);
    groupDiv.appendChild(label);
    categoryCheckboxesContainer.appendChild(groupDiv);
  });

  // Restaurar selección guardada
  const saved = localStorage.getItem('categoryFilterSelected');
  if (saved) {
    const radioButton = document.getElementById(`cat-${saved}`);
    if (radioButton) radioButton.checked = true;
  }

  // Variable para rastrear cuál radio está seleccionado actualmente
  let previouslyChecked = document.querySelector('.category-radio:checked');

  // Guardar cuando cambia el radio button
  document.querySelectorAll('.category-radio').forEach(radio => {
    // Detectar cuando hace click en un radio ya seleccionado
    radio.addEventListener('mousedown', function(e) {
      if (this.checked) {
        previouslyChecked = this;
      }
    });

    radio.addEventListener('change', function() {
      if (this.checked) {
        localStorage.setItem('categoryFilterSelected', this.value);
      }
      aplicarFiltros();
    });

    // Permitir deseleccionar al hacer click nuevamente
    radio.addEventListener('click', function(e) {
      if (previouslyChecked === this && this.checked) {
        // Si ya estaba seleccionado y hace click nuevamente, deseleccionar
        this.checked = false;
        localStorage.removeItem('categoryFilterSelected');
        previouslyChecked = null;
        aplicarFiltros();
      } else {
        previouslyChecked = this;
      }
    });
  });

  // Si el gestor de idiomas ya existe, forzar la traducción de las etiquetas de categorías
  if (window.languageManager && typeof window.languageManager.updateCategoryLabels === 'function') {
    window.languageManager.updateCategoryLabels();
  }
}

function inicializarFavoritos() {
  const favoritos = obtenerFavoritosGuardados();
  
  // Agregar botones de estrella que falten y configurar event listeners
  document.querySelectorAll('.canal-card:not(#canal-list-favoritos .canal-card)').forEach(card => {
    let starBtn = card.querySelector('.canal-actions .canal-btn:has(i[class*="fa-star"])');
    
    // Si no existe el botón, crearlo
    if (!starBtn) {
      const canalActions = card.querySelector('.canal-actions');
      if (canalActions) {
        starBtn = document.createElement('button');
        starBtn.className = 'canal-btn';
        starBtn.innerHTML = '<i class="fa-regular fa-star"></i>';
        canalActions.appendChild(starBtn);
      }
    }
    
    // Configurar el botón
    if (starBtn) {
      const titulo = card.getAttribute('data-titulo');
      
      // Actualizar icono si está en favoritos
      if (favoritos.includes(titulo)) {
        starBtn.innerHTML = '<i class="fa-solid fa-star"></i>';
      } else {
        starBtn.innerHTML = '<i class="fa-regular fa-star"></i>';
      }
      
      // Agregar evento click
      starBtn.onclick = function() {
        toggleFavorito(this, card);
        return false;
      };
    }
  });
  
  // Actualizar la sección de favoritos
  actualizarFavoritos();
}

function crearIcono(iconClasses) {
  const icon = document.createElement('i');
  icon.className = iconClasses || 'fa-solid fa-link';
  return icon;
}

function crearBotonAccion(action) {
  const button = document.createElement('button');
  button.className = 'canal-btn';
  button.appendChild(crearIcono(action.icon));
  button.appendChild(document.createTextNode(` ${action.label}`));

  if (action.type === 'copy') {
    button.addEventListener('click', () => copiarAlPortapapeles(action.value, button));
  } else if (action.type === 'open') {
    button.addEventListener('click', () => window.open(action.value, '_blank', 'noopener,noreferrer'));
  }

  return button;
}

function crearTarjetaCanal(canal) {
  const card = document.createElement('article');
  card.className = 'canal-card';
  card.dataset.titulo = canal.id;
  card.dataset.lang = canal.languages.join(',');

  const header = document.createElement('div');
  header.className = 'canal-header';
  const name = document.createElement('span');
  name.className = 'canal-nombre';
  name.textContent = canal.name;
  header.appendChild(name);

  const badges = document.createElement('div');
  badges.className = 'lang-badges';
  badges.setAttribute('aria-hidden', 'true');
  canal.languages.forEach(language => {
    const flag = document.createElement('img');
    flag.src = obtenerRutaBandera(language);
    flag.alt = language.toUpperCase();
    flag.className = 'flag-badge';
    flag.dataset.lang = language;
    badges.appendChild(flag);
  });
  header.appendChild(badges);
  card.appendChild(header);

  if (canal.link) {
    const linkRow = document.createElement('div');
    linkRow.className = 'canal-link-row';
    const link = document.createElement(canal.linkUrl ? 'a' : 'span');
    link.className = 'site-link';
    if (canal.linkUrl) {
      link.href = canal.linkUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
    }
    link.appendChild(crearIcono('fa-solid fa-link'));
    link.appendChild(document.createTextNode(` ${canal.link}`));
    linkRow.appendChild(link);
    card.appendChild(linkRow);
  }

  const actions = document.createElement('div');
  actions.className = 'canal-actions';
  canal.actions.forEach(action => actions.appendChild(crearBotonAccion(action)));
  card.appendChild(actions);
  return card;
}

function obtenerRutaBandera(language) {
  const flags = {
    es: 'Flags/Spain.svg', en: 'Flags/USA.svg', uk: 'Flags/UK.svg',
    fr: 'Flags/France.svg', de: 'Flags/Germany.svg', ru: 'Flags/Russia.svg',
    pl: 'Flags/Poland.svg', zh: 'Flags/China.svg', pt: 'Flags/Portugal.svg',
    tr: 'Flags/Turkey.svg', ua: 'Flags/Ukraine.svg', nl: 'Flags/Netherlands.svg',
    it: 'Flags/Italy.svg', ja: 'Flags/Japan.svg', br: 'Flags/Brazil.svg',
    in: 'Flags/India.svg', ar: 'Flags/SaudiArabia.svg', sr: 'Flags/Serbia.svg',
    he: 'Flags/Israel.svg'
  };
  return flags[language] || 'Flags/Default.svg';
}

async function cargarCanales() {
  const response = await fetch('data/canales.json');
  if (!response.ok) {
    throw new Error(`No se pudo cargar data/canales.json (${response.status})`);
  }

  const canales = await response.json();
  if (!Array.isArray(canales)) {
    throw new Error('data/canales.json debe contener una lista de canales');
  }

  const container = document.getElementById('canales-container');
  if (!container) throw new Error('No se encontró el contenedor de canales');
  const categories = new Map();
  canales.forEach(canal => {
    if (!categories.has(canal.category)) categories.set(canal.category, []);
    categories.get(canal.category).push(canal);
  });

  container.replaceChildren();
  categories.forEach((items, category) => {
    const section = document.createElement('section');
    section.className = 'category-section';
    const title = document.createElement('h2');
    title.className = 'category-title';
    title.dataset.original = category;
    title.textContent = category;
    section.appendChild(title);
    const list = document.createElement('div');
    list.className = 'canal-list';
    list.id = `canal-list-${normalizarTexto(category)}`;
    items.forEach(canal => list.appendChild(crearTarjetaCanal(canal)));
    section.appendChild(list);
    container.appendChild(section);
  });
}

document.addEventListener('DOMContentLoaded', async function() {
  try {
    await cargarCanales();
  } catch (error) {
    console.error('No se pudo cargar el contenido de la web:', error);
    const container = document.getElementById('canales-container');
    if (container) {
      container.textContent = 'No se pudo cargar el contenido. Revisa data/canales.json.';
    }
    return;
  }

  llenarFiltroIdiomas();
  llenarFiltroCategoriasUnicas();
  inicializarFavoritos();
  aplicarFiltros();
  // Botón para limpiar filtros (si existe en DOM)
  const clearBtn = document.getElementById('clear-filters-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', function() {
      // Limpiar buscador
      if (buscador) buscador.value = '';
      // Limpiar idiomas
      document.querySelectorAll('.lang-checkbox').forEach(cb => cb.checked = false);
      localStorage.removeItem('langFiltersSelected');
      // Limpiar categoría
      document.querySelectorAll('.category-radio').forEach(r => r.checked = false);
      localStorage.removeItem('categoryFilterSelected');
      aplicarFiltros();
    });
  }
});

// --- Cambiar tema ---
const themeToggle = document.getElementById('theme-toggle');
const root = document.documentElement;

function setTheme(theme) {
  if (theme === 'light') {
    root.classList.add('light-theme');
    root.classList.remove('dark-theme');
    localStorage.setItem('theme', 'light');
  } else {
    root.classList.add('dark-theme');
    root.classList.remove('light-theme');
    localStorage.setItem('theme', 'dark');
  }
}

const savedTheme = localStorage.getItem('theme');
setTheme(savedTheme === 'light' ? 'light' : 'dark');

themeToggle.addEventListener('click', function() {
  const isLight = root.classList.contains('light-theme');
  setTheme(isLight ? 'dark' : 'light');
  themeToggle.classList.toggle('active', !isLight);
});

if (root.classList.contains('light-theme')) {
  themeToggle.classList.add('active');
}

// --- Cambia logo aleatoriamente ---
function ponerLogoAleatorio() {
  const total = 41;
  const num = Math.floor(Math.random() * total) + 1;
  const ruta = `Logos/logo${num}.jpg`;
  document.getElementById('logo-img').src = ruta;
}

window.addEventListener('DOMContentLoaded', ponerLogoAleatorio);

// --- Telegram ---
function abrirModalTelegram() {
  document.getElementById('telegram-modal').classList.add('show');
}

// --- App ---
function abrirModalApp() {
  document.getElementById('app-modal').classList.add('show');
}

// --- Anuncios/Recompensa ---
const tiempoREINICIO = 12 * 60 * 60 * 1000; // 12 horas

function abrirModalAds() {
  const adsModal = document.getElementById('ads-modal');
  adsModal.classList.add('show');
  if (window.languageManager) {
    window.languageManager.updateAdsTexts();
  }
  actualizarEstadoAds();
}

function obtenerEstadoAds() {
  const estado = localStorage.getItem('adsState');
  if (!estado) {
    return {
      completados: 0,
      ultimaReinicio: Date.now(),
      contador: 0,
      tiempoInicio: null,
      intervaloActivo: false
    };
  }
  return JSON.parse(estado);
}

function guardarEstadoAds(estado) {
  localStorage.setItem('adsState', JSON.stringify(estado));
}

function verificarReinicioAds() {
  const estado = obtenerEstadoAds();
  const ahora = Date.now();
  
  if (ahora - estado.ultimaReinicio >= tiempoREINICIO && estado.completados === 3) {
    estado.completados = 0;
    estado.ultimaReinicio = ahora;
    estado.contador = 0;
    estado.tiempoInicio = null;
    estado.intervaloActivo = false;
    guardarEstadoAds(estado);
  }
}

function continuarContador() {
  const estado = obtenerEstadoAds();
  const btn = document.getElementById('ads-btn');
  const messageDiv = document.getElementById('ads-message');
  
  // Si hay un contador activo y tiempo de inicio registrado
  if (estado.intervaloActivo && estado.tiempoInicio) {
    const ahora = Date.now();
    const tiempoTranscurrido = Math.floor((ahora - estado.tiempoInicio) / 1000);
    const tiempoRestante = 15 - tiempoTranscurrido;
    
    // Si aún quedan segundos
    if (tiempoRestante > 0) {
      // Marcar la barra actual como activa
      const fill = document.getElementById(`progress-fill-${estado.completados}`);
      if (fill) {
        fill.classList.add('active');
        fill.classList.remove('completed');
      }
      
      // Limpiar el mensaje cuando hay contador activo
      messageDiv.textContent = '';
      
      estado.contador = tiempoRestante;
      btn.textContent = window.languageManager.getTranslation('adsWaitingSeconds').replace('{contador}', Math.ceil(estado.contador / 1000));
      btn.disabled = true;
      
      // Reiniciar el intervalo
      const intervalo = setInterval(() => {
        estado.contador--;
        btn.textContent = window.languageManager.getTranslation('adsWaitingSeconds').replace('{contador}', estado.contador);
        guardarEstadoAds(estado);
        
        if (estado.contador === 0) {
          clearInterval(intervalo);
          
          // Marcar como completado
          const fill = document.getElementById(`progress-fill-${estado.completados}`);
          if (fill) {
            fill.classList.remove('active');
            fill.classList.add('completed');
          }
          
          estado.intervaloActivo = false;
          estado.tiempoInicio = null;
          
          if (estado.completados === 3) {
            const ahora = Date.now();
            const tiempoTranscurrido = ahora - estado.ultimaReinicio;
            const tiempoRestante = tiempoREINICIO - tiempoTranscurrido;
            const tiempoFormato = formatearTiempoRestante(tiempoRestante);
            const completionMsg = window.languageManager.getTranslation('adsCompletionMessage');
            const resetMsg = window.languageManager.getTranslation('adsResetMessage').replace('{tiempoFormato}', tiempoFormato);
            messageDiv.innerHTML = `${completionMsg}<br><span style="font-size: 0.9rem; color: #a0a0a0;">${resetMsg}</span>`;
            btn.textContent = window.languageManager.getTranslation('adsCompleted');
            iniciarContadorReinicioAds(messageDiv);
          } else {
            const progressMsg = window.languageManager.getTranslation('adsProgressMessage').replace('{numero}', estado.completados);
            messageDiv.textContent = progressMsg;
            btn.disabled = false;
            btn.textContent = window.languageManager.getTranslation('adsViewButton');
          }
          
          guardarEstadoAds(estado);
        }
      }, 1000);
    } else {
      // Si ya pasaron los 15 segundos, completar automáticamente
      estado.intervaloActivo = false;
      estado.tiempoInicio = null;
      
      const fill = document.getElementById(`progress-fill-${estado.completados}`);
      if (fill) {
        fill.classList.remove('active');
        fill.classList.add('completed');
      }
      
      if (estado.completados === 3) {
        const ahora = Date.now();
        const tiempoTranscurrido = ahora - estado.ultimaReinicio;
        const tiempoRestante = tiempoREINICIO - tiempoTranscurrido;
        const tiempoFormato = formatearTiempoRestante(tiempoRestante);
        const completionMsg = window.languageManager.getTranslation('adsCompletionMessage');
        const resetMsg = window.languageManager.getTranslation('adsResetMessage').replace('{tiempoFormato}', tiempoFormato);
        messageDiv.innerHTML = `${completionMsg}<br><span style="font-size: 0.9rem; color: #a0a0a0;">${resetMsg}</span>`;
        btn.textContent = window.languageManager.getTranslation('adsCompleted');
        iniciarContadorReinicioAds(messageDiv);
      } else {
        const progressMsg = window.languageManager.getTranslation('adsProgressMessage').replace('{numero}', estado.completados);
        messageDiv.textContent = progressMsg;
        btn.disabled = false;
        btn.textContent = window.languageManager.getTranslation('adsViewButton');
      }
      
      guardarEstadoAds(estado);
    }
  }
}

function formatearTiempoRestante(tiempoMs) {
  const totalSegundos = Math.max(0, Math.floor(tiempoMs / 1000));
  const horas = Math.floor(totalSegundos / 3600);
  const minutos = Math.floor((totalSegundos % 3600) / 60);
  const segundos = totalSegundos % 60;
  
  return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
}

function iniciarContadorReinicioAds(messageDiv) {
  let intervaloReinicio = setInterval(() => {
    const estado = obtenerEstadoAds();
    
    // Si ya no está completado, parar el intervalo
    if (estado.completados !== 3) {
      clearInterval(intervaloReinicio);
      return;
    }
    
    const ahora = Date.now();
    const doceHoras = 12 * 60 * 60 * 1000;
    const tiempoTranscurrido = ahora - estado.ultimaReinicio;
    const tiempoRestante = tiempoREINICIO - tiempoTranscurrido;
    
    if (tiempoRestante <= 0) {
      // El reinicio ya ocurrió
      clearInterval(intervaloReinicio);
      estado.completados = 0;
      estado.ultimaReinicio = ahora;
      guardarEstadoAds(estado);
      messageDiv.innerHTML = window.languageManager.getTranslation('adsInitialMessage');
      // Refrescar toda la UI: botón, barras, etc.
      actualizarEstadoAds();
    } else {
      // Mostrar tiempo restante
      const tiempoFormato = formatearTiempoRestante(tiempoRestante);
      const completionMsg = window.languageManager.getTranslation('adsCompletionMessage');
      const resetMsg = window.languageManager.getTranslation('adsResetMessage').replace('{tiempoFormato}', tiempoFormato);
      messageDiv.innerHTML = `${completionMsg}<br><span style="font-size: 0.9rem; color: #a0a0a0;">${resetMsg}</span>`;
    }
  }, 1000);
}

function actualizarEstadoAds() {
  verificarReinicioAds();
  const estado = obtenerEstadoAds();
  const btn = document.getElementById('ads-btn');
  const messageDiv = document.getElementById('ads-message');
  
  // Actualizar barras de progreso (pero no si hay un contador activo en curso)
  if (!estado.intervaloActivo || !estado.tiempoInicio) {
    for (let i = 1; i <= 3; i++) {
      const fill = document.getElementById(`progress-fill-${i}`);
      if (i <= estado.completados) {
        fill.classList.add('completed');
        fill.classList.remove('active');
      } else {
        fill.classList.remove('completed', 'active');
      }
    }
  } else {
    // Si hay contador activo, marcar el actual como activo y los completados como completados
    for (let i = 1; i <= 3; i++) {
      const fill = document.getElementById(`progress-fill-${i}`);
      if (i < estado.completados) {
        fill.classList.add('completed');
        fill.classList.remove('active');
      } else if (i === estado.completados) {
        fill.classList.add('active');
        fill.classList.remove('completed');
      } else {
        fill.classList.remove('completed', 'active');
      }
    }
  }
  
  // Actualizar estado del botón y mensaje
  // PRIMERO: Si hay contador activo, continuar con él (incluso si completados === 3)
  if (estado.intervaloActivo && estado.tiempoInicio) {
    // Continuar con el contador si estaba activo
    continuarContador();
  } else if (estado.completados === 3) {
    btn.disabled = true;
    btn.textContent = window.languageManager.getTranslation('adsCompleted');
    
    // Calcular tiempo restante
    const ahora = Date.now();
    const tiempoTranscurrido = ahora - estado.ultimaReinicio;
    const tiempoRestante = tiempoREINICIO - tiempoTranscurrido;
    const tiempoFormato = formatearTiempoRestante(tiempoRestante);
    
    const completionMsg = window.languageManager.getTranslation('adsCompletionMessage');
    const resetMsg = window.languageManager.getTranslation('adsResetMessage').replace('{tiempoFormato}', tiempoFormato);
    messageDiv.innerHTML = `${completionMsg}<br><span style="font-size: 0.9rem; color: #a0a0a0;">${resetMsg}</span>`;
    
    // Iniciar contador de reinicio
    iniciarContadorReinicioAds(messageDiv);
  } else if (estado.contador > 0) {
    btn.disabled = true;
    btn.textContent = window.languageManager.getTranslation('adsWaitingSeconds').replace('{contador}', estado.contador);
  } else {
    btn.disabled = false;
    btn.textContent = window.languageManager.getTranslation('adsViewButton');
  }
}

function verAnuncio() {
  const btn = document.getElementById('ads-btn');
  const messageDiv = document.getElementById('ads-message');
  let estado = obtenerEstadoAds();
  
  if (btn.disabled || estado.completados >= 3) {
    return;
  }
  
  // Abrir enlace en nueva pestaña
  window.open('https://omg10.com/4/9594154', '_blank', 'noopener,noreferrer');
  
  // IMPORTANTE: Incrementar y guardar el estado INMEDIATAMENTE
  estado.completados++;
  estado.contador = 15;
  estado.tiempoInicio = Date.now();
  estado.intervaloActivo = true;
  guardarEstadoAds(estado); // Guardar ANTES del intervalo
  
  // Deshabilitar botón
  btn.disabled = true;
  
  // Activar la barra de progreso actual
  const fill = document.getElementById(`progress-fill-${estado.completados}`);
  if (fill) {
    fill.classList.add('active');
  }
  
  // Actualizar mensaje y botón
  messageDiv.textContent = '';
  btn.textContent = window.languageManager.getTranslation('adsWaitingSeconds').replace('{contador}', 15);
  
  // Contador regresivo de 15 segundos
  const intervalo = setInterval(() => {
    estado.contador--;
    btn.textContent = window.languageManager.getTranslation('adsWaitingSeconds').replace('{contador}', estado.contador);
    guardarEstadoAds(estado); // Guardar en cada tick
    
    if (estado.contador === 0) {
      clearInterval(intervalo);
      
      // Marcar como completado
      fill.classList.remove('active');
      fill.classList.add('completed');
      
      estado.intervaloActivo = false;
      estado.tiempoInicio = null;
      
      if (estado.completados === 3) {
        const ahora = Date.now();
        const tiempoTranscurrido = ahora - estado.ultimaReinicio;
        const tiempoRestante = tiempoREINICIO - tiempoTranscurrido;
        const tiempoFormato = formatearTiempoRestante(tiempoRestante);
        const completionMsg = window.languageManager.getTranslation('adsCompletionMessage');
        const resetMsg = window.languageManager.getTranslation('adsResetMessage').replace('{tiempoFormato}', tiempoFormato);
        messageDiv.innerHTML = `${completionMsg}<br><span style="font-size: 0.9rem; color: #a0a0a0;">${resetMsg}</span>`;
        btn.textContent = window.languageManager.getTranslation('adsCompleted');
        iniciarContadorReinicioAds(messageDiv);
      } else {
        const progressMsg = window.languageManager.getTranslation('adsProgressMessage').replace('{numero}', estado.completados);
        messageDiv.textContent = progressMsg;
        btn.disabled = false;
        btn.textContent = window.languageManager.getTranslation('adsViewButton');
      }
      
      guardarEstadoAds(estado); // Guardar estado final
    }
  }, 1000);
}

// Cierre de modales (cada uno con su botón X)
document.addEventListener('DOMContentLoaded', function() {
  const telegramModal = document.getElementById('telegram-modal');
  const appModal = document.getElementById('app-modal');
  const adsModal = document.getElementById('ads-modal');

  const telegramClose = telegramModal ? telegramModal.querySelector('.close') : null;
  const appClose = appModal ? appModal.querySelector('.close') : null;
  const adsClose = adsModal ? adsModal.querySelector('.close') : null;

  telegramClose && telegramClose.addEventListener('click', function() {
    telegramModal.classList.remove('show');
  });

  appClose && appClose.addEventListener('click', function() {
    appModal.classList.remove('show');
  });

  adsClose && adsClose.addEventListener('click', function() {
    adsModal.classList.remove('show');
  });

  window.addEventListener('click', function(e) {
    if (e.target === telegramModal) telegramModal.classList.remove('show');
    if (e.target === appModal) appModal.classList.remove('show');
    if (e.target === adsModal) adsModal.classList.remove('show');
  });
});