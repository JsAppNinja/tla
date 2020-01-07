<div class="page-header">
    <h1>New Quiz</h1>
</div>
<form novalidate>
<div class="col-md-6">
    <div class="form-group">
        <input ng-model="quizName" type="text" name="name" placeholder="Enter quiz name" class="form-control">
    </div>
    <div class="form-group">
        <textarea ng-model="quizDescription" class="form-control" rows="6" placeholder="Description"></textarea>
    </div>
    <div class="form-group">
        <div class="dropdown">
            <a class="dropdown-toggle" id="dropdown2" role="button" data-toggle="dropdown" href="javascript:;">
                <div class="input-group"><input placeholder="Date" type="text" class="form-control" data-ng-model="quizDate" ><span class="input-group-addon"><i class="glyphicon glyphicon-calendar"></i></span>
                </div>
            </a>
            <ul class="dropdown-menu" role="menu" aria-labelledby="dLabel">
                <datetimepicker data-on-set-time="onTimeSet(newDate, oldDate)" data-ng-model="quizDate" data-datetimepicker-config="{ startView:'month', minView:'month', dropdownSelector: '#dropdown2' }"/>
            </ul>
        </div>
    </div>
    <div class="form-group">
        <input type="number" placeholder="Hours" class="form-control" ng-model="quizHours" min="0" value="0">
    </div>
    <div class="form-group flex-content flex-justify-between">
        <button ng-click="saveQuiz()" class="btn btn-primary">Save</button>
        <button class="btn btn-default">Attach video with solution</button>
        <a ui-sref="subject.elements({slug: 'quiz'})" id="back-quiz-list" class="btn btn-default pull-right">Back</a>
    </div>
</div>
</form>