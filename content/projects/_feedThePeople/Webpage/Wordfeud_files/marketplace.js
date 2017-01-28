// common initialization
$(function () {
    $('#searchButton').click(function (e) {
        e.preventDefault();
        $(this).parents('form').submit();
    });
});

// search suggestions
(function ($) {
    var currentId = 0;
    var selectedIndex = -1;
    var cache = new Array();

    $.searchSuggestions = function (element, suggestUrl, searchUrl) {
        var $container;
        var containerFocus = false;
        var visible = false;
        var timeout = null;

        createContainer();
        cache[''] = '[]';

        element.keyup(function (e) {
            if (e.which == 27) {
                e.preventDefault();
                return;
            }

            show();

            clearTimeout(timeout);
            timeout = setTimeout(function () {
                getSuggestions(element.val())
            }, 250);
        });

        function getSuggestions(q) {
            if (q.length < 2) {
                return;
            }

            var result = cache[q];
            if (result == null) {
                var requestUrl = encodeURI(suggestUrl + '?query=' + q);
                $.ajax({
                    type: 'GET',
                    dataType: 'html',
                    url: requestUrl,
                    success: function (result) {
                        cache[q] = result;
                        handleResult(result);
                    }
                });
            } else {
                handleResult(result);
            }
        }

        function handleResult(result) {
            var $list = $('ul:eq(0)', $container);
            $list.html('');
            var suggestions = $.parseJSON(result);
            if (suggestions.length == 0) {
                hide();
            } else {
                for (var i = 0; i < suggestions.length; i++) {
                    var suggestion = suggestions[i];
                    $list.append(getSearchItem(suggestion.Title));
                    $('li:eq(' + i + ') a', $list).text(suggestion.Title);
                }
                show();
            }
        }

        function show() {
            if (!visible) {
                if (element.val().length < 2 || $('ul:eq(0) li').length == 0) {
                    return;
                }

                selectedIndex = -1;
                $(document).bind('click', clickHandler);
                $(document).bind('keydown', keyHandler);
                visible = true;
                containerFocus = false;
                $container.show();
            }
        }

        function hide() {
            $(document).unbind('click', clickHandler);
            $(document).unbind('keydown', keyHandler);
            visible = false;
            $container.hide();
        }

        function clickHandler(e) {
            $target = $(e.target);
            if ($target.parents('.searchSuggestions').length == 0) {
                hide();
            }
        }

        function keyHandler(e) {
            var update = false;
            switch (e.which) {
                case 9: //tab
                    //Is this the search input
                    if (element.context == e.target) {
                        hide();
                    } else if (containerFocus) {
                        e.preventDefault();
                        hide();
                        element.next().focus();
                    }
                    return;
                case 27: //escape
                    e.preventDefault();
                    hide();
                    element.focus();
                    return;
                case 38: // up arrow
                    selectedIndex--;
                    update = true;
                    break;
                case 40: // down arrow
                    selectedIndex++;
                    update = true;
                    break;
            }

            if (update) {
                e.preventDefault();
                containerFocus = true;
                if (selectedIndex < 0) {
                    selectedIndex = -1;
                    element.focus();
                } else {
                    var $items = $('li a', $container);
                    if (selectedIndex >= $items.length) {
                        selectedIndex = $items.length - 1;
                    }

                    $('li a', $container).eq(selectedIndex).focus();
                }
            }
        }

        function createContainer() {
            var left = element.position().left + 'px';
            var top = (element.position().top + element.outerHeight()) + 'px';
            var id = 'searchSuggestions' + currentId++;

            var container = '<div id="' + id + '" class="searchSuggestions" style="left: ' + left + '; top: ' + top + ';"><ul></ul></div>'
            element.parents('form').append(container);
            $container = $('#' + id);
            var width = element.outerWidth() - parseInt($container.css('border-left-width')) - parseInt($container.css('border-right-width'));
            $container.width(width);

            $container.focusin(function () {
                containerFocus = true;
            });

            $container.focusout(function (e) {
                if (containerFocus && $(e.target).parents('.searchSuggestions').length == 0) {
                    hide();
                }
            });

        }

        function getSearchItem(title) {
            return '<li><a href="' + searchUrl + '?q=' + encodeURI(title) + '"></a></li>'
        }
    }

    $.fn.searchSuggestions = function (suggestUrl, searchUrl) {
        return this.each(function () {
            new $.searchSuggestions($(this), suggestUrl, searchUrl);
        });
    };

})(jQuery);

