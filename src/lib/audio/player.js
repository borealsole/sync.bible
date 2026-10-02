// Internal
import { getAudioSources, findSpeechVoice } from './sources';
import { getNumberOfChapters } from './books';
import { getVerseText } from '../reference-text';
import { mapVersionToData } from '../reference';

/**
 * A single audio player shared by the whole app. Components subscribe with
 * useSyncExternalStore( audioPlayer.subscribe, audioPlayer.getState ).
 */

const PREFERRED_SOURCE_KEY = 'audioSourcePreferences';

const initialState = {
	status: 'idle', // idle | loading | playing | paused | error
	book: null,
	chapter: null,
	version: null,
	// The verse currently being read, if known.
	verse: null,
	// The verse playback was asked to start from.
	startVerse: 1,
	sources: [],
	sourceId: null,
	error: null,
	notice: null,
	rate: 1,
	continuous: true,
};

let state = initialState;
const listeners = new Set();
let audioElement = null;
let timestamps = null;
let verseTexts = [];
let versionData = null;
// Incremented every time playback is (re)started, so stale async work can be ignored.
let playId = 0;

function setState( changes ) {
	state = { ...state, ...changes };
	listeners.forEach( ( listener ) => listener() );
}

function readPreferences() {
	try {
		return JSON.parse( localStorage.getItem( PREFERRED_SOURCE_KEY ) ) || {};
	} catch {
		return {};
	}
}

function savePreferredSource( version, sourceId ) {
	try {
		localStorage.setItem(
			PREFERRED_SOURCE_KEY,
			JSON.stringify( { ...readPreferences(), [ version ]: sourceId } )
		);
	} catch {
		// Storage isn't available, the choice just won't be remembered.
	}
}

function getAudioElement() {
	if ( ! audioElement ) {
		audioElement = new Audio();
		audioElement.preload = 'auto';
		audioElement.addEventListener( 'timeupdate', onTimeUpdate );
		audioElement.addEventListener( 'ended', onEnded );
		audioElement.addEventListener( 'playing', () =>
			setState( { status: 'playing' } )
		);
		audioElement.addEventListener( 'pause', () => {
			if ( state.status === 'playing' && ! audioElement.ended ) {
				setState( { status: 'paused' } );
			}
		} );
		audioElement.addEventListener( 'error', () => {
			if ( audioElement.getAttribute( 'src' ) ) {
				setState( {
					status: 'error',
					error: 'This recording could not be loaded.',
				} );
			}
		} );
	}

	return audioElement;
}

function onTimeUpdate() {
	if ( ! timestamps ) {
		return;
	}

	const currentTime = audioElement.currentTime;
	let currentVerse = null;
	Object.keys( timestamps ).forEach( ( verse ) => {
		if ( timestamps[ verse ] <= currentTime + 0.1 ) {
			currentVerse = Math.max( currentVerse || 0, parseInt( verse ) );
		}
	} );

	if ( currentVerse !== state.verse ) {
		setState( { verse: currentVerse } );
	}
}

function onEnded() {
	const { book, chapter, continuous } = state;
	if ( continuous && chapter < getNumberOfChapters( book ) ) {
		startChapter( { chapter: chapter + 1, verse: 1 } );
	} else {
		setState( { status: 'idle', verse: null } );
	}
}

function getCurrentSource() {
	return state.sources.find( ( { id } ) => id === state.sourceId );
}

function stopEverything() {
	playId++;
	if ( audioElement ) {
		audioElement.pause();
		audioElement.removeAttribute( 'src' );
		audioElement.load();
	}

	if ( typeof window !== 'undefined' && window.speechSynthesis ) {
		window.speechSynthesis.cancel();
	}
}

function loadVerseTexts( book, chapter, version ) {
	const chapterData =
		versionData?.[ mapVersionToData( book, version ) ]?.[ book ]?.[
			chapter - 1
		];
	verseTexts = ( chapterData || [] ).map( ( verseData ) =>
		getVerseText( { verseData, version, lcData: versionData?.LC } )
	);
}

function speakFrom( verse, currentPlayId ) {
	if ( currentPlayId !== playId ) {
		return;
	}

	if ( verse > verseTexts.length ) {
		onEnded();
		return;
	}

	const text = verseTexts[ verse - 1 ];
	if ( ! text ) {
		speakFrom( verse + 1, currentPlayId );
		return;
	}

	const source = getCurrentSource();
	const utterance = new SpeechSynthesisUtterance( text );
	utterance.lang = source.lang;
	utterance.rate = state.rate;
	const voice = findSpeechVoice( source.lang );
	if ( voice ) {
		utterance.voice = voice;
	}

	utterance.onend = () => speakFrom( verse + 1, currentPlayId );
	utterance.onerror = ( event ) => {
		if ( event.error === 'interrupted' || event.error === 'canceled' ) {
			return;
		}
		setState( {
			status: 'error',
			error: [
				'language-unavailable',
				'voice-unavailable',
				'synthesis-failed',
			].includes( event.error )
				? 'Your device doesn’t have a voice for this language.'
				: 'Text to speech failed.',
		} );
	};

	setState( { status: 'playing', verse } );
	window.speechSynthesis.speak( utterance );
}

