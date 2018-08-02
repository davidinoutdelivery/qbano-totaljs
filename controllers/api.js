/* jshint strict: true */
/* global F, U */

"use strict";

let request = require("request");
let timeoutRequest = 50000;

F.functions.crashReport();
// Routes loads from the client
exports.install = function () {
    let timeOut = 50000; //50 seconds
    F.route('/api/collection/', categories, [timeOut, 'post']);
    F.route('/api/product/', product, [timeOut, 'post']);
    F.route('/api/coverage/', coverage, [timeOut, 'post']);
    F.route('/api/getAddress/', address, [timeOut, 'post']);
    F.route('/api/address/', createAddress, [timeOut, 'post']);
    F.route('/api/address/', deleteAddress, [timeOut, 'delete']);
    F.route('/api/address/', updateAddress, [timeOut, 'put']);
    F.route('/api/cart/', saveCartItem, ['post']);
    F.route('/api/getCart/', getCart, [timeOut, 'post'], 2000);
    F.route('/api/deleteCartItem/', deleteCartItem, [timeOut, 'delete']);
    F.route('/api/emptyCart/', emptyCart, [timeOut, 'delete']);
    F.route('/api/updateCartItem/', updateCartItem, [timeOut, 'put'], 2000);
    F.route('/api/checkout/', checkout, [timeOut, 'post']);
    F.route('/api/registerUser/', registerUser, [timeOut, 'post'], 2000);
    F.route('/api/updateUser/', updateUser, [timeOut, 'put'], 2000);
    F.route('/api/login/', login, [timeOut, 'post'], 2000);
    F.route('/api/cartMigrate/', cartMigrate, [timeOut, 'post'], 2000);
    F.route('/api/loginSocial/', loginSocial, [timeOut, 'post'], 2000);
    F.route('/api/logout/', logout, [timeOut, 'post'], 2000);
    F.route('/api/service/', typeService, [timeOut, 'get'], 2000);
    F.route('/api/cities/', citiesCoverage, [timeOut, 'get'], 2000);
    F.route('/api/userExist/', userExist, [timeOut, 'post'], 2000);
    F.route('/api/updateCart/', updateCart, [timeOut, 'put'], 2000);
    F.route('/api/resetPassword/', resetPassword, ['post']);
    F.route('/api/status/', status, [timeOut, 'post']);
    F.route('/api/qualify/', qualify, [timeOut, 'post']);
    F.route('/api/email/', email, [timeOut, 'post']);
};


// ==========================================================================
// COMMON
// ==========================================================================

let url = F.config['parse_server'];
let header = {
    'X-Parse-Application-Id': 'hSMaiK7EXqDqRVYyY2fjIp4lBweiZnjpEmhH4LpJ',
    'Content-Type': 'application/json'
};


/**
 * Builds the request body for 'request' library
 * @param func_api
 * @param body
 * @param time
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
 * Sends email
 * mandrill :: Data required by template
 * subject  :: Message subject
 */
function email() {
    F.functions.log("\n[/api/email/] email");
    let self = this;
    try {
        if (self.body && self.body.mandrill && self.body.subject) {
            let body = {
                'businessId': F.config['business_id'],
                'token': F.config['token'].toString()
            };
            body ['data'] = {
                "subject": self.body.subject,
                'variables': self.body.mandrill
            };

            let query = 'INSERT INTO Integration SET type="default-sixtogo" , ' +
                    'data = {"from_email":"freddy@inoutdelivery.com","from_name":"Contact Admin", "subject":"' +
                    self.body.subject + '", "name":"' + self.body.name + '",' +
                    '"title":"' + self.body.title + '","email":"' + self.body.email + '","content":"' + self.body.comments + '"} ';

            F.functions.query(query).then(function (response) {
                var result = response[0];
                result['status'] = true;
                F.functions.json_response(self, 200, result);
            }).catch(function (error) {
                var response = {
                    msg: "Error al enviar E-mail"
                };
                //response["msg"] = "Error al enviar E-mail";
                F.functions.json_response(self, 400, response);
            });
        } else {
            F.functions.json_response(self, 400, {msg: "Mandatory parameters"});
        }
    } catch (e) {
        F.functions.sendCrash(e);
        F.functions.json_response(self, 500, {msg: "Ups! Lo sentimos, algo salió mal. Intenta nuevamente."});
    }
}

/**
 * Create a request for recovering password
 */
