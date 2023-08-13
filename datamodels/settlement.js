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
    buildings = this._registerInactiveBuildings(buildings)
    console.log("preparing derived data")
    console.log(buildings)
    this.buildings = buildings
  }

	_handleBuildingDrop({ origin, target }) {
    if (
      origin.type === "simple-settlements.building" &&
			target.type === "simple-settlements.settlement"
      ) {
			this._registerBuilding({ origin, target });
		}
	}

	_registerBuilding({ origin, target }) {
    // const buildings = this._getAllBuildingsId(target)
    target.setFlag('simple-settlements', 'buildings', {[origin.id]: origin.id});
	}

	_getAllBuildingsIds() {
    return Object.values(this.parent.flags["simple-settlements"]?.buildings) || []
  }

  _getAllBuildings(){
    const buildingsIds = this._getAllBuildingsIds();
    const buildings = buildingsIds.map((id) => game.actors.get(id)).filter((element) => element !== undefined);
    return buildings
  }

  _registerInactiveBuildings(buildings){
    const innactiveBuildingsIds = this._getAllInactiveBuildingsIds()
    buildings.forEach((building, i) => {
      if (innactiveBuildingsIds.includes(building.id)) {
        building.isInactive = true
      } else {
        building.isInactive = false
      }
    })
    return buildings
  }

  _getAllInactiveBuildingsIds() {
    const inactiveBuildingsObj = this.parent.getFlag("simple-settlements", "inactiveBuildings");
    return Object.values(inactiveBuildingsObj)
  }

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
