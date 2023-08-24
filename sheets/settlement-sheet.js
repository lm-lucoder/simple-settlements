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
					initial: "buildings",
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
		context.buildings = context.actor.system.buildings;
		
		console.log(context);

		await this._prepareDescriptionData(context);

		return context;
	}

	activateListeners(html) {
		super.activateListeners(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		html.find(".time-passage").click((ev) => {
			this.object.system._passTime()
		});

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

		html.find(".item-see").click((ev)=>{
			const buildingId = ev.currentTarget.closest(".building-card").attributes["data-building-id"].value;
			game.actors.get(buildingId).sheet.render(true)

		})
		html.find(".item-remove").click((ev)=>{
			const buildingId = ev.currentTarget.closest(".building-card").attributes["data-building-id"].value;
			this.object.unsetFlag("simple-settlements", `buildings.${buildingId}`);
		})
		html.find(".quantity-control-up").click((ev)=>{
			const buildingId = ev.currentTarget.closest(".building-card").attributes["data-building-id"].value;
			this._addQuantityToBuilding(buildingId)
			
		})
		html.find(".quantity-control-down").click((ev)=>{
			const buildingId = ev.currentTarget.closest(".building-card").attributes["data-building-id"].value;
			this._removeQuantityToBuilding(buildingId)
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

}

export default SettlementSheet;
