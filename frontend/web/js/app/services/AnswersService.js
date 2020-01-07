/**
 * Created by supostat on 02.11.15.
 */

app.service('answersService', function($http, $stateParams, $state) {
    var answers = [];

    var addAnswer = function(newObj) {
        answers.push(newObj);
    };

    var init = function(data) {
        answers = data;
    };

    var getAnswers = function(){
        return answers;
    };

    return {
        addAnswer: addAnswer,
        getAnswers: getAnswers,
        init: init
    };

});