class BuildingDrop {
    static async itemDrop(e, data, projectSheet) {
        const projectActor = projectSheet.object
        const droppedId = data.uuid.replace("Item.", "")
        const droppedDocument = game.items.get(droppedId)
        const droppedType = droppedDocument.type.replace("simple-settlements.", "")

        if (e.target.className.includes("requirements-resources-list")) {
            if (!(droppedType === "resource")) return 
            console.log("droppedType", droppedType)
            await this.addRequirementItem("resource", projectActor, droppedId)
            
            return true
        }
        return
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
}

export default BuildingDrop

//// game.actors.get("HiOj6xtxj5k1Or4I").update({ system: { requirements: {events: []} } })