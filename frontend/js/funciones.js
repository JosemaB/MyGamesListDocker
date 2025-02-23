import { catalogoPlataformas } from './API.js';

/*Aqui estaran las funciones que se usaran para toda la página web*/
export function mostrarPlataforma(game) {
    try {
        //Devuelve un div con los iconos asociados al juego
        const divIconos = document.createElement('div');
        game["parent_platforms"].forEach(plataforma => {
            const img = document.createElement('img');

            switch (plataforma["platform"]["slug"].toLowerCase()) {
                case "pc":
                    img.src = '/img/Plataformas/windows.png';
                    img.alt = 'Windows';
                    img.title = 'Windows';
                    break;
                case "playstation":
                    img.src = '/img/Plataformas/sony.png';
                    img.alt = 'Playstation';
                    img.title = 'Playstation';
                    break;
                case "xbox":
                    img.src = '/img/Plataformas/xbox.png';
                    img.alt = 'Xbox';
                    img.title = 'Xbox';
                    break;
                case "nintendo":
                    img.src = '/img/Plataformas/nintendo.png';
                    img.alt = 'Nintendo';
                    img.title = 'Nintendo';
                    break;
                case "android":
                    img.src = '/img/Plataformas/android.png';
                    img.alt = 'Android';
                    img.title = 'Android';
                    break;
                case "ios":
                    img.src = '/img/Plataformas/ios.png';
                    img.alt = 'IOS';
                    img.title = 'IOS';
                    break;
            }
            /*Si el img tiene imagen lo agregamos sino sagregara un cotenido  vacio*/
            if (img.src) {
                img.classList.add('icon', 'p-1');
                divIconos.appendChild(img);
            }
        });
        return divIconos;
    } catch (error) {
        console.log(error);
    }
}
export function ocultarBotones(divId) {
    document.querySelectorAll(`${divId} button`).forEach(btn => {
        if (!btn.classList.contains("btn-close")) {
            btn.style.display = "none";
        }
    });
}
export function mostrarBotones(divId) {
    document.querySelectorAll(`${divId} button`).forEach(btn => {
        if (!btn.classList.contains("btn-close")) {
            btn.style.display = "block";
        }
    });
}
/*Obtener listas del usuario */
export async function obtenerListas(usuarioData) {
    const { id } = usuarioData;
    const datos = {
        id: id
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

export function sinResultado() {
    // Crear el contenedor principal
    const container = document.createElement("div");
    container.className = "d-flex justify-content-center align-items-center mt-5";
    container.id = "sinResultado";
    // Crear la tarjeta
    const card = document.createElement("div");
    card.className = "sinResultadoPersonalizado card text-center shadow";


    // Crear el cuerpo de la tarjeta
    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    // Crear el título
    const cardTitle = document.createElement("h5");
    cardTitle.className = "card-title fw-bold";
    cardTitle.textContent = "Sin resultados";

    // Crear el texto
    const cardText = document.createElement("p");
    cardText.className = "card-text";
    cardText.textContent = "No se encontraron coincidencias para tu búsqueda";

    // Agregar título y texto al cuerpo de la tarjeta
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);

    // Agregar el cuerpo a la tarjeta
    card.appendChild(cardBody);

    // Agregar la tarjeta al contenedor principal
    container.appendChild(card);

    return container;
}
export function sinResultadoMensaje(mensaje) {
    // Crear el contenedor principal
    const container = document.createElement("div");
    container.className = "d-flex justify-content-center align-items-center mt-5";
    container.id = "sinResultado";
    // Crear la tarjeta
    const card = document.createElement("div");
    card.className = "sinResultadoPersonalizado card text-center shadow";


    // Crear el cuerpo de la tarjeta
    const cardBody = document.createElement("div");
    cardBody.className = "card-body";

    // Crear el título
    const cardTitle = document.createElement("h5");
    cardTitle.className = "card-title fw-bold";
    cardTitle.textContent = "Sin resultados";

    // Crear el texto
    const cardText = document.createElement("p");
    cardText.className = "card-text";
    cardText.textContent = mensaje;

    // Agregar título y texto al cuerpo de la tarjeta
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);

    // Agregar el cuerpo a la tarjeta
    card.appendChild(cardBody);

    // Agregar la tarjeta al contenedor principal
    container.appendChild(card);

    return container;
}
/*Relaciones */
export async function eliminarSeguimiento(idUsuario, idSeguido) {
    const datos = {
        idUsuario: idUsuario,
        idSeguido: idSeguido
    }
    const response = await fetch('http://localhost:3000/backend/controllers/controllerUsuario/eliminarSeguimiento.php', {
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
export async function obtenerRelaciones(idUsuario) {
    const datos = {
        idUsuario: idUsuario
    };
    const response = await fetch('http://localhost:3000/backend/helpers/getRelaciones.php', {
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
export function cardMensajeError(mensaje, div) {
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
    cardText.textContent = mensaje;

    // Crear el ícono de carita triste
    const sadFace = document.createElement('span');
    sadFace.classList.add('fs-1', 'text-warning');
    sadFace.innerHTML = '&#128577;'; // Carita triste en código HTML

    // Añadir los elementos a la estructura
    cardBody.appendChild(cardTitle);
    cardBody.appendChild(cardText);
    cardBody.appendChild(sadFace);
    card.appendChild(cardBody);
    div.appendChild(card);
}

export function redesSociales(discord, steam, youtube) {
    if (discord) {
        document.getElementById("discordBtn").disabled = false;
        document.getElementById("discordBtn").setAttribute("data-bs-title", discord);

        /*Inicializamos los tooltips por si tenemos luego bootrap me dio este comando en la documentación */
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));
    } else {
        document.getElementById("discordBtn").disabled = true;
    }

    if (steam) {
        document.getElementById("steamBtn").disabled = false;
        document.getElementById("steamBtn").onclick = function () {
            window.open(steam, '_blank');
        };
    } else {
        document.getElementById("steamBtn").disabled = true;
    }

    if (youtube) {
        document.getElementById("youtubeBtn").disabled = false;
        document.getElementById("youtubeBtn").onclick = function () {
            window.open(youtube, '_blank');
        };
    } else {
        document.getElementById("youtubeBtn").disabled = true;
    }
}
export async function obtenerDatosUsuario(idUsuario) {
    const datos = {
        idUsuario: idUsuario
    }
    const response = await fetch('http://localhost:3000/backend/helpers/getDatosUsuario.php', {
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
export function mostrarToast(mensaje, tipo) {
    // Buscar el contenedor de toasts
    let toastContainer = document.getElementById('toast-container');

    if (!toastContainer) {
        // Si no existe, lo creamos y lo agregamos al body
        toastContainer = document.createElement('div');
        toastContainer.id = 'toast-container';
        toastContainer.className = 'position-fixed top-0 end-0 p-3';
        toastContainer.style.zIndex = 1050;
        document.body.appendChild(toastContainer);
    }

    // Crear el toast
    const toastElement = document.createElement('div');
    toastElement.classList.add('toast', 'show');
    toastElement.setAttribute('role', 'alert');
    toastElement.setAttribute('aria-live', 'assertive');
    toastElement.setAttribute('aria-atomic', 'true');

    toastElement.innerHTML = `
        <div class="rounded-3">
            <div class="toast-header bg-${tipo} text-white">
                <strong class="me-auto">Notificación</strong>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
            <div class="toast-body bg-${tipo}">
                ${mensaje}
            </div>
        </div>
    `;

    // Agregar el toast al contenedor
    toastContainer.appendChild(toastElement);

    // Inicializar el toast con Bootstrap
    const toast = new bootstrap.Toast(toastElement, {
        autohide: true,
        delay: 3000
    });

    // Mostrar el toast
    toast.show();

    // Remover el toast después de que desaparezca
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}


export async function borrarResena(datos) {
    const response = await fetch('http://localhost:3000/backend/controllers/controllerResenas/borrarResena.php', {
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
export function adjustSelectToSelectedOption(select) {
    // Obtener el texto de la opción seleccionada
    const selectedText = select.options[select.selectedIndex].text;

    // Crear un elemento temporal para medir el texto seleccionado
    const tempSpan = document.createElement('span');
    tempSpan.style.visibility = 'hidden';
    tempSpan.style.whiteSpace = 'nowrap';
    tempSpan.style.font = window.getComputedStyle(select).font; // Aplicar estilo de fuente del select
    tempSpan.innerText = selectedText;

    document.body.appendChild(tempSpan);
    select.style.width = `${tempSpan.offsetWidth + 50}px`; // Ajustar ancho + padding
    document.body.removeChild(tempSpan);
}

export function quitarContenidoAdulto(juegos) { /*Cambialo a excluir contenido adulto*/
    try {
        const tagsExcluidos = ['Erotic', 'NSFW', 'Adult Content', 'Mature', 'sex', 'hentai', 'Nudity', 'sexy', 'Sexual Content']; //Excluimos por tag
        const juegosFiltrados = juegos["results"].filter((juego) => {
            let juegoValido = false;
            if (juego["tags"] && juego["tags"] && juego["short_screenshots"].length > 1 && juego["tags"].length > 0 && juego["stores"] && juego["released"]) { //Retornara un false por defecto si el juego no tien tags

                const tagsJuego = juego["tags"].map(tag => tag.name); //Extraaemos los tags de todos los juegos
                // Comprueba si ningún tag del juego está en la lista de exclusión
                juegoValido = !tagsExcluidos.some(tagExcluido => tagsJuego.includes(tagExcluido));
            }

            return juegoValido;
        });
        return juegosFiltrados;
    } catch (error) {
        console.log(error);
    }
}

export function limpiarHTML(selector) {
    while (selector.firstChild) {
        selector.removeChild(selector.firstChild);
    }
}

export function generos(juego) {
    try {
        let resultado = "";
        juego["genres"].forEach((genero, index) => {
            if (juego["genres"].length - 1 === index) {
                resultado += ` ${genero["name"]}`;
            } else {
                resultado += ` ${genero["name"]},`;
            }
        });
        return resultado;
    } catch (error) {
        console.log(error);
    }
}

export function spinner() {
    const divSpinner = document.createElement('div');
    divSpinner.classList.add('spinner');
    divSpinner.innerHTML += ` <div class="bounce1"></div>
                            <div class="bounce2"></div>
                            <div class="bounce3"></div>`;
    return divSpinner;
}

export function obtenerEstrellas(numero) {
    // Convertir el número de 1-10 a 0-5 Redondeamos a su numero entero
    const estrellas = Math.round(numero);

    // Construir las estrellas
    let resultado = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= estrellas) {
            resultado += '⭐';
        } else {
            resultado += '☆';
        }
    }

    return resultado;
}

export function nombreUsuario(id) {
    try {
        let usuario = "";
        switch (id) {
            case 5:
                usuario = "TonyElMolon";
                break;
            case 4:
                usuario = "Josemab26";
                break;

            case 3:
                usuario = "Narita";
                break;

            case 1:
                usuario = "Chispy2";
                break;

            default:
                usuario = "Nombre desconocido";
                break;

        }
        return usuario;
    } catch (error) {
        console.log(error);
    }
}
export function fotoUsuario(id) {
    try {
        let fotoUsuario = "";
        switch (id) {
            case 5:
                fotoUsuario = "/img/usuarios/TonyElMolon.png";
                break;
            case 4:
                fotoUsuario = "/img/usuarios/Josemab26.jpg";
                break;

            case 3:
                fotoUsuario = "/img/usuarios/Narita.jfif";
                break;

            case 1:
                fotoUsuario = "/img/usuarios/Chispy2.png";
                break;

            default:
                fotoUsuario = "/img/usuarios/UsuarioDesconocido.png";
                break;

        }
        return fotoUsuario;
    } catch (error) {
        console.log(error);
    }
}

export function mostrarPaginador(enlace, divPrincipal, pageMaxima, pageActual = 1) {
    try {
        const divPaginador = document.createElement('div');
        divPaginador.classList.add('d-flex', 'justify-content-center', 'mt-4');
        // Crear el contenedor principal <nav>
        const nav = document.createElement('nav');
        nav.setAttribute('aria-label', 'Page navigation example');

        // Crear el <ul> con clase "pagination"
        const ul = document.createElement('ul');
        ul.className = 'pagination';

        // Crear el primer elemento "Previous"
        const liPrevious = document.createElement('li');
        liPrevious.className = `page-item ${pageActual == 1 ? 'disabled' : ''}`;
        const aPrevious = document.createElement('a');
        aPrevious.className = 'page-link rounded-5';
        aPrevious.href = `${enlace}?page=${(pageActual - 1)}`;;
        aPrevious.innerHTML = '<i class="bi bi-arrow-left-circle fs-5"></i>';
        liPrevious.appendChild(aPrevious);
        ul.appendChild(liPrevious);

        // Crear el elemento "1"
        const li1 = document.createElement('li');
        if (pageActual == 1) {
            // Si es la página activa
            li1.className = 'page-item active zindex-0 ';
            li1.setAttribute('aria-current', 'page');

            const span1 = document.createElement('span');
            span1.className = 'page-link';
            span1.textContent = '1';

            li1.appendChild(span1);
        } else {
            // Si no es la página activa
            li1.className = 'page-item';

            const a1 = document.createElement('a');
            a1.className = 'page-link';
            a1.href = `${enlace}?page=1`;
            a1.textContent = '1';

            li1.appendChild(a1);
        }
        // Agregamos el previuos y next

        ul.appendChild(li1);


        if ([1, 2, 3].includes(pageActual)) {
            for (let i = 2; i <= 4; i++) {
                const li1 = document.createElement('li');
                if (pageActual == i) {
                    // Si es la página activa
                    li1.className = 'page-item active zindex-0 ';
                    li1.setAttribute('aria-current', 'page');

                    const span1 = document.createElement('span');
                    span1.className = 'page-link';
                    span1.textContent = `${i}`;

                    li1.appendChild(span1);
                } else {
                    // Si no es la página activa
                    li1.className = 'page-item';
                    const a1 = document.createElement('a');
                    a1.className = 'page-link';
                    a1.href = `${enlace}?page=${i}`;
                    a1.textContent = `${i}`;

                    li1.appendChild(a1);
                }

                ul.appendChild(li1);
            }
            ul.appendChild(crearEllipsis());

        } else if ([pageMaxima - 2, pageMaxima - 1, pageMaxima].includes(pageActual)) {
            ul.appendChild(crearEllipsis());
            for (let i = pageMaxima - 3; i < pageMaxima; i++) {
                const li1 = document.createElement('li');
                if (pageActual == i) {
                    // Si es la página activa
                    li1.className = 'page-item active zindex-0 ';
                    li1.setAttribute('aria-current', 'page');

                    const span1 = document.createElement('span');
                    span1.className = 'page-link';
                    span1.textContent = `${i}`;

                    li1.appendChild(span1);
                } else {
                    // Si no es la página activa
                    li1.className = 'page-item';
                    const a1 = document.createElement('a');
                    a1.className = 'page-link';
                    a1.href = `${enlace}?page=${i}`;
                    a1.textContent = `${i}`;

                    li1.appendChild(a1);
                }

                ul.appendChild(li1);
            }


        } else {
            ul.appendChild(crearEllipsis());
            for (let i = 0; i < 3; i++) {
                let resultado = null;
                if (i === 0) {
                    resultado = pageActual - 1;
                } else if (i === 2) {
                    resultado = pageActual + 1;
                } else {
                    resultado = pageActual;
                }

                const li = document.createElement('li');
                if (i == 1) {
                    // Si es la página activa
                    li.className = 'page-item active zindex-0 ';
                    li.setAttribute('aria-current', 'page');

                    const span = document.createElement('span');
                    span.className = 'page-link';
                    span.textContent = resultado;
                    li.appendChild(span);
                } else {
                    li.className = 'page-item';
                    const a = document.createElement('a');
                    a.className = 'page-link';
                    a.href = `${enlace}?page=${resultado}`;
                    a.textContent = `${resultado}`;
                    li.appendChild(a);
                }
                ul.appendChild(li);
            }
            ul.appendChild(crearEllipsis());
        }


        // Crear el elemento "pageMaxima" esta 250 el li por defecto que es 250
        const li250 = document.createElement('li');
        if (pageActual == pageMaxima) {
            // Si es la página activa
            li250.className = 'page-item active zindex-0 ';
            li250.setAttribute('aria-current', 'page');

            const span250 = document.createElement('span');
            span250.className = 'page-link';
            span250.textContent = `${pageMaxima}`;

            li250.appendChild(span250);
        } else {
            // Si no es la página activa
            li250.className = 'page-item';

            const a250 = document.createElement('a');
            a250.className = 'page-link';
            a250.href = `${enlace}?page=${pageMaxima}`;
            a250.textContent = `${pageMaxima}`;

            li250.appendChild(a250);
        }

        // Crear el último elemento "Next"
        const liNext = document.createElement('li');
        liNext.className = `page-item ${pageActual == pageMaxima ? 'disabled' : ''}`;
        const aNext = document.createElement('a');
        aNext.className = 'page-link rounded-5';
        aNext.href = `${enlace}?page=${(pageActual + 1)}`;
        aNext.innerHTML = '<i class="bi bi-arrow-right-circle fs-5"></i>';
        liNext.appendChild(aNext);
        /*Los ultimos 250 y next */
        ul.appendChild(li250);
        ul.appendChild(liNext);

        // Agregar el <ul> al <nav>
        nav.appendChild(ul);
        divPaginador.appendChild(nav);
        // Agregar el <nav> al body
        divPrincipal.appendChild(divPaginador);
    } catch (error) {
        console.log(error);
    }
}

// Función auxiliar para crear puntos suspensivos
function crearEllipsis() {
    const ellipsisItem = document.createElement('li');
    ellipsisItem.classList.add('page-item', 'disabled');
    const ellipsisSpan = document.createElement('span');
    ellipsisSpan.classList.add('page-link', 'text-center');
    ellipsisSpan.textContent = '...';
    ellipsisItem.appendChild(ellipsisSpan);
    return ellipsisItem;
}

export function urlPaginaAnterior(linkPaginaActual) {
    // Obtener la URL de la página anterior
    let referrer = document.referrer;

    // Verificar si la URL anterior pertenece al mismo dominio
    if (referrer.includes(window.location.hostname)) {

        if (referrer.includes(linkPaginaActual)) {
            localStorage.setItem('redirectUrl', '../../index.html');
        } else {
            // Si es una página interna diferente al login, guardarla para redirección
            localStorage.setItem('redirectUrl', referrer);
        }
    } else {
        // Si es una página externa, redirigir al inicio
        localStorage.setItem('redirectUrl', '../../index.html');
    }
}

export function alertDanger(textError) {
    // Crear el div de la alerta
    const alerta = document.createElement("div");

    // Agregar clases de Bootstrap
    alerta.classList.add("fw-bold", "alert", "alert-danger");
    alerta.setAttribute("role", "alert");
    alerta.style.margin = '0';
    alerta.innerHTML = textError;

    return alerta;
}

export function alertSuccess(textSuccess) {
    // Crear el div de la alerta
    const alerta = document.createElement("div");

    // Agregar clases de Bootstrap para éxito
    alerta.classList.add("fw-bold", "alert", "alert-success");
    alerta.setAttribute("role", "alert");
    alerta.style.margin = '0';
    alerta.innerHTML = textSuccess;

    return alerta;
}
export function borrarSpinner(div) {
    var existingSpinner = div.querySelector('.spinner');
    if (existingSpinner) {
        // Si existe, lo eliminamos
        div.removeChild(existingSpinner);
    }
}
export function borrarAlerta(divAlerta) {
    const existeAlerta = divAlerta.querySelector('.alert');
    if (existeAlerta) {
        existeAlerta.remove();
    }
}
export function mostrarPassword(divPassword) {
    if (divPassword.type === "password") {
        divPassword.type = 'text';
    } else {
        divPassword.type = 'password';
    }
}
/*Formateear fecha */
export function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/*Obtener cookie */
export function getCookie(name) {
    return document.cookie.split(';')
        .map(cookie => cookie.trim())
        .find(cookie => cookie.startsWith(name + '='))
        ?.substring(name.length + 1) || null;
}
export async function juegosPorCatalogo(plataforma, divPrincipal, page = 1) {
    try {
        const juegos = await catalogoPlataformas(page, plataforma);
        if (juegos["detail"] === 'Invalid page.') {
            divPrincipal.appendChild(sinResultado());
        } else {
            const juegosFiltrados = quitarContenidoAdulto(juegos);
            juegosFiltrados.slice(0, 20).forEach((juego, index) => {
                const articulo = document.createElement('article');
                // Añadiendo múltiples clases correctamente card col-lg-3 
                articulo.classList.add('card', 'hover-card', 'zindex-0', 'col-lg-3', 'col-md-4', 'col-sm-6', 'mb-2'); // Añadimos las clases de Bootstrap
                const divTest = document.createElement('div');
                divTest.classList.add('containerCardTest');

                /*Creamos el carrusel para la card de juegos*/
                const divCarrusel = document.createElement('div');
                divCarrusel.classList.add('carousel', 'slide', 'carousel-fade');
                divCarrusel.id = "carousel" + index;
                divCarrusel.innerHTML +=
                    `
                    <a title="${juego["name"]}" href="/pagGame/infoGame.html?id=${juego['id']}" >
                    <div class="carousel-inner">
                    </div>
                        `;

                // Seleccionamos la sección interna del carrusel donde irán las imágenes
                const innerDiv = divCarrusel.querySelector('.carousel-inner');

                juego["short_screenshots"].slice(0, 3).forEach((img, index) => {
                    /*Actulizamos si solo hay una captura poner solo una img proximamente */
                    const div = document.createElement('div');
                    div.classList.add('custom-img-size', 'carousel-item'); // Añadimos las clases de Bootstrap
                    if (index === 0) {
                        div.classList.add('active');
                    }

                    div.innerHTML +=
                        ` 
                        <img src="${img["image"]}?q=50" class="d-block" alt="${juego["name"]}">
                        `;
                    innerDiv.appendChild(div);
                });
                divCarrusel.innerHTML +=
                    ` 
                    
                    <button class="carousel-control-prev" type="button" data-bs-target="#carousel${index}" data-bs-slide="prev">
                        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Previous</span>
                    </button>
                    <button class="carousel-control-next" type="button" data-bs-target="#carousel${index}" data-bs-slide="next">
                        <span class="carousel-control-next-icon" aria-hidden="true"></span>
                        <span class="visually-hidden">Next</span>
                    </button>
                    </a>
                    `;

                divTest.appendChild(divCarrusel);
                const geners = generos(juego); //Nos devuelve una lista de generos
                //Despues de agregar el carrusel agregamos el contenido de la  targeta
                divTest.innerHTML +=
                    ` 
                        <div class="card-body">
                            <a  class="text-decoration-none text-white link-primary" href="/pagGame/infoGame.html?id=${juego['id']}" >
                                <h5 class="card-title fw-bold">${juego["name"]}</h5>   
                            </a>
                            <div id="plataformas"></div> 
                        </div>
                        
                        <div class="extra-content">
                            <ul class="list-group fw-bold ">
                                <li class="list-group-item letraPequena d-flex justify-content-between"><span>Fecha de lanzamiento: </span>${juego["released"]}</li>
                                <li class="list-group-item letraPequena d-flex justify-content-between"><span>Géneros: </span> ${geners}</li>
                                <li class="list-group-item letraPequena d-flex justify-content-between"><span>Promedio jugado: </span>${juego["playtime"] == 0 ? "No Disponible" : `${juego["playtime"]} horas`} </li>
                            </ul>
                            <p class="d-flex card-text d-flex justify-content-between text-uniform m-2">
                                <span class="fs-7 d-none d-sm-inline">
                                    <strong class="fw-bold">Calificación:</strong> 
                                    <span class="rounded-5 bg-success fw-bold p-1"> ${!juego["metacritic"] ? "?" : juego["metacritic"]} </span>
                                </span>
                                <span class="text-warning fs-7">
                                    <i class="bi bi-star-fill"></i> <span class="fw-bold">${juego["ratings_count"]}  valoraciones </span>
                                </span>
                            </p>
                        </div>
                `;
                divTest.querySelector('#plataformas').appendChild(mostrarPlataforma(juego));
                articulo.appendChild(divTest);
                divPrincipal.appendChild(articulo);
            });
        }
    } catch (error) {
        console.log(error);
    }
}

