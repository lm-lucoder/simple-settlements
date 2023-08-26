class BuildingData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
          description: new fields.HTMLField({required: false, blank: false, initial: "<p></p>"}),
          /* features: new fields.ArrayField(new fields.SchemaField({
            title: new fields.StringField(),
            description: new fields.HTMLField({required: false, blank: false, initial: "<p></p>"})
          })) */
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
      /* async addFeature({title, description}){
        const features = this.parent.system.features
        features.push({title, description})

        await this.parent.update({system: {features : [
          ...features
        ]}})
        console.log(features)
      }
      async updateFeature({title, newTitle, description}){
        const features = this.parent.system.features
        
        const updatingFeature = features.find(feature => feature.title === title)
        const updatingFeatureIndex = features.findIndex(feature => feature.title === title)

        if (newTitle) updatingFeature.title = newTitle
        if (description) updatingFeature.description = description

        features.splice(updatingFeatureIndex, 1, updatingFeature)

        await this.parent.update({system: {features : [
          ...features
        ]}})
        console.log(features)
      }
      async deleteFeature({title}){
        const features = this.parent.system.features
        const deletingFeatureIndex = features.findIndex(feature => feature.title === title)
        features.splice(deletingFeatureIndex, 1)

        await this.parent.update({system: {features : [
          ...features
        ]}})
        console.log(features)
      } */
}

export default BuildingData

// game.actors.get("RBVKhr7AFPEcWtB8").update({system: {features: [{title: "TESTE 2", description: "<h2>testeeeee</h2>", atoa: "atoa"}]}}); console.log(game.actors.get("RBVKhr7AFPEcWtB8").system.features)
// Actor.update