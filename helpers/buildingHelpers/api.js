class BuildingApi {
    constructor(buildingSystem){
        this.buildingSystem = buildingSystem
    }
    async verifyRequirements(settlement, atemporalIncome){
        const buildingRequirements = this.buildingSystem.requirements.resources
        const rawBuildingData = settlement.system.raw.buildings.find(el => el.id == this.buildingSystem.parent.id)
        const buildingQuantity = rawBuildingData.count
        
        for(let requiredResource of buildingRequirements){
            if(requiredResource.quantity <= 0) return true;
            const originalResource = Item.get(requiredResource.id)
            if(!originalResource) return;
            const settlementResources = settlement.system.resources;
            const resourceInIncome = atemporalIncome.all[requiredResource.name]
            if(!resourceInIncome) return false;
            let actual = 0
            if(originalResource.isStatic){
                actual = resourceInIncome.income + resourceInIncome.stored;
            } else {
                actual = resourceInIncome.stored
            }
            
            if((actual - (requiredResource.quantity * buildingQuantity))  < 0){
                return false
            } else {
                return true
            }
        }
    }
}


export default BuildingApi

/* class Casa {
    constructor(endereco){
        this.endereco = endereco
    }
    api = api
}

class api {
    getEndereco() {
        return this.endereco
    }
}

const casa = new Casa("exemplo endereco 1")
console.log(casa.api.getEndereco()) */
