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

		// console.log(context)

		await this._prepareDescriptionData(context)

		this.checkAndReRenderOpenedSettlements()

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

		html.find(".project-input-change").change(e => {
			const card = e.target.closest(".project-card")
			const elementId = card.getAttribute("elementId")
			const [section, type] = card.getAttribute("elementType").split("-")
			const elements = this.object.system[section][type]
			const elementIndex = elements.findIndex(el => el.id === elementId)
			elements[elementIndex].quantity = e.target.value
			this.object.update({ system: {[section]: {[type]: [...elements]}} })
		})
		html.find(".resource-input-change").change(e => {
			const card = e.target.closest(".project-card")
			const resourceId = card.getAttribute("elementId")
			const [section, type] = card.getAttribute("elementType").split("-")
			const resources = this.object.system[section].resources
			const resourceIndex = resources.findIndex(resource => resource.id === resourceId)
			resources[resourceIndex].quantity = e.target.value

			this.object.update({ system: {[section]: {resources: [...resources]}} })
		})
		html.find(".resource-checkbox-consumes").change(e => {
			const checkboxConsumesChecked = e.target.checked
			const card = e.target.closest(".project-card-resource-requirement")
			const resourceId = card.getAttribute("elementId")
			const [section, type] = card.getAttribute("elementType").split("-")
			const resources = this.object.system[section].resources
			const resourceIndex = resources.findIndex(resource => resource.id === resourceId)
			resources[resourceIndex].consumes = checkboxConsumesChecked

			this.object.update({ system: {[section]: {resources: [...resources]}} })
			// console.log(this.object.system.requirements.resources)
		})
		html.find(".resource-checkbox-onFinished").change(e => {
			const checkboxConsumesChecked = e.target.checked
			const card = e.target.closest(".project-card-resource-requirement")
			const resourceId = card.getAttribute("elementId")
			const [section, type] = card.getAttribute("elementType").split("-")
			const resources = this.object.system[section].resources
			const resourceIndex = resources.findIndex(resource => resource.id === resourceId)
			resources[resourceIndex].onFinished = checkboxConsumesChecked

			this.object.update({ system: {[section]: {resources: [...resources]}} })
			// console.log(this.object.system.requirements.resources)
		})
		html.find(".resource-checkbox-consumesOnDrop").change(e => {
			const checkboxConsumesChecked = e.target.checked
			const card = e.target.closest(".project-card-resource-requirement")
			const resourceId = card.getAttribute("elementId")
			const [section, type] = card.getAttribute("elementType").split("-")
			const resources = this.object.system[section].resources
			const resourceIndex = resources.findIndex(resource => resource.id === resourceId)
			resources[resourceIndex].consumesOnDrop = checkboxConsumesChecked

			this.object.update({ system: {[section]: {resources: [...resources]}} })
		})
		html.find(".resource-checkbox-consumesPerTurn").change(e => {
			const checkboxConsumesChecked = e.target.checked
			const card = e.target.closest(".project-card-resource-requirement")
			const resourceId = card.getAttribute("elementId")
			const [section, type] = card.getAttribute("elementType").split("-")
			const resources = this.object.system[section].resources
			const resourceIndex = resources.findIndex(resource => resource.id === resourceId)
			resources[resourceIndex].consumesPerTurn = checkboxConsumesChecked

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

	checkAndReRenderOpenedSettlements(){
        const settlements = game.actors.contents.filter(actor => actor.type === "simple-settlements.settlement")
        settlements.forEach(settlement => {
          if (settlement.sheet.rendered) {
            settlement.sheet.render()
          }
        })
    }

}

export default ProjectSheet;
