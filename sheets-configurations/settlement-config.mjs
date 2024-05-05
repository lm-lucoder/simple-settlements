export default class SettlementConfig extends FormApplication {
	constructor(settlementSheet) {
		super();
		this.settlementSheet = settlementSheet;
	}
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["form"],
			popOut: true,
			id: "settlement-config-form",
			title: "Settlement configurations",
			width: 400,
			tabs: [
				{
					navSelector: ".form-tabs",
					contentSelector: ".form-body",
					initial: "macros",
				},
			],
		});
	}

	get template() {
		const path = "modules/simple-settlements/templates/configs";
		return `${path}/settlement-config.html`;
	}

	getData() {
		// Send data to the template
		const settlement = this.settlementSheet.object;
		const system = settlement.system;
		const macros = system.options.macros;
		return {
			macros,
			system,
			settlement,
			settlementSheet: this.settlementSheet,
		};
	}

	activateListeners(html) {
		super.activateListeners(html);
	}

	async _updateObject(event, formData) {
		const settlement = this.settlementSheet.object;

		Object.keys(formData).forEach((key) => {
			if (key === "incomeMacros" || key === "turnMacros") {
				return ConfigManager.addMacro(settlement, key, formData[key]);
			}
			settlement.update({[key]: formData[key]})
		});

		this.render(); // rerenders the FormApp with the new data.
	}


	ConfigManager = ConfigManager;
}

class ConfigManager {
	static addMacro(settlement, key, value) {
		settlement.update({
			system: {
				options: {
					macros: {
						[key]: value,
					}
				},
			},
		});
	}
}