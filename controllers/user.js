/* jshint strict: true */
"use strict";

let request = require("request");
let timeoutRequest = 50000;

F.functions.crashReport();
// Routes loads from the server
exports.install = function () {
    let timeOut = 50000; //50 seconds
    F.route('/login', login,[timeOut]);
    F.route('/logout', logout, [timeOut]);
    F.route('/account', account, [timeOut]);
    F.route('/register', register, [timeOut]);
    F.route('/address/{consumer}', address, [timeOut]);
    F.route('/profile', profile, [timeOut]);
    //F.route('/recovery', recovery, [timeOut]);
    F.route('#408', view_408);
    F.route('#404', view_404);
};

let url = F.config['parse_server'];
let header = {
    'X-Parse-Application-Id': 'hSMaiK7EXqDqRVYyY2fjIp4lBweiZnjpEmhH4LpJ',
    'Content-Type': 'application/json'
};

/**
 * Builds the request body for 'request' library
 * @param func_api :: API function name
 * @param body :: Send object
 * @param time :: Boolean var for timeout control.
 */
let build_body = function (func_api, body, time=true) {
    let _body = {
        headers: header,
        url: url + func_api,
        json: body,
    };

    if (time) {
        _body["timeout"] = timeoutRequest
    }
    return _body;
};

/**
 * 408 error web page
 * @param self : controller
 */
function view_408() {
    let self = this;
    self.theme(F.config['theme']);
    self.view('408', {title: F.functions.build_title("408")});
}

/**
 * 404 error web page
 * @param self : controller
 */
function view_404() {
    let self = this;
    self.theme(F.config['theme']);
    self.view('404', {title: F.functions.build_title("404")});
}

/**
 * Cards view
 * @param self : controller
 */
function profile() {
    let self = this;
    self.theme(F.config['theme']);
    let title = "Perfil";
    F.functions.view_response(self, "profile", 200, {title: F.functions.build_title(title)});
}

/**
 * Loads addresses view
 * @param self : controller
 */
function address(consumerId) {
    let self = this;
    self.theme(F.config['theme']);
    let title = "Direcciones";

    let query = 'SELECT expand(userAddress[status = true]) FROM #' +consumerId+ ' order by createdAt desc;';
    F.functions.query(query)
    .then( function(response) {
        F.functions.view_response(self, "address", 200, {address: response, title: F.functions.build_title(title)});
    })
    .catch (function (error) {
         console.log("[Error] ", e);
         F.functions.view_response(self, 404, 404, {title: F.functions.build_title("404")});
    });
}

/**
 * User account details
 * @param self : controller
 */
function account() {
    let self = this;
    self.theme(F.config['theme']);
    let title = "Cuenta";
    F.functions.view_response(self, "account", 200, {title: F.functions.build_title(title)});
}

/**
 * User registration
 * @param self : controller
 */
function register() {
    let self = this;
    self.theme(F.config['theme']);
    let title = "Registro";
    F.functions.view_response(self, "register", 200, {title: F.functions.build_title(title)});
}

/**
 * Loads registration or login view
 * @param self : controller
 */
function login() {
    let self = this;
    self.theme(F.config['theme']);
    let title = "Ingresar";
    F.functions.view_response(self, "login", 200, {title: F.functions.build_title(title)});
}

/**
 * Makes logout cleaning cookies
 * @param self : controller
 */
function logout() {
    let self = this;
    self.theme(F.config['theme']);
    self.cookie('user_email', '', '-1 day');
    self.cookie('user_name', '', '-1 day');
    self.cookie('user_lastname', '', '-1 day');
    self.cookie('user_phone', '', '-1 day');
    self.redirect('/login');
}

/**
 * Recovery password view
 * @param self : controller
 */
// function recovery() {
//     let self = this;
//     self.theme(F.config['theme']);
//     if (self.query.token && self.query.businessId && self.query.email) {
//         let response;
//         let status;
//         let async = new U.Async();
//         let body = {
//             'businessId': self.query.businessId,
//             'token': self.query.token,
//             'email': self.query.email
//         };

//         async.await(function (next) {
//             let _dict = build_body("isValidTokenPassword", body, true);
//             request.post(_dict, function(error, responseRequest, body) {
//                 let resp = F.functions.handle_response(error, responseRequest, body);
//                 response = resp.response;
//                 status = resp.status;
//                 next();
//             });
//         });

//         async.run(function () {
//             if (response  && (status >= 200 && status <= 209)) {
//                 F.functions.view_response(self, "recovery", status, {title: F.functions.build_title("Recovery"), recovery: body});
//             } else if(status === 400){
//                 F.functions.view_response(self, "expired", status, {title: F.functions.build_title("Recovery")});
//             }else {
//                 F.functions.view_response(self, status, status, {title: F.functions.build_title("Recovery")});
//             }
//         });
//     } else {
//         F.functions.view_response(self, 404, 404, {title: F.functions.build_title("404")});
//     }
// }