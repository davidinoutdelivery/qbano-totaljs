var totalGlobal = 0;
var usedCoupon = false;

$(document).ready(function () {

    let cartId = getLocalStorage(nameStorage.cartId);
    if (cartId) {
        checkoutApp.setup();
    }
    else {
        redirect('/');
    }
    
    /**
     * componente que captura la devuelta
     */
    Vue.component('current-format-input', {
        props: ["value"],
        template: `
        <div>
            <input type="text" v-model="displayValue" @blur="isInputActive = false" @focus="isInputActive = true"/>
        </div>`,
        data: function () {
            return {
                isInputActive: false
            }
        },
        computed: {
            displayValue: {
                get: function () {
                    if (this.isInputActive) {
                        return this.value.toString();
                    } else {
                        return "$ " + this.value.toLocaleString();
                    }
                },
                set: function (modifiedValue) {
                    let newValue = parseFloat(modifiedValue.replace(/[^\d\.]/g, ""));
                    if (isNaN(newValue)) {
                        newValue = 0;
                    }
                    this.$emit('input', newValue);
                }
            }
        }
    });

    $('.cd-cart-trigger').hide();
});

/**
 * código promocional
 * @type {Vue}
 */
let promocode = new Vue({
    el: '.modal_cupon',
    data: {
        code: "",
        totalDiscount: 0,
        totalApplied: 0
    },
    methods: {
        /**
         * comprueba el codigo promocional
         */
        setup: function () {
            var form_confirm_coupon = $("#form_confirm_coupon button[type=submit]");
            form_confirm_coupon.startLoading({msg: "Verificando"});
            if (this.code.length > 0) {
                let pointSale = jsonParse(getLocalStorage(nameStorage.pointSale));
                let consumer = jsonParse(getLocalStorage(nameStorage.consumer));
                let cartId = getLocalStorage(nameStorage.cartId);
                if (pointSale && pointSale.rid && consumer && cartId) {
                    apiAjax("getCart", "post", {
                        "codeCoupon": this.code,
                        "cartId": cartId,
                    }).then((response) => {
                        form_confirm_coupon.stopLoading();
                        let cart = response[0].getCart;
                        if (cart.couponValid) {
                            checkoutApp.model.codeCoupon = cart.couponDetails.codeCoupon;
                            checkoutApp.coupon = cart.couponDetails;
                            checkoutApp.cart = cart;
                            notificationGeneral(message.promocode_ok, {
                                type: 'success',
                                layout: 'attached'
                            });
                            $('.modal_cupon .close').click();
                        }
                        else {
                            checkoutApp.model.codeCoupon = "";
                            checkoutApp.coupon = {};
                            checkoutApp.cart = cart;
                            notificationGeneral(cart.couponErrors.join(".</br>"), {type: 'warning', layout: 'attached'});
                        }
                    }, function () {
                        form_confirm_coupon.stopLoading();
                        notificationGeneral(message.error, {type: 'warning', layout: 'attached'});
                    });
                }
            } else {
                form_confirm_coupon.stopLoading();
                notificationGeneral(message.promocode_fail, {type: 'error', layout: 'attached'});
            }
        },
    }
});

/**
 * Métodos de pago.
 * @type {Vue}
 */
