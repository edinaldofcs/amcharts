export function getYear(num: string): number {
    let ano =
      Number(num.split('/')[2]) < 100
        ? Number(num.split('/')[2]) + 2000
        : Number(num.split('/')[2]);
  
    return ano;
  }