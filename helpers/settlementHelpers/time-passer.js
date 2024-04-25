import SettlementAPI from "./api.js"
import EventsManager from "./events-manager.js"
import MacroManager from "./macro-manager.js"

export default class TimePasser{
    static async init(settlement, income){
      const system = settlement.system
      await this.handleResources(system, income)
      this.handleEvents(system)
      this.handleMacros(system)
      this.handleProjects(system)
    }
  
    static handleEvents(system){
      const actor = system.parent
      const events = system.events
      events.forEach(event => {
        SettlementAPI.advanceEvent(event, actor)
      })
    }

    static handleProjects(system){
      const settlement = system.parent
      const projects = system.projects
      projects.forEach(project => {
        SettlementAPI.advanceProject(project, settlement)
      })
    }

    static handleMacros(system){
      MacroManager.handleTimePasser(system)
    }
  
    static async handleResources(system, income){
      const toUpdate = []
      const toCreate = []
      const incomeItems = Object.values(income.all).filter(resource => !resource.data.system.isStatic)
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
        await Item.updateDocuments(toUpdate, {parent: system.parent})
      }
      if (toCreate.length > 0) {
        await Item.createDocuments(toCreate, {parent: system.parent})
      }
    }
  }