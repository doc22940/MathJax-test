/* ***** BEGIN LICENSE BLOCK *****
/* Version: Apache License 2.0
 *
 * Copyright (c) 2011-2015 MathJax Consortium
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
 *  @file treeReftests.js
 *  @brief header for test pages of type @ref reftest::treeReftest
 *
 *  There are two ways to define such a test. The first one is to consider a
 *  &lt;math&gt; element as the tree to serialize. To do that, you have to put
 *  such an element as a descendant of one of id "reftest-element". For
 *  instance, "<div id="reftest-element"><math>...</math></div>". In that case,
 *  the ouput is automatically set to nativeMML, so that you can also do things
    like "<div id="reftest-element">$$x+1$$</div>". The script looks inside the
 *  element "reftest-element" the &lt;math&gt; element generated by MathJax.
 *  The second possibility is to provide a list of elements to use as DOM trees.
 *  This is done by defining a function getReftestElements() in your test page,
 *  which takes no arguments and returns an array of ids. The element having
 *  these ids are serialized and the results are concatenated.
 */

/**
 * serialize a node
 *
 * @tparam  Node   aNode the node to serialize
 *
 * @treturn String an XML string describing the node
 *
 */
function serialize(aNode)
{
    var source;
    // Because the various browsers serialize elements so differently, we
    // use a custom serializer instead of XMLSerializer.
    //  source = (new XMLSerializer()).serializeToString(aNode);
    source = serialize2(aNode);

    // add linebreaks to help diffing source
    source = source.replace(/>(?!<)/g, ">\n");
    source = source.replace(/</g, "\n<");

    return source;
}

/**
 * A basic serializer.
 *
 * @tparam  Node    aNode the node to serialize
 *
 * @treturn String an XML string describing the node
 *
 * @exception "serialization error"
 *
 */
function serialize2(aNode)
{
    var s = "";

    // Versions of IE <= 8 do not know the Node constants
    switch(aNode.nodeType)
    {
    case 3: // Node.TEXT_NODE:
        s += aNode.data;
        break;
        
    case 8: // Node.COMMENT_NODE:
        s += "<!--"
        s += aNode.value;
        s += "-->"
        break;

    case 4: // Node.CDATA_SECTION_NODE:
        s += "<![CDATA["
        s += aNode.value;
        s += "]]>"
        break;

    case 2: // Node.ATTRIBUTE_NODE:
          s += " " + aNode.name;
          s += '=';
          s += '"' + aNode.value + '"';
        break;

    case 1: // Node.ELEMENT_NODE:
        s += "<";
        s += aNode.tagName;
        var attributes = aNode.attributes;

        // Serialize the list of attributes. Sort this list, as browsers
        // specify them in a different order.
        var attributesCopy = new Array();
        for (var i = 0; i < attributes.length; i++) {
            if (MathJax.Hub.Browser.isFirefox) {
                if (attributes[i].name.match(/_moz/)) {
                    // workaround for bug 527201
                    // https://bugzilla.mozilla.org/show_bug.cgi?id=527201
                    continue;
                }
            } else if (MathJax.Hub.Browser.isMSIE) {
                if (!attributes[i].specified) {
                    // Ignores weird attributes that are
                    // accessible from the attributes list.
                    continue;
                }
            }
            attributesCopy.push(serialize2(attributes[i]));
        }
        attributesCopy.sort();
        for (var i = 0; i < attributesCopy.length; i++) {
            s += attributesCopy[i];
        }

        s += ">";
        var children = aNode.childNodes;
        for (var i = 0; i < children.length; i++) {
            s += serialize2(children[i]);
        }
        s += "</";
        s += aNode.tagName;
        s += ">"
        break;

    default:
        throw new Error("serialization error");
        break;
    }

    return s;
}

/**
 * Serialize a math element inside aNode. The function looks for
 * the first descendant of class "MathJax_MathML" and then the first
 * &lt;math&gt; descendant.
 * 
 * @tparam Node    aNode the scope of the search for the math element
 *
 * @treturn String       the serialized math element
 *
 * @exception "MathJax_MathML not found."
 *
 */
function getMathJaxSourceMathML(aNode)
{
    if (MathJax.Hub.Browser.isMSIE) {
        // Internet Explorer lacks support for getElementsByClassName
        var children = aNode.children;
        for (var i = 0; i < children.length; i++) {
            if (children[i].className == "MathJax_MathML") {
                var mathNodes;
                mathNodes = children[i].getElementsByTagName("math");
                if (mathNodes.length == 0) {
                    // getElementsByTagName fails with IE9
                    mathNodes = children[i].querySelectorAll("math");
                }
                if (mathNodes.length > 0) {
                    return serialize(mathNodes[0]);
                }
            }
        }
    } else {
        var divs = aNode.getElementsByClassName("MathJax_MathML");
        if (divs.length > 0) {
            var mathNodes = divs[0].getElementsByTagName("math");
            if (mathNodes.length > 0) {
                return serialize(mathNodes[0]);
            }
        }
    }

    throw new Error("MathJax_MathML not found");
}

/**
 * initialize the tree reftest
 *
 * For a test page which does not define getReftestElements, we set the output
 * to native MathML, so that we can get the math element and serialize it.
 *
 */
function initTreeReftests()
{
    if (!window.getReftestElements) {
        // Always use native MathML for the "standard" tree reftests
        gConfigObject.jax = ["input/TeX", "input/MathML", "output/NativeMML"];
    }
}

/**
 * finalize the tree reftest
 *
 * If the test page defines a getReftestElements, which returns a list of
 * element IDs, then all the listed elements are serialized and the results are
 * concatenated in one string. Otherwise, the function gets the element of id
 * "reftest-element", serialize the math inside. In both case, a textarea of
 * id "source" is created, with the result of the serialization.
 *
 * @exception "reftest-element not found"
 *
 */
function finalizeTreeReftests()
{
    var src = "";

    if (window.getReftestElements) {
        // a list of elements to compare is specified
        list = window.getReftestElements();
        for (var i = 0; i < list.length; i++) {
            src += "==========\n";
            src += serialize(document.getElementById(list[i]));
            src += "\n==========\n\n";
        }
    } else {
        // Default tree reftest: <div id="reftest-element"> with a single
        // math inside.
        var node = document.getElementById("reftest-element");
        if (node) {
            src = getMathJaxSourceMathML(node);
        } else {
            throw new Error("reftest-element not found");
        }
    }
    
    var textarea = document.createElement("textarea");
    textarea.cols = 80;
    textarea.rows = 20;
    textarea.value = src;
    textarea.id = "source";
    document.body.appendChild(textarea);

    document.documentElement.className = "";
    addWebdriverTestCompleteMarker();
}
