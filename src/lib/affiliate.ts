/**
 * Barebones 3D - Amazon Associates Affiliate Link Utilities
 * Single source of truth for Amazon affiliate tag and search URL construction.
 * Tag: barebones3dco-20
 */

export const AMAZON_AFFILIATE_TAG = 'barebones3dco-20';

/**
 * Builds a compliant Amazon Associates search URL.
 * Matches format used on hottubheatingelements.com:
 * https://www.amazon.com/s?k=${encodedQuery}&tag=${tag}
 */
export function buildAmazonSearchUrl(query: string, tag: string = AMAZON_AFFILIATE_TAG): string {
  const cleanQuery = query.replace(/[^\w\s#\-./]/g, ' ').replace(/\s+/g, ' ').trim();
  return `https://www.amazon.com/s?k=${encodeURIComponent(cleanQuery)}&tag=${encodeURIComponent(tag)}`;
}

/**
 * Identifies parts that are available in the Amazon catalog at a cheaper price
 * than custom on-demand 3D printing (e.g., commodity mass injection-molded multi-packs).
 */
export function isCheaperOnAmazon(partId: string, oemPartNumber: string, status?: string): boolean {
  return status === 'affiliate_only' ||
    partId === 'part_whirlpool_wheel_w10195416' ||
    oemPartNumber === 'W10195416' ||
    oemPartNumber === 'WPW10195417' ||
    oemPartNumber === '970050-01';
}

const OEM_AFFILIATE_SEARCH_QUERIES: Record<string, string> = {
  'W10195416': 'Whirlpool W10195416 dishwasher rack wheel replacement 8 pack',
  'FL3Z-1651071-A': 'Ford F150 sunroof track repair kit metal synthetic grease',
  '5FS40DX9AA': 'Jeep Grand Cherokee sun visor repair clip bracket metal reinforcement',
  '51459173463': 'BMW E90 dash cup holder assembly replacement driver passenger',
  '89018365': 'Silverado Tahoe HVAC blend door actuator gear cam lever 89018365',
  '969830-01': 'Dyson V10 V11 upgraded heavy duty metal reinforced trigger switch replacement',
  'WP9709231': 'KitchenAid stand mixer worm follower gear 9709231 food grade grease kit',
  'WE1M1067': 'GE dryer drum slide bearing kit WE1M1067 WE1M504 4 pack felt',
  '48-11-1850': 'Milwaukee M18 battery case replacement shell latches springs',
  'N087403': 'DeWalt DWS780 miter saw upgraded dust collection chute adapter',
  '759944-0010': 'Bose QC35 QC45 replacement headband swivel hinge repair parts',
  '00605010': 'Bosch washing machine drain pump filter replacement 00605010 605010',
  '90530948': 'Black Decker string trimmer spool cap replacement 90530948',
  'W10436250': 'Whirlpool refrigerator deli drawer roller wheel W10436250',
  '5012710AA': 'Jeep Grand Cherokee WJ blend door actuator gear 5012710AA',
  'DL3Z-19E616-A': 'Ford F150 blend door actuator gear DL3Z-19E616-A',
  'QC35-HINGE-ASSY': 'Bose QC35 replacement hinge swivel bracket',
  'N447388': 'DeWalt DWS779 DWS780 miter saw dust chute deflector',
  'SFUMM02N04': 'Technics SL-1200 SL-1210 dust cover hinge bracket SFUMM02N04',
  '92011SC022LO': 'Subaru Forester Impreza sun visor clip bracket 92011SC022LO',
  'FL3Z-16502C22-E': 'Ford F150 sunroof track repair kit lift arms FL3Z-16502C22-E',
  '20826188': 'GMT900 blend door actuator cam lever 20826188 Silverado Tahoe',
  'WPW10195417': 'Whirlpool dishwasher lower dishrack wheels 8 pack WPW10195417',
  '970050-01': 'Dyson V10 V11 replacement heavy duty trigger switch with T8 screwdriver',
  '122049-9': 'Makita 18V battery terminal cover protector cap 122049-9',
  '3-255-731-01': 'Sony MDR-7506 replacement slider hanger yoke repair parts'
};

/**
 * Returns the targeted Amazon search query for a part.
 */
export function getPartAmazonSearchQuery(partTitle: string, oemPartNumber: string): string {
  if (OEM_AFFILIATE_SEARCH_QUERIES[oemPartNumber]) {
    return OEM_AFFILIATE_SEARCH_QUERIES[oemPartNumber];
  }
  return `${partTitle} OEM ${oemPartNumber}`;
}
