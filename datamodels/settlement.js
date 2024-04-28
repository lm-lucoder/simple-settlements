import SettlementAPI from "../helpers/settlementHelpers/api.js";
import EventsManager from "../helpers/settlementHelpers/events-manager.js";
import ProjectsManager from "../helpers/settlementHelpers/projects-manager.js";
import SettlementBuildingsMapper from "../helpers/settlementHelpers/settlement-buildings-mapper.js";

class SettlementData extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			description: new fields.HTMLField({required: false, blank: false, initial: "<p></p>"}),
      options: new fields.SchemaField({
        macros: new fields.SchemaField({
          incomeMacros: new fields.StringField({required: false, initial: ""}),
          turnMacros: new fields.StringField({required: false, initial: ""})
        }),
        permissions: new fields.SchemaField({
          buildings: new fields.SchemaField({
            onlyGmCanAddBuildings: new fields.BooleanField({initial: false}),
            onlyGmCanRemoveBuildings: new fields.BooleanField({initial: false}),
            onlyGmCanChangeBuildingsQuantity: new fields.BooleanField({initial: false}),
          })
        })
      }),
      raw: new fields.SchemaField({
        buildings: new fields.ArrayField(
          new fields.SchemaField({
            id: new fields.StringField({required: false}),
            count: new fields.NumberField({required: true, nullable: false, initial: 1}),
            isRawInactive: new fields.BooleanField({initial: false}),
          })
        ),
        events: new fields.ArrayField(
          new fields.SchemaField({
            id: new fields.StringField({required: false}),
            turn: new fields.NumberField({required: true, nullable: false, initial: 1})
          })
        ),
        projects: new fields.ArrayField(
          new fields.SchemaField({
            id: new fields.StringField({required: false}),
            turn: new fields.NumberField({required: true, nullable: false, initial: 1})
          })
        ),
      })
		};
	}
	async prepareDerivedData() {
    const items = this.parent.items.contents
    
    const flags = this.parent.flags
    const {resources, features} = this._filterItems(items)
    
    const buildings = SettlementBuildingsMapper._init(this.raw.buildings)
    const events = EventsManager._init(this.raw.events)
    const projects = ProjectsManager._init(this.raw.projects)
    // const income = Income._init({buildings, resources, events, system: this})

    this.buildings = buildings
    this.events = events
    this.projects = projects
    this.resources = resources
    // this.income = income
    this.features = features
  }
	_deleteBuildingRegister(id) {
    this.parent.unsetFlag("simple-settlements", `buildings.${id}`)
  }

  _renderBuilding(id) {
    game.actors.get(id).render(true)
  }

  _filterItems(items){
    const resources = []
    const features = []

    for (let i of items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to resources.
      if (i.type === "simple-settlements.resource") {
        resources.push(i);
      }
      if (i.type === "simple-settlements.feature") {
        features.push(i);
      }
      // resources.push(i);
    }

    return {resources, features}
  }


  getStaticIncome(){
    const income = this.income;
    return Object.values(income.all).filter(resource => resource.data.system.isStatic)
  }
  getNonStaticIncome(){
    const income = this.income;
    return Object.values(income.all).filter(resource => !resource.data.system.isStatic)
  }
  api = SettlementAPI
}

export default SettlementData;