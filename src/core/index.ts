// Component
interface ComponentPayload {
  tagName?: string
  props?: { [key: string]: unknown }
  state?: { [key: string]: unknown }
}
export class Component {
  public el
  public props
  public state
  constructor(payload:ComponentPayload = {}) {
    // 컴포넌트 생성시 최상위 요소 태그, props와 state 생성
    const { tagName = 'div', props = {}, state = {} } = payload;
    this.el = document.createElement(tagName); // 컴포넌트의 최상위 요소
    this.props = props; // 부모 컴포넌트에서 받는 데이터
    this.state = state; // 컴포넌트 안에서 사용할 데이터
    this.render();
  }
  render() {} // 컴포넌트를 렌더링하는 함수
}

// Router
// 페이지 렌더링
interface Route {
  path: string
  component: typeof Component
}
type Routes = Route[]

function routeRender(routes: Routes) {
  // 해시 없을 경우 현재 url를 /#/으로 대체한다
  if (!location.hash) {
    history.replaceState(null, '', '/#/'); // (상태, 제목, 주소)
  }
  
  const routerView = document.querySelector('router-view');
  const [hash, querystring = ''] = location.hash.split('?');
  // 물음표를 기준으로 해시 정보와 쿼리스트링을 구분(쿼리스트링 없을 때를 고려해 기본값 주기)
  
  // 1) 쿼리스트링을 각각 key와 value 나누어 객체로 히스토리의 상태에 저장!
  interface Query {
    [key: string]: string
  }
  const query = querystring
    .split('&')
    .reduce((acc, cur) => {
      const [key, value] = cur.split('=');
      acc[key] = value;
      return acc;
    }, {} as Query); // 매개변수에 직접 타입 지정 시 첫 값 {}으로 지정 안됨
  history.replaceState(query, '') //(상태, 제목) 주소입력 안하면 현재 url유지

  // 2) 현재 라우트 정보를 찾아서 렌더링!
  const currentRoute = routes.find(route => new RegExp(`${route.path}/?$`).test(hash))
  console.log(currentRoute, routerView);
  if(routerView) {
    routerView.innerHTML = '';
    currentRoute && routerView.append(new currentRoute.component().el)
  }
  
  // 3) 화면 출력 후 스크롤 위치 복구!
  window.scrollTo(0,0)
}
export function createRouter(routes: Routes) {
  // 원하는(필요한) 곳에서 호출할 수 있도록 함수 데이터를 반환!
  return function () {
    window.addEventListener('popstate', () => { //히스토리가 변할 때마다 렌더링
      routeRender(routes)
    })
    routeRender(routes) // 최초 호출(popstate 처음은 인식x, 변경만)
  }
}

// Store
interface StoreObservers {
  [key: string]: subscribeCallback[]
}
interface subscribeCallback {
  (arg: unknown): void
}
export class Store<S> {
  public state = {} as S // 초기화에서 {}이지만 할당 시 S타입으로
  private observers = {} as StoreObservers // 초기화에서 {}이지만 할당 시 StoreObservers타입으로
  constructor(state: S) {
    for(const key in state) {
      // 각 상태에 대한 변경 감시(Setter) 설정
      Object.defineProperty(this.state, key, {
        get: () => state[key],
        set: val => {
          state[key] = val // 상태 변경
          if(Array.isArray(this.observers[key])) { // 호출할 콜백이 있는 경우!
            this.observers[key].forEach(observer => observer(val))
          }
        }
      })
    }
  }
  //상태 변경 구독
  subscribe(key: string, cb: subscribeCallback) {
    Array.isArray(this.observers[key]) 
    ? this.observers[key].push(cb) 
    : this.observers[key] = [cb]
    // 예시)
    // observers = {
    //   구독할상태이름: [실행할콜백1, 실행할콜백2]
    //   movies: [cb, cb, cb],
    //   message: [cb]
    // }
  }
}
