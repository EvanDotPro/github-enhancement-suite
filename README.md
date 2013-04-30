# GitHub Enhancement Suite

v0.1 Pre-Alpha by Evan Coury

## Introduction

GitHub Enhancement Suite (GES) is a user script for adding some additional
features to GitHub. It should work with most modern browsers. GES is able to
perform some pretty awesome things by supplementing any GitHub page with
additional information from the GitHub API.

The idea is to be the equivalent to what [Reddit Enhancement Suite](http://redditenhancementsuite.com/)
 (RES) is to Reddit, but for GitHub.

## Features

* When browsing lists of closed pull requests, you can tell the difference
  between pull requests which have been merged and which haven't. The icon next
  to a merged pull request will show as light blue, while unmerged pull
  requests will show red.

![](http://evan.pro/caps/c4f064.png)

* When browsing lists of pull requests, the target branch of the pull request
  is displayed for each pull request. This feature may work on private
  repositories only at the moment.

![](http://evan.pro/caps/a355b8.png)

* Convert issue IDs matching a certain pattern to links to your issue tracker.

![](http://evan.pro/caps/9ffdfd.png)

* Replace the GitHub favicon with a light version if you have a dark browser theme.

![](http://evan.pro/caps/bd4517.png)

* Integrated settings panel within the GitHub UI.

![](http://evan.pro/caps/c953f7.png)


## Planned Features

* Making all features optional via the settings page.
* Automated test suite for detecting regressions???
* Various improvements to the pull request / code review process.
* Improve the issue pattern/linking feature to be per-repo and support any
  arbitrary URL / pattern(s). Currently it is catered towards JIRA IDs and
  URL's slightly.
* Whatever else I come up with.

## Installation

After you install this script, you need to authorize it to access to GitHub API on your behalf:

* Once installed, [click here](http://evan.pro/ges/auth/) to get an OAuth token.
* Next, go to your [profile settings page](https://github.com/settings/profile) and
  paste your OAuth token into the box.

Eventually this will be a more automated process.

## Known Issues

* GitHub uses pushState to update pages. The current hack in place to detect
  this and perform updates relies on a setTimeout() which is, for obvious
  reasons, not 100% reliable. The result is that occasionally GES will not
  update a page after it has changed/loaded. If this happens, you can just
  refresh the page and everything will work.
