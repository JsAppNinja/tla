/**
 * Created by igorpugachev on 15.04.16.
 */


app.controller('CmsEditController', ['$scope', '$http', 'ENDPOINT_URI', '$stateParams', 'Notification',
    function ($scope, $http, ENDPOINT_URI, $stateParams, Notification) {

        var page_id = $stateParams.page_id;

        function getContent() {
            $http.get(ENDPOINT_URI + 'cms/getContent/' + page_id).then(function (response) {
                if(response.data.length) {
                    console.log($scope.blocks);
                    $scope.blocks = response.data;
                }

                console.log($scope.blocks);
            });

        }

        getContent();

        $scope.tinymceOptions = {
            //setup: function (ed) {
            //    ed.on('init', function (args) {
            //        $('.mce-edit-area').writemaths({iFrame: true});
            //    });
            //},
            resize: false,
            height: 300,
            plugins: "",
            toolbar: "",
            valid_elements: "strong,ul,li,ol,em,br,p"
        };

        $scope.blocks = [
            {
                name: 'leftBlock1',
                page_id: page_id
            },
            {
                name: 'leftBlock2',
                page_id: page_id
            },
            {
                name: 'rightBlock1',
                page_id: page_id
            },
            {
                name: 'rightBlock2',
                page_id: page_id
            }
        ];

        $scope.save = function () {
            var data = {
                blocks: $scope.blocks
            };

            $http.post(ENDPOINT_URI + 'cms/saveContent', data).then(function (response) {
                Notification.success({
                    message: 'Successfully saved',
                    title: 'Cms'
                });
            });

        };
    }
]);