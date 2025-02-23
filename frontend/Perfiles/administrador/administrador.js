import { cerrarSesion } from '../../js/guardian.js';
import { borrarResena, sinResultadoMensaje, limpiarHTML, getCookie, ocultarBotones, mostrarBotones, alertDanger, alertSuccess, mostrarToast, borrarAlerta, borrarSpinner, spinner, sinResultado, cardMensajeError } from '../../js/funciones.js';

const usuarioData = JSON.parse(localStorage.getItem("usuarioData"));
const sesionToken = getCookie('sesion_token');
if (!sesionToken || usuarioData.rol !== "Administrador") {
    window.location.href = "/index.html";
}

document.addEventListener('DOMContentLoaded', iniciarAdministradir);

async function iniciarAdministradir() {

    /*Selectores resultado */
    const divtotalUsuariosResultado = document.getElementById('totalUsuariosResultado');
    const divtotalListasResultado = document.getElementById('totalListasResultado');
    const divtotalResenasResultado = document.getElementById('totalResenasResultado');


    /*Selectores input */
    const inputBuscarUsuario = document.getElementById('inputBuscarUsuario');
    const inputBuscarListas = document.getElementById('inputBuscarListas');
    const inputBuscarResenas = document.getElementById('inputBuscarResenas');

    /*Cargamos los datos */
    const informeGeneral = await obtenerInformeGeneral();
    
    const datosUsuarios = informeGeneral.data.usuarios;
    const datosListas = informeGeneral.data.listas;
    const datosResenas = informeGeneral.data.resenas;

    mostrarUsuarios(datosUsuarios);
    mostrarListas(datosListas)
    mostrarResenasUsuario(datosResenas);
    document.querySelector('main').style.display = 'block';
    console.log(informeGeneral);

    /*Cerrar sesion desde admin*/
    document.getElementById('cerrarSesionMovil').addEventListener('click', cerrarSesion);
    document.getElementById('cerrarSesionEscritorio').addEventListener('click', cerrarSesion);
    /*Cargamos el navbar para que se sincronice */
    navbarSincronizado();
    cargarDatosGrafico(datosUsuarios.length, datosListas.length, datosResenas.length);

    async function obtenerInformeGeneral() {
        const response = await fetch('http://localhost:3000/backend/helpers/adminHelpers/getInformeGlobal.php', {
            method: 'POST',
            credentials: "include",
            headers: {
                'Content-Type': 'application/json'
            },
        });
        // Verificamos si la respuesta es correcta
        if (!response.ok) {
            throw new Error('Error en la respuesta de PHP');
        }

        // Convertimos la respuesta en JSON
        const data = await response.json();
        return data;
    }
    /*Prevenimos los enters */
    document.getElementById("formBuscarUsuario").addEventListener("submit", function (event) {
        event.preventDefault(); // Evita que el formulario se envíe y recargue la página
    });
    document.getElementById("formBuscarListas").addEventListener("submit", function (event) {
        event.preventDefault(); // Evita que el formulario se envíe y recargue la página
    });
    document.getElementById("formBuscarResenas").addEventListener("submit", function (event) {
        event.preventDefault(); // Evita que el formulario se envíe y recargue la página
    });
    /*Home */
    function cargarDatosGrafico(totalUsuarios, totalListas, totalReseñas) {
        // Configuración del gráfico de barras
        const barCtx = document.getElementById('barChart')?.getContext('2d');

        const barChart = new Chart(barCtx, {
            type: 'bar',
            data: {
                labels: ['Usuarios', 'Listas', 'Reseñas'],
                datasets: [{
                    label: 'Total',
                    data: [totalUsuarios, totalListas, totalReseñas], // Usa las variables aquí
                    backgroundColor: [
                        'rgba(75, 192, 192, 0.5)',
                        'rgba(54, 163, 235, 0.5)',
                        'rgba(153, 102, 255, 0.5)',
                    ],
                    borderColor: [
                        'rgb(75, 192, 192)',
                        'rgb(54, 162, 235)',
                        'rgb(153, 102, 255)',
                    ],
                    borderWidth: 1,
                }]
            },
            options: {
                responsive: true, // Se ajusta automáticamente
                maintainAspectRatio: false, // Evita distorsión en el tamaño
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    function navbarSincronizado() {
        // Selecciona todos los botones de navegación en ambos menús
        const navButtonsDesktop = document.querySelectorAll('.sidebar .nav-link');
        const navButtonsMobile = document.querySelectorAll('#offcanvasSidebar .nav-link');

        // Función para sincronizar el estado activo
        function syncActiveTab(clickedButton, buttons) {
            buttons.forEach(button => {
                if (button.getAttribute('aria-controls') === clickedButton.getAttribute('aria-controls')) {
                    button.classList.add('active');
                    button.setAttribute('aria-selected', 'true');
                } else {
                    button.classList.remove('active');
                    button.setAttribute('aria-selected', 'false');
                }
            });
        }

        // Añade event listeners a los botones del menú de escritorio
        navButtonsDesktop.forEach(button => {
            button.addEventListener('click', function () {
                syncActiveTab(button, navButtonsMobile);
            });
        });

        // Añade event listeners a los botones del menú móvil
        navButtonsMobile.forEach(button => {
            button.addEventListener('click', function () {
                syncActiveTab(button, navButtonsDesktop);
            });
        });
    }

    /* Usuarios */
    function mostrarUsuarios(datosUsuarios) {
        let usuariostotales = datosUsuarios.length;
        if (datosUsuarios.some(usuario => usuario.id_usuario === usuarioData.id)) {
            usuariostotales -= 1;
        }
        if (usuariostotales === 0) {
            divtotalUsuariosResultado.appendChild(sinResultadoMensaje('No se han encontrado usuarios registrados'));
        } else {
            const fragment = document.createDocumentFragment(); // Crear el fragmento
            datosUsuarios.forEach(usuario => {
                if (usuarioData.id !== usuario.id_usuario) {
                    // Crear el contenedor principal
                    const card = document.createElement('div');
                    card.classList.add('card', 'cardUsuario', 'col-12', 'my-1');
                    card.id = `cardUsuario-${usuario.id_usuario}`;
                    // Crear el cuerpo de la tarjeta
                    const cardBody = document.createElement('div');
                    cardBody.classList.add('card-body');

                    // Crear el contenedor para la flexbox
                    const flexContainer = document.createElement('div');
                    flexContainer.classList.add('d-flex', 'justify-content-between', 'align-items-center');

                    // Crear la sección de imagen y nombre de usuario
                    const userInfo = document.createElement('div');
                    userInfo.classList.add('d-flex', 'align-items-center', 'justify-content-center');

                    // Crear el enlace y la imagen de usuario
                    const userLink = document.createElement('a');
                    userLink.href = `/Perfiles/usuario/usuario.html?id=${usuario.id_usuario}`;
                    const userImage = document.createElement('img');
                    userImage.src = usuario.avatar;
                    userImage.classList.add('img-fluid');
                    userImage.alt = `Imagen de ${usuario.nombre_usuario}`;
                    userLink.appendChild(userImage);

                    // Crear el nombre de usuario
                    const userName = document.createElement('span');
                    userName.classList.add('nombre-usuario', 'ms-2', 'fw-bold');
                    userName.textContent = usuario.nombre_usuario;

                    // Añadir la imagen y nombre de usuario al contenedor
                    userInfo.appendChild(userLink);
                    userInfo.appendChild(userName);

                    // Crear la sección del dropdown
                    const dropdown = document.createElement('div');
                    dropdown.classList.add('dropdown');

                    // Crear el botón para abrir el menú
                    const dropdownButton = document.createElement('button');
                    dropdownButton.classList.add('text-center', 'btn');
                    dropdownButton.type = 'button';
                    dropdownButton.setAttribute('data-bs-toggle', 'dropdown');
                    dropdownButton.setAttribute('aria-expanded', 'false');
                    dropdownButton.innerHTML = '<span class="text-light fs-4 fw-bold">⋮</span>';

                    // Crear el menú desplegable
                    const dropdownMenu = document.createElement('ul');
                    dropdownMenu.classList.add('dropdown-menu', 'dropdown-menu-dark');

                    // Crear las opciones del menú
                    const renameOption = document.createElement('li');
                    const renameLink = document.createElement('a');
                    renameLink.classList.add('dropdown-item');
                    renameLink.href = '#';
                    renameLink.textContent = 'Renombrar usuario';

                    // Asignar los manejadores de click para el "subir el rango"
                    renameLink.addEventListener("click", function (event) {
                        event.preventDefault();  // Evitar la acción predeterminada del enlace
                        document.getElementById('newUsuarioName').value = usuario.nombre_usuario;
                        const alerta = document.getElementById('alertasRenameUsuario');
                        borrarAlerta(alerta);
                        borrarSpinner(alerta);
                        mostrarBotones('#renameUsuarioModal');

                        // Aquí puedes agregar la lógica para renombrar la lista
                        const cardId = card.id; // Obtener el ID de la tarjeta

                        // Mostramos el modal de rename lista
                        const renameUsuarioModal = new bootstrap.Modal(document.getElementById('renameUsuarioModal'));
                        renameUsuarioModal.show();

                        // Lógica cuando se confirma la eliminación
                        const confirmRenameUsuarioButton = document.getElementById('confirmRenameUsuarioButton');

                        confirmRenameUsuarioButton.onclick = async function () {
                            ocultarBotones('#renameUsuarioModal');
                            borrarAlerta(alerta);
                            const spinnerElement = spinner();
                            spinnerElement.style.marginTop = '20px';
                            spinnerElement.style.marginLeft = 'auto';
                            spinnerElement.style.marginRight = 'auto';
                            alerta.appendChild(spinnerElement);
                            const nombreNuevo = document.getElementById('newUsuarioName').value;

                            //Llamamos a la funcion de cambiar nombre
                            const data = await renameUsuario(cardId.split('-')[1], nombreNuevo);

                            borrarSpinner(alerta);

                            if (!data["success"]) {
                                mostrarBotones('#renameUsuarioModal');
                                // Si error es un string, lo mostramos directamente
                                alerta.appendChild(alertDanger(data.error));
                            } else if (data["success"]) {
                                mostrarToast(data.exito, 'success');
                                userName.textContent = nombreNuevo;
                                renameUsuarioModal.hide();
                            }
                        }
                    });

                    renameOption.appendChild(renameLink);

                    dropdownMenu.appendChild(renameOption);
                    if (usuario.id_rol === 1) {
                        // Crear la opción del menú para "Subir rango"
                        const rankOption = document.createElement('li');
                        const rankLink = document.createElement('a');
                        rankLink.classList.add('dropdown-item');
                        rankLink.href = '#';
                        rankLink.textContent = 'Subir rango';

                        rankOption.appendChild(rankLink);
                        dropdownMenu.appendChild(rankOption);
                        // Asignar los manejadores de click para el "subir el rango"
                        rankOption.addEventListener("click", function (event) {
                            event.preventDefault();  // Evitar la acción predeterminada del enlace
                            const alerta = document.getElementById('alertaConfirmSubirUsuario');
                            borrarAlerta(alerta);
                            borrarSpinner(alerta);
                            mostrarBotones('#subirRangoModal');

                            // Aquí puedes agregar la lógica para renombrar la lista
                            const cardId = card.id; // Obtener el ID de la tarjeta

                            // Mostramos el modal de rename lista
                            const subirRangoModal = new bootstrap.Modal(document.getElementById('subirRangoModal'));
                            subirRangoModal.show();

                            // Lógica cuando se confirma la eliminación
                            const confirmarSubirUsuarioBTN = document.getElementById('confirmarSubirUsuarioBTN');

                            confirmarSubirUsuarioBTN.onclick = async function () {
                                borrarAlerta(alerta);


                                const spinnerElement = spinner();
                                spinnerElement.style.marginTop = '20px';
                                spinnerElement.style.marginLeft = 'auto';
                                spinnerElement.style.marginRight = 'auto';
                                alerta.appendChild(spinnerElement);

                                ocultarBotones('#subirRangoModal');

                                //Llamamos a la funcion de cambiar nombre
                                const data = await subirRangoUsuario(cardId.split('-')[1]);

                                borrarSpinner(alerta);

                                if (!data["success"]) {
                                    // Si error es un string, lo mostramos directamente
                                    alerta.appendChild(alertDanger(data.error));
                                } else if (data["success"]) {
                                    alerta.appendChild(alertSuccess(data.exito));
                                }
                            }
                        });

                    } else {
                        // Crear la opción del menú para "Bajar rango"
                        const rankOption = document.createElement('li');
                        const rankLink = document.createElement('a');
                        rankLink.classList.add('dropdown-item');
                        rankLink.href = '#';
                        rankLink.textContent = 'Bajar rango';

                        rankOption.appendChild(rankLink);
                        dropdownMenu.appendChild(rankOption);

                        // Asignar los manejadores de click para el "bajar el rango"
                        rankOption.addEventListener("click", function (event) {
                            event.preventDefault();  // Evitar la acción predeterminada del enlace
                            const alerta = document.getElementById('alertaConfirmBajarUsuario');
                            borrarAlerta(alerta);
                            borrarSpinner(alerta);
                            mostrarBotones('#bajarRangoModal');

                            // Aquí puedes agregar la lógica para renombrar la lista
                            const cardId = card.id; // Obtener el ID de la tarjeta

                            // Mostramos el modal de rename lista
                            const bajarRangoModal = new bootstrap.Modal(document.getElementById('bajarRangoModal'));
                            bajarRangoModal.show();

                            // Lógica cuando se confirma la eliminación
                            const confirmarBajarUsuarioBTN = document.getElementById('confirmarBajarUsuarioBTN');

                            confirmarBajarUsuarioBTN.onclick = async function () {
                                borrarAlerta(alerta);
                                const spinnerElement = spinner();
                                spinnerElement.style.marginTop = '20px';
                                spinnerElement.style.marginLeft = 'auto';
                                spinnerElement.style.marginRight = 'auto';
                                alerta.appendChild(spinnerElement);

                                ocultarBotones('#bajarRangoModal');

                                //Llamamos a la funcion de cambiar nombre
                                const data = await bajarRangoUsuario(cardId.split('-')[1]);

                                borrarSpinner(alerta);

                                if (!data["success"]) {
                                    alerta.appendChild(alertDanger(data.error));
                                } else if (data["success"]) {
                                    alerta.appendChild(alertSuccess(data.exito));
                                }
                            }
                        });
                    }

                    const deleteOption = document.createElement('li');
                    const deleteLink = document.createElement('a');
                    deleteLink.classList.add('dropdown-item');
                    deleteLink.href = '#';
                    deleteLink.textContent = 'Eliminar usuario';
                    deleteOption.appendChild(deleteLink);
                    dropdownMenu.appendChild(deleteOption);

                    // Eliminar usuario
                    deleteLink.addEventListener("click", function (event) {
                        event.preventDefault();  // Evitar la acción predeterminada del enlace
                        const alerta = document.getElementById('alertaDeleteUsuario');
                        borrarAlerta(alerta);
                        borrarSpinner(alerta);
                        mostrarBotones('#deleteUsuarioModal');

                        // Aquí puedes agregar la lógica para renombrar la lista
                        const cardId = card.id; // Obtener el ID de la tarjeta

                        // Mostramos el modal de rename lista
                        const deleteUsuarioModal = new bootstrap.Modal(document.getElementById('deleteUsuarioModal'));
                        deleteUsuarioModal.show();

                        // Lógica cuando se confirma la eliminación
                        const eliminarUsuarioBTN = document.getElementById('eliminarUsuarioBTN');

                        eliminarUsuarioBTN.onclick = async function () {
                            ocultarBotones('#deleteUsuarioModal');
                            borrarAlerta(alerta);
                            const spinnerElement = spinner();
                            spinnerElement.style.marginTop = '10px';
                            spinnerElement.style.marginLeft = 'auto';
                            spinnerElement.style.marginRight = 'auto';
                            alerta.appendChild(spinnerElement);

                            //Llamamos a la funcion de cambiar nombre
                            const data = await deleteUsuario(cardId.split('-')[1]);

                            borrarSpinner(alerta);

                            if (!data["success"]) {
                                mostrarBotones('#deleteUsuarioModal');
                                // Si error es un string, lo mostramos directamente
                                alerta.appendChild(alertDanger(data.error));
                            } else if (data["success"]) {
                                mostrarToast(data.exito, 'success');
                                deleteUsuarioModal.hide();
                                card.remove();
                            }
                        }
                    });
                    // Añadir el botón y el menú al contenedor del dropdown
                    dropdown.appendChild(dropdownButton);
                    dropdown.appendChild(dropdownMenu);

                    // Añadir todo a la flexbox
                    flexContainer.appendChild(userInfo);
                    flexContainer.appendChild(dropdown);

                    // Añadir el párrafo y la flexbox al cuerpo de la tarjeta

                    if (usuario.id_rol === 2) {
                        // Crear el párrafo con la clase 'card-text administrador'
                        const adminText = document.createElement('p');
                        adminText.classList.add('card-text', 'administrador');
                        adminText.textContent = 'Administrador';
                        cardBody.appendChild(adminText);
                    }
                    cardBody.appendChild(flexContainer);

                    // Añadir el cuerpo de la tarjeta al contenedor principal
                    card.appendChild(cardBody);

                    // Finalmente, añadir la tarjeta al documento (por ejemplo, al body)
                    fragment.appendChild(card);
                }
            });
            divtotalUsuariosResultado.appendChild(fragment);

        }
    }
    async function renameUsuario(idUsuario, nombreUsuario) {
        const datos = {
            idUsuario: idUsuario,
            nombreUsuario: nombreUsuario
        }
        const response = await fetch('http://localhost:3000/backend/controllers/controllerAdmin/renameUsuario.php', {
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
        return data;
    }
    async function deleteUsuario(idUsuario) {
        const datos = {
            idUsuario: idUsuario
        }
        const response = await fetch('http://localhost:3000/backend/controllers/controllerAdmin/eliminarUsuario.php', {
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
        return data;
    }
    async function bajarRangoUsuario(idUsuario) {
        const datos = {
            idUsuario: idUsuario
        }
        const response = await fetch('http://localhost:3000/backend/controllers/controllerAdmin/bajarRango.php', {
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
        return data;
    }
    async function subirRangoUsuario(idUsuario) {
        const datos = {
            idUsuario: idUsuario
        }
        const response = await fetch('http://localhost:3000/backend/controllers/controllerAdmin/subirRango.php', {
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
        return data;
    }
    async function obtenerUsuariosPorNombre(nombreUsuario) {
        const datos = {
            nombreUsuario: nombreUsuario
        }
        const response = await fetch('http://localhost:3000/backend/helpers/adminHelpers/getUsuariosPorNombre.php', {
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
        return data;
    }
    // Añadir un event listener usuario para el evento 'input'
    inputBuscarUsuario?.addEventListener('input', () => {
        // Si ya hay un intervalo en ejecución, lo detenemos
        clearInterval(inputBuscarUsuario.intervalId);

        // Iniciar un nuevo intervalo de 500ms
        inputBuscarUsuario.intervalId = setInterval(async (e) => {

            if (inputBuscarUsuario.value) {
                limpiarHTML(divtotalUsuariosResultado);
                const spinnerElement = spinner();
                spinnerElement.style.margin = 'auto';
                spinnerElement.style.marginTop = '20px';
                divtotalUsuariosResultado.appendChild(spinnerElement);
                /*Enviamos al backend y nos mostrara un resultado de usuarios */
                const datosUsuarioporNombre = await obtenerUsuariosPorNombre(inputBuscarUsuario.value);
                borrarSpinner(divtotalUsuariosResultado);
                if (datosUsuarioporNombre.success) {
                    if (datosUsuarioporNombre.usuarios.length > 0) {
                        mostrarUsuarios(datosUsuarioporNombre.usuarios);
                    } else {
                        divtotalUsuariosResultado.appendChild(sinResultado());
                    }
                } else {
                    cardMensajeError('Ups... parece que tenemos un problema técnico. Inténtalo de nuevo más tarde', divtotalUsuariosResultado);
                }

            } else {
                limpiarHTML(divtotalUsuariosResultado);
                const spinnerElement = spinner();
                spinnerElement.style.margin = 'auto';
                spinnerElement.style.marginTop = '20px';
                divtotalUsuariosResultado.appendChild(spinnerElement);
                const informeGeneral = await obtenerInformeGeneral();
                borrarSpinner(divtotalUsuariosResultado);
                const datosUsuarios = informeGeneral.data.usuarios;
                mostrarUsuarios(datosUsuarios);
            }
        }, 500);

        // Resetear el temporizador para detectar cuando el usuario deja de escribir
        clearTimeout(inputBuscarUsuario.typingTimer);
        inputBuscarUsuario.typingTimer = setTimeout(() => {
            clearInterval(inputBuscarUsuario.intervalId);
        }, 500);
    });

    /* Listas */
    function mostrarListas(listasDeJuegos) {

        const divListas = document.getElementById('totalListasResultado');
        if (listasDeJuegos.length == 0) {
            divListas.appendChild(sinResultadoMensaje('No se han encontrado listas registradas'));

        } else {
            const fragment = document.createDocumentFragment(); // Crear el fragmento
            listasDeJuegos.forEach(lista => {
                const card = document.createElement("div");
                card.className = "card col-12 my-1 cardListaModalJuego";
                card.id = `cardLista-${lista["id_lista"]}`;

                const cardBody = document.createElement("div");
                cardBody.className = "card-body";

                const header = document.createElement("div");
                header.className = "d-flex justify-content-between align-items-center";

                const title = document.createElement("h5");
                title.className = "card-title tituloLista m-0 fw-bold";
                title.setAttribute("data-bs-toggle", "modal");
                title.setAttribute("data-bs-target", "#listJuegos");
                title.textContent = lista["nombre_lista"];
                title.title = lista["nombre_lista"];

                const dropdown = document.createElement("div");
                dropdown.className = "dropdown";

                const button = document.createElement("button");
                button.className = "text-center btn";
                button.setAttribute("type", "button");
                button.setAttribute("data-bs-toggle", "dropdown");
                button.setAttribute("aria-expanded", "false");

                const span = document.createElement("span");
                span.className = "text-light fs-4 fw-bold";
                span.textContent = "⋮";

                button.appendChild(span);
                dropdown.appendChild(button);

                const dropdownMenu = document.createElement("ul");
                dropdownMenu.className = "dropdown-menu dropdown-menu-dark";

                const renameItem = document.createElement("li");
                const renameLink = document.createElement("a");
                renameLink.className = "dropdown-item";
                renameLink.href = "#";
                renameLink.textContent = "Renombrar Lista";
                renameItem.appendChild(renameLink);

                const deleteItem = document.createElement("li");
                const deleteLink = document.createElement("a");
                deleteLink.className = "dropdown-item";
                deleteLink.href = "#";
                deleteLink.textContent = "Eliminar Lista";
                deleteItem.appendChild(deleteLink);

                dropdownMenu.appendChild(renameItem);
                dropdownMenu.appendChild(deleteItem);
                dropdown.appendChild(dropdownMenu);

                header.appendChild(title);
                header.appendChild(dropdown);

                const paragraph = document.createElement("p");
                paragraph.className = "card-text fechaListaJuego";
                paragraph.innerHTML = `Creado por: <span style="font-weight: bold; color: #007bff;">${lista["nombre_usuario"]}</span> el ${lista["fecha_creacion"]}`;
                paragraph.setAttribute("data-bs-toggle", "modal");
                paragraph.setAttribute("data-bs-target", "#listJuegos");
                cardBody.appendChild(header);
                cardBody.appendChild(paragraph);
                card.appendChild(cardBody);

                // Asignar los manejadores de clic para el "Renombrar" y "Eliminar"
                renameLink.addEventListener("click", function (event) {
                    event.preventDefault();  // Evitar la acción predeterminada del enlace
                    document.querySelectorAll("#renameListaModal button").forEach(btn => {
                        if (!btn.classList.contains("btn-close")) {
                            btn.style.display = "block";
                        }
                    });
                    // Aquí puedes agregar la lógica para renombrar la lista
                    const cardId = card.id; // Obtener el ID de la tarjeta

                    // Mostramos el modal de rename lista
                    const renameModal = new bootstrap.Modal(document.getElementById('renameListaModal'));
                    renameModal.show();

                    // Lógica cuando se confirma la eliminación
                    const confirmRenameButton = document.getElementById('confirmRenameButton');

                    //Reiniciamos el valor
                    document.getElementById('newListName').value = "";
                    const alerta = document.getElementById('alertasRenameLista');
                    borrarAlerta(alerta);
                    confirmRenameButton.onclick = async function () {


                        var existingSpinner = alerta.querySelector('.spinner');
                        if (existingSpinner) {
                            // Si existe, lo eliminamos
                            alerta.removeChild(existingSpinner);
                        }

                        const nuevoNombre = document.getElementById('newListName');

                        borrarAlerta(alerta);

                        //Si el nombre esta vacio
                        nuevoNombre.classList.remove('error');
                        if (nuevoNombre.value.trim() === "") {
                            nuevoNombre.classList.add('error');
                            alerta.appendChild(alertDanger("El nombre de la lista es obligatorio"));
                        } else {
                            var existingSpinner = alerta.querySelector('.spinner');
                            if (existingSpinner) {
                                // Si existe, lo eliminamos
                                alerta.removeChild(existingSpinner);
                            }

                            //Spinner
                            const spinnerElement = spinner();
                            spinnerElement.style.marginTop = '30px';
                            spinnerElement.style.marginBottom = '10px';
                            alerta.appendChild(spinnerElement);
                            document.querySelectorAll("#renameListaModal button").forEach(btn => {
                                if (!btn.classList.contains("btn-close")) {
                                    btn.style.display = "none";
                                }
                            });
                            //Trabajamos con el backend
                            //Llamamos a la funcion de cambiar nombre
                            const data = await renombrarLista(cardId, nuevoNombre.value)


                            var existingSpinner = alerta.querySelector('.spinner');
                            if (existingSpinner) {
                                // Si existe, lo eliminamos
                                alerta.removeChild(existingSpinner);
                            }
                            borrarAlerta(alerta);

                            if (!data["success"]) {
                                document.querySelectorAll("#renameListaModal button").forEach(btn => {
                                    if (!btn.classList.contains("btn-close")) {
                                        btn.style.display = "block";
                                    }
                                });
                                // Si error es un string, lo mostramos directamente
                                alerta.appendChild(alertDanger(data.error));
                            } else if (data["success"]) {
                                document.querySelectorAll("#renameListaModal button").forEach(btn => {
                                    if (!btn.classList.contains("btn-close")) {
                                        btn.style.display = "none";
                                    }
                                });
                                // Cerrar el modal después de la acción
                                renameModal.hide();
                                mostrarToast('La lista se ha renombrado correctamente', 'success');
                            }
                            // Cambiar el nombre de la lista (por ejemplo, actualizar el DOM) "A tiempo real"
                            title.textContent = nuevoNombre.value;
                            lista["nombre_lista"] = nuevoNombre.value;  // Actualizar el objeto `lista` si es necesario
                        }
                    }

                });

                deleteLink.addEventListener("click", function (event) {
                    event.preventDefault();  // Evitamos la acción predeterminada

                    //Si se reinicia el modal
                    const alerta = document.getElementById('alertasDeleteLista');
                    var existingSpinner = alerta.querySelector('.spinner');
                    if (existingSpinner) {
                        // Si existe, lo eliminamos
                        alerta.removeChild(existingSpinner);
                    }
                    borrarAlerta(alerta);
                    document.querySelectorAll("#confirmModal button").forEach(btn => {
                        if (!btn.classList.contains("btn-close")) {
                            btn.style.display = "block";
                        }
                    });

                    // Mostramos el modal de confirmación
                    const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
                    confirmModal.show();

                    // Lógica cuando se confirma la eliminación
                    const confirmDeleteButton = document.getElementById('confirmDeleteButton');
                    confirmDeleteButton.onclick = async function () {
                        // Aquí pones la lógica de eliminar la lista
                        const cardId = card.id;

                        var existingSpinner = alerta.querySelector('.spinner');
                        if (existingSpinner) {
                            // Si existe, lo eliminamos
                            alerta.removeChild(existingSpinner);
                        }

                        //Spinner
                        const spinnerElement = spinner();
                        spinnerElement.style.margin = 'auto';
                        alerta.appendChild(spinnerElement);
                        document.querySelectorAll("#confirmModal button").forEach(btn => {
                            if (!btn.classList.contains("btn-close")) {
                                btn.style.display = "none";
                            }
                        });
                        const data = await borrarLista(cardId);

                        var existingSpinner = alerta.querySelector('.spinner');
                        if (existingSpinner) {
                            // Si existe, lo eliminamos
                            alerta.removeChild(existingSpinner);
                        }
                        borrarAlerta(alerta);

                        if (!data["success"]) {
                            document.querySelectorAll("#confirmModal button").forEach(btn => {
                                if (!btn.classList.contains("btn-close")) {
                                    btn.style.display = "block";
                                }
                            });
                            // Si error es un string, lo mostramos directamente
                            alerta.appendChild(alertDanger(data.error));
                        } else if (data["success"]) {
                            document.querySelectorAll("#confirmModal button").forEach(btn => {
                                if (!btn.classList.contains("btn-close")) {
                                    btn.style.display = "none";
                                }
                            });
                            // Cerrar el modal después de la acción
                            confirmModal.hide();
                            mostrarToast('La lista se ha borrado correctamente', 'success');
                            //Actualizamos a "tiempo real el total de listas agregadas"
                            card.remove(); // Eliminar la tarjeta del DOM
                        }


                    };
                });
                fragment.appendChild(card); // Lo metemos al contendor principal
            });
            divListas.appendChild(fragment);
        }
    }
    async function borrarLista(idLista) {
        const { rol } = usuarioData;
        const datos = {
            idUsuario: rol,
            idLista: idLista
        }
        const response = await fetch('http://localhost:3000/backend/controllers/controllerListas/borrarListas.php', {
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
        return data;
    }
    async function renombrarLista(idLista, nuevoNombre) {
        const { rol } = usuarioData;
        const datos = {
            idUsuario: rol,
            idLista: idLista,
            nuevoNombre: nuevoNombre
        }
        const response = await fetch('http://localhost:3000/backend/controllers/controllerListas/renameLista.php', {
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
        return data;
    }
    // Añadir un event listener listas para el evento 'input'
    inputBuscarListas?.addEventListener('input', () => {
        // Si ya hay un intervalo en ejecución, lo detenemos
        clearInterval(inputBuscarListas.intervalId);

        // Iniciar un nuevo intervalo de 500ms
        inputBuscarListas.intervalId = setInterval(async (e) => {
            if (inputBuscarListas.value) {
                limpiarHTML(divtotalListasResultado);
                const spinnerElement = spinner();
                spinnerElement.style.margin = 'auto';
                spinnerElement.style.marginTop = '20px';
                divtotalListasResultado.appendChild(spinnerElement);
                /*Enviamos al backend y nos mostrara un resultado de usuarios */
                const usuariosListas = await obtenerUsuariosPorListas(inputBuscarListas.value);
                borrarSpinner(divtotalListasResultado);
                if (usuariosListas.success) {
                    if (usuariosListas.listas.length > 0) {
                        mostrarListas(usuariosListas.listas);
                    } else {
                        divtotalListasResultado.appendChild(sinResultado());
                    }
                } else {
                    cardMensajeError('Ups... parece que tenemos un problema técnico. Inténtalo de nuevo más tarde', divtotalListasResultado);
                }

            } else {
                limpiarHTML(divtotalListasResultado);
                const spinnerElement = spinner();
                spinnerElement.style.margin = 'auto';
                spinnerElement.style.marginTop = '20px';
                divtotalListasResultado.appendChild(spinnerElement);
                const informeGeneral = await obtenerInformeGeneral();
                borrarSpinner(divtotalListasResultado);
                const datosListas = informeGeneral.data.listas;
                mostrarListas(datosListas);
            }
        }, 500);

        // Resetear el temporizador para detectar cuando el usuario deja de escribir
        clearTimeout(inputBuscarListas.typingTimer);
        inputBuscarListas.typingTimer = setTimeout(() => {
            clearInterval(inputBuscarListas.intervalId);
        }, 500);
    });
    async function obtenerUsuariosPorListas(nombreUsuario) {
        const datos = {
            nombreUsuario: nombreUsuario
        }
        const response = await fetch('http://localhost:3000/backend/helpers/adminHelpers/getListasPorNombreUsuario.php', {
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
        return data;
    }
    /*Juegos lista */
    document.querySelector("#listJuegos").addEventListener("show.bs.modal", async function (event) {
        // Obtener el botón o el elemento que abrió el modal
        const target = event.relatedTarget;
        const divContenidoLista = document.getElementById('contenidoListaJuego');
        limpiarHTML(divContenidoLista);

        const tarjeta = target.closest('.card');
        if (tarjeta) {
            // Obtener el id de la tarjeta
            const tarjetaId = tarjeta.id;

            // Obtener el título de la tarjeta
            const tituloCard = tarjeta.querySelector('.card-title').textContent;

            // Establecer el título del modal
            const tituloModal = document.querySelector('#tituloListaModal');
            tituloModal.innerHTML = tituloCard;

            //Borramos el spinner
            borrarSpinner(divContenidoLista);

            //Spinner
            const spinnerElement = spinner();
            divContenidoLista.appendChild(spinnerElement);

            //Mostramos los jeugos de la lista backend
            const data = await obtenerJuegosDeLaLista(tarjetaId);

            borrarSpinner(divContenidoLista);
            mostrarJuegos(data);
        }
    });

    async function obtenerJuegosDeLaLista(idLista) {
        const datos = {
            idLista: idLista
        }
        const response = await fetch('http://localhost:3000/backend/helpers/getJuegosLista.php', {
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
        return data;
    }
    function mostrarJuegos(datos) {
        const divContenidoLista = document.getElementById('contenidoListaJuego');

        if (!datos.success) {
            // Crear el contenedor principal (card)
            const card = document.createElement('div');
            card.classList.add('card', 'text-center');

            // Crear el cuerpo de la card
            const cardBody = document.createElement('div');
            cardBody.classList.add('card-body', 'bg-danger');

            // Crear el título de la card
            const cardTitle = document.createElement('h5');
            cardTitle.classList.add('card-title');
            cardTitle.textContent = '¡Ups! Algo salió mal';

            // Crear el texto de la card
            const cardText = document.createElement('p');
            cardText.classList.add('card-text');
            cardText.textContent = 'No pudimos obtener la lista de juegos. Por favor, intenta más tarde';

            // Crear el ícono de carita triste
            const sadFace = document.createElement('span');
            sadFace.classList.add('fs-1', 'text-warning');
            sadFace.innerHTML = '&#128577;'; // Carita triste en código HTML

            // Añadir los elementos a la estructura
            cardBody.appendChild(cardTitle);
            cardBody.appendChild(cardText);
            cardBody.appendChild(sadFace);
            card.appendChild(cardBody);

            // Insertar la card en el DOM, por ejemplo, en el cuerpo del documento
            divContenidoLista.appendChild(card);

        } else if (datos.juegos.length > 0) {
            datos.juegos.forEach(juego => {
                const cardContainer = document.createElement('div');
                cardContainer.className = 'col-12 col-lg-6 card text-bg-dark cardListJuego p-0';
                cardContainer.id = `cardJuego-${juego["id_juego"]}`;
                const link = document.createElement('a');
                link.href = juego["link_juego"];

                const img = document.createElement('img');
                img.src = juego["image"];
                img.className = 'card-img';
                img.alt = juego["titulo"];

                const overlay = document.createElement('div');
                overlay.className = 'card-img-overlay d-flex justify-content-between align-items-start';

                const title = document.createElement('h5');
                title.className = 'card-title fw-bold text-center titleJuegoList';
                title.textContent = juego["titulo"];

                overlay.appendChild(title);

                link.appendChild(img);
                link.appendChild(overlay);

                cardContainer.appendChild(link);
                divContenidoLista.appendChild(cardContainer);
            });
        } else {
            // Crear el contenedor principal
            let card = document.createElement('div');
            card.classList.add('card', 'text-center', 'cardListVacia');

            // Crear el cuerpo de la tarjeta
            let cardBody = document.createElement('div');
            cardBody.classList.add('card-body');

            // Crear el título
            let cardTitle = document.createElement('h5');
            cardTitle.classList.add('card-title');
            cardTitle.textContent = '¡Lista de Juegos Vacía!';

            // Crear el texto descriptivo
            let cardText = document.createElement('p');
            cardText.classList.add('card-text');
            cardText.textContent = 'Este usuario no dispone juegos en su lista';

            // Añadir los elementos al cuerpo de la tarjeta
            cardBody.appendChild(cardTitle);
            cardBody.appendChild(cardText);

            // Añadir el cuerpo de la tarjeta al contenedor
            card.appendChild(cardBody);


            divContenidoLista.appendChild(card);
        }

    }

    /* Resenas */
    // Añadir un event listener resenas para el evento 'input'
    inputBuscarResenas?.addEventListener('input', () => {
        // Si ya hay un intervalo en ejecución, lo detenemos
        clearInterval(inputBuscarResenas.intervalId);

        // Iniciar un nuevo intervalo de 500ms
        inputBuscarResenas.intervalId = setInterval(async (e) => {
            if (inputBuscarResenas.value) {
                limpiarHTML(divtotalResenasResultado);
                const spinnerElement = spinner();
                spinnerElement.style.margin = 'auto';
                spinnerElement.style.marginTop = '20px';
                divtotalResenasResultado.appendChild(spinnerElement);
                /*Enviamos al backend y nos mostrara un resultado de usuarios */
                const usuariosResenas = await obtenerUsuariosPorResenas(inputBuscarResenas.value);
                borrarSpinner(divtotalResenasResultado);
                if (usuariosResenas.success) {
                    if (usuariosResenas.resenas.length > 0) {
                        mostrarResenasUsuario(usuariosResenas.resenas);
                    } else {
                        divtotalResenasResultado.appendChild(sinResultado());
                    }
                } else {
                    cardMensajeError('Ups... parece que tenemos un problema técnico. Inténtalo de nuevo más tarde', divtotalResenasResultado);
                }

            } else {
                limpiarHTML(divtotalResenasResultado);
                const spinnerElement = spinner();
                spinnerElement.style.margin = 'auto';
                spinnerElement.style.marginTop = '20px';
                divtotalResenasResultado.appendChild(spinnerElement);
                const informeGeneral = await obtenerInformeGeneral();
                borrarSpinner(divtotalResenasResultado);
                const datosResenas = informeGeneral.data.resenas;
                mostrarResenasUsuario(datosResenas);
            }
        }, 500);

        // Resetear el temporizador para detectar cuando el usuario deja de escribir
        clearTimeout(inputBuscarResenas.typingTimer);
        inputBuscarResenas.typingTimer = setTimeout(() => {
            clearInterval(inputBuscarResenas.intervalId);
        }, 500);
    });
    function mostrarResenasUsuario(datosResenas) {
        const divReviews = document.getElementById('totalResenasResultado');
        const obtenerListResenas = datosResenas;

        if (obtenerListResenas.length > 0) {
            const fragment = document.createDocumentFragment();
            obtenerListResenas.forEach(resena => {
                // Crear el elemento principal
                const resenaDiv = document.createElement('div');
                resenaDiv.className = 'mb-2 p-0 col-12 mensajePersonalizado card';
                resenaDiv.id = `Resena-${resena["id_resena"]}`;

                // Crear la fila
                const rowDiv = document.createElement('div');
                rowDiv.className = 'row g-0';

                // Columna de la imagen (izquierda)
                const imgColDiv = document.createElement('div');
                imgColDiv.className = 'col-md-3';

                const imgLink = document.createElement('a');
                imgLink.href = `/pagGame/infoGame.html?id=${resena["id_videojuego_api"]}`;
                imgLink.title = `/pagGame/infoGame.html?id=${resena["id_videojuego_api"]}`;

                const img = document.createElement('img');
                img.src = resena["img_juego"];
                img.className = 'imgJuegoResena img-fluid rounded-start';
                img.alt = `Game`;

                imgLink.appendChild(img);
                imgColDiv.appendChild(imgLink);

                // Columna del contenido (derecha)
                const contentColDiv = document.createElement('div');
                contentColDiv.className = 'col-md-9';

                // Card header
                const cardHeaderDiv = document.createElement('div');
                cardHeaderDiv.className = 'card-header fw-bold';

                const headerFlexDiv = document.createElement('div');
                headerFlexDiv.className = 'd-flex align-items-center justify-content-between';

                // Nombre del usuario
                const userDiv = document.createElement('div');
                userDiv.className = 'd-flex align-items-center';
                const userImg = document.createElement('img');
                userImg.src = resena["avatar"];
                userImg.className = 'img-fluid rounded-start perfil-img';
                userImg.alt = `Imagen de ${resena["nombre_usuario"]}`;

                const userNameSpan = document.createElement('span');
                userNameSpan.className = 'nombre-usuario ms-2';
                userNameSpan.textContent = resena["nombre_usuario"];

                userDiv.appendChild(userImg);
                userDiv.appendChild(userNameSpan);

                // Botón de eliminar
                const deleteButton = document.createElement('button');
                deleteButton.className = 'btn';
                deleteButton.title = 'Eliminar mensaje';
                deleteButton.setAttribute('data-bs-toggle', 'modal');
                deleteButton.setAttribute('data-bs-target', '#confirmDeleteResenaModal');
                deleteButton.setAttribute('data-resena-id', resena["id_resena"]);

                const deleteIcon = document.createElement('i');
                deleteIcon.className = 'fs-5 text-danger bi bi-x-circle-fill';

                deleteButton.appendChild(deleteIcon);

                // Agregar evento al botón "X" para pasar el ID al modal
                divReviews.addEventListener('click', function (event) {
                    // Obtener el modal y los botones
                    const modalFooterButtons = document.querySelectorAll('#confirmDeleteResenaModal .btn');

                    // Mostrar los botones cuando el modal se abra
                    modalFooterButtons.forEach(button => {
                        button.style.display = 'inline-block';
                    });

                    if (event.target.closest('.btn[data-resena-id]')) {
                        const deleteButton = event.target.closest('.btn[data-resena-id]');
                        const resenaId = deleteButton.getAttribute('data-resena-id');
                        document.getElementById('confirmDeleteResenaButton').setAttribute('data-resena-id', resenaId);
                    }
                });

                headerFlexDiv.appendChild(userDiv);
                headerFlexDiv.appendChild(deleteButton);
                cardHeaderDiv.appendChild(headerFlexDiv);

                // Card body
                const cardBodyDiv = document.createElement('div');
                cardBodyDiv.className = 'card-body';

                const blockquote = document.createElement('blockquote');
                blockquote.className = 'blockquote mb-0';

                const contentParagraph = document.createElement('p');
                contentParagraph.textContent = resena["contenido"];

                blockquote.appendChild(contentParagraph);
                cardBodyDiv.appendChild(blockquote);

                // Añadir todo al contenido de la columna derecha
                contentColDiv.appendChild(cardHeaderDiv);
                contentColDiv.appendChild(cardBodyDiv);

                // Añadir las columnas a la fila
                rowDiv.appendChild(imgColDiv);
                rowDiv.appendChild(contentColDiv);

                // Añadir la fila al elemento principal
                resenaDiv.appendChild(rowDiv);

                //Asi no se vuelve mas lento el codigo
                fragment.appendChild(resenaDiv);
            });
            divReviews.appendChild(fragment);
        } else {
            divReviews.appendChild(sinResultadoMensaje('No se han encontrado reseñas registradas'));
        }
    }
    async function obtenerUsuariosPorResenas(nombreUsuario) {
        const datos = {
            nombreUsuario: nombreUsuario
        }
        const response = await fetch('http://localhost:3000/backend/helpers/adminHelpers/getResenasPorNombreUsuario.php', {
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
        return data;
    }
    //Borrar resena 
    document.getElementById('confirmDeleteResenaButton').addEventListener('click', async function () {
        const alerta = document.getElementById('alertaResena');
        borrarSpinner(alerta);
        borrarAlerta(alerta);
        // Obtener el modal y los botones
        const modalFooterButtons = document.querySelectorAll('#confirmDeleteResenaModal .btn');

        // Obtener el ID de la reseña desde el botón de confirmación
        const resenaId = this.getAttribute('data-resena-id');

        // Eliminar la tarjeta usando el ID
        const tarjetaAEliminar = document.getElementById(`Resena-${resenaId}`);
        if (tarjetaAEliminar) {
            const datos = {
                idUsuario: usuarioData.rol,
                idResena: resenaId
            }
            const spinnerElement = spinner();
            spinnerElement.style.margin = 'auto';
            alerta.appendChild(spinnerElement);

            modalFooterButtons.forEach(button => {
                button.style.display = 'none';
            });
            //Enviamos al backend para borrar la reseña
            const data = await borrarResena(datos);
            borrarSpinner(alerta);

            if (!data.success) {
                alerta.appendChild(alertDanger(data.error));

            } else {
                // Mostrar un toast de éxito
                mostrarToast('La reseña se ha borrado correctamente', 'success');
                tarjetaAEliminar.remove(); // Eliminar la tarjeta del DOM
            }

        }

        // Cerrar el modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteResenaModal'));
        modal.hide();
    });

}