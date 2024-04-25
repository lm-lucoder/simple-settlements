function addHandlebarsCustomHelpers(){
	Handlebars.registerHelper('arrayLenghtHigherThan', function (array, number) {
		if (array.length > number) {
			return true
		}
		return false
	});
	Handlebars.registerHelper('console', function (element) {
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
	Handlebars.registerHelper('multiplyToString', function (number, multiplier, isNotReturningString) {
		const result = number * multiplier;
		if (isNotReturningString) {
			return result
		}
		if (result > 0) {
			return `+${result}`
		}
		if (result < 0) {
			return String(result)
		}
		return String(result)
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

export default addHandlebarsCustomHelpers
