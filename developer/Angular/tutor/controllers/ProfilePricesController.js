/**
 * Created by supostat on 22.03.16.
 */

app.controller('ProfilePricesController', ['$scope', '$http', 'ENDPOINT_URI', 'Notification',
    function ($scope, $http, ENDPOINT_URI, Notification) {

        function getSubjectsPrices() {
            $http.get(ENDPOINT_URI + 'tutors/getSubjectsPrice').then(function (response) {
                $scope.prices = response.data;
            });

        }
        getSubjectsPrices();

        $scope.saveSubjectsPrices = function (prices) {
            $http.post(ENDPOINT_URI + 'tutors/saveSubjectsPrices', prices).then(function (response) {

            });
        };

        $scope.prices = {};
    }]);