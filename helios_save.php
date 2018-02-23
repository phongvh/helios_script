<?php
header('Access-Control-Allow-Origin: *');
//echo "save_data({'user':'phongvh'})";

$api_path = "http://209.58.165.15/api/v5/";
//$api_path = "http://heliosapi.topicanative.asia/api/v5/";

if ($_GET["action"] == "visitor") {
    $api_data = $_GET["data"];

    $api_url = $api_path . "tracking/visitor";
    
    $curl = curl_init($api_url);
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json'
    ));
    curl_setopt($curl, CURLOPT_POSTFIELDS, $api_data);
   
    // Send the request
    $response = curl_exec($curl);
    $info = curl_getinfo($curl);
    curl_close($curl);
    
    $data = array();
    $data["code"] = $info['http_code'];
    // Check for errors
    if ($info['http_code'] == 200) {
        $data["data"] = json_decode($response);
    }
    echo "save_data(" . json_encode($data) . ")";
}


if ($_GET["action"] == "contact") {
    $api_data = $_GET["data"];
    $api_url = $api_path . "tracking/submitter";

    // Save log
    $data_log_before = print_r(json_decode($api_data), true);
    saveLog($data_log_before, 'logs.txt');
    
    $curl = curl_init($api_url);
    curl_setopt($curl, CURLOPT_POST, true);
    curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($curl, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json'
    ));
    curl_setopt($curl, CURLOPT_POSTFIELDS, $api_data);
    
    // Send the request
    $response = curl_exec($curl);
    $info = curl_getinfo($curl);
    curl_close($curl);
    
    $data = array();
    $data["code"] = $info['http_code'];
    // Check for errors
    if ($info['http_code'] == 200) {
        $data["data"] = json_decode($response);
    }
    echo "save_data(". json_encode($data). ")";
}

if ($_GET["action"] !== "visitor" && $_GET["action"] !== "contact") {
    echo "You're not invited. Goodbye!";
}


function saveLog($data = array(), $file_name = 'unknow.txt')
{
    date_default_timezone_set("Asia/Bangkok");
    $dir = './helios_logs/'; //directory contain logs file
    $log_file = $dir . date('Y-m-d') . "-" . $file_name; /* name of logs file what have format: './logs/Y-m-d-logs.txt' */
    $content = "[" . $_SERVER['REMOTE_ADDR'] . ' ' . date('Y-m-d H:i:s') . "] ";
    $content .= $data ? $data . "\n" : ($data === "" ? "Have an error when call API\n" : "No data saved\n");
    file_put_contents($log_file, $content, FILE_APPEND | LOCK_EX);
}