<?php
namespace common\models;

use frontend\modules\v1\models\Question;
use frontend\modules\v1\models\Quize;
use frontend\modules\v1\models\Section;
use Yii;
use yii\base\ErrorException;
use yii\base\Model;
use yii\imagine\Image;
use yii\web\UploadedFile;
use yii\helpers\FileHelper;
use Imagine\Image\Box;
use Imagine\Image\ManipulatorInterface;

class UploadExamForm extends Model
{
    /**
     * @var UploadedFile[]
     */
    public $examFile;
    public $customErrors;

    public $examName;
    public $subject;
    public $month;
    public $year;
    public $hours;
    public $subject_id;

    public $numberOfAnswers;

    public $questions;
    public $sections;
    public $essays;
    public $images;

    public function rules()
    {
        return [
            [['examFile'], 'file',
                'skipOnEmpty' => false,
                'maxSize' => 4000000,
//                'mimeTypes' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/zip, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet
//',
//                'wrongMimeType' => 'Wrong Excel format',
            ],

            ['examFile', 'validateExam'],
        ];
    }

    public function validateExam($attribute, $params)
    {
        if (!$this->hasErrors()) {
            //foreach ($this->examFiles as $file) {
            $objPHPExcel = \PHPExcel_IOFactory::load($this->examFile->tempName);

            $this->images = [];
            $images = $objPHPExcel->getActiveSheet()->getDrawingCollection();
            foreach ($images as $image) {
                $this->images[$image->getCoordinates()][] = [
                    'path' => $image->getPath(),
                    'width' => $image->getWidth(),
                    'height' => $image->getHeight(),
                    'name' => $image->getName(),
                ];
            }

            $objWorksheet = $objPHPExcel->getActiveSheet();

            $this->examName = $objWorksheet->getCellByColumnAndRow(1, 1)->getValue();
            $this->subject = $objWorksheet->getCellByColumnAndRow(1, 2)->getValue();
            $monthYear = $objWorksheet->getCellByColumnAndRow(1, 3)->getValue();
            $monthYear = explode(' ', $monthYear);
            $this->month = isset($monthYear[0]) ? $monthYear[0] : null;
            $this->year = isset($monthYear[1]) ? $monthYear[1] : null;
            $this->hours = $objWorksheet->getCellByColumnAndRow(1, 4)->getValue();
            $this->numberOfAnswers = $objWorksheet->getCellByColumnAndRow(1, 5)->getValue();

            if (empty($this->numberOfAnswers)) {
                $this->addError('Answers field: ', 'Number of answers cannot be empty');
            }
            if (empty($this->examName)) {
                $this->addError('Exam field: ', 'Exam name cannot be empty');
            }
            if (empty($this->subject)) {
                $this->addError('Subject field: ', 'Subject cannot be empty');
            }

            $highestRow = $objWorksheet->getHighestRow();

            $this->questions = [];
            $isSections = false;
            $sectionIndex = 0;
            $sections = [];

            for ($i = 6; $i <= $highestRow; $i++) {
                $cellQuestion = $objWorksheet->getCellByColumnAndRow(0, $i)->getValue();
                $essay = 0;

                if (strlen($cellQuestion) != 0 && $cellQuestion[0] == 'S') {
                    $isSections = true;
                    $sectionIndex++;
                    $this->sections[$sectionIndex]['description'] = $objWorksheet->getCellByColumnAndRow(1, $i)->getFormattedValue();
                    $this->sections[$sectionIndex]['coords'] = \PHPExcel_Cell::stringFromColumnIndex(1) . $i;
                }

                if (strlen($cellQuestion) != 0 && $cellQuestion[0] == 'E') {
                    $essay = 1;
                    $answers = [];

                    $question = [
                        'question' => $objWorksheet->getCellByColumnAndRow(1, $i)->getValue(),
                        'answers' => $answers,
                        'coord' => \PHPExcel_Cell::stringFromColumnIndex(1) . $i,
                        'correct' => $objWorksheet->getCellByColumnAndRow(2, $i)->getValue(),
                        'topic' => $objWorksheet->getCellByColumnAndRow($this->numberOfAnswers + 3, $i)->getValue(),
                        'subtopic' => $objWorksheet->getCellByColumnAndRow($this->numberOfAnswers + 4, $i)->getValue(),
                        'essay' => $essay
                    ];

                    if (empty($question['question'])) {
                        $this->addError('Essay: ', 'Essay question in ' . $i . ' row is empty');
                    }

                    if (empty($question['correct'])) {
                        $this->addError('Answer: ', 'Correct answer for the essay question in ' . $i . ' row is empty');
                    }
                    if ($isSections) {
                        $this->sections[$sectionIndex]['questions'][] = $question;
                        $this->sections[$sectionIndex]['coords'] = \PHPExcel_Cell::stringFromColumnIndex(1) . $i;
                    } else {
                        $this->questions[] = $question;
                    }
                }

                if (strlen($cellQuestion) != 0 && $cellQuestion[0] == 'Q') {
                    $answers = [];
                    $symbol = 'A';
                    for ($j = 1; $j <= $this->numberOfAnswers; $j++) {
                        $answers[$symbol] = $objWorksheet->getCellByColumnAndRow($j + 1, $i)->getValue() . '';
                        ++$symbol;
                    }

                    $question = [
                        'question' => $objWorksheet->getCellByColumnAndRow(1, $i)->getFormattedValue(),
                        'coord' => \PHPExcel_Cell::stringFromColumnIndex(1) . $i,
                        'answers' => $answers,
                        'correct' => trim($objWorksheet->getCellByColumnAndRow($this->numberOfAnswers + 2, $i)->getValue()),
                        'topic' => $objWorksheet->getCellByColumnAndRow($this->numberOfAnswers + 3, $i)->getValue(),
                        'subtopic' => $objWorksheet->getCellByColumnAndRow($this->numberOfAnswers + 4, $i)->getValue(),
                        'essay' => $essay
                    ];

                    if (empty($question['question'])) {
                        $this->addError('Question: ', 'Question in ' . $i . ' row is empty');
                    }

                    foreach ($question['answers'] as $key => $value) {
                        $valString = $value . '';
                        if (empty($value) && $valString != '0') {
                            $this->addError('Answer: ', 'Answer ' . $key . ' in ' . $i . ' row is empty');
                        }
                    }

                    if (empty($question['correct'])) {
                        $this->addError('Answer: ', 'Correct answer for the question in ' . $i . ' row is empty');
                    }
                    if ($isSections) {
                        $this->sections[$sectionIndex]['questions'][] = $question;
                    } else {
                        $this->questions[] = $question;
                    }
                }
            }

            $this->essays = [];

            for ($i = 6; $i <= $highestRow; $i++) {
                $cellEssay = $objWorksheet->getCellByColumnAndRow(0, $i)->getValue();
                if (strlen($cellEssay) != 0 && $cellEssay[0] == 'E') {
                    $essayQuestion = [
                        'question' => $objWorksheet->getCellByColumnAndRow(1, $i)->getValue(),
                        'coord' => \PHPExcel_Cell::stringFromColumnIndex(1) . $i,
                        'correct' => $objWorksheet->getCellByColumnAndRow(2, $i)->getValue(),
                    ];

                    if (empty($essayQuestion['question'])) {
                        $this->addError('Essay: ', 'Essay question in ' . $i . ' row is empty');
                    }

                    if (empty($essayQuestion['correct'])) {
                        $this->addError('Answer: ', 'Correct answer for the essay question in ' . $i . ' row is empty');
                    }
                    $this->essays[] = $essayQuestion;
                }
            }

            if (empty($this->questions) && empty($this->sections)) {
                $this->addError('Exam: ', 'There is no any question in exam file');
            }

            if (!empty($this->customErrors)) {
                Yii::$app->session->setFlash('exam_upload_errors', $this->customErrors);
                $this->addError($attribute, 'Wrong template format');
                return;
            }
        }
    }

