// Internal
import styles from './styles.module.scss';
import SortGroupResults from '../sort-group-results/index';
import { useTranslate } from '../../lib/i18n';

export default function CombinedAll() {
	const t = useTranslate();
	return (
		<div className={ styles.combinedAll }>
			<p>{ t( 'A combination of all the references in the other panels.' ) }</p>
			<div className={ styles.results }>
				<SortGroupResults
					initialGroup="verse"
					initialSort="reference"
					allowPreview={ true }
				/>
			</div>
		</div>
	);
}
