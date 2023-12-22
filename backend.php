<?php

$method = $_SERVER['REQUEST_METHOD'];
parse_str($_SERVER['QUERY_STRING'], $params);
$body = file_get_contents("php://input");

if ($method == 'GET') {
    echo $body;
    echo 'hello';
}

?>