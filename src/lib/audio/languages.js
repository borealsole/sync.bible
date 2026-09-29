import bible from '../../data/bible.js';

// ISO 639-1 (and a few non-standard) codes used in bible.js mapped to the
// ISO 639-3 codes that Bible Brain uses.
const ISO_639_3 = {
	af: 'afr',
	ar: 'arb',
	az: 'azj',
	be: 'bel',
	bg: 'bul',
	br: 'bre',
	cs: 'ces',
	cu: 'chu',
	cy: 'cym',
	da: 'dan',
	de: 'deu',
	el: 'ell',
	en: 'eng',
	eo: 'epo',
	es: 'spa',
	et: 'est',
	eu: 'eus',
	fa: 'pes',
	fi: 'fin',
	fr: 'fra',
	ga: 'gle',
	gd: 'gla',
	gv: 'glv',
	he: 'heb',
	hi: 'hin',
	hr: 'hrv',
	ht: 'hat',
	hu: 'hun',
	hy: 'hye',
	it: 'ita',
	ja: 'jpn',
	jp: 'jpn',
	kk: 'kaz',
	km: 'khm',
	ko: 'kor',
	la: 'lat',
	ln: 'lin',
	lt: 'lit',
	lv: 'lvs',
	mg: 'plt',
	mi: 'mri',
	mn: 'khk',
	my: 'mya',
	nb: 'nob',
	nd: 'nde',
	nl: 'nld',
	nn: 'nno',
	np: 'npi',
	pl: 'pol',
	pt: 'por',
	ro: 'ron',
	rs: 'srp',
	ru: 'rus',
	sl: 'slv',
	sn: 'sna',
	so: 'som',
	sq: 'sqi',
	sv: 'swe',
	sw: 'swh',
	th: 'tha',
	tl: 'tgl',
	tr: 'tur',
	uk: 'ukr',
	ukr: 'ukr',
	ur: 'urd',
	vi: 'vie',
	yo: 'yor',
	'zh-hans': 'cmn',
	'zh-hant': 'cmn',
	hbo: 'heb',
	grc: 'grc',
};

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

export function toIso6393( language ) {
	if ( ! language ) {
		return null;
	}

	if ( ISO_639_3[ language ] ) {
		return ISO_639_3[ language ];
	}

	// eBible.org style codes are already ISO 639-3, some with a suffix (e.g. "cebulb").
	return /^[a-z]{3}/.test( language ) ? language.slice( 0, 3 ) : null;
}

export function toSpeechLanguage( language ) {
	return SPEECH_LANGUAGES[ language ] || language;
}
