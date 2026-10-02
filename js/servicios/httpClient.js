const TIMEOUT_MS = 8000;
/**
 * Servicios: ejecuta GET y lee JSON dentro del mismo timeout.
 * @param {string} url URL del proveedor.
 * @param {"OPEN_METEO"|"MEALDB"} proveedor Identificador de errores.
 * @returns {Promise<Object>} JSON exclusivo para el cliente de servicio.
 */
export async function obtenerJson(url, proveedor) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
        const respuesta = await fetch(url, { signal: controller.signal });
        if (!respuesta.ok) throw new Error('ERROR_' + proveedor);
        return await respuesta.json();
    } catch (error) {
        if (controller.signal.aborted) {
            throw new Error('TIMEOUT_' + proveedor, { cause: error });
        }
        if (error instanceof TypeError) {
            throw new Error('CONEXION_' + proveedor, { cause: error });
        }
        if (error.message === 'ERROR_' + proveedor) throw error;
        throw new Error('ERROR_' + proveedor, { cause: error });
    } finally {
        clearTimeout(timeout);
    }
}