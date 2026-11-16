// External
import PropTypes from 'prop-types';

// Internal
import styles from './styles.module.scss';
import SortGroupResults from '../sort-group-results';
import { useTranslate } from '../../lib/i18n';

/** Component for displaying word statistics and grouping options */
export default function WordStats( { strongsNumber, version } ) {
	const t = useTranslate();
	return (
		<div className={ styles.wordStats }>
			<h2>{ t( 'Stats for {version}', { version } ) }</h2>
			<SortGroupResults
				type="word"
				version={ version }
				strongsNumber={ strongsNumber }
				initialGroup="book"
				initialSort="reference"
				supportsWord={ true }
			/>
		</div>
	);
}

WordStats.propTypes = {
	strongsNumber: PropTypes.string.isRequired,
	version: PropTypes.string.isRequired,
};
