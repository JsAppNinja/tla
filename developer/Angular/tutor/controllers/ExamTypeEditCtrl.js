/**
 * Created by supostat on 13.11.15.
 */


app.controller('ExamTypeEditController', ['ExamsModel', '$scope', '$stateParams', function (ExamsModel, $scope, $stateParams) {

    ExamsModel.fetch($stateParams.level_id).then(function (result) {
        $scope.gradeLevelName = result.data.name;
    });
}]);