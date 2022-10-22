export class Utilities {
  static generateAcronym(input: string) {
    if(input) {
      let word = input.split(/\s/);
      return word[0].charAt(0) + (word.length > 1 ? word.slice(-1)[0].charAt(0):'');
    }

    return '';
  }

  static delayActivity(finish_date_activity, finish_real_date_activity) {
    const msInDay = 24 * 60 * 60 * 1000;    
    const finish_date = new Date(finish_date_activity);
  
    if (finish_real_date_activity) {
      const finish_real_date = new Date(finish_real_date_activity);
      if ((Number(finish_real_date) - Number(finish_date)) < 0) {        
        return 0;
      }  
      return Math.round(Math.abs(Number(new Date(finish_real_date)) - Number(new Date(finish_date))) / msInDay);
    } else {
      if ((Number(new Date()) - Number(finish_date)) < 0) {        
        return 0;
      }      
      return Math.round(Math.abs(Number(new Date()) - Number(finish_date)) / msInDay);
    }
  }
}