function resetPassword() {
    F.functions.log("\n[/api/resetPassword/] resetPassword");
    let self = this;
    if (self.body && self.body.email) {
        if (!self.body.email.isEmail()) {
            F.functions.json_response(self, 400, {code: 142, error: "Email invalid", msg: "Email invalid"});
        } else {
            let response;
            let status;
            let async = new U.Async();
            let body = {
                'businessId': F.config['business_id'],
                'token': F.config['token'].toString(),
                'email': self.body.email
            };

            async.await(function (next) {
                let _dict = build_body("resetPassword", body, false);
                request.post(_dict, function (error, responseRequest, body) {
                    let resp = F.functions.handle_response(error, responseRequest, body);
                    response = resp.response;
                    status = resp.status;
                    next();
                });
            });

            async.complete(function () {
                if (response && (status >= 200 && status <= 209)) {
                    F.functions.json_response(self, status, response);
                } else if (status === 408) {
                    response["msg"] = "Tiempo de espera superado";
                    F.functions.json_response(self, status, response);
                } else {
                    response["msg"] = "Error en resetpassword";
                    F.functions.json_response(self, status, response);
                }
            });
        }
    } else {
        F.functions.json_response(self, 400, {code: 141, error: "Mandatory parameters email", msg: "Mandatory parameters email"});
    }
}

/**
 * Makes the password change in user account
 */
function changePassword() {
    F.functions.log("\n[/api/changePassword/] changePassword");
    let self = this;
    if (self.body && Object.keys(self.body).length > 0) {
        if (!self.body.email || !self.body.email.isEmail()) {
            F.functions.json_response(self, 400, {code: 142, error: "Email invalid", msg: "Email invalid"});
        } else if (!self.body.password || self.body.password.trim().length <= 0) {
            F.functions.json_response(self, 400, {code: 142, error: "Email invalid", msg: "Password empty"});
        } else if (!self.body.token || self.body.token.trim().length <= 0) {
            F.functions.json_response(self, 400, {code: 142, error: "Email invalid", msg: "Token empty"});
        } else {
            let response;
            let status;
            let async = new U.Async();
            let body = {
                'businessId': F.config['business_id'],
                'token': self.body.token,
                'email': self.body.email,
                'newPasssword': self.body.password
            };

            async.await(function (next) {
                let _dict = build_body("changePasswordUser", body, false);
                request.post(_dict, function (error, responseRequest, body) {
                    let resp = F.functions.handle_response(error, responseRequest, body);
                    response = resp.response;
                    status = resp.status;
                    next();
                });
            });

            async.complete(function () {
                if (response && (status >= 200 && status <= 209)) {
                    F.functions.json_response(self, status, response.result);
                } else if (status === 408) {
                    response["msg"] = "Tiempo de espera superado";
                    F.functions.json_response(self, status, response);
                } else {
                    response["msg"] = "Error en chagepassword";
                    F.functions.json_response(self, status, response);
                }
            });
        }
    } else {
        F.functions.json_response(self, 400, {code: 141, error: "Mandatory parameters email, password o token", msg: "Mandatory parameters email, password o token"});
    }
}

/**
 * Returns cadena con consulta de inserción
 * @param table :: cadena con nombre de la tabla
 * @param fields :: array con los campos de la tabla
 * @param dict :: array de objectos u objeto a ser insertado
 * @returns String
 */
function __createInsert(table, fields, dict, letName = null) {

    let values = [];

    if (Array.isArray(dict)) {

        for (let j = 0; j < dict.length; j++) {

            let tmpValues = [];

            for (let i = 0; i < fields.length; i++) {

                let item = '';

                if (fields[i] === "createdAt" || fields[i] === "updatedAt") {
                    item = 'SYSDATE()';
                } else if (fields[i] === "roles") {
                    item = dict[j][fields[i]];
                } else {
                    item = dict[j][fields[i]] ? convertString(dict[j][fields[i]]) : "null";
                }

                tmpValues.push(item);
            }
            values.push(tmpValues);
        }

        console.log('///////letName === null', (letName === null ? table : letName));
        console.log('///////letName', letName);
        let query = 'let $' + (letName === null ? table : letName) + ' = INSERT INTO ' + table + ' (' + fields.toString() + ') values ';
        for (let i = 0; i < values.length; i++) {
            query += '(' + values[i].toString() + ')';
            query += values.length - 1 === i ? '; ' : ',';
        }
        return query;
    } else if (typeof dict === 'object') {
        for (let i = 0; i < fields.length; i++) {
            let item = '';
            if (fields[i] === "createdAt" || fields[i] === "updatedAt") {
                item = 'SYSDATE()';
            } else if (fields[i] === "roles" || fields[i] === "location") {
                item = dict[fields[i]];
            } else {
                item = dict[fields[i]] ? convertString(dict[fields[i]]) : "null";
            }

            values.push(item);
        }
        return 'let $' + (letName === null ? table : letName) + ' = INSERT INTO ' + table + ' (' + fields.toString() + ') values (' + values.toString() + '); ';
}
}

function convertString(value) {
    if (value[0] === '$') {
        return value;
    } else if (typeof (value) === "object") {
        return JSON.stringify(value);
    } else if (isNaN(value)) {
        return '"' + value + '"';
    } else {
        return value;
    }
}

/**
 * Returns cadena con consulta de inserción
 * @param table :: cadena con nombre de la tabla
 * @param fileds :: array con los campos de la tabla
 * @param dict :: array de objectos u objeto a ser insertado
 * @returns String
 */
