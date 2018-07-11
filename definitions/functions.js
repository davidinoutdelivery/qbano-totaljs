/* global F */

var Raven = require('raven');

/**
 * funcion  que reporta en modo producion
 * al servidor de errores sentry
 */
F.functions.crashReport = function () {
    if (F.config["mode"] === "PRO") {
        Raven.config('https://5806e089e4cc413fb8f36d3abdd064f2:a0af53606d5942608b850f26faa222df@sentry.io/192371', {
            environment: "Business :" + F.config['business_id']
        }).install();
    }
};

/**
 * se encarga de enviar el error a sentry
 * si esta en modo producción el entorno
 * @param error :: error capturado
 */
F.functions.sendCrash = function (error) {
    if (F.config["mode"] === "PRO") {
        Raven.captureException(error);
    } else {
        console.log("descripción del error", error);
    }
};

/**
 * Obtiene el mensaje de la respuesta de la api
 * @param message :: string  con el mensaje de respuesta
 * @param type :: boolean, si es true es un json
 * @returns {string}
 */
F.functions.getMessage = function (message, type) {
    if(message) {
        let value = JSON.stringify(message).split("::")[1].replace(/\\/g, "");
        if (type) {
            return JSON.parse(value.slice(0, value.length - 5));
        }
        return value.slice(0, value.length - 5);
    }
};

/**
 * Obtiene las metatags para productos
 * @todo: se deben manejar entradas como keywords y property
 * @param self :: apuntador
 * @param data :: información que retorna la api de un producto
 * @returns {string}
 */
F.functions.metaTags = function (self, data) {
    var url = 'http://transmartfoundation.org/wp-content/plugins/lightbox/images/No-image-found.jpg';
    var detail = 'sin imagen';
    if(data.result) {
        if (data.result.image) {
            url = data.result.image.url;
            detail = data.result.name;
        }
    }

    return '<meta property="fb:app_id" content="'+F.config["facebook_id"]+'"/>'
        + '<meta name="title" content=" ' + data.result.name + '" />'
        + '<meta name="description" content=" ' + data.result.description + '" />'
        + '<meta name="keywords" content="producto, promoción" />'
        + '<meta name="image" content="' + url + '" />'
        + '<meta name="og:title" content="' + detail + '" />'
        + '<meta name="og:description" content=" ' + data.result.description + '" />'
        + '<meta property="og:image" content="' + url + '"/>'
        + '<meta property="og:url" content="' + self.req.uri.href + '"/>'
        + '<meta property="og:title" content="' + data.result.name + '"/>'
        + '<meta property="og:image:type" content="image/png"/>'
        + '<meta property="og:type" content="article"/>'
        + '<meta property="og:description" content="' + data.result.description + '"/>'
        + '<link href="' + url + '" rel="image_src">';
};


let main_title = F.config['title'];
let timeoutRequest = 50000;
let header = {
    'X-Parse-Application-Id': 'hSMaiK7EXqDqRVYyY2fjIp4lBweiZnjpEmhH4LpJ',
    'Content-Type': 'application/json'
};

/**
 * Builds complete title for a page
 * @param page_name
 * @returns {*}
 */
F.functions.build_title = function (page_name) {
    if (typeof page_name !== "string") {
        return main_title;
    }
    return main_title + " - " + page_name;
};

/**
 * Prints logs in the console depending of 'allow_logs'
 * @param msg
 */
let allow_logs = F.config['allow_logs'] ? F.config['allow_logs'] : false;
F.functions.log = function (msg) {
    if (allow_logs) {
        let new_line = msg.split("\n");
        if (new_line.length > 1) {
            let current_date = new Date().toLocaleString();
            msg = "\n[" + current_date + "]" + new_line[1];
        }
        console.log(msg);
    }
};

/**
 * Handles the response of 'request' library and return a response using correct format
 * @param error :: Request error response
 * @param responseRequest :: Complete request response including status code
 * @param body :: Only the response body
 */
