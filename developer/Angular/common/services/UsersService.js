/**
 * Created by supostat on 15.12.15.
 */


app.service('UsersService', ['$http', 'ENDPOINT_URI', function ($http, ENDPOINT_URI) {
    var user = {};
    var url = ENDPOINT_URI + 'users';
    user.role = 'admin';
    return {
        getUser: function () {
            return user;
        },
        generateRoleData: function () {
            $http.get(url + '/getpermission').then(function (result) {
                user.role = result.data ? result.data : 'guest';
                return user;
            });
        },
        getUsers: function (usertype) {
            console.log(usertype);
            var link = usertype?'/' + usertype.id:'';
            return $http.get(url + '/get-users' + link);
        },
        deleteUser: function (user) {
            return $http.delete(url + '/' + user.id);
        },
        getRolesTypes: function () {
            return $http.get(url + '/get-roles');
        }
    };

}]);