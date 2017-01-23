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
        "error": 10
    };
    var getTime = function () {
        var d = new Date();
        return [d.getHours(), d.getMinutes(), d.getSeconds(), d.getMilliseconds()].join(":");
    };
    var getLocation = function () {
        var stack = new Error().stack;
        return stack.split("\n")[3].replace(/\s*at\s*/g, "");
    };
    window.getLogger = function (prefix = "", level = 50) {
        var tab = 0;
        var getLogFunction = function(c) {
            var fun = console[console[c] ? c : "log"];
            return function () {
                var args = Array.prototype.slice.call(arguments);
                if (level >= levelValues[c]) {
                    if (prefix !== "") {
                        args.unshift(Array(tab + 1).join("\t"));
                    }
                    if (prefix !== "") {
                        args.unshift(prefix);
                    }
                    // args.unshift(getLocation());
                    args.unshift(getTime());
                    fun.apply(console, args);
                }
            };
        };

        return {
            "tab": function () {
                tab++;
            },
            "untab": function () {
                tab = tab === 0  ? 0 : tab - 1;
            },
            get level() {
                return level;
            },
            set level(value) {
                level = levelValues[value];
            },
            get prefix() {
                return prefix;
            },
            set prefix(value) {
                prefix = value;
            },
            "log":   getLogFunction("log"),
            "debug": getLogFunction("debug"),
            "info":  getLogFunction("info"),
            "warn":  getLogFunction("warn"),
            "error": getLogFunction("error")
        };
    };
})();
