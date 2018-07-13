var qualify = new Vue({
    el: '#modalrate',
    data: {
        score: 0,
        comment: "",
        order_id: 0,
    },
    methods: {
        selectScore: function (score) {
            if (score > 0) {
                this.score = score;
            }
        },
        sendQualify: function () {
            var btn_send_qual = $("#btn_send_qual");
            btn_send_qual.startLoading({msg: "Enviando"});
            var id = this.order_id !== 0 ? this.order_id : getLocalStorage("order_id");
            console.log(id);
            if (this.score > 0 && id) {
                var params = {orderId: id, score: this.score, comment: this.comment};
                Analytics.track(EVENTS.ORDER_RATING, params);
                rateOrder(params, qualify.qualify);
            }
        },
        qualify: function (status, result) {
            var btn_send_qual = $("#btn_send_qual");
            if (status === "OK") {
                btn_send_qual.stopLoading();
                $(".mfp-close").click();
                notificationGeneral(message.qualify_ok, {});
            }
        }
    }
});


$(document).ready(function () {
    var pathname = window.location.pathname;
    if (pathname.includes("categories")) {
        try {
            let model = JSON.parse($('#modelCategory').html());
            let url = window.location.href;
            let pointSale = getPointSale();
            if (pointSale && pointSale.rid) {
                if (!url.includes('pointSale=')) {
                    redirect(pathname);
                }
            }
            category.setup(model);
        } catch (error) {
            console.error("Error cargando el modelo de categorías", error);
        }
    }
});




