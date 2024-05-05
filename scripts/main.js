import EventData from "../datamodels/event.js";
import EventSheet from "../sheets/event-sheet.js";
import BuildingData from "../datamodels/building.js";
import BuildingSheet from "../sheets/building-sheet.js";
import SettlementData from "../datamodels/settlement.js";
import SettlementSheet from "../sheets/settlement-sheet.js";
import ResourceData from "../datamodels/resource.js";
import ResourceSheet from "../sheets/resource-sheet.js";
import FeatureData from "../datamodels/feature.js";
import FeatureSheet from "../sheets/feature-sheet.js";
import DroppHandler from "../utils/dropp-handler.js"
import setupApplicationHeaderPrintButton from "../hooks/app-header-buttons.mjs";
import SimpleSettlementSettings from "../settings/world-settings.js";
import addHandlebarsCustomHelpers from "../helpers/handlebarHelpers/custom-handlebars-helpers.js";
import ProjectData from "../datamodels/project.js";
import ProjectSheet from "../sheets/project-sheet.js";

Hooks.once("init", async function () {
	assignAndRegisterAll();
	loadHandleBarTemplates();
	addHandlebarsCustomHelpers()
	setupApplicationHeaderPrintButton()
	new SimpleSettlementSettings()
});

Hooks.on("dropActorSheetData", (...args) => {
	new DroppHandler(args)
});


function assignAndRegisterAll() {
	/* Event Assign */
	Object.assign(CONFIG.Actor.dataModels, {
		"simple-settlements.event": EventData,
	});
	Actors.registerSheet("event", EventSheet, {
		types: ["simple-settlements.event"],
		makeDefault: true,
	});
	/* Event Assign */
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
	/* Project Assign */
	Object.assign(CONFIG.Actor.dataModels, {
		"simple-settlements.project": ProjectData,
	});
	Actors.registerSheet("project", ProjectSheet, {
		types: ["simple-settlements.project"],
		makeDefault: true,
	});
}

async function loadHandleBarTemplates() {
	// register templates parts
	const templatePaths = [
		"modules/simple-settlements/templates/parts/settlement-events-manager.html",
		"modules/simple-settlements/templates/parts/building-resources-manager.html",
		"modules/simple-settlements/templates/parts/building-features-manager.html",
		"modules/simple-settlements/templates/parts/event-attributes-manager.html",
		"modules/simple-settlements/templates/parts/settlement-features-manager.html",
		"modules/simple-settlements/templates/parts/settlement-projects-manager.html",
		"modules/simple-settlements/templates/parts/settlement-buildings-manager.html",
		"modules/simple-settlements/templates/parts/settlement-buildings-manager-resumed.html",
		"modules/simple-settlements/templates/parts/settlement-resources-non-static-storage.html",
		"modules/simple-settlements/templates/parts/settlement-resources-static-storage.html",
		"modules/simple-settlements/templates/parts/settlement-resources-income.html",
		"modules/simple-settlements/templates/parts/settlement-resources-income-tooltip.html",
		"modules/simple-settlements/templates/parts/settlement-important-resources-income.html",
		"modules/simple-settlements/templates/parts/project-configurations.html",
		"modules/simple-settlements/templates/configs/settlement-config.html",
		"modules/simple-settlements/templates/configs/settlement-permissions-form-app.html"
	];
	return loadTemplates(templatePaths);
}

