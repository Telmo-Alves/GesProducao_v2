// Auto-generated from Firebird metadata. Do not edit manually.

export interface Artigos {
  CODIGO: string | null;
  DESCRICAO: string | null;
  UN_MEDIDA: string | null;
  SITUACAO: string | null;
}

export interface ArtigoEstados {
  ESTADO: number | null;
  DESCRICAO: string | null;
}

export interface Composicoes {
  ID: number | null;
  DESCRICAO: string | null;
  SITUACAO: string | null;
}

export interface FaEntrada {
  FA_SECCAO: number | null;
  FA_NUMERO: number | null;
  FA_DATA: string | null;
  ROLOS: number | null;
  PESOS: number | null;
  OBSERVACOES: string | null;
  ESTADO: number | null;
  PRODUCAO: Date | string | null;
  ROLOS_ENTREGUES: number | null;
  PESOS_ENTREGUES: number | null;
  UTILIZADOR: string | null;
  DATA_REG: string | null;
  ENTREGUE: Date | string | null;
  DT_ENTREGA: string | null;
  FATURADO: Date | string | null;
}

export interface FaMovEntrega {
  FA_SECCAO: number | null;
  FA_NUMERO: number | null;
  LINHA: number | null;
  DATA: string | null;
  MOV_ROLOS: number | null;
  MOV_PESOS: number | null;
  ESTADO: number | null;
  OBSERVACOES: string | null;
  UTILIZADOR: string | null;
  DATA_REG: string | null;
}

export interface FaMovRecepcao {
  FA_SECCAO: number | null;
  FA_DATA: string | null;
  FA_NUMERO: number | null;
  LINHA: number | null;
  MOV_REC_SECCAO: number | null;
  MOV_REC_DATA: string | null;
  MOV_REC_LINHA: number | null;
  MOV_REC_ROLOS: number | null;
  MOV_REC_PESOS: number | null;
}

export interface FaProcessos {
  FA_SECCAO: number | null;
  FA_NUMERO: number | null;
  LINHA: number | null;
  DATA: string | null;
  PROCESSO: number | null;
  COR: number | null;
  ROLOS: number | null;
  PESOS: number | null;
  OBS: string | null;
  UTILIZADOR: string | null;
  DATA_REG: string | null;
}

export interface FichasEntrada {
  FE_NUMERO: number | null;
  FE_DATA: string | null;
  MOV_REC_SECCAO: number | null;
  MOV_REC_DATA: string | null;
  MOV_REC_LINHA: number | null;
  ROLOS: number | null;
  PESOS: number | null;
  OBSERVACOES: string | null;
  ESTADO: number | null;
  PRODUCAO: Date | string | null;
  UTILIZADOR: string | null;
  DATA_REG: string | null;
}

export interface FichasProcessos {
  FE_NUMERO: number | null;
  LINHA: number | null;
  DATA: string | null;
  PROCESSO: number | null;
  COR: number | null;
  ROLOS: number | null;
  PESOS: number | null;
  OBS: string | null;
  UTILIZADOR: string | null;
  DATA_REG: string | null;
}

export interface FichaCor {
  ID: number | null;
  POSICAO: number | null;
  ARTIGO: string | null;
  CLIENTE: number | null;
  CLIENTE_NOME: string | null;
  CODIGO_COR: string | null;
  AMOSTRA: string | null;
  FERVIDO: Date | string | null;
  BRANQUEADO: Date | string | null;
  PROD_AUXILIARES: Date | string | null;
  REL_BANHO: number | null;
  CODIGO_GESCOM: string | null;
  COMPOSICAO: number | null;
}

export interface FichaCorBanhos {
  ID: number | null;
  POSICAO: number | null;
  CODIGO_COR: string | null;
  BANHO: number | null;
  TEMPERATURA: number | null;
  TEMPO: number | null;
  PROCESSO: number | null;
}

export interface FichaCorBanhosAuxiliares {
  ID: number | null;
  POSICAO: number | null;
  CODIGO_COR: string | null;
  BANHO: number | null;
  LINHA: number | null;
  AUXILIAR: string | null;
  QT: number | null;
  PERC: Date | string | null;
}

export interface FichaCorBanhosCorantes {
  ID: number | null;
  POSICAO: number | null;
  CODIGO_COR: string | null;
  BANHO: number | null;
  LINHA: number | null;
  CORANTE: string | null;
  QT: number | null;
  PERC: Date | string | null;
}

