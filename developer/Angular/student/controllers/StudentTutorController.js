app.controller('StudentTutorController', ['$scope', '$http', 'ENDPOINT_URI', '$sce', 'Upload', 'Notification',
    function ($scope, $http, ENDPOINT_URI, $sce, Upload, Notification) {

        $scope.init = function (tutor_id, avatar) {
            $scope.tutor_id = tutor_id;
            $scope.student.avatar = avatar;

            $http.get(ENDPOINT_URI + 'students/getGradeLevels/' + tutor_id).then(function (response) {
                $scope.gradeLevels = response.data.grade_levels;
                $scope.students = response.data.students;
                if($scope.gradeLevels.length) {
                    $scope.selectedGradeLevel.value = $scope.gradeLevels[0];
                    getSubject($scope.selectedGradeLevel.value);
                }
            })
        };

        function getSubject(selectedGradeLevel) {
            var data = {
                tutor_id: $scope.tutor_id,
                level_id: selectedGradeLevel.id
            };

            $http.get(ENDPOINT_URI + 'students/getSubjects', {params: data}).then(function (response) {
                $scope.subjects = response.data;
                if($scope.subjects.length) {
                    $scope.selectedSubject.value = $scope.subjects[0];
                    getLessons($scope.selectedSubject.value);
                }
            })
        }
        function getLessons(selectedSubject) {
            var data = {
                tutor_id: $scope.tutor_id,
                level_id: $scope.selectedGradeLevel.value.id,
                subject_id: selectedSubject.id
            };

            $http.get(ENDPOINT_URI + 'students/getLessons', {params: data}).then(function (response) {
                $scope.lessons = response.data;
                if($scope.lessons.length) {
                    $scope.selectedLesson.value = $scope.lessons[0];
                    $scope.onSelectLesson($scope.lessons[0]);
                }
            })
        }
        
        
        
        function getLesson(lesson) {
            var data = {
                tutor_id: $scope.tutor_id,
                subject_id: $scope.selectedSubject.value.id
            };

            $http.get(ENDPOINT_URI + 'students/getLesson/' + lesson.id, {params: data}).then(function (response) {
                $scope.viewedLesson = response.data;
                angular.forEach($scope.viewedLesson.videos, function (item) {
                   item.HTMLIframe = $sce.trustAsHtml(item.iframe);
                });
            });
        }

        $scope.onSelectGrade = function (item, model) {
            getSubject(model);
        };

        $scope.onSelectSubject = function (item, model) {
            if(!item) {
                $scope.selectedSubject.value = undefined;
                $scope.selectedLesson.value = undefined;
            } else {
                getLessons(model);
            }
        };

        $scope.onSelectLesson =  function (item) {
            if(item) {
                getLesson(item);
            }
        };

        $scope.addComment = function (student, assignment, form) {
            if(form.$invalid) return;
            var data = {
                comment: assignment.newComment,
                assignment_id: assignment.id,
                file: assignment.student_file
            };
            if(!assignment.comments) {
                assignment.comments.data = [];
            }

            $http.post(ENDPOINT_URI + 'assignments/addStudentAssignment', data).then(function (response) {
                assignment.comments.data.push(response.data);
                assignment.newComment = null;
            });

        };

        $scope.getAvatar = function (data, comment) {
            if(comment.owner_type == 0) {
                return data.student_avatar;
            };

            if(comment.owner_type == 1) {
                return data.tutor_avatar;
            }
        };

        $scope.getStudentAvatar = function (student) {
            if(student.avatar) {
                return '/uploads/avatars/students/' + student.id + '/' + student.avatar;
            }
            return '/images/no_avatar2.png';
        };

        $scope.upload = function(assignment) {
            Upload.upload({
                url: ENDPOINT_URI + 'students/uploadAssignment',
                data: {
                    'File': assignment.student_file,
                    'id': assignment.id
                }
            }).then(function (response) {
                Notification.success({
                    message: 'Successfully uploaded',
                    title: 'File'
                });

                if(!assignment.student_files) {
                    assignment.student_files = [];
                }
                assignment.student_files.push(response.data);
                assignment.student_file = null;
            });
        };


        $scope.addChat = function (student) {
            var data = {
                user_id: student.data.user_id
            };

            $http.post(ENDPOINT_URI + 'chat/createChat', data).then(function () {
                student.hasChat = true;
            });

        };

        $scope.removeChat = function (student) {
            $http.post(ENDPOINT_URI + 'chat/removeChat', {user_id: student.data.user_id}).then(function () {
                student.hasChat = false;
            });
        };

        $scope.student = {};
        $scope.gradeLevels = [];
        $scope.subjects = [];
        $scope.lessons = [];
        $scope.tutor_id = null;
        $scope.selectedSubject = {};
        $scope.selectedLesson = {};
        $scope.selectedGradeLevel = {};
        $scope.viewedLesson = {};
    }]);