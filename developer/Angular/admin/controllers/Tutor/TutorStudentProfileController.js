app.controller('TutorStudentProfileController', ['$scope', '$stateParams', '$state', 'StudentsModel',
    function ($scope, $stateParams, $state, StudentsModel) {

        $scope.viewProfile = function (student) {
            console.log(student);
            $state.go('tutorStudents.student', {id: student.id});
        };

        function getAvatarSrc(student) {
            if(student.avatar) return student.avatar.thumb;
            if(student.sex == 1) return '/images/nophoto-male.jpg';
            if(student.sex == 0) return '/images/nophoto-female.jpg';
        }


        function getStudentData() {
            console.log($stateParams);
            StudentsModel.getStudent($stateParams.id).then(function (result) {
                console.log(result.data);
                $scope.student = result.data;
            })
        }

        $scope.student = {};
        $scope.getAvatarSrc = getAvatarSrc;

        getStudentData();
    }]);