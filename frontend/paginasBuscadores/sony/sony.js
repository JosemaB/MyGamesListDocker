import { juegosPorCatalogo, mostrarPaginador } from "../../js/funciones.js";

/*Eventos*/
document.addEventListener('DOMContentLoaded', buscadorNintendo);
const resultadoJuegos = document.querySelector('#resultadoJuegos');
async function buscadorNintendo() {
    try {
        // Obtener el valor del parámetro 'id' desde la URL
        const urlParams = new URLSearchParams(window.location.search);
        const page = urlParams.get('page'); // Page
        if (page) {
            await juegosPorCatalogo(2, resultadoJuegos, page);
            if (!document.querySelector('#resultadoJuegos #sinResultado')) {
                mostrarPaginador('/paginasBuscadores/sony/sony.html', resultadoJuegos, 250, parseInt(page));
            }

        } else {
            await juegosPorCatalogo(2, resultadoJuegos);
            mostrarPaginador('/paginasBuscadores/sony/sony.html', resultadoJuegos, 250);

        }
    } catch (error) {
        console.log(error);
    }
}

