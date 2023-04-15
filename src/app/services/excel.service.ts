import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';

import { HttpClient } from '@angular/common/http';
import { Dados, Agg } from '../interfaces/dados';
import { dataParse } from '../utils/dataParse';


@Injectable({
  providedIn: 'root',
})

export class ExcelService {
  constructor(private http: HttpClient) {}

  public async getData(callback: any): Promise<any> {  
    let filePath = '../assets/data.xlsx' 
    
    return await this.http
      .get(filePath, { responseType: 'arraybuffer' })
      .toPromise()
      .then((response: ArrayBuffer | undefined) => {
        if (!response) {
          throw new Error('Nenhum dado recebido da resposta HTTP');
        }
      
        const workbook = XLSX.read(new Uint8Array(response), { type: 'array' });      
        const sheetName = 'Base Questão_31';
        const worksheet = workbook.Sheets[sheetName];

        //converter para array de objetos
        const data: Dados[] = XLSX.utils.sheet_to_json(worksheet, { raw: false });     

        return callback(data)
      });
  }
}
