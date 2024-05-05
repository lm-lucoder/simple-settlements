function addHandlebarsCustomHelpers(){
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

export default addHandlebarsCustomHelpers
