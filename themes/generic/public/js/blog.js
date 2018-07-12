/**
 * app para lsitas los blogs
 * @type {Vue}
 */
var blog = new Vue({
    el: '#blog',
    data: function () {
        return {
            "blogs": {}
        }
    },
    methods: {
        setup: function (model) {
            this.blogs = model;
            /** Analytics **/
            var params = {};
            params[Properties.CONTENT_NAME] = "blog";
            Analytics.track(EVENTS.VIEW_CONTENT, params);
            /** **/
        },
        /**
         * genera la url para un blog
         * @param blog :: objeto
         * @returns {string} :: url
         */
        urlBlog: function (blog) {
            return "/blog/" + blog.slug
        }
    }
});

$(window).load(function () {
    try {
        var pathname = window.location.pathname;
        if (pathname === "/blog") {
            var model = JSON.parse($('#modelBlog').html());
            blog.setup(model);
        }
    } catch (error) {
        console.error(" error cargando el modelo de blogs", error);
    }
});