class BuildingSheet extends ItemSheet {
    get template(){
        const path = "modules/simple-settlements/templates"
        return `${path}/building-sheet.html`
    }
}

export default BuildingSheet