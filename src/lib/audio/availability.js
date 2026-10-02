// Internal
import { getAudioSources } from './sources';

/**
 * Whether any audio (a recording or a device voice) exists for a version and
 * book, so the speaker buttons can be hidden when there's nothing to play.
 * Results are cached because every verse shows a button.
 */

const results = new Map();
const pending = new Set();
const listeners = new Set();

const getKey = ( version, book ) => `${ version }|${ book }`;

function notify() {
	listeners.forEach( ( listener ) => listener() );
}

function onVoicesChanged() {
	// Device voices often load after the page, so check everything again.
	results.clear();
	notify();
}

if ( typeof window !== 'undefined' && window.speechSynthesis ) {
	window.speechSynthesis.addEventListener( 'voiceschanged', onVoicesChanged );
}

export const audioAvailability = {
	subscribe( listener ) {
		listeners.add( listener );
		return () => listeners.delete( listener );
	},

	/** true or false once known, undefined while it's being checked */
	get( version, book ) {
		return results.get( getKey( version, book ) );
	},

	load( version, book ) {
		const key = getKey( version, book );
		if ( results.has( key ) || pending.has( key ) ) {
			return;
		}

		pending.add( key );
		getAudioSources( version, book )
			.then( ( sources ) => sources.length > 0 )
			.catch( () => false )
			.then( ( isAvailable ) => {
				pending.delete( key );
				results.set( key, isAvailable );
				notify();
			} );
	},
};
