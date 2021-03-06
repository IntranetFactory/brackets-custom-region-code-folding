// Function based on brace-fold.js addon in CodeMirror Library with minor altering.
// use VS #region/#enderegion
// Modified for brackets by Patrick Oladimeji.
// CodeMirror 4.1.1, copyright (c) by Marijn Haverbeke and others
// Distributed under an MIT license: http://codemirror.net/LICENSE
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50, eqeq:true */
/*global define, brackets*/
define(function (require, exports, module) {
    "use strict";
    var CodeMirror = brackets.getModule("thirdparty/CodeMirror2/lib/codemirror"),
        Preferences = require("Preferences"),
        space = /\s/;

    function regionFold(cm, start) {
        var startWord = "#region",
            endWord = "#endregion",
            startRegionRegex = new RegExp(startWord + " \\w*", ["i"]),
            startRegion = "",
            endRegion = "",
            endRegionRegex = new RegExp(endWord, ["i"]);

        var line = start.line, i, j;
        var startCh = 0, stack = [], token;
        var lastLine = cm.lastLine(), end, endCh, nextOpen, nextClose;
        //no need to fold on single line files
        if (line === lastLine) {
            return;
        }

        for (i = line; i <= lastLine; ++i) {
            var text = cm.getLine(i), pos = startCh;
            for (j = pos; j < text.length; true) {
                //skip all blank lines at begining of text
                if (space.test(text[j])) {
                    j++;
                } else {
                    token = cm.getTokenAt(CodeMirror.Pos(i, j + 1));
                    if (token) {
                        if (token.string.length && token.type === "comment") {
                            
                            nextOpen = -1;
                            startRegion = token.string.toLowerCase().match(startRegionRegex);
                            if(startRegion) {
                                nextOpen = token.start + token.string.toLowerCase().indexOf(startRegion) + startRegion[0].length;
                            }
                            
                            nextClose = -1;
                            endRegion = token.string.toLowerCase().match(endRegionRegex);
                            if(endRegion) {
                                nextClose = token.start + token.string.toLowerCase().indexOf(endRegion) + endRegion[0].length;
                            }

                            if (nextOpen  > -1) {
                                stack.push(nextOpen);
                            }
                            if (nextClose > -1) {
                                if (stack.length === 1) {
                                    endCh = nextClose;
                                    end = i;

                                    return {from: CodeMirror.Pos(line, stack[0]),
                                            to: CodeMirror.Pos(end, endCh)};
                                }
                                stack.pop();
                            }
                        } else {
                            break; //break out of loop if the first non-space character is not a comment
                        }
                    }
                    j = token ? token.end + 1 : text.length;
                }
            }

            if (stack.length === 0) {
                break;
            }
        }
        if (end === null || end === undefined || (line == end && endCh == startCh)) {
            return;
        }
        return {from: CodeMirror.Pos(line, stack[0]),
              to: CodeMirror.Pos(end, endCh)};
    }

    module.exports = regionFold;
});
