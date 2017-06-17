class Ja {
    constructor(options) {
        Object.assign(this, options)
    }

    static use({ name, props = [], state = {}, html, onCreate, onAttach }) {
        // is custom element defined already?
        if (this.isOpen(name)) {
            customElements.define(name, class JaCompo extends HTMLElement {
                constructor() {
                    super()

                    // hook up lifecycle callbacks
                    if ( onCreate ) {
                        onCreate();
                    }
                    if ( onAttach ) {
                        this.connectedCallback = () => { onAttach() }
                    }

                    this.state = state;
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
            })
        }
    }

    static isOpen(component) {
        return !customElements.get(component)
    }
}

Ja.use({
    name: 'main-ja',
    props: [ 'jaja', 'mcJaja' ],
    state: {
        police: 'state',
        jaja: 'hello',
    },
    onCreate() {
        console.log('here');
    },
    onAttach() {
        this.cooper = 'hi'
    },
    html() { return `
        <div>${this.state.police}</div>
    `},
})
