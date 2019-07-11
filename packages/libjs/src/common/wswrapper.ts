import * as WS from 'ws'

class WSWrapper extends WS {

  constructor(url, _protocols: any, _websocketOptions: any) {
    super(url, _protocols, _websocketOptions)
  }

}

export default WSWrapper
