/**
 * trae lso datos de una colección
 */
function getCollections() {
    var pointsaleGet = '';
    var pointsale = getLocalStorage(nameStorage.pointSale)?JSON.parse(getLocalStorage(nameStorage.pointSale)) : null;
    if (pointsale && pointsale.id) {
        pointsaleGet = "&pointsale=" + pointsale.id;
    }

    $.ajax({
        url: '/api/collection?slug=promo&limit=1' + pointsaleGet,
        type: 'get',
        contentType: "application/json; charset=utf-8",
        success: function (server) {

            /** Analytics **/
            var params = {};
            params[Properties.CONTENT_NAME] = "collections";
            Analytics.track(EVENTS.VIEW_CONTENT, params);
            appCollection.trackCollection();
            /** **/

            if (server) {
                appCollection.promo(server);
            }
            $('.preload').hide(300);
        },
        error: function (xhr, status, error) {
                window.location.href = "/checkout";
                $('.preload').hide(300);
        }
    });
}

var appCollection = new Vue({
    el: '#modalPromo',
    data: {
        "status": false,
        "products": [],
        "selected": {},
        "model": {},
    },
    methods: {
        setup: function () {
            let pointSale = getPointSale();
            if (pointSale && pointSale['rid']) {
                $(".modalCollection").click();
            }
        },
        getSuggested: function () {
            // let pointSale = getPointSale();
            // console.log(pointSale);
            // var data = {"category": "coolers","pointSale": pointSale.slug  };
            // apiAjax("collection", "post", data).then((response) => {
            //     if (response[0] && response[0].result && response[0].result.length > 0) {
            //         console.log("suggested",response);
            //         $(".modalCollection").click();
            //         this.model = response[0].result[0];
            //         this.products = response[0].result[0].products;
            //     }
            //     else {
            //       this.goToCheckout();
            //     }
            //
            // }, error => {
            //     this.goToCheckout();
            //     console.error("Error eliminando producto del carrito:::", error);
            // });
            this.goToCheckout();
        },
        getUrlImage: function (product, background= false) {
            var url = background ? 'background-image: url("generic/images/no_found.png")' : '/generic/images/no_found.png';
            if (product.image && product.image.thumbnail) {
                url = background ? 'background-image: url("' + product.image.thumbnail + '")' : product.image.thumbnail ;
            }
            return url;
        },
        shop: function (product, event) {
            if (product.isAvailable) {
                let cart = getLocalStorage(nameStorage.cartId);
                let pointSale = getPointSale();
                this.send = false; // previene varios click

                if (pointSale && pointSale['rid']) {
                    let data = {};
                    if (cart) data['cartId'] = cart;
                    data['pointSale'] = pointSale['rid'];
                    
                    console.log("compra0", data);
                    if (this.validate(product)) { 
                        data['cartItems'] = this.formatCart(product);
                        console.log("compra1",data);
                        apiAjax("cart", "post", data).then((response) => {
                            console.log("respuesta", response);
                            response = response[0]?response[0]: null;
                            cartCount(response.totalAmount);
                            notificationGeneral(message.add_cart);
                            $(".header-view .close").click();
                            $.magnificPopup.instance.close();
                        }, error => {
                            this.clean();
                            this.send = true;
                            element_sel.stopLoading();
                            console.error("ERROR_SAVECART", error);
                        });

                    }
                    else {
                        notificationGeneral("El item sugerido no puede ser comprado. Comuniquese con el administrador.", {type: 'warning'});
                    }
                } 
            }
            else {
                console.log("NOT AVAILABLE");
            }
        },
        validate: function (product) {
            let result = true;
            if (product.modifiers && product.modifiers.length  > 0) {
                for (let modifier in product.modifiers) {
                    if (modifier.required) {
                        result = false;
                    }
                }
            }
            return result
        },
         /**
         * Genera la estructura necesaria para que los elementos seleccionadas
         * se guarden correctamente en el carrito.
         */
        formatCart: function (product) {
            let result = {
                "amount": 1,
                "price": product.price,
                "product": product['rid'],
                "comment": "Web",
                "modifiers": [],
                "modifiersGroups": [],
            };

            return result;
        },
        goToCheckout: function () {
            //TODO: comprobar estos campos
            var minOrder = appCart.service.coverages[0].minOrderPrice;
            var totalItems = appCart.model.totalItems;

            if (totalItems <= minOrder) {
                notificationGeneral("tu compra debe se mayor a $"+ minOrder ,{type: "notice"}); 
            }
            else {
                var user = jsonParse(getLocalStorage(nameStorage.consumer));
                var cartId = getLocalStorage(nameStorage.cartId);
                if (user && user["rid"]) {

                    var cart = {
                        user : user["rid"],
                    };
    
                    let params = {cart: cart, cartId: '#'+cartId };
                    apiAjax("updateCart", "put", params).then(response => {
                        redirect("/checkout");
                    }, error => {
                        console.error("ERROR_UPDATEDCARTCOLLECTION", error);
                    });
                } else {
                    var cart_id = getLocalStorage(nameStorage.cartId);
                    var next_url = "/login?next=/checkout";
                    //var next_url = "/login?next=/cart?id=" + cart_id;
                    redirect(next_url);
                }  

            }
            
        },

        promo: function (collections) {
            if (collections && collections.length > 0) {
                if (collections[0]["products"] && collections[0]["products"].length > 0) {
                    this.status = true;
                    this.products = collections[0].products;
                    $('.modales').click();
                } else {
                    window.location.href = '/checkout';
                }
                $('.preload').hide(300);
            } else {
                $('.preload').hide(300);
                window.location.href = '/checkout';
            }
        },
        selectedProduct: function (product, event) {
            event.stopPropagation();
            var element_sel = $(event.currentTarget);
            element_sel.startLoading({show_text: false});
            this.selected = product;
            this.add(product, element_sel);
        },
        currencyFormat: function (value) {
            if (value) {
                return "$ " + value.toLocaleString();
            }
        },
        detalle: function (productId) {
            pointsale = getCookie("pointsale_id") ? "&pointsale=" + getCookie("pointsale_id") : '';
            window.location.href = "/detail?id=" + productId + pointsale;
        },
        add: function (data, element_sel) {
            var cart = getLocalStorage(nameStorage.cartId);
            var pointsale = JSON.parse(getLocalStorage(nameStorage.pointSale));

            //existe un carrito en el storage
            if (cart) data['cartId'] = cart;
            if (pointsale.id) data['pointsale'] = pointsale.id;

            $.ajax({
                type: 'post',
                url: '/api/addToCart',
                contentType: "application/json; charset=utf-8",
                data: JSON.stringify(data),
                dataType: 'json'
            })
                .done(data => {
                    //todo: cuidado al ser nuevo un item de carrito en modal
                    if (data.id) {
                        appCart.model = data;
                        appCart.subTotal();
                        setLocalStorage(nameStorage.cartCount, data.count);
                        $("a.carrito b").text(getLocalStorage(nameStorage.cartCount));
                        $("a.carrito .animated li").text(getLocalStorage(nameStorage.cartCount));

                    }
                    element_sel.stopLoading();
                    notificationGeneral("Tu producto se ha agregado al carrito", {type: "success"});
                });

        },
        trackCollection: function () {
            /** Analytics **/
            Analytics.track(EVENTS.INITIATE_CHECKOUT, {});
            /** **/
        }
    }
});