// modal dialog
(function ($) {
    $.modalDialog = function (element) {
        var scrollLeft;
        var scrollTop;
        element.css('position', 'fixed');
        element.css('z-index', '203');
        element.bind('show', show);
        element.bind('hide', hide);
        element.wrap('<div class="modal"/>');

        function show() {
            scrollLeft = $(document).scrollLeft();
            scrollTop = $(document).scrollTop();
            $(window).bind('resize', positionElement);
            $(document).bind('focusin', focusHandler);
            $(document).bind('keydown', keyHandler);
            createBackground();
            positionElement();    
            $(element).parent().show();
            element.show();
            $(':input:enabled[type!="hidden"]', element).first().focus();
        }

        function hide() {
            removeBackground();
            $(element).parent().hide();
            element.hide();
            $(document).unbind('keydown', keyHandler);
            $(document).unbind('focusin', focusHandler);
            $(window).unbind('resize', positionElement);
            $(document).scrollLeft(scrollLeft);
            $(document).scrollTop(scrollTop);
        }

        function positionElement() {
            var top = ($(window).height() - element.height()) / 2
            var left = ($(window).width() - element.width()) / 2
            element.css('top', top + 'px');
            element.css('left', left + 'px');
        }

        function createBackground() {
            element.after('<div class="background"/>');
            $(".background").click(function (e) {
                e.preventDefault();
                $('.popup').trigger('hide');
            });
        }

        function removeBackground() {
            element.next('.background').remove();
        }

        function keyHandler(e) {
            // escape
            if(e.which == 27) { 
                    hide();
            }
        }
        
        function focusHandler(e) {
            if (!$(e.target).parents('.modal').length) {
                e.preventDefault();
                if (e.shiftKey) {
                    $(':input:enabled[type!="hidden"], a', element).last().focus();
                } else {
                    $(':input:enabled[type!="hidden"], a', element).first().focus();
                }
            }
        }
    }

    $.fn.modalDialog = function () {
        return this.each(function () {
            new $.modalDialog($(this));
        });
    };
})(jQuery);

$(function () {
    $(".popup .closePopup").click(function (e) {
        e.preventDefault();
        $(e.target).parents('.popup').trigger('hide');
    });
});

// Device Picker
DevicePickerSettings = {
    DeviceSelectedCallback: function (deviceId) { }
};

$(function () {
    var $feedbackLink = $("#feedbackLink");

    if ($feedbackLink.length == 0) {
        return;
    }

    $feedbackLink.click(function (e) {
        e.preventDefault();
        window.open(this.href + '&UrlReferrer=' + escape(window.location.href), '', 'scrollbars=yes,menubar=no,titlebar=no,location=no,width=360,height=650,resizable=no');
    });    
});

