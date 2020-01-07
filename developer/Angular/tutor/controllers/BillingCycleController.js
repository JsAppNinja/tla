app.controller('BillingCycleController', ['$http', '$scope', 'ENDPOINT_URI', function ($http, $scope, ENDPOINT_URI) {

    $scope.billing_statuses = [
        {title: 'Error', className: 'error'},
        {title: 'Success', className: 'success'},
        {title: 'Created', className: 'active'}
    ];

    (function () {
        $http.get(ENDPOINT_URI + 'billings/getBillingCycle').then(function (resp) {
            $scope.billingData = resp.data;
            $scope.last_billing = moment.utc(resp.data.subscription.last_billing_date).local();
            $scope.next_billing = moment.utc(resp.data.subscription.next_billing_date).local();
            $scope.current_date = moment.utc(new Date()).local();

            var full_diff = $scope.next_billing.diff($scope.last_billing, 'seconds');
            var current_diff = $scope.current_date.diff($scope.last_billing, 'seconds');
            $scope.time_left = {value: $scope.next_billing.diff($scope.current_date, 'days'), 'title': 'days'};
            if($scope.time_left.value == 0) {
                $scope.time_left = {value: $scope.next_billing.diff($scope.current_date, 'hours'), 'title': 'hours' };
            }
            if($scope.time_left.value == 0) {
                $scope.time_left = {value: $scope.next_billing.diff($scope.current_date, 'minutes'), 'title': 'minutes' };
            }
            $scope.subscription_persent = (current_diff*100)/full_diff;
        })
    })();

}]);
