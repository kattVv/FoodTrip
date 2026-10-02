/**
 * Contratos internos compartidos; independientes de los proveedores.
 * @typedef {Object} Ubicacion
 * @property {string} ciudad
 * @property {string} pais
 * @property {string} codigoPais
 * @property {number} latitud
 * @property {number} longitud
 *
 * @typedef {Object} Platillo
 * @property {string} id
 * @property {string} nombre
 * @property {string} imagen
 *
 * @typedef {Object} ResultadoFoodTrip
 * @property {Ubicacion} ubicacion
 * @property {{area: string}} gastronomia
 * @property {Platillo[]} platillos
 */
export {};