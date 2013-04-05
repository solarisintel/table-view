var TableView = function(el, opt) {
    var element = el;
    var options = opt || { datasrc : 'config.php' };
    var tablestate;

    function renderSelect(map, choosen) {
        var list = [];
        for (var key in map) {
            if (key == choosen) {
                list.push('<option selected value="' + key + '">' + map[key] + '</li>');
            } else {
                list.push('<option value="' + key + '">' + map[key] + '</li>');
            }
        }
        return list.join('');
    }

    function handleSorting(element) {
        $(element +' .sortable').sortable('destroy');
        var html = '';
        var co   = $(element + ' .table-columns').val();
        var cols = co.split(/,/);
        for(var c in cols) {
            html += '<li>' + cols[c] +'</li>';
        }
        console.log(html);
        $(element +' .table-sort-cols').html(html);
        $(element + ' .sortable').sortable().bind('sortupdate', function(e, data) {
            try {
                e.preventDefault();
                e.stopPropagation();
                console.log(e);
                var neworder = [];
                $(this).find('li').each(function( index ) {
                    console.log( index + ": " + $(this).text() );
                    neworder.push($(this).text());
                });
                $(element + ' .table-columns').val(neworder.join(','));
                $(element + ' .table-columns').trigger('blur');
            } catch(ex) {
            }
        });
    }

    function generatePages() {
        var size   = $(element + ' .table-limit-size').val();
        var chosen = $(element + ' .table-limit-page').val();
        var total =  Math.ceil(parseInt(tablestate.total, 10) / parseInt(size, 10));
        var options = {};
        for (var i = 1; i <= total; i++) {
            options[i] = "page - " + i;
        }
        console.log(options);
        $(element + ' .table-limit-page').html(renderSelect(options, chosen));
    }

    function getTableLimits(element) {
        if (tablestate === undefined) {
            return [0, options.defaultsize].join(',');
        }
        var limit = parseInt($(element + ' .table-limit-size').val(), 10);
        var page  = parseInt($(element + ' .table-limit-page').val(), 10);
        var offset = (page - 1)* tablestate.limit;
        //return $(element + ' .table-limits').val();
        var ret = [offset, limit].join(',');
        console.log(ret);
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
            $.ajax({
                method: 'GET',
                url : options.datasrc ,
                contentType: 'json',
                data: params,
                success: function(a, b, c) {
                    tablestate = a.settings;
                    $(element + ' ' + '.table-error').removeClass('hide').addClass('show').text('Successfully updated the view');
                    $(element + ' ' + '.table-view').html(a.table);
                    $(element + ' ' + '.table-columns-all').text(a.settings.allcols.join(', '));
                    handleSorting(element);
                    generatePages();
                },
                failure: function(a, b, c) {
                    $(element + ' ' + '.table-error').removeClass('hide').addClass('show').text('Problem communicating with server. Please try again later');
                }
            });
        }
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
        updateTableContents($(element + ' .table-choose').val());
    });
    $(element + ' ' + '.table-limit-size').change(function() {
        updateTableContents($(element + ' .table-choose').val());
    });

    // when the table expression is clicked
    $(element + ' ' + '.table-expr').blur(function() {
        updateTableContents($(element + ' .table-choose').val());
    });

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
    $(element +' .table-choose').val(options.table);
    // 2. set the default columns
    $(element +' .table-columns').attr('value', options.columns.join(','));
    // 3. create select options for limit size
    $(element + ' .table-limit-size').html(renderSelect(options.pagesizes, options.defaultsize));

    // on page-load render active table
    updateTableContents($(element + ' .table-choose').val());
};
