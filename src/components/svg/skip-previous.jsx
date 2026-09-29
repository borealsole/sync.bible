// External
import PropTypes from 'prop-types';

const SkipPrevious = ( { fill } ) => (
	<svg width="24" height="24" viewBox="0 0 24 24">
		<path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" fill={ fill } />
	</svg>
);

SkipPrevious.propTypes = {
	fill: PropTypes.string,
};

export default SkipPrevious;
