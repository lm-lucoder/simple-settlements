class ProjectDrop {
    static async actorDrop(e, data, projectSheet) {
        const projectActor = projectSheet.object
        const droppedId = data.uuid.replace("Actor.", "")
        const droppedDocument = game.actors.get(droppedId)
        const droppedType = droppedDocument.type.replace("simple-settlements.", "")

        if (e.target.className.includes("requirements-events-list")) {
            if (!(droppedType === "event")) return
            await this.addRequirementActor("event", projectActor, droppedId)
            return
        }
        if (e.target.className.includes("requirements-buildings-list")) {
            if (!(droppedType === "building")) return
            await this.addRequirementActor("building", projectActor, droppedId)
            return
        }
        if (e.target.className.includes("results-events-list")) {
            if (!(droppedType === "event")) return
            await this.addResultActor("event", projectActor, droppedId)
            return
        }
        if (e.target.className.includes("results-buildings-list")) {
            if (!(droppedType === "building")) return
            await this.addResultActor("building", projectActor, droppedId)
            return
        }
    }
    static async itemDrop(e, data, projectSheet) {
        const projectActor = projectSheet.object
        const droppedId = data.uuid.replace("Item.", "")
        const droppedDocument = game.items.get(droppedId)
        const droppedType = droppedDocument.type.replace("simple-settlements.", "")

        if (e.target.className.includes("requirements-features-list")) {
            if (!(droppedType === "feature")) return
            await this.addRequirementItem("feature", projectActor, droppedId)
            return
        }
        if (e.target.className.includes("requirements-resources-list")) {
            if (!(droppedType === "resource")) return
            await this.addRequirementItem("resource", projectActor, droppedId)
            return
        }
        if (e.target.className.includes("results-features-list")) {
            if (!(droppedType === "feature")) return
            await this.addResultItem("feature", projectActor, droppedId)
            return
        }
        if (e.target.className.includes("results-resources-list")) {
            if (!(droppedType === "resource")) return
            await this.addResultItem("resource", projectActor, droppedId)
            return
        }
    }

    static async addRequirementActor(type, projectActor, droppedId) {
        const droppedDocument = game.actors.get(droppedId)
        const types = projectActor.system.requirements[type+"s"]
        if(types.find(idObj => idObj.id === droppedId)) return;
        await projectActor.update({ system: { requirements: {[type+"s"]: [...types, {id: droppedId, name: droppedDocument.name}]} } })
    }
    static async addRequirementItem(type, projectActor, droppedId) {
        
        const droppedDocument = game.items.get(droppedId)
        const types = projectActor.system.requirements[type+"s"]
        if(types.find(idObj => idObj.id === droppedId)) return;
        /* if (type === "resource") {
            await projectActor.update({ system: { requirements: {[type+"s"]: [...types, {id: droppedId, name: droppedDocument.name, quantity: 0}]} } })
        } */
        await projectActor.update({ system: { requirements: {[type+"s"]: [...types, {id: droppedId, name: droppedDocument.name}]} } })
    }
    static async addResultActor(type, projectActor, droppedId) {
        const droppedDocument = game.actors.get(droppedId)
        const types = projectActor.system.results[type+"s"]
        if(types.find(idObj => idObj.id === droppedId)) return;
        await projectActor.update({ system: { results: {[type+"s"]: [...types, {id: droppedId, name: droppedDocument.name}]} } })
    }
    static async addResultItem(type, projectActor, droppedId) {
        const droppedDocument = game.items.get(droppedId)
        const types = projectActor.system.results[type+"s"]
        if(types.find(idObj => idObj.id === droppedId)) return;
        /* if (type === "resource") {
            await projectActor.update({ system: { results: {[type+"s"]: [...types, {id: droppedId, name: droppedDocument.name, quantity: 0}]} } })
        } */
        await projectActor.update({ system: { results: {[type+"s"]: [...types, {id: droppedId, name: droppedDocument.name}]} } })
    }
}

export default ProjectDrop

//// game.actors.get("HiOj6xtxj5k1Or4I").update({ system: { requirements: {events: []} } })