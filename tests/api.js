"use strict";

TEST('Test /api/coverage/ peticion de cobertura sin parametros ', '/api/coverage/', function (builder) {
    builder.post();
    builder.exec(function (err, response, output) {
        OK(output.status === 400, 'faltan parametros');
    });
});

TEST('Test /api/coverage/ petición de cobertura falta un parametro', '/api/coverage/', function (builder) {
    builder.post();
    builder.json({lng: '-75.56817850991206'});
    builder.exec(function (err, response, output) {
        OK(output.status === 400, 'faltan parametros');
    });
});

TEST('Test /api/coverage/ el geopoint esta fuera de la covertura', '/api/coverage/', function (builder) {
    builder.post();
    builder.json({lat: '-6.249320698177744', lng: '-75.56817850991206'});
    builder.exec(function (err, response, output) {
        var result = JSON.parse(output.response);
        OK(output.status === 200, 'HTTP status');
        OK(result.length <= 0, 'esta fuera de la covertura');
    });
});

TEST('Test /api/coverage/ el geopoint esta en la cobertura', '/api/coverage/', function (builder) {
    builder.post();
    builder.json({lat: '6.249320698177744', lng: '-75.56817850991206'});
    builder.exec(function (err, response, output) {
        var result = JSON.parse(output.response)[0];
        OK(output.status === 200, 'HTTP status');
        OK(Object.keys(result).length > 0, 'esta en al covertura');
        OK(result.name === "Medellin", 'esta en al covertura del punto de venta oficina');
    });
});

TEST('Test /api/addToCart/ parametros incorrectos', '/api/addToCart/', function (builder) {
    builder.post();
    builder.json({test: '6.249320698177744'});
    builder.exec(function (err, response, output) {
        OK(output.status === 400, 'HTTP status  400');
    });
});

TEST('Test /api/addToCart/ parametro pointsale vacio', '/api/addToCart/', function (builder) {
    builder.post();
    builder.json({pointsale: ''});
    builder.exec(function (err, response, output) {
        OK(output.status === 400, 'HTTP status  400');
    });
});

TEST('Test /api/addToCart/ parametro producto vacio', '/api/addToCart/', function (builder) {
    builder.post();
    builder.json({pointsale: "eL3yHtNyQG"});
    builder.exec(function (err, response, output) {
        OK(output.status === 400, 'HTTP status  400');
    });
});

TEST('Test /api/addToCart/ agregar un producto al carrito', '/api/addToCart/', function (builder) {
    var fs = require('fs');
    var product = JSON.parse(fs.readFileSync('./json/product.json', 'utf8'));
    builder.post();
    builder.json(JSON.stringify(product));
    builder.exec(function (err, response, output) {
        OK(output.status === 200, 'HTTP status  200');
        OK(JSON.parse(output.response)["pointSale"] === product.pointsale, 'Se agrego el producto con el punto de venta');
        OK(JSON.parse(output.response)["items"][0]["product"]["id"] === product.id, 'el id del producto corresponde al agregado al carrito');
    });
});

TEST('Test /api/checkout/ parametro  incorrecto', '/api/checkout/', function (builder) {
    builder.post();
    builder.json({test: "afaf"});
    builder.exec(function (err, response, output) {
        OK(output.status === 400, 'HTTP status  400 erro de parametro');
    });
});

TEST('Test /api/checkout/ parametro de id del carrito vacio', '/api/checkout/', function (builder) {
    builder.post();
    builder.json({id: ""});
    builder.exec(function (err, response, output) {
        OK(output.status === 400, 'HTTP status  400');
    });
});

TEST('Test /api/checkout/ checkout sin un usuario logueado', '/api/checkout/', function (builder) {
    builder.post();
    builder.json({id: "w3o18u26pV"});
    builder.exec(function (err, data, response) {
        var message = F.functions.getMessage(response.value, true);
        OK(response.status === 400, 'HTTP status  400');
        OK(message.code === 142, 'code error  interno 141');
        OK(message.error, ' message error paymentMethod is mandatory consumerAddress is mandatory ');
    });
});

TEST('Test /api/order/ parametros incorrectos', '/api/order/', function (builder) {
    builder.post();
    builder.json({test: ""});
    builder.exec(function (err, data, response) {
        OK(response.status === 400, 'HTTP status  400');
    });
});

TEST('Test /api/order/ consumer vacio', '/api/order/', function (builder) {
    builder.post();
    builder.json({consumer: ""});
    builder.exec(function (err, data, response) {
        var message = F.functions.getMessage(response.value);
        OK(response.status === 400, 'HTTP status  400');
        OK(message.includes("sin parametro consumerId"), 'HTTP status  400');
    });
});

