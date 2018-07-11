$(document).ready(function () {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
        var config = {
            apiKey: serviceConfig.firebase_url,
            authDomain: serviceConfig.firebase_domain,
            databaseURL: serviceConfig.firebase_url
        };

        firebase.initializeApp(config);
        var rootRef = firebase.database().ref('states/' + env.MODE.toLowerCase());
        rootRef.limitToLast(1).on('child_added', function (event) {
            if (getLocalStorage(nameStorage.orderId) && getLocalStorage(nameStorage.consumer)) {
                let consumer = JSON.parse(getLocalStorage(nameStorage.consumer));
                if (consumer && consumer.objectId === event.val().consumer && getLocalStorage(nameStorage.orderName) !== event.val().stateName &&
                    event.val().stateName !== 'Calificado' && getLocalStorage(nameStorage.orderId) === event.val().order) {
                    var body = {consumer: consumer.objectId, id: getLocalStorage(nameStorage.orderId)};
                    apiAjax("order", "post", body).then(order => {
                        var message = "Estado del pedido";
                        var icon = '/generic/images/icon_notif_solicitado.png';
                        if (event.val().stateName.includes('Cancelado')) {
                            icon = '/generic/images/icon_notif_solicitado.png';
                        }
                        setLocalStorage(nameStorage.orderName, event.val().stateName);
                        if (order[0]["items"][0]["messagePushCustom"]) {
                            message = order[0]["items"][0]["messagePushCustom"];
                        }

                        if (event.val().stateName === "Entregado") {
                            $('.eventRating').click();
                        }

                        notificationThree('Pedido ' + event.val().stateName, message, icon);

                    }, error => {
                        console.error("ERROR_FIREBASE_ORDER", error);
                    });

                }
            }
        }, function (errorObject) {
            console.error("ERROR_FIREBASE", errorObject);
        });
    }else{
        console.info("Notificaciones no soportadas");
    }
});