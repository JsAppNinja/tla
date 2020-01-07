app.controller('TutorStudentsResultController', ['$scope', '$http', 'ENDPOINT_URI', '$stateParams', '$sce', 'ngDialog',
    function ($scope, $http, ENDPOINT_URI, $stateParams, $sce, ngDialog) {

        function showResult() {
            $http.get(ENDPOINT_URI + 'tutors/viewStudentResult/' + $stateParams.id).then(function (response) {
                $scope.resultHtml.html = $sce.trustAsHtml(response.data.html);
                $scope.result.comment = response.data.comment;
                $scope.result.edited = $scope.result.comment ? true : false;
            });
        }

        $scope.openAddCommentDialog = function () {


            ngDialog.openConfirm({
                template: '/templates/add-comment.tpl.html',
                scope: $scope,
                className: 'ngdialog-theme-default add-comment'
            }).then(function () {
                $http.post(ENDPOINT_URI + 'tutors/addResultComment/' + $stateParams.id, $scope.result).then(function (response) {
                    showResult();
                });
            });
        };

        showResult();

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

        $scope.result = {};


        $scope.resultHtml = {
            html: ''
        };
    }]);