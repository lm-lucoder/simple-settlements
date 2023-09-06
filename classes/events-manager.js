export default class EventsManager{
    static async _init(flags){
      let events = this._getAllEvents(flags)
      return events 
    }
    static _getAllEvents(flags){
      const eventsData = Object.values(flags["simple-settlements"]?.events || {})
  
      const unfilteredEvents = eventsData.map((flagData, i) => {
        const event = game.actors.get(flagData.id)
        if (event) {
          event.isActive = flagData.turn > event.system.opening
          event.turn = flagData.turn
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
    static advanceEvent({actor, event}){
      if (event.turn - event.system.opening >= event.system.duration && !event.hasInfiniteDuration) {
        // actor.events.find(event => event == event)
        actor.unsetFlag('simple-settlements', `events.${event.id}`)
        return
      }
      actor.setFlag('simple-settlements', `events.${event.id}.turn`, event.turn + 1)
    }
  }
  