    public function createQuestions($q, $exam, $sectionModel = null, $baseImgDir)
    {
        $question = new Question();
        $question->content = $q['question'];
        $question->quize_id = $exam->id;
        $question->essay = $q['essay'];
        if ($sectionModel) {
            $question->section_id = $sectionModel->id;
        } else {
            $question->section_id = null;
        }
        if (!$question->addTopic($q['topic'], $this->subject_id)) {
            $exam->delete();
            return false;
        };

        if (!$question->addSubtopic($q['subtopic'])) {
            $exam->delete();
            return false;
        };

        if (!$question->save()) {
            $exam->delete();
            return false;
        }
        foreach ($q['answers'] as $key => $value) {
            $answer = new Answer();
            $answer->content = $value;
            $answer->question_id = $question->id;
            if ($q['correct'] == $key) {
                $answer->correct = true;
            }
            if (!$answer->save()) {
                $exam->delete();
                return false;
            }
        }
        if (!empty($this->images[$q['coord']])) {
            foreach ($this->images[$q['coord']] as $imageItem) {
                $img = Image::getImagine()->open($imageItem['path']);
                $img = $img->thumbnail(new Box(
                    $imageItem['width'],
                    $imageItem['height']
                ), ManipulatorInterface::THUMBNAIL_OUTBOUND);

                $imageModel = new Images;
                $imageModel->imageable_type = Images::QUESTION;
                $imageModel->name = md5(time() + rand(1, 100000)) . '.jpg';
                $imageModel->imageable_id = $question->id;

                $questionsImagesDir = $baseImgDir . $imageModel->imageable_type . DIRECTORY_SEPARATOR;
                $questionImagesDir = $questionsImagesDir . $imageModel->imageable_id . DIRECTORY_SEPARATOR;

                if (!file_exists($questionsImagesDir)) {
                    mkdir($questionsImagesDir);
                }
                if (!file_exists($questionImagesDir)) {
                    mkdir($questionImagesDir);
                }

                if ($img->save($questionImagesDir . $imageModel->name)) {
                    $imageModel->path = DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . $imageModel->imageable_type . DIRECTORY_SEPARATOR . $imageModel->imageable_id . DIRECTORY_SEPARATOR . $imageModel->name;
                    if (!$imageModel->save()) {
                        throw new ErrorException;
                    }
                }
            }
        }
    }

