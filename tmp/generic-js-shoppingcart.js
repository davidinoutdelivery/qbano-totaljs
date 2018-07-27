$(document).ready(function () {
    if (window.location.pathname.includes("/cart")) {
        try {
            var model = JSON.parse($('#modelcart').html());
            appCart.setup(model);
        } catch (error) {
            appCart.model = {};
            console.warn(" error cargando el modelo del carrito", error);
        }
    }
});

/**
 * app principal que administra lo relacionado con el carrito
 * @type {Vue}
 */
var appCart = new Vue({
    el: '#carrito',
    data: function () {
        return {
            "model": { 
                "items": {},
            },
            "service": {}
        }
    },
    methods: {
        setup:function (model) {
            console.log("SHOPINGCART", model);
            if (Object.keys(model).length > 0) {
                this.model = model;
                cartCount(model.totalAmount);
                //this.cartItemCounter();
                //$(".openCart").click();

                /** Analytics **/
                var params = {};
                params[Properties.CONTENT_NAME] = "cart";
                Analytics.track(EVENTS.VIEW_CONTENT, params);
                /** **/

                var pointSale = getPointSale();
                this.service = pointSale.services[0];
            }
        },
        getCart: function () {
            var element_sel = $("#carrito");
            element_sel.startLoading({show_text: false});

            var cartId = getLocalStorage(nameStorage.cartId);
            var pointSale = getPointSale();
            
            var serviceId = pointSale.services[0]["rid"];
            console.log("GETCART", pointSale, serviceId);
            if (cartId) {
                apiAjax("getCart", "post", {cartId: cartId, serviceId: serviceId}).then((response) => {
                    console.log("RESP CART: ", response);
                    if (response.length > 0 && response[0].getCart) {
                        var model= response[0].getCart;
                        this.setup(model);
                        element_sel.stopLoading();
                    } else {
                        console.error("Carrito vacío");
                        element_sel.stopLoading();
                    }
                }, error => {
                    element_sel.stopLoading();
                    console.error("Error Obteniendo el carrito:::", error);
                });
            }
            else {
                element_sel.stopLoading();
            }
        },
        /**
         * Actualiza un item del carrito como por ejemplo la cantidad
         */
        updateItem: function(id, dict, index) {
            var data = {"itemId": id, 
                        "item": dict, 
                        "cartId": getLocalStorage(nameStorage.cartId), 
                        //"serviceId": this.service["rid"],
                    };

            if (dict.amount > 0) {
                apiAjax("updateCartItem", "put", data).then((response) => {
                    console.log(response);
                    this.model= response[0].getCart;
                    this.cartItemCounter();
                }, error => {
                    console.error("Error actualizando item:::", error);
                });
            }
        },
        /**
         * Actualiza el contador de items agregados en el carrito
         */
        cartItemCounter: function () {
            var total = 0;
            if (Object.keys(this.model).length > 0) {
                for (var item of this.model.items) {
                    total += item.amount;
                }
            }
            
            setLocalStorage(nameStorage.cartCount, total.toString());
            $("a.carrito b").text(getLocalStorage(nameStorage.cartCount));
            $("a.carrito .animated li").text(getLocalStorage(nameStorage.cartCount)); 
        },
        /**
         * elimina un item del carrito
         * @param index
         */
        deleteItemCart: function (id, event) {
            event.stopPropagation();
            var element_sel = $(event.currentTarget);
            element_sel.startLoading({show_text: false});

            var data = {"cartId": getLocalStorage(nameStorage.cartId),
                        "itemId": id,
                        "serviceId": this.service["@rid"],
                    };
            apiAjax("deleteCartItem", "delete", data).then((response) => {
                this.model = response[0].getCart;
                cartCount(response[0].getCart.totalAmount);
                //this.cartItemCounter();
                element_sel.stopLoading();
                notificationGeneral(message.delete_item_cart, {type: "success"});
            }, error => {
                 element_sel.stopLoading();
                 console.error("Error eliminando producto del carrito:::", error);
            });
        },
        clear: function () {
            var btn_empty_cart = $("#btn_empty_cart");
            btn_empty_cart.startLoading({msg: "Vaciando"});
            var data = {cartId: this.model['@rid'].replace("#", "")};
            apiAjax("emptyCart", "delete", data).then((response) => {
                console.log("SEBORROTOF", response);
                this.model= response[0];
                this.cartItemCounter();
                notificationGeneral(message.delete_cart);
                btn_empty_cart.stopLoading();
            }, error => {
                 element_sel.stopLoading();
                 console.error("Error eliminando el carrito:::", error);
            });
        },
        updatecart: function () {
            appCollection.getSuggested();
        },
        getCollections: function () {
            products.getSuggested();
            $(".modalCollection").click();
        },
        getUrlImage: function (product, background= false) {
            var url = background ? 'background-image: url("generic/images/no_found.png")' : '/generic/images/no_found.png';
            if (product.image && product.image.url) {
                url = background ? 'background-image: url("' + product.image.url + '")' : product.image.url ;
            }
            return url;
        },
        increment: function (index) {
            this.model.cartItems[index].amount += 1;
            //this.model.items[index].subTotal = this.model.items[index].subTotal* this.model.items[index].amount;

            this.subTotal();
        },
        decrement: function (index) {
            if (this.model.cartItems[index].amount > 1) {
                this.model.cartItems[index].amount -= 1;
                this.subTotal();
            }
        },
        subTotal: function () {
            var result = 0;
            for (var it of this.model.cartItems) {
                var tmp = 0;
                tmp += (it.price * it.amount);

                if (it.modifiers.length > 0) {
                    for (modifier of it.modifiers) {
                        tmp += (modifier.price * it.amount);
                    }
                }

                if (it.modifiersGroups.length > 0) {
                    for (var modifierg of it.modifiersGroups) {
                        if (modifierg.modifiers.length > 0) {
                            for (group of modifierg.modifiers) {
                                tmp += (group.price * it.amount);
                            }
                        }
                    }
                }

                if (it.productsCoupons.length > 0) {
                    for (var coupon of it.productsCoupons) {
                        //modifiersGroups
                        if (coupon.modifiersGroups.length > 0) {
                            for (var modifierg of coupon.modifiersGroups) {
                                if (modifierg.modifiers.length > 0) {
                                    for (var group of modifierg.modifiers) {
                                        tmp += (group.price * it.amount);
                                    }
                                }
                            }
                        }
                        //modifiers
                        if (coupon.modifiers.length > 0) {
                            for (var modifier of coupon.modifiers) {
                                tmp += (modifier.price * it.amount);
                            }
                        }
                    }
                }

                result += tmp;
            }

            this.model.total = result;
            this.calc.subtotal = result;
            this.calc.total = result + this.calc.deliverycost - (this.model.costCoupon ? this.model.costCoupon : 0);
        },
        subTotalItem: function (item) {
            var tmp = 0;
            tmp += (item.price * item.amount);

            if (item.modifiers.length > 0) {
                for (modifier of item.modifiers) {
                    tmp += (modifier.price * item.amount);
                }
            }

            if (item.modifiersGroups.length > 0) {
                for (var modifierg of item.modifiersGroups) {
                    if (modifierg.modifiers.length > 0) {
                        for (var group of modifierg.modifiers) {
                            tmp += (group.price * item.amount);
                        }
                    }
                }
            }

            if (item.productsCoupons.length > 0) {
                for (var coupon of item.productsCoupons) {
                    //modifiersGroups
                    if (coupon.modifiersGroups.length > 0) {
                        for (var modifierg of coupon.modifiersGroups) {
                            if (modifierg.modifiers.length > 0) {
                                for (var group of modifierg.modifiers) {
                                    tmp += (group.price * item.amount);
                                }
                            }
                        }
                    }
                    //modifiers
                    if (coupon.modifiers.length > 0) {
                        for (var modifier of coupon.modifiers) {
                            tmp += (modifier.price * item.amount);
                        }
                    }
                }
            }

            return tmp;

        },
        updatecart1: function () {
            console.log("UPDATE CART!");
            var btn_go_to_checkout = $("#btn_go_to_checkout");
            btn_go_to_checkout.startLoading();
            this.isOpen().then((response) => {
                if (response && response["schedules"] && !response["schedules"]["isOpen"]) {
                    btn_go_to_checkout.stopLoading();
                    notificationFive(message.closed_business);
                } else {
                    $(".closeAlert").click();
                    // son los datos del get y para hacer un update el product, el modifier y modifieritem no pueden ser objetos
                    var update = jQuery.extend(true, {}, this.model);

                    for (var item of update.items) {
                        item.product = item.product.id;
                        delete item.subTotal;

                        if (item.modifiers.length > 0) {
                            for (var modifier of item.modifiers) {
                                modifier.modifierItem = modifier.modifierItem.id;
                                modifier.modifier = modifier.modifier.id;
                            }
                        }
                        if (item.modifiersGroups.length > 0) {
                            for (var modifiergroup of item.modifiersGroups) {
                                modifiergroup.group = modifiergroup.group.id;
                                if (modifiergroup.modifiers.length > 0) {
                                    for (modi of modifiergroup.modifiers) {
                                        modi.modifierItem = modi.modifierItem.id;
                                        modi.modifier = modi.modifier.id;
                                    }
                                }
                                else {
                                    item.modifiersGroups = [];
                                }
                            }
                        }

                        if (item.productsCoupons.length > 0) {
                            for (var coupon of item.productsCoupons) {
                                delete coupon.id;
                                coupon.product = coupon.product.id;
                                delete coupon.subTotal;

                                if (coupon.modifiers.length > 0) {
                                    for (var modifier of coupon.modifiers) {
                                        modifier.modifierItem = modifier.modifierItem.id;
                                        modifier.modifier = modifier.modifier.id;
                                    }
                                }
                                if (coupon.modifiersGroups.length > 0) {
                                    for (var modifiergroup of coupon.modifiersGroups) {
                                        modifiergroup.group = modifiergroup.group.id;
                                        if (modifiergroup.modifiers.length > 0) {
                                            for (var modi of modifiergroup.modifiers) {
                                                modi.modifierItem = modi.modifierItem.id;
                                                modi.modifier = modi.modifier.id;
                                            }
                                    } else {
                                        coupon.modifiersGroups = [];
                                    }
                                }
                            }
                        }
                    }
                }

                    $.ajax({
                        type: 'put',
                        url: '/api/updateCart',
                        contentType: "application/json; charset=utf-8",
                        data: JSON.stringify(update),
                        dataType: 'json'
                    })
                        .done(data => {
                            setLocalStorage(nameStorage.cartCount, data.count.toString());
                            $("a.carrito b").text(getLocalStorage(nameStorage.cartCount));
                            $("a.carrito .animated li").text(getLocalStorage(nameStorage.cartCount));
                            if (Parse.User.current() && getLocalStorage(nameStorage.consumer)) {
                                getCollections();
                                btn_go_to_checkout.stopLoading();
                            } else {
                                var cart_id = getLocalStorage(nameStorage.cartId);
                                var next_url = "/login?next=/cart?id=" + cart_id;
                                redirect(next_url);
                            }
                        }).fail(function (reason) {
                            btn_go_to_checkout.stopLoading();
                            console.warn("no se actualizo el carrito", reason);
                        });
                }
            }, function (error) {
                btn_go_to_checkout.stopLoading();
                console.error("Error consultado si el comercio esta abierto o cerrado:::", error);
            });
        },
        validation: function () {
            if (this.calc.subtotal <= minOrderPrice) {
                notificationOne(message.order_price + minOrderPrice);
                return false;
            }
            else if (!delivery) {
                notificationOne(message.close_delivery);
                return false;
            }
            return true
        },
        currencyFormat: function (value) {
            if (value || value === 0) {
                return "$ " + value.toLocaleString() + "";
            } else {
                return "";
            }
        },
        isCart: function () {
            if (!this.model.cartItems) return false;
            if (this.model.cartItems.length > 0) {
                return true;
            } else {
                return false;
            }
        },
        //verifica si existen detalles
        hasDetails: function (product) {
            if ((product.cartItemModifiers && product.cartItemModifiers.length > 0) || 
            ( product.cartItemModifierGroups && product.cartItemModifierGroups.length > 0) || 
            (product.cartItemProductGroups && product.cartItemProductGroups.length > 0)) {
                return true;
            }
            else {
                return false;
            }
        },
        // Valida si una cadena de texto es vacía o compuesta de solo espacios en blanco
        isEmptyString: function (str) {
            if (typeof str !== "undefined") {
                if (str === "" || !str.replace(/\s/g, '').length) {
                    return true;
                }
                return false;
            }
            return true;
        },
        /**
         * verifica  si el comercio esta abierto o cerrado
         * @returns {Promise}
         */
        isOpen: function () {
            return new Promise((resolve, reject) => {
                var pointsale = getLocalStorage(nameStorage.pointSale) ? JSON.parse(getLocalStorage(nameStorage.pointSale)) : null;
                if (pointsale && pointsale["id"]) {
                    $.ajax({
                    type: 'get',
                    url: '/api/pointSaleIsOpen?id=' + pointsale["id"],
                    contentType: "application/json; charset=utf-8",
                    dataType: 'json'
                }).then((data) => {
                    resolve(data);
            }).fail(err => {
                    reject(err);
            });
            } else {
                reject("sin punto de venta");
            }
        });
        },
        cleaning: function(cart){
            console.log(cart);
            for (let item of cart.cartItems) {
                
                 // Modificadores
                if (item.product.modifier && Object.keys(item.product.modifier).length > 0) {
                    item.product.modifier = Object.values(item.product.modifier);
                    for (let modifier of item.product.modifier) {
                        if (modifier.modifierItems && Object.keys(modifier.modifierItems).length > 0) {
                            modifier.modifierItems = Object.values(modifier.modifierItems);
                        }
                    }
                }
                // Grupo de modificadores
                if (item.product.modifierGroups && Object.keys(item.product.modifierGroups).length > 0) {
                    item.product.modifierGroups = Object.values(item.product.modifierGroups);
                    for (let modifierGroup of item.product.modifierGroups) {
                        if (modifierGroup.modifiers && Object.keys(modifierGroup.modifiers).length > 0) {
                            modifierGroup.modifiers = Object.values(modifierGroup.modifiers);
                        }
                    }
                }

            }
            return cart;
        },
    },
    computed: {
        total: function () {
          return this.model.items.total + this.service.cost;
        }
    },
});

