$(window).load(function () {

    /** Analytics **/
    var params = {};
    params[Properties.CONTENT_NAME] = "orders";
    Analytics.track(EVENTS.VIEW_CONTENT, params);
    /** **/

     var model = JSON.parse($('#modelorders').html());
     orders.setup(model);
});

var orders = new Vue({
    el: '.list_pedidos_fijos',
    data: function () {
        return {
            "status": false,
            "model": [],
        }
    },
    methods: {
        /**
         * carga inical del listado de ordenes
         * @param model
         */
        setup: function (model) {
            if (model) {
                this.model = model;
            }
        },
        /**
         * Ridirecciona a la factura seleccionada.
         * @param id 
         */
        bill: function (id) {
            return '/bill/' + id.replace("#", "");
        },
        /**
         * Url para mostrar una imagen de la ubicación del pedido.
         * @param order : objeto
         */
        urlStatic: function (order) {
            if (order) {
                var url = "http://maps.googleapis.com/maps/api/staticmap?size=200x200&sensor=false&markers=latitude,longitude&key=AIzaSyAOzAmb-jrPflphdUKGvGSiP8-vhRbPBuM";
                url = url.replace("latitude", order.pointSale.location.coordinates[1]);
                url = url.replace("longitude", order.pointSale.location.coordinates[0]);
                return url;
            }
        },
        currencyFormat: function (value) {
            if (value) {
                return "$ " + value.toLocaleString();
            } else
                return "$ 0";
        },
        /**
         * Transforma la fecha de db a una fecha humanizada.
         * @param date : fecha createdAt
         */
        formatDate: function (date) {
            var moment_date = moment(date);
            var dateComponent = moment_date.format('YYYY-MM-DD');
            var timeComponent = moment_date.format('HH:mm');
            return "Fecha: " + dateComponent +' '+timeComponent;
        },
    }
});