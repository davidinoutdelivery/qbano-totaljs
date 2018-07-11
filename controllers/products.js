/* jshint strict: true */
/* global F */

"use strict";

let request = require("request");
let timeoutRequest = 50000;

F.functions.crashReport();
// Routes loads from the server
exports.install = function () {
    let timeOut = 50000; //50 seconds
    F.route('/categories', categories, [timeOut]);
    F.route('/categories/{category}', categories, [timeOut]);
    F.route('/products/{category}/{product}', products, [timeOut]);
    F.route('/search/', search, [timeOut]);
    F.route('#408', view_408);
    F.route('#404', view_404);
    //F.route('/details/{slug}', details, [timeOut]);
    //F.route('/detailPromotion', detailPromotion, [timeOut]);
    
};

let url = F.config['parse_server'];
let header = {
    'X-Parse-Application-Id': 'hSMaiK7EXqDqRVYyY2fjIp4lBweiZnjpEmhH4LpJ',
    'Content-Type': 'application/json'
};
/**
 * Builds the request body for 'request' library
 * @param func_api :: API function name
 * @param body :: Send object
 * @param time :: Boolean var for timeout control.
 */
let build_body = function (func_api, body, time=true) {
    let _body = {
        headers: header,
        url: url + func_api,
        json: body,
    };

    if (time) {
        _body["timeout"] = timeoutRequest;
    }
    return _body;
};


// /**
//  * Products details
//  * @param slug
//  */
// function details(slug) {
//     let self = this;
//     self.theme(F.config['theme']);
//     if (slug) {
//         let status;
//         let body = {
//             'businessId': F.config['business_id'],
//             'token': F.config['token'].toString()
//         };

//         if (self.query.pointSale) {
//             body['pointSale'] = self.query.pointSale;
//         }

//         body['slug'] = slug;
//         let response;
//         let async = new U.Async();
//         try {
//             async.await(function (next) {
//                 let _dict = build_body("product", body, true);
//                 request.post(_dict, function(error, responseRequest, body) {
//                     let resp = F.functions.handle_response(error, responseRequest, body);
//                     response = resp.response;
//                     status = resp.status;
//                     next();
//                 });
//             });

//             async.complete(function () {
//                 if (response && status >= 200 && status <= 209) {
//                     self.section('meta', F.functions.metaTags(self, response), false);
//                     let _title = response.result.name + ": " + response.result.category.name;
//                     F.functions.view_response(self, "details_product", status, {detail: response.result, title: F.functions.build_title(_title)});
//                 } else if (response) {
//                     if (response.code === 141) {
//                         F.functions.view_response(self, 404, 404, {title: F.functions.build_title("404")});
//                     }
//                 }
//             });
//         } catch (e) {
//             F.functions.sendCrash(e);
//             F.functions.view_response(self, 500, 500, {title: F.functions.build_title("500")});
//         }
//     } else {
//         F.functions.view_response(self, 404, 404, {title: F.functions.build_title("404")});
//     }
// }


// /**
//  * Promotion details
//  */
// function detailPromotion() {
//     let self = this;
//     self.theme(F.config['theme']);

//     if (self.query.id && self.query.pointsale) {

//         let body = {
//             'businessId': F.config['business_id'],
//             'token': F.config['token'].toString()
//         };

//         body['id'] = self.query.id;
//         body['pointSale'] = self.query.pointsale;

//         let response;
//         let status;
//         let async = new U.Async();

//         try {
//             async.await(function (next) {
//                 let _dict = build_body("product", body, true);
//                 request.post(_dict, function(error, responseRequest, body) {
//                     let resp = F.functions.handle_response(error, responseRequest, body);
//                     response = resp.response;
//                     status = resp.status;
//                     next();
//                 });
//             });

//             async.complete(function () {
//                 if (response && status >= 200 && status <= 209) {
//                     self.section('meta', F.functions.metaTags(self, response), false);
//                     let _title = response.result.name + ": " + response.result.category.name;
//                     F.functions.view_response(self, "details_promotion", status, {detail: response.result, title: F.functions.build_title(_title)});
//                 }
//                 else {
//                     F.functions.view_response(self, "details_promotion", status, {title: F.functions.build_title()});
//                 }
//             });
//         } catch (e) {
//             F.functions.sendCrash(e);
//             F.functions.view_response(self, 500, 500, {title: F.functions.build_title("500")});
//         }
//     }
//     else {
//         F.functions.view_response(self, 404, 404, {title: F.functions.build_title("404")});
//     }
// }

/** FUNCIONES NUEVAS*/

/**
 * Loads commerce categories group
 * @param category
 * @param self : controller
 */
