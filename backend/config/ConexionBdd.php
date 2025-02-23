<?php
class ConexionBdd
{
    private $host = "mysql";  // Servidor (cambia si usas otro)
    private $username = "root";   // Usuario de MySQL
    private $password = "root";       // Contraseña de MySQL
    private $dbname = "mygameslist"; // Nombre de la BD
    private $conn;

    public function __construct()
    {
        $this->conn = new mysqli($this->host, $this->username, $this->password, $this->dbname);

        if ($this->conn->connect_error) {
            throw new Exception("Error de conexión: " . $this->conn->connect_error);
        }
    }
    // Método estático para obtener la conexión directamente
    public function getConnection()
    {
        return $this->conn;  // Regresamos la conexión directamente
    }
    public function closeConnection()
    {
         $this->conn->close();  // Regresamos la conexión directamente
    }
}

