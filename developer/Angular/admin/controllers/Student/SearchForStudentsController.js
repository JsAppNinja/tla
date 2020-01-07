/**
 * Created by supostat on 20.01.16.
 */

app.controller('SearchForStudentsController', ['$scope', 'StudentsModel',  function ($scope, StudentsModel) {

    $scope.view = '/templates/views/students-list.html';

    function getStudentsList() {
        StudentsModel.getStudentsList().then(function (result) {
            console.log(result);
            $scope.students = result.data;
        })
    }

    getStudentsList();
}]);