function __createUpdate(table, dict, id) {
    let values = [];
    //mutiples objetos en un array (bulk)
    if (typeof dict === 'object') {
        let fileds = Object.keys(dict);
        for (let key in dict) {
            let item = '';
            if (key !== "createdAt" && key !== "updatedAt") {
                item = key + '=' + convertString(dict[key]);
            } else {
                item = key + '= SYSDATE()';
            }

            values.push(item);

        }
        return 'UPDATE ' + table + ' SET ' + values.toString() + ' UPSERT WHERE @rid = ' + id + ';';
    }
}

/**
 * Returns product details
 */
function product() {
    F.functions.log("\n[/api/product/] product");
    let self = this;
    if (self.body && self.body.category && self.body.product && self.body.pointSale) {

        let params = {
            filterSlugCategory: self.body.category,
            filterSlugProduct: self.body.product,
        };

        if (self.body.pointSale) {
            params.pointSale = self.body.pointSale;
        }

        let query = 'select getProducts(' + JSON.stringify(params) + ') as result;';

        F.functions.query(query)
                .then(function (response) {
                    F.functions.json_response(self, 200, response);
                }
                ).catch(function (error) {
            console.warn("[Error] ", error);
            F.functions.sendCrash(error);
            F.functions.json_response(self, 400, error);
        });
    }
}

/**
 * Returns status order details
 */
function status() {
    F.functions.log("\n[/api/status/] status");
    let self = this;
    let query = 'SELECT @rid FROM state LET $max = ( SELECT max(sortOrder) FROM state WHERE approved = true ) WHERE sortOrder = $max.max[0];';
    F.functions.query(query)
            .then(function (response) {
                let status = '#' + response[0].rid.cluster + ':' + response[0].rid.position;
                let params = {order: self.body.id, score: self.body.score, comment: self.body.comment, status: status};
                F.functions.json_response(self, 200, params);
            })
            .catch(function (error) {
                console.warn("[Error] ", error);
                F.functions.sendCrash(error);
                F.functions.json_response(self, 400, error);
            });
}

/**
 * Returns order change details
 */
function qualify() {
    F.functions.log("\n[/api/qualify/] qualify");
    let self = this;
    let query = 'SELECT changeStatus(' + JSON.stringify(self.body) + ') as result;';
    F.functions.query(query)
            .then(function (response) {
                F.functions.json_response(self, 200, response);
            })
            .catch(function (error) {
                console.warn("[Error] ", error);
                F.functions.sendCrash(error);
                F.functions.json_response(self, 400, error);
            });
}

/**
 * Get category or categories
 * @param self : controller
 */
function categories() {
    F.functions.log("\n[/api/collection/] collection");
    let self = this;
    try {
        if (self.body) {
            let params = {};
            if (self.body.category) {
                params.filterSlugCategory = self.body.category;
                params.limitProducts = 2;
            } else {
                params.limitCategories = 1;
                params.limitProducts = 6;
            }

            if (self.body.pointSale) {
                params.pointSale = self.body.pointSale;
            }

            let query = 'select getProducts(' + JSON.stringify(params) + ') as result;';

            F.functions.query(query)
                    .then(function (response) {
                        F.functions.json_response(self, 200, response);
                    }
                    ).catch(function (error) {
                F.functions.sendCrash(error);
                error = F.functions.handleError(error);
                F.functions.json_response(self, 400, error);
            });

        } else {
            F.functions.json_response(self, 400, {msg: "Mandatory parameters"});
        }
    } catch (e) {
        F.functions.sendCrash(e);
        F.functions.json_response(self, 500, {msg: "Ups! Lo sentimos, algo salió mal. Intenta nuevamente."});
    }
}

/**
 * Get coverage for a location
 * @param self : controller
 */
function coverage() {
    F.functions.log("\n[/api/coverage/] coverage");
    let self = this;
    let body = self.body;
    try {
        if (body && body.location.latitude && body.location.longitude) {
            let params = {
                lat: body.location.latitude,
                lng: body.location.longitude,
            };

            if (body.typeServiceId) {
                params.typeService = body.typeServiceId;
            }

            if (body.datetime && (body.datetime.date && body.datetime.time)) {
                params.dateService = body.datetime.date + ' ' + body.datetime.time + ':00';
            }

            let query = 'select coverage(' + JSON.stringify(params) + ') as result;';

            F.functions.query(query)
                    .then(function (response) {
                        F.functions.json_response(self, 200, response);
                    }
                    ).catch(function (error) {
                F.functions.sendCrash(error);
                error = F.functions.handleError(error);
                F.functions.json_response(self, 400, error);
            });
        } else {
            F.functions.json_response(self, 400, {msg: "Mandatory parameter lat and lng"});
        }
    } catch (e) {
        F.functions.sendCrash(e);
        F.functions.json_response(self, 500, {msg: "Ups! Lo sentimos, algo salió mal. Intenta nuevamente."});
    }
}

/**
 * Lists consumer addresses
 * @param self : controller
 */
