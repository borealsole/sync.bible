// External
import PropTypes from 'prop-types';

// Internal
import TrayFilter from '../../components/trays/filter';
import Controls from '../controls';
import styles from './styles.module.scss';
import { useTranslate } from '../../lib/i18n';

export default function TrayBar( { trays } ) {
	const t = useTranslate();
	return (
		<div className={ styles.trayBar }>
			<Controls />
			{ trays.map( ( tray ) => {
				return (
					<TrayFilter
						trays={ trays }
						key={ tray.id }
						title={ t( tray.text ) }
						filter={ tray.id }
					>
						{ tray.icon }
					</TrayFilter>
				);
			} ) }
		</div>
	);
}

TrayBar.propTypes = {
	trays: PropTypes.arrayOf(
		PropTypes.shape( {
			id: PropTypes.string.isRequired,
			text: PropTypes.string.isRequired,
			icon: PropTypes.node.isRequired,
		} )
	).isRequired,
};
