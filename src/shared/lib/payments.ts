const NAMES: Record<string, string> = {
  monobank: 'Monobank',
  privatbank: 'ПриватБанк',
  abank: 'A-Bank',
  pumb: 'ПУМБ',
  oschadbank: 'Ощадбанк',
  raiffeisen: 'Raiffeisen',
  raiffeisenaval: 'Raiffeisen',
  raiffeisenbank: 'Raiffeisen',
  sense: 'Sense Bank',
  otpbank: 'OTP Bank',
  ukrsibbank: 'UKRSIBBANK',
  izibank: 'izibank',
  sportbank: 'Sportbank',
  kredobank: 'Кредобанк',
  tascombank: 'ТАСкомбанк',
  ukrgasbank: 'Укргазбанк',
  ukreximbank: 'Укрексімбанк',
  creditagricole: 'Credit Agricole',
  crditagricole: 'Credit Agricole',
  unicreditbank: 'UniCredit',
  pravexbank: 'Правекс Банк',
  procreditbank: 'ProCredit Bank',
  ideabank: 'Idea Bank',
  accordbank: 'Акордбанк',
  radabank: 'Радабанк',
  bankvostok: 'Банк Восток',
  bankpivdenny: 'Банк Південний',
  forwardbank: 'Forward Bank',
  crystalbank: 'Кристалбанк',
  creditdnipro: 'Кредит Дніпро',
  bankcreditdnipro: 'Кредит Дніпро',
  bankcreditdnepro: 'Кредит Дніпро',
  alliancecard: 'Банк Альянс',
  alliance: 'Банк Альянс',
  bankvlasnyirakhunok: 'Банк Власний Рахунок',
  bankvlasnyi: 'Банк Власний Рахунок',
  unexbank: 'Unex Bank',
  neo: 'NEO Bank',
  geopay: 'GEO Pay',
  bnpparibas: 'BNP Paribas',
  wise: 'Wise',
  revolut: 'Revolut',
  monzo: 'Monzo',
  zen: 'ZEN',
  blik: 'BLIK',
  westernunion: 'Western Union',
  sepa_instant: 'SEPA Instant',
  sepaeubanktransfer: 'SEPA',
  sep: 'СЕП НБУ',
  bank: 'Банківський переказ',
  banktransfer: 'Банківський переказ',
  cashinperson: 'Готівка',
  cashdeposittobank: 'Готівка через касу банку',
  mobiletopup: 'Поповнення мобільного',
  iban: 'IBAN',
}

const POPULAR = ['monobank', 'privatbank', 'abank', 'pumb', 'oschadbank', 'raiffeisen', 'sense']

function capitalize(code: string) {
  return code.charAt(0).toUpperCase() + code.slice(1)
}

export function paymentLabel(code: string) {
  const known = NAMES[code]
  if (known) return known
  for (const suffix of ['_iban', 'iban']) {
    if (!code.endsWith(suffix)) continue
    const base = code.slice(0, -suffix.length)
    return `${NAMES[base] ?? capitalize(base)} IBAN`
  }
  return capitalize(code)
}

export function sortPayments(codes: string[]) {
  const rank = (code: string) => {
    const index = POPULAR.indexOf(code)
    return index === -1 ? POPULAR.length : index
  }
  return [...codes].sort(
    (a, b) => rank(a) - rank(b) || paymentLabel(a).localeCompare(paymentLabel(b), 'uk'),
  )
}
