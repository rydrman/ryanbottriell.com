$(function () {
    $('#languages > a').click(function (e) {
        $(this).toggleClass('collapsed');
        $('.expcol', this).toggleClass('collapsed');
        $('#languages > ul').slideToggle('fast');
        e.preventDefault();
    });

    $('#screenshots a').each(function (index) {
        var id = index;
        $(this).click(function (event) {
            if (!event.ctrlKey && !event.shiftKey) {
                event.preventDefault();
                ScreenshotViewer.show(id);
            }
        });
    });

    reviewsViewer();
    reviewEditor();
});

function reviewsViewer() {
    $reviewsList = $('#appDetails #reviews ul');
    $moreReviews = $('#appDetails #reviews #moreReviews');
    
    $moreReviews.bind('click', handlePagerClick);

    function handlePagerClick(e) {
        e.preventDefault();
        $.ajax({
            type: 'GET',
            dataType: 'html',
            url: $(this).attr('href'),
            success: handleResult
        });
    }

    function handleResult(result) {
        var $reviewResult = $(result);

        if (($reviewResult).find('li').length > 0) {
            $reviewsList.append($('li', $reviewResult));

            var more = $('#moreReviews', $reviewResult).attr('href');
            if (more != null && more.length > 0) {
                $moreReviews.attr('href', more);
                return;
            }
        }

        $moreReviews.hide();
    }
}

function reviewEditor() {
    var $rating = $('form#rate div.ratingLarge');
    var $ratingInput = $('form#rate input[name="rating"]');
    var $submit = $('form#review input.submit');
    var $clear = $('form#review input.clear');
    var $review = $('form#review textarea');
    var tokenValue = $('form#review input[type="hidden"]').val();
    var currentRating = $ratingInput.val();
    var currentReview = $('form#review textarea').val();

    $submit.attr('disabled', 'disabled');

    if (currentReview != null && currentReview.length == 0) {
        $clear.hide();
    }

    if (currentRating == null || currentRating.length == 0 || currentRating == '0') {
        $('form#review textarea').attr('disabled', 'disabled');
        $clear.hide();
    }

    $submit.click(function (e) {
        e.preventDefault();
        $.ajax({
            type: 'POST',
            url: $('form#review').attr('action'),
            data: ({ reviewText: $review.val(), rating: currentRating, __RequestVerificationToken: tokenValue }),
            success: handleReviewResult
        });
    });

    $clear.click(function (e) {
        e.preventDefault();
        $review.val('');
        $.ajax({
            type: 'POST',
            url: $('form#review').attr('action'),
            data: ({ reviewText: $review.val(), rating: currentRating, __RequestVerificationToken: tokenValue }),
            success: handleReviewResult
        });
    });

    $review.bind('keyup cut paste change', function () {
        if (currentReview.length == 0 && $.trim($review.val()).length == 0) {
            $submit.attr('disabled', 'disabled');
        } else {
            $submit.removeAttr('disabled');
        }
    });

    $review.bind('keypress keyup paste change', function (e) {
        var val = $review.val();
        if (val.length > 1024) {
            $review.val(val.substr(0, 1024));
        }
    });

    $rating.mouseenter(function () {
        if (!$rating.hasClass('active')) {
            $rating.addClass('active');
        }
    });

    $rating.mouseleave(function () {
        $rating.removeClass('active');
        setRatingClass(currentRating);
    });

    $rating.mousemove(function (e) {
        var targetPos = $(e.target).offset();
        var x = e.pageX - targetPos.left;

        if (x < 17) {
            $ratingInput.val('1');
        } else if (x < 34) {
            $ratingInput.val('2');
        } else if (x < 51) {
            $ratingInput.val('3');
        } else if (x < 68) {
            $ratingInput.val('4');
        } else {
            $ratingInput.val('5');
        }

        setRatingClass($ratingInput.val());
    });

    $rating.click(function () {
        currentRating = $ratingInput.val();

        if ($review.attr('disabled') || $review.val() == "") {
            $.ajax({
                type: 'POST',
                url: $('form#rate').attr('action'),
                data: ({ rating: $ratingInput.val(), __RequestVerificationToken: tokenValue }),
                success: handleRateResult
            });
        } else {
            $.ajax({
                type: 'POST',
                url: $('form#review').attr('action'),
                data: ({ reviewText: $review.val(), rating: $ratingInput.val(), __RequestVerificationToken: tokenValue }),
                success: handleRateResult
            });
        }
    });

    function handleReviewResult(result) {
        currentReview = $review.val();
        if (result.success) {
            $submit.attr('disabled', 'disabled');
            $submit.attr('value', result.submitText);
            if (currentReview.length == 0) {
                $clear.hide();
            } else {
                $clear.show();
            }
        }

        handleResult(result);
    }

    function handleRateResult(result) {
        currentRating = $ratingInput.val();
        if (result.success) {
            $('#appDetails .ratingNotification').removeClass('notRated');
            $('form#review textarea').attr('disabled', '');
            if ($('form#review textarea').is('.unrated')) {
                $('form#review textarea').val('');
                $('form#review textarea').removeClass('unrated');
            }
        }

        handleResult(result);
    }

    function handleResult(result) {
        $header = $('#appDetails #userReviewHeader');
        $header.removeClass('error');
        if (!result.success) {
            $header.addClass('error');
        }

        $header.text(result.text);
    }

    function setRatingClass(val) {
        $rating.removeClass('zeroPtZero onePtZero twoPtZero threePtZero fourPtZero fivePtZero');
        switch (val) {
            case '5':
                $rating.addClass('fivePtZero');
                break;
            case '4':
                $rating.addClass('fourPtZero');
                break;
            case '3':
                $rating.addClass('threePtZero');
                break;
            case '2':
                $rating.addClass('twoPtZero');
                break;
            case '1':
                $rating.addClass('onePtZero');
                break;
            default:
                $rating.addClass('zeroPtZero');
                break;
        };
    }
}

