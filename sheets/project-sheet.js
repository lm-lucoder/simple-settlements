import ProjectDrop from "../helpers/projectHelpers/drop.js";

class ProjectSheet extends ActorSheet {
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["sheet", "item", "simple-settlements-project"],
			width: 520,
			height: 480,
			tabs: [
				{
					navSelector: ".sheet-tabs",
					contentSelector: ".sheet-body",
					initial: "configuration",
				},
				{
					navSelector: ".configuration-tabs",
					contentSelector: ".configuration-container",
					initial: "requirements",
				},
			],
		});
	}
	get template() {
		const path = "modules/simple-settlements/templates";
		return `${path}/project-sheet.html`;
	}
	async getData() {
		const context = super.getData();

		console.log(context)

		await this._prepareDescriptionData(context)

		return context;
	}
	activateListeners(html) {
		super.activateListeners(html);

		html.find(".delete-config-btn").click(e => {
			const card = e.target.closest(".project-card")
			const [section, type] = card.getAttribute("elementType").split("-")
			const id = card.getAttribute("elementId")
			const types = this.object.system[section][type]
			const toRemoveIndex = types.findIndex(element => element.id === id)
			types.splice(toRemoveIndex, 1)
			this.object.update({ system: { [section]: { [type]: [...types] } } })
		})

		html.find(".resource-input-change").change(e => {
			console.log(e)
			const card = e.target.closest(".project-card")
			const resourceId = card.getAttribute("elementId")
			const [section, type] = card.getAttribute("elementType").split("-")
			const resources = this.object.system[section].resources
			const resourceIndex = resources.findIndex(resource => resource.id === resourceId)
			resources[resourceIndex].quantity = e.target.value

			this.object.update({ system: {[section]: {resources: [...resources]}} })
		})

		if (!this.options.editable) return;
	}

	async _prepareDescriptionData(context) {
		context.description = await TextEditor.enrichHTML(
			this.object.system.description,
			{
				async: true,
				secrets: this.object.isOwner,
				relativeTo: this.object,
			}
		);
	}

	_onDropActor(e, data) {
		ProjectDrop.actorDrop(e, data, this)
	}

	_onDropItem(e, data) {
		e.preventDefault()
		ProjectDrop.itemDrop(e, data, this)
	}

}

export default ProjectSheet;
