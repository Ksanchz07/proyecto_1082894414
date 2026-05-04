-- La tabla users contiene tanto las credenciales de acceso
-- como los datos del perfil del cobrador (RN-06).
-- Para los admins, los campos de perfil quedan NULL.
CREATE TABLE IF NOT EXISTS users (
  id                    UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name                  VARCHAR(150) NOT NULL,
  email                 VARCHAR(255) UNIQUE NOT NULL,
  password_hash         TEXT         NOT NULL,
  role                  VARCHAR(10)  NOT NULL DEFAULT 'cobrador'
                        CHECK (role IN ('cobrador', 'admin')),
  is_active             BOOLEAN      DEFAULT true,
  must_change_password  BOOLEAN      DEFAULT false,
  identification_number VARCHAR(20),
  address               TEXT,
  bank_name             VARCHAR(100),
  bank_account          VARCHAR(30),
  account_type          VARCHAR(20)
                        CHECK (account_type IN ('ahorros', 'corriente', NULL)),
  last_login_at         TIMESTAMPTZ,
  created_at            TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);
