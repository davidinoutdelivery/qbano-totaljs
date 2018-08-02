/**
 * Obtiene los productos y detalles de un producto
 */
var products = new Vue({
    el: '#products',
    data: function () {
        return {
            "category": {}, "products": [], "detailProduct": {}, "combos": {},
            "total": 0, "send": true, "status": true,
            "purchase": {
                "modifiers": {},
                "modifiersGroups": {},
                "amount": 1,
            }
        }
    },
    methods: {
        /**
         * carga inical del detalle de un producto
         * @param model
         */
        setup: function (model) {
            if (Object.keys(model).length > 0 && model[0].products[0]) {
                model = model[0].products[0];
            }

            if (window.location.pathname.includes("products")) {
                this.detailProduct = model;
                this.generate(model);
                this.total = model.price ? model.price : model.priceDefault;
            }

            /** Analytics **/
            var params = {};
            params[Properties.CONTENT_NAME] = "products";
            Analytics.track(EVENTS.VIEW_CONTENT, params);
            /** **/
        },
        /**
         * Incrementa la cantidaad de un producto desde su detalle
         */
        increment: function () {
            this.purchase.amount += 1;
            let totalPrice = $('#total_price').attr('data-price');
            totalPrice *= this.purchase.amount;
            $('#total_price').text(currencyFormat(totalPrice));
            this.setDetailProductCountToZero();
        },
        /**
         * Disminuye la cantidaad de un producto desde su detalle
         */
        decrement: function () {
            if (this.purchase.amount > 1) {
                this.purchase.amount -= 1;
                let totalPrice = $('#total_price').attr('data-price');
                totalPrice *= this.purchase.amount;
                $('#total_price').text(currencyFormat(totalPrice));
            }
            this.setDetailProductCountToZero();
        },
        initDetailProductCount: function () {
            this.detailProduct.countModifier = 0;
            this.detailProduct.countModifierGroup = 0;
            let count = 0;
            for (var modifier in this.detailProduct.modifiers) {
                this.detailProduct.modifiers[modifier].count = count;
                count++;
            }
            count = 0;
            for (var modifierGroup in this.detailProduct.modifiersGroups) {
                this.detailProduct.modifiersGroups[modifierGroup].count = count;
                count++;
            }
        },
        /**
         * Obtiene el detalle de un producto
         * @param idCategory
         * @param idProduct
         */
        detail: function (idCategory, idProduct, event) {
            var element_sel = $(event.currentTarget).find("img");
            element_sel.startLoading();
            if (idCategory && idProduct) {
                var data = {category: idCategory, product: idProduct};
                let pointSale = getPointSale();

                if (pointSale && pointSale['rid']) {
                    data["pointSale"] = pointSale['slug'];
                    this.purchase.amount = 1;
                    apiAjax("product", "post", data).then(data => {
                        data = data[0].result[0].products[0];
                        element_sel.stopLoading();
                        data.idCategory = idCategory;
                        data.idProduct = idProduct;
                        this.detailProduct = data;
                        this.initDetailProductCount();
                        this.generate(data);
                        this.total = data.price ? data.price : data.priceDefault;
                        var url = '/products/' + idCategory + '/' + idProduct + "?pointsale=" + pointSale.slug;
                        //TO-DO: al ver detalle debe cambiar la url
                        //window.history.replaceState({}, 'detalles de producto' + this.detailProduct['name'], url);
                        $('.modalDetail').click();
                    }, error => {
                        element_sel.stopLoading();
                        console.error("ERROR_DETAIL", error);
                    });
                } else {
                    this.clean();
                    element_sel.stopLoading();
                    typeService.setup();
                }
            } else {
                element_sel.stopLoading();
                console.error("ERROR_DETAIL", "Invalid parameter");
            }
        },
        /**
         * agrega un producto al carrito, si existe lo crea sino lo actualiza
         */
        addtocart: function (event, idCategory = null, idProduct = null) {

            var element_sel = $(event.currentTarget);
            element_sel.startLoading({msg: "Agregando"});

            if (this.send && this.detailProduct.isAvailable) {

                let cartId = getLocalStorage(nameStorage.cartId);
                let pointSale = getPointSale();
                this.send = false;

                if (pointSale && pointSale['rid']) {

                    let data = {};
                    if (cartId) {
                        data['cartId'] = cartId;
                    }
                    data['pointSale'] = pointSale['rid'];
                    data['pointSaleTypeServiceSchedule'] = pointSale.services[0].coverages[0].rid;
                    data['typeService'] = pointSale.services[0].rid;
                    data['cartItems'] = this.formatCart();
                    
                    if (this.validateModifiers() && this.validateModifiersGroups()) {

                        apiAjax("cart", "post", data).then((response) => {

                            response = response[0] ? response[0] : null;

                            if (response && response['@rid']) {

                                this.trackAddToCart(this.detailProduct);
                                setLocalStorage(nameStorage.cartId, response['@rid'].replace("#", ""));

                                if (!cartId) {
                                    response.totalAmount = data.cartItems.amount;
                                }
                                ;

                                cartCount(response.totalAmount);
                                this.clean();
                                this.addtocartanimation(idCategory, idProduct);
                            }

                            $.magnificPopup.instance.close();
                            this.send = true;
                            element_sel.stopLoading();
                        }, error => {
                            this.clean();
                            this.send = true;
                            element_sel.stopLoading();
                            console.error("ERROR_SAVECART", error);
                        });
                    } else {
                        this.send = true;
                        element_sel.stopLoading();
                    }
                } else if (window.location.pathname.includes("products")) {
                    this.send = true;
                    modalAddress.setup();
                    element_sel.stopLoading();
                } else {
                    this.clean();
                    $.magnificPopup.instance.close();
                    this.send = true;
                    element_sel.stopLoading();
                    console.warn("Invalid pointSale");
                }
            } else {
                console.warn("Producto no disponible");
        }
        },
        addtocartanimation: function (idCategory, idProduct) {

            let shopCartImg = $(".shopCartHidden:contains('" + idCategory + "-" + idProduct + "')")
                    .parent()
                    .parent()
                    .children('a')
                    .children('.bg-image, .bg-category')
                    .children('img');

            let shopCart = $(".shopCartHidden:contains('" + idCategory + "-" + idProduct + "')")
                    .parent()
                    .parent()
                    .children('a')
                    .children('.bg-image, .bg-category');

            shopCart.prepend('<img class="animationAddToCard" src="/generic/images/agregar_carrito.png" alt="agregar_carrito"/>');
            shopCart = shopCart.children('img');
            shopCart.on('animationend webkitAnimationEnd oAnimationEnd', function () {
                $('.animationAddToCard').remove();
            });
            shopCartImg.addClass('animationAddToCardImg');
            shopCartImg.on('animationend webkitAnimationEnd oAnimationEnd', function () {
                shopCartImg.removeClass('animationAddToCardImg');
            });
        },
        clean: function () {
            if (!window.location.pathname.includes("products")) {
                var magnificPopup = $.magnificPopup.instance;
                magnificPopup.close();
                this.total = 0;
                this.detailProduct = {};
                this.combos = {};
                this.purchase = {
                    "modifiers": {},
                    "modifiersGroups": {},
                    "amount": 1,
                };
            }
        },
        close: function () {
            this.detailProduct = {};
            this.combos = {};
        },
        /**
         * valida si un producto tiene algun tipo de modificador
         */
        hasModifiers: function (product) {
            let result = false;
            if ((product.modifiers && product.modifiers.length > 0)
                    || (product.modifiersGroups && product.modifiersGroups.length > 0)
                    || (product.productGroups && product.productGroups.length > 0)) {
                result = true;
            }
            return result;
        },
        /**
         * agrega un producto al carrito si no tiene modificadores de lo contrario abre el detalle
         */
        shop: function (idCategory, idProduct, event) {
            var element_sel = $(event.currentTarget);
            element_sel.startLoading();
            if (idCategory && idProduct) {
                var data = {category: idCategory, product: idProduct};
                let pointSale = getPointSale();

                if (pointSale && pointSale['rid']) {
                    data["pointSale"] = pointSale['slug'];
                    this.purchase.amount = 1;
                    apiAjax("product", "post", data).then(data => {
                        data = data[0].result[0].products[0];
                        element_sel.stopLoading();
                        data.idCategory = idCategory;
                        data.idProduct = idProduct;
                        this.detailProduct = data;
                        this.initDetailProductCount();
                        this.generate(data);
                        this.total = data.price ? data.price : data.priceDefault;
                        if (!this.hasModifiers(data)) {
                            this.addtocart(event, idCategory, idProduct);
                        } else {
                            element_sel.stopLoading();

                            $('.modalDetail').click();
                        }

                    }, errorDetail => {
                        this.clean();
                        element_sel.stopLoading();
                        console.error("error en detalle");
                    });
                } else {
                    this.clean();
                    element_sel.stopLoading();
                    typeService.setup();
                    console.warn("Invalid pointSale");
                }

            } else {
                element_sel.stopLoading();
                console.error("Invalid parameter");
            }
        },
        currencyFormat: function (value) {
            if (value) {
                return "$ " + value.toLocaleString();
            }
        },
        nameModifierFormat: function (value) {
            if (value) {
                let resp = value.split(" ");
                return resp[0];
            }
        },
        containsModifiers: function (status, id) {
            if (status) {
                this.detail(id);
            } else {
                this.shop(id);
            }
        },
        trackProduct: function (product) {
            if (product) {
                try {
                    /** Analytics **/
                    var params = {};
                    params[Properties.CONTENT_NAME] = product.name;
                    params[Properties.CONTENT_ID] = product.id;
                    params[Properties.CONTENT_TYPE] = "product";
                    params[Properties.CONTENT_CATEGORY] = product.category.name;
                    params[Properties.VALUE] = product.priceDefault;
                    params[Properties.HAS_MODIFIERS] = (product.modifiers && product.modifiers.length > 0) ? true : false;
                    params[Properties.HAS_MODIFIERS_GROUP] = (product.modifiersGroups && product.modifiersGroups.length > 0) ? true : false;
                    params[Properties.HAS_VALUES_MEALS] = (product.valuesMeals && product.valuesMeals.length > 0) ? true : false;
                    params[Properties.IS_COMBO] = product.requiredCombo ? product.requiredCombo : false;
                    params[Properties.STATUS] = product.status;
                    params[Properties.CURRENCY] = "COP";
                    Analytics.track(EVENTS.DETAILS_PRODUCT, params);
                    /** **/
                } catch (error) {
                    console.error("error capturando los datos del producto para hacer un track", error);
                }
            }
        },
        trackAddToCart: function (product) {
            if (product) {
                try {
                    /** Analytics **/
                    var params = {};
                    params[Properties.CONTENT_NAME] = product.name ? product.name : "---";
                    params[Properties.CONTENT_ID] = product['@rid'] ? product['@rid'] : "---";
                    params[Properties.CONTENT_TYPE] = "product";
                    params[Properties.HAS_MODIFIERS] = !!(product.modifier && product.modifier.length > 0);
                    params[Properties.HAS_MODIFIERS_GROUP] = !!(product.modifierGroups && product.modifierGroups.length > 0);
                    params[Properties.IS_COMBO] = product.requiredCombo ? product.requiredCombo : false;
                    params[Properties.PURCHASE] = product.purchase;
                    params[Properties.VALUE] = product.price ? product.price : product.priceDefault;
                    params[Properties.CURRENCY] = "COP";
                    Analytics.track(EVENTS.ADD_TO_CART, params);
                    /** **/
                } catch (error) {
                    console.error("error agregadno un producto al para hacer un track", error);
                }

            }
        },
        /**
         * Al seleccionar un modificador, valida sus restricciones para permitir
         * seleccionarlo.
         * @param modifierId :: String :: identificador del modificador.
         * @param modifierId :: String :: identificador del item seleccionado en ese modificador.
         * @param modifierId :: Object :: Objeto del DOM al hacer click.
         */
        setDetailProductCountToZero: function () {
            this.detailProduct.countModifier = 0;
            this.detailProduct.countModifierGroup = 0;
        },
        /**
         * Al seleccionar un modificador, valida sus restricciones para permitir
         * seleccionarlo.
         * @param modifierId :: String :: identificador del modificador.
         * @param modifierId :: String :: identificador del item seleccionado en ese modificador.
         * @param modifierId :: Object :: Objeto del DOM al hacer click.
         */
        priceCalculator: function () {

            let totalPrice = parseInt($('#total_price').attr('data-base'));

            let modifiers = null;
            let modifier = null;
            for (modifiers in this.purchase.modifiers) {
                for (modifier in this.purchase.modifiers[modifiers]) {
                    if (modifier != 'conf') {
                        if (this.purchase.modifiers[modifiers][modifier].checked === true) {
                            totalPrice += parseInt(this.purchase.modifiers[modifiers][modifier].price);
                        }
                    }
                }
            }

            let modifierGroup = null;
            for (modifierGroup in this.purchase.modifiersGroups) {
                if (this.purchase.modifiersGroups[modifierGroup].checked === true) {
                    totalPrice += parseInt(this.purchase.modifiersGroups[modifierGroup]['conf'].price);
                } else {
                    for (modifiers in this.purchase.modifiersGroups[modifierGroup].modifier) {
                        for (modifier in this.purchase.modifiersGroups[modifierGroup].modifier[modifiers]) {
                            if (modifier != 'conf') {
                                this.purchase.modifiersGroups[modifierGroup].modifier[modifiers][modifier].checked = false
                            }
                        }
                    }
                }
            }

            modifierGroup = null;
            modifiers = null;
            modifier = null;
            for (modifierGroup in this.purchase.modifiersGroups) {
                for (modifiers in this.purchase.modifiersGroups[modifierGroup].modifier) {
                    for (modifier in this.purchase.modifiersGroups[modifierGroup].modifier[modifiers]) {
                        if (modifier != 'conf') {
                            if (this.purchase.modifiersGroups[modifierGroup].modifier[modifiers][modifier].checked === true) {
                                totalPrice += parseInt(this.purchase.modifiersGroups[modifierGroup].modifier[modifiers][modifier].price);
                            }
                        }
                    }
                }
            }

            $('#total_price').attr('data-price', totalPrice);

            totalPrice *= this.purchase.amount;
            $('#total_price').text(currencyFormat(totalPrice));

            this.setDetailProductCountToZero();
        },
        /**
         * Al seleccionar un modificador, valida sus restricciones para permitir
         * seleccionarlo.
         * @param modifierId :: String :: identificador del modificador.
         * @param modifierId :: String :: identificador del item seleccionado en ese modificador.
         * @param modifierId :: Object :: Objeto del DOM al hacer click.
         */
        selectModifierCheck: function (modifierId, itemId, event) {
            this.purchase.modifiers[modifierId][itemId].checked = event.target.checked;
            let count = this.countCheckedModifier(modifierId); // cuantos seleccionados existen
            let max = this.purchase.modifiers[modifierId]["conf"]["maxSelect"];

            if (this.purchase.modifiers[modifierId]["conf"]["selectUnique"] === true) {
                if (count > 1) {
                    var item = null;
                    for (item in this.purchase.modifiers[modifierId]) {
                        if (item != 'conf') {
                            this.purchase.modifiers[modifierId][item].checked = false
                        }
                    }
                    this.purchase.modifiers[modifierId][itemId].checked = true;
                }
            } else {
                if (max > 0 && count > max) {
                    this.purchase.modifiers[modifierId][itemId].checked = false;
                }
            }

            this.priceCalculator();
        },
        /**
         * Al seleccionar un modificador, valida sus restricciones para permitir
         * seleccionarlo.
         * @param modifierId :: String :: identificador del modificador.
         * @param modifierId :: String :: identificador del item seleccionado en ese modificador.
         * @param modifierId :: Object :: Objeto del DOM al hacer click.
         */
        selectModifierSelect: function (modifierId, itemId, event) {
            if (itemId == 0) {
                var item = null;
                for (item in this.purchase.modifiers[modifierId]) {
                    if (item != 'conf') {
                        this.purchase.modifiers[modifierId][item].checked = false
                    }
                }
            } else {
                this.purchase.modifiers[modifierId][itemId].checked = event.target.selectedOptions[0].selected;
            }
            let count = this.countCheckedModifier(modifierId); // cuantos seleccionados existen
            let max = this.purchase.modifiers[modifierId]["conf"]["maxSelect"];

            if (this.purchase.modifiers[modifierId]["conf"]["selectUnique"] === true) {
                if (count > 1) {
                    var item = null;
                    for (item in this.purchase.modifiers[modifierId]) {
                        if (item != 'conf') {
                            this.purchase.modifiers[modifierId][item].checked = false
                        }
                    }
                    this.purchase.modifiers[modifierId][itemId].checked = true;
                }
            } else {
                if (max > 0 && count > max) {
                    this.purchase.modifiers[modifierId][itemId].checked = false;
                }
            }

            this.priceCalculator();
        },
        /**
         * Al seleccionar un modificador, valida sus restricciones para permitir
         * seleccionarlo.
         * @param modifierId :: String :: identificador del modificador.
         * @param modifierId :: String :: identificador del item seleccionado en ese modificador.
         * @param modifierId :: Object :: Objeto del DOM al hacer click.
         */
        selectModifierGroup: function (modifierGroupId, modifierGroup, event) {
            this.purchase.modifiersGroups[modifierGroupId].checked = event.target.checked;

            let article = $(".modifierGroup-" + modifierGroup);

            if (article.hasClass('displayNone')) {
                article.slideDown("slow", function () {
                    article.removeClass('displayNone');
                });
            } else {
                article.slideUp("slow", function () {
                    article.addClass('displayNone');
                });
            }

            this.priceCalculator();
        },
        /**
         * Al seleccionar un modificador, valida sus restricciones para permitir
         * seleccionarlo.
         * @param modifierId :: String :: identificador del modificador.
         * @param modifierId :: String :: identificador del item seleccionado en ese modificador.
         * @param modifierId :: Object :: Objeto del DOM al hacer click.
         */
        selectModifierGroupModifierCheck: function (modifierGroupId, modifierId, itemId, event) {

            this.purchase.modifiersGroups[modifierGroupId].modifier[modifierId][itemId].checked = event.target.checked;
            let count = this.countCheckedModifierGroup(modifierGroupId, modifierId);
            let max = this.purchase.modifiersGroups[modifierGroupId].modifier[modifierId]["conf"]["maxSelect"];

            if (this.purchase.modifiersGroups[modifierGroupId].modifier[modifierId]["conf"]["selectUnique"] === true) {
                if (count > 1) {
                    var item = null;
                    for (item in this.purchase.modifiersGroups[modifierGroupId].modifier[modifierId]) {
                        if (item != 'conf') {
                            this.purchase.modifiersGroups[modifierGroupId].modifier[modifierId][item].checked = false
                        }
                    }
                    this.purchase.modifiersGroups[modifierGroupId].modifier[modifierId][itemId].checked = true;
                }
            } else {
                if (max > 0 && count > max) {
                    this.purchase.modifiersGroups[modifierGroupId].modifier[modifierId][itemId].checked = false;
                }
            }

            this.priceCalculator();
        },
        /**
         * Al seleccionar un modificador, valida sus restricciones para permitir
         * seleccionarlo.
         * @param modifierId :: String :: identificador del modificador.
         * @param modifierId :: String :: identificador del item seleccionado en ese modificador.
         * @param modifierId :: Object :: Objeto del DOM al hacer click.
         */
        selectModifierGroupModifierSelect: function (modifierGroupId, modifierId, itemId, event) {

            if (itemId == 0) {
                var item = null;
                for (item in this.purchase.modifiersGroups[modifierGroupId].modifier[modifierId]) {
                    if (item != 'conf') {
                        this.purchase.modifiersGroups[modifierGroupId].modifier[modifierId][itemId].checked = false
                    }
                }
            } else {
                this.purchase.modifiersGroups[modifierGroupId].modifier[modifierId][itemId].checked = event.target.selectedOptions[0].selected;
            }
            let count = this.countCheckedModifierGroup(modifierGroupId, modifierId);
            let max = this.purchase.modifiersGroups[modifierGroupId].modifier[modifierId]["conf"]["maxSelect"];

            if (this.purchase.modifiersGroups[modifierGroupId].modifier[modifierId]["conf"]["selectUnique"] === true) {
                if (count > 1) {
                    var item = null;
                    for (item in this.purchase.modifiersGroups[modifierGroupId].modifier[modifierId]) {
                        if (item != 'conf') {
                            this.purchase.modifiersGroups[modifierGroupId].modifier[modifierId][item].checked = false
                        }
                    }
                    this.purchase.modifiersGroups[modifierGroupId].modifier[modifierId][itemId].checked = true;
                }
            } else {
                if (max > 0 && count > max) {
                    this.purchase.modifiersGroups[modifierGroupId].modifier[modifierId][itemId].checked = false;
                }
            }

            this.priceCalculator();
        },
        /**
         * Cuenta la cantidad de item de un modificador que han sido seleccionados.
         * @param modifierId :: String :: identificador del modificador.
         */
        countCheckedModifier: function (modifierId) {
            let count = 0;
            for (let item in this.purchase.modifiers[modifierId]) {
                if (this.purchase.modifiers[modifierId][item].checked === true) {
                    count += 1;
                }
            }
            return count;
        },
        /**
         * Cuenta la cantidad de item de un modificador que han sido seleccionados.
         * @param modifierId :: String :: identificador del modificador.
         */
        countCheckedModifierGroup: function (modifierGroupId, modifierId) {
            let count = 0;
            for (let item in this.purchase.modifiersGroups[modifierGroupId].modifier[modifierId]) {
                if (this.purchase.modifiersGroups[modifierGroupId].modifier[modifierId][item].checked === true) {
                    count += 1;
                }
            }
            return count;
        },
        /**
         * Genera la estructura adecuada del detalle de un producto para facilmente
         * hacer un binding de sus elementos, se comporta como el formulario.
         * @param product:: Object:: detalle del producto
         */
        generate: function (product) {
            if (product.modifiers && product.modifiers.length > 0) {
                for (let modifier of product.modifiers) {

                    let conf = {
                        "selectUnique": modifier.selectUnique,
                        "required": modifier.required,
                        "maxSelect": modifier.maxSelect,
                        "name": modifier.name
                    };
                    Vue.set(products.purchase.modifiers,
                            modifier["rid"],
                            {});
                    Vue.set(products.purchase.modifiers[modifier["rid"]],
                            'conf',
                            conf);

                    if (modifier.items && modifier.items.length > 0) {
                        for (let item of modifier.items) {
                            let info = {};
                            info.modifier = modifier["rid"];
                            info.modifierItem = item["rid"];
                            info.price = item.price ? item.price : 0;
                            info.selectedByDefault = item.selectedByDefault;
                            info.checked = item.selectedByDefault ? item.selectedByDefault : false;
                            Vue.set(products.purchase.modifiers[modifier["rid"]], item["rid"], info);
                        }
                    }
                }
            }
            if (product.modifiersGroups && product.modifiersGroups.length > 0) {
                for (let modifierGroup of product.modifiersGroups) {

                    let conf = {
                        "name": modifierGroup.name,
                        "price": modifierGroup.price
                    };
                    Vue.set(products.purchase.modifiersGroups,
                            modifierGroup["rid"],
                            {});
                    Vue.set(products.purchase.modifiersGroups[modifierGroup["rid"]],
                            'conf',
                            conf);
                    Vue.set(products.purchase.modifiersGroups[modifierGroup["rid"]],
                            'modifier',
                            {});

                    if (modifierGroup.modifiers && modifierGroup.modifiers.length > 0) {
                        for (let modifier of modifierGroup.modifiers) {

                            let conf = {
                                "selectUnique": modifier.selectUnique,
                                "required": modifier.required,
                                "maxSelect": modifier.maxSelect,
                                "name": modifier.name
                            };
                            Vue.set(products.purchase.modifiersGroups[modifierGroup["rid"]].modifier,
                                    modifier["rid"],
                                    {});
                            Vue.set(products.purchase.modifiersGroups[modifierGroup["rid"]].modifier[modifier["rid"]],
                                    'conf',
                                    conf);

                            if (modifier.items && modifier.items.length > 0) {
                                for (let item of modifier.items) {
                                    let info = {
                                        'modifier': modifier["rid"],
                                        'modifierItem': item["rid"],
                                        'price': item.price ? item.price : 0,
                                        'selectedByDefault': item.selectedByDefault,
                                        'checked': item.selectedByDefault ? item.selectedByDefault : false,
                                    };
                                    Vue.set(products.purchase.modifiersGroups[modifierGroup["rid"]].modifier[modifier["rid"]],
                                            item["rid"],
                                            info);
                                }
                            }
                        }
                    }
                }
            }
        },
        /**
         * Genera la estructura necesaria para que los elementos seleccionadas
         * se guarden correctamente en el carrito.
         */
        formatCart: function () {
            let result = {
                "amount": this.purchase.amount,
                "price": this.total,
                "product": this.detailProduct['rid'],
                "comment": "Web",
                "modifiers": [],
                "modifiersGroups": []
            };

            let countModifier = Object.keys(this.purchase.modifiers).length;
            if (countModifier > 0) {

                let modifier = null;
                let item = null;
                let infoItem = null;
                let info = null;

                for (modifier in this.purchase.modifiers) {
                    for (item in this.purchase.modifiers[modifier]) {
                        infoItem = this.purchase.modifiers[modifier][item];
                        if (infoItem.checked) {
                            info = {
                                "modifier": infoItem.modifier,
                                "modifierItem": infoItem.modifierItem,
                                "price": infoItem.price,
                                "amount": 1
                            };
                            result.modifiers.push(info);
                        }
                    }
                }
            }

            let countModifierGroup = Object.keys(this.purchase.modifiersGroups).length;
            if (countModifierGroup > 0) {

                let modifierGroup = null;
                let infoModifierGroup = null;
                let modifier = null;
                let item = null;
                let infoItem = null;
                let info = null;

                for (modifierGroup in this.purchase.modifiersGroups) {

                    infoModifierGroup = this.purchase.modifiersGroups[modifierGroup];

                    if (infoModifierGroup.checked) {

                        infoModifierGroup = {
                            "modifierGroup": modifierGroup,
                            "price": infoModifierGroup.conf.price,
                            "amount": 1,
                            "modifiers": []
                        };

                        for (modifier in this.purchase.modifiersGroups[modifierGroup].modifier) {

                            for (item in this.purchase.modifiersGroups[modifierGroup].modifier[modifier]) {

                                infoItem = this.purchase.modifiersGroups[modifierGroup].modifier[modifier][item];

                                if (infoItem.checked) {

                                    info = {
                                        "modifier": infoItem.modifier,
                                        "modifierItem": infoItem.modifierItem,
                                        "price": infoItem.price,
                                        "amount": 1
                                    };
                                    infoModifierGroup.modifiers.push(info);

                                }
                            }
                        }

                        result.modifiersGroups.push(infoModifierGroup);
                        infoModifierGroup = null;
                    }
                }
            }

            return result;
        },

        validateModifiers: function () {

            let result = true;
            let countModifier = Object.keys(this.purchase.modifiers).length;

            if (countModifier > 0) {
                for (let modifier in this.purchase.modifiers) {
                    let infoItem = this.purchase.modifiers[modifier]['conf'];
                    let selectUnique = infoItem.selectUnique;
                    let maxSelect = infoItem.maxSelect;
                    let count = this.countCheckedModifier(modifier);
                    if (infoItem.required === true) {
                        if (selectUnique) {
                            //selección unica
                            if (count !== 1) {
                                notificationGeneral('Campos requeridos en ' + infoItem.name, {type: 'notice'});
                                result = false;
                            }
                        } else {
                            maxSelect = maxSelect ? maxSelect : 1;
                            //selección multiple
                            if (!((count > 0) && (count <= maxSelect))) {
                                notificationGeneral('Campos requeridos en ' + infoItem.name, {type: 'notice'});
                                result = false;
                            }
                        }
                    }
                }
            }
            return result
        },
        validateModifiersGroups: function () {

            let result = true;
            let countModifierGroup = Object.keys(this.purchase.modifiersGroups).length;

            if (countModifierGroup > 0) {

                for (let modifierGroup in this.purchase.modifiersGroups) {
                    for (let modifier in this.purchase.modifiersGroups[modifierGroup].modifier) {
                        
                        let infoItem = this.purchase.modifiersGroups[modifierGroup].modifier[modifier]['conf'];
                        let selectUnique = infoItem.selectUnique;
                        let maxSelect = infoItem.maxSelect;
                        let count = this.countCheckedModifierGroup(modifierGroup, modifier);
                        
                        if (infoItem.required === true) {
                            
                            if (selectUnique) {
                                
                                if (count !== 1) {
                                    
                                    notificationGeneral('Campos requeridos en ' + infoItem.name, {type: 'notice'});
                                    result = false;
                                }
                            } else {
                                
                                maxSelect = maxSelect ? maxSelect : 1;
                                
                                if (!((count > 0) && (count <= maxSelect))) {
                                    
                                    notificationGeneral('Campos requeridos en ' + infoItem.name, {type: 'notice'});
                                    result = false;
                                }
                            }
                        }
                    }
                }
            }
            return result
        },
        /**
         * Obtiene la url de la imagen de una categoría o una por defecto.
         */
        getImage: function (product) {
            if (product.image && product.image.url) {
                return product.image.url;
            } else {
                return "/generic/images/no_found.png";
            }
        },
        collapsibleAnimation: function (modifier, event) {
            let article = $(".modifier-" + modifier);

            if (article.children().hasClass('checkboxDiv')) {

                if (article.hasClass('displayNone')) {
                    article.slideDown("slow", function () {
                        article.removeClass('displayNone');
                    });
                } else {
                    article.slideUp("slow", function () {
                        article.addClass('displayNone');
                    });
                }
            }
        }
    },
});

$(document).ready(function () {
    //Si posee pointSale deben cargar los productos con esa url.
    var pathname = window.location.pathname;
    if (pathname.includes("products")) {
        try {
            var model = JSON.parse($('#modelProduct').html());
            let url = window.location.href;
            let pointSale = getPointSale();

            if (pointSale && pointSale.rid) {
                if (!url.includes('pointSale=')) {
                    redirect(pathname);
                }
            }
            products.setup(model);
        } catch (error) {
            console.error(" error cargando el modelo de productos", error);
        }
    }
});





