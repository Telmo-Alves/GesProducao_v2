import * as Firebird from 'node-firebird';
import { AppConfig } from '../types';

export class DatabaseConnection {
  private static instance: DatabaseConnection;
  private config: AppConfig;

  private constructor(config: AppConfig) {
    this.config = config;
  }

  public static getInstance(config: AppConfig): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection(config);
    }
    return DatabaseConnection.instance;
  }

  public connectToProducao(): Promise<Firebird.Database> {
    return new Promise((resolve, reject) => {
      const options = {
        host: this.config.Producao.BD_Servidor.split('/')[0],
        port: parseInt(this.config.Producao.BD_Servidor.split('/')[1]) || 3050,
        database: this.config.Producao.BD_Path,
        user: this.config.Producao.BD_Username,
        password: this.config.Producao.BD_Password,
        lowercase_keys: false,
        role: undefined,
        pageSize: 4096
      };

      Firebird.attach(options, (err: any, db: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(db);
        }
      });
    });
  }

  public connectToGescom(): Promise<Firebird.Database> {
    return new Promise((resolve, reject) => {
      const options = {
        host: this.config.Gescom.BD2_Servidor.split('/')[0],
        port: parseInt(this.config.Gescom.BD2_Servidor.split('/')[1]) || 3050,
        database: this.config.Gescom.BD2_Path,
        user: this.config.Gescom.BD2_Username,
        password: this.config.Gescom.BD2_Password,
        lowercase_keys: false,
        role: undefined,
        pageSize: 4096
      };

      Firebird.attach(options, (err: any, db: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(db);
        }
      });
    });
  }

  public executeQuery(database: 'producao' | 'gescom', query: string, params: any[] = []): Promise<any[]> {
    return new Promise(async (resolve, reject) => {
      try {
        const db = database === 'producao' 
          ? await this.connectToProducao()
          : await this.connectToGescom();

        db.query(query, params, (err: any, result: any) => {
          db.detach();
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}