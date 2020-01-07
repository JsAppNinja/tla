<?php
namespace common\models;

use DateTime;
use frontend\components\Helpers\MixPanelHelper;
use frontend\models\UserSignupForm;
use frontend\modules\v1\models\Chat;
use Mixpanel;
use Yii;
use yii\base\Exception;
use yii\base\NotSupportedException;
use yii\behaviors\TimestampBehavior;
use yii\db\ActiveRecord;
use yii\helpers\FileHelper;
use yii\helpers\Url;
use yii\web\HttpException;
use yii\web\IdentityInterface;

/**
 * User model
 *
 * @property integer $id
 * @property string $username
 * @property string $password_hash
 * @property string $password_reset_token
 * @property string $email
 * @property string $auth_key
 * @property integer $status
 * @property integer $created_at
 * @property integer $updated_at
 * @property string $password write-only password
 *
 * @property string $first_name
 * @property string $last_name
 * @property date $date_birth
 * @property integer $sex
 * @property integer $user_type
 *
 * @property string $social_id
 */
class User extends ActiveRecord implements IdentityInterface
{
    const STATUS_DELETED = 0;
    const STATUS_ACTIVE = 10;

    const TYPE_STUDENT = 1;
    const TYPE_TEACHER = 2;
    const TYPE_ADMIN = 10;
    const TYPE_PURE_ADMIN = 11;

    public $tracking = true;

    /**
     * @inheritdoc
     */
    public static function tableName()
    {
        return '{{%user}}';
    }

    /**
     * @inheritdoc
     */
    public function behaviors()
    {
        return [
            TimestampBehavior::className(),
            'softDelete' => [
                'class' => 'common\behaviors\SoftDelete',
                // these are the default values, which you can omit
                'attribute' => 'delete_time',
                'value' => null, // this is the same format as in TimestampBehavior
                'safeMode' => true, // this processes '$model->delete()' calls as soft-deletes
            ],
        ];
    }

    /**
     * @inheritdoc
     */
    public function rules()
    {
        return [
            ['status', 'default', 'value' => self::STATUS_ACTIVE],
            ['status', 'in', 'range' => [self::STATUS_ACTIVE, self::STATUS_DELETED]],
        ];
    }

    /**
     * @inheritdoc
     */
    public static function findIdentity($id)
    {
        return static::findOne(['id' => $id, 'status' => self::STATUS_ACTIVE]);
    }

    public function isSubscribed()
    {
        $subscription = Subscription::find()->where(['user_id' => $this->id, 'status' => Subscription::ACTIVE])->orWhere(['user_id' => $this->id, 'status' => Subscription::MANUAL])->one();
        return $subscription ? true : false;
    }

    public function isPending()
    {
        $subscription = Subscription::findOne(['user_id' => $this->id, 'status' => Subscription::PENDING]);

        return $subscription ? true : false;
    }

    public function getSubscription()
    {
        return $this->hasOne(Subscription::className(), ['user_id' => 'id']);
    }

    public function checkManualSubscription()
    {
        $subscriptionDate = DateTime::createFromFormat(DateTime::ISO8601, $this->subscription->next_billing_date);
        var_dump($subscriptionDate);
        die;
    }

    /**
     * @inheritdoc
     */
    public static function findIdentityByAccessToken($token, $type = null)
    {
        throw new NotSupportedException('"findIdentityByAccessToken" is not implemented.');
    }

    /**
     * Finds user by username
     *
     * @param string $username
     * @return static|null
     */
    public static function findByUsername($username)
    {
        return static::findOne(['username' => $username, 'status' => self::STATUS_ACTIVE]);
    }

    /**
     * Finds user by username
     *
     * @param string $email
     * @return static|null
     */
    public static function findByEmail($email)
    {
        return static::findOne(['email' => $email]);
    }

    public static function findBySocialId($socialId)
    {
        return static::findOne(['social_id' => $socialId, 'status' => self::STATUS_ACTIVE]);
    }


    /**
     * Finds user by password reset token
     *
     * @param string $token password reset token
     * @return static|null
     */
    public static function findByPasswordResetToken($token)
    {
        if (!static::isPasswordResetTokenValid($token)) {
            return null;
        }

        return static::findOne([
            'password_reset_token' => $token,
            'status' => self::STATUS_ACTIVE,
        ]);
    }

