import BuildingData from "../datamodels/building.js";
import ResourceData from "../datamodels/resource.js";
import BuildingSheet from "../sheets/building-sheet.js";
import ResourceSheet from "../sheets/resource-sheet.js";

Hooks.once("init", async function () {
	assignAndRegisterAll();
});

/* Hooks.once('ready', async function() {

}); */

function assignAndRegisterAll() {
	/* Building Assign */
	Object.assign(CONFIG.Item.dataModels, {
		"simple-settlements.building": BuildingData,
	});
	Items.registerSheet("building", BuildingSheet, {
		types: ["simple-settlements.building"],
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
