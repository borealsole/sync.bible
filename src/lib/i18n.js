// External
import { useCallback } from 'react';
import { useSelector } from 'react-redux';

// Internal
import bible from '../data/bible.js';
import locales from '../locales';

/**
 * Interface translations.
 *
 * The interface language follows the Bible version picked in the
 * "Interface language" dropdown of the settings tray. The version's
 * `language` (and, failing that, its `tongue`) is mapped to one of the
 * locales in src/locales. Strings are keyed by their English text, so any
 * string that has not been translated falls back to English.
 */

// Map ISO 639-3 / non-standard codes used in bible.js to our locale codes.
const languageAliases = {
	zh: 'zh-hans',
	cmn: 'zh-hans',
	'zh-cn': 'zh-hans',
	'zh-tw': 'zh-hant',
	spa: 'es',
	fra: 'fr',
	fre: 'fr',
	deu: 'de',
	ger: 'de',
	por: 'pt',
	rus: 'ru',
	ukr: 'uk',
	pes: 'fa',
	prs: 'fa',
	ara: 'ar',
	arb: 'ar',
	heb: 'he',
	jpn: 'ja',
	jp: 'ja',
	kor: 'ko',
	ita: 'it',
	nld: 'nl',
	dut: 'nl',
	pol: 'pl',
	ron: 'ro',
	rum: 'ro',
	hun: 'hu',
	fin: 'fi',
	swe: 'sv',
	ces: 'cs',
	cze: 'cs',
	tur: 'tr',
	vie: 'vi',
	ind: 'id',
};

export const defaultLocale = 'en';

const normaliseLanguage = ( code ) => {
	if ( ! code ) {
		return null;
	}
	const lower = String( code ).toLowerCase();
	const aliased = languageAliases[ lower ] || lower;
	return locales[ aliased ] ? aliased : null;
};

/**
 * Work out which interface locale to use for a Bible version.
 *
 * @param {string} version A key of bible.Data.supportedVersions.
 * @return {string} A locale code that exists in src/locales.
 */
export const getLocaleForVersion = ( version ) => {
	const versionData = version && bible.Data.supportedVersions[ version ];
	if ( ! versionData ) {
		return defaultLocale;
	}

	return (
		normaliseLanguage( versionData.language ) ||
		normaliseLanguage( versionData.tongue ) ||
		defaultLocale
	);
};

/**
 * Translate a string.
 *
 * @param {string} locale Locale code.
 * @param {string} text   The English text, used as the key.
 * @param {Object} vars   Values for {placeholders} in the text.
 * @return {string} The translated text.
 */
export const translate = ( locale, text, vars ) => {
	const strings = locales[ locale ] || {};
	let result =
		typeof strings[ text ] === 'string' && strings[ text ] !== ''
			? strings[ text ]
			: text;

	if ( vars ) {
		result = result.replace( /\{(\w+)\}/g, ( match, name ) =>
			typeof vars[ name ] !== 'undefined' && vars[ name ] !== null
				? String( vars[ name ] )
				: match
		);
	}

	return result;
};

/**
 * Translate a string for the current interface language, outside React.
 *
 * @param {Object} state Redux state.
 * @param {string} text  The English text.
 * @param {Object} vars  Values for {placeholders}.
 * @return {string} The translated text.
 */
export const translateForState = ( state, text, vars ) =>
	translate(
		getLocaleForVersion( state?.settings?.interfaceLanguage ),
		text,
		vars
	);

/** @return {string} The locale for the current interface language. */
export const useLocale = () => {
	const interfaceLanguage = useSelector(
		( state ) => state.settings.interfaceLanguage
	);
	return getLocaleForVersion( interfaceLanguage );
};

/** @return {Function} t( text, vars ) for the current interface language. */
export const useTranslate = () => {
	const locale = useLocale();
	return useCallback(
		( text, vars ) => translate( locale, text, vars ),
		[ locale ]
	);
};
