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
            FB.getLoginStatus(function(response) {
                if (response.status === 'connected') {
                    login.userExist(response.authResponse);
                }
                else {
                    FB.login(function(response) {
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
            FB.api('/'+authResponse.userID, {
                fields: 'email, first_name, last_name'
            }, function(response) {
                if (response.email) {
                    apiAjax('userExist', 'post', {email: response.email}).then(user => {
                        if (user.length > 0) {
                            apiAjax("loginSocial", "post", {user: {email: response.email}}).then((response) => {
                                console.log("loginsocial",response.getUser);
                                _this.trackLogin(response.getUser);
                                setLocalStorage(nameStorage.consumer, JSON.stringify(response.getUser));
                                redirect('/account');
                            }, error => {
                                notificationOne(message.login_error_user);
                                console.error("Error registro:::", error);
                            });
                        }
                        else {
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
                                (error.responseJSON.code && error.responseJSON.code !== 130) ? notificationGeneral(message.exists_user, {type: "notice"}) : notificationGeneral(message.error+ ' Error: ['+error.responseJSON.code+']', {type: "error"});
                                 console.error("Error registro:::", error);
                            });
                        }
                        
                    }, function (error) {
                        console.log("Ha ocurrido un error consultado el usuario", error);
                    });
                }
                else {
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

            if (this.email.length > 0 &&
                this.password.length > 0) {
                let user = {
                    email: this.email,
                    password: this.password
                };

                apiAjax("login", "post", {user: user}).then((response) => {
                    form_login_user.stopLoading();
                    this.trackLogin(response.getUser);
                    setLocalStorage(nameStorage.consumer, JSON.stringify(response.getUser));
                    var url_vars = getUrlVars();
                    if (Object.keys(url_vars).length > 0 && typeof url_vars.next !== "undefined") {
                         redirect(url_vars.next);
                    }
                    else {
                        redirect('/account');
                    }
                   
                }, error => {
                    form_login_user.stopLoading();
                    this.trackLogin(user, true);
                    notificationOne(message.login_error_user);
                    console.error("Error registro:::", error);
                });
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
                var next_url = "/register?next="+url_vars;
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
