import { listaDeJuegosPorNombre } from '../js/API.js';
import { mostrarPlataforma, quitarContenidoAdulto, generos, sinResultado } from "../js/funciones.js";

/*Eventos*/
document.addEventListener('DOMContentLoaded', iniciarBuscador);

function iniciarBuscador() {
    try {
        /*Para cuando le da enter el usuario en el buscador */
        // Obtén los parámetros de la URL
        const urlParams = new URLSearchParams(window.location.search);
        // Accede al valor del parámetro "q"
        const searchValue = urlParams.get("q");
        
        if (searchValue) {
            juegosPorResultado(searchValue);
        }
    } catch (error) {
        console.log(error);
    }
}

async function juegosPorResultado(searchValue) {
    try {
        const resultadoJuegos = document.querySelector('#resultadoJuegos');
        const juegos = await listaDeJuegosPorNombre(searchValue);
        const juegosFiltrados = await quitarContenidoAdulto(juegos);

        if (juegosFiltrados.length > 0) {
            juegosFiltrados.forEach((juego, index) => {
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
                    <a href="/pagGame/infoGame.html?id=${juego['id']}" >
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
                            <a class="text-decoration-none text-white link-primary" href="/pagGame/infoGame.html?id=${juego['id']}" >
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
                resultadoJuegos.appendChild(articulo);
            });
        } else if (!juegosFiltrados || juegosFiltrados.length === 0) {

            resultadoJuegos.appendChild(sinResultado());
        }
    } catch (error) {
        console.log(error);
    }
}