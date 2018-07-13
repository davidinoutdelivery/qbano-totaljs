/**
 * conjunto de utilidades utilizadas por cada
 * una de los temas.
 */
$(document).ready(function () {
    if (env && env.MODE === "PRO") {
        Analytics.setup(serviceConfig);
    }

    if (env && Raven && env.MODE === "PRO") {
        Raven.config('https://5806e089e4cc413fb8f36d3abdd064f2@sentry.io/192371', {
            environment: "Business :" + serviceConfig.businessId,
            logger: 'javascript'
        }).install();
    }

});


var getListCssClasses = function () {
    var allRules = [];
    var sSheetList = document.styleSheets;
    for (var sSheet = 0; sSheet < sSheetList.length; sSheet++)
    {
        var ruleList = document.styleSheets[sSheet].cssRules;
        for (var rule = 0; rule < ruleList.length; rule++)
        {
            allRules.push(ruleList[rule].selectorText);
        }
    }
    return allRules;
};


/**
 * Verifica si "name_class" está definido en los estilos CSS de la página
 * @param name_class
 */
var classCssOk = function (name_class) {
    var name_class_select = "." + name_class;
    // var rules = document.styleSheets[0].rules || document.styleSheets[0].cssRules;
    var rules = getListCssClasses();
    console.log("rules.length: ", rules.length);
    for (var i = 0; i < rules.length; i++) {
        var rule = rules[i];
        if (typeof rules[i] !== 'undefined' && rules[i].indexOf(name_class) >= 0) {
            console.log("rules[i]: ", rules[i]);
            return true;
        }
    }
    return false;
};


(function ($) {
    /**
     * Se encarga de sobreponer un estado de carga a botones ('a', 'button')
     * @param dict
     *      => dict por defecto:
     *      {
     *          msg: "Cargando...",
     *          show_spin: true,
     *          show_text: true,
     *          block_button: true
     *      }
     * @returns {jQuery}
     */
    $.fn.startLoading = function (dict) {

        // Se valida qué tipo de elemento es
        var element = $(this);
        var type_element = element.prop("tagName");

        if (type_element === "A" || type_element === "BUTTON") {
            // Se valida si hay datos de configuración
            var msg = "Cargando...";
            var animate_class = "spin-load";
            var block_button_class = "disable-btn";

            if (typeof dict === "object" && Object.keys(dict).length > 0) {
                if (dict.msg) {
                    msg = dict.msg;
                }
                if (dict.show_spin === false) {
                    animate_class = "";
                }
                if (dict.show_text === false) {
                    msg = "";
                }
                if (dict.block_button === false) {
                    block_button_class = "";
                }
            }

            // Se guarda el estado anterior del botón para restaurarlo después de terminar
            element.addClass(block_button_class);
            element.prop("disabled", true);
            var old_html = element.html();
            var data_oldhtml = element.data("oldhtml");

            if (!data_oldhtml) {
                // Se guarda el estado anterior del botón
                element.attr("data-oldhtml", old_html);
            }
            element.html("<div class='" + animate_class + "' style='position: relative !important;'></div>" + msg);
        } else {
            var position = "position: relative !important;";
            var element_height = (element.height() / 2) * (-1);
            var element_width = (element.width() / 2) - 10;

            if (element.css("position") === "relative") {
                element_height = element_height * (-1);
                position = "position: absolute !important;";
            }

            element.addClass("disable-btn");
            if (type_element === "IMG") {
                element.addClass("img-opacity-middle");
                element.after("<div class='spin-load spin-load-img' style='top: " + element_height + "px !important; left: " + element_width + "px !important; " + position + "'></div>");
            } else if (type_element === "SELECT") {
                element.addClass("img-opacity-high");
                element.after("<div class='spin-load spin-load-select'></div>");
            } else {
                element.addClass("element-opacity-middle");
                element.append("<div class='spin-load spin-load-img' style='top: " + element_height + "px !important; left: " + element_width + "px !important; " + position + "'></div>");
            }
        }
    };

    /**
     * Se encarga de quitar el estado de carga de un elemento
     */
    $.fn.stopLoading = function () {

        // Se valida qué tipo de elemento es
        var element = $(this);
        var type_element = element.prop("tagName");

        element.removeClass("disable-btn img-opacity-middle element-opacity-middle img-opacity-high");
        element.prop("disabled", false);
        if (type_element === "A" || type_element === "BUTTON") {
            var data_oldhtml = element.data("oldhtml");

            if (data_oldhtml) {
                element.html(data_oldhtml);
            } else {
                element.html("");
            }
        } else {
            if (type_element === "IMG" || type_element === "SELECT") {
                element.parent().find(".spin-load").remove();
            } else {
                element.find(".spin-load").remove();
            }
        }

    };

})(jQuery);

