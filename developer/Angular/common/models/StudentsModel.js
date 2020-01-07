app.service('StudentsModel', ['$http', 'ENDPOINT_URI', function ($http, ENDPOINT_URI) {
    var url = ENDPOINT_URI + 'students';

    var service = this;

    service.getStudentsList = function () {
        return $http.get(url);
    };

    service.getStudent = function (id) {
        return $http.get(url + '/' + id);
    }
}]);