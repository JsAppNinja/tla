/**
 * Created by supostat on 08.03.16.
 */


app.controller('MobileMoneySettingsController', ['$scope', 'ngDialog', '$http', 'ENDPOINT_URI',
    function ($scope, ngDialog, $http, ENDPOINT_URI) {
        var dialog_templates_path = '/templates/admin/dialogs/';

        function getCountries() {
            $http.get(ENDPOINT_URI + 'mm-country').then(function (result) {
                $scope.countries = result.data;
            })
        }

        getCountries();

        $scope.showAddCountryDialog = function () {
            $scope.edit = false;
            $scope.newCountry = {};
            $scope.newCountry.phones = [];
            ngDialog.openConfirm({
                template: dialog_templates_path + 'add-country.tpl.html',
                scope: $scope
            }).then(function (newCountry) {
                var phones = newCountry.phones.map(function (value) {
                    return value.number;
                }).join(',');

                var data = {
                    name: newCountry.name,
                    currency: newCountry.currency,
                    phones: phones
                };

                $http.post(ENDPOINT_URI + 'mm-country/create', data).then(function (result) {
                    $scope.countries.push(result.data);
                });
            });
        };

        $scope.deleteCountry = function (country) {
            $http.delete(ENDPOINT_URI + 'mm-country/delete?id=' + country.id).then(function () {
                getCountries();
            });
        };

        $scope.showEditCountryDialog = function (country) {
            $scope.edit = true;
            angular.copy(country, $scope.newCountry);

            $scope.newCountry.phones = country.phones ? country.phones.split(',').map(function (value) {
                return {number: value};
            }) : null;

            ngDialog.openConfirm({
                template: dialog_templates_path + 'add-country.tpl.html',
                scope: $scope
            }).then(function (newCountry) {
                var phones = newCountry.phones.map(function (value) {
                    return value.number;
                }).join(',');

                var data = {
                    id: newCountry.id,
                    name: newCountry.name,
                    currency: newCountry.currency,
                    phones: phones
                };

                $http.put(ENDPOINT_URI + 'mm-country/update', data).then(function (result) {
                    getCountries();
                });
            });
        };

        $scope.addPhoneNumber = function () {
            $scope.newCountry.phones.push({number: $scope.newCountry.number});
            $scope.newCountry.number = null;
        };

        $scope.edit = false;
        $scope.newCountry = {};
        $scope.newCountry.phones = [];
        $scope.countries = [];
    }
]);