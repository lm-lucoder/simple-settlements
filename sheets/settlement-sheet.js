import SettlementAPI from "../helpers/settlementHelpers/api.js";
import Income from "../helpers/settlementHelpers/income.js";
import TimePasser from "../helpers/settlementHelpers/time-passer.js";
import SimpleSettlementSettings from "../settings/world-settings.js";

class SettlementSheet extends ActorSheet {
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["sheet", "actor", "simple-settlements-settlement"],
			width: 520,
			height: 480,
			tabs: [
				{
					navSelector: ".sheet-tabs",
					contentSelector: ".sheet-body",
					initial: "projects",
				},
				{
					navSelector: ".resources-tabs",
					contentSelector: ".resources-container",
					initial: "income",
				},
			],
		});
	}
	get template() {
		const path = "modules/simple-settlements/templates";
		return `${path}/settlement-sheet.html`;
	}
	async getData() {
		const context = await super.getData();

		const buildings = this.object.system.buildings
		const projects = this.object.system.projects
		const events = this.object.system.events
		const resources = this.object.system.resources
		const features = this.object.system.features

		const buildingsFeatures = this._getActorsFeatures(buildings)
		const eventsFeatures = this._getEventFeatures(events)
		const income = Income.init(this.object);
		const importantIncome = this._buildImportantIncome(income)

		this.income = income;

		context.importantIncome = importantIncome
		context.buildingsFeatures = buildingsFeatures
		context.buildingsFeaturesIsNotEmpty = buildingsFeatures.length > 0
		context.eventsFeatures = eventsFeatures
		context.eventsFeaturesIsNotEmpty = eventsFeatures.length > 0
		context.features = features
		context.buildings = buildings
		context.projects = projects
		context.income = income
		context.events = events
		context.isObserverOrHigher = this.object.permission > 1

		await this._prepareDescriptionData(context);
		console.log(context)
		return context;
	}

	passTime(){
		TimePasser.init(this.object, this.income)
	}

	activateListeners(html) {
		super.activateListeners(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		html.find(".time-passage").click((ev) => {
			if (SimpleSettlementSettings.verify("gmOnlyPassTurn")) return;
			this.passTime()
		});

		html.find(".item-create").click(this._onItemCreate.bind(this));

		html.find(".item-edit").click((ev) => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
			if (item.type === "simple-settlements.feature") {
				if (SimpleSettlementSettings.verify("gmOnlyModifyFeatures")) return;
			}
			if (item.type === "simple-settlements.resource") {
				if (SimpleSettlementSettings.verify("gmOnlyModifyResources")) return;
			}
			item.sheet.render(true);
		});

		html.find(".item-delete").click((ev) => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
			if (item.type === "simple-settlements.feature") {
				if (SimpleSettlementSettings.verify("gmOnlyModifyFeatures")) return;
			}
			if (item.type === "simple-settlements.resource") {
				if (SimpleSettlementSettings.verify("gmOnlyModifyResources")) return;
			}
			item.delete();
			li.slideUp(200, () => this.render(false));
		});

		html.find(".feature-item-see").click((ev)=>{
			const buildingId = ev.currentTarget.closest(".feature-card").attributes["data-building-id"].value;
			game.actors.get(buildingId).sheet.render(true)

		})
		html.find(".item-see").click((ev)=>{
			const buildingId = ev.currentTarget.closest(".building-card").attributes["data-building-id"].value;
			game.actors.get(buildingId).sheet.render(true)

		})
		html.find(".item-remove").click((ev)=>{
			if (SimpleSettlementSettings.verify("gmOnlyRemoveBuilding")) return;
			const buildingId = ev.currentTarget.closest(".building-card").attributes["data-building-id"].value;
			SettlementAPI.removeBuilding(buildingId, this.object)
		})
		html.find(".quantity-control-up").click((ev)=>{
			if (SimpleSettlementSettings.verify("gmOnlyModifyBuildingQt")) return;
			const buildingId = ev.currentTarget.closest(".building-card").attributes["data-building-id"].value;
			SettlementAPI.addQuantityToBuilding(buildingId, this.object)
		})
		html.find(".quantity-control-down").click((ev)=>{
			if (SimpleSettlementSettings.verify("gmOnlyModifyBuildingQt")) return;
			const buildingId = ev.currentTarget.closest(".building-card").attributes["data-building-id"].value;
			SettlementAPI.removeQuantityToBuilding(buildingId, this.object)
		})
		html.find(".event-see").click((ev)=>{
			const eventId = ev.currentTarget.closest(".event-card").attributes["data-event-id"].value;
			game.actors.get(eventId).sheet.render(true)

		})
		html.find(".event-remove").click((ev)=>{
			if (SimpleSettlementSettings.verify("gmOnlyRemoveEvents")) return;
			const eventId = ev.currentTarget.closest(".event-card").attributes["data-event-id"].value;
			SettlementAPI.removeEvent(eventId, this.object)
		})
		html.find(".project-see").click((ev)=>{
			const projectId = ev.currentTarget.closest(".st-project-card").attributes["data-project-id"].value;
			game.actors.get(projectId).sheet.render(true)

		})
		html.find(".project-remove").click((ev)=>{
			if (SimpleSettlementSettings.verify("gmOnlyRemoveProjects")) return;
			const projectId = ev.currentTarget.closest(".st-project-card").attributes["data-project-id"].value;
			SettlementAPI.removeProject(projectId, this.object)
		})
	}
	async _prepareDescriptionData(context){
		context.description = await TextEditor.enrichHTML(
			this.object.system.description,
			{
				async: true,
				secrets: this.object.isOwner,
				relativeTo: this.object,
			}
		);
	}

	_getBuildingById(id){
		const buildings = this.object.system.buildings;
		const building = buildings.find(building => building.id === id);
		return building 
	}

	_buildImportantIncome(income){
		const staticIncome = this._getStaticIncome(income)
		const nonStaticIncome = this._getNonStaticIncome(income)

		const importantStaticIncome = staticIncome.filter(resource => resource.data.system.isImportant)
		const importantNonStaticIncome = nonStaticIncome.filter(resource => resource.data.system.isImportant)

		const importantIncome = {
			static: importantStaticIncome,
			nonStatic: importantNonStaticIncome
		}
		return importantIncome
	}
	_getStaticIncome(income){
		return Object.values(income.all).filter(resource => resource.data.system.isStatic)
	}
	_getNonStaticIncome(income){
		return Object.values(income.all).filter(resource => !resource.data.system.isStatic)
	}

	async _onItemCreate(event) {
		event.preventDefault();
		const header = event.currentTarget;
		// Get the type of item to create.
		const type = header.dataset.type;

		if (type === "simple-settlements.feature") {
			if (SimpleSettlementSettings.verify("gmOnlyAddFeatures")) return;
		}
		if (type === "simple-settlements.resource") {
			if (SimpleSettlementSettings.verify("gmOnlyAddResources")) return;
		}
		// Grab any data associated with this control.
		const data = duplicate(header.dataset);
		// Initialize a default name.
		const name = `New ${type.replace("simple-settlements.", "")}`;
		// Prepare the item object.
		const itemData = {
			name: name,
			type: type,
			system: data,
		};
		// Remove the type from the dataset since it's in the itemData.type prop.
		delete itemData.system["type"];

		return await Item.create(itemData, { parent: this.actor });
	}

	_getActorsFeatures(actors){
		const features = []

		actors.forEach(actor => {
		  actor.system.features.forEach(feature => {
			features.push(feature)
		  })
		})
		return features
	}

	_getEventFeatures(events){
		const features = []

		events.forEach(actor => {
		  actor.system.features.forEach(feature => {
			features.push(feature)
		  })
		})
		return features
	}

	_onDropActor(e, data){
		const actor = game.actors.get(data.uuid.replace("Actor.", ""))
		if (actor.type === "simple-settlements.project") {
			if (SimpleSettlementSettings.verify("gmOnlyRemoveProjects")) return;
			this.object.system.api.addProject(actor, this.object)
		}
	}

}


export default SettlementSheet;
