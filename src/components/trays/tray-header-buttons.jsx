// External
import { useDispatch } from 'react-redux';
import PropTypes from 'prop-types';

// Internal
import { removeTray, closeAllListItems } from '../../actions';
import Close from '../svg/close';
import Clear from '../clear';
import UnfoldLessDouble from '../svg/unfold-less-double';
import styles from './styles.module.scss';
import { useTranslate } from '../../lib/i18n';

const TrayHeaderButtons = ( { trayId, trayText, hasListItems, hasOpenItems } ) => {
	const dispatch = useDispatch();
	const t = useTranslate();

	const closeAllForTray = () => {
		dispatch( closeAllListItems( trayId ) );
	};

	const closeTray = () => {
		dispatch( removeTray( trayId ) );
	};

	return (
		<div className={ styles.trayHeaderRight }>
			{ hasListItems && (
				<>
					{ hasOpenItems && (
						<button
							className={ styles.trayHeaderButton }
							onClick={ closeAllForTray }
							title={ t( 'Close all' ) }
						>
							<UnfoldLessDouble />
						</button>
					) }
					<Clear
						className={ styles.trayHeaderButton }
						selectedTrayId={ trayId }
					/>
				</>
			) }
			<button
				className={ styles.trayHeaderButton }
				onClick={ closeTray }
				title={ t( 'Close {name}', { name: trayText } ) }
			>
				<Close />
			</button>
		</div>
	);
};

TrayHeaderButtons.propTypes = {
	trayId: PropTypes.string.isRequired,
	trayText: PropTypes.string.isRequired,
	hasListItems: PropTypes.bool.isRequired,
	hasOpenItems: PropTypes.bool.isRequired,
};

export default TrayHeaderButtons;