// $("#modalPromo").on("click", ".mfp-close", function () {
//     $.magnificPopup.close();
// });

// $('.cd-cart-trigger').hide();

// $(".addToCart").on('click', function (ev) {
//     ev.preventDefault();
//     formData = serializedAll('f');
//     addToCart(formData);
// });

// $(".getCart").on('click', function (ev) {
//     ev.preventDefault();
//     getCart();
// });

// $(".delete").on('click', function (ev) {
//     ev.preventDefault();
//     var cartId = getLocalStorage('cartId');
//     var itemId = $(this).attr('data-id');
//     deleteItem(cartId, itemId);
// });

// $(".deleteAll").on('click', function (ev) {
//     ev.preventDefault();
//     var cartId = getLocalStorage('cartId');
//     deleteCart(cartId);
// });

// $(".restar1").on('click', function (ev) {
//     ev.preventDefault();
//     var model = JSON.parse($('#modelcart').html());
//     var cantidad = parseInt($(this).parent().find("input").val());
//     var ited = $(this).parent().find("input").attr('data-id');
//     var cantidad = parseInt($(this).parent().find("input").val());

//     if (cantidad > 1)
//         $(this).parent().find("input").val(cantidad - 1);

//     for (var i = 0; i < model.items.length; i++) {
//         if (model.items[i].id === ited) {
//             model.items[i]["amount"] = cantidad - 1;
//         }
//     }

