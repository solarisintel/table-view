<?php
/*
$tables = array(
    'employees' => array(
      'name',
      'phone',
      'email',
      'addres',
      'city',
      'zip',
      'state',
      'country',
      'date',
      'custom',
      'rname',
      'ophone',
      'altemail',
      'altcity',
      'altzip',
    ),
    'organisations' => array(
        'id',
        'name',
        'title',
        'address',
        'city',
        'country',
        'status'
    )
);

$usertables = array(
    'employees' => array(
        'id',
        'name',
        'title'
    ),
    'organisations' => array(
        'id',
        'name',
    )
);
*/
/*
$records = array(
    'employees' => array(
        'id',
        'name',
        'title',
        'designation',
        'location',
        'address',
        'joined',
        'office',
        'phone',
        'mobile',
        'status',
        'email'
    )
)
*/

class DB {
    public function __construct($file) {
        $this->pdo = new PDO("sqlite:$file");
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    public function getTableColumns($table) {
        $cols = array();
        foreach ($this->pdo->query("PRAGMA table_info($table)")->fetchAll(PDO::FETCH_ASSOC) as $row) {
            $cols[] = $row['name'];
        }
        return $cols;
    }
    public function countRows($table) {
        $row = $this->pdo->query("select count(*) from $table")->fetch(PDO::FETCH_ASSOC);
        return $row['count(*)'];
    }
    public function fetchRows($cols, $table, $limit, $offset) {
        $rows = array();
        try {
            $c    = implode(', ', $cols);
            $rows = $this->pdo->query("select $c from $table limit $limit offset $offset")->fetchAll(PDO::FETCH_ASSOC);
        } catch(Exception $e) {
        }
        return $rows;
    }
}

/*
$db = new DB('sample.db');
print_r($db->getTableColumns('employees'));exit;
echo $db->countRows('employees').PHP_EOL;
print_r($db->fetchRows(array('name', 'email'), 'employees', 5, 0));
exit;
*/
class TableConfig {
    var $map;
    public function __construct($table) {
        global $tables;
        $this->map = $tables[$table];
    }
    public function getAllTableColumns($table) {
        if (!empty($this->map)) {
            return $this->map;
        } else {
            return array();
        }
    }
    public function getUserTableColumns($table) {
        if (!empty($this->usermap)) {
            return $this->usermap;
        } else {
            return array();
        }
    }
}

class TableModel {
    public function __construct($table) {
        $this->table = new TableConfig($table);
    }
    public function getTableRecords($table, $columns, $page, $filter) {
        $col    = implode(',', $columns);
        $limit  = $this->limit;
        $offset = $page * $limit;
        $sql    = "select $columns from $table limit $limit";
        $rows   = $this->dummyrows[$table];
        return $rows;
    }
}

class TableView {
    public function __construct($settings) {
        $this->settings = $settings;
    }
    public function renderHeadings() {
        $head  = '<thead>';
        foreach ($this->settings['columns'] as $column) {
            $head .= '<th>'.ucfirst($column).'</th>';
        }
        $head .= '</thead>';
        return $head;
    }
    public function renderBody($rows) {
        if (!empty($rows)) {
            $body  = '<tbody>';
            foreach ($rows as $row) {
                $body .= '<tr>';
                // This is to preserve the order.
                foreach ($this->settings['columns'] as $column) {
                    $body .= '<td>'.$row[$column].'</td>';
                }
                $body .= '</tr>';
            }
            $body .= '</tbody>';
        } else {
            $body = '<tbody><tr><td>Error Fetching Records.</td></tr></tbody>';
        }
        return $body;
    }
    public function renderFooter() {
        $limit = $this->settings['limit'];
        $offset= $this->settings['offset'];
        $total = $this->settings['total'];
        $cols  = count($this->settings['columns']);
        return "<tfoot><tr><th colspan='$cols'>Total Rows : $total, Limit : $limit, Offset : $offset</th></tr></tfoot>";
    }
    public function render(&$rows) {
        $table = $this->renderHeadings();
        $table.= $this->renderFooter();
        $table.= $this->renderBody($rows);
        return $table;
    }
}

if (!empty($_GET['table'])) {
    $table = $_GET['table'];
} else {
    $table = 'employees';
}


$db = new DB('sample.db');
$count = $db->countRows($table);

if (!empty($_GET['columns'])) {
    $columns = explode(',', $_GET['columns']);
} else {
    $columns = array('name', 'email');
}

if (!empty($_GET['limits'])) {
    $parts = explode(',', $_GET['limits']);
    $offset= $parts[0];
    $limit = $parts[1];
} else {
    $limit = 10;
    $offset= 0;
}

$settings = array(
    'allcols' => $db->getTableColumns($table),
    'table'   => $table,
    'columns' => $columns,
    'total'   => $count,
    'limit'   => $limit,
    'offset'  => $offset
);

$rows  = $db->fetchRows($settings['columns'], $settings['table'], $settings['limit'], $settings['offset']);

$view = new TableView($settings);
header('Content-Type: application/json');
echo json_encode(array('table' => $view->render($rows), 'settings' => $settings));
exit;