function address() {
    F.functions.log("\n[/api/address/] address");
    let self = this;
    try {
        if (self.body.consumer) {
            let query = 'SELECT expand(userAddress[status = true]) FROM ' + self.body.consumer + ' order by createdAt desc;';
            F.functions.query(query)
                    .then(function (response) {
                        F.functions.json_response(self, 200, response);
                    }
                    ).catch(function (error) {
                F.functions.sendCrash(error);
                error = F.functions.handleError(error);
                F.functions.json_response(self, 400, error);
            });
        } else {
            F.functions.json_response(self, 400, {msg: "Mandatory parameter consumer"});
        }
    } catch (e) {
        F.functions.sendCrash(e);
        F.functions.json_response(self, 500, {msg: "Ups! Lo sentimos, algo salió mal. Intenta nuevamente."});
    }
}

/**
 * Create consumer addresses
 * @param self : controller
 */
function createAddress() {
    F.functions.log("\n[/api/createAddress/] createAddress");
    let self = this;
    try {
        if (self.body.address && (self.body.address.name && self.body.address.city
                && self.body.address.country && self.body.address.description && self.body.address.address
                && self.body.address.location.latitude && self.body.address.location.longitude)) {

            let body = {};
            body.status = 'true';
            body.name = self.body.address.name;
            body.city = self.body.address.city;
            body.country = self.body.address.country;
            body.description = self.body.address.description;
            body.address = self.body.address.address;
            body.location = 'St_GeomFromText("POINT (' + self.body.address.location.longitude + ' ' + self.body.address.location.latitude + ')")';

            //Crea la dirección en userAddress
            let fields = ["city", "country", "name", "location", "description", "address", "status", "createdAt"];
            let queryCreated = __createInsert("UserAddress", fields, body);

            //Agrega la dirección en user
            if (self.body.userId) {
                queryCreated += 'UPDATE #' + self.body.userId + ' ADD userAddress = $UserAddress;' +
                        'SELECT expand(userAddress[status = true]) FROM #' + self.body.userId + ' order by createdAt desc;';
            }

            let query = 'BEGIN;' + queryCreated + 'commit;'
            F.functions.query(query)
                    .then(function (response) {
                        F.functions.json_response(self, 200, response);
                    }
                    ).catch(function (error) {
                F.functions.sendCrash(error);
                error = F.functions.handleError(error);
                F.functions.json_response(self, 400, error);
            });
        } else {
            F.functions.json_response(self, 400, {msg: "Mandatory parameters"});
        }
    } catch (e) {
        F.functions.sendCrash(e);
        F.functions.json_response(self, 500, {msg: "Ups! Lo sentimos, algo salió mal. Intenta nuevamente."});
    }
}

/**
 * Deletes an address using an ID
 * @param self : controller
 */
function deleteAddress() {
    F.functions.log("\n[/api/deleteAddress/] deleteAddress");
    let self = this;
    try {
        if (self.body.userId && self.body.addressId) {
            let query = 'BEGIN;' +
                    'DELETE FROM #' + self.body.addressId + ';' +
                    'UPDATE #' + self.body.userId + ' REMOVE userAddress = #' + self.body.addressId + ';' +
                    'SELECT expand(userAddress[status = true]) FROM #' + self.body.userId + '  order by createdAt desc;' +
                    'COMMIT;';

            F.functions.query(query)
                    .then(function (response) {
                        F.functions.json_response(self, 200, response);
                    }
                    ).catch(function (error) {
                F.functions.sendCrash(error);
                error = F.functions.handleError(error);
                F.functions.json_response(self, 400, error);
            });
        } else {
            F.functions.json_response(self, 400, {msg: "Mandatory parameters id"});
        }
    } catch (e) {
        F.functions.sendCrash(e);
        F.functions.json_response(self, 500, {msg: "Ups! Lo sentimos, algo salió mal. Intenta nuevamente."});
    }
}

/**
 * Update an address using an ID
 * @param self : controller
 */
function updateAddress() {
    F.functions.log("\n[/api/updateAddress/] updateAddress");
    let self = this;
    try {
        if (self.body.userId && self.body.addressId) {
            let queryAddress = 'UPDATE ' + self.body.userId + ' ADD userAddress = ' + self.body.addressId + ';' +
                    'SELECT expand(userAddress[status = true]) FROM ' + self.body.userId + ' order by createdAt desc;';

            let query = 'BEGIN;' + queryAddress + 'commit;'

            F.functions.query(query)
                    .then(function (response) {
                        F.functions.json_response(self, 200, response);
                    }
                    ).catch(function (error) {
                F.functions.sendCrash(error);
                error = F.functions.handleError(error);
                F.functions.json_response(self, 400, error);
            });
        } else {
            F.functions.json_response(self, 400, {msg: "Mandatory parameters"});
        }
    } catch (e) {
        F.functions.sendCrash(e);
        F.functions.json_response(self, 500, {msg: "Ups! Lo sentimos, algo salió mal. Intenta nuevamente."});
    }
}

