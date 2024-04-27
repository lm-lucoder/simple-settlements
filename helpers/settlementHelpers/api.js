class SettlementAPI {

    static passSettlementTime(settlement){

    }

    /* ======== BUILDINGS ======== */
    static addBuilding (building, settlement, quantity){
        const system = settlement.system
        const rawBuildings = system.raw.buildings
        const rawBuildingExists = rawBuildings.find(element => building.id === element.id)
        if (rawBuildingExists) {
            rawBuildingExists.count += quantity ? quantity : 1
            settlement.update({system:{raw:{
                buildings: [...rawBuildings]
            }}})
        } else {
            settlement.update({system:{raw: {
                buildings: [...rawBuildings, {id: building.id, count: quantity ? quantity : 1}]
            }}})
        }
    }
    static addQuantityToBuilding (buildingId, settlement, qt){
        const system = settlement.system
        const rawBuildings = system.raw.buildings
		const rawBuilding = rawBuildings.find(el => el.id === buildingId)
		rawBuilding.count += qt ? qt : 1
		settlement.update({system: {raw: {
			buildings: [...rawBuildings]
		}}})
	}
    static removeQuantityToBuilding(buildingId, settlement, qt){
        const system = settlement.system
        const rawBuildings = system.raw.buildings
		const rawBuilding = rawBuildings.find(el => el.id === buildingId)
		rawBuilding.count -= qt ? qt : 1
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
        
        if (!this.verifyProjectDependencies(project, settlement)){
            return
        }
        
        settlement.update({system:{raw: {
            projects: [...rawProjects, {id: project.id}]
        }}})
    }
    static removeProject(projectid, settlement){
        const system = settlement.system
        const rawProjects = system.raw.projects
        const rawProjectIndex = rawProjects.findIndex(el => projectid === el.id)
        rawProjects.splice(rawProjectIndex, 1)
        settlement.update({system: {raw: {
            projects: [...rawProjects]
        }}})
    }
    static advanceProject(project, settlement){
        
        console.log('Advance projetct: ', project)
        console.log('Advance Settlement: ', settlement)

        const system = settlement.system
        const rawProjects = system.raw.projects
        
        if (project.turn >= project.system.duration) {
            const rawProjectIndex = rawProjects.findIndex(el => project.id === el.id)
            rawProjects.splice(rawProjectIndex, 1)
            settlement.update({system:{raw: {
                projects: [...rawProjects]
            }}})
            return this.concludeProject(project, settlement)
        }
        const rawProject = rawProjects.find(el => project.id === el.id)
        rawProject.turn += 1
        settlement.update({system:{raw: {
            projects: [...rawProjects]
        }}})

    }
    static concludeProject(project, settlement){
        // Resources
        let toUpdate = []
        let toCreate = []
        //debugger
        project.system.results.resources.forEach(resource => {
            let exitingResource = settlement.system.resources.find(el => el.name == resource.name)
            if(exitingResource){
                toUpdate.push({_id: exitingResource.id, system: {quantity: resource.quantity + exitingResource.system.quantity}})
            } else {
                const worldResource = Item.get(resource.id)
                toCreate.push({...worldResource, system: {...worldResource.system, quantity: resource.quantity}})
            }
        })
        if (toUpdate.length > 0) {
            Item.updateDocuments(toUpdate, {parent: settlement})
        }
        if (toCreate.length > 0) {
            Item.createDocuments(toCreate, {parent: settlement})
        }
        // Buildings
        project.system.results.buildings.forEach(building => {
            
            let exitingBuilding = settlement.system.raw.buildings.find(el => el.id == building.id)
            if(exitingBuilding){
                settlement.system.api.addQuantityToBuilding(exitingBuilding.id, settlement, building.quantity)
            } else {
                const foundedBuilding = Actor.get(building.id)
                settlement.system.api.addBuilding(foundedBuilding, settlement, building.quantity)
            }
        })
        // Events
        project.system.results.events.forEach(event => {
            let exitingEvent = settlement.system.raw.events.find(el => el.id == event.id)
            if(exitingEvent){
                return ui.notifications.info(`The event: "${exitingEvent.name}" already exists in this settlement`)
            } else {
                const foundedEvent = Actor.get(event.id)
                settlement.system.api.addEvent(foundedEvent, settlement)
            }
        })
        
        //Features
        toCreate = []
        project.system.results.features.forEach(feature => {
            let exitingFeature = settlement.system.features.find(el => el.name == feature.name)
            if(exitingFeature){
                return ui.notifications.info(`The feature: "${exitingFeature.name}" already exists in this settlement`)
            } else {
                const worldFeature = Item.get(feature.id)
                toCreate.push({...worldFeature})
            }
        })
        if (toCreate.length > 0) {
            Item.createDocuments(toCreate, {parent: settlement})
        }
    }

    static verifyProjectDependencies(project, settlement){
        const log = []
        const {requirements} = project.system.fullData
        
        Object.keys(requirements).forEach((requirement) => {
            for (let i = 0; i < requirements[requirement].length; i++) {
                const requirementValue = requirements[requirement][i]
                const isActor = requirementValue.type.split(".")[0] === "actor" ? true : false
                const type = requirementValue.type.split(".")[1]
              
                if (type === "resource") {
                    
                    if(requirementValue.consumesOnlyOnFinish){
                        continue
                    }

                    let resource = settlement.system.resources.find(resource=> resource.name === requirementValue.name)
                    if(!resource){
                        resource = settlement._sheet.income.all[requirementValue.name]?.data
                    }

                    if (!resource){
                        
                        log.push('The resource: ' + requirementValue.name + ' was not found in that settlement.')
                        continue
                    }

                    let resourceQuantity = 0
                    if (resource.system.isStatic) {
                        if(resource){
                            resourceQuantity += resource.system.quantity
                        }
                        resourceQuantity += settlement._sheet.income.all[requirementValue.name]?.income
                    }
                    
                    if (resourceQuantity < requirementValue.quantity){
                   
                        log.push(`The resource: ${requirementValue.name} is under the required ammount (${resourceQuantity}/${requirementValue.quantity})`)
                        continue
                    }
                    if(!requirementValue.consumesOnlyOnFinish && resource.quantity < requirementValue.quantity){
                        log.push('The resource: ' + resource.name + ' has not enough quantity to support this project.')
                    }
                } else if (type === "building") {
                    const building = settlement.system.buildings.find(building=> building.id === requirementValue.id);
                    if(!building){
                        log.push(`The required building: ${requirementValue.name} is not present in this settlement.`) 
                        continue
                    }
                    if(building.quantity < requirementValue.quantity){
                        log.push(`There is not enough buildings: ${requirementValue.name} in this settlement. (${building.quantity}/${requirementValue.quantity})`) 
                        continue
                    }
                } else {
                    const settlementMatchingValue = settlement.system[requirement].find(value=> value.name === requirementValue.name)
                    if (!settlementMatchingValue) {
                        log.push(`The ${type}: ${requirementValue.name} was not found in this settlement.`)
                    }
                }
                
            }
        })
        if(log.length > 0){
            ui.notifications.info(log.join(", "))
        }
        if(log.length == 0){
            return true
        }
    }
}

export default SettlementAPI