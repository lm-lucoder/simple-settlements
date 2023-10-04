class SimpleSettlementSettings {
  constructor(){
    game.settings.registerMenu("simple-settlements", "settlement-permissions-menu", {
      name: "Settlements permissions",
      label: "Settlements permissions",      // The text label used in the button
      hint: "Configure players permissions when interacting with settlements sheets.",
      icon: "fas fa-bars",               // A Font Awesome icon used in the submenu button
      type: SettlementPermissionsFormApp,   // A FormApplication subclass
      restricted: true                   // Restrict this submenu to gamemaster only?
    });
      
      
    game.settings.register('simple-settlements', 'settlement-permissions', {
      scope: 'world',     // "world" = sync to db, "client" = local storage
      config: false,      // we will use the menu above to edit this setting
      type: Object,
      default: {},        // can be used to set up the default structure
    });
  }
}

class SettlementPermissionsFormApp extends FormApplication {
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["form"],
			popOut: true,
			id: "settlement-permissions-form",
			title: "Settlement permissions",
			width: 400,
			/* tabs: [
          {
            navSelector: ".form-tabs",
            contentSelector: ".form-body",
            initial: "macros",
          },
        ], */
		});
	}

	get template() {
		const path = "modules/simple-settlements/templates/configs";
		return `${path}/settlement-permissions-form-app.html`;
	}

	getData() {
    const data = game.settings.get(
			"simple-settlements",
			"settlement-permissions"
		);
    console.log(data)
		return data
	}

	_updateObject(event, formData) {
		const data = expandObject(formData);
		game.settings.set("simple-settlements", "settlement-permissions", data);
	}
}
export default SimpleSettlementSettings;
