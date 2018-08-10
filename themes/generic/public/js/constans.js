var nameStorage = {
    "address":"current_address",
    "pointSale": "pointsaleAll",
    "consumer": "consumer",
    "tmpConsumer":"tmp_consumer",//consumer temporal
    "banners": "banners",
    "config":"configurations",
    "tmpAddress":"tmp_address",//direccion temporal
    "currentAddress": "current_address",//direccion seleccionada
    "checkout": "checkout",// objeto de checkout
    "cartCount": "cart_count",// numero de productos en el carrito
    "pages_menu": "pages_menu",// nombres de páginas de menú y slugs
    "cartUrl": "/cart", // URL que redirecciona a Carrito de compras
    "cartId": "cart_id",// id del carrito
    "orderId":"order_id", //id de la orden
    "orderName":"order_state_name",
    "showMsgSaveAddress":"show_msg_save_address",
    "service":"typeService",
    "deliveryTime": "delivery_time",
};

// Timeout for requests that don't require a mandatory answer from PARSE (Requests that obtain information)
var timeoutAjax = 30000;

var serviceConfig = {};
var env = {};

// Se obtienen variables de configuración desde header.html
var modeContext = $("#modeContext").html();
if (typeof modeContext === "string") {
    try {
        modeContext = JSON.parse(modeContext);
        if (modeContext && typeof modeContext === "object" && Object.keys(modeContext).length > 0) {
            env["MODE"] = modeContext.mode ? modeContext.mode : "DEV";
            serviceConfig["businessId"] = modeContext.business_id ? modeContext.business_id : "com.inoutdelivery.inouttemplate";
            serviceConfig["parseURL_pro"] =  modeContext.parse_server_url ? modeContext.parse_server_url : "https://dev.parse.inoutdelivery.com/parse/";
            serviceConfig["facebookAppId"] = modeContext.facebook_id ? modeContext.facebook_id : "1880835098605772";
            serviceConfig["facebookPixelId"] = modeContext.facebookPixelId ? modeContext.facebookPixelId : "XXXXXXXXXXXXXXXX";
            serviceConfig["mixPanelToken"] = modeContext.mixPanelToken ? modeContext.mixPanelToken : "XXXXXXXXXXXXXXXXX";
            serviceConfig["googleAnalyticsId"] = modeContext.googleAnalyticsId ? modeContext.googleAnalyticsId : "UA-100273913-1";
            serviceConfig["flavorName"] = "Generica Template";
            serviceConfig["parseAppId_pro"] = "hSMaiK7EXqDqRVYyY2fjIp4lBweiZnjpEmhH4LpJ";
            serviceConfig["parseAppId_dev"] = "hSMaiK7EXqDqRVYyY2fjIp4lBweiZnjpEmhH4LpJ";
            serviceConfig["parseURL_dev"] = "https://dev.parse.inoutdelivery.com/parse/";
            serviceConfig["firebase_url"] = "https://inout-fdc9b.firebaseio.com";
            serviceConfig["currency"] = "cop";
        }
        else {
            throw "[Error]";
        }
    }
    catch (e) {
        console.warn("[WARN] No se puede obtener variables de configuración, se carga configuración por defecto.");
        env = {"MODE": "DEV"};
        serviceConfig = {
            "flavorName": "generica template",
            "businessId_pro": "com.inoutdelivery.inouttemplate",
            "businessId_dev": "com.inoutdelivery.inouttemplate",
            "parseAppId_dev": "hSMaiK7EXqDqRVYyY2fjIp4lBweiZnjpEmhH4LpJ",
            "parseAppId_pro": "hSMaiK7EXqDqRVYyY2fjIp4lBweiZnjpEmhH4LpJ",
            "parseURL_dev": "https://dev.parse.inoutdelivery.com/parse/",
            "parseURL_pro": "https://pro.parse.inoutdelivery.com/parse/",
            "FACEBOOK_APP_ID": "1880835098605772",
            "facebookPixelId": "XXXXXXXXXXXXXXXX",
            "mixPanelToken": "c71a41fe8cac4b1c57a4bb89de676583",
            "googleAnalyticsId": "UA-100273913-1",
            "firebase_url": "https://inout-fdc9b.firebaseio.com",
            "currency": "cop"
        };
    }
}

