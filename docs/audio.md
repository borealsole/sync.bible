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
| [Bible Brain](https://www.faithcomesbyhearing.com/bible-brain/developer-documentation) | Matches on version abbreviation (e.g. `ENGKJV`), otherwise offers other recordings in the same language | Yes, when the recording has timestamps | Free API key | Free to stream; many recordings are copyrighted, so don't download or cache them |
| Browser text to speech | Every version | Yes | A voice for the language on the device | n/a |

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
