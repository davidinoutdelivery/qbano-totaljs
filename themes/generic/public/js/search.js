var search= new Vue({
    el: '#search',
    data: {
        data: [],
        word: "",
    },
    methods: {
        /**
         * carga inical del buscador
         */
        setup: function () {
            var model = JSON.parse($('#modelSearch').html());
            if (model && model[0] && model[0].search) {
                this.data = model[0].search;
                this.word = model[0].word;
            }
            else {
                this.word = "Vacío"
            }
        },
        /**
         * Obtiene el thumbnail de la imagen de un producto.
         * @param background : si true es un background-image de lo contrario es la url
         */
        getUrlImage: function (product, background= false) {
            var url = background ? 'background-image: url("generic/images/no_found.png")' : '/generic/images/no_found.png';
            if (product.image && product.image.thumbnail) {
                url = background ? 'background-image: url("' + product.image.thumbnail + '")' : product.image.thumbnail ;
            }
            return url;
        },
        /**
         * Direcciona al detalle ya sea una categoría o un producto.
         * @param product : item seleccionado
         */
        detail: function (product) {
            if (product._class === "Product") {
                let url = '/products/' + product.slugCategory + '/' + product.slug;
               redirect(url);
            }
            else if (product._class === "Category") {
                let url = '/categories/' + product.slug;
                redirect(url);
            }
        },
        /**
         * Identifica si es un producto o una categoría
         * @param product : item seleccionado
         */
        type: function (product) {
            let result = product._class;
            if (result === 'Product') {
                result = "Producto";
            }
            else if (result === 'Category') {
                result = "Categoría";
            }
            return result;
        },
        /**
         * Hace una compra directa del producto si no tiene modificadores
         */
        shop: function(categoria, producto, event) {
            products.shop(categoria, producto, event);
        },
        /**
         * Direcciona al hijo de la categoría seleccionada y agrega pointsale a la url si la tiene.
         */
        goToChildCategory: function (category) {       
            if (category) {
                let url = '/categories/' + category.slug;
                redirect(url);
            }
            else {
                notificationGeneral("El item no se encuentra activo.", {type: "warning"});
            }
            
        },
        /**
         * Retorna el detalle de un producto
         */
        productDetail: function(categoria, producto, event) {
            products.detail(categoria, producto, event);
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
          
        }
    }
});


$(document).ready(function () {
    search.setup();
});