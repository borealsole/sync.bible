// External
import PropTypes from 'prop-types';

// Internal
import styles from './styles.module.scss';
import SortGroupResults from '../sort-group-results';
import { useTranslate } from '../../lib/i18n';

/** Component for displaying search result statistics */
export default function SearchStats( { results, data } ) {
	const t = useTranslate();
	if ( ! results ) {
		return (
			<p>{ t( 'Stats will appear when you have searched for the word.' ) }</p>
		);
	}

	return (
		<div className={ styles.wordStats }>
			<h2>{ t( 'Stats for {version}', { version: data.version } ) }</h2>
			<SortGroupResults
				results={ results }
				initialGroup="book"
				initialSort="reference"
				supportsWord={ false }
				supportsStrongs={ true }
			/>
		</div>
	);
}

SearchStats.propTypes = {
	results: PropTypes.array,
	data: PropTypes.shape( {
		version: PropTypes.string.isRequired,
	} ).isRequired,
};
