
"use strict";

let request = require("request");
let timeoutRequest = 5000;

F.functions.crashReport();
exports.install = function () {
    let timeOut = 50000;
    F.route('/', home, [timeOut]);
    F.route('/cart', shoppingCart, [timeOut]);
    F.route('/checkout', checkout, [timeOut]);
    F.route('/bill/{bill}', bill, [timeOut]);
    F.route('/orders/{consumer}', orders, [timeOut]);
    F.route('#408', view_408);
    F.route('#404', view_404);
    F.route('/contact', contact);
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
let build_body = function (func_api, body, time = true) {
    let _body = {
        headers: header,
        url: url + func_api,
        json: body
    };

    if (time) {
        _body["timeout"] = timeoutRequest;
    }
    return _body;
};

/**
 * Contact form view
 */
function contact() {
    let self = this;
    self.theme(F.config['theme']);
    F.functions.view_response(self, "contact", 200, {title: F.functions.build_title("Contacto")});
}

/**
 * Functionality for home main view
 * @param self : controller
 */
function home() {
    let self = this;
    self.theme(F.config['theme']);
    let title = "Inicio";

    try {
        let params = {
            limitCategories: 100,
            limitProducts: 6
        };

        if (self.query.pointSale) {
            params.slugPointSale = self.query.pointSale;
        }

        let query = 'select products_banners_config(' + JSON.stringify(params) + ') as result;';
        F.functions.query(query).then(function (response) {
            self.section('meta',
                    '<meta name="title" content="Home" />'
                    + '<meta name="description" content="Listado de categorias, productos, banners" />'
                    + '<meta name="keywords" content="keywords,category, product, home" />'
                    + '<meta name="og:title" content="Home" />'
                    + '<meta name="og:description" content="Listado de categorias, productos, banners" />'
                    );
            F.functions.view_response(self, "home", 200, {
                title: F.functions.build_title(title),
                categories: response[0].result.categories,
                configuration: response[0].result.configuration,
                banners: response[0].result.banners
            });
        }).catch(function (error) {
////////////////////////////////////////////////////////////////////////////////            
            console.error("[Error] ", error);
////////////////////////////////////////////////////////////////////////////////         
            F.functions.sendCrash(error);
            F.functions.view_response(self, 408, 408, {title: F.functions.build_title("408")});
        });

    } catch (e) {
        F.functions.sendCrash(e);
        F.functions.view_response(self, 500, 500, {title: F.functions.build_title(title)});
    }
}

/**
 * Loads shopping cart view
 * @param self : controller
 */
function shoppingCart() {
    let self = this;
    self.theme(F.config['theme']);
    let title = "Carrito de compras";

    try {
        if (self.query.id) {
            let query = 'select *, getCartItems(cartItems) as items from #' + self.query.id + ';';
            F.functions.query(query).then(function (response) {
                self.section('meta',
                        '<meta name="title" content="shoppingcart" />'
                        + '<meta name="description" content="carrito de compras" />'
                        + '<meta name="keywords" content="cart, shoppingcart" />'
                        + '<meta name="og:title" content="shoppingcart" />'
                        + '<meta name="og:description" content="carrito de compras" />'
                        );
                F.functions.view_response(self, "shoppingcart", 200, {cart: response[0] ? response[0] : {}, title: F.functions.build_title(title)});
            }).catch(function (error) {
                F.functions.sendCrash(error);
                F.functions.view_response(self, "shoppingcart", 400, {cart: {}, title: F.functions.build_title(title)});
            });
        } else {
            F.functions.view_response(self, "shoppingcart", 400, {cart: {}, title: F.functions.build_title(title)});
        }
    } catch (e) {
        F.functions.sendCrash(e);
        F.functions.view_response(self, 500, 500, {title: F.functions.build_title(title)});
    }
}

/**
 * Loads checkout view
 * @param self : controller
 */
function checkout() {
    let self = this;
    self.theme(F.config['theme']);
    let title = "Checkout";
    self.section('meta',
            '<meta name="title" content="checkout" />'
            + '<meta name="description" content="checkout, pago, caja" />'
            + '<meta name="keywords" content="checkout" />'
            + '<meta name="og:title" content="checkout" />'
            + '<meta name="og:description" content="checkout, pago, caja" />'
            );
    F.functions.view_response(self, "checkout", 200, {title: F.functions.build_title(title)});
}

/**
 * Loads current bill view
 * @param self : controller
 */
function bill(bill) {
    let self = this;
    let title = "Factura";
    self.theme(F.config['theme']);
    try {
        if (bill) {
            let query = 'select from #' + bill + ' fetchplan *:1;';
            F.functions.query(query).then(function (response) {
                self.section('meta',
                        '<meta name="title" content="bill" />'
                        + '<meta name="description" content="factura" />'
                        + '<meta name="keywords" content="bill, factura" />'
                        + '<meta name="og:title" content="bill" />'
                        + '<meta name="og:description" content="factura" />'
                        );
                F.functions.view_response(self, "bill", 200, {order: response[0], title: F.functions.build_title(title)});
            }).catch(function (error) {
////////////////////////////////////////////////////////////////////////////////
                console.log("[Error] ", error);
////////////////////////////////////////////////////////////////////////////////                    
                F.functions.sendCrash(error);
                F.functions.view_response(self, "bill", 400, {order: {}, title: F.functions.build_title(title)});
            });
        } else {
            F.functions.view_response(self, "bill", 400, {order: {}, title: F.functions.build_title(title)});
        }
    } catch (e) {
        F.functions.sendCrash(e);
        F.functions.view_response(self, 500, 500, {title: F.functions.build_title(title)});
    }
}

/**
 * Obtains all user orders using consumer ID
 * @param self : controller
 */
function orders(consumer_id) {
    let self = this;
    self.theme(F.config['theme']);
    let title = "Ordenes";

    try {
        if (consumer_id) {
            let query = 'select from order where user.@rid = #' + consumer_id + ' order by createdAt desc;';
            F.functions.query(query).then(function (response) {
                self.section('meta',
                        '<meta name="title" content="order" />'
                        + '<meta name="description" content="listado de ordenes" />'
                        + '<meta name="keywords" content="orders, list" />'
                        + '<meta name="og:title" content="order" />'
                        + '<meta name="og:description" content="listado de ordenes" />'
                        );
                F.functions.view_response(self, "orders", 200, {orders: response, title: F.functions.build_title(title)});
            }).catch(function (error) {
////////////////////////////////////////////////////////////////////////////////
                console.log("[Error] ", error);
////////////////////////////////////////////////////////////////////////////////                
                F.functions.sendCrash(error);
                F.functions.view_response(self, "orders", 400, {orders: {}, title: F.functions.build_title(title)});
            });
        } else {
            F.functions.view_response(self, "orders", 400, {orders: {}, title: F.functions.build_title(title)});
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
    let title = "408";
    self.view('408', {title: F.functions.build_title(title)});
}

/**
 * 404 error web page
 * @param self : controller
 */
function view_404() {
    let self = this;
    self.theme(F.config['theme']);
    let title = "404";
    self.view('404', {title: F.functions.build_title(title)});
}
