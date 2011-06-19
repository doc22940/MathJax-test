/* -*- Mode: Javascript; tab-width: 2; indent-tabs-mode:nil; -*- */
/* vim: set ts=2 et sw=2 tw=80: */
/* ***** BEGIN LICENSE BLOCK *****
   /* Version: Apache License 2.0
   *
   * Copyright (c) 2011 Design Science, Inc.
   *
   * Licensed under the Apache License, Version 2.0 (the "License");
   * you may not use this file except in compliance with the License.
   * You may obtain a copy of the License at
   *
   * http://www.apache.org/licenses/LICENSE-2.0
   *
   * Unless required by applicable law or agreed to in writing, software
   * distributed under the License is distributed on an "AS IS" BASIS,
   * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   * See the License for the specific language governing permissions and
   * limitations under the License.
   *
   * Contributor(s):
   *   Frederic Wang <fred.wang@free.fr> (original author)
   *
   * ***** END LICENSE BLOCK ***** */

/**
 *  @file
 *  This file should be included in all test pages to allow usage of MathJax
 *  and communication with the test launcher.
 */

/**
 * @var String gMathJaxPath
 * path to a "MathJax/" source
 *
 * @var Boolean gNativeMathML
 * Whether the test page uses native MathML.
 *
 * @var String  gFont
 * font used by the test page (STIX, TeX, ImageTex).
 *
 * @var Object  gConfigObject
 * config object to apply over the default MathJax config.
 *
 * @var Object gQueryString
 * an object with pairs attribute=value corresponding to the query string.
 *
 * @var Boolean gErrorHandler
 * Whether the custom error handler should be used.
 */
var gMathJaxPath;
var gNativeMathML = false;
var gFont = "STIX";
var gConfigObject;
var gQueryString = {};
var gErrorHandler = false;

/**
  *  get the current URI of the test file, without query or hash string 
  *
  *  @treturn String the URI
  */
function getCurrentPath()
{
    return location.protocol + "//" + location.host + location.pathname;
}

/**
  *  get the current directory of the test file, which is the current URI
  *  without the file name.
  *
  *  @treturn String the directory
  */
function getCurrentDirectory()
{
    src = getCurrentPath();
    return src.substring(0, src.lastIndexOf("/") + 1);
}

/**
 *  get the default MathJaxPath. It is determined by going to the same level as
 *  MathJax-test/.
 */
function getDefaultMathJaxPath()
{
    src = getCurrentPath();
    return src.substring(0, src.indexOf("MathJax-test")) + "MathJax/";
}

/**
  * This function parses the parameters of the query string and stores
  * them in the variable @ref gQueryString. At the same time, the following
  * variables are set according to the values read:
  *
  * - mathJaxPath
  * - font
  * - nativeMathML
  *
  * @note If a parameter is repeated several times, only the last value is
  * taken into account.
  */
function parseQueryString()
{
    var query = location.search.substring(1);
    var params = query.split("&");
    for(var i = 0; i < params.length; i++) {
        var parts = params[i].split("=");
        if (parts.length != 2) {
            continue;
        }
        gQueryString[parts[0]] = parts[1];
        if (parts[0] == "mathJaxPath") {
            gMathJaxPath = parts[1];
        }
        if (parts[0] == "font") {
            gFont = parts[1];
        }
        if (parts[0] == "nativeMathML") {
            gNativeMathML = (parts[1] == "true");
        }
        if (parts[0] == "errorHandler") {
            gErrorHandler = (parts[1] == "true");
        }
    }
}

/**
  * Get the value of a parameter from the query string
  *
  * @tparam  String aParamName the name of the parameter
  *
  * @treturn String            the value of the parameter or null if not present
  *
  */
function getQueryString(aParamName)
{
    if (gQueryString.hasOwnProperty(aParamName)) {
        return gQueryString[aParamName];
    }

    return null;
}

/**
  *  Return a default mathjax config object to initialize @ref gConfigObject
  *  The value of @ref gNativeMathML and @ref gFont are taken into account.
  *
  *  @treturn Object the config object
  */
