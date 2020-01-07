/**
 * Created by igorpugachev on 15.04.16.
 */


app.controller('CmsController', ['$scope', '$state', '$http', 'ENDPOINT_URI',
    function ($scope, $state, $http, ENDPOINT_URI) {

        function getPages() {
            $http.get(ENDPOINT_URI + 'cms/getPages').then(function (response) {
                $scope.pages = response.data;
            });
        }

        getPages();

        $scope.go = function (route, params, page) {
            $scope.page_name = page.title;
            $state.go(route, params);
        };

        $scope.pages = [];
    }
]);