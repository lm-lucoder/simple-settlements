function addHandlebarsCustomHelpers() {
	Handlebars.registerHelper('ifOrGm', function (condition) {
		if (condition || game.user.isGM) {
			return true
		}
		return false
	});
	Handlebars.registerHelper('unlessOrGm', function (condition) {
		if (!condition || game.user.isGM) {
			return true
		}
		return false
	});
	Handlebars.registerHelper('arrayLenghtHigherThan', function (array, number) {
		if (array.length > number) {
			return true
		}
		return false
	});
	Handlebars.registerHelper('higherThan', function (a, b) {
		if (a > b) {
			return true
		}
		return false
	});
	Handlebars.registerHelper('console', function (element) {
		//debugger
		console.log(element)
		return ""
	});
	Handlebars.registerHelper('sum', function (one, two) {
		return one + two;
	});
	Handlebars.registerHelper('subtract', function (one, two) {
		return one - two;
	});
	Handlebars.registerHelper('multiply', function (number, multiplier) {
		return number * multiplier;
	});
	Handlebars.registerHelper('formatNumberToFixed', function (number, toFixedValue) {
		return _formatNumberToFixed(number, toFixedValue);
	});
	Handlebars.registerHelper('multiplyToString', function (number, multiplier, isNotReturningString) {
		const result = number * multiplier;
		if (isNotReturningString) {
			return result
		}
		let formattedResult = Number.isInteger(result) ? result : result.toFixed(2)
		if (result > 0) {
			return `+${formattedResult}`
		}
		if (result < 0) {
			return String(formattedResult)
		}
		return String(formattedResult)
	});

	Handlebars.registerHelper('verifyIfChecked', function (boolean) {
		if (boolean) {
			return "checked"
		}
		return ""
	});

	// specific cases 

	Handlebars.registerHelper('verifyIfProjectResourceIsStatic', function (id) {
		const resource = game.items.get(id)
		return resource.system.isStatic
	});

}
function _formatNumberToFixed(value, toFixedValue) {
	// Se for string, tenta converter para número
	if (typeof value === 'string') {
		const num = Number(value);
		if (isNaN(num)) return value; // retorna original se não for um número válido
		return _formatNumberToFixed(num).toString();
	}

	// Se for número, formata
	if (typeof value === 'number') {
		if (Number.isInteger(value)) {
			return value;
		} else {
			return Number(value.toFixed(toFixedValue || 3));
		}
	}

	// Se não for número nem string, retorna como está
	return value;
}


export default addHandlebarsCustomHelpers
