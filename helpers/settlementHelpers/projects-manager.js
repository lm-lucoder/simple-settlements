export default class ProjectsManager{
    static _init(rawProjects){
      let projects = this._getAllProjects(rawProjects)
      return projects 
    }
    static _getAllProjects(rawProjects){
  
      const unfilteredProjects = rawProjects.map((rawProject, i) => {
        const project = game.actors.get(rawProject.id)
        if (project) {
          project.turn = rawProject.turn
          this._prepareDescriptionData(project)
          return project
        }
      })
      const projects = unfilteredProjects.filter(element => element !== undefined)
      return projects
    }
    static async _prepareDescriptionData(project){
          project.system.description = await TextEditor.enrichHTML(
              project.system.description,
              {
                  async: true,
                  relativeTo: this.object,
              }
          );
      }
  }
  