/**
 * Se encarga de manipular las categorías y subcategorías
 */
var category = new Vue({
    el: '#category',
    data: function () {
        return {
            "categories": [],
            "parent": "Todas",
            "isRoot": false,
            "show": false,
        }
    },
    methods: {
        /**
         * carga inical de las categorías o subcategorías
         * @param model
         */
        setup: function (model) {
            
            /** Analytics **/
            var params = {};
            params[Properties.CONTENT_NAME] = "category";
            Analytics.track(EVENTS.VIEW_CONTENT, params);
           /** **/

           category.slider();
            
            if (Array.isArray(model)) {
                //Todas las categorías
                this.categories = model;
                this.isRoot = true;
            }
            else {
                //una categoría específica
                this.parent = model.name;
                this.categories.push(model);
                this.isRoot = false;
            }

            this.show = true;
        },
        /**
         * Direcciona al hijo de la categoría seleccionada y agrega pointsale a la url si la tiene.
         */
        goToChildCategory: function (category) {       
            if (category && category.status) {
                let url = '/categories/' + category.slug;
                redirect(url);
            }
            else {
                notificationGeneral("El item no se encuentra activo.", {type: "warning"});
            }
            
        },
        /**
         * Direcciona al producto seleccionado y agrega pointsale a la url si la tiene.
         */
        goToChildProduct: function (category, product) {        
            if (product && product.status) {
                let url = '/products/' + category + '/' + product.slug;
                redirect(url);
            }
            else {
                notificationGeneral("El item no se encuentra activo.", {type: "warning"});
            } 
        },
        /**
         * Obtiene la url de la imagen de una categoría para usarla como fondo.
         * @param isBackground : si true es un background-image de lo contrario es la url
         */
        getUrl: function (category, isBackground = false) {
            if (isBackground) {
                if (category.image && category.image.url) {
                    let url = category.image.url;
                    return {
                        'background-image': 'url("' + url + '")'
                    }
                } else {
                    return {
                        'background-image': 'url("/generic/images/no_found.png")'
                    }
                }
            }
            else {
                if (category.image && category.image.url) {
                    let url = category.image.url;
                    return url;
                } else {
                    return "/generic/images/no_found.png";
                }
            }
          
        },
        /**
         * Obtiene el thumbnail de la imagen de una categoría para usarla como fondo.
         * @param isBackground : si true es un background-image de lo contrario es la url
         */
        getUrlThumbnail: function (category, isBackground = false) {
            if (isBackground) {
                if (category.image && category.image.thumbnail) {
                    let url = category.image.thumbnail;
                    return {
                        'background-image': 'url("' + url + '")'
                    }
                } else {
                    return {
                        'background-image': 'url("/generic/images/no_found.png")'
                    }
                }
            }
            else {
                if (category.image && category.image.thumbnail) {
                    let url = category.image.thumbnail;
                    return url;
                } else {
                    return "/generic/images/no_found.png";
                }
            }
          
        },
        /**
         * Retorna el detalle de un producto
         */
        detail: function(categoria, producto, event) {
            products.detail(categoria, producto, event);
        },
        /**
         * Hace una compra directa del producto si no tiene modificadores
         */
        shop: function(categoria, producto, event) {
            products.shop(categoria, producto, event);
        },
        /** 
         * asigna el estilo  de carrusel a los banners
         */
        slider: function () {
            setTimeout(function () {
                $('.carrusel_feature_prod').owlCarousel({
                    loop:false,
                    dots: false,
                    margin:13,
                    nav:true,
                    smartSpeed:450,
                    navText:[
                     "<i class='fa fa-angle-left' aria-hidden='true'></i>",
                     "<i class='fa fa-angle-right' aria-hidden='true'></i>"
                    ],
                    responsive:{
                        0:{
                            items:1
                        },
                        600:{
                            items:2
                        },
                        1000:{
                            items:4
                        }
                    }
                });
                $('.carrusel_feature').owlCarousel({
                    loop:false,
                    dots: false,
                    margin:13,
                    nav:true,
                    smartSpeed:450,
                    navText:[
                     "<i class='fa fa-angle-left' aria-hidden='true'></i>",
                     "<i class='fa fa-angle-right' aria-hidden='true'></i>"
                    ],
                    responsive:{
                        0:{
                            items:1
                        },
                        600:{
                            items:2
                        },
                        1000:{
                            items:3
                        }
                    }
                });
            }, 70);
        }
    }
});


$(document).ready(function () {    
    var pathname = window.location.pathname;
    if (pathname.includes("categories")) {
        try {
            let model = JSON.parse($('#modelCategory').html());
            let url = window.location.href;
            let pointSale = getPointSale();
            if (pointSale && pointSale.rid) {
                if (!url.includes('pointSale=')) {
                    redirect(pathname);
                }
            }
            category.setup(model);  
        } catch (error) {
            console.error("Error cargando el modelo de categorías", error);
        }
    }
});






