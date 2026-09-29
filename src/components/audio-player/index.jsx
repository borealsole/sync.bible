// External
import { useEffect, useSyncExternalStore } from 'react';
import { useSelector } from 'react-redux';

// Internal
import bible from '../../data/bible.js';
import { audioPlayer } from '../../lib/audio/player';
import { getNumberOfChapters } from '../../lib/audio/books';
import PlaySvg from '../svg/play';
import PauseSvg from '../svg/pause';
import SkipPreviousSvg from '../svg/skip-previous';
import SkipNextSvg from '../svg/skip-next';
import CloseSvg from '../svg/close';
import styles from './styles.module.scss';
import { DOCK_HEIGHT } from '../../constants/dimensions';
import { useTrayDimensions } from '../../hooks/useTrayDimensions';

const RATES = [ 0.75, 1, 1.25, 1.5, 2 ];

/** Player bar shown at the bottom of the screen while listening */
export default function AudioPlayer() {
	const {
		status,
		book,
		chapter,
		version,
		verse,
		sources,
		sourceId,
		error,
		notice,
		rate,
		continuous,
	} = useSyncExternalStore( audioPlayer.subscribe, audioPlayer.getState );
	const data = useSelector( ( state ) => state.data );
	const { isMobile, customWidth, activeTraysCount } = useTrayDimensions();

	// Line up with the reference columns, clear of the navigation and trays.
	const left =
		! isMobile && activeTraysCount > 0
			? customWidth + DOCK_HEIGHT
			: DOCK_HEIGHT;
	const isOpen = !! book;

	useEffect( () => {
		document.body.classList.toggle( 'audio-player-open', isOpen );
	}, [ isOpen ] );

	// Keep the player's copy of the text up to date for text to speech.
	useEffect( () => {
		audioPlayer.setData( data );
	}, [ data ] );

	if ( ! book ) {
		return null;
	}

	const source = sources.find( ( { id } ) => id === sourceId );
	const isPlaying = status === 'playing';
	const title = `${ bible.getTranslatedBookName(
		book,
		version
	) } ${ chapter }${ verse ? ':' + verse : '' }`;

	return (
		<div
			className={ styles.audioPlayer }
			role="region"
			aria-label="Audio"
			style={ { left } }
		>
			<div className={ styles.controls }>
				<button
					type="button"
					onClick={ () => audioPlayer.changeChapter( -1 ) }
					disabled={ chapter <= 1 }
					title="Previous chapter"
				>
					<SkipPreviousSvg fill="currentColor" />
				</button>
				<button
					type="button"
					onClick={ () =>
						isPlaying ? audioPlayer.pause() : audioPlayer.resume()
					}
					disabled={ status === 'loading' || ! source }
					title={ isPlaying ? 'Pause' : 'Play' }
				>
					{ isPlaying ? (
						<PauseSvg fill="currentColor" />
					) : (
						<PlaySvg fill="currentColor" />
					) }
				</button>
				<button
					type="button"
					onClick={ () => audioPlayer.changeChapter( 1 ) }
					disabled={ chapter >= getNumberOfChapters( book ) }
					title="Next chapter"
				>
					<SkipNextSvg fill="currentColor" />
				</button>
			</div>

			<div className={ styles.details }>
				<div className={ styles.title }>
					{ title }{ ' ' }
					<span className={ styles.version }>{ version }</span>
					{ status === 'loading' && (
						<span className={ styles.status }> Loading…</span>
					) }
				</div>
				{ error && <div className={ styles.error }>{ error }</div> }
				{ ! error && notice && (
					<div className={ styles.notice }>{ notice }</div>
				) }
				{ ! error && source && ! source.exactMatch && (
					<div className={ styles.notice }>
						This is a recording of a different translation.
					</div>
				) }
				{ source && (
					<div className={ styles.attribution }>
						{ source.attribution }
					</div>
				) }
			</div>

			<div className={ styles.options }>
				{ sources.length > 0 && (
					<select
						value={ sourceId || '' }
						onChange={ ( event ) =>
							audioPlayer.setSource( event.target.value )
						}
						title="Recording"
					>
						{ sources.map( ( { id, label } ) => (
							<option key={ id } value={ id }>
								{ label }
							</option>
						) ) }
					</select>
				) }
				<select
					value={ rate }
					onChange={ ( event ) =>
						audioPlayer.setRate( parseFloat( event.target.value ) )
					}
					title="Speed"
				>
					{ RATES.map( ( value ) => (
						<option key={ value } value={ value }>
							{ value }×
						</option>
					) ) }
				</select>
				<label title="Carry on to the next chapter">
					<input
						type="checkbox"
						checked={ continuous }
						onChange={ ( event ) =>
							audioPlayer.setContinuous( event.target.checked )
						}
					/>
					Continue
				</label>
				<button
					type="button"
					onClick={ () => audioPlayer.stop() }
					title="Close"
					className={ styles.close }
				>
					<CloseSvg />
				</button>
			</div>
		</div>
	);
}
