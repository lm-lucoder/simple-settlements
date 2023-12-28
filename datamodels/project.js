class ProjectData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
      const fields = foundry.data.fields;
      return {
        description: new fields.HTMLField({required: false, blank: false, initial: "<p></p>"}),
        requirements: new fields.SchemaField({
            events: new fields.ArrayField(new fields.SchemaField({
                id: new fields.StringField({required: false}),
                name: new fields.StringField({required: false}),
                type: new fields.StringField({required: false, initial: "actor.event"})
            })),
            features: new fields.ArrayField(new fields.SchemaField({
                id: new fields.StringField({required: false}),
                name: new fields.StringField({required: false}),
                type: new fields.StringField({required: false, initial: "item.feature"})
            })),
            buildings: new fields.ArrayField(new fields.SchemaField({
                id: new fields.StringField({required: false}),
                name: new fields.StringField({required: false}),
                type: new fields.StringField({required: false, initial: "actor.building"})
            })),
            resources: new fields.ArrayField(new fields.SchemaField({
                id: new fields.StringField({required: false}),
                quantity: new fields.NumberField({required: false, initial: 0}),
                name: new fields.StringField({required: false}),
                type: new fields.StringField({required: false, initial: "item.resource"})
            })),
        }),
        results: new fields.SchemaField({
            events: new fields.ArrayField(new fields.SchemaField({
                id: new fields.StringField({required: false}),
                name: new fields.StringField({required: false}),
                type: new fields.StringField({required: false, initial: "actor.event"})
            })),
            features: new fields.ArrayField(new fields.SchemaField({
                id: new fields.StringField({required: false}),
                name: new fields.StringField({required: false}),
                type: new fields.StringField({required: false, initial: "item.feature"})
            })),
            buildings: new fields.ArrayField(new fields.SchemaField({
                id: new fields.StringField({required: false}),
                name: new fields.StringField({required: false}),
                type: new fields.StringField({required: false, initial: "actor.building"})
            })),
            resources: new fields.ArrayField(new fields.SchemaField({
                id: new fields.StringField({required: false}),
                quantity: new fields.NumberField({required: false, initial: 0}),
                name: new fields.StringField({required: false}),
                type: new fields.StringField({required: false, initial: "item.resource"})
            })),
        }),
        duration: new fields.NumberField({initial: 1}),
        // owner: new fields.SchemaField({
        //     have: new fields.StringField({initial: "dont-have"}),
        //     turnAdder: new fields.NumberField({initial: 0}),
        // }),
        configs: new fields.SchemaField({
            // actorType: new fields.StringField({required: false}),
            turnMacros: new fields.StringField({initial: ""}),
            finishMacros: new fields.StringField({initial: ""}),
        })
      };
    }
    prepareDerivedData() {
        const fullData = this._getFullData()
        this.fullData = fullData
    }

    _getFullData(){
		const requirements = {
			buildings: [],
			events: [],
			features: [],
			resources: []
		}
		const results = {
			buildings: [],
			events: [],
			features: [],
			resources: []
		}
		Object.keys(this.requirements).forEach((requirement, i) => {
			if (requirement.length === 0) return
            for (let i = 0; i < this.requirements[requirement].length; i++) {
                const requirementValue = this.requirements[requirement][i]
                const isActor = requirementValue.type.split(".")[0] === "actor" ? true : false
                let elementData
                if (isActor) {
                    elementData = game.actors.get(requirementValue.id)
                } else {
                    elementData = game.items.get(requirementValue.id)
                }
                const type = requirementValue.type.split(".")[1]
                if (type === "resource") {
                    elementData.quantity = requirementValue.quantity
                }
                requirements[type+"s"].push(elementData)
            }
		})
		Object.keys(this.results).forEach((result, i) => {
			if (result.length === 0) return
            for (let i = 0; i < this.results[result].length; i++) {
                const resultValue = this.results[result][i]
                const isActor = resultValue.type.split(".")[0] === "actor" ? true : false
                let elementData
                if (isActor) {
                    elementData = game.actors.get(resultValue.id)
                } else {
                    elementData = game.items.get(resultValue.id)
                }
                const type = resultValue.type.split(".")[1]
                if (type === "resource") {
                    elementData.quantity = resultValue.quantity
                }
                results[type+"s"].push(elementData)
            }
		})
        
		return {requirements, results}
	}
}

export default ProjectData