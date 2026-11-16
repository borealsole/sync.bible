// External
import { useSelector } from 'react-redux';

// Internal
import Bookmark from '../svg/bookmark';
import CombinedResults from '../word-details/combined';
import SharedWords from '../shared-words';
import Single from './single';
import styles from './styles.module.scss';
import { useTranslate } from '../../lib/i18n';

export default function BookMarks() {
	const list = useSelector( ( state ) => state.list );
	const t = useTranslate();

	const bookmarks = list.filter(
		( { listType } ) => listType === 'bookmark'
	);

	const [ bookmarkHelpBefore, bookmarkHelpAfter = '' ] = t(
		'Click the {icon} to bookmark a verse.'
	).split( '{icon}' );

	return (
		<>
			{ bookmarks.length === 0 && (
				<p className={ styles.description }>
					{ bookmarkHelpBefore }
					<Bookmark />
					{ bookmarkHelpAfter }
				</p>
			) }
			<div className={ styles.bookmarksContainer }>
				{ bookmarks.map( ( bookmark, key ) => (
					<Single bookmark={ bookmark } key={ key } index={ key } />
				) ) }
			</div>
			<CombinedResults type="bookmark" />
			<SharedWords type="bookmark" />
		</>
	);
}
