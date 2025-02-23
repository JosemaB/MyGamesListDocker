import { alertDanger, alertSuccess, urlPaginaAnterior, spinner, getCookie } from "../../js/funciones.js";
import { guardarCambiosStorage } from "../../js/guardian.js";
const sesionToken = getCookie('sesion_token');
if (sesionToken) {
    window.location.href = "/index.html";
}
document.addEventListener('DOMContentLoaded', iniciarLogin);

async function iniciarLogin() {

    //Selectores
    document.getElementById('checkbox').addEventListener('click', mostrarPassword);

    //Obtiene la url de la pagina anteriror para cuando le da a la x volver 
    urlPaginaAnterior('/Acceso/login/login.html');

    /*Selectores*/
    // Obtener el botón del DOM
    let btnClose = document.getElementById('btnClose');

    // Selecciona el formulario por su ID
    const formulario = document.getElementById('miFormulario');

    //formulario modal
    const formularioModal = document.getElementById('formModal');
    // Añadir el event listener al botón
    btnClose.addEventListener('click', redirigirPaginaAnterior);

    // Función que se ejecuta al hacer clic en el botón
    function redirigirPaginaAnterior() {
        // Recuperar la URL de redirección almacenada
        let redirectUrl = localStorage.getItem('redirectUrl') || '../../index.html';
        window.location.href = redirectUrl; // Redirige a la URL almacenada
    }

    formulario.addEventListener('submit', async (e) => {
        // Evita que el formulario se envíe de manera predeterminada
        e.preventDefault();

        // Obtener todos los campos del formulario
        const camposLogin = [formulario.email, formulario.password];

        // Limpiar el estilo de error antes de la validación
        camposLogin.forEach(campo => campo.classList.remove('error'));

        let hayErrores = false; //Para saber si tiene el formulario errores antes de pasarlo al backend
        // Validar si los campos están vacíos y aplicar el estilo de error
        camposLogin.forEach(campo => {
            if (campo.value.trim() === "") {
                campo.classList.add('error');
                hayErrores = true;
            }
        });

        const alertaDiv = document.getElementById('alertas');
        //Para que no genere muchas alertas
        borrarAlertaForm();

        // Validar campos vacíos
        if (hayErrores) {
            alertaDiv.appendChild(alertDanger("El correo y la contraseña son obligatorios"));
        } else {
            // Verificamos si ya existe un spinner en el div
            var existingSpinner = alertaDiv.querySelector('.spinner'); // Asegúrate de que '.spinner' es un selector único

            if (existingSpinner) {
                // Si existe, lo eliminamos
                alertaDiv.removeChild(existingSpinner);
            }
            //Agregamos el spinner para el tiempo de espera
            const spinnerElement = spinner();
            spinnerElement.style.marginTop = '20px';
            spinnerElement.style.marginBottom = '0';
            document.getElementById("btnIniciatSesion").style.display = "none";
            alertaDiv.appendChild(spinnerElement);
            //Ahora pasamos los datos al backend
            try {
                const datos = await enviarDatosForm(camposLogin[0].value.trim(), camposLogin[1].value.trim());
                //El spinnerl o borramos dentro del awwait se que puede ser confuso pero si manda muchas peiticiones le usuario 
                // con la base de datos caida hay un bug potente de muchos spinner
                if (!datos["success"]) {
                    document.getElementById("btnIniciatSesion").style.display = "block";
                    // Verificamos si ya existe un spinner en el div
                    var existingSpinner = alertaDiv.querySelector('.spinner'); // Asegúrate de que '.spinner' es un selector único

                    if (existingSpinner) {
                        // Si existe, lo eliminamos
                        alertaDiv.removeChild(existingSpinner);
                    }

                    camposLogin.forEach(campo => {
                        campo.classList.add('error');
                    });
                    alertaDiv.appendChild(alertDanger(datos["error"]));
                } else if (datos["success"]) { //Lo compruebo asi sin else por si falla los datos y no hacerlo aunque haya generado error
                    //No meto ningun div de exito aunque lo envie en el backend porque se incia sesion mas rapido en el register lo veo un poco 
                    //mas logico esperar por si quiere hacer otra cosa

                    await guardarCambiosStorage();
                    window.location.href = "/Perfiles/perfil/perfil.html";
                }
            } catch (error) {
                console.error("Error al enviar los datos:", error);
            }
        }


    });

    formularioModal.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = formularioModal.emailModal;
        //Para eliminar el focus cuando se envia el boton submit por si acaso
        email.classList.remove('error');
        let error = false;
        if (email.value.trim() === "") {
            email.classList.add('error');
            error = true;
        }
        const alertaDiv = document.getElementById('alertasModal');
        const existeAlerta = alertaDiv.querySelector('.alert');
        if (existeAlerta) {
            existeAlerta.remove();
        }

        // Validar campos vacíos
        if (error) {
            alertaDiv.appendChild(alertDanger("Por favor, ingresa tu correo electrónico"));
        } else {
            // Verificamos si ya existe un spinner en el div
            var existingSpinner = alertaDiv.querySelector('.spinner'); // Asegúrate de que '.spinner' es un selector único

            if (existingSpinner) {
                // Si existe, lo eliminamos
                alertaDiv.removeChild(existingSpinner);
            }
            //Spinner
            const spinnerElement = spinner();
            spinnerElement.style.marginTop = '30px';
            spinnerElement.style.marginBottom = '10px';
            alertaDiv.appendChild(spinnerElement);
            document.getElementById("btnRecuperar").style.display = "none";

            try {
                const datos = await envidarDatosFormModal(email.value);

                if (!datos["success"]) {
                    alertaDiv.appendChild(alertDanger(datos["error"]));
                } else if (datos["success"]) {
                    document.getElementById("btnRecuperar").style.display = "none";
                    alertaDiv.appendChild(alertSuccess(datos["exito"]));
                }
            } catch (error) {
                console.error("Error al enviar los datos:", error);
            }
        }

    });
    closeBtn.addEventListener('click', (e) => {
        const alertaDiv = document.getElementById('alertasModal');
        document.getElementById("btnRecuperar").style.display = "block";
        document.getElementById("emailModal").value = "";

        // Verificamos si ya existe un spinner en el div
        var existingSpinner = alertaDiv.querySelector('.spinner'); // Asegúrate de que '.spinner' es un selector único

        if (existingSpinner) {
            // Si existe, lo eliminamos
            alertaDiv.removeChild(existingSpinner);
        }
        const existeAlerta = alertaDiv.querySelector('.alert');
        if (existeAlerta) {
            formularioModal.emailModal.classList.remove('error');
            existeAlerta.remove();
        }
    });

    async function enviarDatosForm(email, password) {
        const datos = {
            email: email,
            password: password
        };
        try {
            // Enviar datos usando fetch
            const response = await fetch('http://localhost:3000/backend/controllers/auth.php', {
                method: 'POST',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos) // Enviamos los datos como JSON
            });

            // Verificamos si la respuesta es correcta
            if (!response.ok) {
                throw new Error('Error en la respuesta de PHP');
            }

            // Convertimos la respuesta en JSON
            const data = await response.json();

            const alertaDiv = document.getElementById('alertas');

            //Por si la base de datos esta caida para que no salgan muchas alertas hago esto se que es poner lo mismo pero si no me salta muchisimas
            borrarAlertaForm();
            return data;

        } catch (error) {
            console.error('Error al enviar datos:', error);
        }
    }
    function mostrarPassword() {
        const password = document.querySelector('#password');
        if (password.type === "password") {
            password.type = 'text';
        } else {
            password.type = 'password';
        }
    }
    async function envidarDatosFormModal(email) {
        try {
            const datos = {
                email: email,
            };
            // Enviar datos usando fetch
            const response = await fetch('http://localhost:3000/backend/controllers/recover.php', {
                method: 'POST',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(datos) // Enviamos los datos como JSON
            });

            // Verificamos si la respuesta es correcta
            if (!response.ok) {
                throw new Error('Error en la respuesta de PHP');
            }

            // Convertimos la respuesta en JSON
            const data = await response.json();

            //Para eliminar las alertas de modal por si await tarda mucho
            const alertaDiv = document.getElementById('alertasModal');
            // Verificamos si ya existe un spinner en el div
            var existingSpinner = alertaDiv.querySelector('.spinner'); // Asegúrate de que '.spinner' es un selector único
            document.getElementById("btnRecuperar").style.display = "block";
            if (existingSpinner) {
                // Si existe, lo eliminamos
                alertaDiv.removeChild(existingSpinner);
            }
            const existeAlerta = alertaDiv.querySelector('.alert');

            if (existeAlerta) {
                existeAlerta.remove();
            }
            return data;

        } catch (error) {
            console.error('Error al enviar datos:', error);
        }
    }
    function borrarAlertaForm() {
        //Por si la base de datos esta caida para que no salgan muchas alertas hago esto se que es poner lo mismo pero si no me salta muchisimas
        const alertaDiv = document.getElementById('alertas');
        const existeAlerta = alertaDiv.querySelector('.alert');
        if (existeAlerta) {
            existeAlerta.remove();
        }
    }

    // Espera a que Google cargue y luego ejecuta la inicialización /*Para que funcione el boton de google*/
    waitForGoogle(initializeGoogleSignIn);

    function waitForGoogle(callback) {
        const interval = setInterval(() => {
            if (window.google && window.google.accounts) {
                clearInterval(interval);
                callback();
            }
        }, 100); // Verifica cada 100ms si Google está disponible
    }
    // Función para inicializar el Google Sign-In
    function initializeGoogleSignIn() {
        try {
            // Inicializa el botón de Google Sign-In
            google.accounts.id.initialize({
                client_id: '963691276350-ef15a1a1lde4c0lhchr6kn3lr005rmm9.apps.googleusercontent.com', // Usa tu client_id de Google
                callback: handleCredentialResponse // Asigna el callback aquí
            });

            // Renderiza el botón de Google Sign-In en el HTML
            google.accounts.id.renderButton(
                document.querySelector(".g_id_signin"), // Selecciona el contenedor del botón
                {
                    theme: "dark", // Estilo oscuro
                    size: "large" // Tamaño grande
                }
            );
        } catch (error) {
            console.error('Error al enviar datos:', error);
        }
    }

    // Esta función se ejecutará cuando el usuario se autentique
    async function handleCredentialResponse(googleUser) {
        try {
            //Aqui sera el submit al backend
            const tokens = googleUser.credential.split(".");
            const responsePayload = JSON.parse(atob(tokens[1]));
            // Crear un objeto con los datos del usuario
            const datos = {
                google_id: responsePayload.sub,
                full_name: responsePayload.name,
                given_name: responsePayload.given_name,
                family_name: responsePayload.family_name,
                image_url: responsePayload.picture,
                email: responsePayload.email
            };
            // Enviar datos usando fetch
            const response = await fetch('http://localhost:3000/backend/controllers/auth_google.php', {
                method: 'POST',
                credentials: "include",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(datos) // Enviamos los datos como JSON
            });
            // Verificamos si la respuesta es correcta
            if (!response.ok) {
                throw new Error('Error en la respuesta de PHP');
            }
            const alertaDiv = document.getElementById('alertas');
            const existeAlerta = alertaDiv.querySelector('.alert');
            if (existeAlerta) {
                existeAlerta.remove();
            }
            // Convertimos la respuesta en JSON
            const data = await response.json();


            //Mensajes en caso de error que es casi imposible sin tenemos internet bien y todo configurado
            if (!data["success"]) {
                alertaDiv.appendChild(alertDanger(data["error"]));
            } else if (data["success"]) {
                //Lo mandariamos a su perfil en caso aqui porque no lo tenemos creado
                window.location.href = "/index.html";
            }
        } catch (error) {
            console.error('Error al enviar datos:', error);
        }
    }


}






