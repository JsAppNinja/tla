app.service('TutorsModel', ['$http', 'ENDPOINT_URI', function ($http, ENDPOINT_URI) {
    var url = ENDPOINT_URI + 'tutors';

    var service = this;

    service.getStudentsList = function () {
        return $http.get(url + '/students');
    };

    service.getStudentsRequests = function () {
        return $http.get(url + '/studentsRequests');
    };

    service.acceptRequest = function (data) {
        return $http.post(url + '/acceptRequest', data);
    };

    service.rejectRequest = function (data) {
        return $http.post(url + '/rejectRequest', data);
    };
}]);