async function startChapter( { chapter = state.chapter, verse = 1 } = {} ) {
	stopEverything();
	const currentPlayId = playId;
	const { book, version } = state;
	const source = getCurrentSource();
	setState( {
		status: 'loading',
		chapter,
		verse: null,
		startVerse: verse,
		error: null,
		notice: null,
	} );

	if ( ! source ) {
		setState( {
			status: 'error',
			error: 'No audio is available for this version.',
		} );
		return;
	}

	if ( source.type === 'speech' ) {
		loadVerseTexts( book, chapter, version );
		if ( ! verseTexts.length ) {
			setState( {
				status: 'error',
				error: 'The text for this chapter hasn’t loaded yet.',
			} );
			return;
		}
		speakFrom( verse, currentPlayId );
		return;
	}

	try {
		const chapterAudio = await source.getChapter( { book, chapter } );
		if ( currentPlayId !== playId ) {
			return;
		}

		timestamps = chapterAudio.timestamps;
		const audio = getAudioElement();
		audio.src = chapterAudio.url;
		audio.playbackRate = state.rate;

		if ( verse > 1 ) {
			if ( timestamps?.[ verse ] !== undefined ) {
				audio.currentTime = timestamps[ verse ];
			} else {
				setState( {
					notice: 'This recording doesn’t have verse timings, so it starts at the beginning of the chapter.',
				} );
			}
		}

		await audio.play();
	} catch ( error ) {
		if ( currentPlayId !== playId ) {
			return;
		}
		// Autoplay being blocked isn't an error, the user can press play.
		if ( error?.name === 'NotAllowedError' ) {
			setState( { status: 'paused' } );
			return;
		}
		setState( {
			status: 'error',
			error: error?.message || 'This recording could not be loaded.',
		} );
	}
}

export const audioPlayer = {
	subscribe( listener ) {
		listeners.add( listener );
		return () => listeners.delete( listener );
	},

	getState() {
		return state;
	},

	/**
	 * Play a chapter, optionally starting at a verse.
	 * `data` is the loaded bible data from the store, used for text to speech.
	 */
	async play( { book, chapter, verse = 1, version, data } ) {
		stopEverything();
		const currentPlayId = playId;
		versionData = data;
		timestamps = null;
		setState( {
			status: 'loading',
			book,
			chapter,
			version,
			verse: null,
			error: null,
			notice: null,
		} );

		const sources = await getAudioSources( version, book );
		if ( currentPlayId !== playId ) {
			return;
		}

		const preferred = readPreferences()[ version ];
		const source =
			sources.find( ( { id } ) => id === preferred ) || sources[ 0 ];
		setState( { sources, sourceId: source?.id ?? null } );
		await startChapter( { chapter, verse } );
	},

	/** Keep the latest bible data so text to speech can read newly loaded chapters */
	setData( data ) {
		versionData = data;
	},

	setSource( sourceId ) {
		savePreferredSource( state.version, sourceId );
		setState( { sourceId } );
		startChapter( { verse: state.verse || state.startVerse } );
	},

	setRate( rate ) {
		setState( { rate } );
		if ( audioElement ) {
			audioElement.playbackRate = rate;
		}
		if (
			getCurrentSource()?.type === 'speech' &&
			state.status === 'playing'
		) {
			startChapter( { verse: state.verse || state.startVerse } );
		}
	},

	setContinuous( continuous ) {
		setState( { continuous } );
	},

	pause() {
		if ( getCurrentSource()?.type === 'speech' ) {
			window.speechSynthesis.pause();
			setState( { status: 'paused' } );
		} else if ( audioElement ) {
			audioElement.pause();
		}
	},

	resume() {
		if ( getCurrentSource()?.type === 'speech' ) {
			if ( window.speechSynthesis.paused ) {
				window.speechSynthesis.resume();
				setState( { status: 'playing' } );
			} else {
				startChapter( { verse: state.verse || state.startVerse } );
			}
		} else if ( audioElement?.getAttribute( 'src' ) ) {
			audioElement.play().catch( () => {} );
		} else {
			startChapter( { verse: state.verse || state.startVerse } );
		}
	},

	/** Move to the previous (-1) or next (1) chapter in the same book */
	changeChapter( offset ) {
		const chapter = state.chapter + offset;
		if ( chapter >= 1 && chapter <= getNumberOfChapters( state.book ) ) {
			startChapter( { chapter, verse: 1 } );
		}
	},

	stop() {
		stopEverything();
		timestamps = null;
		setState( {
			...initialState,
			rate: state.rate,
			continuous: state.continuous,
		} );
	},
};
