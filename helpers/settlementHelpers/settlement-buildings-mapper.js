export default class SettlementBuildingsMapper{
    static _init(rawBuildings){
      let buildings = this._getAllBuildings(rawBuildings)
    
      this._registerInactiveBuildings(buildings)
  
      return buildings 
    }
   static _getAllBuildings(rawBuildings){
    const unfilteredBuildings = rawBuildings.map((rawBuilding, i) => {
      const building = game.actors.get(rawBuilding.id)
      if (building) {
        building.quantity = rawBuilding.count
        return building
      }
    })
    const buildings = unfilteredBuildings.filter(element => element !== undefined)
    return buildings
  }
  
  static _registerInactiveBuildings(buildings){
    buildings.forEach((building)=>{
      if (building.quantity > 0) {
        building.isInactive = false
      } else {
        building.isInactive = true
      }
    })
  }
  }