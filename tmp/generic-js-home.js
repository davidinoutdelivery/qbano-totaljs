$(document).ready(function () {
    //comprueba que la url tenga punto de venta antes de que cargue toda la página
    let pathname = window.location.pathname;
    let url = window.location.href;
    let pointSale = getPointSale();
    if (pointSale && pointSale.rid) {
        if (!url.includes('pointSale=')) {
            redirect(pathname);
        }
    }
});

var home = new Vue({
    methods: {
        setup: function () {
            var banner = JSON.parse($('#banners').html());
            var config = JSON.parse($('#configuration').html());
            var categories = JSON.parse($('#modelCategory').html());
            banners.getBanners();
            category.setup(categories);
            //checks.setup();
        }
    }
});

/**
 * validad yc arga la configuracion del comercio
 * @type {Vue}
 */
var checks = new Vue({
    methods: {
        setup: function () {
            this.isOpen();
            this.configuration();
        },
        /**
         * configuración del comercio
         */
        configuration: function () {
            var config = JSON.parse($('#configuration').html());
            if(config) {
                setSessionStorage(nameStorage.config, JSON.stringify(config));
            }else{
                console.log("configuracion del comercio error");
            }
        },
        /**
         * verifica si el comercio esta abierto o cerrado
         */
        isOpen: function () {
            var pointsale = JSON.parse(getLocalStorage("pointsaleAll"));
            if (pointsale && pointsale["id"]) {
                apiAjax('pointSaleIsOpen?id=' + pointsale["id"], 'get', {timeout: timeoutAjax}).then(pointsale => {
                    if (pointsale && pointsale["schedules"] && !pointsale["schedules"]["isOpen"]) {
                        notificationFive(message.closed_business);
                    }
                }, function (error) {
                    console.log("Ha ocurrido un error consultado el estado del comercio", error);
                });
            }
        }
    }
});

/**
 * carga de banners
 * @type {Vue}
 */
var banners = new Vue({
    el: '.carrusel_slider',
    data: {
        bannersModel: [],
    },
    methods: {
        /**
         * consulta los banners para el comercio actual
         */
        getBanners: function () {
            var banner = JSON.parse($('#banners').html());
            this.bannersModel = banner;
            this.slider();
        },
        /**
         * url de la imagen
         * @param banner
         */
        urlImage: function (banner) {
            if (banner && banner.image) {
                return banner.image.url;
            }
        },
        /**
         * url de la imagen
         * @param banner
         */
        goToUrlBanner: function (banner) {
            if (banner && banner.url) {
                console.log("BANNER URL: ", banner.url);
                window.location.href = banner.url;
            }
        },
        /**
         * retorna el style del background del carrusel
         * @param image :: objeto tipo imagen
         * @returns {{background-image: string}}
         */
        urlStyle: function (image) {
            if (image && image.url) {
                return {
                    'background-image': 'url("' + image.url + '")'
                }
            }
        },
        /** asigna el estilo  de carrusel a los banners
         */
        slider: function () {

            function updateSize(){
                // var minHeight=parseInt($('.owl-item').eq(0).css('height'));
                // console.log("minHeight: ", minHeight);
                // $('.owl-item').each(function () {
                //     var thisHeight = parseInt($(this).css('height'));
                //     minHeight=(minHeight<=thisHeight?minHeight:thisHeight);
                // });
                // console.log("minHeight: ", minHeight);
                // $('.owl-wrapper-outer').css({'height': minHeight+'px'});
                //
                // /*show the bottom part of the cropped images*/
                // $('.owl-carousel .owl-item img').each(function(){
                //     var thisHeight = parseInt($(this).css('height'));
                //     if(thisHeight>minHeight){
                //         $(this).css({'margin-top': -1*(thisHeight-minHeight)+'px'});
                //     }
                // });
            }

            setTimeout(function () {
                var slider_home = $('.sliderHome').owlCarousel({
                    loop: true,
                    margin: 0,
                    nav: false,
                    dots: true,
                    items: 1,
                    // animateOut: 'fadeOut',
                    autoplay: true,
                    autoplayTimeout: 5000,
                    smartSpeed: 450                    
                });
            });
        }
    }
});


var validation = new Vue({
    el: '.ege_validation',
    data: {
        model: [],
    },
    methods: {
    }
});



/**
 * carga de destacados
 * @type {Vue}
 */
// var features = new Vue({
//     el: '.feature-market',
//     data: {
//         bannersModel: {}
//     },
//     methods: {
//         /** asigna el estilo  de carrusel a los destacados
//          */
//         slider: function () {
//             setTimeout(function () {
//                 $('.carrusel-feature').owlCarousel({
//                     loop: true,
//                     margin: 0,
//                     nav: false,
//                     items: 1,
//                     animateOut: 'fadeOut',
//                     autoplay: true,
//                     autoplayTimeout: 5000,
//                     smartSpeed: 450
//                 });
//             }, 70);
//         }
//     }
// });


$(window).load(function () {
    /** Analytics **/
    var params = {};
    params[Properties.CONTENT_NAME] = "home";
    Analytics.track(EVENTS.VIEW_CONTENT, params);
    /** */

    home.setup();
});