//     $.ajax({
//         type: 'put',
//         url: '/api/updateCart',
//         contentType: "application/json; charset=utf-8",
//         data: JSON.stringify(model),
//         success: function (server) {
//             location.reload();
//         },
//         error: function (xhr, status, error) {
//             console.log(error);
//         },
//         dataType: 'json'
//     });

// });

// $(".mas1").on('click', function (ev) {
//     ev.preventDefault();
//     var model = JSON.parse($('#modelcart').html());
//     var cantidad = parseInt($(this).parent().find("input").val());
//     var ited = $(this).parent().find("input").attr('data-id');

//     if (cantidad >= 1)
//         $(this).parent().find("input").val(cantidad + 1);


//     for (var i = 0; i < model.items.length; i++) {
//         if (model.items[i].id === ited) {
//             model.items[i]["amount"] = cantidad + 1;
//         }
//     }
//     $.ajax({
//         type: 'put',
//         url: '/api/updateCart',
//         contentType: "application/json; charset=utf-8",
//         data: JSON.stringify(model),
//         success: function (server) {
//             location.reload();
//         },
//         error: function (xhr, status, error) {
//             console.log(error);
//         },
//         dataType: 'json'
//     });
// });

// function deleteItem(cartId, itemId) {
//     var model = {cartId: cartId, itemId: itemId};
//     $.ajax({
//         type: 'delete',
//         url: '/api/deleteCartItem',
//         contentType: "application/json; charset=utf-8",
//         data: JSON.stringify(model),
//         success: function (server) {
//             location.reload();
//         },
//         error: function (xhr, status, error) {
//             console.log(error);
//         },
//         dataType: 'json'
//     });
// }

