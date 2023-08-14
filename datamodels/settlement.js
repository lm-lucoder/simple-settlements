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
    let buildings = this._getAllBuildings()
    this._registerInactiveBuildings(buildings)
    this.buildings = buildings
  }

	_handleBuildingDrop({ origin }) {
    if (
      origin.type === "simple-settlements.building" &&
			this.parent.type === "simple-settlements.settlement"
      ) {
			this._registerBuilding({ origin });
		}
	}

	_registerBuilding({ origin }) {
    if (this.parent.getFlag("simple-settlements", `buildings.${origin.id}`)) {
      this.parent.setFlag('simple-settlements', `buildings.${origin.id}.quantity` , origin.quantity + 1);
      return
    }
    this.parent.setFlag('simple-settlements', 'buildings', {[origin.id]: {
      id: origin.id,
      quantity: 1
    }});
	}

	_getAllBuildingsIds() {
    return Object.keys(this.parent.flags["simple-settlements"]?.buildings) || []
  }

  /* _getAllBuildings(){
    const buildingsIds = this._getAllBuildingsIds();
    const buildings = buildingsIds.map((id) => game.actors.get(id)).filter((element) => element !== undefined);
    buildings.forEach((building, i) => {

    })
    return buildings
  } */
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

  /* _registerInactiveBuildings(buildings){
    const innactiveBuildingsIds = this._getAllInactiveBuildingsIds()
    buildings.forEach((building, i) => {
      if (innactiveBuildingsIds.includes(building.id)) {
        building.isInactive = true
      } else {
        building.isInactive = false
      }
    })
    return buildings
  } */
  _registerInactiveBuildings(buildings){
    buildings.forEach((building)=>{
      if (building.quantity > 0) {
        building.isInactive = false
      } else {
        building.isInactive = true
      }
    })
  }

  /* _getAllInactiveBuildingsIds() {
    const inactiveBuildingsObj = this.parent.getFlag("simple-settlements", "inactiveBuildings");
    return Object.values(inactiveBuildingsObj)
  } */

	_deleteBuildingRegister(id) {
    this.parent.unsetFlag("simple-settlements", `buildings.${id}`)
  }

  _renderBuilding(id) {
    game.actors.get(id).render(true)
  }

  /* _fillBuildingsWithIsInactiveOptions(){
    
  } */
}

export default SettlementData;
