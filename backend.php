<?php

function query_json_result($conn, $queryString, $single = false)
{
    // preparing database query
    $query = mysqli_prepare($conn, strval($queryString));
    mysqli_stmt_execute($query);
    $result = mysqli_stmt_get_result($query);

    // returning records from database
    $calculations = [];
    if ($result) {
        while ($row = mysqli_fetch_assoc($result)) {
            $calculations[] = [
                'id' => $row['id'],
                'created' => $row['created'],
                'name' => $row['name'],
                'birthday' => $row['birthday'],
                'gender' => $row['gender'],
                'height' => $row['height'],
                'weight' => $row['weight'],
                'bmi' => $row['bmi']
            ];
        }
    }

    return json_encode($single ? $calculations[0] : $calculations);
}

// database connection
$conn = mysqli_connect("localhost", "root", "", "webt");
if (!$conn) {
    die(json_encode(['error' => "Database connection failed"]));
}

// getting http request method
$method = $_SERVER['REQUEST_METHOD'];
$body = file_get_contents("php://input");

if ($method == 'GET') {
    echo(query_json_result($conn, "SELECT * FROM calculation ORDER BY id DESC"));
} else if ($method == 'POST') {
    // check if body is empty
    if (!$body) {
        http_response_code(400);
        die(json_encode(['error' => "Body cannot be empty!"]));
    }

    $form = json_decode($body);

    $bmi = (double)$form->weight->value / ((((double)$form->height->value) / 100) ^ 2);

    $statement = "insert into calculation (name, birthday, gender, height, weight, bmi) values (?, ?, ?, ?, ?, ?)";
    $stmt = mysqli_prepare($conn, $statement);

    mysqli_stmt_bind_param($stmt, 'ssssss', $form->name, $form->birthday, $form->gender, $form->height->value, $form->weight->value, $bmi);
    $res = mysqli_stmt_execute($stmt);

    // return creted record as json
    echo query_json_result($conn, "SELECT * FROM calculation ORDER BY id DESC LIMIT 1", true);
    exit;
}

mysqli_close($conn);

?>