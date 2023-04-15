export interface Dados {
  DATA: string;
  ALO: number;
  CPC: number;
  CPCA: number;
  PROMESSA: number;
  COUNT?: number;
  cpc_alos?: number;
  cpca_cpc?: number;
  promessas_cpca?: number;
}

export interface Agg {
  [key: string]: Dados;
}

export interface Generic {
  [key: string]: number;
}
