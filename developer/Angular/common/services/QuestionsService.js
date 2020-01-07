/**
 * Created by supostat on 09.11.15.
 */


app.factory('QuestionsService', ['TopicsModel', 'SubtopicsModel', function (TopicsModel, SubtopicsModel) {
    var topics = {},
        subtopics = {},
        answers = {},
        images = [];

    answers.list = [];
    topics.list = [];
    subtopics.list = [];
    topics.selected = {};
    subtopics.selected = {};

    answers.init = function (data) {
        answers.list = data;
    };

    answers.add = function(newObj) {
        answers.list.push(newObj);
    };

    subtopics.select = function (data) {
        subtopics.selected = data;
    };
    topics.select = function (data) {
        topics.selected = data;
    };

    answers.get = function(){
        return answers.list;
    };

    topics.init = function(data) {
       topics.list = data;
    };

    topics.add = function(newTopic) {
       topics.list.push(newTopic);
    };

    subtopics.init = function (data) {
        angular.forEach(data, function (value, key) {
            subtopics.add(value);
        })
    };

    subtopics.add = function(newSubtopic) {
        subtopics.list.push(newSubtopic);
    };

    return {
        answers: answers,
        topics: topics,
        subtopics: subtopics
    }
}]);