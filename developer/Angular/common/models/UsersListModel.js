app.service('UsersListModel', ['$http', 'ENDPOINT_URI',
    function ($http, ENDPOINT_URI) {
        var url = ENDPOINT_URI + 'users',
            service = this;

        service.getUsersList = function () {
            return $http.get(url);
        };

    }]);

