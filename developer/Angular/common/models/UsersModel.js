/**
 * Created by supostat on 28.12.15.
 */
app.service('UsersModel', ['$http', 'ENDPOINT_URI', 'Upload', function ($http, ENDPOINT_URI, Upload) {
    var user = {};
    var url = ENDPOINT_URI + 'users';

    var service = this;

    service.getCurrentUser = function () {
        return $http.get(url + '/get-user-data');
    };

    service.saveProfile = function (data) {
        return Upload.upload({
            url: url + '/profile/' + data.id,
            data: data
        });
    };

    service.getNamesByType = function (type, data) {
        return $http.post(url + '/getNamesByType/' + type, data);
    };

    service.sendRequest = function (data) {
        return $http.post(url + '/sendRequest', data);
    };

    service.getRequests = function (data) {
        return $http.get(url + '/getRequests', {params: data});
    };

    service.getTutorStudentsCount = function () {
        return $http.get(url + '/getStudentsCount');
    };

    service.getRequestsCount = function () {
        return $http.get(url + '/getRequestsCount');
    };

    service.searchUsers = function (data) {
        return $http.post(url + '/searchUsers', data);
    };
}]);