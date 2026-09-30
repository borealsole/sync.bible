/**
 * Downloads the verse timings for the Global Bible Tools Hebrew and Greek
 * recordings and saves them as JSON in public/audio-timings.
 *
 * The recordings are streamed from assets.globalbibletools.com, but that
 * server doesn't send CORS headers, so the browser can't read the timing
 * files directly. Run this again to pick up new or updated recordings:
 *
 *   node scripts/fetch-gbt-audio-timings.js
 *
 * Each output file is an array of chapters, each an array of verse start
 * times in seconds (null where a verse has no timing). A missing chapter
 * (null) means the chapter hasn't been recorded.
 * index.json lists the books available for each recording.
 */
import { Buffer } from 'buffer';
import { mkdirSync, writeFileSync } from 'fs';

const BASE_URL = 'https://assets.globalbibletools.com/audio/v1';
const OUTPUT_DIR = './public/audio-timings/gbt';
const RECORD_SIZE = 11;
const BOOKS = [
	'Gen',
	'Exo',
	'Lev',
	'Num',
	'Deu',
	'Jos',
	'Jdg',
	'Rut',
	'1Sa',
	'2Sa',
	'1Ki',
	'2Ki',
	'1Ch',
	'2Ch',
	'Ezr',
	'Neh',
	'Est',
	'Job',
	'Psa',
	'Pro',
	'Ecc',
	'Sng',
	'Isa',
	'Jer',
	'Lam',
	'Ezk',
	'Dan',
	'Hos',
	'Jol',
	'Amo',
	'Oba',
	'Jon',
	'Mic',
	'Nam',
	'Hab',
	'Zep',
	'Hag',
	'Zec',
	'Mal',
	'Mat',
	'Mrk',
	'Luk',
	'Jhn',
	'Act',
	'Rom',
	'1Co',
	'2Co',
	'Gal',
	'Eph',
	'Php',
	'Col',
	'1Th',
	'2Th',
	'1Ti',
	'2Ti',
	'Tit',
	'Phm',
	'Heb',
	'Jas',
	'1Pe',
	'2Pe',
	'1Jn',
	'2Jn',
	'3Jn',
	'Jud',
	'Rev',
];

// Each record is: book (u8), chapter (u8), verse (u8), start (u32, 1/100s), end (u32, 1/100s).
function decodeTimings( buffer ) {
	const chapters = [];
	for (
		let offset = 0;
		offset + RECORD_SIZE <= buffer.length;
		offset += RECORD_SIZE
	) {
		const chapter = buffer[ offset + 1 ];
		const verse = buffer[ offset + 2 ];
		const start = buffer.readUInt32BE( offset + 3 ) / 100;
		if ( chapter < 1 || verse < 1 ) {
			continue;
		}

		chapters[ chapter - 1 ] = chapters[ chapter - 1 ] || [];
		chapters[ chapter - 1 ][ verse - 1 ] = start;
	}

	return Array.from( chapters, ( verses ) =>
		verses ? Array.from( verses, ( start ) => start ?? null ) : null
	);
}

// Some chapters have timings but no recording, so check each file exists.
async function audioExists( url ) {
	const response = await fetch( url, { headers: { Range: 'bytes=0-0' } } );
	return response.ok;
}

async function main() {
	const manifest = await fetch( `${ BASE_URL }/manifest.jsonl` ).then(
		( response ) => response.text()
	);
	const books = manifest
		.split( '\n' )
		.filter( Boolean )
		.map( ( line ) => JSON.parse( line ) )
		// Book entries look like "OT/HEB/Gen".
		.filter( ( { id } ) => id.split( '/' ).length === 3 );

	const index = {};
	for ( const { id } of books ) {
		const [ testament, recording, book ] = id.split( '/' );
		if ( ! BOOKS.includes( book ) ) {
			continue;
		}

		const response = await fetch( `${ BASE_URL }/${ id }/timings.bin` );
		if ( ! response.ok ) {
			console.warn( `No timings for ${ id } (${ response.status })` );
			continue;
		}

		const timings = decodeTimings(
			Buffer.from( await response.arrayBuffer() )
		);
		const chapters = await Promise.all(
			timings.map( async ( verses, index ) => {
				const file = String( index + 1 ).padStart( 3, '0' ) + '.mp3';
				return verses &&
					( await audioExists( `${ BASE_URL }/${ id }/${ file }` ) )
					? verses
					: null;
			} )
		);
		if ( ! chapters.some( Boolean ) ) {
			console.warn( `Empty timings for ${ id }` );
			continue;
		}

		mkdirSync( `${ OUTPUT_DIR }/${ recording }`, { recursive: true } );
		writeFileSync(
			`${ OUTPUT_DIR }/${ recording }/${ book }.json`,
			JSON.stringify( chapters )
		);

		index[ recording ] = index[ recording ] || { testament, books: [] };
		index[ recording ].books.push( book );
		console.log( `Saved ${ id }` );
	}

	writeFileSync( `${ OUTPUT_DIR }/index.json`, JSON.stringify( index ) );
}

main();
