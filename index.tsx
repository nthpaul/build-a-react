let React = {
  createElement: (tag, props, ...children) => {
    if (typeof tag == 'function') {
      try {
        return tag(props);
      } catch ({ promise, key }) {
        promise.then(data => {
          promiseCache.set(key, data);
          rerender();
        });
        return { tag: 'div', props: { ...props, children: ['I am loading...'] } };
      }
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
// useState takes advantage of closures to persist the state across multiple renders
// that is, a closure = a function + remembered state
// a closure function carries its own persistent state by capturing variables
const states = [];
let stateCursor = 0;


const useState = (initialState) => {
  // FROZEN_CURSOR is the unique index to access a specific state in the current module's states,
  // it persists across renders because it is captured in the useState closure
  const FROZEN_CURSOR = stateCursor;
  states[FROZEN_CURSOR] = states[FROZEN_CURSOR] || initialState;
  const setState = (newState) => {
    states[FROZEN_CURSOR] = newState;
    rerender();
  };
  stateCursor++;
  return [states[FROZEN_CURSOR], setState];
}

// CONCURRENCY / SUSPENSE
// this is a simple cache to store promises
// if the promise is already in the cache, return the value
// else, throw the promise and key and return a loading state i.e. fallback!
// once the promise is resolved, store the value in the cache and rerender
const promiseCache = new Map();
const createResource = (promise, key) => {
  if (promiseCache.has(key)) return promiseCache.get(key);
  throw { promise, key };
}

const App = () => {
  const [name, setName] = useState("person");
  const [count, setCount] = useState(0);

  const dogPhoto = createResource(fetch('https://dog.ceo/api/breeds/image/random').then(res => res.json()).then(data => data.message), 'dogPhoto');

  return (
    <div className="build-a-react">
      <h1>Hello.</h1>
      <p>Let's build a react!</p>
      <input value={name} onchange={e => setName(e.target.value)} type="text" placeholder="name" />

      <div>
        <h2>The count is: {count.toString()}</h2>
        <button onclick={() => setCount(count + 1)} value={count}>+</button>
        <button onclick={() => setCount(count - 1)} value={count}>-</button>
      </div>

      <img
        src={dogPhoto}
        alt="good boy"
        style="width: 300px; height: 300px; margin-top: 20px;"
      />
    </div>
  )
};

// any element in the DOM with an ID is also a global javascript variable
// so we could also technically do this
// render(<App />, window.app)
render(<App />, document.querySelector('#app'));
