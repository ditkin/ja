/*
 * Author: David Itkin
 */

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

    static getCustomElemClassDefinition() {
        return class JaCompo extends HTMLElement {
            constructor() {
                super()

                Object.assign(this, this.constructor.prototype)

                // create shadowDOM if privacy enabled
                if (this.shaded) {
                    this.shade = this.attachShadow({ mode: 'open' })
                }

                // transfer over methods
                Object.assign(this, this.methods)

                // transfer over methods
                Object.assign(this, this.state)

                // transfer styles
                Object.keys(this.styles).forEach(styleName => {
                    this[`${styleName}Style`] = this.styles[styleName]
                })

                this.render()

                this.onCreate && this.onCreate()
            }

            connectedCallback() {
                this.onAttach && this.onAttach()
            }

            disconnectedCallback() {
                this.onDestroy && this.onDestroy()
            }

            static get observedAttributes() {
                return [ ... new Set(this.props) ]
            }

            attributeChangedCallback(name, oldVal, val) {
                try {
                    val = JSON.parse(val)
                }
                catch(e) {
                }

                this[name] = val
            }

            /**
             * To be used when:
             *  1) passing non-string/number props to child element
             *  2) rendering custom elements (but only necessary if their name was transformed)
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
                if (this.shade) {
                    this.shade.innerHTML = this.html()
                } else {
                    this.innerHTML = this.html()
                }
            }
        }
    }

    static use({
        type,
        shaded,
        props=[],
        state={},
        methods={},
        html,
        onCreate,
        onAttach,
        onDestroy,
        styles={}
        }) {

        if (this.isValidCustomElemName(type)) {
            const JaCompo = this.getCustomElemClassDefinition()
            Object.assign(JaCompo.prototype, arguments[0])

            customElements.define(type, JaCompo)
        }
    }

    // is custom element defined already?
    static isOpen(component) {
        return !customElements.get(component)
    }

    // is name worthy of a custom element?
    static isValidCustomElemName(name) {
        try {
            const cutName = name.split('-')
            const nameValid = this.isOpen(name) && cutName.length > 1 && cutName[0] !== ''

            return nameValid
        }
        catch (e) {
            console.error('Please specify a name for your component in format "a-b"')
            return false
        }
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
    type: 'cat-component',
    shaded: true,
    props: [ 'name', 'fur', 'paws' ],
    state: {
        hungry: false,
        fur: { white: 50, black: 50 },
    },
    methods: {
        meow() {
            JaRadio.trigger('cat:meowed', this)
        }
    },
    onCreate() {
    },
    onAttach() {
        this.shade.firstElementChild.addEventListener('click', () => {
            this.meow()
        })
    },
    onDestroy() {
        console.log('BYE!')
    },
    html() {
        return `
            <template>
            <slot name="mcja"></slot>
            </template>
        `
        //return `
        //<div style=${this.mainStyle()} name=${this.name}>${this.name}</div>
        //`
    },
    styles: {
        main: () => (`"
            color: red;
            margin: 100px 30px 50px;
        "`),
    }
})


Ja.use({
    type: 'play-pen',
    shaded: true,
    state: {
        cats: [],
    },
    methods: {
        feedCat(cat) {
            const catIdx = this.cats.findIndex(elem => elem.name === cat.name)
            this.cats[catIdx] = cat

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
        this.state.cats.forEach(cat => {
            htmlString += `
                <p style=${this.fedStyle()}>
                    ${cat.name}
                    ${cat.fur}
                    <br>
                </p>
            `
        })
        this.state.cats.forEach(cat => {
            htmlString += `
                <cat-component style=${this.penStyle()}
                ${cat.hungry ? 'hungry' : ''}
                fur=${cat.fur}>
                </cat-component>
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
        fed: () => (`"
            color: blue;
            border: 2px solid brown;
        "`),
    }
})
