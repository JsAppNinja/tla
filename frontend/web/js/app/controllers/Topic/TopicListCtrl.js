/**
 * Created by supostat on 04.11.15.
 */

app.controller('TopicListController', ['$http', '$scope', '$stateParams', '$state', 'QuestionsService', 'TopicsModel', 'SubtopicsModel', 'Test',
    function ($http, $scope, $stateParams, $state, QuestionsService, TopicsModel, SubtopicsModel, Test) {
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
                $state.go('examIndex.exam.topic.subtopic', {topic_id: topic_id});
            }
        };

        $scope.subtopics = QuestionsService.subtopics.list;
        $scope.createTopic = function () {
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
                    $scope.newTopic = '';
                });
        };

        $scope.deleteTopic = function (id) {
            $http.delete('/v1/topic/delete?id=' + $scope.topics[id].id).
                success(function () {
                    QuestionsService.topics.list.splice(id, 1);
                    if ($scope.topics == false) {
                        $scope.isEmptyTopics = true;
                    } else {
                        $scope.isEmptyTopics = false;
                    }
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