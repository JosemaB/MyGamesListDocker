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

        //Validar los campos steam ...

        $idUsuario = validarCadena($datos['idUsuario']);
        $sobremi = validarCadena($datos['sobreMi']);
        $steam = $datos['steam'];
        $youtube = $datos['youtube'];
        $discord = $datos['discord'];

        $datos = [ // Crear un array con los valores enviados
            "sobremi" => $sobremi,
            "steam" => $steam,
            "youtube" => $youtube,
            "discord" => $discord
        ];

        // Validaciones
        if ($steam && !validarSteam($steam)) {
            $error = ["steamLink" => "El enlace de Steam no es válido"];

        } else if ($youtube && !validarYouTube($youtube)) {
            $error = ["youtubeLink" => "El enlace de YouTube no es válido"];

        } else if ($discord && !validarDiscord($discord)) {
            $error = ["discordTag" => "El tag de Discord no es válido"];

        } else if ($sobremi && strlen($sobremi) > 500) {
            // Si el texto de "sobremi" tiene más de 50 caracteres, se agrega el error.
            $error["sobremi"] = "El texto de 'Sobre mí' no puede exceder los 500 caracteres";
        } else {
            // Verificar si el usuario existe
            $sql_check_list = "SELECT sobremi, steam, youtube, discord FROM usuarios WHERE id_usuario = ?";
            $stmt = $conexion->prepare($sql_check_list);
            $stmt->bind_param("i", $idUsuario);
            $stmt->execute();
            $result = $stmt->get_result()->fetch_assoc();

            if ($result) { // Verifica que la consulta haya devuelto datos

                if (array_diff_assoc($datos, $result) === []) {
                    $error = "No se detectaron cambios. Modifica algún campo";

                } else {
                    //El usuario ya tiene sus datos si quiere enviar nuevos tiene que enviar todos los campos(sus datos completo sino se borran los anteriores)

                    // Consulta SQL para actualizar los campos
                    $sql = "UPDATE usuarios SET sobremi = ?, steam = ?, youtube = ?, discord = ? WHERE id_usuario = ?";
                    $stmt = $conexion->prepare($sql);
                    $stmt->bind_param("ssssi", $sobremi, $steam, $youtube, $discord, $idUsuario);

                    // Ejecutar la consulta
                    if ($stmt->execute()) {
                        $exito = "Los datos se actualizaron con éxito. Recarga la página para ver los cambios";
                    } else {
                        $error = "Error al actualizar los datos: " . $stmt->error;
                    }
                    // Cerrar conexión
                    $stmt->close();
                }
            } else {
                $error = "El usuario no existe";
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