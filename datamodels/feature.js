class FeatureData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
            description: new fields.HTMLField({required: false, blank: false, initial: "<p></p>"}),
        };
      }
      
}

export default FeatureData