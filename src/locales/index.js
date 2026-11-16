/**
 * Interface translations, keyed by locale code.
 *
 * Each locale maps the English interface text to its translation. Missing
 * strings fall back to English. To add a language, add a JSON file here,
 * import it below, and (if the Bible versions use a different language
 * code) add an alias in src/lib/i18n.js.
 */
import ar from './ar.json';
import de from './de.json';
import es from './es.json';
import fa from './fa.json';
import fr from './fr.json';
import he from './he.json';
import it from './it.json';
import ja from './ja.json';
import ko from './ko.json';
import nl from './nl.json';
import pl from './pl.json';
import pt from './pt.json';
import ru from './ru.json';
import uk from './uk.json';
import zhHans from './zh-hans.json';
import zhHant from './zh-hant.json';

export default {
	en: {},
	ar,
	de,
	es,
	fa,
	fr,
	he,
	it,
	ja,
	ko,
	nl,
	pl,
	pt,
	ru,
	uk,
	'zh-hans': zhHans,
	'zh-hant': zhHant,
};
