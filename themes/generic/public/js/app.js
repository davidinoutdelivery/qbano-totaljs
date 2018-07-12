global.config = require('./config');

// Autor: William Villalba
// Email: williamvillalba13@gmail.com

var isAndroid = /android/i.test(navigator.userAgent.toLowerCase()),
        isiPad = /ipad/i.test(navigator.userAgent.toLowerCase()),
        isiPhone = /iphone/i.test(navigator.userAgent.toLowerCase()),
        isiPod = /ipod/i.test(navigator.userAgent.toLowerCase()),
        isiDevice = /ipad|iphone|ipod/i.test(navigator.userAgent.toLowerCase()),
        isWebOS = /webos/i.test(navigator.userAgent.toLowerCase()),
        isWindowsPhone = /windows phone/i.test(navigator.userAgent.toLowerCase());

$(window).load(function () {
    //LOADING
    $('.preload').fadeOut(300);

    //SCROLL
    $(window).scroll(function () {
        if ($(this).scrollTop() > 30) {
            $('header').addClass("bgColor");
            $('.nav_section, .main-menu__hamburger').removeClass('open');
            $('.nav_section').addClass('fixed_nav');
        } else {
            $('header').removeClass("bgColor");
            $('.nav_section').removeClass('fixed_nav');
        }
    });

    //BLOG
    $('.grid').isotope({
        // options
        itemSelector: '.grid-item',
        percentPosition: true,
        masonry: {
            columnWidth: '.grid-sizer'
        }
    });

    //Switch
    $(".checkbox").Sswitch({
        onSwitchChange: function () {
            // Your magic
        }
    });

    //Svg generate
    $(".svg-inject").svgInject();
});


$(window).load(function () {
    //Aler Geolocalizacion
    setTimeout(function () {
        $('.alertGeo').removeClass('open');
    }, 4000);
});