// function deleteCart(cartId) {
//     var model = {cartId: cartId};
//     $.ajax({
//         type: 'delete',
//         url: '/api/emptyCart',
//         contentType: "application/json; charset=utf-8",
//         data: JSON.stringify(model),
//         success: function (server) {
//             localStorage.removeItem('cartId');
//             Analytics.track(Events.COLLAPSE_CART, {});
//         },
//         error: function (xhr, status, error) {
//             console.log(error);
//         },
//         dataType: 'json'
//     });
// }

// /**
//  * product es el formulario
//  */
// function addToCart(formData) {
//     var cart = getLocalStorage('cartId');
//     var pointsale = JSON.parse(getLocalStorage('pointsaleAll'));
//     var model = JSON.parse($('#modeldata').html());
//     model['purchase'] = serializeObject(formData);
//     //existe un carrito en el storage
//     if (cart) model['cartId'] = cart;

//     if (pointsale.id) model['pointsale'] = pointsale.id;

//     $.ajax({
//         type: 'post',
//         url: '/api/addToCart',
//         contentType: "application/json; charset=utf-8",
//         data: JSON.stringify(model),
//         success: function (server) {
//             if (server.id) {
//                 setLocalStorage("cartId", server.id);
//                 $("a.carrito").attr("href", "/cart?id=" + getLocalStorage("cartId"));

