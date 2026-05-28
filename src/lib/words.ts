// Common English word pool for typing tests.
const COMMON = `the of and to a in for is on that by this with you it not or be are from at as your all have new more an was we will home can us about if page my has search free but our one other do no information time they site he up may what which their news out use any there see only so his when contact here business who web also now help get pm view online first am been would how were me services some these click its like service than find price date back top people had list name just over state year day into email two health world re next used go work last most products music buy data make them should product system post her city add policy number such please available copyright support message after best software then jan good video well where info rights public books high school through each links she review years order very privacy book items company read group sex need many user said de does set under general research university january mail full map reviews program life know games way days management part could great united real estate item international center ebay must store travel comments made development report off member details line terms before hotels send right type because local those using results office education national car design take posted internet address community within states area want phone film dvd shipping reserved subject between forum family long based code show even black check special prices website index being women much sign file link open today technology south case project same pages uk version section own found sports house related security both county american game members power while care network down computer systems three total place end following download him without per access think north resources current posts big media law control water history pictures size personal since including guide shop directory board location change white text small rating rate government children during usa return students v shopping account times sites level digital profile previous form events love old john main call hours image department title description non insurance another why shall property class cd still money quality every listing content country private little visit save tools low reply customer december compare movies include college value article york man card jobs provide food source author different press u learn sale around print course job canada process teen room stock training too credit point join science men categories advanced west sales look english left team estate box conditions select windows photos gay thread week category note live large gallery table register however june october november market library really action start series model features air industry plan human provided tv yes required second hot accessories cost movie forums march la september better say questions july yahoo going medical test friend come dec server study application cart staff articles san feedback again play looking issues april never users complete street topic comment financial things working against standard tax person below mobile less got blog party payment equipment login student let programs offers legal above recent park stores side act problem red give memory performance social q august quote language story sell options experience rates create key body young america important field few east paper single ii age activities club example girls additional password latest something road gift question changes night ca hard texas oct pay four poker status browse issue range building seller court february always result audio light write war nov offer blue groups al easy given files event release analysis request fax china making picture needs possible might professional yet month major star areas future space committee hand sun cards problems london washington meeting rss become interest id child keep enter california porn share similar garden schools million added reference companies listed baby learning energy run delivery net popular term film stories put clothing marketing christmas mar approach minutes sound manager income share municipal mar pre travel guide list email date order results page time information service system business design member content company support world contact products area number development management products research project market industry team value group health design technology global future power energy education search news mobile online stream digital network server software hardware experience customer process modern simple complete real fast easy clear smart bright sharp clean light heavy strong quick slow steady stable solid true brief deep wide tall short long quiet loud high low front back near far inside outside above below before after during over under between among through across against toward beyond within without above beside near close around behind beneath ahead`
  .split(/\s+/)
  .filter(Boolean);

export const ALPHA_WORDS = Array.from(new Set(COMMON)).filter((w) => /^[a-z]+$/.test(w));

const PUNCT_END = [".", ",", "!", "?", ";", ":"];
const PUNCT_WRAP: Array<[string, string]> = [
  ["(", ")"],
  ["'", "'"],
  ["\"", "\""],
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function maybe(p: number): boolean {
  return Math.random() < p;
}

function withCase(w: string, capitalize: boolean): string {
  return capitalize ? w[0].toUpperCase() + w.slice(1) : w;
}

function withPunctuation(w: string, capitalize: boolean): string {
  let out = withCase(w, capitalize);
  if (maybe(0.08)) {
    const [l, r] = rand(PUNCT_WRAP);
    out = `${l}${out}${r}`;
  }
  if (maybe(0.2)) {
    out += rand(PUNCT_END);
  }
  return out;
}

function randomNumber(): string {
  const len = 1 + Math.floor(Math.random() * 4);
  let s = "";
  for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
  return s;
}

export interface GenerateOptions {
  count: number;
  punctuation?: boolean;
  numbers?: boolean;
}

export function generateWords({ count, punctuation = false, numbers = false }: GenerateOptions): string[] {
  const out: string[] = [];
  let capitalizeNext = punctuation;
  for (let i = 0; i < count; i++) {
    if (numbers && maybe(0.08)) {
      out.push(randomNumber());
      continue;
    }
    const base = rand(ALPHA_WORDS);
    if (punctuation) {
      const w = withPunctuation(base, capitalizeNext);
      capitalizeNext = /[.!?]$/.test(w);
      out.push(w);
    } else {
      out.push(base);
    }
  }
  return out;
}
