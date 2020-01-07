/**
 * Created by supostat on 13.11.15.
 */


app.controller('ExamTypeEditController', ['ExamsModel', '$rootScope', '$stateParams', function (ExamsModel, $rootScope, $stateParams) {
    ExamsModel.fetch($stateParams.exam_id).then(function (result) {
        $rootScope.examName = result.data.name;
    });
}]);