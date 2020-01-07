<?php

namespace tests\codeception\frontend\unit\models;

use tests\codeception\frontend\unit\TestCase;
use frontend\models\EmailForm;
use tests\codeception\common\fixtures\UserFixture;

class EmailFormFormTest extends TestCase
{

    use \Codeception\Specify;

    protected function setUp()
    {
        parent::setUp();

    }

    protected function tearDown()
    {
        parent::tearDown();
    }

    public function testValidateEmailForm()
    {
        $model = new EmailForm([
            'email' => 'some_email@example.com',
        ]);

        $this->specify('user should enter valid email address', function () use ($model) {
            expect('email address shoold be valid', $model->validate())->true();
        });
    }

    public function testUniqueEmail()
    {
        $model = new EmailForm([
            'email' => 'nicolas.dianna@hotmail.com',
        ]);

        $this->specify('user should enter unique email address', function () use ($model) {
            expect('email address shold not be existed', $model->validate())->false();
        });
    }

    public function fixtures()
    {
        return [
            'user' => [
                'class' => UserFixture::className(),
                'dataFile' => '@tests/codeception/frontend/unit/fixtures/data/models/user.php'
            ],
        ];
    }

}
