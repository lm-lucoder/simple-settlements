import SimpleSettlementSettings from "../settings/world-settings.js";

class DroppHandler {
	constructor(args) {
		const origin = args[2];
		const target = args[0];
		if (target.type === "simple-settlements.project") {
			
		}

		if (!origin.type === "Actor") return;

		if (target.type === "simple-settlements.settlement") {
			const originElement = game.actors.get(origin.uuid.replace("Actor.", ""));
			if (!originElement) return;
			if (originElement.type === "simple-settlements.building") {
                this._handleBuildingDrop({building: originElement, target: target});
			}
			if (originElement.type === "simple-settlements.event") {
				this._handleEventDrop({event: originElement, target: target})
			}
		}
	}
	_handleEventDrop({event, target}) {
		const test = SimpleSettlementSettings.verify("gmOnlyAddEvents")
		if (test) return;
		target.system.api.addEvent(event, target)
	}
	_handleBuildingDrop({building, target}) {
		if (SimpleSettlementSettings.verify("gmOnlyModifyBuildingQt")) return;
		target.system.api.addBuilding(building, target)
	}
}

export default DroppHandler;
