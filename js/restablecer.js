//Aqui empezamos el codigo ligado a restablecer la contraseña

let correoConfirmado = null;

function solicitarReset() {
    const correo = document.getElementById('correo-reset').ariaValueMax.trim();

    document.getElementById('err-correo-reset').textContent = '';
    document.getElementById('correo-reset').classList.remove('error');
    document.getElementById('msg-confirmacion').style.display = 'none';

    if (correo === '') {
        document.getElementById('correo-reset').classList.add('error');
        document.getElementById('err-correo-reset').textContent = 'El correo es obligatorio.';
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)){
        document.getElementById('correo-reset').classList.add('error');
        document.getElementById('err-correo-reset').textContent = 'Ingrese un correo válido.';
        return;
    }

    const adminEncontrado = admins.find(function(a) {
        return a.correo.toLowerCase() === correo.toLowerCase();
    });

    document.getElementById('msg-confirmacion').style.display = 'block';


    if (adminEncontrado) {
        correoConfirmado = correo;

        setTimeout(function() {
            document.getElementById('paso-correo').style.display            = 'none';
            document.getElementById('paso-nueva-password').style.display    = 'block';
        }, 2000);
    }

}

function guardarNuevaPassword() {
    const nueva         = document.getElementById('nueva-password').value;
    const confirmar     = document.getElementById('confirmar-password').value;

    document.getElementById('err-nueva-password').textContent       = '';
    document.getElementById('err-confirmar-password').textContent   = '';
    document.getElementById('nueva-password').classList.remove('error');
    document.getElementById('confirmar-password').classList.remove('error');

    let esValido = true;

    if (nueva === '') {
        document.getElementById('nueva-password').classList.add('error');
        document.getElementById('err-nueva-password').textContent = 'La contraseña es obligatoria.';
        esValido = false;
    }

    else if (nueva.length < 8) {
        document.getElementById('nueva-password').classList.add('error');
        document.getElementById('err-nueva-password').textContent = 'La contraseña es invalida';
        esValido = false;
    }

    if (confirmar === '') {
        document.getElementById('confirmar-password').classList.add('error');
        document.getElementById('err-confirmar-password').textContent = 'Confirme la contraseña.';
        esValido = false;
    }

    else if (nueva !== confirmar) {
        document.getElementById('confirmar-password').classList.add('error');
        document.getElementById('err-confirmar-password').textContent = 'Las contraseñas no coinciden';
        esValido = false;
    }

    if (!esValido) return;

    const indice = admins.findIndex(function (a) {
        return a.correo.toLowerCase() === correoConfirmado.toLowerCase();
    });

    if (indice !== -1) {
        admins[indice].password = nueva;
    }

    alert ('Contraseña actualizada correctamente. Inicie sesión con su nueva contraseña');
    window.location.href = 'login.html';
}