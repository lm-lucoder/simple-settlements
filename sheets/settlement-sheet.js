import SettlementAPI from "../helpers/settlementHelpers/api.js";

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
					initial: "events",
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
		const events = this.object.system.events
		const features = this.object.system.features
		const buildingsFeatures = this._getActorsFeatures(buildings)
		const eventsFeatures = this._getActorsFeatures(events)
		const importantIncome = this._buildImportantIncome()

		context.importantIncome = importantIncome
		context.buildingsFeatures = buildingsFeatures
		context.buildingsFeaturesIsNotEmpty = buildingsFeatures.length > 0
		context.eventsFeatures = eventsFeatures
		context.eventsFeaturesIsNotEmpty = eventsFeatures.length > 0
		context.features = features
		context.buildings = buildings
		context.events = events
		
		// console.log(context);

		await this._prepareDescriptionData(context);

		return context;
	}

	activateListeners(html) {
		super.activateListeners(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		html.find(".time-passage").click((ev) => {
			this.object.system.passTime()
		});

		html.find(".item-create").click(this._onItemCreate.bind(this));

		html.find(".item-edit").click((ev) => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
			item.sheet.render(true);
		});

		html.find(".item-delete").click((ev) => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
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
			const buildingId = ev.currentTarget.closest(".building-card").attributes["data-building-id"].value;
			SettlementAPI.removeBuilding(buildingId, this.object)
		})
		html.find(".quantity-control-up").click((ev)=>{
			const buildingId = ev.currentTarget.closest(".building-card").attributes["data-building-id"].value;
			SettlementAPI.addQuantityToBuilding(buildingId, this.object)
		})
		html.find(".quantity-control-down").click((ev)=>{
			const buildingId = ev.currentTarget.closest(".building-card").attributes["data-building-id"].value;
			SettlementAPI.removeQuantityToBuilding(buildingId, this.object)
		})
		html.find(".event-see").click((ev)=>{
			const eventId = ev.currentTarget.closest(".event-card").attributes["data-event-id"].value;
			game.actors.get(eventId).sheet.render(true)

		})
		html.find(".event-remove").click((ev)=>{
			const eventId = ev.currentTarget.closest(".event-card").attributes["data-event-id"].value;
			SettlementAPI.removeEvent(eventId, this.object)
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

	_addQuantityToBuilding(buildingId){
		const building = this._getBuildingById(buildingId);
		if (building) {
			this.object.setFlag('simple-settlements', `buildings.${building.id}.quantity` , building.quantity + 1);
		}
	}
	_removeQuantityToBuilding(buildingId){
		const building = this._getBuildingById(buildingId);
		if (building) {
			if (building.quantity > 0) {
				this.object.setFlag('simple-settlements', `buildings.${building.id}.quantity` , building.quantity - 1);
			} else {
				this.object.setFlag('simple-settlements', `buildings.${building.id}.quantity` , 0);	
			}
		}
	}

	_getBuildingById(id){
		const buildings = this.object.system.buildings;
		const building = buildings.find(building => building.id === id);
		return building 
	}

	_buildImportantIncome(){
		const staticIncome = this.object.system.getStaticIncome()
		const nonStaticIncome = this.object.system.getNonStaticIncome()

		const importantStaticIncome = staticIncome.filter(resource => resource.data.system.isImportant)
		const importantNonStaticIncome = nonStaticIncome.filter(resource => resource.data.system.isImportant)

		const importantIncome = {
			static: importantStaticIncome,
			nonStatic: importantNonStaticIncome
		}
		return importantIncome
	}

	async _onItemCreate(event) {
		event.preventDefault();
		const header = event.currentTarget;
		// Get the type of item to create.
		const type = header.dataset.type;
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

		// console.log(Item)
		// console.log(Item.create)
		// console.log(event)
		// console.log(event.currentTarget)

		// Finally, create the item!
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

}


export default SettlementSheet;
