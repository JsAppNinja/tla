/**
 * Created by supostat on 04.11.15.
 */

app.controller('TopicListController', ['$http', '$scope', '$stateParams', '$state', 'QuestionsService', 'TopicsModel', 'SubtopicsModel', 'Test', 'ngDialog',
    function ($http, $scope, $stateParams, $state, QuestionsService, TopicsModel, SubtopicsModel, Test, ngDialog) {
        $scope.td = Test;
        $scope.newTopic = {};
        $scope.isEmptyTopics = false;

        var getTopics = function () {
            var subject_id = $stateParams.subject_id;
            TopicsModel.all(subject_id).then(function (result) {
                QuestionsService.topics.init(result.data);
                $scope.topics = QuestionsService.topics.list;
                if (result.data == false) {
                    $scope.isEmptyTopics = true;
                } else {
                    $scope.isEmptyTopics = false;
                }
            });
        };

        $scope.showSubTopics = function (topic_id, e) {
            if ($(e.target).is('td')) {
                $(e.target).parent('tr').siblings().removeClass('active');
                $(e.target).parent('tr').addClass('active');
                $state.go('grade-index.level.topic.subtopic', {topic_id: topic_id});
            }
        };

        $scope.subtopics = QuestionsService.subtopics.list;

        $scope.createTopic = function (validate) {
            if(!validate) return false;
            $scope.topicform.$setPristine();
            $scope.newTopic.subject_id = $stateParams.subject_id;
            $http.post('/v1/topic/create', $scope.newTopic)
                .success(function (data, status, headers, config) {
                    var topic = {
                        'id': data.id,
                        'name': data.name,
                        'subject_id': data.subject_id
                    };
                    QuestionsService.topics.add(topic);
                    $scope.isEmptyTopics = false;
                })
                .finally(function (data, status, headers, config) {
                    $scope.newTopic = null;
                });
        };

        $scope.deleteTopic = function (id) {

            $scope.deletedTopic = $scope.topics[id];

            ngDialog.openConfirm({
                template: 'templateTopic',
                scope: $scope,
                showClose: false
            }).then(function (topic_id) {
                $http.delete('/v1/topic/delete?id=' + topic_id).
                    success(function () {
                        $state.go('grade-index.level.topic', {subject_id: $stateParams.subject_id}, {reload: false});
                        QuestionsService.topics.list.splice(id, 1);
                        if ($scope.topics == false) {
                            $scope.isEmptyTopics = true;
                        } else {
                            $scope.isEmptyTopics = false;
                        }
                    });
            });
        };

        $scope.updateTopic = function (id) {
            var topic;
            for (var key in $scope.topics) {
                if ($scope.topics[key].id == id) {
                    topic = $scope.topics[key];
                    break;
                }
            }
            ;
            $http.put('/v1/topic/update?id=' + id, topic);
        };

        getTopics();
    }
]);