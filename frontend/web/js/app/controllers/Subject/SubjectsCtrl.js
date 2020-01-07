/**
 * Created by supostat on 02.11.15.
 */

app.controller('SubjectsController', ['$http', '$scope', '$state', '$stateParams', 'SubjectsModel', function ($http, $scope, $state, $stateParams, SubjectsModel) {

    var exam_id = $stateParams.exam_id;

    function getOriginList() {
        SubjectsModel.getOriginList(exam_id).then(function (result) {
            if(result.data == false) {
                $scope.isEmptyOriginSubjects = true;
            } else {
                $scope.isEmptyOriginSubjects = false;
            }
            $scope.listOrigin = result.data;
        })
    }

    function getSubjects() {
        var exam_id = $stateParams.exam_id;
        SubjectsModel.all(exam_id).then(function (result) {
            if(result.data == false) {
                $scope.isEmptySubjects = true;
            } else {
                $scope.isEmptySubjects = false;
            }
            $scope.subjects = result.data;
        });
    }

    function addSubject(subject) {
        var selectedSubject = {
            name: subject.name,
            subject_origin_id: subject.id,
            examtype_id: $stateParams.exam_id
        };
        SubjectsModel.create(selectedSubject)
            .then(function (result) {
                getSubjects();
                getOriginList();
            });
    }

    function deleteSubject(subjectId) {
        SubjectsModel.destroy(subjectId)
            .then(function (result) {
                getSubjects();
                getOriginList();
            });
    }

    function showTopics(subject_id, e) {
        if($(e.target).is('td')) {
            $(e.target).parent('tr').siblings().removeClass('active');
            $(e.target).parent('tr').addClass('active');
            $state.go('examIndex.exam.topic', {subject_id: subject_id});
        }
    };

    $scope.listOrigin = [];
    $scope.exam_id = exam_id;
    $scope.suffix = "Test breadcrumb";
    $scope.isEmptySubjects = false;
    $scope.isEmptyOriginSubjects = false;

    $scope.addSubject = addSubject;
    $scope.deleteSubject = deleteSubject;
    $scope.showTopics = showTopics;

    getSubjects();
    getOriginList();
}
]);