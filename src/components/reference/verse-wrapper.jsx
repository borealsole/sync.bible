// External
import { useRef, useSyncExternalStore } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

// Internal
import CopyToClipboard from '../copy-to-clipboard';
import AudioButton from '../audio-button';
import Verse from './verse';
import VerseNumber from './verse-number';
import styles from './styles.module.scss';
import bible from '../../data/bible.js';
import { audioPlayer } from '../../lib/audio/player';

const getClassName = ( book, version ) => {
	if (
		( version === 'original' || version === 'accented' ) &&
		bible.Data.otBooks.indexOf( book ) > -1
	) {
		return classnames( styles.verse, styles.hebrew );
	}

	if ( version === 'OPV' || version === 'TPV' || version === 'NMV' ) {
		return classnames( styles.verse, styles.farsi );
	}

	return styles.verse;
};

/** Component for wrapping verses with numbers and copy functionality */
export default function VerseWrapper( {
	book,
	version,
	chapter,
	verse,
	isCurrentRef,
	lang,
	columnIndex,
} ) {
	const darkMode = useSelector( ( state ) => state.settings.darkMode );
	const verseWrapperRef = useRef( null );
	const reference = { book, chapter: chapter - 1, verse: verse - 1 };
	const fill = darkMode ? '#eeeeee' : '#666';
	const isBeingRead = useSyncExternalStore( audioPlayer.subscribe, () => {
		const audioState = audioPlayer.getState();
		return (
			audioState.book === book &&
			audioState.chapter === chapter &&
			audioState.verse === verse &&
			audioState.version === version
		);
	} );
	return (
		<div
			lang={ lang }
			className={ classnames(
				styles.verseWrapper,
				isCurrentRef ? styles.isCurrent : null,
				isBeingRead ? styles.isBeingRead : null
			) }
			dir={ bible.isRtlVersion( version, book ) ? 'rtl' : 'ltr' }
			ref={ verseWrapperRef }
		>
			{ chapter && verse && (
				<div className={ styles.helpers }>
					<VerseNumber
						book={ book }
						chapter={ chapter }
						verse={ verse }
						isCurrentRef={ isCurrentRef }
						columnIndex={ columnIndex }
					/>
					<span className={ styles.hidden }>
						<CopyToClipboard
							fill={ fill }
							textToCopy={ verseWrapperRef }
						/>
						<AudioButton
							fill={ fill }
							book={ book }
							chapter={ chapter }
							verse={ verse }
							version={ version }
						/>
					</span>
				</div>
			) }
			<div className={ getClassName( book, version ) }>
				<Verse reference={ reference } version={ version } />
			</div>
		</div>
	);
}

VerseWrapper.propTypes = {
	book: PropTypes.string.isRequired,
	version: PropTypes.string.isRequired,
	chapter: PropTypes.number.isRequired,
	verse: PropTypes.number.isRequired,
	isCurrentRef: PropTypes.bool,
	lang: PropTypes.string,
	columnIndex: PropTypes.number,
};
