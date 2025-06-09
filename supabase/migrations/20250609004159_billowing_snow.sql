-- Database schema for Salgados da Sara

-- Create database (run this separately)
-- CREATE DATABASE salgados_da_sara;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    address VARCHAR(255) NOT NULL,
    number VARCHAR(20) NOT NULL,
    complement VARCHAR(255),
    city VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Products table
CREATE TABLE IF NOT EXISTS products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    is_portioned BOOLEAN DEFAULT FALSE,
    is_custom BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    customer_data JSONB NOT NULL,
    items JSONB NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    is_delivery BOOLEAN DEFAULT FALSE,
    payment_method VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    rejection_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order status history table
CREATE TABLE IF NOT EXISTS order_status_history (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- App configuration table
CREATE TABLE IF NOT EXISTS app_config (
    id SERIAL PRIMARY KEY,
    config_key VARCHAR(100) UNIQUE NOT NULL,
    config_value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
INSERT INTO admin_users (username, password, role) 
VALUES ('sara', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin')
ON CONFLICT (username) DO NOTHING;
-- Default password is 'password' - change this in production!

-- Insert default products
INSERT INTO products (name, price, category, description, is_portioned, is_custom) VALUES
-- SALGADOS FRITOS
('Bolinha de queijo', 110.00, 'salgados', 'Deliciosas bolinhas de queijo douradas', false, false),
('Coxinha frango', 110.00, 'salgados', 'Coxinha tradicional de frango', false, false),
('Coxinha brócolis/queijo', 110.00, 'salgados', 'Coxinha especial de brócolis com queijo', false, false),
('Bombinha calabresa/queijo', 110.00, 'salgados', 'Bombinha recheada com calabresa e queijo', false, false),
('Enroladinho de salsicha', 110.00, 'salgados', 'Massa crocante envolvendo salsicha', false, false),
('Croquetes', 110.00, 'salgados', 'Croquetes dourados e crocantes', false, false),
('Pastel simples (gado/frango/queijo)', 100.00, 'salgados', 'Pastel tradicional com recheios variados', false, false),
('Travesseirinho de gado', 110.00, 'salgados', 'Travesseirinho recheado com carne', false, false),
('Risoles de gado', 120.00, 'salgados', 'Risoles cremosos de carne', false, false),
('Risoles frango', 120.00, 'salgados', 'Risoles cremosos de frango', false, false),

-- SORTIDOS
('Barquetes (legumes ou frango)', 180.00, 'sortidos', 'Barquetes delicados com recheios especiais', false, false),
('Canudinhos (legumes ou frango)', 120.00, 'sortidos', 'Canudinhos crocantes com recheio saboroso', false, false),
('Torradinhas', 170.00, 'sortidos', 'Torradinhas douradas e temperadas', false, false),
('Espetinho', 180.00, 'sortidos', 'Espetinhos variados para petiscar', false, false),
('Mini Pizza', 160.00, 'sortidos', 'Mini pizzas com coberturas diversas', false, false),
('Mini Sanduíches', 160.00, 'sortidos', 'Mini sanduíches perfeitos para festas', false, false),

-- ASSADOS
('Presunto e Queijo', 160.00, 'assados', 'Salgado assado com presunto e queijo', false, false),
('Gado', 160.00, 'assados', 'Salgado assado com recheio de carne', false, false),
('Frango', 160.00, 'assados', 'Salgado assado com recheio de frango', false, false),
('Legumes', 160.00, 'assados', 'Salgado assado com mix de legumes', false, false),
('Brócolis c/ Ricota', 160.00, 'assados', 'Salgado assado com brócolis e ricota', false, false),
('Palmito', 160.00, 'assados', 'Salgado assado com palmito', false, false),

-- ESPECIAIS
('Mini Cachorro Quente', 220.00, 'especiais', 'Mini hot dogs completos', false, false),
('Mini Hambúrguer', 220.00, 'especiais', 'Mini hambúrgueres gourmet', false, false),
('Empadinhas', 200.00, 'especiais', 'Empadinhas tradicionais com recheios variados', false, false),

-- OPCIONAIS
('Batata Frita (Porção)', 6.50, 'opcionais', 'Porção de batata frita sequinha', true, false)

ON CONFLICT DO NOTHING;

-- Insert default configuration
INSERT INTO app_config (config_key, config_value) VALUES
('delivery_fee', '10.00'),
('app_name', 'Salgados da Sara'),
('contact_phone', '(54) 99999-9999'),
('address', 'RUA IDA BERLET 1738 B')
ON CONFLICT (config_key) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON order_status_history(order_id);