/**
 * Add an item to cart
 * @param self : controller
 */
function saveCartItem() {
    F.functions.log("\n[/api/savecart/] saveCart");
    let self = this;
    let queryItemModifierGroupModifiers = '';
    let queryItemModifierGroup = '';
    let queryItemModifiers = '';
    let querycartItem = '';
    let queryCart = '';

    if (self.body.cartItems) {
        let item = self.body.cartItems;

        if (item.modifiers && item.modifiers.length > 0) {
            let filedsItemModifiers = ["modifier", "modifierItem", "amount"];
            queryItemModifiers = __createInsert("cartItemModifier", filedsItemModifiers, item.modifiers);
        }

        if (item.modifiersGroups && item.modifiersGroups.length > 0) {
            let letName = null;
            let filedsItemModifiers = ["modifier", "modifierItem", "amount"];
            let filedsItemModifierGroup = ["modifierGroup", "cartItemModifiers", "amount"];

            for (let i = 0; i < item.modifiersGroups.length; i++) {
                letName = 'cartItemModifier' + i;
                queryItemModifierGroupModifiers += __createInsert("cartItemModifier", filedsItemModifiers, item.modifiersGroups[i].modifiers, letName);

                item.modifiersGroups[i]['cartItemModifiers'] = '$' + letName;
            }
            queryItemModifierGroup = __createInsert("cartItemModifierGroup", filedsItemModifierGroup, item.modifiersGroups);
        }

        //query para item
        let filedscartItem = ["product", "comment", "code", "cartItemProductGroups", "cartItemModifiers",
            "cartItemModifierGroups", "amount", "createdAt"];
        item["cartItemModifiers"] = queryItemModifiers.length > 0 ? '$cartItemModifier' : null;
        item["cartItemModifierGroups"] = queryItemModifierGroup.length > 0 ? '$cartItemModifierGroup' : null;
        querycartItem = __createInsert("cartItem", filedscartItem, item);
    }


    let fieldsCart = [];
    let itemCart = {};
    // Actualización del carrito TO-DO: contemplar todos los campos a actualizar
    console.log('/////////////////////////self.body.cartId', self.body.cartId);
    if (self.body.cartId) {
        fieldsCart.push("updatedAt");
        if (self.body.cartItems) {
            itemCart.cartItems = '$cartItem';
        }
        queryCart = 'let $Cart = UPDATE Cart ADD cartItems= $cartItem SET updatedAt = SYSDATE(), pointSale = "' + self.body.pointSale + '" UPSERT WHERE @rid= ' + self.body.cartId + ';' +
                'SELECT *, sum(cartItems.amount) AS totalAmount from Cart WHERE @rid = ' + self.body.cartId + ';';
    }
    // Crea un nuevo carrito
    else {
        fieldsCart.push("createdAt");
        //obligatorios 
        if (self.body.cartItems) {
            fieldsCart.push("cartItems");
            itemCart.cartItems = '$cartItem';
        }
        if (self.body.pointSale) {
            fieldsCart.push("pointSale");
            itemCart.pointSale = self.body.pointSale;
        }
        if (self.body.pointSaleTypeServiceSchedule) {
            fieldsCart.push("pointSaleTypeServiceSchedule");
            itemCart.pointSaleTypeServiceSchedule = self.body.pointSaleTypeServiceSchedule;
        }
        if (self.body.typeService) {
            fieldsCart.push("typeService");
            itemCart.typeService = self.body.typeService;
        }
        //opcionales
        if (self.body.paymentMethod) {
            fieldsCart.push("paymentMethod");
            itemCart.paymentMethod = self.body.paymentMethod;
        }
        if (self.body.user) {
            fieldsCart.push("user");
            itemCart.user = self.body.user;
        }
        if (self.body.userAddress) {
            fieldsCart.push("userAddress");
            itemCart.userAddress = self.body.userAddress;
        }

        queryCart = __createInsert("Cart", fieldsCart, itemCart);
    }

    let query = 'begin;' +
            queryItemModifierGroupModifiers +
            queryItemModifierGroup +
            queryItemModifiers +
            querycartItem +
            queryCart +
            'commit;';
    F.functions.query(query)
            .then(function (response) {
                F.functions.json_response(self, 200, response);
            }
            ).catch(function (error) {
        F.functions.sendCrash(error);
        console.warn("[Error] ", error);
        F.functions.json_response(self, 400, error);
    });
}

/**
 * Returns shopping cart information using an ID
 * @param self : controller
 */
