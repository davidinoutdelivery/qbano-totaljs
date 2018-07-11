/**
 * utilerias
 */

/**
 * crea una cookie y la actualiza
 * @param controller :: controlador
 * @param name :: nombre de la cookie
 * @param value :: valor de la cookie
 */
cookie = function (controller, name, value) {
    controller.res.cookie(name, '', '-1 day');
    controller.res.cookie(name, value, new Date().add('day', 1));
};

/**
 * retorna el valor de una cookie
 * @param controller :: controlador
 * @param name :: nombre de la cookie
 * @returns {*} valor de la cookie
 */
getCookie = function (controller, name) {
    return controller.req.cookie(name)
};