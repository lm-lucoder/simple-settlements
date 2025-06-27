import SettlementAPI from "../helpers/settlementHelpers/api.js";
import Income from "../helpers/settlementHelpers/income.js";
import TimePasser from "../helpers/settlementHelpers/time-passer.js";
import SimpleSettlementSettings from "../settings/world-settings.js";
import formatNumber from "../utils/format-number.js";

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
					initial: "log",
				},
				{
					navSelector: ".resources-tabs",
					contentSelector: ".resources-container",
					initial: "income",
				},
				{
					navSelector: ".buildings-tabs",
					contentSelector: ".buildings-container",
					initial: "resumed",
				},
			],
			dragDrop: [
				{ dragSelector: ".item-list .item", dropSelector: null },
				{ dragSelector: ".items-resources-list .item-resource-card", dropSelector: null },
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
		const log = this.object.system.log.reverse()

		await this._verifyBuildingsRequirements(buildings, context)

		const income = Income.init(context);
		const importantIncome = this._buildImportantIncome(income)

		const categorizedResources = this._arrangeResourcesByCategories(context.items.filter(item => item.type == "simple-settlements.resource"))
		const categorizedBuildings = this._arrangeBuildingsByCategories(buildings)
		const buildingsFeatures = this._getActorsFeatures(buildings)
		const eventsFeatures = this._getEventFeatures(events)

		this.income = income;


		context.categorizedResources = categorizedResources
		context.categorizedBuildings = categorizedBuildings
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
		context.log = log
		context.isObserverOrHigher = this.object.permission > 1

		await this._prepareDescriptionData(context);
		console.log(context)
		return context;
	}

	passTime() {
		TimePasser.init(this.object, this.income)
	}

	activateListeners(html) {
		super.activateListeners(html);
		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		$(".resource-card-input").on('change', (ev) => {
			ev.preventDefault()
			if (SimpleSettlementSettings.verify("gmOnlyModifyResources")) return;
			const newValue = ev.target.value
			const itemId = ev.target.closest(".item-resource-card").getAttribute("data-item-id")
			const resource = this.object.system.resources.find(item => item.id == itemId)
			const oldValue = resource.system.quantity
			resource.update({ ['system.quantity']: newValue })
			SettlementAPI.addToLog(`Resource ${resource.name} value changed from ${oldValue} to ${newValue}`, this.object)
		})

		$(".buildings-list").on('drop', (ev) => {
			ev.preventDefault();
			var draggedItemId = ev.originalEvent.dataTransfer.getData("text/plain");
			var droppedItemId = ev.target.closest(".building-card")?.attributes["data-building-id"]?.value;
			if (!droppedItemId) return
			const rawBuildings = this.object.system.raw.buildings
			const draggedIndex = rawBuildings.findIndex(obj => obj.id === draggedItemId);
			const droppedIndex = rawBuildings.findIndex(obj => obj.id === droppedItemId);
			if (draggedIndex === -1 || droppedIndex === -1) return
			const temp = rawBuildings[draggedIndex];
			rawBuildings[draggedIndex] = rawBuildings[droppedIndex];
			rawBuildings[droppedIndex] = temp;
			this.object.update({ system: { raw: { buildings: [...rawBuildings] } } })

		});

		// Adiciona eventos de arrastar para os itens da lista
		$(".buildings-list li").on('dragstart', (ev) => {
			// Define o ID do elemento arrastado
			ev.originalEvent.dataTransfer.setData("text/plain", ev.target.attributes["data-building-id"].value);

		});

		html.find(".time-passage").click((ev) => {
			if (SimpleSettlementSettings.verify("gmOnlyPassTurn")) return;
			this.passTime()
			SettlementAPI.addToLog(`Time passed`, this.object)
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
			SettlementAPI.addToLog(`Item ${item.name} manually removed`, this.object)
		});

		html.find(".feature-item-see").click((ev) => {
			const buildingId = ev.currentTarget.closest(".feature-card").attributes["data-building-id"].value;
			game.actors.get(buildingId).sheet.render(true)

		})
		html.find(".item-see").click((ev) => {
			const buildingId = ev.currentTarget.closest(".building-card").attributes["data-building-id"].value;
			game.actors.get(buildingId).sheet.render(true)

		})
		html.find(".item-remove").click((ev) => {
			if (SimpleSettlementSettings.verify("gmOnlyRemoveBuilding")) return;
			const buildingId = ev.currentTarget.closest(".building-card").attributes["data-building-id"].value;
			SettlementAPI.removeBuilding(buildingId, this.object)
			const building = Actor.get(buildingId)
			SettlementAPI.addToLog(`${building.name} manually removed`, this.object)
		})
		html.find(".building-toggle-activation").change((ev) => {
			if (SimpleSettlementSettings.verify("gmOnlyModifyBuildingQt")) return;
			const buildingId = ev.currentTarget.closest(".building-card").attributes["data-building-id"].value;
			const building = Actor.get(buildingId)
			const checkBoxValue = ev.currentTarget.checked
			SettlementAPI.setBuildingActivation(buildingId, this.object, checkBoxValue)
			if (checkBoxValue) {
				SettlementAPI.addToLog(`${building.name} has been manually deactivated`, this.object)
			} else {
				SettlementAPI.addToLog(`${building.name} has been manually activated`, this.object)
			}
		})
		html.find(".quantity-control-up").click((ev) => {
			if (SimpleSettlementSettings.verify("gmOnlyModifyBuildingQt")) return;
			const buildingId = ev.currentTarget.closest(".building-card").attributes["data-building-id"].value;
			SettlementAPI.addQuantityToBuilding(buildingId, this.object)
			const building = Actor.get(buildingId)
			SettlementAPI.addToLog(`${building.name} quantity manually increased`, this.object)
		})
		html.find(".quantity-control-down").click((ev) => {
			if (SimpleSettlementSettings.verify("gmOnlyModifyBuildingQt")) return;
			const buildingId = ev.currentTarget.closest(".building-card").attributes["data-building-id"].value;
			SettlementAPI.removeQuantityToBuilding(buildingId, this.object)
			const building = Actor.get(buildingId)
			SettlementAPI.addToLog(`${building.name} quantity manually decreased`, this.object)
		})
		html.find(".event-see").click((ev) => {
			const eventId = ev.currentTarget.closest(".event-card").attributes["data-event-id"].value;
			game.actors.get(eventId).sheet.render(true)

		})
		html.find(".event-remove").click((ev) => {
			if (SimpleSettlementSettings.verify("gmOnlyRemoveEvents")) return;
			const eventId = ev.currentTarget.closest(".event-card").attributes["data-event-id"].value;
			SettlementAPI.removeEvent(eventId, this.object)
			const event = Actor.get(eventId)
			SettlementAPI.addToLog(`${event.name} manually removed`, this.object)
		})
		html.find(".project-see").click((ev) => {
			const projectId = ev.currentTarget.closest(".st-project-card").attributes["data-project-id"].value;
			game.actors.get(projectId).sheet.render(true)

		})
		html.find(".project-remove").click((ev) => {
			if (SimpleSettlementSettings.verify("gmOnlyRemoveProjects")) return;
			const projectId = ev.currentTarget.closest(".st-project-card").attributes["data-project-id"].value;
			SettlementAPI.removeProject(projectId, this.object)
			const project = Actor.get(projectId)
			SettlementAPI.addToLog(`${project.name} manually removed`, this.object)
		})
		html.find(".remove-log-btn").click((ev) => {
			const logMessageId = ev.currentTarget.closest(".log-card").attributes["data-log-index"].value;
			SettlementAPI.removeFromLog(logMessageId, this.object)
		})
		html.find(".erase-log").click((ev) => {
			SettlementAPI.eraseLog(this.object)
		})
	}
	async _prepareDescriptionData(context) {
		context.description = await TextEditor.enrichHTML(
			this.object.system.description,
			{
				async: true,
				secrets: this.object.isOwner,
				relativeTo: this.object,
			}
		);
	}

	_getBuildingById(id) {
		const buildings = this.object.system.buildings;
		const building = buildings.find(building => building.id === id);
		return building
	}

	_buildImportantIncome(income) {

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
	_getStaticIncome(income) {
		const resources = Object.values(income.all).filter(resource => resource.data.system.isStatic)
		resources.forEach(resource => { resource.income = formatNumber(resource.income) })
		return resources
	}
	_getNonStaticIncome(income) {
		const resources = Object.values(income.all).filter(resource => !resource.data.system.isStatic)
		resources.forEach(resource => { resource.income = formatNumber(resource.income) })
		return resources
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

	_onSortItem(event, itemData) {

		// Get the drag source and drop target
		const items = this.actor.items;
		const source = items.get(itemData._id);
		const dropTarget = event.target.closest("[data-item-id]");
		if (!dropTarget) return;
		const target = items.get(dropTarget.dataset.itemId);

		// Don't sort on yourself
		if (source.id === target.id) return;

		// Identify sibling items based on adjacent HTML elements
		const siblings = [];
		for (let el of dropTarget.parentElement.children) {
			const siblingId = el.dataset.itemId;
			if (siblingId && (siblingId !== source.id)) siblings.push(items.get(el.dataset.itemId));
		}

		// Perform the sort
		const sortUpdates = SortingHelpers.performIntegerSort(source, { target, siblings });
		const updateData = sortUpdates.map(u => {
			const update = u.update;
			update._id = u.target._id;
			return update;
		});

		// Perform the update
		return this.actor.updateEmbeddedDocuments("Item", updateData);
	}

	_arrangeResourcesByCategories(resources) {
		const resourcesByCategories = {
			static: {},
			nonStatic: {}
		}
		resources.forEach(resource => {
			if (resource.system.isStatic) {
				if (resourcesByCategories.static[resource.system.category]) {
					resourcesByCategories.static[resource.system.category].resources.push(resource)
				} else {
					resourcesByCategories.static[resource.system.category] = {
						name: resource.system.category,
						resources: [resource]
					}
				}
			} else {
				if (resourcesByCategories.nonStatic[resource.system.category]) {
					resourcesByCategories.nonStatic[resource.system.category].resources.push(resource)
				} else {
					resourcesByCategories.nonStatic[resource.system.category] = {
						name: resource.system.category,
						resources: [resource]
					}
				}
			}
		})
		return resourcesByCategories
	}
	_arrangeBuildingsByCategories(buildings) {
		const buildingsByCategories = {}
		buildings.forEach(building => {

			if (buildingsByCategories[building.system.category]) {
				buildingsByCategories[building.system.category].buildings.push(building)
			} else {
				buildingsByCategories[building.system.category] = {
					name: building.system.category,
					buildings: [building]
				}
			}
		})
		return buildingsByCategories
	}

	_getActorsFeatures(actors) {
		const features = []


		actors.forEach(actor => {
			if (actor.isInactive) return
			actor.system.features.forEach(feature => {
				features.push(feature)
			})
		})
		return features
	}

	_getEventFeatures(events) {
		const features = []

		events.forEach(actor => {
			actor.system.features.forEach(feature => {
				features.push(feature)
			})
		})
		return features
	}

	async _verifyBuildingsRequirements(buildings, context) {
		const atemporalIncome = Income.init(context)
		for (let building of buildings) {
			if (building.system.requirements.resources.length == 0) return;
			const requirementPassed = await building.system.api.verifyRequirements(this.object, atemporalIncome)
			if (!requirementPassed) {
				this.object.system.api.setBuildingActivation(building.id, this.object, true)
				const message = `Building ${building.name} is requiring missing resources. The building will be deactivated.`
				ui.notifications.info(message)
				//SettlementAPI.addToLog(message,this.object)
			}
		}
	}

	_onDropActor(e, data) {
		const actor = game.actors.get(data.uuid.replace("Actor.", ""))
		if (actor.type === "simple-settlements.project") {
			if (SimpleSettlementSettings.verify("gmOnlyAddProjects")) return;
			this.object.system.api.addProject(actor, this.object)
		}
	}

	_onDropItem(e, data) {
		const itemId = data?.uuid.split(".")[1]
		if (!itemId) return super._onDropItem(e, data);
		const item = Item.get(itemId)
		if (!item) return super._onDropItem(e, data)
		if (
			item.type == 'simple-settlements.resource'
			&& !item.isOwned
			&& SimpleSettlementSettings.verify("gmOnlyAddResources")
		) {
			return e.preventDefault()
		}
		super._onDropItem(e, data)
	}

}


export default SettlementSheet;
