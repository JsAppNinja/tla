/**
 * Created by supostat on 05.11.15.
 */
app.service('ExamsModel', ['$http', 'ENDPOINT_URI', function ($http, ENDPOINT_URI) {
    var service = this,
        path = 'examtypes';

    function getUrl() {
        return ENDPOINT_URI + path;
    }

    function getUrlForId(itemId) {
        return getUrl(path) + '/' + itemId;
    }

    service.allfree = function () {
        return $http.get('/v1/examtypes/allfree');
    };

    service.all = function () {
        return $http.get(getUrl());
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

    service.checkFree = function (itemId) {
        return $http.post(getUrl() + '/checkfree/' + itemId);
    };

    service.destroy = function (itemId) {
        return $http.delete(getUrlForId(itemId));
    };

    service.saveOrder = function (data) {
        return $http.post(getUrl() + '/saveOrder', data);
    };


    service.changeState = function (item) {
        item.active = !item.active;
        return $http.put(getUrl() + '/changeState/' + item.id, item);
    };
}]);