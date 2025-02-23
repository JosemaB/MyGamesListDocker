<?php
include_once '../config/ConexionBdd.php';  //Para la conexion de la base de datos MyGamesList
include_once '../config/cors.php';  // Incluye CORS para poder hacer la conexion con mi frontend
include_once '../helpers/funciones.php';

try {
    // Obtener los datos enviados en formato JSON
    $datos = json_decode(file_get_contents('php://input'), true);

    if ($datos) { //Vemos si sexite los datos
        $email = $datos['email'];
        $usuario = $datos['usuario'];
        $password = $datos['password'];
        $confirmPassword = $datos['confirmPassword'];
        $avatar = 'http://localhost:5500/img/avatares/sinAvatar.png';
        $rol = '1'; //Agregammos el rol de usuario cuando creamos la cuenta

        //Validamos los datos antes de la inserccion en la bdd
        if (!validarCorreo($email)) {
            $error = ["email" => "El correo electrónico no es válido"];
        } else if (!validarCadena($usuario)) {
            $error = ["usuario" => "El nombre de usuario no es válido"];
        } else if (strlen($usuario) > 15) {
            $error = ["usuario" => "El nombre de usuario no debe tener más de 15 caracteres"];
        } else if (strlen($password) > 255) {
            $error = "La contraseña no puede tener más de 255 caracteres";
        } else if (!validarContrasena($password)) {
            $error = ["password" => "La contraseña debe tener al menos 6 caracteres e incluir lo siguiente: una letra mayúscula, una minúscula, un número y un carácter especial (!@#$%^&*?.)"];
        } else if ($confirmPassword != $password) {
            $error = ["confirmPassword" => "Las contraseñas no coinciden, por favor verifica y vuelve a intentarlo"];
        }

        if (!isset($error)) { //Seguiriamos si no tuvieramos error
            //Creamos la conexion ya con los campos validados
            $baseDeDatos = new ConexionBdd();
            $conexion = $baseDeDatos->getConnection();

            //Aqui se comprueba si el usuario existe y se hace consulta preparada por las injecciones
            $consultaUsuario = $conexion->prepare("select * from usuarios where nombre_usuario = ?;");
            $consultaUsuario->bind_param("s", $usuario);
            $consultaUsuario->execute();
            $usuarioResultado = $consultaUsuario->get_result();

            //Para saber si existe ese email
            $consultaCorreo = $conexion->prepare("select * from usuarios where email = ?;");
            $consultaCorreo->bind_param("s", $email);
            $consultaCorreo->execute();
            $emailResultado = $consultaCorreo->get_result();

            if ($emailResultado->num_rows > 0) {
                $error = ["email" => "El correo que quieres registrar ya existe"];
                $response = $error;
            } else if ($usuarioResultado->num_rows > 0) {
                $error = ["usuario" => "El usuario que quieres registrar ya existe"];
                $response = $error;
            } else {
                //Hacemos el insert para registrar al usuario
                $insertUsuarioNuevo = $conexion->prepare("insert into usuarios (nombre_usuario, email, contrasena, avatar, id_rol) values(?,?,?,?,?)");
                $claveIncriptada = password_hash($password, PASSWORD_BCRYPT);
                $insertUsuarioNuevo->bind_param("sssss", $usuario, $email, $claveIncriptada, $avatar, $rol);
                $insertUsuarioNuevo->execute();
                $exito = "¡Registro exitoso! Redirigiendo al login...";
            }
            //Cerramos la conexion
            $baseDeDatos->closeConnection();
        }
    } else {
        $error = "Datos no encontrados";
    }

} catch (Exception $e) {
    $error = $e->getMessage();
}
// Si hay error, los devolvemos como JSON y detenemos la ejecución
if (isset($error)) {
    echo json_encode(["success" => false, "error" => $error]);
} else if (isset($exito)) {
    // Si todo está bien, continuamos con el registro
    echo json_encode(["success" => true, "exito" => $exito]);
}
exit();