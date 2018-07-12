$(window).load(function () {
    if (window.location.pathname === "/") {
        let pointSale = getPointSale();
        if (!pointSale) {
            typeService.setup();
        }
    }
});

let typeService = new Vue({
    el: '#typeService',
    data: {
        services: [],
        service_selected: "",
        login: false,
    },
    methods: {
        setup: function () {

            let user = jsonParse(getLocalStorage(nameStorage.consumer));
            if (user && user["rid"]) {
                this.login = true;
            }

            let service = jsonParse(getLocalStorage(nameStorage.service));
            if (service) {
                this.service_selected = service.code;
            }

            this.getServices();
        },
        getServices: function () {
            apiAjax("service", "get", {}).then((response) => {
                this.services = response;
                modalAddress.initGeo();
                
                /*
                 * Para saltarse el tipo de servico se agrego la entrada al 
                 * directa modal de dirección, se quito la entrada al modal de 
                 * tipo de servicio y se ejecuto la función de typeService.
                 */

                typeService.selectService($('#service-1'));
                modalAddress.setup();
            }, function (error) {
                console.error("ERROR_GETSERVICES", error);
            });
        },
        selectService: function (service) {
            if (service && service.name) {
                this.service_selected = service.code;
                setLocalStorage(nameStorage.service, JSON.stringify(service));
                notificationGeneral("Servicio " + service.name + ' actualizado correctamente');
                switch (service.code) {
                    case '1':
                        removeLocalStorage(nameStorage.deliveryTime);
                        modalAddress.setup();
                        break;
                    case '3':
                        modalAddress2.setup();
                        break;
                    default:
                        break;
                }
            }
        },
        redirectLogin: function () {
            let pathname = window.location.pathname;
            return "/login?next=" + pathname;
        },
    },
    computed: {
        listService: function () {
            var services = this.services;
            for (var service of services) {
                service.classObject = {};
                switch (service.code) {
                    //domicilio
                    case '1':
                        service.classObject.domiciio = true;
                        break;
                        //recogida    
                    case '3':
                        service.classObject.big = true;
                        break;
                }
                service.classObject.active = this.service_selected === service.code;
            }
            return services;
        }
    }

});


/**
 * funcionalidad de modal de dirección
 * @type {Vue}
 */
