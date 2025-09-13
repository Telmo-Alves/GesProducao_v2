import { Request, Response } from 'express';
import { ConfigService } from '../services/configService';
import { AppConfig, ApiResponse } from '../types';

interface AuthenticatedRequest extends Request {
  user?: { id: string; username: string; role: string };
}

export class ConfigController {
  private configService: ConfigService;

  constructor() {
    this.configService = new ConfigService();
  }

  getConfig = async (req: AuthenticatedRequest, res: Response<ApiResponse<AppConfig>>) => {
    try {
      const config = this.configService.getConfig();
      res.json({
        success: true,
        data: config
      });
    } catch (error) {
      console.error('Erro ao buscar configurações:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar configurações'
      });
    }
  };

  updateConfig = async (req: AuthenticatedRequest, res: Response<ApiResponse<AppConfig>>) => {
    try {
      const configData: Partial<AppConfig> = req.body;

      // Validação básica
      if (configData.Producao) {
        const { BD_Servidor, BD_Path, BD_Username, BD_Password } = configData.Producao;
        if (!BD_Servidor || !BD_Path || !BD_Username || !BD_Password) {
          return res.status(400).json({
            success: false,
            error: 'Configurações de produção incompletas'
          });
        }
      }

      if (configData.Gescom) {
        const { BD2_Servidor, BD2_Path, BD2_Username, BD2_Password } = configData.Gescom;
        if (!BD2_Servidor || !BD2_Path || !BD2_Username || !BD2_Password) {
          return res.status(400).json({
            success: false,
            error: 'Configurações do Gescom incompletas'
          });
        }
      }

      this.configService.updateConfig(configData);
      const updatedConfig = this.configService.getConfig();

      res.json({
        success: true,
        data: updatedConfig,
        message: 'Configurações atualizadas com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao atualizar configurações'
      });
    }
  };

  testConnection = async (req: AuthenticatedRequest, res: Response<ApiResponse<{ database: string; connected: boolean }>>) => {
    try {
      const { database } = req.params;

      if (!['producao', 'gescom'].includes(database)) {
        return res.status(400).json({
          success: false,
          error: 'Base de dados inválida'
        });
      }

      const connected = await this.configService.testConnection(database as 'producao' | 'gescom');

      res.json({
        success: true,
        data: {
          database,
          connected
        }
      });
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao testar conexão'
      });
    }
  };

  testAllConnections = async (req: AuthenticatedRequest, res: Response<ApiResponse<{ producao: boolean; gescom: boolean }>>) => {
    try {
      const result = await this.configService.testAllConnections();

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Erro ao testar conexões:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao testar conexões'
      });
    }
  };

  reloadConfig = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    try {
      this.configService.reloadConfig();
      res.json({
        success: true,
        message: 'Configurações recarregadas com sucesso'
      });
    } catch (error) {
      console.error('Erro ao recarregar configurações:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao recarregar configurações'
      });
    }
  };

  getRawIni = async (req: AuthenticatedRequest, res: Response<ApiResponse<{ content: string; path: string }>>) => {
    try {
      const content = this.configService.getRawIniContent();
      const path = this.configService.getConfigPath();
      
      res.json({
        success: true,
        data: {
          content,
          path
        }
      });
    } catch (error) {
      console.error('Erro ao buscar conteúdo do INI:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar conteúdo do INI'
      });
    }
  };

  saveRawIni = async (req: AuthenticatedRequest, res: Response<ApiResponse>) => {
    try {
      const { content } = req.body;
      
      if (typeof content !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'Conteúdo do INI deve ser uma string'
        });
      }

      this.configService.saveRawIniContent(content);
      
      res.json({
        success: true,
        message: 'Arquivo INI salvo com sucesso'
      });
    } catch (error) {
      console.error('Erro ao salvar INI:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao salvar arquivo INI'
      });
    }
  };
}