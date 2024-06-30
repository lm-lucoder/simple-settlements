import BuildingDrop from "../helpers/buildingHelpers/drop.js";

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
					initial: "features",
				},
			],
		});
	}
    get template(){
        const path = "modules/simple-settlements/templates"
        return `${path}/building-sheet.html`
    }
	async getData(){
		const context = super.getData()
		console.log(context);

		const description = await this._prepareDescriptionData()
		const features = this.object.system.features

		// this._enrichFeatures(features)
		this.checkAndReRenderOpenedSettlements()

		context.system = this.actor.system
		context.resources = this.actor.system.resources
		context.categories = this.actor.system.categories
		context.description = description
		context.features = features
		context.isObserverOrHigher = this.object.permission > 1
		
		// console.log(context)
		return context
	}

	activateListeners(html) {
		super.activateListeners(html);

		// Render the item sheet for viewing/editing prior to the editable check.
		

		// -------------------------------------------------------------
		// Everything below here is only needed if the sheet is editable
		if (!this.isEditable) return;
		
		html.find(".item-edit").click((ev) => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
			item.sheet.render(true);
		});

		// Add Inventory Item
		html.find(".item-create").click(this._onItemCreate.bind(this));

		html.find(".item-feature-send").click(this._onFeatureSend.bind(this));

		// Delete Inventory Item
		html.find(".item-delete").click((ev) => {
			const li = $(ev.currentTarget).parents(".item");
			const item = this.actor.items.get(li.data("itemId"));
			item.delete();
			li.slideUp(200, () => this.render(false));
		});
		/* html.find(".resource-checkbox-consumes").change(e => {
			const checkboxConsumesChecked = e.target.checked
			const card = e.target.closest(".project-card-resource-requirement")
			const resourceId = card.getAttribute("elementId")
			const [section, type] = card.getAttribute("elementType").split("-")
			const resources = this.object.system[section].resources
			const resourceIndex = resources.findIndex(resource => resource.id === resourceId)
			resources[resourceIndex].consumes = checkboxConsumesChecked

			this.object.update({ system: {[section]: {resources: [...resources]}} })
			// console.log(this.object.system.requirements.resources)
		}) */
		html.find(".building-requirement-quantity-change").change(e => {
			const card = e.target.closest(".project-card")
			const elementId = card.getAttribute("elementId")
			const [section, type] = card.getAttribute("elementType").split("-")
			const elements = this.object.system[section][type]
			const elementIndex = elements.findIndex(el => el.id === elementId)
			elements[elementIndex].quantity = e.target.value
			this.object.update({ system: {[section]: {[type]: [...elements]}} })
		})

		html.find(".resource-checkbox-breaks").change(e => {
			const checkboxConsumesChecked = e.target.checked
			const card = e.target.closest(".project-card-resource-requirement")
			const resourceId = card.getAttribute("elementId")
			const [section, type] = card.getAttribute("elementType").split("-")
			const resources = this.object.system[section].resources
			const resourceIndex = resources.findIndex(resource => resource.id === resourceId)
			resources[resourceIndex].breaks = checkboxConsumesChecked

			this.object.update({ system: {[section]: {resources: [...resources]}} })
			// console.log(this.object.system.requirements.resources)
		})
		html.find(".delete-config-btn").click(e => {
			const card = e.target.closest(".project-card")
			const [section, type] = card.getAttribute("elementType").split("-")
			const id = card.getAttribute("elementId")
			const types = this.object.system[section][type]
			const toRemoveIndex = types.findIndex(element => element.id === id)
			types.splice(toRemoveIndex, 1)
			this.object.update({ system: { [section]: { [type]: [...types] } } })
		})
		
	}

	_onFeatureSend(event){
		event.preventDefault();
		const li = $(event.currentTarget).parents(".feature-card")
		const feature = this.actor.items.get(li.data("itemId"));

		console.log(feature)
		
		ChatMessage.create({
			user: this.object.id,
			speaker: ChatMessage.getSpeaker({actor: game.user}),
			content: `
			<div class="feature-chat-card">
				<div class="card-info">
					<h2>${feature.name}</h2>
					<span class="building-reference">From: <a class="content-link" draggable="true" data-uuid="Actor.${this.object.id}" data-id="${this.object.id}" data-type="Actor" data-tooltip="Actor">${this.object.name}</a></span>
				</div>
				<span class="feature-description">${feature.system.description}</span>
			</div>
			`
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

	async _prepareDescriptionData(){
		return await TextEditor.enrichHTML(
			this.object.system.description,
			{
				async: true,
				secrets: this.object.isOwner,
				relativeTo: this.object,
			}
		);
	}
	async _onDropItem(e, data) {
		const hasBeenCreated = await BuildingDrop.itemDrop(e, data, this)
		if(!hasBeenCreated){
			super._onDropItem(e, data)
		}
	}

	/* prepareFeaturesData(){
		const features = this.actor.system.features
	} */
	/* async _enrichFeatures(features){
        for (let i = 0; i < features.length; i++) {
          const feature = features[i];
          const description = await TextEditor.enrichHTML(
            feature.system.description,
            {
              async: true,
              secrets: this.parent.isOwner,
              relativeTo: this.parent,
            }
          );
          feature.system.description	= description;
        }
      } */

	checkAndReRenderOpenedSettlements(){
        const settlements = game.actors.contents.filter(actor => actor.type === "simple-settlements.settlement")
        settlements.forEach(settlement => {
          if (settlement.sheet.rendered) {
            settlement.sheet.render()
          }
        })
      }
}

export default BuildingSheet