let paymentApp = new Vue({
    el: '#payment',
    data: function () {
        return {
            "paymentMethods": [],
            "selectPayment": {},
            "pricePaid": 0,
        }
    },
    methods: {
        /**
         * carga inical de los métodos de pago.
         * @param model
         */
        setup: function() {
            var pointSale = getPointSale();
            if (pointSale && pointSale['rid']) {
                // Carga todos los métodos de pago desde el pointsale
                this.paymentMethods= pointSale.services[0].paymentMethods;
            }

            //verifica la existencia previa de un método de pago seleccionado.
            var checkout = jsonParse(getLocalStorage(nameStorage.checkout));
            if (checkout && checkout["payment"]) {
                this.selectPayment = checkout["payment"];
                checkoutApp.payment = checkout["payment"];
                checkoutApp.model.paymentMethod = checkout["payment"].rid;

                if (checkout.pricePaid) {
                    this.pricePaid = checkout.pricePaid;
                    checkoutApp.model.pricePaid = checkout.pricePaid;
                }
                
           }
        },
        /**
         * Cambia el método de pago.
         * @param method
         */
        paymentChoice: function (method) {
            if (method && method["rid"]) {
                this.selectPayment = method;
                checkoutApp.payment = method;
                checkoutApp.model.paymentMethod =method.rid;
                
                //Método de pago a recordar.
                var checkout = jsonParse(getLocalStorage(nameStorage.checkout));
                if (checkout) {
                    checkout["payment"] = method;
                    setLocalStorage(nameStorage.checkout, JSON.stringify(checkout));
                }

                // 1: efectivo, 2: datafono, 3: credito
                // Acciones dependientes del método seleccionado
                switch (method.code) {
                    case 1:
                    case 3:
                        break;
                    default:
                        this.pricePaid = 0;
                        checkoutApp.model.pricePaid = 0;
                        $(".close").click();
                        break;
                }        
            }
        },
        /**
         * Permite cambiar el precio si el método es efectivo.
         */
        changePrice: function () {
            var totalCart = checkoutApp.cart.total ? checkoutApp.cart.total : null;
            if (this.pricePaid && this.pricePaid >= totalCart) {
                checkoutApp.model.pricePaid = this.pricePaid;
                var checkout = jsonParse(getLocalStorage(nameStorage.checkout));
                if(checkout) {
                    checkout["pricePaid"] = this.pricePaid;
                    setLocalStorage(nameStorage.checkout, JSON.stringify(checkout));
                }
                
                $(".close").click();
            } else {
                notificationGeneral(message.error_value, {type: 'notice', layout: 'attached'});
            }
        }

    }
});

/**
 * Se encarga de hacer todas las operaciones que tienen que ver con el carrito y el checkout.
 * @type {Vue}
 */
