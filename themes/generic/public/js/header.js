/**
 * oculta la alerta fija en el home
 */
function closeReset() {
    if (window.location.pathname === "/") {
        $(".alertBgStatic").removeClass();
    }
}

var resetNotification = new Vue({
    el: '.alertStatic',
    data: function () {
        return {
            "tmpCoverage": [],
            "tmpAddress": {},
            "iscreate": true,
        };
    },
    methods: {
        setup: function (tmpAddress, coverage, iscreate = true) {
            this.tmpCoverage = coverage;
            this.tmpAddress = tmpAddress;
            this.iscreate = iscreate;

            console.log("RESET setup", this.tmpCoverage, this.tmpAddress, this.iscreate);
            notificationFive(message.reset_address, true);
        },
        reset: function () {
            var currentAddress = jsonParse(getLocalStorage(nameStorage.currentAddress));
            var tmpAddress = jsonParse(getLocalStorage(nameStorage.tmpAddress));
            var typeService = jsonParse(getLocalStorage(nameStorage.service));
            var pathname = window.location.pathname;
            var magnificPopup = $.magnificPopup.instance;


            console.log("RESET", currentAddress, tmpAddress, typeService, pathname);
            if (tmpAddress || currentAddress) {
                removeLocalStorage(nameStorage.cartId);
                removeLocalStorage(nameStorage.pointSale);
                removeLocalStorage(nameStorage.tmpAddress);
                removeLocalStorage(nameStorage.currentAddress);
            }

            switch (typeService.code) {
                case "1":
                    console.log("RESET1");
                    if (this.iscreate) {
                        modalAddress.createAddress(this.tmpAddress, this.tmpCoverage);
                        magnificPopup.close();
                    } else {
                        setLocalStorage(nameStorage.pointSale, JSON.stringify(this.tmpCoverage[0].result));
                        setLocalStorage(nameStorage.currentAddress, JSON.stringify(this.tmpAddress));
                        notificationGeneral(message.ok_address);
                        redirect(pathname, {pointSale: this.tmpCoverage[0].result.slug});
                    }

                    break;
                case "3":
                    console.log("RESET3");
                    if (this.iscreate) {
                        modalAddress2.createAddress(this.tmpAddress, this.tmpCoverage);
                    } else {
                        setLocalStorage(nameStorage.pointSale, JSON.stringify(this.tmpCoverage[0].result));
                        setLocalStorage(nameStorage.currentAddress, JSON.stringify(this.tmpAddress));
                        //notificationGeneral(message.ok_address);
                        redirect(pathname, {pointSale: this.tmpCoverage[0].result.slug});
                    }
                    break;

                default:
                    break;
            }
            //removeLocalStorage(nameStorage.cartId);
            //modalAddress.createAddress(this.tmpAddress, this.tmpCoverage);
        }
    }
});


/**
 * Se encarga de mostrar variables como el contador del carrito
 * que se debeb ver en todas las páginas.
 */
var headerApp = new Vue({
    el: '#menu_header',
    data: function () {
        return {
            "service": "",
            "searchWord": "",
        };
    },
    methods: {
        openService: function () {
            typeService.setup();
        },
        setup: function () {
            let service = jsonParse(getLocalStorage(nameStorage.service));
            let currentAddress = jsonParse(getLocalStorage(nameStorage.currentAddress));
            let tmpAddress = jsonParse(getLocalStorage(nameStorage.tmpAddress));
            if (currentAddress || tmpAddress) {
                this.service = (currentAddress && currentAddress['@rid']) ? currentAddress.address.substring(0, 20) + ', ' + currentAddress.city : tmpAddress.address.substring(0, 20) + ', ' + tmpAddress.city;
            }
            //Cuando existe un carrito agrega la cantidad en el icono y cambia el href
            //si no existe se deja en 0 y el href es la página actual
            let pathname = window.location.pathname;
            let cartId = getLocalStorage(nameStorage.cartId);
            let count = getLocalStorage(nameStorage.cartCount) ? getLocalStorage(nameStorage.cartCount) : 0;

            if (cartId) {
                $("li a.carrito b").text(count);
                $(".carritoClic.carrito").attr("href", "/cart?id=" + cartId);
            } else {
                setLocalStorage(nameStorage.cartCount, 0);
                $("li a.carrito b").text(0);
                $(".carritoClic.carrito").attr("href", nameStorage.cartUrl);
            }
        },
        openCart: function () {
            appCart.getCart();
        },
        home: function () {
            redirect("/");
        },
        search: function () {
            let params = {word: this.searchWord};
            let pointSale = jsonParse(getLocalStorage(nameStorage.pointSale));
            if (pointSale) {
                params.pointSale = pointSale.slug;
            }
            redirect("/search", params);
        }
    }
});

