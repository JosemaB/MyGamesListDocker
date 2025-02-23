<?php
include_once '../../config/cors.php';  // Incluye CORS para poder hacer la conexión con tu frontend
include_once '../../config/ConexionBdd.php';  //Para la conexion de la base de datos MyGamesList
include_once '../../helpers/funciones.php';
try {
    // Obtener los datos enviados en formato JSON
    $datos = json_decode(file_get_contents('php://input'), true);
    if ($datos) {
        $idUsuario = validarCadena($datos['idUsuario']);

        // Usamos una expresión regular para extraer el número
        preg_match('/cardLista-(\d+)/', validarCadena($datos['idLista']), $coincidencias);
        $idLista = (int) validarCadena($coincidencias[1]);

        if (!$idUsuario || !$idLista) {
            $error = ["No se pudo eliminar la lista. Por favor, intenta nuevamente"];
        }

        //Creamos la conexion ya con los campos validados
        $baseDeDatos = new ConexionBdd();
        $conexion = $baseDeDatos->getConnection();

        // Verificar si la lista pertenece al usuario antes de eliminarla
        $checkListQuery = "SELECT id_lista FROM listas WHERE id_lista = ? AND id_usuario = ?";
        $checkListStmt = $conexion->prepare($checkListQuery);
        $checkListStmt->bind_param("is", $idLista, $idUsuario);
        $checkListStmt->execute();
        $checkListResult = $checkListStmt->get_result();


        if ($checkListResult->num_rows > 0 || $idUsuario === "Administrador") {
            // Si la lista existe y pertenece al usuario, procedemos a eliminarla
            $deleteListQuery = "DELETE FROM listas WHERE id_lista = ?";
            $deleteListStmt = $conexion->prepare($deleteListQuery);
            $deleteListStmt->bind_param("i", $idLista);
            $deleteListStmt->execute();

            if ($deleteListStmt->affected_rows > 0) {
                $exito = ["La lista ha sido eliminada con éxito."];
            } else {
                $error = ["Hubo un problema al eliminar la lista. Por favor, inténtalo de nuevo"];
            }
            $deleteListStmt->close();
        } else {
            $error = ["La lista no existe o no pertenece a este usuario"];
        }

        // Cerrar el statement
        $checkListResult->close();
        // Cerrar la conexión
        $conexion->close();
    } else {
        $error = ["No se pudo eliminar la lista. Por favor, intenta nuevamente"];
    }

} catch (Exception $e) {
    $error = ["No se pudo eliminar la lista. Por favor, intenta nuevamente"];
}
// Si hay error, los devolvemos como JSON y detenemos la ejecución
if (isset($error)) {
    echo json_encode(["success" => false, "error" => $error]);
} else if (isset($exito)) {
    // Si todo está bien, continuamos con el registro
    echo json_encode(["success" => true, "exito" => $exito]);
}
exit();