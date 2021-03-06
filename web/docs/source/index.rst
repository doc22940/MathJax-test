##########################
MathJax-test Documentation
##########################

MathJax-test is a project to provide a testing framework for
`MathJax <http://www.mathjax.org/>`_, based on
`Selenium testing system <http://seleniumhq.org/>`_. MathJax-test has three main
components:

- Test Suite: a set of Web pages intended to cover all the features of MathJax
  and ensure non regression.
- Test Runner: a set of scripts to automatically run the Test Suite in all
  the platforms supported.
- Quality Assurance Framework: interface and tools to control the framework and
  analyse the results.

User Documentation
==================

.. toctree::
    :maxdepth: 2

    Basic Concepts <basic-concepts>
    Manual Testing <manual-testing>
    Writing Unit Tests <writing-tests>

QA Documentation
================

.. toctree::
    :maxdepth: 2

    Testing Framework Components <components>
    Testing Framework Installation and Maintenance <installation>
    QA Web Interface <qa-web-interface>
    QA Command Line Interface <qa-command-line>


Reference Pages
===============

* :ref:`Search <search>`
* `Doxygen Documentation <../doxygen/>`_
* `Mozilla's ReftestManifest <http://mxr.mozilla.org/mozilla-central/source/layout/tools/reftest/README.txt>`_


--------

This version of the documentation was built |today|.