$(function () {
    var $picker = $('#devicePicker');

    if ($picker.length == 0) {
        return;
    }

    var $devices = $('#devicePicker li:not(.disabled)');
    var $list = $('#devicePicker ul');
    var visible = false;
    var selectedIndex = -1;

    $('#devicePicker > h5 > a').click(function (e) {
        e.preventDefault();
        if (visible) {
            $picker.trigger('hide');
        } else {
            $picker.trigger('show');
        }
    });

    $picker.bind('show', function () {
        visible = true;
        selectedIndex = -1;
        $picker.addClass('visible');
        $devices.removeClass('active');

        if ($('#devicePicker > div').height() >= parseInt($list.css('max-height'))) {
            $picker.addClass('scrollable');
        }

        $(document).bind('click', clickHandler);
        $(document).bind('keydown', keyHandler);
    });

    $picker.bind('hide', function () {
        visible = false;
        $picker.removeClass('visible scrollable');
        $(document).unbind('click', clickHandler);
        $(document).unbind('keydown', keyHandler);
    });

    $devices.click(function () {
        var deviceId = $('input', this).val()
        DevicePickerSettings.DeviceSelectedCallback(deviceId);
    });

    $devices.mouseenter(function () {
        $devices.removeClass('active');
        $(this).addClass('active');
    });

    $devices.mouseleave(function () {
        $devices.removeClass('active');
    });

    function clickHandler(e) {
        if (!$(e.target).parents('#devicePicker').length) {
            $picker.trigger('hide');
        }
    }

    function keyHandler(e) {
        var update = false;
        switch (e.which) {
            case 27: //escape
                e.preventDefault();
                $picker.trigger('hide');
                return;
            case 38: // up arrow
                selectedIndex--;
                update = true;
                break;
            case 9: //tab
            case 40: // down arrow
                selectedIndex++;
                update = true;
                break;
            case 13: //enter
                $devices.filter('.active:first').click();
                break;
        }

        if (update) {
            $devices.removeClass('active');
            e.preventDefault();
            if (selectedIndex < 0) {
                selectedIndex = 0;
            } else {
                if (selectedIndex >= $devices.length) {
                    selectedIndex = $devices.length - 1;
                }
            }
            var $item = $devices.eq(selectedIndex);
            $item.addClass('active');

            var listHeight = $list.height()
            var listBottom = $list.scrollTop() + listHeight;
            var position = $item.position();
            var itemBottom = $list.scrollTop() + position.top + $item.outerHeight();
            var itemTop = $list.scrollTop() + position.top;

            if (itemBottom > listBottom) {
                $list.scrollTop(itemBottom - listHeight);
            } else if (itemTop < $list.scrollTop()) {
                $list.scrollTop(itemTop);
            }
        }
    }
});


//User menu
$(function () {
    var $container = $('#signout');
    var $link = $('#signout > a');
    var $menu = $('#signout > ul');
    var $menuItems = $('#signout a');
    var visible = false;
    var originalContainerPos = null;
    var linkPaddingRight = parseInt($link.css('padding-right'));
    var selectedIndex = 0;

    if ($container.length == 0) {
        return;
    }

    originalContainerPos = $container.position().left;
    $container.css('left', originalContainerPos);

    $menu.bind('show', function () {
        visible = true;
        selectedIndex = 0;
        $container.addClass('visible');
        $(document).bind('click', clickHandler);
        $(document).bind('keydown', keyHandler);

        // Right Align name and left align menu items
        var $widest = $link;
        var leftPos = $container.position().left;
        $menuItems.each(function () {
            if ($(this).outerWidth() > $widest.outerWidth())
                $widest = $(this);
        });
        var containerOffset = $widest.outerWidth() - $link.outerWidth();
        leftPos = originalContainerPos - containerOffset;
        $link.css('padding-left', containerOffset);
        $container.css('left', leftPos);

        // Add 1 pixel to the right-side padding on the sign out link to fix wiggling effect of triangle graphic in IE 9
        if ($.browser.msie && $.browser.version == 9.0) {
            $link.css('padding-right', (linkPaddingRight + 1) + 'px');
        }
    });

    $menu.bind('hide', function () {
        visible = false;
        $container.removeClass('visible');
        $(document).unbind('click', clickHandler);
        $(document).unbind('keydown', keyHandler);

        // Reset name positioning after left aligned menu items are hidden
        $link.css('padding-left', 0);
        $container.css('left', originalContainerPos);

        // Reset padding on sign out link
        if ($.browser.msie && $.browser.version == 9.0) {
            $link.css('padding-right', linkPaddingRight + 'px');
        }
    });

    $container.bind('focusin mouseenter', function (e) {
        e.preventDefault();
        if (!visible) {
            $menu.trigger('show');
        }
    });

    $container.bind('blur mouseleave', function (e) {
        e.preventDefault();
        if (visible) {
            $menu.trigger('hide');
        }
    });

    function clickHandler(e) {
        if (!$(e.target).parents('#signout').length) {
            $menu.trigger('hide');
        }
    }

    function keyHandler(e) {
        var update = false;
        var tabbed = false;
        switch (e.which) {
            case 27: //escape
                e.preventDefault();
                $menu.trigger('hide');
                return;
            case 9: // tab
                if (e.shiftKey) {
                    selectedIndex--;
                }
                else {
                    selectedIndex++;
                }

                update = true;
                tabbed = true;
                break;
            case 38: // up arrow
                selectedIndex--;
                update = true;
                break;
            case 40: // down arrow
                selectedIndex++;
                update = true;
                break;
        }

        if (update) {
            if (selectedIndex < 0) {
                if (tabbed) {
                    $menu.trigger('hide');
                    return;
                }
                else {
                    selectedIndex = 0;
                }
            } else {
                if (selectedIndex >= $menuItems.length) {
                    if (tabbed) {
                        $menu.trigger('hide');
                        return;
                    }
                    else {
                        selectedIndex = $menuItems.length - 1;
                    }
                }
            }

            e.preventDefault();
            $menuItems[selectedIndex].focus();
        }
    }
});

