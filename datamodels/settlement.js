import EventsManager from "../classes/events-manager.js";
import Income from "../classes/income.js";
import SettlementBuildingsMapper from "../classes/settlement-buildings-mapper.js";
import TimePasser from "../classes/time-passer.js";

class SettlementData extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			description: new fields.HTMLField({required: false, blank: false, initial: "<p></p>"}),
		};
	}
	async prepareDerivedData() {
    const items = this.parent.items.contents
    const flags = this.parent.flags
    const {resources, features} = this._filterItems(items)
    const categorizedResources = this._buildResourcesHierarchy(resources)
    const buildings = SettlementBuildingsMapper._init(flags)
    const events = await EventsManager._init(flags)
    const income = Income._init({buildings, resources, events, flags})

    this.buildings = buildings
    this.events = events
    this.resources = resources
    this.categorizedResources = categorizedResources
    this.income = income
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
  _buildResourcesHierarchy(resources){
    const resourcesByHierarchy = {
      static: {},
      nonStatic: {}
    }
    resources.forEach(resource => {
     if (resource.system.isStatic) {
      if (resourcesByHierarchy.static[resource.system.category]) {
        resourcesByHierarchy.static[resource.system.category].resources.push(resource)
      } else {
        resourcesByHierarchy.static[resource.system.category] = {
          name: resource.system.category,
          resources: [resource]
        }
      }
     } else {
      if (resourcesByHierarchy.nonStatic[resource.system.category]) {
        resourcesByHierarchy.nonStatic[resource.system.category].resources.push(resource)
      } else {
        resourcesByHierarchy.nonStatic[resource.system.category] = {
          name: resource.system.category,
          resources: [resource]
        }
      }
     }
    })
    return resourcesByHierarchy
  }

  async passTime(){
    TimePasser.execute(this)
  }

  getStaticIncome(){
    const income = this.income;
    return Object.values(income.all).filter(resource => resource.data.system.isStatic)
  }
  getNonStaticIncome(){
    const income = this.income;
    return Object.values(income.all).filter(resource => !resource.data.system.isStatic)
  }
}




export default SettlementData;


/* _prepareIncome(buildings, resources){
  // Prepare all the income from the buildings
  const resourcesIncomeData = {}
  buildings.forEach(building => {
    // if (building.isInactive) return;
    const {resources} = building.system._filterItems(building.items.contents)
    resources.forEach(resource => {
      if (resourcesIncomeData[resource.name]) {
        resourcesIncomeData[resource.name].income += (resource.system.quantity * building.quantity)
      } else {
        resourcesIncomeData[resource.name] = {
          income: (resource.system.quantity * building.quantity),
          data: resource
        }
      }
    })
  })
  // Add stored resources as 0 income on the income data, for better rendering purposes
  resources.forEach(resource => {
    if (!resourcesIncomeData[resource.name]) {
      resourcesIncomeData[resource.name] = {
        income: 0,
        data: resource
      }
    }
  })
  // Format the income result into categorized data
  const resourceIncomeDataByHierarchy = {
    static: {},
    nonStatic: {},
    all: resourcesIncomeData
  }
  Object.values(resourcesIncomeData).forEach(resourceIncome => {
    const resourceIncomeFormat = getResourceIncomeFormat({resources, resourceIncome})
    if (resourceIncome.data?.system.isStatic) {
      if (resourceIncomeDataByHierarchy.static[resourceIncome.data.system.category]) {
        resourceIncomeDataByHierarchy.static[resourceIncome.data.system.category].resources.push(resourceIncomeFormat)
      } else {
        resourceIncomeDataByHierarchy.static[resourceIncome.data.system.category] = {
          name: resourceIncome.data.system.category,
          resources: [resourceIncomeFormat]
        }
      }
    } else {
      if (resourceIncomeDataByHierarchy.nonStatic[resourceIncome.data.system.category]) {
        resourceIncomeDataByHierarchy.nonStatic[resourceIncome.data.system.category].resources.push(resourceIncomeFormat)
      } else {
        resourceIncomeDataByHierarchy.nonStatic[resourceIncome.data.system.category] = {
          name: resourceIncome.data.system.category,
          resources: [resourceIncomeFormat]
        }
      }
    }
  })
  
  function getResourceIncomeFormat({resources, resourceIncome}){
    const storedResource = resources.find(resource => resource.name === resourceIncome.data.name)
    resourceIncome.stored = storedResource?.system.quantity || 0
    return resourceIncome
  }
  
  return resourceIncomeDataByHierarchy
} */
