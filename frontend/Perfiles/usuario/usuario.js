import { cardMensajeError, obtenerRelaciones, eliminarSeguimiento, sinResultado, redesSociales, obtenerDatosUsuario, formatDate, spinner, borrarSpinner, limpiarHTML, alertDanger, alertSuccess } from '../../js/funciones.js';

document.addEventListener('DOMContentLoaded', iniciarUsuario);

async function iniciarUsuario() {
    /*Lo dejo para avisar al usuario esta cargando */
    const divAlertasUsuario = document.getElementById('alertasUsuario');
    const elementSpinner = spinner();
    elementSpinner.style.marginBottom = '400px';
    divAlertasUsuario.appendChild(elementSpinner);
    document.getElementById('contenidoTotal').style.display = 'none'; /*Ocultamos el contenido principal */

    // Obtener el valor del parámetro 'id' desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const datosUsuario = await obtenerDatosUsuario(urlParams.get('id'));

    if (!datosUsuario.contenidoUsuario) { /*Si el usuario no existe mandamos al usuario un mensaje de resultado no encontrado*/
        borrarSpinner(divAlertasUsuario);
        usuarioNoEncontrado();
    } else {
        /*Los datos del usuario que inicio sesion */
        const usuarioSession = JSON.parse(localStorage.getItem("usuarioData"));

        /*Sacamos el id del usuario */
        const idUsuario = datosUsuario.contenidoUsuario.id_usuario;
        /* Esperamos a las promesas*/
        const listasDeJuegos = await obtenerListas(datosUsuario);
        const obtenerListResenas = await obtenerResenasUsuario(idUsuario);
        const relaciones = await obtenerRelaciones(idUsuario);

        if (usuarioSession && usuarioSession.id !== idUsuario) {
            const isSeguimiento = await estadoSeguimiento(usuarioSession.id, idUsuario);

            if (isSeguimiento.success) {
                mostrarBotonSeguimiento(isSeguimiento);
            }
        }
        perfilInformacion(datosUsuario);
        mostrarListas();
        mostrarResenasUsuario();
        mostrarRelaciones(relaciones);
        borrarSpinner(divAlertasUsuario);
        document.getElementById('contenidoTotal').style.display = 'block';



        function perfilInformacion(datosUsuario) {
            const { nombre_usuario, fecha_registro, avatar, sobremi, steam, youtube, discord } = datosUsuario.contenidoUsuario;
            document.getElementById('nombreUsuario').innerText = nombre_usuario;
            document.getElementById('registro').innerText = `Miembro desde: ${formatDate(fecha_registro)}`;
            document.getElementById('imgUsuario').src = (avatar === null ? '/img/avatares/sinAvatar.png' : avatar + `?v=${new Date().getTime()}`);  //Por si el avatar es null

            /*Si existe sobre mi, agregamos su card */
            if (sobremi) {
                const divAcercaDeMi = document.getElementById('acercaDeMi');
                // Crear la estructura del div "card"
                const card = document.createElement('div');
                card.classList.add('card');

                // Crear la cabecera de la tarjeta
                const cardHeader = document.createElement('div');
                cardHeader.classList.add('card-header');

                const cardTitle = document.createElement('h5');
                cardTitle.classList.add('card-title', 'text-center', 'fw-bold');
                cardTitle.textContent = 'Acerca de mí';

                cardHeader.appendChild(cardTitle);

                // Crear el cuerpo de la tarjeta
                const cardBody = document.createElement('div');
                cardBody.classList.add('card-body');

                const cardText = document.createElement('p');
                cardText.classList.add('card-text', 'parrafoAcercaDeMi');

                // Opcional: Puedes agregar contenido a la etiqueta <p> aquí si lo deseas
                cardText.textContent = sobremi;

                cardBody.appendChild(cardText);

                // Agregar la cabecera y el cuerpo a la tarjeta
                card.appendChild(cardHeader);
                card.appendChild(cardBody);

                divAcercaDeMi.appendChild(card);
            }
            redesSociales(discord, steam, youtube);
        }
        /*Segumiento */
        function mostrarBotonSeguimiento(isSeguimiento) {
            const divBoton = document.getElementById('botonSeguimiento');

            if (isSeguimiento.sigue) {
                const button = document.createElement("button");
                button.type = "button";
                button.setAttribute("data-bs-toggle", "modal");
                button.setAttribute("data-bs-target", "#deleteSeguimiento");
                button.className = "mb-4 btn btn-outline-danger";

                const icon = document.createElement("i");
                icon.className = "bi bi-person-x-fill me-1";

                button.appendChild(icon);
                button.appendChild(document.createTextNode(" Dejar de seguir"));

                divBoton.appendChild(button);

            } else {
                const button = document.createElement("button");
                button.type = "button";
                button.setAttribute("data-bs-toggle", "modal");
                button.setAttribute("data-bs-target", "#confirmSeguimiento");
                button.className = "mb-4 btn btn-outline-success";

                const icon = document.createElement("i");
                icon.className = "bi bi-person-plus-fill me-1";

                button.appendChild(icon);
                button.appendChild(document.createTextNode(" Seguir"));

                divBoton.appendChild(button);
            }
        }
        async function estadoSeguimiento(usuarioSession, idUsuario) {
            const datos = {
                idUsuario: usuarioSession,
                idSeguido: idUsuario
            }
            const response = await fetch('http://localhost:3000/backend/helpers/getEstadoSeguimiento.php', {
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
        /*Agregar seguimiento */
        document.getElementById('confirmarSeguimientoBTN')?.addEventListener('click', async (e) => {
            const alerta = document.getElementById('alertaConfirmSeguimiento');
            e.preventDefault();

            document.querySelectorAll("#confirmSeguimiento .modal-footer button").forEach(button => {
                button.style.display = "none";
            });

            const elementSpinner = spinner();
            elementSpinner.style.margin = 'auto';
            alerta.appendChild(elementSpinner);

            const data = await agregarSeguimiento(usuarioSession.id, idUsuario);
            console.log(data);
            borrarSpinner(alerta);

            if (!data["success"]) {
                // Mostrar el mensaje de error
                alerta.appendChild(alertDanger(data.error[key]));
            } else if (data["success"]) {
                alerta.appendChild(alertSuccess(data["exito"]));
            }

        });
        async function agregarSeguimiento(idUsuario, idSeguido) {
            const datos = {
                idUsuario: idUsuario,
                idSeguido: idSeguido
            }
            const response = await fetch('http://localhost:3000/backend/controllers/controllerUsuario/agregarSeguimiento.php', {
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


        /*Eliminar seguimiento */
        document.getElementById('eliminarSeguimientoBTN')?.addEventListener('click', async (e) => {
            const alerta = document.getElementById('alertaDeleteSeguimiento');
            e.preventDefault();

            document.querySelectorAll("#deleteSeguimiento .modal-footer button").forEach(button => {
                button.style.display = "none";
            });

            const elementSpinner = spinner();
            elementSpinner.style.margin = 'auto';
            alerta.appendChild(elementSpinner);

            const data = await eliminarSeguimiento(usuarioSession.id, idUsuario);
            borrarSpinner(alerta);

            if (!data["success"]) {
                // Mostrar el mensaje de error
                alerta.appendChild(alertDanger(data.error[key]));
            } else if (data["success"]) {
                alerta.appendChild(alertSuccess(data["exito"]));
            }
        });

        /*Listas */
        function mostrarListas() {
            const divListas = document.getElementById('contenidoUsuarioListas');
            if (listasDeJuegos.success) {
                const { total_contenido, total_listas } = listasDeJuegos.listas;
                if (total_listas == 0) {

                    // Crear el cuerpo de la tarjeta
                    const cardBodyDiv = document.createElement('div');
                    cardBodyDiv.classList.add('card-body', 'd-flex', 'align-items-center', 'justify-content-between', 'flex-column', 'pt-2', 'pb-3');

                    // Crear el icono
                    const icon = document.createElement('i');
                    icon.classList.add('text-center', 'fs-2', 'bi', 'bi-bookmark-x-fill');

                    // Crear el título
                    const cardTitle = document.createElement('h5');
                    cardTitle.classList.add('card-title', 'fw-bold', 'text-center');
                    cardTitle.textContent = 'Este usuario aún no tiene listas de juegos';

                    // Crear el texto descriptivo
                    const cardText = document.createElement('p');
                    cardText.classList.add('card-text', 'text-center');
                    cardText.textContent = '¡Vuelve más tarde para ver si ha añadido alguna!';

                    // Agregar los elementos al cuerpo de la tarjeta
                    cardBodyDiv.appendChild(icon);
                    cardBodyDiv.appendChild(cardTitle);
                    cardBodyDiv.appendChild(cardText);

                    // Agregar la tarjeta al cuerpo del documento (o a otro elemento específico)
                    divListas.appendChild(cardBodyDiv);

                } else {
                    const fragment = document.createDocumentFragment(); // Crear el fragmento
                    total_contenido.forEach(lista => {
                        const card = document.createElement("div");
                        card.className = "card col-12 my-1 cardListaModalJuego";
                        card.id = `cardLista-${lista["id_lista"]}`;

                        const cardBody = document.createElement("div");
                        cardBody.className = "card-body cardListaModalJuego";

                        const header = document.createElement("div");
                        header.className = "d-flex justify-content-between align-items-center";

                        const title = document.createElement("h5");
                        title.className = "card-title tituloLista m-0 fw-bold";
                        title.setAttribute("data-bs-toggle", "modal");
                        title.setAttribute("data-bs-target", "#listJuegos");
                        title.textContent = lista["nombre_lista"];
                        title.title = lista["nombre_lista"];

                        header.appendChild(title);

                        const paragraph = document.createElement("p");
                        paragraph.className = "card-text fechaListaJuego";
                        paragraph.textContent = `Fecha de creación: ${lista["fecha_creacion"].toLocaleString("es-ES", { dateStyle: "short", timeStyle: "short" })}`;
                        paragraph.setAttribute("data-bs-toggle", "modal");
                        paragraph.setAttribute("data-bs-target", "#listJuegos");
                        cardBody.appendChild(header);
                        cardBody.appendChild(paragraph);
                        card.appendChild(cardBody);

                        fragment.appendChild(card); // Lo metemos al contendor principal
                    });
                    divListas.appendChild(fragment);
                }
            }

        }

        async function obtenerListas(usuarioData) {
            const { id_usuario } = usuarioData.contenidoUsuario;
            const datos = {
                id: id_usuario
            }
            const response = await fetch('http://localhost:3000/backend/helpers/getListasJuegos.php', {
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

        /*Juegos en la lista */
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

        /*Resenas */
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
            const divReviews = document.getElementById('contenidoUsuarioReviews');
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

                        headerFlexDiv.appendChild(userDiv);
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
                    // Crear el elemento div con la clase "card-body text-center"
                    const cardBodyDiv = document.createElement('div');
                    cardBodyDiv.className = 'text-center pt-0 pb-2';

                    // Crear el elemento <i> con las clases "fs-2 bi bi-chat-square-dots-fill"
                    const icon = document.createElement('i');
                    icon.className = 'fs-2 bi-chat-square-dots-fill';

                    // Crear el elemento <h5> con la clase "card-title fw-bold" y el texto
                    const title = document.createElement('h5');
                    title.className = 'card-title fw-bold';
                    title.textContent = 'Este usuario aún no tiene reseñas';

                    // Crear el elemento <p> con la clase "card-text" y el texto
                    const text = document.createElement('p');
                    text.className = 'card-text';
                    text.textContent = '¡Vuelve más tarde para ver si ha dejado alguna opinión!';

                    // Agregar los elementos al cardBodyDiv
                    cardBodyDiv.appendChild(icon);
                    cardBodyDiv.appendChild(title);
                    cardBodyDiv.appendChild(text);

                    divReviews.appendChild(cardBodyDiv);
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
        function mostrarRelaciones(relaciones) {
            const divSeguidores = document.getElementById('contenidoSeguidores');
            const divSeguidos = document.getElementById('contenidoSeguidos');
            if (relaciones) {
                if (relaciones.success) {
                    /*Mostramos a los seguidores */
                    if (relaciones.seguidores.length > 0) {
                        const divContainer = document.createElement('div');
                        divContainer.className = 'container m-0 fondoCard';
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
                        card.className = "card cardLinkAmigo";

                        const cardBody = document.createElement("div");
                        cardBody.className = "card-body text-center";

                        const icon = document.createElement("i");
                        icon.className = "fs-2 bi bi-people-fill";

                        const title = document.createElement("h5");
                        title.className = "card-title text-center";
                        title.textContent = "Aún no tiene seguidores";

                        const text = document.createElement("p");
                        text.className = "card-text text-center";
                        text.textContent = "¡Sé su primer seguidor! No te pierdas sus listas de juegos y conéctate con él";

                        cardBody.appendChild(icon);
                        cardBody.appendChild(title);
                        cardBody.appendChild(text);
                        card.appendChild(cardBody);
                        divSeguidores.appendChild(card); // Puedes cambiar document.body por otro contenedor específico
                    }

                    /*Mostramos a los seguidos */
                    if (relaciones.seguidos.length > 0) {
                        const divContainer = document.createElement('div');
                        divContainer.className = 'container m-0 fondoCard';
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

                            divCardBody.appendChild(imgAvatar);
                            divCardBody.appendChild(h5Title);

                            aTag.appendChild(divCardBody);
                            divCol.appendChild(aTag);
                            fragment.appendChild(divCol);
                        });
                        divRow.appendChild(fragment);
                        divContainer.appendChild(divRow);
                        divSeguidos.appendChild(divContainer);

                    } else {
                        const cardContainer = document.createElement('div');
                        cardContainer.classList.add('card', 'cardLinkAmigo');

                        const cardBody = document.createElement('div');
                        cardBody.classList.add('card-body', 'text-center');

                        const icon = document.createElement('i');
                        icon.classList.add('fs-2', 'bi-emoji-frown-fill');

                        const title = document.createElement('h5');
                        title.classList.add('card-title', 'text-center');
                        title.textContent = 'Este usuario no sigue a nadie';

                        cardBody.appendChild(icon);
                        cardBody.appendChild(title);
                        cardContainer.appendChild(cardBody);
                        divSeguidos.appendChild(cardContainer);
                    }
                }

            } else {
                cardMensajeError('No pudimos obtener tus seguidores. Por favor, intentalo más tarde', divSeguidores);
                cardMensajeError('No pudimos obtener tus usuarios seguidos. Por favor, intentalo más tarde', divSeguidos);
            }
        }
    }
    function usuarioNoEncontrado() {
        const idVisuales = document.querySelector('#alertasUsuario');
        idVisuales.appendChild(sinResultado());
        idVisuales.style.marginBottom = "350px";  // Aplica margen de 350px en la parte inferior para el footer
        document.getElementById('contenidoTotal').style.display = 'none';  // Oculta
        document.querySelector('footer').style.display = 'block';
    }
}