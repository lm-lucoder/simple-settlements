export default class MacroManager{
    static getIncomeMacros(){

    }
    static handleIncomeData(income, flags){
        const macrosStr = this.getMacros(flags, "incomeMacros")
        console.log("================================")
        console.log(macrosStr)
        console.log("================================")
    }
    static getMacros(flags, key) {
        return flags["simple-settlements"]?.options?.macros?.[key]
	}
}