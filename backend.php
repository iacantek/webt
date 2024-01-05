<?php

// defining cookie name as constant
define("COOKIE_NAME", "HighestBMI");

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

            // only fetch first record if single request
            if ($single) {
                break;
            }
        }
    }

    if ($single) {
        // creating response object
        $response = new stdClass();
        $response->result = $calculations[0];
        $bmi = (double)$response->result['bmi'];

        // check if HighestBMI cookie is set
        $currentHighestBMI = isset($_COOKIE[COOKIE_NAME]) ? (double)$_COOKIE[COOKIE_NAME] : 0;

        if ($currentHighestBMI < $bmi) {
            setcookie(COOKIE_NAME, $bmi, time() + (24 * 3600));
            $currentHighestBMI = $bmi;
        }

        $response->highestBmi = $currentHighestBMI;

        return json_encode($response);
    }

    return json_encode($calculations);
}

function throw_error($status_code, $message)
{
    http_response_code($status_code);
    die(json_encode(['error' => $message]));
}

function bad_request($message)
{
    throw_error(400, $message);
}

// opening database connection
$conn = mysqli_connect("localhost", "root", "", "webt");
if (!$conn) {
    die(json_encode(['error' => "Database connection failed"]));
}

// getting http request method
$method = $_SERVER['REQUEST_METHOD'];

if ($method == 'GET') { // GET request -> returns all calculations
    echo(query_json_result($conn, "SELECT * FROM calculation ORDER BY id DESC"));
} else if ($method == 'POST') { // POST request -> creates calculation record and returns it
    // getting body
    $body = file_get_contents("php://input");

    // check if body is empty
    if (!$body) {
        bad_request("Body cannot be empty.");
    }

    $form = json_decode($body);
    $birthday = null;

    // check if birthday is an invalid date
    try {
        $birthday = new DateTime($form->birthday);
    } catch (Exception $e) {
        bad_request("Birthday is not a valid date.");
    }

    // check if are fields are set
    if (!isset($form->name) || empty($form->name) || // check if name is null or empty
        !isset($form->birthday) || empty($form->birthday) ||
        !isset($form->gender) || !isset($form->height->unit) || !isset($form->weight->unit) ||
        !isset($form->height->value) || empty($form->height->value) || // check if height is null or 0
        !isset($form->weight->value) || empty($form->weight->value)) { // check if weight is null or 0
        bad_request("Please fill in all fields.");
    } // check if birthday is in future
    else if (new DateTime() < $birthday) {
        bad_request("Birthday cannot lie in the future.");
    } // check if height is a negative number
    else if ($form->height->value < 0) {
        bad_request("Height has to be a positive number.");
    } // check if weight is a negative number
    else if ($form->weight->value < 0) {
        bad_request("Weight has to be a positive number.");
    }

    // convert weight to kg if it's in lbs
    $weight = $form->weight->unit == 0 ? $form->weight->value : $form->weight->value / 2.2;
    // convert height to cm if it's in ft
    $height = $form->height->unit == 0 ? $form->height->value : $form->height->value * 30.48;

    // calculate bmi
    $bmi = $weight / (($height / 100) ** 2);

    // prepare sql insert statement
    $statement = "INSERT INTO calculation (name, birthday, gender, height, weight, bmi) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = mysqli_prepare($conn, $statement);

    // bind parameters
    mysqli_stmt_bind_param($stmt, 'ssssss', $form->name, $form->birthday, $form->gender, $height, $weight, $bmi);
    // execute sql statement
    $res = mysqli_stmt_execute($stmt);

    // return created record as json
    echo query_json_result($conn, "SELECT * FROM calculation ORDER BY id DESC LIMIT 1", true);
}

// closing db connection
mysqli_close($conn);

?>