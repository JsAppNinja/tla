/**
 * Created by supostat on 09.11.15.
 */
app.controller('SubTopicDropdownController', ['QuestionsService', '$scope', 'Test', function (QuestionsService, $scope, Test) {
    $scope.subtopics = QuestionsService.subtopics.list;
    $scope.$watch('subtopic', function (subtopic) {
        QuestionsService.subtopics.selected = subtopic;
    });
}]);