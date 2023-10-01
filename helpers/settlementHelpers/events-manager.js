export default class EventsManager{
    static async _init(rawEvents){
      let events = this._getAllEvents(rawEvents)
      return events 
    }
    static _getAllEvents(rawEvents){
  
      const unfilteredEvents = rawEvents.map((rawEvent, i) => {
        const event = game.actors.get(rawEvent.id)
        if (event) {
          event.isActive = rawEvent.turn > event.system.opening
          event.turn = rawEvent.turn
          event.hasInfiniteDuration = event.system.duration <= 0
          this._prepareDescriptionData(event)
          return event
        }
      })
      const events = unfilteredEvents.filter(element => element !== undefined)
      return events
    }
    static async _prepareDescriptionData(event){
          event.system.description = await TextEditor.enrichHTML(
              event.system.description,
              {
                  async: true,
                  relativeTo: this.object,
              }
          );
      }
  }
  