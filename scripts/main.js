import BuildingData from "../datamodels/building.js";
import BuildingSheet from "../sheets/building-sheet.js";
import SettlementData from "../datamodels/settlement.js";
import SettlementSheet from "../sheets/settlement-sheet.js";
import ResourceData from "../datamodels/resource.js";
import ResourceSheet from "../sheets/resource-sheet.js";
import FeatureData from "../datamodels/feature.js";
import FeatureSheet from "../sheets/feature-sheet.js";

Hooks.once("init", async function () {
	console.log("INICIOU")
	assignAndRegisterAll();
	loadHandleBarTemplates();
	addHandlebarsCustomHelpers()
});

Hooks.on("dropActorSheetData", (...args) => {
	const origin = args[2]
	const target = args[0]
	console.log(args)
	if (target.type === "simple-settlements.settlement" && origin.type === "Actor") {
		const building = game.actors.get(args[2].uuid.replace("Actor.", ""));
		if (!building.type === "simple-settlements.building") {
			return
		}
		const data = {
			settlement: target,
			building: building,
		};
		console.log(data)
		data.settlement.system._handleBuildingDrop(data.building);
	}
});


function assignAndRegisterAll() {
	/* Building Assign */
	Object.assign(CONFIG.Actor.dataModels, {
		"simple-settlements.building": BuildingData,
	});
	Actors.registerSheet("building", BuildingSheet, {
		types: ["simple-settlements.building"],
		makeDefault: true,
	});
	/* Settlement Assign */
	Object.assign(CONFIG.Actor.dataModels, {
		"simple-settlements.settlement": SettlementData,
	});
	Actors.registerSheet("settlement", SettlementSheet, {
		types: ["simple-settlements.settlement"],
		makeDefault: true,
	});
	/* Resource Assign */
	Object.assign(CONFIG.Item.dataModels, {
		"simple-settlements.resource": ResourceData,
	});
	Items.registerSheet("resource", ResourceSheet, {
		types: ["simple-settlements.resource"],
		makeDefault: true,
	});
	/* Feature Assign */
	Object.assign(CONFIG.Item.dataModels, {
		"simple-settlements.feature": FeatureData,
	});
	Items.registerSheet("feature", FeatureSheet, {
		types: ["simple-settlements.feature"],
		makeDefault: true,
	});
}

async function loadHandleBarTemplates() {
	// register templates parts
	const templatePaths = [
		"modules/simple-settlements/templates/parts/building-resources-manager.html",
		"modules/simple-settlements/templates/parts/building-features-manager.html",
		"modules/simple-settlements/templates/parts/settlement-features-manager.html",
		"modules/simple-settlements/templates/parts/settlement-buildings-manager.html",
		"modules/simple-settlements/templates/parts/settlement-resources-non-static-storage.html",
		"modules/simple-settlements/templates/parts/settlement-resources-static-storage.html",
		"modules/simple-settlements/templates/parts/settlement-resources-income.html",
		"modules/simple-settlements/templates/parts/settlement-important-resources-income.html"
	];
	return loadTemplates(templatePaths);
}

function addHandlebarsCustomHelpers(){
	Handlebars.registerHelper('sum', function (one, two) {
		return one + two;
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
}