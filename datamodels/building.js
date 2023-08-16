class BuildingData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
          description: new fields.HTMLField({required: false, blank: false, initial: "<p></p>"}),
        };
      }
      prepareDerivedData() {
        const items = this.parent.items.contents
        const resources = this._filterItemsResources(items)
        const categories = this._prepareResourcesCategories(resources)

        this.resources = resources
        this.categories = categories
      }

      _prepareResourcesCategories(resources){
        const categories = {}
        resources.forEach(resource => {
          if (categories[resource.system.category]) {
            categories[resource.system.category].resources.push(resource)
          } else {
            categories[resource.system.category] = {
              name: resource.system.category,
              resources: [resource]
            }
          }
        });
        return categories
      }

      _filterItemsResources(items){
        const resources = []
    
        for (let i of items) {
          i.img = i.img || DEFAULT_TOKEN;
          // Append to resources.
          if (i.type === "simple-settlements.resource") {
            resources.push(i);
          }
          // resources.push(i);
        }
    
        return resources
      }
}

export default BuildingData