/**
 *  almacena una variable local
 * @param key :: llave a almacenar
 * @param value :: valor a almacenar
 */
function setLocalStorage(key, value) {
    if (typeof localStorage === 'object') {
        if (key && value) {
            try {
                localStorage.setItem(key, value);
            } catch (e) {
                console.log("error ", e);
                Storage.prototype._setItem = Storage.prototype.setItem;
                Storage.prototype.setItem = function () {};
            }
        }
    }
}

/**
 * obtiene un valor local con repesto a una llave
 * @param key :: nombre de la llave
 */
function getLocalStorage(key) {
    if (key) {
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.log("Your web browser does not support storing settings locally. In Safari, " +
                    "the most common cause of this is using Private Browsing Mode", e);
            Storage.prototype._getItem = Storage.prototype.getItem;
            Storage.prototype.getItem = function () {};
        }
    }
}

/**
 * almacena datos en la session
 * @param key :: llave a almacenar
 * @param value :: valor a almacenar
 */
function setSessionStorage(key, value) {
    if (key && value) {
        try {
            sessionStorage.setItem(key, value);
        } catch (e) {
            console.log("error ", e);
        }
    }
}

/**
 * retorna  datos de la session
 * @param key :: llave a almacenar
 */
function getSessionStorage(key) {
    if (key) {
        try {
            return sessionStorage.getItem(key);
        } catch (e) {
            console.log("error ", e);
        }
    }
}

/**
 * Elimina un item del localstorage
 * @param key :: nombre de la llave
 */
function removeLocalStorage(key) {
    if (key)
        localStorage.removeItem(key);
}

/**
 * convierte un form en un objeto
 * @param $form id del formulario
 * @returns un objeto
 */
function getFormData($form) {
    var unindexedArray = $form.serializeArray();
    var array = {};
    $.map(unindexedArray, function (n, i) {
        array[n['name']] = n['value'];
    });
    return array;
}

/**
 * retorna el valor de la cookie por el nombre
 * @param name :: nombre de la cookie
 * @returns {T} el valor de la cookie
 */
function getCookie(name) {
    var value = "; " + document.cookie;
    var parts = value.split("; " + name + "=");
    if (parts.length === 2)
        return parts.pop().split(";").shift();
}

/**
 * limpia todas las cookies
 */
function deleteAllCookies() {
    var cookies = document.cookie.split(";");
    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }
}

/**
 * limpia una cookie
 * @param name :: nombre de la cookie
 */
function deleteCookie(name) {
    if (name)
        document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}

/**
 * quita los caracteres especiales a una cadena
 * @param chain : cadena a convertir
 * @returns {string|*}
 */
function getCleanedString(chain) {
    if (chain) {
        var specialChars = "!@#$^&%*()+=-[]\/{}|:<>?,.";
        for (var i = 0; i < specialChars.length; i++) {
            chain = chain.replace(new RegExp("\\" + specialChars[i], 'gi'), '');
        }
        chain = chain.toLowerCase();
        chain = $.trim(chain);

        chain = chain.replace(/á/gi, "a");
        chain = chain.replace(/é/gi, "e");
        chain = chain.replace(/í/gi, "i");
        chain = chain.replace(/ó/gi, "o");
        chain = chain.replace(/ú/gi, "u");
        chain = chain.replace(/ñ/gi, "n");
        return chain;
    } else {
        return "";
    }
}

/**
 * retorna un color de manera aleatoria
 * @returns {string}
 */
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

/**
 * esta funcion valida y agregar una url a un identificador
 * @param id ::identificador del elemento html
 * @param url :: url base
 * @param fields ::campos de la url
 */
function changeHref(id, fields, url = null) {
    if (url) {
        if (fields) {
            $(id).attr("href", url + fields);
        }
    } else if (id && fields) {
        $(id).attr("href", fields);
}
}

/**
 * Obtiene el mensaje de la respuesta de la api
 * @param message :: string  con el mensaje de respuesta
 * @param type :: boolean, si es true es un json
 * @returns {string}
 */
function getMessage(message, type) {
    let value = JSON.stringify(message);
    value = value.split("::")[1].replace(/\\/g, "");
    if (type) {
        return JSON.parse(value.slice(0, value.length - 1));
    }
    return value.slice(0, value.length - 1);
}
;

/**
 * Serializa todos los campos de un formulario en un array, cada campo es {nombre, valor}.
 * @param formName :: string  con nombre del formulario.
 * @returns {array}
 */
function serializedAll(formName) {
    formData = $('#' + formName).serializeArray();
    $.each($('#' + formName + ' input[type=checkbox]')
            .filter(function (idx) {
                return $(this).prop('checked') === false;
            }),
            function (idx, el) {
                // attach matched element names to the formData with a chosen value.
                formData.push({name: $(el).attr('name'), value: 'off'});
            });
    return formData;
}
;

