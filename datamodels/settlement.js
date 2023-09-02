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
    const buildings = new this.BuildingsMapper(flags)
    const events = await this.EventsManager._init(flags)
    const income = this.Income.init({buildings, resources, events, flags})

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
    this.TimePasser.execute(this)
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
  EventsManager = EventsManager
  TimePasser = TimePasser
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
class EventsManager{
  static async _init(flags){
    let events = this._getAllEvents(flags)
    return events 
  }
  static _getAllEvents(flags){
    const eventsData = Object.values(flags["simple-settlements"]?.events || {})

    const unfilteredEvents = eventsData.map((flagData, i) => {
      const event = game.actors.get(flagData.id)
      if (event) {
        event.isActive = flagData.turn > event.system.opening
        event.turn = flagData.turn
        this._prepareDescriptionData(event)
        return event
      }
    })
    const events = unfilteredEvents.filter(element => element !== undefined)
    return events
  }
  static async _prepareDescriptionData(event){
		event.system.description = await TextEditor.enrichHTML(
			event.system.description,
			{
				async: true,
				relativeTo: this.object,
			}
		);
	}
  static advanceEvent({actor, event}){
    actor.setFlag('simple-settlements', `events.${event.id}.turn`, event.turn + 1)
  }
}

class Income{
  static init({buildings, resources, events, flags}){
    const resourcesIncomeData = this.prepareData({buildings, resources, events, flags})
    const resourceIncomeDataByHierarchy = this.buildHyerarchy({resources, resourcesIncomeData})
    return resourceIncomeDataByHierarchy

  }
  static prepareData({buildings, resources, events, flags}){
    const resourcesIncomeData = {}
    if (buildings) {
      this._handleBuildingsExistance({resourcesIncomeData, buildings})
    }
    if (resources) {
      this._handleResourcesExistance({resourcesIncomeData, resources})
    }
    if (events) {
      this._handleEventsExistance({resourcesIncomeData, events, flags})
    }
    return resourcesIncomeData
  }
  static _handleBuildingsExistance({resourcesIncomeData, buildings}){
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
  static _handleResourcesExistance({resourcesIncomeData, resources}){
    resources.forEach(resource => {
      if (!resourcesIncomeData[resource.name]) {
        resourcesIncomeData[resource.name] = {
          income: 0,
          data: resource
        }
      }
    })
  }
  static _handleEventsExistance({resourcesIncomeData, events, flags}){
    events.forEach(event => {
      /* if (flags["simple-settlements"]?.events[event.id].turn) {
        
      } */
      if (!(event.turn > event.system.opening)) return
      event.system.resources.forEach(resource => {
        if (resourcesIncomeData[resource.name]) {
          resourcesIncomeData[resource.name].income += resource.system.quantity
        } else {
          resourcesIncomeData[resource.name] = {
            income: resource.system.quantity,
            data: resource
          }
        }
      })
    })
  }

  static buildHyerarchy({resources, resourcesIncomeData}){
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
  
  static _getIncomeStoredData({resources, resourceIncome}){
    const storedResource = resources.find(resource => resource.name === resourceIncome.data.name)
    resourceIncome.stored = storedResource?.system.quantity || 0
    return resourceIncome
  }
  static _treatStaticResource({resourceIncomeDataByHierarchy, resourceIncomeFormat, resourceIncome}){
    if (resourceIncomeDataByHierarchy.static[resourceIncome.data.system.category]) {
      resourceIncomeDataByHierarchy.static[resourceIncome.data.system.category].resources.push(resourceIncomeFormat)
    } else {
      resourceIncomeDataByHierarchy.static[resourceIncome.data.system.category] = {
        name: resourceIncome.data.system.category,
        resources: [resourceIncomeFormat]
      }
    }
  }
  static _treatNonStaticResource({resourceIncomeDataByHierarchy, resourceIncomeFormat, resourceIncome}){
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

class TimePasser{
  static execute(system){
    this.handleResources(system)
    this.handleEvents(system)
  }

  static handleEvents(system){
    const actor = system.parent
    const events = system.events
    console.log(system)
    events.forEach(event => {
      EventsManager.advanceEvent({actor, event})
    })
  }

  static handleResources(system){
    const toUpdate = []
    const toCreate = []
    const incomeItems = Object.values(system.income.all).filter(resource => !resource.data.system.isStatic)
    // console.log(incomeItems)
    incomeItems.forEach(income => {
      const existingResource = system.parent.system.resources.find(resource => resource.name === income.data.name)
      if (existingResource) {
        toUpdate.push({_id: existingResource.id, system: {quantity: income.income + existingResource.system.quantity}})
      } else {
        toCreate.push({name: income.data.name, img: income.data.img, type: income.data.type, system: {...income.data.system, quantity: income.income}})
      }
    })
    if (toUpdate.length > 0) {
      Item.updateDocuments(toUpdate, {parent: system.parent})
    }
    if (toCreate.length > 0) {
      Item.createDocuments(toCreate, {parent: system.parent})
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