var message = {
    "update_user": "Datos actualizados correctamente.",
    "email_ok": "Mensaje enviado correctamente.",
    "email_fail": "Error enviando este mensaje, intente de nuevo",
    "recover_ok":"Se ha realizado el cambio de contraseña correctamente.",
    "recover_fail":"No hemos podido encontrar una cuenta con esa dirección de correo electrónico.",
    "promocode_exceed": "El valor de tu compra es inferior al valor del cupón.",
    "promocode_fail": "El Campo de código promocional esta vacio",
    "promocode_missing": "El cupón ingresado no existe o no está en vigencia",
    "promocode_ok": "El cupón se agrego correctamente",
    "promocode_replace_ok": "El cupón se reemplazó correctamente",
    "update_error_user": "No se pudo actualizar los datos, intente nuevamente",
    "closed_business": "El comercio se encuentra cerrado en este momento.",
    "closed_business_point": "El comercio se encuentra cerrado en este momento para la cobertura donde se encuentra esta dirección.",
    "password_user": "Las contraseñas no coinciden.",
    "exists_user": "El correo electrónico ya se encuentra registrado.",
    "login_error_user": "Email o contraseña incorrecto.",
    "captcha_user": "Por favor complete el captcha.",
    "terms_user": "Debe aceptar los términos y condiciones.",
    "firebase": "Estado del pedido",
    "coverage_out": "Tu dirección esta fuera de las áreas de cobertura.",
    "coverage_out_msg_map": "Tu dirección esta fuera de las áreas de cobertura. Ingresa una nueva dirección o refina tu ubicación en el mapa moviendo el marcador. ",
    "zero_results": "Tu dirección no retorna resultados.",
    "geolocation_error": "La geolocalización no es soportada por este navegador.",
    "add_cart": "Tu producto se ha agregado al carrito.",
    "ok_address": "Dirección actualizada correctamente.",
    "reset_address": "Si cambias la dirección de entrega se eliminarán los productos del carrito y debes volver a iniciar tu proceso de compra.",
    "delete_address": "Dirección eliminada correctamente.",
    "error_delete_address": "No puedes eliminar la dirección actualmente seleccionada.",
    "success_addres": "Dirección agregada correctamente.",
    "close_delivery": "No hay domicilios disponibles.",
    "order_price": "La compra debe ser superior a ",
    "checkout_error": "No se pudo hacer el checkout. Comuniquese con el administrador.",
    "update_cart_error": "Problemas al actualizar tu carrito.",
    "empty_cart": "No existe un carrito de compras.",
    "empty_pointsale": "No se ha seleccionado un punto de venta.",
    "empty_consumer": "No existe un usuario asociado a la compra.",
    "empty_paymethod": "Debe escoger un método de pago.",
    "empty_address": "Debe escoger una dirección de entrega.",
    "error": "Intenta de nuevo más tarde o comunícate con el administrador.",
    "error_recovery": "No se podido realizar el cambio de contraseña, Intenta de nuevo o comunícate con el administrador.",
    "error_value": "Debes ingresar un valor valido, igual o superior a tu compra",
    "error_checkout": "No se puede hacer el checkout en este momento. Te recomendamos iniciar el proceso de compra nuevamente.",
    "error_register": "Campos obligatorios vacíos",
    "address_changed": "Dirección actualizada correctamente.",
    "qualify_ok": "Calificación enviada. Gracias por usar nuestro servicio",
    "ok_address": "Dirección actualizada correctamente.",
    "delete_item_cart": "Item eliminado correctamente",
    "delete_cart": "Carrito eliminado correctamente",
    "created_address": "Dirección creada correctamente",
    "error_facebook": "Error al ingresar con Facebook. Intenta nuevamente o comunícate con el administrador",
    "error_hour_already_used": "Al parecer este horario de entrega ya ha sido utilizado. Por favor escoge uno diferente"
};


var EVENTS = {
    "VIEW_CONTENT": "ViewContent",
    "ADD_TO_CART": "AddToCart",
    "INITIATE_CHECKOUT": "InitiateCheckout", //pago iniciado
    "ADD_ITEM": "AddToCart", //A product was added to the cart
    "LEAD": "Lead",// formulario de contacto
    "REGISTER": "Register",
    "DETAILS_PRODUCT": "DetailsProduct",
    "OUT_OF_COVERAGE": "OutOfCoverage", //The customer was out of coverage
    "LOGIN": "Login",
    "LOGOUT": "Logout",
    "ADDRESS": "Address",
    "PURCHASE": "Purchase",// comprado,
    "ITEM_PURCHASE": "ItemPurchase", /*A product was purchased, for each item bough in an order an event of this type is sent.*/
    "ORDER_RATING": "OrderRating", //Rating of an Order
};

