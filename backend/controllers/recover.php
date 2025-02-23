<?php
include_once '../config/ConexionBdd.php';  // Para la conexión de la base de datos MyGamesList
include_once '../config/cors.php';  // Incluye CORS para poder hacer la conexión con mi frontend
include_once '../vendor/autoload.php';
include_once '../helpers/funciones.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$datos = json_decode(file_get_contents('php://input'), true);
try {
    if ($datos) {
        // Comprobar si ese correo existe en la BDD antes de hacer más cosas
        $email = validarCadena($datos['email']);

        // Creamos la conexión ya con los campos validados
        $baseDeDatos = new ConexionBdd();
        $conexion = $baseDeDatos->getConnection();

        // Para saber si existe ese email
        $consultaCorreo = $conexion->prepare("select nombre_usuario, metodo_registro from usuarios where email = ?;");
        $consultaCorreo->bind_param("s", $email);
        $consultaCorreo->execute();
        $emailResultado = $consultaCorreo->get_result();

        if ($emailResultado->num_rows > 0) {
            $metodo = $emailResultado->fetch_assoc();
            if ($metodo["metodo_registro"] === 'google') {
                $error = 'No podemos restablecer tu contraseña porque tu cuenta está asociada con Google';
            } else {
                //Si no tiene errores reiniciamos el puntero
                $emailResultado->data_seek(0);
                // Enviar el correo usando PHPMailer
                $mail = new PHPMailer(true);
                try {
                    // Configuración del servidor SMTP
                    $mail->isSMTP();
                    $mail->Host = 'smtp.gmail.com';
                    $mail->SMTPAuth = true;
                    $mail->Username = 'jmabenavides25@gmail.com';  // Cambia esto con tu correo
                    $mail->Password = 'geze jlgl xhmz lkuw';  // Usa un token si tienes 2FA activado
                    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                    $mail->Port = 587;

                    // Remitente y destinatario
                    $mail->setFrom('jmabenavides25@gmail.com', 'MyGamesList');
                    $nombreUsuario = $emailResultado->fetch_assoc();
                    $mail->addAddress($email, $nombreUsuario['nombre_usuario']);  // El correo ingresado en el formulario

                    //Generamos un token que sea unico para saber si ese ususario recupero esa contraseña
                    // Generaramos un token único
                    $token = bin2hex(random_bytes(16)); // Esto genera un token de 32 caracteres

                    // Establecemos la fecha de expiración (1 hora después de la creación)
                    $expiresAt = date('Y-m-d H:i:s', strtotime('+1 hour')); // Fecha actual + 1 hora

                    // Insertamos el token
                    $query = "INSERT INTO password_resets (email, token) VALUES (?, ?)";
                    $insertToken = $conexion->prepare($query);
                    $insertToken->bind_param("ss", $email, $token);
                    $insertToken->execute();

                    // Contenido del correo
                    $mail->isHTML(true); // Indica que el correo será en formato HTML
                    $mail->Subject = 'Recuperación de la Cuenta - MyGamesList';
                    $mail->CharSet = 'UTF-8';

                    // Cargar el contenido del archivo HTML y agregar el CSS en línea
                    $htmlContent = file_get_contents('/var/www/html/frontend/Acceso/email/email.html');
                    // Reemplazar el marcador "TOKEN_UNICO_AQUI" por el token generado
                    $htmlContent = str_replace('TOKEN_UNICO_AQUI', $token, $htmlContent);

                    // Asegúrate de que el archivo HTML ya tenga el CSS incrustado en <style> o el CSS en línea
                    $mail->Body = $htmlContent;

                    // Mensaje en texto plano para clientes de correo que no soportan HTML
                    $mail->AltBody = "Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. 
                Si no fuiste tú quien realizó esta solicitud, por favor ignora este correo.

                Para restablecer tu contraseña, copia y pega el siguiente enlace en tu navegador:

                http://localhost:5500/Acceso/recover/recuperarCuenta.html?token=$token Este enlace será válido durante 1 hora.";


                    // Enviar el correo
                    $mail->send();
                    $exito = "Correo enviado exitosamente.";

                } catch (Exception $e) {
                    // Si hay un error con PHPMailer
                    $error = "No se pudo enviar el correo";
                }
            }
        } else {
            $error = "El correo electrónico ingresado no está asociado a ninguna cuenta";
        }
        // Cerramos la conexión
        $baseDeDatos->closeConnection();
    } else {
        $error = "Datos no encontrados";
    }
} catch (Exception $e) {
    $error = $e->getMessage();
}

// Si hay error, devolver como JSON
if (isset($error)) {
    echo json_encode(["success" => false, "error" => $error]);
} else if (isset($exito)) {
    // Si todo está bien, continuamos con el registro
    echo json_encode(["success" => true, "exito" => $exito]);
}
exit();
