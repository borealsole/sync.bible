// External
import bible from '../data/bible.js';

const getBookLabel = ( bookName, index, version ) => {
	const language =
		version && bible.Data.supportedVersions[ version ]
			? bible.Data.supportedVersions[ version ].language
			: null;
	const translatedNames =
		language && language !== 'original'
			? bible.Data.bookNamesByLanguage[ language ]
			: null;
	return ( translatedNames && translatedNames[ index ] ) || bookName;
};

/**
 * Options for a book select.
 *
 * @param {string}   version Interface language version, used for book names.
 * @param {Function} t       Translation function.
 */
export function getBooks( version, t = ( text ) => text ) {
	return (
		<>
			<option value="">{ t( 'Select a book' ) }</option>
			{ bible.Data.books.map( ( book, index ) => (
				<option key={ book[ 0 ] } value={ book[ 0 ] }>
					{ getBookLabel( book[ 0 ], index, version ) }
				</option>
			) ) }
		</>
	);
}

export function getCompareChapters( reference, t = ( text ) => text ) {
	if ( reference && reference.book ) {
		const bookNumber = bible.getBookId( reference.book );
		let chapters = bible.Data.verses[ bookNumber - 1 ].map(
			( verses, index ) => <option key={ index }>{ index + 1 }</option>
		);
		chapters.unshift(
			<option key="all" value="all">
				{ t( 'All' ) }
			</option>
		);
		return chapters;
	}

	return <option>-</option>;
}
