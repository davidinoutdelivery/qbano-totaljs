$(window).ready(function () {
    if (getLocalStorage(nameStorage.tmpConsumer)) {
        let tmpConsumer = JSON.parse(getLocalStorage(nameStorage.tmpConsumer));
        register.initialForm(tmpConsumer);
    }
});

var facebookId = (serviceConfig.facebookAppId) ? String(serviceConfig.facebookAppId) : "";
loadFacebookSDK(facebookId);

/**
 * aplicacion  para el registro manual y/o facebook
 * @type {Vue}
 */
var register = new Vue({
    el: '#register',
    data: {
        identification: "",
        name: "",
        lastName: "",
        email: "",
        phone: "",
        password_one: "", 
        password_two: "",
        allowSubmit: false,
        term: false,
        facebook: false,
        userFacebook: {},
        content_type: "manual"
    },
    methods: {
        /**
         * registro con facebook
         */
        facebookRegister: function () {
            login.facebook();
        },
        /**
         * Evento del formulario de registro del usuario
         */
        onSubmit: function () {
            var form_register = $(".form_register button[type=submit]");
            form_register.startLoading({msg: "Registrando"});
            if (!this.facebook && this.password_one !== this.password_two) {
                notificationOne(message.password_user);
                form_register.stopLoading();
            } else if (!this.facebook && !this.allowSubmit) {
                notificationOne(message.captcha_user);
                form_register.stopLoading();
            } else if (!this.term) {
                notificationOne(message.terms_user);
                form_register.stopLoading();
             } else if (this.validate()) {
                var user = {
                    username: this.email, 
                    email: this.email, 
                    phone: formatPhone(this.phone),
                    password: this.password_one,
                    nameFirst: this.name,
                    nameLast: this.lastName,
                };

                if (this.identification !== "" ) {
                    user.identification = this.identification;
                }

                if(this.facebook){
                    createConsumer(user, this.setUser);
                }else {
                    apiAjax("registerUser", "post", {user: user}).then((response) => {
                        form_register.stopLoading();
                        setLocalStorage(nameStorage.consumer, JSON.stringify(response.createUser));
                        if (getLocalStorage(nameStorage.tmpConsumer)) {
                            localStorage.removeItem(nameStorage.tmpConsumer);
                        }
        
                        var url_vars = getUrlVars();
                        if (Object.keys(url_vars).length > 0 && typeof url_vars.next !== "undefined") {
                            redirect(url_vars.next);
                        } else {
                            redirect('/account');
                        }
                       
                    }, error => {
                        form_register.stopLoading();
                        console.error("Error registro:::", error);
                        (typeof error.responseJSON !== "undefined" && typeof error.responseJSON["code"] !== "undefined" && error.responseJSON["code"] && error.responseJSON["code"] !== 130) ? notificationGeneral(message.exists_user, {type: "notice"}) : notificationGeneral(message.error+ ' Error: ['+error.responseJSON["code"]+']', {type: "error"});
                    });
                }
            } else {
                form_register.stopLoading();
                notificationGeneral(message.error_register, {type: "error"});
            }
        },
        /**
         Callback cuando se registra se crea un nuevo usario
         **/
        // setUser: function (response, result) {
        //     var form_register = $(".form_register button[type=submit]");
        //     if (response === "OK" && result) {
        //         var user = result.toJSON();
        //         setLocalStorage(nameStorage.consumer, JSON.stringify(user));
        //         if (getLocalStorage(nameStorage.tmpConsumer)) {
        //             localStorage.removeItem(nameStorage.tmpConsumer);
        //         }

        //         var url_vars = getUrlVars();
        //         if (Object.keys(url_vars).length > 0 && typeof url_vars.next !== "undefined") {
        //             redirect(url_vars.next);
        //         } else {
        //             redirect('/account');
        //         }
        //     } else if (response === "FAIL") {
        //         if (result.code === 202) {
        //             notificationOne(message.exists_user);
        //         } else {
        //             notificationOne(message.error);
        //         }
        //         form_register.stopLoading();
        //     }
        // },
        /**
         * respuesta de la solicitud de informacion de usuario
         * a parse server
         * @param response status
         * @param consumer respuesta del callback
         */
        // getConsumerCallback: function (response, consumer) {
        //     if (response === "OK" && consumer) {
        //         var user = consumer.toJSON();
        //         setLocalStorage(nameStorage.consumer, JSON.stringify(user));
        //         var url_vars = getUrlVars();
        //         if (Object.keys(url_vars).length > 0 && typeof url_vars.next !== "undefined") {
        //              redirect(url_vars.next);
        //         }
        //         else {
        //             redirect('/account');
        //         }
        //     }
        // },
        /**
         * inicializa el formularo de registro
         * @param response
         */
        initialForm: function (response) {
            if (response && serviceConfig.businessId) {
                this.facebook = true;
                this.content_type = "facebook";
                if (response.first_name || response.last_name) {
                    this.name = response.first_name + " " + response.last_name;
                }

                if (response.email) {
                    this.email = response.email;
                }
                this.password_one = response.email + serviceConfig.businessId;
            }
        },
        validate: function () {
            var form_register = $(".form_register button[type=submit]");
            var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            var resp = true;
            var message = "";
            if (!(this.name.length > 0)) {
                resp= false;
                message += 'Nombre inválido.\n';
            }
            if (!(this.email.length > 0 && this.email.match(mailformat))){
                resp= false;
                message += 'Correo inválido.<br>';
            }
            var phone = this.phone.replace(/-/g,"");
            if (!(phone.length === 7  || phone.length === 10) || isNaN(phone)){
                resp= false;
                message += 'Teléfono inválido debe ser un numero de 7 o 10 dígitos.<br>';
            }

            if (resp === false) {
                form_register.stopLoading();
                notificationGeneral(message, {type: "notice"});
            }

            return resp;
        }
    }
});

/**
 * callback de la funcionalidad de captcha
 */
function capcha_filled() {
    register.allowSubmit = true;
}

function capcha_expired() {
    register.allowSubmit = false;
}