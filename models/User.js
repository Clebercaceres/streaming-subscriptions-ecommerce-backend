const { db } = require("../config/database");
const bcrypt = require("bcryptjs");

/**
 * Modelo de Usuario
 * Maneja todas las operaciones relacionadas con usuarios en la base de datos
 */
class User {
  /**
   * Crear un nuevo usuario
   * @param {Object} userData - Datos del usuario
   * @param {string} userData.username - Nombre de usuario
   * @param {string} userData.email - Email del usuario
   * @param {string} userData.password - Contraseña sin encriptar
   * @returns {Promise<Object>} Usuario creado sin contraseña
   */
  static async create({ username, email, password }) {
    return new Promise((resolve, reject) => {
      // Encriptar contraseña
      const saltRounds = 10;

      bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
          reject(new Error("Error al encriptar contraseña: " + err.message));
          return;
        }

        const stmt = db.prepare(
          "INSERT INTO users (username, email, password) VALUES (?, ?, ?)"
        );

        stmt.run([username, email, hashedPassword], function (err) {
          if (err) {
            if (
              err.message.includes("UNIQUE constraint failed: users.username")
            ) {
              reject(new Error("El nombre de usuario ya está registrado"));
            } else if (
              err.message.includes("UNIQUE constraint failed: users.email")
            ) {
              reject(new Error("El email ya está registrado"));
            } else {
              reject(new Error("Error al crear usuario: " + err.message));
            }
            return;
          }

          // Obtener usuario creado (sin contraseña)
          User.findById(this.lastID).then(resolve).catch(reject);
        });
      });
    });
  }

  /**
   * Buscar usuario por ID
   * @param {number} id - ID del usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  static async findById(id) {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT id, username, email, created_at FROM users WHERE id = ?",
        [id],
        (err, row) => {
          if (err) {
            reject(new Error("Error al buscar usuario: " + err.message));
            return;
          }
          resolve(row || null);
        }
      );
    });
  }

  /**
   * Buscar usuario por email
   * @param {string} email - Email del usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  static async findByEmail(email) {
    return new Promise((resolve, reject) => {
      db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) => {
        if (err) {
          reject(
            new Error("Error al buscar usuario por email: " + err.message)
          );
          return;
        }
        resolve(row || null);
      });
    });
  }

  /**
   * Buscar usuario por nombre de usuario
   * @param {string} username - Nombre de usuario
   * @returns {Promise<Object|null>} Usuario encontrado o null
   */
  static async findByUsername(username) {
    return new Promise((resolve, reject) => {
      db.get(
        "SELECT * FROM users WHERE username = ?",
        [username],
        (err, row) => {
          if (err) {
            reject(
              new Error("Error al buscar usuario por username: " + err.message)
            );
            return;
          }
          resolve(row || null);
        }
      );
    });
  }

  /**
   * Verificar contraseña de usuario
   * @param {string} password - Contraseña sin encriptar
   * @param {string} hashedPassword - Contraseña encriptada de la BD
   * @returns {Promise<boolean>} True si las contraseñas coinciden
   */
  static async verifyPassword(password, hashedPassword) {
    return new Promise((resolve, reject) => {
      const bcrypt = require("bcryptjs");
      bcrypt.compare(password, hashedPassword, (err, isMatch) => {
        if (err) {
          reject(new Error("Error al verificar contraseña: " + err.message));
          return;
        }
        resolve(isMatch);
      });
    });
  }

  /**
   * Obtener todos los usuarios (sin contraseña)
   * @returns {Promise<Array>} Lista de usuarios
   */
  static async findAll() {
    return new Promise((resolve, reject) => {
      db.all(
        "SELECT id, username, email, created_at FROM users ORDER BY created_at DESC",
        (err, rows) => {
          if (err) {
            reject(new Error("Error al obtener usuarios: " + err.message));
            return;
          }
          resolve(rows);
        }
      );
    });
  }

  /**
   * Actualizar usuario
   * @param {number} id - ID del usuario
   * @param {Object} userData - Datos a actualizar
   * @returns {Promise<Object>} Usuario actualizado
   */
  static async update(id, userData) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      if (userData.username) {
        fields.push("username = ?");
        values.push(userData.username);
      }

      if (userData.email) {
        fields.push("email = ?");
        values.push(userData.email);
      }

      if (userData.password) {
        const saltRounds = 10;
        const bcrypt = require("bcryptjs");

        bcrypt.hash(userData.password, saltRounds, (err, hashedPassword) => {
          if (err) {
            reject(new Error("Error al encriptar contraseña: " + err.message));
            return;
          }

          fields.push("password = ?");
          values.push(hashedPassword);
          values.push(id);

          if (fields.length === 0) {
            reject(new Error("No hay campos para actualizar"));
            return;
          }

          const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;

          db.run(sql, values, (err) => {
            if (err) {
              if (
                err.message.includes("UNIQUE constraint failed: users.username")
              ) {
                reject(new Error("El nombre de usuario ya está registrado"));
              } else if (
                err.message.includes("UNIQUE constraint failed: users.email")
              ) {
                reject(new Error("El email ya está registrado"));
              } else {
                reject(
                  new Error("Error al actualizar usuario: " + err.message)
                );
              }
              return;
            }

            this.findById(id).then(resolve).catch(reject);
          });
        });
      } else {
        if (fields.length === 0) {
          reject(new Error("No hay campos para actualizar"));
          return;
        }

        values.push(id);
        const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`;

        db.run(sql, values, (err) => {
          if (err) {
            if (
              err.message.includes("UNIQUE constraint failed: users.username")
            ) {
              reject(new Error("El nombre de usuario ya está registrado"));
            } else if (
              err.message.includes("UNIQUE constraint failed: users.email")
            ) {
              reject(new Error("El email ya está registrado"));
            } else {
              reject(new Error("Error al actualizar usuario: " + err.message));
            }
            return;
          }

          this.findById(id).then(resolve).catch(reject);
        });
      }
    });
  }

  /**
   * Eliminar usuario
   * @param {number} id - ID del usuario
   * @returns {Promise<boolean>} True si se eliminó correctamente
   */
  static async delete(id) {
    return new Promise((resolve, reject) => {
      db.run("DELETE FROM users WHERE id = ?", [id], function (err) {
        if (err) {
          reject(new Error("Error al eliminar usuario: " + err.message));
          return;
        }
        resolve(this.changes > 0);
      });
    });
  }
}

module.exports = User;
