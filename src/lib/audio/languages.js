import bible from '../../data/bible.js';

// Codes to pass to the Web Speech API where they differ from bible.js.
const SPEECH_LANGUAGES = {
	hbo: 'he',
	grc: 'el',
	jp: 'ja',
	rs: 'sr',
	np: 'ne',
	ukr: 'uk',
	'zh-hans': 'zh-CN',
	'zh-hant': 'zh-TW',
};

/** The language of the text for a version, resolving "original" per book */
export function getVersionLanguage( version, book ) {
	if ( version === 'original' || version === 'accented' ) {
		return bible.Data.otBooks.indexOf( book ) > -1 ? 'hbo' : 'grc';
	}

	return bible.Data.supportedVersions[ version ]?.language || 'en';
}

export function toSpeechLanguage( language ) {
	return SPEECH_LANGUAGES[ language ] || language;
}
