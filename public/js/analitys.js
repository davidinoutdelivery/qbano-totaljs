var Analytics = new Vue({
    data: {
        flavorName: "",
        businessId: "",
        mixPanelToken: "",
        facebookPixelId: "",
        googleAnalyticsId: "",
        mixpanel_error: false
    },
    methods: {
        setup: function (serviceConfig) {
            this.flavorName = (serviceConfig.flavorName) ? String(serviceConfig.flavorName) : "";
            this.businessId = (serviceConfig.businessId) ? String(serviceConfig.businessId) : "";
            this.mixPanelToken = (serviceConfig.mixPanelToken) ? String(serviceConfig.mixPanelToken) : "";
            this.facebookPixelId = (serviceConfig.facebookPixelId) ? String(serviceConfig.facebookPixelId) : "";
            this.googleAnalyticsId = (serviceConfig.googleAnalyticsId) ? String(serviceConfig.googleAnalyticsId) : "";
            
            try {
                if (mixpanel && this.mixPanelToken !== null && this.mixPanelToken !== "") mixpanel.init(this.mixPanelToken, Analytics.mixpanelConfig());
                if (this.googleAnalyticsId !== null && this.googleAnalyticsId !== "") loadGoogleAnalytics(this.googleAnalyticsId);
                if (this.facebookPixelId !== null && this.facebookPixelId !== "") loadFacebookPixel(this.facebookPixelId);
            }
            catch(e) {
                this.mixpanel_error = true;
                console.error("[Error] No se pueden cargar librerías para Analytics.");
            }
        },
        track: function (event, params) {
            if(!this.mixpanel_error){
                if (env.MODE !== "PRO") return;

                params = this.setUpDefaultParams(params);

                //TODO: revisar por que no funciona
                if (this.mixPanelToken !== null && this.mixPanelToken !== "" && mixpanel) {
                    mixpanel.track(event, params);
                }

                if (this.googleAnalyticsId !== null && this.googleAnalyticsId !== "") {
                    ga('send', 'event', event, event);
                }

                if (this.facebookPixelId !== null && this.facebookPixelId !== "" && fbq) {
                    this.trackPixel(event, params);
                }
            }
        },
        setUpDefaultParams: function (params) {
            params[Properties.BUSINESS_ID] = this.businessId;
            params[Properties.REFERRER] = document.referrer;
            params[Properties.USER_AGENT] = navigator.userAgent;
            params[Properties.LANGUAJE] = navigator.language;
            
            if (getLocalStorage("pointsaleAll")) {
                var pointSale = JSON.parse(getLocalStorage("pointsaleAll"));
                params[Properties.POINT_SALE_ID] = pointSale.id;
                params[Properties.POINT_SALE_NAME] = pointSale.name;
            }
            return params;
        },
        setUpItemParams: function (params, item) {
            params[Properties.NUM_ITEMS] = item.amount;
            params[Properties.CONTENT_ID] = item.product.id;
            params[Properties.CONTENT_NAME] = item.product.name;
            params[Properties.VALUE] = item.subTotal;
            params[Properties.CURRENCY] = "COP";
            params[Properties.MODIFIER] = [];
            params[Properties.MODIFIER_GROUP] = [];
            params[Properties.VALUES_MEALS] = [];
            
            if (item.modifier && item.modifier.length > 0) {
                for (modifier of item.modifier) {
                    params[Properties.MODIFIER].push(modifier.id);
                }
            }

            if (item.modifiersGroups && item.modifiersGroups.length > 0) {
                for (modifiergroup of item.modifiersGroups) {
                    for (modifier of modifiergroup.modifiers) {
                        params[Properties.MODIFIER_GROUP].push(modifier.modifier.id);
                    }
                }
            }

            if (item.valueMeals && item.valueMeals.length > 0) {
                for (valuemeals of item.valueMeals) {
                    params[Properties.VALUES_MEALS].push(valuemeals.product.id);
                }
            }
            
            return params;
        },
        trackPixel: function (event, params) {
            if(!this.mixpanel_error){
                if (this.facebookPixelId === null || this.facebookPixelId === "" || !fbq) return;
                if (env.MODE !== "PRO") return;
                params = this.setUpDefaultParams(params);
                fbq('trackCustom', event, params);
            }
        },
        setUpMixPanelUser: function (user, consumer) {
            if(!this.mixpanel_error){
                if (this.mixPanelToken === null || this.mixPanelToken === "") return;
                if (env.MODE !== "PRO") return;

                mixpanel.identify(user.id);
                mixpanel.people.set({
                    "$name": consumer.get("name"),
                    "$email": consumer.get("email"),
                    "$phone": consumer.get("phone"),
                    "BusinessId": this.businessId
                });
            }
        },
        mixpanelConfig() {
            return {
                cookie_expiration: 365,
                cross_subdomain_cookie: true,
                debug: false,
                disable_persistence: false,
                persistence: 'localStorage',
                persistence_name: 'mixpanel',
                property_blacklist: [],
                secure_cookie: false,
                track_links_timeout: 300,
                ip: true,
                track_pageview: true,
                upgrade: false
            };
        }
    }
});
