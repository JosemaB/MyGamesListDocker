<?php
include_once '../../config/ConexionBdd.php';  //Para la conexion de la base de datos MyGamesList
include_once '../../config/cors.php';  // Incluye CORS para poder hacer la conexion con mi frontend
include_once '../../helpers/funciones.php';

try {
    // Obtener los datos enviados en formato JSON
    $datos = json_decode(file_get_contents('php://input'), true);
    if ($datos) {
        //Creamos la conexion ya con los campos validados
        $baseDeDatos = new ConexionBdd();
        $conexion = $baseDeDatos->getConnection();

        $idLista = $datos['idLista'];
        $linkJuego = $datos['linkJuego'];

        $titulo = $datos['titulo'];
        $image = $datos['image'];

        // Verificar si la lista existe
        $sql_check_list = "SELECT id_lista FROM Listas WHERE id_lista = ?";
        $stmt = $conexion->prepare($sql_check_list);
        $stmt->bind_param("i", $idLista);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows === 0) {
            $error = "La lista no existe";
        } else {
            // Verificar si el videojuego ya está en la lista
            $sql_check_game = "SELECT titulo FROM Lista_Videojuegos WHERE id_lista = ? AND titulo = ?";
            $stmt = $conexion->prepare($sql_check_game);
            $stmt->bind_param("is", $idLista, $titulo);
            $stmt->execute();
            $result = $stmt->get_result();

            if ($result->num_rows > 0) {
                $error = "El videojuego ya está en la lista";
            } else {
                // Insertar el videojuego en la lista
                $sql_insert = "INSERT INTO Lista_Videojuegos (id_lista, titulo, image, link_juego) VALUES (?, ?, ?, ?)";
                $stmt = $conexion->prepare($sql_insert);
                $stmt->bind_param("isss", $idLista, $titulo, $image, $linkJuego);

                if ($stmt->execute()) {
                    $exito = "Videojuego agregado a la lista";
                } else {
                    $error = $stmt->error;
                }
                // Cerrar conexión
                $stmt->close();
            }
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