/* Omniture */
function appendValueToVariable(variable, value) {
    var result; if (variable == null) { result = value; }
    else { result = (variable + ',' + value); }
    return result;
}

$(function () {
    var propSet1 = 'prop1,prop7,eVar1,eVar34';
    var propSet2 = 'prop1,prop2,prop7,eVar1,eVar2,eVar34';
    var propSet3 = 'prop1,prop2,prop7,prop31,eVar1,eVar2,eVar31,eVar34';
    var propSet4 = 'prop1,prop2,prop7,prop32,eVar1,eVar2,eVar32,eVar34';

    var $page = $('#page');

    initCommon();

    var headerPropFn = myWpProp;
    if ($page.is('.my')) {
        if ($page.is('.nophone')) {
            initNoPhone();
        } else if ($page.is('.recent')) {
            initRecentActivity();
        } else if ($page.is('.find')) {
            initFind();
        } else if ($page.is('.account')) {
            initAccount();
        }
    } else if ($page.is('.marketplace')) {
        headerPropFn = mpProp;
        if ($page.is('.home')) {
            initMarketplaceHome();
        } else if ($page.is('.app.list')) {
            initAppList('Apps');
        } else if ($page.is('.game.list')) {
            initAppList('Games');
        } else if ($page.is('.app.details')) {
            initAppDetails('Apps');
        } else if ($page.is('.game.details')) {
            initAppDetails('Games');
        } else if ($('table.apps', $page).length > 0) {
            initGenericAppList();
        }
    } else if ($page.is('.purchase')) {
        initPurchase();
    }

    initHeader(headerPropFn);

    function myWpProp(val) { return 'myWP:' + val; }
    function photosProp(val) { return myWpProp('Photos and Videos:' + val); }
    function xboxProp(val) { return myWpProp('Xbox LIVE:' + val); }
    function hotmailProp(val) { return myWpProp('Hotmail:' + val); }
    function navProp(val) { return myWpProp('Nav:' + val); }
    function findProp(val) { return myWpProp('Find My Phone:' + val); }
    function phoneCardProp(val) { return myWpProp('Phone Card:' + val); }
    function personalProp(val) { return myWpProp('Personal:' + val); }
    function locationProp(val) { return myWpProp('Location:' + val); }

    function mpProp(val) { return 'MP:' + val; }

    function track(selector, propSet, event, linkType, linkName) {
        selector.click(function (e) {
            s.linkTrackVars = 'channel';

            for (var i = 0; i < propSet.length; i++) {

                appendLinkTrackVar(propSet[i][0]);
                setProps(propSet[i][0], propSet[i][1]);
            }

            if (event !== null && event !== undefined) {
                s.events = s.linkTrackEvents = event;
                appendLinkTrackVar('events');
            }

            if (linkType === null || linkType === undefined) {
                linkType = 'o';
            }

            if (linkName === null || linkName === undefined) {
                linkName = s.prop1;
            }

            try {
                s.tl(this, linkType, linkName);
            } catch (ex) {
            }

            for (var i = 0; i < propSet.length; i++) {
                setProps(propSet[i][0], '');
            }
        });
    }

    function appendLinkTrackVar(value) {
        if (s.linkTrackVars.length == 0) {
            s.linkTrackVars = value;
        } else {
            s.linkTrackVars += ',' + value;
        }
    }

    function setProps(propList, value) {
        var props = propList.split(',');
        for (var j = 0; j < props.length; j++) {
            s[props[j]] = value;
        }
    }

    function initCommon() {
        $('#devicePicker li:not(.disabled)').each(function (index) {
            track($(this), [[propSet1, myWpProp('DevicePicker:device [' + (index + 1) + ']')]]);
        });

        track($('#searchButton'), [[propSet1, myWpProp('Search')]]);
        track($('#signin'), [[propSet1, myWpProp('sign-in')]], 'event18');
    }

    function initHeader(propFn) {
        track($('#navItems .discover'), [[propSet1, propFn('Discover')]]);
        track($('#navItems .buy'), [[propSet1, propFn('Buy')]]);
        track($('#navItems .marketplace'), [[propSet1, propFn('Marketplace')]]);
        track($('#navItems .help'), [[propSet1, propFn('Help')]]);
        track($('#navItems .my'), [[propSet1, propFn('My')]]);
    }

    function initNoPhone() {
        track($('#find a'), [[propSet1, myWpProp('Find My Phone')]]);
        track($('#photos a'), [[propSet1, myWpProp('Photos and Videos')]]);
        track($('#purchaseHistory a'), [[propSet1, myWpProp('Purchase History')]]);
        track($('#xbox a'), [[propSet1, myWpProp('Xbox Live')]]);
        track($('#office a'), [[propSet1, myWpProp('Office')]]);
        track($('#acquire a.get'), [[propSet1, myWpProp('Get WP')]]);
        track($('#acquire span a'), [[propSet1, myWpProp('user sign-in link')]], 'event18');
    }

    function initRecentActivity() {
        track($('#photos > a'), [[propSet1, photosProp('live.com link')]]);
        $('#photos table a').each(function (index) {
            track($(this), [[propSet1, photosProp('panel [' + (index + 1) + ']')]], null, 'e');
        });

        track($('#LastLocation a'), [[propSet1, myWpProp('Find My Phone')]]);
        track($('#BingCheckin a'), [[propSet1, myWpProp('Bing Checkin')]]);
        track($('#xbox .gamerCard > ul > li:eq(0) a'), [[propSet2, xboxProp('Achievements')]]);
        track($('#xbox .gamerCard > ul > li:eq(1) a'), [[propSet2, xboxProp('Customize')]]);
        track($('#xbox .gamerCard > ul > li:eq(2) a'), [[propSet2, xboxProp('Play')]]);
        track($('#xbox > ul > li:eq(0) a'), [[propSet2, xboxProp('Friends Online')]]);
        track($('#xbox > ul > li:eq(2) a'), [[propSet2, xboxProp('Messages')]]);
        track($('#contacts a'), [[propSet2, hotmailProp('Contacts')]]);
        track($('#calendar a'), [[propSet2, hotmailProp('Calendar')]]);
        track($('#inbox a'), [[propSet2, hotmailProp('Inbox')]]);
        track($('#xboxMembership a.gold'), [[propSet2, navProp('Xbox')], ['prop35,eVar35', 'gold']]);
        track($('#xboxMembership a.silver'), [[propSet2, navProp('Xbox')], ['prop35,eVar35', 'silver']]);
        track($('#xboxMembership a.none'), [[propSet2, navProp('Xbox')], ['prop35,eVar35', 'none']]);
        track($('#zunePass a'), [[propSet2, navProp('Zune Pass')]]);
        track($('#zuneClient a.pc'), [[propSet2, navProp('Zune PC')]]);
        track($('#zuneClient a.mac'), [[propSet2, navProp('Zune Mac')]]);
    }

    function initFind() {
        track($('#LocationRefresh'), [[propSet1, findProp('Refresh')]]);
        track($('#LocationCenter'), [[propSet1, findProp('Center')]]);
        track($('#RingAction'), [[propSet1, findProp('Ring')]]);
        track($('#LockAction'), [[propSet1, findProp('Lock')]]);
        track($('#LockRingCheckbox'), [[propSet1, findProp('Lock:Ring')]]);
        track($('#LockButton'), [[propSet1, findProp('Lock:Ok')]]);
        track($('#LockCancelButton'), [[propSet1, findProp('Lock:Cancel')]]);
        track($('#EraseAction'), [[propSet1, findProp('Erase')]]);
        track($('#WipeButton'), [[propSet1, findProp('Erase:Ok')]]);
        track($('#WipeCancelButton'), [[propSet1, findProp('Erase:Cancel')]]);
        track($('#LocationPrint'), [[propSet1, myWpProp('Location:Print')]]);
        track($('#SmsNotifications a'), [[propSet1, myWpProp('SMS:Whats This')]]);
        track($('#smsNotificationPopup p a'), [[propSet1, myWpProp('SMS:Warning Popup')]]);
    }

    function initAccount() {
        track($('#updatePhoneNumberLink'), [[propSet1, phoneCardProp('Update')]]);
        track($('#MobileOperatorLink'), [[propSet1, phoneCardProp('Operator')]]);
        track($('#removeLink'), [[propSet1, phoneCardProp('Remove')]]);
        track($('#updateEmailLink'), [[propSet1, personalProp('Email')]]);
        track($('#billingInfo li:eq(0) a'), [[propSet1, personalProp('Payment')]]);
        track($('#billingInfo li:eq(1) a'), [[propSet1, personalProp('Billing')]], null, 'e');
        track($('#purchases td.action a'), [[propSet1, myWpProp('App History:Reinstall')]], null, 'e');
        track($('#learnZune'), [[propSet1, personalProp('ZuneTag')]], null, 'e');
    }

    function initMarketplaceHome() {
        track($('#featured > ul > li'), [[propSet1, mpProp('Hero:Control')]]);
        track($('#featured .multiApps.app > a'), [[propSet1, mpProp('Hero:Control:Featured Apps')]]);
        track($('#featured .multiApps.game > a'), [[propSet1, mpProp('Hero:Control:Featured Games')]]);

        var appTitle = $('#featured .singleApp.app div.title a').text();
        track($('#featured .singleApp.app div.title a'), [[propSet2, mpProp('Hero:Apps:0:' + appTitle)]], 'event13');
        track($('#featured .singleApp.app a.image'), [[propSet2, mpProp('Hero:Apps:0:' + appTitle)]], 'event13');

        $('#featured .multiApps.app div.app').each(function (index) {
            var title = $('a.title', this).text();
            track($('a.title', this), [[propSet2, mpProp('Hero:Apps:' + (index + 1) + ':' + title)]], 'event13');
            track($('a.image', this), [[propSet2, mpProp('Hero:Apps:' + (index + 1) + ':' + title)]], 'event13');
        });

        var gameTitle = $('#featured .singleApp.game div.title a').text();
        track($('#featured .singleApp.game div.title a'), [[propSet2, mpProp('Hero:Games:0:' + gameTitle)]], 'event13');
        track($('#featured .singleApp.game a.image'), [[propSet2, mpProp('Hero:Games:0:' + gameTitle)]], 'event13');

        $('#featured .multiApps.game div.app').each(function (index) {
            var title = $('a.title', this).text();
            track($('a.title', this), [[propSet2, mpProp('Hero:Games:' + (index + 1) + ':' + title)]], 'event13');
            track($('a.image', this), [[propSet2, mpProp('Hero:Games:' + (index + 1) + ':' + title)]], 'event13');
        });

        track($('#featured .heroeditorial a'), [[propSet2, mpProp('Hero:Editorial')]]);

        $('#apps ul.appsMenu a').each(function (index) {
            var type = $(this).attr('href').replace('#', '');
            track($(this), [[propSet1, mpProp('Apps:toggled' + type)]]);
        });

        $('#apps ul.apps > li').each(function (index) {
            var title = $('div.title > a', this).text();
            track($('a', this), [[propSet3, mpProp('Apps:' + (index + 1) + ':' + title)]], 'event13');
        });

        $('#games ul.appsMenu a').each(function (index) {
            var type = $(this).attr('href').replace('#', '');
            track($(this), [[propSet1, mpProp('Games:toggled' + type)]]);
        });

        $('#games ul.apps > li').each(function (index) {
            var title = $('div.title > a', this).text();
            track($('a', this), [[propSet3, mpProp('Games:' + (index + 1) + ':' + title)]], 'event13');
        });

        $('#editorial > div').each(function (index) {
            track($('a', this), [[propSet4, mpProp('Content:' + (index + 1) + ':' + $('h6', this).text())]], 'event25');
        });
    }

    function initAppList(listType) {
        $('#categoryApps table.apps tbody td').each(function (index) {
            var title = $('div.title > a', this).text();
            track($('a', this), [[propSet3, mpProp(listType + ':' + title)]], 'event13');
        });

        $('#categoryApps ul.filters a').each(function (index) {
            track($(this), [[propSet1, mpProp(listType + ':Filter:' + $(this).attr('class'))]], 'event1');
        });

        $('#categoryApps ul.categories a').each(function (index) {
            track($(this), [[propSet1, mpProp(listType + ':Category:' + $(this).text())]], 'event1');
        });
    }

    function initGenericAppList() {
        $('table.apps tbody td').each(function (index) {
            var title = $('div.title > a', this).text();
            track($('a', this), [[propSet3, mpProp('Apps:' + title)]], 'event13');
        });
    }

    function initAppDetails(appType) {
        var appProp = mpProp(appType + ':' + $('#application h1').text() + ':');

        track($('#languages h4'), [[propSet2, appProp + 'viewedLanguages']]);
        track($('#reviews .paging a'), [[propSet2, appProp + 'pagedMoreReviews']]);
        track($('#screenshots a'), [[propSet2, appProp + 'viewedScreenshots']]);
        track($('#rate .ratingLarge'), [[propSet2, appProp + 'addedRating']]);
        track($('#review input.submit'), [[propSet2, appProp + 'addedReview']]);
        track($('#buy'), [[propSet2, appProp + 'buy'], ['prop11,eVar11', s.prop11]], 'event26');
        track($('#try'), [[propSet2, appProp + 'try'], ['prop11,eVar11', s.prop11]], 'event26');
        track($('#free'), [[propSet2, appProp + 'free'], ['prop11,eVar11', s.prop11]], 'event26');
        track($('#reinstall'), [[propSet2, appProp + 'reinstall'], ['prop11,eVar11', s.prop11]], 'event26');
        track($('#reinstallTrial'), [[propSet2, appProp + 'reinstallTrial'], ['prop11,eVar11', s.prop11]], 'event26');
    }

    function initPurchase() {
        if (typeof (OmnitureData) == 'undefined' || OmnitureData === null) {
            return;
        }

        var appType = OmnitureData.IsGame ? 'Games' : 'Apps';
        var appProp = mpProp(appType + ':' + $('#mainContent h1').text() + ':' + OmnitureData.OfferType);

        if ($('#mainContent .confirmPurchase').length == 0) {
            if ($('#mainContent .confirmation').length == 0) {
                track($('.primaryAction'), [[propSet2, appProp], ['prop11,eVar11', s.prop11]], 'event27');
            }
        } else {
            track($('.primaryAction'), [[propSet2, appProp], ['prop11,eVar11', s.prop11]], 'event28');
        }

        track($('#moreFromCategory a'), [[propSet2, appProp + ':moreFromCategory']]);
    }
});

