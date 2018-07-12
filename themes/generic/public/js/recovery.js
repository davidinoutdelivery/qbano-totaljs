$(document).ready(function () {
    var recovery = JSON.parse($('#modelRecovery').html());
    if (recovery) {
        changePass.model = recovery;
    }
    /** Analytics **/
    var params = {};
    params[Properties.CONTENT_NAME] = "recovery";
    Analytics.track(EVENTS.VIEW_CONTENT, params);
    /** **/
});


/**
 * app para restaurar constraseña soliciatando el email
 * @type {Vue}
 */
var changePass = new Vue({
    el:'#change_password',
    data: {
        password: "", password_two: "", model: {}
    },
    methods: {
        onSubmit: function () {
            if (this.password === this.password_two) {
                $('.preload').show(300);
                if (this.model.email && this.model.businessId && this.model.token) {
                    apiAjax("changePassword", "post",
                        {   "email": this.model.email,
                            "businessId": this.model.businessId,
                            "token": this.model.token,
                            "password": this.password
                        }).then((response) => {

                        $('.preload').hide(300);
                        if (response.includes("ok")) {
                            notificationTwo(message.recover_ok);
                            setTimeout( function (){
                                window.location = '/login';
                            }, 2500);
                        }
                    }, function (error) {
                        $('.preload').hide(300);
                        var result = getMessage(error.responseText, true);
                        if (result.code === 142) {
                            notificationTwo(message.error);
                        } else if (result.code === 141) {
                            notificationTwo(message.error);
                        }
                    });
                } else {
                    $('.preload').fadeOut(300);
                    notificationTwo(message.error);
                }
            } else {
                notificationTwo(message.password_user);
            }
        }
    }
});