function categories(category) {
    let self = this;
    self.theme(F.config['theme']);
    let title = "Categorías";

    let params = {};
    if (category) {
        params.filterSlugCategory = category;
        params.limitProducts = 100;
    }
    else {
        params.limitCategories = 1;
        params.limitProducts = 6;
    }

    if (self.query.pointSale) {
        params.pointSale = self.query.pointSale;
    }


    let query = 'select getProducts('+JSON.stringify(params)+') as result;';

    F.functions.query(query)
        .then( function(response) {
        if ( Array.isArray(response) && response[0].result && Array.isArray(response[0].result )) {
            let result = response[0].result;
            if (category) {
                let url = 'http://transmartfoundation.org/wp-content/plugins/lightbox/images/No-image-found.jpg';
                if (result[0] && result[0].image) {
                    url = result[0].image.url;
                }
                let title = result[0].name ? result[0].name : "Categoria";
                let description = result[0].description ? result[0].description: "Listado de categorias";
                let tags = result[0].tags ? result[0].tags.toString() : "";
                //Información de padre de la subcategoria
                self.section('meta',
                '<meta property="fb:app_id" content="'+F.config["facebook_id"]+'" />'
                + '<meta name="title" content="'+ title +'" />'
                + '<meta name="description" content="'+ description +'" />'
                + '<meta name="keywords" content="'+ tags +'" />'
                + '<meta name="image" content="'+ url +'" />'
                + '<meta name="og:title" content="'+ title +'" />'
                + '<meta name="og:description" content="'+ description +'" />'
                + '<meta property="og:image" content="'+ url +'"/>');
            }
            else {
                // Lista de categorias sin metaTags
                self.section('meta',
                '<meta name="title" content="Categorias" />'
                + '<meta name="description" content="Listado de categorias" />'
                + '<meta name="keywords" content="keywords,category" />'
                + '<meta name="og:title" content="Categorias" />'
                + '<meta name="og:description" content="Listado de categorias" />');
            }
            F.functions.view_response(self, "categories", 200, {categories: category ? result[0]: result, title: F.functions.build_title(title)});
        }
        else {
            F.functions.view_response(self, "categories", 200, {categories: [], title: F.functions.build_title(title)});
        }
           
        }).catch( function ( error ) {
         //TO-DO: no distingo entre 400 y 500
        console.log("[Error] ", error);
        F.functions.sendCrash(error);
        F.functions.view_response(self, 404, 404, {title: F.functions.build_title("404")});
     });
    }

/**
 * Loads commerce products group
 * @param category
 * @param product
 */
function products(category, product) {
    let self = this;
    let response;
    self.theme(F.config['theme']);
    let title = "Productos";

    if (category && product) {
        let params = {
            filterSlugCategory : category,
            filterSlugProduct: product,
        };

        if (self.body.pointSale) {
            params.pointSale = self.body.pointSale;
        }

        let query = 'select getProducts('+JSON.stringify(params)+') as result;';

        F.functions.query(query)
        .then( function(response) {
            if ( Array.isArray(response) && response[0].result && Array.isArray(response[0].result)) {
                let result = response[0].result[0];
                let url = 'http://transmartfoundation.org/wp-content/plugins/lightbox/images/No-image-found.jpg';
                if (result.products[0] && result.products[0].image) {
                    url = result.products[0].image.url;
                }

                let h2p = require('html2plaintext');

                let title = result.products[0].name ? result.products[0].name : "Producto";
                let description = result.products[0].description ? result.products[0].description: "Descripción producto";
                let tags = result.products[0].tags ? result.products[0].tags.toString() : "";
                //Información de padre de la subcategoria
                self.section('meta',
                '<meta property="fb:app_id" content="'+F.config["facebook_id"]+'" />'
                + '<meta name="title" content="'+ title +'" />'
                + '<meta name="description" content="'+ h2p(description) +'" />'
                + '<meta name="keywords" content="'+ tags +'" />'
                + '<meta name="image" content="'+ url +'" />'
                + '<meta name="og:title" content="'+ title +'" />'
                + '<meta name="og:description" content="'+ h2p(description) +'" />'
                + '<meta property="og:image" content="'+ url +'"/>');
            
                F.functions.view_response(self, "details_product", 200, {detail: response[0].result, title: F.functions.build_title(title)});
            }
            else {
                F.functions.view_response(self, "details_product", 200, {detail: {}, title: F.functions.build_title(title)});
            }
        })
        .catch (function (error) {
            //TO-DO: no distingo entre 400 y 500
            // F.functions.view_response(self, 500, 500, {title: F.functions.build_title("500")});
            console.log("[Error] ", error);
            F.functions.sendCrash(error);
            F.functions.view_response(self, 404, 404, {title: F.functions.build_title("404")});
        });
    }
    else {
        F.functions.view_response(self, "details_product", 200, {detail: {}, title: F.functions.build_title("Productos")});
    } 
}

/**
 * Products search
 * @param self : controller
 */
function search() {
    let self = this;
    self.theme(F.config['theme']);
    let title = "Buscador";
    try {
        if (self.query.word) {
            let params = {q: self.query.word };
            if (self.query.pointSale) {
                params.pointSale = self.query.pointSale;
            }
            let query = 'select search('+JSON.stringify(params)+');';
            F.functions.query(query)
            .then( function(response) {
                response[0]["word"] =  self.query.word;
                F.functions.view_response(self, "search", 200, {search: response, work: self.query.word, title: F.functions.build_title(title)});
            }).catch( function ( error ) {
                //TO-DO: no distingo entre 400 y 500
                // F.functions.view_response(self, 500, 500, {title: F.functions.build_title("500")});
                console.log("[Error] ", error);
                F.functions.sendCrash(error);
                F.functions.view_response(self, 408, 408, {title: F.functions.build_title("408")});
            });
        }
        else {
            F.functions.view_response(self, "search", 200, {search: [], work: "vacío", title: F.functions.build_title("Buscador")});
        }
    } catch (e) {
        F.functions.sendCrash(e);
        F.functions.view_response(self, 500, 500, {title: F.functions.build_title(title)});
    } 
}

/**
 * 408 error web page
 * @param self : controller
 */
function view_408() {
    let self = this;
    self.theme(F.config['theme']);
    self.view('408', {title: F.functions.build_title("408")});
}

/**
 * 404 error web page
 * @param self : controller
 */
function view_404() {
    let self = this;
    self.theme(F.config['theme']);
    self.view('404', {title: F.functions.build_title("404")});
}