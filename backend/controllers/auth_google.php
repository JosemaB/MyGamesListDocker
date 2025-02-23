<?php
include_once '../config/ConexionBdd.php';  //Para la conexion de la base de datos MyGamesList
include_once '../config/cors.php';  // Incluye CORS para poder hacer la conexion con mi frontend
include_once './iniciar_sesion.php';

try {
    // Obtener los datos enviados en formato JSON
    $datos = json_decode(file_get_contents('php://input'), true);
    if ($datos) {
        //No valido los datos, ya que google antes de pasarlo aqui los valido en su api
        $email = $datos['email'];
        $avatar = $datos['image_url'];
        $full_name = $datos['given_name'];
        $rol = '1';
        $metodoRegistro = 'google';

        //Creamos la conexion ya con los campos validados
        $baseDeDatos = new ConexionBdd();
        $conexion = $baseDeDatos->getConnection();

        //Aqui se comprueba si el usuario existe
        $consultaUsuario = $conexion->prepare("select * from usuarios where email = ?");
        $consultaUsuario->bind_param("s", $email);
        $consultaUsuario->execute();
        $usuarioExiste = $consultaUsuario->get_result();

        if ($usuarioExiste->num_rows === 0) {//Si el usuario no existe para que sea una experencia agradable debemos ahcer varias configuraciones
            //Por si nos viene un nombre muyy largo
            if (strpos($full_name, ' ') !== false) {
                // Si hay espacio, dividimos en nombre y apellidos
                $name_parts = explode(" ", $full_name);

                // Primer nombre
                $first_name = $name_parts[0];
            } else {
                // Si no hay espacio, asumimos que es solo el nombre
                $first_name = $full_name;
            }
            //Agregamos el usuario unico google
            $username = $first_name . "_google_";
            //Declaro contador para hacer que el nombre usuario no se repita
            $counter = 1;
            $usuarioUnico = false; //Lo dejamos en gfalse hasta que se convierta en usuario unico en true

            while (!$usuarioUnico) {
                $sql = "SELECT * FROM usuarios WHERE nombre_usuario = ?";
                $stmt = $conexion->prepare($sql);
                $stmt->bind_param("s", $username);
                $stmt->execute();
                $result = $stmt->get_result();

                if ($result->num_rows != 0) {
                    // Si existe, añade un sufijo para hacerlo único
                    $username = $username . $counter;
                    $counter++;

                } else {
                    $usuarioUnico = true;
                }
            }
            //Hacemos el insert para registrar al usuario nuevo de google
            $insertUsuarioNuevo = $conexion->prepare("insert into usuarios (nombre_usuario, email, metodo_registro, avatar, id_rol) values(?,?,?,?,?)");
            $insertUsuarioNuevo->bind_param("sssss", $username, $email, $metodoRegistro, $avatar, $rol);
            $insertUsuarioNuevo->execute();
            $exito = "¡Registro exitoso!";
        } else {
            $exito = "Usuario existe";
        }
        //Creamos la sesion y la cookie
        iniciarSesion($email);
    } else {
        $error = "Error al conectar con Google. Datos no válidos";
    }
} catch (Exception $ex) {
    $error = "Error al conectar con Google. Intenta nuevamente";
}
// Si hay error, los devolvemos como JSON y detenemos la ejecución
if (isset($error)) {
    echo json_encode(["success" => false, "error" => $error]);
} else if (isset($exito)) {
    // Si todo está bien, continuamos con el registro
    echo json_encode(["success" => true, "exito" => $exito]);
}
exit();