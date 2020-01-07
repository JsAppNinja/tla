/**
 * Created by supostat on 04.11.15.
 */

app.controller('SubTopicListCtrl', ['$http', '$scope', '$stateParams', '$state', 'SubtopicsModel', 'QuestionsService', 'ngDialog',
    function ($http, $scope, $stateParams, $state, SubtopicsModel, QuestionsService, ngDialog) {
    $scope.subtopics = QuestionsService.subtopics.list;
    $scope.newSubTopic = {};
    $scope.isEmptySubTopics = false;

    var getSubtopics = function () {
        var topic_id = $stateParams.topic_id;
        SubtopicsModel.all(topic_id).then(function (result) {
            $scope.subtopics = result.data;
            if ($scope.subtopics == false) {
                $scope.isEmptySubTopics = true;
            } else {
                $scope.isEmptySubTopics = false;
            }
        });
    };

    $scope.createSubTopic = function (isValid) {
        if(!isValid) return false;

        $scope.subtopicform.$setPristine();

        $scope.newSubTopic.topic_id = $stateParams.topic_id;
        $http.post('/v1/subtopic/create', $scope.newSubTopic)
            .success(function (data, status, headers, config) {
                var subtopic = {
                    'id': data.id,
                    'name': data.name,
                    'topic_id': data.topic_id
                };
                $scope.subtopics.push(subtopic);
                $scope.isEmptySubTopics = false;
            })
            .finally(function (data, status, headers, config) {
                $scope.newSubTopic = '';
            });
    };

    $scope.deleteSubtopic = function (id) {

        $scope.deletedSubtopic = $scope.subtopics[id];

        ngDialog.openConfirm({
            template: 'templateSubtopic',
            scope: $scope,
            showClose: false
        }).then(function (subtopic_id) {
            $http.delete('/v1/subtopic/delete?id=' + subtopic_id).
                success(function () {
                    $scope.subtopics.splice(id, 1);
                    if ($scope.subtopics == false) {
                        $scope.isEmptySubTopics = true;
                    } else {
                        $scope.isEmptySubTopics = false;
                    }
                });
        });
    };

    $scope.updateSubTopic = function (id) {
        var subtopic;
        for (var key in $scope.subtopics) {
            if ($scope.subtopics[key].id == id) {
                subtopic = $scope.subtopics[key];
                break;
            }
        }
        ;
        $http.put('/v1/subtopic/update?id=' + id, subtopic);
    };

    $scope.deletedSubtopic = {};

    getSubtopics();
}
]);