import { obtenerRelaciones, eliminarSeguimiento, cardMensajeError, redesSociales, obtenerDatosUsuario, mostrarToast, borrarResena, alertDanger, alertSuccess, spinner, borrarAlerta, mostrarPassword, getCookie, formatDate, obtenerListas, limpiarHTML, borrarSpinner } from '../../js/funciones.js';
import { guardarCambiosStorage } from "../../js/guardian.js";

const sesionToken = getCookie('sesion_token');
if (!sesionToken) {
    window.location.href = "/index.html";
}
document.addEventListener('DOMContentLoaded', iniciarPerfil);
async function iniciarPerfil() {
    try {
        /*Lo dejo para avisar al usuario esta cargando */
        const divAlertasUsuario = document.getElementById('alertasPerfilPrincipal');
        const elementSpinner = spinner();
        elementSpinner.style.marginBottom = '400px';
        divAlertasUsuario.appendChild(elementSpinner);
        document.getElementById('contenidoTotal').style.display = 'none'; /*Ocultamos el contenido principal */


        /*Los datos del usuario */
        const usuarioData = JSON.parse(localStorage.getItem("usuarioData"));
        const datosRedesYSobreMi = await obtenerDatosUsuario(usuarioData.id); /*Obtiene los datos de redes sociales y sobre mi lo llame asi porque lo uso en la pagina de usuarios*/
        const listasDeJuegos = await obtenerListas(usuarioData);
        const obtenerListResenas = await obtenerResenasUsuario(usuarioData.id);
        const relaciones = await obtenerRelaciones(usuarioData.id);

        /*Perfil informacion lo que se ve todo el rato*/
        perfilInformacion();

        /*Mostramos el contenido Main del usuario */
        mostrarMain();

        /*Mostramos las listas */
        mostrarListas();

        /*Relaciones */
        mostrarRelaciones(relaciones);

        /*Mostramos las reseñas del usuario */
        mostrarResenasUsuario()

        /*Cargamos la seccion config */
        configPerfil();

        // Sincronizar el <select> al cargar la página
        syncDropdownWithActiveTab();

        borrarSpinner(divAlertasUsuario);
        document.getElementById('contenidoTotal').style.display = 'block';


        /*Nav para moviles */
        // Función para sincronizar el <select> con la pestaña activa
        function syncDropdownWithActiveTab() {
            // Obtén la pestaña activa
            const activeTab = document.querySelector('.nav-link.active');
            if (activeTab) {
                // Obtén el valor de data-bs-target de la pestaña activa
                const target = activeTab.getAttribute('data-bs-target');
                // Establece el valor del <select> para que coincida con la pestaña activa
                document.getElementById('tabDropdown').value = target;
            }
        }

        // Evento para cambiar la pestaña cuando se selecciona una opción en el <select>
        document.getElementById('tabDropdown').addEventListener('change', function () {
            const target = this.value;
            const tabTrigger = new bootstrap.Tab(document.querySelector('[data-bs-target="' + target + '"]'));
            tabTrigger.show();
        });

        // Evento para sincronizar el <select> cuando se cambia de pestaña en el <nav>
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('shown.bs.tab', function () {
                syncDropdownWithActiveTab();
            });
        });

        /*Contenido Main */
        //Obtenemos el formulario
        const formularioSobreMi = document.getElementById('formSobreMi');

        function mostrarMain() {

            const { total_listas } = listasDeJuegos.listas;
            /*Total de listas */
            document.getElementById('totalListas').innerHTML = total_listas;
            document.getElementById('totalResenas').innerHTML = obtenerListResenas.resenas?.length;
            document.getElementById('totalSeguidores').innerHTML = relaciones.seguidores?.length;

            if (datosRedesYSobreMi) {
                if (datosRedesYSobreMi.success) {
                    const { discord, sobremi, steam, youtube } = datosRedesYSobreMi.contenidoUsuario;
                    /*Asignamos el valor sobre mi en el formulario */
                    document.getElementById('discordTag').value = discord;
                    document.getElementById('sobreMi').value = sobremi;
                    document.getElementById('steamLink').value = steam;
                    document.getElementById('youtubeLink').value = youtube;

                    /*Llamamos a la funcion redesSociales*/
                    redesSociales(discord, steam, youtube);
                }
            }

        }

        async function guardarRedesYSobremi(datos) {
            const response = await fetch('http://localhost:3000/backend/controllers/controllerPerfilMain/agregarContenidoUsuario.php', {
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

        formularioSobreMi.addEventListener('submit', async (e) => {
            e.preventDefault();
            const alerta = document.getElementById('sobreMiAlerta');

            // Obtener todos los campos del formulario
            const campos = [formularioSobreMi.sobreMi, formularioSobreMi.steamLink, formularioSobreMi.youtubeLink, formularioSobreMi.discordTag];

            let todosVacios = true; //Inicializamos como true que por defecto los campos estan vacios

            // Validar si los campos están vacíos y aplicar el estilo de error
            campos.forEach(campo => {
                if (campo.value.trim() !== "") {
                    todosVacios = false; // Si al menos un campo no está vacío, cambia la bandera
                }
            });

            //Para que no genere muchas alertas
            borrarAlerta(alerta);

            if (todosVacios) {
                alerta.appendChild(alertDanger("Por favor, completa al menos uno de los campos"));

            } else {
                //Enviamos al backend datos 
                const datos = {
                    idUsuario: usuarioData.id,
                    sobreMi: formularioSobreMi.sobreMi.value,
                    steam: formularioSobreMi.steamLink.value,
                    youtube: formularioSobreMi.youtubeLink.value,
                    discord: formularioSobreMi.discordTag.value
                }
                document.getElementById("btnActualizarPerfilRS").style.display = "none";
                alerta.appendChild(spinner());
                const data = await guardarRedesYSobremi(datos);
                borrarSpinner(alerta);

                if (!data["success"]) {
                    if (typeof data.error === "string") {
                        // Si error es un string, lo mostramos directamente
                        alerta.appendChild(alertDanger(data.error));
                    } else if (typeof data.error === "object") {
                        // Si error es un objeto, obtenemos la primera clave y mostramos el mensaje
                        const key = Object.keys(data.error)[0];
                        campos.forEach(campo => {
                            if (campo.id === key) {
                                campo.classList.add('error'); // Marca el campo con error
                            }
                        });
                        // Mostrar el mensaje de error
                        alerta.appendChild(alertDanger(data.error[key]));
                    }
                } else if (data["success"]) {
                    alerta.appendChild(alertSuccess(data["exito"]));
                }
                document.getElementById("btnActualizarPerfilRS").style.display = "block";
            }
        });

        /*Listas */
        /*Selectores */
        const formList = document.getElementById('formCrearLista');

        formList?.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nombreLista = formList.nombreList;
            const alerta = document.getElementById('alertaList');

            borrarAlerta(alerta);
            nombreLista.classList.remove('error');
            if (nombreLista.value.trim() === "") {
                nombreLista.classList.add('error');
                alerta.appendChild(alertDanger("El nombre de la lista es obligatorio"));
            } else {
                //Enviamos al backend
                try {

                    // Verificamos si ya existe un spinner en el div
                    var existingSpinner = alerta.querySelector('.spinner'); // Asegúrate de que '.spinner' es un selector único

                    if (existingSpinner) {
                        // Si existe, lo eliminamos
                        alerta.removeChild(existingSpinner);
                    }
                    //Spinner
                    const spinnerElement = spinner();
                    spinnerElement.style.marginTop = '30px';
                    spinnerElement.style.marginBottom = '10px';
                    alerta.appendChild(spinnerElement);
                    document.querySelectorAll("#crearListaModal button").forEach(btn => {
                        btn.style.display = "none";
                    });

                    const { id } = usuarioData;
                    const total_listas = obtenerNunListasActuales();

                    const datos = {
                        nombreLista: nombreLista.value,
                        idUsuario: id,
                        totalListas: total_listas
                    }

                    const response = await fetch('http://localhost:3000/backend/controllers/controllerListas/agregarLista.php', {
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


                    // Verificamos si ya existe un spinner en el div
                    var existingSpinner = alerta.querySelector('.spinner'); // Asegúrate de que '.spinner' es un selector único
                    document.querySelectorAll("#crearListaModal button").forEach(btn => {
                        btn.style.display = "block";
                    });
                    if (existingSpinner) {
                        // Si existe, lo eliminamos
                        alerta.removeChild(existingSpinner);
                    }
                    borrarAlerta(alerta);

                    if (!data["success"]) {
                        if (typeof data.error === "string") {
                            // Si error es un string, lo mostramos directamente
                            alerta.appendChild(alertDanger(data.error));
                        } else if (typeof data.error === "object") {
                            // Si error es un objeto, obtenemos la primera clave y mostramos el mensaje
                            const key = Object.keys(data.error)[0]; // "password" o "email"

                            if ("nombreList" === key) {
                                nombreLista.classList.add('error'); // Marca el campo con error
                            }
                            // Mostrar el mensaje de error
                            alerta.appendChild(alertDanger(data.error[key]));
                        }
                    } else if (data["success"]) {
                        document.querySelectorAll("#crearListaModal button").forEach(btn => {
                            if (!btn.classList.contains("btn-close")) {
                                btn.style.display = "none";
                            } else {
                                btn.style.display = "block";
                            }
                        });
                        alerta.appendChild(alertSuccess(data["exito"]));
                    }
                } catch (error) {
                    console.error("Error al enviar los datos:", error);
                }
            }

        });

        /*Listas */
        function mostrarListas() {
            const divListas = document.getElementById('nav-listas');
            if (listasDeJuegos.success) {
                const { total_contenido, total_listas } = listasDeJuegos.listas;
                document.getElementById('numListas').innerHTML = `${total_listas} / 10 listas`;
                if (total_listas == 0) {
                    // Crear el contenedor principal
                    const cardDiv = document.createElement('div');
                    cardDiv.classList.add('card', 'mt-2', 'cardSinListaDeJuegos');

                    // Crear el cuerpo de la tarjeta
                    const cardBodyDiv = document.createElement('div');
                    cardBodyDiv.classList.add('card-body', 'd-flex', 'align-items-center', 'justify-content-between', 'flex-column');

                    // Crear el icono
                    const icon = document.createElement('i');
                    icon.classList.add('text-center', 'fs-2', 'bi', 'bi-bookmark-heart-fill');

                    // Crear el título
                    const cardTitle = document.createElement('h5');
                    cardTitle.classList.add('card-title', 'fw-bold', 'text-center');
                    cardTitle.textContent = '¡Crea tu primera lista de juegos!';

                    // Crear el texto descriptivo
                    const cardText = document.createElement('p');
                    cardText.classList.add('card-text', 'text-center');
                    cardText.textContent = '¡Genial que estés aquí! Organiza tus listas y mantén todo bajo control para acceder rápidamente a tus juegos favoritos';

                    // Agregar los elementos al cuerpo de la tarjeta
                    cardBodyDiv.appendChild(icon);
                    cardBodyDiv.appendChild(cardTitle);
                    cardBodyDiv.appendChild(cardText);

                    // Agregar el cuerpo de la tarjeta al contenedor principal
                    cardDiv.appendChild(cardBodyDiv);

                    // Agregar la tarjeta al cuerpo del documento (o a otro elemento específico)
                    divListas.appendChild(cardDiv);

                } else {
                    const fragment = document.createDocumentFragment(); // Crear el fragmento
                    total_contenido.forEach(lista => {
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
                        paragraph.textContent = `Fecha de creación: ${lista["fecha_creacion"].toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })}`;
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

                                //Total listas main
                                let totalListas = Number(document.getElementById('totalListas').textContent);
                                totalListas -= 1; // Realizar la resta
                                document.getElementById('totalListas').innerHTML = totalListas; // Actualizar el valor del input

                                //Total listas actual
                                document.getElementById('numListas').innerHTML = `${totalListas} / 10 listas`; // Actualizar el valor del input

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

        }

        function obtenerNunListasActuales() {
            // Obtener el contenido del elemento con el ID 'numListas'
            const contenido = document.getElementById('numListas').textContent;

            // Usar una expresión regular para extraer el primer número
            const primerNumero = contenido.match(/\d+/);  // \d+ busca uno o más dígitos
            return primerNumero[0];
        }

        async function renombrarLista(idLista, nuevoNombre) {
            const { id } = usuarioData;
            const datos = {
                idUsuario: id,
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
        async function borrarLista(idLista) {
            const { id } = usuarioData;
            const datos = {
                idUsuario: id,
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
        // Agregar evento al modal para obtener el ID de la tarjeta para mostrar sus juegos =)
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

        /*Juegos lista */
        async function borrarJuegoLista(idJuego) {
            let id = idJuego.split('-')[1];
            const datos = {
                idJuego: id
            }
            const response = await fetch('http://localhost:3000/backend/controllers/controllerListas/borrarJuegoLista.php', {
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

                    const button = document.createElement('button');
                    button.className = 'btn btnEliminarJuego text-center position-absolute end-0 top-0';
                    button.innerHTML = '<i class="fs-4 bi bi-x-circle-fill text-danger"></i>';

                    // Asignar un evento de clic único al botón
                    button.addEventListener('click', function (event) {
                        event.preventDefault(); // Previene el comportamiento predeterminado del botón
                        event.stopPropagation(); // Evita que el evento se propague al enlace
                        const botones = document.querySelectorAll('#confirmDeleteGameModal button');

                        // Recorre todos los botones
                        botones.forEach(function (boton) {
                            // Verifica si el botón no es el de cerrar
                            if (!boton.classList.contains('btn-close')) {
                                boton.style.display = 'block';
                            }
                        });
                        // Mostrar el modal de confirmación
                        const confirmModal = new bootstrap.Modal(document.getElementById('confirmDeleteGameModal'));
                        confirmModal.show();

                        // Obtén la card padre del botón
                        const card = button.closest('.cardListJuego');

                        // Asignar el evento de confirmación al botón "Eliminar" del modal
                        const confirmDeleteGameButton = document.getElementById('confirmDeleteGameButton');

                        confirmDeleteGameButton.onclick = async function () {
                            //Ocultamos los botones si no me da tiempo
                            const alertaGame = document.getElementById('alertaConfirmGameDelete');
                            borrarSpinner(alertaGame);

                            const spinnerElement = spinner();
                            spinnerElement.style.margin = '0 auto';
                            alertaGame.appendChild(spinnerElement);

                            // Recorre todos los botones
                            botones.forEach(function (boton) {
                                // Verifica si el botón no es el de cerrar
                                if (!boton.classList.contains('btn-close')) {
                                    boton.style.display = 'none';
                                }
                            });
                            //Enviamos al backend 
                            const data = await borrarJuegoLista(card.id);
                            borrarSpinner(alertaGame);

                            if (!data.success) {
                                alertaGame.appendChild(alertDanger("Error al eliminar el juego de la lista"));
                            } else {
                                card.remove();
                                //Enviar al modal 
                                confirmModal.hide(); // Cierra el modal después de eliminar
                            }

                        };
                    });

                    overlay.appendChild(title);
                    overlay.appendChild(button);

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
                cardText.textContent = 'No tienes juegos disponibles en este momento. Por favor, añade algunos para verlos aquí';

                // Crear el botón
                let button = document.createElement('a');
                button.href = '/index.html';
                button.classList.add('btn', 'm-0');
                button.textContent = 'Volver al Inicio';

                // Añadir los elementos al cuerpo de la tarjeta
                cardBody.appendChild(cardTitle);
                cardBody.appendChild(cardText);
                cardBody.appendChild(button);

                // Añadir el cuerpo de la tarjeta al contenedor
                card.appendChild(cardBody);


                divContenidoLista.appendChild(card);
            }

        }

        function mostrarRelaciones(relaciones) {
            /*Pongo esto aqui porque esta relacionado con esto */
            const linkAmigo = document.getElementById('linkAmigo');
            linkAmigo.href = `http://localhost:5500/Perfiles/usuario/usuario.html?id=${usuarioData.id}`;


            const divSeguidores = document.getElementById('seguidoresResultado');
            const divSeguidos = document.getElementById('seguidosResultado');
            if (relaciones) {
                if (relaciones.success) {
                    /*Mostramos a los seguidores */
                    if (relaciones.seguidores.length > 0) {
                        const divContainer = document.createElement('div');
                        divContainer.className = 'container m-0';
                        const divRow = document.createElement('div');
                        divRow.classList.add('row', 'justify-content-center', 'd-flex');

                        const fragment = document.createDocumentFragment();/*Para no maniupular tanto e ldom esto hace mas optimo la aplicacion */
                        relaciones.seguidores.forEach(seguidor => {
                            const divCol = document.createElement('div');
                            divCol.classList.add('col-4', 'card', 'text-center', 'text-white', 'cardRelacion');
                            divCol.id = `cardSeguidor-${seguidor["id_usuario"]}`;

                            const aTag = document.createElement('a');
                            aTag.href = `/Perfiles/usuario/usuario.html?id=${seguidor["id_usuario"]}`;
                            aTag.classList.add('text-decoration-none', 'text-reset');

                            const divCardBody = document.createElement('div');
                            divCardBody.classList.add('card-body');

                            const imgAvatar = document.createElement('img');
                            imgAvatar.src = seguidor["avatar"] + `?v=${new Date().getTime()}`;
                            imgAvatar.classList.add('rounded-circle', 'mb-2');
                            imgAvatar.alt = `Imagen de ${seguidor["nombre_usuario"]}`;

                            const h5Title = document.createElement('h5');
                            h5Title.classList.add('card-title', 'fw-bold');
                            h5Title.title = seguidor["nombre_usuario"];
                            h5Title.textContent = seguidor["nombre_usuario"];

                            divCardBody.appendChild(imgAvatar);
                            divCardBody.appendChild(h5Title);
                            aTag.appendChild(divCardBody);
                            divCol.appendChild(aTag);
                            fragment.appendChild(divCol);
                        });
                        divRow.appendChild(fragment);
                        divContainer.appendChild(divRow);
                        divSeguidores.appendChild(divContainer);

                    } else {
                        const card = document.createElement("div");
                        card.className = "card cardLinkAmigo my-2";

                        const cardBody = document.createElement("div");
                        cardBody.className = "card-body text-center";

                        const icon = document.createElement("i");
                        icon.className = "fs-2 bi bi-android";

                        const title = document.createElement("h5");
                        title.className = "card-title text-center";
                        title.textContent = "¿Aún no tienes seguidores?";

                        const text = document.createElement("p");
                        text.className = "card-text text-center";
                        text.textContent = "¡Hazlo más divertido! Comparte tu enlace con otros para que te sigan y disfruten juntos de tus listas de juegos";

                        cardBody.appendChild(icon);
                        cardBody.appendChild(title);
                        cardBody.appendChild(text);
                        card.appendChild(cardBody);
                        divSeguidores.appendChild(card); // Puedes cambiar document.body por otro contenedor específico
                    }

                    /*Mostramos a los seguidos */
                    if (relaciones.seguidos.length > 0) {
                        const divContainer = document.createElement('div');
                        divContainer.className = 'container m-0';
                        const divRow = document.createElement('div');
                        divRow.classList.add('row', 'justify-content-center', 'd-flex');

                        const fragment = document.createDocumentFragment();/*Para no maniupular tanto e ldom esto hace mas optimo la aplicacion */
                        relaciones.seguidos.forEach(siguiendo => {
                            const divCol = document.createElement('div');
                            divCol.classList.add('col-4', 'card', 'text-center', 'text-white', 'cardRelacion');
                            divCol.id = `cardSeguidor-${siguiendo["id_usuario"]}`;

                            const aTag = document.createElement('a');
                            aTag.href = `/Perfiles/usuario/usuario.html?id=${siguiendo["id_usuario"]}`;
                            aTag.classList.add('text-decoration-none', 'text-reset');

                            const divCardBody = document.createElement('div');
                            divCardBody.classList.add('card-body');

                            const imgAvatar = document.createElement('img');
                            imgAvatar.src = siguiendo["avatar"] + `?v=${new Date().getTime()}`;
                            imgAvatar.classList.add('rounded-circle', 'mb-2');
                            imgAvatar.alt = `Imagen de ${siguiendo["nombre_usuario"]}`;

                            const h5Title = document.createElement('h5');
                            h5Title.classList.add('card-title', 'fw-bold');
                            h5Title.title = siguiendo["nombre_usuario"];
                            h5Title.textContent = siguiendo["nombre_usuario"];

                            const button = document.createElement('button');
                            button.type = 'button';
                            button.classList.add('btn', 'btn-outline-danger');
                            button.textContent = 'Eliminar';

                            // Añadir atributos para abrir el modal
                            button.setAttribute('data-bs-toggle', 'modal');
                            button.setAttribute('data-bs-target', '#deleteSeguimiento');

                            // Evitar que se siga el enlace cuando se haga clic en el botón "Eliminar"
                            button.addEventListener('click', async (e) => {
                                const alerta = document.getElementById('alertaDeleteSeguimiento');
                                e.preventDefault();
                                borrarAlerta(alerta);

                                document.querySelectorAll("#deleteSeguimiento .modal-footer button").forEach(button => {
                                    button.style.display = "block";
                                });

                                const idSeguido = divCol.id.split("-").pop(); // Toma la última parte después del "-"

                                // Lógica cuando se confirma la eliminación
                                const eliminarSeguimientoBTN = document.getElementById('eliminarSeguimientoBTN');

                                //Reiniciamos el valor
                                eliminarSeguimientoBTN.onclick = async function () {

                                    const elementSpinner = spinner();
                                    elementSpinner.style.margin = 'auto';
                                    alerta.appendChild(elementSpinner);

                                    document.querySelectorAll("#deleteSeguimiento .modal-footer button").forEach(button => {
                                        button.style.display = "none";
                                    });
                                    //Enviamos al backend lso datos
                                    const data = await eliminarSeguimiento(usuarioData.id, idSeguido);

                                    borrarSpinner(alerta);

                                    if (!data["success"]) {
                                        // Mostrar el mensaje de error
                                        alerta.appendChild(alertDanger(data.error));
                                    } else if (data["success"]) {
                                        mostrarToast('¡Seguimiento eliminado con éxito!', 'success');
                                        divCol.remove();

                                        // Cerrar el modal correctamente
                                        const deleteModalElement = document.getElementById('deleteSeguimiento');
                                        const modalInstance = bootstrap.Modal.getInstance(deleteModalElement);

                                        if (modalInstance) {
                                            modalInstance.hide();
                                        }
                                    }
                                }
                            });


                            divCardBody.appendChild(imgAvatar);
                            divCardBody.appendChild(h5Title);
                            divCardBody.appendChild(button);

                            aTag.appendChild(divCardBody);
                            divCol.appendChild(aTag);
                            fragment.appendChild(divCol);
                        });
                        divRow.appendChild(fragment);
                        divContainer.appendChild(divRow);
                        divSeguidos.appendChild(divContainer);

                    } else {
                        const cardContainer = document.createElement('div');
                        cardContainer.classList.add('card', 'cardLinkAmigo', 'my-2');

                        const cardBody = document.createElement('div');
                        cardBody.classList.add('card-body', 'text-center');

                        const icon = document.createElement('i');
                        icon.classList.add('fs-2', 'bi-person-fill-up');

                        const title = document.createElement('h5');
                        title.classList.add('card-title', 'text-center');
                        title.textContent = '¿Aún no sigues a nadie?';

                        const paragraph = document.createElement('p');
                        paragraph.classList.add('card-text', 'text-center');
                        paragraph.textContent = 'Descubre nuevos perfiles y encuentra a otros gamers como tú. ¡Invita a tus amigos y haz crecer la comunidad!';

                        cardBody.appendChild(icon);
                        cardBody.appendChild(title);
                        cardBody.appendChild(paragraph);
                        cardContainer.appendChild(cardBody);
                        divSeguidos.appendChild(cardContainer);
                    }
                }

            } else {
                cardMensajeError('No pudimos obtener tus seguidores. Por favor, intentalo más tarde', divSeguidores);
                cardMensajeError('No pudimos obtener tus usuarios seguidos. Por favor, intentalo más tarde', divSeguidos);
            }
        }

        /*Resenas*/
        async function obtenerResenasUsuario(idUsuario) {
            const datos = {
                idUsuario: idUsuario
            }
            const response = await fetch('http://localhost:3000/backend/helpers/getResenasUsuario.php', {
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

        function mostrarResenasUsuario() {
            const divReviews = document.getElementById('nav-reviews');
            if (obtenerListResenas.success) {
                if (obtenerListResenas.resenas.length > 0) {
                    const fragment = document.createDocumentFragment();
                    obtenerListResenas.resenas.forEach(resena => {
                        // Crear el elemento principal
                        const resenaDiv = document.createElement('div');
                        resenaDiv.className = 'mb-2 col-12 mensajePersonalizado card';
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
                        userImg.src = resena["avatar"] + `?v=${new Date().getTime()}`;
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
                    // Crear el elemento div con la clase "card cardLinkAmigo mt-3"
                    const cardDiv = document.createElement('div');
                    cardDiv.className = 'card cardLinkAmigo mt-3';

                    // Crear el elemento div con la clase "card-body text-center"
                    const cardBodyDiv = document.createElement('div');
                    cardBodyDiv.className = 'card-body text-center';

                    // Crear el elemento <i> con las clases "fs-2 bi bi-chat-left-heart-fill"
                    const icon = document.createElement('i');
                    icon.className = 'fs-2 bi bi-chat-left-heart-fill';

                    // Crear el elemento <h5> con la clase "card-title fw-bold" y el texto
                    const title = document.createElement('h5');
                    title.className = 'card-title fw-bold';
                    title.textContent = '¿Aún no has dejado una reseña?';

                    // Crear el elemento <p> con la clase "card-text" y el texto
                    const text = document.createElement('p');
                    text.className = 'card-text';
                    text.textContent = 'Comparte tu experiencia con los juegos que has probado. Tu opinión puede ayudar a otros jugadores a elegir sus favoritos';

                    // Agregar los elementos al cardBodyDiv
                    cardBodyDiv.appendChild(icon);
                    cardBodyDiv.appendChild(title);
                    cardBodyDiv.appendChild(text);

                    // Agregar el cardBodyDiv al cardDiv
                    cardDiv.appendChild(cardBodyDiv);

                    divReviews.appendChild(cardDiv);
                }

            } else {
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
                cardText.textContent = 'No pudimos obtener tus reseñas. Por favor, intentalo más tarde';

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
                divReviews.appendChild(card);
            }
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
                    idUsuario: usuarioData.id,
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
                    let totalResenas = Number(document.getElementById('totalResenas').textContent);
                    totalResenas -= 1; // Realizar la resta
                    document.getElementById('totalResenas').innerHTML = totalResenas; // Actualizar el valor del input
                    // Mostrar un toast de éxito
                    mostrarToast('La reseña se ha borrado correctamente', 'success');
                    tarjetaAEliminar.remove(); // Eliminar la tarjeta del DOM
                }

            }

            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteResenaModal'));
            modal.hide();
        });

        /*Configuracion */
        //Lo hago asi porque es mas intuitivo
        const formPersonalizarPerfil = document.getElementById('formPersonalizarPerfil');
        const formEmail = document.getElementById('formEmail');
        document.getElementById('mostrarPasswordEmail')?.addEventListener('click', () => {
            mostrarPassword(document.getElementById('contrasenaEmail'));
        });

        const formNewPassword = document.getElementById('formNewPassword');
        document.getElementById('mostrarPasswordNuevaContrasena')?.addEventListener('click', () => {
            mostrarPassword(document.getElementById('passwordActual'));
            mostrarPassword(document.getElementById('newPassword'));
            mostrarPassword(document.getElementById('confirmNewPassword'));

        });

        const formContacto = document.getElementById('formContacto');

        // Llamar a la función para cargar los avatares cuando se abra el modal
        document.getElementById('staticBackdrop').addEventListener('show.bs.modal', loadAvatars);

        /*Variables "Locales script" */
        let selectedAvatar = null; //Selecion de avatar

        async function loadAvatars() {
            const avatarList = document.getElementById('avatar-list');
            const acceptButton = document.getElementById('acceptButton');
            const cambiarImg = document.getElementById('cambiarImg');

            // Limpiar el contenido anterior
            avatarList.innerHTML = '';
            try {
                const existingSpinner = avatarList.querySelector('.spinner');
                if (existingSpinner) {
                    avatarList.removeChild(existingSpinner);
                }
                const spinnerElement = spinner();
                spinnerElement.style.padding = '0';
                spinnerElement.style.margin = '0';

                avatarList.appendChild(spinnerElement);
                const response = await fetch('http://localhost:3000/backend/helpers/getAvatars.php');
                avatarList.removeChild(spinnerElement);
                if (!response.ok) {
                    throw new Error('Error al cargar las imágenes');
                }

                const avatars = await response.json();

                avatars.forEach((avatar) => {
                    const button = document.createElement('button');
                    button.classList.add('col-4', 'btnAvatar');

                    let avatarImg = document.createElement('img');
                    avatarImg.src = avatar;
                    avatarImg.alt = "Avatar";
                    button.appendChild(avatarImg);

                    // Ruta relativa
                    let rutaRelativa = avatar;
                    let regex = /^(\.\.\/)+/;
                    let rutaAbsoluta = rutaRelativa.replace(regex, "http://localhost:5500/");
                    if (cambiarImg.src === rutaAbsoluta) {
                        button.classList.add('selected');
                    }
                    button.style.cursor = "pointer";
                    // Evento para seleccionar el avatar
                    button.addEventListener('click', () => {
                        // Remueve la clase 'selected' de otros botones
                        document.querySelectorAll('#avatar-list button').forEach(btn => btn.classList.remove('selected'));

                        // Agrega la clase al botón seleccionado
                        button.classList.add('selected');

                        // Habilita el botón de aceptar
                        if (cambiarImg.src !== rutaAbsoluta) {
                            acceptButton.disabled = false;
                        } else {
                            acceptButton.disabled = true;
                        }

                        // Guarda la URL del avatar seleccionado
                        selectedAvatar = avatar;
                    });

                    avatarList.appendChild(button);
                });

            } catch (error) {
                console.error('Error al cargar los avatares:', error);
                avatarList.innerHTML = `<p style="color: red;">Error al cargar los avatares.</p>`;
            }
        }
        document.getElementById('btnCloseModal').addEventListener('click', () => {
            selectedAvatar = null;
            // Deshabilitar el botón de aceptación después de la selección
            acceptButton.disabled = true;
        });
        // Evento para el botón de aceptar
        acceptButton.addEventListener('click', () => {
            if (selectedAvatar) {
                cambiarImg.src = selectedAvatar;
            } else {
                alert('Por favor, selecciona un avatar.');
            }
            // Deshabilitar el botón de aceptación después de la selección
            acceptButton.disabled = true;
        });

        formPersonalizarPerfil.addEventListener('submit', async (e) => {
            e.preventDefault();
            const alerta = document.getElementById('alertaEditarPerfil');
            const img = formPersonalizarPerfil.cambiarImg.src;
            const nombre = formPersonalizarPerfil.cambioNameUsuario;

            borrarAlerta(alerta);
            nombre.classList.remove('error');
            if (nombre.value.trim() === "") {
                nombre.classList.add('error');
                alerta.appendChild(alertDanger("El nombre es obligatorio"));
            } else {

                try {

                    // Verificamos si ya existe un spinner en el div
                    var existingSpinner = alerta.querySelector('.spinner'); // Asegúrate de que '.spinner' es un selector único

                    if (existingSpinner) {
                        // Si existe, lo eliminamos
                        alerta.removeChild(existingSpinner);
                    }
                    //Spinner
                    const spinnerElement = spinner();
                    spinnerElement.style.marginTop = '30px';
                    spinnerElement.style.marginBottom = '10px';
                    alerta.appendChild(spinnerElement);
                    document.getElementById("guardarCambios").style.display = "none";

                    const { id } = usuarioData;
                    const datos = {
                        id: id,
                        nombreActual: usuarioData.nombre,
                        img: img,
                        nombre: nombre.value
                    }
                    const response = await fetch('http://localhost:3000/backend/controllers/controllerPerfilConfig/personalizarPerfil.php', {
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

                    // Verificamos si ya existe un spinner en el div
                    var existingSpinner = alerta.querySelector('.spinner'); // Asegúrate de que '.spinner' es un selector único
                    document.getElementById("guardarCambios").style.display = "block";
                    if (existingSpinner) {
                        // Si existe, lo eliminamos
                        alerta.removeChild(existingSpinner);
                    }
                    borrarAlerta(alerta);

                    if (!data["success"]) {
                        if (typeof data.error === "string") {
                            // Si error es un string, lo mostramos directamente
                            alerta.appendChild(alertDanger(data.error));
                        } else if (typeof data.error === "object") {
                            // Si error es un objeto, obtenemos la primera clave y mostramos el mensaje
                            const key = Object.keys(data.error)[0]; // "password" o "email"

                            if ("nombre" === key) {
                                nombre.classList.add('error'); // Marca el campo con error
                            }
                            // Mostrar el mensaje de error
                            alerta.appendChild(alertDanger(data.error[key]));
                        }
                    } else if (data["success"]) {
                        document.getElementById("guardarCambios").style.display = "none";
                        alerta.appendChild(alertSuccess(data["exito"]));
                        await guardarCambiosStorage();
                        setTimeout(() => {
                            window.location.reload(); // Recarga la página después de 1 segundo
                        }, 500);

                    }
                } catch (error) {
                    console.error("Error al enviar los datos:", error);
                }
            }
        });

        formEmail?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const alerta = document.getElementById('alertasNuevoEmail');

            // Obtener todos los campos del formulario
            const campos = [formEmail.email, formEmail.newEmail, formEmail.contrasenaEmail];

            // Limpiar el estilo de error antes de la validación
            campos.forEach(campo => campo.classList.remove('error'));

            let hayErrores = false; //Para saber si tiene el formulario errores antes de pasarlo al backend
            // Validar si los campos están vacíos y aplicar el estilo de error
            campos.forEach(campo => {
                if (campo.value.trim() === "") {
                    campo.classList.add('error');
                    hayErrores = true;
                }
            });

            //Para que no genere muchas alertas
            borrarAlerta(alerta);

            // Validar campos vacíos
            if (hayErrores) {
                alerta.appendChild(alertDanger("Todos los campos son obligatorios"));
            } else {
                try {
                    // Verificamos si ya existe un spinner en el div
                    var existingSpinner = alerta.querySelector('.spinner'); // Asegúrate de que '.spinner' es un selector único

                    if (existingSpinner) {
                        // Si existe, lo eliminamos
                        alerta.removeChild(existingSpinner);
                    }
                    //Spinner
                    const spinnerElement = spinner();
                    spinnerElement.style.marginTop = '30px';
                    spinnerElement.style.marginBottom = '10px';
                    alerta.appendChild(spinnerElement);
                    document.getElementById("btnRestablecerEmail").style.display = "none";

                    //Id del usaurio actual
                    const { id } = usuarioData;
                    const datos = {
                        id: id,
                        email: formEmail.email.value,
                        newEmail: formEmail.newEmail.value,
                        constrasena: formEmail.contrasenaEmail.value
                    }
                    const response = await fetch('http://localhost:3000/backend/controllers/controllerPerfilConfig/cambiarEmail.php', {
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

                    // Verificamos si ya existe un spinner en el div
                    var existingSpinner = alerta.querySelector('.spinner'); // Asegúrate de que '.spinner' es un selector único
                    document.getElementById("btnRestablecerEmail").style.display = "block";
                    if (existingSpinner) {
                        // Si existe, lo eliminamos
                        alerta.removeChild(existingSpinner);
                    }
                    borrarAlerta(alerta);

                    if (!data["success"]) {
                        if (typeof data.error === "string") {
                            // Si error es un string, lo mostramos directamente
                            alerta.appendChild(alertDanger(data.error));
                        } else if (typeof data.error === "object") {
                            // Si error es un objeto, obtenemos la primera clave y mostramos el mensaje
                            const key = Object.keys(data.error)[0];
                            campos.forEach(campo => {
                                if (campo.id === key) {
                                    campo.classList.add('error'); // Marca el campo con error
                                }
                            });
                            // Mostrar el mensaje de error
                            alerta.appendChild(alertDanger(data.error[key]));
                        }
                    } else if (data["success"]) {
                        document.getElementById("btnRestablecerEmail").style.display = "none";
                        alerta.appendChild(alertSuccess(data["exito"]));
                        await guardarCambiosStorage();
                        setTimeout(() => {
                            window.location.reload(); // Recarga la página después de 1 segundo
                        }, 500);

                    }
                } catch (error) {
                    console.error("Error al enviar los datos:", error);
                }
            }
        });

        formNewPassword?.addEventListener('submit', async (e) => {
            e.preventDefault();
            const alerta = document.getElementById('alertasNuevaContrasena');

            // Obtener todos los campos del formulario
            const campos = [formNewPassword.passwordActual, formNewPassword.newPassword, formNewPassword.confirmNewPassword];

            // Limpiar el estilo de error antes de la validación
            campos.forEach(campo => campo.classList.remove('error'));

            let hayErrores = false; //Para saber si tiene el formulario errores antes de pasarlo al backend
            // Validar si los campos están vacíos y aplicar el estilo de error
            campos.forEach(campo => {
                if (campo.value.trim() === "") {
                    campo.classList.add('error');
                    hayErrores = true;
                }
            });

            //Para que no genere muchas alertas
            borrarAlerta(alerta);

            // Validar campos vacíos
            if (hayErrores) {
                alerta.appendChild(alertDanger("Todos los campos son obligatorios"));
            } else {
                try {
                    // Verificamos si ya existe un spinner en el div
                    var existingSpinner = alerta.querySelector('.spinner'); // Asegúrate de que '.spinner' es un selector único

                    if (existingSpinner) {
                        // Si existe, lo eliminamos
                        alerta.removeChild(existingSpinner);
                    }
                    //Spinner
                    const spinnerElement = spinner();
                    spinnerElement.style.marginTop = '30px';
                    spinnerElement.style.marginBottom = '10px';
                    alerta.appendChild(spinnerElement);
                    document.getElementById("btnRestablecerContrasena").style.display = "none";

                    //Id del usaurio actual
                    const { id } = usuarioData;
                    const datos = {
                        id: id,
                        passwordActual: formNewPassword.passwordActual.value,
                        newPassword: formNewPassword.newPassword.value,
                        confirmNewPassword: formNewPassword.confirmNewPassword.value
                    }
                    const response = await fetch('http://localhost:3000/backend/controllers/controllerPerfilConfig/cambiarContrasena.php', {
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

                    // Verificamos si ya existe un spinner en el div
                    var existingSpinner = alerta.querySelector('.spinner'); // Asegúrate de que '.spinner' es un selector único
                    document.getElementById("btnRestablecerContrasena").style.display = "block";
                    if (existingSpinner) {
                        // Si existe, lo eliminamos
                        alerta.removeChild(existingSpinner);
                    }
                    borrarAlerta(alerta);

                    if (!data["success"]) {
                        if (typeof data.error === "string") {
                            // Si error es un string, lo mostramos directamente
                            alerta.appendChild(alertDanger(data.error));
                        } else if (typeof data.error === "object") {
                            // Si error es un objeto, obtenemos la primera clave y mostramos el mensaje
                            const key = Object.keys(data.error)[0];
                            campos.forEach(campo => {
                                if (campo.id === key) {
                                    campo.classList.add('error'); // Marca el campo con error
                                }
                            });
                            // Mostrar el mensaje de error
                            alerta.appendChild(alertDanger(data.error[key]));
                        }
                    } else if (data["success"]) {
                        document.getElementById("btnRestablecerContrasena").style.display = "none";
                        alerta.appendChild(alertSuccess(data["exito"]));
                        await guardarCambiosStorage();
                        setTimeout(() => {
                            window.location.reload(); // Recarga la página después de 1 segundo
                        }, 500);

                    }
                } catch (error) {
                    console.error("Error al enviar los datos:", error);
                }
            }
        });

        formContacto.addEventListener('submit', async (e) => {
            e.preventDefault();
            const alerta = document.getElementById('alertasContacto');
            const textContacto = formContacto.contacto;

            borrarAlerta(alerta);
            textContacto.classList.remove('error');

            if (textContacto.value.trim() === "") {
                textContacto.classList.add('error');
                alerta.appendChild(alertDanger("Por favor, ingresa un mensaje"));
            } else {
                try {
                    // Verificamos si ya existe un spinner en el div
                    var existingSpinner = alerta.querySelector('.spinner'); // Asegúrate de que '.spinner' es un selector único

                    if (existingSpinner) {
                        // Si existe, lo eliminamos
                        alerta.removeChild(existingSpinner);
                    }
                    //Spinner
                    const spinnerElement = spinner();
                    spinnerElement.style.marginTop = '30px';
                    spinnerElement.style.marginBottom = '10px';
                    alerta.appendChild(spinnerElement);
                    document.getElementById("btnEnviarContacto").style.display = "none";

                    //Id del usaurio actual
                    const { email, nombre } = usuarioData;
                    const datos = {
                        email: email,
                        mensaje: textContacto.value,
                        usuario: nombre
                    }
                    const response = await fetch('http://localhost:3000/backend/controllers/controllerPerfilConfig/contacto.php', {
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

                    // Verificamos si ya existe un spinner en el div
                    var existingSpinner = alerta.querySelector('.spinner'); // Asegúrate de que '.spinner' es un selector único
                    document.getElementById("btnEnviarContacto").style.display = "block";
                    if (existingSpinner) {
                        // Si existe, lo eliminamos
                        alerta.removeChild(existingSpinner);
                    }
                    borrarAlerta(alerta);

                    if (!data["success"]) {
                        if (typeof data.error === "string") {
                            // Si error es un string, lo mostramos directamente
                            alerta.appendChild(alertDanger(data.error));
                        } else if (typeof data.error === "object") {
                            // Si error es un objeto, obtenemos la primera clave y mostramos el mensaje
                            const key = Object.keys(data.error)[0]; // "password" o "email"

                            if ("mensaje" === key) {
                                textContacto.classList.add('error'); // Marca el campo con error
                            }
                            // Mostrar el mensaje de error
                            alerta.appendChild(alertDanger(data.error[key]));
                        }
                    } else if (data["success"]) {
                        document.getElementById("btnEnviarContacto").style.display = "none";
                        alerta.appendChild(alertSuccess(data["exito"]));
                        await guardarCambiosStorage();
                    }
                } catch (error) {
                    console.error("Error al enviar los datos:", error);
                }
            }
        });
        /*Funciones */
        function perfilInformacion() {
            const { nombre, fecha_registro, avatar } = usuarioData;
            document.getElementById('nombreUsuario').innerText = nombre;
            document.getElementById('registro').innerText = `Miembro desde: ${formatDate(fecha_registro)}`;
            document.getElementById('imgUsuario').src = (avatar === null ? '/img/avatares/sinAvatar.png' : avatar + `?v=${new Date().getTime()}`);  //Por si el avatar es null
        }
        function configPerfil() {
            const divEmail = document.getElementById('v-pills-email');
            const divContrasena = document.getElementById('v-pills-contrasena');

            /*Personalizar perfil */
            const { metodo_registro, nombre, avatar } = usuarioData;
            document.getElementById('cambiarImg').src = (avatar === null ? '/img/avatares/sinAvatar.png' : avatar + `?v=${new Date().getTime()}`); //Por si el avatar es null
            document.getElementById('cambioNameUsuario').value = nombre;

            /*Comprobamos si viene de google */
            if (metodo_registro === "google") {
                //Para la contrasena
                // Crear contenedor principal
                const divMain = document.createElement('div');
                divMain.classList.add('d-flex', 'align-items-center', 'justify-content-center');

                // Crear la tarjeta
                const divCard = document.createElement('div');
                divCard.classList.add('card', 'text-white', 'card-google-login-message', 'mb-3');

                // Crear el encabezado de la tarjeta
                const divCardHeader = document.createElement('div');
                divCardHeader.classList.add('card-header', 'fw-bold', 'text-center', 'text-danger');
                divCardHeader.textContent = 'Cambio de contraseña deshabilitado';

                // Crear el cuerpo de la tarjeta
                const divCardBody = document.createElement('div');
                divCardBody.classList.add('card-body');

                // Crear el texto dentro del cuerpo de la tarjeta
                const pCardText = document.createElement('p');
                pCardText.classList.add('card-text', 'text-light');
                pCardText.textContent = 'No es posible cambiar tu contraseña ya que iniciaste sesión utilizando tu cuenta de Google';

                // Agregar los elementos al DOM
                divCardBody.appendChild(pCardText);
                divCard.appendChild(divCardHeader);
                divCard.appendChild(divCardBody);
                divMain.appendChild(divCard);

                // Agregar el contenedor de la contrasena
                divContrasena.appendChild(divMain);

                //Correo electronico no permitido
                // Crear contenedor principal
                const container = document.createElement('div');
                container.classList.add('d-flex', 'align-items-center', 'justify-content-center');

                // Crear la tarjeta
                const emailCard = document.createElement('div');
                emailCard.classList.add('card', 'text-white', 'card-google-login-message', 'mb-3');

                // Crear el encabezado de la tarjeta
                const emailCardHeader = document.createElement('div');
                emailCardHeader.classList.add('card-header', 'fw-bold', 'text-center', 'text-danger');
                emailCardHeader.textContent = 'Cambio de correo deshabilitado';

                // Crear el cuerpo de la tarjeta
                const emailCardBody = document.createElement('div');
                emailCardBody.classList.add('card-body');

                // Crear el texto dentro del cuerpo de la tarjeta
                const emailCardText = document.createElement('p');
                emailCardText.classList.add('card-text', 'text-light');
                emailCardText.textContent = 'No es posible cambiar tu correo ya que iniciaste sesión utilizando tu cuenta de correo electrónico';

                // Agregar los elementos al DOM
                emailCardBody.appendChild(emailCardText);
                emailCard.appendChild(emailCardHeader);
                emailCard.appendChild(emailCardBody);
                container.appendChild(emailCard);

                // Agregar el contenedor de correo
                divEmail.appendChild(container);

            } else {
                //Para la contrasena
                // Crear el div contenedor
                const divContainer = document.createElement('div');
                divContainer.classList.add('mb-2', 'mx-4');

                // Crear el formulario (renombrado a passwordForm)
                const passwordForm = document.createElement('form');
                passwordForm.classList.add('p-4');
                passwordForm.id = 'formNewPassword';

                // Crear el campo de usuario (oculto)
                const fakeUsernameInput = document.createElement('input');
                fakeUsernameInput.type = 'text';
                fakeUsernameInput.id = 'fakeUsername';
                fakeUsernameInput.name = 'fakeUsername';
                fakeUsernameInput.autocomplete = 'username';
                fakeUsernameInput.style.display = 'none';

                // Agregar el campo de usuario al formulario
                passwordForm.appendChild(fakeUsernameInput);

                // Crear el campo de contraseña actual
                const passwordActualDiv = document.createElement('div');
                passwordActualDiv.classList.add('mb-3');

                const passwordActualLabel = document.createElement('label');
                passwordActualLabel.setAttribute('for', 'passwordActual');
                passwordActualLabel.classList.add('fw-bold', 'form-label');
                passwordActualLabel.textContent = 'Contraseña actual';

                const passwordActualInput = document.createElement('input');
                passwordActualInput.type = 'password';
                passwordActualInput.classList.add('form-control');
                passwordActualInput.id = 'passwordActual';
                passwordActualInput.name = 'passwordActual';
                passwordActualInput.autocomplete = 'new-password';
                passwordActualInput.placeholder = '***********';

                // Agregar elementos al campo de contraseña actual
                passwordActualDiv.appendChild(passwordActualLabel);
                passwordActualDiv.appendChild(passwordActualInput);
                passwordForm.appendChild(passwordActualDiv);

                // Crear el campo de nueva contraseña
                const newPasswordDiv = document.createElement('div');
                newPasswordDiv.classList.add('mb-3');

                const newPasswordLabel = document.createElement('label');
                newPasswordLabel.setAttribute('for', 'newPassword');
                newPasswordLabel.classList.add('fw-bold', 'form-label');
                newPasswordLabel.textContent = 'Nueva contraseña';

                const newPasswordInput = document.createElement('input');
                newPasswordInput.type = 'password';
                newPasswordInput.classList.add('form-control');
                newPasswordInput.id = 'newPassword';
                newPasswordInput.name = 'newPassword';
                newPasswordInput.autocomplete = 'new-password';
                newPasswordInput.placeholder = '***********';

                // Agregar elementos al campo de nueva contraseña
                newPasswordDiv.appendChild(newPasswordLabel);
                newPasswordDiv.appendChild(newPasswordInput);
                passwordForm.appendChild(newPasswordDiv);

                // Crear el campo de confirmar nueva contraseña
                const confirmNewPasswordDiv = document.createElement('div');
                confirmNewPasswordDiv.classList.add('mb-3');

                const confirmNewPasswordLabel = document.createElement('label');
                confirmNewPasswordLabel.setAttribute('for', 'confirmNewPassword');
                confirmNewPasswordLabel.classList.add('fw-bold', 'form-label');
                confirmNewPasswordLabel.textContent = 'Confirmar nueva contraseña';

                const confirmNewPasswordInput = document.createElement('input');
                confirmNewPasswordInput.type = 'password';
                confirmNewPasswordInput.classList.add('form-control');
                confirmNewPasswordInput.id = 'confirmNewPassword';
                confirmNewPasswordInput.name = 'confirmNewPassword';
                confirmNewPasswordInput.autocomplete = 'new-password';
                confirmNewPasswordInput.placeholder = '***********';

                // Agregar elementos al campo de confirmar nueva contraseña
                confirmNewPasswordDiv.appendChild(confirmNewPasswordLabel);
                confirmNewPasswordDiv.appendChild(confirmNewPasswordInput);
                passwordForm.appendChild(confirmNewPasswordDiv);

                // Crear el campo de checkbox para mostrar contraseñas
                const checkboxDiv = document.createElement('div');
                checkboxDiv.classList.add('mb-3', 'form-check');

                const checkboxInput = document.createElement('input');
                checkboxInput.type = 'checkbox';
                checkboxInput.classList.add('form-check-input');
                checkboxInput.id = 'mostrarPasswordNuevaContrasena';

                const checkboxLabel = document.createElement('label');
                checkboxLabel.classList.add('form-check-label');
                checkboxLabel.setAttribute('for', 'mostrarPasswordNuevaContrasena');
                checkboxLabel.textContent = 'Mostrar contraseñas';

                // Agregar el checkbox al formulario
                checkboxDiv.appendChild(checkboxInput);
                checkboxDiv.appendChild(checkboxLabel);
                passwordForm.appendChild(checkboxDiv);

                // Crear el botón de guardar cambios
                const saveButton = document.createElement('button');
                saveButton.id = 'btnRestablecerContrasena';
                saveButton.type = 'submit';
                saveButton.name = 'enviar';
                saveButton.classList.add('fw-bold', 'col-12', 'btn');
                saveButton.textContent = 'Guardar cambios';

                // Agregar el botón al formulario
                passwordForm.appendChild(saveButton);

                // Crear el div para alertas
                const alertDiv = document.createElement('div');
                alertDiv.classList.add('col-12', 'm-0', 'mt-2', 'p-0', 'text-center');
                alertDiv.id = 'alertasNuevaContrasena';

                // Agregar el div de alertas al formulario
                passwordForm.appendChild(alertDiv);

                // Agregar el formulario al div contenedor
                divContainer.appendChild(passwordForm);

                // Agregar el contenedor de la contrasena
                divContrasena.appendChild(divContainer);

                //Para email
                // Crear el contenedor principal
                const formContainer = document.createElement('div');
                formContainer.classList.add('mb-2', 'mx-4');

                // Crear el formulario
                const form = document.createElement('form');
                form.classList.add('p-4');
                form.id = 'formEmail';

                // Crear el campo para el correo electrónico actual
                const currentEmailGroup = document.createElement('div');
                currentEmailGroup.classList.add('mb-3');
                const currentEmailLabel = document.createElement('label');
                currentEmailLabel.classList.add('fw-bold', 'form-label');
                currentEmailLabel.setAttribute('for', 'email');
                currentEmailLabel.textContent = 'Correo electrónico actual';
                const currentEmailInput = document.createElement('input');
                currentEmailInput.classList.add('form-control');
                currentEmailInput.setAttribute('type', 'email');
                currentEmailInput.setAttribute('id', 'email');
                currentEmailInput.setAttribute('placeholder', 'Ingresa tu correo electrónico');
                currentEmailInput.setAttribute('autocomplete', 'email');
                currentEmailGroup.appendChild(currentEmailLabel);
                currentEmailGroup.appendChild(currentEmailInput);

                // Crear el campo para el nuevo correo electrónico
                const newEmailGroup = document.createElement('div');
                newEmailGroup.classList.add('mb-3');
                const newEmailLabel = document.createElement('label');
                newEmailLabel.classList.add('fw-bold', 'form-label');
                newEmailLabel.setAttribute('for', 'newEmail');
                newEmailLabel.textContent = 'Nuevo correo electrónico';
                const newEmailInput = document.createElement('input');
                newEmailInput.classList.add('form-control');
                newEmailInput.setAttribute('type', 'email');
                newEmailInput.setAttribute('id', 'newEmail');
                newEmailInput.setAttribute('placeholder', 'Ingresa tu nuevo correo electrónico');
                newEmailInput.setAttribute('autocomplete', 'email');
                newEmailGroup.appendChild(newEmailLabel);
                newEmailGroup.appendChild(newEmailInput);

                // Crear el campo para la contraseña
                const passwordGroup = document.createElement('div');
                passwordGroup.classList.add('mb-3');
                const passwordLabel = document.createElement('label');
                passwordLabel.classList.add('fw-bold', 'form-label');
                passwordLabel.setAttribute('for', 'contrasenaEmail');
                passwordLabel.textContent = 'Contraseña';
                const passwordInput = document.createElement('input');
                passwordInput.classList.add('form-control');
                passwordInput.setAttribute('type', 'password');
                passwordInput.setAttribute('id', 'contrasenaEmail');
                passwordInput.setAttribute('name', 'contrasenaEmail');
                passwordInput.setAttribute('autocomplete', 'new-password');
                passwordInput.setAttribute('placeholder', '***********');
                passwordGroup.appendChild(passwordLabel);
                passwordGroup.appendChild(passwordInput);

                // Crear la casilla para mostrar/ocultar la contraseña
                const showPasswordGroup = document.createElement('div');
                showPasswordGroup.classList.add('mb-3', 'form-check');
                const showPasswordCheckbox = document.createElement('input');
                showPasswordCheckbox.classList.add('form-check-input');
                showPasswordCheckbox.setAttribute('type', 'checkbox');
                showPasswordCheckbox.setAttribute('id', 'mostrarPasswordEmail');
                const showPasswordLabel = document.createElement('label');
                showPasswordLabel.classList.add('form-check-label');
                showPasswordLabel.setAttribute('for', 'mostrarPasswordEmail');
                showPasswordLabel.textContent = 'Mostrar contraseña';
                showPasswordGroup.appendChild(showPasswordCheckbox);
                showPasswordGroup.appendChild(showPasswordLabel);

                // Crear el botón de enviar
                const submitButton = document.createElement('button');
                submitButton.classList.add('fw-bold', 'col-12', 'btn');
                submitButton.setAttribute('id', 'btnRestablecerEmail');
                submitButton.setAttribute('type', 'submit');
                submitButton.setAttribute('name', 'enviar');
                submitButton.textContent = 'Guardar cambios';

                // Crear el contenedor para las alertas
                const alertContainer = document.createElement('div');
                alertContainer.classList.add('col-12', 'm-0', 'mt-2', 'p-0', 'text-center');
                alertContainer.setAttribute('id', 'alertasNuevoEmail');

                // Agregar todos los elementos al formulario
                form.appendChild(currentEmailGroup);
                form.appendChild(newEmailGroup);
                form.appendChild(passwordGroup);
                form.appendChild(showPasswordGroup);
                form.appendChild(submitButton);
                form.appendChild(alertContainer);

                // Agregar el formulario al contenedor principal
                formContainer.appendChild(form);

                // Agregar el contenedor de correo
                divEmail.appendChild(formContainer);
            }
        }

    } catch (error) {
        console.log(error);
    }
}