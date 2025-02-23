<?php
include_once '../../config/ConexionBdd.php';
include_once '../../config/cors.php';
include_once '../../vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$datos = json_decode(file_get_contents('php://input'), true);

try {
    if ($datos) {
        try {
            // Recoger y limpiar los datos enviados
            $email = htmlspecialchars($datos['email']);
            $mensaje = htmlspecialchars($datos['mensaje']);
            $usuario = htmlspecialchars($datos['usuario']);

            // Validar que el mensaje tenga al menos 10 caracteres
            if (strlen($mensaje) < 10) {
                $error = ["mensaje" => 'El mensaje debe tener al menos 10 caracteres'];
            } else {
                // Configurar PHPMailer
                $mail = new PHPMailer(true);

                // Configuración del servidor SMTP
                $mail->isSMTP();
                $mail->Host = 'smtp.gmail.com';
                $mail->SMTPAuth = true;
                $mail->Username = 'jmabenavides25@gmail.com';  // Cambia esto con tu correo
                $mail->Password = 'geze jlgl xhmz lkuw';  // Usa un token si tienes 2FA activado
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port = 587;

                // Enviar desde un correo genérico tuyo
                $mail->setFrom('jillben391@gmail.com', 'Soporte MyGamesList');

                //  Enviar el mensaje a tu correo de soporte
                $mail->addAddress('jmabenavides25@gmail.com', 'Soporte Técnico');

                // Opcional: Permite que cuando respondas el email, vaya directo al usuario
                $mail->addReplyTo($email);

                // Asunto del correo
                $mail->Subject = 'Nuevo mensaje de soporte';

                // Aseguramos que el correo tenga UTF-8
                $mail->CharSet = 'UTF-8'; // Establece la codificación UTF-8

                // Contenido del mensaje (HTML)
                $mail->isHTML(true);
                $mail->Body = "
                <h3>Nuevo mensaje de soporte</h3>
                <p><strong>Correo del usuario:</strong> $email</p>
                <p><strong>Usuario:</strong> $usuario</p>
                <p><strong>Mensaje:</strong></p>
                <p>$mensaje</p>";

                // Alternativa en texto plano
                $mail->AltBody = "Nuevo mensaje de soporte\nCorreo del usuario: $email\nMensaje: $mensaje";

                // Enviar el correo
                $mail->send();
                $exito = "Mensaje enviado correctamente";

            }
        } catch (Exception $e) {
            $error = "Error al enviar el mensaje: {$mail->ErrorInfo}";
        }
    } else {
        $error = "No se recibieron datos";
    }
} catch (Exception $e) {
    $error = $e->getMessage();
}

// Respuesta JSON
if (isset($error)) {
    echo json_encode(["success" => false, "error" => $error]);
} else {
    echo json_encode(["success" => true, "exito" => $exito]);
}
exit();