var modalAddress = new Vue({
    el: '#modalAdress',
    data: {
        show: false,
        login: false,
        show_address_form: false,
        show_select_address: false,
        typeService: {},
        date: "",
        time: "",

        show_customer_addresses: false,
        is_product_section: true,
        costumer_addresses: [],
        selected_address: {},
        show_map: false,
        last_step: false,
        msg_map: "",
        selected: "Kra",
        street: "",
        number_one: "",
        number_two: "",
        place: "",
        city: [],
        selectedCity: "",
        colony: "",
        country: "colombia",
        latLng: {},
        map: {},
        market: {},
        location: {},
        pointSale: {},
        validate: false,
        addressUrl: "",
        image: "/generic/images/market.png",
        title: "ESTABLECER DIRECCIÓN",
        pathname: "",
        checking: false,
        address: {}
    },
    methods: {
        changeService: function () {
            setTimeout(() => {
                typeService.setup();
            });

        },
        setup: function () {
            this.pathname = window.location.pathname;

            this.login = false;
            this.show_map = false;
            this.addressUrl = "";
            this.show_address_form = false;
            this.show_select_address = false;

            var typeService = jsonParse(getLocalStorage(nameStorage.service));
            if (typeService && typeService.code) {
                this.typeService = typeService;
            }

            var user = jsonParse(getLocalStorage(nameStorage.consumer));
            if (user && user["rid"]) {
                this.login = true;

                apiAjax("getAddress", "post", {"consumer": user['rid']}).then((response) => {
                    this.costumer_addresses = response;

                    if (this.pathname == '/' || this.pathname.includes("/products") || this.pathname.includes("/details") || this.pathname.includes("/categories") || this.pathname.includes("/address")) {
                        if (this.costumer_addresses.length > 0) {
                            this.show_select_address = true;
                            this.show_address_form = false;
                        } else {
                            this.show_select_address = false;
                            this.show_address_form = true;
                        }
                    } else if (this.pathname.includes("/address") || this.pathname.includes("/checkout")) {
                        this.show_select_address = false;
                        this.show_address_form = true;
                    }

                    setTimeout(function () {
                        $(".modalRefine").click();
                    }, 1000);


                }, function (error) {
                    console.error("ERROR_GETADDRERSS", error);
                    $(".costumer_addresses").stopLoading();
                });

            } else {
                this.show_select_address = false;
                this.show_address_form = true;

                setTimeout(function () {
                    $(".modalRefine").click();
                }, 1000);

            }

            apiAjax("cities", "get", {}).then((response) => {
                this.city = response;
                // this.selectedCity = response.length > 0 && typeof response[0].city !== "undefined" ? response[0].city : "";
            }, function (error) {
                console.error("ERROR_cities", error);
            });
        },
        toogleAddressSection: function () {
            this.show_select_address = !this.show_select_address;
            this.show_address_form = !this.show_address_form;
        },
        redirectLogin: function () {
            return "/login?next=" + this.pathname;
        },
        /**
         * Handles select address event and set address for costumer
         */
        changeCustomerAddress: function () {
            if (Object.keys(this.selected_address).length > 0) {
                $(".costumer_addresses").startLoading();

                var address = this.selected_address;
                console.log("address: ", address.location);
                var datetime = {};
                if (this.typeService && this.typeService.code == 3) {
                    if (this.date.length > 0 && this.time.length > 0) {
                        datetime.date = this.date;
                        datetime.time = this.time;
                    } else {
                        notificationGeneral(message.error_register, {type: "warning"});
                        return;
                    }

                }

                var pointSale = jsonParse(getLocalStorage(nameStorage.pointSale));
                apiAddress.coverage({
                    "latitude": address.location.coordinates[1],
                    "longitude": address.location.coordinates[0]
                }, datetime).then((coverage) => {
                    $('.preload').hide(300);
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

                        notificationGeneral(message.coverage_out + ' (' + coverage[0].result.name + ')', {type: "notice"});
                        $(".costumer_addresses").stopLoading();
                    } else {
                        //punto de venta cerrado
                        if (!coverage[0].result.isOpen) {
                            notificationGeneral(message.closed_business_point + ' (' + coverage[0].result.name + ')', {type: "notice"});
                            $(".costumer_addresses").stopLoading();
                        }
                        //Cambio de punto de venta
                        else if (pointSale && (coverage[0].result.rid !== pointSale.rid)) {
                            //this.addressSelect = this.tmpAddress;
                            resetNotification.setup(address, coverage, false);
                            //notificationFive(message.reset_address + ' ('+coverage[0].result.name+')', true);
                        } else {
                            setLocalStorage(nameStorage.pointSale, JSON.stringify(coverage[0].result));
                            setLocalStorage(nameStorage.currentAddress, JSON.stringify(address));
                            notificationGeneral(message.ok_address);
                            redirect(this.pathname, {pointSale: coverage[0].result.slug});
                        }
                    }
                }).catch(function (error) {
                    notificationGeneral(message.error, {type: "error"});
                    $(".costumer_addresses").stopLoading();
                });
            } else {
                notificationGeneral(message.error_register, {type: "warning"});
            }
        },
        /**
         * Toma de ubicacion del navegador 
         */
        initGeo: function () {
            var geo_options = {
                enableHighAccuracy: true,
                maximumAge: 0,
                timeout: 27000
            };
            $(".alertGeo").addClass("open");

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(this.setPosition, this.geo_error, geo_options);
            } else {
                console.error("Geolocation is not supported by this browser", error);
            }
        },
        /**
         * Función encargada de tomar la posición actual del usuario y empezar el proceso para convertirla en dirección
         * @param position
         */
        setPosition: function (position) {
            if (typeof position.coords !== "undefined" && typeof position.coords.latitude !== "undefined" && typeof position.coords.latitude !== "undefined") {
                var latLng = {lat: position.coords.latitude, lng: position.coords.longitude};
                this.geocode(latLng);
            } else {
                console.error("[Error] Position de usuario inválida.")
            }
        },
        /**
         * En caso de que 'navigator.geolocation.getCurrentPosition' falle, se muestra notificación de error
         * @param error
         */
        geoErrorModal: function (error) {
            //notificationGeneral("Error al cargar ubicación", {type: "warning"});
            $(".div-alertGeo").removeClass("open");
        },
        /**
         * Función encargada de convertir una posición geográfica en posibles resultados de direcciones humanizadas
         */
        geocode: function (latLng) {
            new google.maps.Geocoder().geocode({'location': latLng}, function (results, status) {
                if (status === 'OK') {
                    if (results[0] === undefined) {
                        $(".div-alertGeo").removeClass("open");
                        return;
                    } else {
                        modalAddress.formaterGeocode(results);
                    }
                }
            });
        },
        /**
         * Función encargada de convertir componentes de dirección en una dirección única humanizada
         * @param geocoder : Object :: Respuesta de geocoder inverso
         */
        formaterGeocode: function (geocoder) {
            var format_address = geocoder[0].formatted_address;
            var address = format_address.split(",");
            this.street = address[0].trim();
        },
        /**
         * Función encargada de convertir componentes de dirección en una dirección única humanizada
         * @param results
         */
        reformatAddress: function (results) {
            var routeAndStreetRegEx = /(cl. |Cra. |Av. |Troncal )/i;
            var routeMap = {
                'cl.': 'Cll',
                'cra.': 'Kra',
                'tv.': 'Trv',
                'dg.': 'Dig',
                'av.': 'Av',
                'ak.': 'Ak',
                'ac.': 'Ac',
                'cq.': 'Cq',
                'mz.': 'Mz',
                'via': 'Via'
            };
            var getEqualPart = function (str1, str2) {
                var str = '';
                var prevMatch = -1;
                for (var i = 0; i < str1.length; i++) {
                    if (str1[i] === str2[i] && prevMatch + 1 === i) {
                        str += str1[i];
                        prevMatch = i;
                    }
                }
                return str;
            };
            var components = results[0].address_components;
            var parts;
            for (var item in components) {
                var component = components[item];
                if (component.types[0] === 'route') {
                    parts = component.short_name.split(' ');
                    if (parts.length === 2) {
                        var route = parts[0].toLowerCase();
                        if (routeMap[route]) {
                            this.selected = routeMap[route];
                        }
                        //this.street = parts[1];
                        this.street = parts[0] + " " + parts[1];
                    }
                    if (parts.length > 2) {
                        var secondPart = component.short_name.replace(routeAndStreetRegEx, '');
                        var firstPart = component.short_name.replace(secondPart, '').trim().toLowerCase();
                        this.street = secondPart;
                        this.selected = routeMap[firstPart];
                    }
                }
                if (component.types[0] === 'street_number') {
                    parts = component.short_name.split('-');
                    if (parts.length === 2) {
                        if (parts[0] === parts[1]) {
                            this.number_one = parts[0];
                            this.number_two = parts[0];
                        }
                        var equalPart = getEqualPart(parts[0], parts[1]);
                        if (equalPart.length === parts[0].length) {
                            equalPart = equalPart.slice(0, -1);
                        }
                        if (equalPart.length >= 2 || parts[1].length === 3) {
                            this.number_one = equalPart;
                            this.number_two = parts[0].replace(equalPart, '');
                        } else {
                            this.number_one = parts[0];
                            this.number_two = parts[1];
                        }
                    }
                    if (parts.length === 1) {
                        this.number_one = parts[0];
                    }
                }

                if (component.types[0] === "country") {
                    this.country = component.long_name;
                }

                let position = new google.maps.LatLng(this.latLng.lat, this.latLng.lng);

                setTimeout(function () {
                    $(".div-alertGeo").removeClass("open");
                }, 1500);
            }

        },
        /**
         * muestra el modal de mapa
         */
        showMap: function (position) {
            setTimeout(() => {
                modalAddress.initialize();
                google.maps.event.trigger(this.map, 'resize');
                modalAddress.map.setCenter(position);
                modalAddress.map.setZoom(16);
                modalAddress.marker.setPosition(position);
            });
            this.show_map = true;
        },
        /* Obtiene las coordenadas (geometry) de la dirección del formulario */
        checkAddress: function () {
            this.show_address_form = false;
            this.show_select_address = false;
            this.show_map = true;
            if (this.street.length > 0 && this.selectedCity.length > 0 && this.place.length > 0) {
                //Formato de la dirección a ser buscada
                this.addressUrl = this.selectedCity + "," + this.street + (this.colony.length > 0 ? ' , ' + this.colony : '');
                apiAddress.geocodeAddress(this.addressUrl).then((response) => {
                    if (response.status === 'OK') {
                        var location = response.results[0].geometry.location;
                        this.location = {"latitude": location.lat(), "longitude": location.lng()};
                        this.showMap(location);
                    } else {
                        if (response.status === google.maps.GeocoderStatus.ZERO_RESULTS) {
                            console.log('Geocode was not successful for the following reason: ', response.status);
                            notificationGeneral(message.zero_results, {type: 'warning'});
                        } else if (response.status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                            console.log("daily for OVER_QUERY_LIMIT");
                            notificationGeneral(message.error, {type: 'error'});
                        }
                    }
                }, function (error) {
                    console.log("error comprobando la localizacíon de la dirección", error);
                    notificationGeneral("Error comprobando la localizacíon de la dirección", {type: "error"});
                });
            }
        },
        /**
         * Función encargada de confirmar la dirección ingresada por el usuario (Form o refinamiento)
         */
        confirmAddress: function () {
            if (this.street.length > 0 && this.selectedCity.length > 0
                    && this.place.length > 0 && this.location) {
                this.coverage(this.location, true);
            }
        },
        /* Verifica que las coordenadas de la dirección esten en la cobertura 
         * @param position :: objecto con latitude y longitude
         * @param isCreate :: booleano si es true crea una dirección de lo contrario solo valida
         */
        coverage(position, isCreate = false) {
            console.log("Coverage", position, isCreate);
            var pointSale = jsonParse(getLocalStorage(nameStorage.pointSale));
            var datetime = {};
            if (this.typeService && this.typeService.code == 3) {
                datetime.date = this.date;
                datetime.time = this.time;
            }
            var form_add_address = $("#form_add_address button[type=submit]");
            if (position && (position.latitude && position.longitude)) {
                apiAddress.coverage(position, datetime).then((coverage) => {
                    console.log("coveragefinal", coverage);
                    console.log("iscreated", isCreate);
                    //Se actualiza el location
                    this.location = position;
                    //Direccion a guardar
                    var tmpAddress = {
                        "name": this.selectedCity,
                        "city": this.selectedCity,
                        "description": this.place,
                        "address": this.street,
                        "location": this.location,
                        "country": this.country,
                    };
                    console.log("addres", tmpAddress);

                    if (Object.keys(coverage[0].result).length === 0) {

                        /** Analytics **/
                        var paramsCoverage = {};
                        paramsCoverage[Properties.ADDRESS_CITY] = tmpAddress.city;
                        paramsCoverage[Properties.ADDRESS] = tmpAddress.address;
                        paramsCoverage[Properties.ADDRESS_DESCRIPTION] = tmpAddress.description;
                        paramsCoverage[Properties.ADDRESS_LATITUDE] = tmpAddress.location.latitude;
                        paramsCoverage[Properties.ADDRESS_LONGITUDE] = tmpAddress.location.longitude;
                        Analytics.track(EVENTS.OUT_OF_COVERAGE, paramsCoverage);
                        /** **/

                        notificationGeneral(message.coverage_out, {type: 'warning'});
                    }
                    //Cambio de punto de venta
                    else if (pointSale && (coverage[0].result.rid !== pointSale.rid)) {
                        resetNotification.setup(tmpAddress, coverage);
                    } else {
                        if (isCreate) {
                            this.createAddress(tmpAddress, coverage);
                        } else {
                            //mostrar el mapa
                            //---------------
                            position = new google.maps.LatLng(position.latitude, position.longitude);
                            console.log("mapPosition", position);
                            this.showMap(position);
                            //-----------------
                        }
                    }
                }, function (error) {
                    this.checking = false;
                    form_add_address.stopLoading();
                    console.log("error consultando la cobertura", error);
                });
            } else {
                console.log("Parámetros inválidos")
        }

        },
        /**
         * Crea una dirección y genera el comportamiento segun el path
         * @param address :: Object
         * @param coverage :: Object 
         */
        createAddress: function (address, coverage) {
            console.log("createdAddress", address, coverage);
            var form_add_address = $("#form_add_address button[type=submit]");
            apiAddress.create(address).then((result) => {
                var user = jsonParse(getLocalStorage(nameStorage.consumer));
                //Dirección asignada al usuario
                if (user && user["rid"]) {
                    this.costumer_addresses = result;

                    if (this.pathname.includes("/address")) {
                        accountAddress.updateAddress(result);
                        form_add_address.stopLoading();
                        notificationGeneral(message.created_address);
                        $.magnificPopup.close();
                    } else if (this.pathname === "/checkout") {
                        form_add_address.stopLoading();
                        notificationGeneral(message.created_address);
                        $.magnificPopup.close();
                        addressApp.addresses.push(result[0]);
                        $(".new_dir").click();
                    } else {
                        var _msg_dict = {
                            msg: "Dirección guardada correctamente. Ahora puedes agregar productos al carrito.",
                            show: true,
                            type: "success"
                        };
                        setLocalStorage(nameStorage.showMsgSaveAddress, JSON.stringify(_msg_dict));
                        setLocalStorage(nameStorage.pointSale, JSON.stringify(coverage[0].result));
                        setLocalStorage(nameStorage.currentAddress, JSON.stringify(result[0]));
                        $.magnificPopup.close();
                        urlPointsale(coverage[0].result.slug, this.pathname);
                    }
                }
                //Dirección temporal
                else {
                    var _msg_dict = {
                        msg: "Dirección guardada correctamente. Ahora puedes agregar productos al carrito.",
                        show: true,
                        type: "success"
                    };
                    setLocalStorage(nameStorage.showMsgSaveAddress, JSON.stringify(_msg_dict));
                    setLocalStorage(nameStorage.pointSale, JSON.stringify(coverage[0].result));
                    setLocalStorage(nameStorage.tmpAddress, JSON.stringify(result[0]));
                    $.magnificPopup.close();
                    urlPointsale(coverage[0].result.slug, this.pathname);
                }
            }, function (error) {
                form_add_address.stopLoading();
                console.log("error agregando la direccion", error);
                notificationGeneral("error agregando la direccion", {type: "error"});
            });
        },
        /**
         * inicializar la opciones del mapa
         */
        initialize: function () {
            var centro = new google.maps.LatLng(11.011668, -74.840412);
            var myLatlng = new google.maps.LatLng(11.011668, -74.840412);
            var mapOptions = {
                center: centro,
                zoom: 16,
                scrollwheel: false,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
            };

            this.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
            var contentString = 'Es tu ubicación ? - Muéveme para refinar';//'Muéveme!';

            this.marker = new google.maps.Marker({
                map: this.map,
                animation: google.maps.Animation.DROP,
                position: myLatlng,
                icon: this.image,
                draggable: true
            });
            google.maps.event.addListener(this.marker, 'click', this.toggleBounce);

            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });

            google.maps.event.addListener(this.marker, 'click', function () {
                infowindow.open(modalAddress.map, modalAddress.marker);
            });


            /**
             * evento de mover el market
             */
            google.maps.event.addListener(this.marker, 'dragend', function (event) {
                modalAddress.location = {"latitude": event.latLng.lat(), "longitude": event.latLng.lng()};
            });

            infowindow.open(this.map, this.marker);

            /**
             * evento de click en el mapa
             */
            google.maps.event.addListener(this.map, 'click', function (event) {
                modalAddress.marker.setPosition(event.latLng);
                modalAddress.map.setCenter(event.latLng);
                modalAddress.location = {"latitude": event.latLng.lat(), "longitude": event.latLng.lng()};
            });
        },
        /**
         * callback de tocar el market
         */
        toggleBounce: function () {
            if (this.marker.getAnimation() !== null) {
                this.marker.setAnimation(null);
            } else {
                this.marker.setAnimation(google.maps.Animation.BOUNCE);
            }
        },
        /**
         * Función encargada de regresar al formulario de modalAddress
         */
        goToForm: function () {
            this.setup();
        }
    },
    computed: {
        listService: function () {
            var services = this.services;
            for (var service of services) {
                service.classObject = {};
                switch (service.name) {
                    case 'Recogida':
                        service.classObject.big = true;
                        break;
                    case 'Domicilio':
                        service.classObject.domiciio = true;
                        break;
                }
                service.classObject.active = this.service_selected == service.name;
            }

            return services;
        }
    }
});