let checkoutApp = new Vue({
    el: '#checkout',
    data: {
        "cart": {},
        "model": {
            "user": "",
            "userAddress": "",
            "paymentMethod": "",
            "pricePaid": 0,
            "codeCoupon": "",
            "comment": "",
        },

        "payment": {},
        "address": {},
        "addresses": [],
        "tmpCoverage": [],
        "isEfecty": false,
        "delivery": "",
        "pricePaid": 0,
        "coupon": {},
        "send": true,  //previene doble click al confirmar orden
        "status": false, //Indica si existe un error
        "load": false, //Indica si la pagina 
        "typeService": {},
    },
    methods: {
        /**
         * da manejo a las variables seleccionadas por el usuario
         * en el checkout
         */
        setup: function () {
            let typeService = jsonParse(getLocalStorage(nameStorage.service));
            if (typeService) {
                this.typeService = typeService;
            }

            var user = jsonParse(getLocalStorage(nameStorage.consumer));
            if (user && user["rid"]) {
                this.model.user = user["rid"];

                //Carga variables que son volatiles
                var checkoutTmp = jsonParse(getLocalStorage(nameStorage.checkout));
                if (!checkoutTmp) {
                    setLocalStorage(nameStorage.checkout, JSON.stringify({}));
                }

                checkoutApp.getCart(); //Información del carrito
                paymentApp.setup(); //Métodos de pago del comercio
                addressApp.setup(); //Direcciones del usuario
                schedule.setup(); //fecha de entreg
            }
            else {
                console.log("NO existe usuario");
            }
        },
        /**
         * Obtiene el carrito de compras como paso obligatorio del checkout
         */
        getCart: function () {
            var element_sel = $(".listCart");
            element_sel.startLoading();
            /* Obtiene el carrito actual  */
            var cartId = getLocalStorage(nameStorage.cartId);
            var pointSale = getPointSale();

            if (cartId) {
                apiAjax("getCart", "post", {cartId: cartId}).then((response) => {
                    checkoutApp.cart = response[0].getCart;
                    element_sel.stopLoading();

                    /** Analytics **/
                    var params = {};
                    params[Properties.CONTENT_NAME] = "checkout";
                    Analytics.track(EVENTS.VIEW_CONTENT, params);
                    /** **/

                }, error => {
                    element_sel.stopLoading();
                    notificationGeneral(message.error, {type: "error"});
                    console.error("Error al obtener carrito en checkout ::", error);
                });
            }
        },
        /**
         * Obtiene la url de la imagen de una categoría para usarla como fondo.
         */
        getUrl: function (category, isBackground = false) {
            if (isBackground) {
                if (category.image && category.image.thumbnail) {
                    let url = category.image.thumbnail;
                    return {
                        'background-image': 'url("' + url + '")'
                    }
                } else {
                    return {
                        'background-image': 'url("/generic/images/no_found.png")'
                    }
                }
            }
            else {
                if (category.image && category.image.thumbnail) {
                    let url = category.image.thumbnail;
                    return url;
                } else {
                    return "/generic/images/no_found.png";
                }
            }
        },
        currencyFormat: function (value) {
            if (value) {
                return "$ " + value.toLocaleString();
            } else
                return "$ 0";
        },
        /**
         * Genera una orden
         * @param cart
         */
        checkout: function (cart) {
            var checkout_btn = $(".centerBtn .btnA");
            checkout_btn.startLoading();
            if (this.send) {
                this.send = false;
                this.validate().then(response => {
                    if (response.length > 0) {
                        notificationGeneral(response, {type: 'notice'});
                        this.send = true;
                        checkout_btn.stopLoading();
                    }
                    else {

                        var headers ={
                            'BROWSER_CODE_NAME': navigator.appCodeName,
                            'BROWSER_VERSION': navigator.appVersion,
                            'BROWSER_LANGUAGE': navigator.language,
                            'BROWSER_ONLINE': navigator.onLine,
                            'PLATFORM': navigator.platform,
                            'USER_AGENT': navigator.userAgent
                        };

                        var checkout = {
                            cart: this.cart["rid"],
                            platform: "WEB",
                            headers: JSON.stringify(headers) 
                        };

                        if (this.cart.couponValid) checkout.codeCoupon = this.cart.couponDetails.codeCoupon;
                        if (checkoutApp.model.comment) checkout.comment = checkoutApp.model.comment;
                        if (checkoutApp.delivery) checkout.typeServiceDetails = JSON.stringify({delivery_date: checkoutApp.delivery});
                        checkout.pricePaid = checkoutApp.model.pricePaid;

                        apiAjax("checkout", "post", {purchase: checkout }).then(data => {
                            var order = data[0].createOrder.replace("#", "");
                            removeLocalStorage(nameStorage.cartId);
                            removeLocalStorage(nameStorage.cartCount);
                            setLocalStorage(nameStorage.orderId, order );
                            window.location = "/bill/" + order;
                        }, error => {
                            checkout_btn.stopLoading();
                            this.send = true;
                            if(error && typeof error.responseJSON !== "undefined" && typeof error.responseJSON.code !== "undefined" && error.responseJSON.code === 105) {
                                notificationGeneral(message.error_hour_already_used, {type: "warning"});
                            } else {
                                notificationGeneral(message.error_checkout, {type: "error"});
                            }
                            console.error("ERROR_CHECKOUT", error);
                        });
                    }
                });
            }
        },
        /**
         * Valida los campos obligatorios del checkout
         */
        validate: function () {
            return new Promise(resolve => {
                let pointSale = jsonParse(getLocalStorage(nameStorage.pointSale));
                let messageValidate = "";
                if (!this.cart["rid"])
                    messageValidate += message.empty_cart + "</br>";
                if (!this.cart.pointSale)
                    messageValidate += message.empty_pointsale + "</br>";
                if (!this.cart.user)
                    messageValidate += message.empty_consumer + "</br>";
                if (!this.payment.rid || !this.cart.paymentMethod)
                    messageValidate += message.empty_paymethod + "</br>";
                if (!this.address["@rid"] || !this.cart.userAddress) {
                    messageValidate += message.empty_address + "</br>";
                    resolve(messageValidate);
                }
                else {
                    let datetime = jsonParse(getLocalStorage(nameStorage.deliveryTime));
                    //console.log(datetime);
                    apiAddress.coverage({
                        "latitude": this.address.location.coordinates[1],
                        "longitude": this.address.location.coordinates[0],
                    }, datetime).then((coverage) => {
                        if (Object.keys(coverage[0].result).length === 0) {
                            messageValidate += message.coverage_out + "</br>";
                            resolve(messageValidate);
                        }
                        else {
                            if (!coverage[0].result.isOpen) {
                                messageValidate += message.closed_business + "</br>";
                            }
                            else if ((checkoutApp.cart.total - checkoutApp.cart.costService) <= coverage[0].result.services[0].coverages[0].minOrderPrice) {
                                messageValidate += message.order_price + checkoutApp.currencyFormat(coverage[0].result.services[0].coverages[0].minOrderPrice) + "</br>";
                            }
                            else {
                                if (pointSale && (coverage[0].result.rid !== pointSale.rid)) {
                                    messageValidate += message.reset_address + "</br>";
                                }
                            }
                            resolve(messageValidate);
                        }
                    });
                }
            });
        },
        /**
         * Punto inicial de confirmar un pedido
         * Antes de proceder al checkout el carrito debe tener unos campos obligatorios.
         */
        updateCart: function () {
            var messageValidate = "";
            if (!this.cart["rid"])
                messageValidate += message.empty_cart + "</br>";
            if (!this.cart.pointSale)
                messageValidate += message.empty_pointsale + "</br>";
            if (!this.model.user)
                messageValidate += message.empty_consumer + "</br>";
            if (!this.payment.rid || !this.model.paymentMethod)
                messageValidate += message.empty_paymethod + "</br>";
            if (!this.address["@rid"] || !this.model.userAddress)
                 messageValidate += message.empty_address + "</br>";
            
            if (messageValidate.length == 0) {
                var cartId = getLocalStorage(nameStorage.cartId);
                var cart = {
                    paymentMethod : checkoutApp.model.paymentMethod,
                    user : checkoutApp.model.user,
                    userAddress : checkoutApp.model.userAddress,
                };

                //Campos a actualizar obligatorios
                let params = {cart: cart, cartId: '#'+cartId };

                if (checkoutApp.cart.couponValid) params.codeCoupon = checkoutApp.cart.couponDetails.codeCoupon;

                apiAjax("updateCart", "put", params).then(response => {
                    checkoutApp.cart = response[0].getCart;
                    checkoutApp.checkout(response[0].getCart);
                }, error => {
                    console.error("ERROR_UPDATEDCHECKOUT", error);
                });
            }
            else {
                notificationGeneral(messageValidate, {type: "notice"});
            }
        },
        resetPointsale: function (coverage, address) {
            if (coverage[0].id && address.id) {
                address["details"] = apiAddress.getDetailsAddress(address);
                //Se reinician todas la variables del local storage y cookies
                removeLocalStorage(nameStorage.cartId);
                $("a.carrito").attr("href", "/cart");

                setLocalStorage(nameStorage.cartCount, "0");
                $("a.carrito b").text("0");
                $("a.carrito .animated li").text("0");

                var checkout = JSON.parse(getLocalStorage("checkout"));
                checkout["address"] = addressApp.tmpAddress;
                delete checkout["pricePaid"];
                checkoutApp.pricePaid = 0;
                setLocalStorage("checkout", JSON.stringify(checkout));
                setLocalStorage(nameStorage.pointSale, JSON.stringify(coverage[0]));
                setLocalStorage(nameStorage.currentAddress, JSON.stringify(address));
                this.tmpCoverage = [];
                window.location.href = '/?pointsale=' + coverage[0].id;
            }
        },
        comeback: function () {
            redirect('/');
            // var id = getLocalStorage(nameStorage.cartId);
            // if (id) {
            //     window.location.href = '/cart?id=' + id;
            // }
            // else {
            //     window.location.href = '/';
            // }
        },
        hasDetails: function (product) {
            if (product.cartItemModifiers.length > 0 || product.cartItemModifierGroups.length > 0 || product.cartItemProductGroups.length > 0) {
                return true;
            }
            else {
                return false;
            }
        },
        addNewLocation: function () {
            if (this.load) {
                initGeo();
                $(".m_addres").addClass("open");
            }
        },
        trackPurchase: function (cart) {
            //TODO: el envio de los productos comprados se recomandaria  enviar en un evento diferente al purchase
            var params = {};
            var products = [];

            //---------------
            /** Analytics **/
            params[Properties.CONTENT_TYPE] = "product";
            params[Properties.CURRENCY] = "COP";
            params[Properties.CART_ID] = cart.id;
            params[Properties.PAYMENT_METHOD] = cart.paymentMethod;
            params[Properties.NUM_ITEMS] = cart.count;
            params[Properties.VALUE] = cart.total;
            params[Properties.CONSUMER_ADDRESSES] = cart.consumerAddress;
            params[Properties.CONTENT_IDS] = [];
            if (cart.deliveryCost) params[Properties.DELIVERY_COST] = cart.deliveryCost;
            if (cart.deliveryCostPickup) params[Properties.DELIVERY_COST_PICKUP] = cart.deliveryCostPickup;
            if (cart.comment) params[Properties.MESSAGE] = cart.comment;
            if (cart.coupon) params[Properties.COUPON] = cart.coupon;
            if (cart.costCoupon) params[Properties.COST_COUPON] = cart.costCoupon;
            if (cart.dateSchedule) params[Properties.DATE_SCHEDULE] = cart.dateSchedule;
            if (cart.dateSchedule) params[Properties.DATE_PICKUP] = cart.datePickup;

            for (var items of cart.items) {
                var itemParams = Analytics.setUpItemParams({}, items);
                params[Properties.CONTENT_IDS].push(items.id);
                Analytics.track(EVENTS.ITEM_PURCHASE, itemParams);
            }

            Analytics.track(EVENTS.PURCHASE, params);
            /** **/
        },
    }
});

