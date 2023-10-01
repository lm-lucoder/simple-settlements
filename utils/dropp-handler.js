class DroppHandler {
	constructor(args) {
		const origin = args[2];
		const target = args[0];
		if (!origin.type === "Actor") return;

		if (target.type === "simple-settlements.settlement") {
			const originElement = game.actors.get(
				origin.uuid.replace("Actor.", "")
			);
			if (originElement.type === "simple-settlements.building") {
                this._handleBuildingDrop({building: originElement, target: target});
			}
			if (originElement.type === "simple-settlements.event") {
				this._handleEventDrop({event: originElement, target: target})
			}
		}
	}
	_handleEventDrop({event, target}) {
		// this._registerEvent({event, target});
		target.system.api.addEvent(event, target)
	}
	_handleBuildingDrop({building, target}) {
		target.system.api.addBuilding(building, target)
	}
	_registerEvent({event, target}) {
		if (target.getFlag("simple-settlements", `events.${event.id}`)) {
			// target.setFlag('simple-settlements', `events.${event.id}.quantity` , event.quantity + 1);
			return;
		}
		target.setFlag("simple-settlements", "events", {
			[event.id]: {
				id: event.id,
				turn: 1,
			},
		});
	}
}

export default DroppHandler;
