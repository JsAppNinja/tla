app.controller('AnnouncementController', ['$scope', '$http', '$filter', 'ENDPOINT_URI', 'Notification',
    function ($scope, $http, $filter, ENDPOINT_URI, Notification) {

        $scope.onTimeSet = function (newDate, oldData) {
            $scope.announce.showingDate = $filter('date')(newDate, "MMM d, y. h:mm a");

        };

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

        $scope.saveAnnouncement = function (announcement) {
            $http.post(ENDPOINT_URI + 'tutors/setAnnounce', announcement).then(function (response) {
                Notification.success({
                    message: 'Successfully set',
                    title: 'Announcement'
                });
            });
        };

        $scope.beforeRender = function ($view, $dates, $leftDate, $upDate, $rightDate) {
            var currentDate = new Date();
            var currentDateValue = currentDate.getTime();

            var yearViewDate = new Date(currentDate.getFullYear(), 0);
            var yearViewDateValue = yearViewDate.getTime();

            var monthViewDate = new Date(currentDate.getFullYear(), currentDate.getMonth());
            var monthViewDateValue = monthViewDate.getTime();

            var dayViewDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
            var dayViewDateValue = dayViewDate.getTime();

            var hourViewDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), currentDate.getHours());
            var hourViewDateValue = hourViewDate.getTime();

            var minuteViewDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate(), currentDate.getHours() , currentDate.getMinutes());
            var minuteViewDateValue = minuteViewDate.getTime() ;

            for (var index = 0; index < $dates.length; index++) {

                var date = $dates[index];

                // Disable if it's in the past
                var dateValue = date.localDateValue();
                switch ($view) {

                    case 'year':
                        if (dateValue < yearViewDateValue) {
                            date.selectable = false;
                        }
                        break;

                    case 'month':
                        if (dateValue < monthViewDateValue) {
                            date.selectable = false;
                        }
                        break;

                    case 'day':
                        if (dateValue < dayViewDateValue) {
                            date.selectable = false;
                        }
                        break;

                    case 'hour':
                        if (dateValue < hourViewDateValue) {
                            date.selectable = false;
                        }
                        break;

                    case 'minute':
                        if (dateValue < minuteViewDateValue) {
                            date.selectable = false;
                        }
                        break;
                }
            }
        };

        function getAnnouncement() {
            $http.get(ENDPOINT_URI + 'tutors/getAnnounce').then(function (response) {
                $scope.announce = response.data;
                if($scope.announce.date == null) {
                    $scope.announce.date = moment().format();
                    $scope.announce.showingDate = undefined;
                } else {
                    $scope.announce.date = moment($scope.announce.date).utc().format();
                    $scope.announce.showingDate = $filter('date')($scope.announce.date, "MMM d, y. h:mm a");
                }
            });
        }

        getAnnouncement();

        $scope.announce = {};

    }]);