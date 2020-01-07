app.controller('PricingController', ['$scope', '$http', 'ENDPOINT_URI', 'Notification', '$timeout',
    function ($scope, $http, ENDPOINT_URI, Notification, $timeout) {
        var countries = [];
        $scope.csrfToken = $('meta[name="csrf-token"]').attr("content");

        (function () {
            $http.get(ENDPOINT_URI + 'subscription-plan/get-tutor-current').then(function (resp) {
                $scope.currentPlan = resp.data.currentPlan;
                $scope.currentStudents = resp.data.studentsCount;
                // $scope.currentStudents = 100;

                $http.get(ENDPOINT_URI + 'subscription-plan').then(function (resp) {
                    $scope.subscriptionPlans = resp.data;
                    angular.forEach($scope.subscriptionPlans, function (item) {
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
                })
            })
        })();

        $scope.switchPlan = function (plan) {

            if(plan.students_count < $scope.currentStudents) {
                $timeout(function () {
                    Notification.error({
                        message: '<div>You have more students that supported in the plan, please remove ' + ($scope.currentStudents - plan.students_count) + ' students, and then come back. <br> You can remove students from <br><strong style="font-size: 20px"><a href="#/students/my-students">this link</a></strong></div>',
                        title: 'Too much students'
                    });
                });
            } else {
                $http.post('tutor-subscription/checkout', {plan_id: plan.id, _csrf: csrfToken}).then(function (resp) {
                    console.log(resp.data);
                });
            }
        };

        $scope.setPlans = function (selectedCountry) {
            angular.forEach($scope.subscriptionPlans, function (plan) {
                plan.mm = null;
                angular.forEach(plan.countries, function (item) {
                    if(item.id == selectedCountry.id && item.price) {
                        plan.perStudentPrice = (item.price/plan.students_count).toFixed(2);
                        plan.mm = item.price;
                    }
                });
            });
        };

        $scope.toggleMM = function (state) {
            console.log(state);
            $scope.mm.state = state;
        };

        $scope.selectedCountry = {};
        $scope.subscriptionPlans = [];
        $scope.hasMM = false;
        $scope.countries = [];
        $scope.mm = {
            state: false
        };
    }

]);