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

        $idUsuario = $datos['idUsuario'];
        $idVideojuegoApi = $datos['idJuego'];
        $contenido = validarCadena($datos['contenido']);
        $imageJuego = $datos['imageJuego'];

        // Verificar si el usuario existe en la tabla Usuarios
        $sql_check_user = "SELECT id_usuario FROM Usuarios WHERE id_usuario = ?";
        $stmt_check_user = $conexion->prepare($sql_check_user);
        $stmt_check_user->bind_param("i", $idUsuario);
        $stmt_check_user->execute();
        $result_check_user = $stmt_check_user->get_result();

        if ($result_check_user->num_rows === 0) {
            $error = "El usuario no existe";
        } else {
            // Verificar si el usuario ya ha escrito una reseña para este juego
            $sql_check_review = "SELECT id_resena FROM Resenas WHERE id_usuario = ? AND id_videojuego_api = ?";
            $stmt_check_review = $conexion->prepare($sql_check_review);
            $stmt_check_review->bind_param("is", $idUsuario, $idVideojuegoApi);
            $stmt_check_review->execute();
            $result_check_review = $stmt_check_review->get_result();

            if ($result_check_review->num_rows > 0) {
                $error = "Ya has escrito una reseña para este juego";
            } else {
                // Insertar la reseña en la tabla Resenas
                $sql_insert = "INSERT INTO Resenas (id_usuario, id_videojuego_api, contenido, img_juego) VALUES (?, ?, ?, ?)";
                $stmt_insert = $conexion->prepare($sql_insert);
                $stmt_insert->bind_param("isss", $idUsuario, $idVideojuegoApi, $contenido, $imageJuego);

                if ($stmt_insert->execute()) {
                    $exito = "¡Reseña añadida! Recarga la página para ver los cambios";
                } else {
                    $error = $stmt_insert->error;
                }

                // Cerrar la declaración de inserción
                $stmt_insert->close();
            }

            // Cerrar la declaración de verificación de reseña
            $stmt_check_review->close();
        }

        // Cerrar la declaración de verificación de usuario
        $stmt_check_user->close();
        // Cerrar conexión
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