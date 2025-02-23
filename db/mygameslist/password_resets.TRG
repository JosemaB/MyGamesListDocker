TYPE=TRIGGERS
triggers='CREATE DEFINER=`root`@`%` TRIGGER set_expires_at BEFORE INSERT ON password_resets\nFOR EACH ROW\nBEGIN\n    SET NEW.expires_at = NOW() + INTERVAL 1 HOUR;\nEND'
sql_modes=1436549152
definers='root@%'
client_cs_names='utf8mb4'
connection_cl_names='utf8mb4_unicode_ci'
db_cl_names='latin1_swedish_ci'
created=174031044644
