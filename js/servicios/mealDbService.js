import { obtenerJson } from './httpClient.js';
/**
 * Servicios: consulta TheMealDB y normaliza sus platillos.
 * @param {string} area Área gastronómica.
 * @returns {Promise<import('../modelo/foodTripModel.js').Platillo[]>}
 * Platillos con las imágenes originales del proveedor.
 */
export async function obtenerPlatillos(area) {
    const url = 'https://www.themealdb.com/api/json/v1/1/filter.php?a=' +
        encodeURIComponent(area);
    const datos = await obtenerJson(url, 'MEALDB');
    return (datos.meals || []).map(platillo => ({
        id: platillo.idMeal,
        nombre: platillo.strMeal,
        imagen: platillo.strMealThumb
    }));
}