function getCart() {
    F.functions.log("\n[/api/getCart/] getCart");
    let self = this;
    try {
        if (self.body.cartId) {
            let params = {cart: '#' + self.body.cartId};
            if (self.body.codeCoupon) {
                params.codeCoupon = self.body.codeCoupon;
            }
            let query = 'select getCart(' + JSON.stringify(params) + ');';
            F.functions.query(query)
                    .then(function (response) {
                        F.functions.json_response(self, 200, response);
                    }
                    ).catch(function (error) {
                F.functions.sendCrash(error);
                error = F.functions.handleError(error);
                F.functions.json_response(self, 400, error);
            });
        } else {
            F.functions.json_response(self, 400, {msg: "Mandatory parameters cartId"});
        }
    } catch (e) {
        F.functions.sendCrash(e);
        F.functions.json_response(self, 500, {msg: "Ups! Lo sentimos, algo salió mal. Intenta nuevamente."});
    }
}

/**
 * Deletes a shopping cart item using product id and cart id
 */
function deleteCartItem() {
    F.functions.log("\n[/api/deleteCartItem/] deleteCartItem");
    let self = this;
    try {
        if (self.body.itemId && self.body.cartId) {

            let queryUpdate = 'UPDATE Cart REMOVE cartItems = ' + self.body.itemId + ' where @rid = ' + self.body.cartId + '; ' +
                    'select *, getCartItems(cartItems) as items from ' + self.body.cartId + ';';
            let querySelect = 'select getCart({cart: #' + self.body.cartId + '})';
            let query = queryUpdate + querySelect;

            F.functions.query(query)
                    .then(function (response) {
                        F.functions.json_response(self, 200, response);
                    }
                    ).catch(function (error) {
                F.functions.sendCrash(error);
                error = F.functions.handleError(error);
                F.functions.json_response(self, 400, error);
            });
        } else {
            F.functions.json_response(self, 400, {msg: "Mandatory parameters cartId and itemId"});
        }
    } catch (e) {
        F.functions.sendCrash(e);
        F.functions.json_response(self, 500, {msg: "Ups! Lo sentimos, algo salió mal. Intenta nuevamente."});
    }
}

/**
 * Empties a shopping cart using an ID
 */
function emptyCart() {
    F.functions.log("\n[/api/emptyCart/] emptyCart");
    let self = this;
    try {
        if (self.body.cartId) {
            let query = 'UPDATE Cart SET cartItems = null, total = 0, subtotal = 0 WHERE @rid = #' + self.body.cartId + ';' +
                    'select *, getCartItems(cartItems) as items from #' + self.body.cartId + ';';
            F.functions.query(query)
                    .then(function (response) {
                        F.functions.json_response(self, 200, response);
                    }
                    ).catch(function (error) {
                F.functions.sendCrash(error);
                error = F.functions.handleError(error);
                F.functions.json_response(self, 400, error);
            });
        } else {
            F.functions.json_response(self, 400, {msg: "Mandatory parameters cartId"});
        }
    } catch (e) {
        F.functions.sendCrash(e);
        F.functions.json_response(self, 500, {msg: "Ups! Lo sentimos, algo salió mal. Intenta nuevamente."});
    }
}

/**
 * Update item using id item and id cart
 */
function updateCartItem() {
    F.functions.log("\n[/api/updateCartItem/] updateCartItem");
    let self = this;
    try {
        if (self.body.item && self.body.itemId && self.body.cartId) {
            let queryUpdate = __createUpdate("CartItem", self.body.item, self.body.itemId) + ';';

            let querySelect = 'select getCart({cart: #' + self.body.cartId + '})';

            let query = queryUpdate + querySelect;
            F.functions.query(query)
                    .then(function (response) {
                        F.functions.json_response(self, 200, response);
                    }
                    ).catch(function (error) {
                F.functions.sendCrash(error);
                error = F.functions.handleError(error);
                F.functions.json_response(self, 400, error);
            });
        } else {
            F.functions.json_response(self, 400, {msg: "Mandatory parameters cartId"});
        }
    } catch (e) {
        F.functions.sendCrash(e);
        F.functions.json_response(self, 500, {msg: "Ups! Lo sentimos, algo salió mal. Intenta nuevamente."});
    }
}

/**
 * Create order
 */
function checkout() {
    F.functions.log("\n[/api/checkout/] checkout");
    let self = this;

    try {
        if (self.body.purchase) {
            var purchase = self.body.purchase;

            let query = 'select createOrder(' + JSON.stringify(purchase) + ');';
            F.functions.query(query)
                    .then(function (response) {
                        F.functions.json_response(self, 200, response);
                    }
                    ).catch(function (error) {
                F.functions.sendCrash(error);
                error = F.functions.handleError(error);
                F.functions.json_response(self, 400, error);
            });

        } else {
            F.functions.json_response(self, 400, {msg: "Mandatory parameters cartId"});
        }
    } catch (e) {
        F.functions.sendCrash(e);
        F.functions.json_response(self, 500, {msg: "Ups! Lo sentimos, algo salió mal. Intenta nuevamente."});
    }
}

/**
 * create a user
 */
