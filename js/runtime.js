// create table widget with already created markup.
var t = new TableView(
    '#table-widget-settings-1',
    '#table-container-1',
    {
        datasrc : 'config.php',
        table : 'employees',
        columns : ['name', 'phone', 'date', 'rname'],
        pagesizes : {
            "5"   : "5",
            "10"  : "10",
            "25"  : "25",
            "50"  : "50",
            "100" : "100"
        },
        defaultsize : 25
    }
);
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
