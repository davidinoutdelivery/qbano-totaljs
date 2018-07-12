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
        }
    }
});


$(document).ready(function () {
    search.setup();
});