export interface FichaEstamparia {
  FE_SECCAO: number | null;
  FE_NUMERO: number | null;
  FE_DATA: string | null;
  FE_REQUISICAO: string | null;
  FA_SECCAO: number | null;
  FA_NUMERO: number | null;
  FA_DATA: string | null;
  FA_REQUISICAO: string | null;
  CLIENTE: number | null;
  ARTIGO: string | null;
  ARTIGO_DESCRICAO: string | null;
  QT_ROLOS: number | null;
  QT_METROS: number | null;
  QT_PESOS: number | null;
  DESENHO: number | null;
  COMBINACOES: number | null;
  LARGURA: number | null;
  GRAMAGEM: number | null;
  TEMPERATURA: number | null;
  ENTREGUE: Date | string | null;
  DATA_ENTREGA: string | null;
  ESTADO: number | null;
  UTILIZADOR: string | null;
  DATA_REG: string | null;
}

export interface FichaEstampariaPartidas {
  FE_SECCAO: number | null;
  FE_NUMERO: number | null;
  PARTIDA: number | null;
  QT_ROLOS: number | null;
  QT_METROS: number | null;
  DESCRICAO: string | null;
}

export interface FichaReceita {
  FA_SECCAO: number | null;
  FA_NUMERO: number | null;
  CODIGO_COR: string | null;
  CLIENTE: number | null;
  PESOS: number | null;
  FCOR_ID: number | null;
  FCOR_POSICAO: number | null;
  MAQUINA: number | null;
  RELACAO_BANHO: number | null;
  VOLUME_BANHO: number | null;
}

export interface FichaReceitaBanhosAuxiliares {
  FA_SECCAO: number | null;
  FA_NUMERO: number | null;
  CODIGO_COR: string | null;
  BANHO: number | null;
  LINHA: number | null;
  AUXILIAR: string | null;
  QT: number | null;
  PERC: Date | string | null;
}

export interface FichaReceitaBanhosCorantes {
  FA_SECCAO: number | null;
  FA_NUMERO: number | null;
  CODIGO_COR: string | null;
  BANHO: number | null;
  LINHA: number | null;
  CORANTE: string | null;
  QT: number | null;
  PERC: Date | string | null;
}

export interface Ibe$todo {
  ITEM_ID: number | null;
  OBJECT_NAME: string | null;
  OBJECT_TYPE: number | null;
  ITEM_PRIORITY: number | null;
  ITEM_STATE: number | null;
  ITEM_CAPTION: string | null;
  ITEM_DESCRIPTION: string | null;
  RESPONSIBLE_PERSON: string | null;
  ITEM_TIMESTAMP: string | null;
  ITEM_DEADLINE: string | null;
  ITEM_CATEGORY: string | null;
  ITEM_OWNER: string | null;
}

export interface Ibe$versionHistory {
  IBE$VH_ID: number | null;
  IBE$VH_MODIFY_DATE: string | null;
  IBE$VH_USER_NAME: string | null;
  IBE$VH_OBJECT_TYPE: number | null;
  IBE$VH_OBJECT_NAME: string | null;
  IBE$VH_HEADER: string | null;
  IBE$VH_BODY: string | null;
  IBE$VH_CLIENT_ADDRESS: string | null;
  IBE$VH_DESCRIPTION: string | null;
}

export interface MaqDados {
  MAQUINA: number | null;
  CARGA_MIN: number | null;
  CARGA_MAX: number | null;
  TEMPO_MIN: number | null;
  TEMPO_MAX: number | null;
}

export interface MaqLeituras {
  N_REGISTO: number | null;
  DATA: string | null;
  TERMINAL: string | null;
  MAQUINA: number | null;
  OPERACAO: number | null;
  FA_NUMERO: number | null;
  PROCESSO: number | null;
  INTEGRADO: Date | string | null;
  UTILIZADOR: string | null;
  DATA_REG: string | null;
}

export interface MovRecepcao {
  SECCAO: number | null;
  DATA: string | null;
  LINHA: number | null;
  CLIENTE: number | null;
  NOME: string | null;
  CODIGO: number | null;
  DESCRICAO: string | null;
  COMPOSICAO: number | null;
  COMPOSICAO_DESCRICAO: string | null;
  ROLOS: number | null;
  PESOS: number | null;
  GRAMAGEM: number | null;
  MEDIDAS: number | null;
  BRANQUEAR: Date | string | null;
  DESENCOLAR: Date | string | null;
  TINGIR: Date | string | null;
  ROLOS_ENTREGUES: number | null;
  PESOS_ENTREGUES: number | null;
  REQUISICAO: string | null;
  UTILIZADOR: string | null;
  DATA_REG: string | null;
}

