<?php
include_once '../../config/cors.php';
include_once '../../helpers/funciones.php';
include_once '../../config/ConexionBdd.php';  //Para la conexion de la base de datos MyGamesList
session_start();
try {
    // Obtener los datos enviados en formato JSON
    $datos = json_decode(file_get_contents('php://input'), true);
    if ($datos) {
        $id = validarCadena($datos['id']);
        $nombre = validarCadena($datos['nombre']);
        $nombreActual = validarCadena($datos['nombreActual']);
        $avatar = $datos['img'];

        if (!$nombre) {
            $error = ["nombre" => "Por favor, ingresa un nombre válido"];
        } else if (strlen($nombre) > 15) {
            $error = ["nombre" => "El nombre de usuario no debe tener más de 15 caracteres"];
        } else {
            //Creamos la conexion ya con los campos validados
            $baseDeDatos = new ConexionBdd();
            $conexion = $baseDeDatos->getConnection();

            //Aqui se comprobamos si el usuario tiene la misma imagen o el mismo nombre
            $consultaUsuario = $conexion->prepare("select nombre_usuario, avatar  from usuarios where id_usuario = ?");
            $consultaUsuario->bind_param("s", $id);
            $consultaUsuario->execute();
            $usuarioResultado = $consultaUsuario->get_result();
            $usuarioCampos = $usuarioResultado->fetch_assoc();

            if ($usuarioCampos["avatar"] === $avatar && $usuarioCampos["nombre_usuario"] === $nombre) {
                $error = "El nombre o el avatar deben ser diferentes";
            } else {
                //Para saber si existe el usuario
                //Aqui se comprueba si el usuario existe
                $consultaUsuarioBdd = $conexion->prepare("select * from usuarios where nombre_usuario = ?");
                $consultaUsuarioBdd->bind_param("s", $nombre);
                $consultaUsuarioBdd->execute();
                $usuarioExiste = $consultaUsuarioBdd->get_result();
                $usario = $usuarioExiste->fetch_assoc();
                if ($usuarioExiste->num_rows !== 0 && (strtolower($nombre) !== strtolower($nombreActual))) {
                    $error = ["nombre" => "Este nombre de usuario ya está en uso. Prueba con otro"];
                }
            }


            if (!isset($error)) {
                //Hacemos el update para actulizar los campos
                $updateCampos = $conexion->prepare("UPDATE usuarios SET avatar = ?, nombre_usuario = ? where id_usuario = ?");
                $updateCampos->bind_param("sss", $avatar, $nombre, $id);
                $updateCampos->execute();
                $exito = "La imagen/avatar se ha actualizado con éxito";

                // Actualizar los campos en la session
                $_SESSION['usuario']['avatar'] = $avatar;
                $_SESSION['usuario']['nombre'] = $nombre;
            }

        }
    } else {
        $error = "Datos no encontrados";
    }
} catch (Exception $e) {
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