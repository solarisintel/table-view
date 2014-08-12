<?php

function failResponse()
{
    // exit with failure
    $rows  = array();
    $settings = array();
    header('Content-Type: application/json');
    echo json_encode(array('failure' => true, 'table' => '', 'settings' => $settings));
    exit;
}

require_once(__DIR__.'/lib/db.php.inc');
require_once(__DIR__.'/lib/html.php.inc');
require_once(__DIR__.'/lib/export.php.inc');

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
//$db = new MysqlDB('localhost', 'root', '', 'test');

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
    'status'     => 'Showing <strong>' . $offset . ' - '. ($offset + $limit) .'</strong> of <strong>'.$count.'</strong> Records',
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
} elseif ($type === 'save') {
    error_log(json_encode($_GET));
    header('Content-Type: application/json');
    $ret = $db->save($_GET['table'], $_GET['order']);
    if ($ret > 0) {
        echo json_encode(array('e' => 'success'));
    } else {
        echo json_encode(array('e' => 'failure'));
    }
    exit;
} else {
    echo 'Invalid Request';
    exit;
}
