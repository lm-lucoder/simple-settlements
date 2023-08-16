class SettlementData extends foundry.abstract.TypeDataModel {
	static defineSchema() {
		const fields = foundry.data.fields;
		return {
			description: new fields.HTMLField({
				required: false,
				blank: false,
				initial: "<p></p>",
			}),
		};
	}
	prepareDerivedData() {
    // const items = this.parent.items.contents
    // const resources = this._filterItemsResources(items)
    // const categorizedResources = this._buildResourcesHierarchy(resources)
    // const categories = this._prepareResourcesCategories(staticResources)

    this._prepareBuildingsData()
    this._prepareIncome()

    // this.resources = resources
    // this.categorizedResources = categorizedResources
    // this.categories = categories
  }
  
  _prepareBuildingsData(){
    let buildings = this._getAllBuildings()
  
    this._registerInactiveBuildings(buildings)
  
    this.buildings = buildings  
  }

  _prepareIncome(){
    const resourcesIncomeData = {}
    const buildings = this._getAllBuildings() 
    buildings.forEach(building => {
      const resources = building.system._filterItemsResources(building.items.contents)
      resources.forEach(resource => {
        if (resourcesIncomeData[resource.name]) {
          resourcesIncomeData[resource.name].quantity += (resource.system.quantity * building.quantity)
        } else {
          resourcesIncomeData[resource.name] = {
            quantity: (resource.system.quantity * building.quantity),
            data: resource
          }
        }
      })
    })
    this.income = resourcesIncomeData
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
     if (resource.isStatic) {
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

  /* _prepareResourcesCategories(resources){
    const categories = {}
    resources.forEach(resource => {
      if (categories[resource.system.category]) {
        categories[resource.system.category].resources.push(resource)
      } else {
        categories[resource.system.category] = {
          name: resource.system.category,
          resources: [resource]
        }
      }
    });
    return categories
  } */

}

export default SettlementData;
