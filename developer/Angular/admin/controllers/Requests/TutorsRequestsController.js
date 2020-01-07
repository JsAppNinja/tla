app.controller('TutorsRequestsController', ['$scope', 'TutorsModel', 'ngDialog',
    function ($scope, TutorsModel, ngDialog) {
        $scope.requests = [];

        function getRequests() {
            TutorsModel.getStudentsRequests().then(function (result) {
                $scope.requests = result.data;
            });
        }

        function acceptRequest(request) {
            $scope.request = request;
            ngDialog.openConfirm({
                scope: $scope,
                template: '/templates/dialogs/acceptRequest.html'
            }).then(function (request) {
                var data = {
                    id: request.student.id
                };
                TutorsModel.acceptRequest(data).then(function () {
                    for (var i in $scope.requests) {
                        if ($scope.requests[i].id == request.id) {
                            $scope.requests.splice(i, 1);
                        }
                    }
                });
            })
        }

        function rejectRequest(request) {
            $scope.request = request;
            ngDialog.openConfirm({
                scope: $scope,
                template: '/templates/dialogs/rejectRequest.html',
            }).then(function (request) {
                var data = {
                    id: request.student.id
                };
                TutorsModel.rejectRequest(data).then(function () {
                    for (var i in $scope.requests) {
                        if ($scope.requests[i].id == request.id) {
                            $scope.requests.splice(i, 1);
                        }
                    }
                });
            })
        }

        $scope.acceptRequest = acceptRequest;
        $scope.rejectRequest = rejectRequest;
        $scope.request = {};
        getRequests();
    }]);