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
        // loadProduct: function(){    
        //     this.tiemProducts = window.setTimeout(function() {
        //         $('.gridIso').isotope({
        //               // options        
        //               itemSelector: '.grid-item',
        //               percentPosition: true,
        //               masonry: {
        //                 columnWidth: '.grid-sizer'
        //               }
        //         });
        //     },400);                  
        // },
        /**
         * Incrementa la cantidaad de un producto desde su detalle
         */
        increment: function () {
            this.purchase.amount += 1;
            let totalPrice = $('#total_price').attr('data-price');
            totalPrice *= this.purchase.amount;
            $('#total_price').text(currencyFormat(totalPrice));
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
                this.send = false; // previene varios click

                if (pointSale && pointSale['rid']) {
                    let data = {};
                    if (cartId)
                        data['cartId'] = cartId;
                    data['pointSale'] = pointSale['rid']; // indica costo de domicilio
                    data['pointSaleTypeServiceSchedule'] = pointSale.services[0].coverages[0].rid;
                    data['typeService'] = pointSale.services[0].rid;
                    data['cartItems'] = this.formatCart();
                    if (this.validate()) {
                        apiAjax("cart", "post", data).then((response) => {
                            response = response[0] ? response[0] : null;
                            if (response && response['@rid']) {
                                /** Analytics **/
                                this.trackAddToCart(this.detailProduct);
                                /** **/
                                setLocalStorage(nameStorage.cartId, response['@rid'].replace("#", ""));
                                if (!cartId) {
                                    response.totalAmount = data.cartItems.amount;
                                }
                                ;
                                cartCount(response.totalAmount);
                                this.clean();
                                this.addtocartanimation(idCategory, idProduct);
                            }
//                            notificationGeneral(message.add_cart);
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
                console.log("producto no disponible");
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
                // } else if (this.category) {
                //      let pointSale = getPointSale();
                //      if (category.categories.length > 1) {
                //         window.history.replaceState({}, '', '/categories?pointSale='+pointSale.slug);
                //      }
                //      else {
                //         window.history.replaceState({}, '', '/categories/'+category.categories[0].slug+'?pointSale='+pointSale.slug);
                //      }

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
        containsModifiers: function (status, id) {
            if (status) {
                this.detail(id);
            } else {
                this.shop(id);
            }
        },
        // getCombos: function (combo) {
        //     if (this.combos.code == combo.code) {
        //         if (!this.detailProduct.requiredCombo) {
        //             this.combos = {};
        //             this.detailProduct.price = this.total;
        //             this.detailProduct.priceDefault = this.total;
        //         }
        //     }
        //     else {
        //         this.combos = combo;
        //         this.detailProduct.price = combo.price;
        //         this.detailProduct.priceDefault = combo.price;
        //     }
        // }, isRequiredCombo: function (combo) {
        //     this.getCombos(combo);
        // },
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
        selectModifier: function (modifierId, itemId, event) {
            this.purchase.modifiers[modifierId][itemId].checked = event.target.checked;
            let count = this.countChecked(modifierId); // cuantos seleccionados existen
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

            let totalPrice = parseInt($('#total_price').attr('data-price'));
            let modifiers = null;
            let modifier = null;
            for (modifiers in this.purchase.modifiers) {
                for (modifier in this.purchase.modifiers[modifiers]) {
                    if (modifier != 'conf') {
                        if (this.purchase.modifiers[modifiers][modifier].checked === true) {
                            totalPrice += parseInt(this.purchase.modifiers[modifiers][modifier].price);
                        } else {
                            totalPrice -= parseInt(this.purchase.modifiers[modifiers][modifier].price);
                        }
                    }
                }
            }

            $('#total_price').attr('data-price', totalPrice);

            totalPrice *= this.purchase.amount;
            $('#total_price').text(currencyFormat(totalPrice));
        },
        /**
         * Cuenta la cantidad de item de un modificador que han sido seleccionados.
         * @param modifierId :: String :: identificador del modificador.
         */
        countChecked: function (modifierId) {
            let count = 0;
            for (let item in this.purchase.modifiers[modifierId]) {
                if (this.purchase.modifiers[modifierId][item].checked === true) {
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
            //Modificadores            
            if (product.modifiers && product.modifiers.length > 0) {
                for (let modifier of product.modifiers) {
                    let conf = {
                        "selectUnique": modifier.selectUnique,
                        "required": modifier.required,
                        "maxSelect": modifier.maxSelect,
                        "name": modifier.name
                    };
                    Vue.set(products.purchase.modifiers, modifier["rid"], {});
                    Vue.set(products.purchase.modifiers[modifier["rid"]], 'conf', conf);

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
                "modifiersGroups": [],
            };

            //Modificadores
            let countModifier = Object.keys(this.purchase.modifiers).length;
            if (countModifier > 0) {
                for (let modifier in this.purchase.modifiers) {
                    for (let item in this.purchase.modifiers[modifier]) {
                        let infoItem = this.purchase.modifiers[modifier][item];
                        if (infoItem.checked) {
                            let info = {
                                "modifier": infoItem.modifier,
                                "modifierItem": infoItem.modifierItem,
                                "price": infoItem.price,
                                "amount": 1, // por el momento
                            };
                            result.modifiers.push(info);
                        }
                    }

                }
            }
            return result;
        },

        validate: function () {
            let result = true;
            //Modificadores
            let countModifier = Object.keys(this.purchase.modifiers).length;
            if (countModifier > 0) {
                for (let modifier in this.purchase.modifiers) {
                    let infoItem = this.purchase.modifiers[modifier]['conf'];
                    let selectUnique = infoItem.selectUnique;
                    let maxSelect = infoItem.maxSelect;
                    let count = this.countChecked(modifier);
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





