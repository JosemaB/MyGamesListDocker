<?php
include_once '../../config/ConexionBdd.php';  // Para la conexión de la base de datos MyGamesList
include_once '../../config/cors.php';  // Incluye CORS para poder hacer la conexión con mi frontend
include_once '../../helpers/funciones.php';

try {
    // Obtener los datos enviados en formato JSON
    $datos = json_decode(file_get_contents('php://input'), true);
    if ($datos) {
        // Creamos la conexión ya con los campos validados
        $baseDeDatos = new ConexionBdd();
        $conexion = $baseDeDatos->getConnection();

        $idJuego = $datos['idJuego']; // Obtenemos el ID del juego a eliminar

        // Verificar si el juego existe en la lista
        $sql_check_game = "SELECT id_juego FROM Lista_Videojuegos WHERE id_juego = ?";
        $stmt = $conexion->prepare($sql_check_game);
        $stmt->bind_param("i", $idJuego);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            $error = "El videojuego no está en la lista";
        } else {
            // Borrar el videojuego de la lista
            $sql_delete = "DELETE FROM Lista_Videojuegos WHERE id_juego = ?";
            $stmt = $conexion->prepare($sql_delete);
            $stmt->bind_param("i", $idJuego);

            if ($stmt->execute()) {
                $exito = "Videojuego eliminado de la lista";
            } else {
                $error = $stmt->error;
            }
            // Cerrar conexión
            $stmt->close();
        }

        $conexion->close();
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