
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.head.appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function not_equal(a, b) {
        return a != a ? b == b : a !== b;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function exclude_internal_props(props) {
        const result = {};
        for (const k in props)
            if (k[0] !== '$')
                result[k] = props[k];
        return result;
    }
    function compute_rest_props(props, keys) {
        const rest = {};
        keys = new Set(keys);
        for (const k in props)
            if (!keys.has(k) && k[0] !== '$')
                rest[k] = props[k];
        return rest;
    }
    function once(fn) {
        let ran = false;
        return function (...args) {
            if (ran)
                return;
            ran = true;
            fn.call(this, ...args);
        };
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value = ret) {
        store.set(value);
        return ret;
    }
    const has_prop = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop);
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;
    // used internally for testing
    function set_now(fn) {
        now = fn;
    }
    function set_raf(fn) {
        raf = fn;
    }

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * For testing purposes only!
     */
    function clear_loops() {
        tasks.clear();
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function element_is(name, is) {
        return document.createElement(name, { is });
    }
    function object_without_properties(obj, exclude) {
        const target = {};
        for (const k in obj) {
            if (has_prop(obj, k)
                // @ts-ignore
                && exclude.indexOf(k) === -1) {
                // @ts-ignore
                target[k] = obj[k];
            }
        }
        return target;
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function stop_propagation(fn) {
        return function (event) {
            event.stopPropagation();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function self(fn) {
        return function (event) {
            // @ts-ignore
            if (event.target === this)
                fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function set_attributes(node, attributes) {
        // @ts-ignore
        const descriptors = Object.getOwnPropertyDescriptors(node.__proto__);
        for (const key in attributes) {
            if (attributes[key] == null) {
                node.removeAttribute(key);
            }
            else if (key === 'style') {
                node.style.cssText = attributes[key];
            }
            else if (key === '__value' || descriptors[key] && descriptors[key].set) {
                node[key] = attributes[key];
            }
            else {
                attr(node, key, attributes[key]);
            }
        }
    }
    function set_svg_attributes(node, attributes) {
        for (const key in attributes) {
            attr(node, key, attributes[key]);
        }
    }
    function set_custom_element_data(node, prop, value) {
        if (prop in node) {
            node[prop] = value;
        }
        else {
            attr(node, prop, value);
        }
    }
    function xlink_attr(node, attribute, value) {
        node.setAttributeNS('http://www.w3.org/1999/xlink', attribute, value);
    }
    function get_binding_group_value(group) {
        const value = [];
        for (let i = 0; i < group.length; i += 1) {
            if (group[i].checked)
                value.push(group[i].__value);
        }
        return value;
    }
    function to_number(value) {
        return value === '' ? undefined : +value;
    }
    function time_ranges_to_array(ranges) {
        const array = [];
        for (let i = 0; i < ranges.length; i += 1) {
            array.push({ start: ranges.start(i), end: ranges.end(i) });
        }
        return array;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function claim_element(nodes, name, attributes, svg) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeName === name) {
                let j = 0;
                while (j < node.attributes.length) {
                    const attribute = node.attributes[j];
                    if (attributes[attribute.name]) {
                        j++;
                    }
                    else {
                        node.removeAttribute(attribute.name);
                    }
                }
                return nodes.splice(i, 1)[0];
            }
        }
        return svg ? svg_element(name) : element(name);
    }
    function claim_text(nodes, data) {
        for (let i = 0; i < nodes.length; i += 1) {
            const node = nodes[i];
            if (node.nodeType === 3) {
                node.data = '' + data;
                return nodes.splice(i, 1)[0];
            }
        }
        return text(data);
    }
    function claim_space(nodes) {
        return claim_text(nodes, ' ');
    }
    function set_data(text, data) {
        data = '' + data;
        if (text.data !== data)
            text.data = data;
    }
    function set_input_value(input, value) {
        if (value != null || input.value) {
            input.value = value;
        }
    }
    function set_input_type(input, type) {
        try {
            input.type = type;
        }
        catch (e) {
            // do nothing
        }
    }
    function set_style(node, key, value, important) {
        node.style.setProperty(key, value, important ? 'important' : '');
    }
    function select_option(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            if (option.__value === value) {
                option.selected = true;
                return;
            }
        }
    }
    function select_options(select, value) {
        for (let i = 0; i < select.options.length; i += 1) {
            const option = select.options[i];
            option.selected = ~value.indexOf(option.__value);
        }
    }
    function select_value(select) {
        const selected_option = select.querySelector(':checked') || select.options[0];
        return selected_option && selected_option.__value;
    }
    function select_multiple_value(select) {
        return [].map.call(select.querySelectorAll(':checked'), option => option.__value);
    }
    function add_resize_listener(element, fn) {
        if (getComputedStyle(element).position === 'static') {
            element.style.position = 'relative';
        }
        const object = document.createElement('object');
        object.setAttribute('style', 'display: block; position: absolute; top: 0; left: 0; height: 100%; width: 100%; overflow: hidden; pointer-events: none; z-index: -1;');
        object.setAttribute('aria-hidden', 'true');
        object.type = 'text/html';
        object.tabIndex = -1;
        let win;
        object.onload = () => {
            win = object.contentDocument.defaultView;
            win.addEventListener('resize', fn);
        };
        if (/Trident/.test(navigator.userAgent)) {
            element.appendChild(object);
            object.data = 'about:blank';
        }
        else {
            object.data = 'about:blank';
            element.appendChild(object);
        }
        return {
            cancel: () => {
                win && win.removeEventListener && win.removeEventListener('resize', fn);
                element.removeChild(object);
            }
        };
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }
    function query_selector_all(selector, parent = document.body) {
        return Array.from(parent.querySelectorAll(selector));
    }
    class HtmlTag {
        constructor(html, anchor = null) {
            this.e = element('div');
            this.a = anchor;
            this.u(html);
        }
        m(target, anchor = null) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(target, this.n[i], anchor);
            }
            this.t = target;
        }
        u(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        p(html) {
            this.d();
            this.u(html);
            this.m(this.t, this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ``}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    function create_animation(node, from, fn, params) {
        if (!from)
            return noop;
        const to = node.getBoundingClientRect();
        if (from.left === to.left && from.right === to.right && from.top === to.top && from.bottom === to.bottom)
            return noop;
        const { delay = 0, duration = 300, easing = identity, 
        // @ts-ignore todo: should this be separated from destructuring? Or start/end added to public api and documentation?
        start: start_time = now() + delay, 
        // @ts-ignore todo:
        end = start_time + duration, tick = noop, css } = fn(node, { from, to }, params);
        let running = true;
        let started = false;
        let name;
        function start() {
            if (css) {
                name = create_rule(node, 0, 1, duration, delay, easing, css);
            }
            if (!delay) {
                started = true;
            }
        }
        function stop() {
            if (css)
                delete_rule(node, name);
            running = false;
        }
        loop(now => {
            if (!started && now >= start_time) {
                started = true;
            }
            if (started && now >= end) {
                tick(1, 0);
                stop();
            }
            if (!running) {
                return false;
            }
            if (started) {
                const p = now - start_time;
                const t = 0 + 1 * easing(p / duration);
                tick(t, 1 - t);
            }
            return true;
        });
        start();
        tick(0, 1);
        return stop;
    }
    function fix_position(node) {
        const style = getComputedStyle(node);
        if (style.position !== 'absolute' && style.position !== 'fixed') {
            const { width, height } = style;
            const a = node.getBoundingClientRect();
            node.style.position = 'absolute';
            node.style.width = width;
            node.style.height = height;
            add_transform(node, a);
        }
    }
    function add_transform(node, a) {
        const b = node.getBoundingClientRect();
        if (a.left !== b.left || a.top !== b.top) {
            const style = getComputedStyle(node);
            const transform = style.transform === 'none' ? '' : style.transform;
            node.style.transform = `${transform} translate(${a.left - b.left}px, ${a.top - b.top}px)`;
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function beforeUpdate(fn) {
        get_current_component().$$.before_update.push(fn);
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function onDestroy(fn) {
        get_current_component().$$.on_destroy.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const intros = { enabled: false };
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }
    function create_out_transition(node, fn, params) {
        let config = fn(node, params);
        let running = true;
        let animation_name;
        const group = outros;
        group.r += 1;
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 1, 0, duration, delay, easing, css);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            add_render_callback(() => dispatch(node, false, 'start'));
            loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(0, 1);
                        dispatch(node, false, 'end');
                        if (!--group.r) {
                            // this will result in `end()` being called,
                            // so we don't need to clean up here
                            run_all(group.c);
                        }
                        return false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(1 - t, t);
                    }
                }
                return running;
            });
        }
        if (is_function(config)) {
            wait().then(() => {
                // @ts-ignore
                config = config();
                go();
            });
        }
        else {
            go();
        }
        return {
            end(reset) {
                if (reset && config.tick) {
                    config.tick(1, 0);
                }
                if (running) {
                    if (animation_name)
                        delete_rule(node, animation_name);
                    running = false;
                }
            }
        };
    }
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                info.blocks[i] = null;
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }

    const globals = (typeof window !== 'undefined' ? window : global);

    function destroy_block(block, lookup) {
        block.d(1);
        lookup.delete(block.key);
    }
    function outro_and_destroy_block(block, lookup) {
        transition_out(block, 1, 1, () => {
            lookup.delete(block.key);
        });
    }
    function fix_and_destroy_block(block, lookup) {
        block.f();
        destroy_block(block, lookup);
    }
    function fix_and_outro_and_destroy_block(block, lookup) {
        block.f();
        outro_and_destroy_block(block, lookup);
    }
    function update_keyed_each(old_blocks, dirty, get_key, dynamic, ctx, list, lookup, node, destroy, create_each_block, next, get_context) {
        let o = old_blocks.length;
        let n = list.length;
        let i = o;
        const old_indexes = {};
        while (i--)
            old_indexes[old_blocks[i].key] = i;
        const new_blocks = [];
        const new_lookup = new Map();
        const deltas = new Map();
        i = n;
        while (i--) {
            const child_ctx = get_context(ctx, list, i);
            const key = get_key(child_ctx);
            let block = lookup.get(key);
            if (!block) {
                block = create_each_block(key, child_ctx);
                block.c();
            }
            else if (dynamic) {
                block.p(child_ctx, dirty);
            }
            new_lookup.set(key, new_blocks[i] = block);
            if (key in old_indexes)
                deltas.set(key, Math.abs(i - old_indexes[key]));
        }
        const will_move = new Set();
        const did_move = new Set();
        function insert(block) {
            transition_in(block, 1);
            block.m(node, next, lookup.has(block.key));
            lookup.set(block.key, block);
            next = block.first;
            n--;
        }
        while (o && n) {
            const new_block = new_blocks[n - 1];
            const old_block = old_blocks[o - 1];
            const new_key = new_block.key;
            const old_key = old_block.key;
            if (new_block === old_block) {
                // do nothing
                next = new_block.first;
                o--;
                n--;
            }
            else if (!new_lookup.has(old_key)) {
                // remove old block
                destroy(old_block, lookup);
                o--;
            }
            else if (!lookup.has(new_key) || will_move.has(new_key)) {
                insert(new_block);
            }
            else if (did_move.has(old_key)) {
                o--;
            }
            else if (deltas.get(new_key) > deltas.get(old_key)) {
                did_move.add(new_key);
                insert(new_block);
            }
            else {
                will_move.add(old_key);
                o--;
            }
        }
        while (o--) {
            const old_block = old_blocks[o];
            if (!new_lookup.has(old_block.key))
                destroy(old_block, lookup);
        }
        while (n)
            insert(new_blocks[n - 1]);
        return new_blocks;
    }
    function validate_each_keys(ctx, list, get_context, get_key) {
        const keys = new Set();
        for (let i = 0; i < list.length; i++) {
            const key = get_key(get_context(ctx, list, i));
            if (keys.has(key)) {
                throw new Error(`Cannot have duplicate keys in a keyed each`);
            }
            keys.add(key);
        }
    }

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    // source: https://html.spec.whatwg.org/multipage/indices.html
    const boolean_attributes = new Set([
        'allowfullscreen',
        'allowpaymentrequest',
        'async',
        'autofocus',
        'autoplay',
        'checked',
        'controls',
        'default',
        'defer',
        'disabled',
        'formnovalidate',
        'hidden',
        'ismap',
        'loop',
        'multiple',
        'muted',
        'nomodule',
        'novalidate',
        'open',
        'playsinline',
        'readonly',
        'required',
        'reversed',
        'selected'
    ]);

    const invalid_attribute_name_character = /[\s'">/=\u{FDD0}-\u{FDEF}\u{FFFE}\u{FFFF}\u{1FFFE}\u{1FFFF}\u{2FFFE}\u{2FFFF}\u{3FFFE}\u{3FFFF}\u{4FFFE}\u{4FFFF}\u{5FFFE}\u{5FFFF}\u{6FFFE}\u{6FFFF}\u{7FFFE}\u{7FFFF}\u{8FFFE}\u{8FFFF}\u{9FFFE}\u{9FFFF}\u{AFFFE}\u{AFFFF}\u{BFFFE}\u{BFFFF}\u{CFFFE}\u{CFFFF}\u{DFFFE}\u{DFFFF}\u{EFFFE}\u{EFFFF}\u{FFFFE}\u{FFFFF}\u{10FFFE}\u{10FFFF}]/u;
    // https://html.spec.whatwg.org/multipage/syntax.html#attributes-2
    // https://infra.spec.whatwg.org/#noncharacter
    function spread(args, classes_to_add) {
        const attributes = Object.assign({}, ...args);
        if (classes_to_add) {
            if (attributes.class == null) {
                attributes.class = classes_to_add;
            }
            else {
                attributes.class += ' ' + classes_to_add;
            }
        }
        let str = '';
        Object.keys(attributes).forEach(name => {
            if (invalid_attribute_name_character.test(name))
                return;
            const value = attributes[name];
            if (value === true)
                str += " " + name;
            else if (boolean_attributes.has(name.toLowerCase())) {
                if (value)
                    str += " " + name;
            }
            else if (value != null) {
                str += ` ${name}="${String(value).replace(/"/g, '&#34;').replace(/'/g, '&#39;')}"`;
            }
        });
        return str;
    }
    const escaped = {
        '"': '&quot;',
        "'": '&#39;',
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;'
    };
    function escape(html) {
        return String(html).replace(/["'&<>]/g, match => escaped[match]);
    }
    function each(items, fn) {
        let str = '';
        for (let i = 0; i < items.length; i += 1) {
            str += fn(items[i], i);
        }
        return str;
    }
    const missing_component = {
        $$render: () => ''
    };
    function validate_component(component, name) {
        if (!component || !component.$$render) {
            if (name === 'svelte:component')
                name += ' this={...}';
            throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
        }
        return component;
    }
    function debug(file, line, column, values) {
        console.log(`{@debug} ${file ? file + ' ' : ''}(${line}:${column})`); // eslint-disable-line no-console
        console.log(values); // eslint-disable-line no-console
        return '';
    }
    let on_destroy;
    function create_ssr_component(fn) {
        function $$render(result, props, bindings, slots) {
            const parent_component = current_component;
            const $$ = {
                on_destroy,
                context: new Map(parent_component ? parent_component.$$.context : []),
                // these will be immediately discarded
                on_mount: [],
                before_update: [],
                after_update: [],
                callbacks: blank_object()
            };
            set_current_component({ $$ });
            const html = fn(result, props, bindings, slots);
            set_current_component(parent_component);
            return html;
        }
        return {
            render: (props = {}, options = {}) => {
                on_destroy = [];
                const result = { title: '', head: '', css: new Set() };
                const html = $$render(result, props, {}, options);
                run_all(on_destroy);
                return {
                    html,
                    css: {
                        code: Array.from(result.css).map(css => css.code).join('\n'),
                        map: null // TODO
                    },
                    head: result.title + result.head
                };
            },
            $$render
        };
    }
    function add_attribute(name, value, boolean) {
        if (value == null || (boolean && !value))
            return '';
        return ` ${name}${value === true ? '' : `=${typeof value === 'string' ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
    }
    function add_classes(classes) {
        return classes ? ` class="${classes}"` : ``;
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function claim_component(block, parent_nodes) {
        block && block.l(parent_nodes);
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    let SvelteElement;
    if (typeof HTMLElement === 'function') {
        SvelteElement = class extends HTMLElement {
            constructor() {
                super();
                this.attachShadow({ mode: 'open' });
            }
            connectedCallback() {
                // @ts-ignore todo: improve typings
                for (const key in this.$$.slotted) {
                    // @ts-ignore todo: improve typings
                    this.appendChild(this.$$.slotted[key]);
                }
            }
            attributeChangedCallback(attr, _oldValue, newValue) {
                this[attr] = newValue;
            }
            $destroy() {
                destroy_component(this, 1);
                this.$destroy = noop;
            }
            $on(type, callback) {
                // TODO should this delegate to addEventListener?
                const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
                callbacks.push(callback);
                return () => {
                    const index = callbacks.indexOf(callback);
                    if (index !== -1)
                        callbacks.splice(index, 1);
                };
            }
            $set() {
                // overridden by instance, if it has props
            }
        };
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function detach_between_dev(before, after) {
        while (before.nextSibling && before.nextSibling !== after) {
            detach_dev(before.nextSibling);
        }
    }
    function detach_before_dev(after) {
        while (after.previousSibling) {
            detach_dev(after.previousSibling);
        }
    }
    function detach_after_dev(before) {
        while (before.nextSibling) {
            detach_dev(before.nextSibling);
        }
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev("SvelteDOMSetProperty", { node, property, value });
    }
    function dataset_dev(node, property, value) {
        node.dataset[property] = value;
        dispatch_dev("SvelteDOMSetDataset", { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }
    function loop_guard(timeout) {
        const start = Date.now();
        return () => {
            if (Date.now() - start > timeout) {
                throw new Error(`Infinite loop detected`);
            }
        };
    }

    var internals = /*#__PURE__*/Object.freeze({
        __proto__: null,
        HtmlTag: HtmlTag,
        SvelteComponent: SvelteComponent,
        SvelteComponentDev: SvelteComponentDev,
        get SvelteElement () { return SvelteElement; },
        action_destroyer: action_destroyer,
        add_attribute: add_attribute,
        add_classes: add_classes,
        add_flush_callback: add_flush_callback,
        add_location: add_location,
        add_render_callback: add_render_callback,
        add_resize_listener: add_resize_listener,
        add_transform: add_transform,
        afterUpdate: afterUpdate,
        append: append,
        append_dev: append_dev,
        assign: assign,
        attr: attr,
        attr_dev: attr_dev,
        beforeUpdate: beforeUpdate,
        bind: bind,
        binding_callbacks: binding_callbacks,
        blank_object: blank_object,
        bubble: bubble,
        check_outros: check_outros,
        children: children,
        claim_component: claim_component,
        claim_element: claim_element,
        claim_space: claim_space,
        claim_text: claim_text,
        clear_loops: clear_loops,
        component_subscribe: component_subscribe,
        compute_rest_props: compute_rest_props,
        createEventDispatcher: createEventDispatcher,
        create_animation: create_animation,
        create_bidirectional_transition: create_bidirectional_transition,
        create_component: create_component,
        create_in_transition: create_in_transition,
        create_out_transition: create_out_transition,
        create_slot: create_slot,
        create_ssr_component: create_ssr_component,
        get current_component () { return current_component; },
        custom_event: custom_event,
        dataset_dev: dataset_dev,
        debug: debug,
        destroy_block: destroy_block,
        destroy_component: destroy_component,
        destroy_each: destroy_each,
        detach: detach,
        detach_after_dev: detach_after_dev,
        detach_before_dev: detach_before_dev,
        detach_between_dev: detach_between_dev,
        detach_dev: detach_dev,
        dirty_components: dirty_components,
        dispatch_dev: dispatch_dev,
        each: each,
        element: element,
        element_is: element_is,
        empty: empty,
        escape: escape,
        escaped: escaped,
        exclude_internal_props: exclude_internal_props,
        fix_and_destroy_block: fix_and_destroy_block,
        fix_and_outro_and_destroy_block: fix_and_outro_and_destroy_block,
        fix_position: fix_position,
        flush: flush,
        getContext: getContext,
        get_binding_group_value: get_binding_group_value,
        get_current_component: get_current_component,
        get_slot_changes: get_slot_changes,
        get_slot_context: get_slot_context,
        get_spread_object: get_spread_object,
        get_spread_update: get_spread_update,
        get_store_value: get_store_value,
        globals: globals,
        group_outros: group_outros,
        handle_promise: handle_promise,
        has_prop: has_prop,
        identity: identity,
        init: init,
        insert: insert,
        insert_dev: insert_dev,
        intros: intros,
        invalid_attribute_name_character: invalid_attribute_name_character,
        is_client: is_client,
        is_function: is_function,
        is_promise: is_promise,
        listen: listen,
        listen_dev: listen_dev,
        loop: loop,
        loop_guard: loop_guard,
        missing_component: missing_component,
        mount_component: mount_component,
        noop: noop,
        not_equal: not_equal,
        get now () { return now; },
        null_to_empty: null_to_empty,
        object_without_properties: object_without_properties,
        onDestroy: onDestroy,
        onMount: onMount,
        once: once,
        outro_and_destroy_block: outro_and_destroy_block,
        prevent_default: prevent_default,
        prop_dev: prop_dev,
        query_selector_all: query_selector_all,
        get raf () { return raf; },
        run: run,
        run_all: run_all,
        safe_not_equal: safe_not_equal,
        schedule_update: schedule_update,
        select_multiple_value: select_multiple_value,
        select_option: select_option,
        select_options: select_options,
        select_value: select_value,
        self: self,
        setContext: setContext,
        set_attributes: set_attributes,
        set_current_component: set_current_component,
        set_custom_element_data: set_custom_element_data,
        set_data: set_data,
        set_data_dev: set_data_dev,
        set_input_type: set_input_type,
        set_input_value: set_input_value,
        set_now: set_now,
        set_raf: set_raf,
        set_store_value: set_store_value,
        set_style: set_style,
        set_svg_attributes: set_svg_attributes,
        space: space,
        spread: spread,
        stop_propagation: stop_propagation,
        subscribe: subscribe,
        svg_element: svg_element,
        text: text,
        tick: tick,
        time_ranges_to_array: time_ranges_to_array,
        to_number: to_number,
        toggle_class: toggle_class,
        transition_in: transition_in,
        transition_out: transition_out,
        update_keyed_each: update_keyed_each,
        validate_component: validate_component,
        validate_each_argument: validate_each_argument,
        validate_each_keys: validate_each_keys,
        validate_slots: validate_slots,
        validate_store: validate_store,
        xlink_attr: xlink_attr
    });

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe,
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    /** HELPERS */
    const url = {
      subscribe(listener) {
        return derived(getContext('routify'), context => context.url).subscribe(
          listener
        )
      },
    };

    const goto = {
      subscribe(listener) {
        return derived(getContext('routify'), context => context.goto).subscribe(
          listener
        )
      },
    };

    const isActive = {
      subscribe(listener) {
        return derived(
          getContext('routify'),
          context => context.isActive
        ).subscribe(listener)
      },
    };

    function _isActive(context, route) {
      const url = _url(context, route);
      return function(path, keepIndex = true) {
        path = url(path, null, keepIndex);
        const currentPath = url(route.path, null, keepIndex);
        const re = new RegExp('^' + path);
        return currentPath.match(re)
      }
    }

    function _goto(context, route) {
      const url = _url(context, route);
      return function goto(path, params, _static, shallow) {
        const href = url(path, params);
        if (!_static) history.pushState({}, null, href);
        else getContext('routifyupdatepage')(href, shallow);
      }
    }

    function _url(context, route) {
      return function url(path, params, preserveIndex) {
        path = path || './';

        if (!preserveIndex) path = path.replace(/index$/, '');

        if (path.match(/^\.\.?\//)) {
          //RELATIVE PATH
          // get component's dir
          // let dir = context.path.replace(/[^\/]+$/, '')
          let dir = context.path;
          // traverse through parents if needed
          const traverse = path.match(/\.\.\//g) || [];
          traverse.forEach(() => {
            dir = dir.replace(/\/[^\/]+\/?$/, '');
          });

          // strip leading periods and slashes
          path = path.replace(/^[\.\/]+/, '');
          dir = dir.replace(/\/$/, '') + '/';
          path = dir + path;
        } else if (path.match(/^\//)) ;

        params = Object.assign({}, route.params, context.params, params);
        for (const [key, value] of Object.entries(params)) {
          path = path.replace(`:${key}`, value);
        }
        return path
      }
    }

    const route = writable({});

    var config = {"pages":"/home/j/code/Z/FRONTIER/spa-template/src/pages","ignore":[],"unknownPropWarnings":true,"dynamicImports":false,"singleBuild":false,"outputDir":"/home/j/code/Z/FRONTIER/spa-template/node_modules/@sveltech/routify/tmp","watch":true,"scroll":false};

    const MATCH_PARAM = RegExp(/\:[^\/\()]+/g);

    function handleScroll(element) {
      scrollAncestorsToTop(element);
      handleHash();
    }


    function handleHash() {
      const { scroll } = config;
      const options = ['auto', 'smooth', 'smooth'];
      const { hash } = window.location;
      if (scroll && hash) {
        const behavior = options.includes(scroll) && scroll || 'auto';
        const el = document.querySelector(hash);
        if (hash && el) el.scrollIntoView({ behavior });
      }
    }


    function scrollAncestorsToTop(element) {
      if (element && element.dataset.routify !== 'scroll-lock') {
        element.scrollTo(0, 0);
        scrollAncestorsToTop(element.parentElement);
      }
    }

    const pathToRegex = (str, recursive) => {
      const suffix = recursive ? '' : '/?$'; //fallbacks should match recursively
      str = str.replace(/\/_fallback?$/, '(/|$)');
      str = str.replace(/\/index$/, '(/index)?'); //index files should be matched even if not present in url
      str = '^' + str.replace(MATCH_PARAM, '([^/]+)') + suffix;
      return str
    };

    const pathToParams = string => {
      const matches = string.match(MATCH_PARAM);
      if (matches) return matches.map(str => str.substr(1, str.length - 2))
    };

    const pathToRank = ({ path }) => {
      return path
        .split('/').filter(Boolean)
        .map(str => (str === '_fallback' ? 'A' : str.startsWith(':') ? 'B' : 'C'))
        .join('')
    };

    /* node_modules/@sveltech/routify/runtime/Wrapper.svelte generated by Svelte v3.20.1 */

    // (6:2) <Component {...props}>
    function create_default_slot_1(ctx) {
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);

    	const block = {
    		c: function create() {
    			if (default_slot) default_slot.c();
    		},
    		m: function mount(target, anchor) {
    			if (default_slot) {
    				default_slot.m(target, anchor);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[5], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot_1.name,
    		type: "slot",
    		source: "(6:2) <Component {...props}>",
    		ctx
    	});

    	return block;
    }

    // (5:0) <Decorator scoped={props.scoped}>
    function create_default_slot(ctx) {
    	let current;
    	const component_spread_levels = [/*props*/ ctx[2]];

    	let component_props = {
    		$$slots: { default: [create_default_slot_1] },
    		$$scope: { ctx }
    	};

    	for (let i = 0; i < component_spread_levels.length; i += 1) {
    		component_props = assign(component_props, component_spread_levels[i]);
    	}

    	const component = new /*Component*/ ctx[1]({ props: component_props, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(component.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(component, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const component_changes = (dirty & /*props*/ 4)
    			? get_spread_update(component_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (dirty & /*$$scope*/ 32) {
    				component_changes.$$scope = { dirty, ctx };
    			}

    			component.$set(component_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(component.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(component.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(component, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(5:0) <Decorator scoped={props.scoped}>",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let current;

    	const decorator = new /*Decorator*/ ctx[0]({
    			props: {
    				scoped: /*props*/ ctx[2].scoped,
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(decorator.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(decorator, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const decorator_changes = {};
    			if (dirty & /*props*/ 4) decorator_changes.scoped = /*props*/ ctx[2].scoped;

    			if (dirty & /*$$scope, props*/ 36) {
    				decorator_changes.$$scope = { dirty, ctx };
    			}

    			decorator.$set(decorator_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(decorator.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(decorator.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(decorator, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Wrapper", $$slots, ['default']);

    	$$self.$set = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), exclude_internal_props($$new_props)));
    		if ("$$scope" in $$new_props) $$invalidate(5, $$scope = $$new_props.$$scope);
    	};

    	$$self.$capture_state = () => ({ Decorator, Component, props });

    	$$self.$inject_state = $$new_props => {
    		$$invalidate(3, $$props = assign(assign({}, $$props), $$new_props));
    		if ("Decorator" in $$props) $$invalidate(0, Decorator = $$new_props.Decorator);
    		if ("Component" in $$props) $$invalidate(1, Component = $$new_props.Component);
    		if ("props" in $$props) $$invalidate(2, props = $$new_props.props);
    	};

    	let Decorator;
    	let Component;
    	let props;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		 $$invalidate(0, { Decorator, Component, ...props } = $$props, Decorator, ($$invalidate(1, Component), $$invalidate(3, $$props)), ($$invalidate(2, props), $$invalidate(3, $$props)));
    	};

    	$$props = exclude_internal_props($$props);
    	return [Decorator, Component, props, $$props, $$slots, $$scope];
    }

    class Wrapper extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Wrapper",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /* node_modules/@sveltech/routify/runtime/Route.svelte generated by Svelte v3.20.1 */
    const file = "node_modules/@sveltech/routify/runtime/Route.svelte";

    // (67:0) {#if component}
    function create_if_block_1(ctx) {
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ scoped: /*scoped*/ ctx[0] }, /*propFromParam*/ ctx[3]];
    	var switch_value = /*component*/ ctx[2];

    	function switch_props(ctx) {
    		let switch_instance_props = {
    			$$slots: {
    				default: [
    					create_default_slot$1,
    					({ scoped: scopeToChild, decorator }) => ({ 6: scopeToChild, 16: decorator }),
    					({ scoped: scopeToChild, decorator }) => (scopeToChild ? 64 : 0) | (decorator ? 65536 : 0)
    				]
    			},
    			$$scope: { ctx }
    		};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		var switch_instance = new switch_value(switch_props(ctx));
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*scoped, propFromParam*/ 9)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*scoped*/ 1 && { scoped: /*scoped*/ ctx[0] },
    					dirty & /*propFromParam*/ 8 && get_spread_object(/*propFromParam*/ ctx[3])
    				])
    			: {};

    			if (dirty & /*$$scope, remainingLayouts, decorator, scoped, scopeToChild*/ 196689) {
    				switch_instance_changes.$$scope = { dirty, ctx };
    			}

    			if (switch_value !== (switch_value = /*component*/ ctx[2])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props(ctx));
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(67:0) {#if component}",
    		ctx
    	});

    	return block;
    }

    // (68:2) <svelte:component      this={component}      let:scoped={scopeToChild}      let:decorator      {scoped}      {...propFromParam}>
    function create_default_slot$1(ctx) {
    	let current;

    	const route_1 = new Route({
    			props: {
    				layouts: [.../*remainingLayouts*/ ctx[4]],
    				Decorator: /*decorator*/ ctx[16],
    				scoped: {
    					.../*scoped*/ ctx[0],
    					.../*scopeToChild*/ ctx[6]
    				}
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route_1.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(route_1, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const route_1_changes = {};
    			if (dirty & /*remainingLayouts*/ 16) route_1_changes.layouts = [.../*remainingLayouts*/ ctx[4]];
    			if (dirty & /*decorator*/ 65536) route_1_changes.Decorator = /*decorator*/ ctx[16];

    			if (dirty & /*scoped, scopeToChild*/ 65) route_1_changes.scoped = {
    				.../*scoped*/ ctx[0],
    				.../*scopeToChild*/ ctx[6]
    			};

    			route_1.$set(route_1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route_1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route_1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route_1, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(68:2) <svelte:component      this={component}      let:scoped={scopeToChild}      let:decorator      {scoped}      {...propFromParam}>",
    		ctx
    	});

    	return block;
    }

    // (82:0) {#if !parentElement}
    function create_if_block(ctx) {
    	let span;
    	let setParent_action;
    	let dispose;

    	const block = {
    		c: function create() {
    			span = element("span");
    			add_location(span, file, 82, 2, 2161);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, span, anchor);
    			if (remount) dispose();
    			dispose = action_destroyer(setParent_action = /*setParent*/ ctx[5].call(null, span));
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(span);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(82:0) {#if !parentElement}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let t;
    	let if_block1_anchor;
    	let current;
    	let if_block0 = /*component*/ ctx[2] && create_if_block_1(ctx);
    	let if_block1 = !/*parentElement*/ ctx[1] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t = space();
    			if (if_block1) if_block1.c();
    			if_block1_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, if_block1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*component*/ ctx[2]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    					transition_in(if_block0, 1);
    				} else {
    					if_block0 = create_if_block_1(ctx);
    					if_block0.c();
    					transition_in(if_block0, 1);
    					if_block0.m(t.parentNode, t);
    				}
    			} else if (if_block0) {
    				group_outros();

    				transition_out(if_block0, 1, 1, () => {
    					if_block0 = null;
    				});

    				check_outros();
    			}

    			if (!/*parentElement*/ ctx[1]) {
    				if (!if_block1) {
    					if_block1 = create_if_block(ctx);
    					if_block1.c();
    					if_block1.m(if_block1_anchor.parentNode, if_block1_anchor);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block0);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(if_block1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $route;
    	validate_store(route, "route");
    	component_subscribe($$self, route, $$value => $$invalidate(11, $route = $$value));

    	let { layouts = [] } = $$props,
    		{ scoped = {} } = $$props,
    		{ Decorator = undefined } = $$props;

    	let scopeToChild,
    		props = {},
    		parentElement,
    		component,
    		lastLayout,
    		propFromParam = {};

    	const context = writable({});
    	setContext("routify", context);
    	if (typeof Decorator === "undefined") Decorator = getContext("routify-decorator");
    	setContext("routify-decorator", Decorator);

    	function setParent(el) {
    		$$invalidate(1, parentElement = el.parentElement);
    	}

    	function updateContext(layout) {
    		context.set({
    			route: $route,
    			path: layout.path,
    			url: _url(layout, $route),
    			goto: _goto(layout, $route),
    			isActive: _isActive(layout, $route)
    		});
    	}

    	async function setComponent(layout) {
    		if (lastLayout !== layout) {
    			const Component = await layout.component();

    			$$invalidate(2, component = !Decorator
    			? Component
    			: function (options = {}) {
    					return new Wrapper({
    							...options,
    							props: { ...options.props, Decorator, Component }
    						});
    				});

    			lastLayout = layout;
    		}

    		updateContext(layout);
    	}

    	const writable_props = ["layouts", "scoped", "Decorator"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Route> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Route", $$slots, []);

    	$$self.$set = $$props => {
    		if ("layouts" in $$props) $$invalidate(8, layouts = $$props.layouts);
    		if ("scoped" in $$props) $$invalidate(0, scoped = $$props.scoped);
    		if ("Decorator" in $$props) $$invalidate(7, Decorator = $$props.Decorator);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		setContext,
    		internals,
    		writable,
    		_url,
    		_goto,
    		_isActive,
    		route,
    		handleScroll,
    		Wrapper,
    		layouts,
    		scoped,
    		Decorator,
    		scopeToChild,
    		props,
    		parentElement,
    		component,
    		lastLayout,
    		propFromParam,
    		context,
    		setParent,
    		updateContext,
    		setComponent,
    		layout,
    		remainingLayouts,
    		$route
    	});

    	$$self.$inject_state = $$props => {
    		if ("layouts" in $$props) $$invalidate(8, layouts = $$props.layouts);
    		if ("scoped" in $$props) $$invalidate(0, scoped = $$props.scoped);
    		if ("Decorator" in $$props) $$invalidate(7, Decorator = $$props.Decorator);
    		if ("scopeToChild" in $$props) $$invalidate(6, scopeToChild = $$props.scopeToChild);
    		if ("props" in $$props) props = $$props.props;
    		if ("parentElement" in $$props) $$invalidate(1, parentElement = $$props.parentElement);
    		if ("component" in $$props) $$invalidate(2, component = $$props.component);
    		if ("lastLayout" in $$props) lastLayout = $$props.lastLayout;
    		if ("propFromParam" in $$props) $$invalidate(3, propFromParam = $$props.propFromParam);
    		if ("layout" in $$props) $$invalidate(10, layout = $$props.layout);
    		if ("remainingLayouts" in $$props) $$invalidate(4, remainingLayouts = $$props.remainingLayouts);
    	};

    	let layout;
    	let remainingLayouts;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*layouts*/ 256) {
    			 $$invalidate(10, [layout, ...remainingLayouts] = layouts, layout, ($$invalidate(4, remainingLayouts), $$invalidate(8, layouts)));
    		}

    		if ($$self.$$.dirty & /*layout*/ 1024) {
    			 if (layout) setComponent(layout);
    		}

    		if ($$self.$$.dirty & /*remainingLayouts, parentElement*/ 18) {
    			 if (!remainingLayouts.length) handleScroll(parentElement);
    		}

    		if ($$self.$$.dirty & /*layout*/ 1024) {
    			 if (layout && layout.param) $$invalidate(3, propFromParam = layout.param);
    		}
    	};

    	return [
    		scoped,
    		parentElement,
    		component,
    		propFromParam,
    		remainingLayouts,
    		setParent,
    		scopeToChild,
    		Decorator,
    		layouts
    	];
    }

    class Route extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { layouts: 8, scoped: 0, Decorator: 7 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Route",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get layouts() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layouts(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get scoped() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set scoped(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Decorator() {
    		throw new Error("<Route>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Decorator(value) {
    		throw new Error("<Route>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function init$1(routes, callback) {
      let prevRoute = false;

      function updatePage(url, shallow) {

        const currentUrl = window.location.pathname;
        url = url || currentUrl;

        const route$1 = urlToRoute(url, routes);
        const currentRoute = shallow && urlToRoute(currentUrl, routes);
        const contextRoute = currentRoute || route$1;
        const layouts = [...contextRoute.layouts, route$1];
        delete prevRoute.prev;
        route$1.prev = prevRoute;
        prevRoute = route$1;

        //set the route in the store
        route.set(route$1);

        //run callback in Router.svelte
        callback(layouts);
      }

      createEventListeners(updatePage);

      return updatePage
    }

    /**
     * svelte:window events doesn't work on refresh
     * @param {Function} updatePage 
     */
    function createEventListeners(updatePage) {
    ['pushState', 'replaceState'].forEach(eventName => {
        const fn = history[eventName];
        history[eventName] = function (state, title, url) {
          const event = Object.assign(
            new Event(eventName.toLowerCase(), { state, title, url })
          );
          Object.assign(event, { state, title, url });

          fn.apply(this, [state, title, url]);
          return dispatchEvent(event)
        };
      });

      // click
      addEventListener('click', handleClick)
        ;['pushstate', 'popstate', 'replacestate'].forEach(e =>
          addEventListener(e, () => updatePage())
        );
    }

    function handleClick(event) {
      const el = event.target.closest('a');
      const href = el && el.getAttribute('href');

      if (
        event.ctrlKey ||
        event.metaKey ||
        event.altKey ||
        event.shiftKey ||
        event.button ||
        event.defaultPrevented
      )
        return
      if (!href || el.target || el.host !== location.host) return

      event.preventDefault();
      history.pushState({}, '', href);
    }

    function urlToRoute(url, routes) {
      const route = routes.find(route => url.match(route.regex));
      if (!route)
        throw new Error(
          `Route could not be found. Make sure ${url}.svelte or ${url}/index.svelte exists. A restart may be required.`
        )

      if (route.paramKeys) {
        const layouts = layoutByPos(route.layouts);
        const fragments = url.split('/').filter(Boolean);
        const routeProps = getRouteProps(route.path);

        routeProps.forEach((prop, i) => {
          if (prop) {
            route.params[prop] = fragments[i];
            if (layouts[i]) layouts[i].param = { [prop]: fragments[i] };
            else route.param = { [prop]: fragments[i] };
          }
        });
      }

      route.leftover = url.replace(new RegExp(route.regex), '');

      return route
    }

    function layoutByPos(layouts) {
      const arr = [];
      layouts.forEach(layout => {
        arr[layout.path.split('/').filter(Boolean).length - 1] = layout;
      });
      return arr
    }

    function getRouteProps(url) {
      return url
        .split('/')
        .filter(Boolean)
        .map(f => f.match(/\:(.+)/))
        .map(f => f && f[1])
    }

    /* node_modules/@sveltech/routify/runtime/Router.svelte generated by Svelte v3.20.1 */

    function create_fragment$2(ctx) {
    	let current;

    	const route = new Route({
    			props: { layouts: /*layouts*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(route.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(route, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const route_changes = {};
    			if (dirty & /*layouts*/ 1) route_changes.layouts = /*layouts*/ ctx[0];
    			route.$set(route_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(route.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(route.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(route, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { routes } = $$props;
    	let layouts = [];
    	const callback = res => $$invalidate(0, layouts = res);
    	const updatePage = init$1(routes, callback);
    	setContext("routifyupdatepage", updatePage);
    	updatePage();
    	const writable_props = ["routes"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Router", $$slots, []);

    	$$self.$set = $$props => {
    		if ("routes" in $$props) $$invalidate(1, routes = $$props.routes);
    	};

    	$$self.$capture_state = () => ({
    		setContext,
    		writable,
    		Route,
    		init: init$1,
    		routes,
    		layouts,
    		callback,
    		updatePage
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(1, routes = $$props.routes);
    		if ("layouts" in $$props) $$invalidate(0, layouts = $$props.layouts);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [layouts, routes];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { routes: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*routes*/ ctx[1] === undefined && !("routes" in props)) {
    			console.warn("<Router> was created without expected prop 'routes'");
    		}
    	}

    	get routes() {
    		throw new Error("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function buildRoutes(routes, routeKeys) {
      return (
        routes
          // .map(sr => deserializeRoute(sr, routeKeys))
          .map(decorateRoute)
          .sort((c, p) => (c.ranking >= p.ranking ? -1 : 1))
      )
    }

    const decorateRoute = function(route) {
      route.paramKeys = pathToParams(route.path);
      route.regex = pathToRegex(route.path, route.isFallback);
      route.name = route.path.match(/[^\/]*\/[^\/]+$/)[0].replace(/[^\w\/]/g, ''); //last dir and name, then replace all but \w and /
      route.ranking = pathToRank(route);
      route.layouts.map(l => {
        l.param = {};
        return l
      });
      route.params = {};

      return route
    };

    // Move this to .env.js and make changes in rollup.config.js
    var _env = {
        authUrl: 'https://auth.knight.works/api/v1/login',
        apiUrl: 'http://localhost:3000/api/v1'
    };

    /**
    * Frontier App Management
    *
    * */

    let apiToken = writable(localStorage.getItem('access') || false, () => () => void 0);
    let userStorage = localStorage.getItem('currentUser') || false;
    userStorage = JSON.parse(userStorage) || false;

    let currentUser = writable(userStorage);

    let authorization;
    const tokenUnsubcribe = apiToken.subscribe(value => authorization = value);

    let fetchData = async function(url, options) {
        let fetchUrl = (url.charAt(0) === '/')
            ? _env.apiUrl + url 
            : url;

        let defaultOpts = {
            // method: 'POST', // *GET, POST, PUT, DELETE, etc.
            // params: method === 'GET' ? JSON.stringify(data) : '{}', // body data type must match "Content-Type" header
            // body: method === 'GET' ? '{}' : JSON.stringify(data) // body data type must match "Content-Type" header
            credentials: 'omit', // include, *same-origin, omit
            headers: {
                'content-type': 'application/json',
                'accept': 'application/json',
            },
        };
        if (authorization) {
            defaultOpts.headers.authorization = 'Bearer ' + authorization;
        }

        options = options ? {...options, ...defaultOpts} : defaultOpts;
        // console.log({options})
        let res = await fetch(fetchUrl, options);

        if ([401,403,500].includes(res.status)) {
            logout();
            return false
        }

        else return await res.json()
        
    };

    /**
    * API interface (CRUD & custom requests)
    * CRUD (GET, POST)
    * STD ajx (SAVE, DESTROY, RESTORE)
    * Custom (ajax)
    * */

    const ajax = async function(url = '', data, opts) {
        if (data) {
            //console.log({data})
            opts['body'] = JSON.stringify(data);
        }
        // not sure if I will need to do this
        // params: method === 'GET' ? JSON.stringify(data) : '{}'
        let res = await fetchData(url, opts);
        //console.log({res})

        if ([401,403,500].includes(res.status)) return logout('/')
        else return res
    };

    const get = function(url) {
        return ajax(url)
    };

    const post = function(url, data) {
        if (! data) return alert('Save Function must submit data')

        return ajax(url, data, {
            method: 'POST'
        })
    };

    /**
     * Alias for post function
     */
    const save = function(url, data) {
        return post(url, data)
    };

    const destroy = function(url) {
        return ajax(url, null, {
            method: 'DELETE'
        })
    };

    const patch = function(url, data) {
        return ajax(url, data, {
            method: 'PATCH'
        })
    };

    const restore = function(url) {
        return ajax(url + '/restore', null, {
            method: 'PATCH'
        })
    };

    const ajx = {
        destroy,
        restore,
        save,
        patch,
        post,
        get
    };


    /**
     * Auth Management
     * Current User
     * Auth State (logged in/out)
     * login()
     * logout()
     *  */ 
    let authenticated = derived(currentUser, ($currentUser) => {
        //What is the best way to test for user logged in
        return 'not ready'
    });
    let login = async function({email, password}, destination = '/', cb) {
        try {
            let { accessToken = false, refreshToken = false, user = false} = await post(_env.authUrl, {email, password});

            apiToken.set(accessToken);

            localStorage.setItem('access', accessToken);
            localStorage.setItem('refresh', refreshToken);

            currentUser.set(user);
            user = JSON.stringify(user) || false;
            localStorage.setItem('currentUser', user);
            if(accessToken) return cb ? cb(destination) : document.location = destination

        } catch (e) {
        }
    };

    let logout = function(destination = '/', cb) {
        ['access', 'refresh', 'currentUser'].map(i => localStorage.removeItem(i));
        authorization = false;
        currentUser.set(false);
        //Need ajax to kill refresh token

        return cb ? cb(destination) : document.location = destination
    };

    let user;
    currentUser.subscribe(value => user = value);

    //export let auth = {
    let auth = writable( {
        url: _env.authUrl,
        //authenticated,
        login,
        logout,
        user,
    });

    var front = /*#__PURE__*/Object.freeze({
        __proto__: null,
        currentUser: currentUser,
        ajax: ajax,
        ajx: ajx,
        auth: auth
    });

    var jsonp_1 = jsonp;

    /**
     * Callback index.
     */

    var count = 0;

    /**
     * Noop function.
     */

    function noop$1(){}

    /**
     * JSONP handler
     *
     * Options:
     *  - param {String} qs parameter (`callback`)
     *  - prefix {String} qs parameter (`__jp`)
     *  - name {String} qs parameter (`prefix` + incr)
     *  - timeout {Number} how long after a timeout error is emitted (`60000`)
     *
     * @param {String} url
     * @param {Object|Function} optional options / callback
     * @param {Function} optional callback
     */

    function jsonp(url, opts, fn){
      if ('function' == typeof opts) {
        fn = opts;
        opts = {};
      }
      if (!opts) opts = {};

      var prefix = opts.prefix || '__jp';

      // use the callback name that was passed if one was provided.
      // otherwise generate a unique name by incrementing our counter.
      var id = opts.name || (prefix + (count++));

      var param = opts.param || 'callback';
      var timeout = null != opts.timeout ? opts.timeout : 60000;
      var enc = encodeURIComponent;
      var target = document.getElementsByTagName('script')[0] || document.head;
      var script;
      var timer;


      if (timeout) {
        timer = setTimeout(function(){
          cleanup();
          if (fn) fn(new Error('Timeout'));
        }, timeout);
      }

      function cleanup(){
        if (script.parentNode) script.parentNode.removeChild(script);
        window[id] = noop$1;
        if (timer) clearTimeout(timer);
      }

      function cancel(){
        if (window[id]) {
          cleanup();
        }
      }

      window[id] = function(data){
        cleanup();
        if (fn) fn(null, data);
      };

      // add qs component
      url += (~url.indexOf('?') ? '&' : '?') + param + '=' + enc(id);
      url = url.replace('?&', '?');


      // create script
      script = document.createElement('script');
      script.src = url;
      target.parentNode.insertBefore(script, target);

      return cancel;
    }

    let {auth: auth$1, ajx: ajx$1, currentUser: currentUser$1 } = front;


    var frontend = {
        auth: auth$1,
        ajx: ajx$1,
        currentUser: currentUser$1,
        jsonp: jsonp_1
    };
    var frontend_1 = frontend.auth;
    var frontend_2 = frontend.ajx;
    var frontend_3 = frontend.currentUser;

    /* src/components/Brand.svelte generated by Svelte v3.20.1 */

    const file$1 = "src/components/Brand.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t;
    	let current;
    	const default_slot_template = /*$$slots*/ ctx[1].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[0], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(img, "title", "This logo is in the Brand Component");
    			attr_dev(img, "class", "float-left m-sm");
    			attr_dev(img, "width", "50px");
    			if (img.src !== (img_src_value = "/images/logo.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "Large F for FrontierJS");
    			add_location(img, file$1, 1, 2, 17);
    			attr_dev(div, "class", "");
    			add_location(div, file$1, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 1) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[0], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[0], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Brand> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Brand", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(0, $$scope = $$props.$$scope);
    	};

    	return [$$scope, $$slots];
    }

    class Brand extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Brand",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/Nav.svelte generated by Svelte v3.20.1 */
    const file$2 = "src/components/Nav.svelte";

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i].name;
    	child_ctx[10] = list[i].href;
    	child_ctx[11] = list[i].active;
    	return child_ctx;
    }

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[9] = list[i].name;
    	child_ctx[10] = list[i].href;
    	child_ctx[11] = list[i].active;
    	return child_ctx;
    }

    // (38:0) {:else}
    function create_else_block(ctx) {
    	let nav;
    	let t;
    	let current;
    	let each_value_1 = /*links*/ ctx[0];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const default_slot_template = /*$$slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			nav = element("nav");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			if (default_slot) default_slot.c();
    			add_location(nav, file$2, 38, 2, 748);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(nav, null);
    			}

    			append_dev(nav, t);

    			if (default_slot) {
    				default_slot.m(nav, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*links*/ 1) {
    				each_value_1 = /*links*/ ctx[0];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(nav, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 64) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[6], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(38:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (28:0) {#if $currentUser}
    function create_if_block$1(ctx) {
    	let nav;
    	let t0;
    	let a;
    	let t2;
    	let current;
    	let dispose;
    	let each_value = /*links*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const default_slot_template = /*$$slots*/ ctx[7].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[6], null);

    	const block = {
    		c: function create() {
    			nav = element("nav");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t0 = space();
    			a = element("a");
    			a.textContent = "Logout";
    			t2 = space();
    			if (default_slot) default_slot.c();
    			attr_dev(a, "href", "/login");
    			add_location(a, file$2, 32, 4, 624);
    			add_location(nav, file$2, 28, 2, 518);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, nav, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(nav, null);
    			}

    			append_dev(nav, t0);
    			append_dev(nav, a);
    			append_dev(nav, t2);

    			if (default_slot) {
    				default_slot.m(nav, null);
    			}

    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(a, "click", /*click_handler*/ ctx[8], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*links*/ 1) {
    				each_value = /*links*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(nav, t0);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 64) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[6], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[6], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			destroy_each(each_blocks, detaching);
    			if (default_slot) default_slot.d(detaching);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(28:0) {#if $currentUser}",
    		ctx
    	});

    	return block;
    }

    // (40:4) {#each links as { name, href, active }}
    function create_each_block_1(ctx) {
    	let a;
    	let t_value = /*name*/ ctx[9] + "";
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", a_href_value = /*href*/ ctx[10]);
    			toggle_class(a, "active", /*active*/ ctx[11]);
    			add_location(a, file$2, 40, 6, 804);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*links*/ 1 && t_value !== (t_value = /*name*/ ctx[9] + "")) set_data_dev(t, t_value);

    			if (dirty & /*links*/ 1 && a_href_value !== (a_href_value = /*href*/ ctx[10])) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*links*/ 1) {
    				toggle_class(a, "active", /*active*/ ctx[11]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(40:4) {#each links as { name, href, active }}",
    		ctx
    	});

    	return block;
    }

    // (30:4) {#each links as { name, href, active }}
    function create_each_block(ctx) {
    	let a;
    	let t_value = /*name*/ ctx[9] + "";
    	let t;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			a = element("a");
    			t = text(t_value);
    			attr_dev(a, "href", a_href_value = /*href*/ ctx[10]);
    			toggle_class(a, "active", /*active*/ ctx[11]);
    			add_location(a, file$2, 30, 6, 574);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, a, anchor);
    			append_dev(a, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*links*/ 1 && t_value !== (t_value = /*name*/ ctx[9] + "")) set_data_dev(t, t_value);

    			if (dirty & /*links*/ 1 && a_href_value !== (a_href_value = /*href*/ ctx[10])) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*links*/ 1) {
    				toggle_class(a, "active", /*active*/ ctx[11]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(a);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(30:4) {#each links as { name, href, active }}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$currentUser*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $currentUser;
    	let $url;
    	let $isActive;
    	let $auth;
    	let $goto;
    	validate_store(frontend_3, "currentUser");
    	component_subscribe($$self, frontend_3, $$value => $$invalidate(1, $currentUser = $$value));
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(4, $url = $$value));
    	validate_store(isActive, "isActive");
    	component_subscribe($$self, isActive, $$value => $$invalidate(5, $isActive = $$value));
    	validate_store(frontend_1, "auth");
    	component_subscribe($$self, frontend_1, $$value => $$invalidate(2, $auth = $$value));
    	validate_store(goto, "goto");
    	component_subscribe($$self, goto, $$value => $$invalidate(3, $goto = $$value));
    	let links = [];

    	if ($currentUser) {
    		links = [["/dashboard", "Dashboard"]];
    	} else {
    		links = [
    			["/index", "Public Home"],
    			["/example", "Register Example"],
    			["/login", "Login"]
    		];
    	}

    	links = links.map(([path, name]) => {
    		return {
    			name,
    			href: $url(path),
    			active: $isActive(path)
    		};
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Nav> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Nav", $$slots, ['default']);
    	const click_handler = trigger => $auth.logout("/login", $goto);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(6, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		auth: frontend_1,
    		currentUser: frontend_3,
    		isActive,
    		url,
    		goto,
    		links,
    		$currentUser,
    		$url,
    		$isActive,
    		$auth,
    		$goto
    	});

    	$$self.$inject_state = $$props => {
    		if ("links" in $$props) $$invalidate(0, links = $$props.links);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		links,
    		$currentUser,
    		$auth,
    		$goto,
    		$url,
    		$isActive,
    		$$scope,
    		$$slots,
    		click_handler
    	];
    }

    class Nav extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Nav",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/Header.svelte generated by Svelte v3.20.1 */
    const file$3 = "src/components/Header.svelte";

    // (26:2) {:else}
    function create_else_block$1(ctx) {
    	let article;
    	let t0;
    	let h1;
    	let current;
    	const brand = new Brand({ $$inline: true });

    	const block = {
    		c: function create() {
    			article = element("article");
    			create_component(brand.$$.fragment);
    			t0 = space();
    			h1 = element("h1");
    			h1.textContent = "Header.svelte";
    			attr_dev(h1, "class", "grow py");
    			add_location(h1, file$3, 28, 6, 906);
    			attr_dev(article, "class", "stretch row");
    			add_location(article, file$3, 26, 4, 854);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			mount_component(brand, article, null);
    			append_dev(article, t0);
    			append_dev(article, h1);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(brand.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(brand.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    			destroy_component(brand);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(26:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (9:2) {#if $currentUser}
    function create_if_block$2(ctx) {
    	let div1;
    	let span1;
    	let span0;
    	let t1;
    	let t2_value = /*$currentUser*/ ctx[0].email + "";
    	let t2;
    	let t3;
    	let div0;
    	let button0;
    	let t5;
    	let button1;
    	let t7;
    	let nav;
    	let a0;
    	let t8;
    	let a0_href_value;
    	let t9;
    	let a1;
    	let t10;
    	let a1_href_value;
    	let t11;
    	let a2;
    	let t12;
    	let a2_href_value;
    	let t13;
    	let a3;
    	let t14;
    	let a3_href_value;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			span1 = element("span");
    			span0 = element("span");
    			span0.textContent = "Logged in:";
    			t1 = space();
    			t2 = text(t2_value);
    			t3 = space();
    			div0 = element("div");
    			button0 = element("button");
    			button0.textContent = "Logout";
    			t5 = space();
    			button1 = element("button");
    			button1.textContent = "More";
    			t7 = space();
    			nav = element("nav");
    			a0 = element("a");
    			t8 = text("Home");
    			t9 = space();
    			a1 = element("a");
    			t10 = text("Examples");
    			t11 = space();
    			a2 = element("a");
    			t12 = text("Style Guide");
    			t13 = space();
    			a3 = element("a");
    			t14 = text("Responsive");
    			attr_dev(span0, "class", "dn d@md");
    			add_location(span0, file$3, 11, 8, 308);
    			attr_dev(span1, "class", "");
    			add_location(span1, file$3, 10, 6, 284);
    			attr_dev(button0, "class", "link");
    			add_location(button0, file$3, 15, 8, 425);
    			attr_dev(button1, "class", "link");
    			add_location(button1, file$3, 16, 8, 502);
    			attr_dev(div0, "class", "-r v-");
    			add_location(div0, file$3, 14, 6, 397);
    			attr_dev(div1, "class", "grid columns _y p");
    			add_location(div1, file$3, 9, 4, 246);
    			attr_dev(a0, "class", "");
    			attr_dev(a0, "href", a0_href_value = /*$url*/ ctx[2]("/"));
    			add_location(a0, file$3, 20, 6, 618);
    			attr_dev(a1, "class", "");
    			attr_dev(a1, "href", a1_href_value = /*$url*/ ctx[2]("/examples"));
    			add_location(a1, file$3, 21, 6, 662);
    			attr_dev(a2, "class", "");
    			attr_dev(a2, "href", a2_href_value = /*$url*/ ctx[2]("/styles"));
    			add_location(a2, file$3, 22, 6, 718);
    			attr_dev(a3, "class", "");
    			attr_dev(a3, "href", a3_href_value = /*$url*/ ctx[2]("/responsive"));
    			add_location(a3, file$3, 23, 6, 775);
    			attr_dev(nav, "class", "");
    			add_location(nav, file$3, 19, 4, 597);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, span1);
    			append_dev(span1, span0);
    			append_dev(span1, t1);
    			append_dev(span1, t2);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, button0);
    			append_dev(div0, t5);
    			append_dev(div0, button1);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, nav, anchor);
    			append_dev(nav, a0);
    			append_dev(a0, t8);
    			append_dev(nav, t9);
    			append_dev(nav, a1);
    			append_dev(a1, t10);
    			append_dev(nav, t11);
    			append_dev(nav, a2);
    			append_dev(a2, t12);
    			append_dev(nav, t13);
    			append_dev(nav, a3);
    			append_dev(a3, t14);
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*click_handler*/ ctx[3], false, false, false),
    				listen_dev(button1, "click", /*click_handler_1*/ ctx[4], false, false, false)
    			];
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$currentUser*/ 1 && t2_value !== (t2_value = /*$currentUser*/ ctx[0].email + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*$url*/ 4 && a0_href_value !== (a0_href_value = /*$url*/ ctx[2]("/"))) {
    				attr_dev(a0, "href", a0_href_value);
    			}

    			if (dirty & /*$url*/ 4 && a1_href_value !== (a1_href_value = /*$url*/ ctx[2]("/examples"))) {
    				attr_dev(a1, "href", a1_href_value);
    			}

    			if (dirty & /*$url*/ 4 && a2_href_value !== (a2_href_value = /*$url*/ ctx[2]("/styles"))) {
    				attr_dev(a2, "href", a2_href_value);
    			}

    			if (dirty & /*$url*/ 4 && a3_href_value !== (a3_href_value = /*$url*/ ctx[2]("/responsive"))) {
    				attr_dev(a3, "href", a3_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(nav);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(9:2) {#if $currentUser}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let header;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block$2, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*$currentUser*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			header = element("header");
    			if_block.c();
    			attr_dev(header, "class", "");
    			add_location(header, file$3, 7, 0, 203);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, header, anchor);
    			if_blocks[current_block_type_index].m(header, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(header, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(header);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $currentUser;
    	let $auth;
    	let $url;
    	validate_store(frontend_3, "currentUser");
    	component_subscribe($$self, frontend_3, $$value => $$invalidate(0, $currentUser = $$value));
    	validate_store(frontend_1, "auth");
    	component_subscribe($$self, frontend_1, $$value => $$invalidate(1, $auth = $$value));
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(2, $url = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Header> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Header", $$slots, []);
    	const click_handler = () => $auth.logout();
    	const click_handler_1 = () => $auth.logout();

    	$$self.$capture_state = () => ({
    		auth: frontend_1,
    		currentUser: frontend_3,
    		Brand,
    		Nav,
    		isActive,
    		url,
    		goto,
    		$currentUser,
    		$auth,
    		$url
    	});

    	return [$currentUser, $auth, $url, click_handler, click_handler_1];
    }

    class Header extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Header",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/Footer.svelte generated by Svelte v3.20.1 */

    const file$4 = "src/components/Footer.svelte";

    // (7:0) {:else}
    function create_else_block$2(ctx) {
    	const block = { c: noop, m: noop, d: noop };

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(7:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (5:0) {#if user}
    function create_if_block$3(ctx) {
    	let footer;

    	const block = {
    		c: function create() {
    			footer = element("footer");
    			footer.textContent = "Footer";
    			add_location(footer, file$4, 5, 4, 69);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, footer, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(footer);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(5:0) {#if user}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*user*/ ctx[0]) return create_if_block$3;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	const user = false;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Footer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Footer", $$slots, []);
    	$$self.$capture_state = () => ({ user });
    	return [user];
    }

    class Footer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, { user: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Footer",
    			options,
    			id: create_fragment$6.name
    		});
    	}

    	get user() {
    		return this.$$.ctx[0];
    	}

    	set user(value) {
    		throw new Error("<Footer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/pages/_layout.svelte generated by Svelte v3.20.1 */
    const file$5 = "src/pages/_layout.svelte";

    function create_fragment$7(ctx) {
    	let t0;
    	let main;
    	let t1;
    	let current;
    	const header = new Header({ $$inline: true });
    	const default_slot_template = /*$$slots*/ ctx[6].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[5], null);
    	const footer = new Footer({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(header.$$.fragment);
    			t0 = space();
    			main = element("main");
    			if (default_slot) default_slot.c();
    			t1 = space();
    			create_component(footer.$$.fragment);
    			attr_dev(main, "class", "");
    			add_location(main, file$5, 16, 0, 399);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(header, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, main, anchor);

    			if (default_slot) {
    				default_slot.m(main, null);
    			}

    			insert_dev(target, t1, anchor);
    			mount_component(footer, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 32) {
    					default_slot.p(get_slot_context(default_slot_template, ctx, /*$$scope*/ ctx[5], null), get_slot_changes(default_slot_template, /*$$scope*/ ctx[5], dirty, null));
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(header.$$.fragment, local);
    			transition_in(default_slot, local);
    			transition_in(footer.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(header.$$.fragment, local);
    			transition_out(default_slot, local);
    			transition_out(footer.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(header, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(main);
    			if (default_slot) default_slot.d(detaching);
    			if (detaching) detach_dev(t1);
    			destroy_component(footer, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $currentUser;
    	let $isActive;
    	let $auth;
    	let $goto;
    	validate_store(frontend_3, "currentUser");
    	component_subscribe($$self, frontend_3, $$value => $$invalidate(0, $currentUser = $$value));
    	validate_store(isActive, "isActive");
    	component_subscribe($$self, isActive, $$value => $$invalidate(1, $isActive = $$value));
    	validate_store(frontend_1, "auth");
    	component_subscribe($$self, frontend_1, $$value => $$invalidate(2, $auth = $$value));
    	validate_store(goto, "goto");
    	component_subscribe($$self, goto, $$value => $$invalidate(3, $goto = $$value));
    	let loginRoute = "/login";
    	if (!$currentUser.email && !$isActive(loginRoute)) $auth.logout(loginRoute, $goto);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Layout> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Layout", $$slots, ['default']);

    	$$self.$set = $$props => {
    		if ("$$scope" in $$props) $$invalidate(5, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		auth: frontend_1,
    		currentUser: frontend_3,
    		goto,
    		isActive,
    		Header,
    		Footer,
    		loginRoute,
    		$currentUser,
    		$isActive,
    		$auth,
    		$goto
    	});

    	$$self.$inject_state = $$props => {
    		if ("loginRoute" in $$props) loginRoute = $$props.loginRoute;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$currentUser, $isActive, $auth, $goto, loginRoute, $$scope, $$slots];
    }

    class Layout extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Layout",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    /* src/pages/_fallback.svelte generated by Svelte v3.20.1 */
    const file$6 = "src/pages/_fallback.svelte";

    function create_fragment$8(ctx) {
    	let article;
    	let h1;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let a;
    	let t4;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			article = element("article");
    			h1 = element("h1");
    			h1.textContent = "404";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Page not found.";
    			t3 = space();
    			p1 = element("p");
    			a = element("a");
    			t4 = text("Go back");
    			add_location(h1, file$6, 5, 2, 75);
    			add_location(p0, file$6, 6, 2, 90);
    			attr_dev(a, "href", a_href_value = /*$url*/ ctx[0]("../"));
    			add_location(a, file$6, 8, 4, 123);
    			add_location(p1, file$6, 7, 2, 115);
    			attr_dev(article, "class", "p");
    			add_location(article, file$6, 4, 0, 53);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, article, anchor);
    			append_dev(article, h1);
    			append_dev(article, t1);
    			append_dev(article, p0);
    			append_dev(article, t3);
    			append_dev(article, p1);
    			append_dev(p1, a);
    			append_dev(a, t4);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$url*/ 1 && a_href_value !== (a_href_value = /*$url*/ ctx[0]("../"))) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(article);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let $url;
    	validate_store(url, "url");
    	component_subscribe($$self, url, $$value => $$invalidate(0, $url = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Fallback> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Fallback", $$slots, []);
    	$$self.$capture_state = () => ({ url, $url });
    	return [$url];
    }

    class Fallback extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Fallback",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    /**
     * @name toDate
     * @category Common Helpers
     * @summary Convert the given argument to an instance of Date.
     *
     * @description
     * Convert the given argument to an instance of Date.
     *
     * If the argument is an instance of Date, the function returns its clone.
     *
     * If the argument is a number, it is treated as a timestamp.
     *
     * If the argument is none of the above, the function returns Invalid Date.
     *
     * **Note**: *all* Date arguments passed to any *date-fns* function is processed by `toDate`.
     *
     * @param {Date|Number} argument - the value to convert
     * @returns {Date} the parsed date in the local time zone
     * @throws {TypeError} 1 argument required
     *
     * @example
     * // Clone the date:
     * const result = toDate(new Date(2014, 1, 11, 11, 30, 30))
     * //=> Tue Feb 11 2014 11:30:30
     *
     * @example
     * // Convert the timestamp to date:
     * const result = toDate(1392098430000)
     * //=> Tue Feb 11 2014 11:30:30
     */
    function toDate(argument) {
      if (arguments.length < 1) {
        throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
      }

      var argStr = Object.prototype.toString.call(argument); // Clone the date

      if (argument instanceof Date || typeof argument === 'object' && argStr === '[object Date]') {
        // Prevent the date to lose the milliseconds when passed to new Date() in IE10
        return new Date(argument.getTime());
      } else if (typeof argument === 'number' || argStr === '[object Number]') {
        return new Date(argument);
      } else {

        return new Date(NaN);
      }
    }

    function toInteger(dirtyNumber) {
      if (dirtyNumber === null || dirtyNumber === true || dirtyNumber === false) {
        return NaN;
      }

      var number = Number(dirtyNumber);

      if (isNaN(number)) {
        return number;
      }

      return number < 0 ? Math.ceil(number) : Math.floor(number);
    }

    /**
     * @name addMilliseconds
     * @category Millisecond Helpers
     * @summary Add the specified number of milliseconds to the given date.
     *
     * @description
     * Add the specified number of milliseconds to the given date.
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * @param {Date|Number} date - the date to be changed
     * @param {Number} amount - the amount of milliseconds to be added
     * @returns {Date} the new date with the milliseconds added
     * @throws {TypeError} 2 arguments required
     *
     * @example
     * // Add 750 milliseconds to 10 July 2014 12:45:30.000:
     * var result = addMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
     * //=> Thu Jul 10 2014 12:45:30.750
     */

    function addMilliseconds(dirtyDate, dirtyAmount) {
      if (arguments.length < 2) {
        throw new TypeError('2 arguments required, but only ' + arguments.length + ' present');
      }

      var timestamp = toDate(dirtyDate).getTime();
      var amount = toInteger(dirtyAmount);
      return new Date(timestamp + amount);
    }

    var MILLISECONDS_IN_MINUTE = 60000;
    /**
     * Google Chrome as of 67.0.3396.87 introduced timezones with offset that includes seconds.
     * They usually appear for dates that denote time before the timezones were introduced
     * (e.g. for 'Europe/Prague' timezone the offset is GMT+00:57:44 before 1 October 1891
     * and GMT+01:00:00 after that date)
     *
     * Date#getTimezoneOffset returns the offset in minutes and would return 57 for the example above,
     * which would lead to incorrect calculations.
     *
     * This function returns the timezone offset in milliseconds that takes seconds in account.
     */

    function getTimezoneOffsetInMilliseconds(dirtyDate) {
      var date = new Date(dirtyDate.getTime());
      var baseTimezoneOffset = Math.ceil(date.getTimezoneOffset());
      date.setSeconds(0, 0);
      var millisecondsPartOfTimezoneOffset = date.getTime() % MILLISECONDS_IN_MINUTE;
      return baseTimezoneOffset * MILLISECONDS_IN_MINUTE + millisecondsPartOfTimezoneOffset;
    }

    /**
     * @name isValid
     * @category Common Helpers
     * @summary Is the given date valid?
     *
     * @description
     * Returns false if argument is Invalid Date and true otherwise.
     * Argument is converted to Date using `toDate`. See [toDate]{@link https://date-fns.org/docs/toDate}
     * Invalid Date is a Date, whose time value is NaN.
     *
     * Time value of Date: http://es5.github.io/#x15.9.1.1
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * - Now `isValid` doesn't throw an exception
     *   if the first argument is not an instance of Date.
     *   Instead, argument is converted beforehand using `toDate`.
     *
     *   Examples:
     *
     *   | `isValid` argument        | Before v2.0.0 | v2.0.0 onward |
     *   |---------------------------|---------------|---------------|
     *   | `new Date()`              | `true`        | `true`        |
     *   | `new Date('2016-01-01')`  | `true`        | `true`        |
     *   | `new Date('')`            | `false`       | `false`       |
     *   | `new Date(1488370835081)` | `true`        | `true`        |
     *   | `new Date(NaN)`           | `false`       | `false`       |
     *   | `'2016-01-01'`            | `TypeError`   | `false`       |
     *   | `''`                      | `TypeError`   | `false`       |
     *   | `1488370835081`           | `TypeError`   | `true`        |
     *   | `NaN`                     | `TypeError`   | `false`       |
     *
     *   We introduce this change to make *date-fns* consistent with ECMAScript behavior
     *   that try to coerce arguments to the expected type
     *   (which is also the case with other *date-fns* functions).
     *
     * @param {*} date - the date to check
     * @returns {Boolean} the date is valid
     * @throws {TypeError} 1 argument required
     *
     * @example
     * // For the valid date:
     * var result = isValid(new Date(2014, 1, 31))
     * //=> true
     *
     * @example
     * // For the value, convertable into a date:
     * var result = isValid(1393804800000)
     * //=> true
     *
     * @example
     * // For the invalid date:
     * var result = isValid(new Date(''))
     * //=> false
     */

    function isValid(dirtyDate) {
      if (arguments.length < 1) {
        throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
      }

      var date = toDate(dirtyDate);
      return !isNaN(date);
    }

    var formatDistanceLocale = {
      lessThanXSeconds: {
        one: 'less than a second',
        other: 'less than {{count}} seconds'
      },
      xSeconds: {
        one: '1 second',
        other: '{{count}} seconds'
      },
      halfAMinute: 'half a minute',
      lessThanXMinutes: {
        one: 'less than a minute',
        other: 'less than {{count}} minutes'
      },
      xMinutes: {
        one: '1 minute',
        other: '{{count}} minutes'
      },
      aboutXHours: {
        one: 'about 1 hour',
        other: 'about {{count}} hours'
      },
      xHours: {
        one: '1 hour',
        other: '{{count}} hours'
      },
      xDays: {
        one: '1 day',
        other: '{{count}} days'
      },
      aboutXMonths: {
        one: 'about 1 month',
        other: 'about {{count}} months'
      },
      xMonths: {
        one: '1 month',
        other: '{{count}} months'
      },
      aboutXYears: {
        one: 'about 1 year',
        other: 'about {{count}} years'
      },
      xYears: {
        one: '1 year',
        other: '{{count}} years'
      },
      overXYears: {
        one: 'over 1 year',
        other: 'over {{count}} years'
      },
      almostXYears: {
        one: 'almost 1 year',
        other: 'almost {{count}} years'
      }
    };
    function formatDistance(token, count, options) {
      options = options || {};
      var result;

      if (typeof formatDistanceLocale[token] === 'string') {
        result = formatDistanceLocale[token];
      } else if (count === 1) {
        result = formatDistanceLocale[token].one;
      } else {
        result = formatDistanceLocale[token].other.replace('{{count}}', count);
      }

      if (options.addSuffix) {
        if (options.comparison > 0) {
          return 'in ' + result;
        } else {
          return result + ' ago';
        }
      }

      return result;
    }

    function buildFormatLongFn(args) {
      return function (dirtyOptions) {
        var options = dirtyOptions || {};
        var width = options.width ? String(options.width) : args.defaultWidth;
        var format = args.formats[width] || args.formats[args.defaultWidth];
        return format;
      };
    }

    var dateFormats = {
      full: 'EEEE, MMMM do, y',
      long: 'MMMM do, y',
      medium: 'MMM d, y',
      short: 'MM/dd/yyyy'
    };
    var timeFormats = {
      full: 'h:mm:ss a zzzz',
      long: 'h:mm:ss a z',
      medium: 'h:mm:ss a',
      short: 'h:mm a'
    };
    var dateTimeFormats = {
      full: "{{date}} 'at' {{time}}",
      long: "{{date}} 'at' {{time}}",
      medium: '{{date}}, {{time}}',
      short: '{{date}}, {{time}}'
    };
    var formatLong = {
      date: buildFormatLongFn({
        formats: dateFormats,
        defaultWidth: 'full'
      }),
      time: buildFormatLongFn({
        formats: timeFormats,
        defaultWidth: 'full'
      }),
      dateTime: buildFormatLongFn({
        formats: dateTimeFormats,
        defaultWidth: 'full'
      })
    };

    var formatRelativeLocale = {
      lastWeek: "'last' eeee 'at' p",
      yesterday: "'yesterday at' p",
      today: "'today at' p",
      tomorrow: "'tomorrow at' p",
      nextWeek: "eeee 'at' p",
      other: 'P'
    };
    function formatRelative(token, _date, _baseDate, _options) {
      return formatRelativeLocale[token];
    }

    function buildLocalizeFn(args) {
      return function (dirtyIndex, dirtyOptions) {
        var options = dirtyOptions || {};
        var context = options.context ? String(options.context) : 'standalone';
        var valuesArray;

        if (context === 'formatting' && args.formattingValues) {
          var defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
          var width = options.width ? String(options.width) : defaultWidth;
          valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
        } else {
          var _defaultWidth = args.defaultWidth;

          var _width = options.width ? String(options.width) : args.defaultWidth;

          valuesArray = args.values[_width] || args.values[_defaultWidth];
        }

        var index = args.argumentCallback ? args.argumentCallback(dirtyIndex) : dirtyIndex;
        return valuesArray[index];
      };
    }

    var eraValues = {
      narrow: ['B', 'A'],
      abbreviated: ['BC', 'AD'],
      wide: ['Before Christ', 'Anno Domini']
    };
    var quarterValues = {
      narrow: ['1', '2', '3', '4'],
      abbreviated: ['Q1', 'Q2', 'Q3', 'Q4'],
      wide: ['1st quarter', '2nd quarter', '3rd quarter', '4th quarter'] // Note: in English, the names of days of the week and months are capitalized.
      // If you are making a new locale based on this one, check if the same is true for the language you're working on.
      // Generally, formatted dates should look like they are in the middle of a sentence,
      // e.g. in Spanish language the weekdays and months should be in the lowercase.

    };
    var monthValues = {
      narrow: ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'],
      abbreviated: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
      wide: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    };
    var dayValues = {
      narrow: ['S', 'M', 'T', 'W', 'T', 'F', 'S'],
      short: ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
      abbreviated: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      wide: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    };
    var dayPeriodValues = {
      narrow: {
        am: 'a',
        pm: 'p',
        midnight: 'mi',
        noon: 'n',
        morning: 'morning',
        afternoon: 'afternoon',
        evening: 'evening',
        night: 'night'
      },
      abbreviated: {
        am: 'AM',
        pm: 'PM',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'morning',
        afternoon: 'afternoon',
        evening: 'evening',
        night: 'night'
      },
      wide: {
        am: 'a.m.',
        pm: 'p.m.',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'morning',
        afternoon: 'afternoon',
        evening: 'evening',
        night: 'night'
      }
    };
    var formattingDayPeriodValues = {
      narrow: {
        am: 'a',
        pm: 'p',
        midnight: 'mi',
        noon: 'n',
        morning: 'in the morning',
        afternoon: 'in the afternoon',
        evening: 'in the evening',
        night: 'at night'
      },
      abbreviated: {
        am: 'AM',
        pm: 'PM',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'in the morning',
        afternoon: 'in the afternoon',
        evening: 'in the evening',
        night: 'at night'
      },
      wide: {
        am: 'a.m.',
        pm: 'p.m.',
        midnight: 'midnight',
        noon: 'noon',
        morning: 'in the morning',
        afternoon: 'in the afternoon',
        evening: 'in the evening',
        night: 'at night'
      }
    };

    function ordinalNumber(dirtyNumber, _dirtyOptions) {
      var number = Number(dirtyNumber); // If ordinal numbers depend on context, for example,
      // if they are different for different grammatical genders,
      // use `options.unit`:
      //
      //   var options = dirtyOptions || {}
      //   var unit = String(options.unit)
      //
      // where `unit` can be 'year', 'quarter', 'month', 'week', 'date', 'dayOfYear',
      // 'day', 'hour', 'minute', 'second'

      var rem100 = number % 100;

      if (rem100 > 20 || rem100 < 10) {
        switch (rem100 % 10) {
          case 1:
            return number + 'st';

          case 2:
            return number + 'nd';

          case 3:
            return number + 'rd';
        }
      }

      return number + 'th';
    }

    var localize = {
      ordinalNumber: ordinalNumber,
      era: buildLocalizeFn({
        values: eraValues,
        defaultWidth: 'wide'
      }),
      quarter: buildLocalizeFn({
        values: quarterValues,
        defaultWidth: 'wide',
        argumentCallback: function (quarter) {
          return Number(quarter) - 1;
        }
      }),
      month: buildLocalizeFn({
        values: monthValues,
        defaultWidth: 'wide'
      }),
      day: buildLocalizeFn({
        values: dayValues,
        defaultWidth: 'wide'
      }),
      dayPeriod: buildLocalizeFn({
        values: dayPeriodValues,
        defaultWidth: 'wide',
        formattingValues: formattingDayPeriodValues,
        defaultFormattingWidth: 'wide'
      })
    };

    function buildMatchPatternFn(args) {
      return function (dirtyString, dirtyOptions) {
        var string = String(dirtyString);
        var options = dirtyOptions || {};
        var matchResult = string.match(args.matchPattern);

        if (!matchResult) {
          return null;
        }

        var matchedString = matchResult[0];
        var parseResult = string.match(args.parsePattern);

        if (!parseResult) {
          return null;
        }

        var value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
        value = options.valueCallback ? options.valueCallback(value) : value;
        return {
          value: value,
          rest: string.slice(matchedString.length)
        };
      };
    }

    function buildMatchFn(args) {
      return function (dirtyString, dirtyOptions) {
        var string = String(dirtyString);
        var options = dirtyOptions || {};
        var width = options.width;
        var matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
        var matchResult = string.match(matchPattern);

        if (!matchResult) {
          return null;
        }

        var matchedString = matchResult[0];
        var parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
        var value;

        if (Object.prototype.toString.call(parsePatterns) === '[object Array]') {
          value = findIndex(parsePatterns, function (pattern) {
            return pattern.test(string);
          });
        } else {
          value = findKey(parsePatterns, function (pattern) {
            return pattern.test(string);
          });
        }

        value = args.valueCallback ? args.valueCallback(value) : value;
        value = options.valueCallback ? options.valueCallback(value) : value;
        return {
          value: value,
          rest: string.slice(matchedString.length)
        };
      };
    }

    function findKey(object, predicate) {
      for (var key in object) {
        if (object.hasOwnProperty(key) && predicate(object[key])) {
          return key;
        }
      }
    }

    function findIndex(array, predicate) {
      for (var key = 0; key < array.length; key++) {
        if (predicate(array[key])) {
          return key;
        }
      }
    }

    var matchOrdinalNumberPattern = /^(\d+)(th|st|nd|rd)?/i;
    var parseOrdinalNumberPattern = /\d+/i;
    var matchEraPatterns = {
      narrow: /^(b|a)/i,
      abbreviated: /^(b\.?\s?c\.?|b\.?\s?c\.?\s?e\.?|a\.?\s?d\.?|c\.?\s?e\.?)/i,
      wide: /^(before christ|before common era|anno domini|common era)/i
    };
    var parseEraPatterns = {
      any: [/^b/i, /^(a|c)/i]
    };
    var matchQuarterPatterns = {
      narrow: /^[1234]/i,
      abbreviated: /^q[1234]/i,
      wide: /^[1234](th|st|nd|rd)? quarter/i
    };
    var parseQuarterPatterns = {
      any: [/1/i, /2/i, /3/i, /4/i]
    };
    var matchMonthPatterns = {
      narrow: /^[jfmasond]/i,
      abbreviated: /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i,
      wide: /^(january|february|march|april|may|june|july|august|september|october|november|december)/i
    };
    var parseMonthPatterns = {
      narrow: [/^j/i, /^f/i, /^m/i, /^a/i, /^m/i, /^j/i, /^j/i, /^a/i, /^s/i, /^o/i, /^n/i, /^d/i],
      any: [/^ja/i, /^f/i, /^mar/i, /^ap/i, /^may/i, /^jun/i, /^jul/i, /^au/i, /^s/i, /^o/i, /^n/i, /^d/i]
    };
    var matchDayPatterns = {
      narrow: /^[smtwf]/i,
      short: /^(su|mo|tu|we|th|fr|sa)/i,
      abbreviated: /^(sun|mon|tue|wed|thu|fri|sat)/i,
      wide: /^(sunday|monday|tuesday|wednesday|thursday|friday|saturday)/i
    };
    var parseDayPatterns = {
      narrow: [/^s/i, /^m/i, /^t/i, /^w/i, /^t/i, /^f/i, /^s/i],
      any: [/^su/i, /^m/i, /^tu/i, /^w/i, /^th/i, /^f/i, /^sa/i]
    };
    var matchDayPeriodPatterns = {
      narrow: /^(a|p|mi|n|(in the|at) (morning|afternoon|evening|night))/i,
      any: /^([ap]\.?\s?m\.?|midnight|noon|(in the|at) (morning|afternoon|evening|night))/i
    };
    var parseDayPeriodPatterns = {
      any: {
        am: /^a/i,
        pm: /^p/i,
        midnight: /^mi/i,
        noon: /^no/i,
        morning: /morning/i,
        afternoon: /afternoon/i,
        evening: /evening/i,
        night: /night/i
      }
    };
    var match = {
      ordinalNumber: buildMatchPatternFn({
        matchPattern: matchOrdinalNumberPattern,
        parsePattern: parseOrdinalNumberPattern,
        valueCallback: function (value) {
          return parseInt(value, 10);
        }
      }),
      era: buildMatchFn({
        matchPatterns: matchEraPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseEraPatterns,
        defaultParseWidth: 'any'
      }),
      quarter: buildMatchFn({
        matchPatterns: matchQuarterPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseQuarterPatterns,
        defaultParseWidth: 'any',
        valueCallback: function (index) {
          return index + 1;
        }
      }),
      month: buildMatchFn({
        matchPatterns: matchMonthPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseMonthPatterns,
        defaultParseWidth: 'any'
      }),
      day: buildMatchFn({
        matchPatterns: matchDayPatterns,
        defaultMatchWidth: 'wide',
        parsePatterns: parseDayPatterns,
        defaultParseWidth: 'any'
      }),
      dayPeriod: buildMatchFn({
        matchPatterns: matchDayPeriodPatterns,
        defaultMatchWidth: 'any',
        parsePatterns: parseDayPeriodPatterns,
        defaultParseWidth: 'any'
      })
    };

    /**
     * @type {Locale}
     * @category Locales
     * @summary English locale (United States).
     * @language English
     * @iso-639-2 eng
     * @author Sasha Koss [@kossnocorp]{@link https://github.com/kossnocorp}
     * @author Lesha Koss [@leshakoss]{@link https://github.com/leshakoss}
     */

    var locale = {
      code: 'en-US',
      formatDistance: formatDistance,
      formatLong: formatLong,
      formatRelative: formatRelative,
      localize: localize,
      match: match,
      options: {
        weekStartsOn: 0
        /* Sunday */
        ,
        firstWeekContainsDate: 1
      }
    };

    /**
     * @name subMilliseconds
     * @category Millisecond Helpers
     * @summary Subtract the specified number of milliseconds from the given date.
     *
     * @description
     * Subtract the specified number of milliseconds from the given date.
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * @param {Date|Number} date - the date to be changed
     * @param {Number} amount - the amount of milliseconds to be subtracted
     * @returns {Date} the new date with the milliseconds subtracted
     * @throws {TypeError} 2 arguments required
     *
     * @example
     * // Subtract 750 milliseconds from 10 July 2014 12:45:30.000:
     * var result = subMilliseconds(new Date(2014, 6, 10, 12, 45, 30, 0), 750)
     * //=> Thu Jul 10 2014 12:45:29.250
     */

    function subMilliseconds(dirtyDate, dirtyAmount) {
      if (arguments.length < 2) {
        throw new TypeError('2 arguments required, but only ' + arguments.length + ' present');
      }

      var amount = toInteger(dirtyAmount);
      return addMilliseconds(dirtyDate, -amount);
    }

    function addLeadingZeros(number, targetLength) {
      var sign = number < 0 ? '-' : '';
      var output = Math.abs(number).toString();

      while (output.length < targetLength) {
        output = '0' + output;
      }

      return sign + output;
    }

    /*
     * |     | Unit                           |     | Unit                           |
     * |-----|--------------------------------|-----|--------------------------------|
     * |  a  | AM, PM                         |  A* |                                |
     * |  d  | Day of month                   |  D  |                                |
     * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
     * |  m  | Minute                         |  M  | Month                          |
     * |  s  | Second                         |  S  | Fraction of second             |
     * |  y  | Year (abs)                     |  Y  |                                |
     *
     * Letters marked by * are not implemented but reserved by Unicode standard.
     */

    var formatters = {
      // Year
      y: function (date, token) {
        // From http://www.unicode.org/reports/tr35/tr35-31/tr35-dates.html#Date_Format_tokens
        // | Year     |     y | yy |   yyy |  yyyy | yyyyy |
        // |----------|-------|----|-------|-------|-------|
        // | AD 1     |     1 | 01 |   001 |  0001 | 00001 |
        // | AD 12    |    12 | 12 |   012 |  0012 | 00012 |
        // | AD 123   |   123 | 23 |   123 |  0123 | 00123 |
        // | AD 1234  |  1234 | 34 |  1234 |  1234 | 01234 |
        // | AD 12345 | 12345 | 45 | 12345 | 12345 | 12345 |
        var signedYear = date.getUTCFullYear(); // Returns 1 for 1 BC (which is year 0 in JavaScript)

        var year = signedYear > 0 ? signedYear : 1 - signedYear;
        return addLeadingZeros(token === 'yy' ? year % 100 : year, token.length);
      },
      // Month
      M: function (date, token) {
        var month = date.getUTCMonth();
        return token === 'M' ? String(month + 1) : addLeadingZeros(month + 1, 2);
      },
      // Day of the month
      d: function (date, token) {
        return addLeadingZeros(date.getUTCDate(), token.length);
      },
      // AM or PM
      a: function (date, token) {
        var dayPeriodEnumValue = date.getUTCHours() / 12 >= 1 ? 'pm' : 'am';

        switch (token) {
          case 'a':
          case 'aa':
          case 'aaa':
            return dayPeriodEnumValue.toUpperCase();

          case 'aaaaa':
            return dayPeriodEnumValue[0];

          case 'aaaa':
          default:
            return dayPeriodEnumValue === 'am' ? 'a.m.' : 'p.m.';
        }
      },
      // Hour [1-12]
      h: function (date, token) {
        return addLeadingZeros(date.getUTCHours() % 12 || 12, token.length);
      },
      // Hour [0-23]
      H: function (date, token) {
        return addLeadingZeros(date.getUTCHours(), token.length);
      },
      // Minute
      m: function (date, token) {
        return addLeadingZeros(date.getUTCMinutes(), token.length);
      },
      // Second
      s: function (date, token) {
        return addLeadingZeros(date.getUTCSeconds(), token.length);
      },
      // Fraction of second
      S: function (date, token) {
        var numberOfDigits = token.length;
        var milliseconds = date.getUTCMilliseconds();
        var fractionalSeconds = Math.floor(milliseconds * Math.pow(10, numberOfDigits - 3));
        return addLeadingZeros(fractionalSeconds, token.length);
      }
    };

    var MILLISECONDS_IN_DAY = 86400000; // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCDayOfYear(dirtyDate) {
      if (arguments.length < 1) {
        throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
      }

      var date = toDate(dirtyDate);
      var timestamp = date.getTime();
      date.setUTCMonth(0, 1);
      date.setUTCHours(0, 0, 0, 0);
      var startOfYearTimestamp = date.getTime();
      var difference = timestamp - startOfYearTimestamp;
      return Math.floor(difference / MILLISECONDS_IN_DAY) + 1;
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function startOfUTCISOWeek(dirtyDate) {
      if (arguments.length < 1) {
        throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
      }

      var weekStartsOn = 1;
      var date = toDate(dirtyDate);
      var day = date.getUTCDay();
      var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
      date.setUTCDate(date.getUTCDate() - diff);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCISOWeekYear(dirtyDate) {
      if (arguments.length < 1) {
        throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
      }

      var date = toDate(dirtyDate);
      var year = date.getUTCFullYear();
      var fourthOfJanuaryOfNextYear = new Date(0);
      fourthOfJanuaryOfNextYear.setUTCFullYear(year + 1, 0, 4);
      fourthOfJanuaryOfNextYear.setUTCHours(0, 0, 0, 0);
      var startOfNextYear = startOfUTCISOWeek(fourthOfJanuaryOfNextYear);
      var fourthOfJanuaryOfThisYear = new Date(0);
      fourthOfJanuaryOfThisYear.setUTCFullYear(year, 0, 4);
      fourthOfJanuaryOfThisYear.setUTCHours(0, 0, 0, 0);
      var startOfThisYear = startOfUTCISOWeek(fourthOfJanuaryOfThisYear);

      if (date.getTime() >= startOfNextYear.getTime()) {
        return year + 1;
      } else if (date.getTime() >= startOfThisYear.getTime()) {
        return year;
      } else {
        return year - 1;
      }
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function startOfUTCISOWeekYear(dirtyDate) {
      if (arguments.length < 1) {
        throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
      }

      var year = getUTCISOWeekYear(dirtyDate);
      var fourthOfJanuary = new Date(0);
      fourthOfJanuary.setUTCFullYear(year, 0, 4);
      fourthOfJanuary.setUTCHours(0, 0, 0, 0);
      var date = startOfUTCISOWeek(fourthOfJanuary);
      return date;
    }

    var MILLISECONDS_IN_WEEK = 604800000; // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCISOWeek(dirtyDate) {
      if (arguments.length < 1) {
        throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
      }

      var date = toDate(dirtyDate);
      var diff = startOfUTCISOWeek(date).getTime() - startOfUTCISOWeekYear(date).getTime(); // Round the number of days to the nearest integer
      // because the number of milliseconds in a week is not constant
      // (e.g. it's different in the week of the daylight saving time clock shift)

      return Math.round(diff / MILLISECONDS_IN_WEEK) + 1;
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function startOfUTCWeek(dirtyDate, dirtyOptions) {
      if (arguments.length < 1) {
        throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
      }

      var options = dirtyOptions || {};
      var locale = options.locale;
      var localeWeekStartsOn = locale && locale.options && locale.options.weekStartsOn;
      var defaultWeekStartsOn = localeWeekStartsOn == null ? 0 : toInteger(localeWeekStartsOn);
      var weekStartsOn = options.weekStartsOn == null ? defaultWeekStartsOn : toInteger(options.weekStartsOn); // Test if weekStartsOn is between 0 and 6 _and_ is not NaN

      if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
        throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
      }

      var date = toDate(dirtyDate);
      var day = date.getUTCDay();
      var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
      date.setUTCDate(date.getUTCDate() - diff);
      date.setUTCHours(0, 0, 0, 0);
      return date;
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCWeekYear(dirtyDate, dirtyOptions) {
      if (arguments.length < 1) {
        throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
      }

      var date = toDate(dirtyDate, dirtyOptions);
      var year = date.getUTCFullYear();
      var options = dirtyOptions || {};
      var locale = options.locale;
      var localeFirstWeekContainsDate = locale && locale.options && locale.options.firstWeekContainsDate;
      var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger(localeFirstWeekContainsDate);
      var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger(options.firstWeekContainsDate); // Test if weekStartsOn is between 1 and 7 _and_ is not NaN

      if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
        throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
      }

      var firstWeekOfNextYear = new Date(0);
      firstWeekOfNextYear.setUTCFullYear(year + 1, 0, firstWeekContainsDate);
      firstWeekOfNextYear.setUTCHours(0, 0, 0, 0);
      var startOfNextYear = startOfUTCWeek(firstWeekOfNextYear, dirtyOptions);
      var firstWeekOfThisYear = new Date(0);
      firstWeekOfThisYear.setUTCFullYear(year, 0, firstWeekContainsDate);
      firstWeekOfThisYear.setUTCHours(0, 0, 0, 0);
      var startOfThisYear = startOfUTCWeek(firstWeekOfThisYear, dirtyOptions);

      if (date.getTime() >= startOfNextYear.getTime()) {
        return year + 1;
      } else if (date.getTime() >= startOfThisYear.getTime()) {
        return year;
      } else {
        return year - 1;
      }
    }

    // See issue: https://github.com/date-fns/date-fns/issues/376

    function startOfUTCWeekYear(dirtyDate, dirtyOptions) {
      if (arguments.length < 1) {
        throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
      }

      var options = dirtyOptions || {};
      var locale = options.locale;
      var localeFirstWeekContainsDate = locale && locale.options && locale.options.firstWeekContainsDate;
      var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger(localeFirstWeekContainsDate);
      var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger(options.firstWeekContainsDate);
      var year = getUTCWeekYear(dirtyDate, dirtyOptions);
      var firstWeek = new Date(0);
      firstWeek.setUTCFullYear(year, 0, firstWeekContainsDate);
      firstWeek.setUTCHours(0, 0, 0, 0);
      var date = startOfUTCWeek(firstWeek, dirtyOptions);
      return date;
    }

    var MILLISECONDS_IN_WEEK$1 = 604800000; // This function will be a part of public API when UTC function will be implemented.
    // See issue: https://github.com/date-fns/date-fns/issues/376

    function getUTCWeek(dirtyDate, options) {
      if (arguments.length < 1) {
        throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
      }

      var date = toDate(dirtyDate);
      var diff = startOfUTCWeek(date, options).getTime() - startOfUTCWeekYear(date, options).getTime(); // Round the number of days to the nearest integer
      // because the number of milliseconds in a week is not constant
      // (e.g. it's different in the week of the daylight saving time clock shift)

      return Math.round(diff / MILLISECONDS_IN_WEEK$1) + 1;
    }

    var dayPeriodEnum = {
      am: 'am',
      pm: 'pm',
      midnight: 'midnight',
      noon: 'noon',
      morning: 'morning',
      afternoon: 'afternoon',
      evening: 'evening',
      night: 'night'
      /*
       * |     | Unit                           |     | Unit                           |
       * |-----|--------------------------------|-----|--------------------------------|
       * |  a  | AM, PM                         |  A* | Milliseconds in day            |
       * |  b  | AM, PM, noon, midnight         |  B  | Flexible day period            |
       * |  c  | Stand-alone local day of week  |  C* | Localized hour w/ day period   |
       * |  d  | Day of month                   |  D  | Day of year                    |
       * |  e  | Local day of week              |  E  | Day of week                    |
       * |  f  |                                |  F* | Day of week in month           |
       * |  g* | Modified Julian day            |  G  | Era                            |
       * |  h  | Hour [1-12]                    |  H  | Hour [0-23]                    |
       * |  i! | ISO day of week                |  I! | ISO week of year               |
       * |  j* | Localized hour w/ day period   |  J* | Localized hour w/o day period  |
       * |  k  | Hour [1-24]                    |  K  | Hour [0-11]                    |
       * |  l* | (deprecated)                   |  L  | Stand-alone month              |
       * |  m  | Minute                         |  M  | Month                          |
       * |  n  |                                |  N  |                                |
       * |  o! | Ordinal number modifier        |  O  | Timezone (GMT)                 |
       * |  p! | Long localized time            |  P! | Long localized date            |
       * |  q  | Stand-alone quarter            |  Q  | Quarter                        |
       * |  r* | Related Gregorian year         |  R! | ISO week-numbering year        |
       * |  s  | Second                         |  S  | Fraction of second             |
       * |  t! | Seconds timestamp              |  T! | Milliseconds timestamp         |
       * |  u  | Extended year                  |  U* | Cyclic year                    |
       * |  v* | Timezone (generic non-locat.)  |  V* | Timezone (location)            |
       * |  w  | Local week of year             |  W* | Week of month                  |
       * |  x  | Timezone (ISO-8601 w/o Z)      |  X  | Timezone (ISO-8601)            |
       * |  y  | Year (abs)                     |  Y  | Local week-numbering year      |
       * |  z  | Timezone (specific non-locat.) |  Z* | Timezone (aliases)             |
       *
       * Letters marked by * are not implemented but reserved by Unicode standard.
       *
       * Letters marked by ! are non-standard, but implemented by date-fns:
       * - `o` modifies the previous token to turn it into an ordinal (see `format` docs)
       * - `i` is ISO day of week. For `i` and `ii` is returns numeric ISO week days,
       *   i.e. 7 for Sunday, 1 for Monday, etc.
       * - `I` is ISO week of year, as opposed to `w` which is local week of year.
       * - `R` is ISO week-numbering year, as opposed to `Y` which is local week-numbering year.
       *   `R` is supposed to be used in conjunction with `I` and `i`
       *   for universal ISO week-numbering date, whereas
       *   `Y` is supposed to be used in conjunction with `w` and `e`
       *   for week-numbering date specific to the locale.
       * - `P` is long localized date format
       * - `p` is long localized time format
       */

    };
    var formatters$1 = {
      // Era
      G: function (date, token, localize) {
        var era = date.getUTCFullYear() > 0 ? 1 : 0;

        switch (token) {
          // AD, BC
          case 'G':
          case 'GG':
          case 'GGG':
            return localize.era(era, {
              width: 'abbreviated'
            });
          // A, B

          case 'GGGGG':
            return localize.era(era, {
              width: 'narrow'
            });
          // Anno Domini, Before Christ

          case 'GGGG':
          default:
            return localize.era(era, {
              width: 'wide'
            });
        }
      },
      // Year
      y: function (date, token, localize) {
        // Ordinal number
        if (token === 'yo') {
          var signedYear = date.getUTCFullYear(); // Returns 1 for 1 BC (which is year 0 in JavaScript)

          var year = signedYear > 0 ? signedYear : 1 - signedYear;
          return localize.ordinalNumber(year, {
            unit: 'year'
          });
        }

        return formatters.y(date, token);
      },
      // Local week-numbering year
      Y: function (date, token, localize, options) {
        var signedWeekYear = getUTCWeekYear(date, options); // Returns 1 for 1 BC (which is year 0 in JavaScript)

        var weekYear = signedWeekYear > 0 ? signedWeekYear : 1 - signedWeekYear; // Two digit year

        if (token === 'YY') {
          var twoDigitYear = weekYear % 100;
          return addLeadingZeros(twoDigitYear, 2);
        } // Ordinal number


        if (token === 'Yo') {
          return localize.ordinalNumber(weekYear, {
            unit: 'year'
          });
        } // Padding


        return addLeadingZeros(weekYear, token.length);
      },
      // ISO week-numbering year
      R: function (date, token) {
        var isoWeekYear = getUTCISOWeekYear(date); // Padding

        return addLeadingZeros(isoWeekYear, token.length);
      },
      // Extended year. This is a single number designating the year of this calendar system.
      // The main difference between `y` and `u` localizers are B.C. years:
      // | Year | `y` | `u` |
      // |------|-----|-----|
      // | AC 1 |   1 |   1 |
      // | BC 1 |   1 |   0 |
      // | BC 2 |   2 |  -1 |
      // Also `yy` always returns the last two digits of a year,
      // while `uu` pads single digit years to 2 characters and returns other years unchanged.
      u: function (date, token) {
        var year = date.getUTCFullYear();
        return addLeadingZeros(year, token.length);
      },
      // Quarter
      Q: function (date, token, localize) {
        var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);

        switch (token) {
          // 1, 2, 3, 4
          case 'Q':
            return String(quarter);
          // 01, 02, 03, 04

          case 'QQ':
            return addLeadingZeros(quarter, 2);
          // 1st, 2nd, 3rd, 4th

          case 'Qo':
            return localize.ordinalNumber(quarter, {
              unit: 'quarter'
            });
          // Q1, Q2, Q3, Q4

          case 'QQQ':
            return localize.quarter(quarter, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // 1, 2, 3, 4 (narrow quarter; could be not numerical)

          case 'QQQQQ':
            return localize.quarter(quarter, {
              width: 'narrow',
              context: 'formatting'
            });
          // 1st quarter, 2nd quarter, ...

          case 'QQQQ':
          default:
            return localize.quarter(quarter, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Stand-alone quarter
      q: function (date, token, localize) {
        var quarter = Math.ceil((date.getUTCMonth() + 1) / 3);

        switch (token) {
          // 1, 2, 3, 4
          case 'q':
            return String(quarter);
          // 01, 02, 03, 04

          case 'qq':
            return addLeadingZeros(quarter, 2);
          // 1st, 2nd, 3rd, 4th

          case 'qo':
            return localize.ordinalNumber(quarter, {
              unit: 'quarter'
            });
          // Q1, Q2, Q3, Q4

          case 'qqq':
            return localize.quarter(quarter, {
              width: 'abbreviated',
              context: 'standalone'
            });
          // 1, 2, 3, 4 (narrow quarter; could be not numerical)

          case 'qqqqq':
            return localize.quarter(quarter, {
              width: 'narrow',
              context: 'standalone'
            });
          // 1st quarter, 2nd quarter, ...

          case 'qqqq':
          default:
            return localize.quarter(quarter, {
              width: 'wide',
              context: 'standalone'
            });
        }
      },
      // Month
      M: function (date, token, localize) {
        var month = date.getUTCMonth();

        switch (token) {
          case 'M':
          case 'MM':
            return formatters.M(date, token);
          // 1st, 2nd, ..., 12th

          case 'Mo':
            return localize.ordinalNumber(month + 1, {
              unit: 'month'
            });
          // Jan, Feb, ..., Dec

          case 'MMM':
            return localize.month(month, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // J, F, ..., D

          case 'MMMMM':
            return localize.month(month, {
              width: 'narrow',
              context: 'formatting'
            });
          // January, February, ..., December

          case 'MMMM':
          default:
            return localize.month(month, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Stand-alone month
      L: function (date, token, localize) {
        var month = date.getUTCMonth();

        switch (token) {
          // 1, 2, ..., 12
          case 'L':
            return String(month + 1);
          // 01, 02, ..., 12

          case 'LL':
            return addLeadingZeros(month + 1, 2);
          // 1st, 2nd, ..., 12th

          case 'Lo':
            return localize.ordinalNumber(month + 1, {
              unit: 'month'
            });
          // Jan, Feb, ..., Dec

          case 'LLL':
            return localize.month(month, {
              width: 'abbreviated',
              context: 'standalone'
            });
          // J, F, ..., D

          case 'LLLLL':
            return localize.month(month, {
              width: 'narrow',
              context: 'standalone'
            });
          // January, February, ..., December

          case 'LLLL':
          default:
            return localize.month(month, {
              width: 'wide',
              context: 'standalone'
            });
        }
      },
      // Local week of year
      w: function (date, token, localize, options) {
        var week = getUTCWeek(date, options);

        if (token === 'wo') {
          return localize.ordinalNumber(week, {
            unit: 'week'
          });
        }

        return addLeadingZeros(week, token.length);
      },
      // ISO week of year
      I: function (date, token, localize) {
        var isoWeek = getUTCISOWeek(date);

        if (token === 'Io') {
          return localize.ordinalNumber(isoWeek, {
            unit: 'week'
          });
        }

        return addLeadingZeros(isoWeek, token.length);
      },
      // Day of the month
      d: function (date, token, localize) {
        if (token === 'do') {
          return localize.ordinalNumber(date.getUTCDate(), {
            unit: 'date'
          });
        }

        return formatters.d(date, token);
      },
      // Day of year
      D: function (date, token, localize) {
        var dayOfYear = getUTCDayOfYear(date);

        if (token === 'Do') {
          return localize.ordinalNumber(dayOfYear, {
            unit: 'dayOfYear'
          });
        }

        return addLeadingZeros(dayOfYear, token.length);
      },
      // Day of week
      E: function (date, token, localize) {
        var dayOfWeek = date.getUTCDay();

        switch (token) {
          // Tue
          case 'E':
          case 'EE':
          case 'EEE':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // T

          case 'EEEEE':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'formatting'
            });
          // Tu

          case 'EEEEEE':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'formatting'
            });
          // Tuesday

          case 'EEEE':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Local day of week
      e: function (date, token, localize, options) {
        var dayOfWeek = date.getUTCDay();
        var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;

        switch (token) {
          // Numerical value (Nth day of week with current locale or weekStartsOn)
          case 'e':
            return String(localDayOfWeek);
          // Padded numerical value

          case 'ee':
            return addLeadingZeros(localDayOfWeek, 2);
          // 1st, 2nd, ..., 7th

          case 'eo':
            return localize.ordinalNumber(localDayOfWeek, {
              unit: 'day'
            });

          case 'eee':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // T

          case 'eeeee':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'formatting'
            });
          // Tu

          case 'eeeeee':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'formatting'
            });
          // Tuesday

          case 'eeee':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Stand-alone local day of week
      c: function (date, token, localize, options) {
        var dayOfWeek = date.getUTCDay();
        var localDayOfWeek = (dayOfWeek - options.weekStartsOn + 8) % 7 || 7;

        switch (token) {
          // Numerical value (same as in `e`)
          case 'c':
            return String(localDayOfWeek);
          // Padded numerical value

          case 'cc':
            return addLeadingZeros(localDayOfWeek, token.length);
          // 1st, 2nd, ..., 7th

          case 'co':
            return localize.ordinalNumber(localDayOfWeek, {
              unit: 'day'
            });

          case 'ccc':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'standalone'
            });
          // T

          case 'ccccc':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'standalone'
            });
          // Tu

          case 'cccccc':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'standalone'
            });
          // Tuesday

          case 'cccc':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'standalone'
            });
        }
      },
      // ISO day of week
      i: function (date, token, localize) {
        var dayOfWeek = date.getUTCDay();
        var isoDayOfWeek = dayOfWeek === 0 ? 7 : dayOfWeek;

        switch (token) {
          // 2
          case 'i':
            return String(isoDayOfWeek);
          // 02

          case 'ii':
            return addLeadingZeros(isoDayOfWeek, token.length);
          // 2nd

          case 'io':
            return localize.ordinalNumber(isoDayOfWeek, {
              unit: 'day'
            });
          // Tue

          case 'iii':
            return localize.day(dayOfWeek, {
              width: 'abbreviated',
              context: 'formatting'
            });
          // T

          case 'iiiii':
            return localize.day(dayOfWeek, {
              width: 'narrow',
              context: 'formatting'
            });
          // Tu

          case 'iiiiii':
            return localize.day(dayOfWeek, {
              width: 'short',
              context: 'formatting'
            });
          // Tuesday

          case 'iiii':
          default:
            return localize.day(dayOfWeek, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // AM or PM
      a: function (date, token, localize) {
        var hours = date.getUTCHours();
        var dayPeriodEnumValue = hours / 12 >= 1 ? 'pm' : 'am';

        switch (token) {
          case 'a':
          case 'aa':
          case 'aaa':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'abbreviated',
              context: 'formatting'
            });

          case 'aaaaa':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'narrow',
              context: 'formatting'
            });

          case 'aaaa':
          default:
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // AM, PM, midnight, noon
      b: function (date, token, localize) {
        var hours = date.getUTCHours();
        var dayPeriodEnumValue;

        if (hours === 12) {
          dayPeriodEnumValue = dayPeriodEnum.noon;
        } else if (hours === 0) {
          dayPeriodEnumValue = dayPeriodEnum.midnight;
        } else {
          dayPeriodEnumValue = hours / 12 >= 1 ? 'pm' : 'am';
        }

        switch (token) {
          case 'b':
          case 'bb':
          case 'bbb':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'abbreviated',
              context: 'formatting'
            });

          case 'bbbbb':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'narrow',
              context: 'formatting'
            });

          case 'bbbb':
          default:
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // in the morning, in the afternoon, in the evening, at night
      B: function (date, token, localize) {
        var hours = date.getUTCHours();
        var dayPeriodEnumValue;

        if (hours >= 17) {
          dayPeriodEnumValue = dayPeriodEnum.evening;
        } else if (hours >= 12) {
          dayPeriodEnumValue = dayPeriodEnum.afternoon;
        } else if (hours >= 4) {
          dayPeriodEnumValue = dayPeriodEnum.morning;
        } else {
          dayPeriodEnumValue = dayPeriodEnum.night;
        }

        switch (token) {
          case 'B':
          case 'BB':
          case 'BBB':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'abbreviated',
              context: 'formatting'
            });

          case 'BBBBB':
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'narrow',
              context: 'formatting'
            });

          case 'BBBB':
          default:
            return localize.dayPeriod(dayPeriodEnumValue, {
              width: 'wide',
              context: 'formatting'
            });
        }
      },
      // Hour [1-12]
      h: function (date, token, localize) {
        if (token === 'ho') {
          var hours = date.getUTCHours() % 12;
          if (hours === 0) hours = 12;
          return localize.ordinalNumber(hours, {
            unit: 'hour'
          });
        }

        return formatters.h(date, token);
      },
      // Hour [0-23]
      H: function (date, token, localize) {
        if (token === 'Ho') {
          return localize.ordinalNumber(date.getUTCHours(), {
            unit: 'hour'
          });
        }

        return formatters.H(date, token);
      },
      // Hour [0-11]
      K: function (date, token, localize) {
        var hours = date.getUTCHours() % 12;

        if (token === 'Ko') {
          return localize.ordinalNumber(hours, {
            unit: 'hour'
          });
        }

        return addLeadingZeros(hours, token.length);
      },
      // Hour [1-24]
      k: function (date, token, localize) {
        var hours = date.getUTCHours();
        if (hours === 0) hours = 24;

        if (token === 'ko') {
          return localize.ordinalNumber(hours, {
            unit: 'hour'
          });
        }

        return addLeadingZeros(hours, token.length);
      },
      // Minute
      m: function (date, token, localize) {
        if (token === 'mo') {
          return localize.ordinalNumber(date.getUTCMinutes(), {
            unit: 'minute'
          });
        }

        return formatters.m(date, token);
      },
      // Second
      s: function (date, token, localize) {
        if (token === 'so') {
          return localize.ordinalNumber(date.getUTCSeconds(), {
            unit: 'second'
          });
        }

        return formatters.s(date, token);
      },
      // Fraction of second
      S: function (date, token) {
        return formatters.S(date, token);
      },
      // Timezone (ISO-8601. If offset is 0, output is always `'Z'`)
      X: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();

        if (timezoneOffset === 0) {
          return 'Z';
        }

        switch (token) {
          // Hours and optional minutes
          case 'X':
            return formatTimezoneWithOptionalMinutes(timezoneOffset);
          // Hours, minutes and optional seconds without `:` delimiter
          // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
          // so this token always has the same output as `XX`

          case 'XXXX':
          case 'XX':
            // Hours and minutes without `:` delimiter
            return formatTimezone(timezoneOffset);
          // Hours, minutes and optional seconds with `:` delimiter
          // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
          // so this token always has the same output as `XXX`

          case 'XXXXX':
          case 'XXX': // Hours and minutes with `:` delimiter

          default:
            return formatTimezone(timezoneOffset, ':');
        }
      },
      // Timezone (ISO-8601. If offset is 0, output is `'+00:00'` or equivalent)
      x: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();

        switch (token) {
          // Hours and optional minutes
          case 'x':
            return formatTimezoneWithOptionalMinutes(timezoneOffset);
          // Hours, minutes and optional seconds without `:` delimiter
          // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
          // so this token always has the same output as `xx`

          case 'xxxx':
          case 'xx':
            // Hours and minutes without `:` delimiter
            return formatTimezone(timezoneOffset);
          // Hours, minutes and optional seconds with `:` delimiter
          // Note: neither ISO-8601 nor JavaScript supports seconds in timezone offsets
          // so this token always has the same output as `xxx`

          case 'xxxxx':
          case 'xxx': // Hours and minutes with `:` delimiter

          default:
            return formatTimezone(timezoneOffset, ':');
        }
      },
      // Timezone (GMT)
      O: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();

        switch (token) {
          // Short
          case 'O':
          case 'OO':
          case 'OOO':
            return 'GMT' + formatTimezoneShort(timezoneOffset, ':');
          // Long

          case 'OOOO':
          default:
            return 'GMT' + formatTimezone(timezoneOffset, ':');
        }
      },
      // Timezone (specific non-location)
      z: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timezoneOffset = originalDate.getTimezoneOffset();

        switch (token) {
          // Short
          case 'z':
          case 'zz':
          case 'zzz':
            return 'GMT' + formatTimezoneShort(timezoneOffset, ':');
          // Long

          case 'zzzz':
          default:
            return 'GMT' + formatTimezone(timezoneOffset, ':');
        }
      },
      // Seconds timestamp
      t: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timestamp = Math.floor(originalDate.getTime() / 1000);
        return addLeadingZeros(timestamp, token.length);
      },
      // Milliseconds timestamp
      T: function (date, token, _localize, options) {
        var originalDate = options._originalDate || date;
        var timestamp = originalDate.getTime();
        return addLeadingZeros(timestamp, token.length);
      }
    };

    function formatTimezoneShort(offset, dirtyDelimiter) {
      var sign = offset > 0 ? '-' : '+';
      var absOffset = Math.abs(offset);
      var hours = Math.floor(absOffset / 60);
      var minutes = absOffset % 60;

      if (minutes === 0) {
        return sign + String(hours);
      }

      var delimiter = dirtyDelimiter || '';
      return sign + String(hours) + delimiter + addLeadingZeros(minutes, 2);
    }

    function formatTimezoneWithOptionalMinutes(offset, dirtyDelimiter) {
      if (offset % 60 === 0) {
        var sign = offset > 0 ? '-' : '+';
        return sign + addLeadingZeros(Math.abs(offset) / 60, 2);
      }

      return formatTimezone(offset, dirtyDelimiter);
    }

    function formatTimezone(offset, dirtyDelimiter) {
      var delimiter = dirtyDelimiter || '';
      var sign = offset > 0 ? '-' : '+';
      var absOffset = Math.abs(offset);
      var hours = addLeadingZeros(Math.floor(absOffset / 60), 2);
      var minutes = addLeadingZeros(absOffset % 60, 2);
      return sign + hours + delimiter + minutes;
    }

    function dateLongFormatter(pattern, formatLong) {
      switch (pattern) {
        case 'P':
          return formatLong.date({
            width: 'short'
          });

        case 'PP':
          return formatLong.date({
            width: 'medium'
          });

        case 'PPP':
          return formatLong.date({
            width: 'long'
          });

        case 'PPPP':
        default:
          return formatLong.date({
            width: 'full'
          });
      }
    }

    function timeLongFormatter(pattern, formatLong) {
      switch (pattern) {
        case 'p':
          return formatLong.time({
            width: 'short'
          });

        case 'pp':
          return formatLong.time({
            width: 'medium'
          });

        case 'ppp':
          return formatLong.time({
            width: 'long'
          });

        case 'pppp':
        default:
          return formatLong.time({
            width: 'full'
          });
      }
    }

    function dateTimeLongFormatter(pattern, formatLong) {
      var matchResult = pattern.match(/(P+)(p+)?/);
      var datePattern = matchResult[1];
      var timePattern = matchResult[2];

      if (!timePattern) {
        return dateLongFormatter(pattern, formatLong);
      }

      var dateTimeFormat;

      switch (datePattern) {
        case 'P':
          dateTimeFormat = formatLong.dateTime({
            width: 'short'
          });
          break;

        case 'PP':
          dateTimeFormat = formatLong.dateTime({
            width: 'medium'
          });
          break;

        case 'PPP':
          dateTimeFormat = formatLong.dateTime({
            width: 'long'
          });
          break;

        case 'PPPP':
        default:
          dateTimeFormat = formatLong.dateTime({
            width: 'full'
          });
          break;
      }

      return dateTimeFormat.replace('{{date}}', dateLongFormatter(datePattern, formatLong)).replace('{{time}}', timeLongFormatter(timePattern, formatLong));
    }

    var longFormatters = {
      p: timeLongFormatter,
      P: dateTimeLongFormatter
    };

    var protectedDayOfYearTokens = ['D', 'DD'];
    var protectedWeekYearTokens = ['YY', 'YYYY'];
    function isProtectedDayOfYearToken(token) {
      return protectedDayOfYearTokens.indexOf(token) !== -1;
    }
    function isProtectedWeekYearToken(token) {
      return protectedWeekYearTokens.indexOf(token) !== -1;
    }
    function throwProtectedError(token) {
      if (token === 'YYYY') {
        throw new RangeError('Use `yyyy` instead of `YYYY` for formatting years; see: https://git.io/fxCyr');
      } else if (token === 'YY') {
        throw new RangeError('Use `yy` instead of `YY` for formatting years; see: https://git.io/fxCyr');
      } else if (token === 'D') {
        throw new RangeError('Use `d` instead of `D` for formatting days of the month; see: https://git.io/fxCyr');
      } else if (token === 'DD') {
        throw new RangeError('Use `dd` instead of `DD` for formatting days of the month; see: https://git.io/fxCyr');
      }
    }

    // - [yYQqMLwIdDecihHKkms]o matches any available ordinal number token
    //   (one of the certain letters followed by `o`)
    // - (\w)\1* matches any sequences of the same letter
    // - '' matches two quote characters in a row
    // - '(''|[^'])+('|$) matches anything surrounded by two quote characters ('),
    //   except a single quote symbol, which ends the sequence.
    //   Two quote characters do not end the sequence.
    //   If there is no matching single quote
    //   then the sequence will continue until the end of the string.
    // - . matches any single character unmatched by previous parts of the RegExps

    var formattingTokensRegExp = /[yYQqMLwIdDecihHKkms]o|(\w)\1*|''|'(''|[^'])+('|$)|./g; // This RegExp catches symbols escaped by quotes, and also
    // sequences of symbols P, p, and the combinations like `PPPPPPPppppp`

    var longFormattingTokensRegExp = /P+p+|P+|p+|''|'(''|[^'])+('|$)|./g;
    var escapedStringRegExp = /^'([^]*?)'?$/;
    var doubleQuoteRegExp = /''/g;
    var unescapedLatinCharacterRegExp = /[a-zA-Z]/;
    /**
     * @name format
     * @category Common Helpers
     * @summary Format the date.
     *
     * @description
     * Return the formatted date string in the given format. The result may vary by locale.
     *
     * > ⚠️ Please note that the `format` tokens differ from Moment.js and other libraries.
     * > See: https://git.io/fxCyr
     *
     * The characters wrapped between two single quotes characters (') are escaped.
     * Two single quotes in a row, whether inside or outside a quoted sequence, represent a 'real' single quote.
     * (see the last example)
     *
     * Format of the string is based on Unicode Technical Standard #35:
     * https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
     * with a few additions (see note 7 below the table).
     *
     * Accepted patterns:
     * | Unit                            | Pattern | Result examples                   | Notes |
     * |---------------------------------|---------|-----------------------------------|-------|
     * | Era                             | G..GGG  | AD, BC                            |       |
     * |                                 | GGGG    | Anno Domini, Before Christ        | 2     |
     * |                                 | GGGGG   | A, B                              |       |
     * | Calendar year                   | y       | 44, 1, 1900, 2017                 | 5     |
     * |                                 | yo      | 44th, 1st, 0th, 17th              | 5,7   |
     * |                                 | yy      | 44, 01, 00, 17                    | 5     |
     * |                                 | yyy     | 044, 001, 1900, 2017              | 5     |
     * |                                 | yyyy    | 0044, 0001, 1900, 2017            | 5     |
     * |                                 | yyyyy   | ...                               | 3,5   |
     * | Local week-numbering year       | Y       | 44, 1, 1900, 2017                 | 5     |
     * |                                 | Yo      | 44th, 1st, 1900th, 2017th         | 5,7   |
     * |                                 | YY      | 44, 01, 00, 17                    | 5,8   |
     * |                                 | YYY     | 044, 001, 1900, 2017              | 5     |
     * |                                 | YYYY    | 0044, 0001, 1900, 2017            | 5,8   |
     * |                                 | YYYYY   | ...                               | 3,5   |
     * | ISO week-numbering year         | R       | -43, 0, 1, 1900, 2017             | 5,7   |
     * |                                 | RR      | -43, 00, 01, 1900, 2017           | 5,7   |
     * |                                 | RRR     | -043, 000, 001, 1900, 2017        | 5,7   |
     * |                                 | RRRR    | -0043, 0000, 0001, 1900, 2017     | 5,7   |
     * |                                 | RRRRR   | ...                               | 3,5,7 |
     * | Extended year                   | u       | -43, 0, 1, 1900, 2017             | 5     |
     * |                                 | uu      | -43, 01, 1900, 2017               | 5     |
     * |                                 | uuu     | -043, 001, 1900, 2017             | 5     |
     * |                                 | uuuu    | -0043, 0001, 1900, 2017           | 5     |
     * |                                 | uuuuu   | ...                               | 3,5   |
     * | Quarter (formatting)            | Q       | 1, 2, 3, 4                        |       |
     * |                                 | Qo      | 1st, 2nd, 3rd, 4th                | 7     |
     * |                                 | QQ      | 01, 02, 03, 04                    |       |
     * |                                 | QQQ     | Q1, Q2, Q3, Q4                    |       |
     * |                                 | QQQQ    | 1st quarter, 2nd quarter, ...     | 2     |
     * |                                 | QQQQQ   | 1, 2, 3, 4                        | 4     |
     * | Quarter (stand-alone)           | q       | 1, 2, 3, 4                        |       |
     * |                                 | qo      | 1st, 2nd, 3rd, 4th                | 7     |
     * |                                 | qq      | 01, 02, 03, 04                    |       |
     * |                                 | qqq     | Q1, Q2, Q3, Q4                    |       |
     * |                                 | qqqq    | 1st quarter, 2nd quarter, ...     | 2     |
     * |                                 | qqqqq   | 1, 2, 3, 4                        | 4     |
     * | Month (formatting)              | M       | 1, 2, ..., 12                     |       |
     * |                                 | Mo      | 1st, 2nd, ..., 12th               | 7     |
     * |                                 | MM      | 01, 02, ..., 12                   |       |
     * |                                 | MMM     | Jan, Feb, ..., Dec                |       |
     * |                                 | MMMM    | January, February, ..., December  | 2     |
     * |                                 | MMMMM   | J, F, ..., D                      |       |
     * | Month (stand-alone)             | L       | 1, 2, ..., 12                     |       |
     * |                                 | Lo      | 1st, 2nd, ..., 12th               | 7     |
     * |                                 | LL      | 01, 02, ..., 12                   |       |
     * |                                 | LLL     | Jan, Feb, ..., Dec                |       |
     * |                                 | LLLL    | January, February, ..., December  | 2     |
     * |                                 | LLLLL   | J, F, ..., D                      |       |
     * | Local week of year              | w       | 1, 2, ..., 53                     |       |
     * |                                 | wo      | 1st, 2nd, ..., 53th               | 7     |
     * |                                 | ww      | 01, 02, ..., 53                   |       |
     * | ISO week of year                | I       | 1, 2, ..., 53                     | 7     |
     * |                                 | Io      | 1st, 2nd, ..., 53th               | 7     |
     * |                                 | II      | 01, 02, ..., 53                   | 7     |
     * | Day of month                    | d       | 1, 2, ..., 31                     |       |
     * |                                 | do      | 1st, 2nd, ..., 31st               | 7     |
     * |                                 | dd      | 01, 02, ..., 31                   |       |
     * | Day of year                     | D       | 1, 2, ..., 365, 366               | 9     |
     * |                                 | Do      | 1st, 2nd, ..., 365th, 366th       | 7     |
     * |                                 | DD      | 01, 02, ..., 365, 366             | 9     |
     * |                                 | DDD     | 001, 002, ..., 365, 366           |       |
     * |                                 | DDDD    | ...                               | 3     |
     * | Day of week (formatting)        | E..EEE  | Mon, Tue, Wed, ..., Su            |       |
     * |                                 | EEEE    | Monday, Tuesday, ..., Sunday      | 2     |
     * |                                 | EEEEE   | M, T, W, T, F, S, S               |       |
     * |                                 | EEEEEE  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
     * | ISO day of week (formatting)    | i       | 1, 2, 3, ..., 7                   | 7     |
     * |                                 | io      | 1st, 2nd, ..., 7th                | 7     |
     * |                                 | ii      | 01, 02, ..., 07                   | 7     |
     * |                                 | iii     | Mon, Tue, Wed, ..., Su            | 7     |
     * |                                 | iiii    | Monday, Tuesday, ..., Sunday      | 2,7   |
     * |                                 | iiiii   | M, T, W, T, F, S, S               | 7     |
     * |                                 | iiiiii  | Mo, Tu, We, Th, Fr, Su, Sa        | 7     |
     * | Local day of week (formatting)  | e       | 2, 3, 4, ..., 1                   |       |
     * |                                 | eo      | 2nd, 3rd, ..., 1st                | 7     |
     * |                                 | ee      | 02, 03, ..., 01                   |       |
     * |                                 | eee     | Mon, Tue, Wed, ..., Su            |       |
     * |                                 | eeee    | Monday, Tuesday, ..., Sunday      | 2     |
     * |                                 | eeeee   | M, T, W, T, F, S, S               |       |
     * |                                 | eeeeee  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
     * | Local day of week (stand-alone) | c       | 2, 3, 4, ..., 1                   |       |
     * |                                 | co      | 2nd, 3rd, ..., 1st                | 7     |
     * |                                 | cc      | 02, 03, ..., 01                   |       |
     * |                                 | ccc     | Mon, Tue, Wed, ..., Su            |       |
     * |                                 | cccc    | Monday, Tuesday, ..., Sunday      | 2     |
     * |                                 | ccccc   | M, T, W, T, F, S, S               |       |
     * |                                 | cccccc  | Mo, Tu, We, Th, Fr, Su, Sa        |       |
     * | AM, PM                          | a..aaa  | AM, PM                            |       |
     * |                                 | aaaa    | a.m., p.m.                        | 2     |
     * |                                 | aaaaa   | a, p                              |       |
     * | AM, PM, noon, midnight          | b..bbb  | AM, PM, noon, midnight            |       |
     * |                                 | bbbb    | a.m., p.m., noon, midnight        | 2     |
     * |                                 | bbbbb   | a, p, n, mi                       |       |
     * | Flexible day period             | B..BBB  | at night, in the morning, ...     |       |
     * |                                 | BBBB    | at night, in the morning, ...     | 2     |
     * |                                 | BBBBB   | at night, in the morning, ...     |       |
     * | Hour [1-12]                     | h       | 1, 2, ..., 11, 12                 |       |
     * |                                 | ho      | 1st, 2nd, ..., 11th, 12th         | 7     |
     * |                                 | hh      | 01, 02, ..., 11, 12               |       |
     * | Hour [0-23]                     | H       | 0, 1, 2, ..., 23                  |       |
     * |                                 | Ho      | 0th, 1st, 2nd, ..., 23rd          | 7     |
     * |                                 | HH      | 00, 01, 02, ..., 23               |       |
     * | Hour [0-11]                     | K       | 1, 2, ..., 11, 0                  |       |
     * |                                 | Ko      | 1st, 2nd, ..., 11th, 0th          | 7     |
     * |                                 | KK      | 1, 2, ..., 11, 0                  |       |
     * | Hour [1-24]                     | k       | 24, 1, 2, ..., 23                 |       |
     * |                                 | ko      | 24th, 1st, 2nd, ..., 23rd         | 7     |
     * |                                 | kk      | 24, 01, 02, ..., 23               |       |
     * | Minute                          | m       | 0, 1, ..., 59                     |       |
     * |                                 | mo      | 0th, 1st, ..., 59th               | 7     |
     * |                                 | mm      | 00, 01, ..., 59                   |       |
     * | Second                          | s       | 0, 1, ..., 59                     |       |
     * |                                 | so      | 0th, 1st, ..., 59th               | 7     |
     * |                                 | ss      | 00, 01, ..., 59                   |       |
     * | Fraction of second              | S       | 0, 1, ..., 9                      |       |
     * |                                 | SS      | 00, 01, ..., 99                   |       |
     * |                                 | SSS     | 000, 0001, ..., 999               |       |
     * |                                 | SSSS    | ...                               | 3     |
     * | Timezone (ISO-8601 w/ Z)        | X       | -08, +0530, Z                     |       |
     * |                                 | XX      | -0800, +0530, Z                   |       |
     * |                                 | XXX     | -08:00, +05:30, Z                 |       |
     * |                                 | XXXX    | -0800, +0530, Z, +123456          | 2     |
     * |                                 | XXXXX   | -08:00, +05:30, Z, +12:34:56      |       |
     * | Timezone (ISO-8601 w/o Z)       | x       | -08, +0530, +00                   |       |
     * |                                 | xx      | -0800, +0530, +0000               |       |
     * |                                 | xxx     | -08:00, +05:30, +00:00            | 2     |
     * |                                 | xxxx    | -0800, +0530, +0000, +123456      |       |
     * |                                 | xxxxx   | -08:00, +05:30, +00:00, +12:34:56 |       |
     * | Timezone (GMT)                  | O...OOO | GMT-8, GMT+5:30, GMT+0            |       |
     * |                                 | OOOO    | GMT-08:00, GMT+05:30, GMT+00:00   | 2     |
     * | Timezone (specific non-locat.)  | z...zzz | GMT-8, GMT+5:30, GMT+0            | 6     |
     * |                                 | zzzz    | GMT-08:00, GMT+05:30, GMT+00:00   | 2,6   |
     * | Seconds timestamp               | t       | 512969520                         | 7     |
     * |                                 | tt      | ...                               | 3,7   |
     * | Milliseconds timestamp          | T       | 512969520900                      | 7     |
     * |                                 | TT      | ...                               | 3,7   |
     * | Long localized date             | P       | 05/29/1453                        | 7     |
     * |                                 | PP      | May 29, 1453                      | 7     |
     * |                                 | PPP     | May 29th, 1453                    | 7     |
     * |                                 | PPPP    | Sunday, May 29th, 1453            | 2,7   |
     * | Long localized time             | p       | 12:00 AM                          | 7     |
     * |                                 | pp      | 12:00:00 AM                       | 7     |
     * |                                 | ppp     | 12:00:00 AM GMT+2                 | 7     |
     * |                                 | pppp    | 12:00:00 AM GMT+02:00             | 2,7   |
     * | Combination of date and time    | Pp      | 05/29/1453, 12:00 AM              | 7     |
     * |                                 | PPpp    | May 29, 1453, 12:00:00 AM         | 7     |
     * |                                 | PPPppp  | May 29th, 1453 at ...             | 7     |
     * |                                 | PPPPpppp| Sunday, May 29th, 1453 at ...     | 2,7   |
     * Notes:
     * 1. "Formatting" units (e.g. formatting quarter) in the default en-US locale
     *    are the same as "stand-alone" units, but are different in some languages.
     *    "Formatting" units are declined according to the rules of the language
     *    in the context of a date. "Stand-alone" units are always nominative singular:
     *
     *    `format(new Date(2017, 10, 6), 'do LLLL', {locale: cs}) //=> '6. listopad'`
     *
     *    `format(new Date(2017, 10, 6), 'do MMMM', {locale: cs}) //=> '6. listopadu'`
     *
     * 2. Any sequence of the identical letters is a pattern, unless it is escaped by
     *    the single quote characters (see below).
     *    If the sequence is longer than listed in table (e.g. `EEEEEEEEEEE`)
     *    the output will be the same as default pattern for this unit, usually
     *    the longest one (in case of ISO weekdays, `EEEE`). Default patterns for units
     *    are marked with "2" in the last column of the table.
     *
     *    `format(new Date(2017, 10, 6), 'MMM') //=> 'Nov'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMM') //=> 'November'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMMM') //=> 'N'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMMMM') //=> 'November'`
     *
     *    `format(new Date(2017, 10, 6), 'MMMMMMM') //=> 'November'`
     *
     * 3. Some patterns could be unlimited length (such as `yyyyyyyy`).
     *    The output will be padded with zeros to match the length of the pattern.
     *
     *    `format(new Date(2017, 10, 6), 'yyyyyyyy') //=> '00002017'`
     *
     * 4. `QQQQQ` and `qqqqq` could be not strictly numerical in some locales.
     *    These tokens represent the shortest form of the quarter.
     *
     * 5. The main difference between `y` and `u` patterns are B.C. years:
     *
     *    | Year | `y` | `u` |
     *    |------|-----|-----|
     *    | AC 1 |   1 |   1 |
     *    | BC 1 |   1 |   0 |
     *    | BC 2 |   2 |  -1 |
     *
     *    Also `yy` always returns the last two digits of a year,
     *    while `uu` pads single digit years to 2 characters and returns other years unchanged:
     *
     *    | Year | `yy` | `uu` |
     *    |------|------|------|
     *    | 1    |   01 |   01 |
     *    | 14   |   14 |   14 |
     *    | 376  |   76 |  376 |
     *    | 1453 |   53 | 1453 |
     *
     *    The same difference is true for local and ISO week-numbering years (`Y` and `R`),
     *    except local week-numbering years are dependent on `options.weekStartsOn`
     *    and `options.firstWeekContainsDate` (compare [getISOWeekYear]{@link https://date-fns.org/docs/getISOWeekYear}
     *    and [getWeekYear]{@link https://date-fns.org/docs/getWeekYear}).
     *
     * 6. Specific non-location timezones are currently unavailable in `date-fns`,
     *    so right now these tokens fall back to GMT timezones.
     *
     * 7. These patterns are not in the Unicode Technical Standard #35:
     *    - `i`: ISO day of week
     *    - `I`: ISO week of year
     *    - `R`: ISO week-numbering year
     *    - `t`: seconds timestamp
     *    - `T`: milliseconds timestamp
     *    - `o`: ordinal number modifier
     *    - `P`: long localized date
     *    - `p`: long localized time
     *
     * 8. `YY` and `YYYY` tokens represent week-numbering years but they are often confused with years.
     *    You should enable `options.useAdditionalWeekYearTokens` to use them. See: https://git.io/fxCyr
     *
     * 9. `D` and `DD` tokens represent days of the year but they are ofthen confused with days of the month.
     *    You should enable `options.useAdditionalDayOfYearTokens` to use them. See: https://git.io/fxCyr
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * - The second argument is now required for the sake of explicitness.
     *
     *   ```javascript
     *   // Before v2.0.0
     *   format(new Date(2016, 0, 1))
     *
     *   // v2.0.0 onward
     *   format(new Date(2016, 0, 1), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx")
     *   ```
     *
     * - New format string API for `format` function
     *   which is based on [Unicode Technical Standard #35](https://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table).
     *   See [this post](https://blog.date-fns.org/post/unicode-tokens-in-date-fns-v2-sreatyki91jg) for more details.
     *
     * - Characters are now escaped using single quote symbols (`'`) instead of square brackets.
     *
     * @param {Date|Number} date - the original date
     * @param {String} format - the string of tokens
     * @param {Object} [options] - an object with options.
     * @param {Locale} [options.locale=defaultLocale] - the locale object. See [Locale]{@link https://date-fns.org/docs/Locale}
     * @param {0|1|2|3|4|5|6} [options.weekStartsOn=0] - the index of the first day of the week (0 - Sunday)
     * @param {Number} [options.firstWeekContainsDate=1] - the day of January, which is
     * @param {Boolean} [options.useAdditionalWeekYearTokens=false] - if true, allows usage of the week-numbering year tokens `YY` and `YYYY`;
     *   see: https://git.io/fxCyr
     * @param {Boolean} [options.useAdditionalDayOfYearTokens=false] - if true, allows usage of the day of year tokens `D` and `DD`;
     *   see: https://git.io/fxCyr
     * @returns {String} the formatted date string
     * @throws {TypeError} 2 arguments required
     * @throws {RangeError} `date` must not be Invalid Date
     * @throws {RangeError} `options.locale` must contain `localize` property
     * @throws {RangeError} `options.locale` must contain `formatLong` property
     * @throws {RangeError} `options.weekStartsOn` must be between 0 and 6
     * @throws {RangeError} `options.firstWeekContainsDate` must be between 1 and 7
     * @throws {RangeError} use `yyyy` instead of `YYYY` for formatting years; see: https://git.io/fxCyr
     * @throws {RangeError} use `yy` instead of `YY` for formatting years; see: https://git.io/fxCyr
     * @throws {RangeError} use `d` instead of `D` for formatting days of the month; see: https://git.io/fxCyr
     * @throws {RangeError} use `dd` instead of `DD` for formatting days of the month; see: https://git.io/fxCyr
     * @throws {RangeError} format string contains an unescaped latin alphabet character
     *
     * @example
     * // Represent 11 February 2014 in middle-endian format:
     * var result = format(new Date(2014, 1, 11), 'MM/dd/yyyy')
     * //=> '02/11/2014'
     *
     * @example
     * // Represent 2 July 2014 in Esperanto:
     * import { eoLocale } from 'date-fns/locale/eo'
     * var result = format(new Date(2014, 6, 2), "do 'de' MMMM yyyy", {
     *   locale: eoLocale
     * })
     * //=> '2-a de julio 2014'
     *
     * @example
     * // Escape string by single quote characters:
     * var result = format(new Date(2014, 6, 2, 15), "h 'o''clock'")
     * //=> "3 o'clock"
     */

    function format(dirtyDate, dirtyFormatStr, dirtyOptions) {
      if (arguments.length < 2) {
        throw new TypeError('2 arguments required, but only ' + arguments.length + ' present');
      }

      var formatStr = String(dirtyFormatStr);
      var options = dirtyOptions || {};
      var locale$1 = options.locale || locale;
      var localeFirstWeekContainsDate = locale$1.options && locale$1.options.firstWeekContainsDate;
      var defaultFirstWeekContainsDate = localeFirstWeekContainsDate == null ? 1 : toInteger(localeFirstWeekContainsDate);
      var firstWeekContainsDate = options.firstWeekContainsDate == null ? defaultFirstWeekContainsDate : toInteger(options.firstWeekContainsDate); // Test if weekStartsOn is between 1 and 7 _and_ is not NaN

      if (!(firstWeekContainsDate >= 1 && firstWeekContainsDate <= 7)) {
        throw new RangeError('firstWeekContainsDate must be between 1 and 7 inclusively');
      }

      var localeWeekStartsOn = locale$1.options && locale$1.options.weekStartsOn;
      var defaultWeekStartsOn = localeWeekStartsOn == null ? 0 : toInteger(localeWeekStartsOn);
      var weekStartsOn = options.weekStartsOn == null ? defaultWeekStartsOn : toInteger(options.weekStartsOn); // Test if weekStartsOn is between 0 and 6 _and_ is not NaN

      if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
        throw new RangeError('weekStartsOn must be between 0 and 6 inclusively');
      }

      if (!locale$1.localize) {
        throw new RangeError('locale must contain localize property');
      }

      if (!locale$1.formatLong) {
        throw new RangeError('locale must contain formatLong property');
      }

      var originalDate = toDate(dirtyDate);

      if (!isValid(originalDate)) {
        throw new RangeError('Invalid time value');
      } // Convert the date in system timezone to the same date in UTC+00:00 timezone.
      // This ensures that when UTC functions will be implemented, locales will be compatible with them.
      // See an issue about UTC functions: https://github.com/date-fns/date-fns/issues/376


      var timezoneOffset = getTimezoneOffsetInMilliseconds(originalDate);
      var utcDate = subMilliseconds(originalDate, timezoneOffset);
      var formatterOptions = {
        firstWeekContainsDate: firstWeekContainsDate,
        weekStartsOn: weekStartsOn,
        locale: locale$1,
        _originalDate: originalDate
      };
      var result = formatStr.match(longFormattingTokensRegExp).map(function (substring) {
        var firstCharacter = substring[0];

        if (firstCharacter === 'p' || firstCharacter === 'P') {
          var longFormatter = longFormatters[firstCharacter];
          return longFormatter(substring, locale$1.formatLong, formatterOptions);
        }

        return substring;
      }).join('').match(formattingTokensRegExp).map(function (substring) {
        // Replace two single quote characters with one single quote character
        if (substring === "''") {
          return "'";
        }

        var firstCharacter = substring[0];

        if (firstCharacter === "'") {
          return cleanEscapedString(substring);
        }

        var formatter = formatters$1[firstCharacter];

        if (formatter) {
          if (!options.useAdditionalWeekYearTokens && isProtectedWeekYearToken(substring)) {
            throwProtectedError(substring);
          }

          if (!options.useAdditionalDayOfYearTokens && isProtectedDayOfYearToken(substring)) {
            throwProtectedError(substring);
          }

          return formatter(utcDate, substring, locale$1.localize, formatterOptions);
        }

        if (firstCharacter.match(unescapedLatinCharacterRegExp)) {
          throw new RangeError('Format string contains an unescaped latin alphabet character `' + firstCharacter + '`');
        }

        return substring;
      }).join('');
      return result;
    }

    function cleanEscapedString(input) {
      return input.match(escapedStringRegExp)[1].replace(doubleQuoteRegExp, "'");
    }

    /**
     * @name fromUnixTime
     * @category Timestamp Helpers
     * @summary Create a date from a Unix timestamp.
     *
     * @description
     * Create a date from a Unix timestamp.
     *
     * ### v2.0.0 breaking changes:
     *
     * - [Changes that are common for the whole library](https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#Common-Changes).
     *
     * @param {Number} unixTime - the given Unix timestamp
     * @returns {Date} the date
     * @throws {TypeError} 1 argument required
     *
     * @example
     * // Create the date 29 February 2012 11:45:05:
     * var result = fromUnixTime(1330515905)
     * //=> Wed Feb 29 2012 11:45:05
     */

    function fromUnixTime(dirtyUnixTime) {
      if (arguments.length < 1) {
        throw new TypeError('1 argument required, but only ' + arguments.length + ' present');
      }

      var unixTime = toInteger(dirtyUnixTime);
      return toDate(unixTime * 1000);
    }

    /* node_modules/@frontierjs/frontend/components/Field.svelte generated by Svelte v3.20.1 */

    const file$7 = "node_modules/@frontierjs/frontend/components/Field.svelte";

    // (23:8) {:else}
    function create_else_block$3(ctx) {
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", /*name*/ ctx[2]);
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[4]);
    			input.required = /*required*/ ctx[7];
    			attr_dev(input, "class", "svelte-aqwxpj");
    			add_location(input, file$7, 23, 8, 813);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);
    			if (remount) dispose();
    			dispose = listen_dev(input, "input", /*input_input_handler_4*/ ctx[13]);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*name*/ 4) {
    				attr_dev(input, "name", /*name*/ ctx[2]);
    			}

    			if (dirty & /*placeholder*/ 16) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[4]);
    			}

    			if (dirty & /*required*/ 128) {
    				prop_dev(input, "required", /*required*/ ctx[7]);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$3.name,
    		type: "else",
    		source: "(23:8) {:else}",
    		ctx
    	});

    	return block;
    }

    // (21:36) 
    function create_if_block_6(ctx) {
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "hidden");
    			attr_dev(input, "name", /*name*/ ctx[2]);
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[4]);
    			attr_dev(input, "class", "svelte-aqwxpj");
    			add_location(input, file$7, 21, 12, 727);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);
    			if (remount) dispose();
    			dispose = listen_dev(input, "input", /*input_input_handler_3*/ ctx[12]);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*name*/ 4) {
    				attr_dev(input, "name", /*name*/ ctx[2]);
    			}

    			if (dirty & /*placeholder*/ 16) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[4]);
    			}

    			if (dirty & /*value*/ 1) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_6.name,
    		type: "if",
    		source: "(21:36) ",
    		ctx
    	});

    	return block;
    }

    // (19:38) 
    function create_if_block_5(ctx) {
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "password");
    			attr_dev(input, "name", /*name*/ ctx[2]);
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[4]);
    			input.required = /*required*/ ctx[7];
    			attr_dev(input, "class", "svelte-aqwxpj");
    			add_location(input, file$7, 19, 12, 611);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);
    			if (remount) dispose();
    			dispose = listen_dev(input, "input", /*input_input_handler_2*/ ctx[11]);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*name*/ 4) {
    				attr_dev(input, "name", /*name*/ ctx[2]);
    			}

    			if (dirty & /*placeholder*/ 16) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[4]);
    			}

    			if (dirty & /*required*/ 128) {
    				prop_dev(input, "required", /*required*/ ctx[7]);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_5.name,
    		type: "if",
    		source: "(19:38) ",
    		ctx
    	});

    	return block;
    }

    // (17:35) 
    function create_if_block_4(ctx) {
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "email");
    			attr_dev(input, "name", /*name*/ ctx[2]);
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[4]);
    			input.required = /*required*/ ctx[7];
    			attr_dev(input, "class", "svelte-aqwxpj");
    			add_location(input, file$7, 17, 12, 496);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);
    			if (remount) dispose();
    			dispose = listen_dev(input, "input", /*input_input_handler_1*/ ctx[10]);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*name*/ 4) {
    				attr_dev(input, "name", /*name*/ ctx[2]);
    			}

    			if (dirty & /*placeholder*/ 16) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[4]);
    			}

    			if (dirty & /*required*/ 128) {
    				prop_dev(input, "required", /*required*/ ctx[7]);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(17:35) ",
    		ctx
    	});

    	return block;
    }

    // (15:8) {#if type === 'text'}
    function create_if_block_3(ctx) {
    	let input;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "name", /*name*/ ctx[2]);
    			attr_dev(input, "placeholder", /*placeholder*/ ctx[4]);
    			input.required = /*required*/ ctx[7];
    			attr_dev(input, "class", "svelte-aqwxpj");
    			add_location(input, file$7, 15, 12, 385);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, input, anchor);
    			set_input_value(input, /*value*/ ctx[0]);
    			if (remount) dispose();
    			dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[9]);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*name*/ 4) {
    				attr_dev(input, "name", /*name*/ ctx[2]);
    			}

    			if (dirty & /*placeholder*/ 16) {
    				attr_dev(input, "placeholder", /*placeholder*/ ctx[4]);
    			}

    			if (dirty & /*required*/ 128) {
    				prop_dev(input, "required", /*required*/ ctx[7]);
    			}

    			if (dirty & /*value*/ 1 && input.value !== /*value*/ ctx[0]) {
    				set_input_value(input, /*value*/ ctx[0]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(15:8) {#if type === 'text'}",
    		ctx
    	});

    	return block;
    }

    // (26:8) {#if label != 'display-none'}
    function create_if_block_2(ctx) {
    	let label_1;
    	let t;

    	const block = {
    		c: function create() {
    			label_1 = element("label");
    			t = text(/*label*/ ctx[3]);
    			attr_dev(label_1, "for", /*name*/ ctx[2]);
    			attr_dev(label_1, "class", "svelte-aqwxpj");
    			add_location(label_1, file$7, 26, 12, 948);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label_1, anchor);
    			append_dev(label_1, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 8) set_data_dev(t, /*label*/ ctx[3]);

    			if (dirty & /*name*/ 4) {
    				attr_dev(label_1, "for", /*name*/ ctx[2]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label_1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(26:8) {#if label != 'display-none'}",
    		ctx
    	});

    	return block;
    }

    // (32:19) 
    function create_if_block_1$1(ctx) {
    	let p;
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(/*help*/ ctx[6]);
    			attr_dev(p, "class", "help");
    			add_location(p, file$7, 32, 8, 1100);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*help*/ 64) set_data_dev(t, /*help*/ ctx[6]);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(32:19) ",
    		ctx
    	});

    	return block;
    }

    // (30:4) {#if errors.length}
    function create_if_block$4(ctx) {
    	let p;
    	let t_value = /*errors*/ ctx[5][0] + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			attr_dev(p, "class", "error");
    			add_location(p, file$7, 30, 8, 1039);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*errors*/ 32 && t_value !== (t_value = /*errors*/ ctx[5][0] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(30:4) {#if errors.length}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let fieldset;
    	let div;
    	let t0;
    	let t1;
    	let fieldset_class_value;

    	function select_block_type(ctx, dirty) {
    		if (/*type*/ ctx[1] === "text") return create_if_block_3;
    		if (/*type*/ ctx[1] === "email") return create_if_block_4;
    		if (/*type*/ ctx[1] === "password") return create_if_block_5;
    		if (/*type*/ ctx[1] === "hidden") return create_if_block_6;
    		return create_else_block$3;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);
    	let if_block1 = /*label*/ ctx[3] != "display-none" && create_if_block_2(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*errors*/ ctx[5].length) return create_if_block$4;
    		if (/*help*/ ctx[6]) return create_if_block_1$1;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block2 = current_block_type_1 && current_block_type_1(ctx);

    	const block = {
    		c: function create() {
    			fieldset = element("fieldset");
    			div = element("div");
    			if_block0.c();
    			t0 = space();
    			if (if_block1) if_block1.c();
    			t1 = space();
    			if (if_block2) if_block2.c();
    			attr_dev(div, "class", "control");
    			add_location(div, file$7, 13, 4, 321);
    			attr_dev(fieldset, "class", fieldset_class_value = "field " + /*classes*/ ctx[8]);
    			add_location(fieldset, file$7, 12, 0, 282);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, fieldset, anchor);
    			append_dev(fieldset, div);
    			if_block0.m(div, null);
    			append_dev(div, t0);
    			if (if_block1) if_block1.m(div, null);
    			append_dev(fieldset, t1);
    			if (if_block2) if_block2.m(fieldset, null);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block0) {
    				if_block0.p(ctx, dirty);
    			} else {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(div, t0);
    				}
    			}

    			if (/*label*/ ctx[3] != "display-none") {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2(ctx);
    					if_block1.c();
    					if_block1.m(div, null);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			if (current_block_type_1 === (current_block_type_1 = select_block_type_1(ctx)) && if_block2) {
    				if_block2.p(ctx, dirty);
    			} else {
    				if (if_block2) if_block2.d(1);
    				if_block2 = current_block_type_1 && current_block_type_1(ctx);

    				if (if_block2) {
    					if_block2.c();
    					if_block2.m(fieldset, null);
    				}
    			}

    			if (dirty & /*classes*/ 256 && fieldset_class_value !== (fieldset_class_value = "field " + /*classes*/ ctx[8])) {
    				attr_dev(fieldset, "class", fieldset_class_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(fieldset);
    			if_block0.d();
    			if (if_block1) if_block1.d();

    			if (if_block2) {
    				if_block2.d();
    			}
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { type = "text" } = $$props;
    	let { value } = $$props;
    	let { name } = $$props;
    	let { label = name.replace("_", " ") } = $$props;
    	let { placeholder = name } = $$props;
    	let { errors = [] } = $$props;
    	let { help = "" } = $$props;
    	let { required = false } = $$props;
    	let { classes = "" } = $$props;

    	const writable_props = [
    		"type",
    		"value",
    		"name",
    		"label",
    		"placeholder",
    		"errors",
    		"help",
    		"required",
    		"classes"
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Field> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Field", $$slots, []);

    	function input_input_handler() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	function input_input_handler_1() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	function input_input_handler_2() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	function input_input_handler_3() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	function input_input_handler_4() {
    		value = this.value;
    		$$invalidate(0, value);
    	}

    	$$self.$set = $$props => {
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("label" in $$props) $$invalidate(3, label = $$props.label);
    		if ("placeholder" in $$props) $$invalidate(4, placeholder = $$props.placeholder);
    		if ("errors" in $$props) $$invalidate(5, errors = $$props.errors);
    		if ("help" in $$props) $$invalidate(6, help = $$props.help);
    		if ("required" in $$props) $$invalidate(7, required = $$props.required);
    		if ("classes" in $$props) $$invalidate(8, classes = $$props.classes);
    	};

    	$$self.$capture_state = () => ({
    		type,
    		value,
    		name,
    		label,
    		placeholder,
    		errors,
    		help,
    		required,
    		classes
    	});

    	$$self.$inject_state = $$props => {
    		if ("type" in $$props) $$invalidate(1, type = $$props.type);
    		if ("value" in $$props) $$invalidate(0, value = $$props.value);
    		if ("name" in $$props) $$invalidate(2, name = $$props.name);
    		if ("label" in $$props) $$invalidate(3, label = $$props.label);
    		if ("placeholder" in $$props) $$invalidate(4, placeholder = $$props.placeholder);
    		if ("errors" in $$props) $$invalidate(5, errors = $$props.errors);
    		if ("help" in $$props) $$invalidate(6, help = $$props.help);
    		if ("required" in $$props) $$invalidate(7, required = $$props.required);
    		if ("classes" in $$props) $$invalidate(8, classes = $$props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		type,
    		name,
    		label,
    		placeholder,
    		errors,
    		help,
    		required,
    		classes,
    		input_input_handler,
    		input_input_handler_1,
    		input_input_handler_2,
    		input_input_handler_3,
    		input_input_handler_4
    	];
    }

    class Field extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			type: 1,
    			value: 0,
    			name: 2,
    			label: 3,
    			placeholder: 4,
    			errors: 5,
    			help: 6,
    			required: 7,
    			classes: 8
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Field",
    			options,
    			id: create_fragment$9.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*value*/ ctx[0] === undefined && !("value" in props)) {
    			console.warn("<Field> was created without expected prop 'value'");
    		}

    		if (/*name*/ ctx[2] === undefined && !("name" in props)) {
    			console.warn("<Field> was created without expected prop 'name'");
    		}
    	}

    	get type() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set type(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get label() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get placeholder() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set placeholder(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get errors() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set errors(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get help() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set help(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get required() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set required(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<Field>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<Field>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var Field$1 = /*#__PURE__*/Object.freeze({
        __proto__: null,
        'default': Field
    });

    function getCjsExportFromNamespace (n) {
    	return n && n['default'] || n;
    }

    var Field$2 = getCjsExportFromNamespace(Field$1);

    var components = {
        Field: Field$2
    };
    var components_1 = components.Field;

    /* src/pages/dashboard.svelte generated by Svelte v3.20.1 */
    const file$8 = "src/pages/dashboard.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[2] = list[i];
    	return child_ctx;
    }

    // (44:2) {#if newUserView}
    function create_if_block_1$2(ctx) {
    	let div;
    	let updating_value;
    	let t0;
    	let updating_value_1;
    	let t1;
    	let updating_value_2;
    	let t2;
    	let button;
    	let current;
    	let dispose;

    	function field0_value_binding(value) {
    		/*field0_value_binding*/ ctx[10].call(null, value);
    	}

    	let field0_props = { name: "email" };

    	if (/*user*/ ctx[2].email !== void 0) {
    		field0_props.value = /*user*/ ctx[2].email;
    	}

    	const field0 = new components_1({ props: field0_props, $$inline: true });
    	binding_callbacks.push(() => bind(field0, "value", field0_value_binding));

    	function field1_value_binding(value) {
    		/*field1_value_binding*/ ctx[11].call(null, value);
    	}

    	let field1_props = { name: "password", type: "password" };

    	if (/*user*/ ctx[2].password !== void 0) {
    		field1_props.value = /*user*/ ctx[2].password;
    	}

    	const field1 = new components_1({ props: field1_props, $$inline: true });
    	binding_callbacks.push(() => bind(field1, "value", field1_value_binding));

    	function field2_value_binding(value) {
    		/*field2_value_binding*/ ctx[12].call(null, value);
    	}

    	let field2_props = { name: "site" };

    	if (/*user*/ ctx[2].site !== void 0) {
    		field2_props.value = /*user*/ ctx[2].site;
    	}

    	const field2 = new components_1({ props: field2_props, $$inline: true });
    	binding_callbacks.push(() => bind(field2, "value", field2_value_binding));

    	const block = {
    		c: function create() {
    			div = element("div");
    			create_component(field0.$$.fragment);
    			t0 = space();
    			create_component(field1.$$.fragment);
    			t1 = space();
    			create_component(field2.$$.fragment);
    			t2 = space();
    			button = element("button");
    			button.textContent = "Save";
    			add_location(button, file$8, 48, 6, 1464);
    			add_location(div, file$8, 44, 4, 1273);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			mount_component(field0, div, null);
    			append_dev(div, t0);
    			mount_component(field1, div, null);
    			append_dev(div, t1);
    			mount_component(field2, div, null);
    			append_dev(div, t2);
    			append_dev(div, button);
    			current = true;
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", /*save*/ ctx[6], false, false, false);
    		},
    		p: function update(ctx, dirty) {
    			const field0_changes = {};

    			if (!updating_value && dirty & /*user*/ 4) {
    				updating_value = true;
    				field0_changes.value = /*user*/ ctx[2].email;
    				add_flush_callback(() => updating_value = false);
    			}

    			field0.$set(field0_changes);
    			const field1_changes = {};

    			if (!updating_value_1 && dirty & /*user*/ 4) {
    				updating_value_1 = true;
    				field1_changes.value = /*user*/ ctx[2].password;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			field1.$set(field1_changes);
    			const field2_changes = {};

    			if (!updating_value_2 && dirty & /*user*/ 4) {
    				updating_value_2 = true;
    				field2_changes.value = /*user*/ ctx[2].site;
    				add_flush_callback(() => updating_value_2 = false);
    			}

    			field2.$set(field2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field0.$$.fragment, local);
    			transition_in(field1.$$.fragment, local);
    			transition_in(field2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field0.$$.fragment, local);
    			transition_out(field1.$$.fragment, local);
    			transition_out(field2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(field0);
    			destroy_component(field1);
    			destroy_component(field2);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(44:2) {#if newUserView}",
    		ctx
    	});

    	return block;
    }

    // (79:6) {:else}
    function create_else_block_1(ctx) {
    	let div;

    	const block = {
    		c: function create() {
    			div = element("div");
    			div.textContent = "No users found";
    			add_location(div, file$8, 79, 8, 2587);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(79:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (72:12) {:else}
    function create_else_block$4(ctx) {
    	let button;
    	let dispose;

    	function click_handler_4(...args) {
    		return /*click_handler_4*/ ctx[14](/*user*/ ctx[2], ...args);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Deactivate";
    			add_location(button, file$8, 72, 14, 2415);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", click_handler_4, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$4.name,
    		type: "else",
    		source: "(72:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (68:12) {#if user.is_deleted}
    function create_if_block$5(ctx) {
    	let button;
    	let dispose;

    	function click_handler_3(...args) {
    		return /*click_handler_3*/ ctx[13](/*user*/ ctx[2], ...args);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "Reactivate";
    			add_location(button, file$8, 68, 14, 2279);
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, button, anchor);
    			if (remount) dispose();
    			dispose = listen_dev(button, "click", click_handler_3, false, false, false);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(68:12) {#if user.is_deleted}",
    		ctx
    	});

    	return block;
    }

    // (60:6) {#each users as user (user.id)}
    function create_each_block$1(key_1, ctx) {
    	let tr;
    	let td0;
    	let t0_value = /*user*/ ctx[2].id + "";
    	let t0;
    	let t1;
    	let td1;
    	let t2_value = /*user*/ ctx[2].email + "";
    	let t2;
    	let t3;
    	let td2;
    	let t4_value = /*user*/ ctx[2].site + "";
    	let t4;
    	let t5;
    	let td3;
    	let t6_value = format(new Date(/*user*/ ctx[2].date_added), "MM/dd/yyyy") + "";
    	let t6;
    	let t7;
    	let td4;
    	let t8_value = /*user*/ ctx[2].is_deleted + "";
    	let t8;
    	let t9;
    	let td5;
    	let t10;

    	function select_block_type(ctx, dirty) {
    		if (/*user*/ ctx[2].is_deleted) return create_if_block$5;
    		return create_else_block$4;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		key: key_1,
    		first: null,
    		c: function create() {
    			tr = element("tr");
    			td0 = element("td");
    			t0 = text(t0_value);
    			t1 = space();
    			td1 = element("td");
    			t2 = text(t2_value);
    			t3 = space();
    			td2 = element("td");
    			t4 = text(t4_value);
    			t5 = space();
    			td3 = element("td");
    			t6 = text(t6_value);
    			t7 = space();
    			td4 = element("td");
    			t8 = text(t8_value);
    			t9 = space();
    			td5 = element("td");
    			if_block.c();
    			t10 = space();
    			add_location(td0, file$8, 61, 10, 2028);
    			add_location(td1, file$8, 62, 10, 2057);
    			add_location(td2, file$8, 63, 10, 2089);
    			add_location(td3, file$8, 64, 10, 2120);
    			add_location(td4, file$8, 65, 10, 2189);
    			add_location(td5, file$8, 66, 10, 2226);
    			add_location(tr, file$8, 60, 8, 2013);
    			this.first = tr;
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, tr, anchor);
    			append_dev(tr, td0);
    			append_dev(td0, t0);
    			append_dev(tr, t1);
    			append_dev(tr, td1);
    			append_dev(td1, t2);
    			append_dev(tr, t3);
    			append_dev(tr, td2);
    			append_dev(td2, t4);
    			append_dev(tr, t5);
    			append_dev(tr, td3);
    			append_dev(td3, t6);
    			append_dev(tr, t7);
    			append_dev(tr, td4);
    			append_dev(td4, t8);
    			append_dev(tr, t9);
    			append_dev(tr, td5);
    			if_block.m(td5, null);
    			append_dev(tr, t10);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*users*/ 1 && t0_value !== (t0_value = /*user*/ ctx[2].id + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*users*/ 1 && t2_value !== (t2_value = /*user*/ ctx[2].email + "")) set_data_dev(t2, t2_value);
    			if (dirty & /*users*/ 1 && t4_value !== (t4_value = /*user*/ ctx[2].site + "")) set_data_dev(t4, t4_value);
    			if (dirty & /*users*/ 1 && t6_value !== (t6_value = format(new Date(/*user*/ ctx[2].date_added), "MM/dd/yyyy") + "")) set_data_dev(t6, t6_value);
    			if (dirty & /*users*/ 1 && t8_value !== (t8_value = /*user*/ ctx[2].is_deleted + "")) set_data_dev(t8, t8_value);

    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(td5, null);
    				}
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(tr);
    			if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(60:6) {#each users as user (user.id)}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$a(ctx) {
    	let div;
    	let h1;
    	let t1;
    	let button0;
    	let t3;
    	let button1;
    	let t5;
    	let button2;
    	let t7;
    	let t8;
    	let style;
    	let t10;
    	let table;
    	let tbody;
    	let each_blocks = [];
    	let each_1_lookup = new Map();
    	let current;
    	let dispose;
    	let if_block = /*newUserView*/ ctx[1] && create_if_block_1$2(ctx);
    	let each_value = /*users*/ ctx[0];
    	validate_each_argument(each_value);
    	const get_key = ctx => /*user*/ ctx[2].id;
    	validate_each_keys(ctx, each_value, get_each_context$1, get_key);

    	for (let i = 0; i < each_value.length; i += 1) {
    		let child_ctx = get_each_context$1(ctx, each_value, i);
    		let key = get_key(child_ctx);
    		each_1_lookup.set(key, each_blocks[i] = create_each_block$1(key, child_ctx));
    	}

    	let each_1_else = null;

    	if (!each_value.length) {
    		each_1_else = create_else_block_1(ctx);
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Users";
    			t1 = space();
    			button0 = element("button");
    			button0.textContent = "Show All";
    			t3 = space();
    			button1 = element("button");
    			button1.textContent = "Show Active";
    			t5 = space();
    			button2 = element("button");
    			button2.textContent = "New";
    			t7 = space();
    			if (if_block) if_block.c();
    			t8 = space();
    			style = element("style");
    			style.textContent = "table {\n      font-size: var(--font-size);\n    }\n  \n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9wYWdlcy9kYXNoYm9hcmQuc3ZlbHRlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7SUFDSTtNQUNFLDJCQUEyQjtJQUM3QiIsImZpbGUiOiJzcmMvcGFnZXMvZGFzaGJvYXJkLnN2ZWx0ZSIsInNvdXJjZXNDb250ZW50IjpbIlxuICAgIHRhYmxlIHtcbiAgICAgIGZvbnQtc2l6ZTogdmFyKC0tZm9udC1zaXplKTtcbiAgICB9XG4gICJdfQ== */";
    			t10 = space();
    			table = element("table");
    			tbody = element("tbody");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			if (each_1_else) {
    				each_1_else.c();
    			}

    			add_location(h1, file$8, 38, 2, 1028);
    			add_location(button0, file$8, 39, 2, 1045);
    			add_location(button1, file$8, 40, 2, 1112);
    			add_location(button2, file$8, 42, 2, 1177);
    			add_location(style, file$8, 51, 2, 1523);
    			add_location(tbody, file$8, 58, 4, 1959);
    			add_location(table, file$8, 57, 2, 1947);
    			add_location(div, file$8, 37, 0, 1020);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, button0);
    			append_dev(div, t3);
    			append_dev(div, button1);
    			append_dev(div, t5);
    			append_dev(div, button2);
    			append_dev(div, t7);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t8);
    			append_dev(div, style);
    			append_dev(div, t10);
    			append_dev(div, table);
    			append_dev(table, tbody);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(tbody, null);
    			}

    			if (each_1_else) {
    				each_1_else.m(tbody, null);
    			}

    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*click_handler*/ ctx[7], false, false, false),
    				listen_dev(button1, "click", /*click_handler_1*/ ctx[8], false, false, false),
    				listen_dev(button2, "click", /*click_handler_2*/ ctx[9], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*newUserView*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    					transition_in(if_block, 1);
    				} else {
    					if_block = create_if_block_1$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t8);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (dirty & /*reactivate, users, deactivate, format, Date*/ 49) {
    				const each_value = /*users*/ ctx[0];
    				validate_each_argument(each_value);
    				validate_each_keys(ctx, each_value, get_each_context$1, get_key);
    				each_blocks = update_keyed_each(each_blocks, dirty, get_key, 1, ctx, each_value, each_1_lookup, tbody, destroy_block, create_each_block$1, null, get_each_context$1);

    				if (each_value.length) {
    					if (each_1_else) {
    						each_1_else.d(1);
    						each_1_else = null;
    					}
    				} else if (!each_1_else) {
    					each_1_else = create_else_block_1(ctx);
    					each_1_else.c();
    					each_1_else.m(tbody, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].d();
    			}

    			if (each_1_else) each_1_else.d();
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$a.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$a($$self, $$props, $$invalidate) {
    	let user = {
    		email: "jordan+10@knight.works",
    		password: "",
    		site: ""
    	};

    	let users = [];
    	let newUserView = false;

    	// move validation to some higher function so that mount becomes
    	onMount(() => {
    		getUsers();
    	});

    	let getUsers = async function (withDeleted = "") {
    		let res = await frontend_2.get("/users" + withDeleted);
    		$$invalidate(0, users = res.filter(user => user.date_added !== null));
    	};

    	let deactivate = async function (id) {
    		let res = await frontend_2.destroy("/users/" + id);
    		$$invalidate(0, users = res.ok ? users.filter(u => u.id !== id) : users);
    	};

    	let reactivate = async function (id) {
    		let res = await frontend_2.restore("/users/" + id);
    		$$invalidate(0, users = users.map(u => u.id === id ? res : u));
    	};

    	let save = async function () {
    		let res = await frontend_2.save("/users", user);
    		$$invalidate(0, users = res.error ? users : users.concat([res]));
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Dashboard> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Dashboard", $$slots, []);
    	const click_handler = trigger => getUsers("/all");
    	const click_handler_1 = trigger => getUsers();
    	const click_handler_2 = trigger => $$invalidate(1, newUserView = !newUserView);

    	function field0_value_binding(value) {
    		user.email = value;
    		$$invalidate(2, user);
    	}

    	function field1_value_binding(value) {
    		user.password = value;
    		$$invalidate(2, user);
    	}

    	function field2_value_binding(value) {
    		user.site = value;
    		$$invalidate(2, user);
    	}

    	const click_handler_3 = (user, trigger) => reactivate(user.id);
    	const click_handler_4 = (user, trigger) => deactivate(user.id);

    	$$self.$capture_state = () => ({
    		ajx: frontend_2,
    		onMount,
    		format,
    		fromUnixTime,
    		Field: components_1,
    		user,
    		users,
    		newUserView,
    		getUsers,
    		deactivate,
    		reactivate,
    		save
    	});

    	$$self.$inject_state = $$props => {
    		if ("user" in $$props) $$invalidate(2, user = $$props.user);
    		if ("users" in $$props) $$invalidate(0, users = $$props.users);
    		if ("newUserView" in $$props) $$invalidate(1, newUserView = $$props.newUserView);
    		if ("getUsers" in $$props) $$invalidate(3, getUsers = $$props.getUsers);
    		if ("deactivate" in $$props) $$invalidate(4, deactivate = $$props.deactivate);
    		if ("reactivate" in $$props) $$invalidate(5, reactivate = $$props.reactivate);
    		if ("save" in $$props) $$invalidate(6, save = $$props.save);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		users,
    		newUserView,
    		user,
    		getUsers,
    		deactivate,
    		reactivate,
    		save,
    		click_handler,
    		click_handler_1,
    		click_handler_2,
    		field0_value_binding,
    		field1_value_binding,
    		field2_value_binding,
    		click_handler_3,
    		click_handler_4
    	];
    }

    class Dashboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$a, create_fragment$a, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dashboard",
    			options,
    			id: create_fragment$a.name
    		});
    	}
    }

    /* src/pages/examples.svelte generated by Svelte v3.20.1 */
    const file$9 = "src/pages/examples.svelte";

    function create_fragment$b(ctx) {
    	let div;
    	let form;
    	let t0;
    	let t1;
    	let t2;
    	let t3;
    	let t4;
    	let button;
    	let t6;
    	let br0;
    	let t7;
    	let br1;
    	let t8;
    	let hr;
    	let t9;
    	let br2;
    	let current;
    	let dispose;

    	const field0 = new components_1({
    			props: {
    				classes: "",
    				name: "name",
    				value: /*name*/ ctx[0]
    			},
    			$$inline: true
    		});

    	const field1 = new components_1({
    			props: {
    				classes: "",
    				name: "email",
    				type: "email",
    				value: /*email*/ ctx[2]
    			},
    			$$inline: true
    		});

    	const field2 = new components_1({
    			props: {
    				name: "password",
    				type: "password",
    				value: /*password*/ ctx[3]
    			},
    			$$inline: true
    		});

    	const field3 = new components_1({
    			props: {
    				label: "Numberfield",
    				type: "number",
    				name: "number",
    				value: /*number*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const field4 = new components_1({
    			props: {
    				name: "last_name",
    				value: /*lastName*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div = element("div");
    			form = element("form");
    			create_component(field0.$$.fragment);
    			t0 = space();
    			create_component(field1.$$.fragment);
    			t1 = space();
    			create_component(field2.$$.fragment);
    			t2 = space();
    			create_component(field3.$$.fragment);
    			t3 = space();
    			create_component(field4.$$.fragment);
    			t4 = space();
    			button = element("button");
    			button.textContent = "Sign Up";
    			t6 = space();
    			br0 = element("br");
    			t7 = space();
    			br1 = element("br");
    			t8 = space();
    			hr = element("hr");
    			t9 = space();
    			br2 = element("br");
    			attr_dev(button, "class", "");
    			add_location(button, file$9, 32, 4, 941);
    			attr_dev(form, "class", "");
    			add_location(form, file$9, 26, 2, 618);
    			attr_dev(div, "class", "grid columns -gap");
    			add_location(div, file$9, 25, 0, 584);
    			add_location(br0, file$9, 40, 0, 1084);
    			add_location(br1, file$9, 41, 0, 1091);
    			add_location(hr, file$9, 42, 0, 1098);
    			add_location(br2, file$9, 43, 0, 1105);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div, anchor);
    			append_dev(div, form);
    			mount_component(field0, form, null);
    			append_dev(form, t0);
    			mount_component(field1, form, null);
    			append_dev(form, t1);
    			mount_component(field2, form, null);
    			append_dev(form, t2);
    			mount_component(field3, form, null);
    			append_dev(form, t3);
    			mount_component(field4, form, null);
    			append_dev(form, t4);
    			append_dev(form, button);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, hr, anchor);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, br2, anchor);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button, "mouseenter", checkForm, false, false, false),
    				listen_dev(button, "click", /*click_handler*/ ctx[5], false, false, false)
    			];
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field0.$$.fragment, local);
    			transition_in(field1.$$.fragment, local);
    			transition_in(field2.$$.fragment, local);
    			transition_in(field3.$$.fragment, local);
    			transition_in(field4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field0.$$.fragment, local);
    			transition_out(field1.$$.fragment, local);
    			transition_out(field2.$$.fragment, local);
    			transition_out(field3.$$.fragment, local);
    			transition_out(field4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_component(field0);
    			destroy_component(field1);
    			destroy_component(field2);
    			destroy_component(field3);
    			destroy_component(field4);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(hr);
    			if (detaching) detach_dev(t9);
    			if (detaching) detach_dev(br2);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$b.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function checkForm(e) {
    	//currently only checks one at a time
    	let target = e.target, form;

    	while (!form) {
    		if (target.tagName === "FORM") form = target; else target.tagName === "BODY"
    		? form = "not found"
    		: target = target.parentElement;
    	}

    	for (let el of form) {
    		if (el.willValidate && !el.checkValidity()) return el.reportValidity();
    	}
    }

    function instance$b($$self, $$props, $$invalidate) {
    	let name = "";
    	let lastName = "Knight";
    	let email = "";
    	let password = "";
    	let number = 2;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Examples> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Examples", $$slots, []);
    	const click_handler = () => alert("Good Test");

    	$$self.$capture_state = () => ({
    		Field: components_1,
    		name,
    		lastName,
    		email,
    		password,
    		number,
    		checkForm
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(0, name = $$props.name);
    		if ("lastName" in $$props) $$invalidate(1, lastName = $$props.lastName);
    		if ("email" in $$props) $$invalidate(2, email = $$props.email);
    		if ("password" in $$props) $$invalidate(3, password = $$props.password);
    		if ("number" in $$props) $$invalidate(4, number = $$props.number);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [name, lastName, email, password, number, click_handler];
    }

    class Examples extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$b, create_fragment$b, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Examples",
    			options,
    			id: create_fragment$b.name
    		});
    	}
    }

    /* src/pages/index.svelte generated by Svelte v3.20.1 */
    const file$a = "src/pages/index.svelte";

    function create_fragment$c(ctx) {
    	let t0;
    	let section;
    	let article;
    	let div;
    	let t1;
    	let t2_value = /*$currentUser*/ ctx[0].email + "";
    	let t2;

    	const block = {
    		c: function create() {
    			t0 = space();
    			section = element("section");
    			article = element("article");
    			div = element("div");
    			t1 = text("Logged in: ");
    			t2 = text(t2_value);
    			document.title = "FrontierJS";
    			attr_dev(div, "class", "mt-auto");
    			add_location(div, file$a, 10, 4, 182);
    			add_location(article, file$a, 9, 2, 168);
    			attr_dev(section, "class", "mt-auto p");
    			add_location(section, file$a, 8, 0, 138);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t0, anchor);
    			insert_dev(target, section, anchor);
    			append_dev(section, article);
    			append_dev(article, div);
    			append_dev(div, t1);
    			append_dev(div, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*$currentUser*/ 1 && t2_value !== (t2_value = /*$currentUser*/ ctx[0].email + "")) set_data_dev(t2, t2_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(section);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$c.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$c($$self, $$props, $$invalidate) {
    	let $currentUser;
    	validate_store(frontend_3, "currentUser");
    	component_subscribe($$self, frontend_3, $$value => $$invalidate(0, $currentUser = $$value));
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Pages> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Pages", $$slots, []);
    	$$self.$capture_state = () => ({ auth: frontend_1, currentUser: frontend_3, $currentUser });
    	return [$currentUser];
    }

    class Pages extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$c, create_fragment$c, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Pages",
    			options,
    			id: create_fragment$c.name
    		});
    	}
    }

    /* src/pages/login.svelte generated by Svelte v3.20.1 */

    const { console: console_1 } = globals;
    const file$b = "src/pages/login.svelte";

    function create_fragment$d(ctx) {
    	let section;
    	let form_1;
    	let updating_value;
    	let t0;
    	let updating_value_1;
    	let t1;
    	let button;
    	let current;
    	let dispose;

    	function field0_value_binding(value) {
    		/*field0_value_binding*/ ctx[4].call(null, value);
    	}

    	let field0_props = {
    		classes: "",
    		name: "email",
    		type: "email",
    		required: "true"
    	};

    	if (/*form*/ ctx[0].email !== void 0) {
    		field0_props.value = /*form*/ ctx[0].email;
    	}

    	const field0 = new components_1({ props: field0_props, $$inline: true });
    	binding_callbacks.push(() => bind(field0, "value", field0_value_binding));

    	function field1_value_binding(value) {
    		/*field1_value_binding*/ ctx[5].call(null, value);
    	}

    	let field1_props = {
    		classes: "",
    		name: "password",
    		type: "password",
    		required: "true"
    	};

    	if (/*form*/ ctx[0].password !== void 0) {
    		field1_props.value = /*form*/ ctx[0].password;
    	}

    	const field1 = new components_1({ props: field1_props, $$inline: true });
    	binding_callbacks.push(() => bind(field1, "value", field1_value_binding));

    	const block = {
    		c: function create() {
    			section = element("section");
    			form_1 = element("form");
    			create_component(field0.$$.fragment);
    			t0 = space();
    			create_component(field1.$$.fragment);
    			t1 = space();
    			button = element("button");
    			button.textContent = "Enter";
    			attr_dev(button, "class", "el -l");
    			add_location(button, file$b, 52, 4, 1271);
    			attr_dev(form_1, "class", "");
    			add_location(form_1, file$b, 39, 2, 1000);
    			attr_dev(section, "debug", "");
    			attr_dev(section, "class", "bps-debug box _x");
    			add_location(section, file$b, 38, 0, 957);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, section, anchor);
    			append_dev(section, form_1);
    			mount_component(field0, form_1, null);
    			append_dev(form_1, t0);
    			mount_component(field1, form_1, null);
    			append_dev(form_1, t1);
    			append_dev(form_1, button);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button, "mouseenter", checkForm$1, false, false, false),
    				listen_dev(button, "click", /*login*/ ctx[1], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			const field0_changes = {};

    			if (!updating_value && dirty & /*form*/ 1) {
    				updating_value = true;
    				field0_changes.value = /*form*/ ctx[0].email;
    				add_flush_callback(() => updating_value = false);
    			}

    			field0.$set(field0_changes);
    			const field1_changes = {};

    			if (!updating_value_1 && dirty & /*form*/ 1) {
    				updating_value_1 = true;
    				field1_changes.value = /*form*/ ctx[0].password;
    				add_flush_callback(() => updating_value_1 = false);
    			}

    			field1.$set(field1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field0.$$.fragment, local);
    			transition_in(field1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field0.$$.fragment, local);
    			transition_out(field1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(field0);
    			destroy_component(field1);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$d.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function checkForm$1(e) {
    	//currently only checks one at a time
    	let target = e.target, form;

    	while (!form) {
    		if (target.tagName === "FORM") form = target; else target.tagName === "BODY"
    		? form = "not found"
    		: target = target.parentElement;
    	}

    	for (let el of form) {
    		if (el.willValidate && !el.checkValidity()) return el.reportValidity();
    	}
    }

    function instance$d($$self, $$props, $$invalidate) {
    	let $auth;
    	let $goto;
    	validate_store(frontend_1, "auth");
    	component_subscribe($$self, frontend_1, $$value => $$invalidate(2, $auth = $$value));
    	validate_store(goto, "goto");
    	component_subscribe($$self, goto, $$value => $$invalidate(3, $goto = $$value));
    	let form = {};

    	onMount(() => {
    		$$invalidate(0, form = { email: "", password: "" });
    	});

    	function login(e) {
    		e.preventDefault();
    		console.log({ e });

    		//TODO if (event.target.valid) //add to @frontierjs/frontend
    		// if (e.target.form.reportValidity()) $auth.login(form, '/', $goto)
    		if (e.target.form.reportValidity()) $auth.login(form, "/", $goto);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Login> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Login", $$slots, []);

    	function field0_value_binding(value) {
    		form.email = value;
    		$$invalidate(0, form);
    	}

    	function field1_value_binding(value) {
    		form.password = value;
    		$$invalidate(0, form);
    	}

    	$$self.$capture_state = () => ({
    		onMount,
    		auth: frontend_1,
    		Field: components_1,
    		goto,
    		form,
    		checkForm: checkForm$1,
    		login,
    		$auth,
    		$goto
    	});

    	$$self.$inject_state = $$props => {
    		if ("form" in $$props) $$invalidate(0, form = $$props.form);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [form, login, $auth, $goto, field0_value_binding, field1_value_binding];
    }

    class Login extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$d, create_fragment$d, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Login",
    			options,
    			id: create_fragment$d.name
    		});
    	}
    }

    /* src/pages/responsive.svelte generated by Svelte v3.20.1 */

    const { console: console_1$1 } = globals;
    const file$c = "src/pages/responsive.svelte";

    function create_fragment$e(ctx) {
    	let section1;
    	let div0;
    	let form_1;
    	let input0;
    	let t0;
    	let input1;
    	let t1;
    	let section0;
    	let div4;
    	let div3;
    	let div1;
    	let span0;
    	let t2;
    	let div2;
    	let t3;
    	let iframe0;
    	let iframe0_src_value;
    	let t4;
    	let div5;
    	let a0;
    	let em0;
    	let t5;
    	let span1;
    	let a0_href_value;
    	let t7;
    	let div7;
    	let div6;
    	let iframe1;
    	let iframe1_src_value;
    	let t8;
    	let div8;
    	let a1;
    	let em1;
    	let t9;
    	let span2;
    	let a1_href_value;
    	let t11;
    	let div11;
    	let div10;
    	let div9;
    	let span3;
    	let t12;
    	let iframe2;
    	let iframe2_src_value;
    	let t13;
    	let div12;
    	let a2;
    	let em2;
    	let t14;
    	let span4;
    	let a2_href_value;
    	let t16;
    	let div15;
    	let div14;
    	let div13;
    	let span5;
    	let t17;
    	let iframe3;
    	let iframe3_src_value;
    	let t18;
    	let div16;
    	let a3;
    	let em3;
    	let t19;
    	let span6;
    	let a3_href_value;
    	let t21;
    	let div20;
    	let div19;
    	let div17;
    	let span7;
    	let t22;
    	let div18;
    	let t23;
    	let iframe4;
    	let iframe4_src_value;
    	let t24;
    	let div21;
    	let a4;
    	let em4;
    	let t25;
    	let span8;
    	let a4_href_value;
    	let t27;
    	let div25;
    	let div24;
    	let div22;
    	let span9;
    	let t28;
    	let div23;
    	let t29;
    	let iframe5;
    	let iframe5_src_value;
    	let t30;
    	let div26;
    	let a5;
    	let em5;
    	let t31;
    	let span10;
    	let a5_href_value;
    	let t33;
    	let div30;
    	let div29;
    	let div27;
    	let span11;
    	let t34;
    	let div28;
    	let t35;
    	let iframe6;
    	let iframe6_src_value;
    	let t36;
    	let div31;
    	let a6;
    	let em6;
    	let t37;
    	let span12;
    	let a6_href_value;
    	let t39;
    	let div35;
    	let div34;
    	let div32;
    	let span13;
    	let t40;
    	let div33;
    	let t41;
    	let iframe7;
    	let iframe7_src_value;
    	let t42;
    	let div36;
    	let a7;
    	let em7;
    	let t43;
    	let span14;
    	let a7_href_value;
    	let t45;
    	let div39;
    	let div38;
    	let div37;
    	let span15;
    	let t46;
    	let iframe8;
    	let iframe8_src_value;
    	let t47;
    	let div40;
    	let a8;
    	let em8;
    	let t48;
    	let span16;
    	let a8_href_value;
    	let t50;
    	let div43;
    	let div42;
    	let div41;
    	let span17;
    	let t51;
    	let iframe9;
    	let iframe9_src_value;
    	let t52;
    	let div44;
    	let a9;
    	let em9;
    	let t53;
    	let span18;
    	let a9_href_value;
    	let t55;
    	let script;
    	let dispose;

    	const block = {
    		c: function create() {
    			section1 = element("section");
    			div0 = element("div");
    			form_1 = element("form");
    			input0 = element("input");
    			t0 = space();
    			input1 = element("input");
    			t1 = space();
    			section0 = element("section");
    			div4 = element("div");
    			div3 = element("div");
    			div1 = element("div");
    			span0 = element("span");
    			t2 = space();
    			div2 = element("div");
    			t3 = space();
    			iframe0 = element("iframe");
    			t4 = space();
    			div5 = element("div");
    			a0 = element("a");
    			em0 = element("em");
    			t5 = text("iPhone eXpensive portrait\n          ");
    			span1 = element("span");
    			span1.textContent = "· width: 375px";
    			t7 = space();
    			div7 = element("div");
    			div6 = element("div");
    			iframe1 = element("iframe");
    			t8 = space();
    			div8 = element("div");
    			a1 = element("a");
    			em1 = element("em");
    			t9 = text("iPhone eXpensive landscape\n          ");
    			span2 = element("span");
    			span2.textContent = "· width: 734px";
    			t11 = space();
    			div11 = element("div");
    			div10 = element("div");
    			div9 = element("div");
    			span3 = element("span");
    			t12 = space();
    			iframe2 = element("iframe");
    			t13 = space();
    			div12 = element("div");
    			a2 = element("a");
    			em2 = element("em");
    			t14 = text("Android (Pixel 2) portrait\n          ");
    			span4 = element("span");
    			span4.textContent = "· width: 412px";
    			t16 = space();
    			div15 = element("div");
    			div14 = element("div");
    			div13 = element("div");
    			span5 = element("span");
    			t17 = space();
    			iframe3 = element("iframe");
    			t18 = space();
    			div16 = element("div");
    			a3 = element("a");
    			em3 = element("em");
    			t19 = text("Android (Pixel 2) landscape\n          ");
    			span6 = element("span");
    			span6.textContent = "· width: 684px";
    			t21 = space();
    			div20 = element("div");
    			div19 = element("div");
    			div17 = element("div");
    			span7 = element("span");
    			t22 = space();
    			div18 = element("div");
    			t23 = space();
    			iframe4 = element("iframe");
    			t24 = space();
    			div21 = element("div");
    			a4 = element("a");
    			em4 = element("em");
    			t25 = text("iPhone 6-8 portrait\n          ");
    			span8 = element("span");
    			span8.textContent = "· width: 375px";
    			t27 = space();
    			div25 = element("div");
    			div24 = element("div");
    			div22 = element("div");
    			span9 = element("span");
    			t28 = space();
    			div23 = element("div");
    			t29 = space();
    			iframe5 = element("iframe");
    			t30 = space();
    			div26 = element("div");
    			a5 = element("a");
    			em5 = element("em");
    			t31 = text("iPhone 6-8 landscape\n          ");
    			span10 = element("span");
    			span10.textContent = "· width: 667px";
    			t33 = space();
    			div30 = element("div");
    			div29 = element("div");
    			div27 = element("div");
    			span11 = element("span");
    			t34 = space();
    			div28 = element("div");
    			t35 = space();
    			iframe6 = element("iframe");
    			t36 = space();
    			div31 = element("div");
    			a6 = element("a");
    			em6 = element("em");
    			t37 = text("iPhone 6-8 Plump portrait\n          ");
    			span12 = element("span");
    			span12.textContent = "· width: 414px";
    			t39 = space();
    			div35 = element("div");
    			div34 = element("div");
    			div32 = element("div");
    			span13 = element("span");
    			t40 = space();
    			div33 = element("div");
    			t41 = space();
    			iframe7 = element("iframe");
    			t42 = space();
    			div36 = element("div");
    			a7 = element("a");
    			em7 = element("em");
    			t43 = text("iPhone 6-8 Plump landscape\n          ");
    			span14 = element("span");
    			span14.textContent = "· width: 736px";
    			t45 = space();
    			div39 = element("div");
    			div38 = element("div");
    			div37 = element("div");
    			span15 = element("span");
    			t46 = space();
    			iframe8 = element("iframe");
    			t47 = space();
    			div40 = element("div");
    			a8 = element("a");
    			em8 = element("em");
    			t48 = text("iPad portrait\n          ");
    			span16 = element("span");
    			span16.textContent = "· width: 768px";
    			t50 = space();
    			div43 = element("div");
    			div42 = element("div");
    			div41 = element("div");
    			span17 = element("span");
    			t51 = space();
    			iframe9 = element("iframe");
    			t52 = space();
    			div44 = element("div");
    			a9 = element("a");
    			em9 = element("em");
    			t53 = text("iPad landscape\n          ");
    			span18 = element("span");
    			span18.textContent = "· width: 1024px";
    			t55 = space();
    			script = element("script");
    			script.textContent = "(function() {\n      /*\n        var urlParams = new URLSearchParams(window.location.search)\n        url = urlParams.get('url')\n        console.log(url)\n        let doc = document.documentElement.innerHTML\n        let regex = new RegExp(/{url}/)\n        let newdoc = doc.replace('url', url)\n        console.log(newdoc)\n        document.documentElement.innerHTML = doc\n        */\n\n      let frames = Array.from(document.getElementsByTagName(\"iframe\"));\n      frames.forEach(frame => {\n        frame.src = \"http://localhost:5000/dashboard\";\n      });\n    })();";
    			attr_dev(input0, "id", "url");
    			attr_dev(input0, "name", "url");
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "placeholder", "");
    			input0.value = /*url*/ ctx[0];
    			add_location(input0, file$c, 46, 6, 1190);
    			attr_dev(input1, "type", "submit");
    			input1.value = "Go";
    			attr_dev(input1, "id", "go");
    			add_location(input1, file$c, 47, 6, 1265);
    			attr_dev(form_1, "action", "");
    			attr_dev(form_1, "method", "get");
    			add_location(form_1, file$c, 45, 4, 1154);
    			attr_dev(div0, "id", "tools");
    			add_location(div0, file$c, 44, 2, 1133);
    			attr_dev(span0, "class", "time");
    			add_location(span0, file$c, 62, 10, 1710);
    			attr_dev(div1, "class", "flashingTop");
    			set_style(div1, "height", "44px");
    			set_style(div1, "width", "375px");
    			add_location(div1, file$c, 61, 8, 1638);
    			attr_dev(div2, "class", "flashingBottom");
    			set_style(div2, "height", "83px");
    			add_location(div2, file$c, 64, 8, 1755);
    			if (iframe0.src !== (iframe0_src_value = "https://" + /*url*/ ctx[0] + "/")) attr_dev(iframe0, "src", iframe0_src_value);
    			attr_dev(iframe0, "id", "iphone-x-portrait");
    			add_location(iframe0, file$c, 65, 8, 1816);
    			attr_dev(div3, "class", "device");
    			set_style(div3, "width", "375px");
    			set_style(div3, "height", "685px");
    			set_style(div3, "padding-top", "44px");
    			set_style(div3, "padding-bottom", "83px");
    			add_location(div3, file$c, 57, 6, 1505);
    			attr_dev(div4, "class", "deviceWrap iphone-x-portrait");
    			set_style(div4, "min-width", "427px");
    			add_location(div4, file$c, 56, 4, 1430);
    			add_location(span1, file$c, 75, 10, 2158);
    			add_location(em0, file$c, 73, 8, 2107);
    			attr_dev(a0, "href", a0_href_value = "/?url=https://" + /*url*/ ctx[0] + "/&device=iphone-x&orientation=portrait");
    			add_location(a0, file$c, 71, 6, 2014);
    			attr_dev(div5, "class", "deviceTitle");
    			set_style(div5, "min-width", "427px");
    			add_location(div5, file$c, 70, 4, 1956);
    			if (iframe1.src !== (iframe1_src_value = "https://" + /*url*/ ctx[0] + "/")) attr_dev(iframe1, "src", iframe1_src_value);
    			attr_dev(iframe1, "id", "iphone-x-landscape");
    			add_location(iframe1, file$c, 82, 8, 2369);
    			attr_dev(div6, "class", "device");
    			set_style(div6, "width", "734px");
    			set_style(div6, "height", "375px");
    			add_location(div6, file$c, 81, 6, 2303);
    			attr_dev(div7, "class", "deviceWrap iphone-x-landscape");
    			set_style(div7, "min-width", "866px");
    			add_location(div7, file$c, 80, 4, 2227);
    			add_location(span2, file$c, 92, 10, 2714);
    			add_location(em1, file$c, 90, 8, 2662);
    			attr_dev(a1, "href", a1_href_value = "/?url=https://" + /*url*/ ctx[0] + "/&device=iphone-x&orientation=landscape");
    			add_location(a1, file$c, 88, 6, 2568);
    			attr_dev(div8, "class", "deviceTitle");
    			set_style(div8, "min-width", "866px");
    			add_location(div8, file$c, 87, 4, 2510);
    			attr_dev(span3, "class", "time");
    			add_location(span3, file$c, 102, 10, 3038);
    			attr_dev(div9, "class", "flashingTop");
    			set_style(div9, "height", "23px");
    			set_style(div9, "width", "412px");
    			add_location(div9, file$c, 101, 8, 2966);
    			if (iframe2.src !== (iframe2_src_value = "https://" + /*url*/ ctx[0] + "/")) attr_dev(iframe2, "src", iframe2_src_value);
    			attr_dev(iframe2, "id", "android-pixel-2-portrait");
    			add_location(iframe2, file$c, 104, 8, 3083);
    			attr_dev(div10, "class", "device");
    			set_style(div10, "width", "412px");
    			set_style(div10, "height", "661px");
    			set_style(div10, "padding-top", "23px");
    			add_location(div10, file$c, 98, 6, 2865);
    			attr_dev(div11, "class", "deviceWrap android-pixel-2-portrait");
    			set_style(div11, "min-width", "458px");
    			add_location(div11, file$c, 97, 4, 2783);
    			add_location(span4, file$c, 114, 10, 3440);
    			add_location(em2, file$c, 112, 8, 3388);
    			attr_dev(a2, "href", a2_href_value = "/?url=https://" + /*url*/ ctx[0] + "/&device=android-pixel-2&orientation=portrait");
    			add_location(a2, file$c, 110, 6, 3288);
    			attr_dev(div12, "class", "deviceTitle");
    			set_style(div12, "min-width", "458px");
    			add_location(div12, file$c, 109, 4, 3230);
    			attr_dev(span5, "class", "time");
    			add_location(span5, file$c, 124, 10, 3765);
    			attr_dev(div13, "class", "flashingTop");
    			set_style(div13, "height", "23px");
    			set_style(div13, "width", "684px");
    			add_location(div13, file$c, 123, 8, 3693);
    			if (iframe3.src !== (iframe3_src_value = "https://" + /*url*/ ctx[0] + "/")) attr_dev(iframe3, "src", iframe3_src_value);
    			attr_dev(iframe3, "id", "android-pixel-2-landscape");
    			add_location(iframe3, file$c, 126, 8, 3810);
    			attr_dev(div14, "class", "device");
    			set_style(div14, "width", "684px");
    			set_style(div14, "height", "389px");
    			set_style(div14, "padding-top", "23px");
    			add_location(div14, file$c, 120, 6, 3592);
    			attr_dev(div15, "class", "deviceWrap android-pixel-2-landscape");
    			set_style(div15, "min-width", "954px");
    			add_location(div15, file$c, 119, 4, 3509);
    			add_location(span6, file$c, 136, 10, 4170);
    			add_location(em3, file$c, 134, 8, 4117);
    			attr_dev(a3, "href", a3_href_value = "/?url=https://" + /*url*/ ctx[0] + "/&device=android-pixel-2&orientation=landscape");
    			add_location(a3, file$c, 132, 6, 4016);
    			attr_dev(div16, "class", "deviceTitle");
    			set_style(div16, "min-width", "954px");
    			add_location(div16, file$c, 131, 4, 3958);
    			attr_dev(span7, "class", "time");
    			add_location(span7, file$c, 147, 10, 4519);
    			attr_dev(div17, "class", "flashingTop");
    			set_style(div17, "height", "20px");
    			set_style(div17, "width", "375px");
    			add_location(div17, file$c, 146, 8, 4447);
    			attr_dev(div18, "class", "flashingBottom");
    			set_style(div18, "height", "44px");
    			add_location(div18, file$c, 149, 8, 4564);
    			if (iframe4.src !== (iframe4_src_value = "https://" + /*url*/ ctx[0] + "/")) attr_dev(iframe4, "src", iframe4_src_value);
    			attr_dev(iframe4, "id", "iphone-6-portrait");
    			add_location(iframe4, file$c, 150, 8, 4625);
    			attr_dev(div19, "class", "device");
    			set_style(div19, "width", "375px");
    			set_style(div19, "height", "603px");
    			set_style(div19, "padding-top", "20px");
    			set_style(div19, "padding-bottom", "44px");
    			add_location(div19, file$c, 142, 6, 4314);
    			attr_dev(div20, "class", "deviceWrap iphone-6-portrait");
    			set_style(div20, "min-width", "423px");
    			add_location(div20, file$c, 141, 4, 4239);
    			add_location(span8, file$c, 160, 10, 4961);
    			add_location(em4, file$c, 158, 8, 4916);
    			attr_dev(a4, "href", a4_href_value = "/?url=https://" + /*url*/ ctx[0] + "/&device=iphone-6&orientation=portrait");
    			add_location(a4, file$c, 156, 6, 4823);
    			attr_dev(div21, "class", "deviceTitle");
    			set_style(div21, "min-width", "423px");
    			add_location(div21, file$c, 155, 4, 4765);
    			attr_dev(span9, "class", "time");
    			add_location(span9, file$c, 171, 10, 5311);
    			attr_dev(div22, "class", "flashingTop");
    			set_style(div22, "height", "20px");
    			set_style(div22, "width", "667px");
    			add_location(div22, file$c, 170, 8, 5239);
    			attr_dev(div23, "class", "flashingBottom");
    			set_style(div23, "height", "44px");
    			add_location(div23, file$c, 173, 8, 5356);
    			if (iframe5.src !== (iframe5_src_value = "https://" + /*url*/ ctx[0] + "/")) attr_dev(iframe5, "src", iframe5_src_value);
    			attr_dev(iframe5, "id", "iphone-6-landscape");
    			add_location(iframe5, file$c, 174, 8, 5417);
    			attr_dev(div24, "class", "device");
    			set_style(div24, "width", "667px");
    			set_style(div24, "height", "311px");
    			set_style(div24, "padding-top", "20px");
    			set_style(div24, "padding-bottom", "44px");
    			add_location(div24, file$c, 166, 6, 5106);
    			attr_dev(div25, "class", "deviceWrap iphone-6-landscape");
    			set_style(div25, "min-width", "422px");
    			add_location(div25, file$c, 165, 4, 5030);
    			add_location(span10, file$c, 184, 10, 5756);
    			add_location(em5, file$c, 182, 8, 5710);
    			attr_dev(a5, "href", a5_href_value = "/?url=https://" + /*url*/ ctx[0] + "/&device=iphone-6&orientation=landscape");
    			add_location(a5, file$c, 180, 6, 5616);
    			attr_dev(div26, "class", "deviceTitle");
    			set_style(div26, "min-width", "422px");
    			add_location(div26, file$c, 179, 4, 5558);
    			attr_dev(span11, "class", "time");
    			add_location(span11, file$c, 195, 10, 6110);
    			attr_dev(div27, "class", "flashingTop");
    			set_style(div27, "height", "20px");
    			set_style(div27, "width", "414px");
    			add_location(div27, file$c, 194, 8, 6038);
    			attr_dev(div28, "class", "flashingBottom");
    			set_style(div28, "height", "44px");
    			add_location(div28, file$c, 197, 8, 6155);
    			if (iframe6.src !== (iframe6_src_value = "https://" + /*url*/ ctx[0] + "/")) attr_dev(iframe6, "src", iframe6_src_value);
    			attr_dev(iframe6, "id", "iphone-6-plus-portrait");
    			add_location(iframe6, file$c, 198, 8, 6216);
    			attr_dev(div29, "class", "device");
    			set_style(div29, "width", "414px");
    			set_style(div29, "height", "672px");
    			set_style(div29, "padding-top", "20px");
    			set_style(div29, "padding-bottom", "44px");
    			add_location(div29, file$c, 190, 6, 5905);
    			attr_dev(div30, "class", "deviceWrap iphone-6-plus-portrait");
    			set_style(div30, "min-width", "461px");
    			add_location(div30, file$c, 189, 4, 5825);
    			add_location(span12, file$c, 208, 10, 6568);
    			add_location(em6, file$c, 206, 8, 6517);
    			attr_dev(a6, "href", a6_href_value = "/?url=https://" + /*url*/ ctx[0] + "/&device=iphone-6-plus&orientation=portrait");
    			add_location(a6, file$c, 204, 6, 6419);
    			attr_dev(div31, "class", "deviceTitle");
    			set_style(div31, "min-width", "461px");
    			add_location(div31, file$c, 203, 4, 6361);
    			attr_dev(span13, "class", "time");
    			add_location(span13, file$c, 219, 10, 6923);
    			attr_dev(div32, "class", "flashingTop");
    			set_style(div32, "height", "20px");
    			set_style(div32, "width", "736px");
    			add_location(div32, file$c, 218, 8, 6851);
    			attr_dev(div33, "class", "flashingBottom");
    			set_style(div33, "height", "44px");
    			add_location(div33, file$c, 221, 8, 6968);
    			if (iframe7.src !== (iframe7_src_value = "https://" + /*url*/ ctx[0] + "/")) attr_dev(iframe7, "src", iframe7_src_value);
    			attr_dev(iframe7, "id", "iphone-6-plus-landscape");
    			add_location(iframe7, file$c, 222, 8, 7029);
    			attr_dev(div34, "class", "device");
    			set_style(div34, "width", "736px");
    			set_style(div34, "height", "350px");
    			set_style(div34, "padding-top", "20px");
    			set_style(div34, "padding-bottom", "44px");
    			add_location(div34, file$c, 214, 6, 6718);
    			attr_dev(div35, "class", "deviceWrap iphone-6-plus-landscape");
    			set_style(div35, "min-width", "946px");
    			add_location(div35, file$c, 213, 4, 6637);
    			add_location(span14, file$c, 232, 10, 7384);
    			add_location(em7, file$c, 230, 8, 7332);
    			attr_dev(a7, "href", a7_href_value = "/?url=https://" + /*url*/ ctx[0] + "/&device=iphone-6-plus&orientation=landscape");
    			add_location(a7, file$c, 228, 6, 7233);
    			attr_dev(div36, "class", "deviceTitle");
    			set_style(div36, "min-width", "946px");
    			add_location(div36, file$c, 227, 4, 7175);
    			attr_dev(span15, "class", "time");
    			add_location(span15, file$c, 242, 10, 7697);
    			attr_dev(div37, "class", "flashingTop");
    			set_style(div37, "height", "95px");
    			set_style(div37, "width", "768px");
    			add_location(div37, file$c, 241, 8, 7625);
    			if (iframe8.src !== (iframe8_src_value = "https://" + /*url*/ ctx[0] + "/")) attr_dev(iframe8, "src", iframe8_src_value);
    			attr_dev(iframe8, "id", "ipad-portrait");
    			add_location(iframe8, file$c, 244, 8, 7742);
    			attr_dev(div38, "class", "device");
    			set_style(div38, "width", "768px");
    			set_style(div38, "height", "929px");
    			set_style(div38, "padding-top", "95px");
    			add_location(div38, file$c, 238, 6, 7524);
    			attr_dev(div39, "class", "deviceWrap ipad-portrait");
    			set_style(div39, "min-width", "973px");
    			add_location(div39, file$c, 237, 4, 7453);
    			add_location(span16, file$c, 253, 10, 8056);
    			add_location(em8, file$c, 251, 8, 8017);
    			attr_dev(a8, "href", a8_href_value = "/?url=https://" + /*url*/ ctx[0] + "/&device=ipad&orientation=portrait");
    			add_location(a8, file$c, 250, 6, 7936);
    			attr_dev(div40, "class", "deviceTitle");
    			set_style(div40, "min-width", "973px");
    			add_location(div40, file$c, 249, 4, 7878);
    			attr_dev(span17, "class", "time");
    			add_location(span17, file$c, 263, 10, 8373);
    			attr_dev(div41, "class", "flashingTop");
    			set_style(div41, "height", "93px");
    			set_style(div41, "width", "1024px");
    			add_location(div41, file$c, 262, 8, 8300);
    			if (iframe9.src !== (iframe9_src_value = "https://" + /*url*/ ctx[0] + "/")) attr_dev(iframe9, "src", iframe9_src_value);
    			attr_dev(iframe9, "id", "ipad-landscape");
    			add_location(iframe9, file$c, 265, 8, 8418);
    			attr_dev(div42, "class", "device");
    			set_style(div42, "width", "1024px");
    			set_style(div42, "height", "675px");
    			set_style(div42, "padding-top", "93px");
    			add_location(div42, file$c, 259, 6, 8198);
    			attr_dev(div43, "class", "deviceWrap ipad-landscape");
    			set_style(div43, "min-width", "1249px");
    			add_location(div43, file$c, 258, 4, 8125);
    			add_location(span18, file$c, 274, 10, 8736);
    			add_location(em9, file$c, 272, 8, 8696);
    			attr_dev(a9, "href", a9_href_value = "/?url=https://" + /*url*/ ctx[0] + "/&device=ipad&orientation=landscape");
    			add_location(a9, file$c, 271, 6, 8614);
    			attr_dev(div44, "class", "deviceTitle");
    			set_style(div44, "min-width", "1249px");
    			add_location(div44, file$c, 270, 4, 8555);
    			attr_dev(section0, "id", "devices");
    			add_location(section0, file$c, 55, 2, 1403);
    			add_location(script, file$c, 279, 2, 8816);
    			add_location(section1, file$c, 43, 0, 1121);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, section1, anchor);
    			append_dev(section1, div0);
    			append_dev(div0, form_1);
    			append_dev(form_1, input0);
    			append_dev(form_1, t0);
    			append_dev(form_1, input1);
    			append_dev(section1, t1);
    			append_dev(section1, section0);
    			append_dev(section0, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div1);
    			append_dev(div1, span0);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div3, t3);
    			append_dev(div3, iframe0);
    			append_dev(section0, t4);
    			append_dev(section0, div5);
    			append_dev(div5, a0);
    			append_dev(a0, em0);
    			append_dev(em0, t5);
    			append_dev(em0, span1);
    			append_dev(section0, t7);
    			append_dev(section0, div7);
    			append_dev(div7, div6);
    			append_dev(div6, iframe1);
    			append_dev(section0, t8);
    			append_dev(section0, div8);
    			append_dev(div8, a1);
    			append_dev(a1, em1);
    			append_dev(em1, t9);
    			append_dev(em1, span2);
    			append_dev(section0, t11);
    			append_dev(section0, div11);
    			append_dev(div11, div10);
    			append_dev(div10, div9);
    			append_dev(div9, span3);
    			append_dev(div10, t12);
    			append_dev(div10, iframe2);
    			append_dev(section0, t13);
    			append_dev(section0, div12);
    			append_dev(div12, a2);
    			append_dev(a2, em2);
    			append_dev(em2, t14);
    			append_dev(em2, span4);
    			append_dev(section0, t16);
    			append_dev(section0, div15);
    			append_dev(div15, div14);
    			append_dev(div14, div13);
    			append_dev(div13, span5);
    			append_dev(div14, t17);
    			append_dev(div14, iframe3);
    			append_dev(section0, t18);
    			append_dev(section0, div16);
    			append_dev(div16, a3);
    			append_dev(a3, em3);
    			append_dev(em3, t19);
    			append_dev(em3, span6);
    			append_dev(section0, t21);
    			append_dev(section0, div20);
    			append_dev(div20, div19);
    			append_dev(div19, div17);
    			append_dev(div17, span7);
    			append_dev(div19, t22);
    			append_dev(div19, div18);
    			append_dev(div19, t23);
    			append_dev(div19, iframe4);
    			append_dev(section0, t24);
    			append_dev(section0, div21);
    			append_dev(div21, a4);
    			append_dev(a4, em4);
    			append_dev(em4, t25);
    			append_dev(em4, span8);
    			append_dev(section0, t27);
    			append_dev(section0, div25);
    			append_dev(div25, div24);
    			append_dev(div24, div22);
    			append_dev(div22, span9);
    			append_dev(div24, t28);
    			append_dev(div24, div23);
    			append_dev(div24, t29);
    			append_dev(div24, iframe5);
    			append_dev(section0, t30);
    			append_dev(section0, div26);
    			append_dev(div26, a5);
    			append_dev(a5, em5);
    			append_dev(em5, t31);
    			append_dev(em5, span10);
    			append_dev(section0, t33);
    			append_dev(section0, div30);
    			append_dev(div30, div29);
    			append_dev(div29, div27);
    			append_dev(div27, span11);
    			append_dev(div29, t34);
    			append_dev(div29, div28);
    			append_dev(div29, t35);
    			append_dev(div29, iframe6);
    			append_dev(section0, t36);
    			append_dev(section0, div31);
    			append_dev(div31, a6);
    			append_dev(a6, em6);
    			append_dev(em6, t37);
    			append_dev(em6, span12);
    			append_dev(section0, t39);
    			append_dev(section0, div35);
    			append_dev(div35, div34);
    			append_dev(div34, div32);
    			append_dev(div32, span13);
    			append_dev(div34, t40);
    			append_dev(div34, div33);
    			append_dev(div34, t41);
    			append_dev(div34, iframe7);
    			append_dev(section0, t42);
    			append_dev(section0, div36);
    			append_dev(div36, a7);
    			append_dev(a7, em7);
    			append_dev(em7, t43);
    			append_dev(em7, span14);
    			append_dev(section0, t45);
    			append_dev(section0, div39);
    			append_dev(div39, div38);
    			append_dev(div38, div37);
    			append_dev(div37, span15);
    			append_dev(div38, t46);
    			append_dev(div38, iframe8);
    			append_dev(section0, t47);
    			append_dev(section0, div40);
    			append_dev(div40, a8);
    			append_dev(a8, em8);
    			append_dev(em8, t48);
    			append_dev(em8, span16);
    			append_dev(section0, t50);
    			append_dev(section0, div43);
    			append_dev(div43, div42);
    			append_dev(div42, div41);
    			append_dev(div41, span17);
    			append_dev(div42, t51);
    			append_dev(div42, iframe9);
    			append_dev(section0, t52);
    			append_dev(section0, div44);
    			append_dev(div44, a9);
    			append_dev(a9, em9);
    			append_dev(em9, t53);
    			append_dev(em9, span18);
    			append_dev(section1, t55);
    			append_dev(section1, script);
    			if (remount) dispose();
    			dispose = listen_dev(input1, "click", prevent_default(/*updateIframe*/ ctx[1]), false, true, false);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section1);
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$e.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function checkForm$2(e) {
    	//currently only checks one at a time
    	let target = e.target, form;

    	while (!form) {
    		if (target.tagName === "FORM") form = target; else target.tagName === "BODY"
    		? form = "not found"
    		: target = target.parentElement;
    	}

    	for (let el of form) {
    		if (el.willValidate && !el.checkValidity()) return el.reportValidity();
    	}
    }

    function instance$e($$self, $$props, $$invalidate) {
    	let $auth;
    	let $goto;
    	validate_store(frontend_1, "auth");
    	component_subscribe($$self, frontend_1, $$value => $$invalidate(2, $auth = $$value));
    	validate_store(goto, "goto");
    	component_subscribe($$self, goto, $$value => $$invalidate(3, $goto = $$value));
    	let form = {};
    	let url = "http://localhost:5000/styles";

    	onMount(() => {
    		
    	});

    	function login(e) {
    		e.preventDefault();
    		console.log({ e });

    		//TODO if (event.target.valid) //add to @frontierjs/frontend
    		// if (e.target.form.reportValidity()) $auth.login(form, '/', $goto)
    		if (e.target.form.reportValidity()) $auth.login(form, "/", $goto);
    	}

    	function updateIframe() {
    		let frames = Array.from(document.getElementsByTagName("iframe"));

    		frames.forEach(frame => {
    			frame.src = url;
    		});
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Responsive> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Responsive", $$slots, []);

    	$$self.$capture_state = () => ({
    		onMount,
    		auth: frontend_1,
    		Field: components_1,
    		goto,
    		form,
    		url,
    		checkForm: checkForm$2,
    		login,
    		updateIframe,
    		$auth,
    		$goto
    	});

    	$$self.$inject_state = $$props => {
    		if ("form" in $$props) form = $$props.form;
    		if ("url" in $$props) $$invalidate(0, url = $$props.url);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [url, updateIframe];
    }

    class Responsive extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$e, create_fragment$e, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Responsive",
    			options,
    			id: create_fragment$e.name
    		});
    	}
    }

    /* src/pages/styles.svelte generated by Svelte v3.20.1 */

    const { console: console_1$2 } = globals;
    const file$d = "src/pages/styles.svelte";

    function create_fragment$f(ctx) {
    	let section;
    	let div15;
    	let article0;
    	let h30;
    	let t1;
    	let div0;
    	let span0;
    	let t3;
    	let span1;
    	let t5;
    	let span2;
    	let t7;
    	let article9;
    	let h1;
    	let t9;
    	let h20;
    	let t10;
    	let small0;
    	let span3;
    	let t12;
    	let article1;
    	let h31;
    	let t14;
    	let div1;
    	let span4;
    	let t16;
    	let br;
    	let t17;
    	let i;
    	let t19;
    	let p0;
    	let t21;
    	let ol0;
    	let li0;
    	let t23;
    	let p1;
    	let t25;
    	let p2;
    	let t27;
    	let p3;
    	let t29;
    	let ol1;
    	let li1;
    	let t31;
    	let li2;
    	let t33;
    	let li3;
    	let t35;
    	let li4;
    	let t37;
    	let p4;
    	let t39;
    	let p5;
    	let t41;
    	let p6;
    	let t43;
    	let p7;
    	let t45;
    	let article8;
    	let h32;
    	let t47;
    	let div2;
    	let p8;
    	let strong;
    	let t49;
    	let t50;
    	let p9;
    	let t52;
    	let ol2;
    	let li5;
    	let t54;
    	let li6;
    	let t56;
    	let li7;
    	let t58;
    	let li8;
    	let t60;
    	let li9;
    	let t62;
    	let p10;
    	let t64;
    	let ol3;
    	let li10;
    	let t66;
    	let li11;
    	let t68;
    	let li12;
    	let t70;
    	let article2;
    	let h5;
    	let t72;
    	let p11;
    	let t74;
    	let p12;
    	let t76;
    	let p13;
    	let t78;
    	let p14;
    	let t80;
    	let p15;
    	let t82;
    	let iframe;
    	let iframe_src_value;
    	let t83;
    	let span5;
    	let t85;
    	let span6;
    	let t87;
    	let span7;
    	let t89;
    	let span8;
    	let t91;
    	let p16;
    	let span9;
    	let t93;
    	let span10;
    	let t95;
    	let span11;
    	let t97;
    	let span12;
    	let t99;
    	let span13;
    	let t101;
    	let hr0;
    	let t102;
    	let div3;
    	let t104;
    	let div4;
    	let t106;
    	let div5;
    	let t108;
    	let div6;
    	let t110;
    	let div7;
    	let t112;
    	let div8;
    	let t114;
    	let div9;
    	let t116;
    	let div10;
    	let t118;
    	let div11;
    	let t120;
    	let small1;
    	let div12;
    	let t122;
    	let big;
    	let div13;
    	let t124;
    	let hr1;
    	let t125;
    	let article3;
    	let h33;
    	let t127;
    	let p17;
    	let t129;
    	let p18;
    	let t131;
    	let article4;
    	let h34;
    	let t133;
    	let div14;
    	let span14;
    	let t135;
    	let article5;
    	let h35;
    	let t137;
    	let p19;
    	let t139;
    	let h36;
    	let t141;
    	let article6;
    	let h40;
    	let t143;
    	let p20;
    	let t145;
    	let article7;
    	let h41;
    	let t147;
    	let p21;
    	let t149;
    	let p22;
    	let t151;
    	let p23;
    	let t153;
    	let ul;
    	let li13;
    	let t155;
    	let li14;
    	let t157;
    	let li15;
    	let t159;
    	let li16;
    	let t161;
    	let li17;
    	let t163;
    	let h42;
    	let t165;
    	let h21;
    	let t167;
    	let h37;
    	let t169;
    	let h38;
    	let t171;
    	let h43;
    	let t173;
    	let h39;
    	let t175;
    	let h22;
    	let t177;
    	let h310;
    	let t179;
    	let h311;
    	let t181;
    	let h312;
    	let t183;
    	let h313;
    	let t185;
    	let h44;
    	let t187;
    	let h23;
    	let t189;
    	let h314;
    	let t191;
    	let h315;
    	let t193;
    	let h316;
    	let t195;
    	let h24;
    	let t197;
    	let h317;
    	let t199;
    	let h318;
    	let t201;
    	let h25;
    	let t203;
    	let h26;
    	let t205;
    	let h27;
    	let t207;
    	let h6;
    	let t209;
    	let figure0;
    	let figcaption0;
    	let h319;
    	let t211;
    	let pre0;
    	let code0;
    	let t213;
    	let figure1;
    	let figcaption1;
    	let h320;
    	let t215;
    	let pre1;
    	let code1;
    	let t217;
    	let figure2;
    	let figcaption2;
    	let h321;
    	let t219;
    	let pre2;
    	let code2;
    	let t221;
    	let div16;
    	let h28;
    	let t223;
    	let figure3;
    	let figcaption3;
    	let h322;
    	let t225;
    	let pre3;
    	let code3;
    	let t226;
    	let article10;
    	let figure4;
    	let figcaption4;
    	let h323;
    	let t228;
    	let pre4;
    	let code4;
    	let t229;
    	let div18;
    	let form;
    	let t230;
    	let t231;
    	let t232;
    	let t233;
    	let t234;
    	let button0;
    	let t236;
    	let div17;
    	let p24;
    	let t238;
    	let p25;
    	let t240;
    	let p26;
    	let t242;
    	let button1;
    	let div18_class_value;
    	let article10_class_value;
    	let t244;
    	let div20;
    	let div19;
    	let h45;
    	let t245;
    	let h45_class_value;
    	let t246;
    	let p27;
    	let t247;
    	let p27_class_value;
    	let t248;
    	let span15;
    	let t249;
    	let span15_class_value;
    	let t250;
    	let h29;
    	let t252;
    	let figure5;
    	let figcaption5;
    	let h324;
    	let t254;
    	let pre5;
    	let code5;
    	let t255;
    	let div27;
    	let div26;
    	let div21;
    	let t257;
    	let div22;
    	let t259;
    	let div23;
    	let t261;
    	let div24;
    	let t263;
    	let div25;
    	let h46;
    	let t265;
    	let p28;
    	let t267;
    	let span16;
    	let t269;
    	let p29;
    	let t271;
    	let p30;
    	let t273;
    	let p31;
    	let t275;
    	let p32;
    	let t277;
    	let p33;
    	let t279;
    	let p34;
    	let current;
    	let dispose;

    	const field0 = new components_1({
    			props: {
    				classes: "",
    				name: "name",
    				value: /*name*/ ctx[6]
    			},
    			$$inline: true
    		});

    	const field1 = new components_1({
    			props: {
    				classes: "",
    				name: "email",
    				type: "email",
    				value: /*email*/ ctx[8]
    			},
    			$$inline: true
    		});

    	const field2 = new components_1({
    			props: {
    				name: "password",
    				type: "password",
    				value: /*password*/ ctx[9]
    			},
    			$$inline: true
    		});

    	const field3 = new components_1({
    			props: {
    				label: "Numberfield",
    				type: "number",
    				name: "number",
    				value: /*number*/ ctx[10]
    			},
    			$$inline: true
    		});

    	const field4 = new components_1({
    			props: {
    				name: "last_name",
    				value: /*lastName*/ ctx[7]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			section = element("section");
    			div15 = element("div");
    			article0 = element("article");
    			h30 = element("h3");
    			h30.textContent = "Row";
    			t1 = space();
    			div0 = element("div");
    			span0 = element("span");
    			span0.textContent = "A rowdddddd is full width and a vertically stacked container";
    			t3 = space();
    			span1 = element("span");
    			span1.textContent = "A row is full width and a vertically stacked container";
    			t5 = space();
    			span2 = element("span");
    			span2.textContent = "A row is full width and a vertically stacked container";
    			t7 = space();
    			article9 = element("article");
    			h1 = element("h1");
    			h1.textContent = "Philosophy";
    			t9 = space();
    			h20 = element("h2");
    			t10 = text("Relationships\n        ");
    			small0 = element("small");
    			span3 = element("span");
    			span3.textContent = "(Parent `x` & Children `_x` & Child '-x')";
    			t12 = space();
    			article1 = element("article");
    			h31 = element("h3");
    			h31.textContent = "Siblings";
    			t14 = space();
    			div1 = element("div");
    			span4 = element("span");
    			span4.textContent = "We have to ask ourselves this question";
    			t16 = space();
    			br = element("br");
    			t17 = space();
    			i = element("i");
    			i.textContent = "When do 2 elements really become siblings and belong to the same\n            parent";
    			t19 = space();
    			p0 = element("p");
    			p0.textContent = "It should be based on 1 thing:";
    			t21 = space();
    			ol0 = element("ol");
    			li0 = element("li");
    			li0.textContent = "Could this element remain if the above where to disappear or move?";
    			t23 = space();
    			p1 = element("p");
    			p1.textContent = "Once it is established that 2 elements are born together and die\n            together. We see they need to be under the same `parent`.";
    			t25 = space();
    			p2 = element("p");
    			p2.textContent = "This parent is a `container` of its children.";
    			t27 = space();
    			p3 = element("p");
    			p3.textContent = "The containers that can exist are:";
    			t29 = space();
    			ol1 = element("ol");
    			li1 = element("li");
    			li1.textContent = "- El";
    			t31 = space();
    			li2 = element("li");
    			li2.textContent = "- Rows";
    			t33 = space();
    			li3 = element("li");
    			li3.textContent = "- Blocks";
    			t35 = space();
    			li4 = element("li");
    			li4.textContent = "- Boxes";
    			t37 = space();
    			p4 = element("p");
    			p4.textContent = "The only other element is `Text` but it is never meant to be a\n            `container`";
    			t39 = space();
    			p5 = element("p");
    			p5.textContent = "The Main or Body tag acts as our `godfather`";
    			t41 = space();
    			p6 = element("p");
    			p6.textContent = "From it, we form our first children (section,header,footer) that\n            will be parents of their own if it be only containing 1 `text`\n            element.";
    			t43 = space();
    			p7 = element("p");
    			p7.textContent = "And it is the `text` that forms the fundamental building blocks and\n            therefore what we must discuss next.";
    			t45 = space();
    			article8 = element("article");
    			h32 = element("h3");
    			h32.textContent = "Visual Text (V)";
    			t47 = space();
    			div2 = element("div");
    			p8 = element("p");
    			strong = element("strong");
    			strong.textContent = "`Text`";
    			t49 = text("\n            is the most basic form of an element because it is the visual\n            content we want to see.");
    			t50 = space();
    			p9 = element("p");
    			p9.textContent = "It is comprised of 4 main characters:";
    			t52 = space();
    			ol2 = element("ol");
    			li5 = element("li");
    			li5.textContent = "- Size";
    			t54 = space();
    			li6 = element("li");
    			li6.textContent = "- Weight (100-900)";
    			t56 = space();
    			li7 = element("li");
    			li7.textContent = "- Spacing (X)";
    			t58 = space();
    			li8 = element("li");
    			li8.textContent = "- Height (Y)";
    			t60 = space();
    			li9 = element("li");
    			li9.textContent = "- Alignment(L C R)";
    			t62 = space();
    			p10 = element("p");
    			p10.textContent = "Other considerations are:";
    			t64 = space();
    			ol3 = element("ol");
    			li10 = element("li");
    			li10.textContent = "- Color";
    			t66 = space();
    			li11 = element("li");
    			li11.textContent = "- Style (Italic)";
    			t68 = space();
    			li12 = element("li");
    			li12.textContent = "- Case (Upper, Lower)";
    			t70 = space();
    			article2 = element("article");
    			h5 = element("h5");
    			h5.textContent = "Size";
    			t72 = space();
    			p11 = element("p");
    			p11.textContent = "A default \"root\" font-size is set at 12px and increases to 16px as\n              the screen size increases";
    			t74 = space();
    			p12 = element("p");
    			p12.textContent = "From here we go through this path of logic to reduce options down\n              to 2:";
    			t76 = space();
    			p13 = element("p");
    			p13.textContent = "If I don't want the default (or need to reset to default), do I\n              want larger or smaller?";
    			t78 = space();
    			p14 = element("p");
    			p14.textContent = "Then, do I want something much greater than the current value?";
    			t80 = space();
    			p15 = element("p");
    			p15.textContent = "This end a";
    			t82 = space();
    			iframe = element("iframe");
    			t83 = space();
    			span5 = element("span");
    			span5.textContent = "V__ text";
    			t85 = space();
    			span6 = element("span");
    			span6.textContent = "V_ text";
    			t87 = space();
    			span7 = element("span");
    			span7.textContent = "V-- text";
    			t89 = space();
    			span8 = element("span");
    			span8.textContent = "V- text";
    			t91 = space();
    			p16 = element("p");
    			span9 = element("span");
    			span9.textContent = "V Default text";
    			t93 = space();
    			span10 = element("span");
    			span10.textContent = "V+ text";
    			t95 = space();
    			span11 = element("span");
    			span11.textContent = "V+ text";
    			t97 = space();
    			span12 = element("span");
    			span12.textContent = "V* text";
    			t99 = space();
    			span13 = element("span");
    			span13.textContent = "V** text";
    			t101 = space();
    			hr0 = element("hr");
    			t102 = space();
    			div3 = element("div");
    			div3.textContent = "V__ text";
    			t104 = space();
    			div4 = element("div");
    			div4.textContent = "V_ text";
    			t106 = space();
    			div5 = element("div");
    			div5.textContent = "V-- text";
    			t108 = space();
    			div6 = element("div");
    			div6.textContent = "V- text";
    			t110 = space();
    			div7 = element("div");
    			div7.textContent = "V Default text";
    			t112 = space();
    			div8 = element("div");
    			div8.textContent = "V+ text";
    			t114 = space();
    			div9 = element("div");
    			div9.textContent = "V++ text";
    			t116 = space();
    			div10 = element("div");
    			div10.textContent = "V* text";
    			t118 = space();
    			div11 = element("div");
    			div11.textContent = "V** text";
    			t120 = space();
    			small1 = element("small");
    			div12 = element("div");
    			div12.textContent = "default text";
    			t122 = space();
    			big = element("big");
    			div13 = element("div");
    			div13.textContent = "default text";
    			t124 = space();
    			hr1 = element("hr");
    			t125 = space();
    			article3 = element("article");
    			h33 = element("h3");
    			h33.textContent = "Element";
    			t127 = space();
    			p17 = element("p");
    			p17.textContent = "A element becomes flex when layout is set. default row";
    			t129 = space();
    			p18 = element("p");
    			p18.textContent = "A row is full width and a vertically stacked container";
    			t131 = space();
    			article4 = element("article");
    			h34 = element("h3");
    			h34.textContent = "Row";
    			t133 = space();
    			div14 = element("div");
    			span14 = element("span");
    			span14.textContent = "A row is full width and a vertically stacked container";
    			t135 = space();
    			article5 = element("article");
    			h35 = element("h3");
    			h35.textContent = "Block";
    			t137 = space();
    			p19 = element("p");
    			p19.textContent = "A block is full width and a horizontally stacked container";
    			t139 = space();
    			h36 = element("h3");
    			h36.textContent = "Box, Grid and Containers";
    			t141 = space();
    			article6 = element("article");
    			h40 = element("h4");
    			h40.textContent = "Containers/Blocks (flex)?";
    			t143 = space();
    			p20 = element("p");
    			p20.textContent = "A container becomes flex when layout is set. default column";
    			t145 = space();
    			article7 = element("article");
    			h41 = element("h4");
    			h41.textContent = "Boxes and box items";
    			t147 = space();
    			p21 = element("p");
    			p21.textContent = "A box assumes it is dealing with blocks and so you have to declare\n            `el`";
    			t149 = space();
    			p22 = element("p");
    			p22.textContent = "A container assumes it is dealing with elements and so you have to\n            declare `block`";
    			t151 = space();
    			p23 = element("p");
    			p23.textContent = "Being a box item just does 5 things:";
    			t153 = space();
    			ul = element("ul");
    			li13 = element("li");
    			li13.textContent = "1. Display: block";
    			t155 = space();
    			li14 = element("li");
    			li14.textContent = "2. width: 100%";
    			t157 = space();
    			li15 = element("li");
    			li15.textContent = "3. Sets your min-width not to get smaller than an 256px";
    			t159 = space();
    			li16 = element("li");
    			li16.textContent = "4. Sets your max-width not to get larger than the box";
    			t161 = space();
    			li17 = element("li");
    			li17.textContent = "5. sets margins for the item appropriately";
    			t163 = space();
    			h42 = element("h4");
    			h42.textContent = "Grids and grid items";
    			t165 = space();
    			h21 = element("h2");
    			h21.textContent = "Sizing (Width/Padding/Margins)";
    			t167 = space();
    			h37 = element("h3");
    			h37.textContent = "Width & Height";
    			t169 = space();
    			h38 = element("h3");
    			h38.textContent = "Padding";
    			t171 = space();
    			h43 = element("h4");
    			h43.textContent = "Background of a block is the padding";
    			t173 = space();
    			h39 = element("h3");
    			h39.textContent = "Margin";
    			t175 = space();
    			h22 = element("h2");
    			h22.textContent = "Spacing (Layout/Position)";
    			t177 = space();
    			h310 = element("h3");
    			h310.textContent = "Center & All";
    			t179 = space();
    			h311 = element("h3");
    			h311.textContent = "X axis";
    			t181 = space();
    			h312 = element("h3");
    			h312.textContent = "Left and Right";
    			t183 = space();
    			h313 = element("h3");
    			h313.textContent = "Y axis";
    			t185 = space();
    			h44 = element("h4");
    			h44.textContent = "Top and Bottom";
    			t187 = space();
    			h23 = element("h2");
    			h23.textContent = "Breakpoints";
    			t189 = space();
    			h314 = element("h3");
    			h314.textContent = "A Block (8rem / 128px)";
    			t191 = space();
    			h315 = element("h3");
    			h315.textContent = "10 sizes of concern (128 to 1280)";
    			t193 = space();
    			h316 = element("h3");
    			h316.textContent = "The Cross Axises";
    			t195 = space();
    			h24 = element("h2");
    			h24.textContent = "Core Elements";
    			t197 = space();
    			h317 = element("h3");
    			h317.textContent = "Forms & Inputs";
    			t199 = space();
    			h318 = element("h3");
    			h318.textContent = "Buttons";
    			t201 = space();
    			h25 = element("h2");
    			h25.textContent = "The Defaults";
    			t203 = space();
    			h26 = element("h2");
    			h26.textContent = "FrontierCSS Structure";
    			t205 = space();
    			h27 = element("h2");
    			h27.textContent = "Misc";
    			t207 = space();
    			h6 = element("h6");
    			h6.textContent = "Backgrounds should padding auto applied";
    			t209 = space();
    			figure0 = element("figure");
    			figcaption0 = element("figcaption");
    			h319 = element("h3");
    			h319.textContent = "// Settings";
    			t211 = space();
    			pre0 = element("pre");
    			code0 = element("code");
    			code0.textContent = `${/*settingsCss*/ ctx[14]}`;
    			t213 = space();
    			figure1 = element("figure");
    			figcaption1 = element("figcaption");
    			h320 = element("h3");
    			h320.textContent = "// General";
    			t215 = space();
    			pre1 = element("pre");
    			code1 = element("code");
    			code1.textContent = `${/*generalCss*/ ctx[15]}`;
    			t217 = space();
    			figure2 = element("figure");
    			figcaption2 = element("figcaption");
    			h321 = element("h3");
    			h321.textContent = "// Components";
    			t219 = space();
    			pre2 = element("pre");
    			code2 = element("code");
    			code2.textContent = `${/*componentsCss*/ ctx[16]}`;
    			t221 = space();
    			div16 = element("div");
    			h28 = element("h2");
    			h28.textContent = "Child of box";
    			t223 = space();
    			figure3 = element("figure");
    			figcaption3 = element("figcaption");
    			h322 = element("h3");
    			h322.textContent = "Relationships";
    			t225 = space();
    			pre3 = element("pre");
    			code3 = element("code");
    			t226 = space();
    			article10 = element("article");
    			figure4 = element("figure");
    			figcaption4 = element("figcaption");
    			h323 = element("h3");
    			h323.textContent = "Child of box (I'm the article tag below)";
    			t228 = space();
    			pre4 = element("pre");
    			code4 = element("code");
    			t229 = space();
    			div18 = element("div");
    			form = element("form");
    			create_component(field0.$$.fragment);
    			t230 = space();
    			create_component(field1.$$.fragment);
    			t231 = space();
    			create_component(field2.$$.fragment);
    			t232 = space();
    			create_component(field3.$$.fragment);
    			t233 = space();
    			create_component(field4.$$.fragment);
    			t234 = space();
    			button0 = element("button");
    			button0.textContent = "Sign Up";
    			t236 = space();
    			div17 = element("div");
    			p24 = element("p");
    			p24.textContent = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Hic dolore\n          officiis ducimus reprehenderit optio aliquam repellendus architecto\n          odio maiores. Itaque adipisci nam laboriosam doloribus assumenda totam\n          at voluptates commodi minima?";
    			t238 = space();
    			p25 = element("p");
    			p25.textContent = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Hic dolore\n          officiis ducimus reprehenderit optio aliquam repellendus architecto\n          odio maiores. Itaque adipisci nam laboriosam doloribus assumenda totam\n          at voluptates commodi minima?";
    			t240 = space();
    			p26 = element("p");
    			p26.textContent = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Hic dolore\n          officiis ducimus reprehenderit optio aliquam repellendus architecto\n          odio maiores. Itaque adipisci nam laboriosam doloribus assumenda totam\n          at voluptates commodi minima?";
    			t242 = space();
    			button1 = element("button");
    			button1.textContent = "More Info";
    			t244 = space();
    			div20 = element("div");
    			div19 = element("div");
    			h45 = element("h4");
    			t245 = text("Header 4");
    			t246 = space();
    			p27 = element("p");
    			t247 = text("Paragraph");
    			t248 = space();
    			span15 = element("span");
    			t249 = text("span");
    			t250 = space();
    			h29 = element("h2");
    			h29.textContent = "Working with Inline Text";
    			t252 = space();
    			figure5 = element("figure");
    			figcaption5 = element("figcaption");
    			h324 = element("h3");
    			h324.textContent = "Text";
    			t254 = space();
    			pre5 = element("pre");
    			code5 = element("code");
    			t255 = space();
    			div27 = element("div");
    			div26 = element("div");
    			div21 = element("div");
    			div21.textContent = "-x";
    			t257 = space();
    			div22 = element("div");
    			div22.textContent = "-l";
    			t259 = space();
    			div23 = element("div");
    			div23.textContent = "-r _c";
    			t261 = space();
    			div24 = element("div");
    			div24.textContent = "-c el _c";
    			t263 = space();
    			div25 = element("div");
    			h46 = element("h4");
    			h46.textContent = "Header 4 -r";
    			t265 = space();
    			p28 = element("p");
    			p28.textContent = "Paragraph";
    			t267 = space();
    			span16 = element("span");
    			span16.textContent = "span";
    			t269 = space();
    			p29 = element("p");
    			p29.textContent = ".box.x";
    			t271 = space();
    			p30 = element("p");
    			p30.textContent = ".box.x@$bp";
    			t273 = space();
    			p31 = element("p");
    			p31.textContent = ".box.-x > *";
    			t275 = space();
    			p32 = element("p");
    			p32.textContent = ".box.-x@$bp > *";
    			t277 = space();
    			p33 = element("p");
    			p33.textContent = ".box > ._x";
    			t279 = space();
    			p34 = element("p");
    			p34.textContent = ".box > ._x@$bp";
    			add_location(h30, file$d, 146, 6, 4327);
    			attr_dev(span0, "class", "");
    			add_location(span0, file$d, 148, 8, 4374);
    			add_location(span1, file$d, 151, 8, 4485);
    			add_location(span2, file$d, 152, 8, 4561);
    			attr_dev(div0, "class", "row c");
    			add_location(div0, file$d, 147, 6, 4346);
    			attr_dev(article0, "debug", "");
    			add_location(article0, file$d, 145, 4, 4305);
    			attr_dev(h1, "class", "vx++");
    			add_location(h1, file$d, 156, 6, 4705);
    			attr_dev(span3, "class", "v-");
    			add_location(span3, file$d, 160, 10, 4806);
    			add_location(small0, file$d, 159, 8, 4788);
    			attr_dev(h20, "class", "");
    			add_location(h20, file$d, 157, 6, 4744);
    			add_location(h31, file$d, 164, 8, 4934);
    			add_location(span4, file$d, 166, 10, 4976);
    			add_location(br, file$d, 167, 10, 5038);
    			attr_dev(i, "class", "py fw600");
    			add_location(i, file$d, 168, 10, 5055);
    			attr_dev(p0, "class", "");
    			add_location(p0, file$d, 172, 10, 5197);
    			add_location(li0, file$d, 174, 12, 5280);
    			attr_dev(ol0, "class", "");
    			add_location(ol0, file$d, 173, 10, 5254);
    			add_location(p1, file$d, 178, 10, 5410);
    			add_location(p2, file$d, 182, 10, 5586);
    			add_location(p3, file$d, 183, 10, 5649);
    			add_location(li1, file$d, 185, 12, 5729);
    			add_location(li2, file$d, 186, 12, 5755);
    			add_location(li3, file$d, 187, 12, 5783);
    			add_location(li4, file$d, 188, 12, 5813);
    			attr_dev(ol1, "class", "pl");
    			add_location(ol1, file$d, 184, 10, 5701);
    			add_location(p4, file$d, 190, 10, 5856);
    			add_location(p5, file$d, 194, 10, 5984);
    			add_location(p6, file$d, 195, 10, 6046);
    			add_location(p7, file$d, 200, 10, 6248);
    			add_location(div1, file$d, 165, 8, 4960);
    			attr_dev(article1, "class", "");
    			add_location(article1, file$d, 163, 6, 4907);
    			attr_dev(h32, "class", "hide v_");
    			add_location(h32, file$d, 207, 8, 6452);
    			add_location(strong, file$d, 210, 12, 6565);
    			attr_dev(p8, "class", "v+ py px** mx*");
    			add_location(p8, file$d, 209, 10, 6526);
    			add_location(p9, file$d, 214, 10, 6724);
    			add_location(li5, file$d, 216, 12, 6807);
    			add_location(li6, file$d, 217, 12, 6835);
    			add_location(li7, file$d, 218, 12, 6875);
    			add_location(li8, file$d, 219, 12, 6910);
    			add_location(li9, file$d, 220, 12, 6944);
    			attr_dev(ol2, "class", "pl");
    			add_location(ol2, file$d, 215, 10, 6779);
    			add_location(p10, file$d, 222, 10, 6998);
    			add_location(li10, file$d, 224, 12, 7069);
    			add_location(li11, file$d, 225, 12, 7098);
    			add_location(li12, file$d, 226, 12, 7136);
    			attr_dev(ol3, "class", "pl");
    			add_location(ol3, file$d, 223, 10, 7041);
    			attr_dev(h5, "class", "mt");
    			add_location(h5, file$d, 229, 12, 7215);
    			add_location(p11, file$d, 230, 12, 7252);
    			add_location(p12, file$d, 234, 12, 7406);
    			add_location(p13, file$d, 238, 12, 7539);
    			add_location(p14, file$d, 242, 12, 7688);
    			add_location(p15, file$d, 246, 12, 7799);
    			attr_dev(iframe, "class", "w@md");
    			attr_dev(iframe, "frameborder", "0");
    			set_style(iframe, "width", "100%");
    			set_style(iframe, "height", "668px");
    			if (iframe.src !== (iframe_src_value = "https://app.diagrams.net?lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=FCSS#R5ZpZc5s6FMc%2FjV8y4zssZvFjbSdt76TTTtNO06eMDMKoEchXCC%2F59JVAGLCw69x6AeclQUfLQT%2FJ%2FyMJ9cxxtHpPwTz8RHyIe4bmr3rmpGcYuu4a%2FJ%2BwrHOLM7Bzw4wiXxYqDQ%2FoBUqjJq0p8mFSK8gIwQzN60aPxDH0WM0GKCXLerGA4LrXOZhBxfDgAaxafyCfhUW%2FNK3M%2BADRLJSuXUtmRKAoLA1JCHyyrJjM2545poSw%2FClajSEW8Aoueb27HbmbF6MwZodUmNyRfno3%2Fka%2F9SPP%2Ffrzw%2FjzqG%2FmrSwATmWH5cuydUEA%2BhyITBLKQjIjMcC3pXVESRr7ULjReKosc0%2FInBt1bvwFGVvL0QUpI9wUsgjLXLUrsncJSakH97x%2FMSUAnUG2p5zsluhLxYEE9R6SCDK65gUoxIChRX3wgZxDs025EjN%2FkKRfQd1%2BI9StVlHXFeo%2FAO851yYYgBSLpyRjdaeMRp31MkQMPsxBxmjJda%2FONUAYjwkmNKtr%2BgC6gcftCaPkGVZybM%2BF02DfSCwgZXC1l53MdaXKSJkd2JL9siJahRKFFb2ytVPR1jo%2Bya0DJ%2FmwXZPcfSPYdadV3C0F%2B73oAT22mgRBYHiNauLbU9uyj6MmptM2OTE6HzOdQ5cq7YqahnMJznCF2GPl%2Bado6h9LpiYr2XKWWBeJmPf3sZqo1BLJslqWKuqdY0y1Vo1p8d6VH9On1Au55SECGHdVtWyrdaqlhoXvCewZNl9tmqMp5U8z8bR4Et5jXxR9ejoqet%2BCrj9oQu8aU9M%2BEXpbuzh6df3ZjL5fou%2F3O4jeHbRt1utGx2P18EBZ1%2FV2yfrgrXA3W8V9uCuaXtMWwCjSl5MV9bCyWdFvSkW%2Fuemgom%2Bj182Lo1fPzprR94xRCT9LjDo4ANawbXNfjaiLDnJ127ZIVAPmGiYKWN47VqcHMJrF%2FNnjLITAjwQD5AH8TmZEyPfzaAoT9AKmWVNiWOYExSzrhjXqWRPRFg%2Bg%2Bbnz%2Fuh5OGZ9a0VoWSrnQQNm41SY1e1mTDpP2Sg2d8W621Epm%2BekrKubzSvAbJlbWuyqWnxezOpJ5DWIxmCbc8Oi46yioavL6muYztu79UurhnGdMdDRWxYDDfXD3BVMZ2d4uek88tPn%2B3%2BTycfH7y%2B%2FJu4Caeuw4SN%2FS2azwrSB%2FMHiPNDOJ86NmNX9SLEZ9NGixtr%2BLxU3nEYBiVk%2Fp%2FKOF9Cd%2BarMFK8oOZdGDANWLZJvMQs%2For3%2F4yhv5QvynlE84%2Fks5PtYjWbM5AUQcU1MNJ474nxksuafm7Ou1q3d6H0iv%2FIYGhF%2FcHlMtb2h3225QizZpxcbRGKrHE%2BTeZ61ldYOKJLzTZhKb3GAh79Na5vhVb919I%2FZweaPKUdov9lf43HTqWEqr7K5LNZ89nV0f%2BLHucvZofV3HJKenJUUlgbnR%2FCet970I3ulRG2tDf5wcAaSeX7POEArcdi2WTlkynScaF8P9g0b3o2tFuzd10d7nixvIGd5lXvc5u1v")) attr_dev(iframe, "src", iframe_src_value);
    			add_location(iframe, file$d, 247, 12, 7829);
    			add_location(article2, file$d, 228, 10, 7193);
    			attr_dev(div2, "class", "");
    			add_location(div2, file$d, 208, 8, 6501);
    			attr_dev(span5, "class", "v__");
    			add_location(span5, file$d, 255, 8, 9734);
    			attr_dev(span6, "class", "v_");
    			add_location(span6, file$d, 256, 8, 9776);
    			attr_dev(span7, "class", "v--");
    			add_location(span7, file$d, 257, 8, 9816);
    			attr_dev(span8, "class", "v-");
    			add_location(span8, file$d, 258, 8, 9858);
    			attr_dev(span9, "class", "v");
    			add_location(span9, file$d, 260, 10, 9912);
    			add_location(p16, file$d, 259, 8, 9898);
    			attr_dev(span10, "class", "v+");
    			add_location(span10, file$d, 262, 8, 9971);
    			attr_dev(span11, "class", "v++");
    			add_location(span11, file$d, 263, 8, 10011);
    			attr_dev(span12, "class", "v*");
    			add_location(span12, file$d, 264, 8, 10052);
    			attr_dev(span13, "class", "v**");
    			add_location(span13, file$d, 265, 8, 10092);
    			add_location(hr0, file$d, 266, 8, 10134);
    			attr_dev(div3, "class", "v__");
    			add_location(div3, file$d, 267, 8, 10149);
    			attr_dev(div4, "class", "v_");
    			add_location(div4, file$d, 268, 8, 10189);
    			attr_dev(div5, "class", "v--");
    			add_location(div5, file$d, 269, 8, 10227);
    			attr_dev(div6, "class", "v-");
    			add_location(div6, file$d, 270, 8, 10267);
    			attr_dev(div7, "class", "v");
    			add_location(div7, file$d, 271, 8, 10305);
    			attr_dev(div8, "class", "v+");
    			add_location(div8, file$d, 272, 8, 10349);
    			attr_dev(div9, "class", "v++");
    			add_location(div9, file$d, 273, 8, 10387);
    			attr_dev(div10, "class", "v*");
    			add_location(div10, file$d, 274, 8, 10427);
    			attr_dev(div11, "class", "v**");
    			add_location(div11, file$d, 275, 8, 10465);
    			attr_dev(div12, "class", "v** v700");
    			add_location(div12, file$d, 277, 10, 10523);
    			add_location(small1, file$d, 276, 8, 10505);
    			attr_dev(div13, "class", "v** v700 m__ ");
    			add_location(div13, file$d, 280, 10, 10605);
    			add_location(big, file$d, 279, 8, 10589);
    			add_location(hr1, file$d, 282, 8, 10674);
    			add_location(h33, file$d, 284, 10, 10709);
    			add_location(p17, file$d, 285, 10, 10736);
    			add_location(p18, file$d, 286, 10, 10808);
    			add_location(article3, file$d, 283, 8, 10689);
    			add_location(h34, file$d, 289, 10, 10917);
    			add_location(span14, file$d, 291, 12, 10972);
    			attr_dev(div14, "class", "row c");
    			add_location(div14, file$d, 290, 10, 10940);
    			add_location(article4, file$d, 288, 8, 10897);
    			attr_dev(h35, "class", "");
    			add_location(h35, file$d, 295, 10, 11104);
    			add_location(p19, file$d, 296, 10, 11138);
    			add_location(article5, file$d, 294, 8, 11084);
    			add_location(h36, file$d, 298, 8, 11231);
    			add_location(h40, file$d, 300, 10, 11293);
    			add_location(p20, file$d, 301, 10, 11338);
    			add_location(article6, file$d, 299, 8, 11273);
    			add_location(h41, file$d, 304, 10, 11452);
    			add_location(p21, file$d, 305, 10, 11491);
    			add_location(p22, file$d, 309, 10, 11616);
    			add_location(p23, file$d, 313, 10, 11752);
    			attr_dev(li13, "class", "el -l");
    			add_location(li13, file$d, 315, 12, 11840);
    			add_location(li14, file$d, 316, 12, 11893);
    			add_location(li15, file$d, 317, 12, 11929);
    			add_location(li16, file$d, 318, 12, 12006);
    			add_location(li17, file$d, 319, 12, 12081);
    			attr_dev(ul, "class", "block -c");
    			add_location(ul, file$d, 314, 10, 11806);
    			add_location(article7, file$d, 303, 8, 11432);
    			add_location(h42, file$d, 322, 8, 12176);
    			add_location(h21, file$d, 323, 8, 12214);
    			add_location(h37, file$d, 324, 8, 12262);
    			add_location(h38, file$d, 325, 8, 12294);
    			add_location(h43, file$d, 326, 8, 12319);
    			add_location(h39, file$d, 327, 8, 12373);
    			add_location(h22, file$d, 328, 8, 12397);
    			add_location(h310, file$d, 329, 8, 12440);
    			add_location(h311, file$d, 330, 8, 12470);
    			add_location(h312, file$d, 331, 8, 12494);
    			add_location(h313, file$d, 332, 8, 12526);
    			add_location(h44, file$d, 333, 8, 12550);
    			add_location(h23, file$d, 334, 8, 12582);
    			add_location(h314, file$d, 335, 8, 12611);
    			add_location(h315, file$d, 336, 8, 12651);
    			add_location(h316, file$d, 337, 8, 12702);
    			add_location(h24, file$d, 338, 8, 12736);
    			add_location(h317, file$d, 339, 8, 12767);
    			add_location(h318, file$d, 340, 8, 12799);
    			add_location(h25, file$d, 341, 8, 12824);
    			add_location(h26, file$d, 342, 8, 12854);
    			add_location(h27, file$d, 343, 8, 12893);
    			add_location(h6, file$d, 344, 8, 12915);
    			add_location(article8, file$d, 206, 6, 6434);
    			attr_dev(article9, "class", "table-contents _mb_");
    			add_location(article9, file$d, 155, 4, 4661);
    			attr_dev(div15, "class", "reader");
    			add_location(div15, file$d, 144, 2, 4280);
    			add_location(h319, file$d, 350, 6, 13095);
    			attr_dev(figcaption0, "class", "ce_caption");
    			add_location(figcaption0, file$d, 349, 4, 13057);
    			attr_dev(code0, "contenteditable", "");
    			attr_dev(code0, "spellcheck", "false");
    			attr_dev(code0, "class", "language-css");
    			add_location(code0, file$d, 353, 6, 13165);
    			attr_dev(pre0, "class", "ce_pre");
    			add_location(pre0, file$d, 352, 4, 13138);
    			attr_dev(figure0, "class", "ce ce-lift ce-twist");
    			add_location(figure0, file$d, 348, 2, 13007);
    			add_location(h320, file$d, 360, 6, 13377);
    			attr_dev(figcaption1, "class", "ce_caption");
    			add_location(figcaption1, file$d, 359, 4, 13339);
    			attr_dev(code1, "contenteditable", "");
    			attr_dev(code1, "spellcheck", "false");
    			attr_dev(code1, "class", "language-css");
    			add_location(code1, file$d, 363, 6, 13446);
    			attr_dev(pre1, "class", "ce_pre");
    			add_location(pre1, file$d, 362, 4, 13419);
    			attr_dev(figure1, "class", "ce ce-lift ce-twist");
    			add_location(figure1, file$d, 358, 2, 13289);
    			add_location(h321, file$d, 371, 6, 13658);
    			attr_dev(figcaption2, "class", "ce_caption");
    			add_location(figcaption2, file$d, 370, 4, 13620);
    			attr_dev(code2, "contenteditable", "");
    			attr_dev(code2, "spellcheck", "false");
    			attr_dev(code2, "class", "language-css");
    			add_location(code2, file$d, 374, 6, 13730);
    			attr_dev(pre2, "class", "ce_pre");
    			add_location(pre2, file$d, 373, 4, 13703);
    			attr_dev(figure2, "class", "ce ce-lift ce-twist");
    			add_location(figure2, file$d, 369, 2, 13570);
    			attr_dev(h28, "class", "_c");
    			add_location(h28, file$d, 382, 4, 13949);
    			add_location(h322, file$d, 385, 8, 14093);
    			attr_dev(figcaption3, "class", "ce_caption");
    			add_location(figcaption3, file$d, 384, 6, 14053);
    			attr_dev(code3, "contenteditable", "");
    			attr_dev(code3, "spellcheck", "false");
    			attr_dev(code3, "class", "language-html");
    			if (/*parentEx*/ ctx[3] === void 0) add_render_callback(() => /*code3_input_handler*/ ctx[20].call(code3));
    			add_location(code3, file$d, 388, 8, 14171);
    			attr_dev(pre3, "class", "ce_pre");
    			add_location(pre3, file$d, 387, 6, 14142);
    			attr_dev(figure3, "class", "ce ce-lift ce-twist");
    			set_style(figure3, "min-width", "356px");
    			add_location(figure3, file$d, 383, 4, 13986);
    			attr_dev(div16, "class", "grid");
    			set_style(div16, "background-color", "#d4edda");
    			set_style(div16, "border", "3px solid #c3e6cb");
    			add_location(div16, file$d, 379, 2, 13856);
    			add_location(h323, file$d, 400, 8, 14526);
    			attr_dev(figcaption4, "class", "ce_caption");
    			add_location(figcaption4, file$d, 399, 6, 14486);
    			attr_dev(code4, "contenteditable", "");
    			attr_dev(code4, "spellcheck", "false");
    			attr_dev(code4, "class", "language-html");
    			if (/*childEx*/ ctx[2] === void 0) add_render_callback(() => /*code4_input_handler*/ ctx[21].call(code4));
    			add_location(code4, file$d, 403, 8, 14631);
    			attr_dev(pre4, "class", "ce_pre");
    			add_location(pre4, file$d, 402, 6, 14602);
    			attr_dev(figure4, "class", "ce ce-lift ce-twist");
    			set_style(figure4, "width", "100%");
    			set_style(figure4, "max-width", "100%");
    			add_location(figure4, file$d, 398, 4, 14406);
    			attr_dev(button0, "class", "");
    			add_location(button0, file$d, 418, 8, 15255);
    			set_style(form, "min-width", "500px");
    			add_location(form, file$d, 412, 6, 14893);
    			add_location(p24, file$d, 426, 8, 15435);
    			add_location(p25, file$d, 432, 8, 15738);
    			add_location(p26, file$d, 438, 8, 16041);
    			add_location(div17, file$d, 425, 6, 15421);
    			attr_dev(button1, "class", "_r");
    			add_location(button1, file$d, 445, 6, 16355);
    			attr_dev(div18, "class", div18_class_value = "" + (null_to_empty(/*formClass*/ ctx[1]) + " svelte-1kes8qr"));
    			set_style(div18, "background-color", "#cce5ff");
    			add_location(div18, file$d, 411, 4, 14828);
    			attr_dev(article10, "class", article10_class_value = "" + (null_to_empty(/*cClass*/ ctx[0]) + " svelte-1kes8qr"));
    			add_location(article10, file$d, 397, 2, 14377);
    			attr_dev(h45, "class", h45_class_value = "" + (null_to_empty(/*textClass*/ ctx[4]) + " svelte-1kes8qr"));
    			add_location(h45, file$d, 456, 6, 16626);
    			attr_dev(p27, "class", p27_class_value = "" + (null_to_empty(/*textClass*/ ctx[4]) + " svelte-1kes8qr"));
    			add_location(p27, file$d, 457, 6, 16668);
    			attr_dev(span15, "class", span15_class_value = "" + (null_to_empty(/*textClass*/ ctx[4]) + " svelte-1kes8qr"));
    			add_location(span15, file$d, 458, 6, 16709);
    			attr_dev(div19, "class", "m -p-lg");
    			set_style(div19, "background-color", "white");
    			add_location(div19, file$d, 455, 4, 16566);
    			attr_dev(h29, "class", "_c");
    			add_location(h29, file$d, 460, 4, 16760);
    			add_location(h324, file$d, 463, 8, 16916);
    			attr_dev(figcaption5, "class", "ce_caption");
    			add_location(figcaption5, file$d, 462, 6, 16876);
    			attr_dev(code5, "contenteditable", "");
    			attr_dev(code5, "spellcheck", "false");
    			attr_dev(code5, "class", "language-html");
    			if (/*textEx*/ ctx[5] === void 0) add_render_callback(() => /*code5_input_handler*/ ctx[24].call(code5));
    			add_location(code5, file$d, 466, 8, 16985);
    			attr_dev(pre5, "class", "ce_pre");
    			add_location(pre5, file$d, 465, 6, 16956);
    			attr_dev(figure5, "class", "ce ce-lift ce-twist");
    			set_style(figure5, "min-width", "356px");
    			add_location(figure5, file$d, 461, 4, 16809);
    			set_style(div20, "background-color", "#fff3cd");
    			add_location(div20, file$d, 454, 2, 16522);
    			attr_dev(div21, "class", "-x obj svelte-1kes8qr");
    			add_location(div21, file$d, 478, 6, 17236);
    			attr_dev(div22, "class", "-l obj svelte-1kes8qr");
    			add_location(div22, file$d, 479, 6, 17271);
    			attr_dev(div23, "class", "-r obj svelte-1kes8qr");
    			add_location(div23, file$d, 480, 6, 17306);
    			attr_dev(div24, "class", "el -c obj _c svelte-1kes8qr");
    			add_location(div24, file$d, 481, 6, 17344);
    			attr_dev(h46, "class", "el _r");
    			add_location(h46, file$d, 483, 8, 17422);
    			attr_dev(p28, "class", "el _x");
    			add_location(p28, file$d, 484, 8, 17465);
    			attr_dev(span16, "class", "el _c");
    			add_location(span16, file$d, 485, 8, 17504);
    			add_location(p29, file$d, 486, 8, 17544);
    			add_location(p30, file$d, 487, 8, 17566);
    			add_location(p31, file$d, 488, 8, 17592);
    			add_location(p32, file$d, 489, 8, 17619);
    			add_location(p33, file$d, 490, 8, 17650);
    			add_location(p34, file$d, 491, 8, 17676);
    			attr_dev(div25, "class", "x border");
    			add_location(div25, file$d, 482, 6, 17391);
    			attr_dev(div26, "class", "box border mb -pb");
    			add_location(div26, file$d, 477, 4, 17198);
    			add_location(div27, file$d, 476, 2, 17188);
    			set_style(section, "background-color", "#bada55");
    			attr_dev(section, "class", "box x");
    			add_location(section, file$d, 99, 0, 2543);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, section, anchor);
    			append_dev(section, div15);
    			append_dev(div15, article0);
    			append_dev(article0, h30);
    			append_dev(article0, t1);
    			append_dev(article0, div0);
    			append_dev(div0, span0);
    			append_dev(div0, t3);
    			append_dev(div0, span1);
    			append_dev(div0, t5);
    			append_dev(div0, span2);
    			append_dev(div15, t7);
    			append_dev(div15, article9);
    			append_dev(article9, h1);
    			append_dev(article9, t9);
    			append_dev(article9, h20);
    			append_dev(h20, t10);
    			append_dev(h20, small0);
    			append_dev(small0, span3);
    			append_dev(article9, t12);
    			append_dev(article9, article1);
    			append_dev(article1, h31);
    			append_dev(article1, t14);
    			append_dev(article1, div1);
    			append_dev(div1, span4);
    			append_dev(div1, t16);
    			append_dev(div1, br);
    			append_dev(div1, t17);
    			append_dev(div1, i);
    			append_dev(div1, t19);
    			append_dev(div1, p0);
    			append_dev(div1, t21);
    			append_dev(div1, ol0);
    			append_dev(ol0, li0);
    			append_dev(div1, t23);
    			append_dev(div1, p1);
    			append_dev(div1, t25);
    			append_dev(div1, p2);
    			append_dev(div1, t27);
    			append_dev(div1, p3);
    			append_dev(div1, t29);
    			append_dev(div1, ol1);
    			append_dev(ol1, li1);
    			append_dev(ol1, t31);
    			append_dev(ol1, li2);
    			append_dev(ol1, t33);
    			append_dev(ol1, li3);
    			append_dev(ol1, t35);
    			append_dev(ol1, li4);
    			append_dev(div1, t37);
    			append_dev(div1, p4);
    			append_dev(div1, t39);
    			append_dev(div1, p5);
    			append_dev(div1, t41);
    			append_dev(div1, p6);
    			append_dev(div1, t43);
    			append_dev(div1, p7);
    			append_dev(article9, t45);
    			append_dev(article9, article8);
    			append_dev(article8, h32);
    			append_dev(article8, t47);
    			append_dev(article8, div2);
    			append_dev(div2, p8);
    			append_dev(p8, strong);
    			append_dev(p8, t49);
    			append_dev(div2, t50);
    			append_dev(div2, p9);
    			append_dev(div2, t52);
    			append_dev(div2, ol2);
    			append_dev(ol2, li5);
    			append_dev(ol2, t54);
    			append_dev(ol2, li6);
    			append_dev(ol2, t56);
    			append_dev(ol2, li7);
    			append_dev(ol2, t58);
    			append_dev(ol2, li8);
    			append_dev(ol2, t60);
    			append_dev(ol2, li9);
    			append_dev(div2, t62);
    			append_dev(div2, p10);
    			append_dev(div2, t64);
    			append_dev(div2, ol3);
    			append_dev(ol3, li10);
    			append_dev(ol3, t66);
    			append_dev(ol3, li11);
    			append_dev(ol3, t68);
    			append_dev(ol3, li12);
    			append_dev(div2, t70);
    			append_dev(div2, article2);
    			append_dev(article2, h5);
    			append_dev(article2, t72);
    			append_dev(article2, p11);
    			append_dev(article2, t74);
    			append_dev(article2, p12);
    			append_dev(article2, t76);
    			append_dev(article2, p13);
    			append_dev(article2, t78);
    			append_dev(article2, p14);
    			append_dev(article2, t80);
    			append_dev(article2, p15);
    			append_dev(article2, t82);
    			append_dev(article2, iframe);
    			append_dev(article8, t83);
    			append_dev(article8, span5);
    			append_dev(article8, t85);
    			append_dev(article8, span6);
    			append_dev(article8, t87);
    			append_dev(article8, span7);
    			append_dev(article8, t89);
    			append_dev(article8, span8);
    			append_dev(article8, t91);
    			append_dev(article8, p16);
    			append_dev(p16, span9);
    			append_dev(article8, t93);
    			append_dev(article8, span10);
    			append_dev(article8, t95);
    			append_dev(article8, span11);
    			append_dev(article8, t97);
    			append_dev(article8, span12);
    			append_dev(article8, t99);
    			append_dev(article8, span13);
    			append_dev(article8, t101);
    			append_dev(article8, hr0);
    			append_dev(article8, t102);
    			append_dev(article8, div3);
    			append_dev(article8, t104);
    			append_dev(article8, div4);
    			append_dev(article8, t106);
    			append_dev(article8, div5);
    			append_dev(article8, t108);
    			append_dev(article8, div6);
    			append_dev(article8, t110);
    			append_dev(article8, div7);
    			append_dev(article8, t112);
    			append_dev(article8, div8);
    			append_dev(article8, t114);
    			append_dev(article8, div9);
    			append_dev(article8, t116);
    			append_dev(article8, div10);
    			append_dev(article8, t118);
    			append_dev(article8, div11);
    			append_dev(article8, t120);
    			append_dev(article8, small1);
    			append_dev(small1, div12);
    			append_dev(article8, t122);
    			append_dev(article8, big);
    			append_dev(big, div13);
    			append_dev(article8, t124);
    			append_dev(article8, hr1);
    			append_dev(article8, t125);
    			append_dev(article8, article3);
    			append_dev(article3, h33);
    			append_dev(article3, t127);
    			append_dev(article3, p17);
    			append_dev(article3, t129);
    			append_dev(article3, p18);
    			append_dev(article8, t131);
    			append_dev(article8, article4);
    			append_dev(article4, h34);
    			append_dev(article4, t133);
    			append_dev(article4, div14);
    			append_dev(div14, span14);
    			append_dev(article8, t135);
    			append_dev(article8, article5);
    			append_dev(article5, h35);
    			append_dev(article5, t137);
    			append_dev(article5, p19);
    			append_dev(article8, t139);
    			append_dev(article8, h36);
    			append_dev(article8, t141);
    			append_dev(article8, article6);
    			append_dev(article6, h40);
    			append_dev(article6, t143);
    			append_dev(article6, p20);
    			append_dev(article8, t145);
    			append_dev(article8, article7);
    			append_dev(article7, h41);
    			append_dev(article7, t147);
    			append_dev(article7, p21);
    			append_dev(article7, t149);
    			append_dev(article7, p22);
    			append_dev(article7, t151);
    			append_dev(article7, p23);
    			append_dev(article7, t153);
    			append_dev(article7, ul);
    			append_dev(ul, li13);
    			append_dev(ul, t155);
    			append_dev(ul, li14);
    			append_dev(ul, t157);
    			append_dev(ul, li15);
    			append_dev(ul, t159);
    			append_dev(ul, li16);
    			append_dev(ul, t161);
    			append_dev(ul, li17);
    			append_dev(article8, t163);
    			append_dev(article8, h42);
    			append_dev(article8, t165);
    			append_dev(article8, h21);
    			append_dev(article8, t167);
    			append_dev(article8, h37);
    			append_dev(article8, t169);
    			append_dev(article8, h38);
    			append_dev(article8, t171);
    			append_dev(article8, h43);
    			append_dev(article8, t173);
    			append_dev(article8, h39);
    			append_dev(article8, t175);
    			append_dev(article8, h22);
    			append_dev(article8, t177);
    			append_dev(article8, h310);
    			append_dev(article8, t179);
    			append_dev(article8, h311);
    			append_dev(article8, t181);
    			append_dev(article8, h312);
    			append_dev(article8, t183);
    			append_dev(article8, h313);
    			append_dev(article8, t185);
    			append_dev(article8, h44);
    			append_dev(article8, t187);
    			append_dev(article8, h23);
    			append_dev(article8, t189);
    			append_dev(article8, h314);
    			append_dev(article8, t191);
    			append_dev(article8, h315);
    			append_dev(article8, t193);
    			append_dev(article8, h316);
    			append_dev(article8, t195);
    			append_dev(article8, h24);
    			append_dev(article8, t197);
    			append_dev(article8, h317);
    			append_dev(article8, t199);
    			append_dev(article8, h318);
    			append_dev(article8, t201);
    			append_dev(article8, h25);
    			append_dev(article8, t203);
    			append_dev(article8, h26);
    			append_dev(article8, t205);
    			append_dev(article8, h27);
    			append_dev(article8, t207);
    			append_dev(article8, h6);
    			append_dev(section, t209);
    			append_dev(section, figure0);
    			append_dev(figure0, figcaption0);
    			append_dev(figcaption0, h319);
    			append_dev(figure0, t211);
    			append_dev(figure0, pre0);
    			append_dev(pre0, code0);
    			append_dev(section, t213);
    			append_dev(section, figure1);
    			append_dev(figure1, figcaption1);
    			append_dev(figcaption1, h320);
    			append_dev(figure1, t215);
    			append_dev(figure1, pre1);
    			append_dev(pre1, code1);
    			append_dev(section, t217);
    			append_dev(section, figure2);
    			append_dev(figure2, figcaption2);
    			append_dev(figcaption2, h321);
    			append_dev(figure2, t219);
    			append_dev(figure2, pre2);
    			append_dev(pre2, code2);
    			append_dev(section, t221);
    			append_dev(section, div16);
    			append_dev(div16, h28);
    			append_dev(div16, t223);
    			append_dev(div16, figure3);
    			append_dev(figure3, figcaption3);
    			append_dev(figcaption3, h322);
    			append_dev(figure3, t225);
    			append_dev(figure3, pre3);
    			append_dev(pre3, code3);

    			if (/*parentEx*/ ctx[3] !== void 0) {
    				code3.textContent = /*parentEx*/ ctx[3];
    			}

    			append_dev(section, t226);
    			append_dev(section, article10);
    			append_dev(article10, figure4);
    			append_dev(figure4, figcaption4);
    			append_dev(figcaption4, h323);
    			append_dev(figure4, t228);
    			append_dev(figure4, pre4);
    			append_dev(pre4, code4);

    			if (/*childEx*/ ctx[2] !== void 0) {
    				code4.textContent = /*childEx*/ ctx[2];
    			}

    			append_dev(article10, t229);
    			append_dev(article10, div18);
    			append_dev(div18, form);
    			mount_component(field0, form, null);
    			append_dev(form, t230);
    			mount_component(field1, form, null);
    			append_dev(form, t231);
    			mount_component(field2, form, null);
    			append_dev(form, t232);
    			mount_component(field3, form, null);
    			append_dev(form, t233);
    			mount_component(field4, form, null);
    			append_dev(form, t234);
    			append_dev(form, button0);
    			append_dev(div18, t236);
    			append_dev(div18, div17);
    			append_dev(div17, p24);
    			append_dev(div17, t238);
    			append_dev(div17, p25);
    			append_dev(div17, t240);
    			append_dev(div17, p26);
    			append_dev(div18, t242);
    			append_dev(div18, button1);
    			append_dev(section, t244);
    			append_dev(section, div20);
    			append_dev(div20, div19);
    			append_dev(div19, h45);
    			append_dev(h45, t245);
    			append_dev(div19, t246);
    			append_dev(div19, p27);
    			append_dev(p27, t247);
    			append_dev(div19, t248);
    			append_dev(div19, span15);
    			append_dev(span15, t249);
    			append_dev(div20, t250);
    			append_dev(div20, h29);
    			append_dev(div20, t252);
    			append_dev(div20, figure5);
    			append_dev(figure5, figcaption5);
    			append_dev(figcaption5, h324);
    			append_dev(figure5, t254);
    			append_dev(figure5, pre5);
    			append_dev(pre5, code5);

    			if (/*textEx*/ ctx[5] !== void 0) {
    				code5.textContent = /*textEx*/ ctx[5];
    			}

    			append_dev(section, t255);
    			append_dev(section, div27);
    			append_dev(div27, div26);
    			append_dev(div26, div21);
    			append_dev(div26, t257);
    			append_dev(div26, div22);
    			append_dev(div26, t259);
    			append_dev(div26, div23);
    			append_dev(div26, t261);
    			append_dev(div26, div24);
    			append_dev(div26, t263);
    			append_dev(div26, div25);
    			append_dev(div25, h46);
    			append_dev(div25, t265);
    			append_dev(div25, p28);
    			append_dev(div25, t267);
    			append_dev(div25, span16);
    			append_dev(div25, t269);
    			append_dev(div25, p29);
    			append_dev(div25, t271);
    			append_dev(div25, p30);
    			append_dev(div25, t273);
    			append_dev(div25, p31);
    			append_dev(div25, t275);
    			append_dev(div25, p32);
    			append_dev(div25, t277);
    			append_dev(div25, p33);
    			append_dev(div25, t279);
    			append_dev(div25, p34);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(code3, "input", /*code3_input_handler*/ ctx[20]),
    				listen_dev(code3, "keyup", /*updateParent*/ ctx[11], false, false, false),
    				listen_dev(code4, "input", /*code4_input_handler*/ ctx[21]),
    				listen_dev(code4, "keyup", /*updateChild*/ ctx[12], false, false, false),
    				listen_dev(button0, "mouseenter", checkForm$3, false, false, false),
    				listen_dev(button0, "click", /*click_handler*/ ctx[22], false, false, false),
    				listen_dev(button1, "mouseenter", checkForm$3, false, false, false),
    				listen_dev(button1, "click", /*click_handler_1*/ ctx[23], false, false, false),
    				listen_dev(code5, "input", /*code5_input_handler*/ ctx[24]),
    				listen_dev(code5, "keyup", /*updateText*/ ctx[13], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*parentEx*/ 8 && /*parentEx*/ ctx[3] !== code3.textContent) {
    				code3.textContent = /*parentEx*/ ctx[3];
    			}

    			if (dirty & /*childEx*/ 4 && /*childEx*/ ctx[2] !== code4.textContent) {
    				code4.textContent = /*childEx*/ ctx[2];
    			}

    			if (!current || dirty & /*formClass*/ 2 && div18_class_value !== (div18_class_value = "" + (null_to_empty(/*formClass*/ ctx[1]) + " svelte-1kes8qr"))) {
    				attr_dev(div18, "class", div18_class_value);
    			}

    			if (!current || dirty & /*cClass*/ 1 && article10_class_value !== (article10_class_value = "" + (null_to_empty(/*cClass*/ ctx[0]) + " svelte-1kes8qr"))) {
    				attr_dev(article10, "class", article10_class_value);
    			}

    			if (!current || dirty & /*textClass*/ 16 && h45_class_value !== (h45_class_value = "" + (null_to_empty(/*textClass*/ ctx[4]) + " svelte-1kes8qr"))) {
    				attr_dev(h45, "class", h45_class_value);
    			}

    			if (!current || dirty & /*textClass*/ 16 && p27_class_value !== (p27_class_value = "" + (null_to_empty(/*textClass*/ ctx[4]) + " svelte-1kes8qr"))) {
    				attr_dev(p27, "class", p27_class_value);
    			}

    			if (!current || dirty & /*textClass*/ 16 && span15_class_value !== (span15_class_value = "" + (null_to_empty(/*textClass*/ ctx[4]) + " svelte-1kes8qr"))) {
    				attr_dev(span15, "class", span15_class_value);
    			}

    			if (dirty & /*textEx*/ 32 && /*textEx*/ ctx[5] !== code5.textContent) {
    				code5.textContent = /*textEx*/ ctx[5];
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(field0.$$.fragment, local);
    			transition_in(field1.$$.fragment, local);
    			transition_in(field2.$$.fragment, local);
    			transition_in(field3.$$.fragment, local);
    			transition_in(field4.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(field0.$$.fragment, local);
    			transition_out(field1.$$.fragment, local);
    			transition_out(field2.$$.fragment, local);
    			transition_out(field3.$$.fragment, local);
    			transition_out(field4.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(section);
    			destroy_component(field0);
    			destroy_component(field1);
    			destroy_component(field2);
    			destroy_component(field3);
    			destroy_component(field4);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$f.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function checkForm$3(e) {
    	//currently only checks one at a time
    	let target = e.target, form;

    	while (!form) {
    		if (target.tagName === "FORM") form = target; else target.tagName === "BODY"
    		? form = "not found"
    		: target = target.parentElement;
    	}

    	for (let el of form) {
    		if (el.willValidate && !el.checkValidity()) return el.reportValidity();
    	}
    }

    function instance$f($$self, $$props, $$invalidate) {
    	let name = "";
    	let lastName = "Knight";
    	let email = "";
    	let password = "";
    	let number = 2;

    	let codeEnd = `
  `;

    	function updateParent(e) {
    		let classString = parentEx.match(/"((?:\\.|[^"\\])*)"/)[0].replace(/['"]+/g, "");
    		$$invalidate(17, pClass = classString);
    	}

    	function updateChild(e) {
    		let classString = childEx.match(/".*"/g);
    		$$invalidate(0, cClass = classString[0].replace(/['"]+/g, ""));
    		$$invalidate(1, formClass = classString[1].replace(/['"]+/g, ""));
    	}

    	function updateText(e) {
    		let classString = textEx.match(/".*"/g);
    		console.log(classString);
    		$$invalidate(4, textClass = classString[0].replace(/['"]+/g, ""));
    	}

    	let settingsCss = `
    @import 'e-mixins';
    @import 'e-reset';
    @import 'e-base';
  `;

    	let generalCss = `
  @import 'u-containers'; // box, grid, & flex;
  @import 'u-text';       // text elements;
  @import 'u-generic';    // paddings, margins, etc..;
  `;

    	let componentsCss = `
  @import 'c-form-input';
  @import 'c-button';
  `;

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$2.warn(`<Styles> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Styles", $$slots, []);

    	function code3_input_handler() {
    		parentEx = this.textContent;
    		((((($$invalidate(3, parentEx), $$invalidate(17, pClass)), $$invalidate(2, childEx)), $$invalidate(0, cClass)), $$invalidate(18, formEx)), $$invalidate(1, formClass));
    	}

    	function code4_input_handler() {
    		childEx = this.textContent;
    		((($$invalidate(2, childEx), $$invalidate(0, cClass)), $$invalidate(18, formEx)), $$invalidate(1, formClass));
    	}

    	const click_handler = () => alert("Good Test");
    	const click_handler_1 = () => alert("More info");

    	function code5_input_handler() {
    		textEx = this.textContent;
    		($$invalidate(5, textEx), $$invalidate(4, textClass));
    	}

    	$$self.$capture_state = () => ({
    		Field: components_1,
    		name,
    		lastName,
    		email,
    		password,
    		number,
    		checkForm: checkForm$3,
    		codeEnd,
    		updateParent,
    		updateChild,
    		updateText,
    		settingsCss,
    		generalCss,
    		componentsCss,
    		pClass,
    		cClass,
    		formClass,
    		formEx,
    		childEx,
    		parentEx,
    		textClass,
    		textEx
    	});

    	$$self.$inject_state = $$props => {
    		if ("name" in $$props) $$invalidate(6, name = $$props.name);
    		if ("lastName" in $$props) $$invalidate(7, lastName = $$props.lastName);
    		if ("email" in $$props) $$invalidate(8, email = $$props.email);
    		if ("password" in $$props) $$invalidate(9, password = $$props.password);
    		if ("number" in $$props) $$invalidate(10, number = $$props.number);
    		if ("codeEnd" in $$props) codeEnd = $$props.codeEnd;
    		if ("settingsCss" in $$props) $$invalidate(14, settingsCss = $$props.settingsCss);
    		if ("generalCss" in $$props) $$invalidate(15, generalCss = $$props.generalCss);
    		if ("componentsCss" in $$props) $$invalidate(16, componentsCss = $$props.componentsCss);
    		if ("pClass" in $$props) $$invalidate(17, pClass = $$props.pClass);
    		if ("cClass" in $$props) $$invalidate(0, cClass = $$props.cClass);
    		if ("formClass" in $$props) $$invalidate(1, formClass = $$props.formClass);
    		if ("formEx" in $$props) $$invalidate(18, formEx = $$props.formEx);
    		if ("childEx" in $$props) $$invalidate(2, childEx = $$props.childEx);
    		if ("parentEx" in $$props) $$invalidate(3, parentEx = $$props.parentEx);
    		if ("textClass" in $$props) $$invalidate(4, textClass = $$props.textClass);
    		if ("textEx" in $$props) $$invalidate(5, textEx = $$props.textEx);
    	};

    	let pClass;
    	let cClass;
    	let formClass;
    	let formEx;
    	let childEx;
    	let parentEx;
    	let textClass;
    	let textEx;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*formClass*/ 2) {
    			 $$invalidate(18, formEx = `
    <div class="${formClass}"> // Below
    <form> ... </form>
    <div> Lorem... </div>
    ....
    </div>
  `);
    		}

    		if ($$self.$$.dirty & /*cClass, formEx*/ 262145) {
    			 $$invalidate(2, childEx = `
    <div class="grid"> //Green with editor
    ...
    </div>
    <article class="${cClass}"> // Editor
    ${formEx}
    </article>
    <div>
    ...
    </div>
  `);
    		}

    		if ($$self.$$.dirty & /*pClass, childEx*/ 131076) {
    			 $$invalidate(3, parentEx = `
  <section class="${pClass}"> // Grey
    ${childEx}
  </section>
  `);
    		}

    		if ($$self.$$.dirty & /*textClass*/ 16) {
    			 $$invalidate(5, textEx = `
  <h4 class="${textClass}">Header 4</h4>
  <p class="${textClass}">Paragraph</p>
  <span class="${textClass}">span</span>
  `);
    		}
    	};

    	 $$invalidate(17, pClass = " box _x");
    	 $$invalidate(0, cClass = "-x");
    	 $$invalidate(1, formClass = "grid");
    	 $$invalidate(4, textClass = "-r");

    	return [
    		cClass,
    		formClass,
    		childEx,
    		parentEx,
    		textClass,
    		textEx,
    		name,
    		lastName,
    		email,
    		password,
    		number,
    		updateParent,
    		updateChild,
    		updateText,
    		settingsCss,
    		generalCss,
    		componentsCss,
    		pClass,
    		formEx,
    		codeEnd,
    		code3_input_handler,
    		code4_input_handler,
    		click_handler,
    		click_handler_1,
    		code5_input_handler
    	];
    }

    class Styles extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$f, create_fragment$f, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Styles",
    			options,
    			id: create_fragment$f.name
    		});
    	}
    }

    //layouts
    const layouts = {
      "/_layout": {
        "component": () => Layout,
        "meta": {},
        "relativeDir": "",
        "path": ""
      }
    };


    //raw routes
    const _routes = [
      {
        "component": () => Fallback,
        "meta": {},
        "isIndex": false,
        "isFallback": true,
        "hasParam": false,
        "path": "/_fallback",
        "shortPath": "/_fallback",
        "layouts": [
          layouts['/_layout']
        ]
      },
      {
        "component": () => Dashboard,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/dashboard",
        "shortPath": "/dashboard",
        "layouts": [
          layouts['/_layout']
        ]
      },
      {
        "component": () => Examples,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/examples",
        "shortPath": "/examples",
        "layouts": [
          layouts['/_layout']
        ]
      },
      {
        "component": () => Pages,
        "meta": {},
        "isIndex": true,
        "isFallback": false,
        "hasParam": false,
        "path": "/index",
        "shortPath": "",
        "layouts": [
          layouts['/_layout']
        ]
      },
      {
        "component": () => Login,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/login",
        "shortPath": "/login",
        "layouts": [
          layouts['/_layout']
        ]
      },
      {
        "component": () => Responsive,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/responsive",
        "shortPath": "/responsive",
        "layouts": [
          layouts['/_layout']
        ]
      },
      {
        "component": () => Styles,
        "meta": {},
        "isIndex": false,
        "isFallback": false,
        "hasParam": false,
        "path": "/styles",
        "shortPath": "/styles",
        "layouts": [
          layouts['/_layout']
        ]
      }
    ];

    //routes
    const routes = buildRoutes(_routes);

    /* src/App.svelte generated by Svelte v3.20.1 */

    function create_fragment$g(ctx) {
    	let current;
    	const router = new Router({ props: { routes }, $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(router.$$.fragment);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$g.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$g($$self, $$props, $$invalidate) {
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("App", $$slots, []);
    	$$self.$capture_state = () => ({ Router, routes });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$g, create_fragment$g, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$g.name
    		});
    	}
    }

    const app = new App({
      target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
