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
  const recent: string[] = [];
  const WINDOW = 8;
  let capitalizeNext = punctuation;
  for (let i = 0; i < count; i++) {
    if (numbers && maybe(0.08)) {
      out.push(randomNumber());
      continue;
    }
    let base = rand(ALPHA_WORDS);
    // avoid immediate repeats within a small sliding window
    let guard = 0;
    while (recent.includes(base) && guard++ < 10) base = rand(ALPHA_WORDS);
    recent.push(base);
    if (recent.length > WINDOW) recent.shift();

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

// ---------- Quotes ----------
// All quotes are original sentences written for this project (no third-party text).
// Length categories follow Monkeytype's convention: short / medium / long / thicc.
export type QuoteCategory = "all" | "short" | "medium" | "long" | "thicc";

const SHORT_QUOTES: string[] = [
  "A calm mind types faster than an anxious one and lasts much longer.",
  "Practice does not make perfect; honest practice makes you a little better.",
  "Smooth keystrokes come from breath, not from clenched and aching fingers.",
  "Speed is a side effect of accuracy, not the other way around at all.",
  "Read the next word before your hands have finished the current one.",
  "Rest the wrists, soften the shoulders, then let the rhythm carry you forward.",
  "A clean room is a clean mind, and a clean mind types clean code.",
  "Mistakes are simply notes; learn from them and they will quietly disappear.",
  "Begin slowly, end smoothly, and the timer will surprise you in good ways.",
  "Type the word you see, not the word you expected to see there.",
  "Patience builds the floor your speed will later stand on without shaking.",
  "Confidence at the keyboard is built by tiny wins repeated every quiet morning.",
  "Tense fingers hit wrong keys; relaxed fingers find the right ones naturally.",
  "Every test is just a snapshot, not a verdict on who you are.",
  "Eyes ahead, hands behind, and the words will appear before you ask.",
  "Slow is smooth, and smooth becomes fast when nobody is watching the clock.",
  "Mind the gaps between words; the spaces are part of the rhythm too.",
  "Posture comes first, then your hands, then the words you decide to chase.",
  "Looking at the keys is the longest possible way from here to there.",
  "Warm up your fingers before warming up your ego at the keyboard today.",
  "A good chair is worth a hundred lessons in proper typing technique.",
  "If a word breaks you, walk through it letter by letter until it bends.",
  "Trust the muscle memory; the brain is only there to choose the words.",
  "Take pride in the boring parts; that is where real speed quietly hides.",
  "Loud keys do not type faster, they only annoy the people around you.",
  "When you slow down on hard words, you save the time you would lose recovering.",
  "Comfort first, accuracy second, and let raw speed find you on its own.",
  "Type with the whole hand, not with the index fingers of a tourist.",
  "Small daily reps beat one heroic session you will never repeat again.",
  "The keyboard rewards consistency the way a garden rewards a patient gardener.",
  "Forget the leaderboard for a week and notice how much your typing improves.",
  "If your shoulders are at your ears, your fingers cannot truly be free.",
  "Read in chunks of three or four words and the rhythm will follow.",
  "A clean restart is better than a messy push through a broken word.",
  "Soft hands, soft keys, soft mistakes; nothing about this needs to be hard.",
  "The right word at the right tempo feels better than the fastest one.",
  "Look once, type once, and trust that your fingers were paying attention.",
  "Errors are feedback, not failure, and feedback is the only way you improve.",
  "Find your own pace before you try to chase someone else's record.",
  "A test ends in a minute; the habits you build will outlast everything.",
];

const MEDIUM_QUOTES: string[] = [
  "There is a strange comfort in the steady click of a keyboard on a quiet evening; it feels like work and rest at the same time, two halves of the same calm afternoon.",
  "Typing is less about your fingers than about your eyes; once you learn to read a little further ahead than you write, the hands always seem to know exactly what to do next.",
  "Most people try to type faster by hurrying their hands, but the secret is to slow the thinking down until each word feels obvious before your fingers ever touch a key.",
  "The keyboard does not care how tired you are, how late it is, or how badly the last test went; it only responds to the next keystroke, and that is honestly a kind of mercy.",
  "Speed is a strange thing to chase; the harder you grab for it the more it slips away, and the more you ignore it the more it seems to sit quietly beside you the entire time.",
  "Every typist eventually discovers the same boring truth: the road to a hundred words a minute is paved with thousands of small corrections you barely noticed at the time.",
  "If you only practice the words that already feel comfortable, you will only ever be comfortable at the speed you are at right now, never one keystroke beyond it.",
  "There is a difference between typing quickly and typing well, and after enough hours at a keyboard you start to prefer the second one even when nobody else can tell.",
  "The best part of a typing test is the moment right before it starts, when the cursor blinks and nothing has gone wrong yet and every word still seems possible.",
  "Accuracy is the quiet foundation under every fast typist; lose it for a single test and you will spend the next ten trying to find your rhythm again from scratch.",
  "When the fingers are loose and the mind is calm, words come through the keyboard the way water comes through a tap, one steady stream with no thought behind it.",
  "It is strange how much your typing changes with your mood; a worried hour can cost you fifteen words a minute, and a cheerful one can give them straight back.",
  "Stop trying to win every test; some sessions are meant to be lost, examined, forgiven, and quietly used as the ground on which the next better session will stand.",
  "A good typing habit is built the same way a good morning is built: with small kind choices repeated until they become so ordinary you forget you ever had to choose.",
  "There is a particular satisfaction in finishing a long passage cleanly, no backspaces, no panic, no scrambled fingers, just a quiet ending and a number you can be proud of.",
  "Children learn to type by hammering one key at a time; the rest of us forget that beginnings are allowed to be slow, and we punish ourselves for not being instantly graceful.",
  "Try this experiment: take a familiar paragraph and type it at half your usual speed with perfect accuracy; you will probably find that half speed is still faster than you expected.",
  "Your hands have been learning to type since the first time you touched a phone; trust them a little more, watch them a little less, and the words will arrive much sooner.",
  "The strange thing about repetition is that it is never really repetition; the tenth time you type a sentence is built on lessons the first nine could not possibly have known.",
  "If you want to type smoothly under pressure, practice typing smoothly without pressure first; the body cannot perform on stage what it has not rehearsed in private many quiet times.",
  "Most typing mistakes happen a moment before the keys are pressed, in the small flicker where attention slips; bring the attention back and the fingers will follow it home.",
  "The keyboard is a mirror; if your day has been chaotic, your typing will be chaotic too, and there is no real point in pretending the two things are unrelated to each other.",
  "Learning to type without looking is one of those small adult skills that feels useless until the moment it becomes essential, and then you wonder how you ever lived without it.",
  "A good typist is not someone who never makes mistakes, but someone who has learned to keep moving forward when a mistake quietly happens behind them on the line above.",
  "Set a timer for five minutes and type something you actually care about; the test stops being a test and quietly becomes the only kind of practice that ever really sticks.",
  "There is a kind of grace in hitting the space bar with the right thumb at exactly the right moment, a small invisible discipline that holds entire paragraphs together for you.",
];

const LONG_QUOTES: string[] = [
  "When I first started timing my typing tests I treated every result like an exam grade, and the numbers ruled my afternoons; a good one made me cheerful for an hour, a bad one made the rest of the day feel a little dimmer than it had any right to be. It took an embarrassingly long time to realise that the number on the screen was not really me, and that the only useful measurement was whether I felt slightly more in control of the keyboard than I had the day before. Once I let go of the score, the score quietly went up on its own, which was both annoying and a little funny in the way most lessons about effort eventually turn out to be in the end.",
  "There is a particular kind of evening, usually somewhere around the middle of the week, when the apartment is quiet and the lamp is on and nothing in particular needs to be done; on those evenings I sit down at the keyboard not to practice or to improve but simply to type, the way other people might pick up a guitar or shuffle a deck of cards. The words do not need to be important and the test does not need to be won; there is just the soft sound of the keys, the rhythm of my own breathing settling into them, and the strange comfortable feeling of being a person who has chosen, for a few minutes at least, to do exactly one ordinary thing very well.",
  "If you watch a fast typist closely, the most striking thing is not the speed of the fingers but the stillness of everything else; the shoulders do not move, the head does not bob, the eyes track gently along the line as if they were reading a book on a Sunday afternoon. The hands look almost lazy, hovering over the keys with a kind of practiced patience, and yet entire sentences appear on the screen between blinks. It is the calmest kind of speed, the sort that does not look like speed at all from the outside, and it is built not by trying harder but by gradually removing every small unnecessary motion until only the necessary ones remain quietly behind.",
  "The cruel joke of typing practice is that the moment you start paying close attention to your hands they immediately stop knowing what to do; the very effort to control them ruins the effortless thing you were trying to control. Skilled typists learn a strange trick that takes years to trust: they pay attention to the words, not the fingers, and then they let the fingers respond to the words as if the fingers were a separate and very competent small animal that has lived with them for a long time. It feels like giving up control, and that is exactly the point, because the kind of control that helps here is the kind that knows when to step out of the way.",
  "I used to think a typing test was about proving something, mostly to myself, and so every result felt loaded with meaning it did not actually have to carry; a slow one was a personal insult, a fast one was a small private victory I could not really share with anyone. These days the test feels more like a short meditation: I sit down, I breathe out once, I read the first word, and the next two minutes pass in a small bubble where nothing exists except the screen and the rhythm of the keys. The score, when it appears, is interesting but no longer urgent; it is information, not identity, and that distinction has quietly changed how I feel about doing the test at all.",
  "One of the small joys of learning to type well is that it teaches you, almost by accident, how to do other things well too; the patience it takes to slow down on a hard word turns out to be the same patience that helps you read a difficult page or have a difficult conversation. The willingness to begin again after a bad test is the same willingness that gets you to the gym on a tired morning or back to a project after a discouraging week. The keyboard becomes a kind of small training ground for the larger habits of attention and recovery that quietly hold the rest of your days together when you are not looking.",
  "The most useful piece of advice I ever received about typing came from a friend who was not particularly fast but was remarkably steady; she told me that the goal was not to hit the right key, but to be in the right place to hit it, and that almost all errors were really errors of position rather than of speed. I did not understand what she meant for a long time, and then one quiet afternoon, with my hands resting properly on the home row for the first time in months, I felt the difference; the keys seemed to come to my fingers rather than my fingers chasing the keys, and I finally understood that good typing is mostly about waiting in the right place until the right moment arrives.",
];

const THICC_QUOTES: string[] = [
  "There is a particular kind of pleasure in becoming quietly competent at something nobody else considers important. Typing is one of those things; almost everyone does it, almost nobody thinks about it, and so the small craft of doing it well lives in a quiet corner of your day where no one will ever congratulate you for the work you put in. You will not be praised at dinner parties for your low error rate, and no one is going to write a recommendation letter about the way your right thumb finds the space bar. And yet over the months and years a strange thing happens; the keyboard stops being a barrier between your thoughts and the screen, and starts being a kind of invisible extension of the way you think. Words appear almost as quickly as you imagine them, and you realise, with a small surprise, that you have built yourself a tiny private superpower out of nothing more than patience and a handful of minutes a day.",
  "If I could give one piece of advice to a younger version of myself about practicing anything, including typing, it would be this: stop trying to feel like you are improving, and start trying to do the work that improvement actually requires. The feeling of improvement is a slippery and unreliable guide; some of the days that felt like breakthroughs were really just lucky tests on familiar words, and some of the days that felt like failures were quietly laying down the foundations of the next year of progress. The body and the brain do not care whether you are entertained by the process; they care only about whether you have done the repetitions, paid attention while you did them, and given yourself enough sleep and food and kindness to consolidate them overnight. If you can keep showing up for the work without demanding that the work also constantly reward you with the sensation of getting better, you will, very gradually and very reliably, actually get better.",
  "The first time I broke a hundred words a minute, I expected to feel different, in the way you expect to feel different on a birthday and then quietly do not. What I felt instead was something closer to gratitude; not for the number, but for the long unremarkable string of evenings that had silently led up to it, the dozens of tests I had abandoned in frustration, the hundreds I had finished with mediocre scores I never showed anyone, the slow rebuilding of habits I had picked up wrong as a teenager and stubbornly carried into adulthood. The number on the screen was not really an achievement so much as a receipt, a small printed reminder that all those evenings had actually happened, that the work had been real even when it had felt invisible. And then I closed the tab, made a cup of tea, and went back to doing the same thing I had been doing the day before, because the only honest response to a small milestone is to keep walking past it toward the next one.",
];

const ALL_QUOTES: string[] = [
  ...SHORT_QUOTES,
  ...MEDIUM_QUOTES,
  ...LONG_QUOTES,
  ...THICC_QUOTES,
];

// Avoid repeating the same quote back-to-back per category.
const recentByCategory: Record<QuoteCategory, string[]> = {
  all: [],
  short: [],
  medium: [],
  long: [],
  thicc: [],
};

function poolFor(category: QuoteCategory): string[] {
  switch (category) {
    case "short": return SHORT_QUOTES;
    case "medium": return MEDIUM_QUOTES;
    case "long": return LONG_QUOTES;
    case "thicc": return THICC_QUOTES;
    default: return ALL_QUOTES;
  }
}

export function generateQuote(category: QuoteCategory): { words: string[]; source: string; category: QuoteCategory } {
  const pool = poolFor(category);
  const recent = recentByCategory[category];
  const maxRecent = Math.min(Math.floor(pool.length / 2), 8);

  let pick = pool[Math.floor(Math.random() * pool.length)];
  let guard = 0;
  while (recent.includes(pick) && guard++ < 20) {
    pick = pool[Math.floor(Math.random() * pool.length)];
  }
  recent.push(pick);
  if (recent.length > maxRecent) recent.shift();

  return { words: pick.split(/\s+/), source: pick, category };
}
