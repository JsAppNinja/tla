/**
 * Created by igorpugachev on 11.04.16.
 */


app.controller('ScheduleController', ['$scope', '$http', 'ENDPOINT_URI', '$stateParams', 'Notification',
    function ($scope, $http, ENDPOINT_URI, $stateParams, Notification) {

        console.log($stateParams);

        $scope.tinymceOptions = {
            //setup: function (ed) {
            //    ed.on('init', function (args) {
            //        $('.mce-edit-area').writemaths({iFrame: true});
            //    });
            //},
            resize: false,
            height: 300,
            plugins: "",
            toolbar: "",
            valid_elements: "strong,ul,li,ol,em,br,p"
        };

        function getSchedule() {
            $http.get(ENDPOINT_URI + 'tutors/getSchedule/' + $stateParams.schedule_grade_id).then(function (response) {
                $scope.grade = response.data;
            });
        }

        getSchedule();

        $scope.saveSchedule = function (grade) {
            grade.grade_id = $stateParams.schedule_grade_id;
            $http.post(ENDPOINT_URI + 'tutors/saveSchedule', $scope.grade).then(function () {
                Notification.success({
                    message: 'Successfully updated',
                    title: 'Schedule'
                });
            });
        };

        $scope.grade = {};
    }]);