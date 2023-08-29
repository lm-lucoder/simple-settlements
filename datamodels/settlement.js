class SettlementData extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			description: new fields.HTMLField({required: false, blank: false, initial: "<p></p>"}),
		};
	}
	prepareDerivedData() {
    const items = this.parent.items.contents
    const flags = this.parent.flags
    const {resources, features} = this._filterItems(items)
    const categorizedResources = this._buildResourcesHierarchy(resources)
    const buildings = new this.BuildingsMapper(flags)
    const events = this._prepareEventsData()
    const income = new this.Income(buildings, resources)

    this.buildings = buildings
    this.events = events
    this.resources = resources
    this.categorizedResources = categorizedResources
    this.income = income
    this.features = features
  }
  _prepareEventsData(){
    let events = this._getAllEvents()
    return events  
  }

	/* _getAllBuildingsIds() {
    return Object.keys(this.parent.flags["simple-settlements"]?.buildings) || []
  } */

  _getAllEvents(){
    const eventsData = Object.values(this.parent.flags["simple-settlements"]?.events || {})

    const unfilteredEvents = eventsData.map((flagData, i) => {
      const event = game.actors.get(flagData.id)
      if (event) {
        event.turn = flagData.turn
        return event
      }
    })
    const events = unfilteredEvents.filter(element => element !== undefined)
    return events
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
    const toUpdate = []
    const toCreate = []
    const incomeItems = Object.values(this.income.all).filter(resource => !resource.data.system.isStatic)
    // console.log(incomeItems)
    incomeItems.forEach(income => {
      const existingResource = this.parent.system.resources.find(resource => resource.name === income.data.name)
      if (existingResource) {
        toUpdate.push({_id: existingResource.id, system: {quantity: income.income + existingResource.system.quantity}})
      } else {
        toCreate.push({name: income.data.name, img: income.data.img, type: income.data.type, system: {...income.data.system, quantity: income.income}})
      }
      // console.log(income)
    })
    // console.log("toUpdate", toUpdate)
    // console.log("toCreate", toCreate)
    if (toUpdate.length > 0) {
      await Item.updateDocuments(toUpdate, {parent: this.parent})
    }
    if (toCreate.length > 0) {
      await Item.createDocuments(toCreate, {parent: this.parent})
    }
  }

  getStaticIncome(){
    const income = this.income;
    return Object.values(income.all).filter(resource => resource.data.system.isStatic)
  }
  getNonStaticIncome(){
    const income = this.income;
    return Object.values(income.all).filter(resource => !resource.data.system.isStatic)
  }
  Income = Income
  BuildingsMapper = BuildingsMapper
  EventsMapper = EventsMapper
}

class BuildingsMapper{
 constructor(flags){
  let buildings = this._getAllBuildings(flags)
  
  this._registerInactiveBuildings(buildings)

  return buildings 
 }
 _getAllBuildings(flags){
  const buildingsData = Object.values(flags["simple-settlements"]?.buildings || {})

  const unfilteredBuildings = buildingsData.map((flagData, i) => {
    const building = game.actors.get(flagData.id)
    if (building) {
      building.quantity = flagData.quantity
      return building
    }
  })
  const buildings = unfilteredBuildings.filter(element => element !== undefined)
  return buildings
}

_registerInactiveBuildings(buildings){
  buildings.forEach((building)=>{
    if (building.quantity > 0) {
      building.isInactive = false
    } else {
      building.isInactive = true
    }
  })
}
}
class EventsMapper{

}

class Income{
  constructor(buildings, resources) {
    const resourcesIncomeData = this.prepareData({buildings, resources})
    const resourceIncomeDataByHierarchy = this.buildHyerarchy({resources, resourcesIncomeData})
    return resourceIncomeDataByHierarchy
  }
  prepareData({buildings, resources}){
    const resourcesIncomeData = {}
    if (buildings) {
      this._handleBuildingsExistance({resourcesIncomeData, buildings})
    }
    if (resources) {
      this._handleResourcesExistance({resourcesIncomeData, resources})
    }
    return resourcesIncomeData
  }
  _handleBuildingsExistance({resourcesIncomeData, buildings}){
    buildings.forEach(building => {
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
  }
  _handleResourcesExistance({resourcesIncomeData, resources}){
    resources.forEach(resource => {
      if (!resourcesIncomeData[resource.name]) {
        resourcesIncomeData[resource.name] = {
          income: 0,
          data: resource
        }
      }
    })
  }

  buildHyerarchy({resources, resourcesIncomeData}){
    const resourceIncomeDataByHierarchy = {
      static: {},
      nonStatic: {},
      all: resourcesIncomeData
    }
    Object.values(resourcesIncomeData).forEach(resourceIncome => {
      const resourceIncomeFormat = this._getIncomeStoredData({resources, resourceIncome})
      if (resourceIncome.data?.system.isStatic) {
        this._treatStaticResource({resourceIncomeDataByHierarchy, resourceIncomeFormat, resourceIncome})
      } else {
        this._treatNonStaticResource({resourceIncomeDataByHierarchy, resourceIncomeFormat, resourceIncome})
      }
    })
    return resourceIncomeDataByHierarchy
  }
  
  _getIncomeStoredData({resources, resourceIncome}){
    const storedResource = resources.find(resource => resource.name === resourceIncome.data.name)
    resourceIncome.stored = storedResource?.system.quantity || 0
    return resourceIncome
  }
  _treatStaticResource({resourceIncomeDataByHierarchy, resourceIncomeFormat, resourceIncome}){
    if (resourceIncomeDataByHierarchy.static[resourceIncome.data.system.category]) {
      resourceIncomeDataByHierarchy.static[resourceIncome.data.system.category].resources.push(resourceIncomeFormat)
    } else {
      resourceIncomeDataByHierarchy.static[resourceIncome.data.system.category] = {
        name: resourceIncome.data.system.category,
        resources: [resourceIncomeFormat]
      }
    }
  }
  _treatNonStaticResource({resourceIncomeDataByHierarchy, resourceIncomeFormat, resourceIncome}){
    if (resourceIncomeDataByHierarchy.nonStatic[resourceIncome.data.system.category]) {
      resourceIncomeDataByHierarchy.nonStatic[resourceIncome.data.system.category].resources.push(resourceIncomeFormat)
    } else {
      resourceIncomeDataByHierarchy.nonStatic[resourceIncome.data.system.category] = {
        name: resourceIncome.data.system.category,
        resources: [resourceIncomeFormat]
      }
    }
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
