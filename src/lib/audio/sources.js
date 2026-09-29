// Internal
import bible from '../../data/bible.js';
import {
	getBookIndex,
	OPENBIBLE_CODES,
	USFM_CODES,
	isOldTestament,
} from './books';
import { getVersionLanguage, toIso6393, toSpeechLanguage } from './languages';

/**
 * Audio sources.
 *
 * Each source describes one recording (or the device voice) for a version:
 * {
 *   id: string,            unique id, used to remember the chosen source
 *   label: string,         shown in the player
 *   attribution: string,   credit / licence shown in the player
 *   type: 'file' | 'speech',
 *   exactMatch: boolean,   true when the recording is of the same translation as the text
 *   getChapter: async ( { book, chapter } ) => ( { url, timestamps } ) // type 'file' only
 *   lang: string,          BCP 47 language for the speech synthesiser // type 'speech' only
 * }
 *
 * `timestamps` is an optional map of verse number to start time in seconds,
 * which lets the player start from, and highlight, a particular verse.
 */

/**
 * openbible.com - public domain chapter recordings of the Berean Standard Bible
 * and the King James Version. No API key is required and the files are served
 * directly, so these work anywhere an <audio> element does.
 * https://openbible.com/audio/
 */
const OPENBIBLE_BASE_URL = 'https://openbible.com/audio/';
const OPENBIBLE_RECORDINGS = {
	BSB: [
		{ folder: 'souer', suffix: '', narrator: 'Bob Souer' },
		{ folder: 'hays', suffix: '_H', narrator: 'Barry Hays' },
		{ folder: 'gilbert', suffix: '_G', narrator: 'Jordan Gilbert' },
		{ folder: 'david', suffix: '_D', narrator: 'David' },
		{ folder: 'arabella', suffix: '_A', narrator: 'Arabella' },
		{ folder: 'sophia', suffix: '_S', narrator: 'Sophia' },
		{
			folder: 'bsb_frederick_surrey',
			suffix: '_FS',
			narrator: 'Frederick Surrey',
		},
	],
	KJV: [
		{ folder: 'kjv', suffix: '', narrator: null },
		{ folder: 'kjv_sophia', suffix: '_S', narrator: 'Sophia' },
	],
};

function getOpenBibleSources( version ) {
	const recordings = OPENBIBLE_RECORDINGS[ version ] || [];
	return recordings.map( ( { folder, suffix, narrator } ) => ( {
		id: `openbible:${ folder }`,
		label: narrator
			? `${ version } read by ${ narrator }`
			: `${ version } (openbible.com)`,
		attribution: 'Public domain audio from openbible.com',
		type: 'file',
		exactMatch: true,
		getChapter: async ( { book, chapter } ) => {
			const bookIndex = getBookIndex( book );
			const bookNumber = String( bookIndex + 1 ).padStart( 2, '0' );
			const chapterNumber = String( chapter ).padStart( 3, '0' );
			return {
				url: `${ OPENBIBLE_BASE_URL }${ folder }/${ version }_${ bookNumber }_${ OPENBIBLE_CODES[ bookIndex ] }_${ chapterNumber }${ suffix }.mp3`,
				timestamps: null,
			};
		},
	} ) );
}

/**
 * Bible Brain (Faith Comes By Hearing) - audio in 1,800+ languages, with verse
 * timestamps for many recordings. Needs a free API key from
 * https://www.faithcomesbyhearing.com/bible-brain/developer-documentation
 * set as VITE_BIBLE_BRAIN_KEY at build time. Many recordings are copyrighted and
 * licensed for streaming only, so they must not be downloaded or cached.
 */
const BIBLE_BRAIN_API = 'https://4.dbt.io/api';
const BIBLE_BRAIN_KEY = import.meta.env.VITE_BIBLE_BRAIN_KEY;

// Explicit Bible Brain bible ids for versions where the abbreviations don't line up.
// e.g. WEB: 'ENGWEB'
const BIBLE_BRAIN_BIBLE_IDS = {};

const bibleBrainCache = new Map();

async function bibleBrainFetch( path, params = {} ) {
	const query = new URLSearchParams( {
		v: '4',
		key: BIBLE_BRAIN_KEY,
		...params,
	} );
	const url = `${ BIBLE_BRAIN_API }${ path }?${ query }`;
	if ( ! bibleBrainCache.has( url ) ) {
		bibleBrainCache.set(
			url,
			fetch( url ).then( ( response ) => {
				if ( ! response.ok ) {
					throw new Error(
						`Bible Brain request failed (${ response.status })`
					);
				}
				return response.json();
			} )
		);
	}

	try {
		return await bibleBrainCache.get( url );
	} catch ( error ) {
		bibleBrainCache.delete( url );
		throw error;
	}
}

