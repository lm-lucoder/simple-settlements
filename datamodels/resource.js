class ResourceData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
          quantity: new fields.NumberField({ integer: true, required: false, nullable: true, initial: 0}),
          description: new fields.HTMLField({required: false, blank: false, initial: "<p></p>"}),
          isStatic: new fields.BooleanField({required: false, initial: false})
        };
      }
      prepareDerivedData() {
        // console.log(this)
        // const resourceData = this;
        // const systemData = resourceData.system;
        // const flags = resourceData.flags.boilerplate || {};
        this._prepareResourceDetails()
      }
      
      _prepareResourceDetails(){
      }
}

export default ResourceData