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
(function () {
    var levelValues = {
        "debug": 50,
        "log": 40,
        "info": 30,
        "warn": 20,
        "error": 10,
        "none": 0
    };
    var getTime = function () {
        var d = new Date();
        var out = [d.getHours(), d.getMinutes(), d.getSeconds()].map(v => String("00" + v).slice(-2));
        out.push(String("000" + d.getMilliseconds()).slice(-3));
        return out.join(":");
    };
    var getLocation = function () {
        var stack = new Error().stack;
        return stack.split("\n")[3].replace(/\s*at\s*/g, "");
    };

    this.getLogger = function (prefix = "", level = 30) {
        var tab = 0;
        var display = function (fun, args) {
            if (tab !== 0) {
                args.unshift(Array(tab + 1).join("\t"));
            }
            if (prefix !== "") {
                args.unshift(prefix);
            }
            // args.unshift(getLocation());
            args.unshift(getTime());
            fun.apply(console, args);
        };
        var getLogFunction = function(c) {
            return function () {
                if (level >= levelValues[c]) {
                    display(console[console[c] ? c : "log"], Array.prototype.slice.call(arguments));
                }
                return this;
            };
        };

        var tmpLevels = [], defaultLevel = level;
        var getGroupFunction = function (name) {
            return function () {
                if (level === 0) {
                    return this;
                }
                var fun, args = Array.prototype.slice.call(arguments);
                if (console[name]) {
                    display(console[name], args);
                } else {
                    if (name === "groupEnd") {
                        this.untab();
                        display(function () {}, args);
                    } else {
                        args.unshift("*");
                        display(console.info, args);
                        this.tab();
                    }
                }

                return this;
            };
        };
        var logger = {
            "tab": function () {
                tab++;
                return this;
            },
            "untab": function () {
                tab = tab === 0  ? 0 : tab - 1;
                return this;
            },
            get level() {
                return level;
            },
            set level(value) {
                if (typeof value === "string") {
                    level = levelValues[value];
                } else {
                    level = value;
                }
                return this;
            },
            get prefix() {
                return prefix;
            },
            set prefix(value) {
                prefix = value;
                return this;
            },
            "setTemporaryLogLevel": function (value) {
                tmpLevels.push(level);
                this.level = value;
            },
            "restoreLogLevel": function () {
                this.level = tmpLevels.pop() || defaultLevel;
            },
            "group": getGroupFunction("group"),
            "groupCollapsed": getGroupFunction("groupCollapsed"),
            "groupEnd": getGroupFunction("groupEnd"),
            "log":   getLogFunction("log"),
            "debug": getLogFunction("debug"),
            "info":  getLogFunction("info"),
            "warn":  getLogFunction("warn"),
            "error": getLogFunction("error")
        };
        logger.prefix = prefix;
        logger.level = level;
        return logger;
    };
}).bind((typeof module !== 'undefined' && module.exports) ? global : window)();