var Properties = {
    //---------------
    "CONTENT_NAME": "content_name",
    "CONTENT_ID": "content_id",
    "CONTENT_IDS": "content_ids",
    "CONTENT_TYPE" :"content_type",
    "CONTENT_CATEGORY" :"content_category",
    "VALUE": "value",
    "CURRENCY": "currency",
    "NUM_ITEMS" :"num_items",
    "SEARCH_STRING": "search_string",
    "STATUS": "status",
    "HAS_MODIFIERS": "has_modifiers",
    "HAS_MODIFIERS_GROUP": "has_modifiers_group",
    "HAS_VALUES_MEALS": "has_values_meals",
    "IS_COMBO": "is_combo",
    "PURCHASE": "purchase",
    "ADDRESS": "Address",
    "ADDRESS_ID": "id",
    "ADDRESS_NAME": "name",
    "ADDRESS_CITY": "city",
    "ADDRESS_COUNTRY": "country",
    "ADDRESS_COUNTRY_CODE": "country_code",
    "ADDRESS_POSTAL_CODE": "postal_code",
    "ADDRESS_DESCRIPTION": "description",
    "ADDRESS_LATITUDE": "latitude",
    "ADDRESS_LONGITUDE": "longitude",
    "EMAIL_NAME": "name",
    "EMAIL": "email",
    "SUBJECT": "subject",
    "MESSAGE": "message",
    "TITLE": "title",
    "REFERRER": "referrer", //Returns the URL of the document that loaded the current document
    "USER_AGENT": "userAgent", //Returns the user-agent header sent by the browser to the server
    "LANGUAJE": "language", //Returns the language of the browser
    "CART_ID": "id",
    "ORDER_ID": "id",
    "USER_ID": "id",
    "DELIVERY_COST": "delivery_cost",
    "DELIVERY_COST_PICKUP": "delivery_cost_pickup",
    "PAYMENT_METHOD": "Payment_method",
    "CONSUMER_ADDRESSES": "consummer_address",
    "COUPON": "coupon",
    "COST_COUPON": "cost_coupon",
    "DATE_SCHEDULE": "date_schedule",
    "DATE_PICKUP": "date_pickup",
    "SCORE": "score",
    "ERROR": "error",
    "MODIFIER_GROUP": "ModifierGroups",
    "MODIFIER": "Modifiers",
    "VALUES_MEALS": "valuesMeals",
    //---------------
    "PAGE_NAME": "Page",
    "AMOUNT": "Amount", //Amount
    "AUTH_PROVIDER": "AuthProvider", //Authentication Provider
    "BUSINESS_ID": "BusinessId", //Id of Business
    "CATEGORY_ID": "CategoryId", //Id of Product's Category
    "CATEGORY_NAME": "CategoryName", //Name of Product's category
    "FACEBOOK": "Facebook", //Facebook
    "LATLNG": "LatLng", //Latitude Longitude
    "OS": "OS", //Operational System
    "PAYMENT_METHOD_ID": "PaymentMethodId", //Id of Payment Method
    "PAYMENT_METHOD_NAME": "PaymentMethodName", //Name of Payment Method
    "POINT_SALE_ID": "PointSaleId", //Id of Point of Sale
    "POINT_SALE_NAME": "PointSaleName", //Name of Point of Sale
    "PRODUCT_PRICE": "Price", //Price
    "PRODUCT_ID": "ProductId", //Id of a Product
    "PRODUCT_NAME": "ProductName", //Name of a Product
    "ITEMS_PURCHASE": "Items",
    "TOTAL": "total",
    "MODIFIER_GROUP_ID": "ModifierGroupsIds", //Id of modifierGroup
    "MODIFIER_GROUP_NAME": "ModifierGroupsNames", //Modifier Group Name
    "MODIFIER_GROUP_MODIFIER_ID": "ModifierGroupsModifiersIds", //Id of Modifier in a Modifier Group
    "MODIFIER_GROUP_MODIFIER_NAME": "ModifierGroupModifiersNames", //Name of Modifier in a Modifier Group
    "MODIFIER_GROUP_MODIFIER_ITEM_ID": "ModifierGroupModifierItemsIds", //Id of Modifier in a Modifier Group
    "MODIFIER_GROUP_MODIFIER_ITEM_NAME": "ModifierGroupModifierItemsNames", //Name of Modifier in a Modifier Group
    "MODIFIERS_ID": "ModifiersIds", //Id of Modifier
    "MODIFIERS_NAME": "ModifiersNames", //Modifiers Name
    "MODIFIERS_ITEMS_ID": "ModifierItemsIds", //ModifiersItemsId
    "MODIFIERS_ITEMS_NAME": "ModifierItemsNames", //
};