$(window).load(function () {

    if (location.protocol != 'https:' && location.host != 'localhost:5000')
    {
        location.href = 'https:' + window.location.href.substring(window.location.protocol.length);
    }

    //SEARCH
    $("html").click(function () {
        // alert("Click!");
        $('.searchSite').removeClass('open');
    });
    $('body').on('click', '.clckSearch', function (event) {
        // $('#searchIpt').focus();
        event.stopPropagation();
        $('.searchSite').addClass('open');
    });
    $('body').on('click', '.searchSite.open, #searchGeneric', function (event) {
        event.stopPropagation();
    });



    /**
     * Valida y carga la configuración del comercio
     * @type {Vue}
     */
    var initial_load = new Vue({
        data: {
            config: {}
        },
        methods: {
            setup: function () {
                this.isOpen();
                this.configuration();
                this.loadUser();
            },
            configuration: function () {
                if (getSessionStorage(nameStorage.config)) {
                    try {
                        this.config = JSON.parse(getSessionStorage(nameStorage.config));
                        this.loadPagesBlog(this.config);
                        this.setCities(this.config);
                    } catch (error) {
                        console.error("[Error] No se puede obtener la configuración.", error);
                    }
                } else {
                    apiAjax('configuration', 'get', {timeout: timeoutAjax}).then(config => {
                        if (config && Object.keys(config).length > 0) {
                            this.config = config;
                            setSessionStorage(nameStorage.config, JSON.stringify(this.config));
                            this.loadPagesBlog(this.config);
                            this.setCities(this.config);
                        }
                    }, function (error) {
                        console.log("Ha ocurrido un error consultando los banners del comercio", error);
                    });
                }

                if (getLocalStorage(nameStorage.showMsgSaveAddress)) {
                    try {
                        var msg_address = JSON.parse(getLocalStorage(nameStorage.showMsgSaveAddress));
                        if (typeof msg_address === "object" && msg_address.show) {
                            notificationGeneral(msg_address.msg, {type: msg_address.type});
                            removeLocalStorage(nameStorage.showMsgSaveAddress);
                        }
                    } catch (e) {
                        /** PASS **/
                    }
                }
            },
            /**
             * asigna las ciudades donde estan los puntos
             * de venta
             * @param config :: datos de la configuracion
             */
            setCities: function (config) {
                if (config && typeof config === "object" && typeof config.cities !== "undefined") {
                    var cities = [];
                    for (var index in config.cities) {
                        var result = config.cities[index];
                        if (result) {
                            var city = result.split(",");
                            city = city[0].split("-");
                            if (city[0]) {
                                cities.push(city[0]);
                            }
                        }
                    }
                    //addressIndex.city = cities;
                    modalAddress.city = cities;
                } else {
                    var values = ["Medellín, Bogotá"];
                    //addressIndex.city = values;
                    modalAddress.city = values;
                }
            },
            loadPagesBlog: function (config) {

                if (config.result) {
                    config = config.result;
                    this.config = config;
                }

                // Verifica si 'viewPages' y 'viewBlog' están correctamente creados en 'config'
                if (config && typeof config === "object" && typeof config.viewPages !== "undefined" && typeof config.viewBlogs !== "undefined") {
                    pages_and_blog.getPagesNamesBlog(this.config.viewPages, this.config.viewBlogs);
                } else {
                    console.warn("[ERROR] loadPagesBlog");
                }
            },
            /**
             * verifica si el comercio esta abierto o cerrado
             */
            isOpen: function () {
                if (window.location.pathname === "/") {
                    var pointsale = JSON.parse(getLocalStorage(nameStorage.pointSale));
                    if (pointsale && pointsale["id"]) {
                        apiAjax('pointSaleIsOpen?id=' + pointsale["id"], 'get', {timeout: timeoutAjax}).then(pointsale => {
                            if (pointsale && pointsale["schedules"] && !pointsale["schedules"]["isOpen"]) {
                                notificationFive(message.closed_business);
                            }
                        }, function (error) {
                            console.log("Ha ocurrido un error consultando el estado del comercio", error);
                        });
                    }
                }
            },
            /**
             * Verifica si hay un usuario logueado para cambiar menu y agregar botón en header
             */
            loadUser: function () {
                var user_cache = getLocalStorage(nameStorage.consumer);
                if (user_cache) {
                    $("#menu_login").html("MI CUENTA");
                }
            }
        }
    });

    /**
     * Valida y carga páginas y blog en el caso de estar habilitados
     * @type {Vue}
     */
    var pages_and_blog = new Vue({
        el: "#menu_header2",
        data: {
            pages_menu: [],
            show_blog: false
        },
        methods: {
            /**
             * Obtiene lista de páginas y blog usando condiciones para ser renderizado en header.html
             */
            getPagesNamesBlog: function (viewPages, viewBlogs) {
                if (viewPages === true) {
                    if (getSessionStorage(nameStorage.pages_menu)) {
                        this.pages_menu = JSON.parse(getSessionStorage(nameStorage.pages_menu));
                    } else {
                        apiAjax('menu', 'get', {timeout: timeoutAjax}).then(pages_menu => {
                            if (pages_menu && pages_menu.constructor === Array) {
                                this.pages_menu = pages_menu;
                                setSessionStorage(nameStorage.pages_menu, JSON.stringify(this.pages_menu));
                            }
                        }, function (error) {
                            console.error("Ha ocurrido un error consultando las páginas del comercio", error);
                        });
                    }
                }

                this.show_blog = viewBlogs;
            },
            slugToUrl: function (slug) {
                return "/pages/" + slug;
            }
        }
    });

    headerApp.setup();
    //initial_load.setup();
});
