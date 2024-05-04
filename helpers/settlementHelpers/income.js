import MacroManager from "./macro-manager.js"

export default class Income{
    static init(context){
      //debugger
      const settlement = context.actor
      const buildings = settlement.system.buildings
      const resources = context.items.filter(item => item.type == "simple-settlements.resource")
      const events = settlement.system.events
      const projects = settlement.system.projects


      const resourcesIncomeData = this.prepareData({buildings, resources, events, projects})
      const resourceIncomeDataByHierarchy = this.buildHyerarchy({resourcesIncomeData})
      MacroManager.handleIncomeData(resourceIncomeDataByHierarchy, settlement.system)
      // console.log(resourceIncomeDataByHierarchy)
      return resourceIncomeDataByHierarchy
  
    }
    static prepareData({buildings, resources, events, projects}){
      const resourcesIncomeData = {}
      if (resources) {
        this._handleResourcesExistance({resourcesIncomeData, resources})
      }
      if (buildings) {
        this._handleBuildingsExistance({resourcesIncomeData, buildings})
      }
      if (events) {
        this._handleEventsExistance({resourcesIncomeData, events})
      }
      if (projects) {
        this._handleProjectsExistance({resourcesIncomeData, projects})
      }
      return resourcesIncomeData
    }
    static _handleResourcesExistance({resourcesIncomeData, resources}){
      resources.forEach(resource => {
        if (!resourcesIncomeData[resource.name]) {
          resourcesIncomeData[resource.name] = {
            income: 0,
            stored: resource.system.quantity || 0,
            data: resource,
            log: []
          }
        }
        const stored = resource.system.quantity 
        if (resource.system.isStatic) {
          resourcesIncomeData[resource.name].log.push(`Stored: ${stored > 0 ? "+" : ""}${stored}`)
        } else {
          resourcesIncomeData[resource.name].log.push(`Stored: ${stored}`)
        }
      })
    }
    static _handleBuildingsExistance({resourcesIncomeData, buildings}){
      buildings.forEach(building => {
        if(building.isInactive) return
        const {resources} = building.system._filterItems(building.items.contents)
        resources.forEach(resource => {
          const income = (resource.system.quantity * building.quantity)
          if (resourcesIncomeData[resource.name]) {
            resourcesIncomeData[resource.name].log.push(`${building.name}: ${income > 0 ? "+" : ""}${income}`)
            resourcesIncomeData[resource.name].income += income
          } else {
            resourcesIncomeData[resource.name] = {
              income: income,
              stored: 0,
              data: resource,
              log: [`${building.name}: ${income > 0 ? "+" : ""}${income}`]
            }
          }
        })
      })
    }
    static _handleEventsExistance({resourcesIncomeData, events}){
      events.forEach(event => {
        if (!(event.turn > event.system.opening)) return
        event.system.resources.forEach(resource => {
          const income = resource.system.quantity
          if (resourcesIncomeData[resource.name]) {
            resourcesIncomeData[resource.name].income += income
            resourcesIncomeData[resource.name].log.push(`${event.name}: ${income > 0 ? "+" : ""}${income}`)
          } else {
            resourcesIncomeData[resource.name] = {
              income: income,
              stored: 0,
              data: resource,
              log: [`${event.name}: ${income > 0 ? "+" : ""}${income}`]
            }
          }
        })
      })
    }
    static _handleProjectsExistance({resourcesIncomeData, projects}){
      projects.forEach(project => {
        const consumingResources = project.system.requirements.resources.filter(resource => resource.consumes && resource.consumesPerTurn)
        consumingResources.forEach(resource => {
          const income = resource.quantity * -1
          if (resourcesIncomeData[resource.name]) {
            resourcesIncomeData[resource.name].income += income
            resourcesIncomeData[resource.name].log.push(`${project.name}: ${income > 0 ? "+" : ""}${income}`)
          } else {
            resourcesIncomeData[resource.name] = {
              income: income,
              stored: 0,
              data: resource,
              log: [`${project.name}: ${income > 0 ? "+" : ""}${income}`]
            }
          }
        })
      })
    }
  
    static buildHyerarchy({resourcesIncomeData}){
      const resourceIncomeDataByHierarchy = {
        static: {},
        nonStatic: {},
        all: resourcesIncomeData
      }
      Object.values(resourcesIncomeData).forEach(resourceIncome => {
        //const resourceIncomeFormat = this._getIncomeStoredData({resources, resourceIncome})
        if (resourceIncome.data?.system.isStatic) {
          this._pushStaticResources({resourceIncomeDataByHierarchy, resourceIncome})
        } else {
          this._pushNonStaticResources({resourceIncomeDataByHierarchy, resourceIncome})
        }
      })
      return resourceIncomeDataByHierarchy
    }
    
    /* static _getIncomeStoredData({resources, resourceIncome}){
      const storedResource = resources.find(resource => resource.name === resourceIncome.data.name)
      resourceIncome.stored = storedResource?.system.quantity || 0
      return resourceIncome
    } */
    static _pushStaticResources({resourceIncomeDataByHierarchy, resourceIncome}){
      if (resourceIncomeDataByHierarchy.static[resourceIncome.data.system.category]) {
        resourceIncomeDataByHierarchy.static[resourceIncome.data.system.category].resources.push(resourceIncome)
      } else {
        resourceIncomeDataByHierarchy.static[resourceIncome.data.system.category] = {
          name: resourceIncome.data.system.category,
          resources: [resourceIncome]
        }
      }
    }
    static _pushNonStaticResources({resourceIncomeDataByHierarchy, resourceIncome}){
      if (resourceIncomeDataByHierarchy.nonStatic[resourceIncome.data.system.category]) {
        resourceIncomeDataByHierarchy.nonStatic[resourceIncome.data.system.category].resources.push(resourceIncome)
      } else {
        resourceIncomeDataByHierarchy.nonStatic[resourceIncome.data.system.category] = {
          name: resourceIncome.data.system.category,
          resources: [resourceIncome]
        }
      }
    }
  }
  