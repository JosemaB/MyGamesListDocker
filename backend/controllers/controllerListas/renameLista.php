<?php
include_once '../../config/cors.php';  // Incluye CORS para poder hacer la conexión con tu frontend
include_once '../../config/ConexionBdd.php';  // Para la conexión de la base de datos MyGamesList
include_once '../../helpers/funciones.php';

try {
    // Obtener los datos enviados en formato JSON
    $datos = json_decode(file_get_contents('php://input'), true);

    if ($datos) {
        $idUsuario = validarCadena($datos['idUsuario']);

        // Usamos una expresión regular para extraer el número
        preg_match('/cardLista-(\d+)/', validarCadena($datos['idLista']), $coincidencias);
        $idLista = (int) validarCadena($coincidencias[1]);

        // Obtener el nuevo nombre de la lista
        $nuevoNombre = validarCadena($datos['nuevoNombre']);

        if (!$idUsuario || !$idLista || !$nuevoNombre) {
            $error = ["Datos incompletos o inválidos. Por favor, intenta nuevamente"];
        } else if (strlen($nuevoNombre) > 50) {
            $error = ["nombreList" => "El nombre no debe tener más de 50 caracteres"];
        }

        // Creamos la conexión ya con los campos validados
        $baseDeDatos = new ConexionBdd();
        $conexion = $baseDeDatos->getConnection();

        // Verificar si la lista pertenece al usuario antes de actualizarla
        $checkListQuery = "SELECT id_lista, nombre_lista FROM listas WHERE id_lista = ?";
        $checkListStmt = $conexion->prepare($checkListQuery);
        $checkListStmt->bind_param("i", $idLista);
        $checkListStmt->execute();
        $checkListResult = $checkListStmt->get_result();

        if ($checkListResult->num_rows > 0 || $idUsuario === "Administrador") {
            $lista = $checkListResult->fetch_assoc();
            $nombreActual = $lista['nombre_lista'];

            // Verificar si el nuevo nombre es igual al nombre actual
            if ($nuevoNombre === $nombreActual) {
                $error = ["El nuevo nombre es igual al nombre actual. No se realizaron cambios"];
            } else {
                // Si la lista existe y pertenece al usuario, procedemos a actualizar el nombre
                $updateListQuery = "UPDATE listas SET nombre_lista = ? WHERE id_lista = ?";
                $updateListStmt = $conexion->prepare($updateListQuery);
                $updateListStmt->bind_param("si", $nuevoNombre, $idLista);
                $updateListStmt->execute();

                if ($updateListStmt->affected_rows > 0) {
                    $exito = ["El nombre de la lista ha sido actualizado con éxito"];
                } else {
                    $error = ["Hubo un problema al actualizar el nombre de la lista. Por favor, inténtalo de nuevo"];
                }
                $updateListStmt->close();
            }
        } else {
            $error = ["La lista no existe o no pertenece a este usuario"];
        }

        // Cerrar el statement
        $checkListStmt->close();
        // Cerrar la conexión
        $conexion->close();
    } else {
        $error = ["Datos incompletos o inválidos. Por favor, intenta nuevamente"];
    }
} catch (Exception $e) {
    $error = ["Hubo un error en el servidor. Por favor, intenta nuevamente"];
}

// Si hay error, los devolvemos como JSON y detenemos la ejecución
if (isset($error)) {
    echo json_encode(["success" => false, "error" => $error]);
} else if (isset($exito)) {
    // Si todo está bien, devolvemos un mensaje de éxito
    echo json_encode(["success" => true, "exito" => $exito]);
}
exit();