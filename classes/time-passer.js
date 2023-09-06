import EventsManager from "./events-manager.js"

export default class TimePasser{
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