$(function () {

    //VALIDACION 
    $('body').on('click', '.edadClic', function (event) {
        event.preventDefault();
        $('.ege_validation').addClass('close');
    });


    //LOGIN
    $('body').on('click', '.close_register', function (event) {
        event.preventDefault();
        $('#recovery_password .mfp-close').click();
    });
    $('body').on('click', '.link_recovery', function () {
        //Form Inter
        $('.form_pass').show();
        $('.form_ok_pass').hide();
    });


    //CART
    $('body').on('click', '.openCart', function (event) {
        event.preventDefault();
        $('body, html').addClass('over');
        $('.cartView, .maskCart').addClass('open');
    });
    $('body').on('click', '.cartView .header-view .close', function (event) {
        event.preventDefault();
        $('body, html').removeClass('over');
        $('.cartView, .maskCart').removeClass('open');
    });


    //TAB FILTER
    $('.contTabNav').hide();
    $('.contTabNav').eq(0).show();
    $('.navOption label.filtroOne').addClass('active');
    $('body').on('click', '.navOption label.filtroOne', function (event) {
        $('.navOption label').removeClass('active');
        $(this).addClass('active');
        $('.contTabNav').hide();
        $('.contTabNav').eq(0).show();
    });
    $('body').on('click', '.navOption label.filtroTwo', function (event) {
        $('.navOption label').removeClass('active');
        $(this).addClass('active');
        $('.contTabNav').hide();
        $('.contTabNav').eq(1).show();
    });
    $('body').on('click', '.navOption label.filtroTree', function (event) {
        $('.navOption label').removeClass('active');
        $(this).addClass('active');
        $('.contTabNav').hide();
        $('.contTabNav').eq(2).show();
    });


    //MODAL OPCION PEDIDO
    // $('.cont-tab-pedido').hide();
    // $('.cont-tab-pedido').eq(0).show();
    // $('body').on('click', '.tab-delivery > div', function(event) {
    //        event.preventDefault();
    //        $('.tab-delivery a').removeClass('active');
    //        $(this).find('a').addClass('active');
    //        var positiontab = $(this).index();
    //        $('.cont-tab-pedido').hide();
    //        $('.cont-tab-pedido').eq(positiontab).show();
    //    });


    //BUSCADOR
    $('.btn_buscar').click(function (event) {
        $('.bgBuscador').addClass('open');
    });
    $('.bgBuscador .close').click(function (event) {
        $('.bgBuscador').removeClass('open');
    });

    // OPEN NAV responsive
    $('.burger').click(function () {
        if ($(this).hasClass('open')) {
            $('.burger, .nav_movil, .over_nav').removeClass('open');
        } else {
            $('.burger, .nav_movil, .over_nav').addClass('open');
        }
    });
    $('.over_nav').click(function (event) {
        $(this).removeClass('open');
        $('.burger, .nav_movil').removeClass('open');
    });
    $('body').on('click', '.main-menu__hamburger', function (event) {
        // $('body').toggleClass('over');
        $(this).toggleClass('open');
        $('.nav_section, body, html').toggleClass('open');
    });

    //ADD PRODUCT
    $('.addProduct').click(function (event) {
        $('.caja h4').addClass('bounceIn');
        setTimeout(function () {
            $(".caja h4").removeClass('bounceIn')
        }, 1900);
        //Alert
        $('.alert_carrito').addClass('open');
        setTimeout(function () {
            $(".alert_carrito").removeClass('open')
        }, 1900);
    });


    //NEW ADDRESS
    $('body').on('click', '.new_dir', function (event) {
        $('.m_addres').addClass('open');
    });
    $('body').on('click', '.bg_new_address .close', function (event) {
        $('.m_addres').removeClass('open');
    });


    //ALER PEDIDOS
    $('body').on('click', '.user_action .alert', function (event) {
        $('.mask_ped').addClass('open');
        $('.list_pedidos').addClass('open');
    });
    $('body').on('click', '.list_pedidos .close', function (event) {
        $('.list_pedidos').removeClass('open');
        $('.mask_ped').removeClass('open');
    });


    //CHECKOUT MODALS
    $('body').on('click', '.card_confir', function (event) {
        $('.card_confir_m').addClass('open');
    });
    $('body').on('click', '.card_confir_m .close', function (event) {
        $('.card_confir_m').removeClass('open');
    });
    //Card
    $('body').on('click', '.new_card_m_clic', function (event) {
        $(this).hide(300);
        $('.new_card_modal').slideDown();
        $('.addCardPayment, efectCardPayment').hide(200);
    });
    $('body').on('click', '.done_card', function (event) {
        $('.new_card_modal').slideUp();
        $('.new_card_m_clic').slideDown(100);
    });
    //Date
    $('body').on('click', '.date_clic', function (event) {
        $('.modal_date').addClass('open');
    });
    $('body').on('click', '.modal_date .close', function (event) {
        $('.modal_date').removeClass('open');
    });
    //Cupon
    $('body').on('click', '.cupon_clic', function (event) {
        $('.modal_cupon').addClass('open');
    });
    $('body').on('click', '.modal_cupon .close', function (event) {
        $('.modal_cupon').removeClass('open');
    });


    //METODOS DE PAGO CHECKOUT
    $('body').on('click', '.efectPayment', function (event) {
        $('.addCardPayment').hide(200);
        $('.efectCardPayment').show(200);
        $('.new_card_modal').hide(200);
    });
    $('body').on('click', '.cardPayment', function (event) {
        $('.efectCardPayment').hide(200);
        $('.addCardPayment').show(200);
        $('.new_card_modal').hide(200);

    });


    //CALIFICATION
    $('.calfication span').click(function (event) {
        $('.calfication span').removeClass('active');
        $(this).addClass('active');
    });


    //CART Y CHCKOUT
    $('body').on('click', '.slowDetails', function () {
        if ($(this).hasClass('open')) {
            $(this).removeClass('open');
            $(this).parents('.itemsaddCart').find('.bgAditionals').addClass('open').slideUp();
            $(this).html('<i class="fa fa-caret-down" aria-hidden="true"></i> Mostrar Detalle');
        } else {
            $(this).addClass('open');
            $(this).parents('.itemsaddCart').find('.bgAditionals').addClass('open').slideDown();
            $(this).html('<i class="fa fa-caret-up" aria-hidden="true"></i> Ocultar Detalle');
        }
    });
    $('body').on('click', '.openDetail', function () {
        if ($(this).hasClass('open')) {
            $(this).removeClass('open');
            $(this).parent('article').find('.bgAditionals').slideUp();
        } else {
            $(this).addClass('open');
            $(this).parent('article').find('.bgAditionals').slideDown();
        }
    });



    //BLOG
    $('.sliderBlog').owlCarousel({
        loop: true,
        margin: 0,
        nav: true,
        items: 1,
        // animateOut: 'fadeOut',
        autoplay: true,
        autoplayTimeout: 5000,
        smartSpeed: 450,
        autoHeight: true,
        navText: [
            "<i class='ti-angle-left'</i>",
            "<i class='ti-angle-right'</i>"
        ]
    });


    /* POP-UP */
    $('.modales').magnificPopup({
        tdelegate: 'a',
        removalDelay: 500,
        callbacks: {
            beforeOpen: function () {
                this.st.mainClass = this.st.el.attr('data-effect');
            }
        },
        midClick: true
    });
    $('.modalVideo').magnificPopup({
        disableOn: 700,
        type: 'iframe',
        mainClass: 'mfp-fade',
        removalDelay: 160,
        preloader: false,

        fixedContentPos: false
    });


    //CALIFICATION
    $('.calfication span.calf1').hover(function () {
        $('span.calf1').addClass('hover');
        $('.calfication span').removeClass('active');
    }, function () {
        $('.calfication span').removeClass('hover');
    });
    $('.calfication span.calf2').hover(function () {
        $('span.calf1, span.calf2').addClass('hover');
        $('.calfication span').removeClass('active');
    }, function () {
        $('.calfication span').removeClass('hover');
    });
    $('.calfication span.calf3').hover(function () {
        $('span.calf1, span.calf2, span.calf3').addClass('hover');
        $('.calfication span').removeClass('active');
    }, function () {
        $('.calfication span').removeClass('hover');
    });
    $('.calfication span.calf4').hover(function () {
        $('span.calf1, span.calf2, span.calf3, span.calf4').addClass('hover');
        $('.calfication span').removeClass('active');
    }, function () {
        $('.calfication span').removeClass('hover');
    });
    $('.calfication span.calf5').hover(function () {
        $('span.calf1, span.calf2, span.calf3, span.calf4, span.calf5').addClass('hover');
        $('.calfication span').removeClass('active');
    }, function () {
        $('.calfication span').removeClass('hover');
    });
    $('.calfication span.calf1').click(function (event) {
        $('span.calf1').addClass('active');
        $('#modalrate .name').html('Pesimo');
    });
    $('.calfication span.calf2').click(function (event) {
        $('span.calf1, span.calf2').addClass('active');
        $('#modalrate .name').html('Malo');
    });
    $('.calfication span.calf3').click(function (event) {
        $('span.calf1, span.calf2, span.calf3').addClass('active');
        $('#modalrate .name').html('Regular');
    });
    $('.calfication span.calf4').click(function (event) {
        $('span.calf1, span.calf2, span.calf3, span.calf4').addClass('active');
        $('#modalrate .name').html('Bueno');
    });
    $('.calfication span.calf5').click(function (event) {
        $('span.calf1, span.calf2, span.calf3, span.calf4, span.calf5').addClass('active');
        $('#modalrate .name').html('Excelente');
    });


    //Alert Push
    $('body').on('click', '.pushAlert', function (event) {
        Push.create("Producto Agregado", {
            body: "Pedido listo para tu compra...",
            icon: 'assets/images/icon_notif.png',
            timeout: 4000,
            onClick: function () {
                window.focus();
                this.close();
            }
        });
    });


    //Notification
    $('body').on('click', '.notificationOne', function (event) {
        setTimeout(function () {
            var notification = new NotificationFx({
                message: '<span class="icon ti-bag" aria-hidden="true"></span><p>Producto agregado correctamente a tu pedido, sigue comprando o <a href="carrito.php">pagar aquí...</a></p>',
                layout: 'bar',
                effect: 'slidetop',
                ttl: 4000,
                type: 'notice',
                onClose: function () {
                }
            });
            notification.show();
        }, 500);
    });
    $('body').on('click', '.notificationTwo', function (event) {
        setTimeout(function () {
            var notification = new NotificationFx({
                message: '<span class="icon ti-bag" aria-hidden="true"></span><p>Producto agregado correctamente a tu pedido, sigue comprando o <a href="carrito.php">pagar aquí...</a></p>',
                layout: 'attached',
                effect: 'bouncyflip',
                // ttl : 4000,
                type: 'notice',
                onClose: function () {
                }
            });
            notification.show();
        }, 600);
    });


    //ALERT FIJAS
    $('.alertStatic .txt .btn, .alertStatic a.closeAlert').click(function (event) {
        $('body').removeClass('alertBgStatic');
    });


    //CALENDAR    
    $('body').on('click', '.datepicker', function () {
        $('.datepicker').pickadate({
            monthsFull: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
            monthsShort: ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'],
            weekdaysFull: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
            weekdaysShort: ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'],
            today: 'hoy',
            clear: 'borrar',
            close: 'cerrar',
            firstDay: 1,
            format: 'dddd, dd, yyyy',
            formatSubmit: 'yyyy/mm/dd',
            selectMonths: true,
            selectYears: true,
            min: -1,
            container: '#picker-inout'
        });
    });
    $('body').on('click', '.timepicker', function () {
        $(this).pickatime({
            container: '#timer-inout'
        });
    });


    // document.oncontextmenu = function(){return false;}
});


//INPUT PLACEHOLER
$(function () {
    $('input,textarea').focus(function () {
        $(this).data('placeholder', $(this).attr('placeholder'))
                .attr('placeholder', '');
    }).blur(function () {
        $(this).attr('placeholder', $(this).data('placeholder'));
    });
});


//PARALLAX EFECT
$.fn.parallax = function (strength) {
    var scroll_top = $(window).scrollTop();
    var move_value = Math.round(scroll_top * strength);
    this.css('margin-top', '-' + move_value + 'px');
};
$(window).on('scroll', function () {
    $('.parallax').parallax(0.4);
});