<?php
include_once '../../config/cors.php';  // Incluye CORS para poder hacer la conexión con tu frontend
include_once '../../config/ConexionBdd.php';  // Para la conexion de la base de datos MyGamesList
include_once '../funciones.php';

try {
    $datos = json_decode(file_get_contents('php://input'), true);
    if ($datos) {
        $nombreUsuario = $datos["nombreUsuario"] . '%';
        // Creamos la conexión a la base de datos
        $baseDeDatos = new ConexionBdd();
        $conexion = $baseDeDatos->getConnection();


        // Consulta 1: Obtener todos los usuarios
        $usuariosQuery = "SELECT u.id_usuario, u.nombre_usuario, u.avatar, r.* FROM usuarios u, resenas r where u.id_usuario = r.id_usuario and nombre_usuario like ?";
        $usuariosStmt = $conexion->prepare($usuariosQuery);
        $usuariosStmt->bind_param("s", $nombreUsuario);
        $usuariosStmt->execute();
        $usuariosResult = $usuariosStmt->get_result();

        // Arreglo para almacenar los usuarios
        $usuarios = [];
        while ($usuario = $usuariosResult->fetch_assoc()) {
            // Agregar las listas al usuario
            $usuarios[] = $usuario; // Agregar el usuario al arreglo
        }

        $usuariosStmt->close();
        // Devolvemos el resultado
        $exito = "Usuarios encontrados";
        // Cerrar la conexión
        $conexion->close();
    } else {
        $error = "Datos no encontrados";
    }
} catch (Exception $e) {
    // Capturar cualquier error y devolverlo
    $error = $e->getMessage();
}
// Si hay error, los devolvemos como JSON y detenemos la ejecución
if (isset($error)) {
    echo json_encode(["success" => false, "error" => $error]);
} else if (isset($exito)) {
    // Si todo está bien, continuamos con el registro
    echo json_encode(["success" => true, "resenas" => $usuarios]);
}
exit();
