/**
 * Created by supostat on 22.03.16.
 */


var app = angular.module('TUTOR_UNSUBSCRIBE', [])
    .constant('ENDPOINT_URI', '/v1/');

app.controller('MobileMoneyController', ['$scope', '$http', 'ENDPOINT_URI',
    function ($scope, $http, ENDPOINT_URI) {
        var countries = [];
        function getSubscriptionPlans() {
            $http.get(ENDPOINT_URI + 'subscription-plan').then(function(result) {
                $scope.subscriptionPlans = result.data;
                angular.forEach(result.data, function (item) {
                    if(item.mm == true) {
                        $scope.hasMM = true;
                    }
                });
                if($scope.hasMM) {
                    $http.get(ENDPOINT_URI + 'mm-country/get-mm-countries').then(function (result) {
                        $scope.countries = result.data;
                        $scope.selectedCountry = $scope.countries[0];
                        $scope.setPlans($scope.selectedCountry);
                    })
                }
            });
        }
        getSubscriptionPlans();
        $scope.toggleMM = function (state) {
            $scope.mm.state = state;
        };
        $scope.setPlans = function (selectedCountry) {
            angular.forEach($scope.subscriptionPlans, function (plan) {
                plan.mm = null;
                angular.forEach(plan.countries, function (item) {
                    if(item.id == selectedCountry.id && item.price) {
                        console.log(item.price);
                        plan.perStudentPrice = (item.price/plan.students_count).toFixed(2);
                        plan.mm = item.price;
                    }
                });
            });
        };


        $scope.selectedCountry = {};
        $scope.subscriptionPlans = [];
        $scope.hasMM = false;
        $scope.countries = [];

        $scope.mm = {
            state: false
        };
    }]);