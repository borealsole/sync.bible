// External
import PropTypes from 'prop-types';
import { useStore } from 'react-redux';

// Internal
import VolumeUpSvg from '../svg/volume-up';
import styles from './styles.module.scss';
import { audioPlayer } from '../../lib/audio/player';
import { getBookIndex } from '../../lib/audio/books';

/** Button to listen to a chapter, starting from an optional verse */
export default function AudioButton( {
	book,
	chapter,
	verse = 1,
	version,
	fill,
} ) {
	const store = useStore();

	// Books without a single canonical chapter (e.g. the Harmony) have no audio.
	if ( getBookIndex( book ) === -1 ) {
		return null;
	}

	const handleClick = ( event ) => {
		event.stopPropagation();
		audioPlayer.play( {
			book,
			chapter: parseInt( chapter ),
			verse,
			version,
			data: store.getState().data,
		} );
	};

	const title =
		verse > 1 ? `Listen from verse ${ verse }` : 'Listen to this chapter';

	return (
		<a
			className={ styles.audioButton }
			onClick={ handleClick }
			title={ title }
			aria-label={ title }
			role="button"
		>
			<VolumeUpSvg fill={ fill } />
		</a>
	);
}

AudioButton.propTypes = {
	book: PropTypes.string.isRequired,
	chapter: PropTypes.oneOfType( [ PropTypes.string, PropTypes.number ] )
		.isRequired,
	verse: PropTypes.number,
	version: PropTypes.string.isRequired,
	fill: PropTypes.string,
};
