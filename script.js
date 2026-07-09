document.getElementById('year').textContent = new Date().getFullYear();

// ---- Carrusel animado de combinaciones estrella (estilo Aceternity animated-testimonials) ----
const COMBOS = [
  { name: 'FROST BERRY', flavors: 'Fresa + Menta', img: 'assets/combo-frost-berry.jpg' },
  { name: 'MANGO FREEZE', flavors: 'Mango + Menta', img: 'assets/combo-mango-freeze.jpg' },
  { name: 'TROPIC GOLD', flavors: 'Mango + Maracuyá', img: 'assets/combo-tropic-gold.jpg' },
  { name: 'ACID TROPIC', flavors: 'Tamarindo + Maracuyá', img: 'assets/combo-acid-tropic.jpg' },
  { name: 'COCO BERRY', flavors: 'Coco + Fresa', img: 'assets/combo-coco-berry.jpg' },
];

(function initComboCarousel() {
  const stack = document.getElementById('comboImgStack');
  const nameEl = document.getElementById('comboName');
  const flavorsEl = document.getElementById('comboFlavors');
  const textEl = document.getElementById('comboText');
  const prevBtn = document.getElementById('comboPrev');
  const nextBtn = document.getElementById('comboNext');
  if (!stack || !nameEl) return;

  let active = 0;
  let autoplayTimer = null;

  // crear las imágenes una sola vez
  const imgEls = COMBOS.map((combo, i) => {
    const img = document.createElement('img');
    img.src = combo.img;
    img.alt = combo.name;
    img.className = 'combo-img';
    stack.appendChild(img);
    return img;
  });

  function isActive(i) { return i === active; }

  function render() {
    imgEls.forEach((img, i) => {
      if (isActive(i)) {
        img.style.opacity = '1';
        img.style.zIndex = '5';
        img.style.transform = 'scale(1) rotate(0deg) translateY(0)';
      } else {
        const offset = (i - active + COMBOS.length) % COMBOS.length;
        const dir = i % 2 === 0 ? 1 : -1;
        img.style.opacity = offset === 1 || offset === COMBOS.length - 1 ? '.7' : '0';
        img.style.zIndex = String(COMBOS.length - offset);
        img.style.transform = `scale(0.92) rotate(${dir * 6}deg) translateY(18px)`;
      }
    });

    textEl.classList.add('is-changing');
    setTimeout(() => {
      nameEl.textContent = COMBOS[active].name;
      flavorsEl.textContent = COMBOS[active].flavors;
      textEl.classList.remove('is-changing');
    }, 180);
  }

  function goTo(i) {
    active = (i + COMBOS.length) % COMBOS.length;
    render();
    resetAutoplay();
  }

  function next() { goTo(active + 1); }
  function prev() { goTo(active - 1); }

  function resetAutoplay() {
    if (autoplayTimer) clearInterval(autoplayTimer);
    autoplayTimer = setInterval(next, 5000);
  }

  prevBtn.addEventListener('click', prev);
  nextBtn.addEventListener('click', next);

  render();
  resetAutoplay();
})();

const ORDER_WHATSAPP = '51906591534';

const SABORES_RASPADILLA = ['Fresa', 'Menta', 'Tamarindo', 'Mango', 'Coco', 'Lúcuma', 'Maracuyá'];
const SABORES_MARCIANO = ['Fresa con leche', 'Maracumango', 'Lúcuma con leche', 'Maní con leche', 'Coco con leche', 'Tamarindo'];

const tipoSelect = document.getElementById('tipo');
const fieldCantidadRaspadilla = document.getElementById('fieldCantidadRaspadilla');
const fieldCantidadMarciano = document.getElementById('fieldCantidadMarciano');
const cantidadRaspadillaInput = document.getElementById('cantidadRaspadilla');
const cantidadMarcianoInput = document.getElementById('cantidadMarciano');
const bloquesRaspadilla = document.getElementById('bloquesRaspadilla');
const bloquesMarciano = document.getElementById('bloquesMarciano');
const btnUbicacion = document.getElementById('btnUbicacion');
const ubicacionStatus = document.getElementById('ubicacionStatus');
const formError = document.getElementById('formError');
const form = document.getElementById('orderForm');

