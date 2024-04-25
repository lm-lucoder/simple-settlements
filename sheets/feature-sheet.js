class FeatureSheet extends ItemSheet {
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["sheet", "item", "simple-settlements-feature"],
			width: 520,
			height: 480,
			/* tabs: [
				{
					navSelector: ".sheet-tabs",
					contentSelector: ".sheet-body",
					initial: "description",
				},
			], */
		});
	}
	get template() {
		const path = "modules/simple-settlements/templates";
		return `${path}/feature-sheet.html`;
	}
	async getData() {
		const context = super.getData();

		const description = await this._prepareDescriptionData()

		context.description = description
		context.isObserverOrHigher = this.object.permission > 1
        
		return context;
	}
	activateListeners(html) {
		super.activateListeners(html);

		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;

		// Roll handlers, click handlers, etc. would go here.
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
}

export default FeatureSheet;