    /**
     * @param integer $uid
     * Creates exam in database.
     * @return boolean
     */

    public function createExam($uid)
    {
        $exam = new Quize();
        $exam->name = $this->examName;
        $exam->description = $this->examName;
        $exam->subject_id = (int)$this->subject_id;
        $date = strtotime($this->month . ' 01 ' . $this->year);
        $date = date('Y-m-d', $date);
        $exam->date = $date;
        $exam->hours = $this->hours;

        $baseImgDir = Yii::getAlias('@webroot') . DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR;

        if (!$exam->save()) {
            return $exam;
        }

        if (isset($this->questions)) {
            foreach ($this->questions as $q) {
                $this->createQuestions($q, $exam, null, $baseImgDir);
            }
        }

        if (isset($this->sections)) {
            foreach ($this->sections as $section) {
                $sectionModel = new Section;
                $sectionModel->quiz_id = $exam->id;
                $sectionModel->description = $section['description'];
                if (!$sectionModel->save()) {
                    return $sectionModel;
                }
                if (!empty($this->images[$section['coords']])) {
                    foreach ($this->images[$section['coords']] as $imageItem) {
                        $img = Image::getImagine()->open($imageItem['path']);
                        $img = $img->thumbnail(new Box(
                            $imageItem['width'],
                            $imageItem['height']
                        ), ManipulatorInterface::THUMBNAIL_OUTBOUND);

                        $imageModel = new Images;
                        $imageModel->imageable_type = Images::SECTION;
                        $imageModel->name = md5(time() + rand(1, 100000)) . '.jpg';
                        $imageModel->imageable_id = $sectionModel->id;

                        $sectionsImagesDir = $baseImgDir . $imageModel->imageable_type . DIRECTORY_SEPARATOR;
                        $sectionImagesDir = $sectionsImagesDir . $imageModel->imageable_id . DIRECTORY_SEPARATOR;

                        if (!file_exists($sectionsImagesDir)) {
                            mkdir($sectionsImagesDir);
                        }
                        if (!file_exists($sectionImagesDir)) {
                            mkdir($sectionImagesDir);
                        }

                        if ($img->save($sectionImagesDir . $imageModel->name)) {
                            $imageModel->path = DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . $imageModel->imageable_type . DIRECTORY_SEPARATOR . $imageModel->imageable_id . DIRECTORY_SEPARATOR . $imageModel->name;
                            if (!$imageModel->save()) {
                                throw new ErrorException;
                            }
                        }
                    }
                }
                if(isset($section['questions'])) {
                    foreach ($section['questions'] as $q) {
                        $this->createQuestions($q, $exam, $sectionModel, $baseImgDir);
                    }
                }
            }
        }

        foreach ($this->essays as $e) {
            $essay = new Essay();
            $essay->content = $e['question'];
            $essay->quize_id = $exam->id;
            $essay->correct_answer = $e['correct'];

            if (!$essay->save()) {
                $exam->delete();
                return false;
            }

            if (!empty($this->images[$e['coord']])) {
                foreach ($this->images[$e['coord']] as $imageItem) {
                    $img = Image::getImagine()->open($imageItem['path']);
                    $img = $img->thumbnail(new Box(
                        $imageItem['width'],
                        $imageItem['height']
                    ), ManipulatorInterface::THUMBNAIL_OUTBOUND);

                    $imageModel = new Images;
                    $imageModel->imageable_type = Images::ESSAY;
                    $imageModel->name = md5(time() + rand(1, 100000)) . '.jpg';
                    $imageModel->imageable_id = $essay->id;

                    $essaysImagesDir = $baseImgDir . $imageModel->imageable_type . DIRECTORY_SEPARATOR;
                    $essayImagesDir = $essaysImagesDir . $imageModel->imageable_id . DIRECTORY_SEPARATOR;

                    if (!file_exists($essaysImagesDir)) {
                        mkdir($essaysImagesDir);
                    }
                    if (!file_exists($essayImagesDir)) {
                        mkdir($essayImagesDir);
                    }

                    if ($img->save($essayImagesDir . $imageModel->name)) {
                        $imageModel->path = DIRECTORY_SEPARATOR . 'uploads' . DIRECTORY_SEPARATOR . $imageModel->imageable_type . DIRECTORY_SEPARATOR . $imageModel->imageable_id . DIRECTORY_SEPARATOR . $imageModel->name;
                        if (!$imageModel->save()) {
                            throw new ErrorException;
                        }
                    }
                }
            }
        }
        return true;
    }
}