var Events = {
    "ADD_ITEM": "AddItem", //A product was added to the cart
    "ADDRESS_SAVED": "AddressSaved", //An address has been saved
    "ADDRESS_SELECTED": "AddressSelected", //An Address was selected in the list of registered addresses
    "APP_LOADED": "AppLoaded", //The App was loaded, Splash Screen
    "CONSUMER_ADDRESSES_LOADED": "ConsumerAddressesLoaded", //When the Adresses of customers was loaded.
    "COLLAPSE_CART": "CollapseCart", //The cart was collapsed
    "CREATE_ORDER": "CreateOrder", //A order was created
    "EMPTY_CART": "EmptyCart", //Cart was empty
    "ITEM_DECREASE_AMOUNT": "ItemDecreaseAmount",
    "ITEM_INCREASE_AMOUNT": "ItemIncreaseAmount",
    "ITEM_PURCHASE": "ItemPurchase", /*A product was purchased, for each item bough in an order an event of this type is sent.*/
    "LOGIN": "Login", //Customer did login
    "LOGOUT": "Logout", //Customer did logout
    "OUT_OF_COVERAGE": "OutOfCoverage", //The customer was out of coverage
    "ORDER_RATING": "OrderRating", //Rating of an Order
    "POINT_SALE_CLOSED": "PointSaleClosed", //The Point of Sale was closed
    "PRODUCTS_LOADED": "ProductsLoaded", //Products were loaded.
    "REGISTER": "Register", //User registered
    "REMOVE_ITEM": "RemoveItem", //An item was removed from the cart
    "SHOW_CART": "ShowCart", //The cart was shown in the screen
    "CONSUMER_ADDRESSES_SCREEN": "ConsumerAddressesScreen", //The screen of consumer addresses was shown
    "NEW_ADDRESS_SCREEN": "NewAddressScreen", //The Screen to add a new address was shown
    "ORDER_CONFIRMATION_SCREEN": "OrderConfirmationScreen", //The Order Screen was shown
    "ORDER_RATING_SCREEN": "OrderRatingScreen", //Screen to qualify the order was shown
    "OUT_OF_COVERAGE_SCREEN": "OutOfCoverageScreen", //Screen telling that user is out of coverage was shown
    "POINT_SALE_CLOSED_SCREEN": "PointSaleClosedScreen", //Screen of Closed Point of Sale was shown
    "PRODUCT_DETAIL_SCREEN": "ProductDetailScreen", //Screen of Product Detail
    "PRODUCTS_SCREEN": "ProductsScreen", //List of products screen
    "PROFILE_SCREEN": "ProfileScreen", //Profile Screen
    "LOGIN_SCREEN": "LoginScreen", //Login Screen
    "CATEGORY_IN_MENU_CLICK": "CategoryInMenuClick", //Category in the left menu was clicked
    "COMPLETE_ADDRESS_SCREEN": "CompleteAddressScreen", //An address has been fill up completly
    "PAYMENT_METHOD_SELECTED": "PaymentMethodSelected"

    //----------
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

var EventsPixel = {
    "VIEW_CONTENT": "ViewContent", //contenido visualizado
    "SEARCH": "Search",
    "ADD_TO_CART": "AddToCart", //agregado al carrito
    "INITIATE_CHECKOUT": "InitiateCheckout", //pago iniciado
    "PURCHASE": "Purchase",// comprado
    "COMPLETE_REGISTRATION": "CompleteRegistration",
    "ADD_PAYMENT_INFO": "AddPaymentInfo" //informacion de pago agregada
};


var serviceConfig = {
    "flavorName": "burger king",
    "businessId_pro": "com.inoutdelivery.burgerkingcolombia",
    "businessId_dev": "com.inoutdelivery.burgerking",
    "parseAppId_dev": "hSMaiK7EXqDqRVYyY2fjIp4lBweiZnjpEmhH4LpJ",
    "parseAppId_pro": "hSMaiK7EXqDqRVYyY2fjIp4lBweiZnjpEmhH4LpJ",
    "parseURL_dev": "https://dev.parse.inoutdelivery.com/parse/",
    "parseURL_pro": "https://pro.parse.inoutdelivery.com/parse/",
    "FACEBOOK_APP_ID": "1252569251538310",
    "facebookPixelId": "196365190821788",
    "mixPanelToken": "c71a41fe8cac4b1c57a4bb89de676583",
    "googleAnalyticsId": "UA-100273913-1",
    "firebase_url": 'https://inout-fdc9b.firebaseio.com', 
    "firebase_domain": 'inout-fdc9b.firebaseapp.com',
    "firebase_token": 'AIzaSyDdtu2B3XxOD8wfLK20-yuBOi4lAhU7CAg',
    "currency": "cop"
};

var message = {
    "update_user": "Datos actualizados correctamente.",
    "email_ok": "Mensaje enviado correctamente.",
    "email_fail": "Error enviando este mensaje, intente de nuevo",
    "recover_ok":"Se ha realizado el cambio de contraseña correctamente.",
    "recover_fail":"No hemos podido encontrar una cuenta con esa dirección de correo electrónico.",
    "promocode_fail": "El Campo de código promocional esta vacio",
    "promocode_ok": "El cupón se agrego correctamente",
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
    "zero_results": "Tu dirección no retorna resultados.",
    "geolocation_error": "La geolocalización no es soportada por este navegador.",
    "add_cart": "Tu producto se ha agregado al carrito.",
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
    "error": "Intenta de nuevo más tarde o comuniquese con el administrador.",
    "error_value": "Debe ingresar un valor valido superior $ 0.",
    "error_checkout": "No se puede hacer el checkout en este momento. Te recomendamos iniciar el proceso de compra nuevamente.",
    "error_facebook": "Error al ingresar con Facebook. Intenta nuevamente o comunícate con el administrador"
};

var env = {
    "MODE": "DEV"
};