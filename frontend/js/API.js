import { spinner } from "./funciones.js";

const apiKey = "6add8f722d774dc1bd4ce694681f52b4";

export async function catalogoPrincipal() {
    try {
        const resultado = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&page_size=5&dates=2024-01-01,2024-12-31`);
        const juegos = await resultado.json();
        return juegos;
    } catch (error) {
        console.log(error);
    }
}
export async function cardsMain() {

    try {
        const resultado = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&page=1&dates=2020-01-01,2022-01-01&page_size=5`);
        const juegos = await resultado.json();
        return juegos;
    } catch (error) {
        console.log(error);
    }
}
export async function listaJuegosPorFiltro(ordering) {
    const idContainerCard = document.getElementById('containerCard');

    // Crear y agregar el spinner al contenedor
    const spinnerElement = spinner();
    idContainerCard.appendChild(spinnerElement);

    try {
        const resultado = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&ordering=${ordering}&page_size=40&page=1`);
        const juegos = await resultado.json();
        return juegos;
    } catch (error) {
        console.log(error);
    } finally {
        // Eliminar el spinner después de completar la carga
        idContainerCard.removeChild(spinnerElement);
    }
}

export async function detallesDelJuego(id) {
    try {
        const resultado = await fetch(`https://api.rawg.io/api/games/${id}?key=${apiKey}`);
        const trailer = await resultado.json();
        return trailer;
    } catch (error) {
        console.log(error);
    }
}

export async function mostrarCapturas(id) {
    try {
        const resultado = await fetch(`https://api.rawg.io/api/games/${id}/screenshots?key=${apiKey}`);
        const trailer = await resultado.json();
        return trailer;
    } catch (error) {
        console.log(error);
    }
}

export async function listaDeJuegosPorNombre(input) {
    const resultadosForm = document.querySelector('#resultadosForm');

    // Crear y agregar el spinner al contenedor
    const spinnerElement = spinner();
    spinnerElement.style.margin = '20px auto 20px'; // Ajusta el valor según tus necesidades
    resultadosForm.appendChild(spinnerElement);
    try {
        const resultado = await fetch(`https://api.rawg.io/api/games?search=${input}&key=${apiKey}`);
        const trailer = await resultado.json();
        return trailer;
    } catch (error) {
        console.log(error);
    } finally {
        // Eliminar el spinner después de completar la carga
        resultadosForm.removeChild(spinnerElement);
    }
}

export async function catalogoPlataformas(pagina, idPlataforma) {/*Al final para todos 250 tiene de paginacion maximo la api*/
    const resultadosForm = document.querySelector('#resultadoJuegos');

    // Crear y agregar el spinner al contenedor
    const spinnerElement = spinner();
    spinnerElement.style.margin = '20px auto 20px'; // Ajusta el valor según tus necesidades
    resultadosForm.appendChild(spinnerElement);
    try {
        const resultado = await fetch(`https://api.rawg.io/api/games?key=${apiKey}&parent_platforms=${idPlataforma}&page=${pagina}&page_size=40`);
        const trailer = await resultado.json();
        return trailer;
    } catch (error) {
        console.log(error);
    } finally {
        // Eliminar el spinner después de completar la carga
        resultadosForm.removeChild(spinnerElement);
    }
}
