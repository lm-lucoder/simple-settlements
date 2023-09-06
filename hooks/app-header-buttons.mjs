

import SettlementConfig from "../sheets-configurations/settlement-config.mjs";

export default function setupApplicationHeaderPrintButton() {
	const hooks = [
		"getDocumentSheetHeaderButtons",
		"getItemSheetHeaderButtons",
		"getActorSheetHeaderButtons",
		"getTokenConfigHeaderButtons",
	];

	const callback = async (sheet, buttons) => {
		const type = sheet.object.type;
		if (type != "simple-settlements.settlement") return;

		if (sheet.object) {
			buttons.unshift({
				class: "settlement-config",
				icon: "fa-solid fa-code",
				label: "Configuration",
				onclick: () => {
					new SettlementConfig(sheet).render(true);
				},
			});
		}
	};

	hooks.forEach((hookName) => {
		Hooks.on(hookName, callback);
	});
}
