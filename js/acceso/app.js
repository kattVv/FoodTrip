import { procesarDestino } from '../procesos/foodTripProcess.js';

const ciudadInput = document.getElementById("ciudadInput");
const buscarBtn = document.getElementById("buscarBtn");

const nuevaBusqueda = document.getElementById("nuevaBusqueda");
const intentarOtra = document.getElementById("intentarOtra");

const pantallas = {
    inicio: document.getElementById("inicio"),
    cargando: document.getElementById("cargando"),
    resultado: document.getElementById("resultado"),
    error: document.getElementById("error")
};

/* ====================================
   CAMBIAR PANTALLA
==================================== */

let mantenerInicio = false;
/** Acceso: recibe un nombre de pantalla y actualiza su presentación. @returns {void} */
function mostrarPantalla(nombre) {
    // Una respuesta pendiente no debe cambiar la navegación elegida.
    if (nombre === "cargando") mantenerInicio = false;
    if (mantenerInicio && (nombre === "resultado" || nombre === "error")) return;

    Object.values(pantallas).forEach(pantalla => {
        pantalla.classList.remove("activa");
    });

    pantallas[nombre].classList.add("activa");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ====================================
   FUNCIÓN PRINCIPAL
==================================== */

/** Acceso: lee la ciudad del DOM y presenta el resultado o error. @returns {Promise<void>} */
async function buscarDestino() {

    const textoCiudad = ciudadInput.value.trim();

    if (textoCiudad === "") {

        ciudadInput.focus();
        ciudadInput.classList.add("input-error");

        setTimeout(() => {
            ciudadInput.classList.remove("input-error");
        }, 1000);

        return;
    }


    mostrarPantalla("cargando");


    try {

        const resultado = await procesarDestino(textoCiudad);
        mostrarResultado(resultado);

    }

    catch (error) {

        console.error("FoodTrip:", error);

        mostrarError(error);

    }

}


/* ====================================
   MOSTRAR RESULTADO
==================================== */

/** Acceso: presenta el resultado. @param {import('../modelo/foodTripModel.js').ResultadoFoodTrip} resultado @returns {void} */
function mostrarResultado({ ubicacion, platillos }) {

    document.getElementById("tituloCiudad").textContent =
        `${ubicacion.ciudad}, ${ubicacion.pais}`;


    document.getElementById("descripcionCiudad").textContent =
        `Descubre algunos platillos relacionados con la gastronomía de ${ubicacion.pais}.`;


    document.getElementById("pais").textContent =
        ubicacion.pais;


    document.getElementById("ciudad").textContent =
        ubicacion.ciudad;


    document.getElementById("latitud").textContent =
        Number(ubicacion.latitud).toFixed(4);


    document.getElementById("longitud").textContent =
        Number(ubicacion.longitud).toFixed(4);


    document.getElementById("paisComida").textContent =
        ubicacion.pais;


    /* GOOGLE MAPS */

    const mapsURL =
        `https://www.google.com/maps?q=${ubicacion.latitud},${ubicacion.longitud}`;

    document.getElementById("googleMaps").href =
        mapsURL;


    /* PLATILLOS */

    const contenedor =
        document.getElementById("platillos");

    contenedor.innerHTML = "";


    platillos
        .slice(0, 6)
        .forEach(platillo => {

            const card =
                document.createElement("article");

            card.className = "platillo";


            card.innerHTML = `

                <div class="imagen-platillo">

                    <img
                        src="${platillo.imagen}"
                        alt="${platillo.nombre}"
                        loading="lazy"
                    >

                </div>

                <div class="platillo-contenido">

                    <span class="etiqueta">
                        Gastronomía local
                    </span>

                    <h3>
                        ${platillo.nombre}
                    </h3>

                    <p>
                        Platillo disponible en la colección gastronómica de ${ubicacion.pais}.
                    </p>

                </div>

            `;


            contenedor.appendChild(card);

        });


    mostrarPantalla("resultado");
}


/* ====================================
   ERRORES
==================================== */

/** Acceso: traduce errores a mensajes comprensibles. @param {Error} error @returns {void} */
function mostrarError(error) {

    const titulo =
        document.getElementById("tituloError");

    const mensaje =
        document.getElementById("mensajeError");


    if (error.message === "CIUDAD_NO_ENCONTRADA") {

        titulo.textContent =
            "No se encontró la ciudad";

        mensaje.textContent =
            "No pudimos encontrar la ciudad que ingresaste. Revisa el nombre e intenta nuevamente.";

    }

    else if (error.message === "PAIS_NO_DISPONIBLE") {

        titulo.textContent =
            "Gastronomía no disponible";

        mensaje.textContent =
            "Encontramos la ciudad, pero TheMealDB todavía no cuenta con una categoría gastronómica para ese país.";

    }

    else if (error.message === "SIN_PLATILLOS") {

        titulo.textContent =
            "No encontramos platillos";

        mensaje.textContent =
            "La ciudad fue encontrada, pero no existen platillos disponibles para mostrar.";

    }

    else if (error.message === "TIMEOUT_OPEN_METEO" || error.message === "TIMEOUT_MEALDB") {
        titulo.textContent = "Tiempo de espera agotado";
        mensaje.textContent = "La consulta tardó demasiado. Intenta nuevamente en unos momentos.";
    }
    else if (error.message === "CONEXION_OPEN_METEO" || error.message === "CONEXION_MEALDB") {
        titulo.textContent = "Error de conexión";
        mensaje.textContent = "No pudimos conectarnos a uno de los servicios. Verifica tu conexión a Internet e intenta nuevamente.";
    }
    else {
        titulo.textContent =
            "Servicio temporalmente no disponible";

        mensaje.textContent =
            "No pudimos consultar uno de los servicios. Verifica tu conexión o inténtalo nuevamente más tarde.";

    }


    mostrarPantalla("error");
}


/* ====================================
   EVENTOS
==================================== */

buscarBtn.addEventListener(
    "click",
    buscarDestino
);


ciudadInput.addEventListener(
    "keydown",
    event => {

        if (event.key === "Enter") {

            event.preventDefault();

            buscarDestino();

        }

    }
);


nuevaBusqueda.addEventListener(
    "click",
    volverInicio
);


intentarOtra.addEventListener(
    "click",
    volverInicio
);


function volverInicio() {
    mantenerInicio = true;
    ciudadInput.classList.remove("input-error");

    ciudadInput.value = "";

    mostrarPantalla("inicio");

    ciudadInput.focus();
}
// Navegación de la capa de acceso.
document.querySelectorAll('nav a').forEach(enlace => {
    enlace.addEventListener("click", event => {
        if (enlace.getAttribute("href") === "#inicio") {
            event.preventDefault();
            volverInicio();
            history.replaceState(null, "", location.pathname + location.search);
        }
        document.querySelectorAll('nav a').forEach(item => {
            item.classList.toggle("activo", item === enlace);
        });
    });
});
document.querySelector('nav a[href="#inicio"]').classList.add("activo");

// Mostrar la foto local únicamente cuando sea válida.
const fotoRoma = new Image();
fotoRoma.onload = () => document.querySelector(".foto-roma").classList.add("foto-disponible");
fotoRoma.src = "assets/roma.jpg";
