/**
 * modulo de notificaciones
 */


 /**
 * constructor del mensaje general
 * @param {string} message :: mensaje a mostrar
 * @param {Object} params :: objecto con propiedades que cambian el comportamiento.
 * @param {string} params.layout :: layout type: slidetop|growl|attached|bar|other
 * @param {string} params.effect :: for growl layout: scale|slide|genie|jelly, 
 * for attached layout: flip|bouncyflip
 * for other layout: boxspinner|cornerexpand|loadingcircle|thumbslider
 * @param {number} params.time :: tiempo que se demora la notificación en desaparecer
 * @param {string} params.type :: notice|success|warning|error
 */
 function notificationGeneral(message, params = {}) {
     var config = {};
     config.layout = params.layout ? params.layout : 'bar';
     config.effect = params.effect ? params.effect : 'slidetop';
     config.time = params.time ? params.time : 600;
    
     if (params.type) {
        switch(params.type) {
            case 'notice':
                config.type = params.type;
                config.icon = 'icon fa fa-exclamation-circle';
                break;
            case 'success':
                config.type = params.type;
                config.icon = 'icon fa fa-check';
                break;
            case 'warning':
                config.type = params.type;
                config.icon = 'icon fa fa-exclamation-triangle';
                break;
            case 'error':
                config.type = params.type;
                config.icon = 'icon fa fa-times ';
                break;
            default:
                config.type = 'success';
                config.icon = 'icon fa fa-check';
        } 
     }
     else {
        config.type = 'success';
        config.icon = 'icon fa fa-check';
     }
     
     setTimeout(function () {
        var notification = new NotificationFx({
            message: '<span class="'+ config.icon +'" aria-hidden="true"></span><p>' + message + '</p>',
            layout: config.layout,
            effect: config.effect,
            ttl: 4300,
            type: config.type,
            onClose: function () {
            }
        });
        notification.show();
    }, config.time);

 }

/**
 * constructor del mensaje
 * @param message :: mensaje a mostrar
 * @param time :: tiempo de vida de la notificación
 */
function notificationOne(message, time = 600) {
    setTimeout(function () {
        var notification = new NotificationFx({
            message: '<span class="icon fa fa-exclamation-triangle" aria-hidden="true"></span><p>' + message + '</p>',
            layout: 'bar',
            effect: 'slidetop',
            ttl: 4300,
            type: 'notice',
            onClose: function () {
            }
        });
        notification.show();
    }, 600);
}

/**
 * notificacion tipo 2
 * @param message :: mensaje a mostrar
 * @param time :: tiempo de vida de la notificación
 */
function notificationTwo(message, time = 600) {
    setTimeout(function () {
        var notification = new NotificationFx({
            message: '<span class="icon fa fa-bell-o" aria-hidden="true"></span><p>' + message + '</p>',
            layout: 'attached',
            effect: 'bouncyflip',
            ttl: 4300,
            type: 'notice',
            onClose: function () {
            }
        });
        notification.show();

    }, 600);
}

/**
 * notificacion tipo 3
 * @param title :: encabezado
 * @param body :: cuerpo de la notificación
 *  @param time :: tiempo de vida de la notificación
 *  @param icon :: icono de la notificación.
 */
function notificationThree(title, body, icon, time = 4000) {
    Push.create(title, {
        body: body + "...",
        icon: '/generic/images/icon_notif_solicitado.png',
        timeout: 4000,
        onClick: function () {
            window.focus();
            this.close();
        }
    });
}


function notificationFour(message, time = 600) {
    setTimeout(function () {
        var notification = new NotificationFx({
            message: '<span class="icon fa fa-exclamation-triangle" ></span><p>' + message + '</p><button id="cerrarya" onClick="reset()">Si</button>',
            layout: 'bar',
            effect: 'slidetop',
            type: 'notice',
            ttl: 8000,
            onClose: function () {
            }
        });
        notification.show();
    }, 600);

}

/**
 * notificacion fija
 * @param message :: mensaje a mostrar
 * @param button :: oculta o muestra el botón
 */
function notificationFive(message, button = false) {
    $('body').addClass('alertBgStatic');
    $('.alertStatic .txt p').html(message);
    $('.alertStatic .txt a').hide();
    $(".alertStatic").addClass("animated shake");
    if (button) {
        $('.alertStatic .txt a').show();
    }
    setTimeout(function () {
        $(".alertStatic").removeClass("animated shake");
    }, 500);
}