let ubicacionUrl = null;

// ---- construir bloques de sabor por unidad ----
function chipsHtml(sabores, inputType, groupName) {
  return sabores.map(s => `
    <label class="chip">
      <input type="${inputType}" name="${groupName}" value="${s}">
      <span>${s}</span>
    </label>
  `).join('');
}

function renderRaspadillaBlocks() {
  const n = Math.max(1, parseInt(cantidadRaspadillaInput.value) || 1);
  const mostrarNombre = n > 1;
  let html = '';
  for (let i = 1; i <= n; i++) {
    const groupName = `sabor-rasp-${i}`;
    html += `
      <div class="unit-block" data-tipo="raspadilla" data-index="${i}">
        <p class="unit-title">🍧 Raspadilla ${n > 1 ? i : ''}</p>
        ${mostrarNombre ? `<input type="text" class="unit-name" data-role="nombre" placeholder="¿Quién la va a disfrutar?">` : ''}
        <div class="chip-group" data-role="sabores" data-max="2">
          ${chipsHtml(SABORES_RASPADILLA, 'checkbox', groupName)}
        </div>
      </div>`;
  }
  bloquesRaspadilla.innerHTML = html;
  attachMaxLimit(bloquesRaspadilla, 2);
}

function renderMarcianoBlocks() {
  const n = Math.max(1, parseInt(cantidadMarcianoInput.value) || 1);
  const mostrarNombre = n > 1;
  let html = '';
  for (let i = 1; i <= n; i++) {
    const groupName = `sabor-marc-${i}`;
    html += `
      <div class="unit-block" data-tipo="marciano" data-index="${i}">
        <p class="unit-title">🧊 Marciano ${n > 1 ? i : ''}</p>
        ${mostrarNombre ? `<input type="text" class="unit-name" data-role="nombre" placeholder="¿Quién lo va a disfrutar?">` : ''}
        <div class="chip-group" data-role="sabores">
          ${chipsHtml(SABORES_MARCIANO, 'radio', groupName)}
        </div>
      </div>`;
  }
  bloquesMarciano.innerHTML = html;
}

// limitar a "max" checkboxes marcados dentro de cada .chip-group con data-max
function attachMaxLimit(container) {
  container.querySelectorAll('.chip-group[data-max]').forEach(group => {
    const max = parseInt(group.dataset.max);
    const boxes = group.querySelectorAll('input[type="checkbox"]');
    boxes.forEach(box => {
      box.addEventListener('change', () => {
        const marcados = group.querySelectorAll('input[type="checkbox"]:checked');
        boxes.forEach(b => { b.disabled = marcados.length >= max && !b.checked; });
      });
    });
  });
}

// ---- mostrar solo lo relevante según el producto elegido ----
function actualizarVisibilidad() {
  const tipo = tipoSelect.value;
  const esRaspadilla = tipo === 'Raspadilla' || tipo === 'Ambos';
  const esMarciano = tipo === 'Marciano' || tipo === 'Ambos';

  fieldCantidadRaspadilla.hidden = !esRaspadilla;
  fieldCantidadMarciano.hidden = !esMarciano;
  bloquesRaspadilla.hidden = !esRaspadilla;
  bloquesMarciano.hidden = !esMarciano;

  if (esRaspadilla) renderRaspadillaBlocks();
  if (esMarciano) renderMarcianoBlocks();
}

tipoSelect.addEventListener('change', actualizarVisibilidad);
cantidadRaspadillaInput.addEventListener('input', renderRaspadillaBlocks);
cantidadMarcianoInput.addEventListener('input', renderMarcianoBlocks);

actualizarVisibilidad(); // estado inicial

