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
    this.buildings = this._getAllBuildings()
  }

	_handleBuildingDrop({ origin, target }) {
    
    if (
      origin.type === "simple-settlements.building" &&
			target.type === "simple-settlements.settlement"
      ) {
      console.log({ origin, target})
			this._registerBuilding({ origin, target });
		}
	}

	_registerBuilding({ origin, target }) {
    // const buildings = this._getAllBuildingsId(target)
    target.setFlag('simple-settlements', 'buildings', {[origin.id]: origin.id});
	}

	_getAllBuildingsId() {
    return Object.values(this.parent.flags["simple-settlements"]?.buildings) || []
  }

  _getAllBuildings(){
    const buildingsIds = this._getAllBuildingsId();
    const buildings = buildingsIds.map((id) => game.actors.get(id)).filter((element) => element !== undefined);
    return buildings
  }

	_deleteBuildingRegister(id) {
    this.parent.unsetFlag("simple-settlements", id)
  }

  _renderBuilding(id) {
    game.actors.get(id).render(true)
  }
}

export default SettlementData;
