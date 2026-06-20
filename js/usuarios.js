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