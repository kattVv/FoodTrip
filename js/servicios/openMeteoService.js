import { obtenerJson } from './httpClient.js';
/**
 * Servicios: consulta Open-Meteo y normaliza su primera ubicación.
 * @param {string} ciudad Ciudad ingresada.
 * @returns {Promise<import('../modelo/foodTripModel.js').Ubicacion|null>}
 * Ubicación interna, o null si no existen resultados.
 */
export async function obtenerUbicacion(ciudad) {
    const url = 'https://geocoding-api.open-meteo.com/v1/search?name=' +
        encodeURIComponent(ciudad) + '&count=1&language=es&format=json';
    const datos = await obtenerJson(url, 'OPEN_METEO');
    if (!datos.results || datos.results.length === 0) return null;
    const ubicacion = datos.results[0];
    return {
        ciudad: ubicacion.name,
        pais: ubicacion.country,
        codigoPais: ubicacion.country_code,
        latitud: ubicacion.latitude,
        longitud: ubicacion.longitude
    };
}