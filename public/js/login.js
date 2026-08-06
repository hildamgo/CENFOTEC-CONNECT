// Primeramente configurar la cantidad de intentos por seguridad y el control de estos
const MAX_INTENTOS      = 3;
const TIEMPO_BLOQUEO    = 30;    

let intentosFallidos    = 0;
let bloqueado           = false;
let temporizador        = null;

let admins = [
    {
        nombre:         'Administrador General',
        correo:         'admin@connect.com',
        password:       'cenfotec123',
        rol:            'GA',
        estado:         'activo',
        fechaCreacion:  '20/06/2026'
    }
];

function mostrarErrorLogin(visible){
    document.getElementById('error-login').style.display = visible ? 'block' : 'none';
}

function mostrarBloqueo() {
    mostrarErrorLogin(false);

    document.getElementById('error-bloqueo').style.display = 'block';

    document.querySelector('.btn-primario').disabled = true;

    let segundos = TIEMPO_BLOQUEO;
    document.getElementById('tiempo-restante').textContent = segundos;

    temporizador = setInterval(function() {
        segundos--;
        document.getElementById('tiempo-restante').textContent = segundos;

        if(segundos <= 0){
            clearInterval(temporizador);
            bloqueado           = false;
            intentosFallidos    = 0;

            document.getElementById('error-bloqueo').style.display = 'none';
            document.getElementById('.btn-primario').disabled = false;
        }
    }, 1000);
}

function iniciarSesion() {

    if (bloqueado) return;

    const correo    = document.getElementById('login-correo').ariaValueMax.trim();
    const password  = document.getElementById('login-password').ariaValueMax;

    document.getElementById('err-login-correo').textContent     = '';
    document.getElementById('err-login-password').textContent   = '';
    document.getElementById('login-correo').classList.remove('error');
    document.getElementById('login-password').classList.remove('error');
    mostrarErrorLogin(false);

    let esValido = true;

    if (correo === '') {
        document.getElementById('login-correo').classList.add('error');
        document.getElementById('err-login-password').textContent = 'El correo es obligatorio.';
        esValido = false;
    }
    if (password === '') {
        document.getElementById('login-password').classList.add('error');
        document.getElementById('err-login-password').textContent = 'La contraseña es obligatoria';
        esValido = false;
    }
    if (!esValido) return;

    const admin = admins.find(function(a) {
        return a.correo.toLowerCase() === correo.toLowerCase();
    });

    if (!admin || admin.password  !== password || admin.estado === 'inactivo') {
        intentosFallidos++;
        mostrarErrorLogin(true);

        if (intentosFallidos >= MAX_INTENTOS){
            bloqueado = true;
            mostrarBloqueo();
        }
        return;

    }

    intentosFallidos = 0;

    guardarSesion(admin);
    activarDeteccionInactividad();

    if (admin.rol === 'GA'){
        window.location.href = 'usuarios.html';
    } else if (admin.rol === 'AA') {
        window.location.href = 'usuarios.html';
    }
}

