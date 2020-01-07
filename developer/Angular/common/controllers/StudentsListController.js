app.controller('StudentListController', ['$scope', '$state', 'StudentsModel', '$log',
    function ($scope, $state, StudentsModel, $log) {
        $scope.view = '/templates/views/students-list.html';

        $scope.views = [{
            name: 'List',
            template: '/templates/views/students-list.html',
            icon: 'btn btn-default navbar-btn fa fa-list'
        }, {
            name: 'Grid',
            template: '/templates/views/students-grid.html',
            icon: 'btn btn-default navbar-btn fa fa-th'
        }];

        function getAvatarSrc(student) {
            if(student.avatar) return student.avatar.thumb;
            if(student.sex == 1) return '/images/nophoto-male.jpg';
            if(student.sex == 0) return '/images/nophoto-female.jpg';
        }

        function getStudentsList() {
            StudentsModel.getStudentsList().then(function (result) {
                $scope.students = result.data;
                $scope.maxSize = $scope.students.length;
                $scope.filteredStudents = $scope.students.slice(0, 5);
            })
        }

        $scope.viewProfile = function (student) {
            return 'usersProfiles.students.student({id: student.id})';
        };

        $scope.numPerPage = 5;
        $scope.currentPage = 1;

        $scope.pageChanged = function (currentPage) {
            var begin = ((currentPage - 1) * $scope.numPerPage);
            var end = begin + $scope.numPerPage;
            $scope.filteredStudents = $scope.students.slice(begin, end);
        };

        $scope.students = [];
        $scope.getAvatarSrc = getAvatarSrc;
        getStudentsList();
    }]);