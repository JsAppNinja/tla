

common/main-local.php, components:

        'mailer' => [
            'class' => 'yii\swiftmailer\Mailer',
            'viewPath' => '@common/mail',
            'useFileTransport' => false,
            'transport' => [
                'class' => 'Swift_SmtpTransport',
                'host' => 'smtp.gmail.com',
                'username' => 'tla234235534@gmail.com',
                'password' => 'tla234235534p',
                'port' => '587',
                'encryption' => 'tls',
            ],
        ],


frontend/main-local.php, components:

        'authClientCollection' => [
            'class' => 'yii\authclient\Collection',
            'clients' => [
                'facebook' => [
                    'class' => 'frontend\components\CustomFacebook',
                    'clientId' => '1666757126872510',
                    'clientSecret' => '2858b9e5079574721a097abb88491281',
                ],
                'twitter' => [
                    'class' => 'yii\authclient\clients\Twitter',
                    'consumerKey' => 'BNKrsV2VUMKQmb7bPRZH3W568',
                    'consumerSecret' => 'o86mCFE3BulXHwWKeiAfkseNfYaWNyrUbdopYnmUxuxMgqOroG',
                ],
            ],
        ]

php yii migrate --migrationPath=@yii/rbac/migrations

Console commands:
    php yii rbac/init
    php yii session/init