class ResourceData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
          quantity: new fields.NumberField({ integer: true, required: false, nullable: true, initial: 0})
        };
      }
      prepareDerivedData() {
        console.log(this)
      }
}

export default ResourceData