ScreenshotViewer = {
    isInitialized: false,
    currentIndex: 0,
    maxIndex: 0,
    src: '',

    show: function (indexToShow) {
        this.currentIndex = indexToShow;
        if (!this.isInitialized) {
            this.initialize();
        } else {
            $(document).bind('keydown', this.keyHandler);
            $(document).bind('focusin', this.focusHandler);
            $(document).bind('click', this.clickHandler);
            this.showShot(this.currentIndex);
            $('#shotViewer').show();
            $('#shotViewer #closeViewer').focus();
        }
    },

    hide: function () {
        $(document).unbind('keydown', this.keyHandler);
        $(document).unbind('focusin', this.focusHandler);
        $(document).unbind('click', this.clickHandler);
        $('#shotViewer .shot:eq(' + this.currentIndex + ')').hide();
        $('#shotViewer').hide();
    },

    initialize: function () {
        var viewer = this;
        $.get(this.src, function (data) { viewer.loadComplete(data); });
    },

    loadComplete: function (data) {
        $('body').append(data);
        var viewer = this;
        this.isInitialized = true;
        this.maxIndex = $('#shotViewer .shot').length - 1;
        $('#shotViewer .shot').hide();

        $('#shotViewer').bind('previous', function () { viewer.previous(); });
        $('#shotViewer').bind('next', function () { viewer.next(); });
        $('#shotViewer').bind('hide', function () { viewer.hide(); });

        $('#shotViewer #previousShot').click(function (e) {
            e.preventDefault();
            $('#shotViewer').trigger('previous');
        });

        $('#shotViewer #nextShot').click(function (e) {
            e.preventDefault();
            $('#shotViewer').trigger('next');
        });

        $('#shotViewer #closeViewer').click(function (e) {
            e.preventDefault();
            $('#shotViewer').trigger('hide');
        });

        if (this.maxIndex == 0) {
            $('#shotViewer #previousShot, #shotViewer #nextShot').css('visibility', 'hidden');
        }

        this.show(this.currentIndex);
    },

    keyHandler: function (e) {
        var event = null;
        switch (e.which) {
            case 27: //escape
                event = 'hide';
                break;
            case 37: // left arrow
                event = 'previous';
                break;
            case 32: // space
            case 39: // right arrow
                event = 'next';
                break;
        }

        if (event) {
            e.preventDefault();
            $('#shotViewer').trigger(event);
        }
    },

    focusHandler: function (e) {
        if (!$(e.target).parents('#shotViewer').length) {
            if (e.shiftKey) {
                $('#shotViewer #nextShot').focus();
            } else {
                $('#shotViewer #closeViewer').focus();
            }
        }
    },

    clickHandler: function (e) {
        if (!$(e.target).is('a,img')) {
            $('#shotViewer').trigger('hide');
        } else if ($(e.target).is('img') && $(e.target).parents('#shotViewer').length) {
            $('#shotViewer').trigger('next');
        }
    },

    next: function () {
        this.showShot(this.currentIndex + 1);
    },

    previous: function () {
        this.showShot(this.currentIndex - 1);
    },

    showShot: function (indexToShow) {
        $('#shotViewer .shot:eq(' + this.currentIndex + ')').hide();
        if (indexToShow > this.maxIndex) {
            indexToShow = 0;
        } else if (indexToShow < 0) {
            indexToShow = this.maxIndex;
        }
        this.currentIndex = indexToShow;
        var $shot = $('#shotViewer .shot:eq(' + this.currentIndex + ')');
        $shot.show();
        $('#shotViewer #shotNumber').text($shot.children('img').attr('alt'));
    }
};
