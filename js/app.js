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
   RELACIÓN PAÍS → ÁREA THEMEALDB
==================================== */

const areasPorCodigo = {

    IT: "Italian",
    MX: "Mexican",
    JP: "Japanese",
    CN: "Chinese",
    FR: "French",
    IN: "Indian",
    CA: "Canadian",
    HR: "Croatian",
    EG: "Egyptian",
    GR: "Greek",
    IE: "Irish",
    JM: "Jamaican",
    MY: "Malaysian",
    MA: "Moroccan",
    NL: "Dutch",
    PH: "Filipino",
    PL: "Polish",
    PT: "Portuguese",
    RU: "Russian",
    ES: "Spanish",
    TH: "Thai",
    TN: "Tunisian",
    TR: "Turkish",
    GB: "British",
    US: "American",
    VN: "Vietnamese"

};


/* ====================================
   CAMBIAR PANTALLA
==================================== */

let mantenerInicio = false;
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
   API 1 - OPEN METEO
==================================== */

async function obtenerUbicacion(ciudad) {

    const url =
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(ciudad)}&count=1&language=es&format=json`;

    const respuesta = await fetch(url);

    if (!respuesta.ok) {
        throw new Error("ERROR_OPEN_METEO");
    }

    const datos = await respuesta.json();

    console.log("Open-Meteo:", datos);

    if (!datos.results || datos.results.length === 0) {
        throw new Error("CIUDAD_NO_ENCONTRADA");
    }

    return datos.results[0];
}


/* ====================================
   API 2 - THEMEALDB
==================================== */

async function obtenerPlatillos(area) {

    const url =
        `https://www.themealdb.com/api/json/v1/1/filter.php?a=${encodeURIComponent(area)}`;

    const respuesta = await fetch(url);

    if (!respuesta.ok) {
        throw new Error("ERROR_MEALDB");
    }

    const datos = await respuesta.json();

    console.log("TheMealDB:", datos);

    return datos.meals || [];
}


/* ====================================
   FUNCIÓN PRINCIPAL
==================================== */

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

        /* API 1 */

        const ubicacion =
            await obtenerUbicacion(textoCiudad);


        /* SALIDA API 1 */

        const codigoPais =
            ubicacion.country_code;


        /* PROCESAMIENTO ENTRE APIs */

        const areaMealDB =
            areasPorCodigo[codigoPais];


        if (!areaMealDB) {
            throw new Error("PAIS_NO_DISPONIBLE");
        }


        /* API 2 */

        const platillos =
            await obtenerPlatillos(areaMealDB);


        if (platillos.length === 0) {
            throw new Error("SIN_PLATILLOS");
        }


        mostrarResultado(
            ubicacion,
            platillos
        );

    }

    catch (error) {

        console.error("FoodTrip:", error);

        mostrarError(error);

    }

}


/* ====================================
   MOSTRAR RESULTADO
==================================== */

function mostrarResultado(ubicacion, platillos) {

    document.getElementById("tituloCiudad").textContent =
        `${ubicacion.name}, ${ubicacion.country}`;


    document.getElementById("descripcionCiudad").textContent =
        `Descubre algunos platillos relacionados con la gastronomía de ${ubicacion.country}.`;


    document.getElementById("pais").textContent =
        ubicacion.country;


    document.getElementById("ciudad").textContent =
        ubicacion.name;


    document.getElementById("latitud").textContent =
        Number(ubicacion.latitude).toFixed(4);


    document.getElementById("longitud").textContent =
        Number(ubicacion.longitude).toFixed(4);


    document.getElementById("paisComida").textContent =
        ubicacion.country;


    /* GOOGLE MAPS */

    const mapsURL =
        `https://www.google.com/maps?q=${ubicacion.latitude},${ubicacion.longitude}`;

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
                        src="${platillo.strMealThumb}"
                        alt="${platillo.strMeal}"
                        loading="lazy"
                    >

                </div>

                <div class="platillo-contenido">

                    <span class="etiqueta">
                        Gastronomía local
                    </span>

                    <h3>
                        ${platillo.strMeal}
                    </h3>

                    <p>
                        Platillo disponible en la colección gastronómica de ${ubicacion.country}.
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
// Navegación de interfaz; las funciones de consulta permanecen intactas.
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
