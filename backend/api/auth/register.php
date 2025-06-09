<?php
include_once '../config/cors.php';
include_once '../config/database.php';
include_once '../models/User.php';

$database = new Database();
$db = $database->getConnection();

$user = new User($db);

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
$required_fields = ['name', 'phone', 'email', 'address', 'number', 'city', 'password', 'confirmPassword'];
$errors = array();

foreach($required_fields as $field) {
    if(empty($data->$field)) {
        $errors[$field] = ucfirst($field) . " é obrigatório";
    }
}

// Validate email format
if(!empty($data->email) && !filter_var($data->email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = "Email inválido";
}

// Validate password length
if(!empty($data->password) && strlen($data->password) < 6) {
    $errors['password'] = "Senha deve ter pelo menos 6 caracteres";
}

// Validate password confirmation
if(!empty($data->password) && !empty($data->confirmPassword) && $data->password !== $data->confirmPassword) {
    $errors['confirmPassword'] = "Senhas não coincidem";
}

// Check if user already exists
if(empty($errors)) {
    $user->phone = $data->phone;
    $user->email = $data->email;
    
    if($user->userExists()) {
        $errors['general'] = "Usuário já cadastrado com este telefone ou email";
    }
}

if(!empty($errors)) {
    http_response_code(400);
    echo json_encode(array(
        "success" => false,
        "errors" => $errors
    ));
} else {
    // Set user properties
    $user->name = $data->name;
    $user->phone = $data->phone;
    $user->email = $data->email;
    $user->address = $data->address;
    $user->number = $data->number;
    $user->complement = $data->complement ?? '';
    $user->city = $data->city;
    $user->password = $data->password;
    $user->is_admin = false;

    if($user->create()) {
        // Get the created user data
        $user->readOne();
        
        $response = array(
            "success" => true,
            "message" => "Conta criada com sucesso!",
            "user" => array(
                "id" => $user->id,
                "name" => $user->name,
                "phone" => $user->phone,
                "email" => $user->email,
                "address" => $user->address,
                "number" => $user->number,
                "complement" => $user->complement,
                "city" => $user->city,
                "is_admin" => $user->is_admin,
                "created_at" => $user->created_at
            )
        );
        
        http_response_code(201);
        echo json_encode($response);
    } else {
        http_response_code(500);
        echo json_encode(array(
            "success" => false,
            "message" => "Erro ao criar conta"
        ));
    }
}
?>