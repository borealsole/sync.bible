// External
import { useState, Fragment } from 'react';

// Internal
import DailyReadingLink from './daily-reading-link';
import styles from './styles.module.scss';
import dailyReadings from '../../data/cdrplan.min.js';
import { useLocale } from '../../lib/i18n';

const getMonthName = ( monthNumber, locale ) => {
	const month = new Date( 1970, monthNumber, 1 );
	try {
		return month.toLocaleString( locale, { month: 'long' } );
	} catch {
		return month.toLocaleString( 'default', { month: 'long' } );
	}
};

const getMonths = ( locale ) => {
	let monthNumber = 0;
	const months = [];
	while ( monthNumber < 12 ) {
		months[ monthNumber ] = (
			<option key={ monthNumber } value={ monthNumber }>
				{ getMonthName( monthNumber, locale ) }
			</option>
		);
		monthNumber++;
	}
	return months;
};

const getDaysInMonth = ( month ) => {
	return new Date( 1970, month, 0 ).getDate();
};

function getDaysIntoYear( date ) {
	return (
		( Date.UTC( date.getFullYear(), date.getMonth(), date.getDate() ) -
			Date.UTC( date.getFullYear(), 0, 0 ) ) /
		24 /
		60 /
		60 /
		1000
	);
}

export default function DailyReadings() {
	const locale = useLocale();
	const [ selectedMonth, setSelectedMonth ] = useState(
		new Date().getMonth()
	);
	const [ selectedDay, setSelectedDay ] = useState( new Date().getDate() );

	const getDays = () => {
		const daysInMonth = getDaysInMonth( parseInt( selectedMonth ) + 1 );
		let day = 1;
		const days = [];
		while ( day <= daysInMonth ) {
			days[ day ] = <option key={ day }>{ day }</option>;
			day++;
		}
		return days;
	};

	const selectedDate = new Date( 1970, selectedMonth, selectedDay );
	const daysIntoYear = getDaysIntoYear( selectedDate );

	const dailyReadingsList = dailyReadings[ daysIntoYear - 1 ].Readings.map(
		( reading, key ) => {
			return (
				<li key={ key }>
					{ reading.Refs.map( ( oneRef, index ) => {
						const book = oneRef.Book;
						const chapter = oneRef.Chapter ? oneRef.Chapter : 1;
						const verses = oneRef.Verses;
						return (
							<Fragment key={ index }>
								<DailyReadingLink
									book={ book }
									chapter={ chapter }
									verses={ verses }
								/>
								<br />
							</Fragment>
						);
					} ) }
				</li>
			);
		}
	);

	return (
		<div className={ styles.dailyReadings }>
			<select
				className={ styles.month }
				value={ selectedMonth }
				onChange={ ( event ) => {
					setSelectedMonth( event.target.value );
				} }
			>
				{ getMonths( locale ) }
			</select>
			<select
				className={ styles.day }
				value={ selectedDay }
				onChange={ ( event ) => {
					setSelectedDay( event.target.value );
				} }
			>
				{ getDays() }
			</select>
			<ol>{ dailyReadingsList }</ol>
		</div>
	);
}
