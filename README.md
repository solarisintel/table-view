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
                <div id="table-widget">
                    <div class="well">
                        <h2>Select Table / Options</h2>
                        <strong>All Columns : </strong><span class="table-columns-all">&nbsp;</span>
                        <hr>
                        <div class="row-fluid">
                            <div class="span6">
                                <label>Choose Table</label>
                                <select class="table-choose">
                                    <option value="employees">Employees</option>
                                    <option value="organisations">Organisations</option>
                                </select>
                                <label>Choose Page (Offset, Limit)</label>
                                <input type="text" class="table-limits" value="0,10">
                            </div>
                            <div class="span6">
                                <label>Choose Columns</label>
                                <input type="text" class="table-columns input-xlarge" value="name,email">
                                <label>Expression</label>
                                <textarea class="table-expr input-xlarge"></textarea>
                            </div>
                        </div>
                        <a href="config.php" class="btn btn-info table-export">Export to CSV</a>
                    </div>
                    <div class="table-widget">
                        <span class="table-error" class="alert hide"></span>
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
    var t = new TableWidget('#table-widget', { datasrc : 'config.php', table : 'employees', columns : ['name', 'phone']});
</script>
````

API Options

=datasrc:= URL from which data can be retrieved
=table:= name of the table to be shown on page-load
=columns:= list of default columns to be displayed

License
=======

MIT


