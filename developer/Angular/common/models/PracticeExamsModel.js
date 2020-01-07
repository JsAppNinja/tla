/**
 * Created by supostat on 09.11.15.
 */

app.service('PracticeExamsModel', ['$http', 'ENDPOINT_URI', function ($http, ENDPOINT_URI) {
    var service = this,
        path = 'quizpractices';

    function getUrl() {
        return ENDPOINT_URI + path;
    }

    function getUrlForId(itemId) {
        return getUrl(path) + '/' + itemId;
    }

    service.selectAnswer = function (answer) {
        return $http.post(getUrl() + '/selectanswer', answer);
    };

    service.essayChange = function (question) {
        return $http.post(getUrl() + '/essaychange', question);
    };

    service.all = function (subject_id) {
        return $http.get(getUrl() + '/all?id=' + subject_id);
    };

    service.fetch = function (itemId) {
        return $http.get(getUrlForId(itemId));
    };

    service.getQuestions = function (itemId) {
        return $http.get(getUrl() + '/viewall/' + itemId);
    };

    service.getFinishedQuizzes = function () {
        return $http.get(getUrl() + '/getFinishedQuizzes');
    };

    service.create = function (item) {
        return $http.post(getUrl(), item);
    };

    service.update = function (itemId, item) {
        return $http.put(getUrlForId(itemId), item);
    };

    service.destroy = function (itemId) {
        return $http.delete(getUrlForId(itemId));
    };

}]);
