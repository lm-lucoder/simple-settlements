class ProjectData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
      const fields = foundry.data.fields;
      return {
        description: new fields.HTMLField({required: false, blank: false, initial: "<p></p>"}),
        requirements: new fields.SchemaField({
            events: new fields.ArrayField(new fields.SchemaField({
                id: new fields.StringField({required: false})
            })),
            feats: new fields.ArrayField(new fields.SchemaField({
                id: new fields.StringField({required: false})
            })),
            buildings: new fields.ArrayField(new fields.SchemaField({
                id: new fields.StringField({required: false})
            })),
            resources: new fields.ArrayField(new fields.SchemaField({
                id: new fields.StringField({required: false}),
                amount: new fields.NumberField({required: false, initial: 0})
            })),
        }),
        results: new fields.SchemaField({
            events: new fields.ArrayField(new fields.SchemaField({
                id: new fields.StringField({required: false})
            })),
            feats: new fields.ArrayField(new fields.SchemaField({
                id: new fields.StringField({required: false})
            })),
            buildings: new fields.ArrayField(new fields.SchemaField({
                id: new fields.StringField({required: false})
            })),
            resources: new fields.ArrayField(new fields.SchemaField({
                id: new fields.StringField({required: false})
            })),
        }),
        duration: new fields.NumberField({initial: 1}),
        owner: new fields.SchemaField({
            have: new fields.StringField({initial: "dont-have"}),
            turnAdder: new fields.NumberField({initial: 0}),
        }),
        configs: new fields.SchemaField({
            actorType: new fields.StringField({required: false}),
            turnMacros: new fields.StringField({initial: ""}),
            finishMacros: new fields.StringField({initial: ""}),
        })
      };
    }
    prepareDerivedData() {

    }
}

export default ProjectData