TEST('Test /api/order/ consumer no encontrado', '/api/order/', function (builder) {
    builder.post();
    builder.json({consumer: "12345432"});
    builder.exec(function (err, data, response) {
        var message = F.functions.getMessage(response.value, true);
        OK(response.status === 400, 'HTTP status  400');
        OK(message.code === 141, 'code error  interno 141');
        OK(message.error === "consumer not found", 'message error');
    });
});

TEST('Test /api/deleteAddress/ parametros incorrectos', '/api/deleteAddress/', function (builder) {
    builder.post();
    builder.json({id: ""});
    builder.exec(function (err, data, response) {
        OK(response.status === 400, 'HTTP status  400');
    });
});

TEST('Test /api/deleteAddress/ dirección no encontrada', '/api/deleteAddress/', function (builder) {
    builder.post();
    builder.json({id: "12"});
    builder.exec(function (err, data, response) {
        var message = F.functions.getMessage(response.value, true);
        OK(response.status === 400, 'HTTP status  400');
        OK(message.code === 141, 'code error  interno 141');
        OK(message.error === "Address not found", 'message error');
    });
});

TEST('Test /api/getAddress/ parametros incorrectos', '/api/getAddress/', function (builder) {
    builder.post();
    builder.json({consumer: ""});
    builder.exec(function (err, data, response) {
        OK(response.status === 400, 'HTTP status  400');
    });
});

TEST('Test /api/getAddress/ consumer sin direcciones', '/api/getAddress/', function (builder) {
    builder.post();
    builder.json({consumer: "127"});
    builder.exec(function (err, data, response) {
        OK(response.status === 200, 'HTTP status  200');
        OK(response.value.length === 0, 'Sin direcciones');
    });
});

TEST('Test /api/addAddress/ parametros incorrectos', '/api/addAddress/', function (builder) {
    builder.post();
    builder.json({consumer: "", name: "", city: "", description: "", address: "", latitude: "", longitude: ""});
    builder.exec(function (err, data, response) {
        var message = F.functions.getMessage(response.value);
        OK(response.status === 400, 'HTTP status  400');
        OK(message === ' Mandatory parameters', 'Mandatory parameters');
    });
});

// TEST('Test /api/addAddress/ Consumer no encontrado', '/api/addAddress/', function (builder) {
//     builder.post();
//     builder.json({consumer: "1266ff", name: "medellin", city: "medellin", description: "medellin", address: "cr 6 #12-24", location: {latitude: 6.33444, longitude: -75.66}});
//     builder.exec(function (err, data, response) {
//         var message = F.functions.getMessage(response.value, true);
//         OK(message.code === 141, 'code error  interno 141');
//         OK(message.error === "consumer not found", 'message error');
//     });
// });

TEST('Test /api/email/ parametros incorrectos o vacios', '/api/email/', function (builder) {
    builder.post();
    builder.json({test: "12345432", subject: "", emailFrom: "", variables: ""});
    builder.exec(function (err, data, response) {
        OK(response.status === 400, 'HTTP status  400');
    });
});

TEST('Test /api/email/ deberia enviar un email ', '/api/email/', function (builder) {
    builder.post();
    var mandrill = [
        {"name": "title", "content": "Burger King"},
        {"name": "name", "content": "Freddy"},
        {"name": "email", "content": "Freddy@gmail.com"},
        {"name": "subject", "content": "subject 1"},
        {"name": "comments", "content": "comments 1"}
    ];
    builder.json({mandrill: mandrill, subject: " prueba envio de email"});
    builder.exec(function (err, data, response) {
        OK(response.status === 200, 'HTTP status  200');
        OK(response.value === "Email sent!", 'response Email sent!');
    });
});

TEST('Test /api/resetPassword/ parametros incorrectos o vacios', '/api/resetPassword/', function (builder) {
    builder.post();
    builder.json({test: "12345432"});
    builder.exec(function (err, data, response) {
        var message = JSON.parse(F.functions.getMessage(response.value));
        OK(response.status === 400, 'HTTP status  400');
        OK(message.error.includes("Mandatory parameters email"), 'mensaje:: "Mandatory parameters email and password"');
        OK(message.code === 141, 'codigo de error 141');
    });
});

TEST('Test /api/promotionalCode/ parametro incorrectos ', '/api/promotionalCode/', function (builder) {
    builder.post();
    builder.json({code: "sadf", subject: " prueba andres"});
    builder.exec(function (err, data, response) {
        var message = F.functions.getMessage(response.value);
        OK(response.status === 400, 'HTTP status 400 ');
        OK(message.includes("Mandatory parameters code, pointsale, cartid o consumerId"), 'message error');
    });
});

