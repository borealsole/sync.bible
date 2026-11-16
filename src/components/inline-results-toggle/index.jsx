// External
import { useDispatch, useSelector } from 'react-redux';

// Internal
import { settingsChange } from '../../actions';
import UnfoldLess from '../svg/unfold-less';
import UnfoldMore from '../svg/unfold-more';
import styles from './styles.module.scss';
import { useTranslate } from '../../lib/i18n';

/** Toggle component for expanding/collapsing inline search results */
export default function InlineResultsToggle() {
	const dispatch = useDispatch();
	const t = useTranslate();
	const expandedSearchResults = useSelector(
		( state ) => state.settings.expandedSearchResults
	);

	const expandSearchResults = () => {
		dispatch( settingsChange( 'expandedSearchResults', true ) );
	};

	const collapseSearchResults = () => {
		dispatch( settingsChange( 'expandedSearchResults', false ) );
	};

	if ( expandedSearchResults ) {
		return (
			<a
				className={ styles.foundInExtra }
				onClick={ collapseSearchResults }
				title={ t( 'Hide reference context' ) }
			>
				<UnfoldLess />
			</a>
		);
	}

	return (
		<a
			className={ styles.foundInExtra }
			onClick={ expandSearchResults }
			title={ t( 'Show reference context' ) }
		>
			<UnfoldMore />
		</a>
	);
}
