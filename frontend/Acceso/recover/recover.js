import { alertDanger, alertSuccess, urlPaginaAnterior, spinner } from "../../js/funciones.js";
document.addEventListener('DOMContentLoaded', iniciarLogin);

function iniciarLogin() {
    document.getElementById('mostrarPassword').addEventListener('click', mostrarPassword);

    /*Selectores*/
    // Obtener el botón del DOM
    let btnClose = document.getElementById('btnClose');
    // Formulario
    const formulario = document.getElementById('miFormulario');
    // Añadir el event listener al botón
    btnClose.addEventListener('click', redirigirInicio);

    formulario.addEventListener('submit', async (e) => {
        e.preventDefault();
        // Obtener todos los campos del formulario
        const camposRecover = [formulario.newPassword, formulario.confirmNewPassword];

        // Limpiar el estilo de error antes de la validación
        camposRecover.forEach(campo => campo.classList.remove('error'));

        let hayErrores = false; //Para saber si tiene el formulario errores antes de pasarlo al backend

        // Validar si los campos están vacíos y aplicar el estilo de error
        camposRecover.forEach(campo => {
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
            //Ahora que ya vamos al backend 
            // Obtener el token de la URL
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');

            if (token) {

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
                document.getElementById("btnRestablecer").style.display = "none";

                const datos = await enviarToken(camposRecover[0].value, camposRecover[1].value, token);
                console.log(datos);

                if (!datos["success"]) {
                    if (typeof datos.error === "string") {
                        // Si error es un string, lo mostramos directamente
                        alertaDiv.appendChild(alertDanger(datos.error));
                    } else if (typeof datos.error === "object") {
                        // Si error es un objeto, obtenemos la primera clave y mostramos el mensaje
                        const key = Object.keys(datos.error)[0]; // "password" o "email"

                        camposRecover.forEach(campo => {
                            if (campo.id === key) {
                                campo.classList.add('error'); // Marca el campo con error
                            }
                        });

                        // Mostrar el mensaje de error
                        alertaDiv.appendChild(alertDanger(datos.error[key]));
                    }
                } else if (datos["success"]) {
                    document.getElementById("btnRestablecer").style.display = "none";
                    alertaDiv.appendChild(alertSuccess(datos["exito"]));

                    // Redirigir al login después de 3 segundos
                    setTimeout(() => {
                        window.location.href = "../login/login.html";
                    }, 3000);
                }

            } else {
                //Si el token es incorrecto
                alertaDiv.appendChild(alertDanger("El enlace de recuperación no es válido o ha expirado. Solicita una nueva recuperación."));
            }
        }

    });

    //Funciones
    function redirigirInicio() {
        // Aqui en este caso redirige al inicio
        let redirectUrl = '../../index.html';
        window.location.href = redirectUrl; // Redirige a la URL almacenada
    }
    //Mostrar contraseñas
    function mostrarPassword() {
        const password = document.querySelector('#newPassword');
        const confirmNewPassword = document.querySelector('#confirmNewPassword');

        if (password.type === "password") {
            password.type = 'text';
            confirmNewPassword.type = 'text';
        } else {
            password.type = 'password';
            confirmNewPassword.type = 'password';

        }
    }
    async function enviarToken(newPassword, confirmPassword, token) {
        const datos = {
            token: token,
            newPassword: newPassword,
            confirmPassword: confirmPassword
        };
        try {
            const response = await fetch("http://localhost:3000/backend/controllers/reset_password.php", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(datos) // Enviamos los datos a php
            });
            const data = await response.json();

            //para evitar generar muchas alertas
            borrarAlerta();

            const alertaDiv = document.getElementById('alertas');

            // Verificamos si ya existe un spinner en el div
            var existingSpinner = alertaDiv.querySelector('.spinner'); // Asegúrate de que '.spinner' es un selector único
            document.getElementById("btnRestablecer").style.display = "block";
            if (existingSpinner) {
                // Si existe, lo eliminamos
                alertaDiv.removeChild(existingSpinner);
            }

            return data;
        } catch (error) {
            console.error("Error al validar el token:", error);
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
    function borrarAlerta() {
        //Por si la base de datos esta caida para que no salgan muchas alertas hago esto se que es poner lo mismo pero si no me salta muchisimas
        const alertaDiv = document.getElementById('alertas');
        const existeAlerta = alertaDiv.querySelector('.alert');
        if (existeAlerta) {
            existeAlerta.remove();
        }
    }
}