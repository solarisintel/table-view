/*
 * License - MIT
 * Author  - nareshv@
 * URL     - https://github.com/nareshv/table-view/
 */
var TableView = function(el, oel, opt) {
    var element  = el;
    var oelement = oel;
    var goptions = opt || { datasrc : 'config.php' };
    var tablestate;
    var ActiveColumns = {};
    var columnsInited = false;
    var qbInited = false;

    function enableAutocomplete(el, o) {
        var availableTags = o.cols;
        var helpers       = {
            /* this is customisable */
            '@a' : function() {
                return o.cols;
            },
            '@b' : function() {
                return o.ops;
            },
            '@c' : function() {
                return o.conj;
            }
        };

        function split( val ) {
            return _.compact($.csv.toArray(val, { separator : ' '}));
        }
        function extractLast( term ) {
            return split( term ).pop();
        }

        $(el)
            // don't navigate away from the field on tab when selecting an item
            .bind( "keydown", function( event ) {
                if ( event.keyCode === $.ui.keyCode.TAB &&
                        $( this ).data( "ui-autocomplete" ).menu.active ) {
                    event.preventDefault();
                }
            })
            .bind('keyup', function(evt){
                var parts = _.compact($.csv.toArray($(this).val(), { separator : ' '}));
                var cur   = parts[parts.length - 1];
                var last  = parts[parts.length - 2];
                var check = cur;
                switch ((parts.length - 1) % 4) {
                    case 0:
                        availableTags = o.cols;
                        break;
                    case 1:
                        availableTags = o.ops;
                        break;
                    case 2:
                        availableTags = o.cols; // can be possible
                        break;
                    case 3:
                        availableTags = o.conj;
                        break;
                }
            })
            .autocomplete({
                minLength: 0,
                source: function( request, response ) {
                    var parts = _.compact($.csv.toArray(request.term, { separator : ' '}));
                    var cur   = parts[parts.length - 1];
                    if (_.isString(cur) && _.isFunction(helpers[cur])) {
                        // response( helpers[request.term]() );
                        response( helpers[cur]() );
                    } else {
                        // delegate back to autocomplete, but extract the last term
                        response( $.ui.autocomplete.filter( availableTags, extractLast( request.term ) ) );
                    }
                },
                focus: function() {
                    // prevent value inserted on focus
                    return false;
                },
                select: function( event, ui ) {
                    var terms = split( this.value );
                    // remove the current input
                    terms.pop();
                    // add the selected item
                    terms.push( ui.item.value );
                    // add placeholder to get the comma-and-space at the end
                    terms.push( "" );
                    this.value = terms.join( ' ' );
                    return false;
                }
            });
    }

    function renderSelect(map, choosen, useval) {
        var list = [];
        for (var key in map) {
            var ll = key, rr = map[key];
            // if use value as key itself
            if (useval === true) {
                ll = rr;
            }
            if (_.isArray(choosen)) {
                if (_.contains(choosen, map[key])) {
                    list.push('<option selected value="' + ll + '">' + rr + '</li>');
                } else {
                    list.push('<option value="' + ll + '">' + rr + '</li>');
                }
            } else {
                if (key == choosen) {
                    list.push('<option selected value="' + ll + '">' + rr + '</li>');
                } else {
                    list.push('<option value="' + ll + '">' + rr + '</li>');
                }
            }
        }
        // console.log(list);
        return list.join('');
    }

    function initPopover(element) {
            $(element + ' .table-popover').popover('destroy');
            var html = '<div class="controls table-sort-cols sortable">';
            var q    = tablestate.allcols;
            var co   = $(element + ' .table-columns').val();
            var cols = co.split(/,/);
            for (var idx in q) {
                if (_.contains(cols, q[idx])) {
                    html += '<label class="checkbox"><input checked type="checkbox" name="' + q[idx] + '">' + q[idx] + '</label><br>';
                } else {
                    html += '<label class="checkbox"><input type="checkbox" name="' + q[idx] + '">' + q[idx] + '</label><br>';
                }
            }
            html += '</div>';
            //if (columnsInited !== true) {
                $(element + ' .table-popover').popover({
                    html : true,
                    trigger : 'click',
                    container : element,
                    placement : 'bottom',
                    content : html //'<ul class="table-sort-cols sortable"></ul>'
                });
            //}
            // $(element + ' .table-popover').popover('hide');
            //$(element + ' .table-popover').data('content', html);
            if (columnsInited === true) {
                //$(element + ' .table-popover').popover('toggle');
            }
            columnsInited = true;
    }

    function handleSorting(element) {
        /*
        $(element + ' .sortable').sortable('destroy');
        var html = '<ul class="table-sort-cols sortable">';
        var co   = $(element + ' .table-columns').val();
        var cols = co.split(/,/);
        for(var c in cols) {
            html += '<li>' + cols[c] +'</li>';
        }
        html += '</ul>';
        $(element + ' .table-popover').popover({
            html : true,
            trigger : 'click',
            container : element,
            placement : 'bottom',
            content : html //'<ul class="table-sort-cols sortable"></ul>'
        });
        $(element + ' .table-sort-cols').html(html);
        $(element + ' .sortable').sortable().bind('sortupdate', function(e, data) {
            try {
                e.preventDefault();
                e.stopPropagation();
                // console.log(e);
                var neworder = [];
                $(this).find('li').each(function( index ) {
                    // console.log( index + ": " + $(this).text() );
                    neworder.push($(this).text());
                });
                //$(element + ' .table-columns').val(neworder.join(','));
                //$(element + ' .table-columns').trigger('blur');
            } catch(ex) {
            }
        });
       */
    }

    function generatePages() {
        var size   = $(element + ' .table-limit-size').val();
        var chosen = $(element + ' .table-limit-page').val();
        var total =  Math.ceil(parseInt(tablestate.total, 10) / parseInt(size, 10));
        var o = {};
        for (var i = 1; i <= total; i++) {
            o[i] = "page - " + i;
        }
        $(element + ' .table-limit-page').html(renderSelect(o, chosen));
    }

    function getTableLimits(element) {
        if (tablestate === undefined) {
            return [0, goptions.defaultsize].join(',');
        }
        var limit = parseInt($(element + ' .table-limit-size').val(), 10);
        var page  = parseInt($(element + ' .table-limit-page').val(), 10);
        var offset = (page - 1) * tablestate.limit;
        //return $(element + ' .table-limits').val();
        var ret = [offset, limit].join(',');
        // console.log(ret);
        return ret;
    }

    function updateTableContents(table) {
        if (table === null || table === undefined) {
            return false;
        } else {
            $(element + ' table-title').text('Current Table : ' + table);
            var params = {
                type : 'html',
                table : table,
                columns: $(element + ' .table-columns').val(),
                expression: $(element + ' .table-expr').val(),
                limits: getTableLimits(element)
            };
            // console.log(params);
            $.ajax({
                method: 'GET',
                url : goptions.datasrc ,
                contentType: 'json',
                data: params,
                success: function(a, b, c) {
                    tablestate = a.settings;
                    $(element + ' ' + '.table-error').removeClass('hide').addClass('show').text('Successfully updated the view');
                    $(element + ' ' + '.table-columns-all').text(a.settings.allcols.join(', '));
                    $(element + ' ' + '.table-keywords-all').text(a.settings.keywords.join(', '));
                    $(element + ' ' + '.table-status').html(a.settings.status);
                    $(oelement + ' ' + '.table-view').html(a.table);
                    $(oelement + ' ' + '.table-view').tablecloth({theme:"default"});
                    initPopover(element);
                    // initQueryBuilder();
                    handleSorting(element);
                    generatePages();
                    enableDragDrop();
                    var querysuggest = {
                        suggests : [],
                        cols     : a.settings.allcols,
                        ops      : a.settings.keywords,
                        empty    : [],
                        conj     : a.settings.conj
                    };
                    enableAutocomplete(element + ' ' + '.table-expr', querysuggest);
                    //$(element + ' ' + '.table-expr').asuggest(querysuggest, {delimiter : ','});
                    //$(element + ' ' + '.table-expr').typeahead();
                    //var querysuggest = _.union(_.map(a.settings.allcols, function(v) { return   v; }), _.map(a.settings.keywords, function(v) { return v; }));
                    //$(element + ' ' + '.table-expr').asuggest(querysuggest, {delimiter : ','});
                    //var querysuggestmultiple = [
                    //    _.map(a.settings.allcols, function(v) { return   v; }),
                    //    [ '=',  '>' , '>=', '<=' ],
                    //    [ 'AND', 'OR' ]
                    //];
                    //$(element + ' ' + '.table-expr').asuggest(querysuggestmultiple, {delimiter : ','});
                    //$(element + ' ' + '.table-expr').tagautocomplete({source : querysuggest, character : '@'});
                    /*
                    var columnsuggest = _.map(a.settings.allcols, function(v) { return  v; });
                    $(element + ' ' + '.table-columns').asuggest(columnsuggest, {delimiter : ','});
                    */
                    // initialize popover
                },
                failure: function(a, b, c) {
                    $(element + ' ' + '.table-error').removeClass('hide').addClass('show').text('Problem communicating with server. Please try again later');
                }
            });
        }
        return true;
    }

    // change table contents
    //$(element + ' ' + '.table-choose').on('change', function() {
    //    var status = updateTableContents($(this).val());
    //});

    // when the table columns change
    //$(element + ' ' + '.table-columns').blur(function() {
    //    updateTableContents($(element + ' .table-choose').val());
    //});

    // when the table limits change
    $(element + ' ' + '.table-limit-page').change(function() {
        // console.log('page changed');
        updateTableContents($(element + ' .table-choose').val());
    });

    $(element + ' ' + '.table-limit-size').change(function() {
        // console.log('size changed');
        updateTableContents($(element + ' .table-choose').val());
    });

    // when the table expression is clicked
    //$(element + ' ' + '.table-expr').blur(function() {
    //    // console.log('expression changed');
    //    updateTableContents($(element + ' .table-choose').val());
    //});

    $(element + ' ' + '.table-update-btn').on('click', function() {
        // console.log('expression changed');
        updateTableContents($(element + ' .table-choose').val());
    });

    /*
    // when the table expression is clicked
    $(element + ' ' + '.table-expr').keydown(function(ev) {
        switch()
    });
    */


    // when the table export button clicked
    $(element + ' ' + '.table-export').on('click', function(e) {
        e.preventDefault();
        var url = $(this).attr('href');
        var params = {
            type : 'csv',
            table : $(element + ' .table-choose').val(),
            expression: $(element + ' .table-expr').val(),
            columns: $(element + ' .table-columns').val(),
            limits: getTableLimits(element)
        };
        var newurl = url + '?' + $.param(params);
        window.location.href = newurl;
    });

    // use the settings to update the ui elements
    // 1. set the default table
    $(element +' .table-choose').val(goptions.table);

    // 2. set the default columns
    if ($.cookie(goptions.table)) {
        $(element +' .table-columns').attr('value', $.cookie(goptions.table));

        var o = $.cookie(goptions.table).split(',');

        // save active columns
        for (var j = 0; j < o.length; j++) {
            var m = o[j];
            ActiveColumns[m] = true;
        }

    } else {
        $(element +' .table-columns').attr('value', goptions.columns.join(','));

        // save active columns
        for (var i = 0; i < goptions.columns.length; i++) {
            var n = goptions.columns[i];
            ActiveColumns[n] = true;
        }

    }

    // 3. create select options for limit size
    $(element + ' .table-limit-size').html(renderSelect(goptions.pagesizes, goptions.defaultsize));

    // 4. listen to the checkboxes that are created in future.
    $(element + ' input[type="checkbox"]').live('click', function(e) {
        // console.log(ActiveColumns);
        var n = $(e.target).attr('name');
        if ($(e.target).is(':checked')) {
            ActiveColumns[n] = true;
        } else {
            delete ActiveColumns[n];
        }
        $(element +' .table-columns').attr('value', _.keys(ActiveColumns).join(','));
        $.cookie(goptions.table, _.keys(ActiveColumns).join(','));
        // console.log(ActiveColumns);
        updateTableContents($(element + ' .table-choose').val());
    });

    function enableDragDrop() {
        $(oelement + ' ' + '.table-view').dragtable({persistState : function(table) {
            var order = [];
            table.el.find('th').each(function(i) {
                order.push($(this).text());
            });
            var params = {
                type : 'save',
                table : tablestate.table,
                order : order.join(',')
            };
            $(element + ' .table-columns').val(order.join(','));
            $.cookie(tablestate.table, $(element + ' .table-columns').val());
            /*
            $.ajax({
                type: 'GET',
                url : options.datasrc ,
                contentType: 'json',
                data: params,
                success: function(a, b, c) {
                    console.log(a.responseText);
                },
                failure: function(a, b, c) {
                    console.log(a.responseText);
                }
            });
            */
        }});
    }

    function initQueryBuilder() {
        if (qbInited !== false) {
            return;
        }
        var rootcondition = '<table><tr><td class="seperator" ><img src="img/remove.png" alt="Remove" class="remove" /><select class="input-mini"><option value="AND">AND</option><option value="OR">OR</option></select></td>';
        rootcondition += '<td><div class="querystmts"></div><div><img class="add" src="img/add.png" alt="Add" /> <button class="addroot">+()</button></div>';
        rootcondition += '</td></tr></table>';

        var statement = '<div><img src="img/remove.png" alt="Remove" class="remove" />';

        statement += '<select class="col input-medium">';
        statement += renderSelect(tablestate.allcols, null, true);
        statement += '</select> ';
        statement += '<select class="op input-medium">';
        statement += renderSelect(tablestate.keywords, null, true);
        statement += '</select> ';

        statement += '<input type="text" class="input-mini" /></div>';

        var q = new QB();
        q.init(rootcondition, statement, '.query', true);
        //q.addqueryroot('.query', true);

        $(oelement + '-qb-btnquery').click(function () {
            var con = q.getCondition('.query > table');
            var k = q.getQuery(con);
            $(element + ' .table-expr').val(k);
            $(element + ' .table-expr').trigger('blur');
            // alert(k);
        });
        qbInited = true;
    }

    // on page-load render active table
    updateTableContents($(element + ' .table-choose').val());
};
