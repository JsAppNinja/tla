/**
 * Created by igorpugachev on 14.04.16.
 */

app.controller('NotesController', ['$scope', '$http', 'ngDialog', 'ENDPOINT_URI', '$stateParams', 'Upload', 'Notification',
    function ($scope, $http, ngDialog, ENDPOINT_URI, $stateParams, Upload, Notification) {

        var lesson_id = $stateParams.lesson_id;

        function getLessonNotes() {
            $http.get(ENDPOINT_URI + 'notes/getLessonNotes/' + lesson_id).then(function (response) {
                $scope.notes.list = response.data;
            });
        }

        getLessonNotes();

        $scope.openAddNoteDialog = function () {
            $scope.edited = false;
            $scope.uploaded = false;
            $scope.note = {};
            ngDialog.open({
                templateUrl: '/templates/tutor/dialogs/add-note.tpl.html',
                scope: $scope
            });
        };

        $scope.openEditNoteDialog = function (note) {
            $scope.edited = true;
            $scope.uploaded = false;
            $scope.note = note;


            ngDialog.open({
                templateUrl: '/templates/tutor/dialogs/add-note.tpl.html',
                scope: $scope
            });
        };

        $scope.createNote = function (note, dialog) {

            note.lesson_id = lesson_id;

            $scope.loader = Upload.upload({
                url: ENDPOINT_URI + 'notes',
                data: {'Note': note}
            }).then(function (resp) {
                $scope.uploaded = true;
                getLessonNotes();

            }, function (resp) {
                console.log('Error status: ' + resp);
            }, function (evt) {
                $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
            });

        };

        $scope.updateNote = function (note, dialog) {
            note.lesson_id = lesson_id;

            $http.put(ENDPOINT_URI + 'notes/' + note.id, note).then(function (response) {
                Notification.success({
                    message: 'Successfully updated',
                    title: 'Note'
                });
                dialog.closeThisDialog();
            });
        };

        $scope.deleteNote = function (note) {
            $http.delete(ENDPOINT_URI + 'notes/' + note.id).then(function () {
                getLessonNotes();
            });
        };

        $scope.notes = {};
        $scope.note = {};
        $scope.edited = false;
        $scope.uploaded = false;
    }]);