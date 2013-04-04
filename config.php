<?php

/* base class */
abstract class DB {
    public function __construct() {
    }
    public function getTableColumns($table) {
    }
    public function countRows($table) {
    }
    public function fetchRows($cols, $table, $limit, $offset) {
    }
}

/* specific to sqlite */
class SqliteDB extends DB {
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

/* table renderer */
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

function failResponse() {
    // exit with failure
    $rows  = array();
    $settings = array();
    header('Content-Type: application/json');
    echo json_encode(array('failure' => true, 'table' => '', 'settings' => $settings));
    exit;
}

/* input request processing starts here */

if (!empty($_GET['table'])) {
    $table = $_GET['table'];
} else {
    failResponse();
}

$db = new SqliteDB('sample.db');
$count = $db->countRows($table);

if (!empty($_GET['columns'])) {
    $columns = explode(',', $_GET['columns']);
} else {
    // do not assume anything
    $columns = array();
}

if (!empty($_GET['limits'])) {
    $parts = explode(',', $_GET['limits']);
    if (count($parts) == 2) {
        $offset= intval($parts[0]);
        $limit = intval($parts[1]);
    } else {
        failResponse();
    }
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
