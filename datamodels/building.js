import BuildingApi from "../helpers/buildingHelpers/api.js";

class BuildingData extends foundry.abstract.TypeDataModel {
  api = new BuildingApi(this)

  static defineSchema() {
    const fields = foundry.data.fields;
    return {
      description: new fields.HTMLField({ required: false, blank: false, initial: "<p></p>" }),
      category: new fields.StringField({ required: false, initial: "" }),
      requirements: new fields.SchemaField({
        resources: new fields.ArrayField(new fields.SchemaField({
          id: new fields.StringField({ required: false }),
          quantity: new fields.NumberField({ required: false, initial: 0 }),
          name: new fields.StringField({ required: false }),
          type: new fields.StringField({ required: false, initial: "item.resource" }),
          breaks: new fields.BooleanField({ required: false, initial: false })
        })),
      })
    };
  }
  prepareDerivedData() {
    const items = this.parent.items.contents
    const { resources, features } = this._filterItems(items)
    const categories = this._prepareResourcesCategories(resources)

    this._enrichFeatures(features)

    this.resources = resources.toSorted((a, b) => {
      return (a.sort ?? 0) - (b.sort ?? 0);
    });
    this.features = features
    this.categories = categories

  }

  _prepareResourcesCategories(resources) {
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

  _filterItems(items) {
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

    return { resources, features }
  }

  async _enrichFeatures(features) {
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

export default BuildingData