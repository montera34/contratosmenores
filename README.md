Contratos menores en Valencia
=============

Visualización de datos de los contratos menores del Ayuntamiento de VaLencia. Desarrollo a partir de la visuliazación de los 
gastos de las tarjetas black de los directivos y consejeros de Caja Madrid-Bankia disponible en en http://numeroteca.org/tarjetasblack

Descarga el código y abre en un navegador el archivo index.html

Cómo funciona
============

## Página

`index.html` Es la página que vemos en el navegador. Incluye el título de la página, párrafo explicatorio... Abre esta página en tu navegador para ver la visualización.

## Visualización

`/js/dataviz.js` Es el archivo que genera la visualización. Lee los datos de la carpeta /data/ y los muestra con la ayuda de la librería [d3](https://d3js.org/) (`/js/d3.v3.min.js`). 
Para añadir nuevas funcionalidades tendremos que modificar este archivo:
+ que al pasar el ratón por las barras aparezcan unos datos u otros
+ el comportamiento de los botones
+ la escala de tiempo
+ máximo del eje vertical
+ ...

## Datos

+ `/data/` En esta carpeta están la lista de los datos que vamos a usar.
+ `/data/data.tsv` Es el listado de todos los contratos descargado y convertid oa tsv (tab separated value). Se podría hacer usado también el formato csv (comma separated value).

## Leyendas

+ `/data/viplist.tsv` Es la lista de empresas para la leyenda que permite seleccionar la empresa. Está extraida de las empresas que más importe contratan según https://twitter.com/enrikuspf/status/768139411955605508
+ `/data/thinglist.tsv` Es la lista de elementos para la leyenda que permite seleccionar el tipo de gasto. Se indican también los colores de los botones.
+ `/data/centroslist.tsv` Es la lista de elementos para la leyenda que permite seleccionar elcentro presupuestario. 

### ¿Cómo funcionan las leyendas?

Buscan en cada una de las columnas de cada contrato de `/data/data.tsv` la palabra que contiene la leyenda. 
Se puede cambiar como se indica en esta línea de código de `/js/dataviz.js`:
  `legendcentros.select('#publicitat').html("Of. Publicitat Anuncis Oficials");`
donde se sustituye "publicitat" por "Of. Publicitat Anuncis Oficials" en la leyenda.

## Colores

`/css/style.css` Se indican los colores de las barras y botones, aunque también en `/js/dataviz.js` y en las leyendas se indican colores.
