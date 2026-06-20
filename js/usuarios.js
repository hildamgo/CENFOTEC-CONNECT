// Esta lista de administradores registrador es una mini base de datos temporal para contener esa info
let admins = [];

function limpiarErrores(){
    const campos = ['nombre', 'correo', 'rol', 'password', 'confirmar'];

    campos.forEach(function(id) {
        document.getElementById(id).classList.remove('error');
        document.getElementById('err-' + id).textContent = '';
    });
}

function mostrarError(id, mensaje) {
    document.getElementById(id).classList.add('error');
    document.getElementById('err-' + id).textContent = mensaje;
}

function validarFormulario(nombre, correo, rol, password, confirmar) {
    let esValido = true;

if (correo === '') {
    mostrarError ('correo', 'El correo es obligatorio.');
    esValido = false;
}

else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)){
    mostrarError('correo', 'Ingrese un correo válido.');
    esValido = false;
}

else if (admins.find(function(a) { return a.correo.toLowerCase() === correo.toLowerCase();})) {
    mostrarError('correo', 'El correo ya está registrado.');
    esValido = false;
}

if (rol === '') {
    mostrarError('rol', 'Seleccione un rol.');
    esValido = false;
}

if (password === ''){
    mostrarError('password', 'La contraseña es obligatoria');
    esValido = false;
}

else if (password.length < 8) {
    mostrarError('password', 'La contraseña debe tener al menos 8 caracteres.');
    esValido = false;
}

if (confirmar === '') {
    mostrarError('confirmar', 'Las contraseñas no coinciden');
    esValido = false;
}

return esValido;

}

function limpiarFormulario(){
    document.getElementById('nombre').value     = '';
    document.getElementById('correo').value     = '';
    document.getElementById('rol').value        = '';
    document.getElementById('password').value   = '';
    document.getElementById('confirmar').value  = '';
    limpiarErrores();
}

function guardarAdmin() {
    const nombre    = document.getElementById('nombre').value.trim();
    const correo    = document.getElementById('correo').value.trim();
    const rol       = document.getElementById('rol').value;
    const password  = document.getElementById('password').value;
    const confirmar = document.getElementById('confirmar').value;

    limpiarErrores ();

    if(!validarFormulario(nombre, correo, rol, password, confirmar)){
        return;
    }

    admins.push({
        nombre: nombre,
        correo: correo,
        rol:    rol,
    });

    renderizarTabla();

    limpiarFormulario();

    alert('Administrador "' + nombre + '" registrado correctamente.');
}

function renderizarTabla() {
    const tbody         = document.getElementById('admin-tbody');
    const sinDatos      = document.getElementById('sin-datos');
    const tabla         = document.getElementById('admin-tabla');
    const contadorEl    = document.getElementById('contador');
    
    contadorEl.textContent = admins.length;

    if (admins.length === 0) {
        sinDatos.style.display = 'block';
        tabla.style.display    = 'none';
        return;
    }

    sinDatos.style.display = 'none';
    tabla.style.display = 'table';

    tbody.innerHTML = '';

    admins.forEach(function(admin, indice) {
        const rolTexto = admin.rol === 'GA'
        ? 'Administrador General'
        : 'Administrador de Actividades';

        const fila = document.createElement('tr');
        fila.innerHTML =
        '<td>' + admin.nombre + '</td>' +
        '<td>' + admin.correo + '</td>' +
        '<td>' + rolTexto + '</td>' +
        '<td>' +
        '<button onclick="abrirEdicion(' + indice + ')">Editar</button>' +
        '<button onclick="eliminarAdmin(' + indice + ')">Eliminar</button>' +
        '</td>';

        tbody.appendChild(fila);
    });
}

function eliminarAdmin(indice) {
    const nombre = admins[indice].nombre;

    if (confirm('¿Eliminar a "' + nombre + '"?')) {
        admins.splice(indice, 1);
        renderizarTabla();
    }
}

let IndiceEditando = null;

function abrirEdicion (indice){
    indiceEditando = indice;

    const admin = admins [indice];

    document.getElementById('edit-nombre').value = admin.nombre;
    document.getElementById('edit-correo').value = admin.correo;
    document.getElementById('edit-rol').value = admin.rol;

    document.getElementById('err-edit-nombre').textContent = '';
    document.getElementById('err-edit-rol').textContent = '';
    document.getElementById('edit-nombre').classList.remove('error');
    document.getElementById('edit-rol').classList.remove('remove');

    document.getElementById ('seccion-edicion').style.display = 'block';

    document.getElementById('seccion-edicion').scrollIntoView({ behavior: 'smooth'});
}

function cerrarEdicion() {
    document.getElementById('seccion-edicion').style.display = 'none';

    indiceEditando = null;
}

function guardarEdicion(){
    const nombre = document.getElementById('edit-nombre').value.trim();
    const rol    = document.getElementById('edit-rol').value;

    document.getElementById('err-edit').textContent = '';
    document.getElementById('err-edit-rol').textContent = '';
    document.getElementById('edit-nombre').classList.remove('error');
    document.getElementById('edit-rol').classList.remove('error');

    let esValido = true;

    if (nombre === ''){
        document.getElementById('edit-nombre').classList.add('error');
        document.getElementById('err-edit-nombre').textContent = 'El nombre es obligatorio;
        esValido = false;
    }

    if (rol === ''){
        document.getElementById('edit-rol').classList.add('error');
        document.getElementById('err-edit-rol').textContent = 'Seleccione un rol;
        esValido = false;
    }

    if (!esValido) {
        return;
    }

    admins[IndiceEditando].nombre = nombre;
    admins[IndiceEditando].rol    = rol;

    renderizarTabla();

    cerrarEdicion();

    alert ('Administrador "' +  nombre + '" actualizado correctamente');
}
