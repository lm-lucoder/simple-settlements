export default class MacroManager {
	static handleIncomeData(income, system) {
		const macros = this.getMacros(system, "incomeMacros");
        macros.forEach(macro => {
            eval(macro.command)
        })
	}
    static handleTimePasser(income, system){
        const macros = this.getMacros(system, "turnMacros");
        macros.forEach(macro => {
            eval(macro.command)
        })
    }
	static getMacros(system, key) {
		return system.options.macros[key]
			.split(";")
			.map((macroName) => {
				const foundMacro = game.macros.contents.find(
					(macro) => macro?.name === macroName
				);
				return foundMacro;
			})
			.filter((macro) => macro?.type === "script");
	}
}