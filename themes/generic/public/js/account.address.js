$(document).ready(function () {

    var user = getLocalStorage(nameStorage.consumer);
    if (user) {
        accountAddress.setup();
    }
    else {
        window.location = '/';
        return;
    }
});

var id;

/**
 * Ejecuta el reset de punto de venta.
 */
// function reset() {
//     accountAddress.resetPointsale(accountAddress.tmpCoverage, accountAddress.tmpAddress);
// }

/**
 * Se cancela el cambio de punto de venta
 */
// function closeReset() {
//     accountAddress.addressSelect = jsonParse(getLocalStorage(nameStorage.currentAddress));
// }


/**
 * aplicacion de direccion de la cuenta de usuario
 * @type {Vue}
 */
var accountAddress = new Vue({
    el: '#account_address',
    data: function () {
        return {
            "addresses": [],
            "addressSelect": {},
            "tmpCoverage": [],
            "tmpAddress": {},
        };
    },
    methods: {
        /**
         * carga inical de la vista
         */
        setup: function () {
            Vue.set(accountAddress, "addresses", jsonParse($('#modelAddress').html()));

            //Agrega una dirección temporal al usuario logueado
            if (getLocalStorage(nameStorage.tmpAddress) && getLocalStorage(nameStorage.consumer)) {
                try {

                    /** Analytics **/
                    var params = {};
                    params[Properties.CONTENT_NAME] = "address";
                    Analytics.track(EVENTS.VIEW_CONTENT, params);
                    /** **/

                    var tmpAddress = jsonParse(getLocalStorage(nameStorage.tmpAddress));
                    var user = jsonParse(getLocalStorage(nameStorage.consumer));
                    //Agrega al usuario la dirección temporal
                    apiAddress.updateAddress(user["rid"], tmpAddress["@rid"]).then(response => {
                        removeLocalStorage(nameStorage.tmpAddress);
                        this.addresses = response;
                        var pointSale = jsonParse(getLocalStorage(nameStorage.pointSale));
                        if (pointSale && pointSale.isOpen) {
                            setLocalStorage(nameStorage.currentAddress, JSON.stringify(tmpAddress));
                            this.addressSelect = tmpAddress;
                        }                        
                    }, function (error) {
                        console.log("Error al guardar dirección temporal");
                    });
                }
                catch(e) {
                    notificationGeneral("No se puede obtener la dirección del usuario", {type: "warning"});
                }
            } else if (getLocalStorage(nameStorage.currentAddress)) {
                Vue.set(accountAddress, "addressSelect", jsonParse(getLocalStorage(nameStorage.currentAddress)));
            }
        },
        /**
         * Elimina una dirección
         * @param index
         */
        removeAddress: function (index, event) {
            event.stopPropagation();
            var user = jsonParse(getLocalStorage(nameStorage.consumer));
            if (user['rid']) {
                var element_sel = $(event.currentTarget);
                element_sel.startLoading({show_text: false});
                if (index >=0) {
                    var userId = user['rid'].replace("#", "");
                    var addressId = this.addresses[index]['@rid'].replace("#", "");
                    if (this.addressSelect) {
                        let _addressSelect = clone(this.addressSelect);
                        if (addressId && (this.addressSelect && (this.addressSelect['@rid'] !== '#'+addressId))) {
                            apiAddress.delete(userId, addressId).then((result) => {
                                element_sel.stopLoading();
                                this.addresses = result;
                                this.addressSelect = _addressSelect;
                                notificationTwo(message.delete_address);
                            }, function (error) {
                                element_sel.stopLoading();
                                console.log("error eliminando la direccion ", error);
                                notificationGeneral(message.error, {type: "error"});
                            });
                        } else {
                            element_sel.stopLoading();
                            notificationGeneral(message.error_delete_address, {type: "notice"});
                        }
                    }
                }
            }
        },
        /**
         *  Retorna la url de google maps static
         * @param address
         * @returns {{background-image: string}}
         */
        getUrlMap: function (address) {
            var url = 'https://maps.googleapis.com/maps/api/staticmap?size=200x200&sensor=false&markers=' + address.location.latitude + ',' + address.location.longitude + '&key=AIzaSyAOzAmb-jrPflphdUKGvGSiP8-vhRbPBuM';
            return {
                'background-image': 'url("' + url + '")'
            };
        },
        /**
         * selecciona la direccion por defecto
         * @param address::Object
         * @param event
         */
        selectAddress: function (address, event) {
            typeService.setup();
        },
        /**
         * reinicia todas las variables del carrito
         * @param coverage :: covertura
         * @param address :: nueva direccion seleccionada
         */
        resetPointsale: function (coverage, address) {
            if (coverage[0]['rid'] && address['@rid']) {
                address["coverage"] = coverage[0];

                removeLocalStorage(nameStorage.cartId);
                $("a.carrito").attr("href", "/cart");
                setLocalStorage(nameStorage.cartCount, "0");
                $("a.carrito b").text("0");
                $("a.carrito .animated li").text("0");


                var checkout = jsonParse(getLocalStorage(nameStorage.checkout));
                if (checkout) {
                    checkout["address"] = address;
                    setLocalStorage(nameStorage.checkout, JSON.stringify(checkout));
                }
                setLocalStorage(nameStorage.pointSale, JSON.stringify(coverage[0]));
                setLocalStorage(nameStorage.currentAddress, JSON.stringify(address));
                this.tmpCoverage = [];
                urlPointsale(coverage[0]['slug'],'/');
            }
        },
        updateAddress: function (data) {
            this.addresses = data;
            $('.close').click();
        },
        /**
         * muestra el modal de direcciones
         */
        addNewLocation: function () {
            typeService.setup();
        },
        /**
         * Indica si una dirección esta seleccionada
         */
        isSelected (address) {
            if (this.addressSelect && this.addressSelect["@rid"]) {                
                return this.addressSelect['@rid'] === address['@rid'];
            }
            else {
                return false;
            }
        }
    }
});