export interface MovStock {
  DATA: string | null;
  SIGLA: string | null;
  NUMERO: number | null;
  LINHA: number | null;
  CODIGO: string | null;
  COMPOSICAO: number | null;
  QT_ENTRADA: number | null;
  QT_SAIDA: number | null;
  QT_ENTRADA2: number | null;
  QT_SAIDA2: number | null;
  CLIENTE: number | null;
  DOC_EXTERNO: string | null;
  MOV_SAIDA: number | null;
  UTILIZADOR: string | null;
  F_PROCESSO: string | null;
}

export interface Situacoes {
  SITUACAO: string | null;
  BLOQUEADO: Date | string | null;
  MOV_STOCK: Date | string | null;
  MOV_CC: Date | string | null;
  DESCRICAO: string | null;
}

export interface TabArtigos {
  CODIGO: number | null;
  DESCRICAO: string | null;
  UN_MEDIDA: string | null;
  SITUACAO: string | null;
  SECCAO: number | null;
}

export interface TabAuxiliares {
  ID: number | null;
  AUXILIAR: string | null;
  DESCRICAO: string | null;
  SITUACAO: string | null;
  PERC: Date | string | null;
}

export interface TabClientes {
  CLIENTE: number | null;
  NOME: string | null;
  CONTACTOS: string | null;
  SITUACAO: string | null;
}

export interface TabComposicoes {
  COMPOSICAO: number | null;
  DESCRICAO: string | null;
  SITUACAO: string | null;
}

export interface TabCorantes {
  CORANTE: string | null;
  DESCRICAO: string | null;
  REF_FORN: string | null;
  SITUACAO: string | null;
  REATIVOS: Date | string | null;
  DISPERSOS: Date | string | null;
  DIRETOS: Date | string | null;
  A_D_S: Date | string | null;
  CLASSIFICACAO: string | null;
  PERC: Date | string | null;
}

export interface TabCores {
  ID: number | null;
  CODIGO_COR: string | null;
  MALHA: string | null;
  REATIVOS: Date | string | null;
  DIRETOS: Date | string | null;
  DISPERSOS: Date | string | null;
  PCUSTO: number | null;
  SITUACAO: string | null;
  CLASSIFICACAO: string | null;
}

export interface TabDesenhos {
  DESENHO: number | null;
  DESCRICAO: string | null;
  CLIENTE: number | null;
  DESENHO_ESTAMPADO: string | null;
  DESENHO_AMOSTRA: string | null;
  LOTE: string | null;
}

export interface TabEstados {
  ID: number | null;
  DESCRICAO: string | null;
  MOVIMENTA: Date | string | null;
  SITUACAO: string | null;
}

export interface TabMaquinas {
  MAQUINA: number | null;
  DESCRICAO: string | null;
  OBSERVACOES: string | null;
  SITUACAO: string | null;
  SECCAO: number | null;
  ORDEM: number | null;
}

export interface TabOperacoes {
  OPERACAO: number | null;
  DESCRICAO: string | null;
  MAQUINA: Date | string | null;
  ENTRADA: Date | string | null;
  SAIDA: Date | string | null;
  ENTREGA: Date | string | null;
  LIXO: Date | string | null;
}

export interface TabProcessos {
  ID: number | null;
  DESCRICAO: string | null;
  ORDEM: number | null;
  ID_PAI: number | null;
  SITUACAO: string | null;
  USA_COR: Date | string | null;
  ESTAMPARIA: Date | string | null;
}

export interface TabProcessosTinturaria {
  ID: number | null;
  DESCRICAO: string | null;
  ORDEM: number | null;
  SITUACAO: string | null;
}

export interface TabRelMaqProc {
  MAQUINA: number | null;
  PROCESSO: number | null;
  SITUACAO: string | null;
}

export interface TabSeccoes {
  SECCAO: number | null;
  DESCRICAO: string | null;
  ORDEM: number | null;
  SITUACAO: string | null;
}

export interface TabTerminais {
  TERMINAL: string | null;
  MAQUINA: number | null;
}

export interface TabUtilizadores {
  UTILIZADOR: string | null;
  SENHA: string | null;
  NIVEL: number | null;
  VALIDADE: string | null;
  ULTIMO_LOGIN: string | null;
  NR_LOGINS: number | null;
  SECCAO: number | null;
  ADMINISTRADOR: Date | string | null;
}

export interface UnMedidas {
  UN_MEDIDA: string | null;
  DESCRICAO: string | null;
  MEDIDA: number | null;
}

