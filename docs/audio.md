# Audio

sync.bible can read a chapter aloud, starting from the beginning or from any verse.

- Hover over a chapter title and click the speaker icon to listen to the chapter.
- Hover over a verse and click the speaker icon under the verse number to listen from that verse.
- The player at the bottom of the screen lets you pause, skip chapters, pick a recording, change the speed and carry on to the next chapter automatically.

The code lives in `src/lib/audio` (sources and the player) and `src/components/audio-player` / `src/components/audio-button` (UI).

## Sources

Sources are tried in this order for the version being read. The first one available is used, and the user's choice is remembered per version.

| Source | Versions | Verse level | Needs | Licence |
| --- | --- | --- | --- | --- |
| [openbible.com](https://openbible.com/audio/) | BSB (7 narrators), KJV (2 narrators) | No (chapter files) | Nothing | Public domain |
| [Global Bible Tools](https://github.com/globalbibletools/study-app) | Hebrew OT and Greek NT versions (e.g. Original, WLC, TR, SBLGNT) | Yes | Nothing | Not stated, see below |
| [Bible Brain](https://www.faithcomesbyhearing.com/bible-brain/developer-documentation) | Matches on version abbreviation (e.g. `ENGKJV`), otherwise offers other recordings in the same language | Yes, when the recording has timestamps | Free API key | Free to stream; many recordings are copyrighted, so don't download or cache them |
| Browser text to speech | Every version | Yes | A voice for the language on the device | n/a |

### Global Bible Tools (Hebrew and Greek)

These are the recordings used by the Global Bible Tools study app, streamed from `assets.globalbibletools.com`:

| Recording | Text | Coverage |
| --- | --- | --- |
| Abraham Shmueloff | Hebrew | Whole Old Testament |
| Rabbi Dan Beeri | Hebrew | 29 Old Testament books (some Psalms missing) |
| Theo Karvounakis | Textus Receptus, modern pronunciation | Whole New Testament (except 2 Timothy 4) |
| Jonathan Hohstadt | Statistical Restoration GNT | Matthew |

They're offered for versions whose language is Hebrew (`hbo`) in the Old Testament or Greek (`grc`) in the New Testament. The player notes when the Greek recording reads a different text from the one on screen (for example, the Original NT is Tischendorf's 8th edition).

Their server doesn't send CORS headers, so the browser can play the MP3s but can't read the verse timing files. The timings are copied into `public/audio-timings/gbt` instead. To pick up new recordings, run:

```sh
node scripts/fetch-gbt-audio-timings.js
```

The study app's code is public domain (CC0), but the licence for the recordings isn't stated. Check with Global Bible Tools (contact@ethnos.dev) that they're happy for sync.bible to stream them from their CDN.

### Bible Brain

Bible Brain is only used if an API key is provided at build time:

```sh
VITE_BIBLE_BRAIN_KEY=your-key npm run build
```

For the GitHub Pages deploy, add the key as a repository secret called `BIBLE_BRAIN_KEY`.

Bible Brain uses ISO 639-3 language codes and its own bible ids. `src/lib/audio/languages.js` maps the language codes used in `bible.js`, and `BIBLE_BRAIN_BIBLE_IDS` in `src/lib/audio/sources.js` can be used to pin a version to a specific Bible Brain bible where the abbreviations don't line up.

When the recording is of a different translation than the text on screen, the player says so.

## Other options considered

- **API.Bible (American Bible Society)** – has an audio endpoint and a free key, but only a small number of audio bibles, non-commercial terms and required usage reporting (FUMS).
- **LibriVox / Internet Archive** – public domain volunteer readings of the KJV, ASV, WEB and others. Free, but file naming and chapter splits are inconsistent, so each version would need a hand-built index.
- **eBible.org** – the source of many of the texts in sync.bible, but it offers very little audio.
- **WordProject** – chapter MP3s in about 40 languages, but copyrighted and requires permission to embed.
- **Self hosting** – openbible.com's recordings could be copied to our own storage (they're public domain) if we want to control availability or add verse timings.