    /**
     * Finds out if password reset token is valid
     *
     * @param string $token password reset token
     * @return boolean
     */
    public static function isPasswordResetTokenValid($token)
    {
        if (empty($token)) {
            return false;
        }

        $timestamp = (int)substr($token, strrpos($token, '_') + 1);
        $expire = Yii::$app->params['user.passwordResetTokenExpire'];
        return $timestamp + $expire >= time();
    }

    /**
     * @inheritdoc
     */
    public function getId()
    {
        return $this->getPrimaryKey();
    }

    /**
     * @inheritdoc
     */
    public function getAuthKey()
    {
        return $this->auth_key;
    }

    /**
     * @inheritdoc
     */
    public function validateAuthKey($authKey)
    {
        return $this->getAuthKey() === $authKey;
    }

    /**
     * Validates password
     *
     * @param string $password password to validate
     * @return boolean if password provided is valid for current user
     */
    public function validatePassword($password)
    {
        return Yii::$app->security->validatePassword($password, $this->password_hash);
    }

    /**
     * Generates password hash from password and sets it to the model
     *
     * @param string $password
     */
    public function setPassword($password)
    {
        $this->password_hash = Yii::$app->security->generatePasswordHash($password);
    }

    /**
     * Generates "remember me" authentication key
     */
    public function generateAuthKey()
    {
        $this->auth_key = Yii::$app->security->generateRandomString();
    }

    /**
     * Generates new password reset token
     */
    public function generatePasswordResetToken()
    {
        $this->password_reset_token = Yii::$app->security->generateRandomString() . '_' . time();
    }

    /**
     * Removes password reset token
     */
    public function removePasswordResetToken()
    {
        $this->password_reset_token = null;
    }

    public function getTypedUser()
    {
        switch ($this->user_type) {
            case User::TYPE_TEACHER: {
                return Tutor::findOne(['user_id' => $this->id]);
                break;
            }
            case User::TYPE_STUDENT: {
                return Student::findOne(['user_id' => $this->id]);
                break;
            }
        }

        return true;
    }

    public function getUserType()
    {
        switch ($this->user_type) {
            case 10:
                return 'admin';
                break;
            case 2:
                return 'teacher';
                break;
            case 1:
                return 'student';
                break;
            default:
                return '';

        }
    }

    public function getFullName()
    {
        return $this->first_name . ' ' . $this->last_name;
    }

    public function getCaption()
    {
        if (!empty($this->email)) {
            return $this->getFullName() . ' (' . $this->email . ')';
        } else {
            return $this->getFullName();
        }
    }

    public static function isTeacher()
    {
        if (!Yii::$app->user->isGuest) {
            if (Yii::$app->user->identity->user_type == User::TYPE_TEACHER) {
                return true;
            }
        }
        return false;
    }

    public static function isPureAdmin()
    {
        if (!Yii::$app->user->isGuest) {
            if (Yii::$app->user->identity->user_type == User::TYPE_PURE_ADMIN) {
                return true;
            }
        }
        return false;
    }

    public static function isStudent()
    {
        if (!Yii::$app->user->isGuest) {
            if (Yii::$app->user->identity->user_type == User::TYPE_STUDENT) {
                return true;
            }
        }
        return false;
    }

    public static function isAdmin()
    {
        if (!Yii::$app->user->isGuest) {
            if ((Yii::$app->user->identity->user_type == User::TYPE_ADMIN) || (Yii::$app->user->identity->user_type == User::TYPE_PURE_ADMIN)) {
                return true;
            }
        }
        return false;
    }

    public function generateHash()
    {
        if (!$this->hash) {
            $this->hash = SHA1($this->first_name . $this->last_name . $this->email . rand(1, 100000));
        }
    }

    public function checkUserTypeTable()
    {
        switch ($this->user_type) {
            case User::TYPE_TEACHER: {
                if (!Tutor::findOne(['user_id' => $this->id])) {
                    $tutor = new Tutor();
                    $tutor->load($this->toArray(), '');
                    $tutor->user_id = $this->id;
                    $tutor->save();
                }
                break;
            }
            case User::TYPE_STUDENT: {
                if (!Student::findOne(['user_id' => $this->id])) {
                    $student = new Student();
                    $student->load($this->toArray(), '');
                    $student->user_id = $this->id;
                    $student->save();
                }
                break;
            }
        }
    }

