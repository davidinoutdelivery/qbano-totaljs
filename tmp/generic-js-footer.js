$(window).load(function () {
    var initial_footer = new Vue({
        el: "#main_footer",
        data: {
            social: []
        },
        methods: {
            setUp: function() {
                try {

                    if (getSessionStorage(nameStorage.config)) {
                        this.social = JSON.parse(getSessionStorage(nameStorage.config));
                    } else {
                        // apiAjax('configuration', 'get', {}).then(config => {
                        //     if (config && Object.keys(config).length > 0) {
                        //         this.social = config;
                        //         setSessionStorage(nameStorage.config, JSON.stringify(config));
                        //     }
                        //     else {
                        //         console.log("ERROR GETTING CONF FOR FOOTER");
                        //     }
                        // }, function (error) {
                        //     console.error("Ha ocurrido un error consultando la configuración del comercio", error);
                        // });
                    }
                }
                catch(e) {
                    console.error("[Error] Imposible obtener información de configuración.");
                }
            }
        }
    });

    initial_footer.setUp();
});