function registerUser() {
    F.functions.log("\n[/api/registerUser/] registerUser");
    let self = this;
    try {
        if (self.body.user) {
            let query = 'select createUser(' + JSON.stringify(self.body.user) + ');';
            F.functions.query(query)
                    .then(function (response) {
                        //TO_DO: este tipo de autenticación se debe revisar
                        F.setDatabaseUser(self.body.user.email, self.body.user.password); //login
                        F.functions.json_response(self, 200, response[0]);
                    }
                    ).catch(function (error) {
                F.functions.sendCrash(error);
                error = F.functions.handleError(error);
                F.functions.json_response(self, 400, error);
            });
        } else {
            let error = F.functions.handleError({type: 'manual error', message: "Mandatory parameters"});
            F.functions.json_response(self, 400, error);
        }
    } catch (e) {
        F.functions.sendCrash(e);
        let error = F.functions.handleError({type: 'manual error'});
        F.functions.json_response(self, 500, error);
    }
}

/**
 * Update user's data
 */
function updateUser() {
    F.functions.log("\n[/api/updateUser/] updateUser");
    let self = this;
    try {
        if (self.body.user && self.body.id) {
            self.body.user.updatedAt = 'SYSDATE()';
            let queryUpdate = __createUpdate("User", self.body.user, self.body.id);
            let query = queryUpdate + 'SELECT getUser({username: "' + self.body.user.email + '"});';
            F.functions.query(query)
                    .then(function (response) {
                        F.functions.json_response(self, 200, response[0]);
                    }
                    ).catch(function (error) {
                F.functions.sendCrash(error);
                error = F.functions.handleError(error);
                F.functions.json_response(self, 400, error);
            });
        } else {
            let error = F.functions.handleError({type: 'manual error', message: "Mandatory parameters"});
            F.functions.json_response(self, 400, error);
        }
    } catch (e) {
        F.functions.sendCrash(e);
        let error = F.functions.handleError({type: 'manual error'});
        F.functions.json_response(self, 500, error);
    }
}

/**
 * Authenticate a manual user
 */
function login() {
    F.functions.log("\n[/api/login/] login");

    let self = this;

    try {
        let user = self.body.user ? self.body.user : null;

        if (user && user.email && user.password) {

            let query = 'SELECT getUser({username: "' + user.email + '"});';

            F.functions.query(query)
                    .then(function (response) {
                        response[1] = self.body.data;
                        response[2] = self.body.user;
                        F.functions.json_response(self, 200, response);
                    }
                    ).catch(function (error) {
                F.setDatabaseUser("admin", "admin"); //login
                F.functions.sendCrash(error);
                error = F.functions.handleError(error);
                F.functions.json_response(self, 400, error);
            });
        } else {
            let error = F.functions.handleError({type: 'manual error', message: "Mandatory parameters"});
            F.functions.json_response(self, 400, error);
        }
    } catch (e) {
        F.functions.sendCrash(e);
        let error = F.functions.handleError({type: 'manual error'});
        F.functions.json_response(self, 500, error);
    }
}

/**
 * Authenticate a facebook user
 */
function loginSocial() {
    F.functions.log("\n[/api/loginSocial/] loginSocial");
    let self = this;

    try {
        let user = self.body.user ? self.body.user : null;
        if (user && user.email) {
            let query = 'SELECT getUser({username: "' + user.email + '"});';
            F.functions.query(query)
                    .then(function (response) {
                        F.functions.json_response(self, 200, response[0]);
                    }
                    ).catch(function (error) {
                F.setDatabaseUser("admin", "admin"); //login
                F.functions.sendCrash(error);
                error = F.functions.handleError(error);
                F.functions.json_response(self, 400, error);
            });
        } else {
            let error = F.functions.handleError({type: 'manual error', message: "Mandatory parameters"});
            F.functions.json_response(self, 400, error);
        }
    } catch (e) {
        F.functions.sendCrash(e);
        let error = F.functions.handleError({type: 'manual error'});
        F.functions.json_response(self, 500, error);
    }
}

/**
 * Migrar carrito de compra del usuario de un usuario a otro.
 */
function cartMigrate() {
    F.functions.log("\n[/api/login/] cartMigrate");
    let self = this;
    try {

        let data = {};
        data['user'] = self.body.user;
        data['cart'] = self.body.carRid;
        data['cartItems'] = self.body.cartItems;
        if (self.body.cartItemsModifiers) {
            data['cartItemsModifiers'] = self.body.cartItemsModifiers;
        }
        if (self.body.cartItemsModifiersGroup) {
            data['cartItemsModifiersGroup'] = self.body.cartItemsModifiersGroup;
        }
        if (self.body.cartItemProductGroup) {
            data['cartItemProductGroup'] = self.body.cartItemProductGroup;
        }

        let query = 'SELECT cartMigrate(' + JSON.stringify(data) + ');';
        F.functions.query(query)
                .then(function (responseCart) {
                    F.setDatabaseUser(self.body.username.email, self.body.username.password);
                    responseCart[1] = self.body;
                    F.functions.json_response(self, 200, responseCart);
                }
                ).catch(function (error) {
            F.functions.sendCrash(error);
            error = F.functions.handleError(error);
            F.functions.json_response(self, 400, error);
        });

    } catch (e) {
        F.functions.sendCrash(e);
        let error = F.functions.handleError({type: 'manual error'});
        F.functions.json_response(self, 500, error);
    }
}

