// External
import PropTypes from 'prop-types';

const Play = ( { fill } ) => (
	<svg width="24" height="24" viewBox="0 0 24 24">
		<path d="M8 5v14l11-7z" fill={ fill } />
	</svg>
);

Play.propTypes = {
	fill: PropTypes.string,
};

export default Play;
