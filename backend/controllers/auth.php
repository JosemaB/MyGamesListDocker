<?php
include_once '../config/ConexionBdd.php';  //Para la conexion de la base de datos MyGamesList
include_once '../config/cors.php';  // Incluye CORS para poder hacer la conexion con mi frontend
include_once '../helpers/funciones.php';
include_once './iniciar_sesion.php';


try {
    // Obtener los datos enviados en formato JSON
    $datos = json_decode(file_get_contents('php://input'), true);
    if ($datos) {

        $email = validarCadena($datos['email']);
        //Creamos la conexion ya con los campos validados
        $baseDeDatos = new ConexionBdd();
        $conexion = $baseDeDatos->getConnection();

        //Aqui se comprueba si el usuario existe
        $consultaUsuario = $conexion->prepare("select contrasena, metodo_registro from usuarios where email = ?");
        $consultaUsuario->bind_param("s", $email);
        $consultaUsuario->execute();
        $usuarioExiste = $consultaUsuario->get_result();
        $usuarioResultado = $usuarioExiste->fetch_assoc();

        if ($usuarioResultado["metodo_registro"] === 'google') {
            $error = 'El correo que estás ingresando está vinculado con Google. Por favor, inicia sesión con tu cuenta de Google';
        } else if ($usuarioExiste->num_rows !== 0) {
            if (password_verify($datos['password'], $usuarioResultado["contrasena"])) {

                //Creamos la sesion y la cookie
                iniciarSesion($email);
                $exito = "Usuario dentro de la sesion";

            } else {
                $error = 'Correo electrónico o Contraseña incorrectos';
            }
        } else {
            //Para mandar un mensaje mas correcto
            $error = "El correo electrónico ingresado no está asociado a ninguna cuenta, regístrate para acceder";
        }
        //Cerramos la conexion
        $baseDeDatos->closeConnection();
    } else {
        $error = "Datos no encontrados";
    }
} catch (Exception $ex) {
    $error = $ex->getMessage();
}

// Si hay error, los devolvemos como JSON y detenemos la ejecución
if (isset($error)) {
    echo json_encode(["success" => false, "error" => $error]);
} else if (isset($exito)) {
    // Si todo está bien, continuamos con el registro
    echo json_encode(["success" => true, "exito" => $exito]);
}
exit();
