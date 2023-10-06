class EventSheet extends ActorSheet {
    static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["sheet", "actor", "simple-settlements-event"],
			width: 520,
			height: 480,
			tabs: [
				{
					navSelector: ".sheet-tabs",
					contentSelector: ".sheet-body",
					initial: "attributes",
				},
			],
		});
	}
    get template(){
        const path = "modules/simple-settlements/templates"
        return `${path}/event-sheet.html`
    }
	async getData(){
		const context = super.getData()

		const description = await this._prepareDescriptionData()
		const features = this.object.system.features

		this.checkAndReRenderOpenedSettlements()

		context.resources = this.actor.system.resources
		context.categories = this.actor.system.categories
		context.description = description
		context.features = features
		context.isObserverOrHigher = this.object.permission > 1

		context.natureChoices = {
			groupName: "eventNatureChoice",
			choices: {neutral: "Neutral", good: "Good", evil: "Evil"},
			chosen: this.actor.system.nature
		}
		
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

		// Handle event nature change
		html.find("[name='eventNatureChoice']").change(async (ev) => {
			const choice = ev.target.value
			await this.actor.update({system: {nature: choice}})
			console.log(this.actor.system)
		});

		
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

	checkAndReRenderOpenedSettlements(){
        const settlements = game.actors.contents.filter(actor => actor.type === "simple-settlements.settlement")
        settlements.forEach(settlement => {
          if (settlement.sheet.rendered) {
            settlement.sheet.render()
          }
        })
      }
}

export default EventSheet