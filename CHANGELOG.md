# ChangeLog


## v1.1

 ### Added
 * Funcionalidad de restaurar contraseña
 * campo de devuelta en el checkout
 * paginas de error (404, 408)
 * funcionalidad para listar y agregar promociones.
 * Se agregaron loading al mostrar el detalle de un producto
 * No muestra el checkout si el comercio esta cerrado.
 * Manejo de productos no disponibles en el home, detalles y checkout
 * Manejo de errores para el detalle de un producto.
 * Promoción solo permite agregar y pasar a una siguiente vista si esta disponible.
 * Las serializaciones de los formularios de promociones se agregaron a utils.
 * Se agregaron los track de detailsProducts y addToCart a utils.
 * Se agrego una notificación general con parámetros de modificación.
 * Se creo función isLogged en utils para comprobar que un usuario este correctamente logueado y sus datos coincidan con los del localstorage.
 * Función que verifica si hay notificaciones en el navegador.
 * Se agrego un delay hasta que el usuario termine de digitar una dirección, para su geolocalización.
 * Se listan los productos y se puede ver sus detalles y hacer la compra.
 * Se agrego función en utils, redirect para hacer redirecciones con parámetros get.
 * Se agrego función en utils, coutCart para aumentar el contador del carrito.
 * Se agrego al header función de vuejs que mantiene actualizado el contador del carrito en cualquier página.
 * El modal para agregar direcciones se agrego al checkout.
 * Cuando un producto no esta disponible se muestra con opacidad.

 ### Changed
 * Se modificaron los eventos y las propiedades para los analytics, para que funcione con pixel.
 * Modificacion en el carrito,checkout y factura para visualizar las promociones.
 * Se muestra el detalle de un producto  /details solo si tiene punto de venta
 * Se corrigio parametros de latitude y longitude para la cobertura.
 * se agrego validación de parametro consumer al agregar una dirección y se cambio la forma en que la api recibe la latitude y la longitude.
 * se agrego validacion para que cargue productos y banners en el home.
 * se agrego validación al traer los productos de un carrito.
 * se agrego parametro status en promociones para solo traer los activos.
 * La calificación de un pedido se muestra cada vez que se entre a una factura y esta tenga el estado entregado.
 * Las categorías se cargan con vuejs.
 * Se agrega pointSale si existe a las urls de categorías.

 ### Removed
 * Se elimino track no usado en promociones de inicialcheckout.
 * Se elimino el archivo detail_promotion.js para usar solo promotion.js
----

## v1.0

 ### Added
 * Unit testing agregar cart, coverage, checkout y order
 * Twitter card a productos y home
 * Se agrego funcionalidad de listar, agregar y eliminar direcciones con la API.
 * Redimir cúpon en el checkout

 ### Changed
 * limite de carga de porducto en el home
 * No se muestra precio por defecto cuando  el precio ya tiene un punto de venta
 * Se modifico la funcionalidad de las direcciones para utilizar la nueva API.
 * Se modifico  la funcionalidad de enviar el formulario de contacto con la nueva api. 

 ### Removed
 * Enlace de ver detalle en promociones
 * Icono de de correo en el footer
 * Se cambia el uso de la api al enviar el formulario de contacto

---

## v0.9

 ### Added
  * Se agrego el comentario al calificar una orden
  * sistema de notificacion de errores con sentry
  * calificacion de clientes
  * notificacion del comercio esta cerrado

 ### Changed
   * la carga inicial de la pagina se mejoró
   * mejora en los detalles de un producto en la factura

 ### Removed
   * se eliminaron los scripts que tenia los html
   * se elimina la descripticiond el productos en el home

---