TEST('Test /api/promotionalCode/ parametro vacios ', '/api/promotionalCode/', function (builder) {
    builder.post();
    builder.json({code: "", pointSale: "", cartId: "", consumerId: ""});
    builder.exec(function (err, data, response) {
        var message = F.functions.getMessage(response.value);
        OK(response.status === 400, 'HTTP status 400 ');
        OK(message.includes("Mandatory parameters code, pointsale, cartid o consumerId"), 'message error');
    });
});

TEST('Test /api/promotionalCode/ cupon no encontrado ', '/api/promotionalCode/', function (builder) {
    builder.post();
    builder.json({code: "43253", pointSale: "341234124", cartId: "4312341", consumerId: "213412334"});
    builder.exec(function (err, data, response) {
        var message = F.functions.getMessage(response.value, true);
        OK(response.status === 400, 'HTTP status 400 ');
        OK(message.code === 141, '141 code error ');
        OK(message.error === "Cupón no encontrado", ' mensaje Cupón no encontrado');
    });
});

TEST('Test /api/promotionalCode/ cupón invalido para el punto de venta ', '/api/promotionalCode/', function (builder) {
    builder.post();
    builder.json({code: "12345", pointSale: "341234124", cartId: "4312341", consumerId: "213412334"});
    builder.exec(function (err, data, response) {
        var message = F.functions.getMessage(response.value, true);
        OK(response.status === 400, 'HTTP status 400 ');
        OK(message.code === 141, '141 code error ');
        OK(message.error === "el cupón no aplica para este punto de venta.", ' mensaje Cupón invalido');
    });
});

TEST('Test /api/promotionalCode/ carrito no encontrado ', '/api/promotionalCode/', function (builder) {
    builder.post();
    builder.json({code: "12345", pointSale: "eL3yHtNyQG", cartId: "4312341", consumerId: "213412334"});
    builder.exec(function (err, data, response) {
        var message = F.functions.getMessage(response.value, true);
        OK(response.status === 400, 'HTTP status 400 ');
        OK(message.code === 141, '141 code error ');
        OK(message.error === "Cart no found.", ' mensaje carrito no encontrado');
    });
});

TEST('Test /api/promotionalCode/ descuento aplicado al carrito ', '/api/promotionalCode/', function (builder) {
    builder.post();
    builder.json({code: "12345", pointSale: "eL3yHtNyQG", cartId: "8ZzgGhxbpq", consumerId: "213412334"});
    builder.exec(function (err, data, response) {
        var message = JSON.parse(JSON.stringify(response.value));
        OK(response.status === 200, 'HTTP status 200');
        OK(message["totalApplied"], "Tiene totalApplied");
        OK(message["totalDiscount"], "Tiene totalDiscount");
    });
});

TEST('Test /api/resetPassword/ email incorrecto', '/api/resetPassword/', function (builder) {
    builder.post();
    builder.json({email: "hhh.com"});
    builder.exec(function (err, data, response) {
        var message = JSON.parse(F.functions.getMessage(response.value));
        OK(response.status === 400, 'HTTP status  400');
        OK(message.error.includes("Email invalid"), 'mensaje email invalido');
        OK(message.code === 142, 'codigo de error 142');
    });
});

TEST('Test /api/resetPassword/ usuario no encontrado', '/api/resetPassword/', function (builder) {
    builder.post();
    builder.json({email: "yulian.zapata@inoutdelviery.com"});
    builder.exec(function (err, data, response) {
        var message = JSON.parse(response.value);
        OK(response.status === 200, 'HTTP status  200');
        OK(message.error.includes("user no found"), 'mensaje:: user no found');
        OK(message.code === 141, 'codigo de error 141');
    });
});


TEST('Test /api/resetPassword/ solicitud de cambio de email', '/api/resetPassword/', function (builder) {
    builder.post();
    builder.json({email: "hash.key66@gmail.com"});
    builder.exec(function (err, data, response) {
        OK(response.status === 200, 'HTTP status  200');
        OK(response.value.includes("Email sent!"), 'mensaje:: Email sent');
    });
});

TEST('Test /api/changePassword/ parametros obligatorios no enviado', '/api/changePassword/', function (builder) {
    builder.post();
    builder.exec(function (err, data, response) {
        var message = JSON.parse(F.functions.getMessage(response.value));
        OK(response.status === 400, 'HTTP status  400');
        OK(message.error.includes("Mandatory parameters email, password o token"), 'mensaje:: "Mandatory parameters email and password"');
        OK(message.code === 141, 'codigo de error 141');
    });
});

