var TableView = function(el, oel, opt) {
    var element  = el;
    var oelement = oel;
    var options = opt || { datasrc : 'config.php' };
    var tablestate;
    var ActiveColumns = {};
    var columnsInited = false;

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
                columnsInited = true;
            //}
            // $(element + ' .table-popover').popover('hide');
            $(element + ' .table-popover').data('content', html);
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
        var options = {};
        for (var i = 1; i <= total; i++) {
            options[i] = "page - " + i;
        }
        // console.log(options);
        $(element + ' .table-limit-page').html(renderSelect(options, chosen));
    }

    function getTableLimits(element) {
        if (tablestate === undefined) {
            return [0, options.defaultsize].join(',');
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
                url : options.datasrc ,
                contentType: 'json',
                data: params,
                success: function(a, b, c) {
                    tablestate = a.settings;
                    $(element + ' ' + '.table-error').removeClass('hide').addClass('show').text('Successfully updated the view');
                    $(oelement + ' ' + '.table-view').html(a.table);
                    $(element + ' ' + '.table-columns-all').text(a.settings.allcols.join(', '));
                    $(element + ' ' + '.table-keywords-all').text(a.settings.keywords.join(', '));
                    initPopover(element);
                    handleSorting(element);
                    generatePages();
                    var querysuggest = _.union(_.map(a.settings.allcols, function(v) { return  '@' + v; }), _.map(a.settings.keywords, function(v) { return v; }));
                    $(element + ' ' + '.table-expr').asuggest(querysuggest, {delimiter : ','});
                    var columnsuggest = _.map(a.settings.allcols, function(v) { return  v; });
                    $(element + ' ' + '.table-columns').asuggest(columnsuggest, {delimiter : ','});
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
    $(element + ' ' + '.table-choose').on('change', function() {
        var status = updateTableContents($(this).val());
    });

    // when the table columns change
    $(element + ' ' + '.table-columns').blur(function() {
        updateTableContents($(element + ' .table-choose').val());
    });

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
    $(element + ' ' + '.table-expr').blur(function() {
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

    // save active columns
    for (var i = 0; i < options.columns.length; i++) {
        var n = options.columns[i];
        ActiveColumns[n] = true;
    }

    // use the settings to update the ui elements
    // 1. set the default table
    $(element +' .table-choose').val(options.table);

    // 2. set the default columns
    $(element +' .table-columns').attr('value', options.columns.join(','));

    // 3. create select options for limit size
    $(element + ' .table-limit-size').html(renderSelect(options.pagesizes, options.defaultsize));

    // 4. listen to the checkboxes that are created in future.
    $(element + ' input[type="checkbox"]').live('click', function(e) {
        var n = $(e.target).attr('name');
        if ($(e.target).is(':checked')) {
            ActiveColumns[n] = true;
        } else {
            delete ActiveColumns[n];
        }
        $(element +' .table-columns').attr('value', _.keys(ActiveColumns));
        updateTableContents($(element + ' .table-choose').val());
    });

    // on page-load render active table
    updateTableContents($(element + ' .table-choose').val());
};
