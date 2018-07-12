/* global serviceConfig, apiAjax */

$(window).load(function () {
    /** Analytics **/
    var params = {};
    params[Properties.CONTENT_NAME] = "contact";
    Analytics.track(EVENTS.VIEW_CONTENT, params);
    /** **/
});

/**
 * app de contacto
 * @type {Vue}
 */
var contact = new Vue({
    el: '#form_contact',
    data: {
        name: "",
        email: "",
        subject: "",
        comments: "",
    },
    methods: {
        sendEmail: function () {
            var form_contact = $("#form_contact button[type=submit]");
            form_contact.startLoading({msg: "Enviando"});
            if (this.name.length > 0 && this.email.length > 0 &&
                this.subject.length > 0 && this.comments.length > 0
                && serviceConfig) {
                var mandrill = [
                    {"name": "title", "content": serviceConfig.flavorName},
                    {"name": "name", "content": this.name},
                    {"name": "email", "content": this.email},
                    {"name": "subject", "content": this.subject},
                    {"name": "comments", "content": this.comments}
                ];
                var params = {
                  mandrill: mandrill, 
                  subject: this.subject,
                  name : this.name,
                  email : this.email,
                  comments : this.comments,
                  title : serviceConfig.flavorName
                };
                apiAjax("email", "post", params).then(result => {
                    console.log(result);
                    if (result.status === true) {
                        form_contact.stopLoading();
                        $("#form_contact")[0].reset();
                        notificationTwo(message.email_ok);
                        /** Analytics **/
                        var paramsEmail = {};
                        paramsEmail[Properties.TITLE] =  serviceConfig.flavorName;
                        paramsEmail[Properties.EMAIL_NAME] = this.name;
                        paramsEmail[Properties.EMAIL] = this.email;
                        paramsEmail[Properties.SUBJECT] = this.subject;
                        paramsEmail[Properties.MESSAGE] = this.comments;
                        Analytics.track(EVENTS.LEAD, paramsEmail);
                        /** **/
                    } else {
                        form_contact.stopLoading();
                        $("#form_contact")[0].reset();
                        notificationTwo(message.email_fail);
                    }

                }, error => {
                    form_contact.stopLoading();
                    $("#form_contact")[0].reset();
                    notificationTwo(message.email_fail);
                    console.error("ERROR", error);
                });
            } else {
                notificationOne(message.error_register);
            }
        }
    }
});