import { obtenerUbicacion } from '../servicios/openMeteoService.js';
import { obtenerPlatillos } from '../servicios/mealDbService.js';
// Mapeo conservado del proyecto original.
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

/**
 * Procesos: compone ambos servicios y propaga sus errores controlados.
 * @param {string} ciudad Ciudad ingresada.
 * @returns {Promise<import('../modelo/foodTripModel.js').ResultadoFoodTrip>}
 * @throws {Error} Ciudad inexistente, país sin equivalencia o sin platillos.
 */
export async function procesarDestino(ciudad) {
    const ubicacion = await obtenerUbicacion(ciudad);
    if (!ubicacion) throw new Error('CIUDAD_NO_ENCONTRADA');
    const area = areasPorCodigo[ubicacion.codigoPais];
    if (!area) throw new Error('PAIS_NO_DISPONIBLE');
    const platillos = await obtenerPlatillos(area);
    if (platillos.length === 0) throw new Error('SIN_PLATILLOS');
    return { ubicacion, gastronomia: { area }, platillos };
}