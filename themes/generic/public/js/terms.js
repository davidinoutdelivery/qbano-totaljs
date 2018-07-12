$(window).load(function () {
    var configuration = JSON.parse($('#configuration').html());
    $('#termsconditions').html(configuration.terms);
    /** Analytics **/
    var params = {};
    params[Properties.CONTENT_NAME] = "terms_and_conditions";
    Analytics.track(EVENTS.VIEW_CONTENT, params);
    /** **/
});