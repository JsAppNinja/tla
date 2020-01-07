<div class="row" ng-controller="FreepracticeListController">
    <div class="col-xs-12">
        <div class="row">
            <div class="col-xs-12">
                <div class="jumbotron">
                    <h3>Here are only the introductory exams, if you want to see more, please sign up</h3>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-xs-3">
                <div class="form-group">
                    <label for="">Exam type</label>
                    <select ng-options="exam_type.name for exam_type in exam_types"
                            ng-model="selectedExamType" class="form-control"></select>
                </div>
            </div>
            <div class="col-xs-3">
                <div class="form-group">
                    <label for="">Subject</label>
                    <select ng-options="subject.name for subject in subjects" ng-model="selectedSubject"
                            class="form-control"></select>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-xs-12">
                <h1 ng-hide="exams.length" class="ng-hide">No Exams found ...</h1>
                <table class="ng-cloak table table-bordered table-striped">
                    <tr ng-repeat="exam in exams track by $index">
                        <td>
                            {{exam.name}}
                        </td>
                        <td class="start-button">
                            <a ng-href="/freepractice/practice/{{exam.id}}"
                               class="btn btn-primary pull-right">
                                    <span>
                                        Start
                                    </span>
                            </a>
                        </td>
                    </tr>
                </table>
            </div>
        </div>

    </div>
</div>