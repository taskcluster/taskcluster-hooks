TaskCluster Hooks
=================
<img hspace="20" align="left" src="https://tools.taskcluster.net/lib/assets/taskcluster-120.png" />
[![Build Status](https://travis-ci.org/taskcluster/taskcluster-hooks.svg?branch=master)](http://travis-ci.org/taskcluster/taskcluster-hooks)
<!-- TODO: see https://www.npmjs.com/package/coveralls to set this up
[![Coverage Status](https://coveralls.io/repos/taskcluster/taskcluster-hooks/badge.svg?branch=master&service=github)](https://coveralls.io/github/taskcluster/taskcluster-hooks?branch=master)
-->
[![License](https://img.shields.io/badge/license-MPL%202.0-orange.svg)](http://mozilla.org/MPL/2.0)

A hooks service for triggering tasks from events.

Testing
-------

TaskCluster components use "real" APIs for much of their testing, and thus require credentials that cannot be checked into the repository.
To run all of the tests, you will need a test credentials file.
Get this from one of the TaskCluster developers, and put it in the root of the repository as `taskcluster-hooks.conf.json`.

Then run `npm test`.
