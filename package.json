-- ============================================================
-- SISTEMA DE GESTIÓN DE CINE
-- Base de datos: MySQL 8.0+
-- Versión: 2.0
-- ============================================================

  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;


-- ============================================================
-- TABLA: usuarios
-- ============================================================
CREATE TABLE usuarios (
    id          CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
    nombre      VARCHAR(100) NOT NULL,
    email       VARCHAR(150) NOT NULL UNIQUE,
    contrasena  VARCHAR(255) NOT NULL,
    rol         ENUM('admin','cliente') NOT NULL DEFAULT 'cliente',
    activo      TINYINT(1)   NOT NULL DEFAULT 1,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA: peliculas
-- ============================================================
CREATE TABLE peliculas (
    id            CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
    titulo        VARCHAR(200) NOT NULL,
    descripcion   TEXT,
    duracion      INT          NOT NULL CHECK (duracion > 0),
    genero        VARCHAR(80)  NOT NULL,
    clasificacion VARCHAR(10)  NOT NULL,
    imagen_url    TEXT,
    trailer_url   TEXT,
    estado        ENUM('activa','inactiva') NOT NULL DEFAULT 'activa',
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- TABLA: salas
-- ============================================================
CREATE TABLE salas (
    id        CHAR(36)     PRIMARY KEY DEFAULT (UUID()),
    nombre    VARCHAR(100) NOT NULL,
    capacidad INT          NOT NULL DEFAULT 150,
    activa    TINYINT(1)   NOT NULL DEFAULT 1
);

-- ============================================================
-- TABLA: funciones
-- ============================================================
CREATE TABLE funciones (
    id          CHAR(36)       PRIMARY KEY DEFAULT (UUID()),
    pelicula_id CHAR(36)       NOT NULL,
    sala_id     CHAR(36)       NOT NULL,
    fecha       DATE           NOT NULL,
    hora        TIME           NOT NULL,
    precio      DECIMAL(10,2)  NOT NULL CHECK (precio >= 0),
    estado      ENUM('disponible','cancelada','finalizada') NOT NULL DEFAULT 'disponible',
    created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_funcion_pelicula FOREIGN KEY (pelicula_id) REFERENCES peliculas(id) ON DELETE CASCADE,
    CONSTRAINT fk_funcion_sala     FOREIGN KEY (sala_id)     REFERENCES salas(id)
);

-- ============================================================
-- TABLA: asientos
-- (Estructura fija — 150 asientos precargados por sala)
-- ============================================================
CREATE TABLE asientos (
    id      CHAR(36)    PRIMARY KEY DEFAULT (UUID()),
    sala_id CHAR(36)    NOT NULL,
    fila    CHAR(1)     NOT NULL,
    columna INT         NOT NULL,
    numero  INT         NOT NULL,
    tipo    ENUM('estandar','vip','discapacitados') NOT NULL DEFAULT 'estandar',
    activo  TINYINT(1)  NOT NULL DEFAULT 1,
    UNIQUE KEY uq_sala_fila_col (sala_id, fila, columna),
    CONSTRAINT fk_asiento_sala FOREIGN KEY (sala_id) REFERENCES salas(id)
);

-- ============================================================
-- TABLA: funcion_asientos
-- Estado de cada asiento POR función
-- ============================================================
CREATE TABLE funcion_asientos (
    id         CHAR(36)  PRIMARY KEY DEFAULT (UUID()),
    funcion_id CHAR(36)  NOT NULL,
    asiento_id CHAR(36)  NOT NULL,
    estado     ENUM('disponible','ocupado','reservado') NOT NULL DEFAULT 'disponible',
    -- RESTRICCIÓN CRÍTICA: un asiento no puede venderse dos veces por función
    UNIQUE KEY uq_funcion_asiento (funcion_id, asiento_id),
    CONSTRAINT fk_fa_funcion  FOREIGN KEY (funcion_id)  REFERENCES funciones(id) ON DELETE CASCADE,
    CONSTRAINT fk_fa_asiento  FOREIGN KEY (asiento_id)  REFERENCES asientos(id)
);

-- ============================================================
-- TABLA: tiquetes
-- ============================================================
CREATE TABLE tiquetes (
    id           CHAR(36)      PRIMARY KEY DEFAULT (UUID()),
    codigo       VARCHAR(20)   NOT NULL UNIQUE,
    qr_url       MEDIUMTEXT,
    usuario_id   CHAR(36)      DEFAULT NULL,
    funcion_id   CHAR(36)      NOT NULL,
    total        DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    estado       ENUM('activo','usado','cancelado') NOT NULL DEFAULT 'activo',
    fecha_compra DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_uso    DATETIME      DEFAULT NULL,
    created_at   DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tiquete_usuario FOREIGN KEY (usuario_id)  REFERENCES usuarios(id)  ON DELETE SET NULL,
    CONSTRAINT fk_tiquete_funcion FOREIGN KEY (funcion_id)  REFERENCES funciones(id)
);

-- ============================================================
-- TABLA: detalle_tiquete
-- Relación muchos a muchos: tiquete ↔ asientos
-- ============================================================
CREATE TABLE detalle_tiquete (
    id              CHAR(36)      PRIMARY KEY DEFAULT (UUID()),
    tiquete_id      CHAR(36)      NOT NULL,
    asiento_id      CHAR(36)      NOT NULL,
    funcion_id      CHAR(36)      NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    -- RESTRICCIÓN CRÍTICA: un asiento no puede aparecer dos veces en la misma función
    UNIQUE KEY uq_detalle_funcion_asiento (funcion_id, asiento_id),
    CONSTRAINT fk_det_tiquete  FOREIGN KEY (tiquete_id)  REFERENCES tiquetes(id)  ON DELETE CASCADE,
    CONSTRAINT fk_det_asiento  FOREIGN KEY (asiento_id)  REFERENCES asientos(id),
    CONSTRAINT fk_det_funcion  FOREIGN KEY (funcion_id)  REFERENCES funciones(id)
);

-- ============================================================
-- ÍNDICES DE RENDIMIENTO
-- ============================================================
CREATE INDEX idx_funciones_fecha    ON funciones(fecha);
CREATE INDEX idx_funciones_pelicula ON funciones(pelicula_id);
CREATE INDEX idx_tiquetes_codigo    ON tiquetes(codigo);
CREATE INDEX idx_tiquetes_funcion   ON tiquetes(funcion_id);
CREATE INDEX idx_fa_funcion         ON funcion_asientos(funcion_id);

-- ============================================================
-- TRIGGER: Validar traslapes de horario por sala (MySQL)
-- ============================================================
DELIMITER $$

CREATE TRIGGER trg_validar_traslape_insert
BEFORE INSERT ON funciones
FOR EACH ROW
BEGIN
    DECLARE duracion_min INT;
    DECLARE conflict_count INT;

    SELECT p.duracion INTO duracion_min
    FROM peliculas p WHERE p.id = NEW.pelicula_id;

    SELECT COUNT(*) INTO conflict_count
    FROM funciones f
    JOIN peliculas p ON p.id = f.pelicula_id
    WHERE f.sala_id = NEW.sala_id
      AND f.estado  != 'cancelada'
      AND TIMESTAMP(NEW.fecha, NEW.hora) < TIMESTAMPADD(MINUTE, p.duracion, TIMESTAMP(f.fecha, f.hora))
      AND TIMESTAMPADD(MINUTE, duracion_min, TIMESTAMP(NEW.fecha, NEW.hora)) > TIMESTAMP(f.fecha, f.hora);

    IF conflict_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Traslape de horario: ya existe una función en esa sala en ese rango de tiempo.';
    END IF;
END$$

CREATE TRIGGER trg_validar_traslape_update
BEFORE UPDATE ON funciones
FOR EACH ROW
BEGIN
    DECLARE duracion_min INT;
    DECLARE conflict_count INT;

    SELECT p.duracion INTO duracion_min
    FROM peliculas p WHERE p.id = NEW.pelicula_id;

    SELECT COUNT(*) INTO conflict_count
    FROM funciones f
    JOIN peliculas p ON p.id = f.pelicula_id
    WHERE f.sala_id = NEW.sala_id
      AND f.estado  != 'cancelada'
      AND f.id      != NEW.id
      AND TIMESTAMP(NEW.fecha, NEW.hora) < TIMESTAMPADD(MINUTE, p.duracion, TIMESTAMP(f.fecha, f.hora))
      AND TIMESTAMPADD(MINUTE, duracion_min, TIMESTAMP(NEW.fecha, NEW.hora)) > TIMESTAMP(f.fecha, f.hora);

    IF conflict_count > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Traslape de horario: ya existe una función en esa sala en ese rango de tiempo.';
    END IF;
END$$

DELIMITER ;
