table-view
==========

Goals.

1. Any RDBMS Table
2. Export of Data
3. Rearrange Columns (Drag, Drop)
4. Select Columns
5. Pagination
6. Filtering of Data

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
<div class="tab-pane" id="table-container-2">
    <div id="table-widget-settings-2" class="form form-inline">
        <div class="hide form form-inline" style="margin-bottom: 1ex">
            <strong>All Columns : </strong><pre class="table-columns-all">&nbsp;</pre>
            <strong>All keywords : </strong><pre class="table-keywords-all">&nbsp;</pre>
        </div>
        <div class="form form-inline">
            <input style="margin-bottom: 1ex" class="table-expr span12" type="text" placeholder="SQL Expression">
            <select class="table-choose">
                <option value="organisations">Organisations</option>
            </select>
            <select class="table-limit-page input-medium"></select>
            <select class="table-limit-size input-mini"></select>
            <input type="hidden" class="table-columns" placeholder="Columns List">
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
        '#table-widget-settings-2',
        '#table-container-2',
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
            defaultsize : 10
        }
    );
</script>
````

API Options

`datasrc:` URL from which data can be retrieved

`table:` name of the table to be shown on page-load

`columns:` list of default columns to be displayed

License
=======

MIT


