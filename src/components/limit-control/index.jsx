// External
import PropTypes from 'prop-types';

// Internal
import styles from './styles.module.scss';
import { useTranslate } from '../../lib/i18n';

/**
 * Shared component for limiting words by total Bible usage count
 * @param {Object} props
 * @param {number} props.limit - Current limit value
 * @param {Function} props.onChange - Callback when limit changes
 */
const LimitControl = ( { limit, onChange } ) => {
	const t = useTranslate();
	const handleChange = ( event ) => {
		const value = Number( event.target.value );
		if ( ! isNaN( value ) ) {
			onChange( value );
		}
	};

	return (
		<div className={ styles.limitControl }>
			{ t( 'Words with less than' ) }{ ' ' }
			<input
				type="number"
				name="limit"
				value={ limit }
				onChange={ handleChange }
				className={ styles.limitInput }
				min="1"
			/>{ ' ' }
			{ t( 'uses' ) }
		</div>
	);
};

LimitControl.propTypes = {
	limit: PropTypes.number.isRequired,
	onChange: PropTypes.func.isRequired,
};

export default LimitControl;
