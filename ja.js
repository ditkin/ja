/*
 * BEGIN Library Code
 */
class Ja {
    constructor(options) {
        options = options || {}
    }

    static startRadio() {
        window.JaRadio = new Radio()
    }

    static startRouter(options) {
        window.JaRouter = new Router(options)
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
                    Object.assign(this, this.methods)

                    // transfer over methods
                    Object.assign(this, this.state)

                    // transfer styles
                    Object.keys(styles).forEach(styleName => {
                        this[`${styleName}Style`] = styles[styleName]
                    })

                    this.render()

                    // hook up lifecycle callbacks
                    onCreate && onCreate.call(this)

                    this.disconnectedCallback = onDestroy
                }

                static get observedAttributes() {
                    const attrs = [].concat( props, Object.keys(state) )
                    return [ ... new Set(attrs) ]
                }

                attributeChangedCallback(name, oldVal, newVal) {
                    try {
                        newVal = JSON.parse(newVal)
                    } catch(e) {}

                    this[name] = newVal
                }

                /**
                 * To be used when passing non-string/number props to child element
                 * in a string literal
                 */
                parse(strings, ...props) {
                    let html = strings[0]
                    const latterStrings = strings.slice(1)

                    props.forEach((prop, idx) => {
                        html += `${JSON.stringify(prop)}${latterStrings[idx]}`
                    })
                    return html
                }

                render() {
                    this.innerHTML = html.call(this)
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

/*
 * END Library Code
 */

/*
 * BEGIN Test Code
 */
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
        //this.querySelector(`[name="${this.name}"]`).addEventListener('click', ()=> {
            //JaRadio.trigger('cat:meowed', this)
        //})
        this.firstElementChild.addEventListener('click', ()=> {
            JaRadio.trigger('cat:meowed', this)
        })

    },
    onAttach() {
    },
    onDestroy() {
        console.log('BYE!')
    },
    html() { return `
        <div style=${this.mainStyle()} name=${this.name}>${this.name}</div>
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
        feedCat(cat) {
            const catIndex = this.cats.findIndex(elem => elem.name === cat.name)
            if (catIndex > -1) {
                this.cats[catIndex].hungry = false
                this.cats[catIndex].thickness = 'YUGE'
            }
            this.render()
        },
    },
    onCreate() {
        JaRadio.on('cat:meowed', this.feedCat, this)
    },
    onDestroy() {
        JaRadio.off('cat:meowed')
    },
    html() {
        let htmlString = `<div style=${this.penStyle()}>`

        this.cats.forEach(cat => {
            htmlString += this.parse`
                <feona-cat
                    hungry=${cat.hungry}
                    fur=${cat.fur}>
                </feona-cat>
            `
        })

        htmlString += '</div>'

        return htmlString
    },
    styles: {
        pen: () => (`"
            color: red;
            margin: 100px 30px 50px;
        "`),
    }
})
