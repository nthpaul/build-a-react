let React = {
  createElement: (tag, props, ...children) => {
    if (typeof tag == 'function') {
      return tag(props);
    };
    var element = { tag, props: { ...props, children } }
    return element;
  }
};

// VIRTUAL DOM TO ACTUAL DOM MAPPER
// the `reactElement` can be a reactElement, string, or number
const render = (reactElement, container) => {
  if (reactElement) {
    if (['string', 'number'].includes(typeof reactElement)) {
      container.appendChild(document.createTextNode(String(reactElement)));
      return;
    }

    const actualDomElement = document.createElement(reactElement.tag);
    if (reactElement.props) {
      Object.keys(reactElement.props)
        .filter(p => p != 'children')
        .forEach(p => {
          actualDomElement[p] = reactElement.props[p];
        })
    }

    if (reactElement.props && reactElement.props.children) {
      reactElement.props.children.forEach(child => render(child, actualDomElement))
    }

    container.appendChild(actualDomElement);
  }
};

const rerender = () => {
  stateCursor = 0;
  document.querySelector('#app').firstChild.remove();
  render(<App />, document.querySelector('#app'));
};

// STATE & HOOKS
// since a cursor is used to keep track of the states, this is why hooks cannot be used inside loops, conditionals or nested functions
// this is because the cursor will be incremented and the state will be lost since the order of states will not be constant/unindexable
const states = [];
let stateCursor = 0;

const useState = (initialState) => {
  const FROZEN_CURSOR = stateCursor;
  states[FROZEN_CURSOR] = states[FROZEN_CURSOR] || initialState;
  console.log(states);
  const setState = (newState) => {
    states[FROZEN_CURSOR] = newState;
    rerender();
  };
  stateCursor++;
  return [states[FROZEN_CURSOR], setState];
}

const App = () => {
  const [name, setName] = useState("person");
  const [count, setCount] = useState(0);

  console.log(name, count);
  return (
    <div className="build-a-react">
      <h1>Hello.</h1>
      <p>Let's build a react!</p>
      <input value={name} onchange={e => setName(e.target.value)} type="text" placeholder="name" />

      <h2>The count is: {count.toString()}</h2>
      <button onclick={() => setCount(count + 1)} value={count}>+</button>
      <button onclick={() => setCount(count - 1)} value={count}>-</button>
    </div>
  )
};

// any element in the DOM with an ID is also a global javascript variable
// so we could also technically do this
// render(<App />, window.app)
render(<App />, document.querySelector('#app'));
