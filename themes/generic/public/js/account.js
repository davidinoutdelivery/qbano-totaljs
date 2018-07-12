$(document).ready(function () {
    var user = jsonParse(getLocalStorage(nameStorage.consumer));
    if (user) {
        account.setup(user);
    }
    else {
        window.location = '/login';
    }
});


/**
 * app de los detalles de la cuenta de usuario
 * @type {Vue}
 */
var account = new Vue({
    el: '#account_app',
    data: {
        address: '',
        orders:'',
        user_data: {}
    },
    methods: {
        /**
         * carga inical de la cuenta
         */
        setup: function (user) {

            /** Analytics **/
            var params = {};
            params[Properties.CONTENT_NAME] = "account";
            Analytics.track(EVENTS.VIEW_CONTENT, params);
            /** **/
            
            if (user["rid"]) {
                this.address = '/address/'.concat(user["rid"].replace("#", ""));
                this.orders = '/orders/'.concat(user["rid"].replace("#", ""));
                this.user_data = user;
            }
            else {
                this.user_data = {} 
            }
        },
        /**
         * Cierra sessión y elimina todo el localstorage
         */
        logout: function () {
            apiAjax('logout', 'post', {}).then(user => {
                localStorage.clear();
                deleteAllCookies();
                Analytics.track(EVENTS.LOGOUT, {});
                window.location = '/login';
                
            }, function (error) {
                console.log("Ha ocurrido un error consultado el usuario", error);
            });
        }
    }
});
