(function () {

    var app = angular.module('TLA_APP', ["xeditable", "ui.bootstrap.datetimepicker"]),
        versionAPI = '/v1';

    app.run(function (editableOptions) {
        editableOptions.theme = 'bs3';
    });

    app.controller('ExamtypeController', ['$http', '$scope', function ($http, $scope) {

        var that = this;
        that.examTypes = [];
        that.newExamtype = {};

        this.getTypes = function (e) {
            $http.get(versionAPI + '/examtypes').
                success(function (data, status, headers, config) {
                    that.examTypes = data;
                }).
                error(function (data, status, headers, config) {

                });
        };

        this.createExamtype = function (e) {
            e.preventDefault();
            $http.post(versionAPI + '/examtypes/create', {name: that.newExamtype.name}).
                success(function (data, status, headers, config) {
                    var examType = {
                        'id': data.id,
                        'name': data.name
                    };
                    that.examTypes.push(examType);
                }).
                finally(function (data, status, headers, config) {
                    $scope.examtypeForm.$setPristine();
                    $scope.examtypeForm.$setUntouched();
                    that.newExamtype = {};
                });
        };

        this.deleteExamtype = function (id, e) {
            e.preventDefault();
            $http.delete(versionAPI + '/examtypes/delete/' + id).
                success(function (data, status, headers, config) {
                    for (key in that.examTypes) {
                        if (that.examTypes[key].id == id) {
                            that.examTypes.splice(key, 1);
                            break;
                        }
                    }
                });
        };

        this.updateExamtype = function (id) {
            var examType;
            for (key in that.examTypes) {
                if (that.examTypes[key].id == id) {
                    examType = that.examTypes[key];
                    break;
                }
            };
            $http.put(versionAPI + '/examtypes/update/' + id, examType).
                success(function (data, status, headers, config) {
                    console.log(data);

                }).
                finally(function (data, status, headers, config) {

                });
        };

        this.checkName = function (data) {
            if (data.trim() == '') {
                return "Field cannot be blank";
            }
        };

        this.getTypes();
    }]);

    app.controller('QuizCtrl', ['$http', '$scope', '$attrs', '$compile', '$filter', function ($http, $scope, $attrs, $compile, $filter) {
        var that = this;
        that.quizes = [];
        that.subject_id = $attrs.subjectid;
        that.exam_id = $attrs.examid;

        $scope.newQuiz = function () {
            $http.get(that.subject_id + '/quiz/create')
                .success(function (data, status, headers, config) {
                    $("#quiz").html($compile(data)($scope));
                    $scope.quizName = '';
                    $scope.quizDescription = '';
                    $scope.quizDate = '';
                    $scope.quizHours = '';
                })
        };

        $scope.backToQuizList = function (e) {
            e.preventDefault();
            $http.get(that.subject_id + '/quiz/list')
                .success(function (data, status, headers, config) {
                    $scope.getQuizes();
                    $("#quiz").html($compile(data)($scope));
                })
        };

        $scope.onTimeSet = function (newDate, oldDate) {
            $scope.quizDate = $filter('date')(newDate, "MMMM yyyy");
        };

        $scope.saveQuiz = function (e) {
            e.preventDefault();
            var newQuiz = {
                subject_id: that.subject_id,
                name: $scope.quizName,
                description: $scope.quizDescription,
                date: moment($scope.quizDate).format("YYYY-MM-DD"),
                hours: $scope.quizHours
            };

            $http.post(versionAPI + '/quize/create', newQuiz)
                .success(function (data, status, headers, config) {
                    $scope.backToQuizList();
                })
        };

        $scope.getQuizes = function () {
            $http.get(versionAPI + '/quize/all?subject_id=' + that.subject_id).
                success(function (data, status, headers, config) {
                    that.quizes = data;
                }).
                error(function (data, status, headers, config) {

                });
        };

        $scope.deleteQuiz = function (id, e) {
            e.preventDefault();

            $http.delete(versionAPI + '/quizes/delete/' + id).
                success(function (data, status, headers, config) {
                    for (var key in that.quizes) {
                        if (that.quizes[key].id == id) {
                            that.quizes.splice(key, 1);
                            break;
                        }
                    }
                });
        };
        $scope.getQuizes();
    }]);


    app.controller('QuestionCtrl', ['$http', '$scope', '$attrs', '$compile', function ($http, $scope, $attrs, $compile) {

        var question = this;
        question.questions = [];
        question.quiz_id = null;
        question.subject_id = null;

        $scope.getQuestionsListDialog = function() {
            $http.get(question.subject_id + '/quiz/' + question.quiz_id + '/question')
                .success(function (data, status, headers, config) {
                    $("#quiz").html($compile(data)($scope));
                    $scope.getQuestionsList();
                })
        };

        $scope.getQuestionsList = function () {
            $http.get(versionAPI + '/questions/list?quiz_id=' + question.quiz_id).
                success(function (data, status, headers, config) {
                    question.questions = data;
                }).
                error(function (data, status, headers, config) {

                });
        };

        $scope.newQuestion = function () {
            $http.get(question.subject_id + '/quiz/' + question.quiz_id + '/question/create')
                .success(function (data, status, headers, config) {
                    $("#quiz").html($compile(data)($scope));
                    $scope.quizName = '';
                    $scope.quizDescription = '';
                    $scope.quizDate = '';
                    $scope.quizHours = '';
                })
        };

        $scope.backToQuestionList = function (e) {
            e.preventDefault();
            $http.get(question.subject_id + '/quiz/' + question.quiz_id + '/question')
                .success(function (data, status, headers, config) {
                    $("#quiz").html($compile(data)($scope));
                    $scope.getQuestionsList();
                })
        };
    }]);


    app.controller('SubjectController', ['$http', '$scope', '$attrs', function ($http, $scope, $attrs) {
        var that = this;
        that.examTypeId = $attrs.examtype;
        that.listOrigin = [];
        that.selectedSubject = {};
        that.subjects = [];

        this.getOriginSubjects = function (e) {
            $http.get(versionAPI + '/subjects/list').
                success(function (data, status, headers, config) {
                    that.listOrigin = data;
                }).
                error(function (data, status, headers, config) {

                });
        };

        this.getSubjects = function (e) {
            $http.get(versionAPI + '/subjects/all?examTypeId=' + that.examTypeId).
                success(function (data, status, headers, config) {
                    that.subjects = data;
                }).
                error(function (data, status, headers, config) {

                });
        };

        this.selectSubject = function (id, name) {
            that.selectedSubject.id = id;
            that.selectedSubject.name = name;
        };

        this.createSubject = function (e) {
            e.preventDefault();

            var newSubject = {
                examtype_id: that.examTypeId,
                subject_origin_id: that.selectedSubject.id
            };

            $http.post(versionAPI + '/subjects/create', newSubject).
                success(function (data, status, headers, config) {

                    var subject = {
                        'id': data.id,
                        'name': data.name
                    };

                    that.subjects.push(subject);
                    console.log(data);
                }).
                error(function (data, status, headers, config) {
                    alert(data.message);
                });
        };

        this.deleteSubject = function (id, e) {
            e.preventDefault();
            $http.delete(versionAPI + '/subjects/delete/' + id).
                success(function (data, status, headers, config) {
                    for (key in that.subjects) {
                        if (that.subjects[key].id == id) {
                            that.subjects.splice(key, 1);
                            break;
                        }
                    }
                });
        };

        this.getOriginSubjects();
        this.getSubjects();

    }]);

})();
