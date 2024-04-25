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
                type: new fields.StringField({required: false, initial: "item.resource"}),
                consumes: new fields.BooleanField({required: false, initial: false}),
                consumesOnlyOnFinish: new fields.BooleanField({required: false, initial: false}),
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
                type: new fields.StringField({required: false, initial: "item.resource"}),
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
            for (let i = 0; i < this.requirements[requirement].length; i++) {
                const requirementValue = this.requirements[requirement][i]
                // console.log("requirementValue")
                // console.log(requirementValue)
                const isActor = requirementValue.type.split(".")[0] === "actor" ? true : false
                const type = requirementValue.type.split(".")[1]
                
                let elementData 
                
                if (isActor) {
                    const {img, name} = game.actors.get(requirementValue.id)
                    elementData = {...requirementValue, img, name}
                } else {
                    const {img, name} = game.items.get(requirementValue.id)
                    elementData = {...requirementValue, img, name}
                }
                if (type === "resource") {
                    
                }
                requirements[type+"s"].push(elementData)
            }
		})
		Object.keys(this.results).forEach((result, i) => {
            for (let i = 0; i < this.results[result].length; i++) {
                const resultValue = this.results[result][i]
                // console.log("resultValue")
                // console.log(resultValue)
                const isActor = resultValue.type.split(".")[0] === "actor" ? true : false
                const type = resultValue.type.split(".")[1]
                
                let elementData 
                
                if (isActor) {
                    const {img, name} = game.actors.get(resultValue.id)
                    elementData = {...resultValue, img, name}
                } else {
                    const {img, name} = game.items.get(resultValue.id)
                    elementData = {...resultValue, img, name}
                }
                if (type === "resource") {
                    
                }
                results[type+"s"].push(elementData)
            }
		})
        console.log("Requirements", requirements)
        console.log("Results", results)
        
		return {requirements, results}
	}
}

export default ProjectData