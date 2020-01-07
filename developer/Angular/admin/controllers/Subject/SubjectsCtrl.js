/**
 * Created by supostat on 02.11.15.
 */

app.controller('SubjectsController', ['$http', '$scope', '$state', '$stateParams', 'SubjectsModel', 'ngDialog',
    function ($http, $scope, $state, $stateParams, SubjectsModel, ngDialog) {

        var exam_id = $stateParams.exam_id;

        function getOriginList() {
            SubjectsModel.getOriginList(exam_id).then(function (result) {
                if (result.data == false) {
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
                if (result.data == false) {
                    $scope.isEmptySubjects = true;
                } else {
                    $scope.isEmptySubjects = false;
                }
                $scope.subjects = result.data;
            });
        }

        function createSubject(subject) {
            SubjectsModel.create(subject).then(function (result) {
                $scope.newSubject = null;
                getOriginList();
            })
        }

        $scope.sortConfig = {
            animation: 150,
            handle: ".sorting-handle",
            onSort: function (/** ngSortEvent */evt) {
                $scope.sorted = true;
                $scope.sortedModel = evt.models;
            }
        };

        function addSubject(subject) {
            var selectedSubject = {
                name: subject.name,
                subject_origin_id: subject.id,
                examtype_id: $stateParams.exam_id
            };
            SubjectsModel.add(selectedSubject)
                .then(function (result) {
                    getSubjects();
                    getOriginList();
                });
        }



        function deleteSubject(subject) {
            SubjectsModel.destroy(subject.id)
                .then(function (result) {
                    //getSubjects();
                    getOriginList();
                });
        }


        function removeSubject(subject) {
            $scope.deletedSubject = subject;

            ngDialog.openConfirm({
                template: 'templateSubject',
                scope: $scope,
                showClose: false
            }).then(function (subject_id) {
                SubjectsModel.remove(subject_id)
                    .then(function (result) {
                        getSubjects();
                        getOriginList();
                    });
            });

        }

        function showTopics(subject_id, e) {
            if ($(e.target).is('td')) {
                $(e.target).parent('tr').siblings().removeClass('active');
                $(e.target).parent('tr').addClass('active');
                $state.go('examIndex.exam.topic', {subject_id: subject_id});
            }
        };

        $scope.saveOrder = function () {
            var data = [];

            angular.forEach($scope.sortedModel, function (value, key) {
                data.push({id: value.id, order: key});
            });
            SubjectsModel.saveOrder(data).then(function (result) {
                if (result) {
                    $scope.sorted = false;
                }
            })
        };

        $scope.sorted = false;
        $scope.sortedModel = [];


        $scope.listOrigin = [];
        $scope.exam_id = exam_id;
        $scope.suffix = "Test breadcrumb";
        $scope.isEmptySubjects = false;
        $scope.isEmptyOriginSubjects = false;
        $scope.newSubject = {};

        $scope.createSubject = createSubject;
        $scope.addSubject = addSubject;
        $scope.removeSubject = removeSubject;
        $scope.deleteSubject = deleteSubject;
        $scope.showTopics = showTopics;
        $scope.deletedSubject = {};

        getSubjects();
        getOriginList();
    }
]);