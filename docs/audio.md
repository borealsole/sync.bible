# Audio

sync.bible can read a chapter aloud, starting from the beginning or from any verse, depending on the bible version and audio files available.
Some have verse timings, others don't.

- Hover over a chapter title and click the speaker icon to listen to the chapter.
- Hover over a verse and click the speaker icon under the verse number to listen from that verse.
- The speaker icons only appear when there's something to play: a recording for the version, or a text-to-speech voice for its language on the device.
- The player at the bottom of the screen lets you pause, skip chapters, pick a recording, change the speed and carry on to the next chapter automatically.

The code lives in `src/lib/audio` (sources and the player) and `src/components/audio-player` / `src/components/audio-button` (UI).

## Sources

Sources are tried in this order for the version being read. The first one available is used, and the user's choice is remembered per version.

| Source | Versions | Verse level | Needs | Licence |
| --- | --- | --- | --- | --- |
| [openbible.com](https://openbible.com/audio/) | BSB (7 narrators), KJV (2 narrators) | No (chapter files) | Nothing | Public domain |
| [Global Bible Tools](https://github.com/globalbibletools/study-app), hosted on our CloudFront | Hebrew OT and Greek NT versions (e.g. Original, WLC, TR, SBLGNT) | Yes | Nothing | Hosted with Global Bible Tools' permission, see below |
| Browser text to speech | Every version, where the device has a voice for its language | Yes | A voice for the language on the device | n/a |

### Global Bible Tools (Hebrew and Greek)

These are the recordings used by the Global Bible Tools study app. We have permission to host a copy in our own private S3 bucket, served through CloudFront. The bucket is private and only the CloudFront distribution can read it. We will keep an eye on usage and adjust approach if usage is too costly.

| Recording | Text | Coverage |
| --- | --- | --- |
| Abraham Shmueloff | Hebrew | Whole Old Testament |
| Rabbi Dan Beeri | Hebrew | 29 Old Testament books |
| Theo Karvounakis | Textus Receptus, modern pronunciation | Whole New Testament |
| Jonathan Hohstadt | Statistical Restoration GNT | Matthew |

They're offered for versions whose language is Hebrew (`hbo`) in the Old Testament or Greek (`grc`) in the New Testament. The player notes when the Greek recording reads a different text from the one on screen (for example, the Original NT is Tischendorf's 8th edition).

To pick up new or updated recordings from Global Bible Tools:

```sh
# Copy any new books into the bucket (needs AWS credentials for the bucket)
scripts/mirror-gbt-audio.sh <bucket> <aws-profile>

# Update the verse timings the app uses, then commit public/audio-timings
node scripts/fetch-gbt-audio-timings.js
```

The verse timings live in `public/audio-timings/gbt` so the player doesn't need CORS access to the bucket.

To keep costs down, a CloudFront Function (`cloudfront/block-audio-hotlinking.js`, deployed as `sync-bible-block-audio-hotlinking` on the viewer request of the distribution) returns 403 when another website embeds the audio. Requests from sync.bible, localhost and requests with no Referer are allowed. To change it, update the code in CloudFront, test it, then publish it.

The study app's code is public domain (CC0), and Global Bible Tools (contact@ethnos.dev) are happy for sync.bible to host and serve copies of the audio files, most of which are public domain.

#### Christophe Rico (awaiting permission)

Global Bible Tools also publish Christophe Rico's Greek readings of 12 New Testament books (recording id `PCR`). These are owned by the Polis Institute (polisjerusalem.org), and hosting copies needs approval from its Executive Committee, which we are requesting. Until it's approved they are not in the bucket or the app, and `PCR` is excluded in both `scripts/mirror-gbt-audio.sh` and `scripts/fetch-gbt-audio-timings.js`. If permission is granted, remove it from those exclusion lists, re-run both scripts, and add the recording back to `GBT_RECORDINGS` in `src/lib/audio/sources.js`.

## Other options considered

- **Bible Brain (Faith Comes By Hearing)** – audio in 1,800+ languages, some with verse timestamps, but it needs an API key and our key request went unanswered. Support for it was removed; it could be added back if a key becomes available.
- **API.Bible (American Bible Society)** – has an audio endpoint and a free key, but only a small number of audio bibles, non-commercial terms and required usage reporting (FUMS).
- **LibriVox / Internet Archive** – public domain volunteer readings of the KJV, ASV, WEB and others. Free, but file naming and chapter splits are inconsistent, so each version would need a hand-built index.
- **WordProject** – chapter MP3s in about 40 languages, but copyrighted and requires permission to embed.
- **Self hosting** – openbible.com's recordings could be copied to our own storage (they're public domain) if we want to control availability or add verse timings.
