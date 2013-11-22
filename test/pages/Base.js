var _ = require('lodash'),
    exceptions = require('exceptions'),
    Page = require('astrolabe').Page;

// This is used by both `getTabByName` and `tblTabs`.
var tblTabsCss = 'ul.navbar-nav li[ng-show$="loggedIn"] a';

module.exports = Page.create({
    url: { value: '/home' },

    btnLogin: {
        get: function() { return this.findElement(this.by.css('button.navbar-btn')); }
    },

    btnLogout: {
        get: function() { return this.btnLogin; }
    },

    lnkEpikVote: {
        get: function() { return this.findElement(this.by.css('a.epik-brand')); }
    },

    tblTabs: {
        get: function() { return this.findElements(this.by.css(tblTabsCss)); }
    },

    getTabs: {
        value: function () {
            var _this = this;
            var tabs = {};
            return this.tblTabs.then( function (tabsTable) {
                _.forEach(tabsTable, function (tab) {
                    return tab.getText().then( function (tabText) {
                        tabs[tabText.toLowerCase()] = _this._getTab(tab);
                    });
                });
                return tabs;
            });
        }
    },

    getTabByName: {
        value: function (tabName) {
            var _this = this;
            var tabHref = tabName.toLowerCase();
            var tabCss = tblTabsCss + '[href$="' + tabHref  + '"]';
            // We use `this.findElements` because it might return an empty list
            return this.findElements(this.by.css(tabCss)).then( function (tabs) {
                if (tabs) {
                    // If there is a list, we accept the first one as our tab
                    return _this._getTab(tabs[0]);
                } else {
                    // otherwise, the list is empty, and there is no such tab
                    _this.NoSuchTabException.thro(tabName);
                }
            });
        }
    },

    isLoggedIn: {
        value: function () {
            return this.btnLogout.getText().then( function (buttonText) {
                return buttonText === 'Sign Out';
            });
        }
    },

    _getTab: {
        value: function (tabObject) {
            var _this = this;
            return {
                text: this._tabText(tabObject),
                isActive: function () { return _this._tabIsActive(tabObject); },
                visit: function () { return tabObject.click();  }
            };
        }
    },

    _tabIsActive: {
        value: function (tabObject) {
            return tabObject.getCssValue('color').then( function (fontColor) {
                // White font for active tabs
                return fontColor === 'rgba(255, 255, 255, 1)';
            });
        }
    },

    _tabText: {
        value: function (tabObject) {
            return tabObject.getText().then( function (tabText) {
                return tabText;
            });
        }
    },

    NoSuchTabException: {
        get: function() { return new exceptions.Exception('No such tab'); }
    }

});
