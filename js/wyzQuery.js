/**
 * Created with JetBrains PhpStorm.
 * User: 15041023
 * Date: 16-3-7
 * Time: 上午9:10
 * To change this template use File | Settings | File Templates.
 */
(function(win,start){
    win.wyzQuery = start();
    window.$ = window.$||win.wyzQuery;
})(this,function(){
    var wyzQuery = function(selector,context){
        return new Init(selector,context);
    };
    wyzQuery.fn = wyzQuery.prototype = [];
    wyzQuery.fn.constructor = wyzQuery;
    var Init = wyzQuery.fn.Init = function(selector,context){
        context = context||window.document;
        var type = Object.prototype.toString.call(selector);
        if (!selector) {
            return this;
        }
        else if (selector.constructor === wyzQuery) {
            return selector;
        }
        else if (type === '[object String]') {
            var holder = document.createElement('WYZ');
            if (/^\s*[\<]/.test(selector)) {
                holder.innerHTML = selector;
                return new Init(holder.children);
            }
            return new Init(context.querySelectorAll(selector));
        }
        else if ('[object HTMLCollection]' === type || '[object NodeList]' === type || '[object Array]' === type) {
            this.length = selector.length;
            for (var i = 0; i < selector.length; i++) {
                this[i] = selector[i];
            }
            return this;
        }
        else if ('[object Function]'==type) {
            $(document).on('DOMContentLoaded',selector)
        }
        else {
            this.length = 1;
            this[0] = selector;
            return this;
        }
    }
    Init.prototype = wyzQuery.fn;
    wyzQuery.extend = wyzQuery.fn.extend = function (isDeep, obj) {
        var target = isDeep || {};
        // 根据首个参数不同值，确定待合并对象组循环起始参数位置
        var objIndex = 1;
        var length = arguments.length;
        var deep = false;
        if (typeof target === 'boolean') {
            deep = target;
            target = arguments[objIndex] || {};
            objIndex++;
        }
        if (typeof target !== 'object' && !wyzQuery.isFunction(target)) {
            target = {};
        }
        if (objIndex === length) {
            target = this;
            objIndex--;
        }

        var name;
        var options;
        var src;
        var copy;
        var copyIsArray;
        var clone;
        for (var i = objIndex; i < length; i++) {
            if ((options = arguments[i])) {
                for (name in options) {
                    if (!options.hasOwnProperty(name)) {
                        break;
                    }
                    src = target[name];
                    copy = options[name];
                    if (target === copy) {
                        continue;
                    }
                    if (deep && copy && (wyzQuery.isPlainObject(copy) || (copyIsArray = wyzQuery.isArray(copy)))) {
                        if (copyIsArray) {
                            copyIsArray = false;
                            clone = src && wyzQuery.isArray(src) ? src : [];
                        }
                        else {
                            clone = src && wyzQuery.isPlainObject(src) ? src : {};
                        }
                        target[name] = wyzQuery.extend(deep, clone, copy);
                    }
                    else if (copy !== undefined) {
                        target[name] = copy;
                    }
                }
            }
        }
        return target;
    };
    wyzQuery.extend({
        trim: function (str) {
            return (str || '').replace(/^\s*(.*?)\s*$/, '$1');
        },
        isFunction: function (fn) {
            return Object.prototype.toString.call(fn) === '[object Function]';
        },
        isArray: Array.isArray,
        isPlainObject: function (obj) {
            if (typeof obj !== 'object' || obj.nodeType || obj === obj.window) {
                return false;
            }
            if (obj.constructor && !Object.prototype.hasOwnProperty.call(obj.constructor.prototype, 'isPrototypeOf')) {
                return false;
            }
            return true;
        },
        obj2array: function (dataObj) {
            var res = [];
            for (var key in dataObj) {
                if (dataObj.hasOwnProperty(key)) {
                    if (wyzQuery.isArray(dataObj[key])) {
                        for (var i = 0; i < dataObj[key].length; i++) {
                            res.push({
                                name: key,
                                value: dataObj[key][i]
                            });
                        }
                    }
                    else {
                        res.push({
                            name: key,
                            value: dataObj[key]
                        });
                    }
                }
            }
            return res;
        },
        array2obj: function (serializeArr) {
            var res = {};
            var setResToArr = function (i) {
                if (wyzQuery.isArray(res[i.name])) {
                    res[i.name].push(i.value);
                }
                else if (typeof res[i.name] === 'string') {
                    res[i.name] = [res[i.name], i.value];
                }
                else {
                    res[i.name] = i.value;
                }
            };
            serializeArr.forEach(setResToArr);
            return res;
        },
        /**
         * 将一个序列换数组或数据对象转化成 序列化字符串。
         *
         * @param {*} serializeArr 传入的序列化数组对象或者string
         * @return {string} 序列化字符串，形如： a=1&b=2&c=3&c=4
         */
        param: function (serializeArr) {
            var arr;
            // 如果是序列化数组，赋值备用
            if (wyzQuery.isArray(serializeArr)) {
                arr = serializeArr;
            }
            // 如果是数据对象，转化成序列化数组备用
            else if (typeof serializeArr === 'object') {
                arr = wyzQuery.obj2array(serializeArr);
            }
            // 如果是字符串，直接当作序列化完成的字符串返回
            else {
                return serializeArr;
            }
            // 序列化过程
            return arr.map(function (item) {
                if (typeof item.value === 'undefined') {
                    return '';
                }
                return encodeURIComponent(item.name) + '=' + encodeURIComponent(item.value);
            }).join('&').replace(/%20/g, '+');
        }
    });
    var p = document.createElement('p');
    var w3cMatches = [
        'matchesSelector',
        'webkitMatchesSelector',
        'msMatchesSelector',
        'mozMatchesSelector',
        'oMatchesSelector'
    ].filter(function (i) {
            return p[i];
        })[0];
    wyzQuery.fn.extend({
        each: function (fn) {
            this.forEach(function (el, i) {
                fn.call(el, i, el);
            });
            return this;
        },
        crossEach: function (ele, fn) {
            var $ele = wyzQuery(ele);
            return this.each(function () {
                var $t = this;
                $ele.forEach(function (el) {
                    fn($t, el);
                });
            });
        },
        _appender: function (ele) {
            return wyzQuery(ele);
        },
        _attr: function (name, value, get, set) {
            var $this = this;
            var eachKV = function (n, v) {
                var eachSet = function () {
                    if (wyzQuery.isFunction(set)) {
                        set.call(this, n, v);
                    }
                };
                $this.each(eachSet);
            };
            if (typeof name === 'string' && typeof value !== 'undefined') {
                var o = {};
                o[name] = value;
                return this._attr(o, null, get, set);
            }
            if (typeof name === 'object') {
                for (var i in name) {
                    if (name.hasOwnProperty(i)) {
                        eachKV(i, name[i]);
                    }
                }
                return this;
            }
            return this.length ? get.call(this[0], name) : null;

        },
        _getSet: function (name, value) {
            if (!this.length) {
                return;
            }
            if (typeof value === 'undefined') {
                return this[0][name];
            }
            return this.each(function () {
                this[name] = value;
            });
        },
        attr: function (name, value) {
            return this._attr(name, value, function (name) {
                return name ? this.getAttribute(name) : this.attributes;
            }, function (n, v) {
                typeof v === 'undefined' ? this.removeAttribute(n) : this.setAttribute(n, v);
            });
        },
        text: function (txt) {
            return this._getSet('textContent', txt);
        },
        html: function (html) {
            return this._getSet('innerHTML', html);
        },
        val: function (value) {
            return this._getSet('value', value);
        },
        addClass: function (className) {
            return this.each(function () {
                this.classList.add(className);//H5特有方法
            });
        },
        removeClass: function (className) {
            return this.each(function () {
                this.classList.remove(className);//H5特有方法
            });
        },
        hasClass: function (className) {
            return !!this.filter('.' + className).length;//H5特有方法
        },
        toggleClass: function (className) {
            return this.each(function () {
                var list = this.classList;
                list.contains(className) ? list.remove(className) : list.add(className);//H5特有方法
            });
        },
        css: function (name, value) {
            var numReg = /width|height|left|right|top|bottom|size|radius/i;
            return this._attr(name, value, function (name) {
                var cssValue =  name ? window.getComputedStyle(this)[name] : this.style;
                if (numReg.test(name) && cssValue.match(/^[\+\-]?[\d\.]+px$/)) {
                    cssValue = Number(cssValue.replace(/px/, ''));
                }
                return cssValue;
            }, function (n, v) {
                if (numReg.test(n) && Object.prototype.toString.call(v) === '[object Number]') {
                    v += 'px';
                }
                this.style[n] = v;
            });
        },
        show: function () {
            return this.css({display: ''});
        },
        hide: function () {
            return this.css({display: 'none'});
        },
        toggle: function () {
            return this.each(function () {
                var $t = this;
                window.getComputedStyle($t).display === 'none' ? $t.style.display = '' : $t.style.display = 'none';
            });
        },
        append: function (ele) {
            return this.crossEach(this._appender(ele), function (dom, el) {
                dom.appendChild(el);
            });
        },
        prepend: function (ele) {
            return this.crossEach(this._appender(ele), function (dom, el) {
                dom.insertBefore(el, dom.firstChild);
            });
        },
        before: function (ele) {
            return this.crossEach(this._appender(ele), function (dom, el) {
                dom.parentNode.insertBefore(el, dom);
            });
        },
        after: function (ele) {
            return this.crossEach(this._appender(ele), function (dom, el) {
                dom.parentNode.insertBefore(el, dom.nextSibling);
            });
        },
        empty: function () {
            return this.each(function () {
                this.textContent = '';
            });
        },
        remove: function () {
            return this.each(function () {
                this.parentNode.removeChild(this);
            });
        },
        clone: function () {
            return wyzQuery(this.map(function (dom, i) {
                return dom.cloneNode ? dom.cloneNode(true) : dom;
            }));
        },
        first: function () {
            return wyzQuery(this[0]);
        },
        eq: function (i) {
            return wyzQuery(this[(this.length + i) % this.length]);
        },
        index: function () {
            return this.parent().children().indexOf(this[0]);
        },
        last: function () {
            return wyzQuery(this[this.length - 1]);
        },
        next: function () {
            return wyzQuery(!this[0] ? null : this[0].nextElementSibling);
        },
        prev: function () {
            return wyzQuery(!this[0] ? null : this[0].previousElementSibling);
        },
        parent: function () {
            return wyzQuery(!this[0] ? null : this[0].parentNode);
        },
        parents: function (filter, root) {
            var $parents = [];
            var tmp = this[0];
            root = root || document;
            while (tmp && tmp !== root && (tmp = tmp.parentNode)) {
                $parents.push(tmp);
            }
            return wyzQuery($parents).filter(filter);
        },
        filter: function (match) {
            var tar = [];
            if (!match) {
                return this;
            }
            else if (typeof match === 'function') {
                tar = [].filter.call(this, match);
            }
            else {
                this.each(function () {
                    var $t = this;
                    if ($t[w3cMatches] && $t[w3cMatches](match)) {
                        tar.push($t);
                    }
                });
            }
            return wyzQuery(tar);
        },
        not: function (no) {
            var $this = this;
            return wyzQuery([].filter.call($this, function (dom) {
                var flag;
                try {
                    flag = dom[w3cMatches] && dom[w3cMatches](no);
                }
                catch(e) {
                    flag = dom === wyzQuery(no)[0];
                }
                return !flag;//反选
            }));
        },
        siblings: function (filter) {
            return this.parent().children(filter).not(this);
        },
        nextAll: function (filter) {
            var all = [];
            this.each(function () {
                var children = $(this).parent().children();
                var i = children.indexOf(this);
                all = all.concat(children.slice(i + 1));
            });
            return wyzQuery(all).filter(filter);
        },
        find: function (filter) {
            var $children = [];
            this.each(function () {
                $children = [].concat.apply($children, wyzQuery(this.querySelectorAll(filter)));//去掉外层数组
            });
            return wyzQuery($children);
        },
        children: function (filter) {
            var $children = [];
            this.each(function () {
                var $t = this;
                var children = $t.children;
                if (!children) {
                    children = [].filter.call($t.childNodes, function (el) {
                        return !!el.tagName;//转换boolean
                    });
                }
                $children = [].concat.apply($children, wyzQuery(children));
            });
            return wyzQuery($children).filter(filter);
        },
        on: function (options, selector, fn, fn2) {
            var f = fn;
            var eventTypes = (options + '').match(/\w+/g) || [];
            if (!eventTypes.length) {
                return this;
            }
            if (typeof selector === 'function') {
                var cbk = selector;
                f = function (e) {
                    if (false === cbk.call(this, e)) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                };
                selector = null;
            }
            else {
                f = function (e) {
                    var tar = wyzQuery(e.target);
                    var par = tar.parents(selector);
                    var ret;
                    if (tar.filter(selector).length) {
                        ret = fn.call(tar[0], e);
                    }
                    else if (par.length) {
                        ret = fn.call(par[0], e);
                    }
                    else if (typeof fn2 === 'function') {
                        ret = fn2.call(this, e);
                    }
                    if (false === ret) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                };
            }
            return this.crossEach(eventTypes, function (dom, eventType) {
                dom['wyz_' + eventType] = dom['wyz_' + eventType] || [];
                dom['wyz_' + eventType].push(f);//存下绑定事件函数，以便后期移除事件用
                dom.addEventListener(eventType, f, false);
                if (dom.cloneNode && dom.cloneNode.list instanceof Array && dom.cloneNode.list.length) {
                    dom.cloneNode.list.on(options, selector, f, fn2);
                }
            });
        },
        off: function (eventType) {
            return this.each(function () {
                var  $t = this;
                var allEvent = $t['wyz_' + eventType] || [];
                allEvent.forEach(function (ev) {
                    $t.removeEventListener(eventType, ev, false);
                });
                delete $t['wyz_' + eventType];
            });
        },
        trigger: function (eventType) {
            var agu = arguments;
            return this.each(function () {
                var $t = this;
                var cbks = $t['wyz_' + eventType] || [];
                if (document.createElement($t.tagName)[eventType]) {
                    $t[eventType]();
                }
                else {
                    cbks.forEach(function (fn) {
                        fn.apply($t, agu);
                    });
                }
            });
        },
        ajax: function (option) {
            var opt = wyzQuery.extend({
                async: true,
                cache: true,
                url: null,
                data: {},
                type: 'GET',
                dataType: 'json',
                form: null,
                success: function () {},
                error: function () {},
                onprocess: function () {}
            }, option);
            if (!opt.url) {
                throw new Error('ajax(url /*required*/)');
            }
            if (opt.dataType.toUpperCase() === 'JSONP') {
                return wyzQuery.jsonp(opt.url, opt.data, opt.success);
            }
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status !== 200) {
                        return opt.error(xhr);
                    }
                    switch (opt.dataType.toUpperCase()) {
                        case 'JSON':
                            try {
                                opt.success(JSON.parse(xhr.responseText));
                            }
                            catch(e) {
                                return opt.error(xhr, e);
                            }
                            break;
                        case 'XML':
                        case 'HTML':
                            if (xhr.responseXML) {
                                opt.success(xhr.responseXML);
                            }
                            else {
                                opt.error(xhr);
                            }
                            break;
                        default:
                            opt.success(xhr.responseText);
                    }
                }
            };
        },
        jsonp: function (url, data, callback) {
            if (wyzQuery.isFunction(data)) {
                callback = data;
                data = {};
            }
            var cbkName = 'wyzQuery_' + +new Date();
            data.__t = +new Date();
            data.callback = cbkName;
            var $sc = doc.createElement('script');
            var bdy = document.body;
            $sc.src = url + '?' + wyzQuery.param(data);
            bdy.appendChild($sc);
            window[cbkName] = callback || function () {};
            $sc.onload = function () {
                delete window[cbkName];
                bdy.removeChild($sc);
            };
        }
    })
    return wyzQuery;
})