/**
* jQuery Cookie plugin
*
* Copyright (c) 2010 Klaus Hartl (stilbuero.de)
* Dual licensed under the MIT and GPL licenses:
* http://www.opensource.org/licenses/mit-license.php
* http://www.gnu.org/licenses/gpl.html
*
*/

// TODO JsDoc

/**
* Create a cookie with the given key and value and other optional parameters.
*
* @example $.cookie('the_cookie', 'the_value');
* @desc Set the value of a cookie.
* @example $.cookie('the_cookie', 'the_value', { expires: 7, path: '/', domain: 'jquery.com', secure: true });
* @desc Create a cookie with all available options.
* @example $.cookie('the_cookie', 'the_value');
* @desc Create a session cookie.
* @example $.cookie('the_cookie', null);
* @desc Delete a cookie by passing null as value. Keep in mind that you have to use the same path and domain
*       used when the cookie was set.
*
* @param String key The key of the cookie.
* @param String value The value of the cookie.
* @param Object options An object literal containing key/value pairs to provide optional cookie attributes.
* @option Number|Date expires Either an integer specifying the expiration date from now on in days or a Date object.
*                             If a negative value is specified (e.g. a date in the past), the cookie will be deleted.
*                             If set to null or omitted, the cookie will be a session cookie and will not be retained
*                             when the the browser exits.
* @option String path The value of the path atribute of the cookie (default: path of page that created the cookie).
* @option String domain The value of the domain attribute of the cookie (default: domain of page that created the cookie).
* @option Boolean secure If true, the secure attribute of the cookie will be set and the cookie transmission will
*                        require a secure protocol (like HTTPS).
* @type undefined
*
* @name $.cookie
* @cat Plugins/Cookie
* @author Klaus Hartl/klaus.hartl@stilbuero.de
*/

