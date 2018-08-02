$(document).ready(function () {
    var user = jsonParse(getLocalStorage(nameStorage.consumer));

    if (user) {
        profile.setup(user);
    }
    else {
        window.location = '/';
    }
});

/**
 * aplicación de perfil de usuario,
 * actualiza los datos de un usuario
 * @type {Vue}
 */
var profile = new Vue({
    el: '.bg_user_section',
    data: {
        identification: "",
        name: "",
        email: "",
        phone: "",
        password_one: "",
        user: {}
    },
    methods: {
        setup: function (user) {
            if (user) {
                var params = {};
                params[Properties.CONTENT_NAME] = "profile";
                Analytics.track(EVENTS.VIEW_CONTENT, params);

                this.identification = user.identification ? user.identification : "";
                this.name = user.nameFirst;
                this.email = user.email;
                this.phone = user.phone;
                this.user = user;
            }
        },
        onSubmit: function () {
            var form_update_profile = $("#form_update_profile button[type=submit]");
            form_update_profile.startLoading({msg: "Guardando"});
            if (this.validate()) {
                var user = {
                    nameFirst: this.name,
                    name: this.email,
                    email: this.email,
                    phone: formatPhone(this.phone),
                    //password: this.password_one,
                };

                if (this.identification !== "" ) {
                    user.identification = this.identification;
                }
                
                //user.id = this.user["@rid"];
                //updateConsumer(user, this.updateUser);
                apiAjax("updateUser", "put", {user: user, id: this.user["rid"] }).then((response) => {
                    form_update_profile.stopLoading();
                    setLocalStorage(nameStorage.consumer, JSON.stringify(response.getUser));
                    notificationGeneral(message.update_user);     
                }, error => {
                    form_update_profile.stopLoading();
                    notificationGeneral(message.update_error_user+ ' Error: ['+error.responseJSON.code+']', {type: "error"});
                     console.error("Error actualizando usuario:::", error);
                });

            } else {
                form_update_profile.stopLoading();
                notificationGeneral(message.update_error_user,{type: "error"});
            }
        },
        updateUser: function (response, consumer) {
            var form_update_profile = $("#form_update_profile button[type=submit]");
            if (response === "OK" && consumer) {
                var user = consumer.toJSON();
                setLocalStorage(nameStorage.consumer, JSON.stringify(user));
                notificationTwo(message.update_user);
            } else if (response === "FAIL") {
                notificationTwo(message.update_error_user);
            }
            form_update_profile.stopLoading();
        },
        validate: function () {
            var form_update_profile = $("#form_update_profile button[type=submit]");
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
            if (!(phone.length === 7  || phone.length === 10) || isNaN(phone)) {
                resp= false;
                message += 'Teléfono inválido debe ser un numero de 7 o 10 dígitos.<br>';
            }

            if (resp === false) {
                form_update_profile.stopLoading();
                notificationGeneral(message, {type: "notice"});
            }

            return resp;
        }
    }
});