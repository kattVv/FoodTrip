# FoodTrip

FoodTrip es una aplicación web académica que permite escribir una ciudad y descubrir información de su ubicación junto con platillos relacionados con la gastronomía del país.

**Institución:** UT Santa Catarina  
**Asignatura:** Aplicaciones Web Orientadas a Servicios  
**Año:** 2026

**Integrantes:**

- Flores de Angel Ana Karen
- Santos González Evelyn Aidé
- Vidal Vidal Katia Itzel

## Funcionamiento

Usuario escribe una ciudad → Open-Meteo Geocoding API → ubicación, país y country_code → conversión del código de país a área gastronómica → TheMealDB → platillos → resultado integrado.

Open-Meteo se normaliza a { ciudad, pais, codigoPais, latitud, longitud }. Procesos consulta areasPorCodigo[codigoPais], conservando las 26 equivalencias originales, y solicita platillos de esa área. TheMealDB se normaliza a { id, nombre, imagen }. Acceso recibe un solo objeto { ubicacion, gastronomia: { area }, platillos }.

Se presentan los primeros seis platillos, con las imágenes originales de TheMealDB y el enlace existente a Google Maps.

## Arquitectura de cuatro capas SOA

| Capa | Archivos o recursos | Responsabilidad |
| --- | --- | --- |
| Recursos | Open-Meteo y TheMealDB | Proveedores externos; no forman parte físicamente del código. |
| Servicios | js/servicios/openMeteoService.js, js/servicios/mealDbService.js | Construir las peticiones y transformar respuestas al modelo interno. |
| Servicios (utilidad compartida) | js/servicios/httpClient.js | GET, lectura de JSON, errores y timeout. |
| Procesos | js/procesos/foodTripProcess.js | Orquestar servicios, conservar el mapeo y construir el resultado unificado. |
| Acceso | index.html, css/styles.css, js/acceso/app.js | Entrada del usuario, eventos, navegación, DOM y presentación. |
| Modelo compartido | js/modelo/foodTripModel.js | Contratos internos mediante JSDoc; no constituye una quinta capa. |

La dependencia es Acceso → Procesos → Servicios → Recursos. Solo Servicios ejecuta fetch. Google Maps es un enlace de presentación, no un tercer servicio del mashup. Los campos propios de cada proveedor quedan encapsulados en sus clientes.

## Servicios utilizados

### Open-Meteo

- **Proveedor:** Open-Meteo.
- **Servicio:** Geocoding API.
- **Método:** GET.
- **Estilo:** REST / HTTP.
- **Formato:** JSON.
- **Autenticación:** no requerida para el uso actual.
- **Petición conservada:** https://geocoding-api.open-meteo.com/v1/search?name={ciudad}&count=1&language=es&format=json, codificando la ciudad mediante encodeURIComponent.

Proporciona ciudad, país, código de país, latitud y longitud. Se utiliza el primer resultado, como en el proyecto original. Para límites y condiciones, consultar documentación oficial del proveedor: https://open-meteo.com/en/docs/geocoding-api.

### TheMealDB

- **Proveedor:** TheMealDB.
- **Método:** GET.
- **Endpoint utilizado:** filter.php?a=.
- **Petición conservada:** https://www.themealdb.com/api/json/v1/1/filter.php?a={area}, codificando el área mediante encodeURIComponent.
- **Estilo:** REST / HTTP.
- **Formato:** JSON.

Devuelve alimentos asociados a un área gastronómica. El proyecto utiliza identificador, nombre e imagen. Se conserva la clave 1 presente en la URL original sin añadir credenciales ni cambiar el uso de la API. Para límites y condiciones, consultar documentación oficial del proveedor: https://www.themealdb.com/api.php.

## Timeout y errores

Cada petición utiliza AbortController con un máximo de **8000 ms**, incluida la lectura del cuerpo JSON. El temporizador se elimina en finally tanto en éxito como en error. Las consultas son secuenciales: el límite corresponde a cada servicio, no al flujo completo.

| Caso | Tratamiento |
| --- | --- |
| Ciudad no encontrada | Servicios devuelve null; Procesos lanza CIUDAD_NO_ENCONTRADA. |
| País sin equivalencia | Procesos lanza PAIS_NO_DISPONIBLE sin consultar TheMealDB. |
| Sin platillos | Procesos lanza SIN_PLATILLOS. |
| Servicio no disponible o JSON inválido | ERROR_OPEN_METEO o ERROR_MEALDB. |
| Fallo de conexión reportado por fetch | CONEXION_OPEN_METEO o CONEXION_MEALDB. |
| Tiempo agotado | Aborta y lanza TIMEOUT_OPEN_METEO o TIMEOUT_MEALDB. |

Procesos propaga los fallos de ambos servicios. Acceso muestra mensajes comprensibles sin exponer detalles HTTP, tipos de excepción ni trazas. Los detalles se registran en console.error. El navegador puede reportar de la misma forma fallos de red y bloqueos CORS; no permite distinguir siempre su causa.

## Ejecución

No requiere npm ni instalación de dependencias del proyecto.

**Requisitos:** navegador moderno, VS Code, extensión Live Server y conexión a Internet.

1. Clonar o descargar el repositorio.
2. Abrir la carpeta FoodTrip en VS Code.
3. Abrir index.html.
4. Ejecutar “Open with Live Server”.
5. Escribir una ciudad.
6. Presionar Buscar.

Live Server sirve los módulos ES mediante HTTP. No abrir directamente index.html con file://.

## Pruebas sugeridas

Estas son pruebas manuales sugeridas, no una afirmación de que se ejecutaron.

| Entrada | Resultado esperado |
| --- | --- |
| Roma | Italia, coordenadas y platillos Italian. |
| Monterrey | México, coordenadas y platillos Mexican. |
| Tokio | Japón, coordenadas y platillos Japanese. |
| Madrid | España, coordenadas y platillos Spanish. |
| CiudadQueNoExisteXYZ987 | Error controlado de ciudad no encontrada. |
| Oslo | Si Open-Meteo devuelve Noruega (NO), gastronomía no disponible: ese código no está en el mapeo. |

Confirmar ciudad, país, coordenadas, imágenes y enlace a Google Maps. También puede probarse cualquier ciudad válida cuyo country_code no esté en areasPorCodigo; no añadir equivalencias para evitar ese error.

Comprobar además:

- Buscar por botón y por Enter; entrada vacía.
- Inicio, Acerca de y Contacto.
- Realizar otra búsqueda e Intentar otra búsqueda.
- Inicio durante una consulta pendiente: la respuesta no debe cambiar la pantalla elegida.
- Carga, resultados, seis tarjetas como máximo y errores.
- Logo y fotografía de Roma.
- Con red deshabilitada, mensaje de conexión.
- Con una petición pendiente durante 8 segundos, mensaje de tiempo agotado.
- Con respuestas simuladas, errores HTTP, JSON inválido y ausencia de platillos.

## Repositorio

Git y GitHub se utilizan para mantener el historial de versiones y compartir el proyecto. La participación efectiva y los cambios deben comprobarse en el historial real; este documento no atribuye commits ni contribuciones no verificadas.