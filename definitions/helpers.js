/**
 * Helper encargado de renderizar elemento HTML de archivo estático con versión
 * @param file_name
 * @returns {string}
 * 
 * Ejemplos (theme => generic):
 *
 * @{version('checkout.js')} => /generic/js/checkout.js
 * @{version('~parse.utils.js')} => /js/checkout.js
 * @{version('/js/app.min.js')} => /generic/js/checkout.js
 *
 */

F.helpers.version = function(file_name) {

    // Production mode => static files are loaded from es5 folder
    // Development mode => static files are loaded from js folder
    let use_es5 = false;
    if (typeof F.config.mode !== "undefined" && F.config.mode === "PRO") {
        use_es5 = true;
    }

    let url = "";
    let path = "";
    let theme = F.config.theme ? F.config.theme : "generic";
    let version = F.config.version ? F.config.version : "0.0.1";

    // Verificando tipo de estático (CSS o JS)
    let file_ext = "js";
    let file_ext_split = file_name.split(".");
    if (file_ext_split.length > 0) {
        file_ext = file_ext_split[file_ext_split.length - 1];
    }

    // Construyendo URL para poner en elemento DOM
    if (typeof file_name === "string") {
        let init_char = file_name.charAt(0);
        let init_folder = file_name.substring(0,4);
        if (init_folder === "/js/") {
            if (use_es5 && !file_name.includes("lib/")) {
                file_name.replace("/js/", "/es5/");
            }
            url = "/" + theme  + file_name;
        } else if (init_char === "~") {
            path = "/" + file_ext + "/";
            if (use_es5 && file_ext === "js" && !file_name.includes("lib/")) {
                path = "/es5/";
            }
            url = path + file_name.substring(1);
        } else if (init_char === "/") {
            url = file_name;
        } else {
            path = "/" + theme + "/" + file_ext + "/";
            if (use_es5 && file_ext === "js" && !file_name.includes("lib/")) {
                path = "/" + theme + "/es5/";
            }
            url = path + file_name;
        }
        url = url + "?v=" + version;
    }

    // Construyendo elemento para ser renderizado en la vista
    let element = "";
    if (file_ext === "css"){
        element = '<link type="text/css" rel="stylesheet" href="' + url + '">';
    }
    else {
        element = '<script src="' + url + '"></script>';
    }
    return element;
};