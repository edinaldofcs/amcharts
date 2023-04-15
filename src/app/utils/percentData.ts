import { Dados } from '../interfaces/dados';
import { agg } from './agregar';
import { getYear } from './getYear';

export function percentParse(data: Dados[]) {
  const agregar = agg(data);

  const finalData = Object.keys(agregar).map((key) => {
    const data = agregar[key]!.DATA;
    let ano = getYear(data);
    const mes = data.split('/')[0];
    const dia = data.split('/')[1];
    return {
      date: new Date(`${ano}-${mes}-${dia}`).getTime(),
      ALO: agregar[key].ALO,
      CPC: agregar[key].CPC,
      CPCA: agregar[key].CPCA,
      PROMESSA: agregar[key].PROMESSA,
      cpc_alos: (agregar[key].CPC / agregar[key].ALO) * 100,
      cpca_cpc: (agregar[key].CPCA / agregar[key].CPC) * 100,
      promessas_cpca: (agregar[key].PROMESSA / agregar[key].CPCA) * 100,
    };
  });

  return finalData;
}
