/*!
 * jQuery hashchange event - v1.3 - 7/21/2010
 * http://benalman.com/projects/jquery-hashchange-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Script: jQuery hashchange event
//
// *Version: 1.3, Last updated: 7/21/2010*
// 
// Project Home - http://benalman.com/projects/jquery-hashchange-plugin/
// GitHub       - http://github.com/cowboy/jquery-hashchange/
// Source       - http://github.com/cowboy/jquery-hashchange/raw/master/jquery.ba-hashchange.js
// (Minified)   - http://github.com/cowboy/jquery-hashchange/raw/master/jquery.ba-hashchange.min.js (0.8kb gzipped)
// 
// About: License
// 
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
// 
// About: Examples
// 
// These working examples, complete with fully commented code, illustrate a few
// ways in which this plugin can be used.
// 
// hashchange event - http://benalman.com/code/projects/jquery-hashchange/examples/hashchange/
// document.domain - http://benalman.com/code/projects/jquery-hashchange/examples/document_domain/
// 
// About: Support and Testing
// 
// Information about what version or versions of jQuery this plugin has been
// tested with, what browsers it has been tested in, and where the unit tests
// reside (so you can test it yourself).
// 
// jQuery Versions - 1.2.6, 1.3.2, 1.4.1, 1.4.2
// Browsers Tested - Internet Explorer 6-8, Firefox 2-4, Chrome 5-6, Safari 3.2-5,
//                   Opera 9.6-10.60, iPhone 3.1, Android 1.6-2.2, BlackBerry 4.6-5.
// Unit Tests      - http://benalman.com/code/projects/jquery-hashchange/unit/
// 
// About: Known issues
// 
// While this jQuery hashchange event implementation is quite stable and
// robust, there are a few unfortunate browser bugs surrounding expected
// hashchange event-based behaviors, independent of any JavaScript
// window.onhashchange abstraction. See the following examples for more
// information:
// 
// Chrome: Back Button - http://benalman.com/code/projects/jquery-hashchange/examples/bug-chrome-back-button/
// Firefox: Remote XMLHttpRequest - http://benalman.com/code/projects/jquery-hashchange/examples/bug-firefox-remote-xhr/
// WebKit: Back Button in an Iframe - http://benalman.com/code/projects/jquery-hashchange/examples/bug-webkit-hash-iframe/
// Safari: Back Button from a different domain - http://benalman.com/code/projects/jquery-hashchange/examples/bug-safari-back-from-diff-domain/
// 
// Also note that should a browser natively support the window.onhashchange 
// event, but not report that it does, the fallback polling loop will be used.
// 
// About: Release History
// 
// 1.3   - (7/21/2010) Reorganized IE6/7 Iframe code to make it more
//         "removable" for mobile-only development. Added IE6/7 document.title
//         support. Attempted to make Iframe as hidden as possible by using
//         techniques from http://www.paciellogroup.com/blog/?p=604. Added 
//         support for the "shortcut" format $(window).hashchange( fn ) and
//         $(window).hashchange() like jQuery provides for built-in events.
//         Renamed jQuery.hashchangeDelay to <jQuery.fn.hashchange.delay> and
//         lowered its default value to 50. Added <jQuery.fn.hashchange.domain>
//         and <jQuery.fn.hashchange.src> properties plus document-domain.html
//         file to address access denied issues when setting document.domain in
//         IE6/7.
// 1.2   - (2/11/2010) Fixed a bug where coming back to a page using this plugin
//         from a page on another domain would cause an error in Safari 4. Also,
//         IE6/7 Iframe is now inserted after the body (this actually works),
//         which prevents the page from scrolling when the event is first bound.
//         Event can also now be bound before DOM ready, but it won't be usable
//         before then in IE6/7.
// 1.1   - (1/21/2010) Incorporated document.documentMode test to fix IE8 bug
//         where browser version is incorrectly reported as 8.0, despite
//         inclusion of the X-UA-Compatible IE=EmulateIE7 meta tag.
// 1.0   - (1/9/2010) Initial Release. Broke out the jQuery BBQ event.special
//         window.onhashchange functionality into a separate plugin for users
//         who want just the basic event & back button support, without all the
//         extra awesomeness that BBQ provides. This plugin will be included as
//         part of jQuery BBQ, but also be available separately.

(function($,window,undefined){
  '$:nomunge'; // Used by YUI compressor.
  
  // Reused string.
  var str_hashchange = 'hashchange',
    
    // Method / object references.
    doc = document,
    fake_onhashchange,
    special = $.event.special,
    
    // Does the browser support window.onhashchange? Note that IE8 running in
    // IE7 compatibility mode reports true for 'onhashchange' in window, even
    // though the event isn't supported, so also test document.documentMode.
    doc_mode = doc.documentMode,
    supports_onhashchange = 'on' + str_hashchange in window && ( doc_mode === undefined || doc_mode > 7 );
  
  // Get location.hash (or what you'd expect location.hash to be) sans any
  // leading #. Thanks for making this necessary, Firefox!
  function get_fragment( url ) {
    url = url || location.href;
    return '#' + url.replace( /^[^#]*#?(.*)$/, '$1' );
  };
  
  // Method: jQuery.fn.hashchange
  // 
  // Bind a handler to the window.onhashchange event or trigger all bound
  // window.onhashchange event handlers. This behavior is consistent with
  // jQuery's built-in event handlers.
  // 
  // Usage:
  // 
  // > jQuery(window).hashchange( [ handler ] );
  // 
  // Arguments:
  // 
  //  handler - (Function) Optional handler to be bound to the hashchange
  //    event. This is a "shortcut" for the more verbose form:
  //    jQuery(window).bind( 'hashchange', handler ). If handler is omitted,
  //    all bound window.onhashchange event handlers will be triggered. This
  //    is a shortcut for the more verbose
  //    jQuery(window).trigger( 'hashchange' ). These forms are described in
  //    the <hashchange event> section.
  // 
  // Returns:
  // 
  //  (jQuery) The initial jQuery collection of elements.
  
  // Allow the "shortcut" format $(elem).hashchange( fn ) for binding and
  // $(elem).hashchange() for triggering, like jQuery does for built-in events.
  $.fn[ str_hashchange ] = function( fn ) {
    return fn ? this.bind( str_hashchange, fn ) : this.trigger( str_hashchange );
  };
  
  // Property: jQuery.fn.hashchange.delay
  // 
  // The numeric interval (in milliseconds) at which the <hashchange event>
  // polling loop executes. Defaults to 50.
  
  // Property: jQuery.fn.hashchange.domain
  // 
  // If you're setting document.domain in your JavaScript, and you want hash
  // history to work in IE6/7, not only must this property be set, but you must
  // also set document.domain BEFORE jQuery is loaded into the page. This
  // property is only applicable if you are supporting IE6/7 (or IE8 operating
  // in "IE7 compatibility" mode).
  // 
  // In addition, the <jQuery.fn.hashchange.src> property must be set to the
  // path of the included "document-domain.html" file, which can be renamed or
  // modified if necessary (note that the document.domain specified must be the
  // same in both your main JavaScript as well as in this file).
  // 
  // Usage:
  // 
  // jQuery.fn.hashchange.domain = document.domain;
  
  // Property: jQuery.fn.hashchange.src
  // 
  // If, for some reason, you need to specify an Iframe src file (for example,
  // when setting document.domain as in <jQuery.fn.hashchange.domain>), you can
  // do so using this property. Note that when using this property, history
  // won't be recorded in IE6/7 until the Iframe src file loads. This property
  // is only applicable if you are supporting IE6/7 (or IE8 operating in "IE7
  // compatibility" mode).
  // 
  // Usage:
  // 
  // jQuery.fn.hashchange.src = 'path/to/file.html';
  
  $.fn[ str_hashchange ].delay = 50;
  /*
  $.fn[ str_hashchange ].domain = null;
  $.fn[ str_hashchange ].src = null;
  */
  
  // Event: hashchange event
  // 
  // Fired when location.hash changes. In browsers that support it, the native
  // HTML5 window.onhashchange event is used, otherwise a polling loop is
  // initialized, running every <jQuery.fn.hashchange.delay> milliseconds to
  // see if the hash has changed. In IE6/7 (and IE8 operating in "IE7
  // compatibility" mode), a hidden Iframe is created to allow the back button
  // and hash-based history to work.
  // 
  // Usage as described in <jQuery.fn.hashchange>:
  // 
  // > // Bind an event handler.
  // > jQuery(window).hashchange( function(e) {
  // >   var hash = location.hash;
  // >   ...
  // > });
  // > 
  // > // Manually trigger the event handler.
  // > jQuery(window).hashchange();
  // 
  // A more verbose usage that allows for event namespacing:
  // 
  // > // Bind an event handler.
  // > jQuery(window).bind( 'hashchange', function(e) {
  // >   var hash = location.hash;
  // >   ...
  // > });
  // > 
  // > // Manually trigger the event handler.
  // > jQuery(window).trigger( 'hashchange' );
  // 
  // Additional Notes:
  // 
  // * The polling loop and Iframe are not created until at least one handler
  //   is actually bound to the 'hashchange' event.
  // * If you need the bound handler(s) to execute immediately, in cases where
  //   a location.hash exists on page load, via bookmark or page refresh for
  //   example, use jQuery(window).hashchange() or the more verbose 
  //   jQuery(window).trigger( 'hashchange' ).
  // * The event can be bound before DOM ready, but since it won't be usable
  //   before then in IE6/7 (due to the necessary Iframe), recommended usage is
  //   to bind it inside a DOM ready handler.
  
  // Override existing $.event.special.hashchange methods (allowing this plugin
  // to be defined after jQuery BBQ in BBQ's source code).
  special[ str_hashchange ] = $.extend( special[ str_hashchange ], {
    
    // Called only when the first 'hashchange' event is bound to window.
    setup: function() {
      // If window.onhashchange is supported natively, there's nothing to do..
      if ( supports_onhashchange ) { return false; }
      
      // Otherwise, we need to create our own. And we don't want to call this
      // until the user binds to the event, just in case they never do, since it
      // will create a polling loop and possibly even a hidden Iframe.
      $( fake_onhashchange.start );
    },
    
    // Called only when the last 'hashchange' event is unbound from window.
    teardown: function() {
      // If window.onhashchange is supported natively, there's nothing to do..
      if ( supports_onhashchange ) { return false; }
      
      // Otherwise, we need to stop ours (if possible).
      $( fake_onhashchange.stop );
    }
    
  });
  
  // fake_onhashchange does all the work of triggering the window.onhashchange
  // event for browsers that don't natively support it, including creating a
  // polling loop to watch for hash changes and in IE 6/7 creating a hidden
  // Iframe to enable back and forward.
  fake_onhashchange = (function(){
    var self = {},
      timeout_id,
      
      // Remember the initial hash so it doesn't get triggered immediately.
      last_hash = get_fragment(),
      
      fn_retval = function(val){ return val; },
      history_set = fn_retval,
      history_get = fn_retval;
    
    // Start the polling loop.
    self.start = function() {
      timeout_id || poll();
    };
    
    // Stop the polling loop.
    self.stop = function() {
      timeout_id && clearTimeout( timeout_id );
      timeout_id = undefined;
    };
    
    // This polling loop checks every $.fn.hashchange.delay milliseconds to see
    // if location.hash has changed, and triggers the 'hashchange' event on
    // window when necessary.
    function poll() {
      var hash = get_fragment(),
        history_hash = history_get( last_hash );
      
      if ( hash !== last_hash ) {
        history_set( last_hash = hash, history_hash );
        
        $(window).trigger( str_hashchange );
        
      } else if ( history_hash !== last_hash ) {
        location.href = location.href.replace( /#.*/, '' ) + history_hash;
      }
      
      timeout_id = setTimeout( poll, $.fn[ str_hashchange ].delay );
    };
    
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    // vvvvvvvvvvvvvvvvvvv REMOVE IF NOT SUPPORTING IE6/7/8 vvvvvvvvvvvvvvvvvvv
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    $.browser.msie && !supports_onhashchange && (function(){
      // Not only do IE6/7 need the "magical" Iframe treatment, but so does IE8
      // when running in "IE7 compatibility" mode.
      
      var iframe,
        iframe_src;
      
      // When the event is bound and polling starts in IE 6/7, create a hidden
      // Iframe for history handling.
      self.start = function(){
        if ( !iframe ) {
          iframe_src = $.fn[ str_hashchange ].src;
          iframe_src = iframe_src && iframe_src + get_fragment();
          
          // Create hidden Iframe. Attempt to make Iframe as hidden as possible
          // by using techniques from http://www.paciellogroup.com/blog/?p=604.
          iframe = $('<iframe tabindex="-1" title="empty"/>').hide()
            
            // When Iframe has completely loaded, initialize the history and
            // start polling.
            .one( 'load', function(){
              iframe_src || history_set( get_fragment() );
              poll();
            })
            
            // Load Iframe src if specified, otherwise nothing.
            .attr( 'src', iframe_src || 'javascript:0' )
            
            // Append Iframe after the end of the body to prevent unnecessary
            // initial page scrolling (yes, this works).
            .insertAfter( 'body' )[0].contentWindow;
          
          // Whenever `document.title` changes, update the Iframe's title to
          // prettify the back/next history menu entries. Since IE sometimes
          // errors with "Unspecified error" the very first time this is set
          // (yes, very useful) wrap this with a try/catch block.
          doc.onpropertychange = function(){
            try {
              if ( event.propertyName === 'title' ) {
                iframe.document.title = doc.title;
              }
            } catch(e) {}
          };
          
        }
      };
      
      // Override the "stop" method since an IE6/7 Iframe was created. Even
      // if there are no longer any bound event handlers, the polling loop
      // is still necessary for back/next to work at all!
      self.stop = fn_retval;
      
      // Get history by looking at the hidden Iframe's location.hash.
      history_get = function() {
        return get_fragment( iframe.location.href );
      };
      
      // Set a new history item by opening and then closing the Iframe
      // document, *then* setting its location.hash. If document.domain has
      // been set, update that as well.
      history_set = function( hash, history_hash ) {
        var iframe_doc = iframe.document,
          domain = $.fn[ str_hashchange ].domain;
        
        if ( hash !== history_hash ) {
          // Update Iframe with any initial `document.title` that might be set.
          iframe_doc.title = doc.title;
          
          // Opening the Iframe's document after it has been closed is what
          // actually adds a history entry.
          iframe_doc.open();
          
          // Set document.domain for the Iframe document as well, if necessary.
          domain && iframe_doc.write( '<script>document.domain="' + domain + '"</script>' );
          
          iframe_doc.close();
          
          // Update the Iframe's hash, for great justice.
          iframe.location.hash = hash;
        }
      };
      
    })();
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // ^^^^^^^^^^^^^^^^^^^ REMOVE IF NOT SUPPORTING IE6/7/8 ^^^^^^^^^^^^^^^^^^^
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    
    return self;
  })();
  
})(jQuery,this);

var FORM_CHANGED_KEY = 'form_changed';
var FORM_SUBMITTED_EVENT = 'submitted';

function AjaxTree(tree, $pane) {
    var self = this;

    this.tree = tree;
    this.$pane = $pane;

    this._ignore_hash_change = false;

    // load initial pane!
    var tree_id = this.tree_id_from_hash();

    if (tree_id == null) {
        tree_id = tree.large_tree.root_tree_id;
        location.hash = 'tree::' + tree_id;
    }

    this.tree.large_tree.setCurrentNode(tree_id, function() {
        self.scroll_to_node(tree_id);
        if (tree.current().is(':not(.root-row)')) {
            tree.large_tree.expandNode(tree.current());
        }
    });

    tree.large_tree.elt.on('click', 'a.record-title', function (e) {
        var row = $(this).closest('tr');
        if (row.is('.current') && row.find('.expandme').css('visibility') !== 'hidden') {
            /* We've clicked on the title of the current row, which also has children. */
            if (row.find('.expandme .expanded').length > 0) {
                /* It was expanded, so we collapse it. */
                tree.large_tree.collapseNode(tree.current());
            } else {
                /* It was collapsed, so we expand it. */
                tree.large_tree.expandNode(tree.current());
            }
        }

        return true;
    });

    this.loadPaneForId(tree_id);
    this.setupHashChange();
}

AjaxTree.prototype.setupHashChange = function() {
    $(window).hashchange($.proxy(this.handleHashChange, this));
};

AjaxTree.prototype.tree_id_from_hash = function() {
    if (!location.hash) {
        return;
    }

    var tree_id = location.hash.replace(/^#(tree::)?/, "");

    if (TreeIds.parse_tree_id(tree_id)) {
        return tree_id;
    } else {
        return null;
    }
}

AjaxTree.prototype.handleHashChange = function(event) {
    var self = this;

    if (self._ignore_hash_change) {
        // ignored! and now stop ignoring..
        this._ignore_hash_change = false;
        return false;
    }

    var tree_id = self.tree_id_from_hash();

    if (tree_id == null) {
        return false;
    }

    self.check_for_form_changes(tree_id, function() {
        self.tree.large_tree.setCurrentNode(tree_id);

        if (tree.current().is(':not(.root-row)')) {
            tree.large_tree.expandNode(tree.current());
        }

        self.loadPaneForId(tree_id);
    });

    return false;
};

AjaxTree.prototype.loadPaneForId = function(tree_id) {
    var self = this;

    var params = {};
    params.inline = true;
    params[self.tree.large_tree.root_node_type + '_id'] = self.tree.large_tree.root_uri;

    var parsed = TreeIds.parse_tree_id(tree_id);
    var row_type = parsed.type;
    var row_id = parsed.id;

    var url = AS.app_prefix(row_type + 's' + '/' + row_id);

    if (!self.tree.large_tree.read_only) {
        url = url + "/edit";
    }

    self._ajax_the_pane(url, params, $.noop);
};

AjaxTree.prototype._ajax_the_pane = function(url, params, callback) {
    var self = this;

    var initial_location = window.location.hash;

    self.blockout_form();

    $.ajax({
        url: url,
        type: 'GET',
        data: params,
        success: function(html) {
            if (window.location.hash != initial_location) {
                return;
            }

            self.$pane.html(html);
            if (!self.tree.large_tree.read_only) {
                self.setup_ajax_form();
            }
            $(document).trigger("loadedrecordform.aspace", [self.$pane]);
            callback();
        },
        error: function(obj, errorText, errorDesc) {
            $("#object_container").html("<div class='alert alert-error'><p>An error occurred loading this form.</p><pre>"+errorDesc+"</pre></div>");
        }
    });
}


AjaxTree.prototype.setup_ajax_form = function() {
    var self = this;

    var $form = $("form", self.$pane);

    $form.ajaxForm({
        data: {
            inline: true
        },
        beforeSubmit: function(arr, $form) {
            $(".btn-primary", $form).attr("disabled","disabled");

            if ($form.data("createPlusOne")) {
                arr.push({
                    name: "plus_one",
                    value: "true",
                    required: false,
                    type: "text"
                });
            }
        },
        success: function(response, status, xhr) {
            var shouldPlusOne =  self.$pane.find('form').data('createPlusOne');

            self.$pane.html(response);

            var $form = self.setup_ajax_form();

            $(document).trigger("loadedrecordform.aspace", [self.$pane]);

            if ($form.find('.error').length > 0) {
                self.$pane.triggerHandler(FORM_SUBMITTED_EVENT, {success: false});
                self.on_form_changed();
                $(".btn-primary, .btn-cancel", $form).removeAttr("disabled");
            } else {
                self.$pane.triggerHandler(FORM_SUBMITTED_EVENT, {success: true});
                $form.data(FORM_CHANGED_KEY, false);

                var uri = $('#uri', $form).val();
                self.quietly_change_hash(TreeIds.link_url(uri));
                self.tree.large_tree.redisplayAndShow([uri], function() {
                    var tree_id = TreeIds.uri_to_tree_id(uri);
                    self.tree.large_tree.setCurrentNode(tree_id, function() {
                        self.scroll_to_node(tree_id);
                        self.tree.toolbar_renderer.notify_form_loaded($form);
                        if (shouldPlusOne) {
                            self.add_new_after(tree.current(), tree.current().data('level'));
                        }
                    });
                });
            }

            if ( $form.data("update-monitor-paused") ) {
                $form.data("update-monitor-paused", false);
            }

            // scroll back to the top
            $.scrollTo("header");
        },
        error: function(obj, errorText, errorDesc) {
            self.$pane.prepend("<div class='alert alert-error'><p>An error occurred loading this form.</p><pre>"+errorDesc+"</pre></div>");
            self.$pane.triggerHandler(FORM_SUBMITTED_EVENT, {success: false});
            $(".btn-primary", $form).removeAttr("disabled");
        }
    });

    $form.on('formchanged.aspace', function() {
        self.on_form_changed();
    });

    $form.on('click', '.revert-changes a', function() {
        var tree_id = tree.large_tree.current_tree_id;
        self.blockout_form();
        tree.toolbar_renderer.reset();
        self.scroll_to_node(tree_id);
        self.loadPaneForId(tree_id);
    });

    $form.data('createPlusOne', false);
    $form.on('click', '.btn-plus-one', function(event) {
        event.preventDefault();
        event.stopImmediatePropagation();

        $form.data("createPlusOne", true);
        $form.triggerHandler("submit");
    });

    self.tree.toolbar_renderer.notify_form_loaded($form);

    return $form;
};

AjaxTree.prototype.title_for_new_node = function() {
    if (this.tree.root_record_type == 'resource') {
        return "New Archival Object";
    } else if (this.tree.root_record_type == 'classification') {
        return "New Classification Term";
    } else if (this.tree.root_record_type == 'digital_object') {
        return "New Digital Object Component";
    } else {
        throw 'title_for_new_node does not support: ' + this.tree.root_record_type;
    }
};

AjaxTree.prototype.add_new_after = function(node, level, extra_params) {
    var self = this;

    // update the hash
    self.quietly_change_hash('new');

    // clear the toolbar
    $(self.tree.toolbar_renderer.container).empty();

    // create a new table row
    var $new_tr = $('<tr>');
    $new_tr.data('last_node', node);
    var colspan = 0;
    node.find('td').filter(':not(.title,.drag-handle,.no-drag-handle)').each(function(td) {
        colspan += $(td).attr('colspan') || 1;
    });
    var $drag = $('<td>').addClass('no-drag-handle');
    $drag.appendTo($new_tr);
    var $titleCell = $('<td>').addClass('title');
    var $indentor = $('<span>').addClass('indentor');
    $indentor.append($('<span>').addClass('glyphicon glyphicon-asterisk'));
    $indentor.appendTo($titleCell);
    $titleCell.append($('<span tabindex="0">')
              .addClass('record-title')
              .text(self.title_for_new_node()));
    $titleCell.appendTo($new_tr);
    $('<td>').attr('colspan', colspan).appendTo($new_tr);
    node.removeClass('current');
    $new_tr.addClass('current');
    $new_tr.attr('id', 'new');

    $new_tr.addClass('indent-level-'+level);

    var target_position = 0;
    var parent_id = null;
    var position = null;

    var root_node = $('#'+this.tree.large_tree.root_tree_id);
    var root_uri_parts = TreeIds.uri_to_parts(root_node.data('uri'));
    var node_uri_parts = TreeIds.uri_to_parts(node.data('uri'));

    // add the new row at the end of the target level
    if (level > node.data('level')) {
        /* We're adding a new child */
        parent_id = node_uri_parts.id;

        if (node.data('child_count') == 0) {
            /* Adding a child to a currently childless element */
            node.after($new_tr);
            $new_tr.find('.record-title')[0].focus();
        } else {
            /* Adding a child to something with existing children */
            var callback = function() {
                var endmarker = node.nextAll('.waypoint.indent-level-'+level+', .end-marker.indent-level-'+level).last();
                endmarker.after($new_tr);
                $new_tr.find('.record-title')[0].focus();
            };

            if (node.data('level') == 0) {
                /* Adding to a root node.  No need to expand. */
                callback();
            } else {
                self.tree.large_tree.expandNode(node, callback);
            }
        }
    } else {
        /* We're adding a new sibling after selected node */
        tree.large_tree.collapseNode(node);
        node.after($new_tr);
        $new_tr.find('.record-title')[0].focus();

        parent_id = node.data('parent_id');
        position = node.data('position') + 1;
    }

    var params = $.extend({}, { inline: true }, extra_params || {});

    params[root_uri_parts.type + '_id'] = root_uri_parts.id;

    if (parent_id) {
        params[node_uri_parts.type + '_id'] = parent_id;
    }

    if (position) {
        params['position'] = position;
    }

    var url = AS.app_prefix(self._new_node_form_url_for(node.data('jsonmodel_type')));

    self._ajax_the_pane(url, params, function() {
        // set form_changed = true for this new form
        self.$pane.find('form').data(FORM_CHANGED_KEY, true);

        self.$pane.find('.btn-cancel').on('click', function(event) {
            event.preventDefault();
            var tree_id= node.attr('id');
            var uri = node.data('uri');
            self.tree.large_tree.redisplayAndShow([uri], function() {
                self.tree.large_tree.setCurrentNode(tree_id, function() {
                    self.scroll_to_node(tree_id);
                });
            });

            self.quietly_change_hash('tree::'+tree_id);
            self.loadPaneForId(tree_id);
        });
    });
};

AjaxTree.prototype.check_for_form_changes = function(target_tree_id, callback) {
    var self = this;
    var $form = $("form", self.$pane);

    if ($form.data(FORM_CHANGED_KEY)) {
        var p = self.confirmChanges(target_tree_id);
        p.done(function(proceed) {
            if (proceed) {
                callback();
            } else {
                var current_tree_id = self.tree.large_tree.current_tree_id;
                self.quietly_change_hash('tree::'+current_tree_id);
            }
        });
        p.fail(function(err) {
            throw err;
        });
    } else {
        callback();
    }
};

AjaxTree.prototype.confirmChanges = function(target_tree_id) {
    var self = this;
    var $form = $("form", self.$pane);
    var current_tree_id = self.tree.large_tree.current_tree_id;

    var d = $.Deferred();

    // open save your changes modal
    AS.openCustomModal("saveYourChangesModal", "Save Changes", AS.renderTemplate("save_changes_modal_template"));

    $("#saveChangesButton", "#saveYourChangesModal").on("click", function() {
        $('.btn', '#saveYourChangesModal').addClass('disabled');

        var onSubmitSuccess = function() {
            $form.data(FORM_CHANGED_KEY, false);
            $("#saveYourChangesModal").modal("hide");
            d.resolve(true);
        };

        var onSubmitError = function() {
            $("#saveYourChangesModal").modal("hide");
            d.resolve(false);
        };

        self.$pane.one(FORM_SUBMITTED_EVENT, function(event, data) {
            if (data.success) {
                onSubmitSuccess();
            } else {
                onSubmitError();
            }
        });

        $form.triggerHandler("submit");
    });

    $("#dismissChangesButton", "#saveYourChangesModal").on("click", function() {
        $form.data("form_changed", false);

        $("#saveYourChangesModal").modal("hide");
        var tree_id = self.tree_id_from_hash();
        var uri = $('#' + tree_id).data('uri');

        self.tree.large_tree.redisplayAndShow([uri], function() {
            self.tree.large_tree.setCurrentNode(tree_id, function() {
                self.scroll_to_node(tree_id);
            });
        });
        d.resolve(true);
    });

    $(".btn-cancel", "#saveYourChangesModal").on("click", function() {
        d.resolve(false);
    });

    return d.promise();
};

AjaxTree.prototype.quietly_change_hash = function(tree_id) {
    // only change the hash if we need to!
    if (location.hash != tree_id) {
        this._ignore_hash_change = true;
        location.hash = tree_id;
    }
};


AjaxTree.prototype.hide_form = function() {
    this.$pane.hide();
}

AjaxTree.prototype.show_form = function() {
    this.unblockout_form();
    this.$pane.show();
}

AjaxTree.prototype.blockout_form = function() {
    var self = this;
    if (self.$pane.has('.blockout').length > 0) {
        return;
    }
    var $blockout = $('<div>').addClass('blockout');
    $blockout.height(self.$pane.height());
    // add 30 to take into account for outer margin :/
    $blockout.width(self.$pane.width() + 30);
    $blockout.css('left', '-15px');
    self.$pane.prepend($blockout);
};

AjaxTree.prototype.unblockout_form = function() {
    this.$pane.find('.blockout').remove();
};

AjaxTree.prototype.on_form_changed = function() {
    var $form = this.$pane.find('form');
    if (!$form.data(FORM_CHANGED_KEY)) {
        $form.data(FORM_CHANGED_KEY, true);
        self.tree.toolbar_renderer.notify_form_changed($form);
    }
};

AjaxTree.prototype._new_node_form_url_for = function(jsonmodel_type) {
    if (jsonmodel_type == 'resource' || jsonmodel_type == 'archival_object') {
        return '/archival_objects/new';
    } else if (jsonmodel_type == 'digital_object' || jsonmodel_type == 'digital_object_component') {
        return '/digital_object_components/new';
    } else if (jsonmodel_type == 'classification' || jsonmodel_type == 'classification_term') {
        return '/classification_terms/new';
    } else {
        throw 'No new form available for: '+ jsonmodel_type;
    }
};

AjaxTree.prototype.scroll_to_node = function(tree_id) {
    var self = this;
    var midpoint = (self.tree.large_tree.elt.height() - $('#'+tree_id).height()) / 2;
    self.tree.large_tree.elt.scrollTo('#'+tree_id, 0, {offset: -midpoint});
}
;
function BaseRenderer() {
    this.endpointMarkerTemplate = $('<div class="table-row end-marker" />');

    this.rootTemplate = $('<div class="table-row"> ' +
                          '  <div class="table-cell no-drag-handle"></div>' +
                          '  <div class="table-cell title"></div>' +
                          '</div>');


    this.nodeTemplate = $('<div class="table-row"> ' +
                          '  <div class="table-cell drag-handle"></div>' +
                          '  <div class="table-cell title"><span class="indentor"><button class="expandme" aria-expanded="false"><i class="expandme-icon glyphicon glyphicon-chevron-right" /></button></span> </div>' +
                          '</div>');
}

BaseRenderer.prototype.endpoint_marker = function () {
    return this.endpointMarkerTemplate.clone(true);
}

BaseRenderer.prototype.get_root_template = function () {
    return this.rootTemplate.clone(false);
}


BaseRenderer.prototype.get_node_template = function () {
    return this.nodeTemplate.clone(false);
};

BaseRenderer.prototype.i18n = function (enumeration, enumeration_value) {
    return EnumerationTranslations.t(enumeration, enumeration_value);
};


function ResourceRenderer() {
    BaseRenderer.call(this);

    this.rootTemplate = $('<div class="table-row"> ' +
                          '  <div class="table-cell no-drag-handle"></div>' +
                          '  <div class="table-cell title"></div>' +
                          '  <div class="table-cell resource-level"></div>' +
                          '  <div class="table-cell resource-type"></div>' +
                          '  <div class="table-cell resource-container"></div>' +
                          '  <div class="table-cell resource-identifier"></div>' +
                          '</div>');

    this.nodeTemplate = $('<div class="table-row"> ' +
                          '  <div class="table-cell drag-handle"></div>' +
                          '  <div class="table-cell title"><span class="indentor"><button class="expandme" aria-expanded="false"><i class="expandme-icon glyphicon glyphicon-chevron-right" /></button></span> </div>' +
                          '  <div class="table-cell resource-level"></div>' +
                          '  <div class="table-cell resource-type"></div>' +
                          '  <div class="table-cell resource-container"></div>' +
                          '  <div class="table-cell resource-identifier"></div>' +
                          '</div>');
}

ResourceRenderer.prototype = Object.create(BaseRenderer.prototype);

ResourceRenderer.prototype.add_root_columns = function (row, rootNode) {
    var level = this.i18n('archival_record_level', rootNode.level);
    var type = this.build_type_summary(rootNode);
    var container_summary = this.build_container_summary(rootNode);

    if (rootNode.parsed_title) {
        row.find('.title .record-title').html(rootNode.parsed_title);
    }

    if (false && rootNode.identifier) {
      row.find('.resource-identifier').text(rootNode.identifier).attr('title', rootNode.identifier);
    }

    row.find('.resource-level').text(level).attr('title', level);
    row.find('.resource-type').text(type).attr('title', type);
    row.find('.resource-container').text(container_summary).attr('title', container_summary);
}


ResourceRenderer.prototype.add_node_columns = function (row, node) {
    var title = this.build_node_title(node);
    var level = this.i18n('archival_record_level', node.level);
    var type = this.build_type_summary(node);
    var container_summary = this.build_container_summary(node);

    row.find('.title .record-title').html(title).attr('title', title);

    if (false && node.identifier) {
      row.find('.resource-identifier').text(node.identifier).attr('title', node.identifier);
    }

    row.find('.resource-level').text(level).attr('title', level);
    row.find('.resource-type').text(type).attr('title', type);
    row.find('.resource-container').text(container_summary).attr('title', container_summary);
};


ResourceRenderer.prototype.build_node_title = function(node) {
  return build_node_title(node);
};


ResourceRenderer.prototype.build_type_summary = function(node) {
    var self = this;
    var type_summary = '';

    if (node['containers']) {
        var types = []

        $.each(node['containers'], function(_, container) {
            types.push(self.i18n('instance_instance_type', container['instance_type']));
        });

        type_summary = types.join(', ');
    }

    return type_summary;
};


ResourceRenderer.prototype.build_container_summary = function(node) {
    var self = this;
    var container_summary = '';

    if (node['containers']) {
        var container_summaries = []

        $.each(node['containers'], function(_, container) {
            var summary_items = []
            if (container.top_container_indicator) {
                var top_container_summary = '';

                if (container.top_container_type) {
                    top_container_summary += self.i18n('container_type', container.top_container_type) + ': ';
                }

                top_container_summary += container.top_container_indicator;

                if (container.top_container_barcode) {
                    top_container_summary += ' [' + container.top_container_barcode + ']';
                }

                summary_items.push(top_container_summary);
            }
            if (container.type_2) {
                summary_items.push(self.i18n('container_type', container.type_2) + ': ' + container.indicator_2);
            }
            if (container.type_3) {
                summary_items.push(self.i18n('container_type', container.type_3) + ': ' + container.indicator_3);
            }
            if (summary_items.length > 0) {
                container_summaries.push(summary_items.join(', '));
            }
        });

        container_summary = container_summaries.join('; ');
    }

    return container_summary;
};


function DigitalObjectRenderer() {
    BaseRenderer.call(this);


    this.rootTemplate = $('<div class="table-row"> ' +
                          '  <div class="table-cell no-drag-handle"></div>' +
                          '  <div class="table-cell title"></div>' +
                          '  <div class="table-cell digital-object-type"></div>' +
                          '  <div class="table-cell file-uri-summary"></div>' +
                          '</div>');


    this.nodeTemplate = $('<div class="table-row"> ' +
                          '  <div class="table-cell drag-handle"></div>' +
                          '  <div class="table-cell title"><span class="indentor"><button class="expandme" aria-expanded="false"><i class="expandme-icon glyphicon glyphicon-chevron-right" /></button></span> </div>' +
                          '  <div class="table-cell digital-object-type"></div>' +
                          '  <div class="table-cell file-uri-summary"></div>' +
                          '</div>');
}

DigitalObjectRenderer.prototype = new BaseRenderer();

DigitalObjectRenderer.prototype.add_root_columns = function (row, rootNode) {
    if (rootNode.digital_object_type) {
        var type = this.i18n('digital_object_digital_object_type', rootNode.digital_object_type);
        row.find('.digital-object-type').text(type).attr('title', type);
    }

    if (rootNode.file_uri_summary) {
        row.find('.file-uri-summary').text(rootNode.file_uri_summary).attr('title', rootNode.file_uri_summary);
    }

    if (rootNode.parsed_title) {
        row.find('.title .record-title').html(rootNode.parsed_title)
    }
}

DigitalObjectRenderer.prototype.add_node_columns = function (row, node) {
    var title = this.build_node_title(node);

    row.find('.title .record-title').html(title).attr('title', title);
    row.find('.file-uri-summary').text(node.file_uri_summary).attr('title', node.file_uri_summary);
};

DigitalObjectRenderer.prototype.build_node_title = function(node) {
  return build_node_title(node);
};

function ClassificationRenderer() {
    BaseRenderer.call(this);
};

ClassificationRenderer.prototype = new BaseRenderer();

ClassificationRenderer.prototype.add_root_columns = function (row, rootNode) {
    var title = this.build_title(rootNode);
    row.find('.title .record-title').text(title).attr('title', title);
};

ClassificationRenderer.prototype.add_node_columns = function (row, node) {
    var title = this.build_title(node);
    row.find('.title .record-title').text(title).attr('title', title);
};

ClassificationRenderer.prototype.build_title = function(node) {
    return [node.identifier, node.title].join('. ');
};

function build_node_title(node) {
  var title_bits = [];

  if (node.parsed_title) {
    title_bits.push(node.parsed_title);
  } else if (node.title) {
    title_bits.push(node.title);
  };

  if (node.label) {
    title_bits.push(node.label);
  };

  if (node.dates && node.dates.length > 0) {
    node.dates.forEach(function(date) {
      if (date.expression) {
        if (date.type === 'bulk') {
          title_bits.push('bulk: ' + date.expression);
        } else {
          title_bits.push(date.expression);
        };
      } else if (date.begin && date.end) {
        if (date.type === 'bulk') {
          title_bits.push('bulk: ' + date.begin + '-' + date.end);
        } else {
          title_bits.push(date.begin + '-' + date.end);
        };
      } else if (date.begin) {
        if (date.type === 'bulk') {
          title_bits.push('bulk: ' + date.begin);
        } else {
          title_bits.push(date.begin);
        };
      };
    });
  };

  return title_bits.join(', ');
};
var SHARED_TOOLBAR_ACTIONS = [
    {
        label: 'Enable Reorder Mode',
        cssClasses: 'btn-default drag-toggle',
        onRender: function(btn, node, tree, toolbarRenderer) {
            if ($(tree.large_tree.elt).is('.drag-enabled')) {
                $(btn).addClass('active').addClass('btn-success');

                $(btn).text('Disable Reorder Mode');

                tree.ajax_tree.hide_form();
            }
        },
        onToolbarRendered: function(btn, toolbarRenderer) {
            if ($(tree.large_tree.elt).is('.drag-enabled')) {
                $('.btn:not(.drag-toggle,.finish-editing,.cut-selection,.paste-selection,.move-node)',toolbarRenderer.container).hide();
                $('.cut-selection',toolbarRenderer.container).removeClass('disabled');
                if ($('.cut', tree.large_tree.elt).length > 0) {
                    $('.paste-selection',toolbarRenderer.container).removeClass('disabled');
                }
            }
        },
        onClick: function(event, btn, node, tree, toolbarRenderer) {
            $(tree.large_tree.elt).toggleClass('drag-enabled');
            $(event.target).toggleClass('btn-success');

            if ($(tree.large_tree.elt).is('.drag-enabled')) {
                $(btn).text('Disable Reorder Mode');
                tree.ajax_tree.hide_form();
                $.scrollTo(0);
                tree.resizer.maximize(DRAGDROP_HOTSPOT_HEIGHT);
                $('.btn:not(.drag-toggle,.finish-editing)',toolbarRenderer.container).hide();
                $('.cut-selection,.paste-selection,.move-node', toolbarRenderer.container).show();
                $('.cut-selection,.move-node',toolbarRenderer.container).removeClass('disabled');
            } else {
                $(btn).text('Enable Reorder Mode');
                location.reload(true);
                tree.resizer.reset();
                $('.btn',toolbarRenderer.container).show();
                $('.cut-selection,.paste-selection,.move-node', toolbarRenderer.container).hide();
                $(btn).blur();
            }

            $('#load_via_spreadsheet_help_icon').toggle();
        },
        isEnabled: function(node, tree, toolbarRenderer) {
            return true;
        },
        isVisible: function(node, tree, toolbarRenderer) {
            return !tree.large_tree.read_only;
        },
        onFormChanged: function(btn, form, tree, toolbarRenderer) {
            $(btn).addClass('disabled');
        },
        onFormLoaded: function(btn, form, tree, toolbarRenderer) {
            if ($(tree.large_tree.elt).is('.drag-enabled')) {
                tree.ajax_tree.blockout_form();
            }
        },
    },
    [
        {
            label: 'Cut',
            cssClasses: 'btn-default cut-selection',
            onRender: function(btn, node, tree, toolbarRenderer) {
                if (!$(tree.large_tree.elt).is('.drag-enabled')) {
                    btn.hide();
                }
            },
            onClick: function(event, btn, node, tree, toolbarRenderer) {
                event.preventDefault();
                // clear the previous cut set
                $('.cut', tree.large_tree.elt).removeClass('cut');

                var rowsToCut = [];
                if (tree.dragdrop.rowsToMove.length > 0) {
                    // if multiselected rows, cut them
                    rowsToCut = $.merge([], tree.dragdrop.rowsToMove);
                } else if (tree.current().is(':not(.root-row)')) {
                    // otherwise cut the current row
                    rowsToCut = [tree.current()];
                }

                if (rowsToCut.length > 0) {
                    $.each(rowsToCut, function(_, row) {
                        $(row).addClass('cut');
                    });

                    $('.paste-selection', toolbarRenderer.container).removeClass('disabled');
                }

                tree.dragdrop.resetState();
            },
            isEnabled: function(node, tree, toolbarRenderer) {
                return true;
            },
            isVisible: function(node, tree, toolbarRenderer) {
                return !tree.large_tree.read_only && tree.dragdrop;
            }
        },
        {
            label: 'Paste',
            cssClasses: 'btn-default paste-selection',
            onRender: function(btn, node, tree, toolbarRenderer) {
                if (!$(tree.large_tree.elt).is('.drag-enabled')) {
                    btn.hide();
                } else if ($('.cut', $(tree.large_tree.elt)).length == 0) {
                    btn.addClass('disabled');
                }
            },
            onClick: function(event, btn, node, tree, toolbarRenderer) {
                event.preventDefault();
                var current = tree.current();
                var cut = $('.cut', tree.large_tree.elt);

                var rowsToPaste = [];
                cut.each(function(_,row) {
                    if ($(row).data('uri') != current.data('uri')) {
                        rowsToPaste.push(row);
                    }
                });

                tree.large_tree.reparentNodes(current, rowsToPaste, current.data('child_count')).done(function() {
                    $('.cut', tree.large_tree.elt).removeClass('cut');
                    toolbarRenderer.reset();
                });
            },
            isEnabled: function(node, tree, toolbarRenderer) {
                return true;
            },
            isVisible: function(node, tree, toolbarRenderer) {
                return !tree.large_tree.read_only && tree.dragdrop;
            }
        },
    ],
    {
        label: 'Move <span class="caret"></span>',
        cssClasses: 'btn-default dropdown-toggle move-node',
        groupCssClasses: 'dropdown',
        onRender: function(btn, node, tree, toolbarRenderer) {
            if (!$(tree.large_tree.elt).is('.drag-enabled')) {
                btn.hide();
            }
            var level = node.data('level');
            var position = node.data('position');

            var $options = $('<ul>').addClass('dropdown-menu ');
            // move up a level
            if (level > 1) {
                var $li = $('<li>');
                $li.append($('<a>').attr('href', 'javascript:void(0);').
                                    addClass('move-node move-node-up-level').
                                    text('Up a Level'));
                $options.append($li);
            }

            var $prevAtLevel = node.prevAll('.largetree-node.indent-level-'+level+':first');
            var $nextAtLevel = node.nextAll('.largetree-node.indent-level-'+level+':first');

            // move up on same level
            if ($prevAtLevel.length > 0) {
                var $li = $('<li>');
                $li.append($('<a>').attr('href', 'javascript:void(0);')
                                   .addClass('move-node move-node-up')
                                   .text('Up'));
                $options.append($li);
            }
            // move down on same level
            if ($nextAtLevel.length > 0) {
                var $li = $('<li>');
                $li.append($('<a>').attr('href', 'javascript:void(0);')
                                   .addClass('move-node move-node-down')
                                   .text('Down'));
                $options.append($li);
            }
            // move down into sibling
            if ($prevAtLevel.length > 0 || $nextAtLevel.length > 0) {
                var $li = $('<li>').addClass('dropdown-submenu');
                $li.append($('<a>').attr('href', 'javascript:void(0);')
                    .text('Down Into...'));
                $options.append($li);

                var $siblingsMenu = $('<ul>').addClass('dropdown-menu').addClass('move-node-into-menu');

                var $siblingsAbove = $.makeArray(node.prevAll('.largetree-node.indent-level-'+level));
                var $siblingsBelow = $.makeArray(node.nextAll('.largetree-node.indent-level-'+level));

                var NUMBER_OF_SIBLINGS_TO_LIST = 20;
                var HALF_THE_NUMBER_OF_SIBLINGS_TO_LIST = parseInt(NUMBER_OF_SIBLINGS_TO_LIST/2);
                var $siblingsToAddToMenu = [];
                if ($siblingsAbove.length > HALF_THE_NUMBER_OF_SIBLINGS_TO_LIST && $siblingsBelow.length > HALF_THE_NUMBER_OF_SIBLINGS_TO_LIST) {
                    $siblingsToAddToMenu = $.merge($siblingsAbove.slice(0, HALF_THE_NUMBER_OF_SIBLINGS_TO_LIST ).reverse(),
                                                   $siblingsBelow.slice(0, HALF_THE_NUMBER_OF_SIBLINGS_TO_LIST));
                } else if ($siblingsAbove.length > HALF_THE_NUMBER_OF_SIBLINGS_TO_LIST) {
                    $siblingsToAddToMenu = $.merge($siblingsAbove.slice(0, NUMBER_OF_SIBLINGS_TO_LIST - $siblingsBelow.length).reverse(),
                                                   $siblingsBelow);
                } else if ($siblingsBelow.length > HALF_THE_NUMBER_OF_SIBLINGS_TO_LIST) {
                    $siblingsToAddToMenu = $.merge($siblingsAbove.reverse(),
                                                   $siblingsBelow.slice(0, NUMBER_OF_SIBLINGS_TO_LIST - $siblingsAbove.length));
                } else {
                    $siblingsToAddToMenu = $.merge($siblingsAbove.reverse(), $siblingsBelow);
                }

                for (var i = 0; i < $siblingsToAddToMenu.length; i++) {
                    var $sibling = $($siblingsToAddToMenu[i]);
                    var $subli = $('<li>');
                    $subli.append($('<a>').attr('href', 'javascript:void(0);')
                        .addClass('move-node move-node-down-into')
                        .attr('data-uri', $sibling.data('uri'))
                        .attr('data-tree_id', $sibling.attr('id'))
                        .text($sibling.find('.record-title').text().trim()));
                    $siblingsMenu.append($subli);
                }

                $siblingsMenu.appendTo($li);
            }
            $options.appendTo(btn.closest('.btn-group'));

            if ($options.is(':empty')) {
                // node has no parent or siblings so has nowhere to move
                // remove the toolbar action if this is the case
                btn.remove();
            }

            $options.on('click', '.move-node-up-level', function(event) {
                // move node to last child of parent
                var $new_parent = node.prevAll('.indent-level-'+(level-2)+":first");
                tree.large_tree.reparentNodes($new_parent, node, $new_parent.data('child_count')).done(function() {
                    toolbarRenderer.reset();
                });
            }).on('click', '.move-node-up', function(event) {
                // move node above nearest sibling
                var $parent = node.prevAll('.indent-level-'+(level-1)+":first");
                var $prev = node.prevAll('.indent-level-'+(level)+":first");
                tree.large_tree.reparentNodes($parent, node, $prev.data('position')).done(function() {
                    toolbarRenderer.reset();
                });
            }).on('click', '.move-node-down', function(event) {
                // move node below nearest sibling
                var $parent = node.prevAll('.indent-level-'+(level-1)+":first");
                var $next = node.nextAll('.indent-level-'+(level)+":first");
                tree.large_tree.reparentNodes($parent, node, $next.data('position')+1).done(function() {
                    toolbarRenderer.reset();
                });
            }).on('click', '.move-node-down-into', function(event) {
                // move node to last child of sibling
                var $parent = $('#'+$(this).data('tree_id'));
                tree.large_tree.reparentNodes($parent, node, $parent.data('child_count')).done(function() {
                    toolbarRenderer.reset();
                });
            });

            btn.attr('data-toggle', 'dropdown');
        },
        isEnabled: function(node, tree, toolbarRenderer) {
            return true;
        },
        isVisible: function(node, tree, toolbarRenderer) {
            // not available to root nodes
            if (node.is('.root-row')) {
                return false;
            }

            return !tree.large_tree.read_only && tree.dragdrop;
        },
    },

    // go back to the read only page
    {
        label: 'Close Record',
        cssClasses: 'btn-success finish-editing',
        groupCssClasses: 'pull-right',
        onRender: function(btn, node, tree, toolbarRenderer) {
            var readonlyPath = location.pathname.replace(/\/edit$/, '');
            btn.attr('href', readonlyPath + location.hash);
        },
        isEnabled: function(node, tree, toolbarRenderer) {
            return true;
        },
        isVisible: function(node, tree, toolbarRenderer) {
            return !tree.large_tree.read_only;
        }
    },
];

var TreeToolbarConfiguration = {
    resource: [].concat(SHARED_TOOLBAR_ACTIONS).concat([
        {
            label: 'Add Child',
            cssClasses: 'btn-default',
            onClick: function(event, btn, node, tree, toolbarRenderer) {
                tree.ajax_tree.add_new_after(node, node.data('level') + 1);
            },
            isEnabled: function(node, tree, toolbarRenderer) {
                return true;
            },
            isVisible: function(node, tree, toolbarRenderer) {
                return !tree.large_tree.read_only;
            },
            onFormLoaded: function(btn, form, tree, toolbarRenderer) {
                $(btn).removeClass('disabled');
            },
            onToolbarRendered: function(btn, toolbarRenderer) {
                $(btn).addClass('disabled');
            },
        },
        {
            label: 'Load via Spreadsheet',
            cssClasses: 'btn-default',
            onClick: function(event, btn, node, tree, toolbarRenderer) {
                file_modal_html = '';
			    bulkFileSelection();
            },
            isEnabled: function(node, tree, toolbarRenderer) {
                return true;
            },
            isVisible: function(node, tree, toolbarRenderer) {
                return !tree.large_tree.read_only;
            },
            onFormLoaded: function(btn, form, tree, toolbarRenderer) {
                $(btn).removeClass('disabled');
            },
            onToolbarRendered: function(btn, toolbarRenderer) {
                $(btn).addClass('disabled');

                const inReorderMode = $('#tree-container').hasClass('drag-enabled');

                if (!inReorderMode) {
                  $(btn).after(AS.renderTemplate('template_load_via_spreadsheet_help_icon'));

                  const helpLinkID = '#load_via_spreadsheet_help_icon';
                  $(helpLinkID).hover(
                    () => $(helpLinkID).tooltip('show'),
                    () => $(helpLinkID).tooltip('hide')
                  );
                }
            },
        },
        // RDE
        {
            label: 'Rapid Data Entry',
            cssClasses: 'btn-default add-children',
            onClick: function(event, btn, node, tree, toolbarRenderer) {
                $(document).triggerHandler("rdeshow.aspace", [node, btn]);
            },
            isEnabled: function(node, tree, toolbarRenderer) {
                return true;
            },
            isVisible: function(node, tree, toolbarRenderer) {
                return !tree.large_tree.read_only;
            },
            onFormLoaded: function(btn, form, tree, toolbarRenderer) {
                $(btn).removeClass('disabled');
            },
            onToolbarRendered: function(btn, toolbarRenderer) {
                $(btn).addClass('disabled');
            },
        }
    ]),

    archival_object: [].concat(SHARED_TOOLBAR_ACTIONS).concat([
        [
            {
                label: 'Add Child',
                cssClasses: 'btn-default',
                onClick: function(event, btn, node, tree, toolbarRenderer) {
                    tree.ajax_tree.add_new_after(node, node.data('level') + 1);
                },
                isEnabled: function(node, tree, toolbarRenderer) {
                    return true;
                },
                isVisible: function(node, tree, toolbarRenderer) {
                    return !tree.large_tree.read_only;
                },
                onFormLoaded: function(btn, form, tree, toolbarRenderer) {
                    $(btn).removeClass('disabled');
                },
                onToolbarRendered: function(btn, toolbarRenderer) {
                    $(btn).addClass('disabled');
                },
            },
            {
                label: 'Add Sibling',
                cssClasses: 'btn-default',
                onClick: function(event, btn, node, tree, toolbarRenderer) {
                    tree.ajax_tree.add_new_after(node, node.data('level'));
                },
                isEnabled: function(node, tree, toolbarRenderer) {
                    return true;
                },
                isVisible: function(node, tree, toolbarRenderer) {
                    return !tree.large_tree.read_only;
                },
                onFormLoaded: function(btn, form, tree, toolbarRenderer) {
                    $(btn).removeClass('disabled');
                },
                onToolbarRendered: function(btn, toolbarRenderer) {
                    $(btn).addClass('disabled');
                },
            },

        {
            label: 'Load via Spreadsheet',
            cssClasses: 'btn-default',
            onClick: function(event, btn, node, tree, toolbarRenderer) {
                file_modal_html = '';
			    bulkFileSelection();
            },
            isEnabled: function(node, tree, toolbarRenderer) {
                return true;
            },
            isVisible: function(node, tree, toolbarRenderer) {
                return !tree.large_tree.read_only;
            },
            onFormLoaded: function(btn, form, tree, toolbarRenderer) {
                $(btn).removeClass('disabled');
            },
            onToolbarRendered: function(btn, toolbarRenderer) {
                $(btn).addClass('disabled');

                const inReorderMode = $('#tree-container').hasClass('drag-enabled');

                if (!inReorderMode) {
                  $(btn).after(AS.renderTemplate('template_load_via_spreadsheet_help_icon'));

                  const helpLinkID = '#load_via_spreadsheet_help_icon';
                  $(helpLinkID).hover(
                    () => $(helpLinkID).tooltip('show'),
                    () => $(helpLinkID).tooltip('hide')
                  );
                }
            },
        }
        ],
        {
            label: 'Transfer',
            cssClasses: 'btn-default dropdown-toggle transfer-node',
            groupCssClasses: 'dropdown',
            onRender: function(btn, node, tree, toolbarRenderer) {
                var $li = btn.parent();
                btn.replaceWith(AS.renderTemplate('tree_toolbar_transfer_action', {
                                    node_id: TreeIds.uri_to_parts(node.data('uri')).id,
                                    root_object_id: TreeIds.uri_to_parts(tree.large_tree.root_uri).id,
                                }));
                $(".linker:not(.initialised)", $li).linker()

                var $form = $li.find('form');
                $form.on('submit', function(event) {
                    if ($(this).serializeObject()['transfer[ref]']) {
                        // continue with the POST
                        return;
                    } else {
                        event.stopPropagation();
                        event.preventDefault();
                        $(".missing-ref-message", $form).show();
                        return true;
                    }
                }).on('click', '.btn-cancel', function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    $(this).closest('.btn-group.dropdown').toggleClass("open");
                }).on('click', ':input', function(event) {
                    event.stopPropagation();
                }).on("click", ".dropdown-toggle", function(event) {
                    event.stopPropagation();
                    $(this).parent().toggleClass("open");
                });
                $li.on('shown.bs.dropdown', function() {
                    $("#token-input-transfer_ref_", $form).focus();
                });
            },
            isVisible: function(node, tree, toolbarRenderer) {
                return !tree.large_tree.read_only;
            },
        },
        // RDE
        {
            label: 'Rapid Data Entry',
            cssClasses: 'btn-default add-children',
            onClick: function(event, btn, node, tree, toolbarRenderer) {
                $(document).triggerHandler("rdeshow.aspace", [node, btn]);
            },
            isEnabled: function(node, tree, toolbarRenderer) {
                return true;
            },
            isVisible: function(node, tree, toolbarRenderer) {
                return !tree.large_tree.read_only;
            },
            onFormLoaded: function(btn, form, tree, toolbarRenderer) {
                $(btn).removeClass('disabled');
            },
            onToolbarRendered: function(btn, toolbarRenderer) {
                $(btn).addClass('disabled');
            },
        }
    ]),

    digital_object: [].concat(SHARED_TOOLBAR_ACTIONS).concat([
        {
            label: 'Add Child',
            cssClasses: 'btn-default',
            onClick: function(event, btn, node, tree, toolbarRenderer) {
                tree.ajax_tree.add_new_after(node, node.data('level') + 1);
            },
            isEnabled: function(node, tree, toolbarRenderer) {
                return true;
            },
            isVisible: function(node, tree, toolbarRenderer) {
                return !tree.large_tree.read_only;
            },
            onFormLoaded: function(btn, form, tree, toolbarRenderer) {
                $(btn).removeClass('disabled');
            },
            onToolbarRendered: function(btn, toolbarRenderer) {
                $(btn).addClass('disabled');
            },
        },
        // RDE
        {
            label: 'Rapid Data Entry',
            cssClasses: 'btn-default add-children',
            onClick: function(event, btn, node, tree, toolbarRenderer) {
                $(document).triggerHandler("rdeshow.aspace", [node, btn]);
            },
            isEnabled: function(node, tree, toolbarRenderer) {
                return true;
            },
            isVisible: function(node, tree, toolbarRenderer) {
                return !tree.large_tree.read_only;
            },
            onFormLoaded: function(btn, form, tree, toolbarRenderer) {
                $(btn).removeClass('disabled');
            },
            onToolbarRendered: function(btn, toolbarRenderer) {
                $(btn).addClass('disabled');
            },
        }
    ]),

    digital_object_component: [].concat(SHARED_TOOLBAR_ACTIONS).concat([
        [
            {
                label: 'Add Child',
                cssClasses: 'btn-default',
                onClick: function(event, btn, node, tree, toolbarRenderer) {
                    tree.ajax_tree.add_new_after(node, node.data('level') + 1);
                },
                isEnabled: function(node, tree, toolbarRenderer) {
                    return true;
                },
                isVisible: function(node, tree, toolbarRenderer) {
                    return !tree.large_tree.read_only;
                },
                onFormLoaded: function(btn, form, tree, toolbarRenderer) {
                    $(btn).removeClass('disabled');
                },
                onToolbarRendered: function(btn, toolbarRenderer) {
                    $(btn).addClass('disabled');
                },
            },
            {
                label: 'Add Sibling',
                cssClasses: 'btn-default',
                onClick: function(event, btn, node, tree, toolbarRenderer) {
                    tree.ajax_tree.add_new_after(node, node.data('level'));
                },
                isEnabled: function(node, tree, toolbarRenderer) {
                    return true;
                },
                isVisible: function(node, tree, toolbarRenderer) {
                    return !tree.large_tree.read_only;
                },
                onFormLoaded: function(btn, form, tree, toolbarRenderer) {
                    $(btn).removeClass('disabled');
                },
                onToolbarRendered: function(btn, toolbarRenderer) {
                    $(btn).addClass('disabled');
                },
            },
            // RDE
            {
                label: 'Rapid Data Entry',
                cssClasses: 'btn-default',
                onClick: function(event, btn, node, tree, toolbarRenderer) {
                    $(document).triggerHandler("rdeshow.aspace", [node, btn]);
                },
                isEnabled: function(node, tree, toolbarRenderer) {
                    return true;
                },
                isVisible: function(node, tree, toolbarRenderer) {
                    return !tree.large_tree.read_only;
                },
                onFormLoaded: function(btn, form, tree, toolbarRenderer) {
                    $(btn).removeClass('disabled');
                },
                onToolbarRendered: function(btn, toolbarRenderer) {
                    $(btn).addClass('disabled');
                },
            }
        ]
    ]),

    classification: [].concat(SHARED_TOOLBAR_ACTIONS).concat([
        {
            label: 'Add Child',
            cssClasses: 'btn-default',
            onClick: function(event, btn, node, tree, toolbarRenderer) {
                tree.ajax_tree.add_new_after(node, node.data('level') + 1);
            },
            isEnabled: function(node, tree, toolbarRenderer) {
                return true;
            },
            isVisible: function(node, tree, toolbarRenderer) {
                return !tree.large_tree.read_only;
            },
            onFormLoaded: function(btn, form, tree, toolbarRenderer) {
                $(btn).removeClass('disabled');
            },
            onToolbarRendered: function(btn, toolbarRenderer) {
                $(btn).addClass('disabled');
            },
        }
    ]),

    classification_term: [].concat(SHARED_TOOLBAR_ACTIONS).concat([
        [
            {
                label: 'Add Child',
                cssClasses: 'btn-default',
                onClick: function(event, btn, node, tree, toolbarRenderer) {
                    tree.ajax_tree.add_new_after(node, node.data('level') + 1);
                },
                isEnabled: function(node, tree, toolbarRenderer) {
                    return true;
                },
                isVisible: function(node, tree, toolbarRenderer) {
                    return !tree.large_tree.read_only;
                },
                onFormLoaded: function(btn, form, tree, toolbarRenderer) {
                    $(btn).removeClass('disabled');
                },
                onToolbarRendered: function(btn, toolbarRenderer) {
                    $(btn).addClass('disabled');
                },
            },
            {
                label: 'Add Sibling',
                cssClasses: 'btn-default',
                onClick: function(event, btn, node, tree, toolbarRenderer) {
                    tree.ajax_tree.add_new_after(node, node.data('level'));
                },
                isEnabled: function(node, tree, toolbarRenderer) {
                    return true;
                },
                isVisible: function(node, tree, toolbarRenderer) {
                    return !tree.large_tree.read_only;
                },
                onFormLoaded: function(btn, form, tree, toolbarRenderer) {
                    $(btn).removeClass('disabled');
                },
                onToolbarRendered: function(btn, toolbarRenderer) {
                    $(btn).addClass('disabled');
                },
            },
        ]
    ]),
};

function TreeToolbarRenderer(tree, container) {
    this.tree = tree;
    this.container = container;
}

TreeToolbarRenderer.prototype.reset = function() {
    if (this.current_node) {
        this.render(this.current_node);
    }
};

TreeToolbarRenderer.prototype.reset_callbacks = function() {
    this.on_form_changed_callbacks = [];
    this.on_form_loaded_callbacks = [];
    this.on_toolbar_rendered_callbacks = [];
};

TreeToolbarRenderer.prototype.render = function(node) {
    var self = this;

    if (self.current_node) {
        self.reset_callbacks();
    }

    self.current_node = node;

    var actions = TreeToolbarConfiguration[node.data('jsonmodel_type')];
    self.container.empty();

    if (actions == null) {
        return
    }

    self.reset_callbacks();

    actions.map(function(action_or_group) {
        if (!$.isArray(action_or_group)) {
            action_group = [action_or_group];
        } else {
            action_group = action_or_group;
        }
        var $group = $('<div>').addClass('btn-group');
        self.container.append($group);

        action_group.map(function(action) {
            if (action.isVisible == undefined || $.proxy(action.isVisible, tree)(node, tree, self)) {
                var $btn = $('<a>').addClass('btn btn-xs');
                $btn.html(action.label).addClass(action.cssClasses).attr('href', 'javascript:void(0)');

                if (action.isEnabled == undefined || $.proxy(action.isEnabled, tree)(node, tree, self)) {
                    if (action.onClick) {
                        $btn.on('click', function (event) {
                            return $.proxy(action.onClick, tree)(event, $btn, node, tree, self);
                        });
                    }
                } else {
                    $btn.addClass('disabled');
                }

                if (action.groupCssClasses) {
                    $group.addClass(action.groupCssClasses);
                }

                if (action.onFormChanged) {
                    self.on_form_changed_callbacks.push(function(form) {
                        $.proxy(action.onFormChanged, tree)($btn, form, tree, self);
                    });
                }

                if (action.onFormLoaded) {
                    self.on_form_loaded_callbacks.push(function(form) {
                        $.proxy(action.onFormLoaded, tree)($btn, form, tree, self);
                    });
                }

                if (action.onToolbarRendered) {
                    self.on_toolbar_rendered_callbacks.push(function() {
                        $.proxy(action.onToolbarRendered, tree)($btn, self);
                    });
                }

                $group.append($btn);

                if (action.onRender) {
                    $.proxy(action.onRender, tree)($btn, node, tree, self);
                }
            }
        });

        if ($group.length == 0) {
            $group.remove();
        }
    });

    $.each(self.on_toolbar_rendered_callbacks, function(i, callback) {
        callback();
    });
};

TreeToolbarRenderer.prototype.notify_form_changed = function(form) {
    $.each(this.on_form_changed_callbacks, function(i, callback) {
        callback(form);
    });
};

TreeToolbarRenderer.prototype.notify_form_loaded = function(form) {
    $.each(this.on_form_loaded_callbacks, function(i, callback) {
        callback(form);
    });
};
/*jshint eqnull:true */
/*!
 * jQuery Cookie Plugin v1.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2011, Klaus Hartl
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */

(function($, document) {

	var pluses = /\+/g;
	function raw(s) {
		return s;
	}
	function decoded(s) {
		return decodeURIComponent(s.replace(pluses, ' '));
	}

	$.cookie = function(key, value, options) {

		// key and at least value given, set cookie...
		if (arguments.length > 1 && (!/Object/.test(Object.prototype.toString.call(value)) || value == null)) {
			options = $.extend({}, $.cookie.defaults, options);

			if (value == null) {
				options.expires = -1;
			}

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setDate(t.getDate() + days);
			}

			value = String(value);

			return (document.cookie = [
				encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// key and possibly options given, get cookie...
		options = value || $.cookie.defaults || {};
		var decode = options.raw ? raw : decoded;
		var cookies = document.cookie.split('; ');
		for (var i = 0, parts; (parts = cookies[i] && cookies[i].split('=')); i++) {
			if (decode(parts.shift()) === key) {
				return decode(parts.join('='));
			}
		}
		return null;
	};

	$.cookie.defaults = {};

})(jQuery, document);

var DEFAULT_TREE_PANE_HEIGHT = 100;
var DEFAULT_TREE_MIN_HEIGHT = 60;

function TreeResizer(tree, container, label) {
  this.tree = tree;
  this.container = container;
  this.label = label;

  this.setup();
}

TreeResizer.prototype.setup = function () {
  var self = this;

  self.resize_handle = $('<div class="ui-resizable-handle ui-resizable-s" />');
  self.container.after(self.resize_handle);

  self.container.resizable({
    handles: {
      s: self.resize_handle,
    },
    minHeight: DEFAULT_TREE_MIN_HEIGHT,
    resize: function (event, ui) {
      self.resize_handle.removeClass('maximized');
      self.set_height(ui.size.height);
    },
  });

  self.$toggle = $('<button>').addClass('tree-resize-toggle');
  self.$toggle
    .attr('aria-expanded', 'false')
    .attr('title', self.label)
    .attr('aria-label', self.label);
  self.resize_handle.append(self.$toggle);

  self.$toggle.on('click', function () {
    self.toggle_height();
  });

  self.reset();
};

TreeResizer.prototype.get_height = function () {
  if (AS.prefixed_cookie('archives-tree-container::height')) {
    return AS.prefixed_cookie('archives-tree-container::height');
  } else {
    return DEFAULT_TREE_PANE_HEIGHT;
  }
};

TreeResizer.prototype.set_height = function (height) {
  AS.prefixed_cookie('archives-tree-container::height', height);
};

TreeResizer.prototype.maximize = function (margin) {
  if (margin === undefined) {
    margin = 50;
  }

  this.resize_handle.addClass('maximized');
  this.container.height(
    $(window).height() - margin - this.container.offset().top
  );
};

TreeResizer.prototype.reset = function () {
  this.container.height(this.get_height());
};

TreeResizer.prototype.minimize = function () {
  this.resize_handle.removeClass('maximized');
  this.container.height(DEFAULT_TREE_MIN_HEIGHT);
  document.body.scrollTop =
    this.tree.toolbar_renderer.container.offset().top - 5;
};

TreeResizer.prototype.maximized = function () {
  return this.resize_handle.is('.maximized');
};

TreeResizer.prototype.toggle_height = function () {
  var self = this;

  if (self.maximized()) {
    self.minimize();
    self.$toggle.attr('aria-expanded', 'false');
  } else {
    self.maximize();
    self.$toggle.attr('aria-expanded', 'true');
  }
};
(function (exports) {
    "use strict";

    /************************************************************************/
    /* Tree ID helpers  */
    /************************************************************************/
    var TreeIds = {}

    TreeIds.uri_to_tree_id = function (uri) {
        var parts = TreeIds.uri_to_parts(uri);
        return parts.type + '_' + parts.id;
    }

    TreeIds.uri_to_parts = function (uri) {
        var last_part = uri.replace(/\/repositories\/[0-9]+\//,"");
        var bits = last_part.match(/([a-z_]+)\/([0-9]+)/);
        var type_plural = bits[1].replace(/\//g,'_');
        var id = bits[2];
        var type = type_plural.replace(/s$/, '');

        return {
            type: type,
            id: id
        };
    }

    TreeIds.backend_uri_to_frontend_uri = function (uri) {
        return AS.app_prefix(uri.replace(/\/repositories\/[0-9]+\//, ""))
    }

    TreeIds.parse_tree_id = function (tree_id) {
        var regex_match = tree_id.match(/([a-z_]+)([0-9]+)/);
        if (regex_match == null || regex_match.length != 3) {
            return;
        }

        var row_type = regex_match[1].replace(/_$/, "");
        var row_id = regex_match[2];

        return {type: row_type, id: row_id}
    }

    TreeIds.link_url = function(uri) {
        // convert the uri into tree-speak
        return "#tree::" + TreeIds.uri_to_tree_id(uri);
    };

    exports.TreeIds = TreeIds
    /************************************************************************/


    var SCROLL_DELAY_MS = 100;
    var THRESHOLD_EMS = 300;

    function LargeTree(datasource, container, root_uri, read_only, renderer, tree_loaded_callback, node_selected_callback) {
        this.source = datasource;
        this.elt = container;
        this.scrollTimer = undefined;
        this.renderer = renderer;

        this.progressIndicator = $('<progress class="largetree-progress-indicator" />');
        this.elt.before(this.progressIndicator);

        this.elt.css('will-change', 'transform');

        this.root_uri = root_uri;
        this.root_tree_id = TreeIds.uri_to_tree_id(root_uri);

        // default to the root_id
        this.current_tree_id = this.root_tree_id;

        this.read_only = read_only;

        this.waypoints = {};

        this.node_selected_callback = node_selected_callback;
        this.populateWaypointHooks = [];
        this.collapseNodeHooks = [];

        this.errorHandler = $.noop;

        this.initEventHandlers();
        this.renderRoot(function (rootNode) {
            tree_loaded_callback(rootNode);
        });
    }

    LargeTree.prototype.setGeneralErrorHandler = function (callback) {
        this.errorHandler = callback;
    };

    LargeTree.prototype.currentlyLoading = function () {
        this.progressIndicator.css('visibility', 'visible');
    }

    LargeTree.prototype.doneLoading = function () {
        var self = this;
        setTimeout(function () {
            self.progressIndicator.css('visibility', 'hidden');
        }, 0);
    }


    LargeTree.prototype.addPlugin = function (plugin) {
        plugin.initialize(this);

        return plugin;
    };

    LargeTree.prototype.addPopulateWaypointHook = function (callback) {
        this.populateWaypointHooks.push(callback);
    };

    LargeTree.prototype.addCollapseNodeHook = function (callback) {
        this.collapseNodeHooks.push(callback);
    };

    LargeTree.prototype.displayNode = function (tree_id, done_callback) {
        var self = this;

        var node_id = TreeIds.parse_tree_id(tree_id).id;

        var displaySelectedNode = function () {
            var node = $('#' + tree_id);

            if (done_callback) {
                done_callback(node);
            }
        };

        if (tree_id === self.root_tree_id) {
            /* We don't need to do any fetching for the root node. */
            displaySelectedNode();
        } else {
            self.source.fetchPathFromRoot(node_id).done(function (paths) {
                self.recursivelyPopulateWaypoints(paths[node_id], displaySelectedNode);
            });
        }
    };

    LargeTree.prototype.reparentNodes = function (new_parent, nodes, position) {
        var self = this;

        if (!self.isReparentAllowed(nodes, new_parent)) {
            // This move is not allowed!
            // alert user
            AS.openQuickModal("Unable to perform move",
                              "The move has been disallowed as a parent cannot become its own child.")

            return {
                'done' : $.noop
            };
        }

        var scrollPosition = self.elt.scrollTop();
        var loadingMask = self.displayLoadingMask(scrollPosition)

        var parent_uri = new_parent.data('uri');

        if (!parent_uri) {
            parent_uri = this.root_uri;
        }

        if (position) {
            /* If any of the nodes we're moving were originally siblings that
            fall before the drop target, we need to adjust the position for the
            fact that everything will "shift up" when they're moved */
            var positionAdjustment = 0;

            $(nodes).each(function (idx, elt) {
                var level = $(elt).data('level');
                var node_parent_uri = $(elt).parent('.table-row-group').prevAll('.indent-level-' + (level - 1) + ':first').data('uri');

                if (!node_parent_uri) {
                    node_parent_uri = self.root_uri;
                }

                if (node_parent_uri == parent_uri && $(elt).data('position') < position) {
                    positionAdjustment += 1;
                }
            });

            position -= positionAdjustment;
        } else {
            position = 0;
        }

        /* Record some information about the current state of the tree so we can
           revert things to more-or-less how they were once we reload. */
        var uris_to_reopen = [];


        /* Refresh the drop target */
        if (new_parent.data('uri') && !new_parent.is('.root-row')) {
            uris_to_reopen.push(new_parent.data('uri'));
        }

        /* Reopen the parent of any nodes we dragged from */
        $(nodes).each(function (idx, elt) {
            var level = $(elt).data('level');
            var parent_uri = $(elt).parent('.table-row-group').prevAll('.indent-level-' + (level - 1) + ':first').data('uri');

            if (parent_uri) {
                uris_to_reopen.push(parent_uri);
            } else {
                /* parent was root node */
            }
        });

        /* Reopen any other nodes that were open */
        self.elt.find('.expandme .expanded').closest('tr').each(function (idx, elt) {
            uris_to_reopen.push($(elt).data('uri'));
        });

        var uris_to_move = [];
        $(nodes).each(function (_, elt) {
            uris_to_move.push($(elt).data('uri'));
        });

        return this.source.reparentNodes(parent_uri,
                                         uris_to_move,
                                         position)
            .done(function () {
                self.redisplayAndShow(uris_to_reopen, function () {
                    self.considerPopulatingWaypoint(function () {
                        self.elt.animate({
                            scrollTop: scrollPosition
                        }, function(){
                            loadingMask.remove();
                        });

                        $(nodes).each(function (i, node) {
                            var id = $(node).attr('id');
                            self.elt.find('#' + id).addClass('reparented-highlight');

                            setTimeout(function () {
                                self.elt.find('#' + id).removeClass('reparented-highlight').addClass('reparented');
                            }, 500);
                        });
                    });
                });
            });
    };

    LargeTree.prototype.displayLoadingMask = function (scrollPosition) {
        var self = this;

        var loadingMask = self.elt.clone(false);

        loadingMask.on('click', function (e) { e.preventDefault(); return false; });

        loadingMask.find('*').removeAttr('id');
        loadingMask.attr('id', 'tree-container-loading');
        loadingMask.css('z-index', 2000)
                   .css('position', 'absolute')
                   .css('left', self.elt.offset().left)
                   .css('top', self.elt.offset().top);

        loadingMask.width(self.elt.width());

        var spinner = $('<div class="spinner" />');
        spinner.css('font-size', '50px')
               .css('display', 'inline')
               .css('z-index', 2500)
               .css('position', 'fixed')
               .css('margin', 0)
               .css('left', '50%')
               .css('top', '50%');


        $('body').prepend(loadingMask);
        $('body').prepend(spinner);

        loadingMask.scrollTop(scrollPosition);

        return {
            remove: function () {
                loadingMask.remove();
                spinner.remove();
            }
        };
    };

    LargeTree.prototype.redisplayAndShow = function(uris, done_callback) {
        var self = this;

        uris = $.unique(uris);

        if (!done_callback) {
            done_callback = $.noop;
        }

        self.renderRoot(function () {
            var uris_to_reopen = uris.slice(0)
            var displayedNodes = [];

            var handle_next_uri = function (node) {
                if (node) {
                    displayedNodes.push(node);
                }

                if (uris_to_reopen.length == 0) {
                    /* Finally, expand any nodes that haven't been expanded along the way */
                    var expand_next = function (done_callback) {
                        if (displayedNodes.length > 0) {
                            var node = displayedNodes.shift();
                            if (node.is('.root-row')) {
                                done_callback();
                            } else {
                                self.expandNode(node, function () {
                                    expand_next(done_callback);
                                });
                            }
                        } else {
                            done_callback();
                        }
                    };

                    return expand_next(function () {
                        return done_callback();
                    });
                }

                var uri = uris_to_reopen.shift();
                var tree_id = TreeIds.uri_to_tree_id(uri);

                self.displayNode(tree_id, handle_next_uri);
            };

            handle_next_uri();
        });
    };

    LargeTree.prototype.recursivelyPopulateWaypoints = function (path, done_callback) {
        var self = this;

        /*
           Here, `path` is a list of objects like:

             node: /some/uri; offset: NN

           which means "expand subtree /some/uri then populate waypoint NN".

           The top-level is special because we automatically show it as expanded, so we skip expanding the root node.
         */

        if (!path || path.length === 0) {
            done_callback();
            return;
        }

        var waypoint_description = path.shift();

        var next_fn = function () {
            if (!self.waypoints[waypoint_description.node]) {
                throw "An error occurred while expanding.";
            }

            var waypoint = self.waypoints[waypoint_description.node][waypoint_description.offset];

            if (!waypoint) {
                throw "An error occurred while expanding.";
            }

            self.populateWaypoint(waypoint, function () {
                self.recursivelyPopulateWaypoints(path, done_callback);
            });
        };

        if (waypoint_description.node) {
            var tree_id = TreeIds.uri_to_tree_id(waypoint_description.node);

            if ($('#' + tree_id).find('.expandme').find('.expanded').length > 0) {
                next_fn();
            } else {
                self.toggleNode($('#' + tree_id).find('.expandme'), next_fn);
            }
        } else {
            /* this is the root node (subtree already expanded) */
            next_fn();
        }
    };

    LargeTree.prototype.deleteWaypoints = function (parent) {
        var waypoint = parent.nextUntil('.table-row').find('.waypoint').first();

        if (!waypoint.hasClass('waypoint')) {
            /* Nothing left to burn */
            return false;
        }

        if (!waypoint.hasClass('populated')) {
            waypoint.remove();

            return true;
        }

        var waypointLevel = waypoint.data('level');

        if (!waypointLevel) {
            return false;
        }

        /* Delete all elements up to and including the end waypoint marker */
        while (true) {
            var elt = waypoint.next();

            if (elt.length === 0) {
                break;
            }

            if (elt.hasClass('end-marker') && waypointLevel == elt.data('level')) {
                elt.remove();
                break;
            } else {
                elt.remove();
            }
        }

        waypoint.remove();

        return true;
    };

    LargeTree.prototype.toggleNode = function (button, done_callback) {
        var self = this;
        var parent = button.closest('.table-row');

        if (button.data('expanded')) {
            self.collapseNode(parent, done_callback);
        } else {
            self.expandNode(parent, done_callback);
        }
    };

    LargeTree.prototype.expandNode = function (row, done_callback) {
        var self = this;
        var button = row.find('.expandme');

        if (button.data('expanded')) {
            if (done_callback) {
                done_callback();
            }
            return;
        }

        $(button).data('expanded', true);
        button.attr('aria-expanded', 'true');
        button.find('.expandme-icon').addClass('expanded');

        if (!row.data('uri')) {
            throw "Can't expand node because uri is unknown";
        }

        self.source.fetchNode(row.data('uri'))
            .done(function (node) {
                self.appendWaypoints(row, row.data('uri'), node.waypoints, node.waypoint_size, row.data('level') + 1);

                if (done_callback) {
                    setTimeout(done_callback, 100);
                }
            })
            .fail(function () {
                self.errorHandler.apply(self, ['fetch_node_failed'].concat([].slice.call(arguments)));
            });
    };

    LargeTree.prototype.collapseNode = function (row, done_callback) {
        var self = this;
        while (self.deleteWaypoints(row)) {
            /* Remove the elements from one or more waypoints */
        }

        var button = row.find('.expandme');

        $(button).data('expanded', false);
        button.attr('aria-expanded', 'false');
        button.find('.expandme-icon').removeClass('expanded');

        /* Removing elements might have scrolled something else into view */
        setTimeout(function () {
            self.considerPopulatingWaypoint();
        }, 0);

        $(self.collapseNodeHooks).each(function (idx, hook) {
            hook();
        });

        if (done_callback) {
            done_callback();
        }
    };

    LargeTree.prototype.initEventHandlers = function () {
        var self = this;
        var currentlyExpanding = false;

        /* Content loading */
        this.elt.on('scroll', function (event) {
            if (self.scrollTimer) {
                clearTimeout(self.scrollTimer);
            }

            var handleScroll = function () {
                if (!currentlyExpanding) {
                    currentlyExpanding = true;

                    self.considerPopulatingWaypoint(function () {
                        currentlyExpanding = false;
                    });
                }
            };

            self.scrollTimer = setTimeout(handleScroll, SCROLL_DELAY_MS);
        });

        /* Expand/collapse nodes */
        $(this.elt).on('click', '.expandme', function (e) {
            e.preventDefault();
            self.toggleNode($(this));
        });
    };

    LargeTree.prototype.makeWaypoint = function (uri, offset, indentLevel) {
        var result = $('<div class="table-row waypoint" />');
        result.addClass('indent-level-' + indentLevel);

        result.data('level', indentLevel);
        result.data('uri', uri);
        result.data('offset', offset);

        if (!this.waypoints[uri]) {
            this.waypoints[uri] = {};
        }

        /* Keep a lookup table of waypoints so we can find and populate them programmatically */
        this.waypoints[uri][offset] = result;

        return result;
    };

    LargeTree.prototype.appendWaypoints = function (elt, parentURI, waypointCount, waypointSize, indentLevel) {
        var child_count = elt.data('child_count');
        for (var i = waypointCount - 1; i >= 0; i--) {
            var waypoint = this.makeWaypoint(parentURI, i, indentLevel);

            waypoint.data('child_count_at_this_level', child_count);

            /* We force the line height to a constant 2em so we can predictably
               guess how tall to make waypoints.  See largetree.less for where we
               set this on table.td elements. */
            waypoint.css('height', (waypointSize * 2) + 'em');
            var group_wrapper = $('<div role="list" class="table-row-group"></div>');
            elt.after(group_wrapper);
            group_wrapper.wrapInner(waypoint);
        }

        var self = this;
        setTimeout(function () {self.considerPopulatingWaypoint(); }, 0);
    };

    LargeTree.prototype.renderRoot = function (done_callback) {
        var self = this;
        self.waypoints = {};

        var rootList = $('<div class="table root" role="list"/>');

        this.source.fetchRootNode().done(function (rootNode) {
            var row = self.renderer.get_root_template();

            row.data('uri', rootNode.uri);
            row.attr('id', TreeIds.uri_to_tree_id(rootNode.uri));
            row.addClass('root-row');
            row.attr('role', 'listitem');
            row.data('level', 0);
            row.data('child_count', rootNode.child_count);
            row.data('jsonmodel_type', rootNode.jsonmodel_type);
            row.find('.title').append($('<a>').attr('href', TreeIds.link_url(rootNode.uri))
                                              .addClass('record-title')
                                              .text(rootNode.title));

            rootList.append(row);
            self.appendWaypoints(row, null, rootNode.waypoints, rootNode.waypoint_size, 1);
            /* Remove any existing table */
            self.elt.find('div.root').remove();

            self.elt.prepend(rootList);
            self.renderer.add_root_columns(row, rootNode);
            if (done_callback) {
                /* Note that this will fire before the waypoint nodes are loaded */
                done_callback(rootNode);
            }
        });
    };

    LargeTree.prototype.considerPopulatingWaypoint = function (done_callback) {
        var self = this;

        if (!done_callback) {
            done_callback = $.noop;
        }

        var emHeight = parseFloat($("body").css("font-size"));
        var threshold_px = emHeight * THRESHOLD_EMS;
        var containerTop = this.elt.offset().top;
        var containerHeight = this.elt.outerHeight();

        /* Pick a reasonable guess at which waypoint we might want to populate
           (based on our scroll position) */
        var allWaypoints = self.elt.find('.waypoint');

        if (allWaypoints.length == 0) {
            done_callback();
            return;
        }

        var scrollPercent = self.elt.scrollTop() / self.elt.find('div.root').height();
        var startIdx = Math.floor(scrollPercent * allWaypoints.length);

        var waypointToPopulate;
        var evaluateWaypointFn = function (elt) {
            /* The element's top is measured from the top of the page, but we
               want it relative to the top of the container.  Adjust as
               appropriate. */
            var eltTop = elt.offset().top - containerTop;
            var eltBottom = eltTop + elt.height();

            var waypointVisible = (Math.abs(eltTop) <= (containerHeight + threshold_px)) ||
                                  (Math.abs(eltBottom) <= (containerHeight + threshold_px)) ||
                                  (eltTop < 0 && eltBottom > 0);

            if (waypointVisible) {
                var candidate = {
                    elt: elt,
                    top: eltTop,
                    level: elt.data('level'),
                };

                if (!waypointToPopulate) {
                    waypointToPopulate = candidate;
                } else {
                    if (waypointToPopulate.level > candidate.level || waypointToPopulate.top > candidate.top) {
                        waypointToPopulate = candidate;
                    }
                }

                return true;
            } else {
                return false;
            }
        };

        /* Search for a waypoint by scanning backwards */
        for (var i = startIdx; i >= 0; i--) {
            var waypoint = $(allWaypoints[i]);

            if (waypoint.hasClass('populated')) {
                /* nothing to do for this one */
                continue;
            }

            var waypointWasVisible = evaluateWaypointFn(waypoint);

            if (!waypointWasVisible && i < startIdx) {
                /* No point considering waypoints even further up in the DOM */
                break;
            }
        }

        /* Now scan forwards */
        for (var i = startIdx + 1; i < allWaypoints.length; i++) {
            var waypoint = $(allWaypoints[i]);

            if (waypoint.hasClass('populated')) {
                /* nothing to do for this one */
                continue;
            }

            var waypointWasVisible = evaluateWaypointFn(waypoint);

            if (!waypointWasVisible) {
                /* No point considering waypoints even further up in the DOM */
                break;
            }
        }

        if (waypointToPopulate) {
            self.currentlyLoading();
            self.populateWaypoint(waypointToPopulate.elt, function () {
                setTimeout(function () {
                    self.considerPopulatingWaypoint(done_callback);
                }, 0);
            });
        } else {
            self.doneLoading();
            done_callback();
        }
    };

    var activeWaypointPopulates = {};

    LargeTree.prototype.populateWaypoint = function (elt, done_callback) {
        if (elt.hasClass('populated')) {
            done_callback();
            return;
        }

        var self = this;
        var uri = elt.data('uri');
        var offset = elt.data('offset');
        var level = elt.data('level');

        var key = uri + "_" + offset;
        if (activeWaypointPopulates[key]) {
            return;
        }

        activeWaypointPopulates[key] = true;

        this.source.fetchWaypoint(uri, offset).done(function (nodes) {
            var endMarker = self.renderer.endpoint_marker();
            endMarker.data('level', level);
            endMarker.data('child_count_at_this_level', elt.data('child_count_at_this_level'));
            endMarker.addClass('indent-level-' + level);
            elt.after(endMarker);

            var newRows = [];
            var current = undefined;

            $(nodes).each(function (idx, node) {
                var row = self.renderer.get_node_template();

                row.addClass('largetree-node indent-level-' + level);
                row.data('level', level);
                row.data('child_count', node.child_count);
                var button = row.find('.expandme');
                row.attr('role', 'listitem');
                var title = row.find('.title');
                var strippedTitle = $("<div>").html(node.title).text();
                title.append($('<a class="record-title" />').prop('href', TreeIds.link_url(node.uri)).text(node.title));
                button.append($('<span class="sr-only" />').text(strippedTitle));
                title.attr('title', strippedTitle);

                var ex = row.find('.expandme');
                if (node.child_count === 0) {
                    ex.css('visibility', 'hidden');
                    ex.attr('aria-hidden', 'true');
                }

                self.renderer.add_node_columns(row, node);

                var tree_id = TreeIds.uri_to_tree_id(node.uri);

                row.data('uri', node.uri);
                row.data('jsonmodel_type', node.jsonmodel_type);
                row.data('position', node.position);
                row.data('parent_id', node.parent_id);
                row.attr('id', tree_id);

                if (self.current_tree_id == tree_id) {
                    row.addClass('current');
                    current = row;
                } else {
                    row.removeClass('current');
                }

                newRows.push(row);
            });

            elt.after.apply(elt, newRows);

            elt.addClass('populated');

            activeWaypointPopulates[key] = false;

            $(self.populateWaypointHooks).each(function (idx, hook) {
                hook();
            });

            if (current) {
                $.proxy(self.node_selected_callback, self)(current, self);
            }

            done_callback();
        });
    };

    /*********************************************************************************/
    /* Data source */
    /*********************************************************************************/
    function TreeDataSource(baseURL) {
        this.url = baseURL.replace(/\/+$/, "");
    }


    TreeDataSource.prototype.urlFor = function (action) {
        return this.url + "/" + action;
    };

    TreeDataSource.prototype.fetchRootNode = function () {
        var self = this;

        return $.ajax(this.urlFor("root"),
                      {
                          method: "GET",
                          dataType: 'json',
                      })
                .done(function (rootNode) {
                    self.cachePrecomputedWaypoints(rootNode);
                });
    };

    TreeDataSource.prototype.fetchNode = function (uri) {
        var self = this;

        if (!uri) {
            throw "Node can't be empty!";
        }

        return $.ajax(this.urlFor("node"),
                      {
                          method: "GET",
                          dataType: 'json',
                          data: {
                              node: uri,
                          }
                      })
                .done(function (node) {
                    self.cachePrecomputedWaypoints(node);
                });
    };

    TreeDataSource.prototype.fetchPathFromRoot = function (node_id) {
        var self = this;

        return $.ajax(this.urlFor("node_from_root"),
                      {
                          method: "GET",
                          dataType: 'json',
                          data: {
                              node_ids: [node_id],
                          }
                      });
    };

    TreeDataSource.prototype.fetchWaypoint = function (uri, offset) {
        var cached = this.getPrecomputedWaypoint(uri, offset);

        if (cached) {
            return {
                done: function (callback) {
                    callback(cached);
                }
            };
        } else {
            return $.ajax(this.urlFor("waypoint"),
                          {
                              method: "GET",
                              dataType: 'json',
                              data: {
                                  node: uri,
                                  offset: offset,
                              }
                          });
        }
    };

    TreeDataSource.prototype.reparentNodes = function (new_parent_uri, node_uris, position) {
        var target = TreeIds.backend_uri_to_frontend_uri(new_parent_uri);

        return $.ajax(target + "/accept_children",
               {
                   method: 'POST',
                   data: {
                       children: node_uris,
                       index: position,
                   }
               });
    };

    var precomputedWaypoints = {};

    TreeDataSource.prototype.getPrecomputedWaypoint = function (uri, offset) {
        var result;

        if (uri === null) {
            uri = "";
        }

        if (precomputedWaypoints[uri] && precomputedWaypoints[uri][offset]) {
            result = precomputedWaypoints[uri][offset];
            precomputedWaypoints[uri] = {};
        }

        return result;
    };

    TreeDataSource.prototype.cachePrecomputedWaypoints = function (node) {
        $(Object.keys(node.precomputed_waypoints)).each(function (idx, uri) {
            precomputedWaypoints[uri] = node.precomputed_waypoints[uri];
        });
    };

    LargeTree.prototype.setCurrentNode = function(tree_id, callback) {
        $('#'+this.current_tree_id, this.elt).removeClass('current');
        this.current_tree_id = tree_id;

        if ($('#'+this.current_tree_id, this.elt).length == 1) {
            var current = $('#'+this.current_tree_id, this.elt);
            current.addClass('current');
            $.proxy(this.node_selected_callback, self)(current, this);
            if (callback) {
                callback();
            }
        } else {
            this.displayNode(this.current_tree_id, callback);
        }
    };

    LargeTree.prototype.isReparentAllowed = function(nodes_to_move, target_node) {
        var self = this;

        if (target_node.is('.root-row')) {
            // always able to drop onto root node
            return true;
        }

        var uris_to_check = [];
        uris_to_check.push(target_node.data('uri'));
        var level = target_node.data('level') - 1;
        var row = target_node;
        while (level > 0) {
            row = row.prevAll('.largetree-node.indent-level-' + level + ':first');
            uris_to_check.push(row.data('uri'));
            level -= 1;
        }

        var isAllowed = true;

        $(nodes_to_move).each(function (idx, selectedRow) {
            var uri = $(selectedRow).data('uri');
            if ($.inArray(uri, uris_to_check) >= 0) {
                isAllowed = false;
                return;
            }
        });

        return isAllowed;

    };


    exports.LargeTree = LargeTree;
    exports.TreeDataSource = TreeDataSource;

}(window));
(function (exports) {
    var DRAG_DELAY = 100;
    var MOUSE_OFFSET = 20;
    var EXPAND_DELAY = 200;
    var HOTSPOT_HEIGHT = 200;
    var AUTO_SCROLL_SPEED = 200;

    function LargeTreeDragDrop(large_tree) {
        this.dragActive = false;
        this.dragIndicator = $('<div class="tree-drag-indicator" />');
        this.rowsToMove = [];

        this.scrollUpHotspot = $('<div class="tree-scroll-hotspot tree-scroll-up-hotspot" />');
        this.scrollDownHotspot = $('<div class="tree-scroll-hotspot tree-scroll-down-hotspot" />');

        this.dragDelayTimer = undefined;
        this.expandTimer = undefined;
        this.autoScrollTimer = undefined;

        this.lastCursorPosition = undefined;

        this.large_tree = large_tree;

        var self = this;
        large_tree.addCollapseNodeHook(function () {
            self.handleCollapseNode();
        });

    }

    LargeTreeDragDrop.prototype.handleCollapseNode = function() {
        var self = this;

        /* If any of our rowsToMove selections are no longer visible, deselect them. */
        var selectionToKeep = [];

        $(self.rowsToMove).each(function (idx, selectedRow) {
            if ($(selectedRow).is(':visible')) {
                selectionToKeep.push(selectedRow);
            }
        });

        self.rowsToMove = selectionToKeep;

        /* Renumber any remaining selections */
        self.refreshAnnotations();
    };

    LargeTreeDragDrop.prototype.isDropAllowed = function(target_node) {
        return this.large_tree.isReparentAllowed(this.rowsToMove, target_node);
    };

    LargeTreeDragDrop.prototype.setDragHandleState = function () {
        var self = this;

        $('.drag-handle.drag-disabled', self.largetree.elt).removeClass('drag-disabled');
        $('.multiselected-row', self.largetree.elt).removeClass('multiselected-row');

        /* Mark the children of each selected row as unselectable */
        $(self.rowsToMove).each(function (idx, selectedRow) {
            var waypoint = $(selectedRow).next();

            while (waypoint.hasClass('waypoint')) {
                if (waypoint.hasClass('populated')) {
                    var startLevel = waypoint.data('level');

                    var elt = waypoint.next();
                    while (!elt.hasClass('end-marker') && elt.data('level') >= startLevel) {
                        elt.find('.drag-handle').addClass('drag-disabled');
                        elt = elt.next();
                    }

                    waypoint = elt.next();
                } else {
                    waypoint = waypoint.next();
                }
            }
        });

        /* Mark the ancestors of each selected row as unselectable */
        $(self.rowsToMove).each(function (idx, selectedRow) {
            var next = $(selectedRow);
            var level = next.data('level') - 1;

            while (level > 0) {
                next = next.prevAll('.largetree-node.indent-level-' + level + ':first');
                next.find('.drag-handle').addClass('drag-disabled');
                level -= 1;
            }
        });

        /* Highlight selected rows */
        $('.multiselected', self.largetree.elt).closest('.table-row').addClass('multiselected-row');

        self.refreshAnnotations();
    };

    LargeTreeDragDrop.prototype.refreshAnnotations = function() {
        var self = this;

        self.large_tree.elt.find('.drag-annotation').remove();
        self.rowsToMove.map(function (elt, idx) {
            var $annotation = $('<div>').addClass('drag-annotation');

            if (self.rowsToMove.length > 1) {
                /* Only show selection number if there's more than one selection. */
                $annotation.text(idx + 1);
            }

            $annotation.appendTo($(elt).find('.table-cell:first'));
        });
    };

    LargeTreeDragDrop.prototype.handleMultiSelect = function (selection) {
        var self = this;
        var row = selection.closest('.table-row');

        if (selection.hasClass('multiselected')) {
            /* deselect a selected item */
            self.rowsToMove = self.rowsToMove.filter(function (elt) {
                return (elt != row[0]);
            });

            selection.removeClass('multiselected');
        } else {
            /* Add this item to the selection */
            selection.addClass('multiselected');
            self.rowsToMove.push(row[0]);
        }

        self.setDragHandleState();

        return false;
    };

    LargeTreeDragDrop.prototype.handleShiftSelect = function (selection) {
        var self = this;

        var row = selection.closest('.table-row');
        var lastSelection = self.rowsToMove[self.rowsToMove.length - 1];

        if (lastSelection) {
            var start = $(lastSelection);
            var end = row;

            if (start.index() > end.index()) {
                /* Oops.  Swap them. */
                var tmp = end;
                end = start;
                start = tmp;
            }

            var rowsInRange = start.nextUntil(end).andSelf().add(end);
            var targetLevel = $(lastSelection).data('level');

            rowsInRange.each(function (i, row) {
                if ($(row).is('.largetree-node')) {
                    if (!$(row).is('.multiselected') && $(row).data('level') === targetLevel) {
                        $(row).find('.drag-handle').addClass('multiselected');
                        self.rowsToMove.push(row);
                    }
                }
            });

            self.rowsToMove = $.unique(self.rowsToMove);

            self.setDragHandleState();
        }

        return false;
    };

    LargeTreeDragDrop.prototype.initialize = function (largetree) {
        var self = this;

        self.largetree = largetree;

        largetree.addPopulateWaypointHook(function () {
            /* Make sure none of the descendants of any multi-selected node can
               be selected */
            self.setDragHandleState();
        });

        $(largetree.elt).on('mousedown', '.drag-handle', function (event) {
            var selection = $(this);

            if (self.isMultiSelectKeyHeld(event)) {
                return self.handleMultiSelect(selection);
            } else if (event.shiftKey) {
                return self.handleShiftSelect(selection);
            }

            self.dragDelayTimer = setTimeout(function () {
                self.dragDelayTimer = undefined;

                /* Start a drag of one or more items */
                var row = selection.closest('.table-row');

                if ($('.multiselected', largetree.elt).length > 0) {
                    if (!row.find('.drag-handle').hasClass('multiselected')) {
                        /* If the item we started dragging from wasn't part of
                           the multiselection, add it in. */
                        row.find('.drag-handle').addClass('multiselected');
                        self.rowsToMove.push(row[0]);
                    }
                } else {
                    /* We're just tragging a single row */
                    self.rowsToMove = [row[0]];
                    row.addClass('multiselected');
                }

                self.setDragHandleState();

                self.dragActive = true;

                self.scrollUpHotspot.width(largetree.elt.width()).height(HOTSPOT_HEIGHT);
                self.scrollDownHotspot.width(largetree.elt.width()).height(HOTSPOT_HEIGHT);

                self.scrollUpHotspot.css('top', largetree.elt.offset().top - HOTSPOT_HEIGHT)
                               .css('left', largetree.elt.offset().left);
                self.scrollDownHotspot.css('top', largetree.elt.offset().top + largetree.elt.height())
                                 .css('left', largetree.elt.offset().left);

                self.dragIndicator.empty().hide();
                self.dragIndicator.append($('<ol />').append(self.rowsToMove.map(function (elt, idx) {
                    return $('<li />').text($(elt).find('.title').text());
                })));


                $(largetree.elt).focus();

                $('body').prepend(self.dragIndicator);
                $('body').prepend(self.scrollUpHotspot);
                $('body').prepend(self.scrollDownHotspot);
            }, DRAG_DELAY);

            return false;
        });

        $(document).on('mousedown', function (event) {
            if (!self.isMultiSelectKeyHeld(event) &&

                /* Not clicking on a drag handle */
                !$(event.target).hasClass('drag-handle') &&

                /* Not operating the dropdown menu */
                $(event.target).closest('.largetree-dropdown-menu').length === 0 &&

                /* Not attempting to expand something */
                $(event.target).closest('.expandme').length === 0 &&

                /* Not attempting to click a toolbar action */
                $(event.target).closest('#tree-toolbar').length === 0 &&

                /* Not using the resize handle */
                $(event.target).closest('.ui-resizable-handle').length === 0) {

                $(largetree.elt).find('.multiselected').removeClass('multiselected');
                self.rowsToMove = [];

                self.setDragHandleState();
            }
        });

        $(document).on('mousemove', function (event) {
            if (self.dragActive) {
                self.lastCursorPosition = {x: event.clientX, y: event.clientY};

                self.dragIndicator[0].style.left = (event.clientX + MOUSE_OFFSET) + 'px';
                self.dragIndicator[0].style.top = (event.clientY + MOUSE_OFFSET) + 'px';
                self.dragIndicator[0].style.display = 'inline-block';
            }
        });

        $(largetree.elt).on('mouseout', '.expandme', function (event) {
            if (self.expandTimer) {
                clearTimeout(self.expandTimer);
                self.expandTimer = undefined;
            }
        });

        $(largetree.elt).on('mouseover', '.expandme', function (event) {
            var button = $(this);

            if (self.dragActive && button.find('.expanded').length === 0) {
                self.expandTimer = setTimeout(function () {
                    largetree.toggleNode(button);
                }, EXPAND_DELAY);
            }
        });

        $(largetree.elt).on('mouseenter', '.table-row.root-row, .table-row.largetree-node', function (event) {
            if (self.dragActive) {
                if (self.isDropAllowed($(this))) {
                    $(this).addClass('drag-drop-over');
                } else {
                    $(this).addClass('drag-drop-over-disallowed');
                }
            }
        });

        $(largetree.elt).on('mouseleave', '.table-row.root-row, .table-row.largetree-node', function (event) {
            if (self.dragActive) {
                $(this).removeClass('drag-drop-over').
                        removeClass('drag-drop-over-disallowed');
            }
        });

        $(document).on('mouseenter', '.tree-scroll-hotspot', function (event) {
            var hotspot = event.target;

            var direction = 1;

            if ($(hotspot).hasClass('tree-scroll-up-hotspot')) {
                direction = -1;
            }

            var hotspotBounds = hotspot.getBoundingClientRect();
            self.autoScrollTimer = setInterval(function () {
                if (self.lastCursorPosition) {
                    var scrollAcceleration = (self.lastCursorPosition.y - hotspotBounds.top) / hotspotBounds.height;

                    if (direction == -1) {
                        scrollAcceleration = (1 - scrollAcceleration);
                    }

                    /* Go faster/slower at the two extremes */
                    if (scrollAcceleration > 0.8) {
                        scrollAcceleration += 0.1;
                    }

                    if (scrollAcceleration < 0.2) {
                        scrollAcceleration = 0.05;
                    }

                    var position = $(largetree.elt).scrollTop();

                    $(largetree.elt).scrollTop(position + (direction * AUTO_SCROLL_SPEED * scrollAcceleration));
                }
            }, 50);
        });

        $(document).on('mouseout', '.tree-scroll-hotspot', function (event) {
            if (self.autoScrollTimer) {
                clearTimeout(self.autoScrollTimer);
            }
            self.autoScrollTimer = undefined;
        });


        $(document).on('mouseup', function (event) {
            if (self.dragActive) {
                self.dragActive = false;
                self.dragIndicator.remove();
                $(largetree.elt).find('.drag-drop-over').removeClass('drag-drop-over');
                $(largetree.elt).find('.drag-drop-over-disallowed').removeClass('drag-drop-over-disallowed');
                $(largetree.elt).find('.multiselected').removeClass('multiselected');

                if (self.autoScrollTimer) {
                    clearTimeout(self.autoScrollTimer);
                    self.autoScrollTimer = undefined;
                }

                $(document).find('.tree-scroll-hotspot').remove();

                var dropTarget = $(event.target).closest('.table-row.largetree-node,.table-row.root-row');

                /* If they didn't drop on a row, that's a cancel. */
                if (dropTarget.length > 0 && self.isDropAllowed(dropTarget)) {
                    self.handleDrop(dropTarget);
                } else {
                    self.rowsToMove = [];
                }

                self.setDragHandleState();

                event.preventDefault();
                return false;
            }

            if (self.dragDelayTimer) {
                /* The mouse click finished prior to our drag starting (so we've
                   received a click, not a drag) */

                clearTimeout(self.dragDelayTimer);
                self.dragDelayTimer = undefined;

                /* Deselect everything */
                self.resetState();

                self.handleMultiSelect($(event.target));
            }

            return true;
        });
    };


    LargeTreeDragDrop.prototype.isMultiSelectKeyHeld = function (mouseEvent) {
        return (mouseEvent.ctrlKey || mouseEvent.metaKey);
    };


    LargeTreeDragDrop.prototype.resetState = function () {
        var self = this;

        $(self.largetree.elt).find('.multiselected').removeClass('multiselected');

        self.rowsToMove = [];

        if (self.blockout) {
            self.blockout.remove();
            self.blockout = undefined;
        }

        if (self.menu) {
            self.menu.remove();
            self.menu = undefined;
        }
        self.setDragHandleState();
    };

    LargeTreeDragDrop.prototype.handleDrop = function (dropTarget) {
        var self = this;

        // blockout the page
        self.blockout = $('<div>').addClass('largetree-blockout');
        $(document.body).append(self.blockout);

        // insert a menu!
        self.menu = $('<ul>').addClass('dropdown-menu largetree-dropdown-menu');
        if (!dropTarget.is('.root-row')) {
            self.menu.append($('<li><a href="javascript:void(0)" class="add-items-before">Add Items Before</a></li>'));
        }

        self.menu.append($('<li><a href="javascript:void(0)" class="add-items-as-children">Add Items as Children</a></li>'));

        if (!dropTarget.is('.root-row')) {
            self.menu.append($('<li><a href="javascript:void(0)" class="add-items-after">Add Items After</a></li>'));
        }

        $(document.body).append(self.menu);
        self.menu.css('position','absolute');
        self.menu.css('top',dropTarget.offset().top + dropTarget.height());
        self.menu.css('left',dropTarget.offset().left);
        self.menu.css('z-index', 1000);
        self.menu.show();
        self.menu.find('a:first').focus();
        self.menu.on('keydown', function(event) {
            if (event.keyCode == 27) { //escape
                self.resetState();
                return false;
            } else if (event.keyCode == 38) { //up arrow
                if ($(event.target).closest('li').prev().length > 0) {
                    $(event.target).closest('li').prev().find('a').focus();
                }
                return false;
            } else if (event.keyCode == 40) { //down arrow
                if ($(event.target).closest('li').next().length > 0) {
                    $(event.target).closest('li').next().find('a').focus();
                }
                return false;
            }

            return true;
        });

        self.blockout.on('click', function() {
            self.resetState();
        });

        function getParent(node) {
            return node.parent('.table-row-group').prevAll('.indent-level-'+(node.data('level') - 1) + ':first');
        }

        self.menu.on('click', '.add-items-before', function() {
            self.largetree.reparentNodes(getParent(dropTarget), self.rowsToMove, dropTarget.data('position')).done(function() {
                self.resetState();
            });
        }).on('click', '.add-items-as-children', function() {
            self.largetree.reparentNodes(dropTarget, self.rowsToMove, dropTarget.data('child_count')).done(function() {
                self.resetState();
            });
        }).on('click', '.add-items-after', function() {
            self.largetree.reparentNodes(getParent(dropTarget), self.rowsToMove, dropTarget.data('position') + 1).done(function() {
                self.resetState();
            });
        });
    };

    LargeTreeDragDrop.prototype.simulate_drag_and_drop = function(source_tree_id, target_tree_id) {
        var source = $('#' + source_tree_id);
        var target = $('#' + target_tree_id);

        this.rowsToMove = [source];
        this.handleDrop(target);
    };

    exports.LargeTreeDragDrop = LargeTreeDragDrop;
    exports.DRAGDROP_HOTSPOT_HEIGHT = HOTSPOT_HEIGHT;

}(window));








(function (exports) {
    "use strict";

    var renderers = {
        resource: new ResourceRenderer(),
        digital_object: new DigitalObjectRenderer(),
        classification: new ClassificationRenderer(),
    };

    function Tree(datasource_url, tree_container, form_container, toolbar_container, root_uri, read_only, root_record_type) {
        var self = this;
        var label = 'Expand/Collapse Tree Area';

        self.datasource = new TreeDataSource(datasource_url);

        var tree_renderer = renderers[root_record_type];

        self.toolbar_renderer = new TreeToolbarRenderer(self, toolbar_container);

        self.root_record_type = root_record_type;

        self.large_tree = new LargeTree(self.datasource, 
                                        tree_container,
                                        root_uri,
                                        read_only,
                                        tree_renderer, 
                                        function() {
                                            self.ajax_tree = new AjaxTree(self, form_container);
                                            self.resizer = new TreeResizer(self, tree_container, label);
                                        },
                                        function(node, tree) {
                                            self.toolbar_renderer.render(node);
                                        });


        if (!read_only) {
            self.dragdrop = self.large_tree.addPlugin(new LargeTreeDragDrop(self.large_tree));
        }

        self.large_tree.setGeneralErrorHandler(function (failure_type) {
            if (failure_type === 'fetch_node_failed') {
                /* This can happen when the user was logged out behind the scenes. */
                $('#tree-unexpected-failure').slideDown();
            }
        });
    };


    Tree.prototype.current = function() {
        return $('.current', this.large_tree.elt);
    };


    exports.Tree = Tree;
}(window));
$(function () {
  // Every 10 seconds:
  // Poll to check if the current version is still current
  // and if any users are editing the same record
  //
  // Ensure this value is less than the timeout to
  // remove the status from the update monitor.
  // See EXPIRE_SECONDS in backend/app/model/active_edit.rb
  var INTERVAL_PERIOD = 10000;
  var STATUS_STALE = 'stale';
  var STATUS_OTHER_EDITORS = 'opened_for_editing';
  var STATUS_REPO_CHANGED = 'repository_changed';

  var setupUpdateMonitor = function ($form) {
    if ($form.data('update-monitor') === 'enabled') {
      return;
    }

    $form.data('update-monitor', 'enabled');
    $form.data('update-monitor-paused', false);

    var poll_url = $form.data('update-monitor-url');
    var lock_version = $form.data('update-monitor-lock_version');
    var uri = $form.data('update-monitor-record-uri');
    var already_stale = $form.data('update-monitor-record-is-stale');

    $(document).trigger('clearupdatemonitorintervals.aspace');

    var insertErrorAndHighlightSidebar = function (status_data) {
      // insert the error
      $('.record-pane .update-monitor-error', $form).remove(); // remove any existing errors

      var message;

      if (already_stale || status_data.status === STATUS_STALE) {
        message = AS.renderTemplate(
          already_stale
            ? 'update_monitor_save_failed_with_stale_record_template'
            : 'update_monitor_stale_record_message_template'
        );
        $('#form_messages', $form).prepend(message);
        $('.record-pane .form-actions', $form).prepend(message);
        $('.btn-primary, .btn-toolbar .btn', $form)
          .attr('disabled', 'disabled')
          .addClass('disabled');
        clearInterval($(document).data('UPDATE_MONITOR_POLLING_INTERVAL'));
      } else if (status_data.status === STATUS_OTHER_EDITORS) {
        var user_ids = [];
        $.each(status_data.edited_by, function (user_id, timestamp) {
          user_ids.push(user_id);
        });
        message = AS.renderTemplate(
          'update_monitor_other_editors_message_template',
          { user_ids: user_ids.join(', ') }
        );
        $('#form_messages', $form).prepend(message);
        $('.record-pane .form-actions', $form).prepend(message);
      } else if (status_data.status === STATUS_REPO_CHANGED) {
        message = AS.renderTemplate(
          'update_monitor_repository_changed_message_template'
        );
        $('#form_messages', $form).prepend(message);
        $('.record-pane .form-actions', $form).prepend(message);
      }

      // highlight in the sidebar
      if ($('.as-nav-list li.update-monitor-error').length === 0) {
        $('.as-nav-list').prepend(
          AS.renderTemplate('as_nav_list_errors_item_template')
        );
      }
      var $errorNavListItem = $('.as-nav-list li.alert-error');

      if (
        !$errorNavListItem.hasClass('acknowledged') &&
        $(document).data('UPDATE_MONITOR_HIGHLIGHT_INTERVAL') == null
      ) {
        $(document).data(
          'UPDATE_MONITOR_HIGHLIGHT_INTERVAL',
          setInterval(function () {
            $errorNavListItem.toggleClass('active');
          }, 3000)
        );
        $errorNavListItem.hover(
          function () {
            clearInterval(
              $(document).data('UPDATE_MONITOR_HIGHLIGHT_INTERVAL')
            );
            $errorNavListItem.removeClass('active').addClass('acknowledged');
          },
          function () {}
        );
      }
    };

    var clearAnyMonitorErrors = function () {
      $('.update-monitor-error', $form).remove();
    };

    var poll = function () {
      if (already_stale) {
        insertErrorAndHighlightSidebar();
        return;
      }

      if ($form.data('update-monitor-paused') == true) {
        return;
      }

      $.post(
        poll_url,
        {
          lock_version: lock_version,
          uri: uri,
        },
        function (json, textStatus, jqXHR) {
          if (
            json.status === STATUS_STALE ||
            json.status === STATUS_OTHER_EDITORS ||
            json.status === STATUS_REPO_CHANGED
          ) {
            insertErrorAndHighlightSidebar(json);
          } else {
            // nobody else editing and lock_version still current
            clearAnyMonitorErrors();
          }
        },
        'json'
      ).fail(function (jqXHR, textStatus, errorThrown) {
        if (jqXHR.status === 500 || jqXHR.status === 403) {
          window.location.replace(FRONTEND_URL);
        }
      });
    };

    poll();
    $(document).data(
      'UPDATE_MONITOR_POLLING_INTERVAL',
      setInterval(poll, INTERVAL_PERIOD)
    );
  };

  $(document).bind('setupupdatemonitor.aspace', function (event, $form) {
    setupUpdateMonitor($form);
  });

  $(document).bind('clearupdatemonitorintervals.aspace', function (event) {
    clearInterval($(document).data('UPDATE_MONITOR_HIGHLIGHT_INTERVAL'));
    clearInterval($(document).data('UPDATE_MONITOR_POLLING_INTERVAL'));
  });
});
AS.LoginHelper = {
  init: function (el) {
    $(el).each(function () {
      var $form = $(this);

      var handleSuccess = function (json) {
        $('.form-group', $form).removeClass('has-error');
        $('.alert-success', $form).show();

        $form.trigger('loginsuccess.aspace', [json]);
      };

      var handleError = function () {
        $('.form-group', $form).addClass('has-error');
        $('.alert-danger', $form).show();
        $('#login', $form).removeAttr('disabled');

        $form.trigger('loginerror.aspace');
      };

      $form.ajaxForm({
        dataType: 'json',
        beforeSubmit: function () {
          $('#login', $form).attr('disabled', 'disabled');
        },
        success: function (json, status, xhr) {
          if (json.session) {
            handleSuccess(json);
          } else {
            handleError();
          }
        },
        error: function (obj, errorText, errorDesc) {
          handleError();
        },
      });
    });
  },
};



// Add session active check upon form submission
$(function () {
  var initSessionCheck = function () {
    $(this).each(function () {
      var $form = $(this);

      var checkForSession = function (event) {
        $.ajax({
          url: AS.app_prefix('has_session'),
          async: false,
          data_type: 'json',
          success: function (json) {
            if (json.has_session) {
              return true;
            } else {
              event.preventDefault();
              event.stopImmediatePropagation();

              $(":input[type='submit']", $form).removeAttr('disabled');

              // we might have gotten logged out while trying to save some data in a modal,
              // e.g., a linker
              var $existingModal = $('.modal.initialised');

              if ($existingModal.length) {
                $existingModal.hide();
              }

              var $modal = AS.openAjaxModal(AS.app_prefix('login'));
              $modal.removeClass('inline-login-modal');
              var $loginForm = $('form', $modal);
              AS.LoginHelper.init($loginForm);
              $loginForm.on('loginsuccess.aspace', function (event, data) {
                // update all CSRF input fields on the page
                $(':input[name=authenticity_token]').val(data.csrf_token);

                // unbind the session check and resubmit the form
                if ($existingModal.length === 0) {
                  $form.unbind('submit', checkForSession);
                  $form.submit();
                } else {
                  $modal.hide();
                  $modal.remove();
                  $existingModal.show();
                }

                // remove the modal, the job is done.
                $modal.on('hidden', function () {
                  $modal.remove();
                });
                setTimeout(function () {
                  $modal.modal('hide');
                }, 1000);

                return false;
              });

              return false;
            }
          },
          error: function () {
            $(":input[type='submit']", $form).removeAttr('disabled');
            return true;
          },
        });
      };

      $form.on('submit', checkForSession);
    });
  };

  $(document).bind('loadedrecordform.aspace', function (event, $container) {
    $.proxy(
      initSessionCheck,
      $container
        .find('form.aspace-record-form:not(.public-form)')
        .andSelf()
        .filter('form.aspace-record-form:not(.public-form)')
    )();
  });

  $.proxy(initSessionCheck, $('form.aspace-record-form:not(.public-form)'))();
});

// add form change detection
$(function () {
  var lockForm = function () {
    $(this).each(function () {
      $('.form-overlay', $(this)).height('100%').fadeIn();
      $(this).addClass('locked');
    });
  };

  var showUnlockForm = function () {
    $(this).each(function () {
      var $unlock = $(AS.renderTemplate('form_overlay_unlock_template'));
      $unlock.on('click', function (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        $(window).trigger('hashchange');
      });
      $('#archives_form_overlay', $(this)).append($unlock);
      $('.alert', $unlock).fadeIn();
    });
  };

  var ignoredKeycodes = [37, 39, 9];

  var initFormChangeDetection = function () {
    $(this).each(function () {
      var $this = $(this);

      if ($this.data('changedDetectionEnabled')) {
        return;
      }

      $this.data('form_changed', $this.data('form_changed') || false);
      $this.data('changedDetectionEnabled', true);

      // this is the overlay we can use to lock the form.
      $('> .form-context > .row > .col-md-9', $this).prepend(
        '<div id="archives_form_overlay"><div class="modal-backdrop in form-overlay"></div></div>'
      );
      $('> .form-context > .row > .col-md-3 .form-actions', $this).prepend(
        '<div id="archives_form_actions_overlay" class="modal-backdrop in form-overlay"></div>'
      );

      var onFormElementChange = function (event) {
        if (
          $(event.target).parents("*[data-no-change-tracking='true']")
            .length === 0
        ) {
          $this.trigger('formchanged.aspace');
          $this.trigger('readonlytree.aspace');
        }
      };
      $this.on('change keyup', ':input', function (event) {
        if (
          $(this).data('original_value') &&
          $(this).data('original_value') !== $(this).val()
        ) {
          onFormElementChange(event);
        } else if ($.inArray(event.keyCode, ignoredKeycodes) === -1) {
          onFormElementChange(event);
        }
      });

      var submitParentForm = function (e) {
        e.preventDefault();
        var input = $('<input>')
          .attr('type', 'hidden')
          .attr('name', 'ignorewarnings')
          .val('true');
        $('form.aspace-record-form').append($(input));
        $('form.aspace-record-form').submit();
        return false;
      };

      $this.on('click', ':radio, :checkbox', onFormElementChange);

      $this.on('formchanged.aspace', function (event) {
        if ($this.data('form_changed') === true) {
          event.stopPropagation();
        } else {
          $(document).bind('keydown', 'ctrl+s', submitParentForm);
          $(':input', event.target).bind('keydown', 'ctrl+s', submitParentForm);
        }
        $this.data('form_changed', true);
        $('.record-toolbar', $this).addClass('formchanged');
        $('.record-toolbar .btn-toolbar .btn:not(.no-change-tracking)', $this)
          .addClass('disabled')
          .attr('disabled', 'disabled');
      });

      $('.createPlusOneBtn', $this).on('click', function () {
        $this.data('createPlusOne', 'true');
      });

      $this.bind('submit', function (event) {
        $this.data('form_changed', false);
        $this.data('update-monitor-paused', true);
        $this.off('change keyup formchanged.aspace');
        $(document).unbind('keydown', submitParentForm);
        $(":input[type='submit'], :input.btn-primary", $this).attr(
          'disabled',
          'disabled'
        );
        if ($(this).data('createPlusOne')) {
          var $input = $('<input>')
            .attr('type', 'hidden')
            .attr('name', 'plus_one')
            .val('true');
          $($this).append($input);
        }

        return true;
      });

      $('.record-toolbar .revert-changes .btn', $this).click(function () {
        $this.data('form_changed', false);
        return true;
      });

      $('.form-actions .btn-cancel', $this).click(function () {
        $this.data('form_changed', false);
        return true;
      });

      $(window).bind('beforeunload', function (event) {
        if ($this.data('form_changed') === true) {
          return 'Please note you have some unsaved changes.';
        }
      });

      if ($this.data('update-monitor')) {
        $(document).trigger('setupupdatemonitor.aspace', [$this]);
      } else if ($this.closest('.modal').length === 0) {
        // if form isn't opened via a modal, then clear the timeouts
        // and they will be reinitialised for that form (e.g. tree forms)
        $(document).trigger('clearupdatemonitorintervals.aspace', [$this]);
      }
    });
  };

  $(document).bind('loadedrecordform.aspace', function (event, $container) {
    $.proxy(
      initFormChangeDetection,
      $('form.aspace-record-form', $container)
    )();
  });

  // we need to lock the form because somethingis happening
  $(document).bind('lockform.aspace', function (event, $container) {
    $.proxy(lockForm, [$container])();
  });
  // and now the thing is done, so we can now allow the user to unlock it.
  $(document).bind('unlockform.aspace', function (event, $container) {
    $.proxy(showUnlockForm, [$container])();
  });

  $.proxy(initFormChangeDetection, $('form.aspace-record-form'))();
});
/*
 * jQuery Plugin: Tokenizing Autocomplete Text Entry
 * Version 1.6.0
 *
 * Copyright (c) 2009 James Smith (http://loopj.com)
 * Licensed jointly under the GPL and MIT licenses,
 * choose which one suits your project best!
 *
 */


(function ($) {
  // Default settings
  var DEFAULT_SETTINGS = {
    // Search settings
    method: 'GET',
    queryParam: 'q',
    searchDelay: 300,
    minChars: 1,
    propertyToSearch: 'name',
    jsonContainer: null,
    contentType: 'json',

    // Prepopulation settings
    prePopulate: null,
    processPrePopulate: false,

    // Display settings
    hintText: 'Type in a search term',
    noResultsText: 'No results',
    searchingText: 'Searching...',
    deleteText: '&times;',
    animateDropdown: true,
    theme: null,
    zindex: 999,
    resultsLimit: null,

    enableHTML: true,

    resultsFormatter: function (item) {
      var string = item[this.propertyToSearch];
      return (
        '<li>' + (this.enableHTML ? string : _escapeHTML(string)) + '</li>'
      );
    },

    tokenFormatter: function (item) {
      var string = item[this.propertyToSearch];
      return (
        '<li><p>' +
        (this.enableHTML ? string : _escapeHTML(string)) +
        '</p></li>'
      );
    },

    // Tokenization settings
    tokenLimit: null,
    tokenDelimiter: ',',
    preventDuplicates: false,
    tokenValue: 'id',

    // Behavioral settings
    allowFreeTagging: false,

    // Callbacks
    onResult: null,
    onCachedResult: null,
    onAdd: null,
    onFreeTaggingAdd: null,
    onDelete: null,
    onReady: null,

    // Other settings
    idPrefix: 'token-input-',

    // Keep track if the input is currently in disabled mode
    disabled: false,

    formatQueryParam: function (q, ajax_params) {
      return q;
    },
    caching: true,
  };

  // Default classes to use when theming
  var DEFAULT_CLASSES = {
    tokenList: 'token-input-list',
    token: 'token-input-token',
    tokenReadOnly: 'token-input-token-readonly',
    tokenDelete: 'token-input-delete-token',
    selectedToken: 'token-input-selected-token',
    highlightedToken: 'token-input-highlighted-token',
    dropdown: 'token-input-dropdown',
    dropdownItem: 'token-input-dropdown-item',
    dropdownItem2: 'token-input-dropdown-item2',
    selectedDropdownItem: 'token-input-selected-dropdown-item',
    inputToken: 'token-input-input-token',
    focused: 'token-input-focused',
    disabled: 'token-input-disabled',
  };

  // Input box position "enum"
  var POSITION = {
    BEFORE: 0,
    AFTER: 1,
    END: 2,
  };

  // Keys "enum"
  var KEY = {
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    ESCAPE: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    NUMPAD_ENTER: 108,
    COMMA: null, // 188
  };

  var HTML_ESCAPES = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  var HTML_ESCAPE_CHARS = /[&<>"'/]/g;

  function coerceToString(val) {
    return String(val === null || val === undefined ? '' : val);
  }

  function _escapeHTML(text) {
    return coerceToString(text).replace(HTML_ESCAPE_CHARS, function (match) {
      return HTML_ESCAPES[match];
    });
  }

  // Additional public (exposed) methods
  var methods = {
    init: function (url_or_data_or_function, options) {
      var settings = $.extend({}, DEFAULT_SETTINGS, options || {});

      return this.each(function () {
        $(this).data('settings', settings);
        $(this).data(
          'tokenInputObject',
          new $.TokenList(this, url_or_data_or_function, settings)
        );
      });
    },
    clear: function () {
      this.data('tokenInputObject').clear();
      return this;
    },
    add: function (item) {
      this.data('tokenInputObject').add(item);
      return this;
    },
    remove: function (item) {
      this.data('tokenInputObject').remove(item);
      return this;
    },
    get: function () {
      return this.data('tokenInputObject').getTokens();
    },
    toggleDisabled: function (disable) {
      this.data('tokenInputObject').toggleDisabled(disable);
      return this;
    },
    setOptions: function (options) {
      $(this).data(
        'settings',
        $.extend({}, $(this).data('settings'), options || {})
      );
      return this;
    },
  };

  // Expose the .tokenInput function to jQuery as a plugin
  $.fn.tokenInput = function (method) {
    // Method calling and initialization logic
    if (methods[method]) {
      return methods[method].apply(
        this,
        Array.prototype.slice.call(arguments, 1)
      );
    } else {
      return methods.init.apply(this, arguments);
    }
  };

  // TokenList class for each input
  $.TokenList = function (input, url_or_data, settings) {
    //
    // Initialization
    //

    // Configure the data source
    if (
      $.type(url_or_data) === 'string' ||
      $.type(url_or_data) === 'function'
    ) {
      // Set the url to query against
      $(input).data('settings').url = url_or_data;

      // If the URL is a function, evaluate it here to do our initalization work
      var url = computeURL();

      // Make a smart guess about cross-domain if it wasn't explicitly specified
      if (
        $(input).data('settings').crossDomain === undefined &&
        typeof url === 'string'
      ) {
        if (url.indexOf('://') === -1) {
          $(input).data('settings').crossDomain = false;
        } else {
          $(input).data('settings').crossDomain =
            location.href.split(/\/+/g)[1] !== url.split(/\/+/g)[1];
        }
      }
    } else if (typeof url_or_data === 'object') {
      // Set the local data to search through
      $(input).data('settings').local_data = url_or_data;
    }

    // Build class names
    if ($(input).data('settings').classes) {
      // Use custom class names
      $(input).data('settings').classes = $.extend(
        {},
        DEFAULT_CLASSES,
        $(input).data('settings').classes
      );
    } else if ($(input).data('settings').theme) {
      // Use theme-suffixed default class names
      $(input).data('settings').classes = {};
      $.each(DEFAULT_CLASSES, function (key, value) {
        $(input).data('settings').classes[key] =
          value + '-' + $(input).data('settings').theme;
      });
    } else {
      $(input).data('settings').classes = DEFAULT_CLASSES;
    }

    // Save the tokens
    var saved_tokens = [];

    // Keep track of the number of tokens in the list
    var token_count = 0;

    // Basic cache to save on db hits
    var cache = new $.TokenList.Cache();

    // Keep track of the timeout, old vals
    var timeout;
    var input_val;

    // Create a new text input an attach keyup events
    var input_box = $('<input type="text"  autocomplete="off">')
      .css({
        outline: 'none',
      })
      .attr('id', $(input).data('settings').idPrefix + input.id)
      .focus(function () {
        if ($(input).data('settings').disabled) {
          return false;
        } else if (
          $(input).data('settings').tokenLimit === null ||
          $(input).data('settings').tokenLimit !== token_count
        ) {
          show_dropdown_hint();
        }
        token_list.addClass($(input).data('settings').classes.focused);

        var $combobox = token_list.closest('div.controls');
        $combobox.attr('aria-expanded', true);
      })
      .blur(function () {
        hide_dropdown();
        token_list
          .closest('div.controls')
          .find("input[role='searchbox']")
          .removeAttr('aria-controls');
        $(this).val('');
        token_list.removeClass($(input).data('settings').classes.focused);

        if ($(input).data('settings').allowFreeTagging) {
          add_freetagging_tokens();
        } else {
          $(this).val('');
        }
        token_list.removeClass($(input).data('settings').classes.focused);
        token_list.closest('div.controls').attr('aria-expanded', false);
      })
      .bind('keyup keydown blur update', resize_input)
      .keydown(function (event) {
        var previous_token;
        var next_token;

        switch (event.keyCode) {
          case KEY.LEFT:
            return true;
          case KEY.RIGHT:
            return true;
          case KEY.UP:
          case KEY.DOWN:
            if (!$(this).val()) {
              previous_token = input_token.prev();
              next_token = input_token.next();

              if (
                (previous_token.length &&
                  previous_token.get(0) === selected_token) ||
                (next_token.length && next_token.get(0) === selected_token)
              ) {
                // Check if there is a previous/next token and it is selected
                if (event.keyCode === KEY.LEFT || event.keyCode === KEY.UP) {
                  deselect_token($(selected_token), POSITION.BEFORE);
                } else {
                  deselect_token($(selected_token), POSITION.AFTER);
                }
              } else if (
                (event.keyCode === KEY.LEFT || event.keyCode === KEY.UP) &&
                previous_token.length
              ) {
                // We are moving left, select the previous token if it exists
                select_token($(previous_token.get(0)));
              } else if (
                (event.keyCode === KEY.RIGHT || event.keyCode === KEY.DOWN) &&
                next_token.length
              ) {
                // We are moving right, select the next token if it exists
                select_token($(next_token.get(0)));
              }
            } else {
              var dropdown_item = null;

              if (event.keyCode === KEY.DOWN || event.keyCode === KEY.RIGHT) {
                dropdown_item = $(selected_dropdown_item).next();
              } else {
                dropdown_item = $(selected_dropdown_item).prev();
              }

              if (dropdown_item.length) {
                select_dropdown_item(dropdown_item);
              }
            }
            return false;

          case KEY.BACKSPACE:
            previous_token = input_token.prev();

            if (!$(this).val().length) {
              if (selected_token) {
                delete_token($(selected_token));
                hidden_input.change();
              } else if (previous_token.length) {
                select_token($(previous_token.get(0)));
              }

              return false;
            } else if ($(this).val().length === 1) {
              hide_dropdown();
            } else {
              // set a timeout just long enough to let this function finish.
              setTimeout(function () {
                do_search();
              }, 5);
            }
            break;

          case KEY.TAB:
            return true;
          case KEY.ENTER:
            if (selected_dropdown_item) {
              add_token($(selected_dropdown_item).data('tokeninput'));
              hidden_input.change();
            } else {
              $(input).trigger('tokeninput.enter');
            }
            event.stopPropagation();
            event.preventDefault();
            break;
          case KEY.NUMPAD_ENTER:
          case KEY.COMMA:
            if (selected_dropdown_item) {
              add_token($(selected_dropdown_item).data('tokeninput'));
              hidden_input.change();
            } else {
              if ($(input).data('settings').allowFreeTagging) {
                add_freetagging_tokens();
              }
              event.stopPropagation();
              event.preventDefault();
            }
            return false;

          case KEY.ESCAPE:
            hide_dropdown();
            return true;

          default:
            if (String.fromCharCode(event.which)) {
              // set a timeout just long enough to let this function finish.
              setTimeout(function () {
                do_search();
              }, 5);
            }
            break;
        }
      });

    // Keep a reference to the original input box
    var hidden_input = $(input)
      .hide()
      .val('')
      .focus(function () {
        focus_with_timeout(input_box);
      })
      .blur(function () {
        input_box.blur();
      });

    // Keep a reference to the selected token and dropdown item
    var selected_token = null;
    var selected_token_index = 0;
    var selected_dropdown_item = null;

    // The list to store the token items in
    var token_list = $('<ul />')
      .addClass($(input).data('settings').classes.tokenList)
      .click(function (event) {
        var li = $(event.target).closest('li');
        if (li && li.get(0) && $.data(li.get(0), 'tokeninput')) {
          toggle_select_token(li);
        } else {
          // Deselect selected token
          if (selected_token) {
            deselect_token($(selected_token), POSITION.END);
          }

          // Focus input box
          focus_with_timeout(input_box);
        }
      })
      .mouseover(function (event) {
        var li = $(event.target).closest('li');
        if (li && selected_token !== this) {
          li.addClass($(input).data('settings').classes.highlightedToken);
        }
      })
      .mouseout(function (event) {
        var li = $(event.target).closest('li');
        if (li && selected_token !== this) {
          li.removeClass($(input).data('settings').classes.highlightedToken);
        }
      })
      .insertBefore(hidden_input);

    // The token holding the input box
    var input_token = $('<li />')
      .addClass($(input).data('settings').classes.inputToken)
      .appendTo(token_list)
      .append(input_box);

    // The list to store the dropdown items in
    /**
     * ANW-897: The plugin appends dropdown to <body>, preventing
     * scrolling when at the bottom of the viewport.
     * Let's override this unmaintained plugin by
     * appending the dropdown to a relative parent.
     * Let's also adjust dropdown styles (see show_dropdown() below).
     */
    var dropdown_parent = $('<section>')
      .insertAfter(token_list)
      .css({ position: 'relative' });

    var dropdown = $('<div>')
      .addClass($(input).data('settings').classes.dropdown)
      .appendTo(dropdown_parent)
      .hide();

    // Magic element to help us resize the text input
    var input_resizer = $('<tester/>')
      .insertAfter(input_box)
      .css({
        position: 'absolute',
        top: -9999,
        left: -9999,
        width: 'auto',
        fontSize: input_box.css('fontSize'),
        fontFamily: input_box.css('fontFamily'),
        fontWeight: input_box.css('fontWeight'),
        letterSpacing: input_box.css('letterSpacing'),
        whiteSpace: 'nowrap',
      });

    // Pre-populate list if items exist
    hidden_input.val('');
    var li_data =
      $(input).data('settings').prePopulate || hidden_input.data('pre');
    if (
      $(input).data('settings').processPrePopulate &&
      $.isFunction($(input).data('settings').onResult)
    ) {
      li_data = $(input).data('settings').onResult.call(hidden_input, li_data);
    }
    if (li_data && li_data.length) {
      $.each(li_data, function (index, value) {
        insert_token(value);
        checkTokenLimit();
      });
    }

    // Check if widget should initialize as disabled
    if ($(input).data('settings').disabled) {
      toggleDisabled(true);
    }

    // Initialization is done
    if ($.isFunction($(input).data('settings').onReady)) {
      $(input).data('settings').onReady.call();
    }

    //
    // Public functions
    //

    this.clear = function () {
      token_list.children('li').each(function () {
        if ($(this).children('input').length === 0) {
          delete_token($(this));
        }
      });
    };

    this.add = function (item) {
      add_token(item);
    };

    this.remove = function (item) {
      token_list.children('li').each(function () {
        if ($(this).children('input').length === 0) {
          var currToken = $(this).data('tokeninput');
          var match = true;
          for (var prop in item) {
            if (item[prop] !== currToken[prop]) {
              match = false;
              break;
            }
          }
          if (match) {
            delete_token($(this));
          }
        }
      });
    };

    this.getTokens = function () {
      return saved_tokens;
    };

    this.toggleDisabled = function (disable) {
      toggleDisabled(disable);
    };

    //
    // Private functions
    //

    function escapeHTML(text) {
      return $(input).data('settings').enableHTML ? text : _escapeHTML(text);
    }

    // Toggles the widget between enabled and disabled state, or according
    // to the [disable] parameter.
    function toggleDisabled(disable) {
      if (typeof disable === 'boolean') {
        $(input).data('settings').disabled = disable;
      } else {
        $(input).data('settings').disabled =
          !$(input).data('settings').disabled;
      }
      input_box.attr('disabled', $(input).data('settings').disabled);
      token_list.toggleClass(
        $(input).data('settings').classes.disabled,
        $(input).data('settings').disabled
      );
      // if there is any token selected we deselect it
      if (selected_token) {
        deselect_token($(selected_token), POSITION.END);
      }
      hidden_input.attr('disabled', $(input).data('settings').disabled);
    }

    function checkTokenLimit() {
      if (
        $(input).data('settings').tokenLimit !== null &&
        token_count >= $(input).data('settings').tokenLimit
      ) {
        input_box.hide();
        hide_dropdown();
        return;
      }
    }

    function resize_input() {
      if (input_val === (input_val = input_box.val())) {
        return;
      }

      // Enter new content into resizer and resize input accordingly
      input_resizer.html(_escapeHTML(input_val));
      input_box.width(input_resizer.width() + 30);
    }

    function is_printable_character(keycode) {
      return (
        (keycode >= 48 && keycode <= 90) || // 0-1a-z
        (keycode >= 96 && keycode <= 111) || // numpad 0-9 + - / * .
        (keycode >= 186 && keycode <= 192) || // ; = , - . / ^
        (keycode >= 219 && keycode <= 222)
      ); // ( \ ) '
    }

    function add_freetagging_tokens() {
      var value = $.trim(input_box.val());
      var tokens = value.split($(input).data('settings').tokenDelimiter);
      $.each(tokens, function (i, token) {
        if (!token) {
          return;
        }

        if ($.isFunction($(input).data('settings').onFreeTaggingAdd)) {
          token = $(input)
            .data('settings')
            .onFreeTaggingAdd.call(hidden_input, token);
        }
        var object = {};
        object[$(input).data('settings').tokenValue] = object[
          $(input).data('settings').propertyToSearch
        ] = token;
        add_token(object);
      });
    }

    // Inner function to a token to the list
    function insert_token(item) {
      var $this_token = $($(input).data('settings').tokenFormatter(item));
      var readonly = item.readonly === true ? true : false;

      if (readonly)
        $this_token.addClass($(input).data('settings').classes.tokenReadOnly);

      $this_token
        .addClass($(input).data('settings').classes.token)
        .insertBefore(input_token);

      // The 'delete token' button
      if (!readonly) {
        $('<span>' + $(input).data('settings').deleteText + '</span>')
          .addClass($(input).data('settings').classes.tokenDelete)
          .appendTo($this_token)
          .click(function () {
            if (!$(input).data('settings').disabled) {
              delete_token($(this).parent());
              hidden_input.change();
              return false;
            }
          });
      }

      // Store data on the token
      var token_data = item;
      $.data($this_token.get(0), 'tokeninput', item);

      // Save this token for duplicate checking
      saved_tokens = saved_tokens
        .slice(0, selected_token_index)
        .concat([token_data])
        .concat(saved_tokens.slice(selected_token_index));
      selected_token_index++;

      // Update the hidden input
      update_hidden_input(saved_tokens, hidden_input);

      token_count += 1;

      // Check the token limit
      if (
        $(input).data('settings').tokenLimit !== null &&
        token_count >= $(input).data('settings').tokenLimit
      ) {
        input_box.hide();
        hide_dropdown();
      }

      return $this_token;
    }

    // Add a token to the token list based on user input
    function add_token(item) {
      var callback = $(input).data('settings').onAdd;

      // See if the token already exists and select it if we don't want duplicates
      if (token_count > 0 && $(input).data('settings').preventDuplicates) {
        var found_existing_token = null;
        token_list.children().each(function () {
          var existing_token = $(this);
          var existing_data = $.data(existing_token.get(0), 'tokeninput');
          if (existing_data && existing_data.id === item.id) {
            found_existing_token = existing_token;
            return false;
          }
        });

        if (found_existing_token) {
          select_token(found_existing_token);
          input_token.insertAfter(found_existing_token);
          focus_with_timeout(input_box);
          return;
        }
      }

      // Insert the new tokens
      if (
        $(input).data('settings').tokenLimit === null ||
        token_count < $(input).data('settings').tokenLimit
      ) {
        insert_token(item);
        checkTokenLimit();
      }

      // Clear input box
      input_box.val('');

      // Don't show the help dropdown, they've got the idea
      hide_dropdown();

      // Execute the onAdd callback if defined
      if ($.isFunction(callback)) {
        callback.call(hidden_input, item);
      }
    }

    // Select a token in the token list
    function select_token(token) {
      if (!$(input).data('settings').disabled) {
        token.addClass($(input).data('settings').classes.selectedToken);
        selected_token = token.get(0);

        // Hide input box
        input_box.val('');

        // Hide dropdown if it is visible (eg if we clicked to select token)
        hide_dropdown();
      }
    }

    // Deselect a token in the token list
    function deselect_token(token, position) {
      token.removeClass($(input).data('settings').classes.selectedToken);
      selected_token = null;

      if (position === POSITION.BEFORE) {
        input_token.insertBefore(token);
        selected_token_index--;
      } else if (position === POSITION.AFTER) {
        input_token.insertAfter(token);
        selected_token_index++;
      } else {
        input_token.appendTo(token_list);
        selected_token_index = token_count;
      }

      // Show the input box and give it focus again
      focus_with_timeout(input_box);
    }

    // Toggle selection of a token in the token list
    function toggle_select_token(token) {
      var previous_selected_token = selected_token;

      if (selected_token) {
        deselect_token($(selected_token), POSITION.END);
      }

      if (previous_selected_token === token.get(0)) {
        deselect_token(token, POSITION.END);
      } else {
        select_token(token);
      }
    }

    // Delete a token from the token list
    function delete_token(token) {
      // Remove the id from the saved list
      var token_data = $.data(token.get(0), 'tokeninput');
      var callback = $(input).data('settings').onDelete;

      var index = token.prevAll().length;
      if (index > selected_token_index) index--;

      // Delete the token
      token.remove();
      selected_token = null;

      // Show the input box and give it focus again
      focus_with_timeout(input_box);

      // Remove this token from the saved list
      saved_tokens = saved_tokens
        .slice(0, index)
        .concat(saved_tokens.slice(index + 1));
      if (index < selected_token_index) selected_token_index--;

      // Update the hidden input
      update_hidden_input(saved_tokens, hidden_input);

      token_count -= 1;

      if ($(input).data('settings').tokenLimit !== null) {
        input_box.show().val('');
        focus_with_timeout(input_box);
      }

      // Execute the onDelete callback if defined
      if ($.isFunction(callback)) {
        callback.call(hidden_input, token_data);
      }
    }

    // Update the hidden input box value
    function update_hidden_input(saved_tokens, hidden_input) {
      var token_values = $.map(saved_tokens, function (el) {
        if (typeof $(input).data('settings').tokenValue == 'function')
          return $(input).data('settings').tokenValue.call(this, el);

        return el[$(input).data('settings').tokenValue];
      });
      hidden_input.val(
        token_values.join($(input).data('settings').tokenDelimiter)
      );
    }

    // Hide and clear the results dropdown
    function hide_dropdown() {
      dropdown.hide().empty();
      selected_dropdown_item = null;
    }

    function show_dropdown() {
      /**
       * ANW-897: The plugin appends dropdown to <body>, preventing
       * scrolling when at the bottom of the viewport.
       * Let's override this unmaintained plugin by
       * appending the dropdown to a relative parent
       * (see dropdown_parent above). Let's also adjust dropdown
       * styles.
       */
      dropdown
        .css({
          position: 'absolute',
          top: $(token_list).outerHeight(),
          left: 0,
          width: $(token_list).outerWidth(),
          'z-index': $(input).data('settings').zindex,
        })
        .show();
    }

    function show_dropdown_searching() {
      if ($(input).data('settings').searchingText) {
        dropdown.html(
          '<p>' + escapeHTML($(input).data('settings').searchingText) + '</p>'
        );
        show_dropdown();
      }
    }

    function show_dropdown_hint() {
      if ($(input).data('settings').hintText) {
        dropdown.html(
          '<p>' + escapeHTML($(input).data('settings').hintText) + '</p>'
        );
        show_dropdown();
      }
    }

    var regexp_special_chars = new RegExp(
      '[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-]',
      'g'
    );
    function regexp_escape(term) {
      return term.replace(regexp_special_chars, '\\$&');
    }

    // Highlight the query part of the search term
    function highlight_term(value, term) {
      return value.replace(
        new RegExp(
          '(?![^&;]+;)(?!<[^<>]*)(' +
            regexp_escape(term) +
            ')(?![^<>]*>)(?![^&;]+;)',
          'gi'
        ),
        function (match, p1) {
          return '<b>' + escapeHTML(p1) + '</b>';
        }
      );
    }

    function find_value_and_highlight_term(template, value, term) {
      return template.replace(
        new RegExp(
          '(?![^&;]+;)(?!<[^<>]*)(' +
            regexp_escape(value) +
            ')(?![^<>]*>)(?![^&;]+;)',
          'g'
        ),
        highlight_term(value, term)
      );
    }

    // Populate the results dropdown with some results
    function populate_dropdown(query, results) {
      if (results && results.length) {
        dropdown.empty();
        var dropdown_label = dropdown_parent[0].nextSibling.id + '_label';
        var ul_id = dropdown_parent[0].nextSibling.id + '_listbox';
        var dropdown_ul = $(
          '<ul  aria-labelledby=' +
            dropdown_label +
            " role='listbox' id=" +
            ul_id +
            '>'
        )
          .appendTo(dropdown)
          .mouseover(function (event) {
            select_dropdown_item($(event.target).closest('li'));
          })
          .mousedown(function (event) {
            add_token($(event.target).closest('li').data('tokeninput'));
            hidden_input.change();
            return false;
          })
          .hide();
        dropdown_ul
          .closest('div.controls')
          .find("input[role='searchbox']")
          .attr('aria-controls', dropdown_ul.attr('id'));
        if (
          $(input).data('settings').resultsLimit &&
          results.length > $(input).data('settings').resultsLimit
        ) {
          results = results.slice(0, $(input).data('settings').resultsLimit);
        }

        $.each(results, function (index, value) {
          var this_li = $(input).data('settings').resultsFormatter(value);

          this_li = find_value_and_highlight_term(
            this_li,
            value[$(input).data('settings').propertyToSearch],
            query
          );

          this_li = $(this_li).appendTo(dropdown_ul);

          if (index % 2) {
            this_li.addClass($(input).data('settings').classes.dropdownItem);
          } else {
            this_li.addClass($(input).data('settings').classes.dropdownItem2);
          }

          if (index === 0) {
            select_dropdown_item(this_li);
          }

          $.data(this_li.get(0), 'tokeninput', value);
        });

        show_dropdown();

        if ($(input).data('settings').animateDropdown) {
          dropdown_ul.slideDown('fast');
        } else {
          dropdown_ul.show();
        }
      } else {
        if ($(input).data('settings').noResultsText) {
          dropdown.html(
            '<p>' + escapeHTML($(input).data('settings').noResultsText) + '</p>'
          );
          show_dropdown();
        }
      }
    }

    // Highlight an item in the results dropdown
    function select_dropdown_item(item) {
      if (item) {
        if (selected_dropdown_item) {
          deselect_dropdown_item($(selected_dropdown_item));
        }

        item
          .addClass($(input).data('settings').classes.selectedDropdownItem)
          .attr('aria-selected', true);
        selected_dropdown_item = item.get(0);
      }
    }

    // Remove highlighting from an item in the results dropdown
    function deselect_dropdown_item(item) {
      item
        .removeClass($(input).data('settings').classes.selectedDropdownItem)
        .removeAttr('aria-selected');
      selected_dropdown_item = null;
    }

    // Do a search and show the "searching" dropdown if the input is longer
    // than $(input).data("settings").minChars
    function do_search() {
      var query = input_box.val();

      if (query && query.length) {
        if (selected_token) {
          deselect_token($(selected_token), POSITION.AFTER);
        }

        if (query.length >= $(input).data('settings').minChars) {
          show_dropdown_searching();
          clearTimeout(timeout);

          timeout = setTimeout(function () {
            run_search(query);
          }, $(input).data('settings').searchDelay);
        } else {
          hide_dropdown();
        }
      }
    }

    // Do the actual search
    function run_search(query) {
      var cache_key = query + computeURL();
      var cached_results = cache.get(cache_key);
      if (cached_results) {
        if ($.isFunction($(input).data('settings').onCachedResult)) {
          cached_results = $(input)
            .data('settings')
            .onCachedResult.call(hidden_input, cached_results);
        }
        populate_dropdown(query, cached_results);
      } else {
        // Are we doing an ajax search or local data search?
        if ($(input).data('settings').url) {
          var url = computeURL();
          // Extract exisiting get params
          var ajax_params = {};
          ajax_params.data = {};
          if (url.indexOf('?') > -1) {
            var parts = url.split('?');
            ajax_params.url = parts[0];

            var param_array = parts[1].split('&');
            $.each(param_array, function (index, value) {
              var kv = value.split('=');
              ajax_params.data[kv[0]] = kv[1];
            });
          } else {
            ajax_params.url = url;
          }

          // Prepare the request
          ajax_params.data[$(input).data('settings').queryParam] = $(input)
            .data('settings')
            .formatQueryParam(query, ajax_params);
          ajax_params.type = $(input).data('settings').method;
          ajax_params.dataType = $(input).data('settings').contentType;
          if ($(input).data('settings').crossDomain) {
            ajax_params.dataType = 'jsonp';
          }

          // Attach the success callback
          ajax_params.success = function (results) {
            if ($(input).data('settings').caching) {
              cache.add(
                cache_key,
                $(input).data('settings').jsonContainer
                  ? results[$(input).data('settings').jsonContainer]
                  : results
              );
            }
            if ($.isFunction($(input).data('settings').onResult)) {
              results = $(input)
                .data('settings')
                .onResult.call(hidden_input, results);
            }

            // only populate the dropdown if the results are associated with the active search query
            if (input_box.val() === query) {
              populate_dropdown(
                query,
                $(input).data('settings').jsonContainer
                  ? results[$(input).data('settings').jsonContainer]
                  : results
              );
            }
          };

          // Make the request
          $.ajax(ajax_params);
        } else if ($(input).data('settings').local_data) {
          // Do the search through local data
          var results = $.grep(
            $(input).data('settings').local_data,
            function (row) {
              return (
                row[$(input).data('settings').propertyToSearch]
                  .toLowerCase()
                  .indexOf(query.toLowerCase()) > -1
              );
            }
          );

          cache.add(cache_key, results);
          if ($.isFunction($(input).data('settings').onResult)) {
            results = $(input)
              .data('settings')
              .onResult.call(hidden_input, results);
          }
          populate_dropdown(query, results);
        }
      }
    }

    // compute the dynamic URL
    function computeURL() {
      var url = $(input).data('settings').url;
      if (typeof $(input).data('settings').url == 'function') {
        url = $(input).data('settings').url.call($(input).data('settings'));
      }
      return url;
    }

    // Bring browser focus to the specified object.
    // Use of setTimeout is to get around an IE bug.
    // (See, e.g., http://stackoverflow.com/questions/2600186/focus-doesnt-work-in-ie)
    //
    // obj: a jQuery object to focus()
    function focus_with_timeout(obj) {
      setTimeout(function () {
        obj.focus();
      }, 50);
    }
  };

  // Really basic cache for the results
  $.TokenList.Cache = function (options) {
    var settings = $.extend(
      {
        max_size: 500,
      },
      options
    );

    var data = {};
    var size = 0;

    var flush = function () {
      data = {};
      size = 0;
    };

    this.add = function (query, results) {
      if (size > settings.max_size) {
        flush();
      }

      if (!data[query]) {
        size += 1;
      }

      data[query] = results;
    };

    this.get = function (query) {
      return data[query];
    };
  };
})(jQuery);

$(function () {
  let resource_edit_path_regex = /^\/resources\/\d+\/edit$/;
  let on_resource_edit_path = window.location.pathname.match(
    resource_edit_path_regex
  );

  $.fn.linker = function () {
    $(this).each(function () {
      var $this = $(this);
      var $linkerWrapper = $this.parents('.linker-wrapper:first');

      if ($this.hasClass('initialised')) {
        return;
      }

      $this.addClass('initialised');

      // this is a bit hacky, but we need to have some input fields present in
      // the form so we don't have to rely on the linker to make sure data
      // persists. we can remove those after the linker does its thing.
      $('.prelinker', $linkerWrapper).remove();

      var config = {
        url: decodeURIComponent($this.data('url')),
        browse_url: decodeURIComponent($this.data('browse-url')),
        span_class: $this.data('span-class'),
        format_template: $this.data('format_template'),
        format_template_id: $this.data('format_template_id'),
        format_property: $this.data('format_property'),
        path: $this.data('path'),
        name: $this.data('name'),
        multiplicity: $this.data('multiplicity') || 'many',
        label: $this.data('label'),
        label_plural: $this.data('label_plural'),
        modal_id: $this.data('modal_id') || $this.attr('id') + '_modal',
        sortable: $this.data('sortable') === true,
        types: $this.data('types'),
        exclude_ids: $this.data('exclude') || [],
      };

      config.allow_multiple = config.multiplicity === 'many';

      if (
        config.format_template &&
        config.format_template.substring(0, 2) != '${'
      ) {
        config.format_template = '${' + config.format_template + '}';
      }

      var renderCreateFormForObject = function (form_uri) {
        var $modal = $('#' + config.modal_id);

        var initCreateForm = function (formEl) {
          $('.linker-container', $modal).html(formEl);
          $('#createAndLinkButton', $modal).removeAttr('disabled');
          $('form', $modal).ajaxForm({
            data: {
              inline: true,
            },
            beforeSubmit: function () {
              $('#createAndLinkButton', $modal).attr('disabled', 'disabled');
            },
            success: function (response, status, xhr) {
              if ($(response).is('form')) {
                initCreateForm(response);
              } else {
                if (config.multiplicity === 'one') {
                  clearTokens();
                }

                $this.tokenInput('add', {
                  id: response.uri,
                  name: tokenName(response),
                  json: response,
                });
                $this.triggerHandler('change');
                $modal.modal('hide');
              }
            },
            error: function (obj, errorText, errorDesc) {
              $('#createAndLinkButton', $modal).removeAttr('disabled');
            },
          });

          $modal.scrollTo('.alert');

          $modal.trigger('resize');
          $(document).triggerHandler('loadedrecordform.aspace', [$modal]);
        };

        $.ajax({
          url: form_uri,
          success: initCreateForm,
        });
        $('#createAndLinkButton', $modal).click(function () {
          $('form', $modal).triggerHandler('submit');
        });
      };

      var showLinkerCreateModal = function () {
        // Ensure all typeahead dropdowns are hidden (sometimes blur leaves them visible)
        $('.token-input-dropdown').hide();

        AS.openCustomModal(
          config.modal_id,
          'Create ' + config.label,
          AS.renderTemplate('linker_createmodal_template', config),
          'large',
          {},
          this
        );
        if ($(this).hasClass('linker-create-btn')) {
          renderCreateFormForObject($(this).data('target'));
        } else {
          renderCreateFormForObject(
            $('.linker-create-btn:first', $linkerWrapper).data('target')
          );
        }
        return false; // IE8 patch
      };

      var initAndShowLinkerBrowseModal = function () {
        var currentlySelected = {};

        var renderItemsInModal = function (page) {
          $.each($this.tokenInput('get'), function () {
            currentlySelected[this.id] = this.json;
          });

          $.ajax({
            url: config.browse_url,
            data: {
              page: 1,
              type: config.types,
              linker: true,
              exclude: config.exclude_ids,
              multiplicity: config.multiplicity,
            },
            type: 'GET',
            dataType: 'html',
            success: function (html) {
              var $modal = $('#' + config.modal_id);

              var $linkerBrowseContainer = $('.linker-container', $modal);

              var initBrowseFormInputs = function () {
                // add some click handlers to allow clicking of the row
                $(':input[name=linker-item]', $linkerBrowseContainer).each(
                  function () {
                    var $input = $(this);
                    $input.click(function (event) {
                      event.stopPropagation();

                      // If one-to-one, currentlySelected should only ever
                      // contain one record
                      if (!config.allow_multiple) {
                        currentlySelected = {};
                        $('tr.selected', $input.closest('table')).removeClass(
                          'selected'
                        );
                      }

                      if (
                        Object.prototype.hasOwnProperty.call(
                          currentlySelected,
                          $input.val()
                        )
                      ) {
                        // remove from the list
                        delete currentlySelected[$input.val()];
                        $input.closest('tr').removeClass('selected');
                      } else {
                        // add to the selected list
                        currentlySelected[$input.val()] = $input.data('object');
                        $input.closest('tr').addClass('selected');
                      }
                    });

                    $('td', $input.closest('tr')).click(function (event) {
                      event.preventDefault();

                      $input.trigger('click');
                    });
                  }
                );

                // select a result if it's currently a selected record
                $.each(currentlySelected, function (uri) {
                  $(":input[value='" + uri + "']", $linkerBrowseContainer)
                    .attr('checked', 'checked')
                    .closest('tr')
                    .addClass('selected');
                });

                $modal.trigger('resize');
              };

              $linkerBrowseContainer.html(html);
              $($linkerBrowseContainer).on(
                'click',
                'a:not(.dropdown-toggle):not(.record-toolbar .btn)',
                function (event) {
                  event.preventDefault();

                  $linkerBrowseContainer.load(
                    event.currentTarget.href,
                    initBrowseFormInputs
                  );
                }
              );

              $($linkerBrowseContainer).on('submit', 'form', function (event) {
                event.preventDefault();

                var $form = $(event.target);
                var method = ($form.attr('method') || 'get').toUpperCase();

                if (method == 'POST') {
                  jQuery.post(
                    $form.attr('action') + '.js',
                    $form.serializeArray(),
                    function (html) {
                      $linkerBrowseContainer.html(html);
                      initBrowseFormInputs();
                    }
                  );
                } else {
                  $linkerBrowseContainer.load(
                    $form.attr('action') + '.js?' + $form.serialize(),
                    initBrowseFormInputs
                  );
                }
              });

              initBrowseFormInputs();
            },
          });
        };

        var addSelected = function () {
          selectedItems = [];
          $('.token-input-delete-token', $linkerWrapper).each(function () {
            $(this).triggerHandler('click');
          });
          $.each(currentlySelected, function (uri, object) {
            $this.tokenInput('add', {
              id: uri,
              name: tokenName(object),
              json: object,
            });
          });
          $('#' + config.modal_id).modal('hide');
          $this.triggerHandler('change');
        };

        // Ensure all typeahead dropdowns are hidden (sometimes blur leaves them visible)
        $('.token-input-dropdown').hide();

        AS.openCustomModal(
          config.modal_id,
          'Browse ' + config.label_plural,
          AS.renderTemplate('linker_browsemodal_template', config),
          'large',
          {},
          this
        );
        renderItemsInModal();
        $('#' + config.modal_id).on('click', '#addSelectedButton', addSelected);
        $('#' + config.modal_id).on(
          'click',
          '.linker-list .pagination .navigation a',
          function () {
            renderItemsInModal($(this).attr('rel'));
          }
        );
        return false; // IE patch
      };

      var formatResults = function (searchData) {
        var formattedResults = [];

        var currentlySelectedIds = [];
        $.each($this.tokenInput('get'), function (obj) {
          currentlySelectedIds.push(obj.id);
        });

        $.each(searchData.search_data.results, function (index, obj) {
          // only allow selection of unselected items
          if ($.inArray(obj.uri, currentlySelectedIds) === -1) {
            formattedResults.push({
              name: tokenName(obj),
              id: obj.id,
              json: obj,
            });
          }
        });
        return formattedResults;
      };

      var addEventBindings = function () {
        $('.linker-browse-btn', $linkerWrapper).on(
          'click',
          initAndShowLinkerBrowseModal
        );
        $('.linker-create-btn', $linkerWrapper).on(
          'click',
          showLinkerCreateModal
        );

        // Initialise popover on demand to improve performance
        $linkerWrapper.one('mouseenter focus', '.has-popover', function () {
          $(document).triggerHandler('init.popovers', [$this.parent()]);
        });
      };

      var clearTokens = function () {
        // as tokenInput plugin won't clear a token
        // if it has an input.. remove all inputs first!
        var $tokenList = $('.token-input-list', $this.parent());
        for (var i = 0; i < $this.tokenInput('get').length; i++) {
          var id_to_remove = $this.tokenInput('get')[i].id.replace(/\//g, '_');
          $('#' + id_to_remove + ' :input', $tokenList).remove();
        }
        $this.tokenInput('clear');
      };

      var enableSorting = function () {
        if ($('.token-input-list', $linkerWrapper).data('sortable')) {
          $('.token-input-list', $linkerWrapper).sortable('destroy');
        }
        $('.token-input-list', $linkerWrapper).sortable({
          items: 'li.token-input-token',
        });
        $('.token-input-list', $linkerWrapper)
          .off('sortupdate')
          .on('sortupdate', function () {
            $this.parents('form:first').triggerHandler('formchanged.aspace');
          });
      };

      var tokensForPrepopulation = function () {
        if ($this.data('multiplicity') === 'one') {
          // If we are on a resource or archival object edit page, and open a top_container modal with a
          // collection_resource linker then we prepopulate the collection_resource field with resource
          // data necessary to perform the search
          let onResource = $('.label.label-info').text() === 'Resource';
          let onArchivalObject =
            $('.label.label-info').text() === 'Archival Object';
          let modalHasResource =
            $('.modal-dialog').find('#collection_resource').length > 0;
          let idMatches = $this[0].id === 'collection_resource';

          if (
            on_resource_edit_path &&
            modalHasResource &&
            idMatches &&
            (onResource || onArchivalObject)
          ) {
            let currentForm = $('#object_container').find('form').first();
            if (onResource) {
              return [
                {
                  id: currentForm.attr('data-update-monitor-record-uri'),
                  name: $('#resource_title_').text(),
                  json: {
                    id: currentForm.attr('data-update-monitor-record-uri'),
                    uri: currentForm.attr('data-update-monitor-record-uri'),
                    title: $('#resource_title_').text(),
                    jsonmodel_type: 'resource',
                  },
                },
              ];
            } else if (onArchivalObject) {
              return [
                {
                  id: $('#archival_object_resource_').attr('value'),
                  name: $('.record-title').first().text(),
                  json: {
                    id: $('#archival_object_resource_').attr('value'),
                    uri: $('#archival_object_resource_').attr('value'),
                    title: $('.record-title').first().text(),
                    jsonmodel_type: 'resource',
                  },
                },
              ];
            }
          }

          if ($.isEmptyObject($this.data('selected'))) {
            return [];
          }
          return [
            {
              id: $this.data('selected').uri,
              name: tokenName($this.data('selected')),
              json: $this.data('selected'),
            },
          ];
        } else {
          if (!$this.data('selected') || $this.data('selected').length === 0) {
            return [];
          }

          return $this.data('selected').map(function (item) {
            if (typeof item == 'string') {
              item = JSON.parse(item);
            }
            return {
              id: item.uri,
              name: tokenName(item),
              json: item,
            };
          });
        }
      };

      // ANW-521: For subjects, we want to have specialized icons based on the subjects' term type.
      var tag_subjects_by_term_type = function (obj) {
        if (obj.json.jsonmodel_type == 'subject') {
          switch (obj.json.first_term_type) {
            case 'cultural_context':
              return 'subject_type_cultural_context';
            case 'function':
              return 'subject_type_function';
            case 'genre_form':
              return 'subject_type_genre_form';
            case 'geographic':
              return 'subject_type_geographic';
            case 'occupation':
              return 'subject_type_occupation';
            case 'style_period':
              return 'subject_type_style_period';
            case 'technique':
              return 'subject_type_technique';
            case 'temporal':
              return 'subject_type_temporal';
            case 'topical':
              return 'subject_type_topical';
            case 'uniform_title':
              return 'subject_type_uniform_title';
            default:
              return '';
          }
        } else {
          return '';
        }
      };

      // ANW-631, ANW-700: Add four_part_id to token name via data source
      function tokenName(object) {
        var title = object.display_string || object.title;

        function output(id) {
          return id + ': ' + title;
        }

        if (object.four_part_id !== undefined) {
          // Data comes from Solr index
          return output(object.four_part_id.split(' ').join('-'));
        } else if (object.digital_object_id !== undefined) {
          // Data comes from Solr index
          return output(object.digital_object_id);
        } else {
          // Data comes from JSON property on data from Solr index
          var idProperties = ['id_0', 'id_1', 'id_2', 'id_3'];
          var fourPartIdArr = idProperties.reduce(function (acc, id) {
            if (object[id] !== undefined) {
              acc.push(object[id]);
            }
            return acc;
          }, []);

          return fourPartIdArr.length > 0
            ? output(fourPartIdArr.join('-'))
            : title;
        }
      }

      var init = function () {
        var tokenInputConfig = $.extend({}, AS.linker_locales, {
          animateDropdown: false,
          preventDuplicates: true,
          allowFreeTagging: false,
          tokenLimit: config.multiplicity === 'one' ? 1 : null,
          caching: false,
          onCachedResult: formatResults,
          onResult: formatResults,
          zindex: 1100,
          tokenFormatter: function (item) {
            var tokenEl = $(
              AS.renderTemplate('linker_selectedtoken_template', {
                item: item,
                config: config,
              })
            );
            tokenEl
              .children('div')
              .children('.icon-token')
              .addClass(config.span_class);
            $('input[name*=resolved]', tokenEl).val(JSON.stringify(item.json));
            return tokenEl;
          },
          resultsFormatter: function (item) {
            var string = item.name;
            var $resultSpan = $(
              "<span class='" +
                item.json.jsonmodel_type +
                "' aria-label='" +
                string +
                "'>"
            );
            var extra_class = tag_subjects_by_term_type(item);
            $resultSpan.text(string);
            $resultSpan.prepend(
              "<span class='icon-token " + extra_class + "'></span>"
            );
            var $resultLi = $("<li role='option'>");
            $resultLi.append($resultSpan);
            return $resultLi[0].outerHTML;
          },
          prePopulate: tokensForPrepopulation(),
          onDelete: function () {
            $this.triggerHandler('change');
          },
          onAdd: function (item) {
            // ANW-521: After adding a subject, find the added node and apply the special class for that node.
            var extra_class = tag_subjects_by_term_type(item);
            var added_node_id = '#' + item.id.replace(/\//g, '_');

            added_node = $(added_node_id);
            added_node
              .children('div')
              .children('.icon-token')
              .addClass(extra_class);

            if (config.sortable && config.allow_multiple) {
              enableSorting();
            }

            //            $this.triggerHandler("change");
            $(document).triggerHandler('init.popovers', [$this.parent()]);
          },
          formatQueryParam: function (q, ajax_params) {
            if (
              $this.tokenInput('get').length > 0 ||
              config.exclude_ids.length > 0
            ) {
              var currentlySelectedIds = $.merge([], config.exclude_ids);
              $.each($this.tokenInput('get'), function (i, obj) {
                currentlySelectedIds.push(obj.id);
              });

              ajax_params.data['exclude[]'] = currentlySelectedIds;
            }
            if (config.types && config.types.length > 0) {
              ajax_params.data['type'] = config.types;
            }

            return (q + '*').toLowerCase();
          },
        });

        setTimeout(function () {
          $this.tokenInput(config.url, tokenInputConfig);
          $(
            '> :input[type=text]',
            $('.token-input-input-token', $this.parent())
          )
            .attr('placeholder', AS.linker_locales.hintText)
            .attr('aria-label', config.label)
            .attr('role', 'searchbox')
            .attr('aria-multiline', 'false');
          $(
            '> :input[type=text]',
            $('.token-input-input-token', $this.parent())
          ).addClass('form-control');

          $this.parent().addClass('multiplicity-' + config.multiplicity);

          if (config.sortable && config.allow_multiple) {
            enableSorting();
            $linkerWrapper.addClass('sortable');
          }

          // This is part of automatically executing a search for the current resource on the browse top
          // containers modal when opened from the edit resource or archival object pages.
          // If this setTimeout is for the last linker in the modal, only then is it safe to execute the search
          let lastLinker = $('.modal-dialog').find('.linker').last();
          let isLastLinker = lastLinker.attr('id') === $this.context.id;
          let onResource = $('.label.label-info').text() === 'Resource';
          let onArchivalObject =
            $('.label.label-info').text() === 'Archival Object';
          let modalHasResource =
            $('.modal-dialog').find('#collection_resource').length > 0;
          let resultsEmpty =
            $('.modal-dialog').find('.table-search-results').length < 1;

          if (
            on_resource_edit_path &&
            modalHasResource &&
            resultsEmpty &&
            isLastLinker &&
            (onResource || onArchivalObject)
          ) {
            $('.modal-dialog').find("input[type='submit']").click();
          }
        });

        addEventBindings();
      };

      init();
    });
  };
});

$(document).ready(function () {
  $(document).bind('loadedrecordsubforms.aspace', function (event, $container) {
    $(
      '.linker-wrapper:visible > .linker:not(.initialised)',
      $container
    ).linker();
    // we can go ahead and init dropdowns ( such as those in the toolbars )
    $('#archives_tree_toolbar .linker:not(.initialised)').linker();
  });

  $(document).bind(
    'subrecordcreated.aspace',
    function (event, object_name, subform) {
      $('.linker:not(.initialised)', subform).linker();
    }
  );
});
// All functions that need access to the editor's state live inside
// the CodeMirror function. Below that, at the bottom of the file,
// some utilities are defined.

// CodeMirror is the only global var we claim
window.CodeMirror = (function() {
  "use strict";
  // This is the function that produces an editor instance. Its
  // closure is used to store the editor state.
  function CodeMirror(place, givenOptions) {
    // Determine effective options based on given values and defaults.
    var options = {}, defaults = CodeMirror.defaults;
    for (var opt in defaults)
      if (defaults.hasOwnProperty(opt))
        options[opt] = (givenOptions && givenOptions.hasOwnProperty(opt) ? givenOptions : defaults)[opt];

    var input = elt("textarea", null, null, "position: absolute; padding: 0; width: 1px; height: 1em");
    input.setAttribute("wrap", "off"); input.setAttribute("autocorrect", "off"); input.setAttribute("autocapitalize", "off");
    // Wraps and hides input textarea
    var inputDiv = elt("div", [input], null, "overflow: hidden; position: relative; width: 3px; height: 0px;");
    // The empty scrollbar content, used solely for managing the scrollbar thumb.
    var scrollbarInner = elt("div", null, "CodeMirror-scrollbar-inner");
    // The vertical scrollbar. Horizontal scrolling is handled by the scroller itself.
    var scrollbar = elt("div", [scrollbarInner], "CodeMirror-scrollbar");
    // DIVs containing the selection and the actual code
    var lineDiv = elt("div"), selectionDiv = elt("div", null, null, "position: relative; z-index: -1");
    // Blinky cursor, and element used to ensure cursor fits at the end of a line
    var cursor = elt("pre", "\u00a0", "CodeMirror-cursor"), widthForcer = elt("pre", "\u00a0", "CodeMirror-cursor", "visibility: hidden");
    // Used to measure text size
    var measure = elt("div", null, null, "position: absolute; width: 100%; height: 0px; overflow: hidden; visibility: hidden;");
    var lineSpace = elt("div", [measure, cursor, widthForcer, selectionDiv, lineDiv], null, "position: relative; z-index: 0");
    var gutterText = elt("div", null, "CodeMirror-gutter-text"), gutter = elt("div", [gutterText], "CodeMirror-gutter");
    // Moved around its parent to cover visible view
    var mover = elt("div", [gutter, elt("div", [lineSpace], "CodeMirror-lines")], null, "position: relative");
    // Set to the height of the text, causes scrolling
    var sizer = elt("div", [mover], null, "position: relative");
    // Provides scrolling
    var scroller = elt("div", [sizer], "CodeMirror-scroll");
    scroller.setAttribute("tabIndex", "-1");
    // The element in which the editor lives.
    var wrapper = elt("div", [inputDiv, scrollbar, scroller], "CodeMirror" + (options.lineWrapping ? " CodeMirror-wrap" : ""));
    if (place.appendChild) place.appendChild(wrapper); else place(wrapper);

    themeChanged(); keyMapChanged();
    // Needed to hide big blue blinking cursor on Mobile Safari
    if (ios) input.style.width = "0px";
    if (!webkit) scroller.draggable = true;
    lineSpace.style.outline = "none";
    if (options.tabindex != null) input.tabIndex = options.tabindex;
    if (options.autofocus) focusInput();
    if (!options.gutter && !options.lineNumbers) gutter.style.display = "none";
    // Needed to handle Tab key in KHTML
    if (khtml) inputDiv.style.height = "1px", inputDiv.style.position = "absolute";

    // Check for OS X >= 10.7. This has transparent scrollbars, so the
    // overlaying of one scrollbar with another won't work. This is a
    // temporary hack to simply turn off the overlay scrollbar. See
    // issue #727.
    if (mac_geLion) { scrollbar.style.zIndex = -2; scrollbar.style.visibility = "hidden"; }
    // Need to set a minimum width to see the scrollbar on IE7 (but must not set it on IE8).
    else if (ie_lt8) scrollbar.style.minWidth = "18px";

    // Delayed object wrap timeouts, making sure only one is active. blinker holds an interval.
    var poll = new Delayed(), highlight = new Delayed(), blinker;

    // mode holds a mode API object. doc is the tree of Line objects,
    // frontier is the point up to which the content has been parsed,
    // and history the undo history (instance of History constructor).
    var mode, doc = new BranchChunk([new LeafChunk([new Line("")])]), frontier = 0, focused;
    loadMode();
    // The selection. These are always maintained to point at valid
    // positions. Inverted is used to remember that the user is
    // selecting bottom-to-top.
    var sel = {from: {line: 0, ch: 0}, to: {line: 0, ch: 0}, inverted: false};
    // Selection-related flags. shiftSelecting obviously tracks
    // whether the user is holding shift.
    var shiftSelecting, lastClick, lastDoubleClick, lastScrollTop = 0, draggingText,
        overwrite = false, suppressEdits = false, pasteIncoming = false;
    // Variables used by startOperation/endOperation to track what
    // happened during the operation.
    var updateInput, userSelChange, changes, textChanged, selectionChanged,
        gutterDirty, callbacks;
    // Current visible range (may be bigger than the view window).
    var displayOffset = 0, showingFrom = 0, showingTo = 0, lastSizeC = 0;
    // bracketHighlighted is used to remember that a bracket has been
    // marked.
    var bracketHighlighted;
    // Tracks the maximum line length so that the horizontal scrollbar
    // can be kept static when scrolling.
    var maxLine = getLine(0), updateMaxLine = false, maxLineChanged = true;
    var pollingFast = false; // Ensures slowPoll doesn't cancel fastPoll
    var goalColumn = null;

    // Initialize the content.
    operation(function(){setValue(options.value || ""); updateInput = false;})();
    var history = new History();

    // Register our event handlers.
    connect(scroller, "mousedown", operation(onMouseDown));
    connect(scroller, "dblclick", operation(onDoubleClick));
    connect(lineSpace, "selectstart", e_preventDefault);
    // Gecko browsers fire contextmenu *after* opening the menu, at
    // which point we can't mess with it anymore. Context menu is
    // handled in onMouseDown for Gecko.
    if (!gecko) connect(scroller, "contextmenu", onContextMenu);
    connect(scroller, "scroll", onScrollMain);
    connect(scrollbar, "scroll", onScrollBar);
    connect(scrollbar, "mousedown", function() {if (focused) setTimeout(focusInput, 0);});
    var resizeHandler = connect(window, "resize", function() {
      if (wrapper.parentNode) updateDisplay(true);
      else resizeHandler();
    }, true);
    connect(input, "keyup", operation(onKeyUp));
    connect(input, "input", fastPoll);
    connect(input, "keydown", operation(onKeyDown));
    connect(input, "keypress", operation(onKeyPress));
    connect(input, "focus", onFocus);
    connect(input, "blur", onBlur);

    function drag_(e) {
      if (options.onDragEvent && options.onDragEvent(instance, addStop(e))) return;
      e_stop(e);
    }
    if (options.dragDrop) {
      connect(scroller, "dragstart", onDragStart);
      connect(scroller, "dragenter", drag_);
      connect(scroller, "dragover", drag_);
      connect(scroller, "drop", operation(onDrop));
    }
    connect(scroller, "paste", function(){focusInput(); fastPoll();});
    connect(input, "paste", function(){pasteIncoming = true; fastPoll();});
    connect(input, "cut", operation(function(){
      if (!options.readOnly) replaceSelection("");
    }));

    // Needed to handle Tab key in KHTML
    if (khtml) connect(sizer, "mouseup", function() {
        if (document.activeElement == input) input.blur();
        focusInput();
    });

    // IE throws unspecified error in certain cases, when
    // trying to access activeElement before onload
    var hasFocus; try { hasFocus = (document.activeElement == input); } catch(e) { }
    if (hasFocus || options.autofocus) setTimeout(onFocus, 20);
    else onBlur();

    function isLine(l) {return l >= 0 && l < doc.size;}
    // The instance object that we'll return. Mostly calls out to
    // local functions in the CodeMirror function. Some do some extra
    // range checking and/or clipping. operation is used to wrap the
    // call so that changes it makes are tracked, and the display is
    // updated afterwards.
    var instance = wrapper.CodeMirror = {
      getValue: getValue,
      setValue: operation(setValue),
      getSelection: getSelection,
      replaceSelection: operation(replaceSelection),
      focus: function(){window.focus(); focusInput(); onFocus(); fastPoll();},
      setOption: function(option, value) {
        var oldVal = options[option];
        options[option] = value;
        if (option == "mode" || option == "indentUnit") loadMode();
        else if (option == "readOnly" && value == "nocursor") {onBlur(); input.blur();}
        else if (option == "readOnly" && !value) {resetInput(true);}
        else if (option == "theme") themeChanged();
        else if (option == "lineWrapping" && oldVal != value) operation(wrappingChanged)();
        else if (option == "tabSize") updateDisplay(true);
        else if (option == "keyMap") keyMapChanged();
        else if (option == "tabindex") input.tabIndex = value;
        if (option == "lineNumbers" || option == "gutter" || option == "firstLineNumber" ||
            option == "theme" || option == "lineNumberFormatter") {
          gutterChanged();
          updateDisplay(true);
        }
      },
      getOption: function(option) {return options[option];},
      getMode: function() {return mode;},
      undo: operation(undo),
      redo: operation(redo),
      indentLine: operation(function(n, dir) {
        if (typeof dir != "string") {
          if (dir == null) dir = options.smartIndent ? "smart" : "prev";
          else dir = dir ? "add" : "subtract";
        }
        if (isLine(n)) indentLine(n, dir);
      }),
      indentSelection: operation(indentSelected),
      historySize: function() {return {undo: history.done.length, redo: history.undone.length};},
      clearHistory: function() {history = new History();},
      setHistory: function(histData) {
        history = new History();
        history.done = histData.done;
        history.undone = histData.undone;
      },
      getHistory: function() {
        function cp(arr) {
          for (var i = 0, nw = [], nwelt; i < arr.length; ++i) {
            nw.push(nwelt = []);
            for (var j = 0, elt = arr[i]; j < elt.length; ++j) {
              var old = [], cur = elt[j];
              nwelt.push({start: cur.start, added: cur.added, old: old});
              for (var k = 0; k < cur.old.length; ++k) old.push(hlText(cur.old[k]));
            }
          }
          return nw;
        }
        return {done: cp(history.done), undone: cp(history.undone)};
      },
      matchBrackets: operation(function(){matchBrackets(true);}),
      getTokenAt: operation(function(pos) {
        pos = clipPos(pos);
        return getLine(pos.line).getTokenAt(mode, getStateBefore(pos.line), options.tabSize, pos.ch);
      }),
      getStateAfter: function(line) {
        line = clipLine(line == null ? doc.size - 1: line);
        return getStateBefore(line + 1);
      },
      cursorCoords: function(start, mode) {
        if (start == null) start = sel.inverted;
        return this.charCoords(start ? sel.from : sel.to, mode);
      },
      charCoords: function(pos, mode) {
        pos = clipPos(pos);
        if (mode == "local") return localCoords(pos, false);
        if (mode == "div") return localCoords(pos, true);
        return pageCoords(pos);
      },
      coordsChar: function(coords) {
        var off = eltOffset(lineSpace);
        return coordsChar(coords.x - off.left, coords.y - off.top);
      },
      defaultTextHeight: function() { return textHeight(); },
      markText: operation(markText),
      setBookmark: setBookmark,
      findMarksAt: findMarksAt,
      setMarker: operation(addGutterMarker),
      clearMarker: operation(removeGutterMarker),
      setLineClass: operation(setLineClass),
      hideLine: operation(function(h) {return setLineHidden(h, true);}),
      showLine: operation(function(h) {return setLineHidden(h, false);}),
      onDeleteLine: function(line, f) {
        if (typeof line == "number") {
          if (!isLine(line)) return null;
          line = getLine(line);
        }
        (line.handlers || (line.handlers = [])).push(f);
        return line;
      },
      lineInfo: lineInfo,
      getViewport: function() { return {from: showingFrom, to: showingTo};},
      addWidget: function(pos, node, scroll, vert, horiz) {
        pos = localCoords(clipPos(pos));
        var top = pos.yBot, left = pos.x;
        node.style.position = "absolute";
        sizer.appendChild(node);
        if (vert == "over") top = pos.y;
        else if (vert == "near") {
          var vspace = Math.max(scroller.offsetHeight, doc.height * textHeight()),
              hspace = Math.max(sizer.clientWidth, lineSpace.clientWidth) - paddingLeft();
          if (pos.yBot + node.offsetHeight > vspace && pos.y > node.offsetHeight)
            top = pos.y - node.offsetHeight;
          if (left + node.offsetWidth > hspace)
            left = hspace - node.offsetWidth;
        }
        node.style.top = (top + paddingTop()) + "px";
        node.style.left = node.style.right = "";
        if (horiz == "right") {
          left = sizer.clientWidth - node.offsetWidth;
          node.style.right = "0px";
        } else {
          if (horiz == "left") left = 0;
          else if (horiz == "middle") left = (sizer.clientWidth - node.offsetWidth) / 2;
          node.style.left = (left + paddingLeft()) + "px";
        }
        if (scroll)
          scrollIntoView(left, top, left + node.offsetWidth, top + node.offsetHeight);
      },

      lineCount: function() {return doc.size;},
      clipPos: clipPos,
      getCursor: function(start) {
        if (start == null) start = sel.inverted;
        return copyPos(start ? sel.from : sel.to);
      },
      somethingSelected: function() {return !posEq(sel.from, sel.to);},
      setCursor: operation(function(line, ch, user) {
        if (ch == null && typeof line.line == "number") setCursor(line.line, line.ch, user);
        else setCursor(line, ch, user);
      }),
      setSelection: operation(function(from, to, user) {
        (user ? setSelectionUser : setSelection)(clipPos(from), clipPos(to || from));
      }),
      getLine: function(line) {if (isLine(line)) return getLine(line).text;},
      getLineHandle: function(line) {if (isLine(line)) return getLine(line);},
      setLine: operation(function(line, text) {
        if (isLine(line)) replaceRange(text, {line: line, ch: 0}, {line: line, ch: getLine(line).text.length});
      }),
      removeLine: operation(function(line) {
        if (isLine(line)) replaceRange("", {line: line, ch: 0}, clipPos({line: line+1, ch: 0}));
      }),
      replaceRange: operation(replaceRange),
      getRange: function(from, to, lineSep) {return getRange(clipPos(from), clipPos(to), lineSep);},

      triggerOnKeyDown: operation(onKeyDown),
      execCommand: function(cmd) {return commands[cmd](instance);},
      // Stuff used by commands, probably not much use to outside code.
      moveH: operation(moveH),
      deleteH: operation(deleteH),
      moveV: operation(moveV),
      toggleOverwrite: function() {
        if(overwrite){
          overwrite = false;
          cursor.className = cursor.className.replace(" CodeMirror-overwrite", "");
        } else {
          overwrite = true;
          cursor.className += " CodeMirror-overwrite";
        }
      },

      posFromIndex: function(off) {
        var lineNo = 0, ch;
        doc.iter(0, doc.size, function(line) {
          var sz = line.text.length + 1;
          if (sz > off) { ch = off; return true; }
          off -= sz;
          ++lineNo;
        });
        return clipPos({line: lineNo, ch: ch});
      },
      indexFromPos: function (coords) {
        if (coords.line < 0 || coords.ch < 0) return 0;
        var index = coords.ch;
        doc.iter(0, coords.line, function (line) {
          index += line.text.length + 1;
        });
        return index;
      },
      scrollTo: function(x, y) {
        if (x != null) scroller.scrollLeft = x;
        if (y != null) scrollbar.scrollTop = scroller.scrollTop = y;
        updateDisplay([]);
      },
      getScrollInfo: function() {
        return {x: scroller.scrollLeft, y: scrollbar.scrollTop,
                height: scrollbar.scrollHeight, width: scroller.scrollWidth};
      },
      scrollIntoView: function(pos) {
        var coords = localCoords(pos ? clipPos(pos) : sel.inverted ? sel.from : sel.to);
        scrollIntoView(coords.x, coords.y, coords.x, coords.yBot);
      },

      setSize: function(width, height) {
        function interpret(val) {
          val = String(val);
          return /^\d+$/.test(val) ? val + "px" : val;
        }
        if (width != null) wrapper.style.width = interpret(width);
        if (height != null) scroller.style.height = interpret(height);
        instance.refresh();
      },

      operation: function(f){return operation(f)();},
      compoundChange: function(f){return compoundChange(f);},
      refresh: function(){
        updateDisplay(true, null, lastScrollTop);
        if (scrollbar.scrollHeight > lastScrollTop)
          scrollbar.scrollTop = lastScrollTop;
      },
      getInputField: function(){return input;},
      getWrapperElement: function(){return wrapper;},
      getScrollerElement: function(){return scroller;},
      getGutterElement: function(){return gutter;}
    };

    function getLine(n) { return getLineAt(doc, n); }
    function updateLineHeight(line, height) {
      gutterDirty = true;
      var diff = height - line.height;
      for (var n = line; n; n = n.parent) n.height += diff;
    }

    function lineContent(line, wrapAt) {
      if (!line.styles)
        line.highlight(mode, line.stateAfter = getStateBefore(lineNo(line)), options.tabSize);
      return line.getContent(options.tabSize, wrapAt, options.lineWrapping);
    }

    function setValue(code) {
      var top = {line: 0, ch: 0};
      updateLines(top, {line: doc.size - 1, ch: getLine(doc.size-1).text.length},
                  splitLines(code), top, top);
      updateInput = true;
    }
    function getValue(lineSep) {
      var text = [];
      doc.iter(0, doc.size, function(line) { text.push(line.text); });
      return text.join(lineSep || "\n");
    }

    function onScrollBar(e) {
      if (Math.abs(scrollbar.scrollTop - lastScrollTop) > 1) {
        lastScrollTop = scroller.scrollTop = scrollbar.scrollTop;
        updateDisplay([]);
      }
    }

    function onScrollMain(e) {
      if (options.fixedGutter && gutter.style.left != scroller.scrollLeft + "px")
        gutter.style.left = scroller.scrollLeft + "px";
      if (Math.abs(scroller.scrollTop - lastScrollTop) > 1) {
        lastScrollTop = scroller.scrollTop;
        if (scrollbar.scrollTop != lastScrollTop)
          scrollbar.scrollTop = lastScrollTop;
        updateDisplay([]);
      }
      if (options.onScroll) options.onScroll(instance);
    }

    function onMouseDown(e) {
      setShift(e_prop(e, "shiftKey"));
      // Check whether this is a click in a widget
      for (var n = e_target(e); n != wrapper; n = n.parentNode)
        if (n.parentNode == sizer && n != mover) return;

      // See if this is a click in the gutter
      for (var n = e_target(e); n != wrapper; n = n.parentNode)
        if (n.parentNode == gutterText) {
          if (options.onGutterClick)
            options.onGutterClick(instance, indexOf(gutterText.childNodes, n) + showingFrom, e);
          return e_preventDefault(e);
        }

      var start = posFromMouse(e);

      switch (e_button(e)) {
      case 3:
        if (gecko) onContextMenu(e);
        return;
      case 2:
        if (start) setCursor(start.line, start.ch, true);
        setTimeout(focusInput, 20);
        e_preventDefault(e);
        return;
      }
      // For button 1, if it was clicked inside the editor
      // (posFromMouse returning non-null), we have to adjust the
      // selection.
      if (!start) {if (e_target(e) == scroller) e_preventDefault(e); return;}

      if (!focused) onFocus();

      var now = +new Date, type = "single";
      if (lastDoubleClick && lastDoubleClick.time > now - 400 && posEq(lastDoubleClick.pos, start)) {
        type = "triple";
        e_preventDefault(e);
        setTimeout(focusInput, 20);
        selectLine(start.line);
      } else if (lastClick && lastClick.time > now - 400 && posEq(lastClick.pos, start)) {
        type = "double";
        lastDoubleClick = {time: now, pos: start};
        e_preventDefault(e);
        var word = findWordAt(start);
        setSelectionUser(word.from, word.to);
      } else { lastClick = {time: now, pos: start}; }

      function dragEnd(e2) {
        if (webkit) scroller.draggable = false;
        draggingText = false;
        up(); drop();
        if (Math.abs(e.clientX - e2.clientX) + Math.abs(e.clientY - e2.clientY) < 10) {
          e_preventDefault(e2);
          setCursor(start.line, start.ch, true);
          focusInput();
        }
      }
      var last = start, going;
      if (options.dragDrop && dragAndDrop && !options.readOnly && !posEq(sel.from, sel.to) &&
          !posLess(start, sel.from) && !posLess(sel.to, start) && type == "single") {
        // Let the drag handler handle this.
        if (webkit) scroller.draggable = true;
        var up = connect(document, "mouseup", operation(dragEnd), true);
        var drop = connect(scroller, "drop", operation(dragEnd), true);
        draggingText = true;
        // IE's approach to draggable
        if (scroller.dragDrop) scroller.dragDrop();
        return;
      }
      e_preventDefault(e);
      if (type == "single") setCursor(start.line, start.ch, true);

      var startstart = sel.from, startend = sel.to;

      function doSelect(cur) {
        if (type == "single") {
          setSelectionUser(start, cur);
        } else if (type == "double") {
          var word = findWordAt(cur);
          if (posLess(cur, startstart)) setSelectionUser(word.from, startend);
          else setSelectionUser(startstart, word.to);
        } else if (type == "triple") {
          if (posLess(cur, startstart)) setSelectionUser(startend, clipPos({line: cur.line, ch: 0}));
          else setSelectionUser(startstart, clipPos({line: cur.line + 1, ch: 0}));
        }
      }

      function extend(e) {
        var cur = posFromMouse(e, true);
        if (cur && !posEq(cur, last)) {
          if (!focused) onFocus();
          last = cur;
          doSelect(cur);
          updateInput = false;
          var visible = visibleLines();
          if (cur.line >= visible.to || cur.line < visible.from)
            going = setTimeout(operation(function(){extend(e);}), 150);
        }
      }

      function done(e) {
        clearTimeout(going);
        var cur = posFromMouse(e);
        if (cur) doSelect(cur);
        e_preventDefault(e);
        focusInput();
        updateInput = true;
        move(); up();
      }
      var move = connect(document, "mousemove", operation(function(e) {
        clearTimeout(going);
        e_preventDefault(e);
        if (!ie && !e_button(e)) done(e);
        else extend(e);
      }), true);
      var up = connect(document, "mouseup", operation(done), true);
    }
    function onDoubleClick(e) {
      for (var n = e_target(e); n != wrapper; n = n.parentNode)
        if (n.parentNode == gutterText) return e_preventDefault(e);
      e_preventDefault(e);
    }
    function onDrop(e) {
      if (options.onDragEvent && options.onDragEvent(instance, addStop(e))) return;
      e_preventDefault(e);
      var pos = posFromMouse(e, true), files = e.dataTransfer.files;
      if (!pos || options.readOnly) return;
      if (files && files.length && window.FileReader && window.File) {
        var n = files.length, text = Array(n), read = 0;
        var loadFile = function(file, i) {
          var reader = new FileReader;
          reader.onload = function() {
            text[i] = reader.result;
            if (++read == n) {
              pos = clipPos(pos);
              operation(function() {
                var end = replaceRange(text.join(""), pos, pos);
                setSelectionUser(pos, end);
              })();
            }
          };
          reader.readAsText(file);
        };
        for (var i = 0; i < n; ++i) loadFile(files[i], i);
      } else {
        // Don't do a replace if the drop happened inside of the selected text.
        if (draggingText && !(posLess(pos, sel.from) || posLess(sel.to, pos))) return;
        try {
          var text = e.dataTransfer.getData("Text");
          if (text) {
            compoundChange(function() {
              var curFrom = sel.from, curTo = sel.to;
              setSelectionUser(pos, pos);
              if (draggingText) replaceRange("", curFrom, curTo);
              replaceSelection(text);
              focusInput();
            });
          }
        }
        catch(e){}
      }
    }
    function onDragStart(e) {
      var txt = getSelection();
      e.dataTransfer.setData("Text", txt);

      // Use dummy image instead of default browsers image.
      if (e.dataTransfer.setDragImage)
        e.dataTransfer.setDragImage(elt('img'), 0, 0);
    }

    function doHandleBinding(bound, dropShift) {
      if (typeof bound == "string") {
        bound = commands[bound];
        if (!bound) return false;
      }
      var prevShift = shiftSelecting;
      try {
        if (options.readOnly) suppressEdits = true;
        if (dropShift) shiftSelecting = null;
        bound(instance);
      } catch(e) {
        if (e != Pass) throw e;
        return false;
      } finally {
        shiftSelecting = prevShift;
        suppressEdits = false;
      }
      return true;
    }
    var maybeTransition;
    function handleKeyBinding(e) {
      // Handle auto keymap transitions
      var startMap = getKeyMap(options.keyMap), next = startMap.auto;
      clearTimeout(maybeTransition);
      if (next && !isModifierKey(e)) maybeTransition = setTimeout(function() {
        if (getKeyMap(options.keyMap) == startMap) {
          options.keyMap = (next.call ? next.call(null, instance) : next);
        }
      }, 50);

      var name = keyNames[e_prop(e, "keyCode")], handled = false;
      var flipCtrlCmd = opera && mac;
      if (name == null || e.altGraphKey) return false;
      if (e_prop(e, "altKey")) name = "Alt-" + name;
      if (e_prop(e, flipCtrlCmd ? "metaKey" : "ctrlKey")) name = "Ctrl-" + name;
      if (e_prop(e, flipCtrlCmd ? "ctrlKey" : "metaKey")) name = "Cmd-" + name;

      var stopped = false;
      function stop() { stopped = true; }

      if (e_prop(e, "shiftKey")) {
        handled = lookupKey("Shift-" + name, options.extraKeys, options.keyMap,
                            function(b) {return doHandleBinding(b, true);}, stop)
               || lookupKey(name, options.extraKeys, options.keyMap, function(b) {
                 if (typeof b == "string" && /^go[A-Z]/.test(b)) return doHandleBinding(b);
               }, stop);
      } else {
        handled = lookupKey(name, options.extraKeys, options.keyMap, doHandleBinding, stop);
      }
      if (stopped) handled = false;
      if (handled) {
        e_preventDefault(e);
        restartBlink();
        if (ie_lt9) { e.oldKeyCode = e.keyCode; e.keyCode = 0; }
      }
      return handled;
    }
    function handleCharBinding(e, ch) {
      var handled = lookupKey("'" + ch + "'", options.extraKeys,
                              options.keyMap, function(b) { return doHandleBinding(b, true); });
      if (handled) {
        e_preventDefault(e);
        restartBlink();
      }
      return handled;
    }

    var lastStoppedKey = null;
    function onKeyDown(e) {
      if (!focused) onFocus();
      if (ie && e.keyCode == 27) { e.returnValue = false; }
      if (pollingFast) { if (readInput()) pollingFast = false; }
      if (options.onKeyEvent && options.onKeyEvent(instance, addStop(e))) return;
      var code = e_prop(e, "keyCode");
      // IE does strange things with escape.
      setShift(code == 16 || e_prop(e, "shiftKey"));
      // First give onKeyEvent option a chance to handle this.
      var handled = handleKeyBinding(e);
      if (opera) {
        lastStoppedKey = handled ? code : null;
        // Opera has no cut event... we try to at least catch the key combo
        if (!handled && code == 88 && e_prop(e, mac ? "metaKey" : "ctrlKey"))
          replaceSelection("");
      }
    }
    function onKeyPress(e) {
      if (pollingFast) readInput();
      if (options.onKeyEvent && options.onKeyEvent(instance, addStop(e))) return;
      var keyCode = e_prop(e, "keyCode"), charCode = e_prop(e, "charCode");
      if (opera && keyCode == lastStoppedKey) {lastStoppedKey = null; e_preventDefault(e); return;}
      if (((opera && (!e.which || e.which < 10)) || khtml) && handleKeyBinding(e)) return;
      var ch = String.fromCharCode(charCode == null ? keyCode : charCode);
      if (options.electricChars && mode.electricChars && options.smartIndent && !options.readOnly) {
        if (mode.electricChars.indexOf(ch) > -1)
          setTimeout(operation(function() {indentLine(sel.to.line, "smart");}), 75);
      }
      if (handleCharBinding(e, ch)) return;
      fastPoll();
    }
    function onKeyUp(e) {
      if (options.onKeyEvent && options.onKeyEvent(instance, addStop(e))) return;
      if (e_prop(e, "keyCode") == 16) shiftSelecting = null;
    }

    function onFocus() {
      if (options.readOnly == "nocursor") return;
      if (!focused) {
        if (options.onFocus) options.onFocus(instance);
        focused = true;
        if (scroller.className.search(/\bCodeMirror-focused\b/) == -1)
          scroller.className += " CodeMirror-focused";
      }
      slowPoll();
      restartBlink();
    }
    function onBlur() {
      if (focused) {
        if (options.onBlur) options.onBlur(instance);
        focused = false;
        if (bracketHighlighted)
          operation(function(){
            if (bracketHighlighted) { bracketHighlighted(); bracketHighlighted = null; }
          })();
        scroller.className = scroller.className.replace(" CodeMirror-focused", "");
      }
      clearInterval(blinker);
      setTimeout(function() {if (!focused) shiftSelecting = null;}, 150);
    }

    // Replace the range from from to to by the strings in newText.
    // Afterwards, set the selection to selFrom, selTo.
    function updateLines(from, to, newText, selFrom, selTo) {
      if (suppressEdits) return;
      var old = [];
      doc.iter(from.line, to.line + 1, function(line) {
        old.push(newHL(line.text, line.markedSpans));
      });
      if (history) {
        history.addChange(from.line, newText.length, old);
        while (history.done.length > options.undoDepth) history.done.shift();
      }
      var lines = updateMarkedSpans(hlSpans(old[0]), hlSpans(lst(old)), from.ch, to.ch, newText);
      updateLinesNoUndo(from, to, lines, selFrom, selTo);
    }
    function unredoHelper(from, to) {
      if (!from.length) return;
      var set = from.pop(), out = [];
      for (var i = set.length - 1; i >= 0; i -= 1) {
        var change = set[i];
        var replaced = [], end = change.start + change.added;
        doc.iter(change.start, end, function(line) { replaced.push(newHL(line.text, line.markedSpans)); });
        out.push({start: change.start, added: change.old.length, old: replaced});
        var pos = {line: change.start + change.old.length - 1,
                   ch: editEnd(hlText(lst(replaced)), hlText(lst(change.old)))};
        updateLinesNoUndo({line: change.start, ch: 0}, {line: end - 1, ch: getLine(end-1).text.length},
                          change.old, pos, pos);
      }
      updateInput = true;
      to.push(out);
    }
    function undo() {unredoHelper(history.done, history.undone);}
    function redo() {unredoHelper(history.undone, history.done);}

    function updateLinesNoUndo(from, to, lines, selFrom, selTo) {
      if (suppressEdits) return;
      var recomputeMaxLength = false, maxLineLength = maxLine.text.length;
      if (!options.lineWrapping)
        doc.iter(from.line, to.line + 1, function(line) {
          if (!line.hidden && line.text.length == maxLineLength) {recomputeMaxLength = true; return true;}
        });
      if (from.line != to.line || lines.length > 1) gutterDirty = true;

      var nlines = to.line - from.line, firstLine = getLine(from.line), lastLine = getLine(to.line);
      var lastHL = lst(lines);

      // First adjust the line structure
      if (from.ch == 0 && to.ch == 0 && hlText(lastHL) == "") {
        // This is a whole-line replace. Treated specially to make
        // sure line objects move the way they are supposed to.
        var added = [], prevLine = null;
        for (var i = 0, e = lines.length - 1; i < e; ++i)
          added.push(new Line(hlText(lines[i]), hlSpans(lines[i])));
        lastLine.update(lastLine.text, hlSpans(lastHL));
        if (nlines) doc.remove(from.line, nlines, callbacks);
        if (added.length) doc.insert(from.line, added);
      } else if (firstLine == lastLine) {
        if (lines.length == 1) {
          firstLine.update(firstLine.text.slice(0, from.ch) + hlText(lines[0]) + firstLine.text.slice(to.ch), hlSpans(lines[0]));
        } else {
          for (var added = [], i = 1, e = lines.length - 1; i < e; ++i)
            added.push(new Line(hlText(lines[i]), hlSpans(lines[i])));
          added.push(new Line(hlText(lastHL) + firstLine.text.slice(to.ch), hlSpans(lastHL)));
          firstLine.update(firstLine.text.slice(0, from.ch) + hlText(lines[0]), hlSpans(lines[0]));
          doc.insert(from.line + 1, added);
        }
      } else if (lines.length == 1) {
        firstLine.update(firstLine.text.slice(0, from.ch) + hlText(lines[0]) + lastLine.text.slice(to.ch), hlSpans(lines[0]));
        doc.remove(from.line + 1, nlines, callbacks);
      } else {
        var added = [];
        firstLine.update(firstLine.text.slice(0, from.ch) + hlText(lines[0]), hlSpans(lines[0]));
        lastLine.update(hlText(lastHL) + lastLine.text.slice(to.ch), hlSpans(lastHL));
        for (var i = 1, e = lines.length - 1; i < e; ++i)
          added.push(new Line(hlText(lines[i]), hlSpans(lines[i])));
        if (nlines > 1) doc.remove(from.line + 1, nlines - 1, callbacks);
        doc.insert(from.line + 1, added);
      }
      if (options.lineWrapping) {
        var perLine = Math.max(5, scroller.clientWidth / charWidth() - 3);
        doc.iter(from.line, from.line + lines.length, function(line) {
          if (line.hidden) return;
          var guess = Math.ceil(line.text.length / perLine) || 1;
          if (guess != line.height) updateLineHeight(line, guess);
        });
      } else {
        doc.iter(from.line, from.line + lines.length, function(line) {
          var l = line.text;
          if (!line.hidden && l.length > maxLineLength) {
            maxLine = line; maxLineLength = l.length; maxLineChanged = true;
            recomputeMaxLength = false;
          }
        });
        if (recomputeMaxLength) updateMaxLine = true;
      }

      // Adjust frontier, schedule worker
      frontier = Math.min(frontier, from.line);
      startWorker(400);

      var lendiff = lines.length - nlines - 1;
      // Remember that these lines changed, for updating the display
      changes.push({from: from.line, to: to.line + 1, diff: lendiff});
      if (options.onChange) {
        // Normalize lines to contain only strings, since that's what
        // the change event handler expects
        for (var i = 0; i < lines.length; ++i)
          if (typeof lines[i] != "string") lines[i] = lines[i].text;
        var changeObj = {from: from, to: to, text: lines};
        if (textChanged) {
          for (var cur = textChanged; cur.next; cur = cur.next) {}
          cur.next = changeObj;
        } else textChanged = changeObj;
      }

      // Update the selection
      function updateLine(n) {return n <= Math.min(to.line, to.line + lendiff) ? n : n + lendiff;}
      setSelection(clipPos(selFrom), clipPos(selTo),
                   updateLine(sel.from.line), updateLine(sel.to.line));
    }

    function needsScrollbar() {
      var realHeight = doc.height * textHeight() + 2 * paddingTop();
      return realHeight * .99 > scroller.offsetHeight ? realHeight : false;
    }

    function updateVerticalScroll(scrollTop) {
      var scrollHeight = needsScrollbar();
      scrollbar.style.display = scrollHeight ? "block" : "none";
      if (scrollHeight) {
        scrollbarInner.style.height = sizer.style.minHeight = scrollHeight + "px";
        scrollbar.style.height = scroller.clientHeight + "px";
        if (scrollTop != null) {
          scrollbar.scrollTop = scroller.scrollTop = scrollTop;
          // 'Nudge' the scrollbar to work around a Webkit bug where,
          // in some situations, we'd end up with a scrollbar that
          // reported its scrollTop (and looked) as expected, but
          // *behaved* as if it was still in a previous state (i.e.
          // couldn't scroll up, even though it appeared to be at the
          // bottom).
          if (webkit) setTimeout(function() {
            if (scrollbar.scrollTop != scrollTop) return;
            scrollbar.scrollTop = scrollTop + (scrollTop ? -1 : 1);
            scrollbar.scrollTop = scrollTop;
          }, 0);
        }
      } else {
        sizer.style.minHeight = "";
      }
      // Position the mover div to align with the current virtual scroll position
      mover.style.top = displayOffset * textHeight() + "px";
    }

    function computeMaxLength() {
      maxLine = getLine(0); maxLineChanged = true;
      var maxLineLength = maxLine.text.length;
      doc.iter(1, doc.size, function(line) {
        var l = line.text;
        if (!line.hidden && l.length > maxLineLength) {
          maxLineLength = l.length; maxLine = line;
        }
      });
      updateMaxLine = false;
    }

    function replaceRange(code, from, to) {
      from = clipPos(from);
      if (!to) to = from; else to = clipPos(to);
      code = splitLines(code);
      function adjustPos(pos) {
        if (posLess(pos, from)) return pos;
        if (!posLess(to, pos)) return end;
        var line = pos.line + code.length - (to.line - from.line) - 1;
        var ch = pos.ch;
        if (pos.line == to.line)
          ch += lst(code).length - (to.ch - (to.line == from.line ? from.ch : 0));
        return {line: line, ch: ch};
      }
      var end;
      replaceRange1(code, from, to, function(end1) {
        end = end1;
        return {from: adjustPos(sel.from), to: adjustPos(sel.to)};
      });
      return end;
    }
    function replaceSelection(code, collapse) {
      replaceRange1(splitLines(code), sel.from, sel.to, function(end) {
        if (collapse == "end") return {from: end, to: end};
        else if (collapse == "start") return {from: sel.from, to: sel.from};
        else return {from: sel.from, to: end};
      });
    }
    function replaceRange1(code, from, to, computeSel) {
      var endch = code.length == 1 ? code[0].length + from.ch : lst(code).length;
      var newSel = computeSel({line: from.line + code.length - 1, ch: endch});
      updateLines(from, to, code, newSel.from, newSel.to);
    }

    function getRange(from, to, lineSep) {
      var l1 = from.line, l2 = to.line;
      if (l1 == l2) return getLine(l1).text.slice(from.ch, to.ch);
      var code = [getLine(l1).text.slice(from.ch)];
      doc.iter(l1 + 1, l2, function(line) { code.push(line.text); });
      code.push(getLine(l2).text.slice(0, to.ch));
      return code.join(lineSep || "\n");
    }
    function getSelection(lineSep) {
      return getRange(sel.from, sel.to, lineSep);
    }

    function slowPoll() {
      if (pollingFast) return;
      poll.set(options.pollInterval, function() {
        readInput();
        if (focused) slowPoll();
      });
    }
    function fastPoll() {
      var missed = false;
      pollingFast = true;
      function p() {
        var changed = readInput();
        if (!changed && !missed) {missed = true; poll.set(60, p);}
        else {pollingFast = false; slowPoll();}
      }
      poll.set(20, p);
    }

    // Previnput is a hack to work with IME. If we reset the textarea
    // on every change, that breaks IME. So we look for changes
    // compared to the previous content instead. (Modern browsers have
    // events that indicate IME taking place, but these are not widely
    // supported or compatible enough yet to rely on.)
    var prevInput = "";
    function readInput() {
      if (!focused || hasSelection(input) || options.readOnly) return false;
      var text = input.value;
      if (text == prevInput) return false;
      if (!nestedOperation) startOperation();
      shiftSelecting = null;
      var same = 0, l = Math.min(prevInput.length, text.length);
      while (same < l && prevInput[same] == text[same]) ++same;
      if (same < prevInput.length)
        sel.from = {line: sel.from.line, ch: sel.from.ch - (prevInput.length - same)};
      else if (overwrite && posEq(sel.from, sel.to) && !pasteIncoming)
        sel.to = {line: sel.to.line, ch: Math.min(getLine(sel.to.line).text.length, sel.to.ch + (text.length - same))};
      replaceSelection(text.slice(same), "end");
      if (text.length > 1000) { input.value = prevInput = ""; }
      else prevInput = text;
      if (!nestedOperation) endOperation();
      pasteIncoming = false;
      return true;
    }
    function resetInput(user) {
      if (!posEq(sel.from, sel.to)) {
        prevInput = "";
        input.value = getSelection();
        if (focused) selectInput(input);
      } else if (user) prevInput = input.value = "";
    }

    function focusInput() {
      if (options.readOnly != "nocursor") input.focus();
    }

    function scrollCursorIntoView() {
      var coords = calculateCursorCoords();
      scrollIntoView(coords.x, coords.y, coords.x, coords.yBot);
      if (!focused) return;
      var box = sizer.getBoundingClientRect(), doScroll = null;
      if (coords.y + box.top < 0) doScroll = true;
      else if (coords.y + box.top + textHeight() > (window.innerHeight || document.documentElement.clientHeight)) doScroll = false;
      if (doScroll != null) {
        var hidden = cursor.style.display == "none";
        if (hidden) {
          cursor.style.display = "";
          cursor.style.left = coords.x + "px";
          cursor.style.top = (coords.y - displayOffset) + "px";
        }
        cursor.scrollIntoView(doScroll);
        if (hidden) cursor.style.display = "none";
      }
    }
    function calculateCursorCoords() {
      var cursor = localCoords(sel.inverted ? sel.from : sel.to);
      var x = options.lineWrapping ? Math.min(cursor.x, lineSpace.offsetWidth) : cursor.x;
      return {x: x, y: cursor.y, yBot: cursor.yBot};
    }
    function scrollIntoView(x1, y1, x2, y2) {
      var scrollPos = calculateScrollPos(x1, y1, x2, y2);
      if (scrollPos.scrollLeft != null) {scroller.scrollLeft = scrollPos.scrollLeft;}
      if (scrollPos.scrollTop != null) {scrollbar.scrollTop = scroller.scrollTop = scrollPos.scrollTop;}
    }
    function calculateScrollPos(x1, y1, x2, y2) {
      var pl = paddingLeft(), pt = paddingTop();
      y1 += pt; y2 += pt; x1 += pl; x2 += pl;
      var screen = scroller.clientHeight, screentop = scrollbar.scrollTop, result = {};
      var docBottom = needsScrollbar() || Infinity;
      var atTop = y1 < pt + 10, atBottom = y2 + pt > docBottom - 10;
      if (y1 < screentop) result.scrollTop = atTop ? 0 : Math.max(0, y1);
      else if (y2 > screentop + screen) result.scrollTop = (atBottom ? docBottom : y2) - screen;

      var screenw = scroller.clientWidth, screenleft = scroller.scrollLeft;
      var gutterw = options.fixedGutter ? gutter.clientWidth : 0;
      var atLeft = x1 < gutterw + pl + 10;
      if (x1 < screenleft + gutterw || atLeft) {
        if (atLeft) x1 = 0;
        result.scrollLeft = Math.max(0, x1 - 10 - gutterw);
      } else if (x2 > screenw + screenleft - 3) {
        result.scrollLeft = x2 + 10 - screenw;
      }
      return result;
    }

    function visibleLines(scrollTop) {
      var lh = textHeight(), top = (scrollTop != null ? scrollTop : scrollbar.scrollTop) - paddingTop();
      var fromHeight = Math.max(0, Math.floor(top / lh));
      var toHeight = Math.ceil((top + scroller.clientHeight) / lh);
      return {from: lineAtHeight(doc, fromHeight),
              to: lineAtHeight(doc, toHeight)};
    }
    // Uses a set of changes plus the current scroll position to
    // determine which DOM updates have to be made, and makes the
    // updates.
    function updateDisplay(changes, suppressCallback, scrollTop) {
      if (!scroller.clientWidth) {
        showingFrom = showingTo = displayOffset = 0;
        return;
      }
      // Compute the new visible window
      // If scrollTop is specified, use that to determine which lines
      // to render instead of the current scrollbar position.
      var visible = visibleLines(scrollTop);
      // Bail out if the visible area is already rendered and nothing changed.
      if (changes !== true && changes.length == 0 && visible.from > showingFrom && visible.to < showingTo) {
        updateVerticalScroll(scrollTop);
        return;
      }
      var from = Math.max(visible.from - 100, 0), to = Math.min(doc.size, visible.to + 100);
      if (showingFrom < from && from - showingFrom < 20) from = showingFrom;
      if (showingTo > to && showingTo - to < 20) to = Math.min(doc.size, showingTo);

      // Create a range of theoretically intact lines, and punch holes
      // in that using the change info.
      var intact = changes === true ? [] :
        computeIntact([{from: showingFrom, to: showingTo, domStart: 0}], changes);
      // Clip off the parts that won't be visible
      var intactLines = 0;
      for (var i = 0; i < intact.length; ++i) {
        var range = intact[i];
        if (range.from < from) {range.domStart += (from - range.from); range.from = from;}
        if (range.to > to) range.to = to;
        if (range.from >= range.to) intact.splice(i--, 1);
        else intactLines += range.to - range.from;
      }
      if (intactLines == to - from && from == showingFrom && to == showingTo) {
        updateVerticalScroll(scrollTop);
        return;
      }
      intact.sort(function(a, b) {return a.domStart - b.domStart;});

      var th = textHeight(), gutterDisplay = gutter.style.display;
      lineDiv.style.display = "none";
      patchDisplay(from, to, intact);
      lineDiv.style.display = gutter.style.display = "";

      var different = from != showingFrom || to != showingTo || lastSizeC != scroller.clientHeight + th;
      // This is just a bogus formula that detects when the editor is
      // resized or the font size changes.
      if (different) lastSizeC = scroller.clientHeight + th;
      if (from != showingFrom || to != showingTo && options.onViewportChange)
        setTimeout(function(){
          if (options.onViewportChange) options.onViewportChange(instance, from, to);
        });
      showingFrom = from; showingTo = to;
      displayOffset = heightAtLine(doc, from);
      startWorker(100);

      // Since this is all rather error prone, it is honoured with the
      // only assertion in the whole file.
      if (lineDiv.childNodes.length != showingTo - showingFrom)
        throw new Error("BAD PATCH! " + JSON.stringify(intact) + " size=" + (showingTo - showingFrom) +
                        " nodes=" + lineDiv.childNodes.length);

      function checkHeights() {
        var curNode = lineDiv.firstChild, heightChanged = false;
        doc.iter(showingFrom, showingTo, function(line) {
          // Work around bizarro IE7 bug where, sometimes, our curNode
          // is magically replaced with a new node in the DOM, leaving
          // us with a reference to an orphan (nextSibling-less) node.
          if (!curNode) return;
          if (!line.hidden) {
            var height = Math.round(curNode.offsetHeight / th) || 1;
            if (line.height != height) {
              updateLineHeight(line, height);
              gutterDirty = heightChanged = true;
            }
          }
          curNode = curNode.nextSibling;
        });
        return heightChanged;
      }

      if (options.lineWrapping) checkHeights();

      gutter.style.display = gutterDisplay;
      if (different || gutterDirty) {
        // If the gutter grew in size, re-check heights. If those changed, re-draw gutter.
        updateGutter() && options.lineWrapping && checkHeights() && updateGutter();
      }
      updateVerticalScroll(scrollTop);
      updateSelection();
      if (!suppressCallback && options.onUpdate) options.onUpdate(instance);
      return true;
    }

    function computeIntact(intact, changes) {
      for (var i = 0, l = changes.length || 0; i < l; ++i) {
        var change = changes[i], intact2 = [], diff = change.diff || 0;
        for (var j = 0, l2 = intact.length; j < l2; ++j) {
          var range = intact[j];
          if (change.to <= range.from && change.diff)
            intact2.push({from: range.from + diff, to: range.to + diff,
                          domStart: range.domStart});
          else if (change.to <= range.from || change.from >= range.to)
            intact2.push(range);
          else {
            if (change.from > range.from)
              intact2.push({from: range.from, to: change.from, domStart: range.domStart});
            if (change.to < range.to)
              intact2.push({from: change.to + diff, to: range.to + diff,
                            domStart: range.domStart + (change.to - range.from)});
          }
        }
        intact = intact2;
      }
      return intact;
    }

    function patchDisplay(from, to, intact) {
      function killNode(node) {
        var tmp = node.nextSibling;
        node.parentNode.removeChild(node);
        return tmp;
      }
      // The first pass removes the DOM nodes that aren't intact.
      if (!intact.length) removeChildren(lineDiv);
      else {
        var domPos = 0, curNode = lineDiv.firstChild, n;
        for (var i = 0; i < intact.length; ++i) {
          var cur = intact[i];
          while (cur.domStart > domPos) {curNode = killNode(curNode); domPos++;}
          for (var j = 0, e = cur.to - cur.from; j < e; ++j) {curNode = curNode.nextSibling; domPos++;}
        }
        while (curNode) curNode = killNode(curNode);
      }
      // This pass fills in the lines that actually changed.
      var nextIntact = intact.shift(), curNode = lineDiv.firstChild, j = from;
      doc.iter(from, to, function(line) {
        if (nextIntact && nextIntact.to == j) nextIntact = intact.shift();
        if (!nextIntact || nextIntact.from > j) {
          if (line.hidden) var lineElement = elt("pre");
          else {
            var lineElement = lineContent(line);
            if (line.className) lineElement.className = line.className;
            // Kludge to make sure the styled element lies behind the selection (by z-index)
            if (line.bgClassName) {
              var pre = elt("pre", "\u00a0", line.bgClassName, "position: absolute; left: 0; right: 0; top: 0; bottom: 0; z-index: -2");
              lineElement = elt("div", [pre, lineElement], null, "position: relative");
            }
          }
          lineDiv.insertBefore(lineElement, curNode);
        } else {
          curNode = curNode.nextSibling;
        }
        ++j;
      });
    }

    function updateGutter() {
      if (!options.gutter && !options.lineNumbers) return;
      var hText = mover.offsetHeight, hEditor = scroller.clientHeight;
      gutter.style.height = (hText - hEditor < 2 ? hEditor : hText) + "px";
      var fragment = document.createDocumentFragment(), i = showingFrom, normalNode;
      doc.iter(showingFrom, Math.max(showingTo, showingFrom + 1), function(line) {
        if (line.hidden) {
          fragment.appendChild(elt("pre"));
        } else {
          var marker = line.gutterMarker;
          var text = options.lineNumbers ? options.lineNumberFormatter(i + options.firstLineNumber) : null;
          if (marker && marker.text)
            text = marker.text.replace("%N%", text != null ? text : "");
          else if (text == null)
            text = "\u00a0";
          var markerElement = fragment.appendChild(elt("pre", null, marker && marker.style));
          markerElement.innerHTML = text;
          for (var j = 1; j < line.height; ++j) {
            markerElement.appendChild(elt("br"));
            markerElement.appendChild(document.createTextNode("\u00a0"));
          }
          if (!marker) normalNode = i;
        }
        ++i;
      });
      gutter.style.display = "none";
      removeChildrenAndAdd(gutterText, fragment);
      // Make sure scrolling doesn't cause number gutter size to pop
      if (normalNode != null && options.lineNumbers) {
        var node = gutterText.childNodes[normalNode - showingFrom];
        var minwidth = String(doc.size).length, val = eltText(node.firstChild), pad = "";
        while (val.length + pad.length < minwidth) pad += "\u00a0";
        if (pad) node.insertBefore(document.createTextNode(pad), node.firstChild);
      }
      gutter.style.display = "";
      var resized = Math.abs((parseInt(lineSpace.style.marginLeft) || 0) - gutter.offsetWidth) > 2;
      lineSpace.style.marginLeft = gutter.offsetWidth + "px";
      gutterDirty = false;
      return resized;
    }
    function updateSelection() {
      var collapsed = posEq(sel.from, sel.to);
      var fromPos = localCoords(sel.from, true);
      var toPos = collapsed ? fromPos : localCoords(sel.to, true);
      var headPos = sel.inverted ? fromPos : toPos, th = textHeight();
      var wrapOff = eltOffset(wrapper), lineOff = eltOffset(lineDiv);
      inputDiv.style.top = Math.max(0, Math.min(scroller.offsetHeight, headPos.y + lineOff.top - wrapOff.top)) + "px";
      inputDiv.style.left = Math.max(0, Math.min(scroller.offsetWidth, headPos.x + lineOff.left - wrapOff.left)) + "px";
      if (collapsed) {
        cursor.style.top = headPos.y + "px";
        cursor.style.left = (options.lineWrapping ? Math.min(headPos.x, lineSpace.offsetWidth) : headPos.x) + "px";
        cursor.style.display = "";
        selectionDiv.style.display = "none";
      } else {
        var sameLine = fromPos.y == toPos.y, fragment = document.createDocumentFragment();
        var clientWidth = lineSpace.clientWidth || lineSpace.offsetWidth;
        var clientHeight = lineSpace.clientHeight || lineSpace.offsetHeight;
        var add = function(left, top, right, height) {
          var rstyle = quirksMode ? "width: " + (!right ? clientWidth : clientWidth - right - left) + "px"
                                  : "right: " + right + "px";
          fragment.appendChild(elt("div", null, "CodeMirror-selected", "position: absolute; left: " + left +
                                   "px; top: " + top + "px; " + rstyle + "; height: " + height + "px"));
        };
        if (sel.from.ch && fromPos.y >= 0) {
          var right = sameLine ? clientWidth - toPos.x : 0;
          add(fromPos.x, fromPos.y, right, th);
        }
        var middleStart = Math.max(0, fromPos.y + (sel.from.ch ? th : 0));
        var middleHeight = Math.min(toPos.y, clientHeight) - middleStart;
        if (middleHeight > 0.2 * th)
          add(0, middleStart, 0, middleHeight);
        if ((!sameLine || !sel.from.ch) && toPos.y < clientHeight - .5 * th)
          add(0, toPos.y, clientWidth - toPos.x, th);
        removeChildrenAndAdd(selectionDiv, fragment);
        cursor.style.display = "none";
        selectionDiv.style.display = "";
      }
    }

    function setShift(val) {
      if (val) shiftSelecting = shiftSelecting || (sel.inverted ? sel.to : sel.from);
      else shiftSelecting = null;
    }
    function setSelectionUser(from, to) {
      var sh = shiftSelecting && clipPos(shiftSelecting);
      if (sh) {
        if (posLess(sh, from)) from = sh;
        else if (posLess(to, sh)) to = sh;
      }
      setSelection(from, to);
      userSelChange = true;
    }
    // Update the selection. Last two args are only used by
    // updateLines, since they have to be expressed in the line
    // numbers before the update.
    function setSelection(from, to, oldFrom, oldTo) {
      goalColumn = null;
      if (oldFrom == null) {oldFrom = sel.from.line; oldTo = sel.to.line;}
      if (posEq(sel.from, from) && posEq(sel.to, to)) return;
      if (posLess(to, from)) {var tmp = to; to = from; from = tmp;}

      // Skip over hidden lines.
      if (from.line != oldFrom) {
        var from1 = skipHidden(from, oldFrom, sel.from.ch);
        // If there is no non-hidden line left, force visibility on current line
        if (!from1) setLineHidden(from.line, false);
        else from = from1;
      }
      if (to.line != oldTo) to = skipHidden(to, oldTo, sel.to.ch);

      if (posEq(from, to)) sel.inverted = false;
      else if (posEq(from, sel.to)) sel.inverted = false;
      else if (posEq(to, sel.from)) sel.inverted = true;

      if (options.autoClearEmptyLines && posEq(sel.from, sel.to)) {
        var head = sel.inverted ? from : to;
        if (head.line != sel.from.line && sel.from.line < doc.size) {
          var oldLine = getLine(sel.from.line);
          if (/^\s+$/.test(oldLine.text))
            setTimeout(operation(function() {
              if (oldLine.parent && /^\s+$/.test(oldLine.text)) {
                var no = lineNo(oldLine);
                replaceRange("", {line: no, ch: 0}, {line: no, ch: oldLine.text.length});
              }
            }, 10));
        }
      }

      sel.from = from; sel.to = to;
      selectionChanged = true;
    }
    function skipHidden(pos, oldLine, oldCh) {
      function getNonHidden(dir) {
        var lNo = pos.line + dir, end = dir == 1 ? doc.size : -1;
        while (lNo != end) {
          var line = getLine(lNo);
          if (!line.hidden) {
            var ch = pos.ch;
            if (toEnd || ch > oldCh || ch > line.text.length) ch = line.text.length;
            return {line: lNo, ch: ch};
          }
          lNo += dir;
        }
      }
      var line = getLine(pos.line);
      var toEnd = pos.ch == line.text.length && pos.ch != oldCh;
      if (!line.hidden) return pos;
      if (pos.line >= oldLine) return getNonHidden(1) || getNonHidden(-1);
      else return getNonHidden(-1) || getNonHidden(1);
    }
    function setCursor(line, ch, user) {
      var pos = clipPos({line: line, ch: ch || 0});
      (user ? setSelectionUser : setSelection)(pos, pos);
    }

    function clipLine(n) {return Math.max(0, Math.min(n, doc.size-1));}
    function clipPos(pos) {
      if (pos.line < 0) return {line: 0, ch: 0};
      if (pos.line >= doc.size) return {line: doc.size-1, ch: getLine(doc.size-1).text.length};
      var ch = pos.ch, linelen = getLine(pos.line).text.length;
      if (ch == null || ch > linelen) return {line: pos.line, ch: linelen};
      else if (ch < 0) return {line: pos.line, ch: 0};
      else return pos;
    }

    function findPosH(dir, unit) {
      var end = sel.inverted ? sel.from : sel.to, line = end.line, ch = end.ch;
      var lineObj = getLine(line);
      function findNextLine() {
        for (var l = line + dir, e = dir < 0 ? -1 : doc.size; l != e; l += dir) {
          var lo = getLine(l);
          if (!lo.hidden) { line = l; lineObj = lo; return true; }
        }
      }
      function moveOnce(boundToLine) {
        if (ch == (dir < 0 ? 0 : lineObj.text.length)) {
          if (!boundToLine && findNextLine()) ch = dir < 0 ? lineObj.text.length : 0;
          else return false;
        } else ch += dir;
        return true;
      }
      if (unit == "char") moveOnce();
      else if (unit == "column") moveOnce(true);
      else if (unit == "word") {
        var sawWord = false;
        for (;;) {
          if (dir < 0) if (!moveOnce()) break;
          if (isWordChar(lineObj.text.charAt(ch))) sawWord = true;
          else if (sawWord) {if (dir < 0) {dir = 1; moveOnce();} break;}
          if (dir > 0) if (!moveOnce()) break;
        }
      }
      return {line: line, ch: ch};
    }
    function moveH(dir, unit) {
      var pos = dir < 0 ? sel.from : sel.to;
      if (shiftSelecting || posEq(sel.from, sel.to)) pos = findPosH(dir, unit);
      setCursor(pos.line, pos.ch, true);
    }
    function deleteH(dir, unit) {
      if (!posEq(sel.from, sel.to)) replaceRange("", sel.from, sel.to);
      else if (dir < 0) replaceRange("", findPosH(dir, unit), sel.to);
      else replaceRange("", sel.from, findPosH(dir, unit));
      userSelChange = true;
    }
    function moveV(dir, unit) {
      var dist = 0, pos = localCoords(sel.inverted ? sel.from : sel.to, true);
      if (goalColumn != null) pos.x = goalColumn;
      if (unit == "page") {
        var screen = Math.min(scroller.clientHeight, window.innerHeight || document.documentElement.clientHeight);
        var target = coordsChar(pos.x, pos.y + screen * dir);
      } else if (unit == "line") {
        var th = textHeight();
        var target = coordsChar(pos.x, pos.y + .5 * th + dir * th);
      }
      if (unit == "page") scrollbar.scrollTop += localCoords(target, true).y - pos.y;
      setCursor(target.line, target.ch, true);
      goalColumn = pos.x;
    }

    function findWordAt(pos) {
      var line = getLine(pos.line).text;
      var start = pos.ch, end = pos.ch;
      if (line) {
        if (pos.after === false || end == line.length) --start; else ++end;
        var startChar = line.charAt(start);
        var check = isWordChar(startChar) ? isWordChar :
                    /\s/.test(startChar) ? function(ch) {return /\s/.test(ch);} :
                    function(ch) {return !/\s/.test(ch) && isWordChar(ch);};
        while (start > 0 && check(line.charAt(start - 1))) --start;
        while (end < line.length && check(line.charAt(end))) ++end;
      }
      return {from: {line: pos.line, ch: start}, to: {line: pos.line, ch: end}};
    }
    function selectLine(line) {
      setSelectionUser({line: line, ch: 0}, clipPos({line: line + 1, ch: 0}));
    }
    function indentSelected(mode) {
      if (posEq(sel.from, sel.to)) return indentLine(sel.from.line, mode);
      var e = sel.to.line - (sel.to.ch ? 0 : 1);
      for (var i = sel.from.line; i <= e; ++i) indentLine(i, mode);
    }

    function indentLine(n, how) {
      if (!how) how = "add";
      if (how == "smart") {
        if (!mode.indent) how = "prev";
        else var state = getStateBefore(n);
      }

      var line = getLine(n), curSpace = line.indentation(options.tabSize),
          curSpaceString = line.text.match(/^\s*/)[0], indentation;
      if (how == "smart") {
        indentation = mode.indent(state, line.text.slice(curSpaceString.length), line.text);
        if (indentation == Pass) how = "prev";
      }
      if (how == "prev") {
        if (n) indentation = getLine(n-1).indentation(options.tabSize);
        else indentation = 0;
      }
      else if (how == "add") indentation = curSpace + options.indentUnit;
      else if (how == "subtract") indentation = curSpace - options.indentUnit;
      indentation = Math.max(0, indentation);
      var diff = indentation - curSpace;

      var indentString = "", pos = 0;
      if (options.indentWithTabs)
        for (var i = Math.floor(indentation / options.tabSize); i; --i) {pos += options.tabSize; indentString += "\t";}
      if (pos < indentation) indentString += spaceStr(indentation - pos);

      if (indentString != curSpaceString)
        replaceRange(indentString, {line: n, ch: 0}, {line: n, ch: curSpaceString.length});
      line.stateAfter = null;
    }

    function loadMode() {
      mode = CodeMirror.getMode(options, options.mode);
      doc.iter(0, doc.size, function(line) { line.stateAfter = null; });
      frontier = 0;
      startWorker(100);
    }
    function gutterChanged() {
      var visible = options.gutter || options.lineNumbers;
      gutter.style.display = visible ? "" : "none";
      if (visible) gutterDirty = true;
      else lineDiv.parentNode.style.marginLeft = 0;
    }
    function wrappingChanged(from, to) {
      if (options.lineWrapping) {
        wrapper.className += " CodeMirror-wrap";
        var perLine = scroller.clientWidth / charWidth() - 3;
        doc.iter(0, doc.size, function(line) {
          if (line.hidden) return;
          var guess = Math.ceil(line.text.length / perLine) || 1;
          if (guess != 1) updateLineHeight(line, guess);
        });
        lineSpace.style.minWidth = widthForcer.style.left = "";
      } else {
        wrapper.className = wrapper.className.replace(" CodeMirror-wrap", "");
        computeMaxLength();
        doc.iter(0, doc.size, function(line) {
          if (line.height != 1 && !line.hidden) updateLineHeight(line, 1);
        });
      }
      changes.push({from: 0, to: doc.size});
    }
    function themeChanged() {
      scroller.className = scroller.className.replace(/\s*cm-s-\S+/g, "") +
        options.theme.replace(/(^|\s)\s*/g, " cm-s-");
    }
    function keyMapChanged() {
      var style = keyMap[options.keyMap].style;
      wrapper.className = wrapper.className.replace(/\s*cm-keymap-\S+/g, "") +
        (style ? " cm-keymap-" + style : "");
    }

    function TextMarker(type, style) { this.lines = []; this.type = type; if (style) this.style = style; }
    TextMarker.prototype.clear = operation(function() {
      var min, max;
      for (var i = 0; i < this.lines.length; ++i) {
        var line = this.lines[i];
        var span = getMarkedSpanFor(line.markedSpans, this);
        if (span.from != null) min = lineNo(line);
        if (span.to != null) max = lineNo(line);
        line.markedSpans = removeMarkedSpan(line.markedSpans, span);
      }
      if (min != null) changes.push({from: min, to: max + 1});
      this.lines.length = 0;
      this.explicitlyCleared = true;
    });
    TextMarker.prototype.find = function() {
      var from, to;
      for (var i = 0; i < this.lines.length; ++i) {
        var line = this.lines[i];
        var span = getMarkedSpanFor(line.markedSpans, this);
        if (span.from != null || span.to != null) {
          var found = lineNo(line);
          if (span.from != null) from = {line: found, ch: span.from};
          if (span.to != null) to = {line: found, ch: span.to};
        }
      }
      if (this.type == "bookmark") return from;
      return from && {from: from, to: to};
    };

    function markText(from, to, className, options) {
      from = clipPos(from); to = clipPos(to);
      var marker = new TextMarker("range", className);
      if (options) for (var opt in options) if (options.hasOwnProperty(opt))
        marker[opt] = options[opt];
      var curLine = from.line;
      doc.iter(curLine, to.line + 1, function(line) {
        var span = {from: curLine == from.line ? from.ch : null,
                    to: curLine == to.line ? to.ch : null,
                    marker: marker};
        line.markedSpans = (line.markedSpans || []).concat([span]);
        marker.lines.push(line);
        ++curLine;
      });
      changes.push({from: from.line, to: to.line + 1});
      return marker;
    }

    function setBookmark(pos) {
      pos = clipPos(pos);
      var marker = new TextMarker("bookmark"), line = getLine(pos.line);
      history.addChange(pos.line, 1, [newHL(line.text, line.markedSpans)], true);
      var span = {from: pos.ch, to: pos.ch, marker: marker};
      line.markedSpans = (line.markedSpans || []).concat([span]);
      marker.lines.push(line);
      return marker;
    }

    function findMarksAt(pos) {
      pos = clipPos(pos);
      var markers = [], spans = getLine(pos.line).markedSpans;
      if (spans) for (var i = 0; i < spans.length; ++i) {
        var span = spans[i];
        if ((span.from == null || span.from <= pos.ch) &&
            (span.to == null || span.to >= pos.ch))
          markers.push(span.marker);
      }
      return markers;
    }

    function addGutterMarker(line, text, className) {
      if (typeof line == "number") line = getLine(clipLine(line));
      line.gutterMarker = {text: text, style: className};
      gutterDirty = true;
      return line;
    }
    function removeGutterMarker(line) {
      if (typeof line == "number") line = getLine(clipLine(line));
      line.gutterMarker = null;
      gutterDirty = true;
    }

    function changeLine(handle, op) {
      var no = handle, line = handle;
      if (typeof handle == "number") line = getLine(clipLine(handle));
      else no = lineNo(handle);
      if (no == null) return null;
      if (op(line, no)) changes.push({from: no, to: no + 1});
      else return null;
      return line;
    }
    function setLineClass(handle, className, bgClassName) {
      return changeLine(handle, function(line) {
        if (line.className != className || line.bgClassName != bgClassName) {
          line.className = className;
          line.bgClassName = bgClassName;
          return true;
        }
      });
    }
    function setLineHidden(handle, hidden) {
      return changeLine(handle, function(line, no) {
        if (line.hidden != hidden) {
          line.hidden = hidden;
          if (!options.lineWrapping) {
            if (hidden && line.text.length == maxLine.text.length) {
              updateMaxLine = true;
            } else if (!hidden && line.text.length > maxLine.text.length) {
              maxLine = line; updateMaxLine = false;
            }
          }
          updateLineHeight(line, hidden ? 0 : 1);
          var fline = sel.from.line, tline = sel.to.line;
          if (hidden && (fline == no || tline == no)) {
            var from = fline == no ? skipHidden({line: fline, ch: 0}, fline, 0) : sel.from;
            var to = tline == no ? skipHidden({line: tline, ch: 0}, tline, 0) : sel.to;
            // Can't hide the last visible line, we'd have no place to put the cursor
            if (!to) return;
            setSelection(from, to);
          }
          return (gutterDirty = true);
        }
      });
    }

    function lineInfo(line) {
      if (typeof line == "number") {
        if (!isLine(line)) return null;
        var n = line;
        line = getLine(line);
        if (!line) return null;
      } else {
        var n = lineNo(line);
        if (n == null) return null;
      }
      var marker = line.gutterMarker;
      return {line: n, handle: line, text: line.text, markerText: marker && marker.text,
              markerClass: marker && marker.style, lineClass: line.className, bgClass: line.bgClassName};
    }

    function measureLine(line, ch) {
      if (ch == 0) return {top: 0, left: 0};
      var pre = lineContent(line, ch);
      removeChildrenAndAdd(measure, pre);
      var anchor = pre.anchor;
      var top = anchor.offsetTop, left = anchor.offsetLeft;
      // Older IEs report zero offsets for spans directly after a wrap
      if (ie && top == 0 && left == 0) {
        var backup = elt("span", "x");
        anchor.parentNode.insertBefore(backup, anchor.nextSibling);
        top = backup.offsetTop;
      }
      return {top: top, left: left};
    }
    function localCoords(pos, inLineWrap) {
      var x, lh = textHeight(), y = lh * (heightAtLine(doc, pos.line) - (inLineWrap ? displayOffset : 0));
      if (pos.ch == 0) x = 0;
      else {
        var sp = measureLine(getLine(pos.line), pos.ch);
        x = sp.left;
        if (options.lineWrapping) y += Math.max(0, sp.top);
      }
      return {x: x, y: y, yBot: y + lh};
    }
    // Coords must be lineSpace-local
    function coordsChar(x, y) {
      var th = textHeight(), cw = charWidth(), heightPos = displayOffset + Math.floor(y / th);
      if (heightPos < 0) return {line: 0, ch: 0};
      var lineNo = lineAtHeight(doc, heightPos);
      if (lineNo >= doc.size) return {line: doc.size - 1, ch: getLine(doc.size - 1).text.length};
      var lineObj = getLine(lineNo), text = lineObj.text;
      var tw = options.lineWrapping, innerOff = tw ? heightPos - heightAtLine(doc, lineNo) : 0;
      if (x <= 0 && innerOff == 0) return {line: lineNo, ch: 0};
      var wrongLine = false;
      function getX(len) {
        var sp = measureLine(lineObj, len);
        if (tw) {
          var off = Math.round(sp.top / th);
          wrongLine = off != innerOff;
          return Math.max(0, sp.left + (off - innerOff) * scroller.clientWidth);
        }
        return sp.left;
      }
      var from = 0, fromX = 0, to = text.length, toX;
      // Guess a suitable upper bound for our search.
      var estimated = Math.min(to, Math.ceil((x + innerOff * scroller.clientWidth * .9) / cw));
      for (;;) {
        var estX = getX(estimated);
        if (estX <= x && estimated < to) estimated = Math.min(to, Math.ceil(estimated * 1.2));
        else {toX = estX; to = estimated; break;}
      }
      if (x > toX) return {line: lineNo, ch: to};
      // Try to guess a suitable lower bound as well.
      estimated = Math.floor(to * 0.8); estX = getX(estimated);
      if (estX < x) {from = estimated; fromX = estX;}
      // Do a binary search between these bounds.
      for (;;) {
        if (to - from <= 1) {
          var after = x - fromX < toX - x;
          return {line: lineNo, ch: after ? from : to, after: after};
        }
        var middle = Math.ceil((from + to) / 2), middleX = getX(middle);
        if (middleX > x) {to = middle; toX = middleX; if (wrongLine) toX += 1000; }
        else {from = middle; fromX = middleX;}
      }
    }
    function pageCoords(pos) {
      var local = localCoords(pos, true), off = eltOffset(lineSpace);
      return {x: off.left + local.x, y: off.top + local.y, yBot: off.top + local.yBot};
    }

    var cachedHeight, cachedHeightFor, measurePre;
    function textHeight() {
      if (measurePre == null) {
        measurePre = elt("pre");
        for (var i = 0; i < 49; ++i) {
          measurePre.appendChild(document.createTextNode("x"));
          measurePre.appendChild(elt("br"));
        }
        measurePre.appendChild(document.createTextNode("x"));
      }
      var offsetHeight = lineDiv.clientHeight;
      if (offsetHeight == cachedHeightFor) return cachedHeight;
      cachedHeightFor = offsetHeight;
      removeChildrenAndAdd(measure, measurePre.cloneNode(true));
      cachedHeight = measure.firstChild.offsetHeight / 50 || 1;
      removeChildren(measure);
      return cachedHeight;
    }
    var cachedWidth, cachedWidthFor = 0;
    function charWidth() {
      if (scroller.clientWidth == cachedWidthFor) return cachedWidth;
      cachedWidthFor = scroller.clientWidth;
      var anchor = elt("span", "x");
      var pre = elt("pre", [anchor]);
      removeChildrenAndAdd(measure, pre);
      return (cachedWidth = anchor.offsetWidth || 10);
    }
    function paddingTop() {return lineSpace.offsetTop;}
    function paddingLeft() {return lineSpace.offsetLeft;}

    function posFromMouse(e, liberal) {
      var offW = eltOffset(scroller, true), x, y;
      // Fails unpredictably on IE[67] when mouse is dragged around quickly.
      try { x = e.clientX; y = e.clientY; } catch (e) { return null; }
      // This is a mess of a heuristic to try and determine whether a
      // scroll-bar was clicked or not, and to return null if one was
      // (and !liberal).
      if (!liberal && (x - offW.left > scroller.clientWidth || y - offW.top > scroller.clientHeight))
        return null;
      var offL = eltOffset(lineSpace, true);
      return coordsChar(x - offL.left, y - offL.top);
    }
    var detectingSelectAll;
    function onContextMenu(e) {
      var pos = posFromMouse(e), scrollPos = scrollbar.scrollTop;
      if (!pos || opera) return; // Opera is difficult.
      if (posEq(sel.from, sel.to) || posLess(pos, sel.from) || !posLess(pos, sel.to))
        operation(setCursor)(pos.line, pos.ch);

      var oldCSS = input.style.cssText;
      inputDiv.style.position = "absolute";
      input.style.cssText = "position: fixed; width: 30px; height: 30px; top: " + (e.clientY - 5) +
        "px; left: " + (e.clientX - 5) + "px; z-index: 1000; background: white; " +
        "border-width: 0; outline: none; overflow: hidden; opacity: .05; filter: alpha(opacity=5);";
      focusInput();
      resetInput(true);
      // Adds "Select all" to context menu in FF
      if (posEq(sel.from, sel.to)) input.value = prevInput = " ";

      function rehide() {
        inputDiv.style.position = "relative";
        input.style.cssText = oldCSS;
        if (ie_lt9) scrollbar.scrollTop = scrollPos;
        slowPoll();

        // Try to detect the user choosing select-all 
        if (input.selectionStart != null) {
          clearTimeout(detectingSelectAll);
          var extval = input.value = " " + (posEq(sel.from, sel.to) ? "" : input.value), i = 0;
          prevInput = " ";
          input.selectionStart = 1; input.selectionEnd = extval.length;
          detectingSelectAll = setTimeout(function poll(){
            if (prevInput == " " && input.selectionStart == 0)
              operation(commands.selectAll)(instance);
            else if (i++ < 10) detectingSelectAll = setTimeout(poll, 500);
            else resetInput();
          }, 200);
        }
      }

      if (gecko) {
        e_stop(e);
        var mouseup = connect(window, "mouseup", function() {
          mouseup();
          setTimeout(rehide, 20);
        }, true);
      } else {
        setTimeout(rehide, 50);
      }
    }

    // Cursor-blinking
    function restartBlink() {
      clearInterval(blinker);
      var on = true;
      cursor.style.visibility = "";
      blinker = setInterval(function() {
        cursor.style.visibility = (on = !on) ? "" : "hidden";
      }, options.cursorBlinkRate);
    }

    var matching = {"(": ")>", ")": "(<", "[": "]>", "]": "[<", "{": "}>", "}": "{<"};
    function matchBrackets(autoclear) {
      var head = sel.inverted ? sel.from : sel.to, line = getLine(head.line), pos = head.ch - 1;
      var match = (pos >= 0 && matching[line.text.charAt(pos)]) || matching[line.text.charAt(++pos)];
      if (!match) return;
      var ch = match.charAt(0), forward = match.charAt(1) == ">", d = forward ? 1 : -1, st = line.styles;
      for (var off = pos + 1, i = 0, e = st.length; i < e; i+=2)
        if ((off -= st[i].length) <= 0) {var style = st[i+1]; break;}

      var stack = [line.text.charAt(pos)], re = /[(){}[\]]/;
      function scan(line, from, to) {
        if (!line.text) return;
        var st = line.styles, pos = forward ? 0 : line.text.length - 1, cur;
        for (var i = forward ? 0 : st.length - 2, e = forward ? st.length : -2; i != e; i += 2*d) {
          var text = st[i];
          if (st[i+1] != style) {pos += d * text.length; continue;}
          for (var j = forward ? 0 : text.length - 1, te = forward ? text.length : -1; j != te; j += d, pos+=d) {
            if (pos >= from && pos < to && re.test(cur = text.charAt(j))) {
              var match = matching[cur];
              if (match.charAt(1) == ">" == forward) stack.push(cur);
              else if (stack.pop() != match.charAt(0)) return {pos: pos, match: false};
              else if (!stack.length) return {pos: pos, match: true};
            }
          }
        }
      }
      for (var i = head.line, e = forward ? Math.min(i + 100, doc.size) : Math.max(-1, i - 100); i != e; i+=d) {
        var line = getLine(i), first = i == head.line;
        var found = scan(line, first && forward ? pos + 1 : 0, first && !forward ? pos : line.text.length);
        if (found) break;
      }
      if (!found) found = {pos: null, match: false};
      var style = found.match ? "CodeMirror-matchingbracket" : "CodeMirror-nonmatchingbracket";
      var one = markText({line: head.line, ch: pos}, {line: head.line, ch: pos+1}, style),
          two = found.pos != null && markText({line: i, ch: found.pos}, {line: i, ch: found.pos + 1}, style);
      var clear = operation(function(){one.clear(); two && two.clear();});
      if (autoclear) setTimeout(clear, 800);
      else bracketHighlighted = clear;
    }

    // Finds the line to start with when starting a parse. Tries to
    // find a line with a stateAfter, so that it can start with a
    // valid state. If that fails, it returns the line with the
    // smallest indentation, which tends to need the least context to
    // parse correctly.
    function findStartLine(n) {
      var minindent, minline;
      for (var search = n, lim = n - 40; search > lim; --search) {
        if (search == 0) return 0;
        var line = getLine(search-1);
        if (line.stateAfter) return search;
        var indented = line.indentation(options.tabSize);
        if (minline == null || minindent > indented) {
          minline = search - 1;
          minindent = indented;
        }
      }
      return minline;
    }
    function getStateBefore(n) {
      var pos = findStartLine(n), state = pos && getLine(pos-1).stateAfter;
      if (!state) state = startState(mode);
      else state = copyState(mode, state);
      doc.iter(pos, n, function(line) {
        line.process(mode, state, options.tabSize);
        line.stateAfter = (pos == n - 1 || pos % 5 == 0) ? copyState(mode, state) : null;
      });
      return state;
    }
    function highlightWorker() {
      if (frontier >= showingTo) return;
      var end = +new Date + options.workTime, state = copyState(mode, getStateBefore(frontier));
      var startFrontier = frontier;
      doc.iter(frontier, showingTo, function(line) {
        if (frontier >= showingFrom) { // Visible
          line.highlight(mode, state, options.tabSize);
          line.stateAfter = copyState(mode, state);
        } else {
          line.process(mode, state, options.tabSize);
          line.stateAfter = frontier % 5 == 0 ? copyState(mode, state) : null;
        }
        ++frontier;
        if (+new Date > end) {
          startWorker(options.workDelay);
          return true;
        }
      });
      if (showingTo > startFrontier && frontier >= showingFrom)
        operation(function() {changes.push({from: startFrontier, to: frontier});})();
    }
    function startWorker(time) {
      if (frontier < showingTo)
        highlight.set(time, highlightWorker);
    }

    // Operations are used to wrap changes in such a way that each
    // change won't have to update the cursor and display (which would
    // be awkward, slow, and error-prone), but instead updates are
    // batched and then all combined and executed at once.
    function startOperation() {
      updateInput = userSelChange = textChanged = null;
      changes = []; selectionChanged = false; callbacks = [];
    }
    function endOperation() {
      if (updateMaxLine) computeMaxLength();
      if (maxLineChanged && !options.lineWrapping) {
        var cursorWidth = widthForcer.offsetWidth, left = measureLine(maxLine, maxLine.text.length).left;
        if (!ie_lt8) {
          widthForcer.style.left = left + "px";
          lineSpace.style.minWidth = (left + cursorWidth) + "px";
        }
        maxLineChanged = false;
      }
      var newScrollPos, updated;
      if (selectionChanged) {
        var coords = calculateCursorCoords();
        newScrollPos = calculateScrollPos(coords.x, coords.y, coords.x, coords.yBot);
      }
      if (changes.length || newScrollPos && newScrollPos.scrollTop != null)
        updated = updateDisplay(changes, true, newScrollPos && newScrollPos.scrollTop);
      if (!updated) {
        if (selectionChanged) updateSelection();
        if (gutterDirty) updateGutter();
      }
      if (newScrollPos) scrollCursorIntoView();
      if (selectionChanged) restartBlink();

      if (focused && (updateInput === true || (updateInput !== false && selectionChanged)))
        resetInput(userSelChange);

      if (selectionChanged && options.matchBrackets)
        setTimeout(operation(function() {
          if (bracketHighlighted) {bracketHighlighted(); bracketHighlighted = null;}
          if (posEq(sel.from, sel.to)) matchBrackets(false);
        }), 20);
      var sc = selectionChanged, cbs = callbacks; // these can be reset by callbacks
      if (textChanged && options.onChange && instance)
        options.onChange(instance, textChanged);
      if (sc && options.onCursorActivity)
        options.onCursorActivity(instance);
      for (var i = 0; i < cbs.length; ++i) cbs[i](instance);
      if (updated && options.onUpdate) options.onUpdate(instance);
    }
    var nestedOperation = 0;
    function operation(f) {
      return function() {
        if (!nestedOperation++) startOperation();
        try {var result = f.apply(this, arguments);}
        finally {if (!--nestedOperation) endOperation();}
        return result;
      };
    }

    function compoundChange(f) {
      history.startCompound();
      try { return f(); } finally { history.endCompound(); }
    }

    for (var ext in extensions)
      if (extensions.propertyIsEnumerable(ext) &&
          !instance.propertyIsEnumerable(ext))
        instance[ext] = extensions[ext];
    for (var i = 0; i < initHooks.length; ++i) initHooks[i](instance);
    return instance;
  } // (end of function CodeMirror)

  // The default configuration options.
  CodeMirror.defaults = {
    value: "",
    mode: null,
    theme: "default",
    indentUnit: 2,
    indentWithTabs: false,
    smartIndent: true,
    tabSize: 4,
    keyMap: "default",
    extraKeys: null,
    electricChars: true,
    autoClearEmptyLines: false,
    onKeyEvent: null,
    onDragEvent: null,
    lineWrapping: false,
    lineNumbers: false,
    gutter: false,
    fixedGutter: false,
    firstLineNumber: 1,
    readOnly: false,
    dragDrop: true,
    onChange: null,
    onCursorActivity: null,
    onViewportChange: null,
    onGutterClick: null,
    onUpdate: null,
    onFocus: null, onBlur: null, onScroll: null,
    matchBrackets: false,
    cursorBlinkRate: 530,
    workTime: 100,
    workDelay: 200,
    pollInterval: 100,
    undoDepth: 40,
    tabindex: null,
    autofocus: null,
    lineNumberFormatter: function(integer) { return integer; }
  };

  var ios = /AppleWebKit/.test(navigator.userAgent) && /Mobile\/\w+/.test(navigator.userAgent);
  var mac = ios || /Mac/.test(navigator.platform);
  var win = /Win/.test(navigator.platform);

  // Known modes, by name and by MIME
  var modes = CodeMirror.modes = {}, mimeModes = CodeMirror.mimeModes = {};
  CodeMirror.defineMode = function(name, mode) {
    if (!CodeMirror.defaults.mode && name != "null") CodeMirror.defaults.mode = name;
    if (arguments.length > 2) {
      mode.dependencies = [];
      for (var i = 2; i < arguments.length; ++i) mode.dependencies.push(arguments[i]);
    }
    modes[name] = mode;
  };
  CodeMirror.defineMIME = function(mime, spec) {
    mimeModes[mime] = spec;
  };
  CodeMirror.resolveMode = function(spec) {
    if (typeof spec == "string" && mimeModes.hasOwnProperty(spec))
      spec = mimeModes[spec];
    else if (typeof spec == "string" && /^[\w\-]+\/[\w\-]+\+xml$/.test(spec))
      return CodeMirror.resolveMode("application/xml");
    if (typeof spec == "string") return {name: spec};
    else return spec || {name: "null"};
  };
  CodeMirror.getMode = function(options, spec) {
    var spec = CodeMirror.resolveMode(spec);
    var mfactory = modes[spec.name];
    if (!mfactory) return CodeMirror.getMode(options, "text/plain");
    var modeObj = mfactory(options, spec);
    if (modeExtensions.hasOwnProperty(spec.name)) {
      var exts = modeExtensions[spec.name];
      for (var prop in exts) if (exts.hasOwnProperty(prop)) modeObj[prop] = exts[prop];
    }
    modeObj.name = spec.name;
    return modeObj;
  };
  CodeMirror.listModes = function() {
    var list = [];
    for (var m in modes)
      if (modes.propertyIsEnumerable(m)) list.push(m);
    return list;
  };
  CodeMirror.listMIMEs = function() {
    var list = [];
    for (var m in mimeModes)
      if (mimeModes.propertyIsEnumerable(m)) list.push({mime: m, mode: mimeModes[m]});
    return list;
  };

  var extensions = CodeMirror.extensions = {};
  CodeMirror.defineExtension = function(name, func) {
    extensions[name] = func;
  };

  var initHooks = [];
  CodeMirror.defineInitHook = function(f) {initHooks.push(f);};

  var modeExtensions = CodeMirror.modeExtensions = {};
  CodeMirror.extendMode = function(mode, properties) {
    var exts = modeExtensions.hasOwnProperty(mode) ? modeExtensions[mode] : (modeExtensions[mode] = {});
    for (var prop in properties) if (properties.hasOwnProperty(prop))
      exts[prop] = properties[prop];
  };

  var commands = CodeMirror.commands = {
    selectAll: function(cm) {cm.setSelection({line: 0, ch: 0}, {line: cm.lineCount() - 1});},
    killLine: function(cm) {
      var from = cm.getCursor(true), to = cm.getCursor(false), sel = !posEq(from, to);
      if (!sel && cm.getLine(from.line).length == from.ch) cm.replaceRange("", from, {line: from.line + 1, ch: 0});
      else cm.replaceRange("", from, sel ? to : {line: from.line});
    },
    deleteLine: function(cm) {var l = cm.getCursor().line; cm.replaceRange("", {line: l, ch: 0}, {line: l});},
    undo: function(cm) {cm.undo();},
    redo: function(cm) {cm.redo();},
    goDocStart: function(cm) {cm.setCursor(0, 0, true);},
    goDocEnd: function(cm) {cm.setSelection({line: cm.lineCount() - 1}, null, true);},
    goLineStart: function(cm) {cm.setCursor(cm.getCursor().line, 0, true);},
    goLineStartSmart: function(cm) {
      var cur = cm.getCursor();
      var text = cm.getLine(cur.line), firstNonWS = Math.max(0, text.search(/\S/));
      cm.setCursor(cur.line, cur.ch <= firstNonWS && cur.ch ? 0 : firstNonWS, true);
    },
    goLineEnd: function(cm) {cm.setSelection({line: cm.getCursor().line}, null, true);},
    goLineUp: function(cm) {cm.moveV(-1, "line");},
    goLineDown: function(cm) {cm.moveV(1, "line");},
    goPageUp: function(cm) {cm.moveV(-1, "page");},
    goPageDown: function(cm) {cm.moveV(1, "page");},
    goCharLeft: function(cm) {cm.moveH(-1, "char");},
    goCharRight: function(cm) {cm.moveH(1, "char");},
    goColumnLeft: function(cm) {cm.moveH(-1, "column");},
    goColumnRight: function(cm) {cm.moveH(1, "column");},
    goWordLeft: function(cm) {cm.moveH(-1, "word");},
    goWordRight: function(cm) {cm.moveH(1, "word");},
    delCharLeft: function(cm) {cm.deleteH(-1, "char");},
    delCharRight: function(cm) {cm.deleteH(1, "char");},
    delWordLeft: function(cm) {cm.deleteH(-1, "word");},
    delWordRight: function(cm) {cm.deleteH(1, "word");},
    indentAuto: function(cm) {cm.indentSelection("smart");},
    indentMore: function(cm) {cm.indentSelection("add");},
    indentLess: function(cm) {cm.indentSelection("subtract");},
    insertTab: function(cm) {cm.replaceSelection("\t", "end");},
    defaultTab: function(cm) {
      if (cm.somethingSelected()) cm.indentSelection("add");
      else cm.replaceSelection("\t", "end");
    },
    transposeChars: function(cm) {
      var cur = cm.getCursor(), line = cm.getLine(cur.line);
      if (cur.ch > 0 && cur.ch < line.length - 1)
        cm.replaceRange(line.charAt(cur.ch) + line.charAt(cur.ch - 1),
                        {line: cur.line, ch: cur.ch - 1}, {line: cur.line, ch: cur.ch + 1});
    },
    newlineAndIndent: function(cm) {
      cm.replaceSelection("\n", "end");
      cm.indentLine(cm.getCursor().line);
    },
    toggleOverwrite: function(cm) {cm.toggleOverwrite();}
  };

  var keyMap = CodeMirror.keyMap = {};
  keyMap.basic = {
    "Left": "goCharLeft", "Right": "goCharRight", "Up": "goLineUp", "Down": "goLineDown",
    "End": "goLineEnd", "Home": "goLineStartSmart", "PageUp": "goPageUp", "PageDown": "goPageDown",
    "Delete": "delCharRight", "Backspace": "delCharLeft", "Tab": "defaultTab", "Shift-Tab": "indentAuto",
    "Enter": "newlineAndIndent", "Insert": "toggleOverwrite"
  };
  // Note that the save and find-related commands aren't defined by
  // default. Unknown commands are simply ignored.
  keyMap.pcDefault = {
    "Ctrl-A": "selectAll", "Ctrl-D": "deleteLine", "Ctrl-Z": "undo", "Shift-Ctrl-Z": "redo", "Ctrl-Y": "redo",
    "Ctrl-Home": "goDocStart", "Alt-Up": "goDocStart", "Ctrl-End": "goDocEnd", "Ctrl-Down": "goDocEnd",
    "Ctrl-Left": "goWordLeft", "Ctrl-Right": "goWordRight", "Alt-Left": "goLineStart", "Alt-Right": "goLineEnd",
    "Ctrl-Backspace": "delWordLeft", "Ctrl-Delete": "delWordRight", "Ctrl-S": "save", "Ctrl-F": "find",
    "Ctrl-G": "findNext", "Shift-Ctrl-G": "findPrev", "Shift-Ctrl-F": "replace", "Shift-Ctrl-R": "replaceAll",
    "Ctrl-[": "indentLess", "Ctrl-]": "indentMore",
    fallthrough: "basic"
  };
  keyMap.macDefault = {
    "Cmd-A": "selectAll", "Cmd-D": "deleteLine", "Cmd-Z": "undo", "Shift-Cmd-Z": "redo", "Cmd-Y": "redo",
    "Cmd-Up": "goDocStart", "Cmd-End": "goDocEnd", "Cmd-Down": "goDocEnd", "Alt-Left": "goWordLeft",
    "Alt-Right": "goWordRight", "Cmd-Left": "goLineStart", "Cmd-Right": "goLineEnd", "Alt-Backspace": "delWordLeft",
    "Ctrl-Alt-Backspace": "delWordRight", "Alt-Delete": "delWordRight", "Cmd-S": "save", "Cmd-F": "find",
    "Cmd-G": "findNext", "Shift-Cmd-G": "findPrev", "Cmd-Alt-F": "replace", "Shift-Cmd-Alt-F": "replaceAll",
    "Cmd-[": "indentLess", "Cmd-]": "indentMore",
    fallthrough: ["basic", "emacsy"]
  };
  keyMap["default"] = mac ? keyMap.macDefault : keyMap.pcDefault;
  keyMap.emacsy = {
    "Ctrl-F": "goCharRight", "Ctrl-B": "goCharLeft", "Ctrl-P": "goLineUp", "Ctrl-N": "goLineDown",
    "Alt-F": "goWordRight", "Alt-B": "goWordLeft", "Ctrl-A": "goLineStart", "Ctrl-E": "goLineEnd",
    "Ctrl-V": "goPageDown", "Shift-Ctrl-V": "goPageUp", "Ctrl-D": "delCharRight", "Ctrl-H": "delCharLeft",
    "Alt-D": "delWordRight", "Alt-Backspace": "delWordLeft", "Ctrl-K": "killLine", "Ctrl-T": "transposeChars"
  };

  function getKeyMap(val) {
    if (typeof val == "string") return keyMap[val];
    else return val;
  }
  function lookupKey(name, extraMap, map, handle, stop) {
    function lookup(map) {
      map = getKeyMap(map);
      var found = map[name];
      if (found === false) {
        if (stop) stop();
        return true;
      }
      if (found != null && handle(found)) return true;
      if (map.nofallthrough) {
        if (stop) stop();
        return true;
      }
      var fallthrough = map.fallthrough;
      if (fallthrough == null) return false;
      if (Object.prototype.toString.call(fallthrough) != "[object Array]")
        return lookup(fallthrough);
      for (var i = 0, e = fallthrough.length; i < e; ++i) {
        if (lookup(fallthrough[i])) return true;
      }
      return false;
    }
    if (extraMap && lookup(extraMap)) return true;
    return lookup(map);
  }
  function isModifierKey(event) {
    var name = keyNames[e_prop(event, "keyCode")];
    return name == "Ctrl" || name == "Alt" || name == "Shift" || name == "Mod";
  }
  CodeMirror.isModifierKey = isModifierKey;

  CodeMirror.fromTextArea = function(textarea, options) {
    if (!options) options = {};
    options.value = textarea.value;
    if (!options.tabindex && textarea.tabindex)
      options.tabindex = textarea.tabindex;
    // Set autofocus to true if this textarea is focused, or if it has
    // autofocus and no other element is focused.
    if (options.autofocus == null) {
      var hasFocus = document.body;
      // doc.activeElement occasionally throws on IE
      try { hasFocus = document.activeElement; } catch(e) {}
      options.autofocus = hasFocus == textarea ||
        textarea.getAttribute("autofocus") != null && hasFocus == document.body;
    }

    function save() {textarea.value = instance.getValue();}
    if (textarea.form) {
      // Deplorable hack to make the submit method do the right thing.
      var rmSubmit = connect(textarea.form, "submit", save, true);
      if (typeof textarea.form.submit == "function") {
        var realSubmit = textarea.form.submit;
        textarea.form.submit = function wrappedSubmit() {
          save();
          textarea.form.submit = realSubmit;
          textarea.form.submit();
          textarea.form.submit = wrappedSubmit;
        };
      }
    }

    textarea.style.display = "none";
    var instance = CodeMirror(function(node) {
      textarea.parentNode.insertBefore(node, textarea.nextSibling);
    }, options);
    instance.save = save;
    instance.getTextArea = function() { return textarea; };
    instance.toTextArea = function() {
      save();
      textarea.parentNode.removeChild(instance.getWrapperElement());
      textarea.style.display = "";
      if (textarea.form) {
        rmSubmit();
        if (typeof textarea.form.submit == "function")
          textarea.form.submit = realSubmit;
      }
    };
    return instance;
  };

  var gecko = /gecko\/\d{7}/i.test(navigator.userAgent);
  var ie = /MSIE \d/.test(navigator.userAgent);
  var ie_lt8 = /MSIE [1-7]\b/.test(navigator.userAgent);
  var ie_lt9 = /MSIE [1-8]\b/.test(navigator.userAgent);
  var quirksMode = ie && document.documentMode == 5;
  var webkit = /WebKit\//.test(navigator.userAgent);
  var chrome = /Chrome\//.test(navigator.userAgent);
  var opera = /Opera\//.test(navigator.userAgent);
  var safari = /Apple Computer/.test(navigator.vendor);
  var khtml = /KHTML\//.test(navigator.userAgent);
  var mac_geLion = /Mac OS X 10\D([7-9]|\d\d)\D/.test(navigator.userAgent);

  // Utility functions for working with state. Exported because modes
  // sometimes need to do this.
  function copyState(mode, state) {
    if (state === true) return state;
    if (mode.copyState) return mode.copyState(state);
    var nstate = {};
    for (var n in state) {
      var val = state[n];
      if (val instanceof Array) val = val.concat([]);
      nstate[n] = val;
    }
    return nstate;
  }
  CodeMirror.copyState = copyState;
  function startState(mode, a1, a2) {
    return mode.startState ? mode.startState(a1, a2) : true;
  }
  CodeMirror.startState = startState;
  CodeMirror.innerMode = function(mode, state) {
    while (mode.innerMode) {
      var info = mode.innerMode(state);
      state = info.state;
      mode = info.mode;
    }
    return info || {mode: mode, state: state};
  };

  // The character stream used by a mode's parser.
  function StringStream(string, tabSize) {
    this.pos = this.start = 0;
    this.string = string;
    this.tabSize = tabSize || 8;
  }
  StringStream.prototype = {
    eol: function() {return this.pos >= this.string.length;},
    sol: function() {return this.pos == 0;},
    peek: function() {return this.string.charAt(this.pos) || undefined;},
    next: function() {
      if (this.pos < this.string.length)
        return this.string.charAt(this.pos++);
    },
    eat: function(match) {
      var ch = this.string.charAt(this.pos);
      if (typeof match == "string") var ok = ch == match;
      else var ok = ch && (match.test ? match.test(ch) : match(ch));
      if (ok) {++this.pos; return ch;}
    },
    eatWhile: function(match) {
      var start = this.pos;
      while (this.eat(match)){}
      return this.pos > start;
    },
    eatSpace: function() {
      var start = this.pos;
      while (/[\s\u00a0]/.test(this.string.charAt(this.pos))) ++this.pos;
      return this.pos > start;
    },
    skipToEnd: function() {this.pos = this.string.length;},
    skipTo: function(ch) {
      var found = this.string.indexOf(ch, this.pos);
      if (found > -1) {this.pos = found; return true;}
    },
    backUp: function(n) {this.pos -= n;},
    column: function() {return countColumn(this.string, this.start, this.tabSize);},
    indentation: function() {return countColumn(this.string, null, this.tabSize);},
    match: function(pattern, consume, caseInsensitive) {
      if (typeof pattern == "string") {
        var cased = function(str) {return caseInsensitive ? str.toLowerCase() : str;};
        if (cased(this.string).indexOf(cased(pattern), this.pos) == this.pos) {
          if (consume !== false) this.pos += pattern.length;
          return true;
        }
      } else {
        var match = this.string.slice(this.pos).match(pattern);
        if (match && match.index > 0) return null;
        if (match && consume !== false) this.pos += match[0].length;
        return match;
      }
    },
    current: function(){return this.string.slice(this.start, this.pos);}
  };
  CodeMirror.StringStream = StringStream;

  function MarkedSpan(from, to, marker) {
    this.from = from; this.to = to; this.marker = marker;
  }

  function getMarkedSpanFor(spans, marker) {
    if (spans) for (var i = 0; i < spans.length; ++i) {
      var span = spans[i];
      if (span.marker == marker) return span;
    }
  }

  function removeMarkedSpan(spans, span) {
    var r;
    for (var i = 0; i < spans.length; ++i)
      if (spans[i] != span) (r || (r = [])).push(spans[i]);
    return r;
  }

  function markedSpansBefore(old, startCh, endCh) {
    if (old) for (var i = 0, nw; i < old.length; ++i) {
      var span = old[i], marker = span.marker;
      var startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= startCh : span.from < startCh);
      if (startsBefore || marker.type == "bookmark" && span.from == startCh && span.from != endCh) {
        var endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= startCh : span.to > startCh);
        (nw || (nw = [])).push({from: span.from,
                                to: endsAfter ? null : span.to,
                                marker: marker});
      }
    }
    return nw;
  }

  function markedSpansAfter(old, endCh) {
    if (old) for (var i = 0, nw; i < old.length; ++i) {
      var span = old[i], marker = span.marker;
      var endsAfter = span.to == null || (marker.inclusiveRight ? span.to >= endCh : span.to > endCh);
      if (endsAfter || marker.type == "bookmark" && span.from == endCh) {
        var startsBefore = span.from == null || (marker.inclusiveLeft ? span.from <= endCh : span.from < endCh);
        (nw || (nw = [])).push({from: startsBefore ? null : span.from - endCh,
                                to: span.to == null ? null : span.to - endCh,
                                marker: marker});
      }
    }
    return nw;
  }

  function updateMarkedSpans(oldFirst, oldLast, startCh, endCh, newText) {
    if (!oldFirst && !oldLast) return newText;
    // Get the spans that 'stick out' on both sides
    var first = markedSpansBefore(oldFirst, startCh);
    var last = markedSpansAfter(oldLast, endCh);

    // Next, merge those two ends
    var sameLine = newText.length == 1, offset = lst(newText).length + (sameLine ? startCh : 0);
    if (first) {
      // Fix up .to properties of first
      for (var i = 0; i < first.length; ++i) {
        var span = first[i];
        if (span.to == null) {
          var found = getMarkedSpanFor(last, span.marker);
          if (!found) span.to = startCh;
          else if (sameLine) span.to = found.to == null ? null : found.to + offset;
        }
      }
    }
    if (last) {
      // Fix up .from in last (or move them into first in case of sameLine)
      for (var i = 0; i < last.length; ++i) {
        var span = last[i];
        if (span.to != null) span.to += offset;
        if (span.from == null) {
          var found = getMarkedSpanFor(first, span.marker);
          if (!found) {
            span.from = offset;
            if (sameLine) (first || (first = [])).push(span);
          }
        } else {
          span.from += offset;
          if (sameLine) (first || (first = [])).push(span);
        }
      }
    }

    var newMarkers = [newHL(newText[0], first)];
    if (!sameLine) {
      // Fill gap with whole-line-spans
      var gap = newText.length - 2, gapMarkers;
      if (gap > 0 && first)
        for (var i = 0; i < first.length; ++i)
          if (first[i].to == null)
            (gapMarkers || (gapMarkers = [])).push({from: null, to: null, marker: first[i].marker});
      for (var i = 0; i < gap; ++i)
        newMarkers.push(newHL(newText[i+1], gapMarkers));
      newMarkers.push(newHL(lst(newText), last));
    }
    return newMarkers;
  }

  // hl stands for history-line, a data structure that can be either a
  // string (line without markers) or a {text, markedSpans} object.
  function hlText(val) { return typeof val == "string" ? val : val.text; }
  function hlSpans(val) {
    if (typeof val == "string") return null;
    var spans = val.markedSpans, out = null;
    for (var i = 0; i < spans.length; ++i) {
      if (spans[i].marker.explicitlyCleared) { if (!out) out = spans.slice(0, i); }
      else if (out) out.push(spans[i]);
    }
    return !out ? spans : out.length ? out : null;
  }
  function newHL(text, spans) { return spans ? {text: text, markedSpans: spans} : text; }

  function detachMarkedSpans(line) {
    var spans = line.markedSpans;
    if (!spans) return;
    for (var i = 0; i < spans.length; ++i) {
      var lines = spans[i].marker.lines;
      var ix = indexOf(lines, line);
      lines.splice(ix, 1);
    }
    line.markedSpans = null;
  }

  function attachMarkedSpans(line, spans) {
    if (!spans) return;
    for (var i = 0; i < spans.length; ++i)
      var marker = spans[i].marker.lines.push(line);
    line.markedSpans = spans;
  }

  // When measuring the position of the end of a line, different
  // browsers require different approaches. If an empty span is added,
  // many browsers report bogus offsets. Of those, some (Webkit,
  // recent IE) will accept a space without moving the whole span to
  // the next line when wrapping it, others work with a zero-width
  // space.
  var eolSpanContent = " ";
  if (gecko || (ie && !ie_lt8)) eolSpanContent = "\u200b";
  else if (opera) eolSpanContent = "";

  // Line objects. These hold state related to a line, including
  // highlighting info (the styles array).
  function Line(text, markedSpans) {
    this.text = text;
    this.height = 1;
    attachMarkedSpans(this, markedSpans);
  }
  Line.prototype = {
    update: function(text, markedSpans) {
      this.text = text;
      this.stateAfter = this.styles = null;
      detachMarkedSpans(this);
      attachMarkedSpans(this, markedSpans);
    },
    // Run the given mode's parser over a line, update the styles
    // array, which contains alternating fragments of text and CSS
    // classes.
    highlight: function(mode, state, tabSize) {
      var stream = new StringStream(this.text, tabSize), st = this.styles || (this.styles = []);
      var pos = st.length = 0;
      if (this.text == "" && mode.blankLine) mode.blankLine(state);
      while (!stream.eol()) {
        var style = mode.token(stream, state), substr = stream.current();
        stream.start = stream.pos;
        if (pos && st[pos-1] == style) {
          st[pos-2] += substr;
        } else if (substr) {
          st[pos++] = substr; st[pos++] = style;
        }
        // Give up when line is ridiculously long
        if (stream.pos > 5000) {
          st[pos++] = this.text.slice(stream.pos); st[pos++] = null;
          break;
        }
      }
    },
    process: function(mode, state, tabSize) {
      var stream = new StringStream(this.text, tabSize);
      if (this.text == "" && mode.blankLine) mode.blankLine(state);
      while (!stream.eol() && stream.pos <= 5000) {
        mode.token(stream, state);
        stream.start = stream.pos;
      }
    },
    // Fetch the parser token for a given character. Useful for hacks
    // that want to inspect the mode state (say, for completion).
    getTokenAt: function(mode, state, tabSize, ch) {
      var txt = this.text, stream = new StringStream(txt, tabSize);
      while (stream.pos < ch && !stream.eol()) {
        stream.start = stream.pos;
        var style = mode.token(stream, state);
      }
      return {start: stream.start,
              end: stream.pos,
              string: stream.current(),
              className: style || null,
              state: state};
    },
    indentation: function(tabSize) {return countColumn(this.text, null, tabSize);},
    // Produces an HTML fragment for the line, taking selection,
    // marking, and highlighting into account.
    getContent: function(tabSize, wrapAt, compensateForWrapping) {
      var first = true, col = 0, specials = /[\t\u0000-\u0019\u200b\u2028\u2029\uFEFF]/g;
      var pre = elt("pre");
      function span_(html, text, style) {
        if (!text) return;
        // Work around a bug where, in some compat modes, IE ignores leading spaces
        if (first && ie && text.charAt(0) == " ") text = "\u00a0" + text.slice(1);
        first = false;
        if (!specials.test(text)) {
          col += text.length;
          var content = document.createTextNode(text);
        } else {
          var content = document.createDocumentFragment(), pos = 0;
          while (true) {
            specials.lastIndex = pos;
            var m = specials.exec(text);
            var skipped = m ? m.index - pos : text.length - pos;
            if (skipped) {
              content.appendChild(document.createTextNode(text.slice(pos, pos + skipped)));
              col += skipped;
            }
            if (!m) break;
            pos += skipped + 1;
            if (m[0] == "\t") {
              var tabWidth = tabSize - col % tabSize;
              content.appendChild(elt("span", spaceStr(tabWidth), "cm-tab"));
              col += tabWidth;
            } else {
              var token = elt("span", "\u2022", "cm-invalidchar");
              token.title = "\\u" + m[0].charCodeAt(0).toString(16);
              content.appendChild(token);
              col += 1;
            }
          }
        }
        if (style) html.appendChild(elt("span", [content], style));
        else html.appendChild(content);
      }
      var span = span_;
      if (wrapAt != null) {
        var outPos = 0, anchor = pre.anchor = elt("span");
        span = function(html, text, style) {
          var l = text.length;
          if (wrapAt >= outPos && wrapAt < outPos + l) {
            var cut = wrapAt - outPos;
            if (cut) {
              span_(html, text.slice(0, cut), style);
              // See comment at the definition of spanAffectsWrapping
              if (compensateForWrapping) {
                var view = text.slice(cut - 1, cut + 1);
                if (spanAffectsWrapping.test(view)) html.appendChild(elt("wbr"));
                else if (!ie_lt8 && /\w\w/.test(view)) html.appendChild(document.createTextNode("\u200d"));
              }
            }
            html.appendChild(anchor);
            span_(anchor, opera ? text.slice(cut, cut + 1) : text.slice(cut), style);
            if (opera) span_(html, text.slice(cut + 1), style);
            wrapAt--;
            outPos += l;
          } else {
            outPos += l;
            span_(html, text, style);
            if (outPos == wrapAt && outPos == len) {
              setTextContent(anchor, eolSpanContent);
              html.appendChild(anchor);
            }
            // Stop outputting HTML when gone sufficiently far beyond measure
            else if (outPos > wrapAt + 10 && /\s/.test(text)) span = function(){};
          }
        };
      }

      var st = this.styles, allText = this.text, marked = this.markedSpans;
      var len = allText.length;
      function styleToClass(style) {
        if (!style) return null;
        return "cm-" + style.replace(/ +/g, " cm-");
      }
      if (!allText && wrapAt == null) {
        span(pre, " ");
      } else if (!marked || !marked.length) {
        for (var i = 0, ch = 0; ch < len; i+=2) {
          var str = st[i], style = st[i+1], l = str.length;
          if (ch + l > len) str = str.slice(0, len - ch);
          ch += l;
          span(pre, str, styleToClass(style));
        }
      } else {
        marked.sort(function(a, b) { return a.from - b.from; });
        var pos = 0, i = 0, text = "", style, sg = 0;
        var nextChange = marked[0].from || 0, marks = [], markpos = 0;
        var advanceMarks = function() {
          var m;
          while (markpos < marked.length &&
                 ((m = marked[markpos]).from == pos || m.from == null)) {
            if (m.marker.type == "range") marks.push(m);
            ++markpos;
          }
          nextChange = markpos < marked.length ? marked[markpos].from : Infinity;
          for (var i = 0; i < marks.length; ++i) {
            var to = marks[i].to;
            if (to == null) to = Infinity;
            if (to == pos) marks.splice(i--, 1);
            else nextChange = Math.min(to, nextChange);
          }
        };
        var m = 0;
        while (pos < len) {
          if (nextChange == pos) advanceMarks();
          var upto = Math.min(len, nextChange);
          while (true) {
            if (text) {
              var end = pos + text.length;
              var appliedStyle = style;
              for (var j = 0; j < marks.length; ++j) {
                var mark = marks[j];
                appliedStyle = (appliedStyle ? appliedStyle + " " : "") + mark.marker.style;
                if (mark.marker.endStyle && mark.to === Math.min(end, upto)) appliedStyle += " " + mark.marker.endStyle;
                if (mark.marker.startStyle && mark.from === pos) appliedStyle += " " + mark.marker.startStyle;
              }
              span(pre, end > upto ? text.slice(0, upto - pos) : text, appliedStyle);
              if (end >= upto) {text = text.slice(upto - pos); pos = upto; break;}
              pos = end;
            }
            text = st[i++]; style = styleToClass(st[i++]);
          }
        }
      }
      return pre;
    },
    cleanUp: function() {
      this.parent = null;
      detachMarkedSpans(this);
    }
  };

  // Data structure that holds the sequence of lines.
  function LeafChunk(lines) {
    this.lines = lines;
    this.parent = null;
    for (var i = 0, e = lines.length, height = 0; i < e; ++i) {
      lines[i].parent = this;
      height += lines[i].height;
    }
    this.height = height;
  }
  LeafChunk.prototype = {
    chunkSize: function() { return this.lines.length; },
    remove: function(at, n, callbacks) {
      for (var i = at, e = at + n; i < e; ++i) {
        var line = this.lines[i];
        this.height -= line.height;
        line.cleanUp();
        if (line.handlers)
          for (var j = 0; j < line.handlers.length; ++j) callbacks.push(line.handlers[j]);
      }
      this.lines.splice(at, n);
    },
    collapse: function(lines) {
      lines.splice.apply(lines, [lines.length, 0].concat(this.lines));
    },
    insertHeight: function(at, lines, height) {
      this.height += height;
      this.lines = this.lines.slice(0, at).concat(lines).concat(this.lines.slice(at));
      for (var i = 0, e = lines.length; i < e; ++i) lines[i].parent = this;
    },
    iterN: function(at, n, op) {
      for (var e = at + n; at < e; ++at)
        if (op(this.lines[at])) return true;
    }
  };
  function BranchChunk(children) {
    this.children = children;
    var size = 0, height = 0;
    for (var i = 0, e = children.length; i < e; ++i) {
      var ch = children[i];
      size += ch.chunkSize(); height += ch.height;
      ch.parent = this;
    }
    this.size = size;
    this.height = height;
    this.parent = null;
  }
  BranchChunk.prototype = {
    chunkSize: function() { return this.size; },
    remove: function(at, n, callbacks) {
      this.size -= n;
      for (var i = 0; i < this.children.length; ++i) {
        var child = this.children[i], sz = child.chunkSize();
        if (at < sz) {
          var rm = Math.min(n, sz - at), oldHeight = child.height;
          child.remove(at, rm, callbacks);
          this.height -= oldHeight - child.height;
          if (sz == rm) { this.children.splice(i--, 1); child.parent = null; }
          if ((n -= rm) == 0) break;
          at = 0;
        } else at -= sz;
      }
      if (this.size - n < 25) {
        var lines = [];
        this.collapse(lines);
        this.children = [new LeafChunk(lines)];
        this.children[0].parent = this;
      }
    },
    collapse: function(lines) {
      for (var i = 0, e = this.children.length; i < e; ++i) this.children[i].collapse(lines);
    },
    insert: function(at, lines) {
      var height = 0;
      for (var i = 0, e = lines.length; i < e; ++i) height += lines[i].height;
      this.insertHeight(at, lines, height);
    },
    insertHeight: function(at, lines, height) {
      this.size += lines.length;
      this.height += height;
      for (var i = 0, e = this.children.length; i < e; ++i) {
        var child = this.children[i], sz = child.chunkSize();
        if (at <= sz) {
          child.insertHeight(at, lines, height);
          if (child.lines && child.lines.length > 50) {
            while (child.lines.length > 50) {
              var spilled = child.lines.splice(child.lines.length - 25, 25);
              var newleaf = new LeafChunk(spilled);
              child.height -= newleaf.height;
              this.children.splice(i + 1, 0, newleaf);
              newleaf.parent = this;
            }
            this.maybeSpill();
          }
          break;
        }
        at -= sz;
      }
    },
    maybeSpill: function() {
      if (this.children.length <= 10) return;
      var me = this;
      do {
        var spilled = me.children.splice(me.children.length - 5, 5);
        var sibling = new BranchChunk(spilled);
        if (!me.parent) { // Become the parent node
          var copy = new BranchChunk(me.children);
          copy.parent = me;
          me.children = [copy, sibling];
          me = copy;
        } else {
          me.size -= sibling.size;
          me.height -= sibling.height;
          var myIndex = indexOf(me.parent.children, me);
          me.parent.children.splice(myIndex + 1, 0, sibling);
        }
        sibling.parent = me.parent;
      } while (me.children.length > 10);
      me.parent.maybeSpill();
    },
    iter: function(from, to, op) { this.iterN(from, to - from, op); },
    iterN: function(at, n, op) {
      for (var i = 0, e = this.children.length; i < e; ++i) {
        var child = this.children[i], sz = child.chunkSize();
        if (at < sz) {
          var used = Math.min(n, sz - at);
          if (child.iterN(at, used, op)) return true;
          if ((n -= used) == 0) break;
          at = 0;
        } else at -= sz;
      }
    }
  };

  function getLineAt(chunk, n) {
    while (!chunk.lines) {
      for (var i = 0;; ++i) {
        var child = chunk.children[i], sz = child.chunkSize();
        if (n < sz) { chunk = child; break; }
        n -= sz;
      }
    }
    return chunk.lines[n];
  }
  function lineNo(line) {
    if (line.parent == null) return null;
    var cur = line.parent, no = indexOf(cur.lines, line);
    for (var chunk = cur.parent; chunk; cur = chunk, chunk = chunk.parent) {
      for (var i = 0, e = chunk.children.length; ; ++i) {
        if (chunk.children[i] == cur) break;
        no += chunk.children[i].chunkSize();
      }
    }
    return no;
  }
  function lineAtHeight(chunk, h) {
    var n = 0;
    outer: do {
      for (var i = 0, e = chunk.children.length; i < e; ++i) {
        var child = chunk.children[i], ch = child.height;
        if (h < ch) { chunk = child; continue outer; }
        h -= ch;
        n += child.chunkSize();
      }
      return n;
    } while (!chunk.lines);
    for (var i = 0, e = chunk.lines.length; i < e; ++i) {
      var line = chunk.lines[i], lh = line.height;
      if (h < lh) break;
      h -= lh;
    }
    return n + i;
  }
  function heightAtLine(chunk, n) {
    var h = 0;
    outer: do {
      for (var i = 0, e = chunk.children.length; i < e; ++i) {
        var child = chunk.children[i], sz = child.chunkSize();
        if (n < sz) { chunk = child; continue outer; }
        n -= sz;
        h += child.height;
      }
      return h;
    } while (!chunk.lines);
    for (var i = 0; i < n; ++i) h += chunk.lines[i].height;
    return h;
  }

  // The history object 'chunks' changes that are made close together
  // and at almost the same time into bigger undoable units.
  function History() {
    this.time = 0;
    this.done = []; this.undone = [];
    this.compound = 0;
    this.closed = false;
  }
  History.prototype = {
    addChange: function(start, added, old) {
      this.undone.length = 0;
      var time = +new Date, cur = lst(this.done), last = cur && lst(cur);
      var dtime = time - this.time;

      if (cur && !this.closed && this.compound) {
        cur.push({start: start, added: added, old: old});
      } else if (dtime > 400 || !last || this.closed ||
                 last.start > start + old.length || last.start + last.added < start) {
        this.done.push([{start: start, added: added, old: old}]);
        this.closed = false;
      } else {
        var startBefore = Math.max(0, last.start - start),
            endAfter = Math.max(0, (start + old.length) - (last.start + last.added));
        for (var i = startBefore; i > 0; --i) last.old.unshift(old[i - 1]);
        for (var i = endAfter; i > 0; --i) last.old.push(old[old.length - i]);
        if (startBefore) last.start = start;
        last.added += added - (old.length - startBefore - endAfter);
      }
      this.time = time;
    },
    startCompound: function() {
      if (!this.compound++) this.closed = true;
    },
    endCompound: function() {
      if (!--this.compound) this.closed = true;
    }
  };

  function stopMethod() {e_stop(this);}
  // Ensure an event has a stop method.
  function addStop(event) {
    if (!event.stop) event.stop = stopMethod;
    return event;
  }

  function e_preventDefault(e) {
    if (e.preventDefault) e.preventDefault();
    else e.returnValue = false;
  }
  function e_stopPropagation(e) {
    if (e.stopPropagation) e.stopPropagation();
    else e.cancelBubble = true;
  }
  function e_stop(e) {e_preventDefault(e); e_stopPropagation(e);}
  CodeMirror.e_stop = e_stop;
  CodeMirror.e_preventDefault = e_preventDefault;
  CodeMirror.e_stopPropagation = e_stopPropagation;

  function e_target(e) {return e.target || e.srcElement;}
  function e_button(e) {
    var b = e.which;
    if (b == null) {
      if (e.button & 1) b = 1;
      else if (e.button & 2) b = 3;
      else if (e.button & 4) b = 2;
    }
    if (mac && e.ctrlKey && b == 1) b = 3;
    return b;
  }

  // Allow 3rd-party code to override event properties by adding an override
  // object to an event object.
  function e_prop(e, prop) {
    var overridden = e.override && e.override.hasOwnProperty(prop);
    return overridden ? e.override[prop] : e[prop];
  }

  // Event handler registration. If disconnect is true, it'll return a
  // function that unregisters the handler.
  function connect(node, type, handler, disconnect) {
    if (typeof node.addEventListener == "function") {
      node.addEventListener(type, handler, false);
      if (disconnect) return function() {node.removeEventListener(type, handler, false);};
    } else {
      var wrapHandler = function(event) {handler(event || window.event);};
      node.attachEvent("on" + type, wrapHandler);
      if (disconnect) return function() {node.detachEvent("on" + type, wrapHandler);};
    }
  }
  CodeMirror.connect = connect;

  function Delayed() {this.id = null;}
  Delayed.prototype = {set: function(ms, f) {clearTimeout(this.id); this.id = setTimeout(f, ms);}};

  var Pass = CodeMirror.Pass = {toString: function(){return "CodeMirror.Pass";}};

  // Detect drag-and-drop
  var dragAndDrop = function() {
    // There is *some* kind of drag-and-drop support in IE6-8, but I
    // couldn't get it to work yet.
    if (ie_lt9) return false;
    var div = elt('div');
    return "draggable" in div || "dragDrop" in div;
  }();

  // Feature-detect whether newlines in textareas are converted to \r\n
  var lineSep = function () {
    var te = elt("textarea");
    te.value = "foo\nbar";
    if (te.value.indexOf("\r") > -1) return "\r\n";
    return "\n";
  }();

  // For a reason I have yet to figure out, some browsers disallow
  // word wrapping between certain characters *only* if a new inline
  // element is started between them. This makes it hard to reliably
  // measure the position of things, since that requires inserting an
  // extra span. This terribly fragile set of regexps matches the
  // character combinations that suffer from this phenomenon on the
  // various browsers.
  var spanAffectsWrapping = /^$/; // Won't match any two-character string
  if (gecko) spanAffectsWrapping = /$'/;
  else if (safari) spanAffectsWrapping = /\-[^ \-?]|\?[^ !'\"\),.\-\/:;\?\]\}]/;
  else if (chrome) spanAffectsWrapping = /\-[^ \-\.?]|\?[^ \-\.?\]\}:;!'\"\),\/]|[\.!\"#&%\)*+,:;=>\]|\}~][\(\{\[<]|\$'/;

  // Counts the column offset in a string, taking tabs into account.
  // Used mostly to find indentation.
  function countColumn(string, end, tabSize) {
    if (end == null) {
      end = string.search(/[^\s\u00a0]/);
      if (end == -1) end = string.length;
    }
    for (var i = 0, n = 0; i < end; ++i) {
      if (string.charAt(i) == "\t") n += tabSize - (n % tabSize);
      else ++n;
    }
    return n;
  }

  function eltOffset(node, screen) {
    // Take the parts of bounding client rect that we are interested in so we are able to edit if need be,
    // since the returned value cannot be changed externally (they are kept in sync as the element moves within the page)
    try { var box = node.getBoundingClientRect(); box = { top: box.top, left: box.left }; }
    catch(e) { box = {top: 0, left: 0}; }
    if (!screen) {
      // Get the toplevel scroll, working around browser differences.
      if (window.pageYOffset == null) {
        var t = document.documentElement || document.body.parentNode;
        if (t.scrollTop == null) t = document.body;
        box.top += t.scrollTop; box.left += t.scrollLeft;
      } else {
        box.top += window.pageYOffset; box.left += window.pageXOffset;
      }
    }
    return box;
  }

  function eltText(node) {
    return node.textContent || node.innerText || node.nodeValue || "";
  }

  var spaceStrs = [""];
  function spaceStr(n) {
    while (spaceStrs.length <= n)
      spaceStrs.push(lst(spaceStrs) + " ");
    return spaceStrs[n];
  }

  function lst(arr) { return arr[arr.length-1]; }

  function selectInput(node) {
    if (ios) { // Mobile Safari apparently has a bug where select() is broken.
      node.selectionStart = 0;
      node.selectionEnd = node.value.length;
    } else node.select();
  }

  // Operations on {line, ch} objects.
  function posEq(a, b) {return a.line == b.line && a.ch == b.ch;}
  function posLess(a, b) {return a.line < b.line || (a.line == b.line && a.ch < b.ch);}
  function copyPos(x) {return {line: x.line, ch: x.ch};}

  function elt(tag, content, className, style) {
    var e = document.createElement(tag);
    if (className) e.className = className;
    if (style) e.style.cssText = style;
    if (typeof content == "string") setTextContent(e, content);
    else if (content) for (var i = 0; i < content.length; ++i) e.appendChild(content[i]);
    return e;
  }
  function removeChildren(e) {
    e.innerHTML = "";
    return e;
  }
  function removeChildrenAndAdd(parent, e) {
    removeChildren(parent).appendChild(e);
  }
  function setTextContent(e, str) {
    if (ie_lt9) {
      e.innerHTML = "";
      e.appendChild(document.createTextNode(str));
    } else e.textContent = str;
  }

  // Used to position the cursor after an undo/redo by finding the
  // last edited character.
  function editEnd(from, to) {
    if (!to) return 0;
    if (!from) return to.length;
    for (var i = from.length, j = to.length; i >= 0 && j >= 0; --i, --j)
      if (from.charAt(i) != to.charAt(j)) break;
    return j + 1;
  }

  function indexOf(collection, elt) {
    if (collection.indexOf) return collection.indexOf(elt);
    for (var i = 0, e = collection.length; i < e; ++i)
      if (collection[i] == elt) return i;
    return -1;
  }
  var nonASCIISingleCaseWordChar = /[\u3040-\u309f\u30a0-\u30ff\u3400-\u4db5\u4e00-\u9fcc]/;
  function isWordChar(ch) {
    return /\w/.test(ch) || ch > "\x80" &&
      (ch.toUpperCase() != ch.toLowerCase() || nonASCIISingleCaseWordChar.test(ch));
  }

  // See if "".split is the broken IE version, if so, provide an
  // alternative way to split lines.
  var splitLines = "\n\nb".split(/\n/).length != 3 ? function(string) {
    var pos = 0, result = [], l = string.length;
    while (pos <= l) {
      var nl = string.indexOf("\n", pos);
      if (nl == -1) nl = string.length;
      var line = string.slice(pos, string.charAt(nl - 1) == "\r" ? nl - 1 : nl);
      var rt = line.indexOf("\r");
      if (rt != -1) {
        result.push(line.slice(0, rt));
        pos += rt + 1;
      } else {
        result.push(line);
        pos = nl + 1;
      }
    }
    return result;
  } : function(string){return string.split(/\r\n?|\n/);};
  CodeMirror.splitLines = splitLines;

  var hasSelection = window.getSelection ? function(te) {
    try { return te.selectionStart != te.selectionEnd; }
    catch(e) { return false; }
  } : function(te) {
    try {var range = te.ownerDocument.selection.createRange();}
    catch(e) {}
    if (!range || range.parentElement() != te) return false;
    return range.compareEndPoints("StartToEnd", range) != 0;
  };

  CodeMirror.defineMode("null", function() {
    return {token: function(stream) {stream.skipToEnd();}};
  });
  CodeMirror.defineMIME("text/plain", "null");

  var keyNames = {3: "Enter", 8: "Backspace", 9: "Tab", 13: "Enter", 16: "Shift", 17: "Ctrl", 18: "Alt",
                  19: "Pause", 20: "CapsLock", 27: "Esc", 32: "Space", 33: "PageUp", 34: "PageDown", 35: "End",
                  36: "Home", 37: "Left", 38: "Up", 39: "Right", 40: "Down", 44: "PrintScrn", 45: "Insert",
                  46: "Delete", 59: ";", 91: "Mod", 92: "Mod", 93: "Mod", 109: "-", 107: "=", 127: "Delete",
                  186: ";", 187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`", 219: "[", 220: "\\",
                  221: "]", 222: "'", 63276: "PageUp", 63277: "PageDown", 63275: "End", 63273: "Home",
                  63234: "Left", 63232: "Up", 63235: "Right", 63233: "Down", 63302: "Insert", 63272: "Delete"};
  CodeMirror.keyNames = keyNames;
  (function() {
    // Number keys
    for (var i = 0; i < 10; i++) keyNames[i + 48] = String(i);
    // Alphabetic keys
    for (var i = 65; i <= 90; i++) keyNames[i] = String.fromCharCode(i);
    // Function keys
    for (var i = 1; i <= 12; i++) keyNames[i + 111] = keyNames[i + 63235] = "F" + i;
  })();

  CodeMirror.version = "2.35 +";

  return CodeMirror;
})();
(function() {
  CodeMirror.simpleHint = function(editor, getHints, givenOptions) {
    // Determine effective options based on given values and defaults.
    var options = {}, defaults = CodeMirror.simpleHint.defaults;
    for (var opt in defaults)
      if (defaults.hasOwnProperty(opt))
        options[opt] = (givenOptions && givenOptions.hasOwnProperty(opt) ? givenOptions : defaults)[opt];
    
    function collectHints(previousToken) {
      // We want a single cursor position.
      if (editor.somethingSelected()) return;

      var tempToken = editor.getTokenAt(editor.getCursor());

      // Don't show completions if token has changed and the option is set.
      if (options.closeOnTokenChange && previousToken != null &&
          (tempToken.start != previousToken.start || tempToken.className != previousToken.className)) {
        return;
      }

      var result = getHints(editor);
      if (!result || !result.list.length) return;
      var completions = result.list;
      function insert(str) {
        editor.replaceRange(str, result.from, result.to);
      }
      // When there is only one completion, use it directly.
      if (options.completeSingle && completions.length == 1) {
        insert(completions[0]);
        return true;
      }

      // Build the select widget
      var complete = document.createElement("div");
      complete.className = "CodeMirror-completions";
      var sel = complete.appendChild(document.createElement("select"));
      // Opera doesn't move the selection when pressing up/down in a
      // multi-select, but it does properly support the size property on
      // single-selects, so no multi-select is necessary.
      if (!window.opera) sel.multiple = true;
      for (var i = 0; i < completions.length; ++i) {
        var opt = sel.appendChild(document.createElement("option"));
        opt.appendChild(document.createTextNode(completions[i]));
      }
      sel.firstChild.selected = true;
      sel.size = Math.min(10, completions.length);
      var pos = options.alignWithWord ? editor.charCoords(result.from) : editor.cursorCoords();
      complete.style.left = pos.x + "px";
      complete.style.top = pos.yBot + "px";
      document.body.appendChild(complete);
      // If we're at the edge of the screen, then we want the menu to appear on the left of the cursor.
      var winW = window.innerWidth || Math.max(document.body.offsetWidth, document.documentElement.offsetWidth);
      if(winW - pos.x < sel.clientWidth)
        complete.style.left = (pos.x - sel.clientWidth) + "px";
      // Hack to hide the scrollbar.
      if (completions.length <= 10)
        complete.style.width = (sel.clientWidth - 1) + "px";

      var done = false;
      function close() {
        if (done) return;
        done = true;
        complete.parentNode.removeChild(complete);
      }
      function pick() {
        insert(completions[sel.selectedIndex]);
        close();
        setTimeout(function(){editor.focus();}, 50);
      }
      CodeMirror.connect(sel, "blur", close);
      CodeMirror.connect(sel, "keydown", function(event) {
        var code = event.keyCode;
        // Enter
        if (code == 13) {CodeMirror.e_stop(event); pick();}
        // Escape
        else if (code == 27) {CodeMirror.e_stop(event); close(); editor.focus();}
        else if (code != 38 && code != 40 && code != 33 && code != 34 && !CodeMirror.isModifierKey(event)) {
          close(); editor.focus();
          // Pass the event to the CodeMirror instance so that it can handle things like backspace properly.
          editor.triggerOnKeyDown(event);
          // Don't show completions if the code is backspace and the option is set.
          if (!options.closeOnBackspace || code != 8) {
            setTimeout(function(){collectHints(tempToken);}, 50);
          }
        }
      });
      CodeMirror.connect(sel, "dblclick", pick);

      sel.focus();
      // Opera sometimes ignores focusing a freshly created node
      if (window.opera) setTimeout(function(){if (!done) sel.focus();}, 100);
      return true;
    }
    return collectHints();
  };
  CodeMirror.simpleHint.defaults = {
    closeOnBackspace: true,
    closeOnTokenChange: false,
    completeSingle: true,
    alignWithWord: true
  };
})();
/**
 * Tag-closer extension for CodeMirror.
 *
 * This extension adds a "closeTag" utility function that can be used with key bindings to 
 * insert a matching end tag after the ">" character of a start tag has been typed.  It can
 * also complete "</" if a matching start tag is found.  It will correctly ignore signal
 * characters for empty tags, comments, CDATA, etc.
 *
 * The function depends on internal parser state to identify tags.  It is compatible with the
 * following CodeMirror modes and will ignore all others:
 * - htmlmixed
 * - xml
 *
 * See demos/closetag.html for a usage example.
 * 
 * @author Nathan Williams <nathan@nlwillia.net>
 * Contributed under the same license terms as CodeMirror.
 */

(function() {
	/** Option that allows tag closing behavior to be toggled.  Default is true. */
	CodeMirror.defaults['closeTagEnabled'] = true;
	
	/** Array of tag names to add indentation after the start tag for.  Default is the list of block-level html tags. */
	CodeMirror.defaults['closeTagIndent'] = ['applet', 'blockquote', 'body', 'button', 'div', 'dl', 'fieldset', 'form', 'frameset', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'html', 'iframe', 'layer', 'legend', 'object', 'ol', 'p', 'select', 'table', 'ul'];

	/** Array of tag names where an end tag is forbidden. */
	CodeMirror.defaults['closeTagVoid'] = ['area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'];

	function innerState(cm, state) {
		return CodeMirror.innerMode(cm.getMode(), state).state;
	}


	/**
	 * Call during key processing to close tags.  Handles the key event if the tag is closed, otherwise throws CodeMirror.Pass.
	 * - cm: The editor instance.
	 * - ch: The character being processed.
	 * - indent: Optional.  An array of tag names to indent when closing.  Omit or pass true to use the default indentation tag list defined in the 'closeTagIndent' option.
	 *   Pass false to disable indentation.  Pass an array to override the default list of tag names.
	 * - vd: Optional.  An array of tag names that should not be closed.  Omit to use the default void (end tag forbidden) tag list defined in the 'closeTagVoid' option.  Ignored in xml mode.
	 */
	CodeMirror.defineExtension("closeTag", function(cm, ch, indent, vd) {
		if (!cm.getOption('closeTagEnabled')) {
			throw CodeMirror.Pass;
		}
		
		/*
		 * Relevant structure of token:
		 *
		 * htmlmixed
		 * 		className
		 * 		state
		 * 			htmlState
		 * 				type
		 *				tagName
		 * 				context
		 * 					tagName
		 * 			mode
		 * 
		 * xml
		 * 		className
		 * 		state
		 * 			tagName
		 * 			type
		 */
		
		var pos = cm.getCursor();
		var tok = cm.getTokenAt(pos);
		var state = innerState(cm, tok.state);

		if (state) {
			
			if (ch == '>') {
				var type = state.type;
				
				if (tok.className == 'tag' && type == 'closeTag') {
					throw CodeMirror.Pass; // Don't process the '>' at the end of an end-tag.
				}
			
				cm.replaceSelection('>'); // Mode state won't update until we finish the tag.
				pos = {line: pos.line, ch: pos.ch + 1};
				cm.setCursor(pos);
		
				tok = cm.getTokenAt(cm.getCursor());
				state = innerState(cm, tok.state);
				if (!state) throw CodeMirror.Pass;
				var type = state.type;

				if (tok.className == 'tag' && type != 'selfcloseTag') {
					var tagName = state.tagName;
					if (tagName.length > 0 && shouldClose(cm, vd, tagName)) {
						insertEndTag(cm, indent, pos, tagName);
					}
					return;
				}
				
				// Undo the '>' insert and allow cm to handle the key instead.
				cm.setSelection({line: pos.line, ch: pos.ch - 1}, pos);
				cm.replaceSelection("");
			
			} else if (ch == '/') {
				if (tok.className == 'tag' && tok.string == '<') {
					var ctx = state.context, tagName = ctx ? ctx.tagName : '';
					if (tagName.length > 0) {
						completeEndTag(cm, pos, tagName);
						return;
					}
				}
			}
		
		}
		
		throw CodeMirror.Pass; // Bubble if not handled
	});

	function insertEndTag(cm, indent, pos, tagName) {
		if (shouldIndent(cm, indent, tagName)) {
			cm.replaceSelection('\n\n</' + tagName + '>', 'end');
			cm.indentLine(pos.line + 1);
			cm.indentLine(pos.line + 2);
			cm.setCursor({line: pos.line + 1, ch: cm.getLine(pos.line + 1).length});
		} else {
			cm.replaceSelection('</' + tagName + '>');
			cm.setCursor(pos);
		}
	}
	
	function shouldIndent(cm, indent, tagName) {
		if (typeof indent == 'undefined' || indent == null || indent == true) {
			indent = cm.getOption('closeTagIndent');
		}
		if (!indent) {
			indent = [];
		}
		return indexOf(indent, tagName.toLowerCase()) != -1;
	}
	
	function shouldClose(cm, vd, tagName) {
		if (cm.getOption('mode') == 'xml') {
			return true; // always close xml tags
		}
		if (typeof vd == 'undefined' || vd == null) {
			vd = cm.getOption('closeTagVoid');
		}
		if (!vd) {
			vd = [];
		}
		return indexOf(vd, tagName.toLowerCase()) == -1;
	}
	
	// C&P from codemirror.js...would be nice if this were visible to utilities.
	function indexOf(collection, elt) {
		if (collection.indexOf) return collection.indexOf(elt);
		for (var i = 0, e = collection.length; i < e; ++i)
			if (collection[i] == elt) return i;
		return -1;
	}

	function completeEndTag(cm, pos, tagName) {
		cm.replaceSelection('/' + tagName + '>');
		cm.setCursor({line: pos.line, ch: pos.ch + tagName.length + 2 });
	}
	
})();

(function() {

    CodeMirror.xmlHints = [];

    CodeMirror.xmlHint = function(cm, simbol) {

        if(simbol.length > 0) {
            var cursor = cm.getCursor();
            cm.replaceSelection(simbol);
            cursor = {line: cursor.line, ch: cursor.ch + 1};
            cm.setCursor(cursor);
        }

        CodeMirror.simpleHint(cm, getHint);
    };

    CodeMirror.xmlSimpleHint = function(cm) {
      CodeMirror.simpleHint(cm, getHint);
    };

    var getHint = function(cm) {

        var cursor = cm.getCursor();

        if (cursor.ch > 0) {

            var text = cm.getRange({line: 0, ch: 0}, cursor);
            var typed = '';
            var simbol = '';
            for(var i = text.length - 1; i >= 0; i--) {
                if(text[i] == ' ' || text[i] == '<') {
                    simbol = text[i];
                    break;
                }
                else {
                    typed = text[i] + typed;
                }
            }

            text = text.slice(0, text.length - typed.length);

            var path = getActiveElement(cm, text) + simbol;
            var hints = CodeMirror.xmlHints[path];

            if(typeof hints === 'undefined')
                hints = [''];
            else {
                hints = hints.slice(0);
                for (var i = hints.length - 1; i >= 0; i--) {
                    if(hints[i].indexOf(typed) != 0)
                        hints.splice(i, 1);
                }
            }

            return {
                list: hints,
                from: { line: cursor.line, ch: cursor.ch - typed.length },
                to: cursor
            };
        };
    };

    var getActiveElement = function(codeMirror, text) {

        var element = '';

        if(text.length >= 0) {

            var regex = new RegExp('<([^!?][^\\s/>]*).*?>', 'g');

            var matches = [];
            var match;
            while ((match = regex.exec(text)) != null) {
                matches.push({
                    tag: match[1],
                    selfclose: (match[0].slice(match[0].length - 2) === '/>')
                });
            }

            for (var i = matches.length - 1, skip = 0; i >= 0; i--) {

                var item = matches[i];

                if (item.tag[0] == '/')
                {
                    skip++;
                }
                else if (item.selfclose == false)
                {
                    if (skip > 0)
                    {
                        skip--;
                    }
                    else
                    {
                        element = '<' + item.tag + '>' + element;
                    }
                }
            }

            element += getOpenTag(text);
        }

        return element;
    };

    var getOpenTag = function(text) {

        var open = text.lastIndexOf('<');
        var close = text.lastIndexOf('>');

        if (close < open)
        {
            text = text.slice(open);

            if(text != '<') {

                var space = text.indexOf(' ');
                if(space < 0)
                    space = text.indexOf('\t');
                if(space < 0)
                    space = text.indexOf('\n');

                if (space < 0)
                    space = text.length;

                return text.slice(0, space);
            }
        }

        return '';
    };

})();
CodeMirror.defineMode("xml", function(config, parserConfig) {
  var indentUnit = config.indentUnit;
  var Kludges = parserConfig.htmlMode ? {
    autoSelfClosers: {'area': true, 'base': true, 'br': true, 'col': true, 'command': true,
                      'embed': true, 'frame': true, 'hr': true, 'img': true, 'input': true,
                      'keygen': true, 'link': true, 'meta': true, 'param': true, 'source': true,
                      'track': true, 'wbr': true},
    implicitlyClosed: {'dd': true, 'li': true, 'optgroup': true, 'option': true, 'p': true,
                       'rp': true, 'rt': true, 'tbody': true, 'td': true, 'tfoot': true,
                       'th': true, 'tr': true},
    contextGrabbers: {
      'dd': {'dd': true, 'dt': true},
      'dt': {'dd': true, 'dt': true},
      'li': {'li': true},
      'option': {'option': true, 'optgroup': true},
      'optgroup': {'optgroup': true},
      'p': {'address': true, 'article': true, 'aside': true, 'blockquote': true, 'dir': true,
            'div': true, 'dl': true, 'fieldset': true, 'footer': true, 'form': true,
            'h1': true, 'h2': true, 'h3': true, 'h4': true, 'h5': true, 'h6': true,
            'header': true, 'hgroup': true, 'hr': true, 'menu': true, 'nav': true, 'ol': true,
            'p': true, 'pre': true, 'section': true, 'table': true, 'ul': true},
      'rp': {'rp': true, 'rt': true},
      'rt': {'rp': true, 'rt': true},
      'tbody': {'tbody': true, 'tfoot': true},
      'td': {'td': true, 'th': true},
      'tfoot': {'tbody': true},
      'th': {'td': true, 'th': true},
      'thead': {'tbody': true, 'tfoot': true},
      'tr': {'tr': true}
    },
    doNotIndent: {"pre": true},
    allowUnquoted: true,
    allowMissing: true
  } : {
    autoSelfClosers: {},
    implicitlyClosed: {},
    contextGrabbers: {},
    doNotIndent: {},
    allowUnquoted: false,
    allowMissing: false
  };
  var alignCDATA = parserConfig.alignCDATA;

  // Return variables for tokenizers
  var tagName, type;

  function inText(stream, state) {
    function chain(parser) {
      state.tokenize = parser;
      return parser(stream, state);
    }

    var ch = stream.next();
    if (ch == "<") {
      if (stream.eat("!")) {
        if (stream.eat("[")) {
          if (stream.match("CDATA[")) return chain(inBlock("atom", "]]>"));
          else return null;
        }
        else if (stream.match("--")) return chain(inBlock("comment", "-->"));
        else if (stream.match("DOCTYPE", true, true)) {
          stream.eatWhile(/[\w\._\-]/);
          return chain(doctype(1));
        }
        else return null;
      }
      else if (stream.eat("?")) {
        stream.eatWhile(/[\w\._\-]/);
        state.tokenize = inBlock("meta", "?>");
        return "meta";
      }
      else {
        type = stream.eat("/") ? "closeTag" : "openTag";
        stream.eatSpace();
        tagName = "";
        var c;
        while ((c = stream.eat(/[^\s\u00a0=<>\"\'\/?]/))) tagName += c;
        state.tokenize = inTag;
        return "tag";
      }
    }
    else if (ch == "&") {
      var ok;
      if (stream.eat("#")) {
        if (stream.eat("x")) {
          ok = stream.eatWhile(/[a-fA-F\d]/) && stream.eat(";");          
        } else {
          ok = stream.eatWhile(/[\d]/) && stream.eat(";");
        }
      } else {
        ok = stream.eatWhile(/[\w\.\-:]/) && stream.eat(";");
      }
      return ok ? "atom" : "error";
    }
    else {
      stream.eatWhile(/[^&<]/);
      return null;
    }
  }

  function inTag(stream, state) {
    var ch = stream.next();
    if (ch == ">" || (ch == "/" && stream.eat(">"))) {
      state.tokenize = inText;
      type = ch == ">" ? "endTag" : "selfcloseTag";
      return "tag";
    }
    else if (ch == "=") {
      type = "equals";
      return null;
    }
    else if (/[\'\"]/.test(ch)) {
      state.tokenize = inAttribute(ch);
      return state.tokenize(stream, state);
    }
    else {
      stream.eatWhile(/[^\s\u00a0=<>\"\']/);
      return "word";
    }
  }

  function inAttribute(quote) {
    return function(stream, state) {
      while (!stream.eol()) {
        if (stream.next() == quote) {
          state.tokenize = inTag;
          break;
        }
      }
      return "string";
    };
  }

  function inBlock(style, terminator) {
    return function(stream, state) {
      while (!stream.eol()) {
        if (stream.match(terminator)) {
          state.tokenize = inText;
          break;
        }
        stream.next();
      }
      return style;
    };
  }
  function doctype(depth) {
    return function(stream, state) {
      var ch;
      while ((ch = stream.next()) != null) {
        if (ch == "<") {
          state.tokenize = doctype(depth + 1);
          return state.tokenize(stream, state);
        } else if (ch == ">") {
          if (depth == 1) {
            state.tokenize = inText;
            break;
          } else {
            state.tokenize = doctype(depth - 1);
            return state.tokenize(stream, state);
          }
        }
      }
      return "meta";
    };
  }

  var curState, setStyle;
  function pass() {
    for (var i = arguments.length - 1; i >= 0; i--) curState.cc.push(arguments[i]);
  }
  function cont() {
    pass.apply(null, arguments);
    return true;
  }

  function pushContext(tagName, startOfLine) {
    var noIndent = Kludges.doNotIndent.hasOwnProperty(tagName) || (curState.context && curState.context.noIndent);
    curState.context = {
      prev: curState.context,
      tagName: tagName,
      indent: curState.indented,
      startOfLine: startOfLine,
      noIndent: noIndent
    };
  }
  function popContext() {
    if (curState.context) curState.context = curState.context.prev;
  }

  function element(type) {
    if (type == "openTag") {
      curState.tagName = tagName;
      return cont(attributes, endtag(curState.startOfLine));
    } else if (type == "closeTag") {
      var err = false;
      if (curState.context) {
        if (curState.context.tagName != tagName) {
          if (Kludges.implicitlyClosed.hasOwnProperty(curState.context.tagName.toLowerCase())) {
            popContext();
          }
          err = !curState.context || curState.context.tagName != tagName;
        }
      } else {
        err = true;
      }
      if (err) setStyle = "error";
      return cont(endclosetag(err));
    }
    return cont();
  }
  function endtag(startOfLine) {
    return function(type) {
      if (type == "selfcloseTag" ||
          (type == "endTag" && Kludges.autoSelfClosers.hasOwnProperty(curState.tagName.toLowerCase()))) {
        maybePopContext(curState.tagName.toLowerCase());
        return cont();
      }
      if (type == "endTag") {
        maybePopContext(curState.tagName.toLowerCase());
        pushContext(curState.tagName, startOfLine);
        return cont();
      }
      return cont();
    };
  }
  function endclosetag(err) {
    return function(type) {
      if (err) setStyle = "error";
      if (type == "endTag") { popContext(); return cont(); }
      setStyle = "error";
      return cont(arguments.callee);
    };
  }
  function maybePopContext(nextTagName) {
    var parentTagName;
    while (true) {
      if (!curState.context) {
        return;
      }
      parentTagName = curState.context.tagName.toLowerCase();
      if (!Kludges.contextGrabbers.hasOwnProperty(parentTagName) ||
          !Kludges.contextGrabbers[parentTagName].hasOwnProperty(nextTagName)) {
        return;
      }
      popContext();
    }
  }

  function attributes(type) {
    if (type == "word") {setStyle = "attribute"; return cont(attribute, attributes);}
    if (type == "endTag" || type == "selfcloseTag") return pass();
    setStyle = "error";
    return cont(attributes);
  }
  function attribute(type) {
    if (type == "equals") return cont(attvalue, attributes);
    if (!Kludges.allowMissing) setStyle = "error";
    else if (type == "word") setStyle = "attribute";
    return (type == "endTag" || type == "selfcloseTag") ? pass() : cont();
  }
  function attvalue(type) {
    if (type == "string") return cont(attvaluemaybe);
    if (type == "word" && Kludges.allowUnquoted) {setStyle = "string"; return cont();}
    setStyle = "error";
    return (type == "endTag" || type == "selfCloseTag") ? pass() : cont();
  }
  function attvaluemaybe(type) {
    if (type == "string") return cont(attvaluemaybe);
    else return pass();
  }

  return {
    startState: function() {
      return {tokenize: inText, cc: [], indented: 0, startOfLine: true, tagName: null, context: null};
    },

    token: function(stream, state) {
      if (stream.sol()) {
        state.startOfLine = true;
        state.indented = stream.indentation();
      }
      if (stream.eatSpace()) return null;

      setStyle = type = tagName = null;
      var style = state.tokenize(stream, state);
      state.type = type;
      if ((style || type) && style != "comment") {
        curState = state;
        while (true) {
          var comb = state.cc.pop() || element;
          if (comb(type || style)) break;
        }
      }
      state.startOfLine = false;
      return setStyle || style;
    },

    indent: function(state, textAfter, fullLine) {
      var context = state.context;
      if ((state.tokenize != inTag && state.tokenize != inText) ||
          context && context.noIndent)
        return fullLine ? fullLine.match(/^(\s*)/)[0].length : 0;
      if (alignCDATA && /<!\[CDATA\[/.test(textAfter)) return 0;
      if (context && /^<\//.test(textAfter))
        context = context.prev;
      while (context && !context.startOfLine)
        context = context.prev;
      if (context) return context.indent + indentUnit;
      else return 0;
    },

    electricChars: "/"
  };
});

CodeMirror.defineMIME("text/xml", "xml");
CodeMirror.defineMIME("application/xml", "xml");
if (!CodeMirror.mimeModes.hasOwnProperty("text/html"))
  CodeMirror.defineMIME("text/html", {name: "xml", htmlMode: true});
$(function () {
  AS.mixedContentElements = {
    language: {
      tag: 'language',
      attributes: [],
      exclude: [
        'accessrestrict',
        'accruals',
        'acqinfo',
        'altformavail',
        'appraisal',
        'arrangement',
        'bibliography',
        'bioghist',
        'custodhist',
        'fileplan',
        'index',
        'odd',
        'otherfindaid',
        'originalsloc',
        'phystech',
        'prefercite',
        'processinfo',
        'relatedmaterial',
        'scopecontent',
        'separatedmaterial',
        'userestrict',
        'dimensions',
        'legalstatus',
        'summary',
        'edition',
        'extent',
        'note',
        'inscription',
        'physdesc',
        'relatedmaterial',
        'abstract',
        'physloc',
        'materialspec',
        'physfacet',
      ],
    },
    blockquote: {
      tag: 'blockquote',
      attributes: [],
      exclude: [
        'abstract',
        'dimensions',
        'legalstatus',
        'langmaterial',
        'materialspec',
        'physdesc',
        'physfacet',
        'physloc',
      ],
    },
    date: {
      tag: 'date',
      attributes: ['type', 'normal', 'calendar', 'era'],
      exclude: [
        'abstract',
        'accruals',
        'appraisal',
        'arrangement',
        'note_index',
        'note_bibliography',
        'bioghist',
        'accessrestrict',
        'userestrict',
        'custodhist',
        'dimensions',
        'altformavail',
        'originalsloc',
        'fileplan',
        'odd',
        'acqinfo',
        'otherfindaid',
        'phystech',
        'prefercite',
        'processinfo',
        'relatedmaterial',
        'scopecontent',
        'separatedmaterial',
        'langmaterial',
        'materialspec',
        'physloc',
      ],
    },
    function: {
      tag: 'function',
      attributes: ['rules', 'source'],
      exclude: [
        'abstract',
        'accruals',
        'appraisal',
        'arrangement',
        'note_bibliography',
        'bioghist',
        'accessrestrict',
        'userestrict',
        'custodhist',
        'dimensions',
        'altformavail',
        'originalsloc',
        'fileplan',
        'odd',
        'acqinfo',
        'legalstatus',
        'otherfindaid',
        'phystech',
        'prefercite',
        'processinfo',
        'relatedmaterial',
        'scopecontent',
        'separatedmaterial',
        'note_index',
        'langmaterial',
        'materialspec',
        'physloc',
      ],
    },
    occupation: {
      tag: 'occupation',
      attributes: ['type', 'normal', 'calendar', 'era'],
      exclude: [
        'abstract',
        'accruals',
        'appraisal',
        'arrangement',
        'note_bibliography',
        'bioghist',
        'accessrestrict',
        'userestrict',
        'custodhist',
        'dimensions',
        'altformavail',
        'originalsloc',
        'fileplan',
        'odd',
        'acqinfo',
        'legalstatus',
        'otherfindaid',
        'phystech',
        'prefercite',
        'processinfo',
        'relatedmaterial',
        'scopecontent',
        'separatedmaterial',
        'note_index',
        'langmaterial',
        'materialspec',
        'physloc',
      ],
    },
    subject: {
      tag: 'subject',
      attributes: ['type', 'normal', 'calendar', 'era'],
      exclude: [
        'abstract',
        'accruals',
        'appraisal',
        'arrangement',
        'note_bibliography',
        'bioghist',
        'accessrestrict',
        'userestrict',
        'custodhist',
        'dimensions',
        'altformavail',
        'originalsloc',
        'fileplan',
        'odd',
        'acqinfo',
        'legalstatus',
        'otherfindaid',
        'phystech',
        'prefercite',
        'processinfo',
        'relatedmaterial',
        'scopecontent',
        'separatedmaterial',
        'note_index',
        'langmaterial',
        'materialspec',
        'physloc',
      ],
    },
    emph: {
      tag: 'emph',
      attributes: ['render'],
      exclude: [
        'langmaterial',
        'abstract',
        'accruals',
        'appraisal',
        'arrangement',
        'note_bibliography',
        'bioghist',
        'accessrestrict',
        'userestrict',
        'custodhist',
        'altformavail',
        'originalsloc',
        'fileplan',
        'odd',
        'acqinfo',
        'otherfindaid',
        'phystech',
        'prefercite',
        'processinfo',
        'relatedmaterial',
        'scopecontent',
        'separatedmaterial',
        'note_index',
      ],
    },
    corpname: {
      tag: 'corpname',
      attributes: ['rules', 'role', 'source'],
      exclude: [
        'abstract',
        'accruals',
        'acqinfo',
        'appraisal',
        'arrangement',
        'note_bibliography',
        'bioghist',
        'accessrestrict',
        'userestrict',
        'custodhist',
        'dimensions',
        'altformavail',
        'originalsloc',
        'fileplan',
        'odd',
        'acqinfo',
        'legalstatus',
        'otherfindaid',
        'phystech',
        'prefercite',
        'processinfo',
        'relatedmaterial',
        'scopecontent',
        'separatedmaterial',
        'note_index',
        'langmaterial',
        'materialspec',
        'physloc',
      ],
    },
    persname: {
      tag: 'persname',
      attributes: ['rules', 'role', 'source'],
      exclude: [
        'abstract',
        'accruals',
        'appraisal',
        'acqinfo',
        'arrangement',
        'note_bibliography',
        'bioghist',
        'accessrestrict',
        'userestrict',
        'custodhist',
        'dimensions',
        'altformavail',
        'originalsloc',
        'fileplan',
        'odd',
        'acqinfo',
        'legalstatus',
        'otherfindaid',
        'phystech',
        'prefercite',
        'processinfo',
        'relatedmaterial',
        'scopecontent',
        'separatedmaterial',
        'note_index',
        'langmaterial',
        'materialspec',
        'physloc',
      ],
    },
    famname: {
      tag: 'famname',
      attributes: ['rules', 'role', 'source'],
      exclude: [
        'abstract',
        'accruals',
        'appraisal',
        'acqinfo',
        'arrangement',
        'note_bibliography',
        'bioghist',
        'accessrestrict',
        'userestrict',
        'custodhist',
        'dimensions',
        'altformavail',
        'originalsloc',
        'fileplan',
        'odd',
        'acqinfo',
        'legalstatus',
        'otherfindaid',
        'phystech',
        'prefercite',
        'processinfo',
        'relatedmaterial',
        'scopecontent',
        'separatedmaterial',
        'note_index',
        'langmaterial',
        'materialspec',
        'physloc',
      ],
    },
    name: {
      tag: 'name',
      attributes: ['rules', 'role', 'source'],
      exclude: [
        'abstract',
        'accruals',
        'acqinfo',
        'appraisal',
        'arrangement',
        'note_bibliography',
        'bioghist',
        'accessrestrict',
        'userestrict',
        'custodhist',
        'dimensions',
        'altformavail',
        'originalsloc',
        'fileplan',
        'odd',
        'acqinfo',
        'legalstatus',
        'otherfindaid',
        'phystech',
        'prefercite',
        'processinfo',
        'relatedmaterial',
        'scopecontent',
        'separatedmaterial',
        'note_index',
        'langmaterial',
        'materialspec',
        'physloc',
      ],
    },
    geogname: {
      tag: 'geogname',
      attributes: ['rules', 'role', 'source'],
      exclude: [
        'abstract',
        'accruals',
        'appraisal',
        'arrangement',
        'note_bibliography',
        'bioghist',
        'accessrestrict',
        'userestrict',
        'custodhist',
        'dimensions',
        'altformavail',
        'originalsloc',
        'fileplan',
        'odd',
        'acqinfo',
        'legalstatus',
        'otherfindaid',
        'phystech',
        'prefercite',
        'processinfo',
        'relatedmaterial',
        'scopecontent',
        'separatedmaterial',
        'note_index',
        'langmaterial',
        'materialspec',
        'physloc',
      ],
    },
    genreform: {
      tag: 'genreform',
      attributes: ['rules', 'role', 'type'],
      exclude: [
        'abstract',
        'accruals',
        'appraisal',
        'arrangement',
        'note_bibliography',
        'bioghist',
        'accessrestrict',
        'userestrict',
        'custodhist',
        'dimensions',
        'altformavail',
        'originalsloc',
        'fileplan',
        'odd',
        'acqinfo',
        'legalstatus',
        'otherfindaid',
        'phystech',
        'prefercite',
        'processinfo',
        'relatedmaterial',
        'scopecontent',
        'separatedmaterial',
        'note_index',
        'langmaterial',
        'materialspec',
        'physloc',
      ],
    },
    title: {
      tag: 'title',
      attributes: ['render', 'accruals'],
      exclude: [
        'langmaterial',
        'appraisal',
        'accruals',
        'arrangement',
        'bioghist',
        'accessrestrict',
        'userestrict',
        'custodhist',
        'altformavail',
        'originalsloc',
        'fileplan',
        'odd',
        'acqinfo',
        'legalstatus',
        'phystech',
        'prefercite',
        'processinfo',
        'scopecontent',
        'note_index',
      ],
    },
    ref: {
      tag: 'ref',
      attributes: ['target', 'show', 'title', 'actuate', 'href'],
      exclude: [
        'langmaterial',
        'accruals',
        'appraisal',
        'arrangement',
        'bioghist',
        'accessrestrict',
        'userestrict',
        'custodhist',
        'altformavail',
        'originalsloc',
        'fileplan',
        'odd',
        'acqinfo',
        'legalstatus',
        'phystech',
        'prefercite',
        'processinfo',
        'scopecontent',
        'note_index',
      ],
    },
    extref: {
      tag: 'extref',
      attributes: ['show', 'title', 'actuate', 'href'],
      exclude: [
        'langmaterial',
        'abstract',
        'accruals',
        'appraisal',
        'arrangement',
        'bioghist',
        'accessrestrict',
        'userestrict',
        'custodhist',
        'altformavail',
        'originalsloc',
        'fileplan',
        'odd',
        'acqinfo',
        'legalstatus',
        'phystech',
        'prefercite',
        'processinfo',
        'scopecontent',
        'separatedmaterial',
        'note_index',
      ],
    },
  };
});







$(function () {
  $.fn.mixedContent = function () {
    $(this).each(function () {
      var $this = $(this);

      if ($this.hasClass('initialised')) {
        return;
      }

      var selected;

      var noteTypes = generateNoteTypes($this);
      var tagList = generateTagWhitelist(noteTypes);

      var $wrapWithAction = $(
        AS.renderTemplate('mixed_content_wrap_action_template', {
          tags: tagList,
        })
      );
      var $wrapWithActionSelect = $('select', $wrapWithAction);

      var $editor = CodeMirror.fromTextArea($this[0], {
        value: $this.val(),

        onFocus: function () {
          // we need to check to see if the values have been changed.
          noteTypes = generateNoteTypes($this);
          tagList = generateTagWhitelist(noteTypes);
          generateXMLHints(tagList);

          $wrapWithActionSelect.empty();

          $.each(tagList, function (tag, def) {
            $wrapWithActionSelect.append('<option>' + tag + '</option>');
          });
        },
        onChange: function () {
          $editor.save();
        },
        mode: 'text/html',
        smartIndent: false,
        extraKeys: {
          "'>'": function (cm) {
            cm.closeTag(cm, '>');
          },
          "'/'": function (cm) {
            cm.closeTag(cm, '/');
          },
          "' '": function (cm) {
            CodeMirror.xmlHint(cm, ' ');
          },
          "'<'": function (cm) {
            CodeMirror.xmlHint(cm, '<');
          },
          'Ctrl-Space': function (cm) {
            CodeMirror.xmlHint(cm, '');
          },
        },
        lineWrapping: true,
        onCursorActivity: function (cm) {
          if (cm.somethingSelected()) {
            var coords_start = $editor.cursorCoords(true, 'local');
            var coords_end = $editor.cursorCoords(false, 'local');

            var top_offset = $wrapWithAction.height() - 20 + coords_end.y;
            var left_offset = Math.max(
              Math.min(
                (coords_start.y == coords_end.y
                  ? coords_start.x
                  : coords_end.x) - 83.5,
                $($editor.getWrapperElement()).width() - $wrapWithAction.width()
              ),
              0
            );

            $wrapWithAction
              .css('top', top_offset + 'px')
              .css('left', left_offset + 'px')
              .css('position', 'absolute');
            $wrapWithAction.show();
          } else {
            $wrapWithActionSelect.val('');
            $wrapWithAction.hide();
            $editor.save();
          }
        },
      });

      $this.data('CodeMirror', $editor);
      $this.addClass('initialised');
      $editor.setSize('auto', 'auto');

      var onWrapActionChange = function (event) {
        if ($editor.somethingSelected() && $wrapWithActionSelect.val() != '') {
          var tag = $wrapWithActionSelect.val();
          $editor.replaceSelection(
            '<' + tag + '>' + $editor.getSelection() + '</' + tag + '>'
          );
          var cursorPosition = $editor.getCursor();
          $editor.setCursor({
            line: cursorPosition.line,
            ch: $editor.getSelection() + cursorPosition.ch,
          });
          $editor.focus();
        }
      };

      $wrapWithAction.bind('change', onWrapActionChange);
      $($editor.getWrapperElement())
        .append($wrapWithAction)
        .append(AS.renderTemplate('mixed_content_help_template'));
    });
  };

  var generateNoteTypes = function (inputBox) {
    var noteTypes = inputBox
      .closest('.mixed-content-anchor > ul > li')
      .find('[class$=-type]')
      .map(function () {
        return this.value;
      })
      .get();
    return noteTypes;
  };

  // We need to filter out some tags to not be included in certain note types
  var generateTagWhitelist = function (noteTypes) {
    noteTypes = typeof noteTypes === 'undefined' ? [] : noteTypes;
    whitelist = {};
    if (AS.mixedContentElements) {
      $.each(AS.mixedContentElements, function (tag, def) {
        var exclude = false;
        // check if the definition has the noteType in its exclude list
        if (def.exclude) {
          exclude = $(def.exclude).filter(noteTypes).length > 0;
        }
        // if not, add it to the whitelist
        if (!exclude) {
          whitelist[tag] = def;
        }
      });
    }
    return whitelist;
  };

  var generateXMLHints = function (tagList) {
    var addToPath = function (path, defs) {
      CodeMirror.xmlHints[path] = [];

      for (var i = 0; i < defs.length; i++) {
        var definition = defs[i];

        if (typeof definition == 'string') {
          definition = AS.mixedContentElements[definition];
        }

        CodeMirror.xmlHints[path].push(definition.tag);
        CodeMirror.xmlHints[path + definition.tag + ' '] =
          definition.attributes || [];

        if (definition.elements) {
          addToPath(path + definition.tag + '><', definition.elements);
        }
      }
    };

    tagList = typeof tagList === 'undefined' ? {} : tagList;

    if (tagList) {
      CodeMirror.xmlHints['<'] = [];
      $.each(tagList, function (tag, def) {
        CodeMirror.xmlHints['<'].push(tag);
        CodeMirror.xmlHints['<' + tag + ' '] = def.attributes || [];
        if (def.elements) {
          addToPath('<' + def.tag + '><', def.elements);
        }
      });
    } else {
      throw 'No mixed content rules found: AS.mixedContentElements is null';
    }
  };

  generateXMLHints();

  $(document).bind(
    'subrecordcreated.aspace',
    function (event, object_name, subform) {
      $('textarea.mixed-content:not(.initialised)', subform).mixedContent();
    }
  );

  $(document).bind('expandcontainer.aspace', function (event, $container) {
    $('textarea.mixed-content:not(.initialised)', $container).mixedContent();
  });

  // $("textarea.mixed-content:not(.initialised)").mixedContent();
});
AS.initSubRecordCollapsible = function ($form, func_generateSummary) {
  // only init this feature for top forms
  if ($form.parents('.subrecord-form-fields').length > 0) {
    return;
  }

  var updateSummary = function () {
    $summary.html(func_generateSummary());
  };

  // set up summary
  var $summary = $('<div>').addClass('subrecord-summary-view');
  var $container = $('.subrecord-form-container:first', $form);
  var $wrapper = $form.closest('li');

  // add button to header
  $('.subrecord-form-remove', $wrapper).after(
    AS.renderTemplate('template_subrecord_collapse_action')
  );
  $wrapper
    .on('click', '.collapse-subrecord-toggle', function (event) {
      event.preventDefault();
      event.stopPropagation();

      // replace the existing summary with a new one
      // to reflect any updated values
      if (!$wrapper.hasClass('collapsed')) {
        updateSummary();
        $container.hide();
        $summary.fadeIn();
      } else {
        $container.slideDown('slow', function () {
          $(document).trigger('expandcontainer.aspace', $container);
        });
        $summary.hide();
      }

      $wrapper.toggleClass('collapsed');
    })
    .on('click', '.subrecord-summary-view', function (event) {
      $('.collapse-subrecord-toggle', $wrapper).trigger('click');
    });

  if (
    $form.find('.error:first,.has-error:first').length > 0 ||
    $form.data('collapsed') === false
  ) {
    $summary.hide();
    setTimeout(function () {
      $(document).trigger('expandcontainer.aspace', $container);
    });
  } else {
    $container.hide();
    $wrapper.addClass('collapsed');
  }

  updateSummary();
  $form.append($summary);
};
AS.initTooManySubRecords = function (
  $containerForm,
  numberOfSubRecords,
  callback
) {
  if (numberOfSubRecords > 4) {
    var $tooManyMsgEl = $(
      AS.renderTemplate('too_many_subrecords_template', {
        count: numberOfSubRecords,
      })
    );
    $tooManyMsgEl.hide();
    $containerForm.append($tooManyMsgEl);
    $tooManyMsgEl.fadeIn();
    $('.subrecord-form-container', $containerForm).hide();

    $containerForm.addClass('too-many');
    // let's disable the buttons
    $('.subrecord-form-heading .btn', $containerForm).prop('disabled', true);

    $($containerForm).on('click', function (event) {
      event.preventDefault();
      $containerForm.children().andSelf().removeClass('too-many');
      $tooManyMsgEl.html("<i class='spinner'></i>");
      $('.subrecord-form-heading .btn', $containerForm).prop('disabled', false);

      $tooManyMsgEl.remove();
      $('.subrecord-form-container', $containerForm).show();

      callback(function () {
        $(document).trigger('loadedrecordsubforms.aspace', $containerForm);
      });

      $containerForm.unbind(event);
    });
    return true;
  } else {
    return false;
  }
};
$(document).ready(function () {
  function setupRightsRestrictionNoteFields($subform) {
    var noteJSONModelType = $subform.data('type');

    if (noteJSONModelType == 'note_multipart') {
      var toggleRightsFields = function () {
        var noteType = $('.note-type option:selected', $subform).val();
        var $restriction_fields = $('#notes_restriction', $subform);

        if (noteType == 'accessrestrict' || noteType == 'userestrict') {
          $(':input', $restriction_fields).removeAttr('disabled');
          $restriction_fields.show();

          var $restrictionTypeInput = $restriction_fields.find(
            "select[id*='_local_access_restriction_type_']"
          );
          if (noteType == 'accessrestrict') {
            $restrictionTypeInput.removeAttr('disabled');
            $restrictionTypeInput.closest('.control-group').show();
          } else {
            $restrictionTypeInput.closest('.control-group').hide();
            $restrictionTypeInput.attr('disabled', 'disabled');
          }
        } else {
          $(':input', $restriction_fields).attr('disabled', 'disabled');
          $restriction_fields.hide();
        }
      };

      $('.note-type', $subform).on('change', function () {
        toggleRightsFields();
      });

      toggleRightsFields();
    }
  }

  $(document).bind(
    'subrecordcreated.aspace',
    function (event, jsonmodel_type, $subform) {
      if (jsonmodel_type == 'note') {
        setupRightsRestrictionNoteFields($subform);
      }
    }
  );

  $(document).bind('loadedrecordform.aspace', function (event, $container) {
    $container
      .find('section.notes-form.subrecord-form .subrecord-form-fields')
      .each(function () {
        setupRightsRestrictionNoteFields($(this));
      });
  });

  $('section.notes-form.subrecord-form .subrecord-form-fields').each(
    function () {
      setupRightsRestrictionNoteFields($(this));
    }
  );
});





$(function () {
  function nextDataIndex($list) {
    var data_indexes = $list
      .children()
      .map(function () {
        return parseInt($(this).attr('data-index'));
      })
      .get();
    return data_indexes.length > 0 ? Math.max.apply(Math, data_indexes) + 1 : 0;
  }

  $.fn.init_notes_form = function () {
    $(this).each(function () {
      var $this = $(this);

      if ($this.hasClass('initialised') || $this.hasClass('too-many')) {
        return;
      }

      var initialisers = {};

      var initNoteType = function (
        $subform,
        template_name,
        is_subrecord,
        button_class,
        init_callback
      ) {
        // ANW-1199: Prevent enter key from submitting entire form.
        // Added to address UI issues with the outline notes subform.
        $this.keydown(function (e) {
          if (e.which == 13) {
            e.preventDefault();
          }
        });

        $(button_class || '.add-item-btn', $subform).click(function (event) {
          event.preventDefault();
          event.stopPropagation();

          var template = template_name;

          if (typeof template_name === 'function') {
            template = template_name($(this));
          }

          var context = $(this).parent().hasClass('controls')
            ? $(this).parent()
            : $(this).closest('.subrecord-form');
          var $target_subrecord_list = $('.subrecord-form-list:first', context);
          var add_data_index = nextDataIndex($target_subrecord_list);

          var $subsubform = $(
            AS.renderTemplate(template, {
              path: AS.quickTemplate($target_subrecord_list.data('name-path'), {
                index: add_data_index,
              }),
              id_path: AS.quickTemplate(
                $target_subrecord_list.data('id-path'),
                { index: add_data_index }
              ),
              index: '${index}',
            })
          );

          $subsubform = $('<li>')
            .data('type', $subsubform.data('type'))
            .append($subsubform);
          $subsubform.attr('data-index', add_data_index);
          $target_subrecord_list.append($subsubform);

          AS.initSubRecordSorting($target_subrecord_list);

          if (init_callback) {
            init_callback($subsubform);
          } else {
            initNoteForm($subsubform, false);
          }

          if (is_subrecord) {
            $(document).triggerHandler('subrecordcreated.aspace', [
              'note',
              $subsubform,
            ]);
          }

          $this.parents('form:first').triggerHandler('formchanged.aspace');

          $(':input:visible:first', $subsubform).focus();
        });
      };

      initialisers.note_bibliography = function ($subform) {
        initNoteType($subform, 'template_bib_item');
      };

      initialisers.note_outline = function ($subform) {
        initNoteType(
          $subform,
          'template_note_outline_level',
          true,
          '.add-level-btn'
        );
      };

      initialisers.note_outline_level = function ($subform) {
        initNoteType(
          $subform,
          'template_note_outline_string',
          true,
          '.add-sub-item-btn',
          function (new_form) {
            new_form
              .parent()
              .parent()
              .children('.note-outline-empty-level')
              .hide();
            initNoteForm(new_form, false);
          }
        );

        initNoteType(
          $subform,
          'template_note_outline_level',
          true,
          '.add-sub-level-btn',
          function (new_form) {
            new_form
              .parent()
              .parent()
              .children('.note-outline-empty-level')
              .hide();
            initNoteForm(new_form, false);
          }
        );
      };

      var dropdownFocusFix = function (form) {
        $('.dropdown-menu.subrecord-selector li', form).click(function (e) {
          if (!$(e.target).hasClass('btn')) {
            // Don't hide the dropdown unless what we clicked on was the "Add" button itself.
            e.stopPropagation();
          }
        });
      };

      dropdownFocusFix();

      var initContentList = function ($subform) {
        if (!$subform) {
          $subform = $(document);
        }

        var contentList = $('.content-list', $subform);

        if (contentList.length > 0) {
          initNoteType(
            contentList,
            'template_content_item',
            true,
            '.add-content-item-btn'
          );
        }
      };

      var initRemoveActionForSubRecord = function ($subform) {
        var removeBtn = $(
          "<a href='javascript:void(0)' class='btn btn-default btn-xs pull-right subrecord-form-remove' title='Remove sub-record' aria-label='Remove sub-record'><span class='glyphicon glyphicon-remove'></span></a>"
        );
        $subform.prepend(removeBtn);
        removeBtn.on('click', function () {
          AS.confirmSubFormDelete($(this), function () {
            if ($subform.parent().hasClass('subrecord-form-wrapper')) {
              $subform.parent().remove();
            } else {
              $subform.remove();
              if (
                $('.subrecord-form-list:first', $this).children('li').length < 2
              ) {
                $(
                  '.subrecord-form-heading:first .btn.apply-note-order',
                  $this
                ).attr('disabled', 'disabled');
              }
            }

            $this.parents('form:first').triggerHandler('formchanged.aspace');
            $(document).triggerHandler('subrecorddeleted.aspace', [$this]);
          });
        });
      };

      initialisers.note_index = function ($subform) {
        initNoteType($subform, 'template_note_index_item');
      };

      initialisers.note_chronology = function ($subform) {
        initNoteType($subform, 'template_chronology_item', true);
      };

      initialisers.note_definedlist = function ($subform) {
        initNoteType($subform, 'template_definedlist_item');
      };

      initialisers.note_orderedlist = function ($subform) {
        initNoteType($subform, 'template_orderedlist_item');
      };

      initialisers.chronology_item = function ($subform) {
        initNoteType(
          $subform,
          'template_orderedlist_item',
          false,
          '.add-event-btn'
        );
      };

      initialisers.note_multipart = function ($subform) {
        var callback = function ($subform) {
          var $topLevelNoteTypeSelector = $(
            'select.multipart-note-type',
            $subform
          );
          $topLevelNoteTypeSelector.change(changeNoteTemplate);
          initRemoveActionForSubRecord($subform);
        };

        initNoteType(
          $subform,
          'template_note_multipart_selector',
          true,
          '.add-sub-note-btn',
          callback
        );
      };

      initialisers.note_bioghist = function ($subform) {
        var callback = function ($subform) {
          var $topLevelNoteTypeSelector = $(
            'select.bioghist-note-type',
            $subform
          );
          $topLevelNoteTypeSelector.change(changeNoteTemplate);
          initRemoveActionForSubRecord($subform);
        };

        initNoteType(
          $subform,
          'template_note_bioghist_selector',
          true,
          '.add-sub-note-btn',
          callback
        );
      };

      initialisers.note_general_context = function ($subform) {
        var callback = function ($subform) {
          var $topLevelNoteTypeSelector = $(
            'select.general_context-note-type',
            $subform
          );
          $topLevelNoteTypeSelector.change(changeNoteTemplate);
          initRemoveActionForSubRecord($subform);
        };

        initNoteType(
          $subform,
          'template_note_general_context_selector',
          true,
          '.add-sub-note-btn',
          callback
        );
      };

      initialisers.note_mandate = function ($subform) {
        var callback = function ($subform) {
          var $topLevelNoteTypeSelector = $(
            'select.mandate-note-type',
            $subform
          );
          $topLevelNoteTypeSelector.change(changeNoteTemplate);
          initRemoveActionForSubRecord($subform);
        };

        initNoteType(
          $subform,
          'template_note_mandate_selector',
          true,
          '.add-sub-note-btn',
          callback
        );
      };

      initialisers.note_contact_note = function ($subform) {
        var callback = function ($subform) {
          var $topLevelNoteTypeSelector = $(
            'select.contact_note-note-type',
            $subform
          );
          $topLevelNoteTypeSelector.change(changeNoteTemplate);
          initRemoveActionForSubRecord($subform);
        };

        initNoteType(
          $subform,
          'template_note_contact_note_selector',
          true,
          '.add-sub-note-btn',
          callback
        );
      };

      initialisers.note_legal_status = function ($subform) {
        var callback = function ($subform) {
          var $topLevelNoteTypeSelector = $(
            'select.legal_status-note-type',
            $subform
          );
          $topLevelNoteTypeSelector.change(changeNoteTemplate);
          initRemoveActionForSubRecord($subform);
        };

        initNoteType(
          $subform,
          'template_note_legal_status_selector',
          true,
          '.add-sub-note-btn',
          callback
        );
      };

      initialisers.note_structure_or_genealogy = function ($subform) {
        var callback = function ($subform) {
          var $topLevelNoteTypeSelector = $(
            'select.structure_or_genealogy-note-type',
            $subform
          );
          $topLevelNoteTypeSelector.change(changeNoteTemplate);
          initRemoveActionForSubRecord($subform);
        };

        initNoteType(
          $subform,
          'template_note_structure_or_genealogy_selector',
          true,
          '.add-sub-note-btn',
          callback
        );
      };

      var initCollapsible = function ($noteform) {
        if (!$.contains(document, $noteform[0])) {
          return;
        }

        var truncate_note_content = function (content_inputs) {
          if (content_inputs.length === 0) {
            return '&hellip;';
          }

          var text = $(content_inputs.get(0)).val();
          if (text.length <= 200) {
            return text + (content_inputs.length > 1 ? '<br/>&hellip;' : '');
          }

          return (
            $.trim(text).substring(0, 200).split(' ').slice(0, -1).join(' ') +
            '&hellip;'
          );
        };

        var generateNoteSummary = function () {
          var note_data = {
            type: $('#' + id_path + '_type_ :selected', $noteform).text(),
            label: $('#' + id_path + '_label_', $noteform).val(),
            jsonmodel_type: $(
              '> .subrecord-form-heading:first',
              $noteform
            ).text(),
            summary: truncate_note_content(
              $(":input[id*='_content_']", $noteform)
            ),
          };
          return AS.renderTemplate('template_note_summary', note_data);
        };

        var id_path_template = $noteform
          .closest('.subrecord-form-list')
          .data('id-path');
        var note_index = $noteform.closest('li').data('index');
        var id_path = AS.quickTemplate(id_path_template, { index: note_index });

        AS.initSubRecordCollapsible($noteform, generateNoteSummary);
      };

      var initNoteForm = function ($noteform, for_a_new_form) {
        if ($noteform.hasClass('initialised')) {
          return;
        }
        $noteform.addClass('initialised');

        if (!for_a_new_form) initRemoveActionForSubRecord($noteform);

        dropdownFocusFix($noteform);

        var $list = $('ul.subrecord-form-list:first', $noteform);

        AS.initSubRecordSorting($list);

        var note_type = $noteform.data('type');
        if (initialisers[note_type]) {
          initialisers[note_type]($noteform);
        }

        initContentList($noteform);
        initCollapsible($noteform);
      };

      var changeNoteTemplate = function () {
        var $subform = $(this).parents('[data-index]:first');

        var $noteFormContainer = $('.selected-container', $subform);

        var $parent_subrecord_list = $subform.parents(
          '.subrecord-form-list:first'
        );

        if ($(this).val() === '') {
          $noteFormContainer.html(AS.renderTemplate('template_note_type_nil'));
          return;
        }

        var $note_form = $(
          AS.renderTemplate('template_' + $(this).val(), {
            path: AS.quickTemplate($parent_subrecord_list.data('name-path'), {
              index: $subform.data('index'),
            }),
            id_path: AS.quickTemplate($parent_subrecord_list.data('id-path'), {
              index: $subform.data('index'),
            }),
            index: '${index}',
          })
        );

        $note_form.data('type');
        $note_form.attr('data-index', $subform.data('index'));

        var matchingNoteType = $(
          ".note-type option:contains('" +
            $(':selected', this).text().replace(/'/g, "\\'") +
            "')",
          $note_form
        );
        $('.note-type', $note_form).val(matchingNoteType.val());

        initNoteForm($note_form, true);

        $noteFormContainer.html($note_form);

        $(':input:visible:first', $note_form).focus();

        $subform.parents('form:first').triggerHandler('formchanged.aspace');
        $(document).triggerHandler('subrecordcreated.aspace', [
          'note',
          $note_form,
        ]);
      };

      var applyNoteOrder = function (event) {
        event.preventDefault();
        event.stopPropagation();

        var $target_subrecord_list = $('.subrecord-form-list:first', $this);

        $.ajax({
          url: AS.app_prefix('notes/note_order'),
          type: 'GET',
          success: function (note_order) {
            var $listed = $target_subrecord_list.children().detach();

            var sorted = $listed.toArray().sort(function (li0, li1) {
              var type0 = getType(li0);
              var type1 = getType(li1);
              var noteOrder0 = note_order.indexOf(type0);
              var noteOrder1 = note_order.indexOf(type1);

              return noteOrder0 - noteOrder1;

              function getType(li) {
                var type = $('select.note-type', $(li)).val();

                if (type === undefined) {
                  if ($('select.top-level-note-type', $(li)).length) {
                    type = $('select.top-level-note-type', $(li))
                      .val()
                      .replace(/^note_/, '');
                  } else {
                    type = $('.subrecord-form-fields', $(li))
                      .data('type')
                      .replace(/^note_/, '');
                  }
                }

                return type;
              }
            });

            var oldOrder = $listed.toArray().map(function (li) {
              return $(li).data('index');
            });

            var newOrder = sorted.map(function (li) {
              return $(li).data('index');
            });

            var ordersAreEqual = oldOrder.join() === newOrder.join();

            if (!ordersAreEqual) {
              $('form.aspace-record-form').triggerHandler('formchanged.aspace');
            }

            $(sorted).appendTo($target_subrecord_list);
          },
          error: function (obj, errorText, errorDesc) {
            $container.html(
              "<div class='alert alert-error'><p>An error occurred loading note order list.</p><pre>" +
                errorDesc +
                '</pre></div>'
            );
          },
        });
      };

      var createTopLevelNote = function (event) {
        event.preventDefault();
        event.stopPropagation();

        var $target_subrecord_list = $('.subrecord-form-list:first', $this);
        var add_data_index = nextDataIndex($target_subrecord_list);

        var selector_template = 'template_note_type_selector';
        var is_inline = $this.hasClass('note-inline');
        // if it's inline, we need to bring a special template, since the
        // template has already been defined for the parent record....
        if (is_inline == true) {
          var form_note_type = $this.get(0).id;
          selector_template =
            'template_' + form_note_type + '_note_type_selector_inline';
        } else if ($target_subrecord_list.closest('section').data('template')) {
          selector_template = $target_subrecord_list
            .closest('section')
            .data('template');
        }

        var $subform = $(AS.renderTemplate(selector_template));

        $subform = $('<li>')
          .data('type', $subform.data('type'))
          .append($subform);
        $subform.attr('data-index', add_data_index);

        $target_subrecord_list.append($subform);

        AS.initSubRecordSorting($target_subrecord_list);

        if ($target_subrecord_list.children('li').length > 1) {
          $(
            '.subrecord-form-heading:first .btn.apply-note-order',
            $this
          ).removeAttr('disabled');
        }

        $(document).triggerHandler('subrecordcreated.aspace', [
          'note',
          $subform,
        ]);

        $(':input:visible:first', $subform).focus();

        $this.parents('form:first').triggerHandler('formchanged.aspace');

        initRemoveActionForSubRecord($subform);

        var $topLevelNoteTypeSelector = $(
          'select.top-level-note-type',
          $subform
        );
        var $topLevelNoteTypeSelectorOptionCount = $(
          'select.top-level-note-type option',
          $subform
        ).length;
        $topLevelNoteTypeSelector.change(changeNoteTemplate);
        $topLevelNoteTypeSelector.triggerHandler('change');

        // if top level note selector only has one item, then select it automatically.
        // note: the value in this if statement is 2 because this selector will have a blank first option.
        if ($topLevelNoteTypeSelectorOptionCount == 2) {
          $topLevelNoteTypeSelector
            .find('option:nth-child(2)')
            .prop('selected', true)
            .trigger('change');
        }
      };

      $('.subrecord-form-heading:first .btn.add-note', $this).click(
        createTopLevelNote
      );
      $this.filter('#lang_material_notes').each(function () {
        if ($('li', $this).length == 0) {
          $(
            '.subrecord-form-heading:first .btn.add-note',
            $this
          ).triggerHandler('click');
        }
      });

      $('.subrecord-form-heading:first .btn.apply-note-order', $this).click(
        applyNoteOrder
      );

      var $target_subrecord_list = $('.subrecord-form-list:first', $this);

      if ($target_subrecord_list.children('li').length > 1) {
        $(
          '.subrecord-form-heading:first .btn.apply-note-order',
          $this
        ).removeAttr('disabled');
      }

      var initRemoveActions = function () {
        $('.subrecord-form-inline', $this).each(function () {
          initRemoveActionForSubRecord($(this));
        });
      };

      var initNoteForms = function ($noteForm) {
        // initialising forms
        var $list = $('ul.subrecord-form-list:first', $this);
        AS.initSubRecordSorting($list);
        AS.initAddAsYouGoActions($this, $list);
        $(
          ".subrecord-form-list > .subrecord-form-wrapper:visible > .subrecord-form-fields:not('.initialised')",
          $noteForm
        ).each(function () {
          initNoteForm($(this), false);
        });
        initRemoveActions();
      };

      $existingNotes = $(
        '.subrecord-form-list:first > .subrecord-form-wrapper',
        $this
      );
      tooManyNotes = AS.initTooManySubRecords(
        $this,
        $existingNotes.length,
        function (callback) {
          initNoteForms($this);
          if (callback) {
            callback();
          }
        }
      );

      if (tooManyNotes === false) {
        $this.addClass('initialised');
        initNoteForms($this);
      }
    });
  };

  $(document).ready(function () {
    $(document).bind('loadedrecordform.aspace', function (event, $container) {
      $(
        'section.notes-form.subrecord-form:not(.initialised)',
        $container
      ).init_notes_form();
    });

    $(document).bind(
      'subrecordcreated.aspace',
      function (event, type, $subform) {
        $(
          'section.notes-form.subrecord-form:not(.initialised)',
          $subform
        ).init_notes_form();
      }
    );

    // $("section.notes-form.subrecord-form:not(.initialised)").init_notes_form();
  });
});





$(function () {
  $.fn.init_subrecord_form = function () {
    $(this).each(function () {
      var $this = $(this);

      if (
        ($this.hasClass('initialised') && $this.is(':visible')) ||
        $this.hasClass('too-many')
      ) {
        return;
      }

      $this.data(
        'form_index',
        $('> .subrecord-form-container .subrecord-form-fields', $this).length
      );

      var init = function (callback) {
        // Proxy the event onto the subrecord's form
        // This is used by utils.js to initialise the asYouGo
        // behaviour (quick addition of subrecords)
        $(document).on(
          'subrecordcreated.aspace',
          function (e, object_name, formel) {
            formel.triggerHandler(e);
          }
        );
        $(document).on('showall.aspace', function (e, object_name, formel) {
          formel.triggerHandler(e);
        });

        var init_subform = function () {
          var $subform = $(this);

          if ($subform.hasClass('initialised')) {
            return;
          }
          $subform.addClass('initialised');

          var addRemoveButton = function () {
            var removeBtn = $(
              "<a href='javascript:void(0)' class='btn btn-default btn-xs pull-right subrecord-form-remove' title='Remove sub-record' aria-label='Remove sub-record'><span class='glyphicon glyphicon-remove'></span></a>"
            );
            $subform.prepend(removeBtn);
            removeBtn.on('click', function () {
              AS.confirmSubFormDelete($(this), function () {
                $subform.remove();
                // if cardinality is zero_to_one, disabled the button if there's already an entry
                if ($this.data('cardinality') === 'zero_to_one') {
                  $('> .subrecord-form-heading > .btn', $this).removeAttr(
                    'disabled'
                  );
                }
                $this
                  .parents('form:first')
                  .triggerHandler('formchanged.aspace');
                $(document).triggerHandler('subrecorddeleted.aspace', [$this]);
              });
              return false;
            });
          };

          if (
            $subform.closest('.subrecord-form').data('remove') != 'disabled'
          ) {
            addRemoveButton();
          }

          AS.initSubRecordSorting($('ul.subrecord-form-list', $subform));

          // if cardinality is zero_to_one, disabled the button if there's already an entry
          if ($this.data('cardinality') === 'zero_to_one') {
            $('> .subrecord-form-heading > .btn', $this).attr(
              'disabled',
              'disabled'
            );
          }

          $(document).triggerHandler('subrecordcreated.aspace', [
            $subform.data('object-name') || $this.data('object-name'),
            $subform,
          ]);
        };

        var addAndInitForm = function (formHtml, $target_subrecord_list) {
          var formEl = $('<li>').append(formHtml);
          formEl.attr('data-index', $this.data('form_index'));
          formEl.hide();

          $target_subrecord_list.append(formEl);

          formEl.fadeIn();

          // re-init the sortable behaviour
          AS.initSubRecordSorting($target_subrecord_list);

          $this.parents('form:first').triggerHandler('formchanged.aspace');

          $.proxy(init_subform, formEl)();

          //init any sub sub record forms (treat note sub forms special, because they are)
          $(
            '.subrecord-form.notes-form:not(.initialised)',
            formEl
          ).init_notes_form();
          $('.subrecord-form:not(.initialised)', formEl).init_subrecord_form();

          $(':input:visible:first', formEl).focus();

          $this.data('form_index', $this.data('form_index') + 1);
        };

        // add binding for creation of subforms
        if ($this.data('custom-action')) {
          // Support custom actions - just buttons really with some data attributes
          $($this).on(
            'click',
            '> .subrecord-form-heading > .custom-action .btn:not(.show-all)',
            function (event) {
              event.preventDefault();

              var $target_subrecord_list = $(
                '.subrecord-form-list:first',
                $(this).parents('.subrecord-form:first')
              );

              var index_data = {
                path: AS.quickTemplate(
                  $target_subrecord_list.data('name-path'),
                  { index: $this.data('form_index') }
                ),
                id_path: AS.quickTemplate(
                  $target_subrecord_list.data('id-path'),
                  { index: $this.data('form_index') }
                ),
                index: '${index}',
              };

              $(document).triggerHandler('subrecordcreaterequest.aspace', [
                $this.data('object-name'),
                $(this).data(),
                index_data,
                $target_subrecord_list,
                addAndInitForm,
              ]);
            }
          );
          callback();
        } else {
          $($this).on(
            'click',
            '> .subrecord-form-heading > .btn:not(.show-all)',
            function (event) {
              event.preventDefault();

              var $target_subrecord_list = $(
                '.subrecord-form-list:first',
                $(this).parents('.subrecord-form:first')
              );

              var index_data = {
                path: AS.quickTemplate(
                  $target_subrecord_list.data('name-path'),
                  { index: $this.data('form_index') }
                ),
                id_path: AS.quickTemplate(
                  $target_subrecord_list.data('id-path'),
                  { index: $this.data('form_index') }
                ),
                index: '${index}',
              };

              var formEl = $(
                AS.renderTemplate($this.data('template'), index_data)
              );
              addAndInitForm(formEl, $target_subrecord_list);
            }
          );
          callback();
        }

        var $list = $('ul.subrecord-form-list:first', $this);

        AS.initAddAsYouGoActions($this, $list);
        AS.initSubRecordSorting($list);

        $(
          '> .subrecord-form-container > .subrecord-form-list > .subrecord-form-wrapper:not(.initialised):visible',
          $this
        ).each(init_subform);
      };

      var numberOfSubRecords = function () {
        return $('.subrecord-form-list:first > li', $this).length;
      };

      tooManyRecords = AS.initTooManySubRecords(
        $this,
        numberOfSubRecords(),
        init
      );

      if (tooManyRecords === false) {
        $this.addClass('initialised');
        init(function () {
          $(document).trigger('loadedrecordsubforms.aspace', $this);
        });
      }
    });
  };

  $(document).ready(function () {
    $(document).bind('loadedrecordform.aspace', function (event, $container) {
      $(
        '#basic_information:not(.initialised)',
        $container
      ).init_subrecord_form();
      // now go through all the subrecord-form
      $(
        '.subrecord-form[data-subrecord-form]:not(.initialised)',
        $container
      ).init_subrecord_form();
    });

    // this just makes sure we're initalizing the subforms.
    $(
      '.subrecord-form[data-subrecord-form]:not(.initialised)'
    ).init_subrecord_form();

    $(document).on('subrecordmonkeypatch.aspace', function (event, subform) {
      $('.subrecord-form[data-subrecord-form]', subform).init_subrecord_form();
    });

    // and let's make sure that we've fired the initalise.
    $oc = $('#object_container:not(.initialised)');
    if ($oc.length) {
      $(document).triggerHandler('loadedrecordform.aspace', [$oc]);
    }
  });
});
$(function () {
  var initDateForm = function (subform) {
    $("[name$='[date_type]']", subform).change(function (event) {
      var type = $(this).val();

      var values = {};

      if ($('.date-type-subform', subform).length) {
        values = $('.date-type-subform', subform).serializeObject();
        $('.date-type-subform', subform).remove();
      }

      if (type === '') {
        $(this)
          .parents('.form-group:first')
          .after(AS.renderTemplate('template_date_type_nil'));
        return;
      }

      var index = $(this).parents('[data-index]:first').data('index');

      var template_data = {
        path: AS.quickTemplate(
          $(this).parents('[data-name-path]:first').data('name-path'),
          { index: index }
        ),
        id_path: AS.quickTemplate(
          $(this).parents('[data-id-path]:first').data('id-path'),
          { index: index }
        ),
        index: index,
      };

      var $date_type_subform = $(
        AS.renderTemplate('template_date_type_' + type, template_data)
      );

      $(this).parents('.form-group:first').after($date_type_subform);

      $date_type_subform.setValuesFromObject(values);

      $(document).triggerHandler('subrecordcreated.aspace', [
        'date_type',
        $date_type_subform,
      ]);
    });
  };

  $(document).bind(
    'subrecordcreated.aspace',
    function (event, object_name, subform) {
      if (
        object_name === 'date' ||
        object_name === 'dates_of_existence' ||
        object_name == 'use_date'
      ) {
        initDateForm($(subform));
      }
    }
  );
});




$(function () {
  $.fn.init_related_agents_form = function () {
    $(this).each(function () {
      var $this = $(this);
      $('.linker', $this).linker();
      if ($this.hasClass('initialised') || $this.hasClass('too-many')) {
        return;
      }

      $this.addClass('initialised');

      $('ul.subrecord-form-list > li', $this).show();
      $('.linker', $this).triggerHandler('formshowall.aspace');

      var index = $('.subrecord-form-fields', $this).length;

      var changeRelatedAgentForm = function (event) {
        var $target_subrecord_list = $('.subrecord-form-list:first', $this);

        var template = 'template_' + $(this).val();

        var $subsubform = $(
          AS.renderTemplate(template, {
            path: AS.quickTemplate($target_subrecord_list.data('name-path'), {
              index: index,
            }),
            id_path: AS.quickTemplate($target_subrecord_list.data('id-path'), {
              index: index,
            }),
            index: '${index}',
          })
        );

        $(
          '.selected-container',
          $(this).closest('.subrecord-form-fields')
        ).html($subsubform);

        $(document).triggerHandler('subrecordcreated.aspace', [
          'related_agent',
          $subsubform,
        ]);
        $(document).triggerHandler('subrecordmonkeypatch.aspace', [
          $subsubform,
        ]);

        index++;
      };

      var initRemoveActionForSubRecord = function ($subform) {
        var removeBtn = $(
          "<a href='javascript:void(0)' class='btn btn-default btn-xs pull-right subrecord-form-remove' title='Remove sub-record' aria-label='Remove sub-record'><span class='glyphicon glyphicon-remove'></span></a>"
        );
        $subform.prepend(removeBtn);
        removeBtn.on('click', function () {
          AS.confirmSubFormDelete($(this), function () {
            if ($subform.parent().hasClass('subrecord-form-wrapper')) {
              $subform.parent().remove();
            } else {
              $subform.remove();
            }

            $this.parents('form:first').triggerHandler('formchanged.aspace');
            $(document).triggerHandler('subrecorddeleted.aspace', [$this]);
          });
        });
      };

      var addRelatedAgentSelector = function (event) {
        event.preventDefault();
        event.stopPropagation();

        var $target_subrecord_list = $('.subrecord-form-list:first', $this);
        var selected = $('option:selected', $(this).parents('.dropdown-menu'));
        var template = 'template_' + selected.val();

        var $subsubform = $(
          AS.renderTemplate('template_related_agents_selector', {
            path: AS.quickTemplate($target_subrecord_list.data('name-path'), {
              index: index,
            }),
            id_path: AS.quickTemplate($target_subrecord_list.data('id-path'), {
              index: index,
            }),
            index: '${index}',
          })
        );

        $subsubform = $('<li>')
          .data('type', $subsubform.data('type'))
          .append($subsubform);
        $subsubform.attr('data-index', index);
        $subsubform.show();
        $target_subrecord_list.append($subsubform);

        initRemoveActionForSubRecord($subsubform);

        $(document).triggerHandler('subrecordcreated.aspace', [
          'related_agent',
          $subsubform,
        ]);
        $(document).triggerHandler('subrecordmonkeypatch.aspace', [
          $subsubform,
        ]);

        $('select.related-agent-type', $subsubform).change(
          changeRelatedAgentForm
        );

        AS.initSubRecordSorting($target_subrecord_list);

        $(':input:visible:first', $subsubform).focus();

        index++;
      };

      $('.add-related-agent-for-type-btn', $this).click(
        addRelatedAgentSelector
      );

      var $list = $('#related-agents-container > .subrecord-form-list');

      var $subrecord_form_fields = $(
        '> .subrecord-form-wrapper > .subrecord-form-fields',
        $list
      );
      if ($subrecord_form_fields.length > 0) {
        $subrecord_form_fields.each(function () {
          initRemoveActionForSubRecord($(this));
        });
      }

      $existingAgents = $(
        '.subrecord-form-list:first > .subrecord-form-wrapper',
        $this
      );
      tooManyAgents = AS.initTooManySubRecords(
        $this,
        $existingAgents.length,
        function (callback) {
          AS.initSubRecordSorting($list);
          AS.initAddAsYouGoActions($this, $list);

          if (callback) {
            callback();
          }
        }
      );

      if (tooManyAgents === false) {
        $this.addClass('initialised');
        AS.initSubRecordSorting($list);
        AS.initAddAsYouGoActions($this, $list);
      }
    });
  };

  $(document).ready(function () {
    $(document).bind('loadedrecordform.aspace', function (event, $container) {
      $(
        'section.related-agents-form.subrecord-form:not(.initialised)',
        $container
      ).init_related_agents_form();
    });
  });
});
$(function () {
  var init_rights_statements_form = function (subform) {
    // add binding for rights type select
    $("[name$='[rights_type]']", subform).change(function (event) {
      var type = $(this).val();

      var values = {};

      if ($('.rights-type-subform', subform).length) {
        values = $('.rights-type-subform', subform).serializeObject();
        $('.rights-type-subform', subform).remove();
      }

      if (type === '') {
        $(this)
          .parents('.form-group:first')
          .after(AS.renderTemplate('template_rights_type_nil'));
        return;
      }

      var index = $(this).parents('[data-index]:first').data('index');

      var template_data = {
        path: AS.quickTemplate(
          $(this).parents('[data-name-path]:first').data('name-path'),
          { index: index }
        ),
        id_path: AS.quickTemplate(
          $(this).parents('[data-id-path]:first').data('id-path'),
          { index: index }
        ),
        index: index,
      };

      var $rights_type_subform = $(
        AS.renderTemplate('template_rights_type_' + type, template_data)
      );

      $(this).parents('.form-group:first').after($rights_type_subform);

      $rights_type_subform.setValuesFromObject(values);

      $(document).triggerHandler('subrecordcreated.aspace', [
        'rights_type',
        $rights_type_subform,
      ]);
    });
  };

  $(document).bind(
    'subrecordcreated.aspace',
    function (event, object_name, subform) {
      if (object_name === 'rights_statement') {
        init_rights_statements_form($(subform));
      }
    }
  );
});
$(function () {

  var init = function () {

    $("#merge-dropdown .linker:not(.initialised)").linker();

    $('.merge-form .btn-cancel').on('click', function () {
      $('.merge-action').trigger("click");
    });

    // Override the default bootstrap dropdown behaviour here to
    // ensure that this modal stays open even when another modal is
    // opened within it.
    $(".merge-action").on("click", function(event) {
      event.preventDefault();
      event.stopImmediatePropagation();

      if ($(this).attr('disabled')) {
        return;
      }

      if ($(".merge-form")[0].style.display === "block") {
        // Hide it
        $(".merge-form").css("display", "");
        $(this).attr('aria-expanded', 'false');
      } else {
        // Show it
        $(".merge-form").css("display", "block");
        $(this).attr('aria-expanded', 'true');
      }
    });

    // Stop the modal from being hidden by clicks within the form
    $(".merge-form").on("click", function(event) {
      event.stopPropagation();
    });


    $(".merge-form .linker-wrapper .dropdown-toggle").on("click", function(event) {
      event.stopPropagation();
      $(this).parent().toggleClass("open");


      if($(this).parent().hasClass("open")) {
        $(this).attr('aria-expanded', true);
      } 
      else {
        $(this).attr('aria-expanded', false);
      }
    });


    $(".merge-form .merge-button").on("click", function(event) {
      var formvals = $(".merge-form").serializeObject();

      if ( formvals["merge[ref]"] && !formvals["merge[ref][]"] ) {
        formvals["merge[ref][]"] = formvals["merge[ref]"];
      }

      if (!formvals["merge[ref][]"]) {
        $(".missing-ref-message", ".merge-form").show();
        event.preventDefault();
        event.stopImmediatePropagation();
        return false;
      } else {
        $(".missing-ref-message", ".merge-form").hide();
        $(this).data("form-data", {"refs": formvals["merge[ref][]"]});
      }
    });
  };


  if ($('.merge-form').length > 0) {
    init();
  } else {
    $(document).bind("loadedrecordform.aspace", init);
  }

});
$(function () {
  var init = function () {
    $('.add-event-form .btn-close').on('click', function (event) {
      event.stopImmediatePropagation();
      event.preventDefault();
      $('.add-event-action').trigger('click');
    });

    // Override the default bootstrap dropdown behaviour here to
    // ensure that this modal stays open even when another modal is
    // opened within it.
    $('.add-event-action').on('click', function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();

      if ($(this).attr('disabled')) {
        return;
      }

      if ($('.add-event-form')[0].style.display === 'block') {
        // Hide it
        $('.add-event-form').css('display', '');
        $(this).attr('aria-expanded', 'false');
      } else {
        // Show it
        $('.add-event-form').css('display', 'block');
        $(this).attr('aria-expanded', 'true');
      }
    });

    // Stop the modal from being hidden by clicks within the form
    $('.add-event-form').on('click', function (event) {
      event.stopPropagation();
    });

    $('.add-event-form .add-event-button').on('click', function (event) {
      event.stopPropagation();
      event.preventDefault();

      var url = AS.quickTemplate(
        decodeURIComponent($('#add-event-dropdown').data('add-event-url')),
        { event_type: $('#add_event_event_type').val() }
      );
      location.href = url;
    });
  };

  if ($('.add-event-form').length > 0) {
    init();
  } else {
    $(document).bind('loadedrecordform.aspace', init);
  }
});
// toggle slug field when auto-gen is on
var activate_slug_checkbox = function () {
  var textfield = $('div.js-slug_textfield > div > input');
  var checkbox = $('div.js-slug_auto_checkbox > div > input');

  checkbox.click(function () {
    textfield.val('');
    textfield.attr('readonly', function (_, attr) {
      return !attr;
    });
  });
};
// Handle toggle (hide / show fields & sections) for light mode
$(function () {
  $(document).bind('loadedrecordform.aspace', function (event, $container) {
    init();
  });

  var init = function () {
    var lightmodeToggle = $('#lightmode_toggle'); // This is our toggle checkbox
    if (lightmodeToggle && lightmodeToggle.data('type')) {
      var lmKey = getLightModeKey(lightmodeToggle);
      if (localStorage.getItem(lmKey) === null) {
        localStorage.setItem(lmKey, 'false'); // Default if not previously set
      }
      lightmodeToggle.prop('checked', JSON.parse(localStorage.getItem(lmKey)));
      $(document).trigger('lightmode_toggle.aspace', [lightmodeToggle, 0]);
    }
  };

  // For now at least local storage key is based on data type attr
  var getLightModeKey = function (lightmodeToggle) {
    return 'lightmode_toggle.' + lightmodeToggle.data('type');
  };

  $('#lightmode_toggle').on('change', function () {
    $(document).trigger('lightmode_toggle.aspace', [$(this), 500]);
  });

  $(document).bind(
    'lightmode_toggle.aspace',
    function (event, lightmodeToggle, duration) {
      var lmKey = getLightModeKey($(lightmodeToggle));
      if ($(lightmodeToggle).prop('checked') == true) {
        localStorage.setItem(lmKey, 'true');
        $('.lightmode_toggle').hide(duration);
      } else {
        localStorage.setItem(lmKey, 'false');
        $('.lightmode_toggle').show(duration);
      }
    }
  );
});
$(function () {
  function handleRepresentativeChange($subform, isRepresentative) {
    if (isRepresentative) {
      $subform.addClass('is-representative');
    } else {
      $subform.removeClass('is-representative');
    }

    $(':input[name$="[is_representative]"]', $subform).val(
      isRepresentative ? 1 : 0
    );

    $subform.trigger('formchanged.aspace');
  }

  $(document).bind(
    'subrecordcreated.aspace',
    function (event, object_name, subform) {
      // TODO: generalize?
      if (
        object_name === 'file_version' ||
        object_name === 'instance' ||
        object_name == 'agent_contact'
      ) {
        var $subform = $(subform);
        var $section = $subform.closest('section.subrecord-form');
        var isRepresentative =
          $(':input[name$="[is_representative]"]', $subform).val() === '1';
        var local_publish_button = $subform.find('.js-file-version-publish');
        var local_make_rep_button = $subform.find('.is-representative-toggle');

        var eventName =
          'newrepresentative' + object_name.replace(/_/, '') + '.aspace';

        if (local_publish_button.prop('checked') == false) {
          local_make_rep_button.prop('disabled', true);
        } else {
          local_make_rep_button.prop('disabled', false);
        }

        $subform.find('.js-file-version-publish').click(function (e) {
          if (
            $subform.hasClass('is-representative') &&
            $(this).prop('checked', true)
          ) {
            handleRepresentativeChange($subform, false);
            $(this).prop('checked', false);
          }

          if ($(this).prop('checked') == false) {
            local_make_rep_button.prop('disabled', true);
          } else {
            local_make_rep_button.prop('disabled', false);
          }
        });

        $subform.find('.is-representative-toggle').click(function (e) {
          local_publish_button.prop('checked', true);
        });

        if (isRepresentative) {
          $subform.addClass('is-representative');
        }

        $('.is-representative-toggle', $subform).click(function (e) {
          e.preventDefault();

          $section.triggerHandler(eventName, [$subform]);
        });

        $section.on(eventName, function (e, representative_subform) {
          handleRepresentativeChange(
            $subform,
            representative_subform == $subform
          );
        });
      }
    }
  );
});












$(function () {
  var init_id_form = function (subform) {
    // setup agent_record_identifier form
    var $subform = $(subform);
    var $isPrimary = $(':input[name$="[primary_identifier]"]', $subform);
    // var $primarySection = $isPrimary.closest(".subrecord-form-wrapper")
    var $primarySection = $isPrimary.closest('section.subrecord-form');

    var handleIsPrimaryChange = function (val) {
      if (val) {
        $subform.addClass('primary-id');
      } else {
        $subform.removeClass('primary-id');
      }
      $isPrimary.val(val ? 1 : 0);
    };

    $('.btn-primary-id-toggle', $subform).click(function (event) {
      event.preventDefault();

      $primarySection.triggerHandler('isprimarytoggle.aspace', [$subform]);
    });

    $primarySection.on(
      'isprimarytoggle.aspace',
      function (event, primary_id_form) {
        handleIsPrimaryChange(primary_id_form == $subform);
      }
    );

    handleIsPrimaryChange($isPrimary.val() == '1');
  };

  var init_name_form = function (subform) {
    var $subform = $(subform);
    var $checkbox = $(':checkbox[name$="[sort_name_auto_generate]"]', $subform);
    var $sortNameField = $(':input[name$="[sort_name]"]', $subform);

    if (
      typeof $sortNameField !== 'undefined' &&
      typeof $sortNameField[0] !== 'undefined'
    ) {
      var originalSortNameFieldValue = $sortNameField[0].value;
    }

    var disableSortName = function () {
      $sortNameField.attr('readonly', 'readonly');
      $sortNameField.prop('disabled', true);
      $sortNameField.attr('readonly', 'readonly');
      $userEnteredSortNameValue = $sortNameField[0].value;
      $sortNameField[0].value = $checkbox.attr('display_text_when_checked');
    };

    if ($checkbox.is(':checked')) {
      disableSortName();
    }

    $checkbox.change(function () {
      if ($checkbox.is(':checked')) {
        disableSortName();
      } else {
        $sortNameField.prop('disabled', false);
        $sortNameField.removeAttr('readonly');

        if (typeof originalSortNameFieldValue !== 'undefined') {
          $sortNameField[0].value = originalSortNameFieldValue;
        } else {
          $sortNameField[0].value = $userEnteredSortNameValue;
        }
      }
    });

    // setup authoritive/display name actions
    var $authorized = $(':input[name$="[authorized]"]', $subform);
    var $displayName = $(':input[name$="[is_display_name]"]', $subform);
    var $section = $authorized.closest('section.subrecord-form');

    var handleAuthorizedChange = function (val) {
      if (val) {
        $subform.addClass('authoritive-name');
      } else {
        $subform.removeClass('authoritive-name');
      }
      $authorized.val(val ? 1 : 0);
    };
    var handleDisplayNameChange = function (val) {
      if (val) {
        $subform.addClass('display-name');
      } else {
        $subform.removeClass('display-name');
      }
      $displayName.val(val ? 1 : 0);
    };

    $('.btn-authoritive-name-toggle', $subform).click(function (event) {
      event.preventDefault();

      $section.triggerHandler('newauthorizedname.aspace', [$subform]);
    });

    $section.on(
      'newauthorizedname.aspace',
      function (event, authorized_name_form) {
        handleAuthorizedChange(authorized_name_form == $subform);
      }
    );

    $('.btn-display-name-toggle', $subform).click(function (event) {
      event.preventDefault();

      $section.triggerHandler('newdisplayname.aspace', [$subform]);
    });

    $section.on('newdisplayname.aspace', function (event, display_name_form) {
      handleDisplayNameChange(display_name_form == $subform);
    });

    handleAuthorizedChange($authorized.val() == '1');
    handleDisplayNameChange($displayName.val() == '1');
    selectStructuredDateSubform();
  };

  var init_linked_agent = function ($subform) {
    if ($subform.hasClass('linked_agent_initialised')) {
      return;
    } else {
      $subform.addClass('linked_agent_initialised');
    }

    $subform.find('select.linked_agent_role').on('change', function () {
      var form = $subform.find('.agent-terms');
      if ($(this).val() == 'subject') {
        form.find(':input').removeAttr('disabled');
        form.show();
      } else {
        form.find(':input').attr('disabled', 'disabled');
        form.hide();
      }

      var creator_title = $subform.find('.agent-creator-title').show();
      if ($(this).val() == 'creator' || $(this).val() == 'subject') {
        creator_title.show().find(':input').removeAttr('disabled');
      } else {
        creator_title.hide().find(':input').attr('disabled', 'disabled');
      }
    });

    $(document).triggerHandler('subrecordcreated.aspace', [
      'term',
      $('#terms', $subform),
    ]);
  };

  // We need to trigger this event here, since there is not tree.js to do it
  // for us.
  $(document).ready(function () {
    if ($('#form_agent').length) {
      $(document).triggerHandler('loadedrecordform.aspace', [$('#form_agent')]);
      $(document).triggerHandler('loadedrecordsubforms.aspace', [
        $('#form_agent'),
      ]);
      $('#agent_person_dates_of_existence > h3 > button').click(function () {
        selectStructuredDateSubform();
      });
    }
  });

  $(document).bind(
    'subrecordcreated.aspace',
    function (event, object_name, subform) {
      if (object_name === 'name') {
        init_name_form($(subform));
      }

      if (object_name === 'agent_record_identifier') {
        init_id_form($(subform));

        // ANW-429: if this is the first agent identifier subrecord, then make sure it's set as primary
        if (
          $('#agent_person_agent_record_identifier ul').children().length == 1
        ) {
          $('.btn-primary-id-toggle').click();
        }
      }

      if (object_name === 'linked_agent') {
        var $subform = $(subform);
        init_linked_agent($subform);
        $subform.find('select.linked_agent_role').triggerHandler('change');
      }

      if (
        object_name === 'agent_function' ||
        object_name === 'agent_occupation' ||
        object_name === 'agent_place' ||
        object_name === 'agent_topic'
      ) {
        var $subj = $(subform);
        setTimeout(function () {
          if (
            $("section[id*='subjects_'] ul:last li", $subj).children().length ==
            0
          ) {
            $(
              "section[id*='subjects_'] .subrecord-form-heading .btn:last",
              $subj
            ).click();
          }
        }, 300);
      }
    }
  );
});

// Based on the value of the date_type select box, render the right subform template in place. If value is not set to single or range, then add a placeholder div for when a valid type value is selected.
var selectStructuredDateSubform = function () {
  $('.js-structured_date_select').change(function () {
    var date_type = $(this).find('select').val();

    var $this = $(this);
    var $subform = $(this).parents('[data-index]:first');
    var $target_subrecord_list = $($this).parent().find('.sdl-subrecord-form');
    var $parent_subrecord_list = $subform.parents('.subrecord-form-list:first');
    var index = $('.subrecord-form-fields', $this).length + 1;

    var $date_subform;

    if (date_type == 'range') {
      $date_subform = AS.renderTemplate(
        'template_structured_date_range_fields',
        {
          path:
            AS.quickTemplate($parent_subrecord_list.data('name-path'), {
              index: $subform.data('index'),
            }) + '[structured_date_range]',
          id_path:
            AS.quickTemplate($parent_subrecord_list.data('id-path'), {
              index: $subform.data('index'),
            }) + '_structured_date_range_',
          index: '${index}',
        }
      );
    } else if (date_type == 'single') {
      $date_subform = AS.renderTemplate(
        'template_structured_date_single_fields',
        {
          path:
            AS.quickTemplate($parent_subrecord_list.data('name-path'), {
              index: $subform.data('index'),
            }) + '[structured_date_single]',
          id_path:
            AS.quickTemplate($parent_subrecord_list.data('id-path'), {
              index: $subform.data('index'),
            }) + '_structured_date_single_',
          index: '${index}',
        }
      );
    } else {
      $date_subform = "<div class='sdl-subrecord-form'></div>";
    }

    $target_subrecord_list.replaceWith($date_subform);
    var $updated_subrecord_list = $($this).parent().find('.sdl-subrecord-form');

    $(document).triggerHandler('subrecordcreated.aspace', [
      'date',
      $updated_subrecord_list,
    ]);
    index++;
  });
};

$(function () {
  var initTermForm = function ($form) {
    if ($form.data('terms') === 'initialised') {
      return;
    }

    $form.data('terms', 'initialised');

    var itemDisplayString = function (item) {
      var term_type = item.term_type;
      if (item['_translated'] && item['_translated']['term_type']) {
        term_type = item['_translated']['term_type'];
      }
      return item.term + ' [' + term_type + ']';
    };

    var termTypeAhead = AS.delayedTypeAhead(function (query, callback) {
      $.ajax({
        url: AS.app_prefix('subjects/terms/complete'),
        data: { query: query },
        type: 'GET',
        success: function (terms) {
          callback(terms);
        },
        error: function () {
          callback([]);
        },
      });
    });

    $(':text', $form).typeahead({
      source: termTypeAhead.handle,
      matcher: function (item) {
        return (
          item.term &&
          itemDisplayString(item)
            .toLowerCase()
            .indexOf(this.query.toLowerCase()) >= 0
        );
      },
      sorter: function (items) {
        return items.sort(function (a, b) {
          return a.term > b.term;
        });
      },
      highlighter: function (item) {
        return $.proxy(
          Object.getPrototypeOf(this).highlighter,
          this
        )(itemDisplayString(item));
      },
      updater: function (item) {
        $('select', this.$element.parents('.row-fluid:first')).val(
          item.term_type
        );
        return item.term;
      },
    });
  };

  $(document).bind(
    'subrecordcreated.aspace',
    function (event, object_name, subform) {
      if (object_name === 'term') {
        initTermForm($(subform));
      }
    }
  );
});






$(function () {
  $.fn.init_subject_form = function () {
    $(this).each(function () {
      var $this = $(this);

      if ($this.hasClass('initialised')) {
        return;
      }

      $this.addClass('initialised');

      // initialise the term form
      $(document).triggerHandler('subrecordcreated.aspace', [
        'term',
        $('#terms', $this),
      ]);
    });
  };

  $(document).ready(function () {
    $(document).bind('loadedrecordform.aspace', function (event, $container) {
      $('#new_subject:not(.initialised)', $container).init_subject_form();
    });

    $('#new_subject:not(.initialised)').init_subject_form();
  });
});

(function($){$.extend({tablesorter:new
function(){var parsers=[],widgets=[];this.defaults={cssHeader:"header",cssAsc:"headerSortUp",cssDesc:"headerSortDown",cssChildRow:"expand-child",sortInitialOrder:"asc",sortMultiSortKey:"shiftKey",sortForce:null,sortAppend:null,sortLocaleCompare:true,textExtraction:"simple",parsers:{},widgets:[],widgetZebra:{css:["even","odd"]},headers:{},widthFixed:false,cancelSelection:true,sortList:[],headerList:[],dateFormat:"us",decimal:'/\.|\,/g',onRenderHeader:null,selectorHeaders:'thead th',debug:false};function benchmark(s,d){log(s+","+(new Date().getTime()-d.getTime())+"ms");}this.benchmark=benchmark;function log(s){if(typeof console!="undefined"&&typeof console.debug!="undefined"){console.log(s);}else{alert(s);}}function buildParserCache(table,$headers){if(table.config.debug){var parsersDebug="";}if(table.tBodies.length==0)return;var rows=table.tBodies[0].rows;if(rows[0]){var list=[],cells=rows[0].cells,l=cells.length;for(var i=0;i<l;i++){var p=false;if($.metadata&&($($headers[i]).metadata()&&$($headers[i]).metadata().sorter)){p=getParserById($($headers[i]).metadata().sorter);}else if((table.config.headers[i]&&table.config.headers[i].sorter)){p=getParserById(table.config.headers[i].sorter);}if(!p){p=detectParserForColumn(table,rows,-1,i);}if(table.config.debug){parsersDebug+="column:"+i+" parser:"+p.id+"\n";}list.push(p);}}if(table.config.debug){log(parsersDebug);}return list;};function detectParserForColumn(table,rows,rowIndex,cellIndex){var l=parsers.length,node=false,nodeValue=false,keepLooking=true;while(nodeValue==''&&keepLooking){rowIndex++;if(rows[rowIndex]){node=getNodeFromRowAndCellIndex(rows,rowIndex,cellIndex);nodeValue=trimAndGetNodeText(table.config,node);if(table.config.debug){log('Checking if value was empty on row:'+rowIndex);}}else{keepLooking=false;}}for(var i=1;i<l;i++){if(parsers[i].is(nodeValue,table,node)){return parsers[i];}}return parsers[0];}function getNodeFromRowAndCellIndex(rows,rowIndex,cellIndex){return rows[rowIndex].cells[cellIndex];}function trimAndGetNodeText(config,node){return $.trim(getElementText(config,node));}function getParserById(name){var l=parsers.length;for(var i=0;i<l;i++){if(parsers[i].id.toLowerCase()==name.toLowerCase()){return parsers[i];}}return false;}function buildCache(table){if(table.config.debug){var cacheTime=new Date();}var totalRows=(table.tBodies[0]&&table.tBodies[0].rows.length)||0,totalCells=(table.tBodies[0].rows[0]&&table.tBodies[0].rows[0].cells.length)||0,parsers=table.config.parsers,cache={row:[],normalized:[]};for(var i=0;i<totalRows;++i){var c=$(table.tBodies[0].rows[i]),cols=[];if(c.hasClass(table.config.cssChildRow)){cache.row[cache.row.length-1]=cache.row[cache.row.length-1].add(c);continue;}cache.row.push(c);for(var j=0;j<totalCells;++j){cols.push(parsers[j].format(getElementText(table.config,c[0].cells[j]),table,c[0].cells[j]));}cols.push(cache.normalized.length);cache.normalized.push(cols);cols=null;};if(table.config.debug){benchmark("Building cache for "+totalRows+" rows:",cacheTime);}return cache;};function getElementText(config,node){var text="";if(!node)return"";if(!config.supportsTextContent)config.supportsTextContent=node.textContent||false;if(config.textExtraction=="simple"){if(config.supportsTextContent){text=node.textContent;}else{if(node.childNodes[0]&&node.childNodes[0].hasChildNodes()){text=node.childNodes[0].innerHTML;}else{text=node.innerHTML;}}}else{if(typeof(config.textExtraction)=="function"){text=config.textExtraction(node);}else{text=$(node).text();}}return text;}function appendToTable(table,cache){if(table.config.debug){var appendTime=new Date()}var c=cache,r=c.row,n=c.normalized,totalRows=n.length,checkCell=(n[0].length-1),tableBody=$(table.tBodies[0]),rows=[];for(var i=0;i<totalRows;i++){var pos=n[i][checkCell];rows.push(r[pos]);if(!table.config.appender){var l=r[pos].length;for(var j=0;j<l;j++){tableBody[0].appendChild(r[pos][j]);}}}if(table.config.appender){table.config.appender(table,rows);}rows=null;if(table.config.debug){benchmark("Rebuilt table:",appendTime);}applyWidget(table);setTimeout(function(){$(table).trigger("sortEnd");},0);};function buildHeaders(table){if(table.config.debug){var time=new Date();}var meta=($.metadata)?true:false;var header_index=computeTableHeaderCellIndexes(table);$tableHeaders=$(table.config.selectorHeaders,table).each(function(index){this.column=header_index[this.parentNode.rowIndex+"-"+this.cellIndex];this.order=formatSortingOrder(table.config.sortInitialOrder);this.count=this.order;if(checkHeaderMetadata(this)||checkHeaderOptions(table,index))this.sortDisabled=true;if(checkHeaderOptionsSortingLocked(table,index))this.order=this.lockedOrder=checkHeaderOptionsSortingLocked(table,index);if(!this.sortDisabled){var $th=$(this).addClass(table.config.cssHeader);if(table.config.onRenderHeader)table.config.onRenderHeader.apply($th);}table.config.headerList[index]=this;});if(table.config.debug){benchmark("Built headers:",time);log($tableHeaders);}return $tableHeaders;};function computeTableHeaderCellIndexes(t){var matrix=[];var lookup={};var thead=t.getElementsByTagName('THEAD')[0];var trs=thead.getElementsByTagName('TR');for(var i=0;i<trs.length;i++){var cells=trs[i].cells;for(var j=0;j<cells.length;j++){var c=cells[j];var rowIndex=c.parentNode.rowIndex;var cellId=rowIndex+"-"+c.cellIndex;var rowSpan=c.rowSpan||1;var colSpan=c.colSpan||1
var firstAvailCol;if(typeof(matrix[rowIndex])=="undefined"){matrix[rowIndex]=[];}for(var k=0;k<matrix[rowIndex].length+1;k++){if(typeof(matrix[rowIndex][k])=="undefined"){firstAvailCol=k;break;}}lookup[cellId]=firstAvailCol;for(var k=rowIndex;k<rowIndex+rowSpan;k++){if(typeof(matrix[k])=="undefined"){matrix[k]=[];}var matrixrow=matrix[k];for(var l=firstAvailCol;l<firstAvailCol+colSpan;l++){matrixrow[l]="x";}}}}return lookup;}function checkCellColSpan(table,rows,row){var arr=[],r=table.tHead.rows,c=r[row].cells;for(var i=0;i<c.length;i++){var cell=c[i];if(cell.colSpan>1){arr=arr.concat(checkCellColSpan(table,headerArr,row++));}else{if(table.tHead.length==1||(cell.rowSpan>1||!r[row+1])){arr.push(cell);}}}return arr;};function checkHeaderMetadata(cell){if(($.metadata)&&($(cell).metadata().sorter===false)){return true;};return false;}function checkHeaderOptions(table,i){if((table.config.headers[i])&&(table.config.headers[i].sorter===false)){return true;};return false;}function checkHeaderOptionsSortingLocked(table,i){if((table.config.headers[i])&&(table.config.headers[i].lockedOrder))return table.config.headers[i].lockedOrder;return false;}function applyWidget(table){var c=table.config.widgets;var l=c.length;for(var i=0;i<l;i++){getWidgetById(c[i]).format(table);}}function getWidgetById(name){var l=widgets.length;for(var i=0;i<l;i++){if(widgets[i].id.toLowerCase()==name.toLowerCase()){return widgets[i];}}};function formatSortingOrder(v){if(typeof(v)!="Number"){return(v.toLowerCase()=="desc")?1:0;}else{return(v==1)?1:0;}}function isValueInArray(v,a){var l=a.length;for(var i=0;i<l;i++){if(a[i][0]==v){return true;}}return false;}function setHeadersCss(table,$headers,list,css){$headers.removeClass(css[0]).removeClass(css[1]);var h=[];$headers.each(function(offset){if(!this.sortDisabled){h[this.column]=$(this);}});var l=list.length;for(var i=0;i<l;i++){h[list[i][0]].addClass(css[list[i][1]]);}}function fixColumnWidth(table,$headers){var c=table.config;if(c.widthFixed){var colgroup=$('<colgroup>');$("tr:first td",table.tBodies[0]).each(function(){colgroup.append($('<col>').css('width',$(this).width()));});$(table).prepend(colgroup);};}function updateHeaderSortCount(table,sortList){var c=table.config,l=sortList.length;for(var i=0;i<l;i++){var s=sortList[i],o=c.headerList[s[0]];o.count=s[1];o.count++;}}function multisort(table,sortList,cache){if(table.config.debug){var sortTime=new Date();}var dynamicExp="var sortWrapper = function(a,b) {",l=sortList.length;for(var i=0;i<l;i++){var c=sortList[i][0];var order=sortList[i][1];var s=(table.config.parsers[c].type=="text")?((order==0)?makeSortFunction("text","asc",c):makeSortFunction("text","desc",c)):((order==0)?makeSortFunction("numeric","asc",c):makeSortFunction("numeric","desc",c));var e="e"+i;dynamicExp+="var "+e+" = "+s;dynamicExp+="if("+e+") { return "+e+"; } ";dynamicExp+="else { ";}var orgOrderCol=cache.normalized[0].length-1;dynamicExp+="return a["+orgOrderCol+"]-b["+orgOrderCol+"];";for(var i=0;i<l;i++){dynamicExp+="}; ";}dynamicExp+="return 0; ";dynamicExp+="}; ";if(table.config.debug){benchmark("Evaling expression:"+dynamicExp,new Date());}eval(dynamicExp);cache.normalized.sort(sortWrapper);if(table.config.debug){benchmark("Sorting on "+sortList.toString()+" and dir "+order+" time:",sortTime);}return cache;};function makeSortFunction(type,direction,index){var a="a["+index+"]",b="b["+index+"]";if(type=='text'&&direction=='asc'){return"("+a+" == "+b+" ? 0 : ("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : ("+a+" < "+b+") ? -1 : 1 )));";}else if(type=='text'&&direction=='desc'){return"("+a+" == "+b+" ? 0 : ("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : ("+b+" < "+a+") ? -1 : 1 )));";}else if(type=='numeric'&&direction=='asc'){return"("+a+" === null && "+b+" === null) ? 0 :("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : "+a+" - "+b+"));";}else if(type=='numeric'&&direction=='desc'){return"("+a+" === null && "+b+" === null) ? 0 :("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : "+b+" - "+a+"));";}};function makeSortText(i){return"((a["+i+"] < b["+i+"]) ? -1 : ((a["+i+"] > b["+i+"]) ? 1 : 0));";};function makeSortTextDesc(i){return"((b["+i+"] < a["+i+"]) ? -1 : ((b["+i+"] > a["+i+"]) ? 1 : 0));";};function makeSortNumeric(i){return"a["+i+"]-b["+i+"];";};function makeSortNumericDesc(i){return"b["+i+"]-a["+i+"];";};function sortText(a,b){if(table.config.sortLocaleCompare)return a.localeCompare(b);return((a<b)?-1:((a>b)?1:0));};function sortTextDesc(a,b){if(table.config.sortLocaleCompare)return b.localeCompare(a);return((b<a)?-1:((b>a)?1:0));};function sortNumeric(a,b){return a-b;};function sortNumericDesc(a,b){return b-a;};function getCachedSortType(parsers,i){return parsers[i].type;};this.construct=function(settings){return this.each(function(){if(!this.tHead||!this.tBodies)return;var $this,$document,$headers,cache,config,shiftDown=0,sortOrder;this.config={};config=$.extend(this.config,$.tablesorter.defaults,settings);$this=$(this);$.data(this,"tablesorter",config);$headers=buildHeaders(this);this.config.parsers=buildParserCache(this,$headers);cache=buildCache(this);var sortCSS=[config.cssDesc,config.cssAsc];fixColumnWidth(this);$headers.click(function(e){var totalRows=($this[0].tBodies[0]&&$this[0].tBodies[0].rows.length)||0;if(!this.sortDisabled&&totalRows>0){$this.trigger("sortStart");var $cell=$(this);var i=this.column;this.order=this.count++%2;if(this.lockedOrder)this.order=this.lockedOrder;if(!e[config.sortMultiSortKey]){config.sortList=[];if(config.sortForce!=null){var a=config.sortForce;for(var j=0;j<a.length;j++){if(a[j][0]!=i){config.sortList.push(a[j]);}}}config.sortList.push([i,this.order]);}else{if(isValueInArray(i,config.sortList)){for(var j=0;j<config.sortList.length;j++){var s=config.sortList[j],o=config.headerList[s[0]];if(s[0]==i){o.count=s[1];o.count++;s[1]=o.count%2;}}}else{config.sortList.push([i,this.order]);}};setTimeout(function(){setHeadersCss($this[0],$headers,config.sortList,sortCSS);appendToTable($this[0],multisort($this[0],config.sortList,cache));},1);return false;}}).mousedown(function(){if(config.cancelSelection){this.onselectstart=function(){return false};return false;}});$this.bind("update",function(){var me=this;setTimeout(function(){me.config.parsers=buildParserCache(me,$headers);cache=buildCache(me);},1);}).bind("updateCell",function(e,cell){var config=this.config;var pos=[(cell.parentNode.rowIndex-1),cell.cellIndex];cache.normalized[pos[0]][pos[1]]=config.parsers[pos[1]].format(getElementText(config,cell),cell);}).bind("sorton",function(e,list){$(this).trigger("sortStart");config.sortList=list;var sortList=config.sortList;updateHeaderSortCount(this,sortList);setHeadersCss(this,$headers,sortList,sortCSS);appendToTable(this,multisort(this,sortList,cache));}).bind("appendCache",function(){appendToTable(this,cache);}).bind("applyWidgetId",function(e,id){getWidgetById(id).format(this);}).bind("applyWidgets",function(){applyWidget(this);});if($.metadata&&($(this).metadata()&&$(this).metadata().sortlist)){config.sortList=$(this).metadata().sortlist;}if(config.sortList.length>0){$this.trigger("sorton",[config.sortList]);}applyWidget(this);});};this.addParser=function(parser){var l=parsers.length,a=true;for(var i=0;i<l;i++){if(parsers[i].id.toLowerCase()==parser.id.toLowerCase()){a=false;}}if(a){parsers.push(parser);};};this.addWidget=function(widget){widgets.push(widget);};this.formatFloat=function(s){var i=parseFloat(s);return(isNaN(i))?0:i;};this.formatInt=function(s){var i=parseInt(s);return(isNaN(i))?0:i;};this.isDigit=function(s,config){return/^[-+]?\d*$/.test($.trim(s.replace(/[,.']/g,'')));};this.clearTableBody=function(table){if($.browser.msie){function empty(){while(this.firstChild)this.removeChild(this.firstChild);}empty.apply(table.tBodies[0]);}else{table.tBodies[0].innerHTML="";}};}});$.fn.extend({tablesorter:$.tablesorter.construct});var ts=$.tablesorter;ts.addParser({id:"text",is:function(s){return true;},format:function(s){return $.trim(s.toLocaleLowerCase());},type:"text"});ts.addParser({id:"digit",is:function(s,table){var c=table.config;return $.tablesorter.isDigit(s,c);},format:function(s){return $.tablesorter.formatFloat(s);},type:"numeric"});ts.addParser({id:"currency",is:function(s){return/^[£$€?.]/.test(s);},format:function(s){return $.tablesorter.formatFloat(s.replace(new RegExp(/[£$€]/g),""));},type:"numeric"});ts.addParser({id:"ipAddress",is:function(s){return/^\d{2,3}[\.]\d{2,3}[\.]\d{2,3}[\.]\d{2,3}$/.test(s);},format:function(s){var a=s.split("."),r="",l=a.length;for(var i=0;i<l;i++){var item=a[i];if(item.length==2){r+="0"+item;}else{r+=item;}}return $.tablesorter.formatFloat(r);},type:"numeric"});ts.addParser({id:"url",is:function(s){return/^(https?|ftp|file):\/\/$/.test(s);},format:function(s){return jQuery.trim(s.replace(new RegExp(/(https?|ftp|file):\/\//),''));},type:"text"});ts.addParser({id:"isoDate",is:function(s){return/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(s);},format:function(s){return $.tablesorter.formatFloat((s!="")?new Date(s.replace(new RegExp(/-/g),"/")).getTime():"0");},type:"numeric"});ts.addParser({id:"percent",is:function(s){return/\%$/.test($.trim(s));},format:function(s){return $.tablesorter.formatFloat(s.replace(new RegExp(/%/g),""));},type:"numeric"});ts.addParser({id:"usLongDate",is:function(s){return s.match(new RegExp(/^[A-Za-z]{3,10}\.? [0-9]{1,2}, ([0-9]{4}|'?[0-9]{2}) (([0-2]?[0-9]:[0-5][0-9])|([0-1]?[0-9]:[0-5][0-9]\s(AM|PM)))$/));},format:function(s){return $.tablesorter.formatFloat(new Date(s).getTime());},type:"numeric"});ts.addParser({id:"shortDate",is:function(s){return/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(s);},format:function(s,table){var c=table.config;s=s.replace(/\-/g,"/");if(c.dateFormat=="us"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,"$3/$1/$2");}else if (c.dateFormat == "pt") {s = s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/, "$3/$2/$1");} else if(c.dateFormat=="uk"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,"$3/$2/$1");}else if(c.dateFormat=="dd/mm/yy"||c.dateFormat=="dd-mm-yy"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/,"$1/$2/$3");}return $.tablesorter.formatFloat(new Date(s).getTime());},type:"numeric"});ts.addParser({id:"time",is:function(s){return/^(([0-2]?[0-9]:[0-5][0-9])|([0-1]?[0-9]:[0-5][0-9]\s(am|pm)))$/.test(s);},format:function(s){return $.tablesorter.formatFloat(new Date("2000/01/01 "+s).getTime());},type:"numeric"});ts.addParser({id:"metadata",is:function(s){return false;},format:function(s,table,cell){var c=table.config,p=(!c.parserMetadataName)?'sortValue':c.parserMetadataName;return $(cell).metadata()[p];},type:"numeric"});ts.addWidget({id:"zebra",format:function(table){if(table.config.debug){var time=new Date();}var $tr,row=-1,odd;$("tr:visible",table.tBodies[0]).each(function(i){$tr=$(this);if(!$tr.hasClass(table.config.cssChildRow))row++;odd=(row%2==0);$tr.removeClass(table.config.widgetZebra.css[odd?0:1]).addClass(table.config.widgetZebra.css[odd?1:0])});if(table.config.debug){$.tablesorter.benchmark("Applying Zebra widget",time);}}});})(jQuery);



function SpaceCalculatorForContainerLocation($container) {
  this.$btn = $container.find('.show-space-calculator-btn');
  this.$linkerWrapper = this.$btn.closest('.linker-wrapper');
  this.$linker = this.$linkerWrapper.find('.linker');

  this.setupEvents();
}

SpaceCalculatorForContainerLocation.prototype.setupEvents = function () {
  var self = this;

  self.$btn.on('click', function (event) {
    new SpaceCalculatorModal({
      modalInitialContent: self.$btn.data('modal-content'),
      url: self.$btn.data('calculator-url'),
      selectable: true,
      containerProfile: self.getContainerProfileURI(),
      onSelect: function ($results) {
        $('.token-input-delete-token', self.$linkerWrapper).each(function () {
          $(this).triggerHandler('click');
        });

        var $selected = $results.find(
          '#tabledSearchResults :input:checked:first'
        );
        var locationJSON = $selected.data('object')._resolved;

        self.$linker.tokenInput('add', {
          id: $selected.val(),
          name: locationJSON.title,
          json: locationJSON,
        });

        self.$linker.triggerHandler('change');
      },
    });
  });
};

SpaceCalculatorForContainerLocation.prototype.getContainerProfileURI =
  function () {
    return $(document)
      .find("[name='top_container[container_profile][ref]']")
      .val();
  };

function SpaceCalculatorForButton($btn) {
  $btn.on('click', function (event) {
    event.preventDefault();

    new SpaceCalculatorModal({
      modalInitialContent: $btn.data('modal-content'),
      url: $btn.data('calculator-url'),
      selectable: $btn.data('selectable'),
      containerProfile: $btn.data('container-profile-uri'),
    });
  });
}

function SpaceCalculatorModal(options) {
  var self = this;

  self.options = options;

  self.$modal = AS.openCustomModal(
    'spaceCalculatorModal',
    null,
    "<div class='alert alert-info'>" +
      self.options.modalInitialContent +
      '</div>',
    'large',
    {},
    this
  );

  $.ajax({
    url: self.options.url,
    type: 'GET',
    data: {
      container_profile_ref: self.options.containerProfile,
      selectable: self.options.selectable,
    },
    success: function (html) {
      $('.alert', self.$modal).replaceWith(html);
      self.setupForm(self.$modal.find('form'));
      $(window).trigger('resize');
    },
    error: function (jqXHR, textStatus, errorThrown) {
      $('.alert', self.$modal).replaceWith(
        AS.renderTemplate('modal_quick_template', {
          message: jqXHR.responseText,
        })
      );
      $(window).trigger('resize');
    },
  });
}

SpaceCalculatorModal.prototype.setupForm = function ($form) {
  var self = this;

  self.$results = self.$modal.find('#spaceCalculatorResults');

  self.$modal.find('.linker').linker();

  self.setupByBuildingSearch();

  self.$modal.find('#addSelectedButton').attr('disabled', 'disabled');

  $form.ajaxForm({
    beforeSubmit: function () {
      self.$modal.find('#addSelectedButton').attr('disabled', 'disabled');
      self.$results.html(AS.renderTemplate('spaceCalculatorLoadingTemplate'));
    },
    success: function (html) {
      self.$modal.find('#spaceCalculatorResults').html(html);
      self.setupResults();
      self.setupResultsFilter();
      self.setupResultsToggles();
    },
  });

  self.$modal
    .find('#byBuilding')
    .on('hide.bs.collapse', function () {
      self.$modal.find('#byBuilding :input').prop('disabled', true);
    })
    .on('show.bs.collapse', function () {
      self.$modal.find('#byBuilding :input').prop('disabled', false);
    });

  self.$modal
    .find('#byLocation')
    .on('hide.bs.collapse', function () {
      self.$modal.find('#byLocation :input').prop('disabled', true);
    })
    .on('show.bs.collapse', function () {
      self.$modal.find('#byLocation :input').prop('disabled', false);
    });
};

SpaceCalculatorModal.prototype.setupByBuildingSearch = function () {
  var self = this;

  var $building = self.$modal.find('#building');
  var $floor = self.$modal.find('#floor');
  var $room = self.$modal.find('#room');
  var $area = self.$modal.find('#area');

  $building.on('change', function () {
    $floor.val('').closest('.form-group').hide();
    $room.val('').closest('.form-group').hide();
    $area.val('').closest('.form-group').hide();
    if ($building.val() != '') {
      var floors = AS.building_data[$building.val()];
      if (!$.isEmptyObject(floors)) {
        $floor.empty();
        $floor.append($('<option>'));
        for (var floor in floors) {
          $floor.append($('<option>').html(floor));
        }
        $floor.closest('.form-group').show();
      }
    }
  });

  $floor.on('change', function () {
    $room.val('').closest('.form-group').hide();
    $area.val('').closest('.form-group').hide();
    if ($floor.val() != '') {
      var rooms = AS.building_data[$building.val()][$floor.val()];
      if (!$.isEmptyObject(rooms)) {
        $room.empty();
        $room.append($('<option>'));
        for (var room in rooms) {
          $room.append($('<option>').html(room));
        }
        $room.closest('.form-group').show();
      }
    }
  });

  $room.on('change', function () {
    $area.val('').closest('.form-group').hide();
    if ($room.val() != '') {
      var areas = AS.building_data[$building.val()][$floor.val()][$room.val()];
      if (areas != null && areas.length > 0) {
        $area.empty();
        $area.append($('<option>'));
        for (var i = 0; i < areas.length; i++) {
          $area.append($('<option>').html(areas[i]));
        }
        $area.closest('.form-group').show();
      }
    }
  });
};

SpaceCalculatorModal.prototype.setupResults = function () {
  var self = this;

  $(':input[name=linker-item]', self.$results).each(function () {
    var $input = $(this);

    $input.click(function (event) {
      event.stopPropagation();

      $('tr.selected', $input.closest('table')).removeClass('selected');
      $input.closest('tr').addClass('selected');
      self.$modal.find('#addSelectedButton').removeAttr('disabled');
    });

    $('td', $input.closest('tr')).click(function (event) {
      event.preventDefault();

      $input.trigger('click');
    });
  });

  self.$modal.on('click', '#addSelectedButton', function (event) {
    self.options.onSelect && self.options.onSelect(self.$results);
    self.$modal.modal('hide');
  });

  var $table = self.$results.find('#tabledSearchResults');

  var $headers = $table.find('thead tr:first');

  var TABLE_SORTER_OPTS = {
    // default sort: Space?, Location, Count
    sortList: [
      [$headers.find('.space').index(), 0],
      [$headers.find('.count').index(), 1],
    ],
    // customise text extraction for the icon and count column
    textExtraction: function (cell) {
      var $cell = $(cell);

      if ($cell.hasClass('space')) {
        return $cell.hasClass('success') ? 0 : 1;
      } else if ($cell.hasClass('count')) {
        return $cell.data('count');
      }

      return $cell.text().trim();
    },
  };

  if (self.$results.find('.col.selectable:first')) {
    // disable sorting of checkbox column
    TABLE_SORTER_OPTS['header'] = {
      0: false,
    };
  }

  $table.tablesorter(TABLE_SORTER_OPTS);
};

SpaceCalculatorModal.prototype.setupResultsFilter = function () {
  var self = this;
  var $input = self.$results.find('#searchResultsFilter');
  var searchTimeout;

  function performSearch() {
    // split on words and retain quoted groups of terms
    var keywords = $input.val().match(/\w+|"[^"]+"/g) || [];

    self.$results.find('#tabledSearchResults tbody tr').each(function () {
      var $tr = $(this);

      var text = $tr.text();

      var match = true;
      for (var i = 0; i < keywords.length; i++) {
        // remove extra quotes from the filter term
        var keyword = keywords[i].replace(/"/g, '');
        if (keyword === '') {
          continue;
        }
        if (!new RegExp(keyword, 'i').test(text)) {
          match = false;
          break;
        }
      }

      if (match) {
        $tr.removeClass('filtered-by-search');
      } else {
        $tr.addClass('filtered-by-search');
      }
    });
  }

  $input.on('keyup', function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(performSearch, 200);
  });
};

SpaceCalculatorModal.prototype.setupResultsToggles = function () {
  var self = this;
  var $toggles = self.$results.find('.space-calculator-results-toggle');

  $toggles.each(function () {
    var $toggle = $(this);

    if ($toggle.is(':disabled')) {
      $toggle.closest('.btn').addClass('disabled');
    }
  });

  $toggles.on('click', function () {
    var $toggle = $(this);
    var $targetResults = self.$results.find($toggle.data('target-selector'));

    if ($toggle.is(':checked')) {
      $targetResults.removeClass('filtered-by-toggle');
    } else {
      $targetResults.addClass('filtered-by-toggle');
    }
  });
};

$(document).bind(
  'subrecordcreated.aspace',
  function (event, object_name, subform) {
    if (object_name == 'container_location') {
      new SpaceCalculatorForContainerLocation(subform);
    }
  }
);




$(function () {
  var initInstanceForm = function ($form) {
    // only enable collapsible for non-digital instances
    // as digital instances are small enough
    if ($(":input[id*='_instance_type_']", $form).val() != 'digital_object') {
      AS.initSubRecordCollapsible(
        $form.find('.subrecord-form-fields:first'),
        function () {
          var instance_data = {
            instance_type: $(
              ":input[id*='instance_type']:first :selected",
              $form
            ).text(),
            type_1: $(":input[id*='type_1']:first :selected", $form).text(),
            indicator_1: $(":input[id*='indicator_1']:first", $form).val(),
            type_2: $(":input[id*='type_2']:first :selected", $form).text(),
            indicator_2: $(":input[id*='indicator_2']:first", $form).val(),
          };
          return AS.renderTemplate('template_instance_summary', instance_data);
        }
      );
    }
  };

  $(document).bind(
    'subrecordcreaterequest.aspace',
    function (
      event,
      object_name,
      add_button_data,
      index_data,
      $target_subrecord_list,
      callback
    ) {
      if (object_name === 'instance') {
        var formEl;
        if (add_button_data.instanceType === 'digital-instance') {
          formEl = $(
            AS.renderTemplate('template_instance_digital_object', index_data)
          );
        } else {
          formEl = $(
            AS.renderTemplate('template_instance_container', index_data)
          );
          formEl.data('collapsed', false);
        }

        callback(formEl, $target_subrecord_list);
      }
      return true;
    }
  );

  $(document).bind(
    'subrecordcreated.aspace',
    function (event, object_name, subform) {
      if (object_name === 'instance') {
        initInstanceForm($(subform));
      }
    }
  );
});

$(function () {
  var initLangMaterialForm = function ($form) {};

  $(document).bind(
    'subrecordcreaterequest.aspace',
    function (
      event,
      object_name,
      add_button_data,
      index_data,
      $target_subrecord_list,
      callback
    ) {
      if (object_name === 'lang_material') {
        var formEl;
        if (add_button_data.langmaterialType === 'language_note') {
          formEl = $(AS.renderTemplate('template_language_notes', index_data));
        } else {
          formEl = $(AS.renderTemplate('template_language_fields', index_data));
          formEl.data('collapsed', false);
        }

        callback(formEl, $target_subrecord_list);
      }
      return true;
    }
  );

  $(document).bind(
    'subrecordcreated.aspace',
    function (event, object_name, subform) {
      if (object_name === 'lang_material') {
        initLangMaterialForm($(subform));
      }
    }
  );
});
(function () {
  $(document).bind(
    'subrecordcreated.aspace',
    function (event, object_name, subform) {
      if (object_name === 'deaccession') {
        $(document).triggerHandler('subrecordcreated.aspace', [
          'date',
          $('#deaccession_date .subrecord-form-fields:first', subform),
        ]);
      }
    }
  );
})();
/*
    Supports the ingest of bulk data using an Excel spreadsheet
*/


	var file_modal_html = '';
	var $file_form_modal;

/* returns a hash with information about the selected archival object or resource */
	var get_object_info = function() {
	    var ret_obj = new Object;
	    var $tree = $("#archives_tree");
	    var $obj_form = $("#archival_object_form");
	    if (typeof $obj_form.attr("action") !== 'undefined') {
            ret_obj.type = "archival_object";
            ret_obj.aoid = $obj_form.find("#id").val();
            ret_obj.ref_id = $obj_form.find("#archival_object_ref_id_").val();
            ret_obj.resource = $obj_form.find("#archival_object_resource_").val();
            ret_obj.rid =  ret_obj.resource.split('/').pop();
            ret_obj.position = $obj_form.find("#archival_object_position_").val();
	    }
	    else {
            $obj_form = $("#resource_form");
            if (typeof $obj_form.attr("action") !== 'undefined') {
                ret_obj.type = "resource";
                ret_obj.resource = $obj_form.attr("action");
                ret_obj.aoid = '';
                ret_obj.ref_id = '';
                ret_obj.position = '';
                ret_obj.rid =  $obj_form.find("#id").val();
            }
	    }
	    return ret_obj;
	}

	var initExcelFileUploadSection = function() {
		// disable import button on init, enable only if file selection is valid
		$("#bulkFileButton").prop('disabled', true);
		var handleExcelFileChange = function() {
			var $input = $(this);
			var fileList = this["files"]
			if (typeof(fileList) == "object" ) {
				fileObj = fileList[0]
				if  (typeof(fileObj) === "object" && typeof(fileObj.type) !== "undefined" ) {
					if (fileObj.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || fileObj.name.endsWith(".xlsx")) {
						$('#file_type').val("xlsx");
						$("#bulkFileButton").prop('disabled', false);
					}
					else if (fileObj.type === 'text/csv'|| (fileObj.type === 'application/vnd.ms-excel' && fileObj.name.endsWith(".csv"))) {
							$('#file_type').val("csv");
							$("#bulkFileButton").prop('disabled', false);
					}
					else {
						missingFile = "The fileRecord Control  you have chosen is neither an Excel Spreadsheet nor a CSV file";
						$('#file_type').val("");
						$('#job_filename').val("");
						alert(missingFile);
						$("#bulkFileButton").prop('disabled', true);
					}
				}
			}
			var filename = $input.val().split("\\").reverse()[0];
            $("#excel_filename").html(filename);
			$("#job_filename").val(filename);
		};
	    $("#excel_file").on("change", handleExcelFileChange);
	};

	var bulkFileSelection = function() {
	    obj = get_object_info();
	    if ($.isEmptyObject(obj)) {
		return;
	    }
	    file_modal_html = '';
	    if (typeof($file_form_modal) !== 'undefined') {
                   $file_form_modal.remove();
            }

	    $.ajax({
			url: AS.app_prefix("/resources/" + obj.rid + "/getbulkfile"),
			type: "POST",
			data: {aoid: obj.aoid, type: obj.type, ref_id: obj.ref_id, resource: obj.resource, position: obj.position},
			dataType: "html",
			success: function(data) {
				file_modal_html = data;
				openFileModal();
			},
			error: function(xhr,status,err) {
				alert("ERROR: Error(s) detected: " + err );
				}
			});
	};

    var handleBulkFileUpload = function($modal) {
	    /* don't let the modal disappear on submission */
		$modal.on("hide.bs.modal", function (event){
		    event.preventDefault();
		    event.stopImmediatePropagation();
		});
	    /* submit via ajax */
	    $form = $("#bulk_import_form");
		$(".bulkbtn").addClass('disabled');
		$form.submit();
		$("#bulk_messages").html("<p>Job had been submitted to Background Jobs. <br/> Click 'Close' to refresh this screen.</p>");
		modalSuccess($file_form_modal);
	    $modal.on("hidden.bs.modal", function (event) {
			$modal.hide();
			$("body").css("overflow", "auto");
		});
	};

	var openFileModal = function() {
	    $file_form_modal = AS.openCustomModal("bulkIngestFileModal", "Load Spreadsheet",  file_modal_html, 'large', null, $("#bulkFileButton").get(0));
	    initExcelFileUploadSection();
		$("#bulkFileButton").on("click", function(event) {
		    event.stopPropagation();
		    event.preventDefault();
		    handleBulkFileUpload($file_form_modal);
		});

    // Toggle buttons event handler to set the job_type based on the load_type
    $("#jobLoadTypeToggleButtons :input").change(function(event) {
      var loadType = $(this).attr('value')
      // Set the job_type based on the load_type
      if (loadType == 'top_container_linker_job') {
        // If load_type is 'top_container_linker_job' set the job_type to 'top_container_linker_job'
        $("#jsonmodel_type").val('top_container_linker_job');
        $("#job_type").val('top_container_linker_job');
      } else {
        // Else set the job_type back to the default value 'bulk_import_job'
        $("#jsonmodel_type").val('bulk_import_job');
        $("#job_type").val('bulk_import_job');
      }
    });

	  $file_form_modal.show();
	};

	var modalError = function($modal) {
	    $(".bulkbtn").removeClass("disabled");
        $(".bulkbtn.btn-cancel").text("Close").removeClass("disabled").addClass("btn-close")
	    $(".clip-btn").removeClass("disabled");
	    $modal.find(".btn-close, .close").click(function(event) {
		    $("#bulk_messages").html("");
		    $("#excel_filename").html("");
		    $modal.hide();
		    $("body").css("overflow", "auto");
		});
	};

	var modalSuccess = function($modal) {
	    $(".bulkbtn.btn-cancel").text("Close").removeClass("disabled").addClass("btn-close")
	    $modal.find(".btn-close, .close").click(function(event) {
		    window.location.reload(true);
		});
	}
;
/*!
 * clipboard.js v1.6.1
 * https://zenorocha.github.io/clipboard.js
 *
 * Licensed MIT © Zeno Rocha
 */

(function (f) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = f();
  } else if (typeof define === 'function' && define.amd) {
    define([], f);
  } else {
    var g;
    if (typeof window !== 'undefined') {
      g = window;
    } else if (typeof global !== 'undefined') {
      g = global;
    } else if (typeof self !== 'undefined') {
      g = self;
    } else {
      g = this;
    }
    g.Clipboard = f();
  }
})(function () {
  var define, module, exports;
  return (function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == 'function' && require;
          if (!u && a) return a(o, !0);
          if (i) return i(o, !0);
          var f = new Error("Cannot find module '" + o + "'");
          throw ((f.code = 'MODULE_NOT_FOUND'), f);
        }
        var l = (n[o] = { exports: {} });
        t[o][0].call(
          l.exports,
          function (e) {
            var n = t[o][1][e];
            return s(n ? n : e);
          },
          l,
          l.exports,
          e,
          t,
          n,
          r
        );
      }
      return n[o].exports;
    }
    var i = typeof require == 'function' && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s;
  })(
    {
      1: [
        function (require, module, exports) {
          var DOCUMENT_NODE_TYPE = 9;

          /**
           * A polyfill for Element.matches()
           */
          if (typeof Element !== 'undefined' && !Element.prototype.matches) {
            var proto = Element.prototype;

            proto.matches =
              proto.matchesSelector ||
              proto.mozMatchesSelector ||
              proto.msMatchesSelector ||
              proto.oMatchesSelector ||
              proto.webkitMatchesSelector;
          }

          /**
           * Finds the closest parent that matches a selector.
           *
           * @param {Element} element
           * @param {String} selector
           * @return {Function}
           */
          function closest(element, selector) {
            while (element && element.nodeType !== DOCUMENT_NODE_TYPE) {
              if (element.matches(selector)) return element;
              element = element.parentNode;
            }
          }

          module.exports = closest;
        },
        {},
      ],
      2: [
        function (require, module, exports) {
          var closest = require('./closest');

          /**
           * Delegates event to a selector.
           *
           * @param {Element} element
           * @param {String} selector
           * @param {String} type
           * @param {Function} callback
           * @param {Boolean} useCapture
           * @return {Object}
           */
          function delegate(element, selector, type, callback, useCapture) {
            var listenerFn = listener.apply(this, arguments);

            element.addEventListener(type, listenerFn, useCapture);

            return {
              destroy: function () {
                element.removeEventListener(type, listenerFn, useCapture);
              },
            };
          }

          /**
           * Finds closest match and invokes callback.
           *
           * @param {Element} element
           * @param {String} selector
           * @param {String} type
           * @param {Function} callback
           * @return {Function}
           */
          function listener(element, selector, type, callback) {
            return function (e) {
              e.delegateTarget = closest(e.target, selector);

              if (e.delegateTarget) {
                callback.call(element, e);
              }
            };
          }

          module.exports = delegate;
        },
        { './closest': 1 },
      ],
      3: [
        function (require, module, exports) {
          /**
           * Check if argument is a HTML element.
           *
           * @param {Object} value
           * @return {Boolean}
           */
          exports.node = function (value) {
            return (
              value !== undefined &&
              value instanceof HTMLElement &&
              value.nodeType === 1
            );
          };

          /**
           * Check if argument is a list of HTML elements.
           *
           * @param {Object} value
           * @return {Boolean}
           */
          exports.nodeList = function (value) {
            var type = Object.prototype.toString.call(value);

            return (
              value !== undefined &&
              (type === '[object NodeList]' ||
                type === '[object HTMLCollection]') &&
              'length' in value &&
              (value.length === 0 || exports.node(value[0]))
            );
          };

          /**
           * Check if argument is a string.
           *
           * @param {Object} value
           * @return {Boolean}
           */
          exports.string = function (value) {
            return typeof value === 'string' || value instanceof String;
          };

          /**
           * Check if argument is a function.
           *
           * @param {Object} value
           * @return {Boolean}
           */
          exports.fn = function (value) {
            var type = Object.prototype.toString.call(value);

            return type === '[object Function]';
          };
        },
        {},
      ],
      4: [
        function (require, module, exports) {
          var is = require('./is');
          var delegate = require('delegate');

          /**
           * Validates all params and calls the right
           * listener function based on its target type.
           *
           * @param {String|HTMLElement|HTMLCollection|NodeList} target
           * @param {String} type
           * @param {Function} callback
           * @return {Object}
           */
          function listen(target, type, callback) {
            if (!target && !type && !callback) {
              throw new Error('Missing required arguments');
            }

            if (!is.string(type)) {
              throw new TypeError('Second argument must be a String');
            }

            if (!is.fn(callback)) {
              throw new TypeError('Third argument must be a Function');
            }

            if (is.node(target)) {
              return listenNode(target, type, callback);
            } else if (is.nodeList(target)) {
              return listenNodeList(target, type, callback);
            } else if (is.string(target)) {
              return listenSelector(target, type, callback);
            } else {
              throw new TypeError(
                'First argument must be a String, HTMLElement, HTMLCollection, or NodeList'
              );
            }
          }

          /**
           * Adds an event listener to a HTML element
           * and returns a remove listener function.
           *
           * @param {HTMLElement} node
           * @param {String} type
           * @param {Function} callback
           * @return {Object}
           */
          function listenNode(node, type, callback) {
            node.addEventListener(type, callback);

            return {
              destroy: function () {
                node.removeEventListener(type, callback);
              },
            };
          }

          /**
           * Add an event listener to a list of HTML elements
           * and returns a remove listener function.
           *
           * @param {NodeList|HTMLCollection} nodeList
           * @param {String} type
           * @param {Function} callback
           * @return {Object}
           */
          function listenNodeList(nodeList, type, callback) {
            Array.prototype.forEach.call(nodeList, function (node) {
              node.addEventListener(type, callback);
            });

            return {
              destroy: function () {
                Array.prototype.forEach.call(nodeList, function (node) {
                  node.removeEventListener(type, callback);
                });
              },
            };
          }

          /**
           * Add an event listener to a selector
           * and returns a remove listener function.
           *
           * @param {String} selector
           * @param {String} type
           * @param {Function} callback
           * @return {Object}
           */
          function listenSelector(selector, type, callback) {
            return delegate(document.body, selector, type, callback);
          }

          module.exports = listen;
        },
        { './is': 3, delegate: 2 },
      ],
      5: [
        function (require, module, exports) {
          function select(element) {
            var selectedText;

            if (element.nodeName === 'SELECT') {
              element.focus();

              selectedText = element.value;
            } else if (
              element.nodeName === 'INPUT' ||
              element.nodeName === 'TEXTAREA'
            ) {
              var isReadOnly = element.hasAttribute('readonly');

              if (!isReadOnly) {
                element.setAttribute('readonly', '');
              }

              element.select();
              element.setSelectionRange(0, element.value.length);

              if (!isReadOnly) {
                element.removeAttribute('readonly');
              }

              selectedText = element.value;
            } else {
              if (element.hasAttribute('contenteditable')) {
                element.focus();
              }

              var selection = window.getSelection();
              var range = document.createRange();

              range.selectNodeContents(element);
              selection.removeAllRanges();
              selection.addRange(range);

              selectedText = selection.toString();
            }

            return selectedText;
          }

          module.exports = select;
        },
        {},
      ],
      6: [
        function (require, module, exports) {
          function E() {
            // Keep this empty so it's easier to inherit from
            // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
          }

          E.prototype = {
            on: function (name, callback, ctx) {
              var e = this.e || (this.e = {});

              (e[name] || (e[name] = [])).push({
                fn: callback,
                ctx: ctx,
              });

              return this;
            },

            once: function (name, callback, ctx) {
              var self = this;
              function listener() {
                self.off(name, listener);
                callback.apply(ctx, arguments);
              }

              listener._ = callback;
              return this.on(name, listener, ctx);
            },

            emit: function (name) {
              var data = [].slice.call(arguments, 1);
              var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
              var i = 0;
              var len = evtArr.length;

              for (i; i < len; i++) {
                evtArr[i].fn.apply(evtArr[i].ctx, data);
              }

              return this;
            },

            off: function (name, callback) {
              var e = this.e || (this.e = {});
              var evts = e[name];
              var liveEvents = [];

              if (evts && callback) {
                for (var i = 0, len = evts.length; i < len; i++) {
                  if (evts[i].fn !== callback && evts[i].fn._ !== callback)
                    liveEvents.push(evts[i]);
                }
              }

              // Remove event from queue to prevent memory leak
              // Suggested by https://github.com/lazd
              // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

              liveEvents.length ? (e[name] = liveEvents) : delete e[name];

              return this;
            },
          };

          module.exports = E;
        },
        {},
      ],
      7: [
        function (require, module, exports) {
          (function (global, factory) {
            if (typeof define === 'function' && define.amd) {
              define(['module', 'select'], factory);
            } else if (typeof exports !== 'undefined') {
              factory(module, require('select'));
            } else {
              var mod = {
                exports: {},
              };
              factory(mod, global.select);
              global.clipboardAction = mod.exports;
            }
          })(this, function (module, _select) {
            'use strict';

            var _select2 = _interopRequireDefault(_select);

            function _interopRequireDefault(obj) {
              return obj && obj.__esModule
                ? obj
                : {
                    default: obj,
                  };
            }

            var _typeof =
              typeof Symbol === 'function' &&
              typeof Symbol.iterator === 'symbol'
                ? function (obj) {
                    return typeof obj;
                  }
                : function (obj) {
                    return obj &&
                      typeof Symbol === 'function' &&
                      obj.constructor === Symbol &&
                      obj !== Symbol.prototype
                      ? 'symbol'
                      : typeof obj;
                  };

            function _classCallCheck(instance, Constructor) {
              if (!(instance instanceof Constructor)) {
                throw new TypeError('Cannot call a class as a function');
              }
            }

            var _createClass = (function () {
              function defineProperties(target, props) {
                for (var i = 0; i < props.length; i++) {
                  var descriptor = props[i];
                  descriptor.enumerable = descriptor.enumerable || false;
                  descriptor.configurable = true;
                  if ('value' in descriptor) descriptor.writable = true;
                  Object.defineProperty(target, descriptor.key, descriptor);
                }
              }

              return function (Constructor, protoProps, staticProps) {
                if (protoProps)
                  defineProperties(Constructor.prototype, protoProps);
                if (staticProps) defineProperties(Constructor, staticProps);
                return Constructor;
              };
            })();

            var ClipboardAction = (function () {
              /**
               * @param {Object} options
               */
              function ClipboardAction(options) {
                _classCallCheck(this, ClipboardAction);

                this.resolveOptions(options);
                this.initSelection();
              }

              /**
               * Defines base properties passed from constructor.
               * @param {Object} options
               */

              _createClass(ClipboardAction, [
                {
                  key: 'resolveOptions',
                  value: function resolveOptions() {
                    var options =
                      arguments.length > 0 && arguments[0] !== undefined
                        ? arguments[0]
                        : {};

                    this.action = options.action;
                    this.emitter = options.emitter;
                    this.target = options.target;
                    this.text = options.text;
                    this.trigger = options.trigger;

                    this.selectedText = '';
                  },
                },
                {
                  key: 'initSelection',
                  value: function initSelection() {
                    if (this.text) {
                      this.selectFake();
                    } else if (this.target) {
                      this.selectTarget();
                    }
                  },
                },
                {
                  key: 'selectFake',
                  value: function selectFake() {
                    var _this = this;

                    var isRTL =
                      document.documentElement.getAttribute('dir') == 'rtl';

                    this.removeFake();

                    this.fakeHandlerCallback = function () {
                      return _this.removeFake();
                    };
                    this.fakeHandler =
                      document.body.addEventListener(
                        'click',
                        this.fakeHandlerCallback
                      ) || true;

                    this.fakeElem = document.createElement('textarea');
                    // Prevent zooming on iOS
                    this.fakeElem.style.fontSize = '12pt';
                    // Reset box model
                    this.fakeElem.style.border = '0';
                    this.fakeElem.style.padding = '0';
                    this.fakeElem.style.margin = '0';
                    // Move element out of screen horizontally
                    this.fakeElem.style.position = 'absolute';
                    this.fakeElem.style[isRTL ? 'right' : 'left'] = '-9999px';
                    // Move element to the same position vertically
                    var yPosition =
                      window.pageYOffset || document.documentElement.scrollTop;
                    this.fakeElem.style.top = yPosition + 'px';

                    this.fakeElem.setAttribute('readonly', '');
                    this.fakeElem.value = this.text;

                    document.body.appendChild(this.fakeElem);

                    this.selectedText = (0, _select2.default)(this.fakeElem);
                    this.copyText();
                  },
                },
                {
                  key: 'removeFake',
                  value: function removeFake() {
                    if (this.fakeHandler) {
                      document.body.removeEventListener(
                        'click',
                        this.fakeHandlerCallback
                      );
                      this.fakeHandler = null;
                      this.fakeHandlerCallback = null;
                    }

                    if (this.fakeElem) {
                      document.body.removeChild(this.fakeElem);
                      this.fakeElem = null;
                    }
                  },
                },
                {
                  key: 'selectTarget',
                  value: function selectTarget() {
                    this.selectedText = (0, _select2.default)(this.target);
                    this.copyText();
                  },
                },
                {
                  key: 'copyText',
                  value: function copyText() {
                    var succeeded = void 0;

                    try {
                      succeeded = document.execCommand(this.action);
                    } catch (err) {
                      succeeded = false;
                    }

                    this.handleResult(succeeded);
                  },
                },
                {
                  key: 'handleResult',
                  value: function handleResult(succeeded) {
                    this.emitter.emit(succeeded ? 'success' : 'error', {
                      action: this.action,
                      text: this.selectedText,
                      trigger: this.trigger,
                      clearSelection: this.clearSelection.bind(this),
                    });
                  },
                },
                {
                  key: 'clearSelection',
                  value: function clearSelection() {
                    if (this.target) {
                      this.target.blur();
                    }

                    window.getSelection().removeAllRanges();
                  },
                },
                {
                  key: 'destroy',
                  value: function destroy() {
                    this.removeFake();
                  },
                },
                {
                  key: 'action',
                  set: function set() {
                    var action =
                      arguments.length > 0 && arguments[0] !== undefined
                        ? arguments[0]
                        : 'copy';

                    this._action = action;

                    if (this._action !== 'copy' && this._action !== 'cut') {
                      throw new Error(
                        'Invalid "action" value, use either "copy" or "cut"'
                      );
                    }
                  },
                  get: function get() {
                    return this._action;
                  },
                },
                {
                  key: 'target',
                  set: function set(target) {
                    if (target !== undefined) {
                      if (
                        target &&
                        (typeof target === 'undefined'
                          ? 'undefined'
                          : _typeof(target)) === 'object' &&
                        target.nodeType === 1
                      ) {
                        if (
                          this.action === 'copy' &&
                          target.hasAttribute('disabled')
                        ) {
                          throw new Error(
                            'Invalid "target" attribute. Please use "readonly" instead of "disabled" attribute'
                          );
                        }

                        if (
                          this.action === 'cut' &&
                          (target.hasAttribute('readonly') ||
                            target.hasAttribute('disabled'))
                        ) {
                          throw new Error(
                            'Invalid "target" attribute. You can\'t cut text from elements with "readonly" or "disabled" attributes'
                          );
                        }

                        this._target = target;
                      } else {
                        throw new Error(
                          'Invalid "target" value, use a valid Element'
                        );
                      }
                    }
                  },
                  get: function get() {
                    return this._target;
                  },
                },
              ]);

              return ClipboardAction;
            })();

            module.exports = ClipboardAction;
          });
        },
        { select: 5 },
      ],
      8: [
        function (require, module, exports) {
          (function (global, factory) {
            if (typeof define === 'function' && define.amd) {
              define([
                'module',
                './clipboard-action',
                'tiny-emitter',
                'good-listener',
              ], factory);
            } else if (typeof exports !== 'undefined') {
              factory(
                module,
                require('./clipboard-action'),
                require('tiny-emitter'),
                require('good-listener')
              );
            } else {
              var mod = {
                exports: {},
              };
              factory(
                mod,
                global.clipboardAction,
                global.tinyEmitter,
                global.goodListener
              );
              global.clipboard = mod.exports;
            }
          })(
            this,
            function (module, _clipboardAction, _tinyEmitter, _goodListener) {
              'use strict';

              var _clipboardAction2 = _interopRequireDefault(_clipboardAction);

              var _tinyEmitter2 = _interopRequireDefault(_tinyEmitter);

              var _goodListener2 = _interopRequireDefault(_goodListener);

              function _interopRequireDefault(obj) {
                return obj && obj.__esModule
                  ? obj
                  : {
                      default: obj,
                    };
              }

              function _classCallCheck(instance, Constructor) {
                if (!(instance instanceof Constructor)) {
                  throw new TypeError('Cannot call a class as a function');
                }
              }

              var _createClass = (function () {
                function defineProperties(target, props) {
                  for (var i = 0; i < props.length; i++) {
                    var descriptor = props[i];
                    descriptor.enumerable = descriptor.enumerable || false;
                    descriptor.configurable = true;
                    if ('value' in descriptor) descriptor.writable = true;
                    Object.defineProperty(target, descriptor.key, descriptor);
                  }
                }

                return function (Constructor, protoProps, staticProps) {
                  if (protoProps)
                    defineProperties(Constructor.prototype, protoProps);
                  if (staticProps) defineProperties(Constructor, staticProps);
                  return Constructor;
                };
              })();

              function _possibleConstructorReturn(self, call) {
                if (!self) {
                  throw new ReferenceError(
                    "this hasn't been initialised - super() hasn't been called"
                  );
                }

                return call &&
                  (typeof call === 'object' || typeof call === 'function')
                  ? call
                  : self;
              }

              function _inherits(subClass, superClass) {
                if (typeof superClass !== 'function' && superClass !== null) {
                  throw new TypeError(
                    'Super expression must either be null or a function, not ' +
                      typeof superClass
                  );
                }

                subClass.prototype = Object.create(
                  superClass && superClass.prototype,
                  {
                    constructor: {
                      value: subClass,
                      enumerable: false,
                      writable: true,
                      configurable: true,
                    },
                  }
                );
                if (superClass)
                  Object.setPrototypeOf
                    ? Object.setPrototypeOf(subClass, superClass)
                    : (subClass.__proto__ = superClass);
              }

              var Clipboard = (function (_Emitter) {
                _inherits(Clipboard, _Emitter);

                /**
                 * @param {String|HTMLElement|HTMLCollection|NodeList} trigger
                 * @param {Object} options
                 */
                function Clipboard(trigger, options) {
                  _classCallCheck(this, Clipboard);

                  var _this = _possibleConstructorReturn(
                    this,
                    (
                      Clipboard.__proto__ || Object.getPrototypeOf(Clipboard)
                    ).call(this)
                  );

                  _this.resolveOptions(options);
                  _this.listenClick(trigger);
                  return _this;
                }

                /**
                 * Defines if attributes would be resolved using internal setter functions
                 * or custom functions that were passed in the constructor.
                 * @param {Object} options
                 */

                _createClass(
                  Clipboard,
                  [
                    {
                      key: 'resolveOptions',
                      value: function resolveOptions() {
                        var options =
                          arguments.length > 0 && arguments[0] !== undefined
                            ? arguments[0]
                            : {};

                        this.action =
                          typeof options.action === 'function'
                            ? options.action
                            : this.defaultAction;
                        this.target =
                          typeof options.target === 'function'
                            ? options.target
                            : this.defaultTarget;
                        this.text =
                          typeof options.text === 'function'
                            ? options.text
                            : this.defaultText;
                      },
                    },
                    {
                      key: 'listenClick',
                      value: function listenClick(trigger) {
                        var _this2 = this;

                        this.listener = (0, _goodListener2.default)(
                          trigger,
                          'click',
                          function (e) {
                            return _this2.onClick(e);
                          }
                        );
                      },
                    },
                    {
                      key: 'onClick',
                      value: function onClick(e) {
                        var trigger = e.delegateTarget || e.currentTarget;

                        if (this.clipboardAction) {
                          this.clipboardAction = null;
                        }

                        this.clipboardAction = new _clipboardAction2.default({
                          action: this.action(trigger),
                          target: this.target(trigger),
                          text: this.text(trigger),
                          trigger: trigger,
                          emitter: this,
                        });
                      },
                    },
                    {
                      key: 'defaultAction',
                      value: function defaultAction(trigger) {
                        return getAttributeValue('action', trigger);
                      },
                    },
                    {
                      key: 'defaultTarget',
                      value: function defaultTarget(trigger) {
                        var selector = getAttributeValue('target', trigger);

                        if (selector) {
                          return document.querySelector(selector);
                        }
                      },
                    },
                    {
                      key: 'defaultText',
                      value: function defaultText(trigger) {
                        return getAttributeValue('text', trigger);
                      },
                    },
                    {
                      key: 'destroy',
                      value: function destroy() {
                        this.listener.destroy();

                        if (this.clipboardAction) {
                          this.clipboardAction.destroy();
                          this.clipboardAction = null;
                        }
                      },
                    },
                  ],
                  [
                    {
                      key: 'isSupported',
                      value: function isSupported() {
                        var action =
                          arguments.length > 0 && arguments[0] !== undefined
                            ? arguments[0]
                            : ['copy', 'cut'];

                        var actions =
                          typeof action === 'string' ? [action] : action;
                        var support = !!document.queryCommandSupported;

                        actions.forEach(function (action) {
                          support =
                            support && !!document.queryCommandSupported(action);
                        });

                        return support;
                      },
                    },
                  ]
                );

                return Clipboard;
              })(_tinyEmitter2.default);

              /**
               * Helper function to retrieve attribute value.
               * @param {String} suffix
               * @param {Element} element
               */
              function getAttributeValue(suffix, element) {
                var attribute = 'data-clipboard-' + suffix;

                if (!element.hasAttribute(attribute)) {
                  return;
                }

                return element.getAttribute(attribute);
              }

              module.exports = Clipboard;
            }
          );
        },
        { './clipboard-action': 7, 'good-listener': 4, 'tiny-emitter': 6 },
      ],
    },
    {},
    [8]
  )(8);
});





$(function () {
  $.fn.init_archival_object_form = function () {
    $(this).each(function () {
      var $this = $(this);

      if ($this.hasClass('initialised')) {
        return;
      }

      var $levelSelect = $('#archival_object_level_', $this);
      var $otherLevel = $('#archival_object_other_level_', $this);

      var handleLevelChange = function (initialising) {
        if ($levelSelect.val() === 'otherlevel') {
          $otherLevel.removeAttr('disabled');
          if (initialising === true) {
            $otherLevel.closest('.form-group').show();
          } else {
            $otherLevel.closest('.form-group').slideDown();
          }
        } else {
          $otherLevel.attr('disabled', 'disabled');
          if (initialising === true) {
            $otherLevel.closest('.form-group').hide();
          } else {
            $otherLevel.closest('.form-group').slideUp();
          }
        }
      };

      handleLevelChange(true);
      $levelSelect.change(handleLevelChange);
    });
  };

  $(document).bind('loadedrecordform.aspace', function (event, $container) {
    $(
      '#archival_object_form:not(.initialised)',
      $container
    ).init_archival_object_form();
  });

  $('#archival_object_form:not(.initialised)').init_archival_object_form();
});
/*
jquery.event.drag.js ~ v1.4 ~ Copyright (c) 2008, Three Dub Media (http://threedubmedia.com)
Liscensed under the MIT License ~ http://threedubmedia.googlecode.com/files/MIT-LICENSE.txt
*/

(function(H){H.fn.drag=function(K,J,I){if(J){this.bind("dragstart",K)}if(I){this.bind("dragend",I)}return !K?this.trigger("drag"):this.bind("drag",J?J:K)};var D=H.event,B=D.special,F=B.drag={not:":input",distance:0,which:1,setup:function(I){I=H.extend({distance:F.distance,which:F.which,not:F.not},I||{});I.distance=G(I.distance);D.add(this,"mousedown",E,I)},teardown:function(){D.remove(this,"mousedown",E);if(this===F.dragging){F.dragging=F.proxy=null}C(this,true)}};function E(K){var J=this,I,L=K.data||{};if(L.elem){J=K.dragTarget=L.elem;K.dragProxy=F.proxy||J;K.cursorOffsetX=L.pageX-L.left;K.cursorOffsetY=L.pageY-L.top;K.offsetX=K.pageX-K.cursorOffsetX;K.offsetY=K.pageY-K.cursorOffsetY}else{if(F.dragging||(L.which>0&&K.which!=L.which)||H(K.target).is(L.not)){return }}switch(K.type){case"mousedown":H.extend(L,H(J).offset(),{elem:J,target:K.target,pageX:K.pageX,pageY:K.pageY});D.add(document,"mousemove mouseup",E,L);C(J,false);return false;case !F.dragging&&"mousemove":if(G(K.pageX-L.pageX)+G(K.pageY-L.pageY)<L.distance){break}K.target=L.target;I=A(K,"dragstart",J);if(I!==false){F.dragging=J;F.proxy=K.dragProxy=H(I||J)[0]}case"mousemove":if(F.dragging){I=A(K,"drag",J);if(B.drop){B.drop.allowed=(I!==false);B.drop.handler(K)}if(I!==false){break}K.type="mouseup"}case"mouseup":D.remove(document,"mousemove mouseup",E);if(F.dragging){if(B.drop){B.drop.handler(K)}A(K,"dragend",J)}C(J,true);F.dragging=F.proxy=L.elem=null;break}}function A(L,J,K){L.type=J;var I=D.dispatch.call(K,L);return I===false?false:I||L.result}function G(I){return Math.pow(I,2)}function C(J,I){if(!J){return }J.unselectable=I?"off":"on";J.onselectstart=function(){return I};if(document.selection&&document.selection.empty){document.selection.empty()}if(J.style){J.style.MozUserSelect=I?"":"none"}}})(jQuery);
/*
 * jQuery kiketable.colsizable plugin
 * Version 1.1 (20-MAR-2009)
 * @requires jQuery v1.3.2 or later (http://jquery.com)
 * @requires jquery.event.drag-1.4.js (http://blog.threedubmedia.com/2008/08/eventspecialdrag.html)
 *
 * Examples at: http://www.ita.es/jquery/jquery.kiketable.colsizable.htm
 * Copyright (c) 2007-2009 Enrique Melendez Estrada
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

(function($){

  $.fn.kiketable_colsizable = function(o) {
    // default parameters, properties or settings
    o = $.extend({}, $.fn.kiketable_colsizable.defaults, o);
    o.dragProxy = (o.dragProxy === "line" ) ? false : true;

    this
      .filter("table:not(."+o.namespace+")") // only for "virgin" html table(s)
      .addClass(o.namespace)
      .each(function(index){
        o.renderTime = new Date().getTime();
        //
        // global variables
        //
        var oTable =	this,
          $Table =	$(this),
          _Cols =		oTable.getElementsByTagName("col");
        ;
        _Cols.length && $(o.dragCells,this)
          .each(function(index){
            if (!$(this).hasClass('kiketable-th'))
              $(this).addClass('kiketable-th').wrapInner('<div class="kiketable-th-text"></div>');
            $('<div class="'+o.classHandler+'" title="'+ o.title+'"></div>')
              .prependTo(this)
              .each(function(){
                //
                // global properties
                //
                this.td =	this.parentNode; // alias for TD / CELL of this, if jerarchy changes in future, only depends on this var
                this.$td =	$(this.td);
                this.col = _Cols[this.td.cellIndex];
              })
              .dblclick( function() {
                // if loading fast, only once...
                if (this.wtd == null){
                  this.wtd =		this.col.offsetWidth;
                  this.wtd0=		this.wtd;
                };

                // change column width
                var minimized = this.wtd == o.minWidth;
                this.wtd = (minimized) ? this.wtd0 : o.minWidth;
                this.col.style.width = this.wtd + "px";

                // change table width (if not fixed)
                if(!o.fixWidth){
                  var d = this.wtd0-o.minWidth;
                  oTable.style.width = $Table.width()+((minimized)?d:-d)+"px";
                };
                $(this).trigger('minimized');
              })
              //
              // bind a dragstart event, return the proxy element
              //
              .bind( 'dragstart', function(e){
                this.cell_width =	this.$td.width();
                this.table_width =	$Table.width();
                this.left0 =		e.offsetX;
                this.d1 = this.cell_width - this.left0; // precalc for drag event
                this.d2 = o.minWidth - this.d1; // precalc for drag event

                return $(this)
                  .clone()
                  .appendTo(this.td)
                  .css("opacity",o.dragOpacity)
                  .css((o.dragProxy)?{
                    top:	this.$td.offset().top,
                    left:	this.$td.offset().left,
                    width:	this.cell_width
                  }:{
                    top:	this.$td.offset().top,
                    left:	e.offsetX
                  })
                  .removeClass(o.classHandler)
                  .addClass(	(o.dragProxy)? o.classDragArea :	o.classDragLine)
                  .height($Table.height())
              })
              //
              // bind a drag event, update proxy position
              //
              .bind( 'drag', (o.dragMove || o.dragProxy)? function(e){
                var w = e.offsetX + this.d1;
                if(w - this.d2 - this.d1 >= 0){
                  e.dragProxy.style.width = w + "px"; //$(e.dragProxy).css({width: w}) ;
                  if (o.dragMove){
                    this.col.style.width = w +"px"; // cell width
                    if(!o.fixWidth){
                      oTable.style.width = (this.table_width - this.cell_width+ w) + "px";
                    };
                  };
                }
              }: function(e){
                var x = e.offsetX;
                if (x - this.d2 >= 0)
                  e.dragProxy.style.left = x+"px"; //$(e.dragProxy).css({left: e.offsetX});
              })
              //
              // bind a dragend event, remove proxy
              //
              .bind( 'dragend', function(e){
                if (!o.dragMove){
                  var delta = parseInt(e.dragProxy.style.left) - this.left0;
                  this.col.style.width = (o.dragProxy) ? e.dragProxy.style.width : (this.cell_width + delta)+"px"; // cell width
                  // change table width (if not fixed)
                  if(!o.fixWidth)
                    oTable.style.width = ((o.dragProxy) ? this.table_width - this.cell_width + parseInt(e.dragProxy.style.width) : this.table_width + delta)+"px";
                }
                $(e.dragProxy)[o.fxHide](o.fxSpeed, function(){$(this).remove()});
                $(this).trigger('minimized');
              })
              .bind('minimized', function(e){
                $(this.col)[(parseInt(this.col.style.width) <= o.minWidth) ? "addClass":"removeClass"](o.classMinimized)
              });
          });
        o.renderTime = new Date().getTime() - o.renderTime;
        o.onLoad();
      });
    return this;
  };
  $.fn.kiketable_colsizable.defaults = {
    dragCells :		"tr:first > *",// cells for allocating column sizing handlers (by default: all cells of first row)
    dragMove :		true,		// see column moving its width? (true/false)
    dragProxy :		"line",		// Shape of dragging ghost ("line"/"area")
    dragOpacity :	.3,			// Opacity for dragging ghost (0 - 1)
    minWidth :		8,			// width for minimized column (px)
    fixWidth :		false,		// table with fixed width? (true/false)
    fxHide :		"fadeOut",	// effect for hiding (fadeOut/hide/slideUp)
    fxSpeed:		200,		// speed for hiding (miliseconds)
    namespace :		"kiketable-colsizable",
    classHandler :	"kiketable-colsizable-handler",
    classDragLine :	"kiketable-colsizable-dragLine",
    classDragArea :	"kiketable-colsizable-dragArea",
    classMinimized: "kiketable-colsizable-minimized",
    title :			'Expand/Collapse this column',
    renderTime :	0,
    onLoad : function(){}
  };
}) (jQuery);
(function(B){var A={listTargetID:null,onClass:"",offClass:"",hideInList:[],colsHidden:[],saveState:false,onToggle:null,show:function(K){D(K)},hide:function(K){C(K)}};var J=0;var G="columnManagerC";var H=function(M){var N="",L=0,K=M.cMColsVisible;if(M.cMSaveState&&M.id&&K&&B.cookie){for(;L<K.length;L++){N+=(K[L]==false)?0:1}B.cookie(G+M.id,N,{expires:9999})}};var C=function(K){if(jQuery.browser.msie){(C=function(L){L.style.setAttribute("display","none")})(K)}else{(C=function(L){L.style.display="none"})(K)}};var D=function(K){if(jQuery.browser.msie){(D=function(L){L.style.setAttribute("display","block")})(K)}else{(D=function(L){L.style.display="table-cell"})(K)}};var F=function(K){if(jQuery.browser.msie){return(F=function(L){return L.style.getAttribute("display")!="none"})(K)}else{return(F=function(L){return L.style.display!="none"})(K)}};var I=function(N,L,K){for(var M=0;M<L.length;M++){if(L[M].realIndex===undefined){E(N)}if(L[M].realIndex==K){return L[M]}}return null};var E=function(X){var Z=X.rows;var R=Z.length;var W=[];for(var P=0;P<R;P++){var Y=Z[P].cells;var V=Y.length;for(var O=0;O<V;O++){var U=Y[O];var T=U.rowSpan||1;var Q=U.colSpan||1;var S=-1;if(!W[P]){W[P]=[]}var L=W[P];while(L[++S]){}U.realIndex=S;for(var N=P;N<P+T;N++){if(!W[N]){W[N]=[]}var K=W[N];for(var M=S;M<S+Q;M++){K[M]=1}}}}};B.fn.columnManager=function(N){var O=B.extend({},A,N);var M=function(X){if(!O.listTargetID){return }var P=B("#"+O.listTargetID);if(!P.length){return }var W=null;if(X.tHead&&X.tHead.length){W=X.tHead.rows[0]}else{if(X.rows.length){W=X.rows[0]}else{return }}var Y=W.cells;if(!Y.length){return }var R=null;if(P.get(0).nodeName.toUpperCase()=="UL"){R=P}else{R=B("<ul></ul>");P.append(R)}var T=X.cMColsVisible;for(var Q=0;Q<Y.length;Q++){if(B.inArray(Q+1,O.hideInList)>=0){continue}T[Q]=(T[Q]!==undefined)?T[Q]:true;var V=B(Y[Q]).text(),S;if(!V.length){V=B(Y[Q]).html();if(!V.length){V="undefined"}}if(T[Q]&&O.onClass){S=O.onClass}else{if(!T[Q]&&O.offClass){S=O.offClass}}var U=B("<li class=\""+S+"\">"+V+"</li>").click(L);U[0].cmData={id:X.id,col:Q};R.append(U)}X.cMColsVisible=T};var L=function(){var S=this.cmData;if(S&&S.id&&S.col>=0){var Q=S.col,R=B("#"+S.id);if(R.length){R.toggleColumns([Q+1],O);var P=R.get(0).cMColsVisible;if(O.onToggle){O.onToggle.apply(R.get(0),[Q+1,P[Q]])}}}};var K=function(R){var S=B.cookie(G+R);if(S){var P=S.split("");for(var Q=0;Q<P.length;Q++){P[Q]&=1}return P}return false};return this.each(function(){this.id=this.id||"jQcM0O"+J++;var S,R=[],Q=[];E(this);if(O.colsHidden.length){for(S=0;S<O.colsHidden.length;S++){Q[O.colsHidden[S]-1]=true;R[O.colsHidden[S]-1]=true}}if(O.saveState){var T=K(this.id);if(T&&T.length){for(S=0;S<T.length;S++){Q[S]=true;R[S]=!T[S]}}this.cMSaveState=true}this.cMColsVisible=Q;if(R.length){var P=[];for(S=0;S<R.length;S++){if(R[S]){P[P.length]=S+1}}if(P.length){B(this).toggleColumns(P)}}M(this)})};B.fn.toggleColumns=function(K,L){return this.each(function(){var P,Q,S,Y=this.rows,R=this.cMColsVisible;if(!K){return }if(K.constructor==Number){K=[K]}if(!R){R=this.cMColsVisible=[]}for(P=0;P<Y.length;P++){var X=Y[P].cells;for(var O=0;O<K.length;O++){var M=K[O]-1;if(M>=0){var U=I(this,X,M);if(!U){var N=M;while(N>0&&!(U=I(this,X,--N))){}if(!U){continue}}if(R[M]==undefined){R[M]=true}if(R[M]){Q=L&&L.hide?L.hide:C;S=-1}else{Q=L&&L.show?L.show:D;S=1}if(!U.chSpan){U.chSpan=0}if(U.colSpan>1||(S==1&&U.chSpan&&F(U))){if(U.realIndex+U.colSpan+U.chSpan-1<M){continue}U.colSpan+=S;U.chSpan+=S*-1}else{if(U.realIndex+U.chSpan<M){continue}else{Q(U)}}}}}for(P=0;P<K.length;P++){this.cMColsVisible[K[P]-1]=!R[K[P]-1];if(L&&L.listTargetID&&(L.onClass||L.offClass)){var W=L.onClass,V=L.offClass,T;if(R[K[P]-1]){W=V;V=L.onClass}T=B("#"+L.listTargetID+" li").filter(function(){return this.cmData&&this.cmData.col==K[P]-1});if(W){T.removeClass(W)}if(V){T.addClass(V)}}}H(this)})};B.fn.showColumns=function(K,L){return this.each(function(){var N,O=[],M=this.cMColsVisible;if(M){if(K&&K.constructor==Number){K=[K]}for(N=0;N<M.length;N++){if(!M[N]&&(!K||B.inArray(N+1,K)>-1)){O.push(N+1)}}B(this).toggleColumns(O,L)}})};B.fn.hideColumns=function(K,L){return this.each(function(){var N,O=K,M=this.cMColsVisible;if(M){if(K.constructor==Number){K=[K]}O=[];for(N=0;N<K.length;N++){if(M[K[N]-1]||M[K[N]-1]==undefined){O.push(K[N])}}}B(this).toggleColumns(O,L)})}})(jQuery);
/**
 * bootstrap-multiselect.js
 * https://github.com/davidstutz/bootstrap-multiselect
 *
 * Copyright 2012, 2013 David Stutz
 *
 * Dual licensed under the BSD-3-Clause and the Apache License, Version 2.0.
 */

!function($) {

  "use strict";// jshint ;_;

  if (typeof ko !== 'undefined' && ko.bindingHandlers && !ko.bindingHandlers.multiselect) {
    ko.bindingHandlers.multiselect = {
      init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {},
      update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

        var config = ko.utils.unwrapObservable(valueAccessor());
        var selectOptions = allBindingsAccessor().options();
        var ms = $(element).data('multiselect');

        if (!ms) {
          $(element).multiselect(config);
        }
        else {
          ms.updateOriginalOptions();
          if (selectOptions && selectOptions.length !== ms.originalOptions.length) {
            $(element).multiselect('rebuild');
          }
        }
      }
    };
  }

  function Multiselect(select, options) {

    this.options = this.mergeOptions(options);
    this.$select = $(select);

    // Initialization.
    // We have to clone to create a new reference.
    this.originalOptions = this.$select.clone()[0].options;
    this.query = '';
    this.searchTimeout = null;

    this.options.multiple = this.$select.attr('multiple') === "multiple";
    this.options.onChange = $.proxy(this.options.onChange, this);
    this.options.onDropdownShow = $.proxy(this.options.onDropdownShow, this);
    this.options.onDropdownHide = $.proxy(this.options.onDropdownHide, this);

    // Build select all if enabled.
    this.buildContainer();
    this.buildButton();
    this.buildSelectAll();
    this.buildDropdown();
    this.buildDropdownOptions();
    this.buildFilter();
    this.updateButtonText();

    this.$select.hide().after(this.$container);
  };

  Multiselect.prototype = {

    // Default options.
    defaults: {
      // Default text function will either print 'None selected' in case no
      // option is selected, or a list of the selected options up to a length of 3 selected options by default.
      // If more than 3 options are selected, the number of selected options is printed.
      buttonText: function(options, select) {
        if (options.length === 0) {
          return this.nonSelectedText + ' <b class="caret"></b>';
        }
        else {
          if (options.length > this.numberDisplayed) {
            return options.length + ' ' + this.nSelectedText + ' <b class="caret"></b>';
          }
          else {
            var selected = '';
            options.each(function() {
              var label = ($(this).attr('label') !== undefined) ? $(this).attr('label') : $(this).html();

              selected += label + ', ';
            });
            return selected.substr(0, selected.length - 2) + ' <b class="caret"></b>';
          }
        }
      },
      // Like the buttonText option to update the title of the button.
      buttonTitle: function(options, select) {
        if (options.length === 0) {
          return this.nonSelectedText;
        }
        else {
          var selected = '';
          options.each(function () {
            selected += $(this).text() + ', ';
          });
          return selected.substr(0, selected.length - 2);
        }
      },
      // Create label
      label: function( element ){
        return $(element).attr('label') || $(element).html();
      },
      // Is triggered on change of the selected options.
      onChange : function(option, checked) {

      },
      // Triggered immediately when dropdown shown
      onDropdownShow: function(event) {

      },
      // Triggered immediately when dropdown hidden
      onDropdownHide: function(event) {

      },
      buttonClass: 'btn btn-default',
      dropRight: false,
      selectedClass: 'active',
      buttonWidth: 'auto',
      buttonContainer: '<div class="btn-group" />',
      // Maximum height of the dropdown menu.
      // If maximum height is exceeded a scrollbar will be displayed.
      maxHeight: false,
      includeSelectAllOption: false,
      selectAllText: ' Select all',
      selectAllValue: 'multiselect-all',
      enableFiltering: false,
      enableCaseInsensitiveFiltering: false,
      filterPlaceholder: 'Search',
      // possible options: 'text', 'value', 'both'
      filterBehavior: 'text',
      preventInputChangeEvent: false,
      nonSelectedText: 'None selected',
      nSelectedText: 'selected',
      numberDisplayed: 3
    },

    // Templates.
    templates: {
      button: '<button type="button" class="multiselect dropdown-toggle" data-toggle="dropdown"></button>',
      ul: '<ul class="multiselect-container dropdown-menu"></ul>',
      filter: '<div class="input-group"><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span><input class="form-control multiselect-search" type="text"></div>',
      li: '<li><a href="javascript:void(0);"><label></label></a></li>',
      liGroup: '<li><label class="multiselect-group"></label></li>'
    },

    constructor: Multiselect,

    buildContainer: function() {
      this.$container = $(this.options.buttonContainer);
      this.$container.on('show.bs.dropdown', this.options.onDropdownShow);
      this.$container.on('hide.bs.dropdown', this.options.onDropdownHide);
    },

    buildButton: function() {
      // Build button.
      this.$button = $(this.templates.button).addClass(this.options.buttonClass);

      // Adopt active state.
      if (this.$select.prop('disabled')) {
        this.disable();
      }
      else {
        this.enable();
      }

      // Manually add button width if set.
      if (this.options.buttonWidth) {
        this.$button.css({
          'width' : this.options.buttonWidth
        });
      }

      // Keep the tab index from the select.
      var tabindex = this.$select.attr('tabindex');
      if (tabindex) {
        this.$button.attr('tabindex', tabindex);
      }

      this.$container.prepend(this.$button);
    },

    // Build dropdown container ul.
    buildDropdown: function() {

      // Build ul.
      this.$ul = $(this.templates.ul);

      if (this.options.dropRight) {
        this.$ul.addClass('pull-right');
      }

      // Set max height of dropdown menu to activate auto scrollbar.
      if (this.options.maxHeight) {
        // TODO: Add a class for this option to move the css declarations.
        this.$ul.css({
          'max-height': this.options.maxHeight + 'px',
          'overflow-y': 'auto',
          'overflow-x': 'hidden'
        });
      }

      this.$container.append(this.$ul);
    },

    // Build the dropdown and bind event handling.
    buildDropdownOptions: function() {

      this.$select.children().each($.proxy(function(index, element) {
        // Support optgroups and options without a group simultaneously.
        var tag = $(element).prop('tagName')
          .toLowerCase();

        if (tag === 'optgroup') {
          this.createOptgroup(element);
        }
        else if (tag === 'option') {
          this.createOptionValue(element);
        }
        // Other illegal tags will be ignored.
      }, this));

      // Bind the change event on the dropdown elements.
      $('li input', this.$ul).on('change', $.proxy(function(event) {
        var checked = $(event.target).prop('checked') || false;
        var isSelectAllOption = $(event.target).val() === this.options.selectAllValue;

        // Apply or unapply the configured selected class.
        if (this.options.selectedClass) {
          if (checked) {
            $(event.target).parents('li')
              .addClass(this.options.selectedClass);
          }
          else {
            $(event.target).parents('li')
              .removeClass(this.options.selectedClass);
          }
        }

        // Get the corresponding option.
        var value = $(event.target).val();
        var $option = this.getOptionByValue(value);

        var $optionsNotThis = $('option', this.$select).not($option);
        var $checkboxesNotThis = $('input', this.$container).not($(event.target));

        if (isSelectAllOption) {
          if (this.$select[0][0].value === this.options.selectAllValue) {
            var values = [];
            var options = $('option[value!="' + this.options.selectAllValue + '"]', this.$select);
            for (var i = 0; i < options.length; i++) {
              // Additionally check whether the option is visible within the dropcown.
              if (options[i].value !== this.options.selectAllValue && this.getInputByValue(options[i].value).is(':visible')) {
                values.push(options[i].value);
              }
            }

            if (checked) {
              this.select(values);
            }
            else {
              this.deselect(values);
            }
          }
        }

        if (checked) {
          $option.prop('selected', true);

          if (this.options.multiple) {
            // Simply select additional option.
            $option.prop('selected', true);
          }
          else {
            // Unselect all other options and corresponding checkboxes.
            if (this.options.selectedClass) {
              $($checkboxesNotThis).parents('li').removeClass(this.options.selectedClass);
            }

            $($checkboxesNotThis).prop('checked', false);
            $optionsNotThis.prop('selected', false);

            // It's a single selection, so close.
            this.$button.click();
          }

          if (this.options.selectedClass === "active") {
            $optionsNotThis.parents("a").css("outline", "");
          }
        }
        else {
          // Unselect option.
          $option.prop('selected', false);
        }

        this.$select.change();
        this.options.onChange($option, checked);
        this.updateButtonText();

        if(this.options.preventInputChangeEvent) {
          return false;
        }
      }, this));

      $('li a', this.$ul).on('touchstart click', function(event) {
        event.stopPropagation();

        if (event.shiftKey) {
          var checked = $(event.target).prop('checked') || false;

          if (checked) {
            var prev = $(event.target).parents('li:last')
              .siblings('li[class="active"]:first');

            var currentIdx = $(event.target).parents('li')
              .index();
            var prevIdx = prev.index();

            if (currentIdx > prevIdx) {
              $(event.target).parents("li:last").prevUntil(prev).each(
                function() {
                  $(this).find("input:first").prop("checked", true)
                    .trigger("change");
                }
              );
            }
            else {
              $(event.target).parents("li:last").nextUntil(prev).each(
                function() {
                  $(this).find("input:first").prop("checked", true)
                    .trigger("change");
                }
              );
            }
          }
        }

        $(event.target).blur();
      });

      // Keyboard support.
      this.$container.on('keydown', $.proxy(function(event) {
        if ($('input[type="text"]', this.$container).is(':focus')) {
          return;
        }
        if ((event.keyCode === 9 || event.keyCode === 27) && this.$container.hasClass('open')) {
          // Close on tab or escape.
          this.$button.click();
        }
        else {
          var $items = $(this.$container).find("li:not(.divider):visible a");

          if (!$items.length) {
            return;
          }

          var index = $items.index($items.filter(':focus'));

          // Navigation up.
          if (event.keyCode === 38 && index > 0) {
            index--;
          }
          // Navigate down.
          else if (event.keyCode === 40 && index < $items.length - 1) {
            index++;
          }
          else if (!~index) {
            index = 0;
          }

          var $current = $items.eq(index);
          $current.focus();

          if (event.keyCode === 32 || event.keyCode === 13) {
            var $checkbox = $current.find('input');

            $checkbox.prop("checked", !$checkbox.prop("checked"));
            $checkbox.change();
          }

          event.stopPropagation();
          event.preventDefault();
        }
      }, this));
    },

    // Will build an dropdown element for the given option.
    createOptionValue: function(element) {
      if ($(element).is(':selected')) {
        $(element).prop('selected', true);
      }

      // Support the label attribute on options.
      var label = this.options.label(element);
      var value = $(element).val();
      var inputType = this.options.multiple ? "checkbox" : "radio";

      var $li = $(this.templates.li);
      $('label', $li).addClass(inputType);
      $('label', $li).append('<input type="' + inputType + '" />');

      var selected = $(element).prop('selected') || false;
      var $checkbox = $('input', $li);
      $checkbox.val(value);

      if (value === this.options.selectAllValue) {
        $checkbox.parent().parent()
          .addClass('multiselect-all');
      }

      $('label', $li).append(" " + label);

      this.$ul.append($li);

      if ($(element).is(':disabled')) {
        $checkbox.attr('disabled', 'disabled')
          .prop('disabled', true)
          .parents('li')
          .addClass('disabled');
      }

      $checkbox.prop('checked', selected);

      if (selected && this.options.selectedClass) {
        $checkbox.parents('li')
          .addClass(this.options.selectedClass);
      }
    },

    // Create optgroup.
    createOptgroup: function(group) {
      var groupName = $(group).prop('label');

      // Add a header for the group.
      var $li = $(this.templates.liGroup);
      $('label', $li).text(groupName);

      this.$ul.append($li);

      // Add the options of the group.
      $('option', group).each($.proxy(function(index, element) {
        this.createOptionValue(element);
      }, this));
    },

    // Add the select all option to the select.
    buildSelectAll: function() {
      var alreadyHasSelectAll = this.$select[0][0] ? this.$select[0][0].value === this.options.selectAllValue : false;

      // If options.includeSelectAllOption === true, add the include all checkbox.
      if (this.options.includeSelectAllOption && this.options.multiple && !alreadyHasSelectAll) {
        this.$select.prepend('<option value="' + this.options.selectAllValue + '">' + this.options.selectAllText + '</option>');
      }
    },

    // Build and bind filter.
    buildFilter: function() {

      // Build filter if filtering OR case insensitive filtering is enabled and the number of options exceeds (or equals) enableFilterLength.
      if (this.options.enableFiltering || this.options.enableCaseInsensitiveFiltering) {
        var enableFilterLength = Math.max(this.options.enableFiltering, this.options.enableCaseInsensitiveFiltering);

        if (this.$select.find('option').length >= enableFilterLength) {

          this.$filter = $(this.templates.filter);
          $('input', this.$filter).attr('placeholder', this.options.filterPlaceholder);
          this.$ul.prepend(this.$filter);

          this.$filter.val(this.query).on('click', function(event) {
            event.stopPropagation();
          }).on('keydown', $.proxy(function(event) {
              // This is useful to catch "keydown" events after the browser has updated the control.
              clearTimeout(this.searchTimeout);

              this.searchTimeout = this.asyncFunction($.proxy(function() {

                if (this.query !== event.target.value) {
                  this.query = event.target.value;

                  $.each($('li', this.$ul), $.proxy(function(index, element) {
                    var value = $('input', element).val();
                    var text = $('label', element).text();

                    if (value !== this.options.selectAllValue && text) {
                      // by default lets assume that element is not
                      // interesting for this search
                      var showElement = false;

                      var filterCandidate = '';
                      if ((this.options.filterBehavior === 'text' || this.options.filterBehavior === 'both')) {
                        filterCandidate = text;
                      }
                      if ((this.options.filterBehavior === 'value' || this.options.filterBehavior === 'both')) {
                        filterCandidate = value;
                      }

                      if (this.options.enableCaseInsensitiveFiltering && filterCandidate.toLowerCase().indexOf(this.query.toLowerCase()) > -1) {
                        showElement = true;
                      }
                      else if (filterCandidate.indexOf(this.query) > -1) {
                        showElement = true;
                      }

                      if (showElement) {
                        $(element).show();
                      }
                      else {
                        $(element).hide();
                      }
                    }
                  }, this));
                }

                // TODO: check whether select all option needs to be updated.
              }, this), 300, this);
            }, this));
        }
      }
    },

    // Destroy - unbind - the plugin.
    destroy: function() {
      this.$container.remove();
      this.$select.show();
    },

    // Refreshs the checked options based on the current state of the select.
    refresh: function() {
      $('option', this.$select).each($.proxy(function(index, element) {
        var $input = $('li input', this.$ul).filter(function() {
          return $(this).val() === $(element).val();
        });

        if ($(element).is(':selected')) {
          $input.prop('checked', true);

          if (this.options.selectedClass) {
            $input.parents('li')
              .addClass(this.options.selectedClass);
          }
        }
        else {
          $input.prop('checked', false);

          if (this.options.selectedClass) {
            $input.parents('li')
              .removeClass(this.options.selectedClass);
          }
        }

        if ($(element).is(":disabled")) {
          $input.attr('disabled', 'disabled')
            .prop('disabled', true)
            .parents('li')
            .addClass('disabled');
        }
        else {
          $input.prop('disabled', false)
            .parents('li')
            .removeClass('disabled');
        }
      }, this));

      this.updateButtonText();
    },

    // Select an option by its value or multiple options using an array of values.
    select: function(selectValues) {
      if(selectValues && !$.isArray(selectValues)) {
        selectValues = [selectValues];
      }

      for (var i = 0; i < selectValues.length; i++) {
        var value = selectValues[i];

        var $option = this.getOptionByValue(value);
        var $checkbox = this.getInputByValue(value);

        if (this.options.selectedClass) {
          $checkbox.parents('li')
            .addClass(this.options.selectedClass);
        }

        $checkbox.prop('checked', true);
        $option.prop('selected', true);
        this.options.onChange($option, true);
      }

      this.updateButtonText();
    },

    // Deselect an option by its value or using an array of values.
    deselect: function(deselectValues) {
      if(deselectValues && !$.isArray(deselectValues)) {
        deselectValues = [deselectValues];
      }

      for (var i = 0; i < deselectValues.length; i++) {

        var value = deselectValues[i];

        var $option = this.getOptionByValue(value);
        var $checkbox = this.getInputByValue(value);

        if (this.options.selectedClass) {
          $checkbox.parents('li')
            .removeClass(this.options.selectedClass);
        }

        $checkbox.prop('checked', false);
        $option.prop('selected', false);
        this.options.onChange($option, false);
      }

      this.updateButtonText();
    },

    // Rebuild the whole dropdown menu.
    rebuild: function() {
      this.$ul.html('');

      // Remove select all option in select.
      $('option[value="' + this.options.selectAllValue + '"]', this.$select).remove();

      // Important to distinguish between radios and checkboxes.
      this.options.multiple = this.$select.attr('multiple') === "multiple";

      this.buildSelectAll();
      this.buildDropdownOptions();
      this.updateButtonText();
      this.buildFilter();
    },

    // Build select using the given data as options.
    dataprovider: function(dataprovider) {
      var optionDOM = "";
      dataprovider.forEach(function (option) {
        optionDOM += '<option value="' + option.value + '">' + option.label + '</option>';
      });

      this.$select.html(optionDOM);
      this.rebuild();
    },

    // Enable button.
    enable: function() {
      this.$select.prop('disabled', false);
      this.$button.prop('disabled', false)
        .removeClass('disabled');
    },

    // Disable button.
    disable: function() {
      this.$select.prop('disabled', true);
      this.$button.prop('disabled', true)
        .addClass('disabled');
    },

    // Set options.
    setOptions: function(options) {
      this.options = this.mergeOptions(options);
    },

    // Get options by merging defaults and given options.
    mergeOptions: function(options) {
      return $.extend({}, this.defaults, options);
    },

    // Update button text and button title.
    updateButtonText: function() {
      var options = this.getSelected();

      // First update the displayed button text.
      $('button', this.$container).html(this.options.buttonText(options, this.$select));

      // Now update the title attribute of the button.
      $('button', this.$container).attr('title', this.options.buttonTitle(options, this.$select));

    },

    // Get all selected options.
    getSelected: function() {
      return $('option[value!="' + this.options.selectAllValue + '"]:selected', this.$select).filter(function() {
        return $(this).prop('selected');
      });
    },

    // Get the corresponding option by ts value.
    getOptionByValue: function(value) {
      return $('option', this.$select).filter(function() {
        return $(this).val() === value;
      });
    },

    // Get an input in the dropdown by its value.
    getInputByValue: function(value) {
      return $('li input', this.$ul).filter(function() {
        return $(this).val() === value;
      });
    },

    updateOriginalOptions: function() {
      this.originalOptions = this.$select.clone()[0].options;
    },

    asyncFunction: function(callback, timeout, self) {
      var args = Array.prototype.slice.call(arguments, 3);
      return setTimeout(function() {
        callback.apply(self || window, args);
      }, timeout);
    }
  };

  $.fn.multiselect = function(option, parameter) {
    return this.each(function() {
      var data = $(this).data('multiselect');
      var options = typeof option === 'object' && option;

      // Initialize the multiselect.
      if (!data) {
        $(this).data('multiselect', ( data = new Multiselect(this, options)));
      }

      // Call multiselect method.
      if (typeof option === 'string') {
        data[option](parameter);
      }
    });
  };

  $.fn.multiselect.Constructor = Multiselect;

  // Automatically init selects by their data-role.
  $(function() {
    $("select[data-role=multiselect]").multiselect();
  });

}(window.jQuery);






$(function () {
  $.fn.init_rapid_data_entry_form = function ($modal, uri) {
    $(this).each(function () {
      var $rde_form = $(this);
      var $table = $('table#rdeTable', $rde_form);

      if ($rde_form.hasClass('initialised')) {
        return;
      }

      $('.linker:not(.initialised)').linker();

      // Cookie Names
      var COOKIE_NAME_VISIBLE_COLUMN =
        'rde.' + $rde_form.data('cookie-prefix') + '.visible';
      var COOKIE_NAME_STICKY_COLUMN =
        'rde.' + $rde_form.data('cookie-prefix') + '.sticky';
      var COOKIE_NAME_COLUMN_WIDTHS =
        'rde.' + $rde_form.data('cookie-prefix') + '.widths';
      var COOKIE_NAME_COLUMN_ORDER =
        'rde.' + $rde_form.data('cookie-prefix') + '.order';

      // Config from Cookies
      var STICKY_COLUMN_IDS = AS.prefixed_cookie(COOKIE_NAME_STICKY_COLUMN)
        ? JSON.parse(AS.prefixed_cookie(COOKIE_NAME_STICKY_COLUMN))
        : null;
      var COLUMN_WIDTHS = AS.prefixed_cookie(COOKIE_NAME_COLUMN_WIDTHS)
        ? JSON.parse(AS.prefixed_cookie(COOKIE_NAME_COLUMN_WIDTHS))
        : null;
      var COLUMN_ORDER = AS.prefixed_cookie(COOKIE_NAME_COLUMN_ORDER)
        ? JSON.parse(AS.prefixed_cookie(COOKIE_NAME_COLUMN_ORDER))
        : null;
      var DEFAULT_VALUES = {};
      // jquery.columnmanager gets wonky if the first pass through column
      // order needs to unhide anything, so don't load visibility yet
      var VISIBLE_COLUMN_IDS;

      // store section data
      var SECTION_DATA = {};
      $('.sections th', $table).each(function () {
        SECTION_DATA[$(this).data('id')] = $(this).text();
      });

      var validateSubmissionOnly = false;

      $modal.off('click').on('click', '.remove-row', function (event) {
        event.preventDefault();
        event.stopPropagation();

        var $btn = $(event.target).closest('button');

        if ($btn.hasClass('btn-danger')) {
          $btn.closest('tr').remove();
        } else {
          $btn.addClass('btn-danger');
          $('span', $btn).addClass('icon-white');
          setTimeout(function () {
            $btn.removeClass('btn-danger');
            $('span', $btn).removeClass('icon-white');
          }, 10000);
        }
      });

      $modal.on('click', '#rde_reset', function (event) {
        event.preventDefault();
        event.stopPropagation();

        $(':input, .btn', $rde_form).attr('disabled', 'disabled');

        // reset cookies
        AS.prefixed_cookie(COOKIE_NAME_VISIBLE_COLUMN, null);
        AS.prefixed_cookie(COOKIE_NAME_COLUMN_WIDTHS, null);
        AS.prefixed_cookie(COOKIE_NAME_STICKY_COLUMN, null);
        AS.prefixed_cookie(COOKIE_NAME_COLUMN_ORDER, null);

        VISIBLE_COLUMN_IDS = null;
        STICKY_COLUMN_IDS = null;
        COLUMN_WIDTHS = null;
        COLUMN_ORDER = null;

        // reload the form
        $(document).triggerHandler('rdeload.aspace', [uri, $modal]);
      });

      $modal.on('click', '.add-row', function (event) {
        event.preventDefault();
        event.stopPropagation();

        var $row = addRow(event);

        $(':input:visible:first', $row).focus();

        $('.linker:not(.initialised)').linker();

        validateRows($row);
      });

      var setRowIndex = function () {
        current_row_index = Math.max($('tbody tr', $table).length - 1, 0);
        $('tbody tr', $table).each(function (i, row) {
          $(row).data('index', i);
        });
      };
      var current_row_index = 0;
      setRowIndex();

      var addRow = function (event) {
        var $currentRow = $(event.target).closest('tr');
        if ($currentRow.length === 0) {
          $currentRow = $('table tbody tr:last', $rde_form);
        }

        current_row_index = current_row_index + 1;

        var $row = $(
          AS.renderTemplate(
            'template_rde_' + $rde_form.data('child-type') + '_row',
            {
              path:
                $rde_form.data('jsonmodel-type') +
                '[children][' +
                current_row_index +
                ']',
              id_path:
                $rde_form.data('jsonmodel-type') +
                '_children__' +
                current_row_index +
                '_',
              index: current_row_index,
            }
          )
        );

        $row.data('index', current_row_index);

        $('.fieldset-labels th', $rde_form).each(function (i, th) {
          var $th = $(th);

          var $target;

          // Apply any sticky columns
          if ($currentRow.length > 0) {
            if ($th.hasClass('fieldset-label') && $th.hasClass('sticky')) {
              // populate the input from the current or bottom row
              var $source = $(':input:first', $('td', $currentRow).get(i));
              $target = $(':input:first', $('td', $row).get(i));

              if ($source.is(':checkbox')) {
                if ($source.is(':checked')) {
                  $target.attr('checked', 'checked');
                } else {
                  $target.removeAttr('checked');
                }
              } else if (
                $source.is(':hidden') &&
                $source.parents().closest('div').hasClass('linker-wrapper')
              ) {
                // a linker!
                $target.attr('data-selected', $source.val());
              } else if ($source.is('.linker:text')) {
                // $source is a yet to be initialized linker (when adding multiple rows)
                $target.attr('data-selected', $source.attr('data-selected'));
              } else {
                $target.val($source.val());
              }
            } else if (DEFAULT_VALUES[$th.attr('id')]) {
              $target = $(':input:first', $('td', $row).get(i));
              $target.val(DEFAULT_VALUES[$th.attr('id')]);
            }
          }

          // Apply hidden columns
          if ($th.hasClass('fieldset-label') && !isVisible($th.attr('id'))) {
            $($('td', $row).get(i)).hide();
          }

          // Apply column order
          if (COLUMN_ORDER != null) {
            $.each(COLUMN_ORDER, function (targetIndex, colId) {
              var $td = $("td[data-col='" + colId + "']", $row);
              var currentIndex = $td.index();

              if (targetIndex !== currentIndex) {
                $td.insertBefore($('td', $row).get(targetIndex));
              }
            });
          }
        });

        $currentRow.after($row);
        initOtherLevelHandler(current_row_index);
        initRestrictionDatesHandler($row);
        return $row;
      };

      $modal.off('keydown').on('keydown', function (event) {
        if (event.keyCode === 27) {
          //esc
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      });

      // TODO - use hotkeys for this?
      $modal.on('keydown', ":input, input[type='text']", function (event) {
        var $row = $(event.target).closest('tr');
        var $cell = $(event.target).closest('td');

        if (event.keyCode === 13) {
          // return
          event.preventDefault();

          if (event.shiftKey) {
            $('.add-row', $row).trigger('click');
            $(
              ':input:visible:first',
              $('td', $row.next())[$cell.index()]
            ).focus();
          }
        } else if (event.keyCode === 27) {
          //esc
          event.preventDefault();
          event.stopImmediatePropagation();
          return true;
        } else if (event.keyCode === 37) {
          // left
          if (event.shiftKey) {
            event.preventDefault();
            $(':input:visible:first', prevActiveCell($cell)).focus();
          }
        } else if (event.keyCode === 40) {
          // down
          if (event.shiftKey) {
            event.preventDefault();
            if ($row.index() < $row.siblings().length) {
              $(
                ':input:visible:first',
                $('td', $row.next())[$cell.index()]
              ).focus();
            }
          }
        } else if (event.keyCode === 38) {
          // up
          if (event.shiftKey) {
            event.preventDefault();
            if ($row.index() > 0) {
              $(
                ':input:visible:first',
                $('td', $row.prev())[$cell.index()]
              ).focus();
            }
          }
        } else if (event.keyCode === 39) {
          // right
          if (event.shiftKey) {
            event.preventDefault();
            $(':input:visible:first', nextActiveCell($cell)).focus();
          }
        } else {
          // we're cool.
        }
      });

      $modal.on('click', 'th.fieldset-label', function (event) {
        $(this).toggleClass('sticky');
        var sticky = [];
        $('table th.sticky', $rde_form).each(function () {
          sticky.push($(this).attr('id'));
        });
        STICKY_COLUMN_IDS = sticky;
        AS.prefixed_cookie(
          COOKIE_NAME_STICKY_COLUMN,
          JSON.stringify(STICKY_COLUMN_IDS)
        );
      });

      $modal.on('click', '[data-dismiss]', function (event) {
        $modal.modal('hide');
      });

      var renderInlineErrors = function ($rows, exception_data) {
        $('.linker:not(.initialised)').linker();
        $rows.each(function (i, row) {
          var $row = $(row);
          var row_result = exception_data[i];
          var $errorSummary = $('.error-summary', $row);
          var $errorSummaryList = $('.error-summary-list', $errorSummary);

          $errorSummaryList.empty();

          if (
            Object.prototype.hasOwnProperty.call(row_result, 'errors') &&
            !$.isEmptyObject(row_result.errors)
          ) {
            $row.removeClass('valid').addClass('invalid');

            $.each(row_result.errors, function (name, error) {
              var $input = $(
                "[id='" +
                  $rde_form.data('jsonmodel-type') +
                  '_children__' +
                  $row.data('index') +
                  '__' +
                  name.replace(/\//g, '__') +
                  "_']",
                $row
              );
              var $header = $(
                $('.fieldset-labels th', $table).get(
                  $input.first().closest('td').index()
                )
              );

              $input.closest('.form-group').addClass('has-error');

              var $error = $("<div class='error'>");

              if ($input.length > 1 || $input.hasClass('defer-to-section')) {
                $error.text(SECTION_DATA[$header.data('section')]);
              } else {
                $error.text(
                  $(
                    $('.fieldset-labels th', $table).get(
                      $input.closest('td').index()
                    )
                  ).text()
                );
              }
              $error.append(' - ').append(error);
              $error.append("<span class='glyphicon glyphicon-chevron-right'>");
              $errorSummaryList.append($error);

              $error.data('target', $input.first().attr('id'));
            });

            // force a reposition of the error summary
            $('.modal-body', $modal).trigger('scroll');
          } else {
            $row.removeClass('invalid').addClass('valid');
          }
        });
      };

      var initAjaxForm = function () {
        $rde_form.ajaxForm({
          target: $('.rde-wrapper', $modal),
          success: function () {
            $(window).trigger('resize');
            $rde_form = $('form', '#rapidDataEntryModal');
            $table = $('table', $rde_form);

            setRowIndex();

            if ($rde_form.length) {
              renderInlineErrors(
                $('tbody tr', $rde_form),
                $rde_form.data('exceptions')
              );

              initAjaxForm();
            } else {
              // we're good to go!
              setTimeout(function () {
                location.reload(true);
              }, 1000);
            }
          },
        });

        // add ability to resize columns
        $table.kiketable_colsizable({
          dragCells: 'tr.fieldset-labels th.fieldset-label',
          dragMove: true,
        });
        $('th.fieldset-label .kiketable-colsizable-handler', $table).on(
          'dragend',
          persistColumnWidths
        );

        // add show/hide
        $table.columnManager();

        // give the columns an id
        $('table thead .fieldset-labels th').each(function (i, col) {
          if (!$(col).attr('id')) {
            $(col).attr('id', 'rdecol' + i);
          }
          $($('table colgroup col').get(i)).data('id', $(col).attr('id'));
        });

        initAutoValidateFeature();
        applyColumnOrder(function () {
          VISIBLE_COLUMN_IDS = AS.prefixed_cookie(COOKIE_NAME_VISIBLE_COLUMN)
            ? JSON.parse(AS.prefixed_cookie(COOKIE_NAME_VISIBLE_COLUMN))
            : null;
          applyPersistentVisibleColumns();
        });
        initColumnReorderFeature();
        initRdeTemplates();
        applyPersistentStickyColumns();
        initColumnShowHideWidget();
        initFillFeature();
        initShowInlineErrors();
        initOtherLevelHandler();
        initRestrictionDatesHandler();
      };

      var initShowInlineErrors = function () {
        if ($('button.toggle-inline-errors').hasClass('active')) {
          $table.addClass('show-inline-errors');
        } else {
          $table.removeClass('show-inline-errors');
        }
      };

      var initOtherLevelHandler = function (index = 0) {
        var $select = $("td[data-col='colLevel']:eq(" + index + ') select');

        if ($select.val() === 'otherlevel') {
          enableCell('colOtherLevel', index);
        } else {
          disableCell('colOtherLevel', index);
        }

        $select.change(function () {
          if ($(this).val() === 'otherlevel') {
            enableCell('colOtherLevel', index);
          } else {
            disableCell('colOtherLevel', index);
          }
        });
      };


      var initRestrictionDatesHandler = function (elt = null) {
        if (!elt) {
          elt = $('#rdeTable');
        }

        function handleUpdate() {
          var $select = $(this);

          var id_base = $select.attr('id').replace(/_type_$/, '');

          var restrictionsEnabled = ($select.val() === 'accessrestrict' || $select.val() === 'userestrict');

          // Find the corresponding restriction begin + end fields and set their states to match the dropdown.
          for (var range_type of ['begin', 'end', 'local_access_restriction_type[]']) {
            var input = $('#' + id_base + '_rights_restriction__' + range_type.replace(/[\[\]]/g, '_') + '_');
            input.attr('disabled', restrictionsEnabled ? null : 'disabled');

            if (restrictionsEnabled) {
              if (input.is('select') && !input.val()) {
                // Select the first option by default
                input.val(input.find('option:first').val());
              }
            } else {
              // Clear the input
              input.val('');
            }
          }
        };

        var selects = elt.find("td[data-col^='colNType'] select");

        selects.change(handleUpdate);
        selects.trigger('change');
      }


      var initAutoValidateFeature = function () {
        // Validate row upon input change
        $table.on('change', ':input:visible', function () {
          var $row = $(this).closest('tr');
          validateRows($row);
        });
        $('.modal-body', $modal).on('scroll', function (event) {
          $('.error-summary', $table).css('left', $(this)[0].scrollLeft + 5);
        });
        $table.on('focusin click', ':input', function () {
          $(this)
            .closest('tr')
            .addClass('last-focused')
            .siblings()
            .removeClass('last-focused');
        });
        $table.on('click', '.error-summary .error', function () {
          var $target = $('#' + $(this).data('target'));

          // if column is hidden, then show the column first
          if (!$target.is('visible')) {
            var colId = COLUMN_ORDER[$target.closest('td').index()];
            $('#rde_hidden_columns').multiselect('select', colId);
          }

          $target.closest('td').ScrollTo({
            axis: 'x',
            callback: function () {
              $target.focus();
            },
          });
        });
        $table.on('click', 'td.status', function (event) {
          event.preventDefault();
          event.stopPropagation();

          if ($(event.target).closest('.error-summary').length > 0) {
            // don't propagate to the status cell
            // if clicking on an error
            return;
          }

          if ($(this).closest('tr').hasClass('last-focused')) {
            $('button.toggle-inline-errors').trigger('click');
          } else {
            $(this)
              .closest('tr')
              .addClass('last-focused')
              .siblings()
              .removeClass('last-focused');
          }
        });
        $table.on(
          'click',
          '.hide-error-summary, .show-error-summary',
          function (event) {
            event.preventDefault();
            event.stopPropagation();

            $('button.toggle-inline-errors').trigger('click');
          }
        );
      };

      var initFillFeature = function () {
        var $fillFormsContainer = $('.fill-column-form', $modal);
        var $btnFillFormToggle = $('button.fill-column', $modal);

        var $sourceRow = $('table tbody tr:first', $rde_form);

        // Setup global events
        $btnFillFormToggle.click(function (event) {
          event.preventDefault();
          event.stopPropagation();

          // toggle other panel if it is active
          if (!$(this).hasClass('active')) {
            $('.active', $(this).closest('.btn-group')).trigger('click');
          }

          $btnFillFormToggle.toggleClass('active');
          $fillFormsContainer.slideToggle();
        });

        // Setup Basic Fill form
        var setupBasicFillForm = function () {
          var $form = $('#fill_basic', $fillFormsContainer);
          var $inputTargetColumn = $('#basicFillTargetColumn', $form);
          var $btnFill = $('button', $form);

          // populate the column selectors
          populateColumnSelector($inputTargetColumn);

          $inputTargetColumn.change(function () {
            $('.empty', this).remove();

            var colIndex = parseInt($('#' + $(this).val()).index());

            var $input = $(
              ':input:first',
              $('td', $sourceRow).get(colIndex)
            ).clone();
            $input.attr('name', '').attr('id', 'basicFillValue');
            $('.fill-value-container', $form).html($input);
            $btnFill.removeAttr('disabled').removeClass('disabled');
          });

          $btnFill.click(function (event) {
            event.preventDefault();
            event.stopPropagation();

            var colIndex =
              parseInt($('#' + $inputTargetColumn.val()).index()) + 1;

            var $targetCells = $(
              'table tbody tr td:nth-child(' + colIndex + ')',
              $rde_form
            );

            var fillValue;

            if ($('#basicFillValue', $form).is(':checkbox')) {
              fillValue = $('#basicFillValue', $form).is(':checked');
              if (fillValue) {
                $(':input:first', $targetCells).attr('checked', 'checked');
              } else {
                $(':input:first', $targetCells).removeAttr('checked');
              }
            } else {
              fillValue = $('#basicFillValue', $form).val();
              $(':input:first', $targetCells).val(fillValue).trigger('change');
            }

            $btnFillFormToggle.toggleClass('active');
            $fillFormsContainer.slideToggle();
            validateAllRows();
          });
        };

        // Setup Sequence Fill form
        var setupSequenceFillForm = function () {
          var $form = $('#fill_sequence', $fillFormsContainer);
          var $inputTargetColumn = $('#sequenceFillTargetColumn', $form);
          var $btnFill = $('button.btn-primary', $form);
          var $sequencePreview = $('.sequence-preview', $form);

          // populate the column selectors
          populateColumnSelector(
            $inputTargetColumn,
            null,
            function ($colHeader) {
              var $td = $('td', $sourceRow).get($colHeader.index());
              return $(':input:first', $td).is(':text');
            }
          );

          $inputTargetColumn.change(function () {
            $('.empty', this).remove();
            $btnFill.removeAttr('disabled').removeClass('disabled');
          });

          $('button.preview-sequence', $form).click(function (event) {
            event.preventDefault();
            event.stopPropagation();

            $.getJSON(
              $form.data('sequence-generator-url'),
              {
                prefix: $('#sequenceFillPrefix', $form).val(),
                from: $('#sequenceFillFrom', $form).val(),
                to: $('#sequenceFillTo', $form).val(),
                suffix: $('#sequenceFillSuffix', $form).val(),
                limit: $('tbody tr', $table).length,
              },
              function (json) {
                $sequencePreview.html('');
                if (json.errors) {
                  $.each(json.errors, function (i, error) {
                    var $error = $('<div>').html(error).addClass('text-error');
                    $sequencePreview.append($error);
                  });
                } else {
                  $sequencePreview.html(
                    $("<p class='values'>").html(json.values.join(', '))
                  );
                  $sequencePreview.prepend(
                    $("<p class='summary'>").html(json.summary)
                  );
                }
              }
            );
          });

          var applySequenceFill = function (force) {
            $('#sequenceTooSmallMsg', $form).hide();

            $.getJSON(
              $form.data('sequence-generator-url'),
              {
                prefix: $('#sequenceFillPrefix', $form).val(),
                from: $('#sequenceFillFrom', $form).val(),
                to: $('#sequenceFillTo', $form).val(),
                suffix: $('#sequenceFillSuffix', $form).val(),
                limit: $('tbody tr', $table).length,
              },
              function (json) {
                $sequencePreview.html('');
                if (json.errors) {
                  $.each(json.errors, function (i, error) {
                    var $error = $('<div>').html(error).addClass('text-error');
                    $sequencePreview.append($error);
                  });
                  return;
                }

                // check if less items in sequence than rows
                if (
                  !force &&
                  json.values.length < $('tbody tr', $modal).length
                ) {
                  $('#sequenceTooSmallMsg', $form).show();
                  return;
                }

                // Good to go. Apply values.
                var targetIndex = $('#' + $inputTargetColumn.val()).index();
                var $targetCells = $(
                  'table tbody tr td:nth-child(' + (targetIndex + 1) + ')',
                  $rde_form
                );
                $.each(json.values, function (i, val) {
                  if (i > $targetCells.length) {
                    return;
                  }
                  $(':input:first', $targetCells[i]).val(val);
                });

                $btnFillFormToggle.toggleClass('active');
                $fillFormsContainer.slideToggle();
                validateAllRows();
              }
            );
          };

          $btnFill.click(function (event) {
            event.preventDefault();
            event.stopPropagation();

            applySequenceFill(false);
          });

          $('.btn-continue-sequence-fill', $form).click(function (event) {
            event.preventDefault();
            event.stopPropagation();

            applySequenceFill(true);
          });
        };

        setupBasicFillForm();
        setupSequenceFillForm();
      };

      var persistColumnOrder = function () {
        var column_ids = [];
        $('table .fieldset-labels th', $rde_form).each(function () {
          column_ids.push($(this).attr('id'));
        });
        COLUMN_ORDER = column_ids;
        AS.prefixed_cookie(
          COOKIE_NAME_COLUMN_ORDER,
          JSON.stringify(COLUMN_ORDER)
        );
      };

      // Remove elements from `a` that appear in `b`.
      var setSubtract = function (a, b) {
        const bSet = {};
        for (const elt of b) {
          bSet[elt] = true;
        }

        const result = [];
        for (const elt of a) {
          if (!bSet[elt]) {
            result.push(elt);
          }
        }

        return result;
      }

      var applyColumnOrder = function (callback) {
        if (COLUMN_ORDER === null) {
          persistColumnOrder();
        } else {
          // apply order from cookie
          var $row = $('tr.fieldset-labels', $table);
          var $sectionRow = $('tr.sections', $table);
          var $colgroup = $('colgroup', $table);

          // If there are columns present that aren't in our order, RDE might
          // have gained some new columns since we persisted our list.
          //
          // Keep everything working by inserting the missing columns at the end
          // of the list, just before colActions.
          var missing = setSubtract($('th', 'tr.fieldset-labels').map(function () { return $(this).attr('id'); }),
                                    COLUMN_ORDER);

          COLUMN_ORDER = COLUMN_ORDER.filter((elt) => elt !== 'colActions');
          for (const elt of missing) {
            COLUMN_ORDER.push(elt);
          }

          COLUMN_ORDER.push('colActions');

          $sectionRow.html('');

          $.each(COLUMN_ORDER, function (targetIndex, colId) {
            var $th = $('#' + colId, $row);
            var currentIndex = $th.index();
            var $col = $($('col', $colgroup).get(currentIndex));

            // show hidden stuff so we get the section headers right
            // we'll reapply visibility at the end
            if (!isVisible(colId) && targetIndex > 0) {
              showColumn(currentIndex);
            }

            if (targetIndex !== currentIndex) {
              $th.insertBefore($('th', $row).get(targetIndex));
              $col.insertBefore($('col', $colgroup).get(targetIndex));
              $('tbody tr', $table).each(function (i, $tr) {
                $($('td', $tr).get(currentIndex)).insertBefore(
                  $('td', $tr).get(targetIndex)
                );
              });
            }

            // build the section row cells
            if (targetIndex === 0) {
              $sectionRow.append(
                $('<th>').data('id', 'empty').attr('colspan', '1')
              );
            } else if (
              $('th', $sectionRow).last().data('id') === $th.data('section')
            ) {
              var $lastTh = $('th', $sectionRow).last();
              $lastTh.attr('colspan', parseInt($lastTh.attr('colspan')) + 1);
            } else {
              $sectionRow.append(
                $('<th>')
                  .data('id', $th.data('section'))
                  .addClass('section-' + $th.data('section'))
                  .attr('colspan', '1')
                  .text(SECTION_DATA[$th.data('section')])
              );
            }
          });

          if (callback) {
            callback();
          }
        }
      };

      var templateList = null;
      var initRdeTemplates = function () {
        initSaveTemplateFeature();
        loadRdeTemplateList(function () {
          initManageTemplatesFeature();
          initSelectTemplateFeature();
        });
      };

      var loadRdeTemplateList = function (cb) {
        var recordType = $rde_form.data('child-type');

        $.ajax({
          url: $rde_form.data('list-templates-uri'),
          type: 'GET',
          dataType: 'json',
          success: function (_templateList_) {
            templateList = _templateList_.filter(function (t) {
              return t.record_type === recordType;
            });
            cb();
          },
          error: function (xhr, status, err) {
            console.log(err);
          },
        });
      };

      var initSaveTemplateFeature = function () {
        var $saveContainer = $('#saveTemplateForm', $modal);
        var $containerToggle = $('button.save-template', $modal);
        var $input = $('#templateName', $saveContainer);
        var $btnSave = $('.btn-primary', $saveContainer);

        // Setup global events
        $containerToggle.off('click').on('click', function (event) {
          event.preventDefault();
          event.stopPropagation();

          // toggle other panel if it is active
          if (!$(this).hasClass('active')) {
            $('.active', $(this).closest('.btn-group')).trigger('click');
          }

          $containerToggle.toggleClass('active');
          $saveContainer.slideToggle();
        });

        $input.on('change keyup paste', function () {
          if ($(this).val().length > 0) {
            $btnSave.removeAttr('disabled').removeClass('disabled');
          } else {
            $btnSave.prop('disabled', true);
          }
        });

        $btnSave.click(function (event) {
          event.preventDefault();
          event.stopPropagation();

          var template = {
            record_type: $rde_form.data('child-type'),
            name: $input.val(),
            order: [],
            visible: [],
            defaults: {},
          };

          var $firstRow = $('table tbody tr:first', $rde_form);

          $('table .fieldset-labels th', $rde_form).each(function () {
            var colId = $(this).attr('id');

            template.order.push(colId);
            if ($(this).is(':visible')) {
              template.visible.push(colId);
            }

            var $cellOne = $("td[data-col='" + colId + "']", $firstRow);

            if ($('input', $cellOne).length) {
              template.defaults[colId] = $('input', $cellOne).val();
            } else if ($('select', $cellOne).length) {
              template.defaults[colId] = $('select', $cellOne).val();
            }
          });

          template.defaults = Object.keys(template.defaults).reduce(function (
            acc,
            key
          ) {
            if (template.defaults[key].length > 0) {
              acc[key] = template.defaults[key];
            }
            return acc;
          },
          {});

          $.ajax({
            url: $rde_form.data('save-template-uri'),
            type: 'POST',
            data: { template: template },
            dataType: 'json',
            success: function (data) {
              loadRdeTemplateList(function () {
                initManageTemplatesFeature();
                initSelectTemplateFeature();
              });
              $containerToggle.toggleClass('active');
              $saveContainer.slideToggle();
            },
            error: function (xhr, status, err) {
              console.log(err);
            },
          });
        });
      };

      var initManageTemplatesFeature = function () {
        var $manageContainer = $('#manageTemplatesForm', $modal);
        var $containerToggle = $('button.manage-templates', $modal);

        var $templatesTable = $('table tbody', $manageContainer);

        $containerToggle.off('click').on('click', function (event) {
          event.preventDefault();
          event.stopPropagation();

          // toggle other panel if it is active
          if (!$(this).hasClass('active')) {
            $('.active', $(this).closest('.btn-group')).trigger('click');
          }

          $templatesTable.empty();
          renderTable();
          $containerToggle.toggleClass('active');
          $manageContainer.slideToggle();
        });

        $('button.btn-cancel', $manageContainer)
          .off('click')
          .on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            $containerToggle.toggleClass('active');
            $manageContainer.slideToggle();
          });

        $('button.btn-primary', $manageContainer)
          .off('click')
          .on('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            var templatesToDelete = [];
            $manageContainer.find(':checkbox:checked').each(function () {
              templatesToDelete.push($(this).val());
            });

            $.ajax({
              url: $rde_form.data('list-templates-uri') + '/batch_delete',
              type: 'POST',
              dataType: 'json',
              data: { ids: templatesToDelete },
              success: function (updatedTemplateList) {
                templateList = updatedTemplateList;
                initSelectTemplateFeature();
              },
              error: function (xhr, status, err) {
                console.log(err);
              },
            });

            $containerToggle.toggleClass('active');
            $manageContainer.slideToggle();
          });

        var renderTable = function () {
          if (templateList.length == 0) {
            $('.no-templates-message', $manageContainer).show();
            $('.btn-primary', $manageContainer).hide();
            return;
          } else {
            $('.no-templates-message', $manageContainer).hide();
            $('.btn-primary', $manageContainer).show();
          }

          templateList.forEach(function (item) {
            $templatesTable.append(
              AS.renderTemplate('rde_template_table_row', { item: item })
            );
          });
        };

        $.ajax({
          url: $rde_form.data('list-templates-uri'),
          type: 'GET',
          dataType: 'json',
          success: function (_templateList_) {
            templateList = _templateList_;
          },
        });
      };

      var applyTemplate = function (template) {
        // we are relying on template.order to always
        // contain all colIds
        COLUMN_ORDER = template.order;
        DEFAULT_VALUES = template.defaults;

        // sets the order, then
        // calls applyPersistentVisibleColumns,
        // which iterates over colums in DOM,
        // and hides or shows
        applyColumnOrder(function () {
          VISIBLE_COLUMN_IDS = template.visible;
          AS.prefixed_cookie(
            COOKIE_NAME_VISIBLE_COLUMN,
            JSON.stringify(VISIBLE_COLUMN_IDS)
          );
          applyPersistentVisibleColumns(function () {
            var $firstRow = $('tbody tr:first', $rde_form);

            $('td', $firstRow).each(function (index, td) {
              var $td = $(td);
              var colId = $td.data('col');
              var $$input = $(':input:first', $td);
              if (
                DEFAULT_VALUES[colId] &&
                ($$input.data('value-from-template') ||
                  $$input.val().length < 1)
              ) {
                $$input.val(DEFAULT_VALUES[colId]);
                $$input.data('value-from-template', true);
              }
            });

            // zap the multiselect widget
            var $select = $('#rde_hidden_columns');
            $select.data('multiselect').destroy();
            $select.removeData('multiselect');
            $select.empty();
            initColumnShowHideWidget();
          });
        });
      };

      var initSelectTemplateFeature = function () {
        var $select = $('#rde_select_template');

        $select.change(function () {
          var id = $('option:selected', $select).val();
          $.ajax({
            url: $rde_form.data('template-base-uri') + '/' + id,
            type: 'GET',
            dataType: 'json',
            success: function (template) {
              applyTemplate(template);
              $select.attr('data-style', 'btn-success');
              $select.selectpicker('refresh');
            },
          });
        });

        var renderOptions = function () {
          $select.empty();

          $select.append(
            $('<option>', { disabled: 'disabled', selected: 'selected' }).text(
              $select.data('prompt-text')
            )
          );

          templateList.forEach(function (item) {
            $select.append($('<option>', { value: item.id }).text(item.name));
          });

          $select.selectpicker('refresh');
        };

        renderOptions();
      };

      var initColumnReorderFeature = function () {
        var $reorderContainer = $('#columnReorderForm', $modal);
        var $btnReorderToggle = $('button.reorder-columns', $modal);
        var $select = $('#columnOrder', $reorderContainer);
        var $btnApplyOrder = $('.btn-primary', $reorderContainer);

        // Setup global events
        $btnReorderToggle.off('click').on('click', function (event) {
          event.preventDefault();
          event.stopPropagation();

          // toggle other panel if it is active
          if (!$(this).hasClass('active')) {
            $('.active', $(this).closest('.btn-group')).trigger('click');
          }

          $btnReorderToggle.toggleClass('active');
          $reorderContainer.slideToggle();
        });

        populateColumnSelector($select);
        $select.attr('size', $('option', $select).length / 2);

        var handleMove = function (direction) {
          var $options = $('option:selected', $select);
          if ($options.length) {
            if (direction === 'up') {
              $options.first().prev().before($options);
            } else {
              $options.last().next().after($options);
            }
          }
          $btnApplyOrder.removeAttr('disabled').removeClass('disabled');
        };

        var resetForm = function () {
          $btnReorderToggle.toggleClass('active');
          $reorderContainer.slideToggle(function () {
            $btnApplyOrder.addClass('disabled').attr('disabled', 'disabled');
            // reset the select
            $select.html('');
            populateColumnSelector($select);
          });
        };

        $('#columnOrderUp', $reorderContainer).bind('click', function () {
          handleMove('up');
        });
        $('#columnOrderDown', $reorderContainer).bind('click', function () {
          handleMove('down');
        });
        $('.btn-cancel', $reorderContainer).click(function (event) {
          event.preventDefault();
          event.stopPropagation();

          resetForm();
        });
        $btnApplyOrder.click(function (event) {
          event.preventDefault();
          event.stopPropagation();

          COLUMN_ORDER = ['colStatus'];
          $('option', $select).each(function () {
            COLUMN_ORDER.push($(this).val());
          });
          COLUMN_ORDER.push('colActions');

          applyColumnOrder();
          resetForm();
          persistColumnOrder();
        });
      };

      var populateColumnSelector = function (
        $select,
        select_func,
        filter_func
      ) {
        filter_func =
          filter_func ||
          function () {
            return true;
          };
        select_func =
          select_func ||
          function () {
            return false;
          };
        $('.fieldset-labels th', $rde_form).each(function () {
          var $colHeader = $(this);
          if (
            $colHeader.hasClass('fieldset-label') &&
            filter_func($colHeader)
          ) {
            var $option = $('<option>');
            var option_text = '';
            option_text += $(
              '.section-' + $colHeader.data('section') + ':first'
            ).text();
            option_text += ' - ';
            option_text += $colHeader.text();

            $option.val($colHeader.attr('id')).text(option_text);
            if (select_func($colHeader)) {
              $option.attr('selected', 'selected');
            }
            $select.append($option);
          }
        });
      };

      var initColumnShowHideWidget = function () {
        var $select = $('#rde_hidden_columns');
        populateColumnSelector($select, function ($colHeader) {
          return isVisible($colHeader.attr('id'));
        });
        $select.multiselect({
          buttonClass: 'btn btn-small btn-default',
          buttonWidth: 'auto',
          maxHeight: 300,
          buttonContainer: '<div class="btn-group" id="multiselect_btn"/>',
          buttonText: function (options) {
            if (options.length == 0) {
              return $select.data('i18n-none') + ' <b class="caret"></b>';
            } else if (options.length > 5) {
              return (
                $select.data('i18n-prefix') +
                ' ' +
                options.length +
                ' ' +
                $select.data('i18n-suffix') +
                ' <b class="caret"></b>'
              );
            } else {
              var selected = $select.data('i18n-prefix') + ' ';
              options.each(function () {
                selected += $(this).text() + ', ';
              });
              return (
                selected.substr(0, selected.length - 2) +
                ' <b class="caret"></b>'
              );
            }
          },
          onChange: function ($option, checked) {
            var widths = persistColumnWidths();
            var colId = $option.val();
            var index = $('#' + colId).index();

            if (checked) {
              $table.showColumns(index + 1);
              var $col = $($('table colgroup col').get(index));
              $col.show();
              $table.width($table.width() + widths[index]);
            } else {
              hideColumn(index);
            }

            VISIBLE_COLUMN_IDS = $select.val();
            AS.prefixed_cookie(
              COOKIE_NAME_VISIBLE_COLUMN,
              JSON.stringify(VISIBLE_COLUMN_IDS)
            );
          },
        });

        function disableRequiredColumns() {
          // Don't allow omitting required fields in RDE templates
          // by disabling the bootstratp-multiselect.js generated
          // list items and checkboxes that represent required RDE columns
          var $requiredColumns = $.makeArray(
            $('.fieldset-labels th.required', $rde_form)
          );

          $requiredColumns.forEach(function (column) {
            var id = column.id;
            var checkboxSelector = "input[type='checkbox'][value=" + id + ']';
            var $li = $('li').has(checkboxSelector);
            var $input = $(checkboxSelector);
            $li.addClass('disabled');
            $input.prop({ disabled: true });
          });
        }

        disableRequiredColumns();
      };

      var persistColumnWidths = function () {
        var widths = {};
        $('table colgroup col', $rde_form).each(function (i, col) {
          if ($(col).prop('width') === null || $(col).prop('width') === '') {
            $(col).prop('width', $(col).data('default-width'));
          } else if ($(col).css('width')) {
            var newWidth = parseInt($(col).css('width'));
            $(col).prop('width', newWidth);
          }
          widths[$(col).data('id')] = parseInt($(col).prop('width'));
        });

        COLUMN_WIDTHS = widths;
        AS.prefixed_cookie(
          COOKIE_NAME_COLUMN_WIDTHS,
          JSON.stringify(COLUMN_WIDTHS)
        );

        return COLUMN_WIDTHS;
      };

      var setColumnWidth = function (colId) {
        var width = getColumnWidth(colId);
        var index = $('#' + colId).index();

        // set width of corresponding col element
        $($('table colgroup col', $rde_form).get(index)).width(width);

        return width;
      };

      var getColumnWidth = function (colId) {
        if (COLUMN_WIDTHS) {
          return COLUMN_WIDTHS[colId];
        } else {
          persistColumnWidths();
          return getColumnWidth(colId);
        }
      };

      var applyPersistentColumnWidths = function () {
        var total_width = 0;

        // force table layout to auto
        $table.css('tableLayout', 'auto');

        $('colgroup col', $table).each(function (i, el) {
          var colW = getColumnWidth($(el).data('id'));
          $(el).prop('width', colW);
          total_width += colW;
        });

        $table.width(total_width);

        // and then change table layout to fixed to force a redraw to
        // ensure all colgroup widths are obeyed
        $table.css('tableLayout', 'fixed');
      };

      var applyPersistentStickyColumns = function () {
        if (STICKY_COLUMN_IDS) {
          $('th.sticky', $rde_form).removeClass('sticky');
          $.each(STICKY_COLUMN_IDS, function () {
            $('#' + this).addClass('sticky');
          });
        }
      };

      var isVisible = function (colId) {
        if (VISIBLE_COLUMN_IDS) {
          return $.inArray(colId, VISIBLE_COLUMN_IDS) >= 0;
        } else {
          return true;
        }
      };

      var applyPersistentVisibleColumns = function (callback) {
        if (VISIBLE_COLUMN_IDS) {
          var total_width = 0;

          $.each($('.fieldset-labels th', $rde_form), function () {
            var colId = $(this).attr('id');
            var index = $(this).index();

            if ($(this).hasClass('fieldset-label')) {
              if (isVisible(colId)) {
                total_width += setColumnWidth(colId);
              } else {
                hideColumn(index);
              }
            } else {
              total_width += setColumnWidth(colId);
            }
          });
          $table.width(total_width);

          if (callback) {
            callback();
          }
        } else {
          applyPersistentColumnWidths();
        }
      };

      var hideColumn = function (index) {
        $table.hideColumns(index + 1);
        var $col = $($('table colgroup col').get(index));
        $table.width($table.width() - $col.width());
        $col.hide();
      };

      var showColumn = function (index) {
        $table.showColumns(index + 1);
        var $col = $($('table colgroup col').get(index));
        $table.width($table.width() + $col.width());
        $col.show();
      };

      var enableCell = function (colId, rowIndex) {
        var row = $('tbody tr')[rowIndex];
        var cell = $("td[data-col='" + colId + "']", row);

        cell.removeClass('disabled');
        $('input', cell).removeAttr('disabled');
      };

      var disableCell = function (colId, rowIndex) {
        var row = $('tbody tr')[rowIndex];
        var cell = $("td[data-col='" + colId + "']", row);

        cell.addClass('disabled');
        $('input', cell).attr('disabled', 'disabled');
      };

      var prevActiveCell = function ($cell) {
        var prev = $cell.prev();
        if (prev.hasClass('disabled')) {
          return prevActiveCell(prev);
        } else {
          return prev;
        }
      };

      var nextActiveCell = function ($cell) {
        var next = $cell.next();
        if (next.hasClass('disabled')) {
          return nextActiveCell(next);
        } else {
          return next;
        }
      };

      var validateAllRows = function () {
        validateRows($('tbody tr', $table));
      };

      var validateRows = function ($rows) {
        var row_data = $rows.serializeObject();

        row_data['validate_only'] = 'true';

        $('.error', $rows).removeClass('error');

        $.ajax({
          url: $rde_form.data('validate-row-uri'),
          type: 'POST',
          data: row_data,
          dataType: 'json',
          success: function (data) {
            renderInlineErrors($rows, data);
          },
        });
      };

      // Connect up the $modal form submit button
      $($modal).on('click', '.modal-footer .btn-primary', function () {
        $(this).attr('disabled', 'disabled');
        $rde_form.submit();
      });

      // Connect up the $modal form validate button
      $($modal).on('click', '#validateButton', function (event) {
        event.preventDefault();
        event.stopPropagation();

        validateSubmissionOnly = true;
        $(this).attr('disabled', 'disabled');
        $rde_form.append(
          "<input type='hidden' name='validate_only' value='true'>"
        );
        $rde_form.submit();
      });

      // enable form within the add row dropdown menu
      $('.add-rows-form input', $modal).click(function (event) {
        event.preventDefault();
        event.stopPropagation();
      });
      $('.add-rows-form button', $modal).click(function (event) {
        var rows = [];
        try {
          var numberOfRows = parseInt(
            $('input', $(this).closest('.add-rows-form')).val(),
            10
          );
          for (var i = 1; i <= numberOfRows; i++) {
            rows.push(addRow(event));
          }
        } catch (e) {
          // if the field cannot parse the form value to an integer.. just quietly judge the user
        }
        validateRows($(rows));
      });

      // Connect the Inline Errors toggle
      $modal.on('click', 'button.toggle-inline-errors', function (event) {
        event.preventDefault();
        event.stopPropagation();

        $(this).toggleClass('active');
        $table.toggleClass('show-inline-errors');
      });

      $modal.on('keyup', 'button', function (event) {
        // pass on Return key hits as a click
        if (event.keyCode === 13) {
          $(this).trigger('click');
        }
      });

      $(document).triggerHandler('loadedrecordform.aspace', [$rde_form]);

      initAjaxForm();

      $(window).trigger('resize');

      // auto-validate the first row
      setTimeout(function () {
        validateAllRows();
      });
    });

    $('select.selectpicker', $modal).selectpicker();
  };

  $(document).bind('rdeload.aspace', function (event, uri, $modal) {
    var path = uri.replace(/^\/repositories\/[0-9]+\//, '');

    $.ajax({
      url: AS.app_prefix(path + '/rde'),
      success: function (data) {
        $('.rde-wrapper', $modal).replaceWith("<div class='modal-body'></div>");
        $('.modal-body', $modal).replaceWith(data);
        $('form', '#rapidDataEntryModal').init_rapid_data_entry_form(
          $modal,
          uri
        );
      },
    });
  });

  $(document).bind('rdeshow.aspace', function (event, $node, $button) {
    var $modal = AS.openCustomModal(
      'rapidDataEntryModal',
      $button.text(),
      AS.renderTemplate('modal_content_loading_template'),
      'full',
      { backdrop: 'static', keyboard: false },
      $button
    );

    $(document).triggerHandler('rdeload.aspace', [$node.data('uri'), $modal]);
  });
});
$(function () {

  var init = function () {
    $('.transfer-form .btn-cancel').on('click', function () {
      $('.transfer-action').trigger("click");
    });

    // Override the default bootstrap dropdown behaviour here to
    // ensure that this modal stays open even when another modal is
    // opened within it.
    $(".transfer-action").on("click", function(event) {
      event.preventDefault();
      event.stopImmediatePropagation();

      if ($(this).attr('disabled')) {
        return;
      }

      if ($(".transfer-form")[0].style.display === "block") {
        // Hide it
        $(this).attr('aria-expanded', 'false');
        $(".transfer-form").css("display", "");
      } else {
        // Show it
        $(".transfer-form").css("display", "block");
        $(this).attr('aria-expanded', 'true');
      }
    });

    // Stop the modal from being hidden by clicks within the form
    $(".transfer-form").on("click", function(event) {
      event.stopPropagation();
    });


    $(".transfer-form .linker-wrapper .dropdown-toggle").on("click", function(event) {
      event.stopPropagation();
      $(this).parent().toggleClass("open");
    });


    $(".transfer-form .transfer-button").on("click", function(event) {
      var formvals = $(".transfer-form").serializeObject();
      if (!formvals["transfer[ref]"]) {
        $(".missing-ref-message", ".transfer-form").show();
        event.preventDefault();
        event.stopImmediatePropagation();
        return false;
      } else {
        $(".missing-ref-message", ".transfer-form").hide();
        $(this).data("form-data", {"ref": formvals["transfer[ref]"]});
      }
    });
  };


  if ($('.transfer-form').length > 0) {
    init();
  } else {
    $(document).bind("loadedrecordform.aspace", init);
  }

});
$(function () {
  $(document).on("loadedrecordform.aspace", function(event) {

    // allow option sidebar to stay open when
    // elements are clicked
    $('.record-toolbar').on('change click keyup', '.dropdown-submenu input', function(e) {
      e.stopPropagation();
    });
    $('.record-toolbar').on('click', 'a.download-ead-action', function(e) {
      var url = AS.quickTemplate(decodeURIComponent($("#download-ead-dropdown").data("download-ead-url")), { testme: true,  include_unpublished: $("input#include-unpublished").is(':checked'), include_daos: $("input#include-daos").is(':checked'), numbered_cs: $("input#numbered-cs").is(':checked'), print_pdf: $("input#print-pdf").is(':checked'), ead3: $("input#ead3").is(':checked')});
      location.href = url;
    });
    $('.record-toolbar').on('click', 'a.download-marc-action', function(e) {
      var url = AS.quickTemplate(decodeURIComponent($("#download-marc-dropdown").data("download-marc-url")), {  include_unpublished_marc: $("input#include-unpublished-marc").is(':checked')});
      console.log(url);
      location.href = url;
    });
    $('.record-toolbar').on('click', 'a.download-mets-action', function(e) {
      var url = AS.quickTemplate(decodeURIComponent($("#download-mets-dropdown").data("download-mets-url")), {  dmd_scheme: $("input#js-dmd_scheme_mods").is(':checked') ? "mods" : "dc"});
      console.log(url);
      location.href = url;
    });
  });

});



$(function () {
  var init_location_form = function (form) {
    var $form = $(form);

    var newSelector = '#location';
    if ($form.selector === '#new_location_batch') {
      newSelector = '#location_batch';
    }

    $temporary = $(newSelector + '_temporary_', $form);
    $temporaryQuestion = $(newSelector + '_temporary_question_', $form);

    if ($temporary.val() != '') {
      $temporaryQuestion.prop('checked', true);
    }

    $temporaryQuestion.on('change', function () {
      $temporary.val('');
      $temporary.prop('disabled', function (i, v) {
        return !v;
      });
    });
  };

  // This is for binding event to container_locations, which link locations to
  // resources
  // this is also for init the form in modals
  $(document).ready(function () {
    // this inits the form in the new location page
    if ($('#new_location').length > 0) {
      init_location_form($('#new_location'));
    }

    // this inits the form in the new location batch page
    if ($('#new_location_batch').length > 0) {
      init_location_form($('#new_location_batch'));
    }

    // this init the form in the modal
    $(document).bind('loadedrecordform.aspace', function (event, $container) {
      init_location_form(('#new_location', $container));
    });

    // this is for container_location, which link resources to locations
    $(document).bind(
      'subrecordcreated.aspace',
      function (event, object_name, subform) {
        if (object_name === 'container_location') {
          // just in case..lets init the form
          init_location_form($(subform));

          // if the status is change to previous,set the end date to match
          // todays date ( which is in the date's data attr )
          $('[id$=__status_]', $(subform)).bind('change', function () {
            $this = $(this);
            $endDate = $('[id$=__end_date_]', subform);
            if ($this.val() == 'previous' && $endDate.val().length == 0) {
              $endDate.val($endDate.data('date'));
            }
          });
        }
      }
    );
  });

  // initialize any linkers not delivered via subrecord
  $(document).ready(function () {
    $('.linker:not(.initialised)').linker();
  });
});



var calculate_total_processing_hours = function (form) {
  var $form = $(form);
  var phe = parseFloat(
    $(
      'input[id*="_collection_management__processing_hours_per_foot_estimate_"]',
      $form
    ).val(),
    10
  );
  var pte = parseFloat(
    $(
      'input[id*="_collection_management__processing_total_extent_"]',
      $form
    ).val(),
    10
  );

  if ($.isNumeric(phe) && $.isNumeric(pte)) {
    var tph = (phe * pte).toFixed(2);
    $(
      'input[id*="_collection_management__processing_hours_total_"]',
      $form
    ).val(tph);
  }
};

$(document).bind(
  'subrecordcreated.aspace',
  function (event, object_name, subform) {
    $(
      'input[id*="_collection_management__processing_hours_per_foot_estimate_"]',
      $(subform)
    ).bind('change', function () {
      calculate_total_processing_hours(subform);
    });
    $(
      'input[id*="_collection_management__processing_total_extent_"]',
      $(subform)
    ).bind('change', function () {
      calculate_total_processing_hours(subform);
    });
  }
);
$(function () {
  function ExtentCalculatorForm() {}

  ExtentCalculatorForm.prototype.init_form = function () {
    $('.create-extent-btn').on('click', function (event) {
      var parent_id = '';
      if ($('#resource_extents_').length) {
        parent_id = '#resource_extents_';
      } else if ($('#accession_extents_').length) {
        parent_id = '#accession_extents_';
      }
      $(parent_id + ' .subrecord-form-heading .btn').click();

      var extent_form = $(parent_id).find('.subrecord-form-fields').last();

      extent_form.find('[id$=__portion_]').val($('#extent_portion_').val());
      extent_form.find('[id$=__number_]').val($('#extent_number_').val());
      var extent_form_type_select = extent_form.find('[id$=__extent_type_]');
      if (extent_form_type_select.data('combobox')) {
        extent_form_type_select
          .data('combobox')
          .$element.val($('#extent_extent_type_').val());
        extent_form_type_select
          .data('combobox')
          .$target.val($('#extent_extent_type_').val());
      } else {
        extent_form_type_select.val($('#extent_extent_type_').val());
      }
      extent_form
        .find('[id$=__container_summary_]')
        .val($('#extent_container_summary_').val());
      extent_form
        .find('[id$=__physical_details_]')
        .val($('#extent_physical_details_').val());
      extent_form
        .find('[id$=__dimensions_]')
        .val($('#extent_dimensions_').val());

      $modal.modal('hide');
    });
  };

  var init = function () {
    $('.extent-calculator-btn').on('click', function (event) {
      var dialog_content = AS.renderTemplate(
        'extent_calculator_show_calculation_template'
      );

      $modal = AS.openCustomModal(
        'extentCalculationModal',
        'Extent Calculation',
        dialog_content,
        'large'
      );

      $.ajax({
        url: AS.app_prefix('/extent_calculator'),
        data: {
          record_uri: $('#extent_calculator_show_calculation_template').attr(
            'record_uri'
          ),
          referrer: document.location.href,
        },
        type: 'get',
        success: function (html) {
          $('#show_calculation_results').html(html);
          var extentCalculatorForm = new ExtentCalculatorForm();
          extentCalculatorForm.init_form();
        },
        error: function (jqXHR, textStatus, errorThrown) {
          var html = AS.renderTemplate(
            'template_extent_calculator_error_message',
            { message: jqXHR.responseText }
          );
          $('#show_calculation_results').html(html);
        },
      });
    });
  };

  $(document).bind('loadedrecordform.aspace', function (event, $container) {
    init();
  });
});
$(function () {

  function DateCalculatorForm(record_type, record_id) {
      var dialog_content = AS.renderTemplate("template_date_calculator_form_" + record_type + "_" + record_id);
      this.$modal = AS.openCustomModal("dateCalculationModal", "Calculate Dates", dialog_content, 'large');
      this.setup_calculator_form();
  };

  DateCalculatorForm.prototype.setup_calculator_form = function() {
    var self = this;

    self.$form = self.$modal.find('#date_calculator_form');
      self.$form.ajaxForm({
        dataType: "html",
        type: "POST",
        beforeSubmit: function() {
          self.$form.find(":submit").addClass("disabled").attr("disabled","disabled");
        },
        success: function(html) {
          self.$form.find(":submit").removeClass("disabled").removeAttr("disabled");
          self.setup_create_form(html);
        },
        error: function(jqXHR, textStatus, errorThrown) {
          // FIXME ERRORS
          self.$form.find(":submit").removeClass("disabled").removeAttr("disabled");
        }
      });
  };

  DateCalculatorForm.prototype.setup_create_form = function(html) {
    var self = this;

    self.$modal.find('#date-calculator-result').html(html);
    self.$modal.trigger("resize");
    $(document).trigger("subrecordcreated.aspace", ['date', self.$modal]);

    var $createForm = self.$modal.find('#date_calculator_create_date_form');
    var $createButton = self.$modal.find('#createDateButton').show().removeAttr('aria-hidden');
    var $createErrorMessage = self.$modal.find('#createError');
    var $createSuccessMessage = self.$modal.find('#createSuccess');

    $createForm.ajaxForm({
      dataType: "html",
      type: "POST",
      beforeSubmit: function() {
        $createErrorMessage.hide().attr('aria-hidden', true);
        $createButton.addClass("disabled").attr("disabled","disabled");
      },
      success: function(html) {
        $createSuccessMessage.show().removeAttr('aria-hidden');
        $createForm.hide();
        location.reload();
      },
      error: function(jqXHR, textStatus, errorThrown) {
        $createErrorMessage.show().removeAttr('aria-hidden');
        $createButton.removeClass("disabled").removeAttr("disabled");
      }
    });

    $createButton.on('click', function() {
      $createForm.submit();
    });
  };


  $(document).bind("loadedrecordform.aspace", function(event, $container) {
      $('.date-calculator-btn').on('click', function (event) {
          new DateCalculatorForm($(this).data('record-type'), $(this).data('record-id'));
      });
  });
});

























$(function() {
  $.fn.init_resource_form = function() {
    $(this).each(function() {
      var $this = $(this);

      if ($this.hasClass("initialised")) {
        return;
      };

      var $levelSelect = $("#resource_level_", $this);
      var $otherLevel = $("#resource_other_level_", $this);

      var handleLevelChange = function(initialising) {
        if ($levelSelect.val() === "otherlevel") {
          $otherLevel.removeAttr("disabled");
          if (initialising === true) {
            $otherLevel.closest(".form-group").show();
          } else {
            $otherLevel.closest(".form-group").slideDown();
          }
        } else {
          $otherLevel.attr("disabled", "disabled");
          if (initialising === true) {
            $otherLevel.closest(".form-group").hide();
          } else {
            $otherLevel.closest(".form-group").slideUp();
          }
        }
      };

      handleLevelChange(true);
      $levelSelect.change(handleLevelChange);
    });
  };

  $(document).bind("loadedrecordform.aspace", function(event, $container) {
    $("#resource_form:not(.initialised)", $container).init_resource_form();
  });

  $("#resource_form:not(.initialised)").init_resource_form();

});
