
export default class Income{
    static _init({buildings, resources, events, flags}){
      const resourcesIncomeData = this.prepareData({buildings, resources, events, flags})
      const resourceIncomeDataByHierarchy = this.buildHyerarchy({resources, resourcesIncomeData})
    //   MacroManager.handleIncomeData(resourceIncomeDataByHierarchy, flags)
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
  