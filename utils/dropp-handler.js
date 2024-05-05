import SettlementAPI from "../helpers/settlementHelpers/api.js";
import SimpleSettlementSettings from "../settings/world-settings.js";

class DroppHandler {
	constructor(args) {
		const origin = args[2];
		const target = args[0];

		if(Object.keys(origin).length == 0) return;
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
		if (SimpleSettlementSettings.verify("gmOnlyAddEvents")) return;
		target.system.api.addEvent(event, target)
		SettlementAPI.addToLog(`${event.name} manually added on ${target.name}`, target)
	}
	_handleBuildingDrop({building, target}) {
		if (SimpleSettlementSettings.verify("gmOnlyModifyBuildingQt")) return;
		target.system.api.addBuilding(building, target)
		SettlementAPI.addToLog(`${building.name} manually added on ${target.name}`, target)
	}
}

export default DroppHandler;