/**
 * métodos de api de direcciones
 * @type {Vue}
 */
var apiAddress = new Vue({
    methods: {
        /**
         * comprueba la cobertura para una ubicacion (lat,lng)
         * @param location :: objeto con latitude y longitude 
         * @param datetime :: objeto con fecha y hora
         * @returns {Promise}
         */
        coverage: function (location, datetime = null) {
            if (location) {
                var params = {location: location};

                if (datetime && (datetime.date && datetime.time)) {
                    params.datetime = datetime
                }

                var typeService = jsonParse(getLocalStorage(nameStorage.service));
                if (typeService && typeService["@rid"]) {
                    params.typeServiceId = typeService["@rid"];
                }
                return new Promise((resolve, reject) => {
                    apiAjax("coverage", "post", params).then((coverage) => {
                        resolve(coverage);
                    }, function (error) {
                        console.log("error coverage", error);
                        reject(error);
                    })
                });
        }
        },
        /**
         * Obtiene la ubicacion a partir de una dirección
         */
        geocodeAddress: function (addressSearch) {
            return new Promise((resolve, reject) => {
                new google.maps.Geocoder().geocode({'address': addressSearch, 'region': 'CO'}, function (results, status) {
                    resolve({"results": results, "status": status});
                }, function (error) {
                    console.log("error geocodeAddress", error);
                    reject(error);
                });
            });
        },
        /**
         * crea una direccion
         * @param address :: address object
         * @returns {Promise}
         */
        create: function (address) {
            let user = jsonParse(getLocalStorage(nameStorage.consumer));
            let params = {};
            params.address = address;
            if (user && user["rid"]) {
                params.userId = user["rid"].replace("#", "");
            }
            return new Promise((resolve, reject) => {
                apiAjax("address", "post", params).then((response) => {
                    var data = response[response.length - 1];

                    /** Analytics **/
                    var params = {};
                    params[Properties.ADDRESS_ID] = data["@rid"];
                    params[Properties.ADDRESS_NAME] = data.name;
                    params[Properties.ADDRESS_CITY] = data.city;
                    params[Properties.ADDRESS] = data.address;
                    params[Properties.ADDRESS_DESCRIPTION] = data.description;
                    params[Properties.ADDRESS_LATITUDE] = data.location.coordinates[1];
                    params[Properties.ADDRESS_LONGITUDE] = data.location.coordinates[0];
                    Analytics.track(EVENTS.ADDRESS, params);

                    resolve(response);
                }, function (error) {
                    console.log("error addAddress", error);
                    reject(error);
                });
            });
        },
        /**
         * elimina la dirección
         * @param id :: identificador
         */
        delete: function (userId, addressId) {
            return new Promise((resolve, reject) => {
                if (userId && addressId) {
                    apiAjax("address", "delete", {"userId": userId, "addressId": addressId}).then((response) => {
                        resolve(response);
                    }, function (error) {
                        console.log("error eliminando", error);
                        reject(error);
                    });
                } else {
                    reject("Mandatory parameters")
                }
            });
        },
        updateAddress: function (userId, addressId) {
            return new Promise((resolve, reject) => {
                if (userId && addressId) {
                    apiAjax("address", "put", {"userId": userId, "addressId": addressId}).then((response) => {
                        resolve(response);
                    }, function (error) {
                        console.log("error actualizando direcciónn", error);
                        reject(error);
                    });
                } else {
                    reject("Mandatory parameters")
                }
            });
        },
        /**
         * particiona la dirección con respecto al detalle en el home
         * */
        getDetailsAddress: function (tmpAddress) {
            let params = {
                "city": "",
                "selected": "",
                "street": "",
                "number_one": "",
                "number_two": "",
                "place": ""
            };

            if (tmpAddress) {
                let components = tmpAddress.address.split('#');
                params["place"] = tmpAddress.description;
                params["city"] = tmpAddress.city;
                if (components) {
                    if (components[0]) {
                        let routeMap = components[0].split(" ");
                        params  ["selected"] = routeMap[0];
                        params ["street"] = routeMap[1];
                    }

                    if (components[1]) {
                        components[1] = components[1].replace(/ /g, '');
                        let numbers = components[1].split("-");
                        params  ["number_one"] = numbers[0];
                        params ["number_two"] = numbers[1];
                    }
                }
            }

            return params;
        }
    }
});


