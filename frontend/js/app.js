import { listaJuegosPorFiltro, catalogoPrincipal, cardsMain, listaDeJuegosPorNombre } from "./API.js";
import { mostrarPlataforma, adjustSelectToSelectedOption, limpiarHTML, quitarContenidoAdulto, generos } from "./funciones.js";
import { iniciarGuardian } from "./guardian.js";

document.addEventListener('DOMContentLoaded', iniciarApp);

async function iniciarApp() {
    // Obtener la ruta de la URL sin importar el dominio ni el puerto
    const currentPath = window.location.pathname;
    if (currentPath === '/Perfiles/administrador/administrador.html') {
        await iniciarGuardian();
    } else if (currentPath === "/pagGame/infoGame.html") {
        document.querySelector('header').style.display = 'none';
        document.querySelector('footer').style.display = 'none';
        await iniciarGuardian();
        document.querySelector('header').style.display = 'block';
    } else if (currentPath !== "/index.html" && currentPath !== "/") {
        document.querySelector('header').style.display = 'none';
        document.querySelector('main').style.display = 'none';
        document.querySelector('footer').style.display = 'none';
        await iniciarGuardian();
        document.querySelector('header').style.display = 'block';
        document.querySelector('main').style.display = 'block';
        document.querySelector('footer').style.display = 'block';
    }


    try {
        //Dejo los query selector aqui para que sean mas intuitivos
        const resultado20Games = document.querySelector('#resultado20Juegos');
        const catalogoMain = document.querySelector('#catalogoPrincipal');
        const cards = document.querySelector('#targetasPrincipales');
        const select = document.querySelector('#dropdownSelect');

        /*Form*/
        const resultadosForm = document.querySelector('#resultadosForm');
        const form = document.getElementById("form");
        // Obtener el campo de búsqueda
        const searchInput = document.querySelector('#searchInput');

        //Eventos
        // Ajustar el ancho al cambiar la selección select
        select?.addEventListener('change', (e) => {
            adjustSelectToSelectedOption(select);
            limpiarHTML(resultado20Games); //Limpiamos para que se refresque los juegos y no se pongan en si los otros 20 hacia abajo
            mostrarJuegos(e);
        });

        // Añadir un event listener para el evento 'input'
        searchInput?.addEventListener('input', () => {

            // Si ya hay un intervalo en ejecución, lo detenemos
            clearInterval(searchInput.intervalId);

            // Iniciar un nuevo intervalo de 500ms
            searchInput.intervalId = setInterval(() => {

                if (searchInput.value) {
                    mostrarBuscador(searchInput.value); //Aqui seria la funcion
                } else {
                    limpiarHTML(resultadosForm); //Borramos el div creado
                }
            }, 500); // Se ejecuta cada 500ms mientras el usuario escribe

            // Resetear el temporizador para detectar cuando el usuario deja de escribir
            clearTimeout(searchInput.typingTimer);
            searchInput.typingTimer = setTimeout(() => {
                clearInterval(searchInput.intervalId);  // Detener el intervalo cuando el usuario deje de escribir
            }, 500); // Detener después de 500ms sin que el usuario escriba
        });

        /*Para cuando el usuario quitae el foco*/
        searchInput?.addEventListener('focus', () => {/*Por si hay contenido en el foco buscaria */
            if (searchInput.value) {
                mostrarBuscador(searchInput.value);
            }
        });
        /*Para cuando el usuario quitae el foco*/
        searchInput?.addEventListener('focusout', (event) => {
            // Verifica si el foco va hacia un enlace 'A' o un div con una clase específica
            const relatedElement = event.relatedTarget;

            if (relatedElement && relatedElement.tagName === 'A' || relatedElement && relatedElement.tagName === 'BUTTON') {
                // Si el foco va hacia un enlace, no limpiamos
            } else {
                // Si no es ninguno de los casos anteriores, limpiamos
                limpiarHTML(resultadosForm);
            }
        });

        /*Si ha npresionado enter en el formulario */
        form?.addEventListener("submit", function (event) {
            event.preventDefault();
            // Obtén el valor del input de búsqueda
            const searchValue = searchInput.value.trim();

            if (searchValue) {
                // Construye la URL con el valor ingresado
                const targetUrl = `/paginasBuscadores/resultados.html?q=${encodeURIComponent(searchValue)}`;

                // Redirige al usuario a la página
                window.location.href = targetUrl;
            } else {
                const alerta = resultadosForm.querySelector('.alert-danger')
                if (alerta) {
                    alerta.remove();
                }
                const divAlert = document.createElement('div');
                divAlert.classList.add('alert', 'alert-danger', 'fw-bold');
                divAlert.role = 'alert';
                divAlert.style.backgroundColor = 'none';
                divAlert.style.borderRadius = '0';
                divAlert.style.margin = '0';
                divAlert.style.fontSize = '15px';
                divAlert.innerHTML = 'Por favor, ingrese un término de búsqueda';
                resultadosForm.appendChild(divAlert);
            }

        });



        if (catalogoMain && resultado20Games) { /*Compruebo si existen para la pagina principal */
            /*Para la pantalla de carga es una pijada hacer esto pero tenia ganas de probarlo claremente */
            window.addEventListener('load', function () {
                // Crear una promesa que resuelve cuando todas las funciones terminan
                function cargarContenido() {
                    return new Promise((resolve, reject) => {
                        // Ejecutamos las tres funciones y esperamos que todas terminen
                        let promises = [
                            mostrarCatalogoPrincipal(),
                            mostrarMainCards(),
                            mostrarJuegos(),
                            iniciarGuardian()
                        ];

                        // Esperamos a que todas las promesas se resuelvan
                        Promise.all(promises)
                            .then(() => {
                                // Cuando todas las funciones se hayan completado, resolvemos la promesa
                                resolve();
                            })
                            .catch((error) => {
                                // Si alguna función falla, rechazamos la promesa
                                reject(error);
                            });
                    });
                }

                // Llamamos a la función cargarContenido y esperamos que todas las funciones se completen
                cargarContenido()
                    .then(function () {
                        // Cuando se resuelva la promesa, ocultamos el loading y mostramos el contenido
                        document.getElementById('loading').style.display = 'none';
                        document.querySelectorAll('.ocultarContenido').forEach(function (element) {
                            element.style.display = 'block';
                        });
                    })
                    .catch(function (error) {
                        // Si hubo algún error durante la carga de contenido
                        console.error('Error al cargar el contenido:', error);
                    });
            });

        }

        async function mostrarCatalogoPrincipal() {
            const catalogo = await catalogoPrincipal();

            catalogo["results"].forEach((juego, index) => {
                const indicators = catalogoMain.querySelector('.carousel-indicators');
                indicators.innerHTML += `<button type="button" data-bs-target="#catalogoPrincipal" data-bs-slide-to="${index}" ${index === 0 ? 'class="active' : ''} 
            aria-current="true" aria-label="Slide ${index}"></button>`;

                const divCarousel = catalogoMain.querySelector('.carousel-inner');
                const divItem = document.createElement('div');
                divItem.classList.add('carousel-item'); // Añadimos las clases de Bootstrap
                if (index === 0) {
                    divItem.classList.add('active', 'data-bs-interval="8000"');
                } else {
                    divItem.classList.add('data-bs-interval="2000"');
                }
                divItem.innerHTML +=
                    ` 
                    <a href="/pagGame/infoGame.html?id=${juego['id']}" >
                        <img src="${juego["background_image"]}?q=50" class="d-block" alt="${juego["name"]}" title="${juego["name"]}">
                    </a>
                    <div class="carousel-caption d-none d-md-block">
                        <h5 class="fw-bold">${juego["name"]}</h5>
                    </div>
            `;
                divCarousel.appendChild(divItem);
            });


        }

        async function mostrarMainCards() {
            const articulos = await cardsMain();
            articulos["results"].forEach((juego) => {
                const div = document.createElement('div');

                div.classList.add('card', 'custom-card', 'text-bg-dark', 'col-12');

                div.innerHTML +=
                    `  
                <a title="${juego["name"]}" class="text-decoration-none text-reset" href="/pagGame/infoGame.html?id=${juego['id']}" >
                    <img src="${juego["background_image"]}" class="card-img" alt="${juego["name"]}">
                <div class="card-img-overlay">
                    <h5 class=" bordeNegro card-title">${juego["name"]}</h5>
                    <p class="card-text d-flex justify-content-between text-uniform">
                        <span class="d-none d-sm-inline">
                            <strong>Calificación:</strong> 
                            <span class="badge bg-success">${juego["rating"] * 2}</span>
                        </span>
                        <span class="bg-dark text-warning fw-bold rounded-3 p-1 d-none d-xl-inline">
                            <i class="bi bi-star-fill"></i> ${juego["ratings_count"]} valoraciones
                        </span>
                    </p>
                </div>
                </a>
            `;
                cards.appendChild(div);
            });

        }

        async function mostrarJuegos(event = null) {
            let ordering = "";  //Esta variable recogera el tipo de filtro que se hara
            if (event) {
                if (event.target.value === "mejorValorados") {
                    ordering = "-rating ";

                } else if (event.target.value === "masRecientes") {
                    // Obtener la fecha actual
                    const currentDate = new Date();

                    // Calcular la fecha de 6 meses antes
                    const sixMonthsAgo = new Date(currentDate);
                    sixMonthsAgo.setMonth(currentDate.getMonth() - 6);

                    // Formatear las fechas a formato "YYYY-MM-DD"
                    const formattedCurrentDate = currentDate.toISOString().split('T')[0]; // Año actual en formato YYYY-MM-DD
                    const formattedSixMonthsAgo = sixMonthsAgo.toISOString().split('T')[0]; // 6 meses antes en formato YYYY-MM-DD

                    ordering = `-released&dates=${formattedSixMonthsAgo},${formattedCurrentDate}`;

                } else {
                    ordering = "-metacritic";

                }
            } else {
                ordering = "-metacritic";
            }

            const listaDeJuegos = await listaJuegosPorFiltro(ordering);

            const juegosFiltrados = await quitarContenidoAdulto(listaDeJuegos); //Filtramos los juegos para que no haya ningun contenido erotico

            //Hacemos un filtro de 20 juegos maximos
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
                resultado20Games.appendChild(articulo);
            });

        }

        async function mostrarBuscador(input) {

            limpiarHTML(resultadosForm);

            const juegos = await listaDeJuegosPorNombre(input);
            console.log(juegos);

            const juegosFiltrados = await quitarContenidoAdulto(juegos);
            console.log(juegosFiltrados);
            if (juegosFiltrados.length === 0) {
                const resultadoDiv = document.createElement('div');
                const sinResultado = document.createElement('p');
                sinResultado.classList.add('fw-bold');
                sinResultado.textContent = 'No se encontraron resultados';
                sinResultado.style.textAlign = 'center';
                sinResultado.style.margin = '20px auto 20px';

                resultadoDiv.appendChild(sinResultado);
                resultadosForm.appendChild(resultadoDiv);
            } else {
                juegosFiltrados.slice(0, 5).forEach(juego => {
                    // Crear el enlace <a>
                    const aElement = document.createElement('a');
                    aElement.href = `/pagGame/infoGame.html?id=${juego['id']}`; // URL de destino
                    aElement.classList.add('text-decoration-none', 'text-dark'); // Clases CSS

                    // Crear el contenedor de la tarjeta <div class="card">
                    const cardDiv = document.createElement('div');
                    cardDiv.classList.add('card');

                    // Crear la fila <div class="row g-0">
                    const rowDiv = document.createElement('div');
                    rowDiv.classList.add('row', 'g-0');

                    // Crear la columna con la imagen <div class="col-md-4">
                    const colImageDiv = document.createElement('div');
                    colImageDiv.classList.add('imgForm', 'col-4');

                    // Crear la imagen <img src="img/logo.png" class="img-fluid" alt="...">
                    const imgElement = document.createElement('img');
                    imgElement.src = juego['background_image']; // Fuente de la imagen
                    imgElement.classList.add('imgForm', 'col-12');
                    imgElement.alt = juego['name']; // Texto alternativo

                    // Agregar la imagen a la columna
                    colImageDiv.appendChild(imgElement);

                    // Crear la columna de texto <div class="col-md-8 d-flex align-items-center">
                    const colTextDiv = document.createElement('div');
                    colTextDiv.classList.add('col-8', 'd-flex', 'align-items-center');

                    // Crear el contenedor de texto <div class="card-body">
                    const cardBodyDiv = document.createElement('div');
                    cardBodyDiv.classList.add('card-body');

                    // Crear el título <h5 class="card-title">
                    const titleElement = document.createElement('h5');
                    titleElement.classList.add('col-12', 'card-title', 'fw-bold');
                    titleElement.textContent = juego['name']; // Texto del título

                    // Agregar el título al contenedor de la tarjeta
                    cardBodyDiv.appendChild(titleElement);

                    /*Plataforma de juego iconos */
                    const plataformasDelJuego = mostrarPlataforma(juego);
                    plataformasDelJuego.classList.add('col-12');
                    cardBodyDiv.appendChild(plataformasDelJuego);

                    // Agregar el contenedor de texto a la columna
                    colTextDiv.appendChild(cardBodyDiv);

                    // Agregar las columnas (imagen y texto) a la fila
                    rowDiv.appendChild(colImageDiv);
                    rowDiv.appendChild(colTextDiv);

                    // Agregar la fila al contenedor de la tarjeta
                    cardDiv.appendChild(rowDiv);

                    // Agregar la tarjeta al enlace <a>
                    aElement.appendChild(cardDiv);
                    // Ahora puedes agregar el <a> a cualquier parte de tu documento, por ejemplo, al body:
                    resultadosForm.appendChild(aElement);
                });

                if (juegosFiltrados.length > 5) {
                    // Crear el botón <button>
                    const buttonElement = document.createElement('button');
                    buttonElement.type = 'submit'; // Tipo de botón
                    buttonElement.classList.add('fw-bold', 'btn', 'btn-lg', 'btn-block'); // Clases CSS
                    buttonElement.textContent = 'Más resultados'; // Texto del botón

                    // Agregar el botón al body o a cualquier contenedor
                    resultadosForm.appendChild(buttonElement);
                }
            }

        }
    } catch (error) {
        console.log(error);
    }
}