class ResourceData extends foundry.abstract.TypeDataModel {
    static defineSchema() {
        const fields = foundry.data.fields;
        return {
        };
      }
      prepareDerivedData() {
        console.log(this)
      }
}

export default ResourceData