//                 setLocalStorage(nameStorage.cartCount, server.count);
//                 $("a.carrito b").text(getLocalStorage(nameStorage.cartCount));
//                 $("a.carrito .animated li").text(getLocalStorage(nameStorage.cartCount));
//             }
//             notificationOne("Tu producto se ha agregado al carrito");
//         },
//         error: function (xhr, status, error) {
//             console.log(error);
//         },
//         dataType: 'json'
//     });
// }

// /**
//  * serializa un formulario con todos sus checkbox sin importar sin
//  * estan unchecked
//  */
// function serializedAll(formName) {
//     formData = $('#' + formName).serializeArray();
//     $.each($('#' + formName + ' input[type=checkbox]')
//             .filter(function (idx) {
//                 return $(this).prop('checked') === false
//             }),
//         function (idx, el) {
//             // attach matched element names to the formData with a chosen value.
//             formData.push({name: $(el).attr('name'), value: 'off'});
//         });
//     return formData;
// }

// function serializeObject(formData) {
//     var o = {};
//     var a = formData;
//     $.each(a, function () {
//         separador = this.name.split(".");
//         principal = separador[0];
//         modifier = separador[1];
//         item = separador[2];

//         if (o[principal]) {
//             if (o[principal][modifier]) {
//                 o[principal][modifier][item] = this.value;
//             }
//             else {
//                 o[principal][modifier] = {};
//                 o[principal][modifier][item] = this.value;
//             }
//         }
//         else {
//             o[principal] = {};
//             o[principal][modifier] = {};
//             o[principal][modifier][item] = this.value;
//         }
//     });
//     return o;
// };

// /**
//  * dummy functions
//  */
// function closeReset() {
//     console.log("cerrando alerta fija");
// }