TEST('Test /api/changePassword/ parametro password vacio', '/api/changePassword/', function (builder) {
    builder.post();
    builder.json({email: "hash.key@gmial.com", token: "1233", password: "  "});
    builder.exec(function (err, data, response) {
        var message = JSON.parse(F.functions.getMessage(response.value));
        OK(response.status === 400, 'HTTP status  400');
        OK(message.error.includes("Password empty"), 'mensaje:: "Password empty"');
        OK(message.code === 142, 'codigo de error 142');
    });
});

TEST('Test /api/changePassword/ parametro token vacio', '/api/changePassword/', function (builder) {
    builder.post();
    builder.json({email: "hash.key@gmial.com", password: "2341", token: ""});
    builder.exec(function (err, data, response) {
        var message = JSON.parse(F.functions.getMessage(response.value));
        OK(response.status === 400, 'HTTP status  400');
        OK(message.error.includes("Token empty"), 'mensaje:: "Password empty"');
        OK(message.code === 142, 'codigo de error 142');
    });
});

TEST('Test /api/changePassword/ email no encontrado', '/api/changePassword/', function (builder) {
    builder.post();
    builder.json({email: "hash.key@gmial.com", token: "3134", password: "123"});
    builder.exec(function (err, data, response) {
        var message = F.functions.getMessage(response.value, true);
        OK(response.status === 400, 'HTTP status  400');
        OK(message.error.includes("no found"), 'mensaje:: "email no encontrado"');
        OK(message.code === 141, 'codigo de error 141');
    });
});

TEST('Test /api/changePassword/ token invalido', '/api/changePassword/', function (builder) {
    builder.post();
    builder.json({email: "hash.key@gmail.com", password: "123", token: "123343"});
    builder.exec(function (err, data, response) {
        var message = F.functions.getMessage(response.value, true);
        OK(response.status === 400, 'HTTP status  200');
        OK(message.error.includes("no found"), 'mensaje:: "email no encontrado"');
        OK(message.code === 141, 'codigo de error 141');
    });
});

TEST('Test /api/pointSaleIsOpen/ sin parametros', '/api/pointSaleIsOpen/', function (builder) {
    builder.get();
    builder.exec(function (err, data, response) {
       var message = F.functions.getMessage(response.value, true);
        OK(response.status === 400, 'HTTP status  200');
        OK(message.error.includes("Mandatory parameters pointsale id"), 'mensaje:: "Mandatory parameters pointsale id"');
        OK(message.code === 141, 'codigo de error 141');
    });
});

TEST('Test /api/pointSaleIsOpen/ parametros invalidos', '/api/pointSaleIsOpen?test=prueb', function (builder) {
    builder.get();
    builder.exec(function (err, data, response) {
        var message = F.functions.getMessage(response.value, true);
        OK(response.status === 400, 'HTTP status  400');
        OK(message.error.includes("Mandatory parameters pointsale id"), 'mensaje:: "Mandatory parameters pointsale id"');
        OK(message.code === 141, 'codigo de error 141');
    });
});

TEST('Test /api/pointSaleIsOpen/ punto de venta no encontrado', '/api/pointSaleIsOpen?id=eL3yHtN&slug=test', function (builder) {
    builder.get();
    builder.exec(function (err, data, response) {
        var message = F.functions.getMessage(response.value, true);
        OK(response.status === 400, 'HTTP status  200');
        OK(message.code === 141, 'codigo de error 141');
        OK(message.error.includes("point not found!"), 'mensaje:: "point not found!"');
    });
});


TEST('Test /api/pointSaleIsOpen/ punto de venta encontrado', '/api/pointSaleIsOpen?id=eL3yHtNyQG', function (builder) {
    builder.get();
    builder.exec(function (err, data, response) {
        var message = JSON.parse(JSON.stringify(response.value));
        OK(message.schedulesPickup, 'tiene un status de horario de pickup');
        OK(message.schedules , 'tiene un status de horario de domicilio');
    });
});

TEST('Test /api/product/ producto no encontrado', '/api/product/', function (builder) {
    builder.post();
    builder.json({id: "123g", pointSale: ""});
    builder.exec(function (err, data, response) {
        var message = F.functions.getMessage(response.value, true);
        OK(response.status === 400, 'HTTP status  200');
        OK(message.error === "product not found", "product not found");
        OK(message.code === 141, 'codigo de error 141');
    });
});