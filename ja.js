class Ja {
    constructor(options) {
        options = options || {}
    }

    static startRadio() {
        window.JaRadio = new Radio()
    }

    static startRouter() {
        window.Router = new Router()
    }

    static use({
        name,
        props=[],
        state={},
        methods={},
        html,
        onCreate,
        onAttach,
        onDestroy,
        styles={},
    }) {

        // is custom element defined already?
        if (this.isOpen(name)) {
            class JaCompo extends HTMLElement {
                constructor() {
                    super()
                    Object.assign(this, this.constructor.prototype)
                }

                connectedCallback() {

                    // transfer over methods
                    Object.assign(this, methods)

                    // transfer styles
                    Object.keys(styles).forEach(styleName => {
                        this[`${styleName}Style`] = styles[styleName]
                    })

                    // hook up lifecycle callbacks
                    onCreate && onCreate.call(this)

                    this.disconnectedCallback = onDestroy
                }

                static get observedAttributes() {
                    const attrs = [].concat( props, Object.keys(state) )
                    return [ ... new Set(attrs) ]
                }

                attributeChangedCallback(name, oldVal, newVal) {
                    console.log(arguments);
                }

                render() {
                    this.innerHTML = html.call(this);
                }
            }

            Object.assign(JaCompo.prototype, arguments[0])

            customElements.define(name, JaCompo)

        }
    }

    static isOpen(component) {
        return !customElements.get(component)
    }
}

class Radio {
    /**
     * @param events Object
     * keys: event name
     * value: Set of callbacks
     */
    constructor() {
        this.events = { }
    }

    on(event, callback, context) {
        this.events[event] = this.events[event] || new Set()
        callback = context ? callback.bind(context) : callback
        this.events[event].add(callback)
    }

    off(event, callback) {
        if (this.events[event]) {
            this.events[event].delete(callback)
        }
    }

    trigger(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(fn => fn(data))
        }
    }
}

class Router {
}

Ja.startRadio()

Ja.use({
    name: 'feona-cat',
    props: [ 'fur', 'paws' ],
    state: {
        hungry: false,
        action: 'loafing',
    },
    methods: {
        eat() {
            this.state.action = 'eating'
            this.state.hungry = false
        },
        meow() {
            this.state.action = 'meowing'
            console.log(`${this.state.hungry ? 'MEOW' : 'purr'}`)
        },
    },
    onCreate() {
        JaRadio.trigger('new:cat', {
            name: 'feona',
            hungry: this.state.hungry
        })
    },
    onAttach() {
    },
    onDestroy() {
        console.log('BYE!')
    },
    html() { return `
        <div style=${this.mainStyle()}>${this.state.action}</div>
    `},
    styles: {
        main: () => (`"
            color: red;
            margin: 100px 30px 50px;
        "`),
    }
})


Ja.use({
    name: 'play-pen',
    state: {
        cats: [],
    },
    methods: {
        addCat(cat) {
            this.state.cats.push(cat)
            this.render()
        },
    },
    onCreate() {
        JaRadio.on('new:cat', this.addCat, this)
    },
    onDestroy() {
        JaRadio.off('new:cat')
    },
    html() {
        let htmlString = ''
        this.state.cats.forEach(cat => {
            htmlString += `
                <feona-cat style=${this.penStyle()}
                ${cat.hungry ? 'hungry' : ''}
                fur=${cat.fur}>
                </feona-cat>
            `
        })
        return htmlString
    },
    styles: {
        pen: () => (`"
            color: red;
            margin: 100px 30px 50px;
        "`),
    }
})