/**
 * funcionalidad dirección BigParty
 */
var modalAddress2 = new Vue({
    el: '#modalAdress2',
    data: {
        show: false,
        login: false,

        show_address: false,
        show_select: false,

        show_address_form: false,
        show_address_datetime: false,

        show_select_form: false,
        show_select_datetime: false,

        show_dateTime: false,
        typeService: {},
        date: "",
        time: "",

        picker: "",
        timepicker: "",
        tmpCoverage: "",

        show_customer_addresses: false,
        is_product_section: true,
        costumer_addresses: [],
        selected_address: {},
        show_map: false,
        last_step: false,
        msg_map: "",
        selected: "Kra",
        street: "",
        number_one: "",
        number_two: "",
        place: "",
        city: [],
        selectedCity: "",
        colony: "",
        country: "mexico",
        latLng: {},
        map: {},
        market: {},
        location: {},
        pointSale: {},
        validate: false,
        addressUrl: "",
        image: "/generic/images/market.png",
        title: "ESTABLECER DIRECCIÓN",
        pathname: "",
        checking: false,
        address: {}
    },
    methods: {
        getSchedules: function (coverage) {

            if (typeof coverage !== "undefined" && coverage.length > 0) {

            } else if (this.tmpCoverage) {
                coverage = this.tmpCoverage;
            }

            var calcHeightPickerTime = function () {
                var resp_height = "250px";
                if (coverage[0].result && typeof coverage[0].result.schedules !== "undefined" && coverage[0].result.schedules.length > 0) {
                    var list_hours = coverage[0].result.schedules[0]["hoursAvailable"];
                    var num_hours = list_hours.length;
                    if (num_hours <= 7) {
                        var calc_height = (num_hours * 33) + 150;
                        resp_height = calc_height + "px";
                    }
                }
                return resp_height;
            };

            var hoursToPickerTime = function (coverage) {
                var resp = [true];
                if (coverage[0].result && typeof coverage[0].result.schedules !== "undefined" && coverage[0].result.schedules.length > 0) {
                    var list_hours = coverage[0].result.schedules[0]["hoursAvailable"];
                    for (var i = 0; i < list_hours.length; i++) {
                        var start_hour = list_hours[i].start;
                        start_hour = start_hour.split(":");
                        resp.push([parseInt(start_hour[0]), parseInt(start_hour[1])]);
                    }
                }
                return resp;
            };

            var proccessHours = function (coverage) {
                var hours = [true];

                if (coverage && coverage.schedules.length > 0) {
                    var list_hours = coverage.schedules[0]["hoursAvailable"];
                    for (var i = 0; i < list_hours.length; i++) {
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
                    "latitude": modalAddress2.location.latitude,
                    "longitude": modalAddress2.location.longitude
                }, datetime_dict).then((new_coverage) => {
                    coverage = new_coverage;
                    //console.log(coverage);
                    var hoursToPickerTime = proccessHours(coverage[0].result);
                    var picker = $('.timepicker').pickatime('picker');
                    picker.set('disable', true);
                    picker.set('disable', hoursToPickerTime);
                    console.log(hoursToPickerTime);
                });
            };

            this.show_map = false;

            var daysInactive = [];

            //console.log("coverage schedules", coverage);

            if (coverage[0].result.schedules.length > 0) {
                daysInactive = coverage[0].result.schedules[0]["daysInactive"];
            }

            //console.log(daysInactive);

            //date
            var $inputDate = $('.datepicker').pickadate({
                showMonthsShort: true,
                min: new Date(),
                hiddenName: true,
                disable: daysInactive,
                format: "dddd, dd, yyyy",
                formatSubmit: "yyyy-mm-dd",
                selectMonths: false,
                selectYears: false,
                container: "#picker-inout",
                onClose: function (context) {
                    modalAddress2.date = modalAddress2.picker.get('select', 'yyyy-mm-dd');
                    getNewCoverageHours(modalAddress2.date);
                    // modalAddress2.timepicker.clear();
                }
            });

            var $inputTime = $('.timepicker').pickatime({
                container: "#timer-inout",
                format: 'HH:i',
                formatSubmit: 'HH:i',
                hiddenName: true,
                disable: [true],
                klass: {
                    holder: 'picker__holder',
                    disabled: 'picker__list-item--disabled hide'
                },
                onStart: function () {
                    // console.log('Hello there :)')
                },
                onRender: function () {
                    // console.log('Whoa.. rendered anew')
                },
                onOpen: function () {
                    // console.log('Opened up')
                    /*var new_hours = hoursToPickerTime(coverage);
                     modalAddress2.timepicker.set('disable', true);
                     modalAddress2.timepicker.set("disable", new_hours);*/

                    var new_height = calcHeightPickerTime();
                    //console.log("NEW HEIGHT: ", new_height);
                    $("#startTime_root .picker__holder").css("margin-top", new_height);

                },
                onSet: function (context) {
                    // console.log('Just set stuff TIMEPICKER:', context, modalAddress2.timepicker.get('select'));
                    modalAddress2.time = document.getElementById("startTime").value;
                }
            });

            this.picker = $inputDate.pickadate('picker');
            this.timepicker = $inputTime.pickatime('picker');
        },
        changeService: function () {
            setTimeout(() => {
                typeService.setup();
            });

        },
        setup: function () {
            this.pathname = window.location.pathname;

            this.login = false;
            this.show_address = false;
            this.show_select = false;
            this.show_address_form = false;
            this.show_address_datetime = false;
            this.show_select_form = false;
            this.show_select_datetime = false;
            this.addressUrl = "";

            var typeService = jsonParse(getLocalStorage(nameStorage.service));
            if (typeService && typeService.code) {
                this.typeService = typeService;
            }

            var user = jsonParse(getLocalStorage(nameStorage.consumer));
            if (user && user["rid"]) {
                //Usuario logueado
                this.login = true;
                apiAjax("getAddress", "post", {"consumer": user['rid']}).then((response) => {
                    this.costumer_addresses = response;

                    if (this.pathname == '/' || this.pathname.includes("/products") || this.pathname.includes("/details") || this.pathname.includes("/categories") || this.pathname.includes("/address")) {
                        if (this.costumer_addresses.length > 0) {
                            this.show_select = true;
                            this.show_select_form = true;
                            this.show_select_datetime = false;

                            this.show_address = false;
                        } else {
                            this.show_select = false;
                            this.show_address = true;
                            this.show_address_form = true;
                        }
                    } else if (this.pathname.includes("/address") || this.pathname.includes("/checkout")) {
                        this.show_select = false;
                        this.show_address = true;
                        this.show_address_form = true;
                    }

                    setTimeout(function () {
                        $(".modalRefine2").click();
                    }, 1000);


                }, function (error) {
                    console.error("ERROR_GETADDRERSS", error);
                    $(".costumer_addresses").stopLoading();
                });

            } else {
                //Usuario invitado
                this.show_select = false;

                this.show_address = true;
                this.show_address_form = true;
                this.show_address_datetime = false;

                setTimeout(function () {
                    $(".modalRefine2").click();
                }, 1000);

            }

            apiAjax("cities", "get", {}).then((response) => {
                this.city = response;
                // this.selectedCity = response.length > 0 && typeof response[0].city !== "undefined" ? response[0].city : "";
            }, function (error) {
                console.error("ERROR_cities", error);
            });
        },
        toogleAddressSection: function () {
            this.show_select = !this.show_select;
            this.show_address = !this.show_address;
            this.show_address_form = true;
            this.show_address_datetime = false;
        },
        redirectLogin: function () {
            return "/login?next=" + this.pathname;
        },
        /**
         * Handles select address event and set address for costumer
         */
        changeCustomerAddress: function () {

            console.log("Cambiando dirección...");

            if (Object.keys(this.selected_address).length > 0) {
                $(".costumer_addresses").startLoading();

                var address = this.selected_address;
                var dateDefault = false;

                console.log("address: ", address);

                var datetime;
                if (this.typeService && this.typeService.code == 3) {
                    if (this.date.length > 0 && this.time.length > 0) {
                        datetime = {};
                        datetime.date = this.date;
                        datetime.time = this.time;
                    }
                } else {
                    var dateText = $("input[name='bday_submit']").val() + " " + document.getElementById("startTime").value;
                    dateText = dateText.trim();
                    if (dateText != "undefined") {
                        //console.log(dateText);

                        var getDateFunction = function (date) {
                            var d = date.getDate();
                            var m = date.getMonth() + 1; //Month from 0 to 11
                            var y = date.getFullYear();
                            return '' + y + '-' + (m <= 9 ? '0' + m : m) + '-' + (d <= 9 ? '0' + d : d);
                        };

                        var getTimeFunction = function (date) {
                            var hours = date.getHours();
                            var minutes = date.getMinutes();
                            return  (hours <= 9 ? '0' + hours : hours) + ':' + (minutes <= 9 ? '0' + minutes : minutes);
                        };

                        var datetimePicker = new Date(dateText);

                        datetime = {};
                        datetime.date = getDateFunction(datetimePicker);
                        datetime.time = getTimeFunction(datetimePicker);
                        dateDefault = false;
                        console.log("date---->");
                        //console.log( datetime );
                    }


                    if (!datetime) {
                        datetime = {};
                        datetime.date = "2018-05-23";
                        datetime.time = "15:00";
                        dateDefault = true;
                        console.log("burn date: ", datetime);
                    }

                    console.log("datetime: ", datetime);

                }

                var pointSale = jsonParse(getLocalStorage(nameStorage.pointSale));

                console.log("pointSale: ", pointSale);

                apiAddress.coverage({
                    "latitude": address.location.coordinates[1],
                    "longitude": address.location.coordinates[0]
                }, datetime).then((coverage) => {
                    $('.preload').hide(300);
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
                        notificationGeneral(message.coverage_out, {type: "notice"});
                        $(".costumer_addresses").stopLoading();
                    } else {
                        //punto de venta cerrado
                        if (!coverage[0].result.isOpen && datetime) {
                            notificationGeneral(message.closed_business_point + ' (' + coverage[0].result.name + ')', {type: "notice"});
                            $(".costumer_addresses").stopLoading();
                        }
                        //Cambio de punto de venta
                        else if (pointSale && (coverage[0].result.rid !== pointSale.rid)) {
                            //this.addressSelect = this.tmpAddress;
                            resetNotification.setup(address, coverage, false);
                            //notificationFive(message.reset_address + ' ('+coverage[0].result.name+')', true);
                        } else {
                            // setLocalStorage(nameStorage.pointSale, JSON.stringify(coverage[0].result));
                            // setLocalStorage(nameStorage.currentAddress, JSON.stringify(address));
                            // notificationGeneral(message.ok_address);
                            //redirect(this.pathname, {pointSale: coverage[0].result.slug });

                            this.show_address = false;
                            this.show_select = true;
                            this.show_select_form = false;
                            this.show_select_datetime = true;
                            this.show_map = false;


                            if (datetime && datetime.time && datetime.date) {
                                setLocalStorage(nameStorage.deliveryTime, JSON.stringify(datetime));
                                setLocalStorage(nameStorage.pointSale, JSON.stringify(coverage[0].result));
                                setLocalStorage(nameStorage.currentAddress, JSON.stringify(address));
                                notificationGeneral(message.ok_address);
                                if (!dateDefault) {
                                    redirect(this.pathname, {pointSale: coverage[0].result.slug});
                                }
                                console.log("entro");
                            } else {
                                console.log("coverage", coverage);
                                modalAddress2.location.latitude = address.location.coordinates[1];
                                modalAddress2.location.longitude = address.location.coordinates[0];
                                this.getSchedules(coverage);
                            }

                        }
                    }
                }).catch(function (error) {
                    console.log(error);
                    notificationGeneral(message.error, {type: "error"});
                    $(".costumer_addresses").stopLoading();
                });
            } else {
                notificationGeneral(message.error_register, {type: "warning"});
            }
        },
        /**
         * Toma de ubicacion del navegador 
         */
        initGeo: function () {
            var geo_options = {
                enableHighAccuracy: true,
                maximumAge: 30000,
                timeout: 27000
            };
            $(".alertGeo").addClass("open");

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(this.setPosition, this.geo_error, geo_options);
            } else {
                console.error("Geolocation is not supported by this browser", error);
            }
        },
        /**
         * Función encargada de tomar la posición actual del usuario y empezar el proceso para convertirla en dirección
         * @param position
         */
        setPosition: function (position) {
            if (typeof position.coords !== "undefined" && typeof position.coords.latitude !== "undefined" && typeof position.coords.latitude !== "undefined") {
                var latLng = {lat: position.coords.latitude, lng: position.coords.longitude};
                this.geocode(latLng);
            } else {
                console.error("[Error] Position de usuario inválida.")
            }
        },
        /**
         * En caso de que 'navigator.geolocation.getCurrentPosition' falle, se muestra notificación de error
         * @param error
         */
        geoErrorModal: function (error) {
            //notificationGeneral("Error al cargar ubicación", {type: "warning"});
            $(".div-alertGeo").removeClass("open");
        },
        /**
         * Función encargada de convertir una posición geográfica en posibles resultados de direcciones humanizadas
         */
        geocode: function (latLng) {
            new google.maps.Geocoder().geocode({'location': latLng}, function (results, status) {
                if (status === 'OK') {
                    if (results[0] === undefined) {
                        $(".div-alertGeo").removeClass("open");
                        return;
                    } else {
                        modalAddress.formaterGeocode(results);
                    }
                }
            });
        },
        /**
         * Función encargada de convertir componentes de dirección en una dirección única humanizada
         * @param geocoder : Object :: Respuesta de geocoder inverso
         */
        formaterGeocode: function (geocoder) {
            var format_address = geocoder[0].formatted_address;
            var address = format_address.split(",");
            this.street = address[0].trim();
        },
        /**
         * Función encargada de convertir componentes de dirección en una dirección única humanizada
         * @param results
         */
        reformatAddress: function (results) {
            var routeAndStreetRegEx = /(cl. |Cra. |Av. |Troncal )/i;
            var routeMap = {
                'cl.': 'Cll',
                'cra.': 'Kra',
                'tv.': 'Trv',
                'dg.': 'Dig',
                'av.': 'Av',
                'ak.': 'Ak',
                'ac.': 'Ac',
                'cq.': 'Cq',
                'mz.': 'Mz',
                'via': 'Via'
            };
            var getEqualPart = function (str1, str2) {
                var str = '';
                var prevMatch = -1;
                for (var i = 0; i < str1.length; i++) {
                    if (str1[i] === str2[i] && prevMatch + 1 === i) {
                        str += str1[i];
                        prevMatch = i;
                    }
                }
                return str;
            };
            var components = results[0].address_components;
            var parts;
            for (var item in components) {
                var component = components[item];
                if (component.types[0] === 'route') {
                    parts = component.short_name.split(' ');
                    if (parts.length === 2) {
                        var route = parts[0].toLowerCase();
                        if (routeMap[route]) {
                            this.selected = routeMap[route];
                        }
                        //this.street = parts[1];
                        this.street = parts[0] + " " + parts[1];
                    }
                    if (parts.length > 2) {
                        var secondPart = component.short_name.replace(routeAndStreetRegEx, '');
                        var firstPart = component.short_name.replace(secondPart, '').trim().toLowerCase();
                        this.street = secondPart;
                        this.selected = routeMap[firstPart];
                    }
                }
                if (component.types[0] === 'street_number') {
                    parts = component.short_name.split('-');
                    if (parts.length === 2) {
                        if (parts[0] === parts[1]) {
                            this.number_one = parts[0];
                            this.number_two = parts[0];
                        }
                        var equalPart = getEqualPart(parts[0], parts[1]);
                        if (equalPart.length === parts[0].length) {
                            equalPart = equalPart.slice(0, -1);
                        }
                        if (equalPart.length >= 2 || parts[1].length === 3) {
                            this.number_one = equalPart;
                            this.number_two = parts[0].replace(equalPart, '');
                        } else {
                            this.number_one = parts[0];
                            this.number_two = parts[1];
                        }
                    }
                    if (parts.length === 1) {
                        this.number_one = parts[0];
                    }
                }

                if (component.types[0] === "country") {
                    this.country = component.long_name;
                }

                let position = new google.maps.LatLng(this.latLng.lat, this.latLng.lng);

                setTimeout(function () {
                    $(".div-alertGeo").removeClass("open");
                }, 1500);
            }

        },
        /**
         * muestra el modal de mapa
         */
        showMap: function (position) {
            setTimeout(() => {
                modalAddress2.initialize();
                google.maps.event.trigger(this.map, 'resize');
                modalAddress2.map.setCenter(position);
                modalAddress2.map.setZoom(16);
                modalAddress2.marker.setPosition(position);
            });
            this.show_map = true;
        },
        /* Obtiene las coordenadas (geometry) de la dirección del formulario */
        checkAddress: function () {
            this.show_address_form = false;
            this.show_select_address = false;
            this.show_dateTime = false;
            this.show_map = true;
            if (this.street.length > 0 && this.selectedCity.length > 0 && this.place.length > 0) {
                //Formato de la dirección a ser buscada
                this.addressUrl = this.selectedCity + "," + this.street + (this.colony.length > 0 ? ' , ' + this.colony : '');
                apiAddress.geocodeAddress(this.addressUrl).then((response) => {
                    if (response.status === 'OK') {
                        var location = response.results[0].geometry.location;
                        this.location = {"latitude": location.lat(), "longitude": location.lng()};
                        //this.showMap(location);
                        //var position = new google.maps.LatLng(position.latitude, position.longitude);

                        this.coverage({"latitude": location.lat(),
                            "longitude": location.lng()}, false);
                    } else {
                        if (response.status === google.maps.GeocoderStatus.ZERO_RESULTS) {
                            console.log('Geocode was not successful for the following reason: ', response.status);
                            notificationGeneral(message.zero_results, {type: 'warning'});
                        } else if (response.status === google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
                            console.log("daily for OVER_QUERY_LIMIT");
                            notificationGeneral(message.error, {type: 'error'});
                        }
                    }
                }, function (error) {
                    console.log("error comprobando la localizacíon de la dirección", error);
                    notificationGeneral("Error comprobando la localizacíon de la dirección", {type: "error"});
                });
            }
        },
        /**
         * Función encargada de confirmar la dirección ingresada por el usuario (Form o refinamiento)
         */
        confirmAddress: function () {
            this.show_address = true;
            this.show_select = false;
            this.show_address_form = false;
            this.show_address_datetime = true;
            this.getSchedules();

            // if (this.street.length > 0 && this.selectedCity.length > 0 
            //         && this.place.length > 0 && this.location) {
            //     this.coverage(this.location, true);
            // }
        },

        confirm: function () {
            console.log("street", this.street, this.street.length);
            console.log("selectedcity", this.selectedCity, this.selectedCity.length);
            console.log("place", this.place, this.place.length);
            if (this.street.length > 0 && this.selectedCity.length > 0 && this.place.length > 0 && this.location && this.date && this.time) {
                this.coverage(this.location, true);
            } else {
                notificationGeneral("Debes diligenciar todos los campos", {type: "notice"})
            }
        },
        /* Verifica que las coordenadas de la dirección esten en la cobertura 
         * @param position :: objecto con latitude y longitude
         * @param isCreate :: booleano si es true crea una dirección de lo contrario solo valida
         */
        coverage(position, isCreate = false) {
            var pointSale = jsonParse(getLocalStorage(nameStorage.pointSale));
            var datetime = {};
            if (this.typeService && this.typeService.code == 3) {
                datetime.date = this.date;
                datetime.time = this.time;
            }

            var form_add_address = $("#form_add_address button[type=submit]");
            if (position && (position.latitude && position.longitude)) {
                apiAddress.coverage(position, datetime).then((coverage) => {
                    if (this.date && this.time) {
                        setLocalStorage(nameStorage.deliveryTime, JSON.stringify(datetime));
                    }
                    //Se actualiza el location
                    this.location = position;
                    //Direccion a guardar
                    var tmpAddress = {
                        "name": this.selectedCity,
                        "city": this.selectedCity,
                        "description": this.place,
                        "address": this.street,
                        "location": this.location,
                        "country": this.country,
                    };

                    if (Object.keys(coverage[0].result).length === 0) {

                        /** Analytics **/
                        var paramsCoverage = {};
                        paramsCoverage[Properties.ADDRESS_CITY] = tmpAddress.city;
                        paramsCoverage[Properties.ADDRESS] = tmpAddress.address;
                        paramsCoverage[Properties.ADDRESS_DESCRIPTION] = tmpAddress.description;
                        paramsCoverage[Properties.ADDRESS_LATITUDE] = tmpAddress.location.latitude;
                        paramsCoverage[Properties.ADDRESS_LONGITUDE] = tmpAddress.location.longitude;
                        Analytics.track(EVENTS.OUT_OF_COVERAGE, paramsCoverage);
                        /** **/

                        notificationGeneral(message.coverage_out, {type: 'warning'});
                    }
                    //Cambio de punto de venta
                    else if (pointSale && (coverage[0].result.rid !== pointSale.rid)) {
                        resetNotification.setup(tmpAddress, coverage);
                    } else {
                        if (isCreate) {
                            this.createAddress(tmpAddress, coverage);
                        } else {
                            //mostrar el mapa
                            //---------------
                            position = new google.maps.LatLng(position.latitude, position.longitude);
                            this.tmpCoverage = coverage;
                            //this.getSchedules(coverage);
                            this.showMap(position);
                            //-----------------
                        }
                    }
                }, function (error) {
                    this.checking = false;
                    form_add_address.stopLoading();
                    console.log("error consultando la cobertura", error);
                });
            } else {
                console.log("Parámetros inválidos")
        }

        },
        /**
         * Crea una dirección y genera el comportamiento segun el path
         * @param address :: Object
         * @param coverage :: Object 
         */
        createAddress: function (address, coverage) {
            console.log("createdAddress", address, coverage);
            var form_add_address = $("#form_add_address button[type=submit]");
            apiAddress.create(address).then((result) => {
                var user = jsonParse(getLocalStorage(nameStorage.consumer));
                //Dirección asignada al usuario
                if (user && user["rid"]) {
                    this.costumer_addresses = result;

                    if (this.pathname.includes("/address")) {
                        accountAddress.updateAddress(result);
                        form_add_address.stopLoading();
                        notificationGeneral(message.created_address);
                        $.magnificPopup.close();
                    } else if (this.pathname === "/checkout") {
                        form_add_address.stopLoading();
                        notificationGeneral(message.created_address);
                        $.magnificPopup.close();
                        addressApp.addresses.push(result[0]);
                        $(".new_dir").click();
                    } else {
                        var _msg_dict = {
                            msg: "Dirección guardada correctamente. Ahora puedes agregar productos al carrito.",
                            show: true,
                            type: "success"
                        };
                        setLocalStorage(nameStorage.showMsgSaveAddress, JSON.stringify(_msg_dict));
                        setLocalStorage(nameStorage.pointSale, JSON.stringify(coverage[0].result));
                        setLocalStorage(nameStorage.currentAddress, JSON.stringify(result[0]));
                        $.magnificPopup.close();
                        urlPointsale(coverage[0].result.slug, this.pathname);
                    }
                }
                //Dirección temporal
                else {
                    var _msg_dict = {
                        msg: "Dirección guardada correctamente. Ahora puedes agregar productos al carrito.",
                        show: true,
                        type: "success"
                    };
                    setLocalStorage(nameStorage.showMsgSaveAddress, JSON.stringify(_msg_dict));
                    setLocalStorage(nameStorage.pointSale, JSON.stringify(coverage[0].result));
                    setLocalStorage(nameStorage.tmpAddress, JSON.stringify(result[0]));
                    $.magnificPopup.close();
                    urlPointsale(coverage[0].result.slug, this.pathname);
                }
            }, function (error) {
                form_add_address.stopLoading();
                console.log("error agregando la direccion", error);
                notificationGeneral("error agregando la direccion", {type: "error"});
            });
        },
        /**
         * inicializar la opciones del mapa
         */
        initialize: function () {
            var centro = new google.maps.LatLng(11.011668, -74.840412);
            var myLatlng = new google.maps.LatLng(11.011668, -74.840412);
            var mapOptions = {
                center: centro,
                zoom: 16,
                scrollwheel: false,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
            };

            this.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
            var contentString = 'Es tu ubicación ? - Muéveme para refinar';//'Muéveme!';

            this.marker = new google.maps.Marker({
                map: this.map,
                animation: google.maps.Animation.DROP,
                position: myLatlng,
                icon: this.image,
                draggable: true
            });
            google.maps.event.addListener(this.marker, 'click', this.toggleBounce);

            var infowindow = new google.maps.InfoWindow({
                content: contentString
            });

            google.maps.event.addListener(this.marker, 'click', function () {
                infowindow.open(modalAddress.map, modalAddress.marker);
                infowindow.open(modalAddress2.map, modalAddress2.marker);
            });


            /**
             * evento de mover el market
             */
            google.maps.event.addListener(this.marker, 'dragend', function (event) {
                modalAddress.location = {"latitude": event.latLng.lat(), "longitude": event.latLng.lng()};
                modalAddress2.location = {"latitude": event.latLng.lat(), "longitude": event.latLng.lng()};
            });

            infowindow.open(this.map, this.marker);

            /**
             * evento de click en el mapa
             */
            google.maps.event.addListener(this.map, 'click', function (event) {
                modalAddress.marker.setPosition(event.latLng);
                modalAddress.map.setCenter(event.latLng);
                modalAddress.location = {"latitude": event.latLng.lat(), "longitude": event.latLng.lng()};

                modalAddress2.marker.setPosition(event.latLng);
                modalAddress2.map.setCenter(event.latLng);
                modalAddress2.location = {"latitude": event.latLng.lat(), "longitude": event.latLng.lng()};
            });
        },
        /**
         * callback de tocar el market
         */
        toggleBounce: function () {
            if (this.marker.getAnimation() !== null) {
                this.marker.setAnimation(null);
            } else {
                this.marker.setAnimation(google.maps.Animation.BOUNCE);
            }
        },
        /**
         * Función encargada de regresar al formulario de modalAddress
         */
        goToForm: function () {
            this.setup();
        }
    },
    computed: {
        listService: function () {
            var services = this.services;
            for (var service of services) {
                service.classObject = {};
                switch (service.name) {
                    case 'Recogida':
                        service.classObject.big = true;
                        break;
                    case 'Domicilio':
                        service.classObject.domiciio = true;
                        break;
                }
                service.classObject.active = this.service_selected == service.name;
            }

            return services;
        }
    },
    changeDateInput: function (e) {
        console.log("Event! Change inout date!!!");
    }
});