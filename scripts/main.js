import BuildingData from "../datamodels/building.js";
import ResourceData from "../datamodels/resource.js";
import BuildingSheet from "../sheets/building-sheet.js";
import ResourceSheet from "../sheets/resource-sheet.js";
import SettlementData from "../datamodels/settlement.js";
import SettlementSheet from "../sheets/settlement-sheet.js";

Hooks.once("init", async function () {
	assignAndRegisterAll();
	loadHandleBarTemplates();
	addHandlebarsCustomHelpers()
});

Hooks.on("dropActorSheetData", (...args) => {
	const targetDocument = args[0];
	const originDocument = game.actors.get(args[2].uuid.replace("Actor.", ""));

	const data = {
		settlement: targetDocument,
		building: originDocument,
	};
	if (
		data.building.type == "simple-settlements.building" && data.settlement.type == "simple-settlements.settlement"
	) {
		targetDocument.system._handleBuildingDrop(data.building);
	}
});

Hooks.on("getActorSheetHeaderButtons", (app,button)=>{
	console.log("Renderizou ator header")
	console.log(app)
	console.log(button)
})

/* Hooks.once('ready', async function() {

}); */

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
}

async function loadHandleBarTemplates() {
	// register templates parts
	const templatePaths = [
		"modules/simple-settlements/templates/parts/building-resources-manager.html",
		"modules/simple-settlements/templates/parts/settlement-buildings-manager.html",
		// "modules/simple-settlements/templates/parts/settlement-buildings-manager-card-details.html"
	];
	return loadTemplates(templatePaths);
}

function addHandlebarsCustomHelpers(){
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