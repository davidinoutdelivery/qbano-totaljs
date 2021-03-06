$(window).ready(function () {
    if (getLocalStorage(nameStorage.consumer)) {
        window.location = '/account';
        return;
    }

    var facebookId = (serviceConfig.facebookAppId) ? String(serviceConfig.facebookAppId) : "";
    loadFacebookSDK(facebookId);

});

/**
 * aplicación de login de usuario
 * @type {Vue}
 */
var userFacebook;
var login = new Vue({
    el: '#login',
    data: {
        password: "",
        email: "",
        type: "manual",
        userFacebook: {}
    },
    methods: {
        /**
         * login o registro con facebook
         */
        facebook: function () {
            FB.getLoginStatus(function (response) {
                if (response.status === 'connected') {
                    login.userExist(response.authResponse);
                } else {
                    FB.login(function (response) {
                        if (response.status === 'connected') {
                            console.log('Logged in.', response);
                            login.userExist(response.authResponse);
                        } else {
                            console.log('Logged Non.', response);
                            // The person is not logged into this app or we are unable to tell. 
                        }
                    }, {scope: 'public_profile,email,user_friends'});
                }
            });
        },
        /**
         * verifica la existencia de un usuario para loguearlo o registrarlo
         * TO-DO: deberia capturar datos de fb y enviarlo a llenar un formulario de registro
         * @param authResponse
         */
        userExist: function (authResponse) {
            let _this = this;
            FB.api('/' + authResponse.userID, {
                fields: 'email, first_name, last_name'
            }, function (response) {
                if (response.email) {
                    apiAjax('userExist', 'post', {email: response.email}).then(user => {
                        if (user.length > 0) {
                            apiAjax("loginSocial", "post", {user: {email: response.email}}).then((response) => {
                                console.log("loginsocial", response.getUser);
                                _this.trackLogin(response.getUser);
                                setLocalStorage(nameStorage.consumer, JSON.stringify(response.getUser));
                                redirect('/account');
                            }, error => {
                                notificationOne(message.login_error_user);
                                console.error("Error registro:::", error);
                            });
                        } else {
                            //CreateUser
                            var user = {
                                username: response.email,
                                email: response.email,
                                password: response.email,
                                nameFirst: response.first_name,
                                nameLast: response.last_name,
                                authData: {facebook: authResponse},
                            };

                            apiAjax("registerUser", "post", {user: user}).then((response) => {
                                setLocalStorage(nameStorage.consumer, JSON.stringify(response.createUser));
                                if (getLocalStorage(nameStorage.tmpConsumer)) {
                                    localStorage.removeItem(nameStorage.tmpConsumer);
                                }
                                redirect('/account');

                            }, error => {
                                (error.responseJSON.code && error.responseJSON.code !== 130) ? notificationGeneral(message.exists_user, {type: "notice"}) : notificationGeneral(message.error + ' Error: [' + error.responseJSON.code + ']', {type: "error"});
                                console.error("Error registro:::", error);
                            });
                        }

                    }, function (error) {
                        console.log("Ha ocurrido un error consultado el usuario", error);
                    });
                } else {
                    console.log("Usuario de fb sin email");
                }
            });
        },
        /**
         * callback de validar si un usuario existe o no
         * @param status
         * @param result
         */
        // userExisted: function (status, result) {
        //    if (!result && userFacebook) {
        //         this.getFacebookData(userFacebook);
        //     } else if (status === "OK" && result) {
        //         this.trackLogin(result, true);
        //         getConsumer(register.getConsumerCallback);
        //         if (result.code === 101) {
        //             notificationOne(message.login_error_user);
        //         }
        //     }
        // },
        /**
         * obtiene los  campos de usuario desde facebook
         */
        // getFacebookData: function (user) {
        //         if (FB) {
        //             FB.api('/me', {
        //                 fields: 'email, first_name, last_name',
        //                 access_token: authData.facebook.access_token
        //             }, function (user) {
        //                 var pathname = window.location.pathname;
        //                 if (!user.error && pathname === "/login") {
        //                     setLocalStorage(nameStorage.tmpConsumer, JSON.stringify(user));
        //                     window.location = "/register";
        //                 } else {
        //                     console.log("RESPONSE_CODE.FAIL", user);
        //                 }
        //             });
        //         } else {
        //             console.log("RESPONSE_CODE.FAIL", false);
        //         }
        // },
        /**
         * captura el evento para loguear un usuario
         * con email y contraseña
         */
        loginEmail: function () {
            var form_login_user = $("#form_login_user button[type=submit]");
            form_login_user.startLoading();
            let cartId = getLocalStorage(nameStorage.cartId);
            console.warn('LocalStorage: ', getLocalStorage(nameStorage.cartId));
            if (this.email.length > 0 &&
                    this.password.length > 0) {
                let user = {
                    email: this.email,
                    password: this.password
                };

                if (cartId) {

                    apiAjax("getCart", "post", {cartId: cartId}).then((cart) => {

                        let data = {};

                        data['cartItems'] = '[';
                        data['cartItemsModifiers'] = '[';
                        data['cartItemsModifiersGroup'] = '[';
                        data['cartItemProductGroup'] = '[';

                        let item = 0;
                        let items = cart[0].getCart.items;
                        for (item; item < items.length; item++) {

                            data['cartItems'] += items[item].rid + ',';

                            if (items[item].cartItemModifiers.length > 0) {
                                let cartItemModifiers = items[item].cartItemModifiers;

                                for (let itemModifiers = 0; itemModifiers < cartItemModifiers.length; itemModifiers++) {
                                    data['cartItemsModifiers'] += cartItemModifiers[itemModifiers].rid + ',';
                                }

                            }

                            if (items[item].cartItemModifierGroups.length > 0) {
                                let cartItemModifierGroups = items[item].cartItemModifierGroups;

                                for (let itemModifiersGroup = 0; itemModifiersGroup < cartItemModifierGroups.length; itemModifiersGroup++) {
                                    data['cartItemsModifiersGroup'] += cartItemModifierGroups[itemModifiersGroup].rid + ',';


                                    for (let modifier = 0; modifier < cartItemModifierGroups[itemModifiersGroup].modifiers.length; modifier++) {
                                        data['cartItemsModifiers'] += cartItemModifierGroups[itemModifiersGroup].modifiers[modifier].rid + ',';
                                    }
                                }

                            }

                            if (items[item].cartItemProductGroups.length > 0) {
                                let cartItemProductGroups = items[item].cartItemProductGroups;

                                for (let itemProductGroup = 0; itemProductGroup < cartItemProductGroups.length; itemProductGroup++) {
                                    data['cartItemProductGroup'] += cartItemProductGroups[itemProductGroup].rid + ',';
                                }

                            }
                        }

                        data['cartItems'] = data['cartItems'].slice(0, -1) + ']';
                        data['cartItemsModifiers'] = (data['cartItemsModifiers'] !== '[') ? data['cartItemsModifiers'].slice(0, -1) + ']' : null;
                        data['cartItemsModifiersGroup'] = (data['cartItemsModifiersGroup'] !== '[') ? data['cartItemsModifiersGroup'].slice(0, -1) + ']' : null;
                        data['cartItemProductGroup'] = (data['cartItemProductGroup'] !== '[') ? data['cartItemProductGroup'].slice(0, -1) + ']' : null;
                        data['carRid'] = '[' + cart[0].getCart.rid + ']';

                        console.log("Data Cart: ", JSON.stringify(data));

                        apiAjax("login", "post", {user: user, data: data}).then((response) => {

                            this.trackLogin(response[0].getUser);
                            setLocalStorage(nameStorage.consumer, JSON.stringify(response[0].getUser));

                            let data = response[1];
                            data['username'] = response[2];
                            data['user'] = response[0].getUser.rid;

                            apiAjax("cartMigrate", "post", data).then((response) => {

                                setLocalStorage(nameStorage.cartId, response[1].rid);

                                form_login_user.stopLoading();
                                var url_vars = getUrlVars();

                                if (Object.keys(url_vars).length > 0 && typeof url_vars.next !== "undefined") {
                                    redirect(url_vars.next);
                                } else {
                                    redirect('/account');
                                }

                            }, error => {
                                form_login_user.stopLoading();
                                this.trackLogin(user, true);
                                notificationOne(message.login_error_user);
                                console.error("Error registro:::", error);
                            });
                        }, error => {
                            form_login_user.stopLoading();
                            this.trackLogin(user, true);
                            notificationOne(message.login_error_user);
                            console.error("Error registro:::", error);
                        });

                    }, error => {
                        form_login_user.stopLoading();
                        this.trackLogin(user, true);
                        notificationOne("Error getCart");
                        console.error("Error registro:::", error);
                    });
                } else {
                    apiAjax("login", "post", {user: user, data: null}).then((response) => {

                        this.trackLogin(response[0].getUser);
                        setLocalStorage(nameStorage.consumer, JSON.stringify(response[0].getUser));

                        form_login_user.stopLoading();
                        var url_vars = getUrlVars();

                        if (Object.keys(url_vars).length > 0 && typeof url_vars.next !== "undefined") {
                            redirect(url_vars.next);
                        } else {
                            redirect('/account');
                        }
                    }, error => {
                        form_login_user.stopLoading();
                        this.trackLogin(user, true);
                        notificationOne(message.login_error_user);
                        console.error("Error registro:::", error);
                    });
                }
            } else {
                form_login_user.stopLoading();
                notificationOne(message.login_error_user);
            }
        },
        /**
         * callback  cuando un usuario se loguea
         * con usuario y contraseña
         * @param response  status
         * @param result respuesta del callback
         */
        // loginUser: function (response, result) {
        //     var form_login_user = $("#form_login_user button[type=submit]");
        //     if (response === "OK") {
        //         this.trackLogin(result);
        //         getConsumer(register.getConsumerCallback);
        //     } else if (response === "FAIL") {
        //         this.trackLogin(result, true);
        //         if (result.code === 101) {
        //             notificationOne(message.login_error_user);
        //         }
        //         form_login_user.stopLoading();
        //     }
        // },
        /**
         * evento login de usuario.
         * @param value propiedad
         */
        trackLogin: function (user, error = false) {
            var params = {};
            if (error === true) {
                params[Properties.ERROR] = user;
            } else {
                params[Properties.USER_ID] = user.rid;
            }
            params[Properties.CONTENT_TYPE] = this.type;
            Analytics.track(EVENTS.LOGIN, params);
        },
        /**
         * redirecciona al usuario que proviene desde la
         * vista de cart
         */
        redirect: function () {
            var url_vars = getUrlVars();
            if (Object.keys(url_vars).length > 0 && typeof url_vars.next !== "undefined") {
                url_vars = url_vars.next.replace('/', '');
                var next_url = "/register?next=" + url_vars;
                redirect(next_url);
            } else {
                redirect('/register');
            }
        }
    }
});


/**
 * app para restaurar constraseña soliciatando el email
 * TO_DO: no esta implementado con lo nuevo, no funciona
 * @type {Vue}
 */
var recovery = new Vue({
    el: '#recovery_password',
    data: {
        email: ""
    },
    methods: {
        /**
         * captura los datos del formulario.
         */
        onSubmit: function () {
            var form_pass = $("#form_pass button[type=submit]");
            form_pass.startLoading();
            console.log("RESET PASSWORD: ", this.email);
            if (this.email) {
                $(".form_pass fieldset.relative span").hide();
                apiAjax("resetPassword", "post", {email: this.email}).then((response) => {
                    var data = response;
                    console.log("RESP: ", data);
                    $('.form_pass').slideUp(300);
                    $('.form_ok_pass').slideDown(300);
                    form_pass.stopLoading();
                }, function (error) {
                    console.log("ERROR: ", error);
                    if (error) {
                        form_pass.stopLoading();
                        notificationOne(message.error);
                    }
                });
            }
        }
    }
});
