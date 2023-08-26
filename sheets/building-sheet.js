class BuildingSheet extends ActorSheet {
    static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["sheet", "actor", "simple-settlements-building"],
			width: 520,
			height: 480,
			tabs: [
				{
					navSelector: ".sheet-tabs",
					contentSelector: ".sheet-body",
					initial: "resources",
				},
			],
		});
	}
    get template(){
        const path = "modules/simple-settlements/templates"
        return `${path}/building-sheet.html`
    }
	async getData(){
		// console.log(this);
		const context = super.getData()
		this._prepareResources(context)
		this._prepareResourcesCategories(context)
		await this._prepareDescriptionData(context)
		// await this._prepareFeaturesData(context)
		console.log(context)
		return context
	}

	activateListeners(html) {
		super.activateListeners(html);

		// Render the item sheet for viewing/editing prior to the editable check.
		html.find(".item-edit").click((ev) => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
			item.sheet.render(true);
		});

		// -------------------------------------------------------------
		// Everything below here is only needed if the sheet is editable
		if (!this.isEditable) return;

		// Add Inventory Item
		html.find(".item-create").click(this._onItemCreate.bind(this));

		// Delete Inventory Item
		html.find(".item-delete").click((ev) => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
			item.delete();
			li.slideUp(200, () => this.render(false));
		});

		
	}

	async _onItemCreate(event) {
		event.preventDefault();
		const header = event.currentTarget;
		// Get the type of item to create.
		const type = header.dataset.type;
		// Grab any data associated with this control.
		const data = duplicate(header.dataset);
		// Initialize a default name.
		const name = `New resource`;
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

	_prepareResources(context){
		context.resources = this.actor.system.resources
	}

	_prepareResourcesCategories(context){
		context.categories = this.actor.system.categories
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

	/* async _prepareFeaturesData(context){
		const features = this.object.system.features
		const enrichedFeatures = []
		for (let i = 0; i < features.length; i++) {
			const element = features[i];
			const description = await TextEditor.enrichHTML(
				element.description,
				{
					async: true,
					secrets: this.object.isOwner,
					relativeTo: this.object,
				}
			);
			enrichedFeatures.push({
				title: element.title,
				description: description,
				index: i
			})
		}
		context.features = enrichedFeatures;
	} */
}

export default BuildingSheet