const Component = require('../../Modules/Component/Component');

class FilterText extends Component {
	constructor() {
		super('filterText');
	}

	exec(text, option = {}) {
		const { isName, isDesc } = option;
		const pattern1 = /<c[0-9]>|<\/c>/gi;
		const pattern2 = / *\| */gi;
		text = text.replace(pattern1, '');
		if (!isName) text = text.replace(pattern2, ' | ');
		if (isDesc) text = text.replace('`', '\\`');
		if (isName) text = text.replace('*', '\\*');
		return text;
	}
}

module.exports = FilterText;