/**
* Get the value of a cookie with the given key.
*
* @example $.cookie('the_cookie');
* @desc Get the value of a cookie.
*
* @param String key The key of the cookie.
* @return The value of the cookie.
* @type String
*
* @name $.cookie
* @cat Plugins/Cookie
* @author Klaus Hartl/klaus.hartl@stilbuero.de
*/
jQuery.cookie = function (key, value, options) {

    // key and at least value given, set cookie...
    if (arguments.length > 1 && String(value) !== "[object Object]") {
        options = jQuery.extend({}, options);

        if (value === null || value === undefined) {
            options.expires = -1;
        }

        if (typeof options.expires === 'number') {
            var days = options.expires, t = options.expires = new Date();
            t.setDate(t.getDate() + days);
        }

        value = String(value);

        return (document.cookie = [
            encodeURIComponent(key), '=',
            options.raw ? value : encodeURIComponent(value),
            options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
            options.path ? '; path=' + options.path : '',
            options.domain ? '; domain=' + options.domain : '',
            options.secure ? '; secure' : ''
        ].join(''));
    }

    // key and possibly options given, get cookie...
    options = value || {};
    var result, decode = options.raw ? function (s) { return s; } : decodeURIComponent;
    return (result = new RegExp('(?:^|; )' + encodeURIComponent(key) + '=([^;]*)').exec(document.cookie)) ? decode(result[1]) : null;
};