// Does a fileset contain audio for this book? Sizes are C (complete), OT, NT, or partial (OTP, NTP, P).
function filesetCoversBook( fileset, book ) {
	const testament = isOldTestament( book ) ? 'OT' : 'NT';
	return [ 'C', testament, testament + 'P', 'P' ].includes( fileset.size );
}

function getAudioFilesets( bibleData, book ) {
	const filesets = Object.values( bibleData.filesets || {} ).flat();
	return filesets
		.filter(
			( fileset ) =>
				[ 'audio', 'audio_drama' ].includes( fileset.type ) &&
				filesetCoversBook( fileset, book )
		)
		.sort( ( a, b ) => {
			// Prefer complete (non partial) and non dramatised recordings.
			const score = ( fileset ) =>
				( fileset.size.endsWith( 'P' ) ? 2 : 0 ) +
				( fileset.type === 'audio_drama' ? 1 : 0 );
			return score( a ) - score( b );
		} );
}

async function getBibleBrainSources( version, book ) {
	if ( ! BIBLE_BRAIN_KEY ) {
		return [];
	}

	const language = toIso6393( getVersionLanguage( version, book ) );
	if ( ! language ) {
		return [];
	}

	let bibles;
	try {
		const response = await bibleBrainFetch( '/bibles', {
			language_code: language,
			media: 'audio',
			limit: '100',
		} );
		bibles = response.data || [];
	} catch ( error ) {
		console.warn( error );
		return [];
	}

	const versionId = version.toUpperCase();
	const matchesVersion = ( bibleData ) => {
		if ( BIBLE_BRAIN_BIBLE_IDS[ version ] ) {
			return bibleData.abbr === BIBLE_BRAIN_BIBLE_IDS[ version ];
		}
		// Bible Brain ids are usually the ISO 639-3 code followed by the version abbreviation, e.g. ENGKJV.
		return (
			bibleData.abbr === versionId ||
			bibleData.abbr === language.toUpperCase() + versionId
		);
	};

	return bibles
		.map( ( bibleData ) => ( {
			bibleData,
			exactMatch: matchesVersion( bibleData ),
			fileset: getAudioFilesets( bibleData, book )[ 0 ],
		} ) )
		.filter( ( { fileset } ) => fileset )
		.sort( ( a, b ) => Number( b.exactMatch ) - Number( a.exactMatch ) )
		.map( ( { bibleData, exactMatch, fileset } ) => ( {
			id: `biblebrain:${ fileset.id }`,
			label: `${ bibleData.vname || bibleData.name } (${
				bibleData.abbr
			})`,
			attribution: 'Audio from Bible Brain / Faith Comes By Hearing',
			type: 'file',
			exactMatch,
			getChapter: async ( { book: chapterBook, chapter } ) => {
				const bookCode = USFM_CODES[ getBookIndex( chapterBook ) ];
				const [ chapterResponse, timestampResponse ] =
					await Promise.all( [
						bibleBrainFetch(
							`/bibles/filesets/${ fileset.id }/${ bookCode }/${ chapter }`
						),
						bibleBrainFetch(
							`/timestamps/${ fileset.id }/${ bookCode }/${ chapter }`
						).catch( () => null ),
					] );
				const url = chapterResponse.data?.[ 0 ]?.path;
				if ( ! url ) {
					throw new Error( 'No audio for this chapter' );
				}

				let timestamps = null;
				if ( timestampResponse?.data?.length ) {
					timestamps = {};
					timestampResponse.data.forEach(
						( { verse_start: verseStart, timestamp } ) => {
							timestamps[ parseInt( verseStart ) ] =
								parseFloat( timestamp );
						}
					);
				}

				return { url, timestamps };
			},
		} ) );
}

/**
 * The browser's own text to speech. Works offline with every version, and can
 * start at any verse, but quality and language coverage depend on the device.
 */
function getSpeechSources( version, book ) {
	if ( typeof window === 'undefined' || ! window.speechSynthesis ) {
		return [];
	}

	const lang = toSpeechLanguage( getVersionLanguage( version, book ) );
	return [
		{
			id: 'speech',
			label: 'Device voice (text to speech)',
			attribution: 'Read aloud by your browser',
			type: 'speech',
			exactMatch: true,
			lang,
		},
	];
}

/** All the audio sources for a version, best first */
export async function getAudioSources( version, book ) {
	if ( ! bible.Data.supportedVersions[ version ] ) {
		return [];
	}

	const bibleBrainSources = await getBibleBrainSources( version, book );

	return [
		...getOpenBibleSources( version ),
		...bibleBrainSources.filter( ( { exactMatch } ) => exactMatch ),
		...getSpeechSources( version, book ),
		// Recordings of a different translation in the same language.
		...bibleBrainSources.filter( ( { exactMatch } ) => ! exactMatch ),
	];
}
