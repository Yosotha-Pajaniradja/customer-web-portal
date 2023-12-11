export class CommonUtil {
  static compare(a: any, b: any) {
    if (a < b) {
      return -1;
    } else if (a > b) {
      return 1;
    } else {
      return 0;
    }
  }

  static getMerchantLogoUrl(merchantName: string) {
    switch(merchantName) {
      case 'Backbase':
        return 'assets/icons/backbase.png';
      case 'The Tea Lounge':
        return 'assets/icons/the-tea-lounge.png';
      case 'Texaco':
        return 'assets/icons/texaco.png';
      case 'Amazon Online Store':
        return 'assets/icons/amazon-online-store.png';
      case '7-Eleven':
        return 'assets/icons/7-eleven.png';
      case 'H&M Online Store':
        return 'assets/icons/h&m-online-store.png';
      case 'Jerry Hildreth':
        return 'assets/icons/jerry-hildreth.png';
      case 'Lawrence Pearson':
        return 'assets/icons/lawrence-pearson.png';
      case 'Whole Foods':
        return 'assets/icons/whole-foods.png';
      case 'Southern Electric Company':
        return 'assets/icons/southern-electric-company.png';
      default:
        return 'assets/icons/backbase.png';
    }
  }
}
