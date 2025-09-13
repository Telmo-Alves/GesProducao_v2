import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseConnection } from '../config/database';
import { User, CreateUserRequest, UpdateUserRequest } from '../types';
import { ConfigManager } from '../config/config';

export class UserService {
  private dbConnection: DatabaseConnection;

  constructor() {
    const config = ConfigManager.getInstance().getConfig();
    this.dbConnection = DatabaseConnection.getInstance(config);
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const now = new Date();
    const userId = uuidv4();
    
    // Converter role para nivel numérico
    const nivel = this.roleToNivel(userData.role);
    const administrador = userData.role === 'admin' ? 'S' : 'N';

    const query = `
      INSERT INTO TAB_UTILIZADORES (UTILIZADOR, SENHA, NIVEL, VALIDADE, ULTIMO_LOGIN, NR_LOGINS, SECCAO, ADMINISTRADOR)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    await this.dbConnection.executeQuery('producao', query, [
      userData.username,
      hashedPassword,
      nivel,
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano de validade
      null,
      0,
      1,
      administrador
    ]);

    return {
      id: userData.username,
      username: userData.username,
      email: userData.email,
      role: userData.role,
      active: true,
      createdAt: now,
      updatedAt: now,
      seccao: 1,
      isAdmin: userData.role === 'admin'
    };
  }

  async getAllUsers(): Promise<User[]> {
    const query = `
      SELECT UTILIZADOR, SENHA, NIVEL, VALIDADE, ULTIMO_LOGIN, NR_LOGINS, SECCAO, ADMINISTRADOR
      FROM TAB_UTILIZADORES
      ORDER BY UTILIZADOR
    `;

    const result = await this.dbConnection.executeQuery('producao', query);
    return result.map(row => ({
      id: row.UTILIZADOR,
      username: row.UTILIZADOR,
      email: `${row.UTILIZADOR}@gesproducao.com`, // Email padrão
      role: this.nivelToRole(row.NIVEL, row.ADMINISTRADOR),
      active: row.VALIDADE ? new Date(row.VALIDADE) > new Date() : true,
      createdAt: new Date(),
      updatedAt: row.ULTIMO_LOGIN ? new Date(row.ULTIMO_LOGIN) : new Date(),
      seccao: row.SECCAO || 1,
      isAdmin: this.isUserAdmin(row.NIVEL, row.ADMINISTRADOR)
    }));
  }

  async getUserById(id: string): Promise<User | null> {
    const query = `
      SELECT UTILIZADOR, SENHA, NIVEL, VALIDADE, ULTIMO_LOGIN, NR_LOGINS, SECCAO, ADMINISTRADOR
      FROM TAB_UTILIZADORES
      WHERE UTILIZADOR = ?
    `;

    const result = await this.dbConnection.executeQuery('producao', query, [id]);
    
    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return {
      id: row.UTILIZADOR,
      username: row.UTILIZADOR,
      email: `${row.UTILIZADOR}@gesproducao.com`,
      role: this.nivelToRole(row.NIVEL, row.ADMINISTRADOR),
      active: row.VALIDADE ? new Date(row.VALIDADE) > new Date() : true,
      createdAt: new Date(),
      updatedAt: row.ULTIMO_LOGIN ? new Date(row.ULTIMO_LOGIN) : new Date(),
      seccao: row.SECCAO || 1,
      isAdmin: this.isUserAdmin(row.NIVEL, row.ADMINISTRADOR)
    };
  }

  async getUserByUsername(username: string): Promise<(User & { password: string }) | null> {
    const query = `
      SELECT UTILIZADOR, SENHA, NIVEL, VALIDADE, ULTIMO_LOGIN, NR_LOGINS, SECCAO, ADMINISTRADOR
      FROM TAB_UTILIZADORES
      WHERE UTILIZADOR = ?
    `;

    const result = await this.dbConnection.executeQuery('producao', query, [username]);
    
    if (result.length === 0) {
      return null;
    }

    const row = result[0];
    return {
      id: row.UTILIZADOR,
      username: row.UTILIZADOR,
      email: `${row.UTILIZADOR}@gesproducao.com`,
      password: row.SENHA,
      role: this.nivelToRole(row.NIVEL, row.ADMINISTRADOR),
      active: row.VALIDADE ? new Date(row.VALIDADE) > new Date() : true,
      createdAt: new Date(),
      updatedAt: row.ULTIMO_LOGIN ? new Date(row.ULTIMO_LOGIN) : new Date(),
      seccao: row.SECCAO || 1,
      isAdmin: this.isUserAdmin(row.NIVEL, row.ADMINISTRADOR)
    };
  }

  async updateUser(id: string, userData: UpdateUserRequest): Promise<User | null> {
    const updateFields: string[] = [];
    const values: any[] = [];

    if (userData.role !== undefined) {
      const nivel = this.roleToNivel(userData.role);
      const administrador = userData.role === 'admin' ? 'S' : 'N';
      updateFields.push('NIVEL = ?', 'ADMINISTRADOR = ?');
      values.push(nivel, administrador);
    }

    if (userData.active !== undefined) {
      const validade = userData.active 
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 ano
        : new Date(Date.now() - 1); // Data passada para inativar
      updateFields.push('VALIDADE = ?');
      values.push(validade);
    }

    if (updateFields.length === 0) {
      return this.getUserById(id);
    }

    values.push(id);

    const query = `
      UPDATE TAB_UTILIZADORES 
      SET ${updateFields.join(', ')}
      WHERE UTILIZADOR = ?
    `;

    await this.dbConnection.executeQuery('producao', query, values);
    return this.getUserById(id);
  }

  async deleteUser(id: string): Promise<boolean> {
    const query = 'DELETE FROM TAB_UTILIZADORES WHERE UTILIZADOR = ?';
    await this.dbConnection.executeQuery('producao', query, [id]);
    return true;
  }

  async validatePassword(plainPassword: string, storedPassword: string): Promise<boolean> {
    // Verificar se a password está hasheada com bcrypt (começa com $2b$ e tem 60 caracteres)
    if (storedPassword && storedPassword.startsWith('$2b$') && storedPassword.length === 60) {
      // Password hasheada com bcrypt
      return bcrypt.compare(plainPassword, storedPassword);
    } else {
      // Password em texto plano (compatibilidade com sistema antigo)
      return plainPassword === storedPassword;
    }
  }

  private roleToNivel(role: string): number {
    switch (role) {
      case 'admin': return 1;
      case 'operator': return 2;
      case 'viewer': return 3;
      default: return 3;
    }
  }

  private nivelToRole(nivel: number, administrador: string): 'admin' | 'operator' | 'viewer' {
    const adminFlag = (administrador || '').toString().trim().toUpperCase();
    if (adminFlag === 'S' || adminFlag === 'Y' || adminFlag === '1') return 'admin';
    switch (nivel) {
      case 1: return 'admin';
      case 2: return 'operator';
      case 3: return 'viewer';
      default: return 'viewer';
    }
  }

  private isUserAdmin(nivel: number, administrador: string): boolean {
    const adminFlag = (administrador || '').toString().trim().toUpperCase();
    return adminFlag === 'S' || adminFlag === 'Y' || adminFlag === '1' || nivel === 1;
  }

  async initializeDefaultUsers(): Promise<void> {
    try {
      const existingUsers = await this.getAllUsers();
      
      if (existingUsers.length === 0) {
        await this.createUser({
          username: 'admin',
          email: 'admin@gesproducao.com',
          password: 'admin123',
          role: 'admin'
        });
        console.log('Utilizador admin padrão criado');
      }
    } catch (error) {
      console.log('Erro ao inicializar utilizadores ou tabela ainda não existe:', error);
    }
  }
}
