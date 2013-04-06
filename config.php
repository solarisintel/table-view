<?php

/* base class */
abstract class DB
{
    public function __construct()
    {
    }
    public function getTableColumns($table)
    {
    }
    public function countRows($table, $expression)
    {
    }
    public function fetchRows($cols, $table, $limit, $offset, $expression)
    {
    }
}

/* specific to sqlite */
class SqliteDB extends DB
{
    public function __construct($file)
    {
        $this->pdo = new PDO("sqlite:$file");
        $this->pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }
    public function getTableColumns($table)
    {
        try {
            $cols = array();
            foreach ($this->pdo->query("PRAGMA table_info($table)")->fetchAll(PDO::FETCH_ASSOC) as $row) {
                $cols[] = $row['name'];
            }

            return $cols;
        } catch (PDOException $e) {
            return array();
        }
    }
    public function countRows($table, $expression)
    {
        try {
            $e = '';
            if (strlen($expression) > 0) {
                $e   = 'where '.$this->cleanupExpression($expression);
            }
            $sql = "select count(*) from $table $e";
            $row = $this->pdo->query($sql)->fetch(PDO::FETCH_ASSOC);
            return $row['count(*)'];
        } catch (PDOException $e) {
            return 0;
        }
    }
    private function cleanupExpression($expression) {
        // simplest way is to blindly replace
        return str_replace('@', '', $expression); // once we have mapping, we can take care of it here
    }
    public function fetchRows($cols, $table, $limit, $offset, $expression='')
    {
        $rows = array();
        try {
            $c    = implode(', ', $cols);
            $expr = '';
            if (strlen($expression) > 0) {
                $e    = $this->cleanupExpression($expression);
                $expr = 'where '.$e; // FIXME: sql-injection friendly. So, nothing can be done until query builder is created.
            }
            $sql  = "select $c from $table $expr limit $limit offset $offset";
            error_log($sql);
            $rows = $this->pdo->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            return $rows;
        }
    }
}

/* table renderer */
class TableView
{
    public function __construct($settings)
    {
        $this->settings = $settings;
    }
    public function renderHeadings()
    {
        $head  = '<thead>';
        foreach ($this->settings['columns'] as $column) {
            $head .= '<th>'.$column.'</th>';
        }
        $head .= '</thead>';

        return $head;
    }
    public function renderBody(&$rows)
    {
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
    public function renderFooter($cur=0)
    {
        $limit = $this->settings['limit'];
        $offset= $this->settings['offset'];
        $total = $this->settings['total'];
        $cols  = count($this->settings['columns']);

        return "<tfoot><tr><th colspan='$cols'>Rows : $cur/$total [Limit : $limit, Offset : $offset]</th></tr></tfoot>";
    }
    public function render(&$rows)
    {
        $table = $this->renderHeadings();
        $table.= $this->renderFooter(count($rows));
        $table.= $this->renderBody($rows);

        return $table;
    }
}

class ExportView
{
    public function __construct($settings)
    {
        $this->settings = $settings;
    }
    public function renderHeadings(&$out)
    {
        fputcsv($out, $this->settings['columns']);
    }
    public function renderBody(&$rows, &$out)
    {
        $newrows = array();
        if (!empty($rows)) {
            foreach ($rows as $idx => $row) {
                // This is to preserve the order.
                foreach ($this->settings['columns'] as $column) {
                    $newrows[$idx][] = $row[$column];
                }
            }
            foreach ($newrows as $row) {
                fputcsv($out, $row);
            }
        }
    }
    public function render(&$rows, $filename)
    {
        header("Content-type: application/octet-stream");
        header("Content-Disposition: attachment; filename=$filename");
        header("Pragma: no-cache");
        header("Expires: 0");

        $out = fopen('php://output', 'w');
        $this->renderHeadings($out);
        $this->renderBody($rows, $out);
        fclose($out);
    }

}

function failResponse()
{
    // exit with failure
    $rows  = array();
    $settings = array();
    header('Content-Type: application/json');
    echo json_encode(array('failure' => true, 'table' => '', 'settings' => $settings));
    exit;
}

/* input request processing starts here */

if (!empty($_GET['type'])) {
    $type = trim(preg_replace('/W/', '', $_GET['type'])); // safety net.
} else {
    die('no type');
}

if (!empty($_GET['table'])) {
    $table = trim(preg_replace('/W/', '', $_GET['table'])); // safety net.
} else {
    die('no table');
}

if (!empty($_GET['expression'])) {
    $expression = $_GET['expression']; // no safety here. nothing can be done FIXME
} else {
    $expression = ''; // its ok to be empty.
}

$db = new SqliteDB('sample.db');

if (!empty($_GET['columns'])) {
    $incolumns = explode(',', $_GET['columns']);
    $columns   = array();
    foreach ($incolumns as $col) {
        $c = trim(preg_replace('/\W/', '', $col)); // safety net
        if (strlen($c) > 0) {
            $columns[] = $c;
        }
    }
} else {
    // do not assume anything
    $columns = array();
}

if (!empty($_GET['limits'])) {
    $parts = explode(',', trim($_GET['limits']));
    if (count($parts) == 2) {
        $offset= intval(trim($parts[0])); // safety net
        $limit = intval(trim($parts[1])); // safety net
    } else {
        failResponse();
    }
} else {
    $limit = 10;
    $offset= 0;
}

$count = $db->countRows($table, $expression);

$settings = array(
    'allcols'    => $db->getTableColumns($table),
    'table'      => $table,
    'columns'    => $columns,
    'total'      => $count,
    'limit'      => $limit,
    'offset'     => $offset,
    'expression' => $expression,
    //'keywords'   => array('AND', 'OR', 'EQ', 'NE', 'LT', 'GT'),
    /*
    'keywords'   => array(
        '= ', '!= ', '< ', '> ', '>= ', '<= ',
        'IS NULL', 'IS NOT NULL', 'NOT NULL', 'LIKE', 'NOT LIKE', 'AND', 'OR', 'EQ', 'NE', 'LT', 'GT',
        'is null', 'is not null', 'not null', 'like', 'not like', 'and', 'or', 'eq', 'ne', 'lt', 'gt'
    )
    */
    'keywords'   => array('= ', '!= ', '< ', '> ', '>= ', '<= '),
    'conj'       => array('and', 'or')
);

$rows  = $db->fetchRows($settings['columns'], $settings['table'], $settings['limit'], $settings['offset'], $settings['expression']);

if ($type === 'html') {
    header('Content-Type: application/json');
    $view = new TableView($settings);
    echo json_encode(array('table' => $view->render($rows), 'settings' => $settings));
    exit;
} elseif ($type === 'csv') {
    header('Content-Type: application/json');
    $view = new ExportView($settings);
    $view->render($rows, "attachment.csv");
    exit;
} else {
    echo 'Invalid Request';
    exit;
}
