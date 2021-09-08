const Component = require('../../Modules/Component/Component');

class FilterTag extends Component {
	constructor() {
		super('filterTag');
	}

	exec(tag) {
		if (!tag) return null;
		const allowed = /^[0-9a-zA-Z]+$/;
		tag = tag.toUpperCase();
		if(tag.startsWith('#')) tag = tag.slice(1);
		if (!tag.match(allowed)) return null;
		tag = tag.replace('O', '0').replace('B', '8');
		return tag;
	}
}

module.exports = FilterTag;