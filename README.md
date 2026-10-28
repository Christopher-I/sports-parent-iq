# Sports Parent IQ — clickable prototype

A five question quiz that scores a parent against ten Sports Parent personalities, gives them a
Sports Parent IQ, names their primary type, and hands them a results card they can save and post.

**This is an unofficial prototype built for KSNN's review. It is not a published KSNN product, and
it uses no KSNN branding, artwork, colours or fonts.** All copy in it is placeholder copy written to
set the tone. The real ten characterisations belong to KSNN.

---

## What it is

- A landing screen, five questions one per screen, and one personalised result screen.
- Every answer carries weight across two to four personalities, so the result reads as a blend
  rather than a label. The result screen names a primary type and the runner-up.
- A shareable results card, exported in the browser as a 1080 × 1920 PNG, sized for an Instagram
  story and for a phone screenshot.
- A "How this is built" panel on the result screen that shows the live JSON behind the question the
  user just answered.

## What is deliberately not in it

This is a sample of the approach, not the finished product. Left out on purpose:

- The other 15 to 20 questions. This is 5.
- Email capture after the result.
- Analytics on starts, completions and shares.
- Integration into the KSNN website.
- A backend, a database, accounts, or any stored data. Nothing a user does is saved anywhere.
- Open Graph image generation and social posting APIs.

## Everything the quiz says and scores lives in one file

`data/quiz.json` holds the ten personalities, the five questions, every weight, the scoring rule,
the score bands and every line of feedback copy. No component contains a question, a weight, a type
name or a sentence of feedback.

To change the quiz, edit that file and redeploy. No code is touched. On Vercel a commit to `main`
redeploys automatically, so in practice this is: edit the file on GitHub, save, done.

The file is checked on load. A bad edit stops the build with a plain sentence saying what is wrong
and where, for example:

```
data/quiz.json has 1 problem(s):
- questions[1].options[2].weights has "scrollerr", which is not a personality id
```

### The scoring rule

```
score = baseScore
      + (total weight on positive personalities × positivePointValue)
      + (total weight on negative personalities × negativePointValue)
```

then rounded and clamped to `minScore`..`maxScore`. Those numbers are all in `data/quiz.json` under
`scoring`, not in the code.

It is deliberately an IQ and not a mark out of a total. It is centred on `averageScore`, and the
result screen marks the average on the scale rather than saying "out of". With the values as
shipped the range runs from 71 to 145, the median path scores 110, and the five bands each get a
real share of the outcomes. A parent who does badly gets a low IQ, which is funny, rather than a
failing grade, which nobody shares.

The primary type is the personality with the highest total weight. Ties are broken by
`scoring.tieBreakOrder`, also in the file. The runner-up becomes the "with a streak of ..." line.

### Shape of the file

| Key | What it controls |
| --- | --- |
| `meta` | Landing copy, the start button, the progress label, the footer, the KSNN link |
| `personalities` | The ten types: name, polarity, blurb, strength, watch-out, feedback lines |
| `questions` | The questions, the answer options, and the weights each option applies |
| `scoring` | Base score, point values, clamps, tie-break order, and the score bands |
| `result` | Every label and template on the result screen |
| `card` | The copy on the shareable card |

## Running it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build
npm run typecheck
```

Requires Node 20.9 or newer. Dependency versions are pinned exactly.

## How it is put together

| Path | What it does |
| --- | --- |
| `data/quiz.json` | All content and all scoring |
| `lib/quiz-types.ts` | The shape of that file |
| `lib/quiz-schema.ts` | Checks the file on load and fails with a readable message |
| `lib/quiz.ts` | The scoring engine. Reads the rule out of the JSON |
| `components/QuizApp.tsx` | Landing → questions → result, one reducer, client side only |
| `components/ShareCard.tsx` | The node that gets rasterised to the PNG |
| `components/HowItWorks.tsx` | The panel that shows the live JSON |

Next.js 16 App Router, TypeScript, Tailwind v4, statically rendered, no API routes. The PNG export
uses `html-to-image` and is loaded on demand so it stays out of the initial bundle.
