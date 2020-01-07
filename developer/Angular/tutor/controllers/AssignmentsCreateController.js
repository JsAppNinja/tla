/**
 * Created by igorpugachev on 28.04.16.
 */

app.controller('AssignmentsCreateController', ['$scope', '$http', 'Notification', 'ENDPOINT_URI', '$state', 'Upload', '$timeout', '$stateParams',
    function ($scope, $http, Notification, ENDPOINT_URI, $state, Upload, $timeout, $stateParams) {

        var filesCount = 0;
        var uploadedCount = 0;

        if ($stateParams.assignment_id) {
            $http.get(ENDPOINT_URI + 'assignments/' + $stateParams.assignment_id).then(function (response) {
                $scope.assignment = response.data;
                $scope.edited = true;
            });
        }

        $scope.saveAssignment = function (assignment) {
            if (!$scope.frmNewAssignment.$invalid) {
                assignment.lesson_id = $stateParams.lesson_id;
                if($scope.edited) {
                    var assignment_id = $stateParams.assignment_id;
                    $http.put(ENDPOINT_URI + 'assignments/' + assignment_id, assignment).then(function (response) {
                        uploadFiles(assignment_id);
                    });
                } else {
                    $http.post(ENDPOINT_URI + 'assignments', assignment).then(function (response) {
                        var assignment_id = response.data.id;
                        uploadFiles(assignment_id);
                    });
                }
            }
        };

        function uploadFiles(assignment_id) {
            filesCount = $scope.files.length;
            if($scope.files.length) {
                for (var i = 0; i < $scope.files.length; i++) {
                    Upload.imageDimensions($scope.files[i]).then(function (d) {
                        $scope.d = d;
                    });
                    $scope.errorMsg = null;
                    (function (f, id) {
                        uploadUsingUpload(f, id);
                    })($scope.files[i], assignment_id);
                }
            } else {
                goBackAndNotice();
            }   
        }

        $scope.deleteFile = function (file, index) {
            $http.delete(ENDPOINT_URI + 'assignments/deleteFile', {params: {file: file.id}}).then(function (response) {
                $scope.assignment.assignmentFiles.splice(index, 1);
            });
        };

        function goBackAndNotice() {
            $state.go('grade-index.level.subject.lessons.materials.assignments');
            if($scope.edited) {
                Notification.success({
                    message: 'Successfully updated',
                    title: 'Assignment'
                });
            } else {
                Notification.success({
                    message: 'Successfully saved',
                    title: 'Assignment'
                });
            }
        }

        function uploadUsingUpload(file, id) {
            file.upload = Upload.upload({
                url: ENDPOINT_URI + 'assignments/addFile',
                data: {'File': file, id: id}
            });

            file.upload.then(function (response) {
                $timeout(function () {
                    uploadedCount++;
                    if (uploadedCount == filesCount) {
                        goBackAndNotice();
                    }
                });
            }, function (response) {
                if (response.status > 0)
                    $scope.errorMsg = response.status + ': ' + response.data;
            }, function (evt) {
                // Math.min is to fix IE which reports 200% sometimes
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
            });

            file.upload.xhr(function (xhr) {
                // xhr.upload.addEventListener('abort', function(){console.log('abort complete')}, false);
            });
        }

        $scope.assignment = {};
        $scope.files = [];
        $scope.edited = false;
    }]);