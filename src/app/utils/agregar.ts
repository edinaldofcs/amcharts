import { Dados, Agg } from '../interfaces/dados';

export function agg(data: Dados[]):Agg {
  const agregar: Agg = data.reduce((acc: Agg, obj: Dados) => {
    const key = String(obj.DATA);
    if (!acc[key]) {
      acc[key] = { DATA: key, ALO: 0, CPC: 0, CPCA: 0, PROMESSA: 0, COUNT: 0 };
    }
    acc[key].ALO += Number(obj.ALO);
    acc[key].CPC += Number(obj.CPC);
    acc[key].CPCA += Number(obj.CPCA);
    acc[key].PROMESSA += Number(obj.PROMESSA);
    acc[key].COUNT! += 1;
    return acc;
  }, {});

  return agregar;
}
