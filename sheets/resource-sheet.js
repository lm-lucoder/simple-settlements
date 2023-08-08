class ResourceSheet extends ItemSheet {
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
		  classes: ["sheet", "item", "simple-settlements-resource"],
		  width: 520,
		  height: 480,
		  tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "description" }]
		});
	  }
	get template() {
		const path = "modules/simple-settlements/templates";
		return `${path}/resource-sheet.html`;
	}
	getData() {
		const data = super.getData();
        console.log(data);
		return data;
	}
	activateListeners(html) {
		super.activateListeners(html);
	  
		// Everything below here is only needed if the sheet is editable
		if (!this.options.editable) return;
	  
		// Roll handlers, click handlers, etc. would go here.
	  }
}

export default ResourceSheet;