/**
 * componente de entrega
 * TO_DO: puede ser global al igual que la dirección.
 * @type {Vue}
 */
var schedule = new Vue({
    el: '#modal_delivery',
    data: function () {
        return {
            datePicker: {},
            timePicker: {},
            dateSelected: "",
            timeSelected: "",
        }
    },
    methods: {
        /**
         * punto de inicio de la aplciacion
         */
        setup: function () {
            let pointSale = getPointSale();
            if (pointSale) {
                this.getSchedules(pointSale);
            } 
        },
        setCurrentSchedule: function () {
            let _this = this;
            let currentDatetime = new Date();
            let datetime = jsonParse(getLocalStorage(nameStorage.deliveryTime));
            
            if (datetime) {
                let delivery_time =  datetime.date + ' ' + datetime.time + ':00';
                if (new Date(delivery_time) > currentDatetime) {
                    checkoutApp.delivery = delivery_time;
                    setTimeout(function () {
                        _this.datePicker.set('select', datetime.date, { format: 'yyyy-mm-dd' });
                        //_this.datePicker.set('min', 1);
                        //_this.datePicker.set('max', 5);
                        // _this.timePicker.set('select', datetime.time, { format: 'HH:i' });
                    });
                }
            }
        },
        // http://amsul.ca/pickadate.js/api/
        getSchedules: function (coverage) {
            if (Object.keys(coverage).length > 0) {
                let _this = this;
                let service = coverage.services[0].code;

                var daysInactive = [];
                if (coverage.schedules.length > 0) {
                    daysInactive = coverage.schedules[0]["daysInactive"];
                }
     
                var calcHeightPickerTime = function () {
                    var resp_height = "10px";
                    if (coverage && coverage[0].result 
                        && typeof coverage[0].result.schedules !== "undefined" 
                        && coverage[0].result.schedules.length > 0) {
                        var list_hours = coverage[0].result.schedules[0]["hoursAvailable"];
                        var num_hours = list_hours.length;
                        if (num_hours <= 7){
                            var calc_height = (num_hours * 33) + 150;
                            resp_height = calc_height + "px";
                        }
                    }
                    return resp_height;
                };

                var proccessHours = function(coverage){
                    var hours = [true];
                
                    if (coverage && coverage.schedules.length > 0) {
                        var list_hours = coverage.schedules[0]["hoursAvailable"];
                        for (var i=0; i < list_hours.length; i++) {
                            var start_hour = list_hours[i].start;
                            start_hour = start_hour.split(":");
                            hours.push([parseInt(start_hour[0]), parseInt(start_hour[1])]);
                        }
                    }
                    return hours;
                };
    

                var getNewCoverageHours = function (datetime) {

                    var datetime_dict = {
                        date: datetime,
                        time: "00:00:00"
                    };

                    apiAddress.coverage({
                        "latitude": addressApp.address.location.coordinates[1],
                        "longitude": addressApp.address.location.coordinates[0]
                    }, datetime_dict).then((new_coverage) => {
                        coverage = new_coverage;
                        var hoursToPickerTime = proccessHours(coverage[0].result);
                        var picker = $('.timepicker').pickatime('picker');
                        picker.set('disable', true);
                        picker.set('disable', hoursToPickerTime);
                    });
                };

                //date
                var $inputDate = $('.datepicker').pickadate({
                    showMonthsShort: true,
                    min: new Date(),
                    hiddenName: true,
                    disable: daysInactive,
                    format:"dddd, dd, yyyy",
                    formatSubmit:"yyyy-mm-dd",
                    selectMonths: false,
                    selectYears: false,
                    container:"#picker-inout",
                    onClose: function(context) {
                        _this.dateSelected = _this.datePicker.get('select', 'yyyy-mm-dd');
                        //console.log(_this.dateSelected);
                        getNewCoverageHours(_this.dateSelected);
                    }
                });

                var hoursCurrent = proccessHours(coverage);
                //console.log("hoursCurrent", hoursCurrent);

                //time
                var $inputTime =  $('.timepicker').pickatime({
                    container:"#timer-inout",
                    format: 'HH:i',
                    formatSubmit: 'HH:i',
                    hiddenName: true,
                    disable: hoursCurrent,
                    interval: 30,
                    klass: {
                        holder: 'picker__holder',
                        disabled: 'picker__list-item--disabled hide'
                    },
                    onOpen: function() {    
                        var new_height = calcHeightPickerTime();
                        $("#startTime_root .picker__holder").css("margin-top", new_height);
                    },
                    onSet: function(context) {
                        _this.timeSelected = _this.timePicker.get('select', 'HH:i');
                    }
                });

                _this.timePicker = $inputTime.pickatime('picker');
                _this.datePicker = $inputDate.pickadate('picker');
                _this.setCurrentSchedule();
                    
            }
            else {
                notificationGeneral("NO EXISTE INFORMACIÓN");
            } 
        },
        setSchedule: function () {
            if (this.dateSelected && this.timeSelected){
                let currentAddress = jsonParse(getLocalStorage(nameStorage.currentAddress));
                let datetime = {date: this.dateSelected, time: this.timeSelected};

                if (currentAddress) {
                    apiAddress.coverage({
                        "latitude": currentAddress.location.coordinates[1],
                        "longitude": currentAddress.location.coordinates[0]
                    }, datetime).then((coverage) => {
                        //Sin cobertura
                        if (Object.keys(coverage[0].result).length === 0) {
                            notificationGeneral(message.coverage_out, {type: "notice"});
                        } else {
                            //punto de venta cerrado
                            if (!coverage[0].result.isOpen) {
                                notificationGeneral(message.closed_business_point + ' ('+coverage[0].result.name+')', {type: "notice"});
                            }
                            else {
                                let delivery_time =  datetime.date + ' ' + datetime.time + ':00';
                                setLocalStorage(nameStorage.deliveryTime, JSON.stringify(datetime));
                                checkoutApp.delivery = delivery_time;
                                notificationGeneral("Fecha de entrega actualizada correctamente");
                                $("#close").click();
                            }
                        }
                    }).catch( function (error) {
                        notificationGeneral(message.error , {type: "error"});
                    });
                }
            }
            else {
                notificationGeneral("Faltan parámetros fecha u hora", {type:"notice"})
            }
        }
    }
});