function defaultConfigObject()
{
  return {
      messageStyle: "none",

      extensions: ["tex2jax.js",  "mml2jax.js"],

      jax: ["input/TeX", "input/MathML",
            (gNativeMathML ? "output/NativeMML" : "output/HTML-CSS")],

      "HTML-CSS": {
          availableFonts: [(gFont == "ImageTeX" ? "" : gFont)],
          preferredFont: null,
          webFont: null
      },
  
      TeX: {
          extensions: ["AMSmath.js", "AMSsymbols.js"]
      }
  }
}

/**
  * Used to access @ref gConfigObject in the test file
  *
  * @treturn Object @ref gConfigObject
  */
function getConfigObject()
{
    return gConfigObject;
}

/**
  * Function called by the load event, to set up various things for the test
  * page and in particular insert MathJax scripts.
  *
  */
function startMathJax()
{
    // Width of screenshots used by Mozilla
    document.body.style.width = "800px";
    document.body.style.height = "1000px";
    // remove border, margin and scrollbars
    document.body.style.border = document.body.style.margin = "0px";
    document.body.style.overflow = "hidden";

    if (window.initTreeReftests) {
        initTreeReftests();
    }

    if (window.preMathJax) {
        preMathJax();
    }

    var script1 = document.createElement("script");
    var script2 = document.createElement("script");
    script1.type = "text/x-mathjax-config";
    script2.type = "text/javascript";
    script2.src = gMathJaxPath + "MathJax.js?config=default";

    var config = "";
    if (window.xMathJaxConfig) {
        config = "xMathJaxConfig();"
    }
    config += "MathJax.Hub.Config(getConfigObject());";
    config += "MathJax.Hub.Startup.onload();";

    if (window.postMathJax) {
      config +=
        "MathJax.Hub.Queue(postMathJax);";
    }
    
    config +=
        "MathJax.Hub.Queue(finalizeTest);";

    if (window.opera) {
        script1.innerHTML = config;
    } else {
        script1.text = config;
    }

    var head = document.getElementsByTagName("head")[0];
    head.appendChild(script1);
    head.appendChild(script2);
}

/**
  * Add the test finalizer according to the type of test and in particular
  * remove the reftest-wait class of the document.
  *
  */
function finalizeTest()
{
    if (document.documentElement.className == "reftest-error") {
        // do not finalize the test if an error happened.
        return;
    }

    // The finalize function is not directly called after postMathJax but put
    // in the queue, just in case new actions have been added during the test.
    MathJax.Hub.Queue(function () {
        if (window.finalizeTreeReftests) {
            finalizeTreeReftests();
        } else if (window.finalizeScriptReftests) {
            finalizeScriptReftests();
        } else {
            document.documentElement.className = "";
        }
    });
}

/**
  * A custom error handler, that allows seleniumMathJax::open to stop
  * immediatly and report an error, instead of waiting the timeout.
  *
  * @param aErrorMessage error message reported
  * @param aURL url of the script where the error happened
  * @param aLineNumber line number where the error happened
  *
  * @treturn Boolean true
  *
  * @note we store the message in a comment at the end of the <html> node
  * instead of a textarea inside <body>, because some javascript errors may
  * prevent document.body to exist. When doing manual testing, we are supposed
  * to use the browser debugger directly, so such a textarea is not useful.
  */
function errorHandler(aErrorMessage, aURL, aLineNumber)
{
    var data = aErrorMessage;
    data += " (" + aURL + ", line " + aLineNumber + ")";
    var comment = document.createComment(data);
    document.documentElement.appendChild(comment);

    document.title += " (error)";
    document.documentElement.className = "reftest-error";

    return true;
}

gMathJaxPath = getDefaultMathJaxPath();
parseQueryString();
if (gErrorHandler) {
    window.onerror = errorHandler;
}
gConfigObject = defaultConfigObject();
if (window.addEventListener) {
    window.addEventListener("load", startMathJax, false);
} else if (window.attachEvent){
    window.attachEvent("onload", startMathJax);
}
