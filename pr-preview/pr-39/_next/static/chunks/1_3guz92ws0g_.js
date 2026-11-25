(globalThis.TURBOPACK||(globalThis.TURBOPACK=[])).push(["object"==typeof document?document.currentScript:void 0,4222,e=>{"use strict";var t=globalThis.Event||class{},o=class extends t{oldState;newState;constructor(e,t={}){const o=Object.assign({},t);delete o.oldState,delete o.newState,super(e,o),this.oldState=String(t.oldState||""),this.newState=String(t.newState||"")}},n=new WeakMap;function r(e,t,r){n.set(e,setTimeout(()=>{n.has(e)&&e.dispatchEvent(new o("toggle",{cancelable:!1,oldState:t,newState:r}))},0))}var l=globalThis.ShadowRoot||function(){},i=globalThis.HTMLDialogElement||function(){},a=new WeakMap,u=new WeakMap,p=new WeakMap,s=new WeakMap;function c(e){return s.get(e)||"hidden"}var f=new WeakMap;function d(e){return[...e].pop()}function h(e,t){return!("auto"!==e.popover&&"manual"!==e.popover&&"hint"!==e.popover||!e.isConnected||t&&"showing"!==c(e)||!t&&"hidden"!==c(e)||e instanceof i&&e.hasAttribute("open"))&&document.fullscreenElement!==e}function g(e){if(!e)return 0;let t=u.get(document)||new Set,o=p.get(document)||new Set;return o.has(e)?[...o].indexOf(e)+t.size+1:t.has(e)?[...t].indexOf(e)+1:0}function v(e){let t,o=p.get(e)||new Set,n=u.get(e)||new Set,r=o.size>0?o:n.size>0?n:null;return r?(t=d(r)).isConnected?t:(r.delete(t),v(e)):null}function m(e){for(let t of e||[])if(t.isConnected)return t;else e.delete(t);return null}function w(e){return"function"==typeof e.getRootNode?e.getRootNode():e.parentNode?w(e.parentNode):e}function b(e){for(;e;){if(e instanceof HTMLElement&&"auto"===e.popover&&"showing"===s.get(e))return e;if((e=e instanceof Element&&e.assignedSlot||e.parentElement||w(e))instanceof l&&(e=e.host),e instanceof Document)return}}function E(e,t){let o=new Map,n=0;for(let e of t||[])o.set(e,n),n+=1;o.set(e,n),n+=1;let r=null;return!function(t){if(!t)return;let n=!1,l=null;for(;!n;){if(null===(l=b(t)||null)||!o.has(l))return;("hint"===e.popover||"auto"===l.popover)&&(n=!0),n||(t=l.parentElement)}let i=o.get(l)??null;(null===r||o.get(r)<i)&&(r=l)}(e.parentElement||w(e)),r}var S=new WeakMap;function y(e){var t;if(!h(e,!1))return;let n=e.ownerDocument;if(!e.dispatchEvent(new o("beforetoggle",{cancelable:!0,oldState:"closed",newState:"open"}))||!h(e,!1))return;let i=!1,c=e.popover,d=null,g=E(e,u.get(n)||new Set),m=E(e,p.get(n)||new Set);if("auto"===c&&(L(p.get(n)||new Set,i,!0),A(g||n,i,!0),d="auto"),"hint"===c&&(m?(A(m,i,!0),d="hint"):(L(p.get(n)||new Set,i,!0),g?(A(g,i,!0),d="auto"):d="hint")),"auto"===c||"hint"===c){if(c!==e.popover||!h(e,!1))return;v(n)||(i=!0),"auto"===d?(u.has(n)||u.set(n,new Set),u.get(n).add(e)):"hint"===d&&(p.has(n)||p.set(n,new Set),p.get(n).add(e))}S.delete(e);let w=n.activeElement;e.classList.add(":popover-open"),s.set(e,"showing"),a.has(n)||a.set(n,new Set),a.get(n).add(e),O(f.get(e),!0),null==(t=function(e){if(e.shadowRoot&&!0!==e.shadowRoot.delegatesFocus)return null;let t=e;t.shadowRoot&&(t=t.shadowRoot);let o=t.querySelector("[autofocus]");if(o)return o;for(let e of t.querySelectorAll("slot"))for(let t of e.assignedElements({flatten:!0}))if(t.hasAttribute("autofocus"))return t;else if(o=t.querySelector("[autofocus]"))return o;let n=e.ownerDocument.createTreeWalker(t,NodeFilter.SHOW_ELEMENT),r=n.currentNode;for(;r;){var i;if(!((i=r).hidden||i instanceof l||(i instanceof HTMLButtonElement||i instanceof HTMLInputElement||i instanceof HTMLSelectElement||i instanceof HTMLTextAreaElement||i instanceof HTMLOptGroupElement||i instanceof HTMLOptionElement||i instanceof HTMLFieldSetElement)&&i.disabled||i instanceof HTMLInputElement&&"hidden"===i.type||i instanceof HTMLAnchorElement&&""===i.href)&&"number"==typeof i.tabIndex&&-1!==i.tabIndex)return r;r=n.nextNode()}}(e))||t.focus(),i&&w&&"auto"===e.popover&&S.set(e,w),r(e,"closed","open")}function T(e,t=!1,n=!1){var l,i;if(!h(e,!0))return;let c=e.ownerDocument;if(["auto","hint"].includes(e.popover)&&(A(e,t,n),!h(e,!0)))return;let g=u.get(c)||new Set,v=g.has(e)&&d(g)===e;if(O(f.get(e),!1),f.delete(e),n&&(e.dispatchEvent(new o("beforetoggle",{oldState:"open",newState:"closed"})),v&&d(g)!==e&&A(e,t,n),!h(e,!0)))return;null==(l=a.get(c))||l.delete(e),g.delete(e),null==(i=p.get(c))||i.delete(e),e.classList.remove(":popover-open"),s.set(e,"hidden"),n&&r(e,"open","closed");let m=S.get(e);m&&(S.delete(e),t&&m.focus())}function L(e,t=!1,o=!1){let n=m(e);for(;n;)T(n,t,o),n=m(e)}function M(e,t,o,n){let r=!1,l=!1;for(;r||!l;){l=!0;let i=null,a=!1;for(let o of t)if(o===e)a=!0;else if(a){i=o;break}if(!i)return;for(;"showing"===c(i)&&t.size;)T(d(t),o,n);t.has(e)&&d(t)!==e&&(r=!0),r&&(n=!1)}}function A(e,t,o){var n,r;let l=e.ownerDocument||e;return e instanceof Document?function(e,t=!1,o=!1){let n=v(e);for(;n;)T(n,t,o),n=v(e)}(l,t,o):(null==(n=p.get(l))?void 0:n.has(e))?void M(e,p.get(l),t,o):void(L(p.get(l)||new Set,t,o),(null==(r=u.get(l))?void 0:r.has(e))&&M(e,u.get(l),t,o))}var H=new WeakMap;function k(e){let t,o;if(!e.isTrusted)return;let n=e.composedPath()[0];if(!n)return;let r=n.ownerDocument||n;if(!v(r))return;let i=(t=b(n),o=function(e){for(;e;){let t=e.popoverTargetElement;if(t instanceof HTMLElement)return t;if((e=e.parentElement||w(e))instanceof l&&(e=e.host),e instanceof Document)return}}(n),g(t)>g(o)?t:o);if(i&&"pointerdown"===e.type)H.set(r,i);else if("pointerup"===e.type){let e=H.get(r)===i;H.delete(r),e&&A(i||r,!1,!0)}}var P=new WeakMap;function O(e,t=!1){if(!e)return;P.has(e)||P.set(e,e.getAttribute("aria-expanded"));let o=e.popoverTargetElement;if(o instanceof HTMLElement&&"auto"===o.popover)e.setAttribute("aria-expanded",String(t));else{let t=P.get(e);t?e.setAttribute("aria-expanded",t):e.removeAttribute("aria-expanded")}}var D=globalThis.ShadowRoot||function(){};function x(e,t,o){let n=e[t];Object.defineProperty(e,t,{value(e){return n.call(this,o(e))}})}var R=/(^|[^\\]):popover-open\b/g,C=null;function N(e,t){var o;let n,r,l=(n="function"==typeof globalThis.CSSLayerBlockRule,r=(t??(null==(o=window.POPOVER_POLYFILL_OPTIONS)?void 0:o.layerName)??"popover-polyfill").split(".").map(e=>CSS.escape(e)).join("."),`
${n?`@layer ${r} {`:""}
  :where([popover]) {
    position: fixed;
    z-index: 2147483647;
    inset: 0;
    padding: 0.25em;
    width: fit-content;
    height: fit-content;
    border-width: initial;
    border-color: initial;
    border-image: initial;
    border-style: solid;
    background-color: canvas;
    color: canvastext;
    overflow: auto;
    margin: auto;
  }

  :where([popover]:not(.\\:popover-open)) {
    display: none;
  }

  :where(dialog[popover].\\:popover-open) {
    display: block;
  }

  :where(dialog[popover][open]) {
    display: revert;
  }

  :where([anchor].\\:popover-open) {
    inset: auto;
  }

  :where([anchor]:popover-open) {
    inset: auto;
  }

  @supports not (background-color: canvas) {
    :where([popover]) {
      background-color: white;
      color: black;
    }
  }

  @supports (width: -moz-fit-content) {
    :where([popover]) {
      width: -moz-fit-content;
      height: -moz-fit-content;
    }
  }

  @supports not (inset: 0) {
    :where([popover]) {
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
    }
  }
${n?"}":""}
`);if(null===C)try{(C=new CSSStyleSheet).replaceSync(l)}catch{C=!1}if(!1!==C&&e.adoptedStyleSheets)e.adoptedStyleSheets=[C,...e.adoptedStyleSheets];else{let t=document.createElement("style");t.textContent=l,e instanceof Document?e.head.prepend(t):e.prepend(t)}}"u">typeof HTMLElement&&"object"==typeof HTMLElement.prototype&&"popover"in HTMLElement.prototype&&"showPopover"in HTMLElement.prototype||function(){var e;let t;if("u"<typeof window)return;function n(e){return(null==e?void 0:e.includes(":popover-open"))&&(e=e.replace(R,"$1.\\:popover-open")),e}window.ToggleEvent=window.ToggleEvent||o,x(Document.prototype,"querySelector",n),x(Document.prototype,"querySelectorAll",n),x(Element.prototype,"querySelector",n),x(Element.prototype,"querySelectorAll",n),x(Element.prototype,"matches",n),x(Element.prototype,"closest",n),x(DocumentFragment.prototype,"querySelectorAll",n),Object.defineProperties(HTMLElement.prototype,{popover:{enumerable:!0,configurable:!0,get(){if(!this.hasAttribute("popover"))return null;let e=(this.getAttribute("popover")||"").toLowerCase();return""===e||"auto"==e?"auto":"hint"==e?"hint":"manual"},set(e){null===e?this.removeAttribute("popover"):this.setAttribute("popover",e)}},showPopover:{enumerable:!0,configurable:!0,writable:!0,value(e={}){y(this)}},hidePopover:{enumerable:!0,configurable:!0,writable:!0,value(){T(this,!0,!0)}},togglePopover:{enumerable:!0,configurable:!0,writable:!0,value(e={}){return"boolean"==typeof e&&(e={force:e}),"showing"===s.get(this)&&void 0===e.force||!1===e.force?T(this,!0,!0):(void 0===e.force||!0===e.force)&&y(this),"showing"===s.get(this)}}});let r=Element.prototype.attachShadow;r&&Object.defineProperties(Element.prototype,{attachShadow:{enumerable:!0,configurable:!0,writable:!0,value(e){let o=r.call(this,e);return N(o,t),o}}});let l=HTMLElement.prototype.attachInternals;l&&Object.defineProperties(HTMLElement.prototype,{attachInternals:{enumerable:!0,configurable:!0,writable:!0,value(){let e=l.call(this);return e.shadowRoot&&N(e.shadowRoot,t),e}}});let i=new WeakMap;function a(e){Object.defineProperties(e.prototype,{popoverTargetElement:{enumerable:!0,configurable:!0,set(e){if(null===e)this.removeAttribute("popovertarget"),i.delete(this);else if(e instanceof Element)this.setAttribute("popovertarget",""),i.set(this,e);else throw TypeError("popoverTargetElement must be an element or null")},get(){if("button"!==this.localName&&"input"!==this.localName||"input"===this.localName&&"reset"!==this.type&&"image"!==this.type&&"button"!==this.type||this.disabled||this.form&&"submit"===this.type)return null;let e=i.get(this);if(e&&e.isConnected)return e;if(e&&!e.isConnected)return i.delete(this),null;let t=w(this),o=this.getAttribute("popovertarget");return(t instanceof Document||t instanceof D)&&o&&t.getElementById(o)||null}},popoverTargetAction:{enumerable:!0,configurable:!0,get(){let e=(this.getAttribute("popovertargetaction")||"").toLowerCase();return"show"===e||"hide"===e?e:"toggle"},set(e){this.setAttribute("popovertargetaction",e)}}})}a(HTMLButtonElement),a(HTMLInputElement);(e=document).addEventListener("click",e=>{if(e.defaultPrevented)return;let t=e.composedPath(),o=t[0];if(!(o instanceof Element)||(null==o?void 0:o.shadowRoot))return;let n=w(o);if(!(n instanceof D||n instanceof Document))return;let r=t.find(e=>{var t;return null==(t=e.matches)?void 0:t.call(e,"[popovertargetaction],[popovertarget]")});if(r){!function(e){let t=e.popoverTargetElement;if(!(t instanceof HTMLElement))return;let o=c(t);"show"===e.popoverTargetAction&&"showing"===o||("hide"!==e.popoverTargetAction||"hidden"!==o)&&("showing"===o?T(t,!0,!0):h(t,!1)&&(f.set(t,e),y(t)))}(r),e.preventDefault();return}}),e.addEventListener("keydown",e=>{let t=e.key,o=e.target;!e.defaultPrevented&&o&&("Escape"===t||"Esc"===t)&&A(o.ownerDocument||o,!0,!0)}),e.addEventListener("pointerdown",k),e.addEventListener("pointerup",k),N(document,t)}(),e.s([])}]);