F.functions.handle_response = function (error, responseRequest, body) {
    let _resp = {
        response: {}
    };

    try {F.functions.log("statusCode: " + responseRequest.statusCode);}catch(e){/*pass*/}
    if (error && (error.code === "ESOCKETTIMEDOUT" || error.code === "ETIMEDOUT" || error.connect === true)) {
        _resp["status"] = 408;
    }
    else if (error) {
        console.log("ERROR!!", error);
        _resp["status"] = 500;
    }
    else {
        _resp["response"] = body;
        if (typeof body !== "object") {
            _resp["response"] = {};
        }
        _resp["status"] = responseRequest.statusCode;
    }
    return _resp;
};


/**
 * View response for total js (Client side)
 * @param controller :: self (controller instance)
 * @param view :: View name
 * @param status :: statusCode
 * @param dict :: Response or message
 */
F.functions.view_response = function (controller, view, status, dict) {
    controller.status = status;
    if (status >= 200 && status <= 209) {
        controller.view(String(view), dict);
    }
    else if (view === status) {
        if (status === 404 || status === 408) {
            controller.view(String(view), dict);
        }
        else {
            //Cualquier otro error se maneja como 404
            controller.view("404", dict);
        }
    }
    else {
        if (isNaN(view)) {
            controller.view(String(view), dict);
        }
        else {
            controller.view("404", dict);
        }
    }
};

/**
 * Returns controller HTTP response using JSON format
 * @param controller
 * @param status
 * @param dict
 */
F.functions.json_response = function (controller, status, dict) {
    controller.status = status;
    controller.json(dict);
};

/**
 * query de orientdb
 * @param query :: cadena con la consulta
 * @param db :: instancia de la base de datos
 * @returns Promise
 */
F.functions.query = function (query) {
    console.log("QUERY::=>",query);
    return new Promise((resolve, reject) => {
        if (typeof query === 'string' || query instanceof String) {
            let db = DB();
            db.query(query, {class: "s"})
                .then( function ( response ) {
                    resolve(response);
                    db.close();
                }).catch( function ( e ) {
                    reject(e);
                    db.close();
             });
        } else {
            reject("Invalid parameters");
        }
    });
}

/**
 * Manejo de errores de Orientdb
 */
F.functions.handleError = function ( error ) {
    
    /** 100 - 129 = orientdb Error
     *  130 - 159 = manual Error
     *  160 - 189 = server error
     *  190 - 200 = another
     */
    if (error && error.type) {
        switch (error.type) {
            case 'com.orientechnologies.orient.core.storage.ORecordDuplicatedException':
                error.code = 100; //Registro duplicado
                error.status = 400;
                break;

            case 'com.orientechnologies.orient.core.exception.OValidationException':
                error.code = 101; //Campos obligatorios en base de datos
                error.status = 400;
                break;
            
            case 'com.orientechnologies.orient.core.exception.OSecurityAccessException':
                error.code = 102; // Sin permisos en BD
                error.status = 400;
                break;

            case 'com.orientechnologies.orient.core.exception.OCommandExecutionException':
                error.code = 103; // consulta mal formada
                error.status = 400;
                break;
            
            case 'com.orientechnologies.orient.core.exception.ORecordNotFoundException':
                error.code = 104; // Registro no encontrado
                error.status = 400;
                break;
            
            case 'com.orientechnologies.orient.core.command.script.OCommandScriptException':
                error.code = 105; //Error generado por un script, manejado
                error.status = 400;
                break;

            case 'manual error':
                switch (error.message) {
                    case "Mandatory parameters":
                        error.code = 130;
                        error.status = 400;
                        break;
                    case "timeout":
                        error.code = 158;
                        error.status = 408;
                        break;
                
                    default:
                        error.code = 159; // error manual sin manejar
                        error.status = 501;
                        break;
                }

                break;
        
            default:
                error.code = 189; // Error type desconocido
                error.status = 500;
                break;
        }
    }
    else {
        error = new Error();
        error.code = 200; // error estructura
        error.status = 500;
    }

    console.log("[HandleError]", error);
    return error;
}