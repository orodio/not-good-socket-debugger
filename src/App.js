import React from "react"
import Tree  from "react-json-tree"
import cx    from "classnames"

// TODO make better

var INIT_URL = "ws://echo.websocket.org"

const theme = {
  scheme: 'monokai',
  author: 'wimer hazenberg (http://www.monokai.nl)',
  base00: '#272822',
  base01: '#383830',
  base02: '#49483e',
  base03: '#75715e',
  base04: '#a59f85',
  base05: '#f8f8f2',
  base06: '#f5f4f1',
  base07: '#f9f8f5',
  base08: '#f92672',
  base09: '#fd971f',
  base0A: '#f4bf75',
  base0B: '#a6e22e',
  base0C: '#a1efe4',
  base0D: '#66d9ef',
  base0E: '#ae81ff',
  base0F: '#cc6633'
}

var guid = () =>
  (+ new Date() + Math.random() * 999999 |0).toString(36)

var Title = () =>
  <h2 className="p-t-lg">Not Good Socket Debugger <small><em style={{ fontFamily: "georgia" }}><a href="https://twitter.com/cccc00">By Orodio</a></em></small></h2>

const Row = (props) => {
  return <Tree data={JSON.parse(JSON.stringify(props))} theme={ theme }/>
}

class Connection extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      id:      null,
      url:     null,
      status:  "closed",
      more:    false,
      history: [],
    }

    this.connect     = this.connect.bind(this)
    this.push        = this.push.bind(this)
    this.toggle_more = this.toggle_more.bind(this)
  }

  connect () {
    var { id, url } = this.props
    this.push("Connecting", null, { status:"connecting" }, "system")

    this.io = new WebSocket(url)
    this.io.onopen    = e => this.push("Connection Opened", e, { status:"open" }, "system")
    this.io.onerror   = e => this.push("Error", e, { status:"error" }, "error")
    this.io.onclose   = e => this.push("Closed", e, { status:"closed" }, "system")
    this.io.onmessage = e => this.push("Message", e.data)
  }

  componentDidMount () {
    this.mount = true
    this.connect()
  }

  componentWillUnmount () {
    this.mount()
    this.io.close()
  }

  push (msg, socket_payload, update={}, type="message") {
    console.log(msg, socket_payload, update, type)
    return this.mount && this.setState(state => ({
      ...state,
      ...update,
      history: [
        ...state.history,
        { id:guid(), msg, socket_payload, type, created_at: +new Date() },
      ]
    }))
  }

  toggle_more (e) {
    e.preventDefault()
    this.setState(state => ({
      ...state,
      more: !state.more
    }))
  }

  render () {
    var { id, url }         = this.props
    var { status, history } = this.state

    console.log(history)

    return <div className="well">
      <div className="dashhead">
        <div className="dashhead-titles">
          <h6 className={ cx("dashhead-title", {
            "text-info":    status === "connecting",
            "text-success": status === "open",
            "text-danger":  status === "error",
            "text-warning": status === "closed",
          }) }>
            <span className={ cx("icon", "icon-controller-record")}/> { status }
          </h6>
          <h3 className="dashhead-title">{ id }</h3>
        </div>
        <div className="dashhead-toolbar">
          <div className="dashhead-toolbar-item">
            <input defaultValue={ url } className="form-control"/>
          </div>
          <span className="dashhead-toolbar-divider hidden-xs"/>
          <div className="btn-group dashhead-toobar-item">
            <button type="button" className={ cx("btn", "btn-primary-outline", {
              "btn-active": this.state.more
            })} onClick={ this.toggle_more }><strong>{ history.length }</strong></button>
          { status === "closed" && <button type="button" className="btn btn-primary-outline" onClick={ this.connect }>Reconnect</button>}
          </div>
        </div>
      </div>
      { this.state.more && <hr/> }
      { this.state.more && <p className="text-muted"><b>NOTE:</b> socket_payload is the bit that is actually sent from the socket.</p> }
      { this.state.more && <hr/> }
      { this.state.more && <div>
        { history.map(event => <Row key={ event.id } {...event}/>) }
        </div>
      }
    </div>
  }
}

class App extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
      connections: {}
    }

    this.add_socket = this.add_socket.bind(this)
    this.clear_add_socket_form = this.clear_add_socket_form.bind(this)
  }

  add_socket (e) {
    e.preventDefault()
    var url = this.refs.new_socket.value
    if (url === "") return
    var id = guid()
    this.setState(state => ({
      ...state,
      connections: {
        ...state.connections,
        [id]: { url, id }
      }
    }))
  }

  clear_add_socket_form (e) {
    e.preventDefault()
    this.refs.new_socket.value = ""
  }

  render () {
    var { connections:cx } = this.state

    return <div className="container">
      <Title/>
      <hr/>
      <form className="flextable" onSubmit={ this.add_socket }>
        <div className="flextable-item flextable-primary">
          <input type="text" ref="new_socket" className="form-control" defaultValue={INIT_URL} placeholder={INIT_URL}/>
        </div>
        <div className="flextable-item p-l">
          <button type="submit" className="btn btn-primary">
            <span className="icon icon-plus"/> Connect
          </button>
          <button type="submit" className="btn btn-pill btn-link" onClick={ this.clear_add_socket_form }>
            <span className="icon icon-cross"/> Clear
          </button>
        </div>
      </form>
      <hr/>
      { Object.keys(cx).map(id => <Connection key={ id } {...cx[id]}/>) }
    </div>
  }
}

export default App