    public function getUserPaymentLink()
    {
        return Url::base(true) . '/pay/' . $this->hash;
    }

    public static function afterLogin()
    {
        $id = Yii::$app->user->getId();

        $user = User::findOne($id);

        if (!$user) {
            return;
        }
        
        $user->generateHash();
        $user->checkUserTypeTable();


        $sessionId = Yii::$app->session->getId();
        Yii::$app->db->createCommand()->update('session', ['uid' => $user->id], "id = \"{$sessionId}\"")->execute();
        Yii::$app->db->createCommand()->delete('session', "uid = {$user->id} AND id != \"{$sessionId}\"")->execute();

        $user->generateAuthKey();
        $user->save(false);

        $mp = new MixPanelHelper($user);
        $mp->track('Logged in');

        $cookie = new \yii\web\Cookie(Yii::$app->user->identityCookie);
        $cookie->value = json_encode([
            $user->getId(),
            $user->getAuthKey(),
            3600 * 24 * 30,
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
        $cookie->expire = time() + 3600 * 24 * 30;
        Yii::$app->getResponse()->getCookies()->add($cookie);
    }

    public static function getNumberOfTeachers()
    {
        return User::find()->where(['user_type' => 2])->count();
    }

    public static function getNumberOfStudents()
    {
        return User::find()->where(['user_type' => 1])->count();
    }

    public static function getNumberOfSchools()
    {
        return User::find()->where(['user_type' => 3])->count();
    }

    public static function getNumberOfDeleted()
    {
        return User::find()->where(['is not', 'delete_time', null])->count();
    }

    public function getMyChats()
    {
        return $this->hasMany(Chat::className(), ['createdBy_id' => 'id']);
    }

    public function getChats()
    {
        return $this->hasMany(Chat::className(), ['id' => 'chat_id'])
            ->viaTable('chat_user', ['user_id' => 'id']);
    }

    public function getUserTypeInstance()
    {
        if ($this->user_type == User::TYPE_STUDENT) {
            return Student::findOne(['user_id' => $this->id]);
        }

        if ($this->user_type == User::TYPE_TEACHER) {
            return Tutor::findOne(['user_id' => $this->id]);
        }

        return false;
    }

    public function updateAvatar($request)
    {
        $user = $this->getUserTypeInstance();

        $cropped = $request['cropped'];
        $cropped = str_replace('data:image/png;base64,', '', $cropped);
        $cropped_data = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $cropped));
        $cropped_file_name = uniqid();

        $original = $request['original'];
        $original = str_replace('data:image/png;base64,', '', $original);
        $original_data = base64_decode(preg_replace('#^data:image/\w+;base64,#i', '', $original));
        $original_file_name = uniqid();

        $avatar_dir = $user->getAvatarServerPath();

        if (FileHelper::createDirectory($avatar_dir)) {
            $cropped_file = $avatar_dir . DIRECTORY_SEPARATOR . $cropped_file_name . '.png';
            $original_file = $avatar_dir . DIRECTORY_SEPARATOR . $original_file_name . '.png';
            if (file_put_contents($cropped_file, $cropped_data) && file_put_contents($original_file, $original_data)) {
                if ($user->avatar) {
                    unlink($avatar_dir . DIRECTORY_SEPARATOR . $user->avatar);
                    unlink($avatar_dir . DIRECTORY_SEPARATOR . $user->avatar_original);
                }
                $user->avatar = $cropped_file_name . '.png';
                $user->avatar_original = $original_file_name . '.png';
                if ($user->save()) {
                    return true;
                }
            }
        }
        throw new HttpException('Error');
    }

    public function changePassword($request)
    {

        if($this->validatePassword($request['oldPassword'])) {
            if($request['newPassword'] == $request['confirmNewPassword']) {
                $this->setPassword($request['newPassword']);
                return $this->save();
            }
        } else {
            throw new Exception('Wrong password');
        }

        throw new HttpException('Error');
    }
}
