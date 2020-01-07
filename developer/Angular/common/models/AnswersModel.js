/**
 * Created by supostat on 05.11.15.
 */
app.service('AnswersModel', ['$http', 'ENDPOINT_URI', function ($http, ENDPOINT_URI) {
    var service = this,
        path = 'answers';

    function getUrl() {
        return ENDPOINT_URI + path;
    }

    function getUrlForId(itemId) {
        return getUrl(path) + '/' + itemId;
    }

    service.all = function (id) {
        return $http.get(getUrl() + '/list/' + id);
    };

    service.fetch = function (itemId) {
        return $http.get(getUrlForId(itemId));
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