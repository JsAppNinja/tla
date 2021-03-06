<?php

namespace frontend\components\purrwebRecurring\methods;

use Exception;
use linslin\yii2\curl;

class CreateRecurringPaymentsProfile
{
    public static function createProfile()
    {
        $curl = new curl\Curl();
        try {
            $response = $curl->setOption(
                CURLOPT_POSTFIELDS,
                http_build_query(array(
                        'USER' => self::USER,
                        'PWD' => self::PWD,
                        'SIGNATURE' => self::SIGNATURE,
                        'METHOD' => self::CREATE_USER,
                        'VERSION' => self::VERSION,
                        'TOKEN' => $token,
                        'PAYERID' => $payerId,
                        'PROFILESTARTDATE' => $startDate,
                        'DESC' => self::L_BILLINGAGREEMENTDESCRIPTION0,
                        'BILLINGPERIOD' => $period,
                        'INITAMT' => $amount,
                        'FAILEDINITAMTACTION' => 'CancelOnFailure',
                        'BILLINGFREQUENCY' => $frequency,
                        'AMT' => $amount,
                        'CURRENCYCODE' => 'USD',
                        'COUNTRYCODE' => 'US',
                        'MAXFAILEDPAYMENTS' => 3
                    )
                ))->post(PayPalRecurring::getPayPalApiUrl());

            parse_str(urldecode($response), $request);

            return $request;
        } catch (Exception $e) {
            $request['ACK'] = 'Error';
            $request['L_SHORTMESSAGE0'] = $e->getMessage();

            return $request;
        }
    }
}