/**
* jQuery.placeholder - Placeholder plugin for input fields
* Usage: 
*   Create a text input with an attr placeholderText that contains the text to put in the textbox
*   Call $("#id").placeholder() 
*   This adds the on focus and on blur functions that triggers the value to be in the textbox. 
*   It will also add a class "placeholder" to the input for styling purposes
*
* Override:
*   If you prefer to pass the text in via the creation call, you just need a default text input and call
*   $("#id").placeholder("overriding text");
*   That will replace or add the attr for the input text
*
**/
(function ($) {
    $.fn.placeholder = function (overrideText) {
        var text;
        // Check for override
        if (overrideText) {
            text = overrideText;

            // Make sure to set the attribute too
            $(this).attr("placeholderText", text);
        }
        else if ($(this).attr("placeholderText")) {
            text = $(this).attr("placeholderText");
        }
        else {
            // If no overriding text or attribute not defined, do nothing to the element
            return $(this);
        }

        // Initialize value and styling
        $(this).val(text);
        $(this).addClass("placeholder");

        return this.focus(function () {
            if ($.trim($(this).val()) === $(this).attr("placeholderText"))
                $(this).removeClass("placeholder").val("");
        }).blur(function () {
            if ($.trim($(this).val()) === "")
                $(this).addClass("placeholder").val($(this).attr("placeholderText"));
        });
    };
})(jQuery);


$(function () {
    $("a.commerceSignOut").each(function () {
        $(this).click(function () {
            $.get('/' + SiteSettings.Market + '/user/commercesignout');
        });
    });
});
