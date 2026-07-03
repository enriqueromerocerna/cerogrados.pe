document.getElementById('year').textContent = new Date().getFullYear();

const ORDER_WHATSAPP = '51906591534';

const tipoSelect = document.getElementById('tipo');
const grupoRaspadilla = document.getElementById('grupoRaspadilla');
const grupoMarciano = document.getElementById('grupoMarciano');
const chipsRaspadilla = document.querySelectorAll('input[name="sabor-raspadilla"]');
const btnUbicacion = document.getElementById('btnUbicacion');
const ubicacionStatus = document.getElementById('ubicacionStatus');
const formError = document.getElementById('formError');
const form = document.getElementById('orderForm');

let ubicacionUrl = null;

// Alternar entre sabores de raspadilla (max 2) y sabores de marciano (1)
tipoSelect.addEventListener('change', () => {
  const esRaspadilla = tipoSelect.value === 'Raspadilla';
  grupoRaspadilla.hidden = !esRaspadilla;
  grupoMarciano.hidden = esRaspadilla;
});

// Limitar selección de sabores de raspadilla a 2
chipsRaspadilla.forEach(chk => {
  chk.addEventListener('change', () => {
    const marcados = document.querySelectorAll('input[name="sabor-raspadilla"]:checked');
    if (marcados.length >= 2) {
      chipsRaspadilla.forEach(c => { if (!c.checked) c.disabled = true; });
    } else {
      chipsRaspadilla.forEach(c => { c.disabled = false; });
    }
  });
});

// Pedir ubicación GPS
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

form.addEventListener('submit', (e) => {
  e.preventDefault();
  formError.textContent = '';

  const tipo = tipoSelect.value;
  const cantidad = document.getElementById('cantidad').value || '1';
  const nombre = document.getElementById('nombre').value.trim();
  const referencia = document.getElementById('referencia').value.trim();

  let sabores = [];
  if (tipo === 'Raspadilla') {
    sabores = Array.from(document.querySelectorAll('input[name="sabor-raspadilla"]:checked')).map(c => c.value);
    if (sabores.length === 0) {
      formError.textContent = 'Elige al menos 1 sabor (máximo 2).';
      return;
    }
  } else {
    const marciano = document.querySelector('input[name="sabor-marciano"]:checked');
    if (!marciano) {
      formError.textContent = 'Elige un sabor de marciano.';
      return;
    }
    sabores = [marciano.value];
  }

  if (!nombre) {
    formError.textContent = 'Cuéntanos tu nombre para el pedido.';
    return;
  }

  let mensaje = `¡Hola Cero Grados! 🍧 Quiero hacer un pedido:\n`;
  mensaje += `Producto: ${tipo}\n`;
  mensaje += `Sabor${sabores.length > 1 ? 'es' : ''}: ${sabores.join(', ')}\n`;
  mensaje += `Cantidad: ${cantidad}\n`;
  mensaje += `Nombre: ${nombre}\n`;
  if (referencia) mensaje += `Dirección / referencia: ${referencia}\n`;
  if (ubicacionUrl) {
    mensaje += `Ubicación: ${ubicacionUrl}\n`;
  } else {
    mensaje += `Ubicación: no compartida desde la web, la envío por este chat.\n`;
  }
  mensaje += `¿Cuánto sería el delivery? 🙌`;

  const url = `https://wa.me/${ORDER_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;
  window.open(url, '_blank');
});