// ---- ubicación GPS ----
btnUbicacion.addEventListener('click', () => {
  if (!navigator.geolocation) {
    ubicacionStatus.textContent = 'Tu navegador no soporta ubicación. Escribe tu dirección arriba.';
    return;
  }
  ubicacionStatus.textContent = 'Obteniendo tu ubicación...';
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude } = pos.coords;
      ubicacionUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      ubicacionStatus.textContent = '✅ Ubicación lista para enviar';
      ubicacionStatus.classList.add('ok');
    },
    () => {
      ubicacionStatus.textContent = 'No pudimos obtener tu ubicación. Puedes escribirla en "Dirección / referencia" o compartirla luego por WhatsApp.';
      ubicacionUrl = null;
    },
    { enableHighAccuracy: true, timeout: 10000 }
  );
});

// ---- armar y enviar el pedido ----
function leerBloques(container) {
  const items = [];
  container.querySelectorAll('.unit-block').forEach(block => {
    const nombreInput = block.querySelector('[data-role="nombre"]');
    const nombre = nombreInput ? nombreInput.value.trim() : '';
    const marcados = Array.from(block.querySelectorAll('input:checked')).map(i => i.value);
    items.push({ nombre, sabores: marcados });
  });
  return items;
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  formError.textContent = '';

  const tipo = tipoSelect.value;
  const esRaspadilla = tipo === 'Raspadilla' || tipo === 'Ambos';
  const esMarciano = tipo === 'Marciano' || tipo === 'Ambos';
  const nombreCliente = document.getElementById('nombre').value.trim();
  const referencia = document.getElementById('referencia').value.trim();

  const itemsRaspadilla = esRaspadilla ? leerBloques(bloquesRaspadilla) : [];
  const itemsMarciano = esMarciano ? leerBloques(bloquesMarciano) : [];

  // validaciones
  for (const item of itemsRaspadilla) {
    if (item.sabores.length === 0) {
      formError.textContent = 'Elige al menos 1 sabor (máximo 2) para cada raspadilla.';
      return;
    }
    if (itemsRaspadilla.length > 1 && !item.nombre) {
      formError.textContent = 'Coloca el nombre de quien se comerá cada raspadilla.';
      return;
    }
  }
  for (const item of itemsMarciano) {
    if (item.sabores.length === 0) {
      formError.textContent = 'Elige el sabor de cada marciano.';
      return;
    }
    if (itemsMarciano.length > 1 && !item.nombre) {
      formError.textContent = 'Coloca el nombre de quien se comerá cada marciano.';
      return;
    }
  }
  if (!nombreCliente) {
    formError.textContent = 'Cuéntanos tu nombre para el pedido.';
    return;
  }

  // construir mensaje
  let mensaje = `¡Hola Cero Grados! 🍧 Quiero hacer un pedido:\n\n`;

  if (itemsRaspadilla.length) {
    mensaje += `RASPADILLAS (${itemsRaspadilla.length}):\n`;
    itemsRaspadilla.forEach((item, i) => {
      mensaje += `${i + 1}. ${item.sabores.join(', ')}`;
      if (item.nombre) mensaje += ` — para: ${item.nombre}`;
      mensaje += `\n`;
    });
    mensaje += `\n`;
  }

  if (itemsMarciano.length) {
    mensaje += `MARCIANOS (${itemsMarciano.length}):\n`;
    itemsMarciano.forEach((item, i) => {
      mensaje += `${i + 1}. ${item.sabores.join(', ')}`;
      if (item.nombre) mensaje += ` — para: ${item.nombre}`;
      mensaje += `\n`;
    });
    mensaje += `\n`;
  }

  mensaje += `Nombre (quien pide): ${nombreCliente}\n`;
  if (referencia) mensaje += `Dirección / referencia: ${referencia}\n`;
  if (ubicacionUrl) {
    mensaje += `Ubicación: ${ubicacionUrl}\n`;
  } else {
    mensaje += `Ubicación: no compartida desde la web, la envío por este chat.\n`;
  }
  mensaje += `\n¿Cuánto sería el delivery? 🙌`;

  const url = `https://wa.me/${ORDER_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
});
