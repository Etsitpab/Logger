/*
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * @author Baptiste Mazin     <baptiste.mazin@telecom-paristech.fr>
 * @author Guillaume Tartavel <guillaume.tartavel@telecom-paristech.fr>
 */

const loggers = {};
export default function getLogger (prefix, opts) {
    if (loggers[prefix]) {
        return loggers[prefix];
    }
    loggers[prefix] = new Logger(prefix, opts);
    return loggers[prefix];
}

class Logger {
    constructor(prefix = "", {level = "info", htmlLog = false, groupActivated = true} = {}) {
        this._levelStack = [];

        this.prefix = prefix;
        this.htmlLog = htmlLog;
        this.level = level;
        this.groupActivated = groupActivated;

        this._tab = 0;

        for (let fun of ["group", "groupCollapsed", "groupEnd"]) {
            this[fun] = this._getGroupFunction(fun);
        }
        for (let fun of ["log", "debug", "info", "warn", "error"]) {
            this[fun] = this._getLogFunction(fun);
        }
    }
    _getLogFunction(c) {
        let fun = console[console[c] ? c : "log"],
            funLevel = this._levelValues[c];
        return (...args) => {
            if (this.level >= funLevel) {
                this.display(fun, args);
            }
            if (this.htmlLog) {
                let node = this.htmlLog.createElement("div");
                node.classList.add(c);
                node.innerHTML = args.join(" ");
                this._currentNode.appendChild(node);
            }
            return this;
        };
    }
    _getGroupFunction(name) {
        return (...args) => {
            if (!this.groupActivated || this.level === 0) {
                return this;
            }
            if (console[name]) {
                this.display(console[name], args);
            } else if (name === "groupEnd") {
                this._untab();
                this.display(function () {}, args);
            } else {
                args.unshift("*");
                this.display(console.info, args);
                this._tab();
            }
            if (this.htmlLog) {
                if (name === "group" || name === "groupCollapsed") {
                    let node = this._htmlLog.createElement("div");
                    node.classList.add(name);
                    node.innerHTML = args.join(" ");
                    this._currentNode.appendChild(node);
                    this._currentNode = node;
                } else if (this._currentNode !== this._htmlLog.body) {
                    this._currentNode = this._currentNode.parentNode;
                }
            }

            return this;
        };
    }

    display(fun, args) {
        if (this._tab !== 0) {
            args.unshift(Array(this._tab + 1).join("\t"));
        }
        if (this._prefix !== "") {
            args.unshift(this._prefix);
        }
        // args.unshift(getLocation());
        args.unshift(this.getTime());
        fun(...args);
    }

    getTime(d = new Date()) {
        let out = [d.getHours(), d.getMinutes(), d.getSeconds()].map(v => String(v).padStart(2, "0"));
        out.push(String(d.getMilliseconds()).padStart(3, "0"));
        return out.join(":");
    }
    getLocation() {
        let stack = new Error().stack;
        return stack.split("\n")[3].replace(/\s*at\s*/g, "");
    }
    _tab() {
        this._tab++;
        return this;
    }
    _untab() {
        if (this.tab > 0) {
            this.tab--;
        }
        return this;
    }
    setTmpLevel(level) {
        if (typeof level === "string") {
            level = this._levelValues[level];
        }
        this._levelStack.push(level);
    }
    restoreLevel() {
        if (this._levelStack.length > 1) {
            this._levelStack.pop();
        }
    }


    get prefix() {
        return this._prefix.slice(0, -1);
    }
    set prefix(value) {
        this._prefix = value + ":";
    }

    get level() {
        return this._levelStack[this._levelStack.length - 1];
    }
    set level(level) {
        if (typeof level === "string") {
            level = this._levelValues[level];
        }
        if (this._levelStack.length > 0) {
            this._levelStack[this._levelStack.length - 1] = level;
        } else {
            this._levelStack[0] = level;
        }
    }

    get groupActivated() {
        // console.log("get groupActivated", this._groupActivated);
        return this._groupActivated;
    }
    set groupActivated(value) {
        this._groupActivated = value ? true : false;
        // console.log("set groupActivated", this._groupActivated);
    }

    get htmlLog() {
        return this._htmlLog;
    }
    set htmlLog(value) {
        if (value) {
            this._htmlLog = document.implementation.createHTMLDocument(this.prefix);
            this._currentNode = this._htmlLog.body;
        } else {
            this._htmlLog = undefined;
        }
    }

    openHTML() {
        let newWindow = window.open();
        newWindow.document.documentElement.innerHTML = this.htmlLog.documentElement.innerHTML;
    }
}


Logger.prototype._levelValues = {
    debug: 50,
    log: 40,
    info: 30,
    warn: 20,
    error: 10,
    none: 0
};

// this.Logger = Logger;
