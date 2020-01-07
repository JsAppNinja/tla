/**
 * Created by supostat on 23.03.16.
 */

app.controller('TutorSearchController', ['$scope', '$http', 'ENDPOINT_URI', 'Notification', '$filter',
    function ($scope, $http, ENDPOINT_URI, Notification, $filter) {

        $scope.priceTypes = [
            {
                id: 0,
                name: 'Price per subject'
            },
            {
                id: 1,
                name: 'Price for all subjects'
            }
        ];

        function getFilterData() {
            $http.get(ENDPOINT_URI + 'subject/get-tutors-subjects').then(
                function (response) {
                    $scope.subjects = response.data;
                },
                function (response) {

                }
            );
            $http.get(ENDPOINT_URI + 'tutors').then(
                function (response) {
                    $scope.tutors = response.data;
                    $scope.filteredTutors = response.data;
                    $scope.tutorsList = response.data;
                    $scope.totalItems = response.data.length;
                    filtering();
                },
                function (response) {
                }
            );

            $http.get(ENDPOINT_URI + 'tutors/getMinMaxSubjectPrice/' + $scope.priceTypes[0].id).then(function (response) {
                var max = parseInt(response.data.max) + 20;
                $scope.slider = {
                    minValue: 0,
                    maxValue: response.data.max,
                    options: {
                        floor: 0,
                        ceil: max,
                        step: 5,
                        minRange: 5,
                        translate: function (value) {
                            return '$' + value;
                        }
                    }
                };
            });
        }

        getFilterData();

        function paginate(tutors) {
            var begin = (($scope.currentPage - 1) * $scope.maxSize);
            var end = begin + $scope.maxSize;
            $scope.showingTutors = tutors ? tutors.slice(begin, end) : $scope.filteredTutors.slice(begin, end);

            $scope.showingTutors.forEach(function (item) {
                item.subjectList = getTutorSubjects(item);
            })
        }

        function getTutorSubjects(tutor) {
            return tutor.subjects.map(function(elem){
                return elem.name;
            }).join(", ");
        };

        function filtering(tutors) {
            var property = $scope.selectedPriceType.value.id == 0 ? 'price_per_subject' : 'price_for_all_subjects';
            var filteredTutors = $filter('rangeFilter')(tutors ? tutors : $scope.tutors, {
                priceMin: $scope.slider.minValue,
                priceMax: $scope.slider.maxValue,
                property: property
            });
            $scope.totalItems = filteredTutors.length;
            paginate(filteredTutors);
        }

        $scope.searchTutor = function (item) {
            if (item) {
                $scope.selectedSubject.value = null;
                $scope.filteredTutors = $filter('filter')($scope.tutors, {
                    first_name: item.first_name,
                    last_name: item.last_name
                });
                paginate();
            } else {
                $scope.filteredTutors = $filter('filter')($scope.tutors, {});
                filtering();
            }
        };
        $scope.searchSubject = function (item) {
            if (item) {
                $scope.filteredTutors = $filter('filter')($scope.tutors, {$: item});
                filtering($scope.filteredTutors);
            } else {
                $scope.filteredTutors = $filter('filter')($scope.tutors, {});
                filtering();
            }

        };

        $scope.sendRequest = function (tutor) {
            $http.post(ENDPOINT_URI + 'student/send-request', tutor).then(
                function () {
                    Notification.success({
                        message: 'Successfully send',
                        title: 'Request'
                    });
                    tutor.requested = true;
                },
                function (response) {
                    Notification.error({
                        message: response.data,
                    });
                }
            );
        };

        $scope.changePriceType = function (type) {
            $http.get(ENDPOINT_URI + 'tutors/getMinMaxSubjectPrice/' + type.id).then(function (response) {
                var max = parseInt(response.data.max) + 200;
                $scope.slider = {
                    minValue: 5,
                    maxValue: response.data.max,
                    options: {
                        floor: 0,
                        ceil: max,
                        step: 5,
                        minRange: 5,
                        translate: function (value) {
                            return '$' + value;
                        }
                    }
                };

                filtering($scope.filteredTutors);
            });
        };


        $scope.selectedPriceType = {
            value: $scope.priceTypes[0]
        };

        $scope.$on("slideEnded", function () {
            if ($scope.selectedSubject) {
                filtering($scope.filteredTutors);
            } else {
                filtering();
            }
            $scope.$apply();

        });

        $scope.getTutorPrice = function (tutor) {
            return $scope.selectedPriceType.value == 0 ? tutor.price_per_subject : tutor.price_for_all_subjects;
        };

        $scope.createChat = function (tutor) {
            $http.post(ENDPOINT_URI + 'chat/createChat', {user_id: tutor.user_id}).then(function (response) {
                tutor.hasChat = true;
            });
        };

        $scope.removeChat = function (tutor) {
            $http.post(ENDPOINT_URI + 'chat/removeChat', {user_id: tutor.user_id}).then(function (response) {
                tutor.hasChat = false;
            });
        };

        $scope.slider = {};

        $scope.subjects = [];
        $scope.tutors = [];
        $scope.tutorsList = [];
        $scope.selectedSubject = {};
        $scope.selectedTutor = {};
        $scope.searching = {};
        $scope.filteredTutors = [];
        $scope.prices = {};
        $scope.showingTutors = [];

        $scope.currentPage = 1;
        $scope.maxSize = 5;

        $scope.setPage = function (pageNo) {
            $scope.currentPage = pageNo;
        };

        $scope.pageChanged = function () {
            paginate($scope.filteredTutors);
        };
    }]);
