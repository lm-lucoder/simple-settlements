export default class SettlementBuildingsMapper{
    static _init(flags){
      let buildings = this._getAllBuildings(flags)
    
      this._registerInactiveBuildings(buildings)
  
      return buildings 
    }
   static _getAllBuildings(flags){
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