/**
 * Created by supostat on 08.03.16.
 */

app.controller('TutorSubscriptionsSettingsController', ['$scope', 'ngDialog', '$http', 'ENDPOINT_URI', '$rootScope',
    function ($scope, ngDialog, $http, ENDPOINT_URI, $rootScope) {
        var $templates_path = '/templates/admin/dialogs/';
        var countries;

        function createSubscriptionPlan(plan) {
            $http.post(ENDPOINT_URI + 'subscription-plan/create', plan).then(function (result) {
                $scope.subscriptionPlans.push(result.data);
            })
        }

        function getSubscriotionPlansList() {
            $http.get(ENDPOINT_URI + 'subscription-plan').then(function (result) {
                $scope.subscriptionPlans = result.data;
            });
        }

        function updateSubscriptionPlan(plan, callback) {
            $http.put(ENDPOINT_URI + 'subscription-plan/update', plan).then(function (result) {
            });
        }

        $scope.setAmount = function () {
            $scope.editingPlan.amount = $scope.editingPlan.students_count * $rootScope.system.settings.amount_per_student;
        };

        $scope.editSubscriptionPlanDialog = function (plan) {
            $scope.editingPlan = plan;
            $scope.edit = true;
            ngDialog.openConfirm({
                template: $templates_path + 'create-subscription-plan.tpl.html',
                scope: $scope
            }).then(function (plan) {
                updateSubscriptionPlan(plan);
            });

        };

        $scope.deleteSubscriptionPlan = function (plan, index) {
            $http.delete(ENDPOINT_URI + 'subscription-plan/delete?id=' + plan.id).then(function (result) {
                if (result) {
                    $scope.subscriptionPlans.splice(index, 1);
                }
            });
        };

        $scope.openCreateSubscriptionPlanDialog = function () {
            $scope.editingPlan = {};
            $scope.editingPlan.countries = countries;
            $scope.edit = false;
            ngDialog.openConfirm({
                template: $templates_path + 'create-subscription-plan.tpl.html',
                scope: $scope
            }).then(function (plan) {
                createSubscriptionPlan(plan);
            });
        };

        $scope.editingPlan = {};
        $scope.subscriptionPlans = [];
        $scope.edit = false;
        $scope.countries = [];

        getSubscriotionPlansList();
    }
]);