import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import { v4 as uuidv4 } from "uuid";
const DB_HOST = process.env.DB_HOST || "localhost";
const DB_USER = process.env.DB_USER || "root";
const DB_PASSWORD = process.env.DB_PASSWORD || "Manel@2024#";
const DB_NAME = process.env.DB_NAME || "colocation_db";
let pool = null;
async function initializePool() {
    pool = mysql.createPool({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 20, // Increased connection limit
        queueLimit: 100, // Increased queue limit to allow connections to wait
    });
}
export async function getConnection() {
    if (!pool) {
        await initializePool();
    }
    return await pool.getConnection();
}
export async function initDB() {
    const connection = await mysql.createConnection({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
    });
    // Création de la base de données si elle n'existe pas
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\`;`);
    await connection.query(`USE \`${DB_NAME}\`;`);
    // Chaque table est créée séparément
    await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id CHAR(36) PRIMARY KEY,
      email VARCHAR(255) NOT NULL UNIQUE,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      user_type ENUM('student','advertiser','admin') NOT NULL DEFAULT 'student',
      status ENUM('active','suspended') NOT NULL DEFAULT 'active',
      avatar_url VARCHAR(255),
      bio TEXT,
      university VARCHAR(255),
      study_level VARCHAR(50),
      preferences JSON,
      account_type VARCHAR(50),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
    await connection.query(`
    CREATE TABLE IF NOT EXISTS listings (
      id CHAR(36) PRIMARY KEY,
      owner_id CHAR(36) NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      price DECIMAL(10,2) NOT NULL,
      city VARCHAR(100) NOT NULL,
      address VARCHAR(255),
      latitude DECIMAL(10,8),
      longitude DECIMAL(11,8),
      room_type VARCHAR(50),
      number_of_roommates INT DEFAULT 1,
      current_roommates INT DEFAULT 0,
      amenities JSON,
      images JSON,
      available_from DATE,
      status ENUM('active','inactive','pending','rejected') DEFAULT 'active',
      views_count INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
    await connection.query(`
    CREATE TABLE IF NOT EXISTS roommate_requests (
      id CHAR(36) PRIMARY KEY,
      listing_id CHAR(36) NOT NULL,
      student_id CHAR(36) NOT NULL,
      message TEXT,
      status ENUM('pending','accepted','rejected') DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_request (listing_id, student_id),
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
    await connection.query(`
    CREATE TABLE IF NOT EXISTS favorites (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      listing_id CHAR(36) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY unique_favorite (user_id, listing_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE
    )
  `);
    await connection.query(`
    CREATE TABLE IF NOT EXISTS comments (
      id CHAR(36) PRIMARY KEY,
      listing_id CHAR(36) NOT NULL,
      user_id CHAR(36) NOT NULL,
      content TEXT NOT NULL,
      parent_id CHAR(36),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE
    )
  `);
    await connection.query(`
    CREATE TABLE IF NOT EXISTS announcements (
      id CHAR(36) PRIMARY KEY,
      user_id CHAR(36) NOT NULL,
      title VARCHAR(255) NOT NULL,
      content TEXT NOT NULL,
      category ENUM('roommate','study_group','event','marketplace','other') NOT NULL,
      city VARCHAR(100),
      price DECIMAL(10,2),
      contact_info JSON,
      images JSON,
      expires_at DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);
    await connection.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id CHAR(36) PRIMARY KEY,
      sender_id CHAR(36) NOT NULL,
      receiver_id CHAR(36) NOT NULL,
      listing_id CHAR(36),
      announcement_id CHAR(36),
      content TEXT NOT NULL,
      is_read BOOLEAN DEFAULT false,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE SET NULL,
      FOREIGN KEY (announcement_id) REFERENCES announcements(id) ON DELETE SET NULL
    )
  `);
    // Create default admin user if not exists
    const [adminRows] = await connection.query("SELECT id FROM users WHERE user_type = 'admin' AND email = 'admin@roommateTN.com'");
    if (Array.isArray(adminRows) && adminRows.length === 0) {
        const adminId = uuidv4();
        const hashedPassword = await bcrypt.hash("adminpassword", 10); // Hash a default admin password
        await connection.query("INSERT INTO users (id, email, first_name, last_name, password, user_type) VALUES (?, ?, ?, ?, ?, ?)", [adminId, "admin@roommateTN.com", "Admin", "User", hashedPassword, "admin"]);
        console.log("Default admin user created.");
    }
    else {
        console.log("Admin user already exists.");
    }
    await connection.end();
}
