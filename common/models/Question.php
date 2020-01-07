<?php

namespace common\models;

use ErrorException;
use frontend\modules\v1\models\Quize;
use Yii;
use common\models\Images;
use yii\helpers\ArrayHelper;

/**
 * This is the model class for table "question".
 *
 * @property integer $id
 * @property string $content
 * @property integer $topic_id
 * @property integer $subtopic_id
 * @property integer $quize_id
 * @property integer $section_id
 * @property integer $essay
 *
 * @property Answer[] $answers
 * @property Subtopic $subtopic
 * @property Exam $exam
 * @property Topic $topic
 * @property Images[] $images
 */
class Question extends \yii\db\ActiveRecord
{

    public $imageable_type = Images::QUESTION;
    public $imageFiles;
    public $oldImages;

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return 'question';
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            [['content', 'sample_essay'], 'string'],
            [['topic_id', 'subtopic_id', 'quize_id', 'essay'], 'integer'],
            [['section_id'], 'integer', 'skipOnEmpty'=>true],
            [['quize_id'], 'required'],
            [['imageFiles'], 'file', 'skipOnEmpty' => true, 'extensions' => 'png, jpg', 'maxFiles' => 20],
        ];
    }

    /**
     * @inheritdoc
     */
    public function attributeLabels()
    {
        return [
            'id' => 'ID',
            'content' => 'Content',
            'topic_id' => 'Topic ID',
            'subtopic_id' => 'Subtopic ID',
            'quize_id' => 'Quiz ID',
            'section_id' => 'Section ID',
        ];
    }

    public function addTopic($topicName, $subject_id)
    {
        if (empty($topicName)) {
            return true;
        }

        $topic = Topic::findOne(['name' => $topicName, 'subject_id' => $subject_id]);
        if (!$topic) {
            $topic = new Topic();
            $topic->name = $topicName;
            $topic->subject_id = $subject_id;
            if (!$topic->save()) {
                return false;
            };
        }
        $this->topic_id = $topic->id;

        return true;
    }

    public function addSubtopic($subtopicName)
    {
        if (empty($subtopicName) || empty($this->topic_id)) {
            return true;
        }

        $subtopic = Subtopic::findOne(['name' => $subtopicName, 'topic_id' => $this->topic_id]);
        if (!$subtopic) {
            $subtopic = new Subtopic();
            $subtopic->name = $subtopicName;
            $subtopic->topic_id = $this->topic_id;
            if (!$subtopic->save()) {
                return false;
            };
        }
        $this->subtopic_id = $subtopic->id;

        return true;
    }


    /**
     * @return \yii\db\ActiveQuery
     */
    public function getAnswers()
    {
        return $this->hasMany(Answer::className(), ['question_id' => 'id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getSubtopic()
    {
        return $this->hasOne(Subtopic::className(), ['id' => 'subtopic_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getQuiz()
    {
        return $this->hasOne(Quize::className(), ['id' => 'quize_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getTopic()
    {
        return $this->hasOne(Topic::className(), ['id' => 'topic_id']);
    }

    /**
     * @return \yii\db\ActiveQuery
     */
    public function getImages() {
        return $this->hasMany(Images::className(), ['imageable_type' => 'imageable_type', 'imageable_id' => 'id']);
    }

    public function afterSave($insert, $changedAttributes)
    {
        if(!$insert) {
            $oldImages = ArrayHelper::getColumn($this->oldImages, 'id');
            $deletedList = Images::find()->where(['imageable_type' => Images::QUESTION, 'imageable_id' => $this->id])->andWhere(['not in', 'id', $oldImages])->all();
            foreach ($deletedList as $item) {
                $id = $item->id;
                if($item->delete()) {
                    $baseImgDir = Yii::getAlias('@webroot') . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR;
                    $questionsImagesDir = $baseImgDir.Images::QUESTION.DIRECTORY_SEPARATOR;
                    $questionImagesDir = $questionsImagesDir.$this->id.DIRECTORY_SEPARATOR;
                    unlink($questionImagesDir.$item->name);
                }
            }
        }
        if($this->imageFiles) {
            $this->upload();
        }
    }


    /**
     * @return bool
     */
    public function upload()
    {
        if ($this->validate(['imageFiles'])) {
            $baseImgDir = Yii::getAlias('@webroot') . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR;
            foreach ($this->imageFiles as $file) {
                $imageModel = new Images;
                $imageModel->imageable_type = Images::QUESTION;
                $imageModel->name = md5(time() + rand(1, 100000)). '.jpg';
                $imageModel->imageable_id = $this->id;

                $questionsImagesDir = $baseImgDir.$imageModel->imageable_type.DIRECTORY_SEPARATOR;
                $questionImagesDir = $questionsImagesDir.$imageModel->imageable_id.DIRECTORY_SEPARATOR;

                if(!file_exists($questionsImagesDir)) {
                    mkdir($questionsImagesDir);
                }
                if(!file_exists($questionImagesDir)) {
                    mkdir($questionImagesDir);
                }

                if($file->saveAs($questionImagesDir.$imageModel->name)) {
                    $imageModel->path = DIRECTORY_SEPARATOR.'uploads'.DIRECTORY_SEPARATOR.Images::QUESTION.DIRECTORY_SEPARATOR.$imageModel->imageable_id.DIRECTORY_SEPARATOR.$imageModel->name;
                    if(!$imageModel->save()) {
                        throw new ErrorException('Error');
                    }
                }
            }
            return true;
        } else {
            return false;
        }
    }

}
