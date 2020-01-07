/**
 * Created by supostat on 14.12.15.
 */


app.service("User", ['$http', 'ENDPOINT_URI', function ($http, ENDPOINT_URI) {
    var service = this;

    service.isAdmin = function () {
        return $http.get(ENDPOINT_URI + 'users/getpermission');
    };
}]);