/**
 * Serializa todos los campos de un formulario como un objeto.
 * @param formData :: array serializado de un formulario.
 * @returns {object}
 */
function serializeObject(formData) {
    //revisar sirve para promociones, y debe funcionar en productos
    var o = {};
    var a = formData;

    for (var items of a) {
        separador = items.name.split(".");
        principal = separador[0];
        modifier = separador[1];
        item = separador[2];

        if (o[principal]) {
            if (o[principal][modifier]) {
                if (o[principal][modifier][item]) {
                    o[principal][modifier][item].push(items.value);
                } else {
                    o[principal][modifier][item] = [];
                    o[principal][modifier][item].push(items.value);
                }
            } else {
                o[principal][modifier] = {};
                o[principal][modifier][item] = [];
                o[principal][modifier][item].push(items.value);
            }
        } else {
            o[principal] = {};
            o[principal][modifier] = {};
            o[principal][modifier][item] = [];
            o[principal][modifier][item].push(items.value);
        }
    }
    return o;
}
;

/**
 * le da formato de moneda en pesos a un valor
 * @param value :: precio.
 * @returns {String}
 */
function currencyFormat(value) {
    if (value) {
        return "$ " + value.toLocaleString();
    } else {
        return "$ 0";
    }
}
;

/**
 * devuelve una promesa con el resultado del api llamado
 * @param apiName:String :: nombre del api que se va a usar.
 * @param type :: tipo de petición. ej: post,get.
 * @param params :: parametros requeridos por el api.
 * @returns {promise}
 */
function apiAjax(apiName, type, params) {

    var timeout = 0;
    if (typeof params !== "undefined" && typeof params.timeout !== "undefined" && $.isNumeric(params.timeout)) {
        timeout = params.timeout;
    }

    return new Promise((resolve, reject) => {
        if (apiName && type && params) {
            $.ajax({
                type: type,
                url: '/api/' + apiName,
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(params),
                dataType: 'json',
                timeout: timeout
            })
                    .then(data => {
                        resolve(data);
                    })
                    .fail(error => {
                        reject(error);
                    });
        } else {
            reject("Invalid parameters");
        }
    });
}
;

/**
 * Guarda los datos de un producto visualizado para el analitycs
 * @param product::Object :: objecto con los datos del producto.
 * @param type :: product o promotion.
 */
function trackProduct(product, type) {
    if (product && type) {
        /** Analytics **/
        var params = {};
        params[Properties.CONTENT_NAME] = product.name;
        params[Properties.CONTENT_ID] = product.id;
        params[Properties.CONTENT_TYPE] = type;
        params[Properties.CONTENT_CATEGORY] = product.category.name;
        params[Properties.VALUE] = product.price ? product.price : product.priceDefault;
        params[Properties.HAS_MODIFIERS] = (product.modifiers && product.modifiers.length > 0) ? true : false;
        params[Properties.HAS_MODIFIERS_GROUP] = (product.modifiersGroups && product.modifiersGroups.length > 0) ? true : false;
        params[Properties.HAS_VALUES_MEALS] = (product.valuesMeals && product.valuesMeals.length > 0) ? true : false;
        params[Properties.IS_COMBO] = product.requiredCombo ? product.requiredCombo : false;
        params[Properties.STATUS] = product.status;
        params[Properties.CURRENCY] = "COP";
        Analytics.track(EVENTS.DETAILS_PRODUCT, params);
        /** **/
    }
}
;

/**
 * Guarda los datos de un producto agregado en el carrito para el analitycs
 * @param product::Object :: objecto con los datos del producto.
 * @param type :: product o promotion.
 */
function trackAddToCart(product, type) {
    if (product && type) {

        /** Analytics **/
        var params = {};
        params[Properties.CONTENT_NAME] = product.name;
        params[Properties.CONTENT_ID] = product.id;
        params[Properties.CONTENT_TYPE] = type;
        params[Properties.CONTENT_CATEGORY] = product.category.name;
        params[Properties.VALUE] = product.price ? product.price : product.priceDefault;
        params[Properties.HAS_MODIFIERS] = (product.modifiers && product.modifiers.length > 0) ? true : false;
        params[Properties.HAS_MODIFIERS_GROUP] = (product.modifiersGroups && product.modifiersGroups.length > 0) ? true : false;
        params[Properties.HAS_VALUES_MEALS] = (product.valuesMeals && product.valuesMeals.length > 0) ? true : false;
        params[Properties.IS_COMBO] = product.requiredCombo ? product.requiredCombo : false;
        params[Properties.STATUS] = product.status;
        params[Properties.PURCHASE] = product.purchase;
        params[Properties.CURRENCY] = "COP";
        Analytics.track(EVENTS.ADD_TO_CART, params);
        /** **/

    }
}

