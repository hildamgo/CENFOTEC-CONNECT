// Endpoints API (ajustar según backend)
const API_SPACES = '/api/spaces';
const API_RESP = '/api/responsibles';
const API_ACTIVITIES = '/api/activities';
const API_USERS = '/api/users';

// Elementos y plantillas
const app = document.getElementById('app');
const tplDashboard = document.getElementById('tpl-dashboard');
const tplSpaces = document.getElementById('tpl-spaces');
const tplResp = document.getElementById('tpl-responsibles');
const tplActivities = document.getElementById('tpl-activities');
const tplUsers = document.getElementById('tpl-users');

document.getElementById('nav-dashboard').addEventListener('click', () => mostrarVista('dashboard'));
document.getElementById('nav-spaces').addEventListener('click', () => mostrarVista('spaces'));
document.getElementById('nav-responsibles').addEventListener('click', () => mostrarVista('responsibles'));
document.getElementById('nav-activities').addEventListener('click', () => mostrarVista('activities'));
document.getElementById('nav-users').addEventListener('click', () => mostrarVista('users'));
//Redirige las paginas  de participantes e isncripcciones, #duda#.
document.getElementById('nav-participants').addEventListener('click', () => {window.location.href = 'pages/participantes.html';});
document.getElementById('nav-inscriptions').addEventListener('click', () => {window.location.href = 'pages/inscripciones.html';});

// Vista inicial
mostrarVista('dashboard');

function mostrarVista(nombre) {
  app.innerHTML = '';
  switch (nombre) {
    case 'spaces':
      app.appendChild(tplSpaces.content.cloneNode(true));
      inicializarEspacios();
      break;
    case 'responsibles':
      app.appendChild(tplResp.content.cloneNode(true));
      inicializarResponsables();
      break;
    case 'activities':
      app.appendChild(tplActivities.content.cloneNode(true));
      break;
    case 'users':
      app.appendChild(tplUsers.content.cloneNode(true));
      break;
    default:
      app.appendChild(tplDashboard.content.cloneNode(true));
      inicializarDashboard();
  }
}

/* ---------- Panel ---------- */
async function inicializarDashboard() {
  try {
    const [aRes, sRes, rRes] = await Promise.all([
      fetch(API_ACTIVITIES), fetch(API_SPACES), fetch(API_RESP)
    ]);
    const [acts, spaces, resps] = await Promise.all([aRes.json(), sRes.json(), rRes.json()]);
    document.getElementById('stat-activities').textContent = Array.isArray(acts) ? acts.length : '—';
    document.getElementById('stat-spaces').textContent = Array.isArray(spaces) ? spaces.length : '—';
    document.getElementById('stat-responsibles').textContent = Array.isArray(resps) ? resps.length : '—';
  } catch (e) {
    document.getElementById('stat-activities').textContent = '—';
    document.getElementById('stat-spaces').textContent = '—';
    document.getElementById('stat-responsibles').textContent = '—';
  }
}

/* ---------- Espacios ---------- */
function inicializarEspacios() {
  const form = document.getElementById('spaceForm');
  const msg = document.getElementById('msg-spaces');
  const tbody = document.querySelector('#spacesTable tbody');
  const resetBtn = document.getElementById('reset-space');

  async function cargar() {
    try {
      const res = await fetch(API_SPACES);
      const data = await res.json();
      tbody.innerHTML = data.map(s => `
        <tr>
          <td>${esc(s.name)}</td>
          <td>${esc(s.campus)}</td>
          <td>${esc(s.description || '')}</td>
          <td>
            <button data-id="${s._id}" class="del-space btn">Eliminar</button>
          </td>
        </tr>
      `).join('');
      tbody.querySelectorAll('.del-space').forEach(b => b.addEventListener('click', () => eliminarEspacio(b.dataset.id)));
    } catch (e) {
      tbody.innerHTML = '<tr><td colspan="4">Error cargando espacios</td></tr>';
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    const payload = {
      name: document.getElementById('name').value.trim(),
      campus: document.getElementById('campus').value.trim(),
      description: document.getElementById('description').value.trim()
    };
    if (!payload.name || !payload.campus) {
      msg.textContent = 'Nombre y sede son obligatorios.';
      return;
    }
    try {
      const res = await fetch(API_SPACES, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      if (res.status === 201) {
        form.reset();
        cargar();
      } else {
        const err = await res.json();
        msg.textContent = err.error || 'Error al crear espacio.';
      }
    } catch (e) {
      msg.textContent = 'Error de conexión.';
    }
  });

  resetBtn.addEventListener('click', () => form.reset());

  async function eliminarEspacio(id) {
    if (!confirm('Eliminar espacio?')) return;
    try {
      const res = await fetch(`${API_SPACES}/${id}`, { method: 'DELETE' });
      const r = await res.json();
      if (res.ok) cargar(); else alert(r.error || 'Error al eliminar.');
    } catch (e) {
      alert('Error de conexión.');
    }
  }

  cargar();
}

/* ---------- Responsables ---------- */
function inicializarResponsables() {
  const form = document.getElementById('respForm');
  const msg = document.getElementById('msg-resp');
  const tbody = document.querySelector('#listTable tbody');
  const resetBtn = document.getElementById('reset-resp');

  async function cargar() {
    try {
      const res = await fetch(API_RESP);
      const data = await res.json();
      tbody.innerHTML = data.map(r => `
        <tr>
          <td>${esc(r.identification)}</td>
          <td>${esc(r.firstName + ' ' + r.lastName)}</td>
          <td>${esc(r.email)}</td>
          <td>${esc((r.phones || []).join(', '))}</td>
          <td><button data-id="${r._id}" class="del-resp btn">Eliminar</button></td>
        </tr>
      `).join('');
      tbody.querySelectorAll('.del-resp').forEach(b => b.addEventListener('click', () => eliminarResponsable(b.dataset.id)));
    } catch (e) {
      tbody.innerHTML = '<tr><td colspan="5">Error cargando responsables</td></tr>';
    }
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = '';
    const payload = {
      identification: document.getElementById('identification').value.trim(),
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phones: document.getElementById('phones').value.split(',').map(s => s.trim()).filter(Boolean),
      specialty: document.getElementById('specialty').value.trim(),
      institution: document.getElementById('institution').value.trim(),
      biography: document.getElementById('biography').value.trim()
    };
    if (!payload.identification || !payload.firstName || !payload.lastName || !payload.email || payload.phones.length === 0) {
      msg.textContent = 'Faltan campos obligatorios.';
      return;
    }
    try {
      const res = await fetch(API_RESP, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      if (res.status === 201) {
        form.reset();
        cargar();
      } else {
        const err = await res.json();
        msg.textContent = err.error || 'Error al crear responsable.';
      }
    } catch (e) {
      msg.textContent = 'Error de conexión.';
    }
  });

  resetBtn.addEventListener('click', () => form.reset());

  async function eliminarResponsable(id) {
    if (!confirm('Eliminar responsable?')) return;
    try {
      const res = await fetch(`${API_RESP}/${id}`, { method: 'DELETE' });
      const r = await res.json();
      if (res.ok) cargar(); else alert(r.error || 'Error al eliminar.');
    } catch (e) {
      alert('Error de conexión.');
    }
  }

  cargar();
}

/* Utilidades */
function esc(s) {
  return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}
