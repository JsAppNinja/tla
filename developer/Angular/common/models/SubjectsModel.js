/**
 * Created by supostat on 05.11.15.
 */
app.service('SubjectsModel', ['$http', 'ENDPOINT_URI', function ($http, ENDPOINT_URI) {
    var service = this,
        path = 'subjects';

    function getUrl() {
        return ENDPOINT_URI + path;
    }

    function getUrlForId(itemId) {
        return getUrl(path) + '/' + itemId;
    }

    service.all = function (exam_id) {
        return $http.get(getUrl() + '/all?exam_id=' + exam_id);
    };

    service.getOriginList = function (exam_id) {
        return $http.get(getUrl() + '/list?exam_id=' + exam_id);
    };

    service.fetch = function (itemId) {
        return $http.get(getUrlForId(itemId));
    };

    service.getTutorSubjectList = function (exam_id) {
        return $http.get(getUrl() + '/getTutorSubjectList/' + exam_id);
    };

    service.create = function (item) {
        return $http.post(getUrl(), item);
    };
    service.add = function (item) {
        return $http.post(getUrl() + '/add', item);
    };

    service.update = function (itemId, item) {
        return $http.put(getUrlForId(itemId), item);
    };

    service.saveOrder = function (data) {
        return $http.post(getUrl() + '/saveOrder', data);
    };

    service.destroy = function (itemId) {
        return $http.delete(getUrlForId(itemId));
    };
    service.remove = function (itemId) {
        return $http.post(getUrl() + '/remove/' + itemId);
    };
}]);