let addressApp = new Vue({
    el: '#addresses',
    data: function () {
        return {
            "address": {}, 
            "addresses": [], 
            "tmpAddress": {}
        }
    },
    methods: {
        setup: function () {
            var currentAddress = jsonParse(getLocalStorage(nameStorage.currentAddress));
            var tmpAddress = jsonParse(getLocalStorage(nameStorage.tmpAddress));

            if (currentAddress) {
                this.address = currentAddress;
                checkoutApp.model.userAddress = currentAddress["@rid"];
                checkoutApp.address = currentAddress;
            }
            else if (tmpAddress && !currentAddress) {

                var user = jsonParse(getLocalStorage(nameStorage.consumer));
                //Agrega al usuario la dirección temporal
                apiAddress.updateAddress(user["rid"], tmpAddress["@rid"]).then(response => {
                    this.addresses = response;
                    removeLocalStorage(nameStorage.tmpAddress);
                    addressApp.changeAddress(response[0]);
                    //checkoutApp.model.userAddress = response[response.length-1]["@rid"];
                    //checkoutApp.address = response[response.length-1];
                    //setLocalStorage(nameStorage.currentAddress, JSON.stringify(response[response.length-1]));
                                         
                }, function (error) {
                    console.log("Error al guardar dirección temporal");
                });
            }

            this.getAddress();
        },
        OpenModalAddress: function () {
            $(".close").click();
            typeService.setup(); // Modal de dirección
        },
        getAddress: function () {
            var user = jsonParse(getLocalStorage(nameStorage.consumer));
            if (user && user["rid"]) {

                apiAjax("getAddress", "post", {"consumer": user['rid']}).then((response) => {
                    this.addresses = response;

                    var checkout = jsonParse(getLocalStorage(nameStorage.checkout));
                    if (checkout && checkout["address"]) {
                        for (var address of this.addresses) {
                            if (checkout["address"]["@rid"] == address["@rid"]) {
                                checkoutApp.address = address;
                                //TO-DO: inicializar dirección en carrito
                                //checkoutApp.cart.consumerAddress = add.id;
                            }
                        }
                        
                   }

                    
                }, function (error) {
                    console.error("ERROR_GETADDRERSS", error); 
                });

            }
            else {
                console.error("ERROR_USER", error);
            }

            // if (consumer_id) {
            //     apiAjax("getAddress", "post", {"consumer": consumer_id}).then(data => {
            //         var checkout;
            //         if (getLocalStorage("checkout")) {
            //             checkout = JSON.parse(getLocalStorage("checkout"));
            //         }

            //         this.addresses = data;
            //         if (checkout && checkout["address"]) {
            //             for (var add of this.addresses) {
            //                 if (add.id === checkout["address"].id) {
            //                     checkoutApp.address = add;
            //                     checkoutApp.cart.consumerAddress = add.id;
            //                 }
            //             }
            //         }
            //     }, error => {
            //         console.error("ERROR_GETADDRESS", error);
            //     });
            // }
        },
         /**
         * Indica si una dirección esta seleccionada
         */
        isSelected (address) {
            if (this.address && this.address["@rid"]) {                
                return this.address['@rid'] === address['@rid'];
            }
            else {
                return false;
            }
        },
        /**
         * Cambia la direccón y comprueba la cobertura de esta.
         * @param address :: object :: dirrección guardada.
         */
        changeAddress: function (address) {
            var typeService = jsonParse(getLocalStorage(nameStorage.service));
            if (typeService && typeService["@rid"]) {
    
                var currentAddress = jsonParse(getLocalStorage(nameStorage.currentAddress));
                if (currentAddress && (currentAddress["@rid"] === address["@rid"])) {
                    // console.log("DESELECTIONAADO");
                    // removeLocalStorage(nameStorage.currentAddress);
                    // removeLocalStorage(nameStorage.pointSale);
                    // this.addressSelect = {};
                  
                }
                else {
                    var pointSale = jsonParse(getLocalStorage(nameStorage.pointSale));

                    var datetime = null;
                    if (typeService.code == '3') {
                        datetime = jsonParse(getLocalStorage(nameStorage.deliveryTime));
                    }
                    
                    apiAddress.coverage({
                        "latitude": address.location.coordinates[1],
                        "longitude": address.location.coordinates[0]
                    }, datetime).then((coverage) => {
                        //Sin cobertura
                        if (Object.keys(coverage[0].result).length === 0) {
                            
                            /** Analytics **/
                            var paramsCoverage = {};
                            paramsCoverage[Properties.ADDRESS_CITY] = address.city;
                            paramsCoverage[Properties.ADDRESS] = address.address;
                            paramsCoverage[Properties.ADDRESS_DESCRIPTION] = address.description;
                            paramsCoverage[Properties.ADDRESS_LATITUDE] = address.location.coordinates[1];
                            paramsCoverage[Properties.ADDRESS_LONGITUDE] = address.location.coordinates[0];
                            Analytics.track(EVENTS.OUT_OF_COVERAGE, paramsCoverage);
                            /** **/
        
                            notificationGeneral(message.coverage_out, {type:"notice"});
                        } else {
                            //address["details"] = apiAddress.getDetailsAddress(address);
                            // Vue.set(accountAddress, "tmpAddress", address); 
                            // Vue.set(accountAddress, "tmpCoverage", coverage);
        
                            //punto de venta cerrado
                            if (!coverage[0].result.isOpen) {
                                //this.addressSelect = jsonParse(getLocalStorage(nameStorage.currentAddress));
                                notificationGeneral(message.closed_business_point + ' ('+coverage[0].result.name+')', {type: "notice"});
                                return;
                            }
                            //Cambio de punto de venta
                            else if (pointSale && (coverage[0].result.rid !== pointSale['rid'])) {
                                //this.addressSelect = this.tmpAddress;
                                // notificationFive(message.reset_address + ' ('+coverage[0].result.name+')', true);
                                // return;
                                resetNotification.setup(address, coverage, false);
                            }
                            else {
                                checkoutApp.model.userAddress = address["@rid"];
                                checkoutApp.address = address;
                                addressApp.address = address;
                                setLocalStorage(nameStorage.currentAddress, JSON.stringify(address));
                                headerApp.setup();
                                $(".close").click();
                            }
                        }
                    }, function (error) {
                        console.log("error consultando la cobertura", error);
                        element_sel.stopLoading();
                    });
                }
            }
            else{
                console.log("NO tiene tipo de servicio");
            }
        },
        addAddress: function (address) {
            this.addresses.push(address);
            checkoutApp.addresses.push(address);
            this.changeAddress(address);
        },
        createAddress: function (address) {
            apiAddress.create(address).then(address => {
                // if (address) {
                //     address[0]["details"] = apiAddress.getDetailsAddress(address[0]);
                //     setLocalStorage(nameStorage.currentAddress, JSON.stringify(address[0]));
                //     checkoutApp.cart.consumerAddress = address[0].id;
                //     removeLocalStorage(nameStorage.tmpAddress);
                //     checkoutApp.setup();
                // }

            }, error => {
                console.log("CREATEDADDRESS-ERROR", error);
            });
        }
    }

});


// function reset() {
//     checkoutApp.resetPointsale(checkoutApp.tmpCoverage, addressApp.tmpAddress);
// }

// function closeReset() {
//     var currentAddress = JSON.parse(getLocalStorage(nameStorage.currentAddress));
//     checkoutApp.address = currentAddress;
//     addressApp.address = currentAddress;
// }

$('.click').click(function () {
    if ($(this).hasClass('open')) {
        $(this).removeClass('open');
        $(this).parent('article').find('.bgAditionals').slideUp();
    } else {
        $(this).addClass('open');
        $(this).parent('article').find('.bgAditionals').slideDown();
    }
});
