const Component = require('../../Modules/Component/Component');

class FormatNumber extends Component {
	constructor() {
		super('formatNumber');
	}

	exec(number) {
		if (!number) return number;
		return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ', ');
	}
}

module.exports = FormatNumber;