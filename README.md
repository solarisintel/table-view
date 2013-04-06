table-view
==========

Goals
=====

1. Any RDBMS Table
2. Export of Data
3. Rearrange Columns (Drag, Drop)
4. Select Columns
5. Pagination
6. Filtering of Data

Features
========

1. Works with Sqlite (can be extended easily).
2. Works with Hiphop-php.
3. Download data as CSV.
4. Re-arrange table columns and state is persisted in Cookie.
5. Choose the columns for display.
7. Configurable pagination support.
8. Configurable SQL editor with autocompletion support.
9. Optional SQL GUI Query Builder is available for filtering.
10. Built with Bootstrap / Jquery / PHP.


Run
===

php 5.4

Make sure you have php 5.4 or higher to use built-in server.

bash-$ make

this command will start application on port 8888

open the url in browser http://localhost:8888/

php < 5.4

Else, host it in a php container like apache or fast-cgi and open index.html

Example
=======
HTML Markup looks like this

```
<!-- markup for the table widget -->
<div class="tab-pane active" id="table-container-1">
    <div id="table-widget-settings-1" class="form form-inline">
        <div class="hide form form-inline" style="margin-bottom: 1ex">
            <strong>All Columns : </strong><pre class="table-columns-all">&nbsp;</pre>
            <strong>All keywords : </strong><pre class="table-keywords-all">&nbsp;</pre>
        </div>
        <div class="form form-inline">
            <div class="form-search" style="margin-bottom: 1ex">
                <input class="table-expr search-query span11" type="text" placeholder="SQL Expression">
                <button class="btn btn-info table-update-btn">Filter</button>
            </div>
            <select class="table-choose">
                <option value="employees">Employees</option>
            </select>
            <select class="table-limit-page input-medium"></select>
            <select class="table-limit-size input-mini"></select>
            <input type="hidden" class="table-columns" placeholder="Columns List">
            <span class="table-status label"></span>
            <div class="pull-right">
                <a href="config.php" class="btn btn-mini btn-danger table-export"><i class="icon icon-white icon-download">&nbsp;</i></a>
                <button class="btn btn-mini btn-success table-popover" data-toggle="popover" data-original-title="Choose Columns"><i class="icon icon-white icon-list">&nbsp;</i></button>
            </div>
        </div>
    </div>
    <div class="table-widget">
        <span class="table-error alert alert-info hide">&nbsp;</span>
        <h2 class="table-title"></h2>
        <table class="table-view table table-bordered"></table>
    </div>
</div>
<!-- markup for the table widget -->

```

Javascript API to create the widget

````
<script src="jquery.table-view.js"></script>
<script>
    var s = new TableView(
        '#table-widget-settings-1',
        '#table-container-1',
        { 
            datasrc : 'config.php',
            table : 'organisations',
            columns : ['company', 'location', 'date'],
            pagesizes : {
                "5"   : "5",
                "10"  : "10",
                "25"  : "25",
                "50"  : "50",
                "100" : "100"
            },
            defaultsize : 10,
            sqltriggers : {
                columns : '@a',
                operators : '@b',
                compound : '@c'
            }
        }
    );
</script>
````

API Options

`datasrc:` URL from which data can be retrieved

`table:` name of the table to be shown on page-load

`columns:` list of default columns to be displayed

`pagesizes:` Default list of page sizes for fetching records

`defaultsize:` default pagesize (for initial request)

`sqltriggers` : `{ columns : '@a', operators : '@b' : compound : '@c' }` Default triggers while editing in SQL Mode

License
=======

MIT

Author
=====
Naresh Kumar -- nareshv@ -- http://nareshv.github.io/
