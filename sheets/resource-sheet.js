class ResourceSheet extends ItemSheet {
    get template(){
        const path = "modules/simple-settlements/templates"
        return `${path}/resource-sheet.html`
    }
}

export default ResourceSheet