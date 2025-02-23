import { alertDanger, alertSuccess, urlPaginaAnterior, spinner, getCookie } from "../../js/funciones.js";
const sesionToken = getCookie('sesion_token');
if (sesionToken) {
    window.location.href = "/index.html";
}
document.addEventListener('DOMContentLoaded', iniciarLogin);

function iniciarLogin() {
    document.getElementById('checkbox').addEventListener('click', mostrarPassword);

    //Obtiene la url de la pagina anteriror para cuadno le da a la x volver 
    urlPaginaAnterior('/Acceso/register/register.html');

    /*Selectores*/
    // Obtener el botón del DOM
    let btnClose = document.getElementById('btnClose');

    const formulario = document.getElementById('miFormulario');

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
        const camposRegister = [formulario.email, formulario.usuario, formulario.password, formulario.confirmPassword];

        // Limpiar el estilo de error antes de la validación
        camposRegister.forEach(campo => campo.classList.remove('error'));

        let hayErrores = false; //Para saber si tiene el formulario errores antes de pasarlo al backend

        // Validar si los campos están vacíos y aplicar el estilo de error
        camposRegister.forEach(campo => {
            if (campo.value.trim() === "") {
                campo.classList.add('error');
                hayErrores = true;
            }
        });

        const alertaDiv = document.getElementById('alertas');
        //Para que no genere muchas alertas
        borrarAlerta();

        // Validar campos vacíos
        if (hayErrores) {
            alertaDiv.appendChild(alertDanger("Por favor, completa todos los campos"));
        } else {
            // Verificamos si ya existe un spinner en el div
            var existingSpinner = alertaDiv.querySelector('.spinner'); // Asegúrate de que '.spinner' es un selector único

            if (existingSpinner) {
                // Si existe, lo eliminamos
                alertaDiv.removeChild(existingSpinner);
            }

            // Crear el spinner
            const spinnerElement = spinner(); // Asegúrate de que esta función retorne un elemento HTML válido
            spinnerElement.classList.add('spinner'); // Si no está añadido en la función spinner, añádelo aquí.
            spinnerElement.style.marginTop = '20px';
            spinnerElement.style.marginBottom = '0';

            // Agregar el spinner al div
            alertaDiv.appendChild(spinnerElement);

            // Enviar los datos al backend
            try {
                document.getElementById('crearCuentaBtn').style.display = 'none';

                const datos = await enviarDatos(camposRegister[0].value, camposRegister[1].value, camposRegister[2].value, camposRegister[3].value);

                if (!datos["success"]) {

                    if (typeof datos.error === "string") {
                        // Si error es un string, lo mostramos directamente
                        alertaDiv.appendChild(alertDanger(datos.error));
                    } else if (typeof datos.error === "object") {
                        // Si error es un objeto, obtenemos la primera clave y mostramos el mensaje
                        const key = Object.keys(datos.error)[0]; // "password" o "email"

                        camposRegister.forEach(campo => {
                            if (campo.id === key) {
                                campo.classList.add('error'); // Marca el campo con error
                            }
                        });

                        // Mostrar el mensaje de error
                        alertaDiv.appendChild(alertDanger(datos.error[key]));
                    }

                } else if (datos["success"]) { //Lo compruebo asi sin else por si falla los datos y no hacerlo aunque haya generado error
                    alertaDiv.appendChild(alertSuccess(datos["exito"]));
                    document.getElementById('crearCuentaBtn').style.display = 'none';

                    // Redirigir al login después de 3 segundos
                    setTimeout(() => {
                        window.location.href = "../login/login.html";
                    }, 2000);
                }

            } catch (error) {
                console.error("Error al enviar los datos:", error);
            }
        }
    });
    async function enviarDatos(email, usuario, password, confirmPassword) {
        const datos = {
            email: email,
            usuario: usuario,
            password: password,
            confirmPassword: confirmPassword
        };
        try {
            // Enviar datos usando fetch
            const response = await fetch('http://localhost:3000/backend/controllers/register.php', {
                method: 'POST',
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
            //para evitar generar muchas alertas
            borrarAlerta();

            const alertaDiv = document.getElementById('alertas');
            document.getElementById('crearCuentaBtn').style.display = 'block';

            // Verificamos si ya existe un spinner en el div
            var existingSpinner = alertaDiv.querySelector('.spinner'); // Asegúrate de que '.spinner' es un selector único

            if (existingSpinner) {
                // Si existe, lo eliminamos
                alertaDiv.removeChild(existingSpinner);
            }
            return data;
        } catch (error) {
            console.error('Error al enviar datos:', error);
        }
    }
    function mostrarPassword() {
        const password = document.querySelector('#password');
        const confirmPassword = document.querySelector('#confirmPassword');

        if (password.type === "password") {
            password.type = 'text';
            confirmPassword.type = 'text';

        } else {
            password.type = 'password';
            confirmPassword.type = 'password';
        }
    }
    function borrarAlerta() {
        //Por si la base de datos esta caida para que no salgan muchas alertas hago esto se que es poner lo mismo pero si no me salta muchisimas
        const alertaDiv = document.getElementById('alertas');
        const existeAlerta = alertaDiv.querySelector('.alert');
        if (existeAlerta) {
            existeAlerta.remove();
        }
    }
}
