class SettlementAPI {

    static passSettlementTime(settlement){

    }

    /* ======== BUILDINGS ======== */
    static addBuilding (building, settlement){
        const system = settlement.system
        const rawBuildings = system.raw.buildings
        const buildingExists = rawBuildings.find(element => building.id === element.id)
        if (buildingExists) {
            buildingExists.count += 1
            settlement.update({system:{raw:{
                buildings: [...rawBuildings]
            }}})
        } else {
            settlement.update({system:{raw: {
                buildings: [...rawBuildings, {id: building.id}]
            }}})
        }
    }
    static addQuantityToBuilding (buildingId, settlement){
        const system = settlement.system
        const rawBuildings = system.raw.buildings
		const rawBuilding = rawBuildings.find(el => el.id === buildingId)
		rawBuilding.count += 1
		settlement.update({system: {raw: {
			buildings: [...rawBuildings]
		}}})
	}
    static removeQuantityToBuilding(buildingId, settlement){
        const system = settlement.system
        const rawBuildings = system.raw.buildings
		const rawBuilding = rawBuildings.find(el => el.id === buildingId)
		rawBuilding.count -= 1
		settlement.update({system: {raw: {
			buildings: [...rawBuildings]
		}}})
	}
    static removeBuilding(buildingId, settlement){
        const system = settlement.system
        const rawBuildings = system.raw.buildings
        const rawBuildingIndex = rawBuildings.findIndex(el => el.id === buildingId)
        rawBuildings.splice(rawBuildingIndex, 1)
        settlement.update({system: {raw: {
            buildings: [...rawBuildings]
        }}})
    }

    /* ======== EVENTS ======== */
    static addEvent(event, settlement){
        const system = settlement.system
        const rawEvents = system.raw.events
        const eventExists = rawEvents.find(el => event.id === el.id)

        if (eventExists) return; 

        settlement.update({system:{raw: {
            events: [...rawEvents, {id: event.id}]
        }}})
    }

    static removeEvent(eventId, settlement){
        const system = settlement.system
        const rawEvents = system.raw.events
        const rawEventIndex = rawEvents.findIndex(el => eventId === el.id)
        rawEvents.splice(rawEventIndex, 1)
        settlement.update({system: {raw: {
            events: [...rawEvents]
        }}})
    }

    static advanceEvent(event, settlement){
        const system = settlement.system
        const rawEvents = system.raw.events
        
        if (event.turn - event.system.opening >= event.system.duration && !event.hasInfiniteDuration) {
            const rawEventIndex = rawEvents.findIndex(el => event.id === el.id)
            rawEvents.splice(rawEventIndex, 1)
            settlement.update({system:{raw: {
                events: [...rawEvents]
            }}})
            return
        }
        const rawEvent = rawEvents.find(el => event.id === el.id)
        rawEvent.turn += 1
        settlement.update({system:{raw: {
            events: [...rawEvents]
        }}})
    }
    /* ======== PROJECTS ======== */
    static addProject(project, settlement){
        const system = settlement.system
        const rawProjects = system.raw.projects
        const projectExists = rawProjects.find(el => project.id === el.id)

        if (projectExists) return; 

        settlement.update({system:{raw: {
            projects: [...rawProjects, {id: project.id}]
        }}})
    }
    static removeProject(){

    }
    static advanceProject(){
        
    }
    static concludeProject(){

    }
}

export default SettlementAPI