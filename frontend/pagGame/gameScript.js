import { detallesDelJuego, mostrarCapturas } from '../js/API.js';
import { mostrarToast, borrarResena, limpiarHTML, obtenerEstrellas, mostrarPlataforma, fotoUsuario, nombreUsuario, sinResultado, obtenerListas, alertDanger, borrarAlerta, spinner, alertSuccess, borrarSpinner } from '../js/funciones.js';

document.addEventListener('DOMContentLoaded', iniciarInfoGame);
// Declaración del objeto global de estado
const estado = {
    juego: null, // Aquí se guardarán los detalles del juego
    capturasJuego: null, // Aquí se guardarán las capturas del juego
};

// Función para inicializar el juego
async function inicializarJuego(juegoId) {
    try {
        estado.juego = await detallesDelJuego(juegoId); // Cargar detalles del juego
        console.log(estado.juego);
        estado.capturasJuego = await mostrarCapturas(juegoId); // Cargar capturas del juego
    } catch (error) {
        console.error("Error al inicializar el juego:", error);
        throw error; // Propaga el error si ocurre algo
    }
}

async function iniciarInfoGame() {
    ocultarContenidoPrincipal(); /*Ocultamos el contenido principal */

    // Obtener el valor del parámetro 'id' desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    await inicializarJuego(urlParams.get('id')); // Esto te dará el ID del juego y la funcion dara las capturas y la informacion 
    if (estado.juego["detail"] === 'Not found.') {
        juegoNoEncontrado();/*Mandariamos el mensaje de error juego no encontrado */
    } else {

        /*Los datos del usuario */
        const usuarioData = JSON.parse(localStorage.getItem("usuarioData"));
        console.log(usuarioData);

        const [totalResenasJuego] = await Promise.all([
            obtenerResenasJuego(urlParams.get('id')),
            mostrarContenidoModal()
        ]);
        /*Mostramos el contenido principal */
        mostrarContenidoPrincipal();
        modalResenas();
        mostrarVisuales();
        mostrarDescripcion();
        /* Selectores */
        const myTabContent = document.querySelectorAll('#myTabContent .tab-pane');

        // Obtener todos los botones de las pestañas
        const tabs = document.querySelectorAll('#myTab .nav-link');


        /*Lista desplegable para pantallas pequeñas */
        document.getElementById('tabDropdown').addEventListener('change', function () {
            let tabId = this.value;
            myTabContent.forEach(divContent => {
                if (tabId !== divContent.id) {
                    limpiarHTML(document.querySelector(`#myTabContent #${divContent.id}`));
                }
            });
            let tab = new bootstrap.Tab(document.querySelector(`[data-bs-target="#${tabId}"]`));
            tab.show();
            switch (tabId) {
                case "info":
                    mostrarDescripcion();
                    break;
                case "screenshots":
                    listaMostrarCapturas();
                    break;
                case "reviews":
                    mostrarResenas();
                    break;
                case "required":
                    mostrarRequisitos();
                    break;
            }
        });

        /* Evento de Botones Lista */
        // Escuchar los clics en cada botón
        try {
            tabs.forEach(tab => {

                tab.addEventListener('click', (evento) => {
                    myTabContent.forEach(divContent => {
                        if (evento.target.id !== divContent.getAttribute('aria-labelledby')) {
                            limpiarHTML(document.querySelector(`#myTabContent #${divContent.id}`));
                        }
                    });
                    /*Vammos a limpiar el html creado para que no haya interferencias */
                    switch (evento.target.id) {
                        case "info-tab":
                            mostrarDescripcion();
                            break;
                        case "screenshots-tab":
                            listaMostrarCapturas();
                            break;
                        case "reviews-tab":
                            mostrarResenas();
                            break;
                        case "required-tab":
                            mostrarRequisitos();
                            break;
                    }
                });
            });
        } catch (error) {
            console.log(error);
        }
        function obtenerJuego() {
            return estado.juego;
        }

        function obtenerCapturasJuego() {
            return estado.capturasJuego;
        }

        function mostrarVisuales() {
            try {
                const visuales = document.querySelector('.container #visuales');
                const juego = obtenerJuego();

                // Crear el título
                const titulo = document.createElement("h5");
                titulo.className = "tituloDelJuego";
                titulo.textContent = juego["name"];

                // Crear el contenedor principal de la imagen
                const imgPrincipal = document.createElement("div");
                imgPrincipal.className = "imgPrincipal col-12";

                imgPrincipal.style.setProperty('background-image', `url(${juego["background_image"]}?q=50)`);
                // Crear el contenedor de valoraciones
                const valoracionesMain = document.createElement("div");
                valoracionesMain.className = "valoracionesMain";

                // Crear la calificación
                const gameRating = document.createElement("div");
                gameRating.className = "game-rating";
                gameRating.textContent = obtenerEstrellas(juego["rating"]) + ` (${juego["rating"]}/5)`;

                // Agregar la calificación al contenedor de valoraciones
                valoracionesMain.appendChild(gameRating);

                // Crear el contenedor del modal
                const modalMain = document.createElement("div");
                modalMain.className = "modalMain";

                // Crear el botón del modal
                const modalButton = document.createElement("button");
                modalButton.type = "button";
                modalButton.className = "btn btn-primary";
                modalButton.setAttribute("data-bs-toggle", "modal");
                modalButton.setAttribute("data-bs-target", "#staticBackdrop");
                modalButton.textContent = "+";

                // Agregar el botón al contenedor del modal
                modalMain.appendChild(modalButton);

                // Agregar las secciones al contenedor principal
                imgPrincipal.appendChild(valoracionesMain);
                imgPrincipal.appendChild(modalMain);

                // Insertar todo en el documento
                visuales.appendChild(titulo);
                // Creamos el enlace que servira para mandar al usuario a la pagina principal del juego
                if (juego["website"]) {/*Por sin no existe el enalce web */
                    const enlace = document.createElement('a');
                    enlace.href = juego["website"]; // URL del enlace
                    enlace.target = '_blank'; // Abrir en una nueva pestaña
                    enlace.rel = 'noopener noreferrer'; // Seguridad adicional (opcional)
                    enlace.appendChild(imgPrincipal);
                    enlace.style.textDecoration = 'none';  // Elimina el subrayado
                    enlace.style.color = 'inherit';        // Elimina el color predeterminado (hereda el color del contenedor)
                    enlace.title = `Visitar la página oficial de ${juego["name"]}`;

                    // Agregar evento al enlace
                    enlace.addEventListener('click', (event) => {
                        // Si el clic ocurrió en la imagen, detener el enlace
                        if ((event.target.className === "valoracionesMain" || event.target.className === "game-rating") || event.target.className === "btn btn-primary"
                            || event.target.className === "modalMain") {
                            event.preventDefault(); // Evitar la acción del enlace
                        }
                    });


                    visuales.appendChild(enlace);

                } else {
                    visuales.appendChild(imgPrincipal);
                }

            } catch (error) {
                console.log(error);
            }
        }
        function modalResenas() {
            const divModalresenas = document.getElementById('contenidoModalReviews');
            if (!usuarioData) {
                const div = document.createElement("div");
                div.className = "modal-content";

                // Modal Header
                const modalHeader = document.createElement("div");
                modalHeader.className = "modal-header";

                const modalTitle = document.createElement("h5");
                modalTitle.className = "modal-title";
                modalTitle.id = "confirmDeleteResenaModalLabel";
                modalTitle.textContent = "Escribir reseña";

                const closeButton = document.createElement("button");
                closeButton.type = "button";
                closeButton.className = "btn-close btn-close-white";
                closeButton.setAttribute("data-bs-dismiss", "modal");
                closeButton.setAttribute("aria-label", "Close");

                modalHeader.appendChild(modalTitle);
                modalHeader.appendChild(closeButton);

                // Modal Body
                const modalBody = document.createElement("div");
                modalBody.className = "modal-body d-flex justify-content-center align-items-center flex-column";

                const icon = document.createElement("i");
                icon.className = "bi bi-chat-square-dots-fill fs-1";

                const paragraph = document.createElement("p");
                paragraph.className = "card-text fw-bold fs-5 text-center";
                paragraph.textContent = "Inicia sesión para reseñar este juego";

                const link = document.createElement("a");
                link.className = "btn btnIniciarSesion";
                link.href = "../Acceso/login/login.html";
                link.textContent = "Iniciar sesión";

                // Agregar elementos
                modalBody.appendChild(icon);
                modalBody.appendChild(paragraph);
                modalBody.appendChild(link);

                div.appendChild(modalHeader);
                div.appendChild(modalBody);

                divModalresenas.appendChild(div);
            } else {
                // Crear los elementos de la modal
                const modal = document.createElement("div");
                modal.classList.add("modal-content");

                // Modal Header
                const modalHeader = document.createElement("div");
                modalHeader.classList.add("modal-header");

                const modalTitle = document.createElement("h5");
                modalTitle.classList.add("modal-title");
                modalTitle.id = "reviewModalLabel";

                const closeButton = document.createElement("button");
                closeButton.type = "button";
                closeButton.classList.add("btn-close", "btn-close-white");
                closeButton.setAttribute("data-bs-dismiss", "modal");
                closeButton.setAttribute("aria-label", "Cerrar");

                // Agregar elementos al header
                modalHeader.appendChild(modalTitle);
                modalHeader.appendChild(closeButton);

                // Modal Body
                const modalBody = document.createElement("div");
                modalBody.classList.add("modal-body");

                const form = document.createElement("form");

                const textAreaDiv = document.createElement("div");
                const textArea = document.createElement("textarea");
                textArea.classList.add("form-control");
                textArea.id = "reviewText";
                textArea.rows = 4;
                textArea.placeholder = "Escribe tu reseña aquí...";

                textAreaDiv.appendChild(textArea);
                form.appendChild(textAreaDiv);

                const alertDiv = document.createElement("div");
                alertDiv.classList.add("col-12", "m-0", "mt-2", "p-0", "text-center");
                alertDiv.id = "alertaReview";

                // Agregar elementos al body
                modalBody.appendChild(form);
                modalBody.appendChild(alertDiv);

                // Modal Footer
                const modalFooter = document.createElement("div");
                modalFooter.classList.add("modal-footer");

                const submitButton = document.createElement("button");
                submitButton.id = "submitReview";
                submitButton.type = "button";
                submitButton.classList.add("col-12", "btn");
                submitButton.textContent = "Enviar Reseña";

                // Agregar elementos al footer
                modalFooter.appendChild(submitButton);

                // Agregar todas las partes al modal
                modal.appendChild(modalHeader);
                modal.appendChild(modalBody);
                modal.appendChild(modalFooter);

                divModalresenas.appendChild(modal);
            }
        }
        function mostrarDescripcion() {
            try {
                const divDetalleLista = document.querySelector('#myTabContent #info');
                const juego = obtenerJuego();
                const textoExistente = document.querySelector('#info #DescripcionJuego');
                if (textoExistente) { /*Esto arregla el bug de muchos textos generados*/
                    textoExistente.remove(); // Elimina el carrusel existente del DOM
                }

                const divDescripcion = document.createElement('div');
                divDescripcion.id = 'DescripcionJuego';

                const descripcionLimpia = juego['description'].replace(/<br\s*\/?>|&lt;br\s*\/?&gt;|&lt;strong&gt;|&lt;\/strong&gt;/gi, ''); // Elimina todos los <br>
                divDescripcion.innerHTML = descripcionLimpia;
                const plataformas = mostrarPlataforma(juego);
                plataformas.classList.add('child', 'fw-bold');
                plataformas.textContent = 'Plataformas: ';
                plataformas.appendChild(mostrarPlataforma(juego));

                divDetalleLista.appendChild(divDescripcion);
                divDetalleLista.appendChild(plataformas);

            } catch (error) {
                console.log(error);
            }
        }

        function listaMostrarCapturas() {
            const divScreenShots = document.querySelector('#myTabContent #screenshots');
            const capturasJuego = obtenerCapturasJuego();
            try {



                if (capturasJuego['results'].length === 1) {
                    const unicaIMG = document.querySelector('#screenshots #unicaIMG');
                    if (unicaIMG) {/*Esto arregla el bug de muchos carruseles generados =)*/
                        unicaIMG.remove(); // Elimina el carrusel existente del DOM
                    }
                    capturasJuego['results'].forEach(juego => {
                        const divImg = document.createElement('div');
                        divImg.id = 'unicaIMG';
                        divImg.classList.add('col-12');
                        const img = document.createElement('img');
                        img.classList.add('col-12');
                        img.src = juego['image'];  // Reemplaza esto con el path adecuado de tus imágenes
                        divImg.appendChild(img);
                        divScreenShots.appendChild(divImg);

                    });
                } else if (capturasJuego['results'].length > 1) {

                    const carruselExistente = document.querySelector('#screenshots #carouselExampleIndicators');
                    if (carruselExistente) {/*Esto arregla el bug de muchos carruseles generados =)*/
                        carruselExistente.remove(); // Elimina el carrusel existente del DOM
                    }

                    // Crear el contenedor principal del carrusel  
                    const carousel = document.createElement('div');
                    carousel.id = 'carouselExampleIndicators';
                    carousel.classList.add('carousel', 'slide', 'carruselPersonalizadoDJuego');

                    // Crear el contenedor de los indicadores
                    const carouselIndicators = document.createElement('div');
                    carouselIndicators.classList.add('carousel-indicators');

                    // Crear los botones para cada slide
                    capturasJuego['results'].slice(0, 4).forEach((juego, index) => {
                        const button = document.createElement('button');
                        button.type = 'button';
                        button.setAttribute('data-bs-target', '#carouselExampleIndicators');
                        button.setAttribute('data-bs-slide-to', index.toString());
                        button.setAttribute('aria-label', `Slide ${index + 1}`);

                        // Crear la imagen
                        const img = document.createElement('img');
                        img.src = `${juego['image']}?q=50`;  // Reemplaza esto con el path adecuado de tus imágenes
                        img.alt = `Slide ${index + 1}`;
                        img.classList.add('d-block', 'w-100');  // Puedes agregar clases para el estilo de la imagen

                        // Añadir la imagen al botón
                        button.appendChild(img);

                        if (index === 0) {
                            button.classList.add('active', 'custom-control-prev');
                            button.setAttribute('aria-current', 'true');
                        } else {
                            button.classList.add('custom-control-prev');

                        }
                        carouselIndicators.appendChild(button);
                    });

                    // Crear el contenedor de los items del carrusel
                    const carouselInner = document.createElement('div');
                    carouselInner.classList.add('carousel-inner');

                    // Crear los elementos de cada slide
                    capturasJuego['results'].slice(0, 4).forEach((juego, index) => {
                        const carouselItem = document.createElement('div');
                        carouselItem.classList.add('carousel-item');
                        if (index === 0) {
                            carouselItem.classList.add('active');
                        }
                        const img = document.createElement('img');
                        img.classList.add('d-block', 'w-100');
                        img.src = `${juego['image']}?q=50`;  // Aquí debes poner la URL de las imágenes
                        img.alt = `Slide ${index + 1}`;
                        carouselItem.appendChild(img);
                        carouselInner.appendChild(carouselItem);
                    });

                    // Crear los botones de navegación
                    const prevButton = document.createElement('button');
                    prevButton.classList.add('carousel-control-prev');
                    prevButton.type = 'button';
                    prevButton.setAttribute('data-bs-target', '#carouselExampleIndicators');
                    prevButton.setAttribute('data-bs-slide', 'prev');

                    const prevIcon = document.createElement('span');
                    prevIcon.classList.add('carousel-control-prev-icon');
                    prevIcon.setAttribute('aria-hidden', 'true');
                    const prevText = document.createElement('span');
                    prevText.classList.add('visually-hidden');
                    prevText.textContent = 'Previous';

                    prevButton.appendChild(prevIcon);
                    prevButton.appendChild(prevText);

                    const nextButton = document.createElement('button');
                    nextButton.classList.add('carousel-control-next');
                    nextButton.type = 'button';
                    nextButton.setAttribute('data-bs-target', '#carouselExampleIndicators');
                    nextButton.setAttribute('data-bs-slide', 'next');

                    const nextIcon = document.createElement('span');
                    nextIcon.classList.add('carousel-control-next-icon');
                    nextIcon.setAttribute('aria-hidden', 'true');
                    const nextText = document.createElement('span');
                    nextText.classList.add('visually-hidden');
                    nextText.textContent = 'Next';

                    nextButton.appendChild(nextIcon);
                    nextButton.appendChild(nextText);

                    // Agregar todos los elementos al carrusel
                    carousel.appendChild(carouselIndicators);
                    carousel.appendChild(carouselInner);
                    carouselInner.appendChild(prevButton);
                    carouselInner.appendChild(nextButton);

                    // Agregar el carrusel al body o un contenedor específico de tu HTML
                    divScreenShots.appendChild(carousel);
                }
            } catch (error) {
                console.log(error);
            }
        }
        /*Reviews (CRUD)*/
        document.getElementById('reviewModal')?.addEventListener('show.bs.modal', function (event) {
            let modalTitle = document.getElementById('reviewModalLabel');
            const { name } = estado.juego;
            if (usuarioData) {
                modalTitle.textContent = name || 'Escribir una Reseña';
            }
        });

        document.getElementById('submitReview')?.addEventListener('click', async function () {
            const alerta = document.getElementById('alertaReview');
            let reviewText = document.getElementById('reviewText').value;
            borrarAlerta(alerta);
            borrarSpinner(alerta);
            if (!reviewText) {
                alerta.appendChild(alertDanger("No puedes dejar la reseña vacía"));
            } else {
                const idJuego = estado.juego.id;
                const imageJuego = estado.juego.background_image;
                //enviar al backend la resena
                const { id } = usuarioData;

                const datos = {
                    idUsuario: id,
                    idJuego: idJuego,
                    imageJuego: imageJuego,
                    contenido: reviewText,
                }
                const spinnerElement = spinner();
                spinnerElement.style.margin = 'auto';
                spinnerElement.style.marginTop = '20px';
                alerta.appendChild(spinnerElement);
                document.getElementById("submitReview").style.display = "none";
                const data = await agregarResena(datos);
                document.getElementById("submitReview").style.display = "block";

                borrarSpinner(alerta);

                if (!data["success"]) {
                    alerta.appendChild(alertDanger(data.error));
                } else if (data["success"]) {
                    alerta.appendChild(alertSuccess(data["exito"]));
                }

            }
        });
        //Borrar resena 
        document.getElementById('confirmDeleteResenaButton').addEventListener('click', async function () {
            const alerta = document.getElementById('alertaResena');
            borrarSpinner(alerta);
            borrarAlerta(alerta);
            // Obtener el modal y los botones
            const modalFooterButtons = document.querySelectorAll('#confirmDeleteResenaModal .btn');

            // Mostrar los botones cuando el modal se abra
            modalFooterButtons.forEach(button => {
                if (!button.classList.contains("btn-close")) {
                    button.style.display = 'inline-block';
                }
            });


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
                    modalFooterButtons.forEach(button => {
                        button.style.display = 'inline-block';
                    });
                } else {
                    mostrarToast('La reseña se ha borrado correctamente', 'success');
                    tarjetaAEliminar.remove(); // Eliminar la tarjeta del DOM                   
                }
            }

            // Cerrar el modal
            const modal = bootstrap.Modal.getInstance(document.getElementById('confirmDeleteResenaModal'));
            modal.hide();

        });
        async function agregarResena(datos) {
            const response = await fetch('http://localhost:3000/backend/controllers/controllerResenas/agregarResena.php', {
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



        function mostrarResenas() {
            try {
                const juego = obtenerJuego();
                const divResenas = document.querySelector('#myTabContent #reviews');
                const textoExistente = document.querySelector('#reviews #resenas');
                if (textoExistente) { /*Esto arregla el bug de muchos textos generados*/
                    textoExistente.remove(); // Elimina el carrusel existente del DOM
                }

                //Creamos un div para las reseñas
                const resenas = document.createElement('div');
                resenas.classList.add('row', 'd-flex', 'justify-content-center', 'm-3');
                resenas.id = 'resenas';

                // Crear el contenedor principal
                const reviewCard = document.createElement("div"); // Cambiado de card a reviewCard
                reviewCard.className = "review-card escribir-resena card p-3 m-2"; // Cambié también la clase a "review-card"

                // Crear y configurar el encabezado
                const cardTitle = document.createElement("div"); // Cambiado de cardHeader a cardTitle
                cardTitle.className = "text-center fw-bold card-header";
                cardTitle.textContent = "Puntuación media de las reseñas";
                reviewCard.appendChild(cardTitle);

                // Crear el cuerpo de la tarjeta
                const cardContent = document.createElement("div"); // Cambiado de cardBody a cardContent
                cardContent.className = "card-content d-flex flex-column align-items-center text-center"; // Cambié el nombre de la clase a "card-content"

                // Crear el párrafo de la puntuación
                const ratingParagraph = document.createElement("p");
                ratingParagraph.className = "rating mb-3";
                ratingParagraph.setAttribute("aria-label", "Puntuación media: 4.48 sobre 5");
                ratingParagraph.innerHTML = obtenerEstrellas(juego["rating"]) + ` (${juego["rating"]}/5)`;
                cardContent.appendChild(ratingParagraph);

                // Crear el botón
                const button = document.createElement("button");
                button.type = "button";
                button.className = "btn";
                button.setAttribute("data-bs-toggle", "modal");
                button.setAttribute("data-bs-target", "#reviewModal");
                button.innerHTML = "¡Valora este juego! <i class=\"bi bi-pencil-square ms-2\" aria-hidden=\"true\"></i>";
                cardContent.appendChild(button);

                // Añadir el contenido de la tarjeta al contenedor principal
                reviewCard.appendChild(cardContent);

                // Añadir el contenedor principal al DOM
                resenas.appendChild(reviewCard); // Cambia esto según el lugar donde desees insertar el div


                /*Agregamos las reseñas */
                if (juego["ratings"]) { /* Por si está vacío para que no dé error */
                    const fragment = document.createDocumentFragment(); // Crear el fragmento

                    juego["ratings"].forEach(resena => {
                        // Crear el contenedor principal
                        const mensajePersonalizado = document.createElement('div');
                        mensajePersonalizado.className = 'col-12 mensajePersonalizado m-2 p-3 card';

                        // Crear el encabezado de la tarjeta
                        const cardHeader = document.createElement('div');
                        cardHeader.className = 'col-12 card-header fw-bold';

                        // Crear el contenedor que contendrá el nombre y la imagen
                        const userContainer = document.createElement('div');
                        userContainer.className = 'd-flex align-items-center'; // Usamos Flexbox para alinear

                        // Crear el elemento del nombre del usuario
                        const nombreUsuarioElement = document.createElement('span');
                        nombreUsuarioElement.className = 'nombre-usuario';
                        nombreUsuarioElement.textContent = nombreUsuario(resena["id"]);

                        // Crear el elemento de la imagen del perfil
                        const perfilImg = document.createElement('img');
                        perfilImg.className = 'perfil-img';
                        perfilImg.src = fotoUsuario(resena["id"]); // Cambia por la ruta real de la imagen
                        perfilImg.alt = 'Perfil';

                        // Agregar el nombre y la imagen al contenedor
                        userContainer.appendChild(perfilImg);
                        userContainer.appendChild(nombreUsuarioElement);

                        // Agregar el contenedor al encabezado de la tarjeta
                        cardHeader.appendChild(userContainer);
                        mensajePersonalizado.appendChild(cardHeader);

                        // Crear el cuerpo de la tarjeta
                        const cardBody = document.createElement('div');
                        cardBody.className = 'card-body';

                        // Crear el bloque de cita
                        const blockquote = document.createElement('blockquote');
                        blockquote.className = 'blockquote mb-0';

                        // Crear el párrafo de la cita
                        const quoteText = document.createElement('p');
                        quoteText.textContent = resena["title"];
                        blockquote.appendChild(quoteText);

                        // Añadir el bloque de cita al cuerpo de la tarjeta
                        cardBody.appendChild(blockquote);

                        // Añadir el cuerpo de la tarjeta al contenedor principal
                        mensajePersonalizado.appendChild(cardBody);

                        // Agregar la reseña al fragmento
                        fragment.appendChild(mensajePersonalizado);
                    });

                    // Agregar todas las reseñas al DOM en una sola operación
                    resenas.appendChild(fragment);
                }
                //Si da true porque no haya fallado con la bdd entoces se mostrara las resenas si tiene este jeugo
                if (totalResenasJuego.success) {
                    const fragment = document.createDocumentFragment(); // Crear el fragmento

                    // Reseñas ahora de nuestros usuarios
                    totalResenasJuego.resenas.forEach(resena => {
                        // Crear el elemento principal div
                        const divCol12 = document.createElement('div');
                        divCol12.classList.add('col-12', 'mensajePersonalizado', 'm-2', 'p-3', 'card');
                        divCol12.id = `Resena-${resena["id_resena"]}`;

                        // Crear el div del card-header
                        const cardHeader = document.createElement('div');
                        cardHeader.classList.add('col-12', 'card-header', 'fw-bold');

                        // Crear el div flex container
                        const flexContainer = document.createElement('div');
                        flexContainer.classList.add('d-flex', 'align-items-center', 'justify-content-between');

                        // Crear el div para el perfil y nombre de usuario
                        const profileContainer = document.createElement('div');
                        profileContainer.classList.add('d-flex', 'align-items-center');

                        // Crear el enlace con la imagen de perfil
                        const profileLink = document.createElement('a');

                        if (usuarioData && usuarioData.id == resena.id_usuario) {
                            profileLink.href = `/Perfiles/perfil/perfil.html`;
                        } else {
                            profileLink.href = `/Perfiles/usuario/usuario.html?id=${resena["id_usuario"]}`;
                        }

                        const profileImg = document.createElement('img');
                        profileImg.classList.add('perfil-img');
                        profileImg.src = resena["avatar"];
                        profileImg.alt = `Imagen usuario de ${resena["nombre_usuario"]}`;

                        if (usuarioData && usuarioData.id == resena.id_usuario) {
                            profileImg.title = `Perfil`;
                        } else {
                            profileImg.title = `Perfil de ${resena["nombre_usuario"]}`;
                        }

                        profileLink.appendChild(profileImg);

                        // Crear el span para el nombre del usuario
                        const userName = document.createElement('span');
                        userName.classList.add('nombre-usuario', 'ms-2');
                        userName.textContent = resena["nombre_usuario"];

                        // Añadir la imagen y el nombre al contenedor del perfil
                        profileContainer.appendChild(profileLink);
                        profileContainer.appendChild(userName);

                        // Añadir el perfil y el botón al contenedor flex
                        flexContainer.appendChild(profileContainer);

                        if (usuarioData && usuarioData.id == resena.id_usuario) {
                            // Crear el botón de eliminar
                            const deleteButton = document.createElement('button');
                            deleteButton.classList.add('btn');
                            deleteButton.title = 'Eliminar mensaje';
                            deleteButton.setAttribute('data-bs-toggle', 'modal');
                            deleteButton.setAttribute('data-bs-target', '#confirmDeleteResenaModal');
                            deleteButton.setAttribute('data-resena-id', resena["id_resena"]); // Pasar el ID de la reseña

                            const deleteIcon = document.createElement('i');
                            deleteIcon.classList.add('fs-5', 'text-danger', 'bi', 'bi-x-circle-fill');

                            // Agregar evento al botón "X" para pasar el ID al modal
                            deleteButton.addEventListener('click', function () {
                                const resenaId = this.getAttribute('data-resena-id'); // Obtener el ID de la reseña
                                document.getElementById('confirmDeleteResenaButton').setAttribute('data-resena-id', resenaId); // Pasar el ID al botón de confirmación
                            });

                            deleteButton.appendChild(deleteIcon);
                            flexContainer.appendChild(deleteButton);
                        }

                        // Añadir el flex container al card-header
                        cardHeader.appendChild(flexContainer);

                        // Crear el card-body
                        const cardBody = document.createElement('div');
                        cardBody.classList.add('card-body');

                        // Crear el blockquote
                        const blockquote = document.createElement('blockquote');
                        blockquote.classList.add('blockquote', 'mb-0');

                        // Crear el párrafo del título de la reseña
                        const reviewTitle = document.createElement('p');
                        reviewTitle.textContent = resena["contenido"];

                        // Añadir el párrafo al blockquote
                        blockquote.appendChild(reviewTitle);

                        // Añadir el blockquote al card-body
                        cardBody.appendChild(blockquote);

                        // Añadir el card-header y el card-body al div principal
                        divCol12.appendChild(cardHeader);
                        divCol12.appendChild(cardBody);

                        // Agregar la reseña al fragmento
                        fragment.appendChild(divCol12);
                    });

                    // Agregar todas las reseñas al DOM en una sola operación
                    resenas.appendChild(fragment);
                }

                divResenas.appendChild(resenas);

            } catch (error) {
                console.log(error);
            }
        }
        function mostrarRequisitos() {
            try {
                const divRequisitos = document.querySelector('#myTabContent #required');
                const textoExistente = document.querySelector('#required #requisitos');
                if (textoExistente) { /*Esto arregla el bug de muchos textos generados*/
                    textoExistente.remove(); // Elimina el carrusel existente del DOM
                }
                const requisitos = document.createElement('div');
                requisitos.id = 'requisitos';
                requisitos.classList.add('row', 'p-2');
                const juego = obtenerJuego();
                juego["platforms"].forEach((plataforma => {

                    if (plataforma["platform"]['slug'] === 'pc') {
                        /*Creamos el div requisitos minimos*/
                        const divReqMin = document.createElement('div');
                        divReqMin.classList.add('parrafoRequisitos', 'col-lg-6', 'col-12');

                        /*Creamos el div requisitos Recomendados*/
                        const divReqRec = document.createElement('div');
                        divReqRec.classList.add('parrafoRequisitos', 'col-lg-6', 'col-12');

                        // Creamos el título "MINIMUM" manualmente
                        const tituloMinimo = document.createElement('h3');  // Usamos <h3> para el título
                        tituloMinimo.classList.add('fs-5', 'fw-bold', 'text-uppercase', 'pb-1'); // Tamaño, negrita y mayúsculas
                        tituloMinimo.innerHTML = 'Minimum:'; // Título personalizado

                        // Creamos el título "MINIMUM" manualmente
                        const tituloRecomended = document.createElement('h3');  // Usamos <h3> para el título
                        tituloRecomended.classList.add('fs-5', 'fw-bold', 'text-uppercase', 'pb-1'); // Tamaño, negrita y mayúsculas
                        tituloRecomended.innerHTML = 'Recommended:'; // Título personalizado

                        /*Ponemos el titulo antes */
                        divReqMin.appendChild(tituloMinimo);
                        divReqRec.appendChild(tituloRecomended);
                        /*Si encontramos /N lo remplazamos con un <br> */
                        if (plataforma['requirements']['minimum']) {/*Lo compruebo si no existe el minimo o recomendado para que no reviente la pagina */

                            const requisitosMinimos = plataforma['requirements']['minimum']
                                .replace(/^Minimum:\s*[\r\n]*/, '')  // Eliminar "Minimum:" y los saltos de línea
                                .replace(/\r?\n/g, '<br>');  // Reemplazar saltos de línea por <br>

                            divReqMin.innerHTML += requisitosMinimos;
                        } else {
                            divReqMin.innerHTML += 'No disponible';
                        }
                        if (plataforma['requirements']['recommended']) {

                            const requisitosRecomendados = plataforma['requirements']['recommended']
                                .replace(/^Recommended:\s*[\r\n]*/, '')  // Eliminar "Recommended:" y los saltos de línea
                                .replace(/\r?\n/g, '<br>');  // Reemplazar saltos de línea por <br>
                            /*Ponemos el texto */

                            divReqRec.innerHTML += requisitosRecomendados;
                        } else {
                            divReqRec.innerHTML += 'No disponible';
                        }

                        requisitos.appendChild(divReqMin);
                        requisitos.appendChild(divReqRec);

                    }
                }));

                /*Si el juego no esta en pc mandamos un mensaje que no necesita requisitos este juego */
                if (!requisitos.innerHTML.trim()) {
                    // Crear un nuevo div para el mensaje
                    const divMensaje = document.createElement('div');

                    // Añadir clases de Bootstrap para centrar el texto
                    divMensaje.classList.add('d-flex', 'justify-content-center', 'align-items-center', 'text-center', 'p-3');

                    // Añadir el mensaje al div
                    divMensaje.innerHTML = 'No se requieren requisitos específicos para esta plataforma.';

                    // Insertar el nuevo div dentro de 'requisitos'
                    requisitos.appendChild(divMensaje);
                }
                divRequisitos.appendChild(requisitos);
            } catch (error) {
                console.log(error);
            }

        }
        async function obtenerResenasJuego(idJuego) {
            const datos = {
                idJuego: idJuego
            }
            const response = await fetch('http://localhost:3000/backend/helpers/getResenasJuego.php', {
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
        /*Mostrar contenido modal */
        async function mostrarContenidoModal() {
            const divContenidoModal = document.getElementById('contenidoModal');
            let total_listas, total_contenido;
            if (usuarioData) {
                const listasDeJuegos = await obtenerListas(usuarioData);
                ({ total_listas, total_contenido } = listasDeJuegos.listas);
            }
            if (!usuarioData) {
                const div = document.createElement("div");
                div.className = "mb-3 mt-2 card-body d-flex justify-content-center align-items-center flex-column";

                const icon = document.createElement("i");
                icon.className = "bi bi-bookmark-heart-fill fs-1";

                const paragraph = document.createElement("p");
                paragraph.className = "card-text fw-bold fs-5 text-center";
                paragraph.textContent = "Inicia sesión para agregar este juego a tu lista";

                const link = document.createElement("a");
                link.className = "btn btnIniciarSesion";
                link.href = "../Acceso/login/login.html";
                link.textContent = "Iniciar sesión";

                // Agregar elementos al div principal
                div.appendChild(icon);
                div.appendChild(paragraph);
                div.appendChild(link);

                // Agregar el div al documento (ajusta esto según dónde lo quieras insertar)
                divContenidoModal.appendChild(div);
            } else if (total_listas == 0) {
                const card = document.createElement("div");
                card.className = "card text-center mb-3 mt-2 text-white";

                const cardBody = document.createElement("div");
                cardBody.className = "card-body";

                const icon = document.createElement("i");
                icon.className = "fs-1 bi bi-bookmark-star-fill";

                const message = document.createElement("p");
                message.className = "card-text fw-bold fs-5 text-center";
                message.textContent = "¡Aún no tienes listas! Ve a tu perfil y empieza a crear una";

                const link = document.createElement("a");
                link.className = "btn btnIniciarSesion";
                link.href = "../Perfiles/perfil/perfil.html";
                link.textContent = "Ir al perfil";

                // Agregar los elementos al cuerpo de la card
                cardBody.appendChild(icon);
                cardBody.appendChild(message);
                cardBody.appendChild(link);

                // Agregar el card al contenedor o a la página
                card.appendChild(cardBody);
                divContenidoModal.appendChild(card);

            } else if (total_contenido) {
                // Crear el contenedor principal
                let container = document.createElement("div");
                container.className = "text-white m-3";

                // Crear el select
                let select = document.createElement("select");
                select.id = "listas";
                select.className = "form-select";

                // Opción por defecto
                let defaultOption = document.createElement("option");
                defaultOption.value = "";
                defaultOption.disabled = true;
                defaultOption.selected = true;
                defaultOption.textContent = "Selecciona una lista";
                select.appendChild(defaultOption);

                //agregamos las listas totales
                total_contenido.forEach(lista => {
                    let option = document.createElement("option");
                    option.value = lista["id_lista"];
                    option.textContent = lista["nombre_lista"];
                    select.appendChild(option);
                });

                // Crear el botón
                let button = document.createElement("button");
                button.type = "submit";
                button.className = "col-12 btn btnAnadir mt-3";
                button.id = "anadirListaBtn";
                button.textContent = "Añadir";

                // Crear el div para alertas
                let alertDiv = document.createElement("div");
                alertDiv.id = "alertasJuegoLista";
                alertDiv.className = "mt-3 text-center";

                // Agregar elementos al contenedor
                container.appendChild(select);
                container.appendChild(button);
                container.appendChild(alertDiv);

                // Insertar en el modal (por ejemplo, en el div con id "contenidoModal")
                divContenidoModal.appendChild(container);

            } else {
                const card = document.createElement("div");
                card.className = "card text-center text-white bg-danger mb-3 mt-2";

                const cardBody = document.createElement("div");
                cardBody.className = "card-body";

                const icon = document.createElement("i");
                icon.className = "bi bi-exclamation-circle fs-1";

                const title = document.createElement("p");
                title.className = "card-text fw-bold fs-3";
                title.textContent = "¡Error al cargar el modal!";

                const message = document.createElement("p");
                message.className = "card-text";
                message.textContent = "Hubo un problema al intentar cargar el contenido. Por favor, recarga la página e intenta de nuevo.";

                const button = document.createElement("a");
                button.className = "btn btn-light";
                button.href = "javascript:location.reload();"; // Recargar la página
                button.textContent = "Recargar página";

                // Agregar los elementos al card
                cardBody.appendChild(icon);
                cardBody.appendChild(title);
                cardBody.appendChild(message);
                cardBody.appendChild(button);
                card.appendChild(cardBody);

                // Insertar el card en el cuerpo del documento
                divContenidoModal.appendChild(card);
            }
        }
        function mostrarContenidoPrincipal() {
            const divContenidoTotal = document.getElementById('contenidoTotal');
            borrarSpinner(divContenidoTotal);
            document.getElementById('contenidoNav').style.display = 'flex';
            document.querySelector('footer').style.display = 'block';
        }

        async function agregarLista(idLista) {
            const { name, background_image, id } = estado.juego;
            const linkJuego = `/pagGame/infoGame.html?id=${id}`;
            const datos = {
                idLista: idLista,
                titulo: name,
                image: background_image,
                linkJuego: linkJuego
            };
            const response = await fetch('http://localhost:3000/backend/controllers/controllerListas/agregarJuegoLista.php', {
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
        //Modal submit
        document.getElementById("anadirListaBtn")?.addEventListener("click", async function () {
            const alerta = document.getElementById('alertasJuegoLista');
            borrarAlerta(alerta);

            // Verificamos si ya existe un spinner en el div
            var existingSpinner = alerta.querySelector('.spinner'); // Asegúrate de que '.spinner' es un selector único

            if (existingSpinner) {
                // Si existe, lo eliminamos
                alerta.removeChild(existingSpinner);
            }

            let selectElement = document.getElementById("listas"); // Obtener el select
            let selectedValue = selectElement.value; // Obtener el valor seleccionado

            if (selectedValue) {
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
                document.getElementById("anadirListaBtn").style.display = "none";

                //Trabajamos con el backend
                const data = await agregarLista(selectedValue);

                // Verificamos si ya existe un spinner en el div
                var existingSpinner = alerta.querySelector('.spinner'); // Asegúrate de que '.spinner' es un selector único
                document.getElementById("anadirListaBtn").style.display = "block";
                if (existingSpinner) {
                    // Si existe, lo eliminamos
                    alerta.removeChild(existingSpinner);
                }
                borrarAlerta(alerta);

                if (!data["success"]) {
                    alerta.appendChild(alertDanger(data.error));
                } else if (data["success"]) {
                    alerta.appendChild(alertSuccess(data["exito"]));
                }

            } else {
                alerta.appendChild(alertDanger("Selecciona una lista para añadir"));
            }

        });
    }
    function ocultarContenidoPrincipal() {
        document.getElementById('contenidoNav').display = 'none'; //Para que no se vea al cargar la pagina si se cumple se vera el nav
        const divContenidoTotal = document.getElementById('contenidoTotal');
        divContenidoTotal.appendChild(spinner()); //Spiner de carga de la pagina
    }
    function juegoNoEncontrado() {
        const idVisuales = document.querySelector('#juegoNoEncontrado');
        idVisuales.appendChild(sinResultado());
        idVisuales.style.marginBottom = "350px";  // Aplica margen de 350px en la parte inferior para el footer
        document.getElementById('contenidoTotal').style.display = 'none';  // Oculta
        document.querySelector('footer').style.display = 'block';
    }

}
