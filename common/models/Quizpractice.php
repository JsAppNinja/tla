<?php

namespace common\models;

use frontend\modules\v1\models\Question;
use frontend\modules\v1\models\Student;
use stdClass;
use Yii;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;
use yii\helpers\ArrayHelper;

/**
 * This is the model class for table "quizpractice".
 *
 * @property integer $id
 * @property integer $quiz_id
 * @property integer $student_id
 * @property integer $start_practice
 * @property string $answers
 * @property integer $status
 * @property boolean $timer
 * @property integer $topic_id
 * @property integer $subtopic_id
 */
class Quizpractice extends ActiveRecord
{

    const IN_PROCESS = 1;
    const FINISHED = 2;

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'quizpractice';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['quiz_id', 'student_id', 'start_practice', 'status'], 'integer'],
            ['answers', 'string']
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'quiz_id' => 'Quiz ID',
            'student_id' => 'Student ID',
            'start_practice' => 'Start Practice',
            'answers' => 'Answers',
            'status' => 'Status',
        ];
    }

    public function selectAnswer($question_id, $answer_id)
    {
        $answers = json_decode($this->answers, true);
        $answers[$question_id] = $answer_id;
        $this->answers = json_encode($answers);
        return $this->save() ? true : false;
    }

    public static function checkAnswers($answers = [], $questions = null, $quiz_id = null)
    {
        if (!$quiz_id && !$questions) {
            return false;
        }

        $checkedAnswers = [];
        $notAnswered = 0;
        $incorrect = 0;
        $correct = 0;
        $essays = 0;

        if ($quiz_id) {
            $quiz = Quize::findOne($quiz_id);
            $questions = $quiz->questions;
        }
        $topics = [];
        foreach ($questions as $question) {
            $topic = false;
            $subtopic = false;
            if ($question->essay) {
                $checkedAnswers[$question->id]['essay'] = $answers[$question->id];
                $checkedAnswers[$question->id]['sample_essay'] = $question->sample_essay;
                $correct++;
                $essays++;
                continue;
            }
            if (!isset($answers[$question->id])) continue;

            if ($question->topic) {
                $topic = true;
            }

            if ($question->subtopic) {
                $subtopic = true;
            }

            if ($topic) {
                $topicId = $question->topic->id;
                if (!isset($topics[$topicId])) {
                    $topics[$topicId]['notanswered'] = 0;
                    $topics[$topicId]['correct'] = 0;
                    $topics[$topicId]['incorrect'] = 0;
                }
                $topics[$topicId]['name'] = $question->topic->name;
                if ($subtopic) {
                    $subTopicId = $question->subtopic->id;
                    if (!isset($topics[$topicId]['subtopics'][$subTopicId])) {
                        $topics[$topicId]['subtopics'][$subTopicId]['notanswered'] = 0;
                        $topics[$topicId]['subtopics'][$subTopicId]['correct'] = 0;
                        $topics[$topicId]['subtopics'][$subTopicId]['incorrect'] = 0;
                        $topics[$topicId]['subtopics'][$subTopicId]['count'] = 0;
                    }
                    $topics[$topicId]['subtopics'][$subTopicId]['name'] = $question->subtopic->name;
                    $topics[$topicId]['subtopics'][$subTopicId]['count']++;
                }
            }

            if ($answers[$question->id] == 0) {
                if ($topic) {
                    $topicId = $question->topic->id;
                    $topics[$topicId]['notanswered']++;
                    if ($subtopic) {
                        $subTopicId = $question->subtopic->id;
                        $topics[$topicId]['subtopics'][$subTopicId]['notanswered']++;
                    }
                }
                $notAnswered++;
                $checkedAnswers[$question->id] = false;
                continue;
            }

            foreach ($question->answers as $answer) {
                if (isset($answers[$question->id])) {
                    if ($answer->correct) {
                        if ($answers[$question->id] == $answer->id) {
                            if ($topic) {
                                $topicId = $question->topic->id;
                                $topics[$topicId]['correct']++;
                                if ($subtopic) {
                                    $subTopicId = $question->subtopic->id;
                                    $topics[$topicId]['subtopics'][$subTopicId]['correct']++;
                                }
                            }
                            $checkedAnswers[$question->id]['correct'] = true;
                            $correct++;
                        }
                        $checkedAnswers[$question->id]['right'] = $answer->id;
                    } else {
                        if ($answers[$question->id] == $answer->id) {
                            if ($topic) {
                                $topicId = $question->topic->id;
                                $topics[$topicId]['incorrect']++;
                                if ($subtopic) {
                                    $subTopicId = $question->subtopic->id;
                                    $topics[$topicId]['subtopics'][$subTopicId]['incorrect']++;
                                }
                            }
                            $checkedAnswers[$question->id]['my'] = $answer->id;
                            $checkedAnswers[$question->id]['correct'] = false;
                            $incorrect++;
                        }
                    }
                }
            }
        }
        return compact('incorrect', 'correct', 'notAnswered', 'checkedAnswers', 'topics', 'essays');
    }

    public function getQuiz()
    {
        return $this->hasOne(Quize::className(), ['id' => 'quiz_id']);
    }

    public function essayChange($essay)
    {
        $answers = json_decode($this->answers, true);
        $answers[$essay['id']] = $essay['essayText'];
        $this->answers = json_encode($answers);
        return $this->save() ? true : false;
    }

    /**
     * @param $quiz_id
     * @param null $topic_id
     * @param null $subtopic_id
     * @param string $json_answers
     * @param bool|false $timer
     * @param null $quectionsCount
     * @param array $qHash
     * @return stdClass
     */
    public static function getQuestionCollection($quiz_id, $topic_id = null, $subtopic_id = null, $json_answers = '', $timer = false, $quectionsCount = null, &$qHash = [])
    {
        $questionCondition['quize_id'] = $quiz_id;

        if ($topic_id) {
            $questionCondition['topic_id'] = $topic_id;
        }

        if ($subtopic_id) {
            $questionCondition['subtopic_id'] = $subtopic_id;
        }

        $questionsQuery = Question::find()->where($questionCondition)->select('essay, content, id, section_id');

        if (isset($quectionsCount)) {
            $questionsQuery = $questionsQuery->limit($quectionsCount);
        }

        $questions = $questionsQuery->all();
        $qIdsArray = ArrayHelper::getColumn($questions, 'id');

        foreach ($questions as $q) {
            $qHash[$q->id] = 0;
        }

        $images = Images::find()->where(['imageable_type' => Images::QUESTION, 'imageable_id' => $qIdsArray])->all();
        $answers = Answer::find()->where(['question_id' => $qIdsArray])->all();
        $selectedAnswers = json_decode($json_answers, true);

        $object = new stdClass();
        $sArray = [];
        $count = 0;
        foreach ($questions as $question) {
            $count++;
            $qObject = new stdClass();
            $qObject->answered = false;
            $iArray = [];
            foreach ($images as $image) {
                if ($image->imageable_id == $question->id) {
                    $iObject = new stdClass();
                    $iObject->path = $image->path;
                    $iArray[] = $iObject;
                }
            }
            $aArray = [];
            foreach ($answers as $answer) {
                if ($answer->question_id == $question->id) {
                    $aObject = new stdClass();
                    $aObject->id = $answer->id;
                    $aObject->content = $answer->content;
                    if (isset($selectedAnswers[$question->id])) {
                        $aObject->selected = true;
                        if ((!$question->essay && ($selectedAnswers[$question->id] == $answer->id))) {
                            $qObject->answered = true;
                        }
                        if ($question->essay && $selectedAnswers[$question->id] != '') {
                            $qObject->answered = true;
                        }
                    }
                    $aArray[] = $aObject;
                }
            }
            $qObject->id = $question->id;
            $qObject->content = $count . '. ' . $question->content;
            $qObject->answers = $aArray;
            $qObject->images = $iArray;
            if ($question->essay) {
                $qObject->essayText = $selectedAnswers[$question->id] ? $selectedAnswers[$question->id] : '';
                $qObject->essay = (bool)$question->essay;
            }
            if ($question->section_id) {
                $sArray[$question->section_id]['questions'][] = $qObject;
            } else {
                $object->questions[] = $qObject;
            }
        }

        $sectionsIds = array_keys($sArray);
        $sections = Section::find()->where(['id' => $sectionsIds])->all();
        foreach ($sections as $section) {
            $sArray[$section->id]['name'] = $section->description;
            $sArray[$section->id]['images'] = $section->images;
        }

        $object->sections = $sArray;

        return $object;
    }

    public function getQuestions()
    {
        $quiz_id = $this->quiz_id;

        $qHash = [];

        $object = self::getQuestionCollection($quiz_id, $this->topic_id, $this->subtopic_id, $this->answers, $this->timer, $this->qn, $qHash);

        $object->id = $this->id;
        $object->name = $this->quiz->name;
        $object->time = $this->timer ? ($this->start_practice + ($this->quiz->hours * 60)) * 1000 : false;

        if (!$this->answers) {
            $this->answers = json_encode($qHash);
            $this->save();
        }

        return $object;
    }

    public function getStudent()
    {
        return $this->hasOne(User::className(), ['id' => 'student_id']);
    }

}
