$(window).load(function () {
    $('.cd-cart-trigger').hide();
});

$(document).ready(function () {
    hasNotification();
    bill.setup();
});

/**
 * app de la factura de un cliente
 * @type {Vue}
 */
var bill = new Vue({
    el: '#bill',
    data: function () {
        return {
            "model": {}
        }
    },
    methods: {
        /**
         * carga inical de la factura
         */
        setup: function () {
            var model = JSON.parse($('#modelorder').html());
            if (model) {
                this.model = model;
            }

            /** Analytics **/
            var params = {};
            params[Properties.CONTENT_NAME] = "bill";
            Analytics.track(EVENTS.VIEW_CONTENT, params);
            /** **/

            this.isQualify();
        },
        currencyFormat: function (value) {
            if (value) {
                return "$ " + value.toLocaleString();
            } else {
                return "$ 0";
            }
        },
        nameModifierFormat: function (value) {
            if (value) {
                let resp = value.split(" ");
                return resp[0];
            }
        },
        /**
         * redirección al listado de ordenes
         */
        redirectOrders: function () {
            return '/orders/' + this.model.user["@rid"].replace("#", "");
        },
        /**
         * Transforma la fecha de db a una fecha humanizada.
         * @param date : fecha createdAt
         */
        generateDate: function (date) {
            var date = moment(date);
            var dateComponent = date.format('YYYY-MM-DD');
            var timeComponent = date.format('HH:mm');
            return "Fecha: " + dateComponent + " Hora: " + timeComponent;
        },
        // hasDetails: function (product) {
        //     if (product.modifiers.length > 0 || product.modifiersGroups.length > 0
        //         || product.valueMeals.length > 0) {
        //         return true;
        //     }
        //     else {
        //         return false;
        //     }
        // },
        /**
         * Abre modal de calificación si la orden fue entregada.
         */
        isQualify: function () {
            if (this.model.stateCurrent.name === "Entregado") {
                qualify.order_id = this.model["@rid"];
                $('.eventRating').click();
            }
        }
    }
});