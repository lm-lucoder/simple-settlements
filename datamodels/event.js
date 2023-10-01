class EventData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
      const fields = foundry.data.fields;
      return {
        description: new fields.HTMLField({required: false, blank: false, initial: "<p></p>"}),
        opening: new fields.NumberField({required: true, nullable: false, initial: 0}),
        duration: new fields.NumberField({required: true, nullable: false, initial: 0}),
        transform: new fields.StringField({required: false, initial: ""}),
        nature: new fields.StringField({required: false, initial: "neutral"}),
      };
    }
    prepareDerivedData() {
      const items = this.parent.items.contents
      const {resources, features} = this._filterItems(items)
      const categories = this._prepareResourcesCategories(resources)

      this._enrichFeatures(features)

      this.resources = resources
      this.features = features
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

    _filterItems(items){
      const resources = []
      const features = []
  
      for (let i of items) {
        i.img = i.img || DEFAULT_TOKEN;
        // Append to resources.
        if (i.type === "simple-settlements.resource") {
          resources.push(i);
        }
        if (i.type === "simple-settlements.feature") {
          features.push(i);
        }
        // resources.push(i);
      }
  
      return {resources, features}
    }

    async _enrichFeatures(features){
      for (let i = 0; i < features.length; i++) {
        const feature = features[i];
        const description = await TextEditor.enrichHTML(
          feature.system.description,
          {
            async: true,
            secrets: this.parent.isOwner,
            relativeTo: this.parent,
          }
        );
        feature.system.description = description;
      }
    }
}

export default EventData