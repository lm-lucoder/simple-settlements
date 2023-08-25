class SettlementData extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			description: new fields.HTMLField({required: false, blank: false, initial: "<p></p>"}),
		};
	}
	prepareDerivedData() {
    const items = this.parent.items.contents
    const resources = this._filterItemsResources(items)
    const categorizedResources = this._buildResourcesHierarchy(resources)
    const buildings = this._prepareBuildingsData()
    const income = this._prepareIncome(buildings, resources)

    this.buildings = buildings
    this.resources = resources
    this.categorizedResources = categorizedResources
    this.income = income
  }
  
  _prepareBuildingsData(){
    let buildings = this._getAllBuildings()
  
    this._registerInactiveBuildings(buildings)
  
    return buildings  
  }
  _prepareIncome(buildings, resources){
    // Prepare all the income from the buildings
    const resourcesIncomeData = {}
    buildings.forEach(building => {
      // if (building.isInactive) return;
      const resources = building.system._filterItemsResources(building.items.contents)
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
  }

	_handleBuildingDrop(building) {
    if (
      building.type === "simple-settlements.building" &&
			this.parent.type === "simple-settlements.settlement"
      ) {
			this._registerBuilding(building);
		}
	}

	_registerBuilding(building) {
    if (this.parent.getFlag("simple-settlements", `buildings.${building.id}`)) {
      this.parent.setFlag('simple-settlements', `buildings.${building.id}.quantity` , building.quantity + 1);
      return
    }
    this.parent.setFlag('simple-settlements', 'buildings', {[building.id]: {
      id: building.id,
      quantity: 1
    }});
	}

	_getAllBuildingsIds() {
    return Object.keys(this.parent.flags["simple-settlements"]?.buildings) || []
  }

  _getAllBuildings(){
    const buildingsData = Object.values(this.parent.flags["simple-settlements"]?.buildings || {})

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
	_deleteBuildingRegister(id) {
    this.parent.unsetFlag("simple-settlements", `buildings.${id}`)
  }

  _renderBuilding(id) {
    game.actors.get(id).render(true)
  }

  _filterItemsResources(items){
    const resources = []

    for (let i of items) {
      i.img = i.img || DEFAULT_TOKEN;
      // Append to resources.
      if (i.type === "simple-settlements.resource") {
        resources.push(i);
      }
      // resources.push(i);
    }

    return resources
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

  async _passTime(){
    const toUpdate = []
    const toCreate = []
    const incomeItems = Object.values(this.income.all).filter(resource => !resource.data.system.isStatic)
    console.log(incomeItems)
    incomeItems.forEach(income => {
      const existingResource = this.parent.system.resources.find(resource => resource.name === income.data.name)
      if (existingResource) {
        toUpdate.push({_id: existingResource.id, system: {quantity: income.income + existingResource.system.quantity}})
      } else {
        toCreate.push({name: income.data.name, img: income.data.img, type: income.data.type, system: {...income.data.system, quantity: income.income}})
      }
      // console.log(income)
    })
    console.log("toUpdate", toUpdate)
    console.log("toCreate", toCreate)
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

}

export default SettlementData;
