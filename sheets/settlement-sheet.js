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
					initial: "description",
				},
			],
		});
	}
    get template(){
        const path = "modules/simple-settlements/templates"
        return `${path}/settlement-sheet.html`
    }
	getData(){
		const context = super.getData()
		return context
	}

	activateListeners(html) {

	}
}

export default SettlementSheet