/**
 * Created by supostat on 05.11.15.
 */


app.controller('QuizzesController', ['$http', '$scope', '$state', '$stateParams', 'QuizzesModel', 'ngDialog', 'Upload', '$timeout', 'notify', 'SubjectsModel', '$rootScope',
    function ($http, $scope, $state, $stateParams, QuizzesModel, ngDialog, Upload, $timeout, notify, SubjectsModel, $rootScope) {
    var subject_id = $stateParams.subject_id;

    SubjectsModel.fetch(subject_id).then(function (result) {
        $rootScope.subjectName = result.data.name;
        console.log($rootScope.subjectName);
    });

    function getQuizzes() {
        QuizzesModel.all(subject_id).then(function (result) {
            $scope.quizzes = result.data;
        });
    }

    $scope.$watch('files', function () {
        $scope.upload($scope.files);
    });

    $scope.$watch('file', function () {
        if ($scope.file != null) {
            $scope.files = [$scope.file];
        }
    });
    $scope.log = '';
    $scope.upload = function (files) {
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                if (!file.$error) {
                    $scope.myPromise = Upload.upload({
                        url: '/v1/question/import',
                        data: {
                            "UploadExamForm[examFile]": file,
                            subject_id: $stateParams.subject_id
                        }
                    }).progress(function (evt) {
                        var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                        $scope.log = 'progress: ' + progressPercentage + '% ' +
                            evt.config.data['UploadExamForm[examFile]'].name + '\n' + $scope.log;
                    }).success(function (data, status, headers, config) {
                        getQuizzes();
                        notify({
                            message: 'Import complete',
                            //templateUrl: '/js/app/templates/noty/gmail-template.html',
                            position: 'center'
                        });
                    }).error(function (data, status) {
                        if(status == 422) {
                            var message = '';
                            angular.forEach(data, function (value, key) {
                                message = value.field + ': ' + value.message;
                                notify({
                                    message: message,
                                    //templateUrl: '/js/app/templates/noty/gmail-template.html',
                                    position: 'center'
                                });
                            });


                        } else {
                            console.log('Error:', data);
                        }
                    });
                }
            }
        }
    };


    function deleteQuiz(quiz) {
        $scope.deletedQuiz = quiz;
        ngDialog.openConfirm({
            template: 'templateId',
            scope: $scope,
            showClose: false
        }).then(function (quiz_id) {
            QuizzesModel.destroy(quiz_id).then(function (result) {
                getQuizzes();
            })
        });
    }
    function openQuiz(quiz_id) {
        console.log(quiz_id);
        $state.go('.question', {quiz_id: quiz_id});
    }

    $scope.subject_id = subject_id;
    $scope.quizzes = [];

    $scope.deleteQuiz = deleteQuiz;
    $scope.openQuiz = openQuiz;

    getQuizzes();
}]);