/**
 * change user
 * TO-DO: se debe revisar
 */
function logout() {
    F.functions.log("\n[/api/logout/] logout");
    let self = this;
    try {
        F.setDatabaseUser("social", "social123");
        F.functions.json_response(self, 200, {});
    } catch (e) {
        F.functions.sendCrash(e);
        F.functions.json_response(self, 500, {msg: "Ups! Lo sentimos, algo salió mal. Intenta nuevamente."});
    }
}

/**
 * List type services
 */
function typeService() {
    F.functions.log("\n[/api/typeService/] typeService");
    let self = this;
    try {
        let query = 'select from typeService;';
        F.functions.query(query)
                .then(function (response) {
                    F.functions.json_response(self, 200, response);
                }
                ).catch(function (error) {
            F.functions.sendCrash(error);
            error = F.functions.handleError(error);
            F.functions.json_response(self, 400, error);
        });
    } catch (e) {
        F.functions.sendCrash(e);
        F.functions.json_response(self, 500, {msg: "Ups! Lo sentimos, algo salió mal. Intenta nuevamente."});
    }
}

/**
 * List all cities enable in coverage
 */
function citiesCoverage() {
    F.functions.log("\n[/api/citiesCoverage/] citiesCoverage");
    let self = this;
    try {
        let query = 'select capitalize(city) as city from (select city.toLowerCase() as city from pointSale) group by city;';
        F.functions.query(query)
                .then(function (response) {
                    F.functions.json_response(self, 200, response);
                }
                ).catch(function (error) {
            F.functions.sendCrash(error);
            error = F.functions.handleError(error);
            F.functions.json_response(self, 400, error);
        });
    } catch (e) {
        F.functions.sendCrash(e);
        F.functions.json_response(self, 500, {msg: "Ups! Lo sentimos, algo salió mal. Intenta nuevamente."});
    }
}

/**
 * Verify if user exist by email
 */
function userExist() {
    F.functions.log("\n[/api/userExist/] userExist");
    let self = this;
    try {
        if (self.body.email) {
            let query = 'select from User where name = "' + self.body.email + '";';
            F.functions.query(query)
                    .then(function (response) {
                        F.functions.json_response(self, 200, response);
                    }
                    ).catch(function (error) {
                F.functions.sendCrash(error);
                error = F.functions.handleError(error);
                F.functions.json_response(self, 400, error);
            });
        } else {
            F.functions.json_response(self, 400, {msg: "Mandatory parameters cartId"});
        }
    } catch (e) {
        F.functions.sendCrash(e);
        F.functions.json_response(self, 500, {msg: "Ups! Lo sentimos, algo salió mal. Intenta nuevamente."});
    }
}

/**
 * update cart's data
 */
function updateCart() {
    F.functions.log("\n[/api/savecart/] saveCart");
    let self = this;

    try {
        if (self.body.cartId && self.body.cart) {
            let queryCart = __createUpdate("cart", self.body.cart, self.body.cartId);

            let params = {cart: self.body.cartId};
            if (self.body.codeCoupon)
                params.codeCoupon = self.body.codeCoupon;
            let querySelect = 'select getCart(' + JSON.stringify(params) + ');';

            //TO-DO:: revisar porque no funciona con begin y commit
            let query = queryCart + querySelect;

            F.functions.query(query)
                    .then(function (response) {
                        F.functions.json_response(self, 200, response);
                    }
                    ).catch(function (error) {
                F.functions.sendCrash(error);
                error = F.functions.handleError(error);
                F.functions.json_response(self, 400, error);
            });
        } else {
            F.functions.json_response(self, 400, {msg: "Mandatory parameters cartId"});
        }
    } catch (e) {
        F.functions.sendCrash(e);
        F.functions.json_response(self, 500, {msg: "Ups! Lo sentimos, algo salió mal. Intenta nuevamente."});
    }
}

function resetPassword() {
    F.functions.log("\n[/api/resetPassword/] resetPassword");
    let self = this;

    try {
        let email = self.body.email ? self.body.email : null;
        if (email) {
            let query = 'SELECT resetPassword({email: "' + email + '"});';
            F.functions.query(query)
                    .then(function (response) {
                        F.functions.json_response(self, 200, response[0]);
                    }
                    ).catch(function (error) {
                F.setDatabaseUser("admin", "admin");
                F.functions.sendCrash(error);
                error = F.functions.handleError(error);
                F.functions.json_response(self, 400, error);
            });
        } else {
            let error = F.functions.handleError({type: 'manual error', message: "Mandatory parameters"});
            F.functions.json_response(self, 400, error);
        }
    } catch (e) {
        F.functions.sendCrash(e);
        let error = F.functions.handleError({type: 'manual error'});
        F.functions.json_response(self, 500, error);
    }
}