/**
 * Verifica que un usuario este logueado y que el consumer coincida
 */
function isLogged() {
    var parseUser = Parse.User.current();
    var user = getLocalStorage(nameStorage.consumer) ? JSON.parse(getLocalStorage(nameStorage.consumer)) : null;

    if (!parseUser) {
        window.location = '/';
        return false;
    } else {
        if (!user.user || (user.user.objectId !== parseUser.id)) {
            Parse.User.logOut().then(function () {
                localStorage.clear();
                deleteAllCookies();
                Analytics.track(EVENTS.LOGOUT, {});
                window.location = '/';
            });
            return false;
        } else
            return true;
    }

}

/**
 * Verifica si el navegador tiene notificaciones.
 */
function hasNotification() {
    if (!("Notification" in window)) {
        console.log("This browser does not support desktop notification");
    }
    if (typeof Notification !== "undefined" && Notification && Notification.permission !== "granted") {
        Notification.requestPermission();
    }
}

/**
 * Función que causa un retardo
 */
var delay = (function () {
    var timer = 0;
    return function (callback, ms) {
        clearTimeout(timer);
        timer = setTimeout(callback, ms);
    };
})();


/**
 * Redirecciona a una ruta de la página.
 * @param pathName ::String :: ruta a donde se direcciona. ej. "home"
 * @param parameter :: Object :: parámetros get opcionales. ej. {id: 1}
 */
function redirect(pathName, parameter = null) {
    let path = pathName;
    if (!parameter) {
        let pointSale = jsonParse(getLocalStorage(nameStorage.pointSale));
        if (pointSale) {
            path = path + '?pointSale=' + pointSale.slug;
        }
    } else {
        if (parameter !== null && typeof parameter === 'object') {
            let query = "?";
            for (let param in parameter) {
                query += param + '=' + parameter[param] + '&';
            }
            query = query.slice(0, query.length - 1);
            path += query;
        }
    }
    window.location.href = path;
}

/**
 * Cambia el valor del contador en el carrito
 * @param value ::number :: nuevo valor del carrito
 */
function cartCount(value) {
    let cartId = getLocalStorage(nameStorage.cartId);

    if (parseInt(value) > 0) {
        if (cartId) {
            setLocalStorage(nameStorage.cartCount, value + '');
            $("li a.carrito b").text(value);
            $("li a.carrito").attr("href", "/cart?id=" + cartId);
        } else {
            setLocalStorage(nameStorage.cartCount, '0');
            $("li a.carrito b").text(0);
            $("li a.carrito").attr("href", nameStorage.cartUrl);
        }
    } else {
        setLocalStorage(nameStorage.cartCount, '0');
        $("li a.carrito b").text(0);
        $("li a.carrito").attr("href", nameStorage.cartUrl);
    }
}

/**
 * Se encarga de obtener variables de URL
 */
function getUrlVars() {
    var vars = {};
    window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
        vars[key] = value;
    });
    return vars;
}

/**
 * Se encarga de clonar un objeto evitando problemas de referencia
 */
function clone(obj) {
    if (null == obj || "object" != typeof obj)
        return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr))
            copy[attr] = obj[attr];
    }
    return copy;
}

/**
 * Polyfill for IE
 */
if (!String.prototype.includes) {
    String.prototype.includes = function (search, start) {
        'use strict';
        if (typeof start !== 'number') {
            start = 0;
        }

        if (start + search.length > this.length) {
            return false;
        } else {
            return this.indexOf(search, start) !== -1;
        }
    };
}

function formatPhone(phone) {
    phone = String(phone);
    phone = phone.replace(/-/g, "");
    var phoneLength = phone.length;
    if (phoneLength === 7) {
        return phone.replace(/(\d{3})(\d{4})/, "$1-$2");
    } else if (phoneLength === 10) {
        return phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
    } else if (phoneLength === 11) {
        return phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
    } else {
        return phone;
    }
}

/**
 * Convierte una cadena a objeto, si existe un error es null
 * @param data ::String :: cadena a convertir a objeto
 */
function jsonParse(data) {
    try {
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
}

/**
 * Devuelve el punto de venta actual o null si no existe o hay un error
 */
function getPointSale() {
    return jsonParse(getLocalStorage(nameStorage.pointSale));
}

/**
 * Anexa a la url actual el pointsale como parámetro.
 * @param pointsaleId ::String :: identificador del punto de venta.
 * @param path ::String :: path al cual direccionar.
 */
function urlPointsale(pointsaleId, path = null) {
    var currentPath = window.location.pathname;
    if (pointsaleId) {
        path = path ? path : window.location;
        var pointSale = '?pointSale=' + pointsaleId.replace("#", "");
        var url = path + pointSale;
        if (url != currentPath) {
            window.location.href = path + pointSale;
        }
}
}