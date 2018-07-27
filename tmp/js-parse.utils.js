var PARSE_APP_ID = serviceConfig.parseAppId_pro;
var PARSE_SERVER_URL = serviceConfig.parseURL_dev;
var BUSINESS_ID = serviceConfig.businessId;

if (env.MODE === "PRO") {
    PARSE_SERVER_URL = serviceConfig.parseURL_pro;
    PARSE_APP_ID = serviceConfig.parseAppId_pro;
}

Parse.initialize(PARSE_APP_ID);
Parse.serverURL = PARSE_SERVER_URL;

/**
 * trae la informacion de usuario actual
 * @param callback
 */
function getConsumer(callback) {
    var Consumer = Parse.Object.extend('Consumer');
    var user = Parse.User.current();
    if(user) {
        new Parse.Query(Consumer)
            .equalTo('user', user).first()
            .then(function (consumer) {
                callback("OK", consumer);
            }).fail(function (error) {
            callback("FAIL", error);
        });
    }
}

/**
 *  se encarga de crear un consumer en parse server
 * @param params : email, name, phone
 * @param callback
 */
function createConsumer(params, callback) {
    if (!params.user) {
        params.user = Parse.User.current();
        params.user.setUsername(params.email + BUSINESS_ID);
    }

    var Consumer = Parse.Object.extend('Consumer');
    var consumer = new Consumer();
    consumer.save(params).then(function (user) {
        trackRegister(params.content_type, user);
        callback("OK", user);
    }).fail(function (e) {
        trackRegister(params.content_type, e, true);
        callback("FAIL", e);
    });
}


/**
 * track registro de usuarios
 * @param value : datos del registro
 */
function trackRegister(type, value, error = false) {
    let params = {};

    if (error === true) {
         params[Properties.ERROR] = value;
    }
    else {
        params[Properties.USER_ID] = value.id;
    }

    params[Properties.CONTENT_TYPE] = type;
    Analytics.track(EVENTS.REGISTER, params);
}

/**
 * registra un usuarion con email
 * @param params datos del usuario
 * @param callback
 */
function registerEmail(params, callback) {
    Parse.User.signUp(params.email + BUSINESS_ID, params.password).then(function (user) {
        delete params.password;
        params.user = user;
        createConsumer(params, callback);
    }).fail(function (e) {
        trackRegister("manual", e, true);
        callback("FAIL", e);
    });
}

/**
 * Actualiza los datos de un usuario
 * @param params  datos del consumer a actualziar
 * @param callback
 */
function updateConsumer(params, callback) {
    var Consumer = Parse.Object.extend('Consumer');
    var consumer = new Consumer();
    consumer.save(params).then(function (user) {
        callback("OK", user);
    }).fail(function (e) {
        callback("FAIL", e);
    });
}

/**
 * login para usuario con registro manual
 * @param params datos del usuario
 * @param callback
 */
function loginEmail(params, callback) {
    Parse.User.logIn(params.email + BUSINESS_ID, params.password).then(function (user) {
        callback("OK", user);
    }).fail(function (e) {
        callback("FAIL", e);
    })
}

/**
 * Obtiene  las direcciones almacenadas para un usuario
 * @param user objecto usuario
 * @param callback
 */
function ConsumerAddress(consumerId, callback) {
    const ConsumerAddress = Parse.Object.extend('ConsumerAddress');
    const Consumer = Parse.Object.extend('Consumer');
    var consumer = new Consumer();
    if (consumerId) {
        consumer.id = consumerId;
        new Parse.Query(ConsumerAddress).equalTo('consumer', consumer).find().then(function (addresses) {
            callback("OK", addresses);
        }).fail(function (e) {
            callback("FAIL", e);
        });
    } else {
        callback("FAIL", "consumerId no found");
    }
}

/**
 * Guarda  la dirección de un usuario
 * @param params datos de la direccion
 * @param callback
 */
function createConsumerAddress(params, consumerId, callback) {
    const ConsumerAddress = Parse.Object.extend('ConsumerAddress');
    var consumerAddress = new ConsumerAddress();
    const Consumer = Parse.Object.extend('Consumer');
    var consumer = new Consumer();
    if (params && consumerId) {
        consumer.id = consumerId;
        if (params.objectId) {
            consumerAddress.objectId = params.objectId;
        }
        consumerAddress.set('consumer', consumer);
        consumerAddress.set('city', params.city);
        consumerAddress.set('name', params.name);
        consumerAddress.set('city', params.city);
        consumerAddress.set('description', params.description);
        consumerAddress.set('address', params.address);

        Analytics.track(EVENTS.ADDRESS, params);

        var location = params.location;
        var parseGeoPoint = new Parse.GeoPoint({
            latitude: parseFloat(location.lat),
            longitude: parseFloat(location.lng)
        });
        consumerAddress.set('location', parseGeoPoint);
        consumerAddress.save().then(function (consumerAddress) {
            setLocalStorage("selected_address", JSON.stringify(consumerAddress.toJSON()));
            Analytics.track(Events.CONSUMER_ADDRESSES_SCREEN, {});
            callback("OK", consumerAddress);
        }).fail(function (e) {
            callback("FAIL", e);
        });
    } else {
        callback("FAIL", "params, consumerId no found");
    }
}

/**
 * elimina una dirección de uusario
 * @param id :. identificador
 * @param callback
 */
function deleteConsumerAddress(id, callback) {
    const ConsumerAddress = Parse.Object.extend('ConsumerAddress');
    new Parse.Query(ConsumerAddress).get(id).then(function (address) {
        address.destroy({});
        callback("OK", address);
    }).fail(function (e) {
        callback("FAIL", e);
    });
}

/**
 * retorna todas la ordenes
 * @param callback
 */
function getOrders(callback) {
    Parse.Cloud.run('orders', {businessId: BUSINESS_ID}).then(function (orders) {
        callback("OK", orders);
    }).fail(function (e) {
        callback("FAIL", e);
    });
}

/**
 * trae la informacion de una orden
 * @param consumerId :: identificador del consumer
 * @param orderId :: identificador de la ordern
 * @returns {Promise}
 */
function order(consumerId, orderId = null) {
    var body = {consumer: consumerId};
    if (orderId) body.id = orderId;
    return new Promise((resolve, reject) => {
        $.ajax({
            type: 'post',
            url: '/api/order',
            contentType: "application/json; charset=utf-8",
            data: JSON.stringify(body),
            dataType: 'json'
        }).done(data => {
            resolve(data);
        }).fail(e => {
            reject("error", e);
        });
    });
}

/**
 * se encarga de enviar la calificacion de una orden
 * @param params: puntaje, comentario y id de la orden
 * @param callback
 */
function rateOrder(params, callback) {
    Parse.Cloud.run('rateOrder', params).then(order => {
        callback("OK", order);
    }).fail(e => {
        callback("FAIL", e);
    });
}
